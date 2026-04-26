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
        // Add project_id to main materials table
        Schema::table('materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });

        // Add project_id to rebar_materials table
        Schema::table('rebar_materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });

        // Add project_id to gravel_materials table
        Schema::table('gravel_materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });

        // Add project_id to sand_materials table
        Schema::table('sand_materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });

        // Add project_id to stone_materials table
        Schema::table('stone_materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });

        // Add project_id to brick_materials table
        Schema::table('brick_materials', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove project_id from all material tables
        $tables = ['materials', 'rebar_materials', 'gravel_materials', 'sand_materials', 'stone_materials', 'brick_materials'];
        
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropForeign(['project_id']);
                $table->dropIndex(['project_id']);
                $table->dropColumn('project_id');
            });
        }
    }
};
