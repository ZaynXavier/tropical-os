import React, { useState } from 'react';
import {
  Users,
  PhoneCall,
  Calendar,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  Bot,
  Send,
  Search,
  Filter,
  ShieldCheck,
  HeartHandshake,
  UtensilsCrossed,
  Gift,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Layers,
  Star,
  PartyPopper,
  Building2,
  Coffee
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Lead, Opportunity, Customer } from '../../data/mockCrmData';

interface CrmDashboardViewProps {
  leads: Lead[];
  opportunities: Opportunity[];
  customers: Customer[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenWhatsApp: (phone: string, name: string) => void;
  onConvertToOpportunity: (lead: Lead) => void;
}

interface TodayReservation {
  id: string;
  guestName: string;
  phone: string;
  tableArea: 'Gazebo Garden VIP' | 'Indoor AC Main Hall' | 'Sunset Poolside Deck' | 'Pendopo Heritage';
  pax: number;
  time: string;
  eventType: string;
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'WAITING_DP';
  specialNote?: string;
  vipTier?: 'GOLD_VIP' | 'PLATINUM_VIP' | 'CORPORATE';
}

const INITIAL_TODAY_RESERVATIONS: TodayReservation[] = [
  {
    id: 'RES-TODAY-01',
    guestName: 'Bpk. Hendra Gunawan',
    phone: '+62 812-3456-7890',
    tableArea: 'Gazebo Garden VIP',
    pax: 12,
    time: '18:30',
    eventType: 'Family Birthday Dinner',
    status: 'CONFIRMED',
    specialNote: 'Request complimentary candle decor & table flowers setup. Bebas gluten untuk 2 tamu.',
    vipTier: 'PLATINUM_VIP',
  },
  {
    id: 'RES-TODAY-02',
    guestName: 'PT Digital Nusa (Sarah)',
    phone: '+62 811-9876-5432',
    tableArea: 'Indoor AC Main Hall',
    pax: 45,
    time: '19:00',
    eventType: 'Company Appreciation Banquet',
    status: 'CONFIRMED',
    specialNote: 'Proyektor & wireless mic stand standby. Menu Nusantara Premium Buffet.',
    vipTier: 'CORPORATE',
  },
  {
    id: 'RES-TODAY-03',
    guestName: 'Jessica Tan & Friends',
    phone: '+62 818-0987-1234',
    tableArea: 'Sunset Poolside Deck',
    pax: 8,
    time: '17:15',
    eventType: 'Sunset Cocktail & Tapas',
    status: 'SEATED',
    specialNote: 'Spot sunset langsung menghadap pool. 2 Mocktail pitcher pre-ordered.',
    vipTier: 'GOLD_VIP',
  },
  {
    id: 'RES-TODAY-04',
    guestName: 'Dr. Ronald & Fam',
    phone: '+62 819-3344-5566',
    tableArea: 'Pendopo Heritage',
    pax: 6,
    time: '20:00',
    eventType: 'Intimate Gathering',
    status: 'WAITING_DP',
    specialNote: 'Menunggu transfer pelunasan DP 50% sebelum jam 15:00.',
  },
];

interface SmartAIRecommendation {
  id: string;
  type: 'HOT_DEAL' | 'BIRTHDAY' | 'LOYALTY_DORMANT' | 'UPSELL';
  title: string;
  guestName: string;
  phone: string;
  description: string;
  suggestedAction: string;
  recommendedMessage: string;
  badge: string;
  badgeColor: string;
}

const INITIAL_AI_RECOMMENDATIONS: SmartAIRecommendation[] = [
  {
    id: 'ai-01',
    type: 'HOT_DEAL',
    title: 'Peluang Closing Gathering 60 Pax',
    guestName: 'Hendra Wijaya (PT Digital Nusantara)',
    phone: '+62 812-3456-7890',
    description: 'Klien menanyakan diskon weekday untuk acara tanggal 12 September. Probabilitas closing 85%.',
    suggestedAction: 'Kirim penawaran free dessert station jika konfirmasi DP hari ini',
    recommendedMessage: 'Halo Bpk. Hendra, terima kasih atas minat gathering di Tropical Garden Resto! Khusus konfirmasi booking hari ini, kami sertakan complimentary Artisan Dessert Station untuk 60 tamu Bapak. Boleh kami kirimkan revisi draft penawarannya?',
    badge: 'Hot Opportunity',
    badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
  },
  {
    id: 'ai-02',
    type: 'BIRTHDAY',
    title: 'Ulang Tahun VIP Member Besok',
    guestName: 'Ibu Sarah Kartika',
    phone: '+62 811-9876-5432',
    description: 'Ulang tahun pada 27 Agustus. Total pengeluaran tahun ini Rp 24.500.000 (Top 5% Spender).',
    suggestedAction: 'Kirim voucher birthday dining & complimentary Tropical Signature Mocktail',
    recommendedMessage: 'Selamat Ulang Tahun Ibu Sarah Kartika tercinta! 🎂 Seluruh tim Tropical Garden Resto mendoakan kesehatan dan kebahagiaan selalu. Dapatkan voucher spesial dining 20% + complimentary Tropical Signature Cake untuk reservasi minggu ini.',
    badge: 'VIP Birthday',
    badgeColor: 'text-pink-300 bg-pink-500/20 border-pink-500/30',
  },
  {
    id: 'ai-03',
    type: 'LOYALTY_DORMANT',
    title: 'Re-engagement Tamu Corporate Reguler',
    guestName: 'Bpk. Budi Santoso',
    phone: '+62 813-1122-3344',
    description: 'Belum reservasi kembali selama 35 hari (biasanya booking weekly VIP lunch).',
    suggestedAction: 'Undang ke New Tasting Menu Sunset Special Session',
    recommendedMessage: 'Selamat siang Bpk. Budi! Kami sangat merindukan kehadiran Bapak di Tropical Garden Resto. Minggu ini Chef kami merilis New Balinese Fusion Tasting Menu. Khusus Bapak kami siapkan complimentary Chef Platter saat kunjungan berikutnya.',
    badge: 'Tamu Dormant',
    badgeColor: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
  },
];

const SOURCE_COLORS = ['#A855F7', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];

export const CrmDashboardView: React.FC<CrmDashboardViewProps> = ({
  leads,
  opportunities,
  customers,
  onAddLead,
  onAddCustomer,
  onNavigateTab,
  onOpenWhatsApp,
  onConvertToOpportunity,
}) => {
  const [reservations, setReservations] = useState<TodayReservation[]>(INITIAL_TODAY_RESERVATIONS);
  const [recommendations, setRecommendations] = useState<SmartAIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick modals state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddResModal, setShowAddResModal] = useState(false);

  // Lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    source: 'WhatsApp' as Lead['source'],
    interest: 'Corporate Gathering' as Lead['interest'],
    estimatedGuests: 25,
    notes: '',
  });

  // Reservation form state
  const [newResForm, setNewResForm] = useState({
    guestName: '',
    phone: '',
    tableArea: 'Gazebo Garden VIP' as TodayReservation['tableArea'],
    pax: 6,
    time: '19:00',
    eventType: 'Dinner Gathering',
    specialNote: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations
  const totalPipelineValue = opportunities.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const wonDeals = opportunities.filter((o) => o.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const totalTodayPax = reservations.reduce((acc, r) => acc + r.pax, 0);

  // Monthly revenue chart mock
  const monthlyRevenueData = [
    { month: 'Mei', Target: 80000000, Realisasi: 72000000 },
    { month: 'Jun', Target: 95000000, Realisasi: 89000000 },
    { month: 'Jul', Target: 110000000, Realisasi: 118000000 },
    { month: 'Ags (Aktual)', Target: 130000000, Realisasi: totalPipelineValue > 0 ? totalPipelineValue : 124000000 },
  ];

  // Lead source distribution
  const leadSourceData = [
    { name: 'WhatsApp Web', value: leads.filter((l) => l.source === 'WhatsApp').length || 4 },
    { name: 'Instagram DM & Bio', value: leads.filter((l) => l.source === 'Instagram').length || 5 },
    { name: 'Walk-In Resto', value: leads.filter((l) => l.source === 'Walk-in').length || 2 },
    { name: 'Website & Google', value: leads.filter((l) => l.source === 'Website').length || 3 },
    { name: 'Referral Tamu VIP', value: leads.filter((l) => l.source === 'Referral').length || 2 },
  ];

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      showToast('Harap isi nama dan nomor telepon prospek.');
      return;
    }
    onAddLead({
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email || `${newLeadForm.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      company: newLeadForm.company,
      source: newLeadForm.source,
      interest: newLeadForm.interest,
      estimatedGuests: Number(newLeadForm.estimatedGuests) || 10,
      status: 'New',
      assignedTo: 'Alya (Lead CRM)',
      notes: newLeadForm.notes || 'Pencatatan lead baru via CRM Command Center',
    });
    setShowAddLeadModal(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      source: 'WhatsApp',
      interest: 'Corporate Gathering',
      estimatedGuests: 25,
      notes: '',
    });
    showToast(`Lead baru atas nama "${newLeadForm.name}" berhasil ditambahkan ke CRM.`);
  };

  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.guestName || !newResForm.phone) {
      showToast('Harap isi nama tamu dan nomor WhatsApp.');
      return;
    }
    const newRes: TodayReservation = {
      id: `RES-TODAY-${String(reservations.length + 1).padStart(2, '0')}`,
      guestName: newResForm.guestName,
      phone: newResForm.phone,
      tableArea: newResForm.tableArea,
      pax: Number(newResForm.pax) || 4,
      time: newResForm.time,
      eventType: newResForm.eventType,
      status: 'CONFIRMED',
      specialNote: newResForm.specialNote,
      vipTier: 'GOLD_VIP',
    };
    setReservations((prev) => [newRes, ...prev]);
    setShowAddResModal(false);
    setNewResForm({
      guestName: '',
      phone: '',
      tableArea: 'Gazebo Garden VIP',
      pax: 6,
      time: '19:00',
      eventType: 'Dinner Gathering',
      specialNote: '',
    });
    showToast(`Reservasi meja untuk "${newResForm.guestName}" berhasil didaftarkan.`);
  };

  const handleSendAiMessage = (rec: SmartAIRecommendation) => {
    onOpenWhatsApp(rec.phone, rec.guestName);
    showToast(`Membuka WhatsApp Web untuk mengirim rekomendasi follow-up kepada ${rec.guestName}`);
  };

  const handleUpdateResStatus = (id: string, newStatus: TodayReservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    const item = reservations.find((r) => r.id === id);
    showToast(`Status reservasi ${item?.guestName} diubah menjadi ${newStatus}.`);
  };

  return (
    <div className="space-y-6 text-gray-100 animate-fade-in pb-10">
      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[#0F172A] text-emerald-300 border border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Command Center Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B1538] via-[#161B33] to-[#0F172A] p-6 md:p-8 border border-purple-500/30 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>CRM &amp; Guest Relations Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Hubungan Pelanggan &amp; Event Sales
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Monitoring prospek deals event, reservasi meja VIP harian, integrasi WhatsApp multi-agent gateway, serta analitik retensi tamu Tropical Garden Resto Canggu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Prospek / Lead Baru</span>
            </button>
            <button
              onClick={() => setShowAddResModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#283049] hover:bg-[#343e5e] text-gray-100 text-xs font-bold transition-all border border-[#3E4C6D] cursor-pointer shadow-sm"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>+ Reservasi Meja VIP</span>
            </button>
            <button
              onClick={() => onNavigateTab?.('whatsapp')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pipeline Value */}
        <div
          onClick={() => onNavigateTab?.('pipeline')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nilai Pipeline Deals</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white group-hover:text-purple-300 transition-colors">
              Rp {(totalPipelineValue / 1000000).toFixed(1)} M
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-purple-300 font-semibold">{opportunities.length} Active Deals</span>
            <span className="text-emerald-400 font-medium flex items-center gap-0.5">
              Closed: Rp {(wonValue / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>

        {/* Card 2: Active Leads */}
        <div
          onClick={() => onNavigateTab?.('leads')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-blue-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Inquiries / Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-blue-300 group-hover:text-blue-200 transition-colors">
              {leads.length}
            </span>
            <span className="text-xs text-emerald-400 font-bold">+28% MoM</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-gray-300">Konversi: ~75%</span>
            <span className="text-blue-300 font-medium">Lihat Prospek →</span>
          </div>
        </div>

        {/* Card 3: Today Reservations */}
        <div
          onClick={() => onNavigateTab?.('reservation')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-emerald-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reservasi Meja Hari Ini</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
              {reservations.length} Meja
            </span>
            <span className="text-xs text-emerald-300 font-semibold">({totalTodayPax} Pax)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-emerald-400 font-medium">3 VIP Terkonfirmasi</span>
            <span className="text-amber-300 font-medium">1 Tunggu DP</span>
          </div>
        </div>

        {/* Card 4: WhatsApp Gateway & CSAT */}
        <div
          onClick={() => onNavigateTab?.('whatsapp')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-pink-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp &amp; Kepuasan</span>
            <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-pink-300 group-hover:text-pink-200 transition-colors">
              4.9 ★
            </span>
            <span className="text-xs text-emerald-400 font-bold">(98.4% CSAT)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gateway Online
            </span>
            <span className="text-gray-300 font-mono">Avg Reply: 1.8m</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Reservations Radar & Sales Pipeline Kanbannette */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Today's Reservations Radar & Stage Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Live Today's VIP & Group Reservations */}
          <div className="rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#283049] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-100">Radar Reservasi Meja &amp; Event Hari Ini</h3>
                  <p className="text-xs text-gray-400">Jadwal kedatangan tamu, alokasi area resto, dan instruksi khusus</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#111827] text-emerald-400 border border-emerald-500/30">
                  Total {totalTodayPax} Pax Terdaftar
                </span>
                <button
                  onClick={() => setShowAddResModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Booking</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    res.status === 'SEATED'
                      ? 'bg-blue-950/20 border-blue-800/40'
                      : res.status === 'CONFIRMED'
                      ? 'bg-[#111827] border-[#2D374E] hover:border-emerald-500/40'
                      : 'bg-amber-950/20 border-amber-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="px-2.5 py-1 rounded-xl bg-[#1E2438] border border-[#2D374E] text-xs font-black text-purple-300 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {res.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-100">{res.guestName}</span>
                          {res.vipTier && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-300" />
                              {res.vipTier === 'PLATINUM_VIP' ? 'Platinum VIP' : res.vipTier === 'CORPORATE' ? 'Corporate' : 'Gold VIP'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">{res.eventType} • <strong className="text-gray-200">{res.pax} Pax</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#1E2438] text-gray-300 border border-[#2D374E] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {res.tableArea}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          res.status === 'SEATED'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : res.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {res.status === 'SEATED' ? '● Tamu Hadir / Seated' : res.status === 'CONFIRMED' ? '✓ Terkonfirmasi' : '⏱ Menunggu DP'}
                      </span>
                    </div>
                  </div>

                  {res.specialNote && (
                    <div className="p-2.5 rounded-xl bg-[#1E2438]/80 border border-[#283049] text-xs text-gray-300 flex items-start gap-2">
                      <Gift className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                      <span>{res.specialNote}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1E2438] text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span>WhatsApp: <strong className="text-gray-300 font-mono">{res.phone}</strong></span>
                      <button
                        onClick={() => onOpenWhatsApp(res.phone, res.guestName)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chat Tamu
                      </button>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {res.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateResStatus(res.id, 'SEATED')}
                          className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Check-in Tamu (Seated)
                        </button>
                      )}
                      {res.status === 'WAITING_DP' && (
                        <button
                          onClick={() => handleUpdateResStatus(res.id, 'CONFIRMED')}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Konfirmasi DP Diterima
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Sales Pipeline & Deal Highlights */}
          <div className="rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-100">Deals Prioritas &amp; Pipeline Event</h3>
                  <p className="text-xs text-gray-400">Peluang gathering corporate, intimate wedding &amp; banquet</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab?.('pipeline')}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Kanban Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opportunities.slice(0, 4).map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-2xl bg-[#111827] border border-[#283049] hover:border-purple-500/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {opp.stage}
                      </span>
                      <h4 className="font-bold text-sm text-gray-100 mt-1">{opp.title}</h4>
                      <p className="text-xs text-gray-400">{opp.customerName} {opp.company ? `(${opp.company})` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white font-mono block">
                        Rp {(opp.dealValue / 1000000).toFixed(1)} Juta
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">{opp.guestCount} Pax</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1E2438] text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Event: <strong className="text-gray-200">{opp.eventDate}</strong></span>
                    </div>
                    <button
                      onClick={() => onOpenWhatsApp(opp.phone, opp.customerName)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Follow-up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Co-Pilot & Revenue Projections */}
        <div className="space-y-6">
          {/* Section C: AI Co-Pilot Smart Follow-up Recommendations */}
          <div className="rounded-3xl bg-gradient-to-b from-[#1E2438] to-[#151A2E] border border-purple-500/30 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/40">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-100">AI Co-Pilot Rekomendasi</h3>
                  <p className="text-[11px] text-purple-200/70">Smart Follow-up &amp; Closing Deals</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Live AI
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-2 hover:border-pink-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${rec.badgeColor}`}>
                      {rec.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{rec.guestName}</span>
                  </div>

                  <h5 className="text-xs font-bold text-gray-200">{rec.title}</h5>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{rec.description}</p>

                  <div className="p-2 rounded-xl bg-[#1E2438] border border-[#283049] text-[11px] text-purple-200/90 italic">
                    "{rec.recommendedMessage}"
                  </div>

                  <button
                    onClick={() => handleSendAiMessage(rec)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim via WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Lead Channel Breakdown Chart */}
          <div className="rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <h3 className="font-bold text-sm text-gray-100">Saluran Masuk Prospek (Channels)</h3>
              <span className="text-[10px] text-gray-400">Bulan Ini</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {leadSourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      border: '1px solid #374151',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-[#283049] text-xs">
              {leadSourceData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] }}
                    />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <strong className="text-white font-mono">{item.value} Leads</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Section E: Quick Jump to WhatsApp Blast */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#1E2438] to-purple-950/40 border border-emerald-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">WhatsApp Blast &amp; Promo Broadcast</h4>
                <p className="text-[11px] text-gray-300">Kirim promo paket weekend &amp; voucher anniversary ke segmen VIP</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab?.('blast')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Modul WhatsApp Blast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Quick Add Lead */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Catat Prospek / Lead Baru</h3>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Nama Lengkap Klien / PIC *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ibu Melani Putri"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+62 812-xxxx-xxxx"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Perusahaan / Instansi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Misal: Bank Mandiri / Personal"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Jenis Event / Minat</label>
                  <select
                    value={newLeadForm.interest}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, interest: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Corporate Gathering">Corporate Gathering</option>
                    <option value="Wedding Event">Wedding / Intimate Reception</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="VIP Table">VIP Table Reservation</option>
                    <option value="Catering">Outside Catering</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Estimasi Jumlah Tamu (Pax)</label>
                  <input
                    type="number"
                    min="2"
                    value={newLeadForm.estimatedGuests}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedGuests: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Saluran Masuk (Lead Source)</label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="WhatsApp">WhatsApp Gateway Direct</option>
                  <option value="Instagram">Instagram DM / Bio Link</option>
                  <option value="Walk-in">Walk-in Direct Resto</option>
                  <option value="Website">Website & Google Maps</option>
                  <option value="Referral">Referral Tamu VIP</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Catatan Khusus Klien</label>
                <textarea
                  rows={2}
                  placeholder="Kebutuhan khusus, preferensi menu, jadwal survei lokasi..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#283049]">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  Simpan Prospek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Add VIP Reservation */}
      {showAddResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Buat Reservasi Meja VIP</h3>
              </div>
              <button
                onClick={() => setShowAddResModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Nama Tamu / Pemesan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bapak Gunawan"
                  value={newResForm.guestName}
                  onChange={(e) => setNewResForm({ ...newResForm, guestName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+62 812-xxxx-xxxx"
                    value={newResForm.phone}
                    onChange={(e) => setNewResForm({ ...newResForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Jam Kedatangan (WITA)</label>
                  <input
                    type="time"
                    value={newResForm.time}
                    onChange={(e) => setNewResForm({ ...newResForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Pilihan Area Meja Resto</label>
                  <select
                    value={newResForm.tableArea}
                    onChange={(e) => setNewResForm({ ...newResForm, tableArea: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Gazebo Garden VIP">Gazebo Garden VIP</option>
                    <option value="Indoor AC Main Hall">Indoor AC Main Hall</option>
                    <option value="Sunset Poolside Deck">Sunset Poolside Deck</option>
                    <option value="Pendopo Heritage">Pendopo Heritage</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Jumlah Tamu (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    value={newResForm.pax}
                    onChange={(e) => setNewResForm({ ...newResForm, pax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Jenis Acara / Occasion</label>
                <input
                  type="text"
                  placeholder="Misal: Birthday Dinner, Anniversary, Family Gathering"
                  value={newResForm.eventType}
                  onChange={(e) => setNewResForm({ ...newResForm, eventType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">Catatan Khusus / Dekorasi / Alergi</label>
                <textarea
                  rows={2}
                  placeholder="Request lilin ultah, baby chair, bebas seafood..."
                  value={newResForm.specialNote}
                  onChange={(e) => setNewResForm({ ...newResForm, specialNote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#283049]">
                <button
                  type="button"
                  onClick={() => setShowAddResModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Simpan Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
