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
    Schema::create('worker_payments', function (Blueprint $table) {

        $table->id();

        $table->foreignId('worker_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->foreignId('project_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->decimal('amount', 10, 2);

        $table->date('payment_date');

        $table->string('payment_type')->nullable(); // daily, weekly, monthly

        $table->text('description')->nullable();
                    $table->string('currency')->default('AFN');
            $table->dropColumn('payment_type');

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_payments');
    }
};
