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
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number', 30)->unique();
            $table->string('table_number', 20)->nullable();
            $table->unsignedInteger('guest_count')->default(1);
            $table->decimal('subtotal_amount', 15, 2)->default(0.00);
            $table->decimal('discount_amount', 15, 2)->default(0.00);
            $table->decimal('service_charge_amount', 15, 2)->default(0.00);
            $table->decimal('tax_amount', 15, 2)->default(0.00);
            $table->decimal('total_amount', 15, 2)->default(0.00);
            $table->enum('order_type', ['DINE_IN', 'TAKE_AWAY', 'RESERVATION_EVENT', 'DELIVERY'])->default('DINE_IN');
            $table->enum('status', ['OPEN', 'ORDER_SENT', 'BILL_PRINTED', 'PAID', 'VOID', 'REFUNDED'])->default('OPEN');
            $table->foreignId('cashier_id')->constrained('employees');
            $table->timestamps();

            $table->index(['created_at', 'status']);
        });

        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained('sales_orders')->onDelete('cascade');
            $table->foreignId('recipe_id')->constrained('recipes');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('subtotal_price', 15, 2);
            $table->decimal('subtotal_cost', 15, 2);
            $table->string('notes', 255)->nullable();
        });

        Schema::create('sales_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained('sales_orders')->onDelete('cascade');
            $table->enum('payment_method', [
                'CASH',
                'QRIS_STATIC',
                'QRIS_DYNAMIC',
                'EDC_BCA_DEBIT',
                'EDC_MANDIRI_DEBIT',
                'CREDIT_CARD',
                'BANK_TRANSFER'
            ]);
            $table->decimal('amount_paid', 15, 2);
            $table->decimal('change_amount', 15, 2)->default(0.00);
            $table->string('reference_no', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_payments');
        Schema::dropIfExists('sales_order_items');
        Schema::dropIfExists('sales_orders');
    }
};
