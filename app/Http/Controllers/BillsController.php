<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\MaterialCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BillsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bill::with(['category', 'creator']);
        
        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('bill_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('bill_date', '<=', $request->date_to);
        }
        
        // Filter by bill number
        if ($request->filled('bill_number')) {
            $query->where('bill_number', 'like', '%' . $request->bill_number . '%');
        }
        
        $bills = $query->orderBy('bill_date', 'desc')->paginate(15);
        $categories = MaterialCategory::all();
        
        return response()->json([
            'bills' => $bills,
            'categories' => $categories
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'bill_number' => 'required|string|max:255|unique:bills,bill_number',
            'category_id' => 'required|exists:material_categories,id',
            'bill_date' => 'required|date',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);
        
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('bills', $fileName, 'public');
            
            $validated['file_path'] = $filePath;
        }
        
        $validated['created_by'] = Auth::id();
        
        $bill = Bill::create($validated);
        
        return response()->json([
            'message' => 'Bill uploaded successfully',
            'bill' => $bill->load(['category', 'creator'])
        ], 201)->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $bill = Bill::with(['category', 'creator'])->findOrFail($id);
        
        return response()->json($bill)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $bill = Bill::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'bill_number' => ['required', 'string', 'max:255', Rule::unique('bills', 'bill_number')->ignore($bill->id)],
            'category_id' => 'required|exists:material_categories,id',
            'bill_date' => 'required|date',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);
        
        if ($request->hasFile('file')) {
            // Delete old file
            if ($bill->file_path) {
                Storage::disk('public')->delete($bill->file_path);
            }
            
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('bills', $fileName, 'public');
            $validated['file_path'] = $filePath;
        }
        
        $bill->update($validated);
        
        return response()->json([
            'message' => 'Bill updated successfully',
            'bill' => $bill->load(['category', 'creator'])
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $bill = Bill::findOrFail($id);
        
        // Delete file from storage
        if ($bill->file_path) {
            Storage::disk('public')->delete($bill->file_path);
        }
        
        $bill->delete();
        
        return response()->json([
            'message' => 'Bill deleted successfully'
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    /**
     * Download bill file.
     */
    public function download(string $id)
    {
        $bill = Bill::findOrFail($id);
        
        if (!$bill->file_path) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $filePath = storage_path('app/public/' . $bill->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $fileName = $bill->title . '.' . pathinfo($filePath, PATHINFO_EXTENSION);
        
        $response = response()->download($filePath, $fileName);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return $response;
    }
    
    /**
     * Get bills grouped by category.
     */
    public function byCategory()
    {
        try {
            \Log::info('BillsController@byCategory called');
            
            // Check if user is authenticated
            if (!Auth::check()) {
                \Log::error('User not authenticated in BillsController@byCategory');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            \Log::info('User authenticated, fetching categories with bills');
            
            $categories = MaterialCategory::with(['bills' => function($query) {
                $query->orderBy('bill_date', 'desc');
            }])->get();
            
            \Log::info('Found ' . $categories->count() . ' categories');
            
            return response()->json($categories)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                
        } catch (\Exception $e) {
            \Log::error('Error in BillsController@byCategory: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to fetch categories: ' . $e->getMessage()
            ], 500);
        }
    }
}
