<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'title',
        'amount',
        'currency',
        'description',
        'details',
        'date',
        'purpose',
        'authorized_by',
        'bill_num',
        'paid_by',
    ];
}