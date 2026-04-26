<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'position',
        'start_date',
        'salary',
        'phone',
        'address',
        'description',
        'tazkira_file',
        'contract_file',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'salary' => 'decimal:2',
    ];

    public function salaryPayments()
    {
        return $this->hasMany(EmployeeSalaryPayment::class);
    }

    public function getSalaryPaymentsCountAttribute()
    {
        return $this->salaryPayments()->count();
    }

    public function getTotalPaidSalaryAttribute()
    {
        $payments = $this->salaryPayments;
        $total = $payments->sum('amount');
        \Log::info('Employee ' . $this->id . ' has ' . $payments->count() . ' payments totaling: ' . $total);
        return $total;
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTazkiraUrlAttribute()
    {
        return $this->tazkira_file ? asset('storage/' . $this->tazkira_file) : null;
    }

    public function getContractUrlAttribute()
    {
        return $this->contract_file ? asset('storage/' . $this->contract_file) : null;
    }

    public function getTazkiraTypeAttribute()
    {
        return $this->tazkira_file ? strtolower(pathinfo($this->tazkira_file, PATHINFO_EXTENSION)) : null;
    }

    public function getContractTypeAttribute()
    {
        return $this->contract_file ? strtolower(pathinfo($this->contract_file, PATHINFO_EXTENSION)) : null;
    }
}
