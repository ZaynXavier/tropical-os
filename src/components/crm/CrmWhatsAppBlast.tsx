/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lead, Opportunity, Customer } from "../../data/mockCrmData";
import {
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Bot,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Play,
  FileText,
  Smartphone,
  Info,
  ShieldAlert,
  Sliders,
  ChevronRight
} from "lucide-react";

interface CrmWhatsAppBlastProps {
  leads?: Lead[];
  opportunities?: Opportunity[];
  customers?: Customer[];
  onOpenWhatsAppChat?: (phone: string, name: string) => void;
}

export const CrmWhatsAppBlast: React.FC<CrmWhatsAppBlastProps> = ({
  leads = [],
  opportunities = [],
  customers = [],
  onOpenWhatsAppChat,
}) => {
  const safeOpps = opportunities || [];
  const safeLeads = leads || [];
  const safeCustomers = customers || [];

  // Target audience selection
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    safeOpps.map((o) => o.id)
  );

  // AI Generator Settings
  const [aiTone, setAiTone] = useState<"formal" | "casual" | "vip" | "closing">("vip");
  const [includeOffer, setIncludeOffer] = useState<boolean>(true);
  const [customIncentive, setCustomIncentive] = useState<string>("Voucher Cashback Rp 2.500.000 + Free Dessert Table");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Generated AI message template
  const [generatedMessage, setGeneratedMessage] = useState<string>(
    `Halo *{Nama_Klien}* 👋🏻\n\nSalam hangat dari Tropical Garden Resto 🌴✨\n\nKami ingin menyapa Ibu/Bapak terkait penawaran acara *{Nama_Event}* di lokasi venue eksklusif kami pada *{Tanggal_Event}*.\n\nKabar gembira! Khusus penutupan pemesanan minggu ini, kami menyediakan *{Insentif_Bonus}* untuk kapasitas *{Jumlah_Tamu} tamu*.\n\nAnda dapat meninjau quotation lengkap melalui tautan ini: *{Link_Quotation}*\n\nApakah ada waktu senggang esok hari untuk berdiskusi singkat atau jadwal *Test Food* gratis di venue kami?\n\nTerima kasih dan semoga harimu menyenangkan! 😊`
  );

  // Blast Simulation State
  const [isBlasting, setIsBlasting] = useState<boolean>(false);
  const [blastProgress, setBlastProgress] = useState<number>(0);
  const [blastLogs, setBlastLogs] = useState<string[]>([]);
  const [blastFinished, setBlastFinished] = useState<boolean>(false);

  // Combine opportunities + leads for target list
  const allTargets = safeOpps.map((opp) => ({
    id: opp.id,
    name: opp.customerName,
    phone: opp.phone,
    event: opp.title,
    stage: opp.stage,
    dealValue: opp.dealValue,
    eventDate: opp.eventDate,
    guestCount: opp.guestCount,
  }));

  const filteredTargets = allTargets.filter((t) => {
    if (selectedStage === "All") return true;
    return t.stage === selectedStage;
  });

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((cId) => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredTargets.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredTargets.map((t) => t.id));
    }
  };

  // AI Message Generator logic based on status
  const handleGenerateAiMessage = () => {
    setIsGenerating(true);
    setBlastFinished(false);

    setTimeout(() => {
      let msg = "";

      if (selectedStage === "New Lead") {
        msg = `Halo Kak *{Nama_Klien}* 👋🏻\n\nTerima kasih telah berkonsultasi mengenai acara *{Nama_Event}* di Tropical Garden Resto 🌴✨\n\nVenue outdoor garden & glasshouse kami sangat ideal untuk momen istimewa Anda pada *{Tanggal_Event}*.\n\nKami telah menyiapakan E-Brochure & paket khusus. Apakah Kakak berminat untuk agenda *Free Tasting Menu* Sabtu ini?\n\nHubungi kami jika ada pertanyaan ya Kak! 🙏🏻`;
      } else if (selectedStage === "Quotation Sent") {
        msg = `Yth. Bapak/Ibu *{Nama_Klien}* 🌿\n\nSemoga hari Anda menyenangkan. Kami menanyakan kabar terkait proposal *{Nama_Event}* yang telah kami kirimkan sebelumnya (Nilai: *Rp {Nilai_Penawaran}*).\n\nSebagai bentuk apresiasi, jika konfirmasi dilakukan sebelum akhir pekan ini, kami memberikan *{Insentif_Bonus}* secara gratis! 🎉\n\nDetail quotation dapat diakses di: *{Link_Quotation}*\n\nMohon kabari kami jika Bapak/Ibu memerlukan penyesuaian menu atau tanggal.`;
      } else if (selectedStage === "Negotiation") {
        msg = `Salam Hangat Kak *{Nama_Klien}* ✨\n\nKabar baik dari Management Tropical Garden Resto! Setelah berdiskusi dengan Executive Chef & Event Manager, kami dapat menyetujui penyesuaian anggaran untuk acara *{Nama_Event}*.\n\nKami juga menyertakan bonus *{Insentif_Bonus}* khusus pemesanan hari ini.\n\nApakah kami dapat menerbitkan invoice DP resmi untuk mengunci tanggal *{Tanggal_Event}* Anda? 😊`;
      } else if (selectedStage === "Closed Won") {
        msg = `Selamat & Terima Kasih Kak *{Nama_Klien}*! 🎉🥳\n\nTanggal acara *{Nama_Event}* pada *{Tanggal_Event}* di Tropical Garden Resto telah RESMI terkunci dalam sistem kami.\n\nTim Event Coordinator kami akan segera menghubungi Anda untuk pembahasan Technical Meeting & Final Rundown.\n\nTerima kasih telah memercayakan momen berharga Anda kepada kami! 🌸`;
      } else {
        // VIP / Default
        msg = `Yth. Klien VIP *{Nama_Klien}* 👑\n\nSpesial untuk pelanggan setia Tropical Garden Resto! Kami meluncurkan *Exquisite Seasonal Menu 2026* & paket promo gathering eksklusif.\n\nNikmati penawaran *{Insentif_Bonus}* untuk reservasi acara korporat atau keluarga mendatang.\n\nIngin reservasi meja VIP hari ini? Balas pesan ini untuk layanan concierge pribadi Anda. ✨`;
      }

      setGeneratedMessage(msg);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate WhatsApp Blast sending
  const handleStartBlastSimulation = () => {
    if (selectedContacts.length === 0) {
      alert("Silakan pilih minimal 1 kontak target penerima WhatsApp Blast.");
      return;
    }

    setIsBlasting(true);
    setBlastProgress(0);
    setBlastLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Memulai simulasi WhatsApp Blast ke ${selectedContacts.length} penerima...`,
      `[${new Date().toLocaleTimeString()}] 🔒 Memverifikasi format nomor & template AI AI Generator...`,
    ]);

    const targetItems = filteredTargets.filter((t) => selectedContacts.includes(t.id));
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const pct = Math.min(Math.round((step / targetItems.length) * 100), 100);
      setBlastProgress(pct);

      if (step <= targetItems.length) {
        const item = targetItems[step - 1];
        setBlastLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ [SIMULATION] Berhasil terkirim ke +${item.phone} (${item.name} - ${item.stage}) [DELIVERED]`,
        ]);
      }

      if (step >= targetItems.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsBlasting(false);
          setBlastFinished(true);
          setBlastLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 🎉 [COMPLETE] Simulasi WhatsApp Blast Selesai! ${targetItems.length} pesan berhasil diproses.`,
          ]);
        }, 500);
      }
    }, 700);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Banner - Finns Glass Style */}
      <div className="p-6 rounded-3xl bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300 uppercase tracking-widest mb-1">
            <Bot className="w-4 h-4 text-pink-400" />
            <span>AI Campaign &amp; Messaging Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight finns-text-gradient">
            WhatsApp Blast (AI Generator)
          </h2>
          <p className="text-xs text-purple-200/70 mt-1 max-w-2xl">
            Buat pesan WhatsApp terpersonalisasi secara otomatis dengan kecerdasan AI sesuai status pipeline deals (New Lead, Quotation, Negotiation, Closed Won) dan simulasi kirim massal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-right">
            <span className="block text-[10px] text-purple-300/70 font-bold uppercase">TARGET TERPILIH</span>
            <span className="text-base font-black text-white">{selectedContacts.length} Kontak</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Controls & Audience Selection, Right AI Engine & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Audience Target & Pipeline Filter */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-3xl bg-[#130F30]/70 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Target Penerima Blast
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {filteredTargets.length} Ditemukan
              </span>
            </div>

            {/* Stage Filter Selector */}
            <div>
              <label className="block text-[11px] font-bold text-purple-200/80 mb-1.5 uppercase tracking-wider">
                Filter Stage Pipeline Deals
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "All",
                  "New Lead",
                  "Quotation Sent",
                  "Negotiation",
                  "Closed Won",
                ].map((stg) => (
                  <button
                    key={stg}
                    onClick={() => {
                      setSelectedStage(stg);
                      // Auto-regenerate prompt when stage changes
                      handleGenerateAiMessage();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedStage === stg
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-white/20"
                        : "bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {stg === "All" ? "Semua Stage" : stg}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Checklist List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300/80 px-1">
                <span>Daftar Klien / Prospek</span>
                <button
                  onClick={toggleSelectAll}
                  className="text-purple-400 hover:text-white text-[11px] font-bold underline cursor-pointer"
                >
                  {selectedContacts.length === filteredTargets.length
                    ? "Batal Pilih Semua"
                    : "Pilih Semua"}
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredTargets.map((item) => {
                  const isChecked = selectedContacts.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectContact(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? "bg-purple-900/30 border-purple-500/50 shadow-md shadow-purple-950/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-purple-600 rounded bg-white/10 border-white/20 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-purple-200/70 truncate">
                            {item.event} • Rp {(item.dealValue / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 bg-purple-950/80 text-[9px] font-extrabold text-purple-200 rounded-md border border-purple-500/30">
                          {item.stage}
                        </span>
                        <p className="text-[9px] text-purple-300/50 font-mono mt-0.5">
                          +{item.phone}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI Message Generator & Blast Engine */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Generator Controls Card */}
          <div className="p-5 rounded-3xl bg-[#130F30]/70 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-sm text-white">
                  AI Generator Pesan Pipeline
                </h3>
              </div>
              <button
                onClick={handleGenerateAiMessage}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Generating..." : "Generate Pesan AI"}</span>
              </button>
            </div>

            {/* AI Customization Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-purple-300/80 uppercase tracking-wider mb-1">
                  Gaya Bahasa AI (Tone)
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="vip" className="bg-[#130F30] text-white">
                    👑 Eksklusif VIP &amp; Elegat
                  </option>
                  <option value="formal" className="bg-[#130F30] text-white">
                    💼 Formal &amp; Professional
                  </option>
                  <option value="casual" className="bg-[#130F30] text-white">
                    😊 Santai &amp; Friendly
                  </option>
                  <option value="closing" className="bg-[#130F30] text-white">
                    ⚡ Persuasif Closing Sales
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-300/80 uppercase tracking-wider mb-1">
                  Insentif Bonus / Promo
                </label>
                <input
                  type="text"
                  value={customIncentive}
                  onChange={(e) => setCustomIncentive(e.target.value)}
                  placeholder="e.g. Free Dessert Table 50 pax"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Generated Message Textarea & Live Smartphone Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-200">
                  Hasil Draf Pesan AI (Dapat Diedit):
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={7}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full p-3.5 bg-[#0B081E]/90 border border-purple-500/30 rounded-2xl text-xs text-purple-100 font-sans focus:outline-none focus:ring-1 focus:ring-purple-400 custom-scrollbar leading-relaxed"
              />

              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-300/80 flex items-center gap-2">
                <Info className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  Sistem AI otomatis mengganti variabel <code className="text-pink-300 font-mono">&#123;Nama_Klien&#125;</code>, <code className="text-pink-300 font-mono">&#123;Nama_Event&#125;</code>, &amp; <code className="text-pink-300 font-mono">&#123;Tanggal_Event&#125;</code> untuk setiap penerima.
                </span>
              </div>
            </div>

            {/* Blast Action Button */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-purple-300/70">
                Akan dikirim ke <strong className="text-white font-bold">{selectedContacts.length} kontak</strong> pipeline deal.
              </div>

              <button
                onClick={handleStartBlastSimulation}
                disabled={isBlasting || selectedContacts.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black transition-all cursor-pointer shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Simulasi Kirim WhatsApp Blast</span>
              </button>
            </div>
          </div>

          {/* SIMULATION TERMINAL LOGS & PROGRESS */}
          {(isBlasting || blastLogs.length > 0) && (
            <div className="p-5 rounded-3xl bg-[#090618] border border-purple-500/30 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>SIMULASI WHATSAPP GATEWAY ENGINE</span>
                </div>
                <span className="text-[10px] text-purple-300/60">
                  {blastProgress}% SELESAI
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${blastProgress}%` }}
                />
              </div>

              {/* Console log list */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-[#05030E] border border-white/10 text-[11px] text-purple-200 custom-scrollbar">
                {blastLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              {blastFinished && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span>
                    🎉 Simulasi WhatsApp Blast Berhasil! Semua ({selectedContacts.length}) pesan terkirim.
                  </span>
                  <button
                    onClick={() => setBlastLogs([])}
                    className="text-[10px] text-emerald-200 underline cursor-pointer"
                  >
                    Tutup Log
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
