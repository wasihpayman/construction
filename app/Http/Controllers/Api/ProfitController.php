<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\UnitSale;
use App\Models\Expense;
use App\Models\WorkerPayment;
use App\Models\MaterialPurchase;

class ProfitController extends Controller
{
    public function show(Project $project)
    {
        // 💵 Income (فروش واحدها)
        $income = UnitSale::whereHas('unit', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        })->sum('sale_price');

        // 💸 Expenses
        $expenses = Expense::where('project_id', $project->id)->sum('amount');

        // 👷 Worker Payments
        $workerPayments = WorkerPayment::where('project_id', $project->id)->sum('amount');

        // 🧱 Material Purchases
        $materials = MaterialPurchase::where('project_id', $project->id)->sum('total_price');

        // 🔻 Total Cost
        $totalCost = $expenses + $workerPayments + $materials;

        // 📈 Profit
        $profit = $income - $totalCost;

        return response()->json([
            'project_id' => $project->id,
            'income' => $income,
            'total_cost' => $totalCost,
            'profit' => $profit
        ]);
    }
}