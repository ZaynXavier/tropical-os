import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  MessageSquare,
  Gift,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AutomationTrigger {
  id: string;
  name: string;
  category: 'RESERVATION' | 'POST_DINING' | 'RETENTION' | 'BIRTHDAY';
  triggerEvent: string;
  timing: string;
  channel: 'WHATSAPP';
  status: 'ACTIVE' | 'PAUSED';
  templateMessage: string;
  sentCount: number;
  openRate: string;
  conversionRate: string;
}

const INITIAL_TRIGGERS: AutomationTrigger[] = [
  {
    id: 'TRG-01',
    name: 'Konfirmasi Booking & Link Google Maps',
    category: 'RESERVATION',
    triggerEvent: 'Reservasi meja baru dicatat di sistem',
    timing: 'Langsung (0 Menit)',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    templateMessage:
      'Halo Kak {NAMA_TAMU}! 🌴\nReservasi Anda di Tropical Garden Resto telah TERKONFIRMASI:\n📅 Tanggal: {TANGGAL}\n⏰ Jam: {JAM}\n📍 Area: {AREA_MEJA} ({PAX} Orang)\n\nPetunjuk Lokasi Google Maps: https://maps.app.goo.gl/tropicalgarden\nSampai jumpa di resto kami!',
    sentCount: 342,
    openRate: '98.5%',
    conversionRate: '96.2%',
  },
  {
    id: 'TRG-02',
    name: 'Pengingat Kedatangan H-1 (Anti No-Show)',
    category: 'RESERVATION',
    triggerEvent: 'H-1 sebelum waktu kedatangan reservasi',
    timing: 'H-1 Jam 10:00 WIB',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    templateMessage:
      'Halo Kak {NAMA_TAMU}, mengingatkan kembali meja Anda untuk {PAX} orang telah disiapkan untuk besok jam {JAM} di Tropical Garden Resto. Jika ada perubahan mohon balas pesan ini ya Kak!',
    sentCount: 289,
    openRate: '99.1%',
    conversionRate: '98.0%',
  },
  {
    id: 'TRG-03',
    name: 'Google Review Booster & CSAT Bintang 5',
    category: 'POST_DINING',
    triggerEvent: '2 Jam setelah kasir closing transaksi meja',
    timing: 'Setelah 2 Jam',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    templateMessage:
      'Terima kasih telah bersantap di Tropical Garden Resto hari ini, Kak {NAMA_TAMU}! ✨\nBagaimana pengalaman bersantap Anda? Mohon bantu berikan ulasan bintang 5 di Google Review untuk mendukung kami:\n⭐ https://g.page/r/tropicalgarden/review\n\nTunjukkan ulasan Anda pada kunjungan berikutnya untuk klaim Free Es Doger Spesial!',
    sentCount: 512,
    openRate: '94.2%',
    conversionRate: '41.8%',
  },
  {
    id: 'TRG-04',
    name: 'Birthday Voucher Gift (H-3 Ulang Tahun)',
    category: 'BIRTHDAY',
    triggerEvent: 'H-3 sebelum tanggal lahir tamu atau pasangan',
    timing: 'H-3 Jam 09:00 WIB',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    templateMessage:
      'Selamat Ulang Tahun lebih awal dari Tropical Garden Resto, Kak {NAMA_TAMU}! 🎂🎉\nRayakan momen spesial Anda bersama kami dan nikmati:\n🎁 Voucher Diskon 20% + Complimentary Special Birthday Cake!\nGunakan kode voucher: HBD-{KODE_UNIK} saat reservasi.',
    sentCount: 78,
    openRate: '97.4%',
    conversionRate: '58.9%',
  },
  {
    id: 'TRG-05',
    name: 'Win-Back Campaign Tamu Tidak Berkunjung >45 Hari',
    category: 'RETENTION',
    triggerEvent: 'Tamu VIP/Regular tidak berkunjung selama 45 hari',
    timing: 'Otomatis Hari ke-46',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    templateMessage:
      'Halo Kak {NAMA_TAMU}, kami merindukan kehadiran Anda di Tropical Garden Resto! 🌿\nAda menu baru Gurame Asam Pedas yang wajib dicoba. Dapatkan FREE Complimentary Dessert untuk kunjungan Anda minggu ini. Balas pesan ini untuk reservasi meja favorit Anda!',
    sentCount: 145,
    openRate: '92.0%',
    conversionRate: '28.3%',
  },
];

export const GuestRetentionAutomationView: React.FC = () => {
  const [triggers, setTriggers] = useState<AutomationTrigger[]>(INITIAL_TRIGGERS);
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger>(INITIAL_TRIGGERS[2]);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+62 812-3456-7890');
  const [testGuestName, setTestGuestName] = useState('Bpk. Hendra Gunawan');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleToggleStatus = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : t
      )
    );
  };

  const handleSimulateSend = () => {
    setTestStatus('Mengirim pesan WhatsApp via Baileys Gateway...');
    setTimeout(() => {
      setTestStatus(
        `✅ Berhasil terkirim ke ${testPhoneNumber} (${testGuestName})! Tamu menerima notifikasi otomatis.`
      );
      setTimeout(() => setTestStatus(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-purple-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">Pesan Otomatis Terkirim</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">1,366 <span className="text-xs text-purple-400 font-normal">Pesan</span></div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">+18.4%</span> efisiensi CS vs manual
          </div>
        </div>

        <div className="bg-[#151B2B] p-5 rounded-2xl border border-pink-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-300">Google Review Booster</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">214 <span className="text-xs text-pink-400 font-normal">Ulasan Baru</span></div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="text-yellow-400 font-bold">⭐ 4.9 / 5.0</span> Rating Google Maps
          </div>
        </div>

        <div className="bg-[#151B2B] p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Tingkat Buka WhatsApp</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">97.2% <span className="text-xs text-emerald-400 font-normal">Read Rate</span></div>
          <div className="text-[11px] text-gray-400 mt-1">Hampir 100% tamu membaca pengingat</div>
        </div>

        <div className="bg-[#151B2B] p-5 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">Konversi Win-Back Tamu</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">28.3% <span className="text-xs text-amber-400 font-normal">Datang Kembali</span></div>
          <div className="text-[11px] text-gray-400 mt-1">Omzet penyelamatan: Rp 32.5 Jt</div>
        </div>
      </div>

      {/* Main Grid: Trigger List & Template Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Active Automation Triggers (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#151B2B] p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Alur Otomatisasi Pesan WhatsApp (Mekari Qontak Standard)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pesan dikirim otomatis saat terjadi kejadian di kasir, reservasi meja, atau hari ulang tahun.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {triggers.map((trg) => {
                const isSelected = trg.id === selectedTrigger.id;
                return (
                  <div
                    key={trg.id}
                    onClick={() => setSelectedTrigger(trg)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500/60 shadow-lg shadow-purple-900/20'
                        : 'bg-[#101522] border-white/5 hover:border-white/20 hover:bg-[#182033]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          trg.category === 'RESERVATION' ? 'bg-blue-500/20 text-blue-400' :
                          trg.category === 'POST_DINING' ? 'bg-pink-500/20 text-pink-400' :
                          trg.category === 'BIRTHDAY' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {trg.category === 'RESERVATION' && <Clock className="w-4 h-4" />}
                          {trg.category === 'POST_DINING' && <Star className="w-4 h-4" />}
                          {trg.category === 'BIRTHDAY' && <Gift className="w-4 h-4" />}
                          {trg.category === 'RETENTION' && <RotateCcw className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{trg.name}</div>
                          <div className="text-[10px] text-gray-400">Pemicu: {trg.triggerEvent}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(trg.id);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            trg.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                          }`}
                        >
                          {trg.status === 'ACTIVE' ? '● Aktif' : '⏸ Dijeda'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-gray-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-purple-400" />
                        Waktu: <span className="text-gray-200 font-semibold">{trg.timing}</span>
                      </span>
                      <span className="font-mono">
                        Terkirim: <span className="text-purple-300 font-bold">{trg.sentCount}x</span> | Konversi: <span className="text-emerald-400 font-bold">{trg.conversionRate}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Template Preview & Live WhatsApp Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#151B2B] p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Template & Preview Pesan
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {selectedTrigger.id}
              </span>
            </div>

            {/* Smartphone WhatsApp Bubble Preview */}
            <div className="bg-[#0B141B] p-4 rounded-2xl border border-white/10 space-y-3 font-sans">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
                  🌴
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tropical Garden Resto (Official)</div>
                  <div className="text-[9px] text-emerald-400">WhatsApp Verified Business Account</div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#005C4B] p-3.5 rounded-2xl text-xs text-white leading-relaxed whitespace-pre-line shadow-md relative">
                {selectedTrigger.templateMessage
                  .replace('{NAMA_TAMU}', testGuestName)
                  .replace('{TANGGAL}', '30 Agustus 2026')
                  .replace('{JAM}', '19:00 WIB')
                  .replace('{AREA_MEJA}', 'Pendopo VIP Garden')
                  .replace('{PAX}', '6')
                  .replace('{KODE_UNIK}', 'VIP99')}
                <div className="text-[9px] text-white/60 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                  <span>10:45 WIB</span>
                  <span>✓✓</span>
                </div>
              </div>
            </div>

            {/* Live WhatsApp Simulator Test Form */}
            <div className="bg-[#101522] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Simulator Kirim WhatsApp Otomatis
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold">Nama Tamu Uji Coba</label>
                  <input
                    type="text"
                    value={testGuestName}
                    onChange={(e) => setTestGuestName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#151B2B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold">Nomor WhatsApp Tujuan</label>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#151B2B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulateSend}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Uji Coba Pemicu Otomatis</span>
              </button>

              {testStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs animate-fade-in font-medium">
                  {testStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
