<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class EmployeesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Employee::with(['salaryPayments', 'creator']);
        
        // Search by full name
        if ($request->filled('search')) {
            $query->where('full_name', 'like', '%' . $request->search . '%');
        }
        
        // Filter by position
        if ($request->filled('position')) {
            $query->where('position', 'like', '%' . $request->position . '%');
        }
        
        // Filter by start date
        if ($request->filled('start_date_from')) {
            $query->where('start_date', '>=', $request->start_date_from);
        }
        if ($request->filled('start_date_to')) {
            $query->where('start_date', '<=', $request->start_date_to);
        }
        
        $employees = $query->orderBy('created_at', 'desc')->paginate(15);
        
        // Add total_paid_salary to each employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->total_paid_salary = $employee->salaryPayments()->sum('amount');
            return $employee;
        });
        
        // Get unique positions for filter dropdown
        $positions = Employee::distinct()->pluck('position')->filter()->values();
        
        return response()->json([
            'employees' => $employees,
            'positions' => $positions
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
            'full_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'tazkira_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'contract_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);
        
        // Handle tazkira file upload
        if ($request->hasFile('tazkira_file')) {
            $tazkiraFile = $request->file('tazkira_file');
            $tazkiraFileName = time() . '_tazkira_' . $tazkiraFile->getClientOriginalName();
            $tazkiraFilePath = $tazkiraFile->storeAs('employees', $tazkiraFileName, 'public');
            $validated['tazkira_file'] = $tazkiraFilePath;
        }
        
        // Handle contract file upload
        if ($request->hasFile('contract_file')) {
            $contractFile = $request->file('contract_file');
            $contractFileName = time() . '_contract_' . $contractFile->getClientOriginalName();
            $contractFilePath = $contractFile->storeAs('employees', $contractFileName, 'public');
            $validated['contract_file'] = $contractFilePath;
        }
        
        $validated['created_by'] = Auth::id();
        $employee = Employee::create($validated);
        
        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => $employee
        ], 201)->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->total_paid_salary = $employee->salaryPayments()->sum('amount');
        
        return response()->json($employee)
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
        $employee = Employee::findOrFail($id);
        
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'tazkira_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'contract_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);
        
        // Handle tazkira file update
        if ($request->hasFile('tazkira_file')) {
            // Delete old tazkira file
            if ($employee->tazkira_file) {
                Storage::disk('public')->delete($employee->tazkira_file);
            }
            
            $tazkiraFile = $request->file('tazkira_file');
            $tazkiraFileName = time() . '_tazkira_' . $tazkiraFile->getClientOriginalName();
            $tazkiraFilePath = $tazkiraFile->storeAs('employees', $tazkiraFileName, 'public');
            $validated['tazkira_file'] = $tazkiraFilePath;
        }
        
        // Handle contract file update
        if ($request->hasFile('contract_file')) {
            // Delete old contract file
            if ($employee->contract_file) {
                Storage::disk('public')->delete($employee->contract_file);
            }
            
            $contractFile = $request->file('contract_file');
            $contractFileName = time() . '_contract_' . $contractFile->getClientOriginalName();
            $contractFilePath = $contractFile->storeAs('employees', $contractFileName, 'public');
            $validated['contract_file'] = $contractFilePath;
        }
        
        $employee->update($validated);
        
        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $employee = Employee::findOrFail($id);
        
        // Delete associated files
        if ($employee->tazkira_file) {
            Storage::disk('public')->delete($employee->tazkira_file);
        }
        if ($employee->contract_file) {
            Storage::disk('public')->delete($employee->contract_file);
        }
        
        $employee->delete();
        
        return response()->json([
            'message' => 'Employee deleted successfully'
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    /**
     * Download employee file.
     */
    public function downloadFile(string $id, string $type)
    {
        $employee = Employee::findOrFail($id);
        
        if ($type === 'tazkira') {
            $filePath = $employee->tazkira_file;
            $fileName = $employee->full_name . '_tazkira.' . pathinfo($filePath, PATHINFO_EXTENSION);
        } elseif ($type === 'contract') {
            $filePath = $employee->contract_file;
            $fileName = $employee->full_name . '_contract.' . pathinfo($filePath, PATHINFO_EXTENSION);
        } else {
            return response()->json(['error' => 'Invalid file type'], 400)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        if (!$filePath) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $fullPath = storage_path('app/public/' . $filePath);
        
        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $response = response()->download($fullPath, $fileName);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return $response;
    }
}
