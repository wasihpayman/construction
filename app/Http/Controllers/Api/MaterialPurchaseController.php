<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialPurchase;
use Illuminate\Http\Request;

class MaterialPurchaseController extends Controller
{
    public function index()
    {
        return MaterialPurchase::with(['project','material'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->all();
        
        // Handle material_name - find or create material
        if (isset($data['material_name'])) {
            $material = \App\Models\Material::firstOrCreate(
                ['name' => $data['material_name']],
                [
                    'unit' => $data['unit'] ?? 'piece',
                    'price_per_unit' => $data['unit_price'] ?? 0,
                    'description' => $data['description'] ?? ''
                ]
            );
            $data['material_id'] = $material->id;
            unset($data['material_name']);
        }

        $data['total_price'] = $data['quantity'] * $data['unit_price'];

        return MaterialPurchase::create($data);
    }

    public function show(MaterialPurchase $materialPurchase)
    {
        return $materialPurchase;
    }

    public function update(Request $request, MaterialPurchase $materialPurchase)
    {
        $data = $request->all();
        
        // Handle material_name - find or create material
        if (isset($data['material_name'])) {
            $material = \App\Models\Material::firstOrCreate(
                ['name' => $data['material_name']],
                [
                    'unit' => $data['unit'] ?? 'piece',
                    'price_per_unit' => $data['unit_price'] ?? 0,
                    'description' => $data['description'] ?? ''
                ]
            );
            $data['material_id'] = $material->id;
            unset($data['material_name']);
        }

        $data['total_price'] = $data['quantity'] * $data['unit_price'];

        $materialPurchase->update($data);

        return $materialPurchase;
    }

    public function destroy(MaterialPurchase $materialPurchase)
    {
        $materialPurchase->delete();
        return response()->noContent();
    }
}