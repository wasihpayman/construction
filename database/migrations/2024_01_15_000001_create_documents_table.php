<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Temporarily disabled - will be fixed later
        // Schema::create('documents', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('sale_id')->constrained()->onDelete('cascade');
        //     $table->string('category'); // national_id, contract, payment_proof, other_documents
        //     $table->string('filename');
        //     $table->string('original_name');
        //     $table->string('path');
        //     $table->string('mime_type')->nullable();
        //     $table->integer('size')->nullable();
        //     $table->timestamps();
        //     
        //     $table->index(['sale_id', 'category']);
        // });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};
