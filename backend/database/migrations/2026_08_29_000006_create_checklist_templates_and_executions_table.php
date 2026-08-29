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
        Schema::create('checklist_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('operational_stations')->onDelete('cascade');
            $table->string('template_code', 30)->unique();
            $table->string('title', 150);
            $table->enum('shift_type', ['PAGI', 'SIANG', 'MALAM', 'ALL'])->default('ALL');
            $table->enum('category', ['OPENING', 'RUNNING', 'CLOSING', 'HYGIENE', 'SAFETY']);
            $table->boolean('requires_verification')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('checklist_template_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_template_id')->constrained('checklist_templates')->onDelete('cascade');
            $table->unsignedInteger('sequence')->default(1);
            $table->string('task_name', 255);
            $table->text('standard_description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->boolean('requires_photo')->default(false);
            $table->boolean('requires_numeric_value')->default(false);
            $table->string('unit', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('checklist_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_template_id')->constrained('checklist_templates');
            $table->foreignId('checklist_template_item_id')->constrained('checklist_template_items');
            $table->foreignId('employee_id')->constrained('employees');
            $table->date('date');
            $table->enum('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'FAILED', 'SKIPPED'])->default('PENDING');
            $table->decimal('numeric_value', 10, 2)->nullable();
            $table->text('note')->nullable();
            $table->string('evidence_photo_url', 500)->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('employees');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_executions');
        Schema::dropIfExists('checklist_template_items');
        Schema::dropIfExists('checklist_templates');
    }
};
