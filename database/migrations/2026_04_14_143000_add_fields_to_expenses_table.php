<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('details')->nullable();
            $table->date('expense_date')->nullable()->change();
            $table->string('purpose')->nullable();
            $table->string('authorized_by')->nullable();
            $table->string('bill_num')->nullable();
            $table->string('paid_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['details', 'date', 'purpose', 'authorized_by', 'bill_num', 'paid_by']);
        });
    }
};
