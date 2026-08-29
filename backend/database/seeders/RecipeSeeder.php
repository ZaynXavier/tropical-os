<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        $stationHotLine = DB::table('operational_stations')->where('station_code', 'STN-KIT-HOT')->first();
        $stationEspresso = DB::table('operational_stations')->where('station_code', 'STN-BAR-ESPRESSO')->first();

        $itemTenderloin = DB::table('inventory_items')->where('sku', 'RAW-MEAT-TENDERLOIN-01')->first();
        $itemRice = DB::table('inventory_items')->where('sku', 'RAW-DRY-RICE-PANDAN-01')->first();
        $itemCoffee = DB::table('inventory_items')->where('sku', 'RAW-BEV-ESPRESSO-BLEND-01')->first();
        $itemMilk = DB::table('inventory_items')->where('sku', 'RAW-BEV-FRESH-MILK-01')->first();

        // 1. Menu Steak Tenderloin Tropical
        $recipeSteakId = DB::table('recipes')->insertGetId([
            'uuid' => (string) Str::uuid(),
            'recipe_code' => 'RCP-FOOD-STEAK-01',
            'name' => 'Tropical Tenderloin Steak 200g',
            'category' => 'MAIN_COURSE',
            'station_id' => $stationHotLine ? $stationHotLine->id : 1,
            'serving_portion' => 1,
            'selling_price' => 145000.00,
            'theoretical_cost' => 38500.00,
            'food_cost_percentage' => 26.55,
            'target_food_cost_percentage' => 30.00,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($itemTenderloin) {
            DB::table('recipe_ingredients')->insert([
                'recipe_id' => $recipeSteakId,
                'inventory_item_id' => $itemTenderloin->id,
                'quantity' => 0.2000,
                'unit' => 'Kg',
                'yield_percentage' => 95.00,
                'cost_allocation' => 30500.00,
            ]);
        }

        // 2. Menu Iced Aren Latte
        $recipeCoffeeId = DB::table('recipes')->insertGetId([
            'uuid' => (string) Str::uuid(),
            'recipe_code' => 'RCP-BEV-LATTE-01',
            'name' => 'Iced Palm Sugar Latte 16oz',
            'category' => 'BEVERAGE_COFFEE',
            'station_id' => $stationEspresso ? $stationEspresso->id : 3,
            'serving_portion' => 1,
            'selling_price' => 32000.00,
            'theoretical_cost' => 6800.00,
            'food_cost_percentage' => 21.25,
            'target_food_cost_percentage' => 25.00,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($itemCoffee && $itemMilk) {
            DB::table('recipe_ingredients')->insert([
                [
                    'recipe_id' => $recipeCoffeeId,
                    'inventory_item_id' => $itemCoffee->id,
                    'quantity' => 0.0180,
                    'unit' => 'Kg',
                    'yield_percentage' => 100.00,
                    'cost_allocation' => 3330.00,
                ],
                [
                    'recipe_id' => $recipeCoffeeId,
                    'inventory_item_id' => $itemMilk->id,
                    'quantity' => 0.1500,
                    'unit' => 'Pack',
                    'yield_percentage' => 100.00,
                    'cost_allocation' => 2775.00,
                ],
            ]);
        }
    }
}
