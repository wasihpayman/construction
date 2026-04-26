<?php

// Simple test without Laravel framework
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    require_once 'vendor/autoload.php';
    
    $app = require_once 'bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    // Direct database test
    $formEntries = DB::table('form_entries')->get();
    
    echo "=== FORM ENTRIES COUNT: " . $formEntries->count() . " ===\n";
    
    // Calculate paid amounts
    $paidAmountsByCurrency = ['AFN' => 0, 'USD' => 0];
    
    foreach ($formEntries as $entry) {
        $data = json_decode($entry->data, true);
        if (is_array($data) && isset($data['amount']) && isset($data['payment_status']) && $data['payment_status'] === 'paid') {
            $amount = floatval($data['amount']);
            $currency = $data['currency'] ?? 'AFN';
            
            if (isset($paidAmountsByCurrency[$currency])) {
                $paidAmountsByCurrency[$currency] += $amount;
            }
        }
    }
    
    echo "=== PAID AMOUNTS ===\n";
    echo "AFN: " . $paidAmountsByCurrency['AFN'] . "\n";
    echo "USD: " . $paidAmountsByCurrency['USD'] . "\n";
    
    // Format and return
    $result = [
        'success' => true,
        'data' => [
            'total_paid_amount' => [
                'AFN' => 'AFN ' . number_format($paidAmountsByCurrency['AFN'], 2),
                'USD' => '$' . number_format($paidAmountsByCurrency['USD'], 2)
            ],
            'total_categories' => DB::table('material_categories')->count(),
            'active_categories' => DB::table('form_entries')->distinct('category_id')->count(),
            'paid_items_count' => 0,
            'pending_items_count' => 0
        ],
        'debug' => [
            'form_entries_count' => $formEntries->count(),
            'paid_afn_raw' => $paidAmountsByCurrency['AFN'],
            'paid_usd_raw' => $paidAmountsByCurrency['USD'],
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
