<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ADDING CORRECT SAMPLE DATA ===\n";

try {
    // Add sample material payments with correct table structure
    $sampleData = [
        [
            'category_id' => 1,
            'amount' => '2900',
            'currency' => 'USD',
            'payment_status' => 'paid',
            'description' => 'Steel materials payment',
            'date' => '2026-04-20'
        ],
        [
            'category_id' => 2,
            'amount' => '5200',
            'currency' => 'USD',
            'payment_status' => 'paid',
            'description' => 'Cement materials payment - YOUR PAYMENT',
            'date' => '2026-04-22'
        ],
        [
            'category_id' => 3,
            'amount' => '15000',
            'currency' => 'AFN',
            'payment_status' => 'paid',
            'description' => 'Sand payment',
            'date' => '2026-04-21'
        ],
        [
            'category_id' => 4,
            'amount' => '14496',
            'currency' => 'AFN',
            'payment_status' => 'paid',
            'description' => 'Gravel payment',
            'date' => '2026-04-19'
        ],
        [
            'category_id' => 5,
            'amount' => '2500',
            'currency' => 'AFN',
            'payment_status' => 'pending',
            'description' => 'Bricks pending payment',
            'date' => '2026-04-23'
        ],
        [
            'category_id' => 6,
            'amount' => '1200',
            'currency' => 'USD',
            'payment_status' => 'pending',
            'description' => 'Wood pending payment',
            'date' => '2026-04-24'
        ]
    ];
    
    foreach ($sampleData as $data) {
        DB::table('form_entries')->insert([
            'category_id' => $data['category_id'],
            'data' => json_encode($data),
            'created_by' => 1, // Assuming user ID 1 exists
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        echo "Added: {$data['amount']} {$data['currency']} - {$data['payment_status']}\n";
    }
    
    echo "\n=== SAMPLE DATA ADDED ===\n";
    echo "Total entries: " . DB::table('form_entries')->count() . "\n";
    
    // Verify the data
    $formEntries = DB::table('form_entries')->get();
    $materialsByCurrency = [];
    
    foreach ($formEntries as $entry) {
        $data = json_decode($entry->data, true);
        
        if (isset($data['payment_status']) && $data['payment_status'] === 'paid' && isset($data['amount'])) {
            $amount = floatval($data['amount']);
            $currency = $data['currency'] ?? 'AFN';
            
            if (!isset($materialsByCurrency[$currency])) {
                $materialsByCurrency[$currency] = 0;
            }
            $materialsByCurrency[$currency] += $amount;
            
            echo "Paid: {$amount} {$currency} - {$data['description']}\n";
        }
    }
    
    echo "\n=== TOTAL PAID AMOUNTS ===\n";
    foreach ($materialsByCurrency as $currency => $total) {
        echo "  {$currency}: {$total}\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
