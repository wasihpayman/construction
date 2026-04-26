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
        Schema::table('unit_sales', function (Blueprint $table) {
            // Remove client_id foreign key and column

            // Add buyer fields
            $table->string('buyer_name')->after('unit_id');
            $table->string('buyer_phone')->nullable()->after('buyer_name');
            $table->string('buyer_email')->nullable()->after('buyer_phone');
            $table->text('buyer_address')->nullable()->after('buyer_email');
            $table->string('buyer_national_id')->nullable()->after('buyer_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_sales', function (Blueprint $table) {
            // Remove buyer fields
            $table->dropColumn('buyer_name');
            $table->dropColumn('buyer_phone');
            $table->dropColumn('buyer_email');
            $table->dropColumn('buyer_address');
            $table->dropColumn('buyer_national_id');

            // Add back client_id
            $table->foreignId('client_id')
                ->constrained()
                ->cascadeOnDelete();
        });
    }
};
