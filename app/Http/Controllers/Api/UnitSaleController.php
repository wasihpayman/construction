<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnitSale;
use Illuminate\Http\Request;

class UnitSaleController extends Controller
{
    public function index()
    {
        return UnitSale::with(['unit', 'client'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'client_id' => 'required|exists:clients,id',
            'sale_price' => 'required',
            'sale_date' => 'nullable',
            'payment_method' => 'nullable',
        ]);

        return UnitSale::create($request->all());
    }

    public function show($id)
    {
        return UnitSale::with(['unit', 'client'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $sale = UnitSale::findOrFail($id);
        $sale->update($request->all());

        return $sale;
    }

    public function destroy($id)
    {
        return UnitSale::destroy($id);
    }
}