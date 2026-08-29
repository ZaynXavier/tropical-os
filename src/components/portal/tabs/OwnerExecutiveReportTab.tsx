import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Utensils,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Crown,
  CreditCard,
  QrCode,
  Banknote,
  FileSpreadsheet,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { MOCK_STAFF_RESERVATIONS } from '../../../data/mockReservations';

interface OwnerExecutiveReportTabProps {
  currentUser: EmployeePersonnel | null;
  currentTime: Date;
  onNavigateTab?: (tab: string) => void;
}

export const OwnerExecutiveReportTab: React.FC<OwnerExecutiveReportTabProps> = ({
  currentUser,
  currentTime,
  onNavigateTab,
}) => {
  const [reportSection, setReportSection] = useState<'revenue' | 'operations'>('revenue');

  // Today's Key Financial Numbers (28 Agustus 2026)
  const financialData = {
    targetRevenue: 35000000,
    grossRevenue: 38450000,
    achievementPct: 109.8,
    grossProfit: 26220000,
    grossProfitMargin: 68.2,
    cogsAmount: 12230000,
    cogsPct: 31.8, // Healthy HPP (<35%)
    totalPax: 219,
    avgSpendPerPax: 175570,
    totalOrders: 64,
    categories: [
      { name: 'Dine-In Makanan Tradisional & Modern', amount: 21650000, pct: 56.3, color: 'bg-emerald-500' },
      { name: 'Bar & Minuman Spesial / Mocktail', amount: 7950000, pct: 20.7, color: 'bg-blue-500' },
      { name: 'Paket VIP Gazebo & Gathering', amount: 6350000, pct: 16.5, color: 'bg-purple-500' },
      { name: 'Takeaway, Bakery & Souvenir', amount: 2500000, pct: 6.5, color: 'bg-amber-500' },
    ],
    payments: [
      { method: 'QRIS (BCA, Mandiri, ShopeePay)', icon: QrCode, amount: 19225000, pct: 50.0, color: 'text-cyan-400' },
      { method: 'EDC Debit / Kredit BCA', icon: CreditCard, amount: 11535000, pct: 30.0, color: 'text-purple-400' },
      { method: 'Transfer Bank (Corporate / DP VIP)', icon: Building, amount: 5380000, pct: 14.0, color: 'text-blue-400' },
      { method: 'Tunai Kasir POS', icon: Banknote, amount: 2310000, pct: 6.0, color: 'text-emerald-400' },
    ],
    hourlyTrends: [
      { time: '10:00 - 12:00', label: 'Opening & Brunch', revenue: 4200000, pax: 28 },
      { time: '12:00 - 14:30', label: 'Lunch Rush VIP', revenue: 16800000, pax: 98, isPeak: true },
      { time: '14:30 - 17:30', label: 'Coffee & Chill', revenue: 3850000, pax: 24 },
      { time: '17:30 - 21:00', label: 'Dinner & Gathering', revenue: 13600000, pax: 69, isPeak: true },
    ],
  };

  // Operations & Staffing Live Overview
  const operationsData = {
    totalPersonnel: 25,
    onDutyToday: 20,
    shiftBreakdown: { pagi: 14, middle: 3, malam: 3 },
    onLeaveCount: 1, // Arfani (Cuti)
    offRosterCount: 4,
    lateArrivals: 0,
    onTimeRate: '100%',
    stationAudit: [
      { dept: 'Kitchen (Dapur Utama)', pic: 'Chef Tri & Ulum', score: 100, status: 'Lengkap & HPP Aman', note: 'Suhu chiller 2°C, Gurame hidup 45kg aman' },
      { dept: 'Bar & Beverage', pic: 'Dina & Azizah', score: 100, status: 'Kalibrasi Klop', note: 'Grinder kopi 1:2, stock es kristal & mocktail aman' },
      { dept: 'Service & Waiter', pic: 'Vita & Bintang', score: 95, status: 'VIP Setup Ready', note: 'Setup 5 Gazebo selesai, briefing 11:30' },
      { dept: 'Cleaning & Utility', pic: 'Rini & Reno', score: 100, status: 'Higienis 100%', note: 'Dishwasher 82°C, area taman & toilet bersih' },
      { dept: 'Kasir & Finance', pic: 'Putri Okta & Ristania', score: 100, status: 'Rekonsiliasi Klop', note: 'Modal kasir Rp 1jt sesuai, QRIS & EDC verified' },
      { dept: 'CRM & Reservasi', pic: 'Aqib Latuh & Arfani', score: 100, status: '6 Booking Terkonfirmasi', note: 'Total 92 Pax, DP Rp 8.050.000 terverifikasi' },
    ],
    managerialNotes: [
      {
        author: 'Heri Setiawan',
        role: 'General Manager',
        time: '11:45 WIB',
        message: 'Shift pagi berjalan sangat kondusif. Bahan baku segar Gurame dan Seafood telah diaudit oleh Chef Ulum. Target penjualan harian terlampaui 109.8%. Semua pengajuan telah diverifikasi.',
      },
      {
        author: 'Putri Okta',
        role: 'Supervisor Floor & Kasir',
        time: '12:00 WIB',
        message: 'Seluruh meja VIP Gazebo dan Garden Hall siap untuk tamu siang. Rekonsiliasi kasir POS shift 1 klop tanpa selisih.',
      },
    ],
    approvalsHandled: [
      { type: 'Checklist Kitchen Shift Pagi', approver: 'Heri Setiawan (GM)', status: 'Approved' },
      { type: 'Checklist Bar Grinder & Ice Bin', approver: 'Putri Okta (SPV)', status: 'Approved' },
      { type: 'Cuti Tahunan Arfani (CRM)', approver: 'Putri Okta (SPV)', status: 'Approved' },
      { type: 'SPL Lembur Event Wedding', approver: 'Heri Setiawan (GM)', status: 'Approved' },
    ],
  };

  const todayReservations = MOCK_STAFF_RESERVATIONS.filter(r => r.date === '2026-08-28');
  const totalReservationPax = todayReservations.reduce((sum, r) => sum + r.pax, 0);

  return (
    <div className="space-y-4 animate-fade-in text-gray-100">
      {/* Executive Header Banner */}
      <div className="p-4.5 rounded-3xl bg-gradient-to-br from-[#261A3C] via-[#1A182E] to-[#0E1220] border-2 border-amber-500/50 space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black shadow-inner">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Laporan Eksekutif Pemilik
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/30 text-amber-200 border border-amber-500/40">
                  Owner View
                </span>
              </div>
              <p className="text-[10px] text-gray-300">
                Pengawasan Pendapatan &amp; Operasional Harian Resto
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/40 px-2.5 py-1 rounded-full border border-amber-500/30 block">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
            <span className="text-[9px] text-gray-400 mt-0.5 block">28 Agt 2026</span>
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-200 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-tight">
              Owner Mode: Laporan otomatis diperbarui real-time. Approval tugas &amp; izin ditangani mandiri oleh Manager &amp; SPV.
            </span>
          </div>
        </div>
      </div>

      {/* Main Switcher: Laporan Pendapatan vs Laporan Operasional */}
      <div className="bg-[#161C2C] p-1 rounded-2xl border border-[#2D374E] flex items-center shadow-lg">
        <button
          onClick={() => setReportSection('revenue')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            reportSection === 'revenue'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-300" />
          <span>Pendapatan Harian</span>
        </button>

        <button
          onClick={() => setReportSection('operations')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            reportSection === 'operations'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-300" />
          <span>Laporan Operasional</span>
        </button>
      </div>

      {/* SECTION 1: LAPORAN PENDAPATAN HARIAN */}
      {reportSection === 'revenue' && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Main Omset Card */}
          <div className="p-4.5 rounded-3xl bg-gradient-to-br from-[#182822] via-[#121E1C] to-[#0F1420] border-2 border-emerald-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>TOTAL OMSET KASIR HARI INI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                +{financialData.achievementPct}% Target
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  Rp {financialData.grossRevenue.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Target Harian: Rp {financialData.targetRevenue.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Laba Kotor</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Rp {financialData.grossProfit.toLocaleString('id-ID')} ({financialData.grossProfitMargin}%)
                </span>
              </div>
            </div>

            {/* Quick 3 Key Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[9px] text-gray-400 block">Rata-rata/Pax</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  Rp {Math.round(financialData.avgSpendPerPax / 1000)}rb
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[9px] text-gray-400 block">Total Tamu</span>
                <span className="text-xs font-bold text-white font-mono">
                  {financialData.totalPax} Pax
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[9px] text-gray-400 block">Rasio HPP</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {financialData.cogsPct}% (Sehat)
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Category */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Rincian Pendapatan per Kategori</span>
              </h3>
              <span className="text-[10px] text-gray-400">4 Kategori</span>
            </div>

            <div className="space-y-2.5">
              {financialData.categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-200">{cat.name}</span>
                    <span className="font-bold text-white font-mono">
                      Rp {cat.amount.toLocaleString('id-ID')} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#0F1420] h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                <span>Metode Pembayaran (Cashless vs Cash)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">94% Cashless</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {financialData.payments.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-1">
                  <div className="flex items-center justify-between">
                    <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                    <span className="text-[10px] font-bold text-gray-400 font-mono">{p.pct}%</span>
                  </div>
                  <div className="font-bold text-white text-[11px] truncate">{p.method}</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours Trend */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-[#2D374E] space-y-2.5 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Tren Penjualan per Jam Operasional</span>
              </h3>
              <span className="text-[10px] text-gray-400">Peak Hours</span>
            </div>

            <div className="space-y-1.5">
              {financialData.hourlyTrends.map((h, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl flex items-center justify-between text-xs border ${
                    h.isPeak
                      ? 'bg-[#182236] border-blue-500/40 shadow-sm'
                      : 'bg-[#0F1420] border-[#2D374E]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-white">{h.time}</span>
                      {h.isPeak && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                          🔥 Ramai
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">{h.label} ({h.pax} Pax)</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-xs">
                    Rp {h.revenue.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LAPORAN OPERASIONAL & KARYAWAN */}
      {reportSection === 'operations' && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Staff Attendance Summary Card */}
          <div className="p-4.5 rounded-3xl bg-gradient-to-br from-[#1E1B38] via-[#15162A] to-[#0F1420] border-2 border-purple-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>KEHADIRAN &amp; SHIFT 25 KARYAWAN</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                {operationsData.onTimeRate} On-Time
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Bertugas</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{operationsData.onDutyToday} Org</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Izin / Cuti</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{operationsData.onLeaveCount} Org</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Off Roster</span>
                <span className="text-sm font-bold text-gray-400 font-mono">{operationsData.offRosterCount} Org</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Terlambat</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">0</span>
              </div>
            </div>

            <div className="text-[10px] text-purple-200 pt-1 flex items-center justify-between border-t border-purple-500/20">
              <span>Shift Pagi: 14 Orang</span>
              <span>Shift Middle: 3 Orang</span>
              <span>Shift Sore: 3 Orang</span>
            </div>
          </div>

          {/* Audit SOP & Checklist 6 Divisi Resto */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kepatuhan SOP &amp; Kesiapan 6 Divisi Resto</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">99.2% Kepatuhan</span>
            </div>

            <div className="space-y-2">
              {operationsData.stationAudit.map((st, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{st.dept}</span>
                      <span className="text-[9px] text-purple-300 font-mono">({st.pic})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      {st.score}%
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center justify-between">
                    <span>{st.note}</span>
                    <span className="text-emerald-400 font-semibold">{st.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan Reservasi VIP Hari Ini */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('reservations')}
            className="p-4 rounded-3xl bg-gradient-to-r from-[#17233B] via-[#141C30] to-[#18152B] border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-xl space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Ringkasan Reservasi &amp; VIP Hari Ini
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                <span>Lihat Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Total Booking</span>
                <span className="font-bold text-white font-mono">{todayReservations.length} Grup</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Jumlah Tamu</span>
                <span className="font-bold text-cyan-300 font-mono">{totalReservationPax} Pax</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[9px] text-gray-400 block">Total Deposit</span>
                <span className="font-bold text-emerald-400 font-mono">Rp 8.05 Jt</span>
              </div>
            </div>
          </div>

          {/* Catatan Log Manajerial (GM & SPV) */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Catatan Log Harian General Manager &amp; SPV</span>
              </h3>
              <span className="text-[10px] text-gray-400">Verifikasi Tim</span>
            </div>

            <div className="space-y-2">
              {operationsData.managerialNotes.map((note, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{note.author}</span>
                      <span className="text-[10px] text-gray-400 ml-1.5">({note.role})</span>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-300 bg-[#161C2C] px-2 py-0.5 rounded border border-[#2D374E]">
                      {note.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed italic bg-black/20 p-2 rounded-xl">
                    &quot;{note.message}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Persetujuan Mandiri oleh SPV / GM (Read-Only Status for Owner) */}
          <div className="p-4 rounded-3xl bg-[#161C2C] border border-amber-500/30 space-y-2.5 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white">Log Persetujuan Mandiri (SPV &amp; GM)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                Semua Terverifikasi ✓
              </span>
            </div>

            <div className="space-y-1.5">
              {operationsData.approvalsHandled.map((app, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-[#0F1420] border border-[#2D374E] flex items-center justify-between text-xs"
                >
                  <span className="text-[11px] text-gray-300">{app.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">{app.approver}</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ✓ {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
