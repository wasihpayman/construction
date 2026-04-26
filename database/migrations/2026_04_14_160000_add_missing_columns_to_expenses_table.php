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
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('expenses', 'date')) {
                $table->date('date')->nullable();
            }
            if (!Schema::hasColumn('expenses', 'details')) {
                $table->text('details')->nullable();
            }
            if (!Schema::hasColumn('expenses', 'purpose')) {
                $table->string('purpose')->nullable();
            }
            if (!Schema::hasColumn('expenses', 'authorized_by')) {
                $table->string('authorized_by')->nullable();
            }
            if (!Schema::hasColumn('expenses', 'bill_num')) {
                $table->string('bill_num')->nullable();
            }
            if (!Schema::hasColumn('expenses', 'paid_by')) {
                $table->string('paid_by')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['date', 'details', 'purpose', 'authorized_by', 'bill_num', 'paid_by']);
        });
    }
};
