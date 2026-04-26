<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoryForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'schema',
    ];

    protected $casts = [
        'schema' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MaterialCategory::class, 'category_id');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(CategoryEntry::class, 'form_id');
    }

    public function getFieldsAttribute()
    {
        return $this->schema['fields'] ?? [];
    }

    public function validateEntry(array $data): array
    {
        $errors = [];
        $fields = $this->fields;

        foreach ($fields as $field) {
            $fieldName = $field['name'];

            // Check required fields
            if (isset($field['required']) && $field['required'] && !isset($data[$fieldName])) {
                $errors[$fieldName] = "The {$fieldName} field is required.";
                continue;
            }

            // Skip validation if field is not provided and not required
            if (!isset($data[$fieldName])) {
                continue;
            }

            // Type validation
            $value = $data[$fieldName];

            switch ($field['type']) {
                case 'number':
                    if (!is_numeric($value)) {
                        $errors[$fieldName] = "The {$fieldName} must be a number.";
                    }
                    if (isset($field['min']) && $value < $field['min']) {
                        $errors[$fieldName] = "The {$fieldName} must be at least {$field['min']}.";
                    }
                    if (isset($field['max']) && $value > $field['max']) {
                        $errors[$fieldName] = "The {$fieldName} must not exceed {$field['max']}.";
                    }
                    break;

                case 'text':
                    if (isset($field['min_length']) && strlen($value) < $field['min_length']) {
                        $errors[$fieldName] = "The {$fieldName} must be at least {$field['min_length']} characters.";
                    }
                    if (isset($field['max_length']) && strlen($value) > $field['max_length']) {
                        $errors[$fieldName] = "The {$fieldName} must not exceed {$field['max_length']} characters.";
                    }
                    break;

                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$fieldName] = "The {$fieldName} must be a valid email address.";
                    }
                    break;

                case 'select':
                    if (isset($field['options'])) {
                        $validOptions = array_column($field['options'], 'value');
                        if (!in_array($value, $validOptions)) {
                            $errors[$fieldName] = "The {$fieldName} must be one of: " . implode(', ', $validOptions);
                        }
                    }
                    break;
            }
        }

        return $errors;
    }
}
