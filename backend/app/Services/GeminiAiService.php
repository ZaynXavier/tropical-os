<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAiService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
        $this->model = env('GEMINI_MODEL', 'gemini-1.5-flash');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . $this->model . ':generateContent';
    }

    /**
     * Send prompt to Google Gemini API
     */
    public function generate(string $prompt, ?string $systemInstruction = null): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message' => 'Gemini API Key belum dikonfigurasi pada environment server.',
            ];
        }

        try {
            $payload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 2048,
                ]
            ];

            if ($systemInstruction) {
                $payload['systemInstruction'] = [
                    'parts' => [
                        ['text' => $systemInstruction]
                    ]
                ];
            }

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($this->baseUrl . '?key=' . $this->apiKey, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

                return [
                    'success' => true,
                    'text' => $text,
                    'raw' => $data,
                ];
            }

            $errorData = $response->json();
            Log::error('[GeminiAiService] API Error: ', $errorData ?? ['status' => $response->status()]);

            return [
                'success' => false,
                'message' => $errorData['error']['message'] ?? 'Gagal memproses permintaan AI Gemini.',
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('[GeminiAiService] Exception: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghubungi server AI: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Analisis Executive KPI Resto
     */
    public function analyzeExecutiveKpi(array $kpiData, string $period = 'Bulan Ini'): array
    {
        $system = "Anda adalah Business Analyst & Chief Restaurant Strategist untuk Tropical Garden Resto (Restoran Dining & Garden Berstandar Tinggi di Bali/Indonesia). Berikan diagnosa berbasis data, ringkas, tajam, dan dapat langsung dieksekusi oleh Owner & General Manager.";
        
        $prompt = "Berikut adalah ringkasan Key Performance Indicators (KPI) Tropical Garden Resto untuk periode {$period}:\n"
            . json_encode($kpiData, JSON_PRETTY_PRINT) . "\n\n"
            . "Tolong buatkan analisa dalam format berikut:\n"
            . "1. **Ringkasan Kesehatan Finansial & Operasional** (1-2 paragraf)\n"
            . "2. **Diagnosa Kritis & Peluang Optimalisasi** (Poin-poin prioritas)\n"
            . "3. **3 Langkah Strategis Utama (Action Plan)** untuk meningkatkan laba bersih & kepuasan tamu.";

        return $this->generate($prompt, $system);
    }

    /**
     * Generator Ide Konten Media Sosial & Copywriting
     */
    public function generateSocialContent(string $topic, string $platform = 'Instagram Reels', ?string $targetAudience = null): array
    {
        $system = "Anda adalah Social Media Strategist & Viral Copywriter profesional untuk Tropical Garden Resto. Restoran bertema taman tropis yang menyajikan sajian istimewa seperti Wagyu Ribeye Meltique Steak, Ikan Gurame Terbang Saus Mangga, Artisanal Coffee, dan suasana asri dining & wedding gazebo.";

        $prompt = "Tolong buatkan konsep konten dan draf postingan untuk platform {$platform}.\n"
            . "Topik / Menu / Event: {$topic}\n"
            . "Target Audiens: " . ($targetAudience ?? 'Wisatawan, Keluarga, Pasangan, Pecinta Kuliner Kualitas Premium') . "\n\n"
            . "Format yang diharapkan:\n"
            . "- **Konsep Video / Visual (Hook 3 Detik Pertama)**\n"
            . "- **Caption Menarik (Storytelling & Emosional)**\n"
            . "- **Call to Action (CTA)** untuk reservasi meja\n"
            . "- **Hashtag Relevan & Viral** (15-20 hashtag)";

        return $this->generate($prompt, $system);
    }

    /**
     * Draf Balasan Pesan CRM & Tamu VIP
     */
    public function draftCrmResponse(string $customerMessage, ?string $context = null): array
    {
        $system = "Anda adalah VIP Guest Relationship Officer untuk Tropical Garden Resto. Nada bicara Anda sangat sopan, ramah, profesional, hangat (hospitality tinggi), dan solutif.";

        $prompt = "Pesan / Pertanyaan Tamu:\n\"{$customerMessage}\"\n"
            . ($context ? "Konteks Tambahan: {$context}\n" : "") . "\n"
            . "Tolong buatkan draf balasan WhatsApp yang elegan, lengkap dengan informasi yang dibutuhkan, dan mengundang untuk reservasi meja/acara di Tropical Garden Resto.";

        return $this->generate($prompt, $system);
    }
}
