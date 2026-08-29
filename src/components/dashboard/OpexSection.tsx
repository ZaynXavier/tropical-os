import React from 'react';
import { OpexData } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Flame,
  Droplets,
  Shirt,
  Sparkles,
  Wrench,
  Megaphone,
  Radio,
  Bug,
  DollarSign,
} from 'lucide-react';

interface OpexSectionProps {
  data: OpexData;
}

export const OpexSection: React.FC<OpexSectionProps> = ({ data }) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: 'SAVING' | 'NORMAL' | 'OVER_BUDGET') => {
    switch (status) {
      case 'SAVING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ✓ Hemat
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Normal
          </span>
        );
      case 'OVER_BUDGET':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ⚠️ Over Budget
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Dimensi 6
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>Biaya Operasional, Utilitas &amp; OPEX Control</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Realisasi beban operasional bulanan terhadap plafon anggaran (budget adherence) dan pengendalian beban listrik/gas/maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-xs font-bold text-gray-200">
            OPEX / Sales:{' '}
            <strong className="text-purple-300">{(data.opexToSalesPct ?? 0).toFixed(1)}%</strong>
          </span>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1.5">
          <span className="text-[11px] text-gray-400 font-medium">Total Realisasi OPEX</span>
          <div className="text-2xl font-black text-gray-100">{formatRp(data.totalActualOpex)}</div>
          <div className="text-[11px] text-gray-300">
            Budget: <strong className="text-gray-200">{formatRp(data.totalBudgetOpex)}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1.5">
          <span className="text-[11px] text-gray-400 font-medium">Kepatuhan Anggaran (Adherence)</span>
          <div className="text-2xl font-black text-emerald-400">{(data.budgetAdherencePct ?? 0).toFixed(1)}%</div>
          <div className="text-[11px] text-emerald-300">
            Hemat Rp {((data.totalBudgetOpex ?? 0) - (data.totalActualOpex ?? 0)).toLocaleString('id-ID')} dari plafon
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1.5">
          <span className="text-[11px] text-gray-400 font-medium">Beban vs Periode Lalu</span>
          <div className="text-2xl font-black text-purple-300 flex items-baseline gap-2">
            <span>+{data.totalPreviousOpex ? (((data.totalActualOpex - data.totalPreviousOpex) / data.totalPreviousOpex) * 100).toFixed(1) : '0.0'}%</span>
            <span className="text-xs font-normal text-gray-400">MoM</span>
          </div>
          <div className="text-[11px] text-gray-300">Lalu: {formatRp(data.totalPreviousOpex)}</div>
        </div>
      </div>

      {/* 10 OPEX Categories Table */}
      {data.categories && data.categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Realisasi 10 Pos Beban Operasional Resto
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#2D374E] bg-[#111827]/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E2438] text-gray-300 font-bold border-b border-[#2D374E]">
                <tr>
                  <th className="p-3">Kategori Biaya Operasional</th>
                  <th className="p-3 text-right">Realisasi (Actual)</th>
                  <th className="p-3 text-right">Plafon (Budget)</th>
                  <th className="p-3 text-right">Bulan Lalu</th>
                  <th className="p-3 text-right">Deviasi vs Budget</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/70 text-gray-200">
                {data.categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#1E2438]/60 transition-colors">
                    <td className="p-3 font-bold text-gray-100">{cat.categoryName}</td>
                    <td className="p-3 text-right font-bold text-gray-100">{formatRp(cat.actualAmount)}</td>
                    <td className="p-3 text-right text-gray-400">{formatRp(cat.budgetAmount)}</td>
                    <td className="p-3 text-right text-gray-400">{formatRp(cat.previousPeriodAmount)}</td>
                    <td
                      className={`p-3 text-right font-bold ${
                        (cat.variancePercentage ?? 0) > 5
                          ? 'text-rose-400'
                          : (cat.variancePercentage ?? 0) < 0
                          ? 'text-emerald-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {(cat.variancePercentage ?? 0) > 0 ? '+' : ''}
                      {(cat.variancePercentage ?? 0).toFixed(1)}%
                    </td>
                    <td className="p-3">{getStatusBadge(cat.status)}</td>
                    <td className="p-3 text-gray-300 text-[11px] max-w-xs">{cat.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostics */}
      {data.diagnosticInsights && data.diagnosticInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Efisiensi Biaya Operasional (Rule-Based Insights)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.category}
                category="OPEX_EFFICIENCY"
                description={insight.issue}
                suggestedAction={insight.recommendation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
