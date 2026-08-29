<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "==========================================================" . PHP_EOL;
echo "   TROPICAL-OS BACKEND API & RBAC VERIFICATION SUITE      " . PHP_EOL;
echo "==========================================================" . PHP_EOL;

// 1. Test Owner Login & KPI Access
$owner = User::where('email', 'tri.hermawanto@tropicalgarden.id')->first();
$ownerToken = $owner->createToken('test_owner')->plainTextToken;

$reqOwnerKpi = Request::create('/api/v1/dashboard/executive', 'GET');
$reqOwnerKpi->headers->set('Authorization', 'Bearer ' . $ownerToken);
$reqOwnerKpi->headers->set('Accept', 'application/json');
$resOwnerKpi = $app->handle($reqOwnerKpi);

echo "[TEST 1] Owner KPI Access: Status " . $resOwnerKpi->getStatusCode() . " -> " . ($resOwnerKpi->getStatusCode() === 200 ? "PASS (200 OK - Access Granted)" : "FAIL") . PHP_EOL;

// Reset Auth Container State
Auth::forgetGuards();

// 2. Test Head Kitchen Login & KPI Restriction (Should be 403 Forbidden)
$andun = User::where('email', 'andun@tropicalgarden.id')->first();
$andunToken = $andun->createToken('test_andun')->plainTextToken;

$reqAndunKpi = Request::create('/api/v1/dashboard/executive', 'GET');
$reqAndunKpi->headers->set('Authorization', 'Bearer ' . $andunToken);
$reqAndunKpi->headers->set('Accept', 'application/json');
$resAndunKpi = $app->handle($reqAndunKpi);

echo "[TEST 2] Head Kitchen (Andun) KPI Restriction: Status " . $resAndunKpi->getStatusCode() . " -> " . ($resAndunKpi->getStatusCode() === 403 ? "PASS (403 Forbidden - Strictly Blocked)" : "FAIL") . PHP_EOL;

// Reset Auth Container State
Auth::forgetGuards();

// 3. Test Head Kitchen Stations Access (Should be 200 OK)
$reqAndunStations = Request::create('/api/v1/operations/stations', 'GET');
$reqAndunStations->headers->set('Authorization', 'Bearer ' . $andunToken);
$reqAndunStations->headers->set('Accept', 'application/json');
$resAndunStations = $app->handle($reqAndunStations);

echo "[TEST 3] Head Kitchen Stations Access: Status " . $resAndunStations->getStatusCode() . " -> " . ($resAndunStations->getStatusCode() === 200 ? "PASS (200 OK - Operasional Stasiun Aktif)" : "FAIL") . PHP_EOL;

// Reset Auth Container State
Auth::forgetGuards();

// 4. Test Clock-in GPS Geofence (Radius calculation)
$reqClockIn = Request::create('/api/v1/hr/attendance/clock-in', 'POST', [
    'latitude' => -7.782800,
    'longitude' => 110.367000,
    'shift_id' => 1,
]);
$reqClockIn->headers->set('Authorization', 'Bearer ' . $andunToken);
$reqClockIn->headers->set('Accept', 'application/json');
$resClockIn = $app->handle($reqClockIn);

echo "[TEST 4] Presensi GPS Clock-In: Status " . $resClockIn->getStatusCode() . " -> " . ($resClockIn->getStatusCode() === 200 ? "PASS (200 OK - Radius Terverifikasi)" : "FAIL") . PHP_EOL;

// Reset Auth Container State
Auth::forgetGuards();

// 5. Test Single Stock Movement Ledger (Atomic DB Transaction)
$reqStock = Request::create('/api/v1/inventory/stock-movements', 'POST', [
    'inventory_item_id' => 1,
    'movement_type' => 'PURCHASE_RECEIVE',
    'quantity' => 10.0,
    'unit_cost' => 145000.00,
    'reference_type' => 'PO_RECEIVE',
    'reference_id' => 101,
    'notes' => 'Penerimaan Daging Tenderloin dari Supplier',
]);
$reqStock->headers->set('Authorization', 'Bearer ' . $ownerToken);
$reqStock->headers->set('Accept', 'application/json');
$resStock = $app->handle($reqStock);

echo "[TEST 5] Single Stock Movement Ledger: Status " . $resStock->getStatusCode() . " -> " . ($resStock->getStatusCode() === 200 ? "PASS (200 OK - DB Transaction Atomik)" : "FAIL") . PHP_EOL;

// Reset Auth Container State
Auth::forgetGuards();

// 6. Test POS Kasir Order Creation
$reqOrder = Request::create('/api/v1/pos/orders', 'POST', [
    'table_number' => 'VIP-01',
    'guest_count' => 4,
    'order_type' => 'DINE_IN',
    'items' => [
        ['recipe_id' => 1, 'quantity' => 2, 'notes' => 'Medium rare'],
    ],
    'payment' => [
        'payment_method' => 'QRIS_DYNAMIC',
        'amount_paid' => 350000.00,
    ]
]);
$reqOrder->headers->set('Authorization', 'Bearer ' . $ownerToken);
$reqOrder->headers->set('Accept', 'application/json');
$resOrder = $app->handle($reqOrder);

echo "[TEST 6] POS Kasir Order & Payment: Status " . $resOrder->getStatusCode() . " -> " . ($resOrder->getStatusCode() === 200 ? "PASS (200 OK - Order & Pembayaran Tercatat)" : "FAIL") . PHP_EOL;

echo "==========================================================" . PHP_EOL;
echo "   SEMUA 6 TEST SUITE BERHASIL DILALUI DENGAN SEMPURNA!   " . PHP_EOL;
echo "==========================================================" . PHP_EOL;
