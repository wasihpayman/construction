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
    Schema::create('units', function (Blueprint $table) {

        $table->id();

        $table->foreignId('project_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->string('unit_number'); // مثل A-101

        $table->string('floor')->nullable();

        $table->decimal('area', 10, 2)->nullable();

        $table->decimal('price', 10, 2);

        $table->string('status')->default('available'); // available / sold

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
