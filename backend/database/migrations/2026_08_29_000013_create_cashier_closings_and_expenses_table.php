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
        Schema::create('cashier_closings', function (Blueprint $table) {
            $table->id();
            $table->string('closing_number', 30)->unique();
            $table->foreignId('shift_id')->constrained('shifts');
            $table->foreignId('cashier_id')->constrained('employees');
            $table->decimal('opening_cash_float', 15, 2)->default(500000.00);
            $table->decimal('system_cash_sales', 15, 2);
            $table->decimal('system_non_cash_sales', 15, 2);
            $table->decimal('actual_physical_cash', 15, 2);
            $table->decimal('cash_variance', 15, 2)->default(0.00);
            $table->unsignedInteger('total_transactions');
            $table->enum('status', ['SUBMITTED', 'VERIFIED_SUPERVISOR', 'AUDITED_FINANCE', 'DISCREPANCY'])->default('SUBMITTED');
            $table->foreignId('verified_by')->nullable()->constrained('employees');
            $table->foreignId('audited_by')->nullable()->constrained('employees');
            $table->timestamps();
        });

        Schema::create('operational_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_number', 30)->unique();
            $table->date('expense_date');
            $table->enum('category', [
                'ELECTRICITY',
                'WATER',
                'GAS_LPG',
                'INTERNET_TELECOM',
                'CLEANING_SUPPLIES',
                'MAINTENANCE_REPAIR',
                'MARKETING_ADS',
                'PRINTING_ADMIN',
                'TRANSPORT_FUEL',
                'OTHER_OPEX'
            ]);
            $table->string('description', 255);
            $table->decimal('amount', 15, 2);
            $table->enum('paid_from_account', ['PETTY_CASH', 'BANK_BCA_OPERASIONAL', 'BANK_MANDIRI_UTAMA']);
            $table->string('receipt_photo_url', 500)->nullable();
            $table->foreignId('paid_by')->constrained('employees');
            $table->foreignId('approved_by')->nullable()->constrained('employees');
            $table->timestamps();

            $table->index(['expense_date', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operational_expenses');
        Schema::dropIfExists('cashier_closings');
    }
};
