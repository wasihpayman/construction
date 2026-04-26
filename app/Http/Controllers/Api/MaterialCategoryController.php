<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MaterialCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = MaterialCategory::with('creator');
        
        // Filter by project_id if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $categories = $query->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('MaterialCategory@store called');
            \Log::info('Request data: ' . json_encode($request->all()));
            
            $validator = \Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'project_id' => 'required|exists:projects,id',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed: ' . json_encode($validator->errors()));
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $category = MaterialCategory::create([
                'name' => $request->name,
                'project_id' => $request->project_id,
                'created_by' => Auth::id(),
            ]);

            \Log::info('Material category created successfully with ID: ' . $category->id);

            return response()->json($category, 201);
            
        } catch (\Exception $e) {
            \Log::error('Error in MaterialCategory@store: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to create material category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $category = MaterialCategory::findOrFail($id);
        
        $validator = \Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category->update([
            'name' => $request->name,
        ]);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = MaterialCategory::findOrFail($id);
        $category->delete();
        
        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * Get Material Categories Dashboard Stats
     */
    public function dashboard()
    {
        // Total Categories
        $totalCategories = MaterialCategory::count();

        // Get all form entries
        $formEntries = DB::table('form_entries')->get();
        
        // Calculate ALL amounts (paid + unpaid) by currency
        $allAmountsByCurrency = ['AFN' => 0, 'USD' => 0];
        $paidAmountsByCurrency = ['AFN' => 0, 'USD' => 0];
        $unpaidAmountsByCurrency = ['AFN' => 0, 'USD' => 0];
        
        foreach ($formEntries as $entry) {
            $data = json_decode($entry->data, true);
            if (isset($data['amount'])) {
                $amount = floatval($data['amount']);
                $currency = $data['currency'] ?? 'AFN';
                $paymentStatus = $data['payment_status'] ?? 'pending';
                
                // Add to total amounts
                if (isset($allAmountsByCurrency[$currency])) {
                    $allAmountsByCurrency[$currency] += $amount;
                }
                
                // Add to paid or unpaid amounts
                if ($paymentStatus === 'paid') {
                    if (isset($paidAmountsByCurrency[$currency])) {
                        $paidAmountsByCurrency[$currency] += $amount;
                    }
                } else {
                    if (isset($unpaidAmountsByCurrency[$currency])) {
                        $unpaidAmountsByCurrency[$currency] += $amount;
                    }
                }
            }
        }

        // Active Categories (categories with form entries)
        $activeCategories = DB::table('form_entries')
            ->distinct('category_id')
            ->count();

        // Recent Categories (last 5)
        $recentCategories = MaterialCategory::latest()
            ->take(5)
            ->get(['id', 'name', 'created_at']);

        // Top Categories by amount (ALL amounts, not just paid)
        $categoryTotals = [];
        foreach ($formEntries as $entry) {
            $data = json_decode($entry->data, true);
            if (isset($data['amount'])) {
                $categoryId = $entry->category_id;
                $amount = floatval($data['amount']);
                if (!isset($categoryTotals[$categoryId])) {
                    $categoryTotals[$categoryId] = ['total_amount' => 0, 'submission_count' => 0];
                }
                $categoryTotals[$categoryId]['total_amount'] += $amount;
                $categoryTotals[$categoryId]['submission_count']++;
            }
        }

        // Get category names
        $topCategories = collect($categoryTotals)
            ->map(function ($data, $categoryId) {
                $category = MaterialCategory::find($categoryId);
                return [
                    'name' => $category ? $category->name : 'Unknown Category',
                    'total_amount' => $data['total_amount'],
                    'submission_count' => $data['submission_count']
                ];
            })
            ->sortByDesc('total_amount')
            ->take(5)
            ->values();

        // Payment Status Breakdown
        $paymentStatusCounts = ['paid' => ['total_amount' => 0, 'count' => 0], 'pending' => ['total_amount' => 0, 'count' => 0]];
        
        foreach ($formEntries as $entry) {
            $data = json_decode($entry->data, true);
            $status = $data['payment_status'] ?? 'pending';
            $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
            
            if (isset($paymentStatusCounts[$status])) {
                $paymentStatusCounts[$status]['total_amount'] += $amount;
                $paymentStatusCounts[$status]['count']++;
            }
        }

        $paymentStatusBreakdown = collect($paymentStatusCounts)->map(function ($data, $status) {
            return (object) [
                'payment_status' => $status,
                'total_amount' => $data['total_amount'],
                'count' => $data['count']
            ];
        })->values();

        // Currency Breakdown (ALL amounts)
        $currencyBreakdown = collect($allAmountsByCurrency)->map(function ($amount, $currency) {
            return (object) [
                'currency' => $currency,
                'total_amount' => $amount,
                'count' => 0
            ];
        })->values();

        return response()->json([
            'stats' => [
                'total_categories' => $totalCategories,
                'total_amount' => array_sum($allAmountsByCurrency), // ALL amounts
                'total_paid_amount' => array_sum($paidAmountsByCurrency), // Only paid
                'total_unpaid_amount' => array_sum($unpaidAmountsByCurrency), // Only unpaid
                'active_categories' => $activeCategories,
                'system_status' => [
                    'status' => 'Ready',
                    'message' => 'System Online'
                ]
            ],
            'recent_categories' => $recentCategories,
            'top_categories' => $topCategories,
            'payment_status_breakdown' => $paymentStatusBreakdown,
            'currency_breakdown' => $currencyBreakdown,
            'formatted_stats' => [
                'total_amount' => [
                    'AFN' => $this->formatCurrency($allAmountsByCurrency['AFN'], 'AFN'),
                    'USD' => $this->formatCurrency($allAmountsByCurrency['USD'], 'USD')
                ],
                'total_paid_amount' => [
                    'AFN' => $this->formatCurrency($paidAmountsByCurrency['AFN'], 'AFN'),
                    'USD' => $this->formatCurrency($paidAmountsByCurrency['USD'], 'USD')
                ],
                'total_unpaid_amount' => [
                    'AFN' => $this->formatCurrency($unpaidAmountsByCurrency['AFN'], 'AFN'),
                    'USD' => $this->formatCurrency($unpaidAmountsByCurrency['USD'], 'USD')
                ]
            ]
        ]);
    }

    private function formatCurrency($amount, $currency)
    {
        // Implement your currency formatting logic here
        return $amount . ' ' . $currency;
    }
}
