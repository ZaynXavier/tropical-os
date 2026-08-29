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
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('shift_code', 20)->unique();
            $table->string('name', 50);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('grace_period_minutes')->default(15);
            $table->boolean('cross_day')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['SCHEDULED', 'CONFIRMED', 'SWAPPED', 'CANCELLED'])->default('SCHEDULED');
            $table->foreignId('swapped_with_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_schedules');
        Schema::dropIfExists('shifts');
    }
};
