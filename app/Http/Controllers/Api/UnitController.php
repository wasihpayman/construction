<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::with('project', 'sale');
        
        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        // Filter by floor if provided
        if ($request->has('floor')) {
            $query->byFloor($request->floor);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Return units grouped by floor for better organization
        if ($request->has('group_by_floor') && $request->group_by_floor) {
            $units = $query->get()->groupBy('floor');
            return response()->json($units);
        }
        
        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'unit_number' => 'required|string|max:50',
            'floor' => 'required|string|max:20',
            'area' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'nullable|in:available,sold',
            'seller_name' => 'nullable|string|max:255',
            'buyer_name' => 'nullable|string|max:255',
            'sale_price' => 'nullable|numeric|min:0',
            'sold_date' => 'nullable|date',
            'sale_description' => 'nullable|string|max:1000',
        ]);

        return Unit::create($request->all());
    }

    public function show($id)
    {
        return Unit::with('project', 'sale')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);
        $unit->update($request->all());

        return $unit;
    }

    public function destroy($id)
    {
        return Unit::destroy($id);
    }

    // Get units grouped by floor for a specific project
    public function getByFloors(Request $request, $projectId)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id'
        ]);

        $units = Unit::byProjectWithFloors($projectId)->get();
        $groupedUnits = $units->groupBy('floor');
        
        return response()->json([
            'floors' => $groupedUnits->keys()->sort(),
            'units_by_floor' => $groupedUnits,
            'total_units' => $units->count(),
            'available_units' => $units->where('status', 'available')->count(),
            'sold_units' => $units->where('status', 'sold')->count()
        ]);
    }

    // Mark unit as sold with buyer information
    public function markAsSold(Request $request, $id)
    {
        $request->validate([
            'buyer_name' => 'required|string|max:255',
            'sale_price' => 'required|numeric|min:0',
            'sold_date' => 'required|date',
            'sale_description' => 'nullable|string|max:1000',
            'seller_name' => 'nullable|string|max:255'
        ]);

        $unit = Unit::findOrFail($id);
        
        if ($unit->status === 'sold') {
            return response()->json(['message' => 'Unit is already sold'], 422);
        }

        $unit->update([
            'status' => 'sold',
            'buyer_name' => $request->buyer_name,
            'sale_price' => $request->sale_price,
            'sold_date' => $request->sold_date,
            'sale_description' => $request->sale_description,
            'seller_name' => $request->seller_name
        ]);

        return response()->json([
            'message' => 'Unit marked as sold successfully',
            'unit' => $unit->load('project', 'sale')
        ]);
    }

    // Get available units for a project
    public function getAvailable(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'floor' => 'nullable|string'
        ]);

        $query = Unit::available()->with('project');

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('floor')) {
            $query->byFloor($request->floor);
        }

        return response()->json($query->get());
    }
}