<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'amount',
        'payment_date',
        'payment_type',
        'currency',
        'description',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}