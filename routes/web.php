<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SalesController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Test Material Dashboard
    Route::get('/test-material-dashboard', function () {
        try {
            $controller = new \App\Http\Controllers\Api\MaterialCategoryController();
            $response = $controller->dashboard();
            $data = $response->getData();
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'timestamp' => now()->toDateTimeString(),
                'debug' => [
                    'total_categories' => $data->stats->total_categories,
                    'total_amount' => $data->stats->total_amount,
                    'total_paid_amount' => $data->stats->total_paid_amount,
                    'total_unpaid_amount' => $data->stats->total_unpaid_amount,
                    'formatted_afn_total' => $data->formatted_stats->total_amount->AFN,
                    'formatted_usd_total' => $data->formatted_stats->total_amount->USD,
                    'formatted_afn_paid' => $data->formatted_stats->total_paid_amount->AFN,
                    'formatted_usd_paid' => $data->formatted_stats->total_paid_amount->USD,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    });

    // Simple API test route
    Route::get('/api-test', function () {
        return response()->json([
            'message' => 'API is working',
            'timestamp' => now()->toDateTimeString(),
            'test_data' => [
                'total_categories' => 5,
                'total_paid_amount' => [
                    'AFN' => 'AFN 29,496.00',
                    'USD' => '$2,900.00'
                ],
                'total_amount' => [
                    'AFN' => 'AFN 31,996.00',
                    'USD' => '$4,100.00'
                ]
            ]
        ]);
    });
});

// Material Dashboard Public Route
Route::get('/material-dashboard', function () {
    try {
        $controller = new \App\Http\Controllers\Api\MaterialCategoryController();
        $response = $controller->dashboard();
        $data = $response->getData();
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Material Dashboard API working',
            'timestamp' => now()->toDateTimeString()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'timestamp' => now()->toDateTimeString()
        ]);
    }
});

// Sales Routes
Route::post('/sales/create', [SalesController::class, 'create']);
Route::get('/sales/by-unit/{unitId}', [SalesController::class, 'getByUnit']);
Route::get('/sales/{saleId}/documents', [SalesController::class, 'getDocuments']);
Route::post('/sales/{saleId}/payment', [SalesController::class, 'addPayment']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
