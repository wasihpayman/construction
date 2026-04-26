<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaterialController extends Controller
{
    public function index()
    {
        return Material::all();
    }

    public function store(Request $request)
    {
        return Material::create($request->all());
    }

    public function show(Material $material)
    {
        return $material;
    }

    public function update(Request $request, Material $material)
    {
        $material->update($request->all());
        return $material;
    }

    public function destroy(Material $material)
    {
        $material->delete();
        return response()->noContent();
    }

    public function categoryTotals($projectId)
    {
        $data = [];
        $tables = [
            'rebar_materials'  => 'Rebar',
            'gravel_materials' => 'Gravel',
            'sand_materials'   => 'Sand',
            'stone_materials'  => 'Stone',
            'brick_materials'  => 'Brick',
        ];

        $total = 0;

        foreach ($tables as $table => $name) {
            $sum = DB::table($table)
                ->where('payment_status', 'paid')
                ->sum('amount');

            if ($sum > 0) {
                $data[] = [
                    'category' => $name,
                    'total' => $sum
                ];
            }

            $total += $sum;
        }

        return response()->json([
            'categories' => $data,
            'total_paid' => $total
        ]);
    }

    /**
     * Material Dashboard - Currency-separated paid totals
     * Only includes paid amounts, ignores pending
     */
    public function dashboardTotals()
    {
        // Single table for all material submissions
        $currencyTotals = DB::table('material_submissions')
            ->where('payment_status', 'paid') // Only paid amounts
            ->selectRaw('currency, SUM(amount) as total')
            ->groupBy('currency')
            ->get()
            ->keyBy('currency');

        $result = [
            'USD' => 0,
            'AFN' => 0
        ];

        $totalPaid = 0;

        foreach ($currencyTotals as $row) {
            $result[$row->currency] = $row->total;
            $totalPaid += $row->total;
        }

        return response()->json([
            'currency_totals' => $result,
            'total_paid' => $totalPaid,
            'summary' => [
                [
                    'currency' => 'AFN',
                    'total' => $result['AFN'],
                    'formatted' => 'AFN ' . number_format($result['AFN'], 2)
                ],
                [
                    'currency' => 'USD', 
                    'total' => $result['USD'],
                    'formatted' => '$' . number_format($result['USD'], 2)
                ]
            ]
        ]);
    }

    /**
     * Get material submissions by category
     */
    public function getSubmissionsByCategory($categoryId = null)
    {
        $query = DB::table('material_submissions')
            ->with(['category', 'creator'])
            ->latest();

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return response()->json($query->get());
    }

    /**
     * Submit material data
     */
    public function submitMaterial(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:material_categories,id',
            'name' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:USD,AFN',
            'payment_status' => 'required|in:pending,paid',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $submission = DB::table('material_submissions')->insertGetId([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'normalized_amount' => $this->normalizeAmount($validated['amount'], $validated['currency']),
            'payment_status' => $validated['payment_status'],
            'date' => $validated['date'] ?? null,
            'description' => $validated['description'] ?? null,
            'metadata' => json_encode($validated['metadata'] ?? []),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Material submitted successfully',
            'submission' => $submission
        ], 201);
    }

    /**
     * Normalize amount based on currency
     */
    private function normalizeAmount($amount, $currency)
    {
        // Add currency conversion logic here if needed
        return $amount;
    }
}