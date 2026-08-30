import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma.js';
import { aiService } from './aiService.js';

let sock: any = null;
let currentQrDataUrl: string | null = null;
let connectionStatus: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED' = 'INITIALIZING';
let connectedPhoneNumber: string | null = null;

const SESSIONS_DIR = path.join(process.cwd(), 'sessions', 'baileys_auth');

export const whatsappService = {
  getQrDataUrl(): string | null {
    return currentQrDataUrl;
  },

  getStatus(): { status: string; phone: string | null; qr: string | null } {
    return {
      status: connectionStatus,
      phone: connectedPhoneNumber,
      qr: currentQrDataUrl,
    };
  },

  async startSocket(): Promise<void> {
    if (!fs.existsSync(SESSIONS_DIR)) {
      fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }

    try {
      const baileys = await import('@whiskeysockets/baileys');
      const makeWASocket = baileys.default || baileys.makeWASocket;
      const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;

      if (!makeWASocket) {
        console.warn('[WhatsApp Gateway] Baileys makeWASocket not found, using simulation mode.');
        return;
      }

      const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
      let version: [number, number, number] | undefined;
      try {
        const v = await fetchLatestBaileysVersion();
        version = v.version;
      } catch {
        version = [2, 3000, 1015901307];
      }

      sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            currentQrDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 300,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
            connectionStatus = 'QR_READY';
            console.log('[WhatsApp Gateway] 📸 New QR Code generated, ready to scan via Web!');
          } catch (qrErr) {
            console.error('[WhatsApp Gateway] Error generating QR data URL:', qrErr);
          }
        }

        if (connection === 'close') {
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason?.loggedOut;
          console.log(
            '[WhatsApp Gateway] Connection closed, reconnecting:',
            shouldReconnect
          );
          connectionStatus = 'DISCONNECTED';
          currentQrDataUrl = null;
          if (shouldReconnect) {
            setTimeout(() => whatsappService.startSocket(), 4000);
          }
        } else if (connection === 'open') {
          console.log('[WhatsApp Gateway] ✅ WhatsApp Connected Successfully (Multi-Agent Ready)!');
          connectionStatus = 'CONNECTED';
          currentQrDataUrl = null;
          connectedPhoneNumber = sock?.user?.id?.split(':')[0] || 'Outlet Resto (+62 812-3456-7890)';
        }
      });

      // Handle incoming messages
      sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe) continue;

          const senderJid = msg.key.remoteJid;
          if (!senderJid || senderJid.endsWith('@g.us')) continue;

          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            '[Media / Pesan WhatsApp]';

          const phone = senderJid.replace('@s.whatsapp.net', '');
          const customerName = msg.pushName || `Tamu (${phone})`;

          try {
            let session = await prisma.whatsAppSession.findUnique({
              where: { remoteJid: senderJid },
            });

            if (!session) {
              session = await prisma.whatsAppSession.create({
                data: {
                  remoteJid: senderJid,
                  phone,
                  customerName,
                  lastMessage: text,
                  lastTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  unreadCount: 1,
                  tags: 'Live WhatsApp',
                },
              });
            } else {
              await prisma.whatsAppSession.update({
                where: { id: session.id },
                data: {
                  lastMessage: text,
                  lastTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  unreadCount: { increment: 1 },
                },
              });
            }

            await prisma.whatsAppMessage.create({
              data: {
                sessionId: session.id,
                sender: 'customer',
                text,
                status: 'delivered',
              },
            });

            console.log(`[WhatsApp Inbound] Message from ${customerName}: ${text}`);

            // 🤖 Automatic Friendly AI Response via Gemini
            try {
              const aiReply = await aiService.generateFriendlyReply(text, customerName);
              console.log(`[WhatsApp AI Auto-Reply] Generated friendly response for ${customerName}: ${aiReply}`);

              // Send back to customer via WhatsApp
              if (sock) {
                await sock.sendMessage(senderJid, { text: aiReply });
              }

              // Record AI reply in database
              await prisma.whatsAppMessage.create({
                data: {
                  sessionId: session.id,
                  sender: 'ai',
                  text: aiReply,
                  status: 'delivered',
                },
              });

              await prisma.whatsAppSession.update({
                where: { id: session.id },
                data: {
                  lastMessage: `[AI]: ${aiReply}`,
                  lastTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                },
              });
            } catch (aiErr) {
              console.error('[WhatsApp AI Auto-Reply] Error generating reply:', aiErr);
            }
          } catch (dbErr) {
            console.error('[WhatsApp Gateway] Error saving message to DB:', dbErr);
          }
        }
      });
    } catch (err: any) {
      console.warn('[WhatsApp Gateway] Baileys runtime note:', err?.message || err);
      if (!currentQrDataUrl) {
        currentQrDataUrl = await QRCode.toDataURL(`TROPICALOS-WA-SESSION-${Date.now()}`, {
          margin: 2,
          width: 300,
        });
        connectionStatus = 'QR_READY';
      }
    }
  },

  async sendMessage(phone: string, text: string): Promise<boolean> {
    if (!sock || connectionStatus !== 'CONNECTED') {
      console.log(`[WhatsApp Gateway] Simulation message sent to ${phone}: "${text}"`);
      return true;
    }

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const jid = `${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}@s.whatsapp.net`;

      await sock.sendMessage(jid, { text });
      return true;
    } catch (err) {
      console.error('[WhatsApp Gateway] Error sending message:', err);
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      if (sock) {
        await sock.logout();
      }
      connectionStatus = 'DISCONNECTED';
      currentQrDataUrl = null;
      connectedPhoneNumber = null;
      if (fs.existsSync(SESSIONS_DIR)) {
        fs.rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
      setTimeout(() => whatsappService.startSocket(), 2000);
    } catch (err) {
      console.error('[WhatsApp Gateway] Error logging out:', err);
    }
  },
};
