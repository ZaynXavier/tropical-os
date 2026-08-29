# TROPICALOS — LARAVEL BACKEND ARCHITECTURAL SPECIFICATION
**Version:** 1.0  
**Framework:** Laravel 11.x / 12.x (PHP 8.2+)  
**Database:** MySQL 8.0+  
**Authentication:** Laravel Sanctum (SPA Session & Bearer API Token)  
**Architecture Style:** Domain-Driven Modular Services / Clean Architecture  
**Frontend Client:** React + TypeScript (Vite)

---

## 1. Ikhtisar Arsitektur Backend

TropicalOS Backend dirancang menggunakan pendekatan **Modular Domain-Driven Design (DDD)** di dalam framework Laravel. Struktur ini memastikan pemisahan tanggung jawab yang tegas antara domain operasional dapur/bar, tata kelola finansial, manajemen SDM/HR, dan interaksi tamu (CRM).

```
                      ┌───────────────────────────────────────────────┐
                      │    TropicalOS Frontend (React + Vite PWA)    │
                      └──────────────────────┬────────────────────────┘
                                             │ HTTP REST API (Axios)
                                             ▼
                      ┌───────────────────────────────────────────────┐
                      │     Laravel 11 Routing & Sanctum Guard        │
                      └──────────────────────┬────────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
┌───────────┐      ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌───────────┐
│ HR Domain │      │Ops Domain │       │ Inventory │       │Finance/POS│      │CRM Domain │
│ (Presensi,│      │(Stasiun,  │       │ & Costing │       │(Penjualan,│      │(Tamu VIP, │
│  Payroll, │      │Checklist, │       │  (BOM HPP,│       │ Closing,  │      │ Reservasi,│
│   Roster) │      │  Issues)  │       │  Ledger)  │       │   OPEX)   │      │ Deals)    │
└─────┬─────┘      └─────┬─────┘       └─────┬─────┘       └─────┬─────┘      └─────┬─────┘
      │                  │                   │                   │                  │
      └──────────────────┼───────────────────┴───────────────────┼──────────────────┘
                         ▼                                       ▼
       ┌───────────────────────────────────┐   ┌───────────────────────────────────┐
       │   Single Costing Engine Service   │   │   Stock Movement Ledger Service   │
       │ (Kalkulasi HPP & Resep Konsisten) │   │  (Append-Only Mutasi Stok Bahan)  │
       └─────────────────┬─────────────────┘   └─────────────────┬─────────────────┘
                         │                                       │
                         └───────────────────┬───────────────────┘
                                             ▼
                      ┌───────────────────────────────────────────────┐
                      │           MySQL 8.0 Database Storage          │
                      │ (40+ Tabel Relasional, Transaksi ACID InnoDB) │
                      └───────────────────────────────────────────────┘
```

---

## 2. Struktur Direktori Proyek Laravel

Struktur folder backend Laravel diatur secara modular per domain:

```text
tropical-backend/
├── app/
│   ├── Domains/
│   │   ├── Auth/
│   │   │   ├── Controllers/AuthController.php
│   │   │   ├── Requests/LoginRequest.php
│   │   │   └── Services/AuthService.php
│   │   ├── HR/
│   │   │   ├── Controllers/AttendanceController.php
│   │   │   ├── Controllers/EmployeeController.php
│   │   │   ├── Controllers/PayrollController.php
│   │   │   ├── Models/Employee.php
│   │   │   ├── Models/Attendance.php
│   │   │   ├── Models/PayrollRun.php
│   │   │   ├── Models/Payslip.php
│   │   │   ├── Services/AttendanceGeofenceService.php
│   │   │   └── Services/PayrollEngineService.php
│   │   ├── Operations/
│   │   │   ├── Controllers/ChecklistController.php
│   │   │   ├── Controllers/StationController.php
│   │   │   ├── Controllers/IssueController.php
│   │   │   ├── Models/OperationalStation.php
│   │   │   ├── Models/ChecklistTemplate.php
│   │   │   ├── Models/ChecklistExecution.php
│   │   │   ├── Models/OperationalIssue.php
│   │   │   └── Services/IssueSlaEscalationService.php
│   │   ├── Inventory/
│   │   │   ├── Controllers/InventoryController.php
│   │   │   ├── Controllers/StockMovementController.php
│   │   │   ├── Controllers/RecipeController.php
│   │   │   ├── Controllers/ProductionController.php
│   │   │   ├── Models/InventoryItem.php
│   │   │   ├── Models/StockMovement.php
│   │   │   ├── Models/Recipe.php
│   │   │   ├── Models/ProductionBatch.php
│   │   │   ├── Services/SingleCostingEngineService.php
│   │   │   └── Services/StockMovementLedgerService.php
│   │   ├── Finance/
│   │   │   ├── Controllers/SalesController.php
│   │   │   ├── Controllers/CashierClosingController.php
│   │   │   ├── Controllers/ExpenseController.php
│   │   │   ├── Models/SalesOrder.php
│   │   │   ├── Models/CashierClosing.php
│   │   │   ├── Models/OperationalExpense.php
│   │   │   └── Services/CashierReconciliationService.php
│   │   └── CRM/
│   │       ├── Controllers/CustomerController.php
│   │       ├── Controllers/ReservationController.php
│   │       ├── Models/Customer.php
│   │       └── Models/Reservation.php
│   ├── Http/
│   │   ├── Middleware/
│   │   │   ├── EnforceJsonResponses.php
│   │   │   ├── RoleMiddleware.php
│   │   │   └── RestrictKpiAccessMiddleware.php
│   │   └── Resources/
│   │       └── ApiResource.php
│   └── Providers/
│       ├── AuthServiceProvider.php
│       └── DomainServiceProvider.php
├── config/
│   ├── sanctum.php
│   └── tropical.php -- Parameter geofencing GPS resto, target food cost %
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── EmployeeSeeder.php -- 24 Staff Personas
│       ├── InventorySeeder.php -- 32 SKUs
│       ├── RecipeSeeder.php -- Resep Dapur & Bar
│       └── StationSeeder.php -- Stasiun Operasional
└── routes/
    └── api.php
```

---

## 3. Autentikasi & Matriks Hak Akses (RBAC)

### 3.1. Konfigurasi Laravel Sanctum
- **SPA Frontend (Desktop Browser):** Menggunakan HttpOnly Cookie session dengan proteksi CSRF.
- **Mobile Staff / PWA:** Menggunakan Bearer Token (`Authorization: Bearer <token>`) yang disimpan di secure storage client.

### 3.2. Middleware Proteksi KPI & Finansial (`RestrictKpiAccessMiddleware.php`)
Sesuai aturan bisnis TropicalOS, data Key Performance Indicators (KPI), omzet, laba kotor/bersih, HPP aggregate, dan labor cost % **HANYA** boleh diakses oleh:
1. `OWNER` (Tri Hermawanto)
2. `MANAGER` (Heri Setiawan)
3. `FINANCE` (Ristania Larasati)

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictKpiAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $allowedRoles = ['OWNER', 'MANAGER'];
        $isFinance = ($user->role === 'HEAD' || $user->role === 'STAFF') && $user->division === 'FINANCE';

        if (in_array($user->role, $allowedRoles) || $isFinance) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak. Fitur Key Performance Indicators (KPI) hanya dapat diakses oleh Owner, Manager, dan Finance.'
        ], 403);
    }
}
```

---

## 4. Implementasi Core Services & Business Engines

### 4.1. Single Costing Engine Service (`SingleCostingEngineService.php`)
Menjadi satu-satunya algoritma kalkulasi HPP di backend agar tidak ada selisih perhitungan antara Dapur dan Keuangan.

```php
namespace App\Domains\Inventory\Services;

use App\Domains\Inventory\Models\Recipe;
use App\Domains\Inventory\Models\InventoryItem;

class SingleCostingEngineService
{
    /**
     * Menghitung total HPP teoritis resep berdasarkan harga bahan baku SKU terkini
     */
    public function calculateRecipeCost(Recipe $recipe): array
    {
        $totalRawMaterialCost = 0;

        foreach ($recipe->ingredients as $ingredient) {
            $item = $ingredient->inventoryItem;
            $unitCost = $item->average_cost > 0 ? $item->average_cost : $item->last_purchase_cost;
            
            // Perhitungan dengan faktor yield
            $effectiveQuantity = $ingredient->quantity / ($ingredient->yield_percentage / 100);
            $costAllocation = $effectiveQuantity * $unitCost;

            $totalRawMaterialCost += $costAllocation;
            
            // Simpan alokasi per item
            $ingredient->update(['cost_allocation' => $costAllocation]);
        }

        $sellingPrice = (float) $recipe->selling_price;
        $foodCostPercentage = $sellingPrice > 0 
            ? round(($totalRawMaterialCost / $sellingPrice) * 100, 2) 
            : 0.00;

        $recipe->update([
            'theoretical_cost' => $totalRawMaterialCost,
            'food_cost_percentage' => $foodCostPercentage
        ]);

        return [
            'recipe_id' => $recipe->id,
            'selling_price' => $sellingPrice,
            'theoretical_cost' => $totalRawMaterialCost,
            'food_cost_percentage' => $foodCostPercentage,
            'is_target_breached' => $foodCostPercentage > $recipe->target_food_cost_percentage
        ];
    }
}
```

### 4.2. Single Stock Movement Ledger Service (`StockMovementLedgerService.php`)
Buku besar mutasi persediaan dengan jaminan transaksi ACID (`DB::transaction`).

```php
namespace App\Domains\Inventory\Services;

use Illuminate\Support\Facades\DB;
use App\Domains\Inventory\Models\InventoryItem;
use App\Domains\Inventory\Models\StockMovement;
use Illuminate\Support\Str;

class StockMovementLedgerService
{
    /**
     * Mencatat mutasi persediaan dan memperbarui saldo stok item secara atomik
     */
    public function recordMovement(
        int $inventoryItemId,
        string $movementType,
        float $quantity,
        float $unitCost,
        string $referenceType,
        int $referenceId,
        int $createdBy,
        ?string $notes = null
    ): StockMovement {
        return DB::transaction(function () use (
            $inventoryItemId, $movementType, $quantity, $unitCost, $referenceType, $referenceId, $createdBy, $notes
        ) {
            // Lock record SKU untuk mencegah race condition
            $item = InventoryItem::where('id', $inventoryItemId)->lockForUpdate()->firstOrFail();

            $totalCost = abs($quantity) * $unitCost;

            // Buat record ledger yang tidak dapat diubah (append-only)
            $movement = StockMovement::create([
                'uuid' => (string) Str::uuid(),
                'inventory_item_id' => $item->id,
                'movement_type' => $movementType,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'created_by' => $createdBy
            ]);

            // Update saldo stok di master item
            $newStock = $item->current_stock + $quantity;
            
            // Jika barang masuk dari pembelian, perbarui Weighted Average Cost (WAC)
            if ($movementType === 'PURCHASE_RECEIVE' && $quantity > 0) {
                $currentTotalValuation = $item->current_stock * $item->average_cost;
                $newIncomingValuation = $quantity * $unitCost;
                $updatedAverageCost = ($currentTotalValuation + $newIncomingValuation) / ($newStock > 0 ? $newStock : 1);

                $item->average_cost = round($updatedAverageCost, 2);
                $item->last_purchase_cost = $unitCost;
            }

            $item->current_stock = $newStock;
            $item->save();

            return $movement;
        });
    }
}
```

### 4.3. Presensi Geofencing GPS Service (`AttendanceGeofenceService.php`)
Memvalidasi posisi GPS karyawan saat clock-in menggunakan formula Haversine.

```php
namespace App\Domains\HR\Services;

class AttendanceGeofenceService
{
    // Koordinat Restoran Tropical Garden
    private float $restoLatitude = -7.782871;
    private float $restoLongitude = 110.367093;
    private float $maxAllowedRadiusMeters = 100.0; // Maksimal radius 100 meter

    public function validateLocation(float $latitude, float $longitude): array
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $latFrom = deg2rad($this->restoLatitude);
        $lonFrom = deg2rad($this->restoLongitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        $distanceMeters = round($angle * $earthRadius, 2);
        $isValid = $distanceMeters <= $this->maxAllowedRadiusMeters;

        return [
            'is_valid' => $isValid,
            'distance_meters' => $distanceMeters,
            'allowed_radius_meters' => $this->maxAllowedRadiusMeters,
            'status' => $isValid ? 'VALID' : 'OUTSIDE_AREA'
        ];
    }
}
```

---

## 5. Standar Format Respons API

Seluruh endpoint API Laravel mengembalikan format JSON terpadu (*Unified Envelope*):

### Respons Sukses (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Data berhasil dimuat.",
  "data": {
    "id": 1,
    "uuid": "8a3e7b1a-9f42-4f33-8a4b-325b1612e4f0",
    "employee_code": "TG-KIT-001",
    "full_name": "Andun",
    "primary_position": "Head Kitchen Pagi",
    "department": "Kitchen"
  },
  "meta": {
    "timestamp": "2026-08-29T08:30:00Z",
    "version": "1.0"
  }
}
```

### Respons Validasi Gagal (HTTP 422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Validasi input gagal.",
  "errors": {
    "date": ["Tanggal presensi tidak boleh di masa depan."],
    "clock_in_photo": ["Foto presensi wajib diunggah."]
  }
}
```

### Respons Hak Akses Ditolak (HTTP 403 Forbidden)
```json
{
  "success": false,
  "message": "Akses ditolak. Fitur Key Performance Indicators (KPI) hanya dapat diakses oleh Owner, Manager, dan Finance."
}
```

---

## 6. Daftar Endpoint Utama REST API

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Login user & generate Sanctum token | Publik |
| `GET` | `/api/v1/auth/me` | Profil login user saat ini | Authenticated |
| `POST` | `/api/v1/auth/logout` | Revoke active token | Authenticated |
| `GET` | `/api/v1/dashboard/executive` | KPI Omzet, Profit, Food/Labor Cost % | **Owner, Manager, Finance** |
| `GET` | `/api/v1/hr/employees` | Master 24 data personel staf | Owner, Manager, HR, Supervisor |
| `POST` | `/api/v1/hr/attendance/clock-in` | Presensi masuk (GPS + Foto selfie) | Seluruh Staf |
| `POST` | `/api/v1/hr/attendance/clock-out` | Presensi pulang | Seluruh Staf |
| `GET` | `/api/v1/hr/payroll/runs` | Daftar rekap payroll bulanan | **Owner, Manager, Finance, HR** |
| `GET` | `/api/v1/operations/stations` | Status stasiun operasional resto | All Staff |
| `GET` | `/api/v1/operations/checklists` | Daftar checklist harian stasiun | Staf Stasiun, Supervisor |
| `POST` | `/api/v1/operations/checklists/verify` | Approval checklist oleh Supervisor | Supervisor, Manager |
| `GET` | `/api/v1/inventory/items` | Master 32 SKU stok persediaan | Kitchen, Bar, Purchasing, Finance |
| `POST` | `/api/v1/inventory/stock-movements` | Catat mutasi persediaan (Ledger) | Operations, Purchasing |
| `GET` | `/api/v1/inventory/recipes` | Resep dan kalkulasi HPP food cost | Kitchen, Bar, Finance, Manager |
| `POST` | `/api/v1/pos/orders` | Buat pesanan kasir POS baru | Kasir, Waiter, Supervisor |
| `POST` | `/api/v1/pos/closings` | Rekonsiliasi tutup kasir per shift | Kasir, Supervisor, Finance |
| `GET` | `/api/v1/crm/reservations` | Kalender reservasi meja/event | CRM Lead, Waiter, Manager |
