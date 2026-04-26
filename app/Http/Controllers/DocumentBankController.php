<?php

namespace App\Http\Controllers;

use App\Models\DocumentBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DocumentBankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DocumentBank::with(['creator']);
        
        // Search by person name
        if ($request->filled('search')) {
            $query->where('person_name', 'like', '%' . $request->search . '%');
        }
        
        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }
        
        $documents = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'documents' => $documents
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
            'person_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'description' => 'nullable|string',
            'zip_file' => 'required|file|mimes:zip|max:10240',
        ]);
        
        // Handle ZIP file upload
        if ($request->hasFile('zip_file')) {
            $zipFile = $request->file('zip_file');
            $zipFileName = time() . '_' . $zipFile->getClientOriginalName();
            $zipFilePath = $zipFile->storeAs('document-bank', $zipFileName, 'public');
            $validated['zip_file_path'] = $zipFilePath;
        }
        
        $validated['created_by'] = Auth::id();
        
        $document = DocumentBank::create($validated);
        
        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document->load('creator')
        ], 201)->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = DocumentBank::with('creator')->findOrFail($id);
        
        return response()->json($document)
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
        $document = DocumentBank::findOrFail($id);
        
        $validated = $request->validate([
            'person_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'description' => 'nullable|string',
            'zip_file' => 'nullable|file|mimes:zip|max:10240',
        ]);
        
        // Handle ZIP file update
        if ($request->hasFile('zip_file')) {
            // Delete old ZIP file
            if ($document->zip_file_path) {
                Storage::disk('public')->delete($document->zip_file_path);
            }
            
            $zipFile = $request->file('zip_file');
            $zipFileName = time() . '_' . $zipFile->getClientOriginalName();
            $zipFilePath = $zipFile->storeAs('document-bank', $zipFileName, 'public');
            $validated['zip_file_path'] = $zipFilePath;
        }
        
        $document->update($validated);
        
        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document->load('creator')
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $document = DocumentBank::findOrFail($id);
        
        // Delete associated ZIP file
        if ($document->zip_file_path) {
            Storage::disk('public')->delete($document->zip_file_path);
        }
        
        $document->delete();
        
        return response()->json([
            'message' => 'Document deleted successfully'
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    /**
     * Download ZIP file.
     */
    public function download(string $id)
    {
        $document = DocumentBank::findOrFail($id);
        
        if (!$document->zip_file_path) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $filePath = storage_path('app/public/' . $document->zip_file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $fileName = $document->person_name . '_documents.zip';
        
        $response = response()->download($filePath, $fileName);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return $response;
    }
}
