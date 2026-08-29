/**
 * TropicalOS - High-Performance WhatsApp Gateway Microservice
 * Powered by @whiskeysockets/baileys
 */

import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');
const STORE_FILE = path.join(__dirname, 'chat_history_store.json');

app.use(cors());
app.use(express.json());

let sock = null;
let currentQr = null;
let currentQrDataUrl = null;
let isConnected = false;
let connectedUser = null;

// Persistent Chat Store
let chatStore = {};

try {
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    chatStore = JSON.parse(raw);
    console.log(`📦 [WA-Gateway] Loaded ${Object.keys(chatStore).length} conversations from disk.`);
  }
} catch (e) {
  console.warn('⚠️ [WA-Gateway] Could not load chat store:', e.message);
}

function saveStoreToDisk() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(chatStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('❌ [WA-Gateway] Error saving store:', e.message);
  }
}

const logger = pino({ level: 'silent' });

function cleanJidToPhone(jid) {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

function extractMessageText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    (m.message?.imageMessage ? '📷 [Foto]' : '') ||
    (m.message?.videoMessage ? '🎥 [Video]' : '') ||
    (m.message?.audioMessage ? '🎵 [Pesan Suara]' : '') ||
    (m.message?.documentMessage ? '📄 [Dokumen]' : '') ||
    ''
  );
}

function formatTimestamp(ts) {
  if (!ts) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const date = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  let version = [2, 3000, 1015901307];
  try {
    const fetched = await fetchLatestBaileysVersion();
    version = fetched.version;
  } catch (e) {}

  sock = makeWASocket({
    version,
    logger,
    auth: state,
    generateHighQualityLinkPreview: true,
    browser: ['TropicalOS Resto', 'Chrome', '1.0.0'],
    syncFullHistory: true,
  });

  sock.ev.on('creds.update', saveCreds);

  // Connection Updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQr = qr;
      try {
        currentQrDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('Error generating QR DataURL:', err);
      }
      isConnected = false;
      console.log('⚡ [WA-Gateway] QR Code generated. Scan with WhatsApp!');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      isConnected = false;
      connectedUser = null;
      console.log(
        '⚠️ [WA-Gateway] Connection closed due to',
        lastDisconnect?.error?.message || lastDisconnect?.error,
        ', reconnecting:',
        shouldReconnect
      );

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('🔴 [WA-Gateway] Logged out. Clearing credentials...');
        try {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQr = null;
      currentQrDataUrl = null;
      connectedUser = sock.user;
      console.log('✅ [WA-Gateway] WhatsApp connection OPEN & Ready for Tropical Garden Resto!');
      console.log('📱 Connected as:', connectedUser?.id || connectedUser?.name);
    }
  });

  // History Sync
  sock.ev.on('messaging-history.set', ({ chats, contacts, messages }) => {
    console.log(`📥 [WA-Gateway] Received History Sync: ${chats?.length || 0} chats, ${messages?.length || 0} messages.`);
    const contactMap = {};
    if (contacts) {
      for (const c of contacts) {
        if (c.id && (c.name || c.notify)) {
          contactMap[c.id] = c.name || c.notify;
        }
      }
    }

    if (messages) {
      for (const m of messages) {
        const jid = m.key?.remoteJid;
        if (!jid || jid.includes('status@broadcast')) continue;

        const isFromMe = m.key?.fromMe;
        const text = extractMessageText(m);
        if (!text) continue;

        const phone = cleanJidToPhone(jid);
        const customerName = contactMap[jid] || m.pushName || `+${phone}`;
        const time = formatTimestamp(m.messageTimestamp);

        if (!chatStore[jid]) {
          chatStore[jid] = {
            id: jid,
            jid,
            customerName,
            phone: `+${phone}`,
            unreadCount: 0,
            lastMessage: text,
            lastTime: time,
            messages: [],
          };
        }

        const msgObj = {
          id: m.key?.id || `msg-${Date.now()}`,
          sender: isFromMe ? 'staff' : 'customer',
          text,
          time,
          timestamp: m.messageTimestamp,
        };

        if (!chatStore[jid].messages.some((x) => x.id === msgObj.id)) {
          chatStore[jid].messages.push(msgObj);
        }

        chatStore[jid].lastMessage = text;
        chatStore[jid].lastTime = time;
      }
    }

    saveStoreToDisk();
  });

  // Live Messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      const jid = m.key?.remoteJid;
      if (!jid || jid.includes('status@broadcast')) continue;

      const isFromMe = m.key?.fromMe;
      const text = extractMessageText(m);
      if (!text) continue;

      const phone = cleanJidToPhone(jid);
      const customerName = m.pushName || chatStore[jid]?.customerName || `+${phone}`;
      const time = formatTimestamp(m.messageTimestamp);

      if (!chatStore[jid]) {
        chatStore[jid] = {
          id: jid,
          jid,
          customerName,
          phone: `+${phone}`,
          unreadCount: 0,
          lastMessage: text,
          lastTime: time,
          messages: [],
        };
      }

      const msgObj = {
        id: m.key?.id || `msg-${Date.now()}`,
        sender: isFromMe ? 'staff' : 'customer',
        text,
        time,
        timestamp: m.messageTimestamp,
      };

      if (!chatStore[jid].messages.some((x) => x.id === msgObj.id)) {
        chatStore[jid].messages.push(msgObj);
        if (!isFromMe) {
          chatStore[jid].unreadCount = (chatStore[jid].unreadCount || 0) + 1;
        }
      }

      chatStore[jid].lastMessage = text;
      chatStore[jid].lastTime = time;
      chatStore[jid].customerName = customerName;

      console.log(`💬 [WA-Gateway] [${isFromMe ? 'OUT' : 'IN'}] ${customerName}: "${text}"`);
    }

    saveStoreToDisk();
  });
}

function formatWhatsAppNumber(phone) {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  } else if (clean.startsWith('+62')) {
    clean = clean.substring(1);
  }
  return clean.includes('@s.whatsapp.net') ? clean : `${clean}@s.whatsapp.net`;
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

app.get('/status', (req, res) => {
  res.json({
    success: true,
    isConnected,
    user: connectedUser,
    phone: connectedUser?.id ? connectedUser.id.split(':')[0].replace(/[^0-9]/g, '') : null,
    qrAvailable: !!currentQrDataUrl,
    totalChats: Object.keys(chatStore).length,
  });
});

app.get('/qr', (req, res) => {
  if (isConnected) {
    return res.json({
      success: true,
      isConnected: true,
      message: 'WhatsApp sudah terhubung aktif!',
      phone: connectedUser?.id ? connectedUser.id.split(':')[0].replace(/[^0-9]/g, '') : null,
    });
  }

  if (!currentQrDataUrl) {
    return res.json({
      success: false,
      isConnected: false,
      message: 'QR Code sedang disiapkan. Coba lagi dalam 2 detik...',
    });
  }

  res.json({
    success: true,
    isConnected: false,
    qr: currentQr,
    qrImage: currentQrDataUrl,
  });
});

app.get('/chats', (req, res) => {
  const list = Object.values(chatStore).sort((a, b) => {
    const timeA = a.messages[a.messages.length - 1]?.timestamp || 0;
    const timeB = b.messages[b.messages.length - 1]?.timestamp || 0;
    return timeB - timeA;
  });

  res.json({
    success: true,
    total: list.length,
    chats: list,
  });
});

app.get('/chats/:jid/messages', (req, res) => {
  const jid = decodeURIComponent(req.params.jid);
  const conversation = chatStore[jid];

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Percakapan tidak ditemukan.' });
  }

  conversation.unreadCount = 0;
  saveStoreToDisk();

  res.json({ success: true, chat: conversation });
});

app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'Parameter "to" dan "message" wajib diisi.' });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({ success: false, message: 'WhatsApp belum terhubung! Silakan scan QR code terlebih dahulu.' });
  }

  try {
    const formattedJid = formatWhatsAppNumber(to);
    const result = await sock.sendMessage(formattedJid, { text: message });

    const phone = cleanJidToPhone(formattedJid);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    if (!chatStore[formattedJid]) {
      chatStore[formattedJid] = {
        id: formattedJid,
        jid: formattedJid,
        customerName: `+${phone}`,
        phone: `+${phone}`,
        unreadCount: 0,
        lastMessage: message,
        lastTime: time,
        messages: [],
      };
    }

    const newMsg = {
      id: result?.key?.id || `msg-${Date.now()}`,
      sender: 'staff',
      text: message,
      time,
      timestamp: Date.now() / 1000,
    };

    chatStore[formattedJid].messages.push(newMsg);
    chatStore[formattedJid].lastMessage = message;
    chatStore[formattedJid].lastTime = time;
    saveStoreToDisk();

    res.json({
      success: true,
      message: 'Pesan berhasil dikirim via WhatsApp!',
      messageId: result?.key?.id,
      timestamp: new Date().toISOString(),
      chat: chatStore[formattedJid],
    });
  } catch (err) {
    console.error('❌ [WA-Gateway] Failed to send message:', err);
    res.status(500).json({ success: false, message: 'Gagal mengirim pesan: ' + err.message });
  }
});

app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    isConnected = false;
    connectedUser = null;
    currentQr = null;
    currentQrDataUrl = null;

    try {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    } catch (e) {}

    setTimeout(connectToWhatsApp, 1500);

    res.json({ success: true, message: 'Berhasil logout.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal logout: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [WA-Gateway] Service running on http://127.0.0.1:${PORT}`);
  connectToWhatsApp();
});
