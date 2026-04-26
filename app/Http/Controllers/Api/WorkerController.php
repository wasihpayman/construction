<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Worker;
use App\Models\WorkerPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkerController extends Controller
{
    public function index(Request $request)
    {
        $query = Worker::with('payments');
        
        // Filter by project_id if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $workers = $query->get();
        return response()->json($workers);
    }

    public function store(Request $request)
    {
        \Log::info('Worker creation request', ['data' => $request->all()]);
        \Log::info('Request content type', ['content_type' => $request->header('Content-Type')]);
        \Log::info('Request input', ['input' => $request->input()]);
        \Log::info('Request json', ['json' => $request->json()]);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation errors', ['errors' => $validator->errors()->toArray()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $worker = Worker::create([
                'name' => $request->name,
                'position' => $request->position,
                'hire_date' => $request->hire_date,
                'phone' => $request->phone,
                'status' => $request->status ?? 'active',
            ]);

            DB::commit();
            return response()->json($worker, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create worker'], 500);
        }
    }

    public function show($id)
    {
        $worker = Worker::with('payments')->find($id);
        
        if (!$worker) {
            return response()->json(['error' => 'Worker not found'], 404);
        }

        return response()->json($worker);
    }

    public function update(Request $request, $id)
    {
        $worker = Worker::find($id);
        
        if (!$worker) {
            return response()->json(['error' => 'Worker not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'position' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $worker->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'position' => $request->position,
                'hire_date' => $request->hire_date,
                'status' => $request->status,
                'description' => $request->description,
            ]);

            DB::commit();
            return response()->json($worker);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update worker'], 500);
        }
    }

    public function destroy($id)
    {
        $worker = Worker::find($id);
        
        if (!$worker) {
            return response()->json(['error' => 'Worker not found'], 404);
        }

        DB::beginTransaction();
        try {
            $worker->delete();
            DB::commit();
            return response()->json(['message' => 'Worker deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete worker'], 500);
        }
    }

    public function getPayments($id)
    {
        $worker = Worker::find($id);
        
        if (!$worker) {
            return response()->json(['error' => 'Worker not found'], 404);
        }

        $payments = WorkerPayment::where('worker_id', $id)
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json($payments);
    }
}