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
        Schema::create('material_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('name'); // Material name or description
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('AFN');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->date('date')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Extra data
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('category_id')->references('id')->on('material_categories')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index(['category_id', 'payment_status']);
            $table->index(['currency', 'payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_submissions');
    }
};
