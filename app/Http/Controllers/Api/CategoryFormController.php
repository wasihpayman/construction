<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoryEntry;
use App\Models\CategoryForm;
use App\Models\MaterialCategory;
use Illuminate\Http\Request;

class CategoryFormController extends Controller
{
    /**
     * Get form schema by category ID
     */
    public function getForm($categoryId)
    {
        $category = MaterialCategory::find($categoryId);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $form = CategoryForm::where('category_id', $categoryId)->first();

        if (!$form) {
            return response()->json([
                'category_id' => $categoryId,
                'category_name' => $category->name,
                'schema' => null,
                'has_form' => false
            ]);
        }

        return response()->json([
            'category_id' => $categoryId,
            'category_name' => $category->name,
            'schema' => $form->schema,
            'has_form' => true
        ]);
    }

    /**
     * Create form schema for a category (only once)
     */
    public function createForm(Request $request, $categoryId)
    {
        $category = MaterialCategory::find($categoryId);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Check if form already exists (schema lock)
        $existingForm = CategoryForm::where('category_id', $categoryId)->first();
        if ($existingForm) {
            return response()->json(['message' => 'Form already exists for this category'], 400);
        }

        // Validate schema structure
        $validated = $request->validate([
            'schema' => 'required|array',
            'schema.fields' => 'required|array',
            'schema.fields.*.name' => 'required|string',
            'schema.fields.*.type' => 'required|in:text,number,email,textarea,select,checkbox,radio,date,file,currency,payment_status',
            'schema.fields.*.locked' => 'sometimes|boolean',
            'schema.fields.*.system' => 'sometimes|boolean',
            'schema.fields.*.order' => 'sometimes|integer',
            'financial_config' => 'nullable|array',
            'financial_config.amount_field' => 'required_with:financial_config|string',
            'financial_config.currency_field' => 'required_with:financial_config|string',
            'financial_config.status_field' => 'required_with:financial_config|string',
            'financial_config.paid_value' => 'required_with:financial_config|string',
        ]);

        // Protect locked system fields from modification
        $schema = $validated['schema'];
        if (isset($schema['fields'])) {
            $schema['fields'] = $this->protectLockedFields($schema['fields']);
        }

        // Create the form
        $form = CategoryForm::create([
            'category_id' => $categoryId,
            'schema' => $schema,
        ]);

        return response()->json([
            'message' => 'Form created successfully',
            'form' => $form
        ], 201);
    }

    /**
     * Submit entry data for a category form
     */
    public function submitEntry(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:material_categories,id',
            'data' => 'required|array',
        ]);

        $category = MaterialCategory::find($validated['category_id']);
        $form = CategoryForm::where('category_id', $validated['category_id'])->first();

        if (!$form) {
            return response()->json(['message' => 'No form schema found for this category'], 404);
        }

        // Validate entry data against schema
        $errors = $form->validateEntry($validated['data']);

        if (!empty($errors)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $errors
            ], 422);
        }

        // Create the entry
        $entry = CategoryEntry::create([
            'form_id' => $form->id,
            'category_id' => $validated['category_id'],
            'data' => $validated['data'],
        ]);

        return response()->json([
            'message' => 'Entry submitted successfully',
            'entry' => $entry
        ], 201);
    }

    /**
     * Get all entries for a category
     */
    public function getEntries($categoryId)
    {
        $category = MaterialCategory::find($categoryId);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $form = CategoryForm::where('category_id', $categoryId)->first();

        if (!$form) {
            return response()->json(['message' => 'No form schema found for this category'], 404);
        }

        $entries = CategoryEntry::where('form_id', $form->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'category_id' => $categoryId,
            'category_name' => $category->name,
            'schema' => $form->schema,
            'entries' => $entries
        ]);
    }

    /**
     * Update form schema
     */
    public function updateForm(Request $request, $categoryId)
    {
        $category = MaterialCategory::find($categoryId);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $form = CategoryForm::where('category_id', $categoryId)->first();

        if (!$form) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        // Validate schema structure
        $validated = $request->validate([
            'schema' => 'required|array',
            'schema.fields' => 'required|array',
            'schema.fields.*.name' => 'required|string',
            'schema.fields.*.type' => 'required|in:text,number,email,textarea,select,checkbox,radio,date,file,currency,payment_status',
            'schema.fields.*.label' => 'required|string',
            'schema.fields.*.required' => 'sometimes|boolean',
            'schema.fields.*.system' => 'sometimes|boolean',
        ]);

        // Protect locked system fields
        $schema = $validated['schema'];
        if (isset($schema['fields'])) {
            $schema['fields'] = $this->protectLockedFields($schema['fields']);
        }

        // Update the form
        $form->schema = $schema;
        $form->save();

        return response()->json([
            'message' => 'Form updated successfully',
            'form' => $form
        ]);
    }

    /**
     * Protect locked system fields from modification
     * Users cannot modify locked fields, only add new ones
     */
    private function protectLockedFields(array $fields): array
    {
        $protectedFields = [];
        $systemFieldNames = ['name', 'currency', 'payment_status', 'amount', 'date'];
        
        foreach ($fields as $field) {
            // If it's a system field, ensure it's locked and has correct properties
            if (in_array($field['name'], $systemFieldNames)) {
                $protectedFields[] = [
                    'name' => $field['name'],
                    'type' => $field['type'],
                    'label' => $field['label'],
                    'locked' => true,
                    'system' => true,
                    'required' => true,
                    'order' => $field['order'] ?? 999
                ];
            } else {
                // User fields - allow all modifications
                $protectedFields[] = $field;
            }
        }
        
        return $protectedFields;
    }
}
