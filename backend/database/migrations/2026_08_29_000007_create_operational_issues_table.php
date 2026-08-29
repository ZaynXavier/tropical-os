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
        Schema::create('operational_issues', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('issue_number', 30)->unique();
            $table->string('title', 200);
            $table->text('description');
            $table->foreignId('area_id')->constrained('operational_areas');
            $table->foreignId('station_id')->constrained('operational_stations');
            $table->enum('category', ['EQUIPMENT', 'INVENTORY', 'FOOD_SAFETY', 'HYGIENE', 'GUEST_COMPLAINT', 'STAFFING', 'FACILITY', 'CASHIER_POS', 'OTHER']);
            $table->enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])->default('MEDIUM');
            $table->enum('status', ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'WAITING', 'ESCALATED', 'RESOLVED', 'VERIFIED', 'CLOSED'])->default('OPEN');
            $table->unsignedInteger('sla_minutes')->default(60);
            $table->timestamp('sla_deadline');
            $table->boolean('is_sla_breached')->default(false);
            $table->foreignId('reported_by')->constrained('employees');
            $table->foreignId('assigned_to')->nullable()->constrained('employees');
            $table->text('resolution')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('employees');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('employees');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'severity', 'is_sla_breached']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operational_issues');
    }
};
