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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            
            // Buyer Information
            $table->string('buyer_name');
            $table->string('buyer_phone');
            $table->string('buyer_email')->nullable();
            $table->text('buyer_address');
            $table->string('buyer_national_id');
            
            // Seller Information
            $table->string('seller_name')->nullable();
            $table->string('seller_phone')->nullable();
            $table->string('seller_email')->nullable();
            $table->text('seller_address')->nullable();
            
            // Sale Information
            $table->decimal('sale_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->date('sold_date');
            $table->text('sale_description')->nullable();
            
            // Payment Information
            $table->enum('payment_method', ['full', 'monthly'])->default('full');
            $table->decimal('down_payment', 10, 2)->nullable();
            $table->decimal('monthly_payment', 10, 2)->nullable();
            $table->integer('number_of_months')->nullable();
            $table->integer('total_months_paid')->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
