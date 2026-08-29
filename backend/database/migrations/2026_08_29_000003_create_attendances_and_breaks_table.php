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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->onDelete('set null');
            $table->date('date');
            $table->timestamp('clock_in_time')->nullable();
            $table->timestamp('clock_out_time')->nullable();
            $table->enum('status', ['PRESENT', 'LATE', 'ABSENT', 'LEAVE', 'OFF', 'INCOMPLETE'])->default('PRESENT');
            $table->unsignedInteger('late_duration_minutes')->default(0);
            $table->decimal('clock_in_latitude', 10, 8)->nullable();
            $table->decimal('clock_in_longitude', 11, 8)->nullable();
            $table->decimal('clock_in_distance_meters', 8, 2)->nullable();
            $table->string('clock_in_photo_url', 500)->nullable();
            $table->decimal('clock_out_latitude', 10, 8)->nullable();
            $table->decimal('clock_out_longitude', 11, 8)->nullable();
            $table->string('clock_out_photo_url', 500)->nullable();
            $table->enum('location_status', ['VALID', 'OUTSIDE_AREA', 'LOW_ACCURACY', 'UNAVAILABLE'])->default('VALID');
            $table->boolean('face_verified')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'date']);
            $table->index(['date', 'status']);
        });

        Schema::create('breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->constrained('attendances')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->enum('break_type', ['ISHOMA', 'PRAYER', 'MEAL', 'EMERGENCY'])->default('ISHOMA');
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->enum('status', ['ACTIVE', 'COMPLETED', 'OVERSTAY'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breaks');
        Schema::dropIfExists('attendances');
    }
};
