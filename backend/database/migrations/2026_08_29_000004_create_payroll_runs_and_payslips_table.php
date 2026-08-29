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
        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->string('period_code', 20)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('total_employees')->default(24);
            $table->decimal('total_gross_amount', 15, 2)->default(0.00);
            $table->decimal('total_deductions_amount', 15, 2)->default(0.00);
            $table->decimal('total_net_amount', 15, 2)->default(0.00);
            $table->enum('status', ['DRAFT', 'CALCULATED', 'APPROVED_GM', 'LOCKED_PAID'])->default('DRAFT');
            $table->foreignId('processed_by')->constrained('employees');
            $table->foreignId('approved_by')->nullable()->constrained('employees');
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->decimal('basic_salary', 15, 2)->default(0.00);
            $table->json('allowances')->nullable();
            $table->decimal('overtime_pay', 15, 2)->default(0.00);
            $table->decimal('incentives', 15, 2)->default(0.00);
            $table->decimal('gross_pay', 15, 2)->default(0.00);
            $table->json('deductions')->nullable();
            $table->decimal('total_deductions', 15, 2)->default(0.00);
            $table->decimal('net_pay', 15, 2)->default(0.00);
            $table->enum('payment_status', ['PENDING', 'TRANSFERRED', 'CASH_PAID'])->default('PENDING');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
    }
};
