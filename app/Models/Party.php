<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Party extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'description',
        'date',
        'amount',
        'currency',
        'project_id',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(PartyPayment::class);
    }

    public function getTotalBalanceByCurrency(): array
    {
        $balances = [];
        
        foreach ($this->payments as $payment) {
            if (!isset($balances[$payment->currency])) {
                $balances[$payment->currency] = 0;
            }
            $balances[$payment->currency] += $payment->amount;
        }
        
        return $balances;
    }

    public function getTotalAmount(): float
    {
        return $this->payments()->sum('amount');
    }
}
