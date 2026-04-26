<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\WorkerController;
use App\Http\Controllers\Api\ContractorController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\WorkerPaymentController;
use App\Http\Controllers\Api\MaterialPurchaseController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UnitsController;
use App\Http\Controllers\Api\UnitSettingsController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\UnitSaleController;
use App\Http\Controllers\Api\ProfitController;
use App\Http\Controllers\Api\MaterialCategoryController;
use App\Http\Controllers\Api\RebarMaterialController;
use App\Http\Controllers\Api\GravelMaterialController;
use App\Http\Controllers\Api\SandMaterialController;
use App\Http\Controllers\Api\StoneMaterialController;
use App\Http\Controllers\Api\BrickMaterialController;
use App\Http\Controllers\Api\PartyController;
use App\Http\Controllers\Api\PartyPaymentController;
use App\Http\Controllers\BillsController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\DocumentBankController;
use App\Http\Controllers\SalaryPaymentController;
use App\Http\Controllers\Api\FinancialDashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectManagementController;
use App\Http\Controllers\Api\ProjectModelController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DynamicMenuController;
use App\Http\Controllers\Api\CategoryFormController;
use App\Http\Controllers\Api\FormEntryController;

// Authentication
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('logout', [AuthController::class, 'logout']);

// Profile Management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('profile/photo', [ProfileController::class, 'deleteProfilePhoto']);
});

// Project Management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('project-management', [ProjectManagementController::class, 'index']);
    Route::post('project-management', [ProjectManagementController::class, 'store']);
    Route::get('project-management/{id}', [ProjectManagementController::class, 'show']);
    Route::put('project-management/{id}', [ProjectManagementController::class, 'update']);
    Route::delete('project-management/{id}', [ProjectManagementController::class, 'destroy']);
    Route::get('project-management/active', [ProjectManagementController::class, 'getActiveProjects']);
});

// Projects
Route::middleware('auth:sanctum')->apiResource('projects', ProjectController::class);

// Workers
Route::middleware('auth:sanctum')->apiResource('workers', WorkerController::class);

// Contractors
Route::middleware('auth:sanctum')->apiResource('contractors', ContractorController::class);

// Materials
Route::middleware('auth:sanctum')->apiResource('materials', MaterialController::class);
Route::get('/projects/{project}/material-category-totals', [MaterialController::class, 'categoryTotals']);
Route::get('/materials/dashboard-totals', [MaterialController::class, 'dashboardTotals']);
Route::get('/materials/submissions', [MaterialController::class, 'getSubmissionsByCategory']);
Route::get('/materials/submissions/{categoryId}', [MaterialController::class, 'getSubmissionsByCategory']);
Route::post('/materials/submit', [MaterialController::class, 'submitMaterial']);

// Expenses
Route::middleware('auth:sanctum')->apiResource('expenses', ExpenseController::class);

// Worker Payments
Route::middleware('auth:sanctum')->apiResource('worker-payments', WorkerPaymentController::class);

// Material Purchases
Route::middleware('auth:sanctum')->apiResource('material-purchases', MaterialPurchaseController::class);

// Units
Route::middleware('auth:sanctum')->get('units', [UnitsController::class, 'index']);
Route::middleware('auth:sanctum')->apiResource('units', UnitController::class);

// Unit Management - Additional routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('units/by-floors/{project}', [UnitController::class, 'getByFloors']);
    Route::post('units/{id}/mark-sold', [UnitController::class, 'markAsSold']);
    Route::get('units/available', [UnitController::class, 'getAvailable']);
    Route::post('units/store-generated', [UnitsController::class, 'storeGenerated']);
});

// Unit Settings
Route::middleware('auth:sanctum')->group(function () {
    Route::get('unit-settings', [UnitSettingsController::class, 'index']);
    Route::post('unit-settings', [UnitSettingsController::class, 'store']);
    Route::post('units/generate', [UnitSettingsController::class, 'generateUnits']);
});

// Dynamic Menu System
Route::middleware('auth:sanctum')->group(function () {
    Route::get('dynamic-menu', [DynamicMenuController::class, 'index']);
    Route::get('form-by-path/{path}', [DynamicMenuController::class, 'getFormByPath']);
});

// Category Forms System
Route::middleware('auth:sanctum')->group(function () {
    Route::get('categories/{id}/form', [CategoryFormController::class, 'getForm']);
    Route::post('categories/{id}/form', [CategoryFormController::class, 'createForm']);
    Route::put('categories/{id}/form', [CategoryFormController::class, 'updateForm']);
    Route::post('category-entries', [CategoryFormController::class, 'submitEntry']);
    Route::get('categories/{id}/entries', [CategoryFormController::class, 'getEntries']);
});

// Form Entries System
Route::middleware('auth:sanctum')->group(function () {
    Route::post('categories/{categoryId}/entries', [FormEntryController::class, 'storeEntry']);
    Route::get('categories/{categoryId}/history', [FormEntryController::class, 'history']);
    Route::put('category-entries/{entryId}', [FormEntryController::class, 'updateEntry']);
});

// Unit Sales
Route::middleware('auth:sanctum')->apiResource('unit-sales', UnitSaleController::class);

// Sales
Route::middleware('auth:sanctum')->group(function () {
    Route::post('sales/create', [SalesController::class, 'create']);
    Route::get('sales', [SalesController::class, 'index']);
    Route::get('sales/{id}', [SalesController::class, 'show']);
    Route::post('sales/{id}/payment', [SalesController::class, 'updatePayment']);
    Route::get('sales/{id}/payments', [SalesController::class, 'getPayments']);
    Route::get('sales/{id}/documents', [SalesController::class, 'getDocuments']);
    Route::get('sales/by-unit/{unit_id}', [SalesController::class, 'getByUnit']);
});

// Material Categories
Route::apiResource('material-categories', MaterialCategoryController::class);
Route::get('material-categories/dashboard', [MaterialCategoryController::class, 'dashboard']); // Public for testing
Route::get('material-categories/stats/{categoryId}', [MaterialCategoryController::class, 'categoryStats']); // Public for testing

// Public Material Dashboard (no auth required)
Route::get('material-dashboard', function () {
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

// Materials
Route::middleware('auth:sanctum')->apiResource('rebar-materials', RebarMaterialController::class);
Route::middleware('auth:sanctum')->apiResource('gravel-materials', GravelMaterialController::class);
Route::middleware('auth:sanctum')->apiResource('sand-materials', SandMaterialController::class);
Route::middleware('auth:sanctum')->apiResource('stone-materials', StoneMaterialController::class);
Route::middleware('auth:sanctum')->apiResource('brick-materials', BrickMaterialController::class);

// Profit
Route::middleware('auth:sanctum')->get('profit/{project}', [ProfitController::class, 'show']);

// Bills Management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('bills/by-category', [BillsController::class, 'byCategory']);
    Route::apiResource('bills', BillsController::class);
    Route::get('bills/{id}/download', [BillsController::class, 'download']);
    Route::options('bills/{id}/download', function() {
        return response()->json([], 200);
    });
});

// Balance System
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('parties', PartyController::class);
    Route::apiResource('party-payments', PartyPaymentController::class);
    Route::get('parties/{party}/payments', [PartyPaymentController::class, 'getPartyPayments']);
    Route::get('balance-summary', [PartyController::class, 'getBalanceSummary']);
});

// Employees Management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('employees/by-category', [EmployeesController::class, 'byCategory']);
    Route::apiResource('employees', EmployeesController::class);
    Route::get('employees/{id}/download/{type}', [EmployeesController::class, 'downloadFile']);
    Route::options('employees/{id}/download/{type}', function() {
        return response()->json([], 200);
    });
});

// Salary Payments
Route::middleware('auth:sanctum')->group(function () {
    Route::get('employees/{employee_id}/salary-payments', [SalaryPaymentController::class, 'index']);
    Route::post('salary-payments', [SalaryPaymentController::class, 'store']);
});

// Document Bank Management
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('document-bank', DocumentBankController::class);
    Route::get('document-bank/{id}/download', [DocumentBankController::class, 'download']);
    Route::options('document-bank/{id}/download', function() {
        return response()->json([], 200);
    });
});

// 3D Project Models
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('project-models', ProjectModelController::class);
    Route::get('project-models/{projectModel}/download', [ProjectModelController::class, 'download']);
});

// Financial Dashboard
Route::middleware('auth:sanctum')->get('financial-dashboard', [FinancialDashboardController::class, 'index']);
Route::get('/projects/{project}/category-cards', [FinancialDashboardController::class, 'categoryCards']);