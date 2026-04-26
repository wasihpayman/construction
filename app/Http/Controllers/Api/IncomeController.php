<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Income;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index()
    {
        return Income::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'amount' => 'required',
            'currency' => 'nullable',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        return Income::create($request->all());
    }

    public function show($id)
    {
        return Income::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $income = Income::findOrFail($id);
        $income->update($request->all());

        return $income;
    }

    public function destroy($id)
    {
        return Income::destroy($id);
    }
}