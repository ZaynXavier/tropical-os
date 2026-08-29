<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'shift_code' => 'S-PAGI',
                'name' => 'Shift Pagi (Opening & Lunch)',
                'start_time' => '08:00:00',
                'end_time' => '16:30:00',
                'grace_period_minutes' => 15,
                'cross_day' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shift_code' => 'S-SIANG',
                'name' => 'Shift Siang (Dinner & Closing)',
                'start_time' => '15:00:00',
                'end_time' => '23:00:00',
                'grace_period_minutes' => 15,
                'cross_day' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shift_code' => 'S-FULL',
                'name' => 'Shift Full Day (Weekend & Event)',
                'start_time' => '09:00:00',
                'end_time' => '21:30:00',
                'grace_period_minutes' => 15,
                'cross_day' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('shifts')->insert($shifts);
    }
}
