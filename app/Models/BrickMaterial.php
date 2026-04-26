<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BrickMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'bill_number',
        'quantity',
        'price_per_piece',
        'total_price',
        'amount',
        'date',
        'currency',
        'payment_status',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'integer',
        'price_per_piece' => 'decimal:2',
        'total_price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class);
    }
}
