<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BrickMaterial;
use Illuminate\Http\Request;

class BrickMaterialController extends Controller
{
    public function index()
    {
        $materials = BrickMaterial::with('category')->get();
        return response()->json($materials);
    }

    public function store(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'category_id' => 'required|exists:material_categories,id',
            'name' => 'required|string|max:255',
            'bill_number' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price_per_piece' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'date' => 'required|date',
            'currency' => 'required|in:AFN,USD,EUR',
            'payment_status' => 'required|in:pending,paid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $material = BrickMaterial::create($request->all());
        
        return response()->json($material->load('category'), 201);
    }

    public function update(Request $request, $id)
    {
        $material = BrickMaterial::findOrFail($id);
        
        $validator = \Validator::make($request->all(), [
            'category_id' => 'required|exists:material_categories,id',
            'name' => 'required|string|max:255',
            'bill_number' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price_per_piece' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'date' => 'required|date',
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
        $material = BrickMaterial::findOrFail($id);
        $material->delete();
        
        return response()->json(['message' => 'Brick material deleted successfully']);
    }
}
