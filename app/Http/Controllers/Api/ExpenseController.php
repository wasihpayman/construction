<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return Expense::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
            'description' => 'nullable|string',
            'details' => 'nullable|string',
            'date' => 'required|date',
            'purpose' => 'nullable|string',
            'authorized_by' => 'nullable|string|max:255',
            'bill_num' => 'nullable|string|max:255',
            'paid_by' => 'nullable|string|max:255',
        ]);

        return Expense::create($validated);
    }

    public function show(Expense $expense)
    {
        return $expense;
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
            'description' => 'nullable|string',
            'details' => 'nullable|string',
            'date' => 'required|date',
            'purpose' => 'nullable|string',
            'authorized_by' => 'nullable|string|max:255',
            'bill_num' => 'nullable|string|max:255',
            'paid_by' => 'nullable|string|max:255',
        ]);

        $expense->update($validated);
        return $expense;
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->noContent();
    }
}