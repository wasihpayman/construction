<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test the financial dashboard
echo "=== TESTING FINANCIAL DASHBOARD ===\n";

try {
    $controller = new \App\Http\Controllers\Api\FinancialDashboardController();
    $response = $controller->index();
    $data = $response->getData();
    
    echo "Balance Summary:\n";
    foreach ($data->balance_summary as $currency => $balance) {
        echo "  $currency: " . json_encode($balance) . "\n";
    }
    
    echo "\nExpense Summary:\n";
    foreach ($data->expense_summary as $currency => $expenses) {
        echo "  $currency:\n";
        echo "    Employee Salaries: " . $expenses->employee_salaries . "\n";
        echo "    Worker Payments: " . $expenses->worker_payments . "\n";
        echo "    General Expenses: " . $expenses->general_expenses . "\n";
        echo "    Materials Payments: " . $expenses->materials_payments . "\n";
        echo "    Total: " . $expenses->total . "\n";
    }
    
    echo "\nMaterial Summary:\n";
    foreach ($data->material_summary as $currency => $total) {
        echo "  $currency: $total\n";
    }
    
    echo "\nFinal Balance:\n";
    foreach ($data->final_balance as $currency => $balance) {
        echo "  $currency: " . json_encode($balance) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\n=== FORM ENTRIES CHECK ===\n";
$formEntries = DB::table('form_entries')->get();
$paidMaterials = ['AFN' => 0, 'USD' => 0];

foreach ($formEntries as $entry) {
    $data = json_decode($entry->data, true);
    if (isset($data['payment_status']) && $data['payment_status'] === 'paid' && isset($data['amount'])) {
        $amount = floatval($data['amount']);
        $currency = $data['currency'] ?? 'AFN';
        $paidMaterials[$currency] += $amount;
    }
}

echo "Paid Materials from Form Entries:\n";
echo "  AFN: " . $paidMaterials['AFN'] . "\n";
echo "  USD: " . $paidMaterials['USD'] . "\n";
