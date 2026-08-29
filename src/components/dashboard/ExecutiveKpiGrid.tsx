import React from 'react';
import { ExecutiveKPI } from '../../data/dashboard/types';
import { User } from '../../types';
import { permissionService } from '../../services/permissionService';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Utensils,
  Briefcase,
  PieChart,
  Percent,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

interface ExecutiveKpiGridProps {
  kpi: ExecutiveKPI;
  user: User | null;
  periodLabel: string;
}

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = ({ kpi, user, periodLabel }) => {
  // STRICT KPI PERMISSION: Hanya Owner, Manager, dan Finance yang boleh melihat KPI
  const canView = permissionService.canViewKpi(user as any);

  if (!canView) {
    return null;
  }

  const isExecutiveOrFinance = true;

  // Format currency in Rupiah
  const formatRp = (amount?: number | null) => {
    return `Rp ${(amount ?? 0).toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Key Performance Indicators ({periodLabel})</span>
        </h2>
        <span className="text-xs text-purple-300 font-mono">Real-time Snapshot</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sales & Target */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total Penjualan (Omzet)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-black text-gray-100 tracking-tight">
              {formatRp(kpi.totalSales)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Target: {formatRp(kpi.salesTarget)}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  (kpi.achievementPercentage ?? 0) >= 100
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : (kpi.achievementPercentage ?? 0) >= 90
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {(kpi.achievementPercentage ?? 0).toFixed(1)}% Tercapai
              </span>
            </div>
          </div>

          {/* Progress bar to target */}
          <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (kpi.achievementPercentage ?? 0) >= 100
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(kpi.achievementPercentage ?? 0, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-gray-400 border-t border-[#2D374E]/60">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              +{kpi.salesVsLastMonth?.percentage ?? 0}% vs Bln Lalu
            </span>
            <span className="text-gray-400 font-medium">+{kpi.salesVsLastYear?.percentage ?? 0}% YoY</span>
          </div>
        </div>

        {/* KPI 2: Guest Count & Average Check */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-pink-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Jumlah Tamu & Rata-rata Check</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-black text-gray-100 tracking-tight">
              {(kpi.guestCount ?? 0).toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Tamu</span>
            </div>
            <div className="text-xs text-pink-300 font-medium">
              Rata-rata: <strong className="font-bold">{formatRp(kpi.averageCheck ?? 0)}</strong> / transaksi
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 text-gray-400 border-t border-[#2D374E]/60">
            <span>Total Transaksi:</span>
            <strong className="text-gray-200">{(kpi.transactionCount ?? 0).toLocaleString('id-ID')} Struk</strong>
          </div>
        </div>

        {/* KPI 3: Food Cost % (HPP) */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-emerald-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Food Cost % (HPP Dapur & Bar)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-black text-gray-100 tracking-tight flex items-baseline gap-2">
              <span>{(kpi.foodCostPercentage ?? 0).toFixed(1)}%</span>
              <span className="text-xs font-medium text-emerald-400">Target &lt; 35%</span>
            </div>
            <div className="text-xs text-gray-400">
              Kondisi HPP terkendali &amp; margin bahan baku sehat.
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 text-gray-400 border-t border-[#2D374E]/60">
            <span>Status Efisiensi:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sangat Sehat
            </span>
          </div>
        </div>

        {/* KPI 4: Labor Cost % (Biaya Tenaga Kerja) */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-blue-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Labor Cost % (SDM)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-black text-gray-100 tracking-tight flex items-baseline gap-2">
              <span>{(kpi.laborCostPercentage ?? 0).toFixed(1)}%</span>
              <span className="text-xs font-medium text-blue-300">Target &lt; 20%</span>
            </div>
            <div className="text-xs text-gray-400">
              24 Personel aktif (Rasio produktivitas optimal)
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 text-gray-400 border-t border-[#2D374E]/60">
            <span>Status Manpower:</span>
            <span className="text-blue-300 font-bold">Balanced Staffing</span>
          </div>
        </div>

        {/* KPI 5 & 6 (Only for Owner / Manager / Finance) */}
        {isExecutiveOrFinance && (
          <>
            {/* KPI 5: Laba Kotor (Gross Profit) */}
            <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/40 transition-all space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Laba Kotor (Gross Profit)</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl md:text-2xl font-black text-purple-200 tracking-tight">
                  {formatRp(kpi.grossProfit ?? 0)}
                </div>
                <div className="text-xs text-purple-300 font-medium">
                  Margin: <strong className="font-bold">{(kpi.grossProfitMargin ?? 0).toFixed(1)}%</strong> dari omzet bersih
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 text-gray-400 border-t border-[#2D374E]/60">
                <span>Laba Operasional:</span>
                <strong className="text-emerald-400">{formatRp(kpi.operatingProfit ?? 0)} ({(kpi.operatingProfitMargin ?? 0).toFixed(1)}%)</strong>
              </div>
            </div>

            {/* KPI 6: Laba Bersih (Net Profit) & EBITDA */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E2438] to-[#251B38] border border-purple-500/40 hover:border-purple-500/70 transition-all space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Laba Bersih (Net Profit)</span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl md:text-2xl font-black text-emerald-300 tracking-tight">
                  {formatRp(kpi.netProfit ?? 0)}
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  Net Margin: <strong className="font-bold">{(kpi.netProfitMargin ?? 0).toFixed(1)}%</strong> (Sangat Sehat)
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 text-gray-300 border-t border-purple-500/30">
                <span>EBITDA:</span>
                <strong className="text-purple-300">{formatRp(kpi.ebitda ?? 0)} ({(kpi.ebitdaMargin ?? 0).toFixed(1)}%)</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
