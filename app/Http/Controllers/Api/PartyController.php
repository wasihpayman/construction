<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Party;
use App\Models\PartyPayment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PartyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Party::with('payments');
        
        // Filter by project_id if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $parties = $query->get();
        return response()->json($parties);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
            'project_id' => 'required|exists:projects,id',
        ]);

        $party = Party::create($validated);
        return response()->json($party, 201);
    }

    public function show(Party $party): JsonResponse
    {
        $party->load('payments');
        return response()->json($party);
    }

    public function update(Request $request, Party $party): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
        ]);

        $party->update($validated);
        return response()->json($party);
    }

    public function destroy(Party $party): JsonResponse
    {
        $party->delete();
        return response()->json(null, 204);
    }

    public function getBalanceSummary(): JsonResponse
    {
        try {
            $balances = PartyPayment::getTotalBalanceByCurrency();
            return response()->json($balances);
        } catch (\Exception $e) {
            return response()->json([], 200);
        }
    }
}
