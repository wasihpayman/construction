<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SalesController extends Controller
{
    public function create(Request $request)
    {
        \Log::info('=== SALES CREATE METHOD CALLED ===');
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request headers: ' . json_encode($request->headers->all()));
        \Log::info('Request has files: ' . ($request->hasFile('documents') ? 'YES' : 'NO'));
        \Log::info('Request has national_id: ' . ($request->hasFile('documents.national_id') ? 'YES' : 'NO'));
        \Log::info('Request has contract: ' . ($request->hasFile('documents.contract') ? 'YES' : 'NO'));
        \Log::info('All request data: ' . json_encode($request->all()));
        \Log::info('All files: ' . json_encode($request->allFiles()));
        \Log::info('================================');
        
        try {
            // Validate basic sale information
            $validated = $request->validate([
                'unit_id' => 'required|integer|exists:units,id',
                'project_id' => 'nullable|integer|exists:projects,id',
                'buyer_name' => 'required|string|max:255',
                'buyer_phone' => 'required|string|max:20',
                'buyer_email' => 'nullable|email|max:255',
                'buyer_address' => 'required|string|max:500',
                'buyer_national_id' => 'required|string|max:50',
                'seller_name' => 'nullable|string|max:255',
                'seller_phone' => 'nullable|string|max:20',
                'seller_email' => 'nullable|email|max:255',
                'seller_address' => 'nullable|string|max:500',
                'sale_price' => 'required|numeric|min:0',
                'total_price' => 'required|numeric|min:0',
                'sold_date' => 'required|date',
                'sale_description' => 'nullable|string|max:1000',
                'payment_method' => 'required|in:full,monthly',
                'down_payment' => 'nullable|numeric|min:0',
                'monthly_payment' => 'nullable|numeric|min:0',
                'number_of_months' => 'nullable|integer|min:1',
                'total_months_paid' => 'nullable|integer|min:0',
            ]);

            // Get the unit
            $unit = Unit::findOrFail($validated['unit_id']);
            
            // Check if unit is already sold
            if ($unit->status === 'sold') {
                return response()->json([
                    'message' => 'Unit is already sold',
                    'unit' => $unit
                ], 422);
            }

            DB::beginTransaction();
            
            try {
                // Update unit status and buyer information
                $unit->update([
                    'status' => 'sold',
                    'buyer_name' => $validated['buyer_name'],
                    'buyer_phone' => $validated['buyer_phone'],
                    'buyer_email' => $validated['buyer_email'],
                    'buyer_address' => $validated['buyer_address'],
                    'buyer_national_id' => $validated['buyer_national_id'],
                    'seller_name' => $validated['seller_name'],
                    'sale_price' => $validated['sale_price'],
                    'sold_date' => $validated['sold_date'],
                    'sale_description' => $validated['sale_description']
                ]);

                // Create sale record
                $saleId = DB::table('sales')->insertGetId([
                    'unit_id' => $validated['unit_id'],
                    'project_id' => $validated['project_id'] ?? null,
                    'buyer_name' => $validated['buyer_name'],
                    'buyer_phone' => $validated['buyer_phone'],
                    'buyer_email' => $validated['buyer_email'],
                    'buyer_address' => $validated['buyer_address'],
                    'buyer_national_id' => $validated['buyer_national_id'],
                    'seller_name' => $validated['seller_name'],
                    'seller_phone' => $validated['seller_phone'],
                    'seller_email' => $validated['seller_email'],
                    'seller_address' => $validated['seller_address'],
                    'sale_price' => $validated['sale_price'],
                    'total_price' => $validated['total_price'],
                    'sold_date' => $validated['sold_date'],
                    'sale_description' => $validated['sale_description'],
                    'payment_method' => $validated['payment_method'],
                    'down_payment' => $validated['down_payment'] ?? 0,
                    'monthly_payment' => $validated['monthly_payment'] ?? 0,
                    'number_of_months' => $validated['number_of_months'] ?? 1,
                    'total_months_paid' => $validated['total_months_paid'] ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Handle document uploads
                $uploadedDocuments = [];
                $documentCategories = ['national_id', 'contract', 'payment_proof', 'other_documents'];
                
                \Log::info('Processing documents for sale: ' . $saleId);
                
                foreach ($documentCategories as $category) {
                    \Log::info("Checking category: {$category}");
                    
                    // Try different possible field names
                    $fieldNames = [
                        "documents.{$category}",
                        "documents_{$category}",
                        $category
                    ];
                    
                    $files = null;
                    $foundFieldName = null;
                    
                    foreach ($fieldNames as $fieldName) {
                        if ($request->hasFile($fieldName)) {
                            $files = $request->file($fieldName);
                            $foundFieldName = $fieldName;
                            \Log::info("Found files in field: {$fieldName}");
                            break;
                        }
                    }
                    
                    if ($files) {
                        // Handle single file or array of files
                        if (!is_array($files)) {
                            $files = [$files];
                        }
                        
                        \Log::info("Processing " . count($files) . " files for category: {$category}");
                        
                        foreach ($files as $index => $file) {
                            \Log::info("Processing file {$index}: " . (is_object($file) ? $file->getClientOriginalName() : gettype($file)));
                            
                            if ($file && is_object($file) && method_exists($file, 'isValid') && $file->isValid()) {
                                try {
                                    // Generate unique filename
                                    $filename = $category . '_' . $saleId . '_' . $index . '_' . time() . '.' . $file->getClientOriginalExtension();
                                    
                                    // Store file
                                    $path = $file->storeAs('sales_documents', $filename, 'public');
                                    
                                    // Save document record
                                    DB::table('sale_documents')->insert([
                                        'sale_id' => $saleId,
                                        'category' => $category,
                                        'filename' => $filename,
                                        'original_name' => $file->getClientOriginalName(),
                                        'file_path' => $path,
                                        'file_size' => $file->getSize(),
                                        'mime_type' => $file->getMimeType(),
                                        'created_at' => now(),
                                        'updated_at' => now(),
                                    ]);
                                    
                                    \Log::info("Successfully saved document: {$category} - {$file->getClientOriginalName()}");
                                    
                                    $uploadedDocuments[] = [
                                        'category' => $category,
                                        'filename' => $filename,
                                        'original_name' => $file->getClientOriginalName(),
                                        'path' => $path
                                    ];
                                } catch (\Exception $e) {
                                    \Log::error("Error saving file {$index} in category {$category}: " . $e->getMessage());
                                }
                            } else {
                                \Log::warning("Invalid file in category {$category}, index {$index}");
                            }
                        }
                    } else {
                        \Log::info("No files found for category: {$category}");
                    }
                }
                
                \Log::info("Document processing completed. Uploaded: " . count($uploadedDocuments) . " documents");

                DB::commit();

                return response()->json([
                    'message' => 'Unit sold successfully',
                    'sale_id' => $saleId,
                    'unit' => $unit->load('project'),
                    'uploaded_documents' => $uploadedDocuments
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            // Log the detailed error for debugging
            \Log::error('Sales creation error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            \Log::error('Request data: ' . json_encode($request->all()));
            
            return response()->json([
                'message' => 'Error processing sale: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = DB::table('sales as s')
            ->join('units as u', 's.unit_id', '=', 'u.id')
            ->join('projects as p', 's.project_id', '=', 'p.id')
            ->select(
                's.*',
                'u.unit_number',
                'u.floor',
                'u.area',
                'p.name as project_name'
            );

        // Apply filters
        if ($request->has('project_id')) {
            $query->where('s.project_id', $request->project_id);
        }

        if ($request->has('buyer_name')) {
            $query->where('s.buyer_name', 'like', '%' . $request->buyer_name . '%');
        }

        if ($request->has('payment_method')) {
            $query->where('s.payment_method', $request->payment_method);
        }

        if ($request->has('date_from')) {
            $query->where('s.sold_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('s.sold_date', '<=', $request->date_to);
        }

        $sales = $query->orderBy('s.created_at', 'desc')->paginate(20);

        return response()->json($sales);
    }

    public function show($id)
    {
        $sale = DB::table('sales as s')
            ->join('units as u', 's.unit_id', '=', 'u.id')
            ->join('projects as p', 's.project_id', '=', 'p.id')
            ->select(
                's.*',
                'u.unit_number',
                'u.floor',
                'u.area',
                'p.name as project_name'
            )
            ->where('s.id', $id)
            ->first();

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        // Get documents
        $documents = DB::table('sale_documents')
            ->where('sale_id', $id)
            ->get();

        return response()->json([
            'sale' => $sale,
            'documents' => $documents
        ]);
    }

    public function updatePayment(Request $request, $id)
    {
        $validated = $request->validate([
            'months_paid' => 'nullable|integer|min:0',
            'payment_amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'notes' => 'nullable|string|max:500'
        ]);

        // Try to find sale by ID first, if not found try by unit_id
        $sale = DB::table('sales')->where('id', $id)->first();
        
        // If not found by sale ID, try to find by unit_id
        if (!$sale) {
            $sale = DB::table('sales')->where('unit_id', $id)->first();
        }
        
        if (!$sale) {
            return response()->json(['message' => 'Sale not found for this ID or Unit'], 404);
        }

        // Update months paid if provided and sale has monthly payment
        if ($sale->payment_method === 'monthly' && isset($validated['months_paid'])) {
            DB::table('sales')
                ->where('id', $sale->id)
                ->update([
                    'total_months_paid' => $validated['months_paid'],
                    'updated_at' => now()
                ]);
        }

        // Record payment
        DB::table('sale_payments')->insert([
            'sale_id' => $sale->id,
            'amount' => $validated['payment_amount'],
            'payment_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'months_paid' => $validated['months_paid'] ?? null,
            'notes' => $validated['notes'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Payment recorded successfully']);
    }

    public function getPayments($id)
    {
        $payments = DB::table('sale_payments')
            ->where('sale_id', $id)
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json($payments);
    }

    public function getDocuments($id)
    {
        $documents = DB::table('sale_documents')
            ->where('sale_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function getByUnit($unit_id)
    {
        try {
            \Log::info("getByUnit called with unit_id: " . $unit_id);
            
            $sale = DB::table('sales')
                ->where('unit_id', $unit_id)
                ->first();

            \Log::info("Sale query result: " . ($sale ? 'FOUND' : 'NOT FOUND'));

            if (!$sale) {
                \Log::info("Returning 404 for unit_id: " . $unit_id);
                return response()->json([
                    'message' => 'No sale found for this unit'
                ], 404);
            }

            // Get payments for this sale
            $payments = DB::table('sale_payments')
                ->where('sale_id', $sale->id)
                ->orderBy('payment_date', 'desc')
                ->get();

            // Get documents for this sale
            $documents = DB::table('sale_documents')
                ->where('sale_id', $sale->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Add payments and documents to sale object
            $sale->payments = $payments;
            $sale->documents = $documents;

            \Log::info("Returning sale data with " . count($payments) . " payments and " . count($documents) . " documents");

            return response()->json($sale);
            
        } catch (\Exception $e) {
            \Log::error("Error in getByUnit: " . $e->getMessage());
            \Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error loading sale details: ' . $e->getMessage()
            ], 500);
        }
    }
}
