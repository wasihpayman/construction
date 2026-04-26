<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING MATERIAL DATA ===\n";

try {
    // Check form_entries table
    $formEntries = DB::table('form_entries')->get();
    echo "Total form entries: " . $formEntries->count() . "\n";
    
    $materialsByCurrency = [];
    $paidCount = 0;
    $totalCount = 0;
    
    foreach ($formEntries as $entry) {
        $data = json_decode($entry->data, true);
        
        if (is_array($data) && isset($data['amount'])) {
            $totalCount++;
            
            if (isset($data['payment_status']) && $data['payment_status'] === 'paid') {
                $paidCount++;
                $amount = floatval($data['amount']);
                $currency = $data['currency'] ?? 'AFN';
                
                if (!isset($materialsByCurrency[$currency])) {
                    $materialsByCurrency[$currency] = 0;
                }
                $materialsByCurrency[$currency] += $amount;
                
                echo "Paid entry: ID={$entry->id}, Amount={$amount}, Currency={$currency}\n";
            }
        }
    }
    
    echo "\n=== RESULTS ===\n";
    echo "Total entries with amount: {$totalCount}\n";
    echo "Paid entries: {$paidCount}\n";
    echo "Paid amounts by currency:\n";
    
    foreach ($materialsByCurrency as $currency => $total) {
        echo "  {$currency}: {$total}\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
