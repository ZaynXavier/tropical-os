<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Insert Super Admin User
        $userId = DB::table('users')->insertGetId([
            'uuid' => (string) Str::uuid(),
            'name' => 'Super Admin Tropical Garden',
            'email' => 'tropicalgardenresto@tropicalgarden.com',
            'password' => Hash::make('tropical2026'),
            'role' => 'OWNER',
            'division' => 'EXECUTIVE',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert Super Admin Employee Profile
        DB::table('employees')->insert([
            'uuid' => (string) Str::uuid(),
            'user_id' => $userId,
            'employee_code' => 'TG-ADM-001',
            'full_name' => 'Super Admin Tropical Garden',
            'nickname' => 'Super Admin',
            'email' => 'tropicalgardenresto@tropicalgarden.com',
            'phone' => '+62 811-0000-001',
            'gender' => 'MALE',
            'employment_status' => 'PERMANENT',
            'join_date' => now()->toDateString(),
            'department' => 'Executive',
            'primary_position' => 'Super Admin & Owner',
            'access_level' => 'OWNER',
            'status' => 'ACTIVE',
            'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=TropicalAdmin',
            'notes' => 'Akun Master Super Admin Tropical Garden Resto untuk pengujian dan kontrol penuh sistem.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
