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
        // Add amount column to all material tables
        Schema::table('rebar_materials', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('weight');
        });

        Schema::table('gravel_materials', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('bill_number');
        });

        Schema::table('sand_materials', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('bill_number');
        });

        Schema::table('stone_materials', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('bill_number');
        });

        Schema::table('brick_materials', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('total_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove amount column from all material tables
        Schema::table('rebar_materials', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('gravel_materials', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('sand_materials', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('stone_materials', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('brick_materials', function (Blueprint $table) {
            $table->dropColumn('amount');
        });
    }
};
