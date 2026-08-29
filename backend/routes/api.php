<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CashierClosingController;
use App\Http\Controllers\Api\V1\ChecklistController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\GeminiAiController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\RecipeController;
use App\Http\Controllers\Api\V1\SalesController;
use App\Http\Controllers\Api\V1\StationController;
use App\Http\Controllers\Api\V1\WhatsAppController;
use App\Http\Middleware\RestrictKpiAccessMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TropicalOS REST API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    // WhatsApp Gateway status & QR (accessible for linking)
    Route::prefix('whatsapp')->group(function () {
        Route::get('/status', [WhatsAppController::class, 'getStatus']);
        Route::get('/qr', [WhatsAppController::class, 'getQrCode']);
        Route::post('/send', [WhatsAppController::class, 'send']);
        Route::post('/send-reservation', [WhatsAppController::class, 'sendReservation']);
        Route::post('/logout', [WhatsAppController::class, 'logout']);
    });

    // Gemini AI Public/Protected Endpoints
    Route::prefix('ai')->group(function () {
        Route::post('/analyze-kpi', [GeminiAiController::class, 'analyzeKpi']);
        Route::post('/generate-content', [GeminiAiController::class, 'generateContent']);
        Route::post('/draft-reply', [GeminiAiController::class, 'draftReply']);
    });

    // Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {

        // User & Session
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // HR & Presensi GPS
        Route::prefix('hr/attendance')->group(function () {
            Route::get('/today', [AttendanceController::class, 'today']);
            Route::post('/clock-in', [AttendanceController::class, 'clockIn']);
            Route::post('/clock-out', [AttendanceController::class, 'clockOut']);
            Route::post('/break/start', [AttendanceController::class, 'startBreak']);
            Route::post('/break/end', [AttendanceController::class, 'endBreak']);
        });

        // Operasional Resto & Stasiun
        Route::prefix('operations')->group(function () {
            Route::get('/stations', [StationController::class, 'index']);
            Route::get('/stations/{id}', [StationController::class, 'show']);
            Route::get('/checklists/today', [ChecklistController::class, 'today']);
            Route::post('/checklists/submit', [ChecklistController::class, 'submit']);
            Route::post('/checklists/{id}/verify', [ChecklistController::class, 'verify']);
        });

        // Inventory & Resep HPP
        Route::prefix('inventory')->group(function () {
            Route::get('/items', [InventoryController::class, 'index']);
            Route::get('/items/{id}', [InventoryController::class, 'show']);
            Route::post('/stock-movements', [InventoryController::class, 'recordMovement']);
            Route::get('/recipes', [RecipeController::class, 'index']);
            Route::get('/recipes/{id}', [RecipeController::class, 'show']);
        });

        // POS Kasir & Penjualan
        Route::prefix('pos')->group(function () {
            Route::get('/orders', [SalesController::class, 'index']);
            Route::post('/orders', [SalesController::class, 'createOrder']);
            Route::get('/closings/summary-today', [CashierClosingController::class, 'summaryToday']);
            Route::post('/closings', [CashierClosingController::class, 'submitClosing']);
        });

        // Executive Dashboard (Protected by KPI Middleware)
        Route::prefix('dashboard')->group(function () {
            Route::get('/executive', [DashboardController::class, 'executive'])
                ->middleware('restrict.kpi');
        });

    });
});
