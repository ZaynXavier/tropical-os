<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    protected WhatsAppService $waService;

    public function __construct(WhatsAppService $waService)
    {
        $this->waService = $waService;
    }

    /**
     * Cek status koneksi WhatsApp
     */
    public function getStatus(): JsonResponse
    {
        $result = $this->waService->getStatus();
        return response()->json($result);
    }

    /**
     * Ambil data QR Code scan
     */
    public function getQrCode(): JsonResponse
    {
        $result = $this->waService->getQrCode();
        return response()->json($result);
    }

    /**
     * Kirim pesan WhatsApp kustom
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:2000',
        ]);

        $to = $request->input('to');
        $message = $request->input('message');

        $result = $this->waService->sendMessage($to, $message);

        if (!($result['success'] ?? false)) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    /**
     * Kirim konfirmasi reservasi
     */
    public function sendReservation(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'guestName' => 'required|string',
        ]);

        $result = $this->waService->sendReservationConfirmation($request->all());

        if (!($result['success'] ?? false)) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    /**
     * Logout / disconnect
     */
    public function logout(): JsonResponse
    {
        $result = $this->waService->logout();
        return response()->json($result);
    }
}
