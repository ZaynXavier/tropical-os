<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $query = InventoryItem::where('is_active', true);

        if ($category) {
            $query->where('category', $category);
        }

        $items = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $item = InventoryItem::with(['movements' => function ($query) {
            $query->latest('created_at')->limit(30);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Single Stock Movement Ledger Engine
     * Atomik via DB::transaction
     */
    public function recordMovement(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'movement_type' => 'required|in:PURCHASE_RECEIVE,PRODUCTION_USAGE,PRODUCTION_YIELD,WASTE_EXPIRED,WASTE_DAMAGED,WASTE_SPOILAGE,STOCK_OPNAME_ADJUSTMENT,TRANSFER_INTER_STATION',
            'quantity' => 'required|numeric',
            'unit_cost' => 'required|numeric|min:0',
            'reference_type' => 'required|string',
            'reference_id' => 'required|integer',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = $request->user()->employee;

        $movement = DB::transaction(function () use ($request, $employee) {
            $item = InventoryItem::lockForUpdate()->findOrFail($request->inventory_item_id);
            $qty = (float) $request->quantity;
            $unitCost = (float) $request->unit_cost;
            $totalCost = abs($qty) * $unitCost;

            // Update Stok
            $oldStock = (float) $item->current_stock;
            $newStock = $oldStock + $qty;

            // Recalculate Weighted Average Cost (WAC) for incoming purchases
            if ($qty > 0 && in_array($request->movement_type, ['PURCHASE_RECEIVE', 'PRODUCTION_YIELD'])) {
                $oldValue = $oldStock * (float) $item->average_cost;
                $incomingValue = $qty * $unitCost;
                $newAverageCost = ($newStock > 0) ? ($oldValue + $incomingValue) / $newStock : $unitCost;

                $item->average_cost = round($newAverageCost, 2);
                $item->last_purchase_cost = $unitCost;
            }

            $item->current_stock = $newStock;
            $item->save();

            // Insert Append-Only Ledger Entry
            return StockMovement::create([
                'uuid' => (string) Str::uuid(),
                'inventory_item_id' => $item->id,
                'movement_type' => $request->movement_type,
                'quantity' => $qty,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'reference_type' => $request->reference_type,
                'reference_id' => $request->reference_id,
                'notes' => $request->notes,
                'created_by' => $employee?->id ?? 1,
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Mutasi persediaan berhasil dicatat ke Single Stock Ledger.',
            'data' => $movement,
        ]);
    }
}
