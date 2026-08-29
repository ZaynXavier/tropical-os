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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('customer_code', 30)->unique();
            $table->string('name', 150);
            $table->string('phone', 25)->unique();
            $table->string('email', 150)->nullable();
            $table->enum('tier', ['REGULAR', 'VIP', 'VVIP', 'CORPORATE'])->default('REGULAR');
            $table->unsignedInteger('total_visits')->default(0);
            $table->decimal('total_spent', 15, 2)->default(0.00);
            $table->json('preferences')->nullable();
            $table->timestamps();
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reservation_code', 30)->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->string('customer_name', 150);
            $table->string('customer_phone', 25);
            $table->string('customer_email', 150)->nullable();
            $table->string('company_name', 150)->nullable();
            $table->enum('type', [
                'EVENT_GATHERING',
                'WEDDING',
                'BIRTHDAY',
                'VIP_TABLE',
                'CORPORATE_DINNER',
                'FAMILY_DINING'
            ])->default('FAMILY_DINING');
            $table->date('date');
            $table->time('time');
            $table->string('area', 100);
            $table->unsignedInteger('pax');
            $table->decimal('estimated_value', 15, 2)->default(0.00);
            $table->decimal('down_payment', 15, 2)->default(0.00);
            $table->enum('payment_status', ['UNPAID', 'DP_PAID', 'PAID_FULL'])->default('UNPAID');
            $table->enum('status', ['WAITING_DP', 'RESERVED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])->default('CONFIRMED');
            $table->json('special_requests')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('pic_id')->constrained('employees');
            $table->string('menu_package', 100)->nullable();
            $table->timestamps();

            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('customers');
    }
};
