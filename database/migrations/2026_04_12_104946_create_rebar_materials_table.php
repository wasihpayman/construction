<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rebar_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->decimal('quantity', 10, 2);
            $table->string('bill_number');
            $table->decimal('weight', 10, 2);
            $table->date('date');
            $table->string('currency', 3)->default('AFN');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
            
            $table->foreign('category_id')->references('id')->on('material_categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rebar_materials');
    }
};
