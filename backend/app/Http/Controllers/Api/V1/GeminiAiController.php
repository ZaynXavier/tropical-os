<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\GeminiAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeminiAiController extends Controller
{
    protected GeminiAiService $geminiService;

    public function __construct(GeminiAiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Analisis KPI Eksekutif via AI
     */
    public function analyzeKpi(Request $request): JsonResponse
    {
        $kpiData = $request->input('kpi_data', []);
        $period = $request->input('period', 'Bulan Ini');

        $result = $this->geminiService->analyzeExecutiveKpi($kpiData, $period);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal menganalisis data dengan AI',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'analysis' => $result['text'],
            ]
        ]);
    }

    /**
     * Generator Konten Sosial Media & Copywriting
     */
    public function generateContent(Request $request): JsonResponse
    {
        $request->validate([
            'topic' => 'required|string|max:500',
            'platform' => 'nullable|string',
            'target_audience' => 'nullable|string',
        ]);

        $topic = $request->input('topic');
        $platform = $request->input('platform', 'Instagram Reels');
        $audience = $request->input('target_audience');

        $result = $this->geminiService->generateSocialContent($topic, $platform, $audience);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal membuat konten dengan AI',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'content' => $result['text'],
            ]
        ]);
    }

    /**
     * Draf Balasan Pesan CRM Tamu
     */
    public function draftReply(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'context' => 'nullable|string|max:500',
        ]);

        $message = $request->input('message');
        $context = $request->input('context');

        $result = $this->geminiService->draftCrmResponse($message, $context);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal membuat balasan dengan AI',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'reply' => $result['text'],
            ]
        ]);
    }
}
