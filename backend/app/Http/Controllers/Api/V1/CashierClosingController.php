<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CashierClosing;
use App\Models\SalesOrder;
use App\Models\SalesPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CashierClosingController extends Controller
{
    public function summaryToday(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $shiftId = $request->query('shift_id', 1);

        $cashSales = SalesPayment::whereDate('created_at', $today)
            ->where('payment_method', 'CASH')
            ->sum('amount_paid');

        $nonCashSales = SalesPayment::whereDate('created_at', $today)
            ->where('payment_method', '!=', 'CASH')
            ->sum('amount_paid');

        $totalTransactions = SalesOrder::whereDate('created_at', $today)
            ->where('status', 'PAID')
            ->count();

        $openingFloat = 500000.00;
        $expectedCash = $openingFloat + $cashSales;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $today,
                'shift_id' => $shiftId,
                'opening_cash_float' => $openingFloat,
                'system_cash_sales' => (float) $cashSales,
                'system_non_cash_sales' => (float) $nonCashSales,
                'expected_cash_in_drawer' => (float) $expectedCash,
                'total_transactions' => $totalTransactions,
            ],
        ]);
    }

    public function submitClosing(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shift_id' => 'required|exists:shifts,id',
            'opening_cash_float' => 'required|numeric|min:0',
            'actual_physical_cash' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = $request->user()->employee;
        $today = now()->toDateString();

        $cashSales = (float) SalesPayment::whereDate('created_at', $today)->where('payment_method', 'CASH')->sum('amount_paid');
        $nonCashSales = (float) SalesPayment::whereDate('created_at', $today)->where('payment_method', '!=', 'CASH')->sum('amount_paid');
        $totalTransactions = SalesOrder::whereDate('created_at', $today)->where('status', 'PAID')->count();

        $openingFloat = (float) $request->opening_cash_float;
        $actualCash = (float) $request->actual_physical_cash;
        $expectedCash = $openingFloat + $cashSales;
        $variance = $actualCash - $expectedCash;

        $closingNumber = 'CLS-' . date('Ymd') . '-S' . $request->shift_id;

        $closing = CashierClosing::updateOrCreate(
            [
                'closing_number' => $closingNumber,
            ],
            [
                'shift_id' => $request->shift_id,
                'cashier_id' => $employee?->id ?? 1,
                'opening_cash_float' => $openingFloat,
                'system_cash_sales' => $cashSales,
                'system_non_cash_sales' => $nonCashSales,
                'actual_physical_cash' => $actualCash,
                'cash_variance' => $variance,
                'total_transactions' => $totalTransactions,
                'status' => (abs($variance) > 5000) ? 'DISCREPANCY' : 'SUBMITTED',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tutup kasir berhasil dicatat ke sistem.',
            'data' => $closing,
        ]);
    }
}
