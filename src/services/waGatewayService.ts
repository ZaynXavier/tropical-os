/**
 * TropicalOS - WhatsApp Gateway Client Service
 * Connects via Laravel Backend or direct to Baileys Microservice on port 5001
 */

const LARAVEL_API_BASE = 'http://localhost:8000/api/v1/whatsapp';
const DIRECT_WA_GATEWAY = 'http://127.0.0.1:5001';

export interface WaMessageItem {
  id: string;
  sender: 'customer' | 'staff';
  text: string;
  time: string;
  timestamp?: number;
}

export interface WaChatSession {
  id: string;
  jid: string;
  customerName: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: WaMessageItem[];
}

export interface WaStatusResponse {
  success: boolean;
  isConnected?: boolean;
  user?: {
    id?: string;
    name?: string;
  };
  phone?: string;
  qrAvailable?: boolean;
  totalChats?: number;
  message?: string;
}

export interface WaQrResponse {
  success: boolean;
  isConnected?: boolean;
  qr?: string;
  qrImage?: string;
  message?: string;
}

export interface WaSendResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  timestamp?: string;
  chat?: WaChatSession;
}

export const waGatewayService = {
  /**
   * Cek status koneksi WhatsApp
   */
  async getStatus(): Promise<WaStatusResponse> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/status`, { signal: AbortSignal.timeout(3000) });
      return await response.json();
    } catch (directErr) {
      try {
        const response = await fetch(`${LARAVEL_API_BASE}/status`, { signal: AbortSignal.timeout(3000) });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
      } catch (backendErr) {}
    }

    return {
      success: false,
      isConnected: false,
      message: 'Layanan WhatsApp Gateway offline.',
    };
  },

  /**
   * Ambil data gambar QR Code untuk scan
   */
  async getQr(): Promise<WaQrResponse> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/qr`, { signal: AbortSignal.timeout(3000) });
      return await response.json();
    } catch (directErr) {
      try {
        const response = await fetch(`${LARAVEL_API_BASE}/qr`, { signal: AbortSignal.timeout(3000) });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
      } catch (backendErr) {}
    }

    return {
      success: false,
      isConnected: false,
      message: 'Gagal memuat QR Code.',
    };
  },

  /**
   * Ambil seluruh percakapan tersinkronisasi
   */
  async getChats(): Promise<{ success: boolean; total?: number; chats?: WaChatSession[] }> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/chats`, { signal: AbortSignal.timeout(4000) });
      return await response.json();
    } catch (err) {
      return { success: false, total: 0, chats: [] };
    }
  },

  /**
   * Ambil riwayat chat spesifik
   */
  async getChatMessages(jid: string): Promise<{ success: boolean; chat?: WaChatSession }> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/chats/${encodeURIComponent(jid)}/messages`, { signal: AbortSignal.timeout(4000) });
      return await response.json();
    } catch (err) {
      return { success: false };
    }
  },

  /**
   * Kirim pesan teks WhatsApp kustom
   */
  async sendMessage(to: string, message: string): Promise<WaSendResponse> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      return await response.json();
    } catch (directErr) {
      try {
        const response = await fetch(`${LARAVEL_API_BASE}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, message }),
        });
        return await response.json();
      } catch (backendErr) {}
    }

    return {
      success: false,
      message: 'Gagal mengirim pesan: Service WhatsApp Gateway tidak merespons.',
    };
  },

  /**
   * Kirim konfirmasi reservasi
   */
  async sendReservationConfirmation(reservationData: {
    phone: string;
    guestName: string;
    reservationCode?: string;
    pax?: number;
    date?: string;
    time?: string;
    area?: string;
    tableNo?: string;
  }): Promise<WaSendResponse> {
    try {
      const response = await fetch(`${LARAVEL_API_BASE}/send-reservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal mengirim konfirmasi reservasi: ' + err.message,
      };
    }
  },

  /**
   * Putus sesi / Logout WA
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${DIRECT_WA_GATEWAY}/logout`, { method: 'POST' });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal logout WA: ' + err.message,
      };
    }
  },
};
