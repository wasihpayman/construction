<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING MATERIALCATEGORYCONTROLLER DASHBOARD ===\n";

try {
    $controller = new \App\Http\Controllers\Api\MaterialCategoryController();
    
    echo "Calling dashboard method...\n";
    $response = $controller->dashboard();
    
    echo "Response type: " . get_class($response) . "\n";
    echo "Response status: " . $response->getStatusCode() . "\n";
    
    $data = $response->getData();
    echo "Data type: " . gettype($data) . "\n";
    
    if ($data) {
        echo "Success! USD Paid: " . $data->formatted_stats->total_paid_amount->USD . "\n";
        echo "AFN Paid: " . $data->formatted_stats->total_paid_amount->AFN . "\n";
    } else {
        echo "No data returned!\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
