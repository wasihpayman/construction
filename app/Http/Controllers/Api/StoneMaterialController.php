<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoneMaterial;
use Illuminate\Http\Request;

class StoneMaterialController extends Controller
{
    public function index()
    {
        $materials = StoneMaterial::with('category')->get();
        return response()->json($materials);
    }

    public function store(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'category_id' => 'required|exists:material_categories,id',
            'name' => 'required|string|max:255',
            'bill_number' => 'required|string|max:255',
            'date' => 'required|date',
            'truck_type' => 'required|in:Mazda,Hino,Kamaz,Other',
            'currency' => 'required|in:AFN,USD,EUR',
            'payment_status' => 'required|in:pending,paid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $material = StoneMaterial::create($request->all());
        
        return response()->json($material->load('category'), 201);
    }

    public function update(Request $request, $id)
    {
        $material = StoneMaterial::findOrFail($id);
        
        $validator = \Validator::make($request->all(), [
            'category_id' => 'required|exists:material_categories,id',
            'name' => 'required|string|max:255',
            'bill_number' => 'required|string|max:255',
            'date' => 'required|date',
            'truck_type' => 'required|in:Mazda,Hino,Kamaz,Other',
            'currency' => 'required|in:AFN,USD,EUR',
            'payment_status' => 'required|in:pending,paid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $material->update($request->all());
        
        return response()->json($material->load('category'));
    }

    public function destroy($id)
    {
        $material = StoneMaterial::findOrFail($id);
        $material->delete();
        
        return response()->json(['message' => 'Stone material deleted successfully']);
    }
}
