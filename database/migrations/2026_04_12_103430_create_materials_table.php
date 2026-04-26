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
    Schema::create('materials', function (Blueprint $table) {

        $table->id();

        $table->string('name');
        $table->string('unit')->nullable(); // kg, bag, ton
        $table->decimal('price_per_unit', 10, 2)->default(0);

        $table->text('description')->nullable();

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
