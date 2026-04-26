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
        Schema::table('sales', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['unit_id']);

            // Change unit_id column from integer to string
            $table->string('unit_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Change back to integer
            $table->unsignedBigInteger('unit_id')->change();

            // Re-add the foreign key constraint
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
        });
    }
};
