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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('recipe_code', 30)->unique();
            $table->string('name', 150);
            $table->enum('category', [
                'MAIN_COURSE',
                'APPETIZER',
                'DESSERT',
                'BEVERAGE_COFFEE',
                'BEVERAGE_NON_COFFEE',
                'SEMI_FINISHED_SAUCE',
                'SEMI_FINISHED_PREP'
            ]);
            $table->foreignId('station_id')->constrained('operational_stations');
            $table->unsignedInteger('serving_portion')->default(1);
            $table->decimal('selling_price', 15, 2)->default(0.00);
            $table->decimal('theoretical_cost', 15, 2)->default(0.00);
            $table->decimal('food_cost_percentage', 5, 2)->default(0.00);
            $table->decimal('target_food_cost_percentage', 5, 2)->default(32.00);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained('recipes')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items');
            $table->decimal('quantity', 12, 4);
            $table->string('unit', 20);
            $table->decimal('yield_percentage', 5, 2)->default(100.00);
            $table->decimal('cost_allocation', 15, 2)->default(0.00);
        });

        Schema::create('production_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number', 30)->unique();
            $table->foreignId('recipe_id')->constrained('recipes');
            $table->decimal('planned_yield', 12, 4);
            $table->decimal('actual_yield', 12, 4);
            $table->decimal('variance_quantity', 12, 4)->default(0.0000);
            $table->decimal('total_cost', 15, 2);
            $table->decimal('unit_cost', 15, 2);
            $table->enum('status', ['PLANNED', 'IN_PREP', 'COOKING', 'COMPLETED', 'FAILED'])->default('COMPLETED');
            $table->foreignId('prepared_by')->constrained('employees');
            $table->foreignId('verified_by')->nullable()->constrained('employees');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_batches');
        Schema::dropIfExists('recipe_ingredients');
        Schema::dropIfExists('recipes');
    }
};
