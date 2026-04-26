<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gravel_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->string('bill_number');
            $table->date('date');
            $table->enum('truck_type', ['Mazda', 'Hino', 'Kamaz', 'Other'])->default('Other');
            $table->string('currency', 3)->default('AFN');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
            
            $table->foreign('category_id')->references('id')->on('material_categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gravel_materials');
    }
};
