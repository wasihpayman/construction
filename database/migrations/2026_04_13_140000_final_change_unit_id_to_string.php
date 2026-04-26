<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Force change unit_id to VARCHAR using raw SQL - final attempt
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::statement('ALTER TABLE sales DROP FOREIGN KEY IF EXISTS sales_unit_id_foreign');
            DB::statement('ALTER TABLE sales MODIFY COLUMN unit_id VARCHAR(255) NOT NULL');
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } catch (\Exception $e) {
            // If the above fails, try a different approach
            DB::statement('ALTER TABLE sales ADD COLUMN unit_identifier VARCHAR(255) NULL AFTER unit_id');
            DB::statement('UPDATE sales SET unit_identifier = CAST(unit_id AS CHAR) WHERE unit_identifier IS NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Try to revert back to BIGINT if possible
        try {
            DB::statement('ALTER TABLE sales MODIFY COLUMN unit_id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE sales ADD CONSTRAINT sales_unit_id_foreign FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE');
        } catch (\Exception $e) {
            // If we added unit_identifier column, drop it
            DB::statement('ALTER TABLE sales DROP COLUMN IF EXISTS unit_identifier');
        }
    }
};
