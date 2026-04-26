<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartyPayment extends Model
{
    protected $fillable = [
        'party_id',
        'amount',
        'currency',
        'payment_date',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public static function getTotalBalanceByCurrency(): array
    {
        $balances = [];
        
        $payments = self::all();
        foreach ($payments as $payment) {
            if (!isset($balances[$payment->currency])) {
                $balances[$payment->currency] = 0;
            }
            $balances[$payment->currency] += $payment->amount;
        }
        
        return $balances;
    }
}
