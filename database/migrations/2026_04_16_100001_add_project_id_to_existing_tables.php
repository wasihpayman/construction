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
        // Only add project_id to tables that exist
        $existingTables = [
            'workers',
            'material_categories', 
            'materials',
            'parties',
            'party_payments',
            'employees',
            'document_banks'
        ];

        foreach ($existingTables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'project_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->foreignId('project_id')->nullable()->after('id')->constrained('projects')->cascadeOnDelete();
                    $table->index('project_id');
                });
            }
        }

        // Create project_models table for 3D models
        if (!Schema::hasTable('project_models')) {
            Schema::create('project_models', function (Blueprint $table) {
                $table->id();
                $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
                $table->string('file_path');
                $table->string('original_name');
                $table->string('file_type');
                $table->unsignedBigInteger('file_size');
                $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                
                $table->index('project_id');
                $table->index('uploaded_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop project_models table
        if (Schema::hasTable('project_models')) {
            Schema::dropIfExists('project_models');
        }

        // Remove project_id columns from existing tables
        $tables = ['workers', 'material_categories', 'materials', 'parties', 'party_payments', 'employees', 'document_banks'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'project_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['project_id']);
                    $table->dropIndex(['project_id']);
                    $table->dropColumn('project_id');
                });
            }
        }
    }
};
