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
        Schema::table('units', function (Blueprint $table) {
            // Sales metadata fields
            $table->string('seller_name')->nullable()->after('status');
            $table->string('buyer_name')->nullable()->after('seller_name');
            $table->decimal('sale_price', 10, 2)->nullable()->after('buyer_name');
            $table->date('sold_date')->nullable()->after('sale_price');
            $table->text('sale_description')->nullable()->after('sold_date');
            
            // Ensure floor is not nullable for better data integrity
            $table->string('floor')->nullable(false)->change();
            
            // Add indexes for better query performance
            $table->index(['project_id', 'floor']);
            $table->index('status');
            $table->index('sold_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            // Remove sales metadata fields
            $table->dropColumn('seller_name');
            $table->dropColumn('buyer_name');
            $table->dropColumn('sale_price');
            $table->dropColumn('sold_date');
            $table->dropColumn('sale_description');
            
            // Revert floor to nullable
            $table->string('floor')->nullable()->change();
            
            // Remove indexes
            $table->dropIndex(['project_id', 'floor']);
            $table->dropIndex('status');
            $table->dropIndex('sold_date');
        });
    }
};
