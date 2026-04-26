<?php

namespace App\Observers;

use App\Models\MaterialCategory;
use App\Models\CategoryForm;

class MaterialCategoryObserver
{
    /**
     * Handle the MaterialCategory "created" event.
     * Auto-generate form schema with locked system fields
     */
    public function created(MaterialCategory $category)
    {
        // Auto-generate form schema with locked system fields
        $schema = $this->generateAutoFormSchema();
        
        // Auto-generate financial config for dashboard
        $financialConfig = $this->generateFinancialConfig();
        
        // Create the form automatically
        CategoryForm::create([
            'category_id' => $category->id,
            'schema' => $schema,
            'financial_config' => $financialConfig,
        ]);
    }

    /**
     * Generate auto form schema with locked system fields
     */
    private function generateAutoFormSchema(): array
    {
        return [
            'fields' => [
                // System Fields (Locked - cannot be removed/modified by user)
                [
                    'name' => 'name',
                    'type' => 'text',
                    'label' => 'Name',
                    'locked' => true,
                    'required' => true,
                    'system' => true,
                    'order' => 1
                ],
                [
                    'name' => 'currency',
                    'type' => 'currency',
                    'label' => 'Currency',
                    'locked' => true,
                    'required' => true,
                    'system' => true,
                    'order' => 2
                ],
                [
                    'name' => 'payment_status',
                    'type' => 'payment_status',
                    'label' => 'Payment Status',
                    'locked' => true,
                    'required' => true,
                    'system' => true,
                    'order' => 3
                ],
                [
                    'name' => 'amount',
                    'type' => 'number',
                    'label' => 'Amount',
                    'locked' => true,
                    'required' => true,
                    'system' => true,
                    'order' => 4
                ],
                [
                    'name' => 'date',
                    'type' => 'date',
                    'label' => 'Date',
                    'locked' => true,
                    'required' => true,
                    'system' => true,
                    'order' => 5
                ]
            ]
        ];
    }

    /**
     * Generate automatic financial config for dashboard
     */
    private function generateFinancialConfig(): array
    {
        return [
            'amount_field' => 'amount',
            'currency_field' => 'currency',
            'status_field' => 'payment_status',
            'paid_value' => 'paid'
        ];
    }

    /**
     * Handle the MaterialCategory "deleted" event.
     * Clean up associated form
     */
    public function deleted(MaterialCategory $category)
    {
        // Delete associated form when category is deleted
        CategoryForm::where('category_id', $category->id)->delete();
    }
}
