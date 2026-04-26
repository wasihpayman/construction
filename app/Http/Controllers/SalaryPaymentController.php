<?php

namespace App\Http\Controllers;

use App\Models\EmployeeSalaryPayment;
use Illuminate\Http\Request;

class SalaryPaymentController extends Controller
{
    public function index(Request $request, $employeeId)
    {
        $query = EmployeeSalaryPayment::where('employee_id', $employeeId);
        
        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('payment_date', $request->date);
        }
        
        $payments = $query->orderBy('payment_date', 'desc')->get();
        
        return response()->json($payments)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'description' => 'nullable|string',
        ]);
        
        $payment = EmployeeSalaryPayment::create($validated);
        
        return response()->json([
            'message' => 'Salary payment recorded successfully',
            'payment' => $payment
        ], 201)->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
