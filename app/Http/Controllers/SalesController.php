<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Unit;
use App\Models\Document;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    /**
     * Create a new sale with documents.
     */
    public function create(Request $request)
    {
        try {
            DB::beginTransaction();

            // Create the sale
            $sale = Sale::create([
                'unit_id' => $request->unit_id,
                'buyer_name' => $request->buyer_name,
                'buyer_phone' => $request->buyer_phone,
                'buyer_email' => $request->buyer_email,
                'buyer_address' => $request->buyer_address,
                'buyer_national_id' => $request->buyer_national_id,
                'seller_name' => $request->seller_name,
                'seller_phone' => $request->seller_phone,
                'seller_email' => $request->seller_email,
                'seller_address' => $request->seller_address,
                'sale_price' => $request->sale_price,
                'total_price' => $request->total_price,
                'down_payment' => $request->down_payment,
                'monthly_payment' => $request->monthly_payment,
                'number_of_months' => $request->number_of_months,
                'total_months_paid' => $request->total_months_paid,
                'payment_method' => $request->payment_method,
                'sold_date' => $request->sold_date,
                'sale_description' => $request->sale_description,
                'project_id' => $request->project_id ?: null
            ]);

            // Process and save documents
            $this->processDocuments($request, $sale);

            // Update unit status to sold
            $unit = Unit::find($request->unit_id);
            if ($unit) {
                $unit->update([
                    'status' => 'sold',
                    'buyer_name' => $request->buyer_name,
                    'sale_price' => $request->sale_price,
                    'sold_date' => $request->sold_date
                ]);
            }

            // Create down payment record if exists
            if ($request->down_payment && $request->down_payment > 0) {
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_amount' => $request->down_payment,
                    'payment_date' => $request->sold_date,
                    'payment_method' => 'down_payment',
                    'notes' => 'Down Payment',
                    'months_paid' => 0
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'sale' => $sale->load(['documents', 'payments'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Sale creation failed: ' . $e->getMessage());
            \Log::error('Request data: ' . json_encode($request->all()));
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sale: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process and save documents for a sale.
     */
    private function processDocuments(Request $request, Sale $sale)
    {
        \Log::info('Processing documents for sale: ' . $sale->id);
        \Log::info('Request data: ' . json_encode($request->all()));

        $documentCategories = [
            'national_id',
            'contract', 
            'payment_proof',
            'other_documents'
        ];

        foreach ($documentCategories as $category) {
            \Log::info("Checking category: {$category}");
            
            // Try different possible field names
            $fieldNames = [
                "documents.{$category}",
                "documents_{$category}",
                $category
            ];

            $files = null;
            foreach ($fieldNames as $fieldName) {
                if ($request->hasFile($fieldName)) {
                    $files = $request->file($fieldName);
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
                    \Log::info("File {$index}: " . (is_object($file) ? get_class($file) : gettype($file)));
                    
                    if ($file && is_object($file) && method_exists($file, 'isValid') && $file->isValid()) {
                        try {
                            // Generate unique filename
                            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                            
                            // Store file in storage
                            $path = $file->storeAs("documents/{$category}", $filename, 'public');
                            
                            // Create document record
                            Document::create([
                                'sale_id' => $sale->id,
                                'category' => $category,
                                'filename' => $filename,
                                'original_name' => $file->getClientOriginalName(),
                                'path' => $path,
                                'mime_type' => $file->getMimeType(),
                                'size' => $file->getSize()
                            ]);

                            \Log::info("Successfully saved document: {$category} - {$file->getClientOriginalName()}");
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
    }

    /**
     * Get sale details by unit ID with documents and payments.
     */
    public function getByUnit($unitId)
    {
        try {
            $sale = Sale::with(['documents', 'payments'])
                ->where('unit_id', $unitId)
                ->first();

            if (!$sale) {
                return response()->json(['error' => 'Sale not found'], 404);
            }

            return response()->json($sale);

        } catch (\Exception $e) {
            \Log::error('Error fetching sale by unit: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch sale details'
            ], 500);
        }
    }

    /**
     * Get documents for a specific sale.
     */
    public function getDocuments($saleId)
    {
        try {
            $documents = Document::where('sale_id', $saleId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($documents);

        } catch (\Exception $e) {
            \Log::error('Error fetching documents: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch documents'
            ], 500);
        }
    }

    /**
     * Add a payment to a sale.
     */
    public function addPayment(Request $request, $saleId)
    {
        try {
            $sale = Sale::findOrFail($saleId);

            $payment = SalePayment::create([
                'sale_id' => $sale->id,
                'payment_amount' => $request->payment_amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'months_paid' => $request->months_paid ?? 1
            ]);

            return response()->json([
                'success' => true,
                'payment' => $payment
            ]);

        } catch (\Exception $e) {
            \Log::error('Error adding payment: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to add payment'
            ], 500);
        }
    }
}
