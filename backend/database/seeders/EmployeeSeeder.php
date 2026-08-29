<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $staffData = [
            // 1. Executive
            [
                'code' => 'TG-OWN-001',
                'name' => 'Tri Hermawanto',
                'email' => 'tri.hermawanto@tropicalgarden.id',
                'phone' => '+62 811-0001-001',
                'gender' => 'MALE',
                'status' => 'PERMANENT',
                'join_date' => '2023-01-01',
                'department' => 'Executive',
                'position' => 'Owner',
                'access_level' => 'OWNER',
                'role' => 'OWNER',
                'division' => 'EXECUTIVE',
            ],
            // 2. Management
            [
                'code' => 'TG-MGR-001',
                'name' => 'Heri Setiawan',
                'email' => 'heri.setiawan@tropicalgarden.id',
                'phone' => '+62 812-0002-002',
                'gender' => 'MALE',
                'status' => 'PERMANENT',
                'join_date' => '2023-01-15',
                'department' => 'Management',
                'position' => 'Manager',
                'access_level' => 'MANAGER',
                'role' => 'MANAGER',
                'division' => 'MANAGEMENT',
            ],
            // 3. Supervisor
            [
                'code' => 'TG-OPS-001',
                'name' => 'Putri Okta',
                'email' => 'putri.okta@tropicalgarden.id',
                'phone' => '+62 813-0003-003',
                'gender' => 'FEMALE',
                'status' => 'PERMANENT',
                'join_date' => '2023-02-01',
                'department' => 'Operations',
                'position' => 'Supervisor',
                'access_level' => 'SUPERVISOR',
                'role' => 'SUPERVISOR',
                'division' => 'OPERATIONS',
            ],
            // 4. Head Kitchen Pagi
            [
                'code' => 'TG-KIT-001',
                'name' => 'Andun',
                'email' => 'andun@tropicalgarden.id',
                'phone' => '+62 814-0004-004',
                'gender' => 'MALE',
                'status' => 'CONTRACT',
                'join_date' => '2023-03-01',
                'department' => 'Kitchen',
                'position' => 'Head Kitchen (Shift Pagi)',
                'access_level' => 'HEAD',
                'role' => 'HEAD',
                'division' => 'KITCHEN',
            ],
            // 5. Head Kitchen Sore
            [
                'code' => 'TG-KIT-002',
                'name' => 'Alfan',
                'email' => 'alfan@tropicalgarden.id',
                'phone' => '+62 814-0005-005',
                'gender' => 'MALE',
                'status' => 'CONTRACT',
                'join_date' => '2023-03-01',
                'department' => 'Kitchen',
                'position' => 'Head Kitchen (Shift Sore)',
                'access_level' => 'HEAD',
                'role' => 'HEAD',
                'division' => 'KITCHEN',
            ],
            // 6-11. Kitchen Crew
            [
                'code' => 'TG-KIT-003', 'name' => 'Rahmat', 'email' => 'rahmat@tropicalgarden.id',
                'phone' => '+62 814-0006-006', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-01', 'department' => 'Kitchen', 'position' => 'Cook Main Course',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            [
                'code' => 'TG-KIT-004', 'name' => 'Bayu', 'email' => 'bayu@tropicalgarden.id',
                'phone' => '+62 814-0007-007', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-01', 'department' => 'Kitchen', 'position' => 'Cook Grill & Seafood',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            [
                'code' => 'TG-KIT-005', 'name' => 'Fajar', 'email' => 'fajar@tropicalgarden.id',
                'phone' => '+62 814-0008-008', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-05-01', 'department' => 'Kitchen', 'position' => 'Cook Helper Pagi',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            [
                'code' => 'TG-KIT-006', 'name' => 'Bagus', 'email' => 'bagus@tropicalgarden.id',
                'phone' => '+62 814-0009-009', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-05-01', 'department' => 'Kitchen', 'position' => 'Cook Helper Sore',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            [
                'code' => 'TG-KIT-007', 'name' => 'Dimas', 'email' => 'dimas@tropicalgarden.id',
                'phone' => '+62 814-0010-010', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-06-01', 'department' => 'Kitchen', 'position' => 'Prep Cook Sambal & Marinasi',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            [
                'code' => 'TG-KIT-008', 'name' => 'Rian', 'email' => 'rian@tropicalgarden.id',
                'phone' => '+62 814-0011-011', 'gender' => 'MALE', 'status' => 'DAILY_WORKER',
                'join_date' => '2023-07-01', 'department' => 'Kitchen', 'position' => 'Dishwasher & Kitchen Steward',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'KITCHEN'
            ],
            // 12. Head Bar
            [
                'code' => 'TG-BAR-001', 'name' => 'Dina', 'email' => 'dina@tropicalgarden.id',
                'phone' => '+62 815-0012-012', 'gender' => 'FEMALE', 'status' => 'CONTRACT',
                'join_date' => '2023-03-15', 'department' => 'Bar', 'position' => 'Head Bar',
                'access_level' => 'HEAD', 'role' => 'HEAD', 'division' => 'BAR'
            ],
            [
                'code' => 'TG-BAR-002', 'name' => 'Yoga', 'email' => 'yoga@tropicalgarden.id',
                'phone' => '+62 815-0013-013', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-15', 'department' => 'Bar', 'position' => 'Senior Barista',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'BAR'
            ],
            [
                'code' => 'TG-BAR-003', 'name' => 'Ilham', 'email' => 'ilham@tropicalgarden.id',
                'phone' => '+62 815-0014-014', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-05-15', 'department' => 'Bar', 'position' => 'Barista Helper',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'BAR'
            ],
            // 15. Head Waiter
            [
                'code' => 'TG-SVC-001', 'name' => 'Vita', 'email' => 'vita@tropicalgarden.id',
                'phone' => '+62 816-0015-015', 'gender' => 'FEMALE', 'status' => 'CONTRACT',
                'join_date' => '2023-03-15', 'department' => 'Service', 'position' => 'Head Waiter / Captain Floor',
                'access_level' => 'HEAD', 'role' => 'HEAD', 'division' => 'SERVICE'
            ],
            [
                'code' => 'TG-SVC-002', 'name' => 'Rini', 'email' => 'rini@tropicalgarden.id',
                'phone' => '+62 816-0016-016', 'gender' => 'FEMALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-01', 'department' => 'Service', 'position' => 'Senior Waitress',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'SERVICE'
            ],
            [
                'code' => 'TG-SVC-003', 'name' => 'Tomi', 'email' => 'tomi@tropicalgarden.id',
                'phone' => '+62 816-0017-017', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-01', 'department' => 'Service', 'position' => 'Waiter Floor VIP',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'SERVICE'
            ],
            [
                'code' => 'TG-SVC-004', 'name' => 'Sari', 'email' => 'sari@tropicalgarden.id',
                'phone' => '+62 816-0018-018', 'gender' => 'FEMALE', 'status' => 'DAILY_WORKER',
                'join_date' => '2023-06-01', 'department' => 'Service', 'position' => 'Waitress Garden Area',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'SERVICE'
            ],
            // 19. Cleaning
            [
                'code' => 'TG-CLN-001', 'name' => 'Yanto', 'email' => 'yanto@tropicalgarden.id',
                'phone' => '+62 817-0019-019', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-03-01', 'department' => 'Cleaning', 'position' => 'Leader Cleaning & Maintenance',
                'access_level' => 'HEAD', 'role' => 'HEAD', 'division' => 'CLEANING'
            ],
            [
                'code' => 'TG-CLN-002', 'name' => 'Wawan', 'email' => 'wawan@tropicalgarden.id',
                'phone' => '+62 817-0020-020', 'gender' => 'MALE', 'status' => 'DAILY_WORKER',
                'join_date' => '2023-05-01', 'department' => 'Cleaning', 'position' => 'Restroom & Garden Crew',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'CLEANING'
            ],
            // 21. CRM Lead
            [
                'code' => 'TG-CRM-001', 'name' => 'Aqib Latuh', 'email' => 'aqib.latuh@tropicalgarden.id',
                'phone' => '+62 818-0021-021', 'gender' => 'MALE', 'status' => 'CONTRACT',
                'join_date' => '2023-04-01', 'department' => 'CRM', 'position' => 'CRM & Event Lead',
                'access_level' => 'HEAD', 'role' => 'HEAD', 'division' => 'CRM'
            ],
            // 22. Content Creator
            [
                'code' => 'TG-MKT-001', 'name' => 'Nadia Putri', 'email' => 'nadia.putri@tropicalgarden.id',
                'phone' => '+62 818-0022-022', 'gender' => 'FEMALE', 'status' => 'CONTRACT',
                'join_date' => '2023-05-01', 'department' => 'Marketing', 'position' => 'Content Creator & Sosmed',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'MARKETING'
            ],
            // 23. Finance Officer
            [
                'code' => 'TG-FIN-001', 'name' => 'Ristania Larasati', 'email' => 'ristania@tropicalgarden.id',
                'phone' => '+62 819-0023-023', 'gender' => 'FEMALE', 'status' => 'PERMANENT',
                'join_date' => '2023-02-15', 'department' => 'Finance', 'position' => 'Finance & Cost Control Officer',
                'access_level' => 'HEAD', 'role' => 'HEAD', 'division' => 'FINANCE'
            ],
            // 24. Kasir Operasional
            [
                'code' => 'TG-CSH-001', 'name' => 'Maya Kartika', 'email' => 'maya.kartika@tropicalgarden.id',
                'phone' => '+62 819-0024-024', 'gender' => 'FEMALE', 'status' => 'CONTRACT',
                'join_date' => '2023-03-01', 'department' => 'Operations', 'position' => 'Kasir Utama',
                'access_level' => 'STAFF', 'role' => 'STAFF', 'division' => 'CASHIER'
            ],
        ];

        $defaultPassword = Hash::make('tropical123');

        foreach ($staffData as $staff) {
            // 1. Create User
            $userId = DB::table('users')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'name' => $staff['name'],
                'email' => $staff['email'],
                'password' => $defaultPassword,
                'role' => $staff['role'],
                'division' => $staff['division'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Create Employee
            DB::table('employees')->insert([
                'uuid' => (string) Str::uuid(),
                'user_id' => $userId,
                'employee_code' => $staff['code'],
                'full_name' => $staff['name'],
                'nickname' => explode(' ', $staff['name'])[0],
                'email' => $staff['email'],
                'phone' => $staff['phone'],
                'gender' => $staff['gender'],
                'employment_status' => $staff['status'],
                'join_date' => $staff['join_date'],
                'department' => $staff['department'],
                'primary_position' => $staff['position'],
                'access_level' => $staff['access_level'],
                'status' => 'ACTIVE',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($staff['name']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
