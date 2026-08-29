<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Areas
        $kitchenAreaId = DB::table('operational_areas')->insertGetId([
            'area_code' => 'AREA-KIT',
            'name' => 'Kitchen & Hot Line',
            'department' => 'Kitchen',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $barAreaId = DB::table('operational_areas')->insertGetId([
            'area_code' => 'AREA-BAR',
            'name' => 'Bar & Beverage Counter',
            'department' => 'Bar',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $serviceAreaId = DB::table('operational_areas')->insertGetId([
            'area_code' => 'AREA-SVC',
            'name' => 'Service & Floor Dining',
            'department' => 'Service',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierAreaId = DB::table('operational_areas')->insertGetId([
            'area_code' => 'AREA-CSH',
            'name' => 'Cashier POS Station',
            'department' => 'Operations',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Stations
        $stations = [
            [
                'area_id' => $kitchenAreaId,
                'station_code' => 'STN-KIT-HOT',
                'name' => 'Stasiun Dapur Panas (Wok & Grill)',
                'min_staff' => 2,
                'recommended_staff' => 3,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'area_id' => $kitchenAreaId,
                'station_code' => 'STN-KIT-PREP',
                'name' => 'Stasiun Prep & Marinasi',
                'min_staff' => 1,
                'recommended_staff' => 2,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'area_id' => $barAreaId,
                'station_code' => 'STN-BAR-ESPRESSO',
                'name' => 'Stasiun Espresso & Coffee Bar',
                'min_staff' => 1,
                'recommended_staff' => 2,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'area_id' => $serviceAreaId,
                'station_code' => 'STN-SVC-FLOOR',
                'name' => 'Stasiun Floor Dining & Gazebo VIP',
                'min_staff' => 2,
                'recommended_staff' => 4,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'area_id' => $cashierAreaId,
                'station_code' => 'STN-CSH-MAIN',
                'name' => 'Stasiun Kasir Utama POS',
                'min_staff' => 1,
                'recommended_staff' => 1,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('operational_stations')->insert($stations);
    }
}
