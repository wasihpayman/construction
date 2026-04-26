<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check material_submissions table
echo "=== MATERIAL SUBMISSIONS TABLE ===\n";
$submissions = DB::table('material_submissions')->get();

foreach ($submissions as $sub) {
    echo "ID: {$sub->id}\n";
    echo "Name: {$sub->name}\n";
    echo "Amount: {$sub->amount}\n";
    echo "Currency: {$sub->currency}\n";
    echo "Payment Status: {$sub->payment_status}\n";
    echo "Date: {$sub->date}\n";
    echo "Category ID: {$sub->category_id}\n";
    echo "Created By: {$sub->created_by}\n";
    echo "Created At: {$sub->created_at}\n";
    echo "--------------------------------\n";
}

echo "\n=== FORM ENTRIES TABLE ===\n";
$formEntries = DB::table('form_entries')->get();

foreach ($formEntries as $entry) {
    echo "ID: {$entry->id}\n";
    echo "Category ID: {$entry->category_id}\n";
    echo "Data: " . json_encode($entry->data) . "\n";
    echo "Created By: {$entry->created_by}\n";
    echo "Created At: {$entry->created_at}\n";
    echo "--------------------------------\n";
}

echo "\nTotal material_submissions: " . DB::table('material_submissions')->count() . "\n";
echo "Total form_entries: " . DB::table('form_entries')->count() . "\n";
