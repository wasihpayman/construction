<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EmployeeSalaryPayment;
use App\Models\Employee;

class UpdateSalaryPaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing salary payments to have the employee's salary as amount
        $payments = EmployeeSalaryPayment::whereNull('amount')->get();
        
        foreach ($payments as $payment) {
            $employee = Employee::find($payment->employee_id);
            if ($employee) {
                $payment->amount = $employee->salary;
                $payment->save();
                echo "Updated payment {$payment->id} with amount {$employee->salary}\n";
            }
        }
    }
}
