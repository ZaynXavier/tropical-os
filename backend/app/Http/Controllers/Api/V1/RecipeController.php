<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $query = Recipe::with(['station', 'ingredients.item'])->where('is_active', true);

        if ($category) {
            $query->where('category', $category);
        }

        $recipes = $query->get()->map(function ($recipe) {
            // Kalkulasi Theoretical Cost dari WAC bahan
            $totalCost = 0.0;
            foreach ($recipe->ingredients as $ingredient) {
                $itemAvgCost = (float) ($ingredient->item->average_cost ?? 0);
                $qty = (float) $ingredient->quantity;
                $yield = (float) ($ingredient->yield_percentage ?? 100.0) / 100.0;
                $cost = ($yield > 0) ? ($qty * $itemAvgCost) / $yield : 0;
                $totalCost += $cost;
            }

            $recipe->theoretical_cost = round($totalCost, 2);
            $sellingPrice = (float) $recipe->selling_price;
            $recipe->food_cost_percentage = ($sellingPrice > 0) ? round(($totalCost / $sellingPrice) * 100, 2) : 0.0;

            return $recipe;
        });

        return response()->json([
            'success' => true,
            'data' => $recipes,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $recipe = Recipe::with(['station.area', 'ingredients.item'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $recipe,
        ]);
    }
}
