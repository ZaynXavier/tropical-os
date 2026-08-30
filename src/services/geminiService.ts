/**
 * TropicalOS - Google Gemini AI Client Service
 * Features Dual-Channel Architecture:
 * 1. Primary: Laravel Backend API (/api/v1/ai)
 * 2. Fallback: Direct Google Gemini 3.6 Flash API Call
 */

export function getGeminiApiKey(): string {
  return localStorage.getItem('TROPICAL_GEMINI_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key: string): void {
  if (key) {
    localStorage.setItem('TROPICAL_GEMINI_KEY', key.trim());
  } else {
    localStorage.removeItem('TROPICAL_GEMINI_KEY');
  }
}

const GEMINI_DIRECT_MODEL = 'gemini-2.0-flash';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_API_BASE_URL = `${API_BASE_URL}/ai`;

export interface AiAnalysisResponse {
  success: boolean;
  data?: {
    analysis?: string;
    content?: string;
    reply?: string;
  };
  message?: string;
}

/**
 * Direct call to Google Gemini API
 */
async function callDirectGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('API Key Google Gemini belum diatur. Silakan masukkan API Key Gemini Anda.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_DIRECT_MODEL}:generateContent?key=${apiKey}`;
  
  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(data.error?.message || 'Gagal memproses respon dari Google Gemini AI.');
}

export const geminiService = {
  /**
   * Minta Analisis Diagnosa KPI Bisnis Eksekutif
   */
  async analyzeKpi(kpiData: Record<string, any>, period: string = 'Bulan Ini'): Promise<AiAnalysisResponse> {
    // 1. Coba lewat backend Laravel
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BACKEND_API_BASE_URL}/analyze-kpi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ kpi_data: kpiData, period }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) return data;
      }
    } catch (backendErr) {
      console.warn('[GeminiService] Backend unreachable, falling back to direct AI channel...', backendErr);
    }

    // 2. Direct Fallback ke Google Gemini API
    try {
      const system = "Anda adalah Business Analyst & Chief Restaurant Strategist untuk Tropical Garden Resto. Berikan diagnosa berbasis data, ringkas, tajam, dan langsung dapat dieksekusi oleh Owner & General Manager.";
      const prompt = `Berikut adalah ringkasan KPI Tropical Garden Resto untuk periode ${period}:\n${JSON.stringify(kpiData, null, 2)}\n\nTolong buatkan analisa ringkas:\n1. Ringkasan Kesehatan Finansial & Operasional\n2. Diagnosa Kritis & Peluang Optimalisasi\n3. 3 Langkah Strategis Utama untuk meningkatkan laba.`;

      const text = await callDirectGemini(prompt, system);
      return {
        success: true,
        data: { analysis: text },
      };
    } catch (directErr: any) {
      return {
        success: false,
        message: directErr.message || 'Gagal memproses analisis AI.',
      };
    }
  },

  /**
   * Generator Ide Konten Media Sosial & Copywriting
   */
  async generateSocialContent(topic: string, platform: string = 'Instagram Reels', targetAudience?: string): Promise<AiAnalysisResponse> {
    // 1. Coba lewat backend Laravel
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BACKEND_API_BASE_URL}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic, platform, target_audience: targetAudience }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) return data;
      }
    } catch (backendErr) {
      console.warn('[GeminiService] Backend unreachable, falling back to direct AI channel...', backendErr);
    }

    // 2. Direct Fallback ke Google Gemini API
    try {
      const system = "Anda adalah Social Media Strategist & Viral Copywriter profesional untuk Tropical Garden Resto.";
      const prompt = `Buatkan konsep konten untuk platform ${platform}.\nTopik: ${topic}\nTarget Audiens: ${targetAudience || 'Keluarga & Pecinta Kuliner'}\n\nFormat:\n- Konsep Video Hook 3 Detik\n- Caption Storytelling Menarik\n- Call To Action (CTA)\n- 15 Hashtag Viral`;

      const text = await callDirectGemini(prompt, system);
      return {
        success: true,
        data: { content: text },
      };
    } catch (directErr: any) {
      return {
        success: false,
        message: directErr.message || 'Gagal membuat ide konten AI.',
      };
    }
  },

  /**
   * Draf Balasan Pesan CRM Tamu VIP (Friendly Assistant)
   */
  async draftCrmReply(customerMessage: string, context?: string): Promise<AiAnalysisResponse> {
    // 1. Coba lewat backend TypeScript
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/generate-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: customerMessage, customerName: context }),
      });

      const data = await response.json();
      if (data.success && data.data?.reply) {
        return {
          success: true,
          data: { reply: data.data.reply },
        };
      }
    } catch (backendErr) {
      console.warn('[GeminiService] Backend unreachable, trying direct Gemini key...', backendErr);
    }

    // 2. Direct Fallback ke Google Gemini API
    try {
      const system = "Anda adalah Asisten Virtual Resmi dan Ramah dari Tropical Garden Resto Bali. Jawab dengan sangat ramah, hangat, dan mengundang tamu untuk berkunjung 🌴✨.";
      const prompt = `Pesan tamu: "${customerMessage}". Buatkan draf balasan WhatsApp yang sangat ramah!`;

      const text = await callDirectGemini(prompt, system);
      return {
        success: true,
        data: { reply: text },
      };
    } catch (directErr: any) {
      return {
        success: true,
        data: {
          reply: `Halo Kak! Terima kasih telah menghubungi Tropical Garden Resto Bali 🌴✨. Kami siap melayani pesanan atau reservasi meja terbaik untuk Anda. Ada yang bisa kami bantu?`,
        },
      };
    }
  },
};
