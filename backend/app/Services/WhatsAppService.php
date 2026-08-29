<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(env('WA_GATEWAY_URL', 'http://127.0.0.1:3000'), '/');
    }

    /**
     * Cek status koneksi WhatsApp Gateway
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->gatewayUrl}/status");
            if ($response->successful()) {
                return $response->json();
            }
            return [
                'success' => false,
                'isConnected' => false,
                'message' => 'Layanan WA Gateway tidak merespons status.',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'isConnected' => false,
                'message' => 'WhatsApp Gateway offline: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Ambil data QR Code untuk dipindai
     */
    public function getQrCode(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->gatewayUrl}/qr");
            return $response->json();
        } catch (\Exception $e) {
            return [
                'success' => false,
                'isConnected' => false,
                'message' => 'Gagal mengambil QR Code: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim pesan teks WhatsApp
     */
    public function sendMessage(string $phoneNumber, string $message): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->gatewayUrl}/send-message", [
                'to' => $phoneNumber,
                'message' => $message,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal mengirim pesan via WhatsApp Gateway.',
            ];
        } catch (\Exception $e) {
            Log::error('[WhatsAppService] Error sending message: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke WA Gateway gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim konfirmasi reservasi ke tamu
     */
    public function sendReservationConfirmation(array $res): array
    {
        $guestName = $res['guestName'] ?? 'Bpk/Ibu Tamu';
        $resCode = $res['reservationCode'] ?? 'TG-RES';
        $pax = $res['pax'] ?? 2;
        $date = $res['date'] ?? date('d-m-Y');
        $time = $res['time'] ?? '12:00';
        $area = $res['area'] ?? 'Garden Area';
        $tableNo = $res['tableNo'] ?? '-';
        $phone = $res['phone'] ?? '';

        if (empty($phone)) {
            return ['success' => false, 'message' => 'Nomor HP tamu tidak valid.'];
        }

        $message = "🌴 *KONFIRMASI RESERVASI MEJA* 🌴\n"
            . "*Tropical Garden Resto*\n"
            . "────────────────────────\n"
            . "Halo *{$guestName}*,\n\n"
            . "Terima kasih telah melakukan reservasi di Tropical Garden Resto. Reservasi Anda telah terkonfirmasi dengan detail berikut:\n\n"
            . "🔖 *Kode Reservasi:* {$resCode}\n"
            . "📅 *Tanggal:* {$date}\n"
            . "⏰ *Waktu:* {$time} WIB\n"
            . "👥 *Jumlah Tamu:* {$pax} Pax\n"
            . "📍 *Area / Meja:* {$area} ({$tableNo})\n\n"
            . "✨ *Catatan:* Mohon hadir 10 menit sebelum waktu reservasi. Jika ada perubahan jadwal atau pertanyaan, Anda dapat langsung membalas pesan ini.\n\n"
            . "Sampai jumpa di *Tropical Garden Resto!* 🌿🥩🍽️\n"
            . "_TropicalOS Automated Messaging_";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Putus sesi WhatsApp
     */
    public function logout(): array
    {
        try {
            $response = Http::timeout(5)->post("{$this->gatewayUrl}/logout");
            return $response->json();
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Gagal logout WA: ' . $e->getMessage(),
            ];
        }
    }
}
