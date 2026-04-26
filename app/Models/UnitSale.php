<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Unit;
use App\Models\Client;

class UnitSale extends Model
{
    protected $fillable = [
        'unit_id',
        'client_id',
        'sale_price',
        'sale_date',
        'payment_method',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}