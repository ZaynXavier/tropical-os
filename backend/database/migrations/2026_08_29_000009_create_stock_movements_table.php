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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('restrict');
            $table->enum('movement_type', [
                'PURCHASE_RECEIVE',
                'PRODUCTION_USAGE',
                'PRODUCTION_YIELD',
                'WASTE_EXPIRED',
                'WASTE_DAMAGED',
                'WASTE_SPOILAGE',
                'STOCK_OPNAME_ADJUSTMENT',
                'TRANSFER_INTER_STATION'
            ]);
            $table->decimal('quantity', 12, 4);
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('total_cost', 15, 2);
            $table->string('reference_type', 50);
            $table->unsignedBigInteger('reference_id');
            $table->string('notes', 255)->nullable();
            $table->foreignId('created_by')->constrained('employees');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['inventory_item_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
