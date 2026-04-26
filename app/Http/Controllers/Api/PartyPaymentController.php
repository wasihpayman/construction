<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartyPayment;
use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PartyPaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = PartyPayment::with('party')->get();
        return response()->json($payments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
            'payment_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $payment = PartyPayment::create($validated);
        $payment->load('party');
        return response()->json($payment, 201);
    }

    public function show(PartyPayment $payment): JsonResponse
    {
        $payment->load('party');
        return response()->json($payment);
    }

    public function update(Request $request, PartyPayment $payment): JsonResponse
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:AFN,USD,EUR',
            'payment_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $payment->update($validated);
        $payment->load('party');
        return response()->json($payment);
    }

    public function destroy(PartyPayment $payment): JsonResponse
    {
        $payment->delete();
        return response()->json(null, 204);
    }

    public function getPartyPayments(Party $party): JsonResponse
    {
        $payments = $party->payments()->orderBy('payment_date', 'desc')->get();
        return response()->json($payments);
    }
}
