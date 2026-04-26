<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'buyer_name',
        'buyer_phone',
        'buyer_email',
        'buyer_address',
        'buyer_national_id',
        'seller_name',
        'seller_phone',
        'seller_email',
        'seller_address',
        'sale_price',
        'total_price',
        'down_payment',
        'monthly_payment',
        'number_of_months',
        'total_months_paid',
        'payment_method',
        'sold_date',
        'sale_description',
        'project_id'
    ];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'monthly_payment' => 'decimal:2',
        'sold_date' => 'date',
    ];

    /**
     * Get the unit that belongs to the sale.
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the payments for the sale.
     */
    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    /**
     * Get the documents for the sale.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the project that owns the sale.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
