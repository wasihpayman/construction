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
    Schema::create('workers', function (Blueprint $table) {

        $table->id();

        $table->string('name');

        $table->foreignId('contractor_id')
            ->nullable()
            ->constrained()
            ->cascadeOnDelete();

        $table->string('role')->nullable();

        $table->string('phone_number')->nullable();

        $table->decimal('daily_wage', 10, 2)->default(0);

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
