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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('sku', 50)->unique();
            $table->string('name', 150);
            $table->enum('category', ['MEAT', 'POULTRY', 'SEAFOOD', 'VEGETABLE', 'DAIRY', 'DRY_GOODS', 'BEVERAGE', 'PACKAGING', 'CLEANING']);
            $table->string('unit', 20);
            $table->decimal('current_stock', 12, 4)->default(0.0000);
            $table->decimal('minimum_stock', 12, 4)->default(0.0000);
            $table->decimal('maximum_stock', 12, 4)->default(0.0000);
            $table->decimal('reorder_point', 12, 4)->default(0.0000);
            $table->decimal('average_cost', 15, 2)->default(0.00);
            $table->decimal('last_purchase_cost', 15, 2)->default(0.00);
            $table->string('storage_location', 100);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category', 'current_stock']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
