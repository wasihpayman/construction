<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnitsController extends Controller
{
    /**
     * Display a listing of units for the current project.
     */
    public function index(Request $request)
    {
        try {
            $projectId = $request->input('project_id');
            
            $query = Unit::query();
            
            if ($projectId) {
                $query->where('project_id', $projectId);
            }
            
            $units = $query->orderBy('unit_number')->get();
            
            return response()->json($units);
            
        } catch (\Exception $e) {
            \Log::error('Units loading error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to load units',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeGenerated(Request $request)
    {
        try {
            \Log::info('storeGenerated called with data: ' . json_encode($request->all()));
            
            $validated = $request->validate([
                'unit_number' => 'required|string|max:255',
                'floor' => 'required|integer|min:1',
                'area' => 'required|numeric|min:1',
                'price' => 'required|numeric|min:0',
                'position' => 'nullable|string|max:255',
                'project_id' => 'nullable|integer|exists:projects,id'
            ]);

            \Log::info('Validation passed: ' . json_encode($validated));

            // Create the unit in database
            $unit = Unit::create([
                'unit_number' => $validated['unit_number'],
                'floor' => $validated['floor'],
                'area' => $validated['area'],
                'price' => $validated['price'],
                'position' => $validated['position'],
                'project_id' => $validated['project_id'],
                'status' => 'available'
            ]);

            \Log::info('Unit created successfully: ' . json_encode($unit));

            return response()->json([
                'success' => true,
                'unit' => $unit
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in storeGenerated: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error creating unit: ' . $e->getMessage()
            ], 500);
        }
    }
}
