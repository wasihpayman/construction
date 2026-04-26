<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RebarMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'quantity',
        'bill_number',
        'weight',
        'amount',
        'date',
        'currency',
        'payment_status',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'decimal:2',
        'weight' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class);
    }
}
