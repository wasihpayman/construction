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
        Schema::table('projects', function (Blueprint $table) {
            // Rename project_name to name if it exists
            if (Schema::hasColumn('projects', 'project_name')) {
                $table->renameColumn('project_name', 'name');
            }
            
            // Add created_by column if it doesn't exist
            if (!Schema::hasColumn('projects', 'created_by')) {
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->index('created_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'name')) {
                $table->renameColumn('name', 'project_name');
            }
            
            if (Schema::hasColumn('projects', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropIndex(['created_by']);
                $table->dropColumn('created_by');
            }
        });
    }
};
