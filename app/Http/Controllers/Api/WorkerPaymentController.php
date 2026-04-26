<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkerPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkerPaymentController extends Controller
{
    public function index()
    {
        $payments = WorkerPayment::with('worker')->get();
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        \Log::info('WorkerPayment creation request:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'worker_id' => 'required|exists:workers,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check,other',
            'currency' => 'required|in:AFN,USD,EUR',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            \Log::error('WorkerPayment validation errors:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $payment = WorkerPayment::create([
                'worker_id' => $request->worker_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_type' => $request->payment_method, // Map to database column
                'description' => $request->description,
                'currency' => $request->currency, // Add currency field
            ]);

            DB::commit();
            return response()->json($payment, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('WorkerPayment creation failed: ' . $e->getMessage());
            \Log::error('Exception details:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to record payment'], 500);
        }
    }

    public function show($id)
    {
        $payment = WorkerPayment::with('worker')->find($id);
        
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    public function update(Request $request, WorkerPayment $workerPayment)
    {
        $workerPayment->update($request->all());
        return $workerPayment;
    }

    public function destroy($id)
    {
        $payment = WorkerPayment::find($id);
        
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        DB::beginTransaction();
        try {
            $payment->delete();
            DB::commit();
            return response()->json(['message' => 'Payment deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete payment'], 500);
        }
    }
}