<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OperationalArea;
use App\Models\OperationalStation;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    public function index(): JsonResponse
    {
        $areas = OperationalArea::with(['stations' => function ($query) {
            $query->where('status', 'ACTIVE');
        }])->where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $station = OperationalStation::with(['area', 'checklistTemplates.items', 'recipes'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $station,
        ]);
    }
}
