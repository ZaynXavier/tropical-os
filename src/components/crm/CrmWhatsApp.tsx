import React, { useState, useEffect } from "react";
import { WhatsAppChat } from "../../data/mockCrmData";
import { waGatewayService } from "../../services/waGatewayService";
import {
  Send,
  CheckCheck,
  MessageCircle,
  Smartphone,
  Sparkles,
} from "lucide-react";

interface CrmWhatsAppProps {
  chats?: WhatsAppChat[];
  initialChats?: WhatsAppChat[];
  currentStaffName?: string;
  activeChatPhone?: string;
  onSendMessage?: (chatId: string, text: string) => void;
}

const WA_TEMPLATES = [
  {
    title: "📋 Follow-up Penawaran Event",
    text: "Halo Kak! Salam hangat dari Tropical Garden Resto 🌴. Kami ingin follow-up terkait draft Quotation penawaran acara yang telah kami kirimkan. Apakah ada penyesuaian menu atau setting tempat yang diinginkan?",
  },
  {
    title: "🍽️ Undangan Food Tasting",
    text: "Halo Kak! Kami mengundang Kakak untuk menghadiri sesi Food Tasting sampel menu pernikahan/event di Tropical Garden Resto. Silakan informasikan tanggal dan jam kedatangan yang nyaman ya Kak.",
  },
  {
    title: "💳 Pengingat DP Event 50%",
    text: "Halo Kak! Terima kasih telah mempercayakan acara Kakak di Tropical Garden Resto. Berikut link invoice dan pengingat pembayaran DP 50% untuk mengamankan tanggal reservasi venue.",
  },
];

export const CrmWhatsApp: React.FC<CrmWhatsAppProps> = ({
  chats,
  initialChats,
  currentStaffName,
  activeChatPhone,
  onSendMessage,
}) => {
  const [localChats, setLocalChats] = useState<WhatsAppChat[]>(chats || initialChats || []);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [inputText, setInputText] = useState("");

  const fetchChats = async () => {
    try {
      const res = await waGatewayService.getChats();
      if (res.success && res.chats && res.chats.length > 0) {
        const mapped: WhatsAppChat[] = res.chats.map((c) => ({
          id: c.jid || c.id,
          customerName: c.customerName || c.phone,
          phone: c.phone,
          unreadCount: c.unreadCount || 0,
          lastMessage: c.lastMessage || "",
          lastTime: c.lastTime || "Baru saja",
          messages: (c.messages || []).map((m) => ({
            id: m.id,
            sender: m.sender === "staff" ? ("staff" as const) : ("customer" as const),
            text: m.text,
            time: m.time,
          })),
        }));
        setLocalChats(mapped);
        if (!selectedChatId && mapped[0]) {
          setSelectedChatId(mapped[0].id);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, []);

  const safeChats = localChats;
  const selectedChat = safeChats.find((c) => c.id === selectedChatId) || safeChats[0];

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const currentMsg = inputText;
    setInputText("");

    const newMsg = {
      id: `MSG-${Date.now()}`,
      sender: "staff" as const,
      text: currentMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " WIB",
    };

    setLocalChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: currentMsg, lastTime: newMsg.time, messages: [...(c.messages || []), newMsg] }
          : c
      )
    );

    if (onSendMessage) {
      onSendMessage(selectedChat.id, currentMsg);
    } else {
      await waGatewayService.sendMessage(selectedChat.phone, currentMsg);
      await fetchChats();
    }
  };

  const handleApplyTemplate = (templateText: string) => {
    setInputText(templateText);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Info Banner - Finns Glass Style */}
      <div className="p-6 rounded-3xl bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-0.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Direct Messaging Sync</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Integrasi Direct WhatsApp CRM Log
            </h2>
            <p className="text-xs text-purple-200/70 mt-0.5">
              Kirim quotation, templat broadcast follow-up, dan rekap obrolan langsung dari dashboard.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-right shrink-0">
          <span className="block text-[10px] text-purple-300/70 font-bold uppercase">PERCAKAPAN AKTIF</span>
          <span className="text-sm font-black text-white">{safeChats.length} Klien Sync</span>
        </div>
      </div>

      {/* WhatsApp Chat Layout (Dark Glass Style) */}
      <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Chat List Sidebar */}
        <div className="border-r border-white/10 bg-[#0D0922]/80 flex flex-col">
          <div className="p-4 border-b border-white/10 font-bold text-xs text-purple-200 uppercase tracking-wider flex items-center justify-between">
            <span>Daftar Percakapan Klien</span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-extrabold rounded-full border border-purple-500/30">
              {safeChats.length}
            </span>
          </div>

          <div className="divide-y divide-white/5 flex-1 overflow-y-auto custom-scrollbar">
            {safeChats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-900/40 border-l-4 border-l-emerald-400 text-white font-bold"
                      : "hover:bg-white/5 text-purple-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs text-white">{chat.customerName}</strong>
                    <span className="text-[10px] text-purple-300/60 font-mono">{chat.lastTime}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono truncate mb-1">+{chat.phone}</div>
                  <p className="text-[11px] text-purple-200/60 line-clamp-1">{chat.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col justify-between bg-[#080517]/80">
          {/* Chat Header */}
          {selectedChat && (
            <div className="p-4 bg-[#0D0922]/90 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedChat.customerName}</h3>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  WhatsApp Direct Log (+{selectedChat.phone})
                </span>
              </div>
              <a
                href={`https://wa.me/${selectedChat.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
              >
                <span>Buka di App WA</span>
              </a>
            </div>
          )}

          {/* Messages Container */}
          <div className="p-5 space-y-3.5 overflow-y-auto flex-1 max-h-[400px] custom-scrollbar">
            {(selectedChat?.messages || []).map((msg) => {
              const isStaff = msg.sender === "staff";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStaff ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-lg ${
                      isStaff
                        ? "bg-gradient-to-r from-emerald-950/90 to-teal-900/90 text-emerald-100 rounded-br-none border border-emerald-500/30"
                        : "bg-white/10 backdrop-blur-md text-white rounded-bl-none border border-white/15"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className="text-[9px] text-purple-200/60 text-right flex items-center justify-end gap-1 font-mono">
                      <span>{msg.time}</span>
                      {isStaff && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Templates & Input Box */}
          <div className="p-4 bg-[#0D0922]/90 border-t border-white/10 space-y-3">
            {/* Quick Templates Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[10px] font-extrabold text-purple-300/70 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                Template:
              </span>
              {WA_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 font-bold text-[10px] rounded-xl shrink-0 cursor-pointer transition-all"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tulis pesan WhatsApp ke klien..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                onClick={handleSend}
                className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
