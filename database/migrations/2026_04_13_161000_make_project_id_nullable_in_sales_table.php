<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            // Use raw SQL to make project_id nullable in sales table
            DB::statement('ALTER TABLE sales DROP FOREIGN KEY IF EXISTS sales_project_id_foreign');
            DB::statement('ALTER TABLE sales MODIFY project_id BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE sales ADD CONSTRAINT sales_project_id_foreign FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE');
        } catch (\Exception $e) {
            // If above fails, try without the specific constraint name
            DB::statement('ALTER TABLE sales MODIFY project_id BIGINT UNSIGNED NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE sales DROP FOREIGN KEY IF EXISTS sales_project_id_foreign');
            DB::statement('ALTER TABLE sales MODIFY project_id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE sales ADD CONSTRAINT sales_project_id_foreign FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE');
        } catch (\Exception $e) {
            // If above fails, try without the specific constraint name
            DB::statement('ALTER TABLE sales MODIFY project_id BIGINT UNSIGNED NOT NULL');
        }
    }
};
