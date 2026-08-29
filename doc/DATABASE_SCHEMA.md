# TROPICALOS — MASTER MYSQL DATABASE SCHEMA SPECIFICATION
**Version:** 1.0  
**Target RDBMS:** MySQL 8.0+ / MariaDB 10.11+  
**Charset/Collation:** `utf8mb4 / utf8mb4_unicode_ci`  
**Engine:** `InnoDB`  
**Architecture Reference:** [DATA_OWNERSHIP_MATRIX.md](file:///c:/Users/LENOVO/Downloads/tropical-os/doc/DATA_OWNERSHIP_MATRIX.md) & [RBAC.md](file:///c:/Users/LENOVO/Downloads/tropical-os/doc/RBAC.md)

---

## 1. Konvensi Penamaan & Standar Database

1. **Nama Tabel:** Plural, `snake_case` (contoh: `employees`, `stock_movements`, `purchase_orders`).
2. **Primary Key:** `id` bertipe `BIGINT UNSIGNED AUTO_INCREMENT`.
3. **Public Identifier (API):** `uuid` bertipe `CHAR(36) UNIQUE` untuk seluruh entitas publik guna mencegah *ID enumeration*.
4. **Foreign Keys:** `[singular_table_name]_id` bertipe `BIGINT UNSIGNED` dengan `FOREIGN KEY ... REFERENCES ...`.
5. **Timestamps:** Seluruh tabel operasional dan master memiliki `created_at` dan `updated_at` bertipe `TIMESTAMP NULL`.
6. **Soft Deletes:** Tabel master data menggunakan `deleted_at TIMESTAMP NULL` (`SoftDeletes` di Laravel).
7. **Monetary & Decimal Precision:**
   - Mata uang Rupiah: `DECIMAL(15, 2)` (contoh: `selling_price`, `total_amount`, `basic_salary`).
   - Kuantitas & Bobot: `DECIMAL(12, 4)` (contoh: `quantity`, `yield_percentage`, `unit_cost`).
8. **Geolokasi:** `DECIMAL(10, 8)` untuk Latitude dan `DECIMAL(11, 8)` untuk Longitude.

---

## 2. Diagram Relasi Domain (Entity Relationship Overview)

```
[users] ──1:1── [employees]
                    │
   ┌────────────────┼──────────────────────────────┬──────────────────┐
   ▼                ▼                              ▼                  ▼
[attendances]  [shift_schedules]         [station_assignments]   [payroll_runs]
   │                │                              │                  │
[breaks]       [overtime_requests]                 ▼                  ▼
                                           [operational_stations] [payslips]
                                                   │
                                                   ▼
                                          [checklist_templates]
                                                   │
                                                   ▼
                                         [checklist_executions]
                                                   │
                                                   ▼
                                         [operational_issues]

[suppliers] ──1:N── [purchase_orders] ──1:N── [inventory_items] (SKU)
                           │                         │
                           ▼                         ▼
                    [receiving_logs]       [stock_movements] (Append-Only Ledger)
                                                     │
                                                     ▼
                                            [production_batches]
                                                     │
                                                     ▼
                                                 [recipes]
                                                     │
                                                     ▼
                                               [menu_items]
                                                     │
                                                     ▼
                                              [sales_orders] ──1:N── [sales_order_items]
                                                     │
                                                     ▼
                                             [sales_payments]
                                                     │
                                                     ▼
                                            [cashier_closings]
```

---

## 3. Skema Tabel Lengkap per Domain

### DOMAIN 1: AUTHENTICATION, RBAC & HR (Human Resources)

#### 3.1. `users`
Menyimpan kredensial autentikasi sistem TropicalOS.
```sql
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('OWNER', 'MANAGER', 'HEAD', 'SUPERVISOR', 'STAFF') NOT NULL DEFAULT 'STAFF',
  `division` VARCHAR(50) NOT NULL DEFAULT 'OPERATIONS',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `remember_token` VARCHAR(100) NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email_role` (`email`, `role`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.2. `employees`
Menyimpan data profil master 24 personel Tropical Garden Resto.
```sql
CREATE TABLE `employees` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED NULL UNIQUE,
  `employee_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. TG-OWN-001, TG-MGR-001
  `full_name` VARCHAR(150) NOT NULL,
  `nickname` VARCHAR(50) NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(25) NOT NULL,
  `gender` ENUM('MALE', 'FEMALE') NOT NULL,
  `employment_status` ENUM('PERMANENT', 'CONTRACT', 'PROBATION', 'DAILY_WORKER') NOT NULL DEFAULT 'CONTRACT',
  `join_date` DATE NOT NULL,
  `department` VARCHAR(50) NOT NULL, -- Executive, Management, Operations, Kitchen, Bar, Service, Cleaning, CRM, Finance, Marketing
  `primary_position` VARCHAR(100) NOT NULL, -- Owner, General Manager, Supervisor, Head Kitchen, dll.
  `access_level` ENUM('OWNER', 'MANAGER', 'HEAD', 'SUPERVISOR', 'STAFF') NOT NULL DEFAULT 'STAFF',
  `additional_responsibilities` JSON NULL, -- ['Kasir Operasional', 'Purchasing', 'HPP']
  `supervisor_id` BIGINT UNSIGNED NULL,
  `manager_id` BIGINT UNSIGNED NULL,
  `avatar_url` VARCHAR(500) NULL,
  `status` ENUM('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `emergency_contact` JSON NULL, -- { name, relationship, phone }
  `notes` TEXT NULL,
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`supervisor_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  INDEX `idx_employees_dept_status` (`department`, `status`, `access_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.3. `shifts` & `shift_schedules`
Master shift dan penjadwalan roster harian staf.
```sql
CREATE TABLE `shifts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `shift_code` VARCHAR(20) NOT NULL UNIQUE, -- e.g. S-PAGI, S-SIANG, S-FULL
  `name` VARCHAR(50) NOT NULL,
  `start_time` TIME NOT NULL, -- e.g. 08:00:00
  `end_time` TIME NOT NULL, -- e.g. 16:30:00
  `grace_period_minutes` INT UNSIGNED NOT NULL DEFAULT 15,
  `cross_day` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shift_schedules` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `shift_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('SCHEDULED', 'CONFIRMED', 'SWAPPED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `swapped_with_employee_id` BIGINT UNSIGNED NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`swapped_with_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_emp_date` (`employee_id`, `date`),
  INDEX `idx_schedules_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.4. `attendances` & `breaks`
Presensi real-time berbasis GPS geofencing & verifikasi foto selfie.
```sql
CREATE TABLE `attendances` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `shift_id` BIGINT UNSIGNED NULL,
  `date` DATE NOT NULL,
  `clock_in_time` TIMESTAMP NULL,
  `clock_out_time` TIMESTAMP NULL,
  `status` ENUM('PRESENT', 'LATE', 'ABSENT', 'LEAVE', 'OFF', 'INCOMPLETE') NOT NULL DEFAULT 'PRESENT',
  `late_duration_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
  `clock_in_latitude` DECIMAL(10, 8) NULL,
  `clock_in_longitude` DECIMAL(11, 8) NULL,
  `clock_in_distance_meters` DECIMAL(8, 2) NULL,
  `clock_in_photo_url` VARCHAR(500) NULL,
  `clock_out_latitude` DECIMAL(10, 8) NULL,
  `clock_out_longitude` DECIMAL(11, 8) NULL,
  `clock_out_photo_url` VARCHAR(500) NULL,
  `location_status` ENUM('VALID', 'OUTSIDE_AREA', 'LOW_ACCURACY', 'UNAVAILABLE') NOT NULL DEFAULT 'VALID',
  `face_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL,
  INDEX `idx_attendance_emp_date` (`employee_id`, `date`),
  INDEX `idx_attendance_date_status` (`date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `breaks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attendance_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `break_type` ENUM('ISHOMA', 'PRAYER', 'MEAL', 'EMERGENCY') NOT NULL DEFAULT 'ISHOMA',
  `start_time` TIMESTAMP NOT NULL,
  `end_time` TIMESTAMP NULL,
  `duration_minutes` INT UNSIGNED NULL,
  `status` ENUM('ACTIVE', 'COMPLETED', 'OVERSTAY') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`attendance_id`) REFERENCES `attendances` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.5. `payroll_runs` & `payslips`
Engine penggajian bulanan dan slip gaji karyawan.
```sql
CREATE TABLE `payroll_runs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `period_code` VARCHAR(20) NOT NULL UNIQUE, -- e.g. 2026-08
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_employees` INT UNSIGNED NOT NULL DEFAULT 24,
  `total_gross_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_deductions_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_net_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('DRAFT', 'CALCULATED', 'APPROVED_GM', 'LOCKED_PAID') NOT NULL DEFAULT 'DRAFT',
  `processed_by` BIGINT UNSIGNED NOT NULL,
  `approved_by` BIGINT UNSIGNED NULL,
  `locked_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`processed_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payslips` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `payroll_run_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `basic_salary` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `allowances` JSON NOT NULL, -- { meal, transport, position }
  `overtime_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `incentives` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `gross_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `deductions` JSON NOT NULL, -- { kasbon, late_penalty, bpjs }
  `total_deductions` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `net_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('PENDING', 'TRANSFERRED', 'CASH_PAID') NOT NULL DEFAULT 'PENDING',
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_run_emp` (`payroll_run_id`, `employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### DOMAIN 2: OPERATIONS, STATIONS & CHECKLISTS

#### 3.6. `operational_areas` & `operational_stations`
Struktur tata letak fisik restoran Tropical Garden.
```sql
CREATE TABLE `operational_areas` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `area_code` VARCHAR(20) NOT NULL UNIQUE, -- e.g. AREA-KIT, AREA-BAR, AREA-SVC
  `name` VARCHAR(100) NOT NULL, -- Kitchen, Bar, Service Floor, Cashier, Cleaning
  `department` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `operational_stations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `area_id` BIGINT UNSIGNED NOT NULL,
  `station_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. STN-KIT-HOT, STN-BAR-ESPRESSO
  `name` VARCHAR(100) NOT NULL,
  `min_staff` INT UNSIGNED NOT NULL DEFAULT 1,
  `recommended_staff` INT UNSIGNED NOT NULL DEFAULT 2,
  `status` ENUM('ACTIVE', 'PAUSED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`area_id`) REFERENCES `operational_areas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.7. `checklist_templates` & `checklist_executions`
Standar checklist harian stasiun (Opening, Running, Closing) dengan approval supervisor.
```sql
CREATE TABLE `checklist_templates` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `station_id` BIGINT UNSIGNED NOT NULL,
  `template_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. CHK-KIT-OPEN-01
  `title` VARCHAR(150) NOT NULL,
  `shift_type` ENUM('PAGI', 'SIANG', 'MALAM', 'ALL') NOT NULL DEFAULT 'ALL',
  `category` ENUM('OPENING', 'RUNNING', 'CLOSING', 'HYGIENE', 'SAFETY') NOT NULL,
  `requires_verification` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`station_id`) REFERENCES `operational_stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `checklist_template_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `checklist_template_id` BIGINT UNSIGNED NOT NULL,
  `sequence` INT UNSIGNED NOT NULL DEFAULT 1,
  `task_name` VARCHAR(255) NOT NULL,
  `standard_description` TEXT NULL,
  `is_required` BOOLEAN NOT NULL DEFAULT TRUE,
  `requires_photo` BOOLEAN NOT NULL DEFAULT FALSE,
  `requires_numeric_value` BOOLEAN NOT NULL DEFAULT FALSE,
  `unit` VARCHAR(20) NULL, -- e.g. '°C', 'Bar', 'Kg'
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`checklist_template_id`) REFERENCES `checklist_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `checklist_executions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `checklist_template_id` BIGINT UNSIGNED NOT NULL,
  `checklist_template_item_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
  `numeric_value` DECIMAL(10, 2) NULL,
  `note` TEXT NULL,
  `evidence_photo_url` VARCHAR(500) NULL,
  `completed_at` TIMESTAMP NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`checklist_template_id`) REFERENCES `checklist_templates` (`id`),
  FOREIGN KEY (`checklist_template_item_id`) REFERENCES `checklist_template_items` (`id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`verified_by`) REFERENCES `employees` (`id`),
  INDEX `idx_exec_date_status` (`date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.8. `operational_issues`
Pencatatan dan eskalasi kendala operasional (SLA Engine).
```sql
CREATE TABLE `operational_issues` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `issue_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. ISS-20260818-001
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `area_id` BIGINT UNSIGNED NOT NULL,
  `station_id` BIGINT UNSIGNED NOT NULL,
  `category` ENUM('EQUIPMENT', 'INVENTORY', 'FOOD_SAFETY', 'HYGIENE', 'GUEST_COMPLAINT', 'STAFFING', 'FACILITY', 'CASHIER_POS', 'OTHER') NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'WAITING', 'ESCALATED', 'RESOLVED', 'VERIFIED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `sla_minutes` INT UNSIGNED NOT NULL DEFAULT 60,
  `sla_deadline` TIMESTAMP NOT NULL,
  `is_sla_breached` BOOLEAN NOT NULL DEFAULT FALSE,
  `reported_by` BIGINT UNSIGNED NOT NULL,
  `assigned_to` BIGINT UNSIGNED NULL,
  `resolution` TEXT NULL,
  `resolved_by` BIGINT UNSIGNED NULL,
  `resolved_at` TIMESTAMP NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`area_id`) REFERENCES `operational_areas` (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `operational_stations` (`id`),
  FOREIGN KEY (`reported_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`resolved_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`verified_by`) REFERENCES `employees` (`id`),
  INDEX `idx_issues_status_severity` (`status`, `severity`, `is_sla_breached`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### DOMAIN 3: INVENTORY, PROCUREMENT, RECIPES & HPP

#### 3.9. `inventory_items` & `stock_movements` (Single Stock Ledger)
Master SKU dan buku besar transaksi mutasi persediaan (Append-Only).
```sql
CREATE TABLE `inventory_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `sku` VARCHAR(50) NOT NULL UNIQUE, -- e.g. RAW-MEAT-TENDERLOIN-01
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('MEAT', 'POULTRY', 'SEAFOOD', 'VEGETABLE', 'DAIRY', 'DRY_GOODS', 'BEVERAGE', 'PACKAGING', 'CLEANING') NOT NULL,
  `unit` VARCHAR(20) NOT NULL, -- Kg, Gram, Liter, Pcs, Pack
  `current_stock` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `minimum_stock` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `maximum_stock` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `reorder_point` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `average_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Weighted Average Cost
  `last_purchase_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `storage_location` VARCHAR(100) NOT NULL, -- Chiller 1, Freezer 2, Dry Store A
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `idx_inv_cat_stock` (`category`, `current_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stock_movements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `inventory_item_id` BIGINT UNSIGNED NOT NULL,
  `movement_type` ENUM('PURCHASE_RECEIVE', 'PRODUCTION_USAGE', 'PRODUCTION_YIELD', 'WASTE_EXPIRED', 'WASTE_DAMAGED', 'WASTE_SPOILAGE', 'STOCK_OPNAME_ADJUSTMENT', 'TRANSFER_INTER_STATION') NOT NULL,
  `quantity` DECIMAL(12, 4) NOT NULL, -- Positif untuk masuk, Negatif untuk keluar
  `unit_cost` DECIMAL(15, 2) NOT NULL,
  `total_cost` DECIMAL(15, 2) NOT NULL,
  `reference_type` VARCHAR(50) NOT NULL, -- 'PURCHASE_ORDER', 'PRODUCTION_BATCH', 'WASTING_LOG', 'STOCK_OPNAME'
  `reference_id` BIGINT UNSIGNED NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  INDEX `idx_movements_item_date` (`inventory_item_id`, `created_at`),
  INDEX `idx_movements_ref` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.10. `suppliers`, `purchase_orders` & `receiving_logs`
Pengadaan bahan baku restoran dan pencatatan penerimaan faktur vendor.
```sql
CREATE TABLE `suppliers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `supplier_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. SUP-MEAT-01
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `email` VARCHAR(150) NULL,
  `address` TEXT NOT NULL,
  `payment_terms` VARCHAR(50) NOT NULL DEFAULT 'COD', -- NET 14, NET 30, COD
  `lead_time_days` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `purchase_orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `po_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. PO-202608-001
  `supplier_id` BIGINT UNSIGNED NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery_date` DATE NOT NULL,
  `subtotal_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `shipping_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED_MGR', 'SENT_SUPPLIER', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `payment_status` ENUM('UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `approved_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `purchase_order_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` BIGINT UNSIGNED NOT NULL,
  `inventory_item_id` BIGINT UNSIGNED NOT NULL,
  `ordered_quantity` DECIMAL(12, 4) NOT NULL,
  `received_quantity` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `unit_price` DECIMAL(15, 2) NOT NULL,
  `total_price` DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.11. `recipes` & `production_batches` (Single Costing Engine)
Standar porsi resep, Bill of Materials (BOM), kalkulasi HPP, dan produksi batch setengah jadi.
```sql
CREATE TABLE `recipes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `recipe_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. RCP-BEV-KOPI-TROPICAL
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('MAIN_COURSE', 'APPETIZER', 'DESSERT', 'BEVERAGE_COFFEE', 'BEVERAGE_NON_COFFEE', 'SEMI_FINISHED_SAUCE', 'SEMI_FINISHED_PREP') NOT NULL,
  `station_id` BIGINT UNSIGNED NOT NULL,
  `serving_portion` INT UNSIGNED NOT NULL DEFAULT 1,
  `selling_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `theoretical_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Kalkulasi otomatis dari ingredient SKU
  `food_cost_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- (Cost / Price) * 100
  `target_food_cost_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 32.00,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`station_id`) REFERENCES `operational_stations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recipe_ingredients` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `inventory_item_id` BIGINT UNSIGNED NOT NULL,
  `quantity` DECIMAL(12, 4) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `yield_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
  `cost_allocation` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `production_batches` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `batch_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. PB-20260818-01
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `planned_yield` DECIMAL(12, 4) NOT NULL,
  `actual_yield` DECIMAL(12, 4) NOT NULL,
  `variance_quantity` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `total_cost` DECIMAL(15, 2) NOT NULL,
  `unit_cost` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('PLANNED', 'IN_PREP', 'COOKING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
  `prepared_by` BIGINT UNSIGNED NOT NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`),
  FOREIGN KEY (`prepared_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`verified_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### DOMAIN 4: SALES, POS, FINANCE & CASHIER

#### 3.12. `sales_orders`, `sales_order_items` & `sales_payments`
Transaksi penjualan kasir POS resto.
```sql
CREATE TABLE `sales_orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `order_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. POS-20260818-0012
  `table_number` VARCHAR(20) NULL,
  `guest_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `subtotal_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `service_charge_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- 5%
  `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- PB1 10%
  `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `order_type` ENUM('DINE_IN', 'TAKE_AWAY', 'RESERVATION_EVENT', 'DELIVERY') NOT NULL DEFAULT 'DINE_IN',
  `status` ENUM('OPEN', 'ORDER_SENT', 'BILL_PRINTED', 'PAID', 'VOID', 'REFUNDED') NOT NULL DEFAULT 'OPEN',
  `cashier_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`cashier_id`) REFERENCES `employees` (`id`),
  INDEX `idx_sales_date_status` (`created_at`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sales_order_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sales_order_id` BIGINT UNSIGNED NOT NULL,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(15, 2) NOT NULL,
  `unit_cost` DECIMAL(15, 2) NOT NULL, -- HPP snapshot saat order dibuat
  `subtotal_price` DECIMAL(15, 2) NOT NULL,
  `subtotal_cost` DECIMAL(15, 2) NOT NULL,
  `notes` VARCHAR(255) NULL,
  FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sales_payments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sales_order_id` BIGINT UNSIGNED NOT NULL,
  `payment_method` ENUM('CASH', 'QRIS_STATIC', 'QRIS_DYNAMIC', 'EDC_BCA_DEBIT', 'EDC_MANDIRI_DEBIT', 'CREDIT_CARD', 'BANK_TRANSFER') NOT NULL,
  `amount_paid` DECIMAL(15, 2) NOT NULL,
  `change_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `reference_no` VARCHAR(100) NULL, -- No approval EDC / Ref QRIS
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.13. `cashier_closings` & `operational_expenses`
Rekonsiliasi laci kasir per shift dan pencatatan OPEX harian.
```sql
CREATE TABLE `cashier_closings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `closing_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. CLS-20260818-S1
  `shift_id` BIGINT UNSIGNED NOT NULL,
  `cashier_id` BIGINT UNSIGNED NOT NULL,
  `opening_cash_float` DECIMAL(15, 2) NOT NULL DEFAULT 500000.00, -- Modal awal laci
  `system_cash_sales` DECIMAL(15, 2) NOT NULL,
  `system_non_cash_sales` DECIMAL(15, 2) NOT NULL,
  `actual_physical_cash` DECIMAL(15, 2) NOT NULL,
  `cash_variance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Actual - Expected
  `total_transactions` INT UNSIGNED NOT NULL,
  `status` ENUM('SUBMITTED', 'VERIFIED_SUPERVISOR', 'AUDITED_FINANCE', 'DISCREPANCY') NOT NULL DEFAULT 'SUBMITTED',
  `verified_by` BIGINT UNSIGNED NULL, -- Putri Okta (Supervisor)
  `audited_by` BIGINT UNSIGNED NULL, -- Ristania Larasati (Finance)
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  FOREIGN KEY (`cashier_id`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`verified_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`audited_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `operational_expenses` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `expense_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. EXP-202608-012
  `expense_date` DATE NOT NULL,
  `category` ENUM('ELECTRICITY', 'WATER', 'GAS_LPG', 'INTERNET_TELECOM', 'CLEANING_SUPPLIES', 'MAINTENANCE_REPAIR', 'MARKETING_ADS', 'PRINTING_ADMIN', 'TRANSPORT_FUEL', 'OTHER_OPEX') NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `paid_from_account` ENUM('PETTY_CASH', 'BANK_BCA_OPERASIONAL', 'BANK_MANDIRI_UTAMA') NOT NULL,
  `receipt_photo_url` VARCHAR(500) NULL,
  `paid_by` BIGINT UNSIGNED NOT NULL,
  `approved_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`paid_by`) REFERENCES `employees` (`id`),
  FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  INDEX `idx_expenses_date_cat` (`expense_date`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### DOMAIN 5: CRM, RESERVASI & MARKETING

#### 3.14. `customers` & `reservations`
Database pelanggan VIP dan jadwal reservasi gathering/event.
```sql
CREATE TABLE `customers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `customer_code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) NOT NULL UNIQUE,
  `email` VARCHAR(150) NULL,
  `tier` ENUM('REGULAR', 'VIP', 'VVIP', 'CORPORATE') NOT NULL DEFAULT 'REGULAR',
  `total_visits` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `preferences` JSON NULL, -- { favorite_table: 'Gazebo 3', favorite_dish: 'Ikan Bakar Jimbaran' }
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `reservation_code` VARCHAR(30) NOT NULL UNIQUE, -- e.g. RES-2026-081
  `customer_id` BIGINT UNSIGNED NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(25) NOT NULL,
  `customer_email` VARCHAR(150) NULL,
  `company_name` VARCHAR(150) NULL,
  `type` ENUM('EVENT_GATHERING', 'WEDDING', 'BIRTHDAY', 'VIP_TABLE', 'CORPORATE_DINNER', 'FAMILY_DINING') NOT NULL DEFAULT 'FAMILY_DINING',
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `area` VARCHAR(100) NOT NULL, -- 'Garden Area Utama', 'Pendopo VIP', 'Indoor AC VIP 1'
  `pax` INT UNSIGNED NOT NULL,
  `estimated_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `down_payment` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('UNPAID', 'DP_PAID', 'PAID_FULL') NOT NULL DEFAULT 'UNPAID',
  `status` ENUM('WAITING_DP', 'RESERVED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  `special_requests` JSON NULL,
  `notes` TEXT NULL,
  `pic_id` BIGINT UNSIGNED NOT NULL, -- Aqib Latuh (CRM Lead)
  `menu_package` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`pic_id`) REFERENCES `employees` (`id`),
  INDEX `idx_res_date_status` (`date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
