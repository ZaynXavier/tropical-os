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
        Schema::create('operational_areas', function (Blueprint $table) {
            $table->id();
            $table->string('area_code', 20)->unique();
            $table->string('name', 100);
            $table->string('department', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('operational_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('operational_areas')->onDelete('cascade');
            $table->string('station_code', 30)->unique();
            $table->string('name', 100);
            $table->unsignedInteger('min_staff')->default(1);
            $table->unsignedInteger('recommended_staff')->default(2);
            $table->enum('status', ['ACTIVE', 'PAUSED', 'CLOSED'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operational_stations');
        Schema::dropIfExists('operational_areas');
    }
};
