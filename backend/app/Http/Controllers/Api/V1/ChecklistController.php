<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChecklistExecution;
use App\Models\ChecklistTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChecklistController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $stationId = $request->query('station_id');

        $query = ChecklistTemplate::with(['items', 'station.area'])
            ->where('is_active', true);

        if ($stationId) {
            $query->where('station_id', $stationId);
        }

        $templates = $query->get();

        $executions = ChecklistExecution::where('date', $today)->get()->keyBy('checklist_template_item_id');

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $today,
                'templates' => $templates,
                'executions' => $executions,
            ],
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'checklist_template_id' => 'required|exists:checklist_templates,id',
            'checklist_template_item_id' => 'required|exists:checklist_template_items,id',
            'status' => 'required|in:COMPLETED,FAILED,SKIPPED',
            'numeric_value' => 'nullable|numeric',
            'note' => 'nullable|string',
            'evidence_photo_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = $request->user()->employee;
        $today = now()->toDateString();

        $execution = ChecklistExecution::updateOrCreate(
            [
                'checklist_template_id' => $request->checklist_template_id,
                'checklist_template_item_id' => $request->checklist_template_item_id,
                'date' => $today,
            ],
            [
                'employee_id' => $employee?->id ?? 1,
                'status' => $request->status,
                'numeric_value' => $request->numeric_value,
                'note' => $request->note,
                'evidence_photo_url' => $request->evidence_photo_url,
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Checklist item berhasil diselesaikan.',
            'data' => $execution,
        ]);
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        $execution = ChecklistExecution::findOrFail($id);
        $supervisor = $request->user()->employee;

        $execution->update([
            'status' => 'VERIFIED',
            'verified_by' => $supervisor?->id ?? 1,
            'verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item checklist berhasil diverifikasi oleh Supervisor.',
            'data' => $execution,
        ]);
    }
}
