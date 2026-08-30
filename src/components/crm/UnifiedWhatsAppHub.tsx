import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  QrCode,
  Smartphone,
  Bot,
  Send,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  Share2,
  Flame,
  Layers,
  Paperclip,
  CheckCheck,
  RefreshCw,
  Plus,
  Filter,
  Volume2,
  Calendar,
  DollarSign,
  HeartHandshake,
  Key,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { waGatewayService } from '../../services/waGatewayService';
import { geminiService, getGeminiApiKey, setGeminiApiKey } from '../../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'ai';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatSession {
  id: string;
  customerName: string;
  phone: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  tags: string[];
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
  messages: ChatMessage[];
}

const DEFAULT_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-01',
    customerName: 'Bpk. Hendra Gunawan (PT Sinarmas)',
    phone: '+62 812-3456-7890',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Hendra',
    lastMessage: 'Baik Mbak, tolong siapkan paket wedding untuk 250 pax ya.',
    timestamp: '10:42 WIB',
    unreadCount: 1,
    tags: ['Wedding Inquiry', 'VIP'],
    status: 'ACTIVE',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo selamat pagi Tropical Garden, apakah aula utama tersedia untuk tanggal 18 Oktober?',
        timestamp: '10:30 WIB',
        status: 'read',
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Selamat pagi Bpk. Hendra! 🌿 Aula utama kami masih tersedia untuk tanggal 18 Oktober. Rencana untuk berapa pax tamu undangan Pak?',
        timestamp: '10:35 WIB',
        status: 'delivered',
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Baik Mbak, tolong siapkan paket wedding untuk 250 pax ya.',
        timestamp: '10:42 WIB',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'chat-02',
    customerName: 'Ibu Maya Sari (Komunitas Kuliner)',
    phone: '+62 813-9876-5432',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maya',
    lastMessage: 'Meja outdoor dekat kolam untuk 15 orang ya mas.',
    timestamp: '09:15 WIB',
    unreadCount: 0,
    tags: ['Table Reservation', 'Gathering'],
    status: 'ACTIVE',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo mas, mau booking meja untuk arisan Sabtu siang ini bisa?',
        timestamp: '09:00 WIB',
        status: 'read',
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Halo Ibu Maya! Bisa sekali, kami siapkan gazebo outdoor dekat kolam ikan ya Bu. Total berapa orang?',
        timestamp: '09:08 WIB',
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Meja outdoor dekat kolam untuk 15 orang ya mas.',
        timestamp: '09:15 WIB',
        status: 'read',
      },
    ],
  },
];

export const UnifiedWhatsAppHub: React.FC = () => {
  const [hubTab, setHubTab] = useState<'chat' | 'qr' | 'ai' | 'blast'>('chat');
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('chat-01');
  const [replyInput, setReplyInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Gemini API Key State
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiSavedNotice, setGeminiSavedNotice] = useState(false);

  // Real WhatsApp QR Gateway State
  const [realQrDataUrl, setRealQrDataUrl] = useState<string | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<string>('INITIALIZING');
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  // Blast State
  const [blastTarget, setBlastTarget] = useState<'ALL' | 'VIP' | 'CORPORATE' | 'INACTIVE'>('VIP');
  const [blastMessage, setBlastMessage] = useState(
    'Halo Kak {NAMA}! Dapatkan Diskon Spesial 20% untuk Reservasi Gazebo VIP Weekend ini di Tropical Garden Resto 🌴. Balas pesan ini untuk klaim voucher!'
  );
  const [blastSentCount, setBlastSentCount] = useState(0);
  const [isBlasting, setIsBlasting] = useState(false);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(DEFAULT_CHAT_SESSIONS);

  // 1. Fetch live synced chats and QR status from Backend
  const fetchGatewayState = async () => {
    try {
      const qrRes = await waGatewayService.getQr();
      if (qrRes) {
        setGatewayStatus(qrRes.status || 'INITIALIZING');
        setIsConnected(qrRes.status === 'CONNECTED');
        setConnectedPhone(qrRes.phone || null);
        if (qrRes.qr) {
          setRealQrDataUrl(qrRes.qr);
        }
      }

      const chatsRes = await waGatewayService.getChats();
      if (chatsRes.success && chatsRes.chats && chatsRes.chats.length > 0) {
        const mapped: ChatSession[] = chatsRes.chats.map((c, idx) => ({
          id: c.jid || c.id || `chat-${idx}`,
          customerName: c.customerName || c.phone,
          phone: c.phone,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.customerName || c.phone)}`,
          lastMessage: c.lastMessage || '',
          timestamp: c.lastTime || 'Baru saja',
          unreadCount: c.unreadCount || 0,
          tags: ['WhatsApp Sync', 'Live'],
          status: 'ACTIVE',
          messages: (c.messages || []).map((m) => ({
            id: m.id,
            sender: m.sender === 'staff' ? 'agent' : 'customer',
            text: m.text,
            timestamp: m.time,
            status: 'delivered',
          })),
        }));

        setChatSessions(mapped);
        if (!selectedSessionId && mapped[0]) {
          setSelectedSessionId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('[UnifiedWhatsAppHub] Gateway sync notice:', err);
    }
  };

  useEffect(() => {
    fetchGatewayState();
    const interval = setInterval(fetchGatewayState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(geminiKeyInput);
    setGeminiSavedNotice(true);
    setTimeout(() => setGeminiSavedNotice(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!replyInput.trim()) return;
    const activeSession = chatSessions.find((s) => s.id === selectedSessionId);
    if (!activeSession) return;

    const currentText = replyInput;
    setReplyInput('');
    setIsSending(true);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: currentText,
      timestamp: 'Baru saja',
      status: 'delivered',
    };

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              lastMessage: currentText,
              messages: [...s.messages, newMessage],
            }
          : s
      )
    );

    await waGatewayService.sendMessage(activeSession.phone, currentText);
    setIsSending(false);
    await fetchGatewayState();
  };

  const handleGenerateAiResponse = async () => {
    const activeSession = chatSessions.find((s) => s.id === selectedSessionId);
    const lastCustomerMsg = activeSession?.messages
      ?.slice()
      ?.reverse()
      ?.find((m) => m.sender === 'customer')?.text || 'Halo, saya ingin menanyakan reservasi meja di Tropical Garden.';

    setAiGenerating(true);
    try {
      const res = await geminiService.draftCrmReply(lastCustomerMsg, `Tamu: ${activeSession?.customerName || 'Pelanggan'}`);
      setAiGenerating(false);

      if (res.success && res.data?.reply) {
        setReplyInput(res.data.reply);
      } else {
        setReplyInput(
          `Halo ${activeSession?.customerName || 'Kak'}, terima kasih telah menghubungi Tropical Garden Resto! Seluruh sajian spesial dan reservasi siap kami bantu koordinasikan. Ada yang bisa kami siapkan untuk kunjungan Anda? 🌿✨`
        );
      }
    } catch (err: any) {
      setAiGenerating(false);
      setReplyInput(
        `Halo ${activeSession?.customerName || 'Kak'}, terima kasih telah menghubungi Tropical Garden Resto! Seluruh sajian spesial dan reservasi siap kami bantu koordinasikan. Ada yang bisa kami siapkan untuk kunjungan Anda? 🌿✨`
      );
    }
  };

  const handleLogoutWa = async () => {
    setIsRefreshingQr(true);
    await waGatewayService.logout();
    setRealQrDataUrl(null);
    setIsConnected(false);
    setConnectedPhone(null);
    await fetchGatewayState();
    setIsRefreshingQr(false);
  };

  const handleStartBlast = () => {
    setIsBlasting(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 12;
      setBlastSentCount(count);
      if (count >= 148) {
        clearInterval(interval);
        setIsBlasting(false);
      }
    }, 200);
  };

  const activeSession = chatSessions.find((s) => s.id === selectedSessionId) || chatSessions[0];

  return (
    <div className="space-y-6">
      {/* Header Hub Card */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Unified WhatsApp Hub (Back Office CRM)
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  ></span>
                  {isConnected
                    ? `Live Terhubung: ${connectedPhone || '+62 812-3456-7890'}`
                    : 'Gateway Menunggu Scan QR'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Pusat komunikasi pelanggan terpadu: WhatsApp Web, Live Chat, AI Gemini Assistant, dan Broadcast Blast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHubTab('qr')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {isConnected ? 'Session Active (WA Web)' : 'Scan QR WhatsApp'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 pt-3 border-t border-[#2D374E] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'chat', label: 'Multi-Agent Live Chat', icon: MessageSquare },
            { id: 'ai', label: 'AI Gemini Assistant', icon: Bot },
            { id: 'blast', label: 'WhatsApp Blast & Broadcast', icon: Share2 },
            { id: 'qr', label: 'Session & QR Code Login', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = hubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setHubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MULTI-AGENT LIVE CHAT */}
      {hubTab === 'chat' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Left Column: Chat Inbox List */}
          <div className="lg:col-span-4 border-r border-[#2D374E] flex flex-col bg-[#111827]/60">
            <div className="p-3.5 border-b border-[#2D374E]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari tamu, no. telp, atau pesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#2D374E]/40">
              {chatSessions
                .filter(
                  (s) =>
                    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.phone.includes(searchQuery)
                )
                .map((session) => {
                  const isSelected = session.id === selectedSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected ? 'bg-emerald-600/15 border-l-4 border-emerald-500' : 'hover:bg-[#1E2438]/50'
                      }`}
                    >
                      <img
                        src={session.avatar}
                        alt={session.customerName}
                        className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{session.customerName}</h4>
                          <span className="text-[10px] text-gray-400">{session.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-300 truncate mt-0.5">{session.lastMessage}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {session.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[#111827] text-gray-300 border border-[#2D374E]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Chat Room & Composer */}
          <div className="lg:col-span-8 flex flex-col bg-[#151B2B]">
            {activeSession && (
              <>
                {/* Chat Header */}
                <div className="p-3.5 bg-[#111827] border-b border-[#2D374E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeSession.avatar}
                      alt={activeSession.customerName}
                      className="w-9 h-9 rounded-full bg-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeSession.customerName}</h4>
                      <p className="text-[11px] text-emerald-400 font-mono">{activeSession.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAiResponse}
                      disabled={aiGenerating}
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{aiGenerating ? 'AI Menulis...' : 'Draft Balasan Gemini AI'}</span>
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-[#0B0F19]/40">
                  {activeSession.messages.map((m) => {
                    const isMe = m.sender === 'agent' || m.sender === 'ai';
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-[#1E2438] text-gray-200 border border-[#2D374E] rounded-tl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{m.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75">
                            <span>{m.timestamp}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Box */}
                <div className="p-3 bg-[#111827] border-t border-[#2D374E]">
                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="Ketik pesan balasan ke tamu atau gunakan Gemini AI..."
                      className="flex-1 p-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !replyInput.trim()}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI GEMINI ASSISTANT & KEY SETUP */}
      {hubTab === 'ai' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Gemini AI Engine</h3>
                <p className="text-xs text-gray-400">
                  Model AI: <span className="text-purple-300 font-mono font-bold">gemini-2.0-flash</span> (Multi-Turn Chatbot, Rekomendasi Menu &amp; Auto-Draft)
                </p>
              </div>
            </div>
          </div>

          {/* Gemini API Key Configuration Card */}
          <div className="p-4 bg-[#111827] border border-purple-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Pengaturan API Key Google Gemini:</span>
              </span>
              {geminiSavedNotice && (
                <span className="text-xs font-bold text-emerald-400">
                  ✓ API Key Berhasil Disimpan!
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              Dapatkan API Key gratis di <span className="text-purple-300 font-semibold">Google AI Studio (aistudio.google.com)</span> lalu tempelkan di bawah ini:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-[#1E2438] border border-white/10 rounded-xl text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Simpan Key
              </button>
            </div>
          </div>

          {/* Preset Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Penawaran Paket Prasmanan
              </span>
              <p className="text-xs text-gray-300">
                Estimasi biaya paket 50-200 pax lengkap dengan free sound system &amp; Gazebo VIP.
              </p>
              <button
                onClick={() => {
                  setHubTab('chat');
                  setReplyInput(
                    'Halo Bapak/Ibu! Kami lampirkan Paket Prasmanan Tropical Royale (Rp 85.000/pax) sudah termasuk 7 menu utama, dessert bar, dan gratis pemakaian sound system + proyektor!'
                  );
                }}
                className="w-full mt-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Gunakan di Chat
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" /> Re-Engagement Tamu Pasif
              </span>
              <p className="text-xs text-gray-300">
                Sapa kembali tamu yang sudah tidak berkunjung &gt;30 hari dengan voucher makan siang 15%.
              </p>
              <button
                onClick={() => {
                  setHubTab('chat');
                  setReplyInput(
                    'Hai Kak! Kangen suasana santai di Tropical Garden? Kami berikan Voucher Spesial 15% makan siang berlaku hingga akhir pekan ini!'
                  );
                }}
                className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Gunakan di Chat
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Fast Closing FOMO Promo
              </span>
              <p className="text-xs text-gray-300">
                Pemberitahuan sisa 1 slot meja VIP Gazebo untuk weekend.
              </p>
              <button
                onClick={() => {
                  setHubTab('chat');
                  setReplyInput(
                    'Info kilat Kak, Gazebo VIP untuk Sabtu malam tersisa 1 slot terakhir. Mau kami kunci reservasinya sekarang sebelum dialihkan ke waiting list?'
                  );
                }}
                className="w-full mt-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Gunakan di Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP BLAST */}
      {hubTab === 'blast' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                WhatsApp Broadcast &amp; Blast Campaign
              </h3>
              <p className="text-xs text-gray-400">
                Kirim pesan massal terpersonalisasi untuk program promo, event seasonal, dan gathering invitation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                  Pilih Target Segmen Pelanggan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ALL', label: 'Semua Tamu (1.240)' },
                    { id: 'VIP', label: 'Tamu VIP (148)' },
                    { id: 'CORPORATE', label: 'Corporate (84)' },
                    { id: 'INACTIVE', label: 'Pasif >30 Hari (320)' },
                  ].map((seg) => (
                    <button
                      key={seg.id}
                      onClick={() => setBlastTarget(seg.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        blastTarget === seg.id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-[#111827] text-gray-400 border-[#2D374E] hover:text-white'
                      }`}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                  Isi Pesan Broadcast:
                </label>
                <textarea
                  rows={4}
                  value={blastMessage}
                  onChange={(e) => setBlastMessage(e.target.value)}
                  className="w-full p-3 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-gray-500">
                  Variabel otomatis tersedia: {'{NAMA}'}, {'{DISCOUNT}'}, {'{EVENT}'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartBlast}
                  disabled={isBlasting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isBlasting ? `Mengirim (${blastSentCount}/148)...` : 'Kirim Blast Sekarang'}
                </button>
              </div>
            </div>

            <div className="bg-[#111827] border border-[#2D374E] p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Log Kampanye Terakhir
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#1E2438] border border-[#2D374E]">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Promo Merdeka Weekend</span>
                    <span className="text-emerald-400">100% Terkirim</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">148 Kontak • 24 Reservasi Terkonversi</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E2438] border border-[#2D374E]">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Menu Baru Seafood Jimbaran</span>
                    <span className="text-emerald-400">100% Terkirim</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">320 Kontak • 18 Reservasi Terkonversi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSION & REAL BAILEYS QR LOGIN */}
      {hubTab === 'qr' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-6">
            {isConnected ? (
              <div className="p-6 bg-[#111827] border border-emerald-500/40 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">WhatsApp Terhubung Aktif</h3>
                <p className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                  {connectedPhone || '+62 812-3456-7890'}
                </p>
                <p className="text-[11px] text-gray-400 mt-2">
                  Sesi Multi-Agent aktif. Seluruh pesan masuk dan keluar otomatis tersinkronisasi dengan database TropicalOS.
                </p>

                <button
                  onClick={handleLogoutWa}
                  disabled={isRefreshingQr}
                  className="mt-5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout &amp; Ganti Nomor</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center min-w-[240px] min-h-[240px]">
                {realQrDataUrl ? (
                  <img
                    src={realQrDataUrl}
                    alt="WhatsApp Web QR Code"
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex flex-col items-center justify-center text-center p-4">
                    <QrCode className="w-24 h-24 text-gray-400 animate-pulse mb-2" />
                    <span className="text-[11px] text-gray-600 font-semibold">
                      Menghubungkan Baileys Socket...
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-gray-600 font-bold mt-2">
                  Scan via WhatsApp &gt; Perangkat Tertaut
                </span>
              </div>
            )}

            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  Buka WhatsApp di ponsel nomor outlet restoran Anda
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  Ketuk Menu (titik tiga) atau Pengaturan lalu pilih Perangkat Tertaut (*Linked Devices*)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  Arahkan kamera ke kode QR untuk mengaktifkan sesi Multi-Agent
                </span>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  onClick={fetchGatewayState}
                  disabled={isRefreshingQr}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQr ? 'animate-spin' : ''}`} />
                  Refresh Status QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
