<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialDashboardController extends Controller
{
    /**
     * Get comprehensive financial dashboard data
     */
    public function index()
    {
        try {
            // 1. Balance Summary (Incomes)
            $balanceSummary = $this->getBalanceSummary();
            
            // 2. Expense Summary
            $expenseSummary = $this->getExpenseSummary();
            
            // 3. Material Summary
            $materialSummary = $this->getMaterialSummary();
            
            // 4. Final Balance Calculation
            $finalBalance = $this->calculateFinalBalance($balanceSummary, $expenseSummary);
            
            // 5. Get Parties Data
            $parties = $this->getPartiesData();
            
            return response()->json([
                'balance_summary' => $balanceSummary,
                'expense_summary' => $expenseSummary,
                'material_summary' => $materialSummary,
                'final_balance' => $finalBalance,
                'parties' => $parties
            ]);
        } catch (\Exception $e) {
            \Log::error('Financial Dashboard Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to load financial data',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get Balance Summary (Correct Architecture: sales → sale_payments)
     */
private function getBalanceSummary()
{
    $currencies = ['USD', 'AFN'];

    // Sales (فقط USD)
    $revenueUSD = DB::table('sales')
        ->sum('sale_price');

    $downUSD = DB::table('sales')
        ->sum('down_payment');

    // Installments (فقط USD)
    $installmentsUSD = DB::table('sale_payments')
        ->sum('amount');

    // Party Payments (currency دارد)
    $partyPayments = DB::table('party_payments')
        ->select('currency', DB::raw('SUM(amount) as total'))
        ->groupBy('currency')
        ->get()
        ->keyBy('currency');

    $balanceSummary = [];

    foreach ($currencies as $currency) {

        // فقط USD فروش دارد
        $rev = $currency == 'USD' ? $revenueUSD : 0;

        $down = $currency == 'USD' ? $downUSD : 0;

        $installments =
            $currency == 'USD'
                ? $installmentsUSD
                : 0;

        $party =
            $partyPayments[$currency]->total ?? 0;

        $paid = $down + $installments;

        $remaining = $rev - $paid;

        $balanceSummary[$currency] = [

            'unit_sales' => $rev,

            'unit_payments' => $paid,

            'unit_sales_remaining' => $remaining,

            'party_payments' => $party,

            'total' => $paid + $party
        ];
    }

    return $balanceSummary;
}
    /**
     * Get Expense Summary (Employee Salaries, Worker Payments, Materials, Expenses)
     */
    private function getExpenseSummary()
    {
        // Employee Salary Payments
        try {
            $employeeSalariesTotal = DB::table('employee_salary_payments')
                ->sum('amount');
            
            $employeeSalaries = collect([
                (object) ['currency' => 'AFN', 'total' => $employeeSalariesTotal]
            ])->keyBy('currency');
        } catch (\Exception $e) {
            \Log::error('Employee salaries calculation error: ' . $e->getMessage());
            $employeeSalaries = collect();
        }
        
        // Worker Payments
        try {
            $workerPayments = DB::table('worker_payments')
                ->select('currency', DB::raw('SUM(amount) as total'))
                ->groupBy('currency')
                ->get()
                ->keyBy('currency');
        } catch (\Exception $e) {
            \Log::error('Worker payments calculation error: ' . $e->getMessage());
            $workerPayments = collect();
        }
        
        // General Expenses (from expenses table)
        try {
            $generalExpenses = DB::table('expenses')
                ->select('currency', DB::raw('SUM(amount) as total'))
                ->groupBy('currency')
                ->get()
                ->keyBy('currency');
        } catch (\Exception $e) {
            \Log::error('General expenses calculation error: ' . $e->getMessage());
            $generalExpenses = collect();
        }
        
        // Materials Payments (using form_entries table with JSON data)
        try {
            $formEntries = DB::table('form_entries')->get();
            $materialsByCurrency = [];

            foreach ($formEntries as $entry) {
                $data = json_decode($entry->data, true);
                
                // Check if it's a material entry with payment_status = 'paid'
                if (isset($data['payment_status']) && $data['payment_status'] === 'paid' && isset($data['amount'])) {
                    $amount = floatval($data['amount']);
                    $currency = $data['currency'] ?? 'AFN';
                    
                    if (!isset($materialsByCurrency[$currency])) {
                        $materialsByCurrency[$currency] = 0;
                    }
                    $materialsByCurrency[$currency] += $amount;
                }
            }

            $materialsPayments = collect();
            foreach ($materialsByCurrency as $currency => $total) {
                $materialsPayments->put($currency, (object) ['currency' => $currency, 'total' => $total]);
            }
        } catch (\Exception $e) {
            \Log::error('Materials calculation error: ' . $e->getMessage());
            $materialsPayments = collect();
        }
        
        // Combine and calculate totals
        $currencies = ['AFN', 'USD'];
        $expenseSummary = [];
        
        foreach ($currencies as $currency) {
            $salaryTotal = $employeeSalaries->has($currency) ? $employeeSalaries[$currency]->total : 0;
            $workerTotal = $workerPayments->has($currency) ? $workerPayments[$currency]->total : 0;
            $generalTotal = $generalExpenses->has($currency) ? $generalExpenses[$currency]->total : 0;
            $materialsTotal = $materialsPayments->has($currency) ? $materialsPayments[$currency]->total : 0;
            
            $expenseSummary[$currency] = [
                'employee_salaries' => $salaryTotal,
                'worker_payments' => $workerTotal,
                'general_expenses' => $generalTotal,
                'materials_payments' => $materialsTotal,
                'total' => $salaryTotal + $workerTotal + $generalTotal + $materialsTotal
            ];
        }
        
        return $expenseSummary;
    }
    
    /**
     * Calculate Final Balance (Paid - Expenses)
     */
    private function calculateFinalBalance($balanceSummary, $expenseSummary)
    {
        $currencies = ['AFN', 'USD'];
        $finalBalance = [];
        
        foreach ($currencies as $currency) {
            $totalPaid = isset($balanceSummary[$currency]) ? $balanceSummary[$currency]['unit_payments'] : 0;
            $expenseTotal = isset($expenseSummary[$currency]) ? $expenseSummary[$currency]['total'] : 0;
            
            $finalBalance[$currency] = [
                'unit_sales' => isset($balanceSummary[$currency]) ? $balanceSummary[$currency]['unit_sales'] : 0,
                'unit_payments' => $totalPaid,
                'unit_sales_remaining' => isset($balanceSummary[$currency]) ? $balanceSummary[$currency]['unit_sales_remaining'] : 0,
                'party_payments' => isset($balanceSummary[$currency]) ? $balanceSummary[$currency]['party_payments'] : 0,
                'balance' => $totalPaid - $expenseTotal,
                'expenses' => $expenseTotal,
                'final' => ($totalPaid - $expenseTotal),
                'is_negative' => ($totalPaid - $expenseTotal) < 0
            ];
        }
        
        return $finalBalance;
    }
    
    /**
     * Get category cards data for a specific project
     */
    public function categoryCards($projectId)
    {
        $data = [];

        // Rebar
        $rebar = DB::table('rebars')
            ->select(
                'currency',
                DB::raw('SUM(amount) as total')
            )
            ->where('project_id', $projectId)
            ->groupBy('currency')
            ->get();

        foreach ($rebar as $row) {
            $data[] = [
                'category' => 'Rebar',
                'currency' => $row->currency,
                'total' => $row->total
            ];
        }

        // Gravel
        $gravel = DB::table('gravels')
            ->select(
                'currency',
                DB::raw('SUM(amount) as total')
            )
            ->where('project_id', $projectId)
            ->groupBy('currency')
            ->get();

        foreach ($gravel as $row) {
            $data[] = [
                'category' => 'Gravel',
                'currency' => $row->currency,
                'total' => $row->total
            ];
        }

        // Sand
        $sand = DB::table('sands')
            ->select(
                'currency',
                DB::raw('SUM(amount) as total')
            )
            ->where('project_id', $projectId)
            ->groupBy('currency')
            ->get();

        foreach ($sand as $row) {
            $data[] = [
                'category' => 'Sand',
                'currency' => $row->currency,
                'total' => $row->total
            ];
        }

        // Stone
        $stone = DB::table('stones')
            ->select(
                'currency',
                DB::raw('SUM(amount) as total')
            )
            ->where('project_id', $projectId)
            ->groupBy('currency')
            ->get();

        foreach ($stone as $row) {
            $data[] = [
                'category' => 'Stone',
                'currency' => $row->currency,
                'total' => $row->total
            ];
        }

        // Brick
        $brick = DB::table('bricks')
            ->select(
                'currency',
                DB::raw('SUM(amount) as total')
            )
            ->where('project_id', $projectId)
            ->groupBy('currency')
            ->get();

        foreach ($brick as $row) {
            $data[] = [
                'category' => 'Brick',
                'currency' => $row->currency,
                'total' => $row->total
            ];
        }

        return response()->json($data);
    }
    
    /**
     * Get Material Summary (Paid amounts by currency from form_entries)
     */
    private function getMaterialSummary()
    {
        try {
            $formEntries = DB::table('form_entries')->get();
            $materialsByCurrency = [];

            foreach ($formEntries as $entry) {
                $data = json_decode($entry->data, true);
                
                // Check if it's a material entry with payment_status = 'paid'
                if (isset($data['payment_status']) && $data['payment_status'] === 'paid' && isset($data['amount'])) {
                    $amount = floatval($data['amount']);
                    $currency = $data['currency'] ?? 'AFN';
                    
                    if (!isset($materialsByCurrency[$currency])) {
                        $materialsByCurrency[$currency] = 0;
                    }
                    $materialsByCurrency[$currency] += $amount;
                }
            }

            return $materialsByCurrency;
        } catch (\Exception $e) {
            \Log::error('Material Summary Error: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get Parties Data (Balance by currency)
     */
    private function getPartiesData()
    {
        try {
            $parties = DB::table('parties')
                ->select('currency', DB::raw('SUM(amount) as total'))
                ->groupBy('currency')
                ->get();
                
            return $parties->toArray();
        } catch (\Exception $e) {
            \Log::error('Parties Data Error: ' . $e->getMessage());
            return [];
        }
    }
}
