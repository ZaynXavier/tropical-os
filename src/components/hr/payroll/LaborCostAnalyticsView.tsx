import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Building,
  UtensilsCrossed,
  Wine,
  Smile,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../../services/payrollService';

export const LaborCostAnalyticsView: React.FC = () => {
  const [dailySalesTarget, setDailySalesTarget] = useState<number>(12000000); // 12 Juta
  const [actualPosSales, setActualPosSales] = useState<number>(11450000); // 11.45 Juta
  const [scheduledStaffCount, setScheduledStaffCount] = useState<number>(14);

  // Hourly rate avg per staff ~Rp 21.875/jam (Rp 175.000/shift 8 jam)
  const estimatedLaborCostToday = scheduledStaffCount * 175000;
  const laborCostPercentage = actualPosSales > 0 ? (estimatedLaborCostToday / actualPosSales) * 100 : 0;
  const totalScheduledHours = scheduledStaffCount * 8;
  const salesPerLaborHour = totalScheduledHours > 0 ? actualPosSales / totalScheduledHours : 0;

  const getHealthStatus = (ratio: number) => {
    if (ratio < 18) {
      return {
        label: 'Understaffed (Kurang Staf)',
        color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
        advice: 'Rasio biaya gaji sangat rendah (<18%). Perhatian: Kualitas pelayanan tamu dan kecepatan saji dapur berisiko menurun saat jam sibuk.',
      };
    }
    if (ratio <= 25) {
      return {
        label: 'Optimal & Sehat (18% - 25%)',
        color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        advice: 'Efisiensi tenaga kerja sempurna! Kapasitas staf dapur, bar, dan service seimbang dengan volume penjualan kasir.',
      };
    }
    if (ratio <= 28) {
      return {
        label: 'Moderat / Perhatian (25% - 28%)',
        color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        advice: 'Rasio biaya gaji sedikit melebihi target. Pantau volume pesanan jam makan malam untuk menjaga margin profit.',
      };
    }
    return {
      label: 'Critical Overstaffed (>28%)',
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
      advice: 'Biaya tenaga kerja terlalu tinggi (>28% dari omzet). Rekomendasi: Pulangkan staf part-time atau berikan cuti kompensasi lebih awal (Cut Labor).',
    };
  };

  const status = getHealthStatus(laborCostPercentage);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Info */}
      <div className="bg-[#151B2B] p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Labor Cost % vs Omzet POS (Standar Resto 7shifts)
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                  ● {status.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Monitoring rasio efisiensi biaya gaji karyawan terjadwal terhadap realisasi omzet kasir harian.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Standar Target Restoran</div>
              <div className="text-sm font-black text-purple-300">18.0% — 25.0%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rasio Aktual */}
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">Rasio Labor Cost Aktual</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <PercentIcon />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {laborCostPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target max: 25.0%</span>
          </div>
        </div>

        {/* Total Omzet POS */}
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Omzet Penjualan POS Kasir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {formatCurrency(actualPosSales)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Target harian: {formatCurrency(dailySalesTarget)}
          </div>
        </div>

        {/* Biaya Gaji Terjadwal */}
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">Estimasi Biaya Gaji Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {formatCurrency(estimatedLaborCostToday)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {scheduledStaffCount} Staf On-Duty ({totalScheduledHours} Jam)
          </div>
        </div>

        {/* SPLH (Sales Per Labor Hour) */}
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-blue-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300">Sales Per Labor Hour (SPLH)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {formatCurrency(salesPerLaborHour)} <span className="text-xs font-normal text-blue-300">/jam</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Produktivitas omzet per jam staf
          </div>
        </div>
      </div>

      {/* AI Recommendation Alert Banner */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-lg ${status.color}`}>
        <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider">
            Rekomendasi Manajerial (7shifts Labor Intelligence)
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{status.advice}</p>
        </div>
      </div>

      {/* Division Breakdown & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Breakdown per Divisi Resto (7 Cols) */}
        <div className="lg:col-span-7 bg-[#151B2B] p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              Alokasi Labor Cost per Divisi Restoran
            </h3>
            <span className="text-xs text-gray-400 font-mono">14 Staf Shift Hari Ini</span>
          </div>

          <div className="space-y-3">
            {/* Kitchen */}
            <div className="p-3.5 rounded-2xl bg-[#101522] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>Kitchen (Dapur Utama &amp; Prep)</span>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  Rp 875.000 <span className="text-[10px] text-gray-400 font-normal">(7.6% Omzet)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '38%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>5 Cook &amp; Kitchen Hand On-Duty</span>
                <span>40 Jam Kerja Aktual</span>
              </div>
            </div>

            {/* Bar */}
            <div className="p-3.5 rounded-2xl bg-[#101522] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Wine className="w-4 h-4 text-pink-400" />
                  <span>Bar (Minuman, Kopi, &amp; Dessert)</span>
                </div>
                <span className="font-mono font-bold text-pink-300">
                  Rp 350.000 <span className="text-[10px] text-gray-400 font-normal">(3.1% Omzet)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: '20%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>2 Barista &amp; Bartender On-Duty</span>
                <span>16 Jam Kerja Aktual</span>
              </div>
            </div>

            {/* Service & Floor */}
            <div className="p-3.5 rounded-2xl bg-[#101522] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  <span>Service &amp; Floor (Waitstaff &amp; Runner)</span>
                </div>
                <span className="font-mono font-bold text-emerald-300">
                  Rp 875.000 <span className="text-[10px] text-gray-400 font-normal">(7.6% Omzet)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '38%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>5 Waiter &amp; Greeter On-Duty</span>
                <span>40 Jam Kerja Aktual</span>
              </div>
            </div>

            {/* Cashier & Admin */}
            <div className="p-3.5 rounded-2xl bg-[#101522] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>Kasir &amp; Supervisor Shift</span>
                </div>
                <span className="font-mono font-bold text-blue-300">
                  Rp 350.000 <span className="text-[10px] text-gray-400 font-normal">(3.1% Omzet)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '20%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>2 Kasir &amp; SPV Lantai On-Duty</span>
                <span>16 Jam Kerja Aktual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Shift Simulator (5 Cols) */}
        <div className="lg:col-span-5 bg-[#151B2B] p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Simulator Penjadwalan Staf Shift
          </h3>
          <p className="text-xs text-gray-400">
            Geser nilai di bawah untuk mensimulasikan dampak perubahan omzet dan penambahan staf terhadap rasio Labor Cost.
          </p>

          <div className="space-y-4 pt-2">
            {/* Slider 1: Jumlah Staf */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-300">Jumlah Staf Terjadwal:</span>
                <span className="font-mono text-purple-300 font-bold">{scheduledStaffCount} Orang</span>
              </div>
              <input
                type="range"
                min={6}
                max={25}
                value={scheduledStaffCount}
                onChange={(e) => setScheduledStaffCount(Number(e.target.value))}
                className="w-full mt-2 accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                <span>6 Staf (Min Shift)</span>
                <span>14 Staf (Standar)</span>
                <span>25 Staf (Peak Event)</span>
              </div>
            </div>

            {/* Slider 2: Omzet Realistis */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-300">Simulasi Omzet Penjualan:</span>
                <span className="font-mono text-emerald-300 font-bold">{formatCurrency(actualPosSales)}</span>
              </div>
              <input
                type="range"
                min={4000000}
                max={30000000}
                step={500000}
                value={actualPosSales}
                onChange={(e) => setActualPosSales(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                <span>Rp 4 Juta (Sepi/Hujan)</span>
                <span>Rp 12 Juta (Reguler)</span>
                <span>Rp 30 Juta (Weekend)</span>
              </div>
            </div>

            {/* Hasil Simulasi Box */}
            <div className="p-4 rounded-2xl bg-[#101522] border border-white/10 space-y-2">
              <div className="text-[11px] font-bold text-gray-300">Hasil Prediksi Simulasi:</div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-400">Prediksi Rasio Labor:</span>
                <span className={`text-xl font-black ${laborCostPercentage > 28 ? 'text-rose-400' : laborCostPercentage >= 18 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {laborCostPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-gray-400">Total Biaya Gaji:</span>
                <span className="font-mono text-white font-bold">{formatCurrency(estimatedLaborCostToday)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PercentIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
