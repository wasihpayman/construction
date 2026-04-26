<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\WorkerPayment;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'hire_date',
        'phone_number',
        'status',
    ];

    protected $casts = [
        'hire_date' => 'date',
    ];

    public function payments()
    {
        return $this->hasMany(WorkerPayment::class);
    }
}