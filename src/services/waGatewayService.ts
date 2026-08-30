/**
 * TropicalOS - WhatsApp Gateway Client Service
 * Connects to Fullstack TypeScript Backend at /api/v1/crm/whatsapp
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const CRM_WA_API_BASE = `${API_BASE_URL}/crm/whatsapp`;

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
  status?: string;
  isConnected?: boolean;
  phone?: string | null;
  qr?: string | null;
  message?: string;
}

export interface WaQrResponse {
  success: boolean;
  status?: string;
  isConnected?: boolean;
  phone?: string | null;
  qr?: string | null;
  message?: string;
}

export const waGatewayService = {
  /**
   * Cek status koneksi WhatsApp & QR Code Data URL
   */
  async getQr(): Promise<WaQrResponse> {
    try {
      const response = await fetch(`${CRM_WA_API_BASE}/qr`, {
        signal: AbortSignal.timeout(4000),
      });
      const data = await response.json();
      return {
        success: data.success,
        status: data.status,
        isConnected: data.status === 'CONNECTED',
        phone: data.phone,
        qr: data.qr,
      };
    } catch (err) {
      return {
        success: false,
        isConnected: false,
        status: 'DISCONNECTED',
        message: 'Backend server offline.',
      };
    }
  },

  /**
   * Cek status koneksi WhatsApp
   */
  async getStatus(): Promise<WaStatusResponse> {
    return this.getQr();
  },

  /**
   * Ambil daftar riwayat obrolan pesan dari server
   */
  async getChats(): Promise<{ success: boolean; chats?: WaChatSession[] }> {
    try {
      const response = await fetch(`${CRM_WA_API_BASE}/chats`, {
        signal: AbortSignal.timeout(4000),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, chats: [] };
    }
  },

  /**
   * Kirim pesan WhatsApp ke nomor HP pelanggan
   */
  async sendMessage(phone: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`${CRM_WA_API_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: text }),
      });
      const data = await response.json();
      return !!data.success;
    } catch (err) {
      console.warn('[WaGatewayService] Error sending message:', err);
      return false;
    }
  },

  /**
   * Logout dan Reset Sesi QR WhatsApp
   */
  async logout(): Promise<boolean> {
    try {
      const response = await fetch(`${CRM_WA_API_BASE}/logout`, {
        method: 'POST',
      });
      const data = await response.json();
      return !!data.success;
    } catch (err) {
      return false;
    }
  },
};
