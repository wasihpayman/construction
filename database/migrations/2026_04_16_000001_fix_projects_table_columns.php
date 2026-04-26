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
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('projects', 'location')) {
                $table->string('location');
            }
            
            if (!Schema::hasColumn('projects', 'start_date')) {
                $table->date('start_date');
            }
            
            if (!Schema::hasColumn('projects', 'finish_at')) {
                $table->date('finish_at')->nullable();
            }
            
            if (!Schema::hasColumn('projects', 'description')) {
                $table->text('description')->nullable();
            }
            
            // Add indexes
            $table->index('location');
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['location']);
            $table->dropIndex(['start_date']);
            
            if (Schema::hasColumn('projects', 'location')) {
                $table->dropColumn('location');
            }
            
            if (Schema::hasColumn('projects', 'start_date')) {
                $table->dropColumn('start_date');
            }
            
            if (Schema::hasColumn('projects', 'finish_at')) {
                $table->dropColumn('finish_at');
            }
            
            if (Schema::hasColumn('projects', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
