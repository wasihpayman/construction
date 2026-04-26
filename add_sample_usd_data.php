<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Add sample USD data
$sampleUSDData = [
    [
        'category_id' => 1,
        'data' => json_encode([
            'date' => '2026-04-20',
            'name' => 'Steel Rebar USD',
            'amount' => '1500',
            'currency' => 'USD',
            'payment_status' => 'paid'
        ]),
        'created_by' => 1,
        'created_at' => now()->subDays(5),
        'updated_at' => now()->subDays(5)
    ],
    [
        'category_id' => 2,
        'data' => json_encode([
            'date' => '2026-04-21',
            'name' => 'Cement Import USD',
            'amount' => '800',
            'currency' => 'USD',
            'payment_status' => 'paid'
        ]),
        'created_by' => 1,
        'created_at' => now()->subDays(4),
        'updated_at' => now()->subDays(4)
    ],
    [
        'category_id' => 3,
        'data' => json_encode([
            'date' => '2026-04-22',
            'name' => 'Electrical Materials',
            'amount' => '1200',
            'currency' => 'USD',
            'payment_status' => 'pending'
        ]),
        'created_by' => 1,
        'created_at' => now()->subDays(3),
        'updated_at' => now()->subDays(3)
    ],
    [
        'category_id' => 4,
        'data' => json_encode([
            'date' => '2026-04-23',
            'name' => 'Plumbing Supplies USD',
            'amount' => '600',
            'currency' => 'USD',
            'payment_status' => 'paid'
        ]),
        'created_by' => 1,
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2)
    ]
];

// Insert sample USD data
foreach ($sampleUSDData as $data) {
    DB::table('form_entries')->insert($data);
}

echo "Sample USD data added successfully!\n";

// Check the data
echo "\n=== UPDATED FORM ENTRIES ===\n";
$formEntries = DB::table('form_entries')->get();

foreach ($formEntries as $entry) {
    $data = json_decode($entry->data, true);
    echo "ID: {$entry->id}\n";
    echo "Name: " . ($data['name'] ?? 'N/A') . "\n";
    echo "Amount: " . ($data['amount'] ?? '0') . "\n";
    echo "Currency: " . ($data['currency'] ?? 'N/A') . "\n";
    echo "Payment Status: " . ($data['payment_status'] ?? 'N/A') . "\n";
    echo "--------------------------------\n";
}

// Test the dashboard API
echo "\n=== TESTING DASHBOARD API ===\n";
$controller = new \App\Http\Controllers\Api\MaterialCategoryController();
$response = $controller->dashboard();
$stats = $response->getData();

echo "Total Categories: {$stats->stats->total_categories}\n";
echo "Total Amount: {$stats->stats->total_amount}\n";
echo "Total Paid Amount: {$stats->stats->total_paid_amount}\n";
echo "Total Unpaid Amount: {$stats->stats->total_unpaid_amount}\n";
echo "Active Categories: {$stats->stats->active_categories}\n";

echo "\n=== FORMATTED STATS ===\n";
echo "AFN Total: {$stats->formatted_stats->total_amount->AFN}\n";
echo "USD Total: {$stats->formatted_stats->total_amount->USD}\n";
echo "AFN Paid: {$stats->formatted_stats->total_paid_amount->AFN}\n";
echo "USD Paid: {$stats->formatted_stats->total_paid_amount->USD}\n";
