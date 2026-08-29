import React from 'react';
import { FoodCostData } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  Utensils,
  AlertTriangle,
  TrendingDown,
  Trash2,
  Gift,
  Coffee,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface FoodCostSectionProps {
  data: FoodCostData;
}

export const FoodCostSection: React.FC<FoodCostSectionProps> = ({ data }) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Dimensi 3
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>Food Cost, HPP &amp; Analisis Variance</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Perhitungan Harga Pokok Penjualan (COGS), deviasi Actual vs Theoretical HPP, wasting, dan kebocoran gramasi.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-xs font-bold text-gray-300 self-start sm:self-auto flex items-center gap-2">
          <span>Actual Food Cost:</span>
          <span className="text-emerald-400 font-extrabold text-sm">{(data.actualFoodCostPct ?? 0).toFixed(1)}%</span>
        </div>
      </div>

      {/* COGS Step Calculation Formula Banner */}
      <div className="p-4 rounded-xl bg-[#111827]/80 border border-[#2D374E] space-y-3">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Rumus Kalkulasi HPP Aktual (Periodic Inventory Method)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]">
            <span className="text-[10px] text-gray-400 block">Stok Awal (Opening)</span>
            <strong className="text-gray-100 font-bold text-xs">{formatRp(data.openingStockValue)}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]">
            <span className="text-[10px] text-emerald-400 block">+ Pembelian (Purchases)</span>
            <strong className="text-emerald-300 font-bold text-xs">{formatRp(data.purchasesValue)}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]">
            <span className="text-[10px] text-blue-300 block">+ Transfer In</span>
            <strong className="text-blue-200 font-bold text-xs">{formatRp(data.transfersInValue)}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]">
            <span className="text-[10px] text-amber-300 block">- Transfer Out</span>
            <strong className="text-amber-200 font-bold text-xs">{formatRp(data.transfersOutValue)}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]">
            <span className="text-[10px] text-rose-400 block">- Stok Akhir (Closing)</span>
            <strong className="text-rose-300 font-bold text-xs">{formatRp(data.closingStockValue)}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30">
            <span className="text-[10px] text-purple-300 font-bold block">= HPP Terpakai (COGS)</span>
            <strong className="text-purple-200 font-black text-xs">{formatRp(data.actualFoodCostRp)}</strong>
          </div>
        </div>
      </div>

      {/* Variance & Waste Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Theoretical vs Actual Variance */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Variance Actual vs Theoretical</span>
          <div className="text-xl font-black text-rose-400 flex items-baseline gap-1.5">
            <span>+{(data.variancePct ?? 0).toFixed(1)}%</span>
            <span className="text-xs font-normal text-gray-400">({formatRp(data.varianceCostRp)})</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Theoretical: <strong className="text-purple-300">{(data.theoreticalFoodCostPct ?? 0).toFixed(1)}%</strong>
          </div>
          <p className="text-[10px] text-gray-400">Selisih antara resep ideal POS dan pemakaian aktual gudang.</p>
        </div>

        {/* Card 2: Waste & Spoilage */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Wasting &amp; Bahan Rusak</span>
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-300">{formatRp(data.wasteCostRp + data.spoilageCostRp)}</div>
          <div className="text-[11px] text-gray-300">
            Waste Masak: {formatRp(data.wasteCostRp)} | Basi: {formatRp(data.spoilageCostRp)}
          </div>
          <p className="text-[10px] text-gray-400">Tercatat di log kitchen wasting dengan foto bukti.</p>
        </div>

        {/* Card 3: Complimentary & Promo Tasting */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Complimentary &amp; VIP</span>
            <Gift className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300">{formatRp(data.complimentaryCostRp)}</div>
          <div className="text-[11px] text-gray-300">0.31% dari total omzet</div>
          <p className="text-[10px] text-gray-400">Tasting tamu VIP, recovery komplain &amp; approval manager.</p>
        </div>

        {/* Card 4: Staff Meal Allocation */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Staff Meal 24 Personel</span>
            <Coffee className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-blue-300">{formatRp(data.staffMealCostRp)}</div>
          <div className="text-[11px] text-gray-300">Rata-rata: Rp 88.950 / personel / bln</div>
          <p className="text-[10px] text-gray-400">Konsumsi makan siang/malam kru operasional sesuai jatah.</p>
        </div>
      </div>

      {/* Historical Food Cost Trend Chart */}
      {data.historicalTrend && data.historicalTrend.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
            <span>Tren Food Cost % Bulanan (Actual vs Theoretical vs Target 33%)</span>
            <span className="text-[11px] text-purple-300 font-mono">Satuan: Persentase (%)</span>
          </div>

          <div className="h-60 w-full bg-[#111827]/60 rounded-xl p-3 border border-[#2D374E]/80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D374E" opacity={0.5} />
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} domain={[25, 40]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2438',
                    borderColor: '#2D374E',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Legend verticalAlign="top" height={32} />
                <Bar dataKey="actualPct" name="Actual Food Cost %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="theoreticalPct" name="Theoretical HPP %" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top 5 High Variance Ingredients Table */}
      {data.topVarianceIngredients && data.topVarianceIngredients.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Top 5 Bahan Baku dengan Selisih (Variance) Terbesar
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#2D374E] bg-[#111827]/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E2438] text-gray-300 font-bold border-b border-[#2D374E]">
                <tr>
                  <th className="p-3">Nama Bahan Baku</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Ideal POS</th>
                  <th className="p-3 text-right">Pemakaian Riil</th>
                  <th className="p-3 text-right">Selisih Fisik</th>
                  <th className="p-3 text-right">Nilai Selisih (Rp)</th>
                  <th className="p-3 text-right">Variance %</th>
                  <th className="p-3">Indikasi Penyebab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/70 text-gray-200">
                {data.topVarianceIngredients.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E2438]/60 transition-colors">
                    <td className="p-3 font-bold text-gray-100">{item.name}</td>
                    <td className="p-3 text-gray-400">{item.category}</td>
                    <td className="p-3 text-right font-mono text-gray-300">
                      {item.theoreticalQty} {item.unit}
                    </td>
                    <td className="p-3 text-right font-mono text-gray-100">
                      {item.actualQty} {item.unit}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      +{item.varianceQty} {item.unit}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400">{formatRp(item.varianceCostRp)}</td>
                    <td className="p-3 text-right font-bold text-rose-400">{(item.variancePct ?? 0).toFixed(1)}%</td>
                    <td className="p-3 text-gray-300 text-[11px] max-w-xs">{item.primaryReason}</td>
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
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Pencegahan Pemborosan HPP &amp; Tindakan PIC (Rule-Based)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.rootCause}
                category="FOOD_COST_CONTROL"
                description={`Terdeteksi kebocoran HPP sebesar ${formatRp(insight.impactRp)} pada periode ini.`}
                impactRp={-insight.impactRp}
                suggestedAction={insight.preventiveAction}
                responsiblePerson={insight.responsiblePerson}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
