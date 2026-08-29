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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->onDelete('set null');
            $table->string('employee_code', 30)->unique();
            $table->string('full_name', 150);
            $table->string('nickname', 50)->nullable();
            $table->string('email', 150)->unique();
            $table->string('phone', 25);
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->enum('employment_status', ['PERMANENT', 'CONTRACT', 'PROBATION', 'DAILY_WORKER'])->default('CONTRACT');
            $table->date('join_date');
            $table->string('department', 50);
            $table->string('primary_position', 100);
            $table->enum('access_level', ['OWNER', 'MANAGER', 'HEAD', 'SUPERVISOR', 'STAFF'])->default('STAFF');
            $table->json('additional_responsibilities')->nullable();
            $table->foreignId('supervisor_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->foreignId('manager_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->string('avatar_url', 500)->nullable();
            $table->enum('status', ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED'])->default('ACTIVE');
            $table->json('emergency_contact')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['department', 'status', 'access_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
