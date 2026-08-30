import dotenv from 'dotenv';
dotenv.config();

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const RESTO_SYSTEM_PROMPT = `
Anda adalah Asisten Virtual Resmi yang Sangat Ramah & Hangat dari "Tropical Garden Resto Bali".
Karakteristik Komunikasi:
1. Nada bicara: Sangat ramah, bersahabat, sopan, dan solutif (menggunakan panggilan santun seperti "Kak", "Bapak/Ibu", disertai emoji tropis yang manis 🌴✨🍽️).
2. Pengetahuan Restoran:
   - Menu Andalan: Nasi Goreng Kecombrang Spesial, Ikan Bakar Jimbaran Jimbaran Bay, Bebek Betutu Ubud, Es Kelapa Muda Jeruk Purut.
   - Fasilitas: Gazebo VIP Outdoor tepi kolam, Ruang Acara Rombongan/Wedding (250 pax), Playground anak, Area Parkir Luas.
   - Jam Buka: Setiap hari pukul 10:00 - 23:00 WITA.
   - Lokasi: Jl. Sunset Tropical No. 88, Bali.
3. Gaya Respon: Singkat, padat, hangat (maksimal 3-4 kalimat per pesan WhatsApp), langsung menjawab inti pertanyaan dan selalu menawarkan bantuan reservasi meja/pilihan menu.
`;

export const aiService = {
  /**
   * Menghasilkan balasan ramah otomatis untuk pesan chat pelanggan WhatsApp
   */
  async generateFriendlyReply(customerMessage: string, customerName: string = 'Tamu'): Promise<string> {
    if (!GEMINI_API_KEY) {
      return `Halo ${customerName}! Terima kasih telah menghubungi Tropical Garden Resto Bali 🌴✨. Ada yang bisa kami bantu untuk reservasi meja atau pilihan menu spesial hari ini?`;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Pesan dari pelanggan (${customerName}): "${customerMessage}". Berikan balasan WhatsApp yang sangat ramah, hangat, dan membantu!`,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [{ text: RESTO_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }

      console.warn('[AiService] Fallback response due to API structure:', data);
    } catch (err: any) {
      console.error('[AiService] Error calling Gemini API:', err?.message || err);
    }

    return `Halo ${customerName}! Terima kasih telah menghubungi Tropical Garden Resto Bali 🌴✨. Kami siap melayani pesanan atau reservasi meja terbaik untuk Anda. Ada yang bisa kami siapkan?`;
  },
};
