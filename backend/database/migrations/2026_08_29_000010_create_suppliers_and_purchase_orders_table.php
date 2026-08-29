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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('supplier_code', 30)->unique();
            $table->string('name', 150);
            $table->string('contact_person', 100);
            $table->string('phone', 25);
            $table->string('email', 150)->nullable();
            $table->text('address');
            $table->string('payment_terms', 50)->default('COD');
            $table->unsignedInteger('lead_time_days')->default(1);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'BLOCKED'])->default('ACTIVE');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('po_number', 30)->unique();
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->date('order_date');
            $table->date('expected_delivery_date');
            $table->decimal('subtotal_amount', 15, 2)->default(0.00);
            $table->decimal('tax_amount', 15, 2)->default(0.00);
            $table->decimal('shipping_cost', 15, 2)->default(0.00);
            $table->decimal('grand_total', 15, 2)->default(0.00);
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'APPROVED_MGR', 'SENT_SUPPLIER', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED'])->default('DRAFT');
            $table->enum('payment_status', ['UNPAID', 'PARTIAL', 'PAID'])->default('UNPAID');
            $table->foreignId('created_by')->constrained('employees');
            $table->foreignId('approved_by')->nullable()->constrained('employees');
            $table->timestamps();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items');
            $table->decimal('ordered_quantity', 12, 4);
            $table->decimal('received_quantity', 12, 4)->default(0.0000);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
    }
};
