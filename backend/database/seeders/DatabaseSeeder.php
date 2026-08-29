<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Bersih dari SEMUA data dummy — hanya menyisakan Akun Super Admin & Struktur Dasar Shift/Station.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
            ShiftSeeder::class,
            StationSeeder::class,
        ]);
    }
}
