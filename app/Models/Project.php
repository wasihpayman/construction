<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Expense;
use App\Models\WorkerPayment;
use App\Models\MaterialPurchase;
use App\Models\Unit;
use App\Models\Employee;
use App\Models\PartyPayment;
use App\Models\Bill;
use App\Models\DocumentBank;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'start_date',
        'finish_at',
        'description',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'finish_at' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function workerPayments()
    {
        return $this->hasMany(WorkerPayment::class);
    }

    public function materialPurchases()
    {
        return $this->hasMany(MaterialPurchase::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function partyPayments()
    {
        return $this->hasMany(PartyPayment::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function documentBanks()
    {
        return $this->hasMany(DocumentBank::class);
    }
}