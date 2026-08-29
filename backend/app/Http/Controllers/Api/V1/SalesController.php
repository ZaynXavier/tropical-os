<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\SalesPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SalesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());
        $orders = SalesOrder::with(['cashier', 'items.recipe', 'payments'])
            ->whereDate('created_at', $date)
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'table_number' => 'nullable|string',
            'guest_count' => 'required|integer|min:1',
            'order_type' => 'required|in:DINE_IN,TAKE_AWAY,RESERVATION_EVENT,DELIVERY',
            'items' => 'required|array|min:1',
            'items.*.recipe_id' => 'required|exists:recipes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'payment' => 'nullable|array',
            'payment.payment_method' => 'required_with:payment|in:CASH,QRIS_STATIC,QRIS_DYNAMIC,EDC_BCA_DEBIT,EDC_MANDIRI_DEBIT,CREDIT_CARD,BANK_TRANSFER',
            'payment.amount_paid' => 'required_with:payment|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = $request->user()->employee;

        $order = DB::transaction(function () use ($request, $employee) {
            $subtotal = 0.0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $recipe = Recipe::findOrFail($item['recipe_id']);
                $qty = (int) $item['quantity'];
                $unitPrice = (float) $recipe->selling_price;
                $unitCost = (float) $recipe->theoretical_cost;
                $lineTotal = $qty * $unitPrice;
                $lineCost = $qty * $unitCost;

                $subtotal += $lineTotal;

                $itemsData[] = [
                    'recipe_id' => $recipe->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'unit_cost' => $unitCost,
                    'subtotal_price' => $lineTotal,
                    'subtotal_cost' => $lineCost,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            $serviceCharge = $subtotal * 0.05; // 5% service charge
            $tax = ($subtotal + $serviceCharge) * 0.10; // 10% PB1 pajak resto
            $grandTotal = $subtotal + $serviceCharge + $tax;

            $isPaid = !empty($request->payment);
            $orderNumber = 'TG-ORD-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            $salesOrder = SalesOrder::create([
                'uuid' => (string) Str::uuid(),
                'order_number' => $orderNumber,
                'table_number' => $request->table_number,
                'guest_count' => $request->guest_count,
                'subtotal_amount' => $subtotal,
                'discount_amount' => 0.00,
                'service_charge_amount' => $serviceCharge,
                'tax_amount' => $tax,
                'total_amount' => $grandTotal,
                'order_type' => $request->order_type,
                'status' => $isPaid ? 'PAID' : 'ORDER_SENT',
                'cashier_id' => $employee?->id ?? 1,
            ]);

            foreach ($itemsData as $row) {
                $row['sales_order_id'] = $salesOrder->id;
                SalesOrderItem::create($row);
            }

            if ($isPaid) {
                $amountPaid = (float) $request->payment['amount_paid'];
                $change = max(0, $amountPaid - $grandTotal);

                SalesPayment::create([
                    'sales_order_id' => $salesOrder->id,
                    'payment_method' => $request->payment['payment_method'],
                    'amount_paid' => $amountPaid,
                    'change_amount' => $change,
                    'reference_no' => $request->payment['reference_no'] ?? null,
                    'created_at' => now(),
                ]);
            }

            return $salesOrder->load(['items.recipe', 'payments']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan POS kasir berhasil dibuat.',
            'data' => $order,
        ]);
    }
}
