<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoneMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'bill_number',
        'amount',
        'date',
        'truck_type',
        'currency',
        'payment_status',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class);
    }
}
