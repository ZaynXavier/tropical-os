import React, { useState } from 'react';
import { MenuPerformanceData, MenuItemPerformance, MenuEngineeringQuadrant } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  UtensilsCrossed,
  Star,
  Zap,
  HelpCircle,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface MenuPerformanceSectionProps {
  data: MenuPerformanceData;
}

export const MenuPerformanceSection: React.FC<MenuPerformanceSectionProps> = ({ data }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<MenuEngineeringQuadrant | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');

  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  const getQuadrantBadge = (quadrant: MenuEngineeringQuadrant) => {
    switch (quadrant) {
      case 'STAR':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Star</span>
          </span>
        );
      case 'PLOWHORSE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <span>🐎 Plowhorse</span>
          </span>
        );
      case 'PUZZLE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <span>🧩 Puzzle</span>
          </span>
        );
      case 'DOG':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            <span>Dog</span>
          </span>
        );
    }
  };

  const displayedList = viewMode === 'top' ? data.topSellers : data.bottomSellers;
  const filteredList =
    selectedQuadrant === 'ALL'
      ? displayedList
      : displayedList.filter((item) => item.quadrant === selectedQuadrant);

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Dimensi 2
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-pink-400" />
              <span>Menu Engineering &amp; Profitabilitas Produk</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Klasifikasi menu matriks (Star, Plowhorse, Puzzle, Dog), margin kotor tiap resep, dan laju attach rate.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#2D374E] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'top'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Top 10 Best Sellers
          </button>
          <button
            onClick={() => setViewMode('bottom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'bottom'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Bottom 5 Slow Moving
          </button>
        </div>
      </div>

      {/* 4 Quadrants Summary Cards & Attach Rates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Star */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'STAR' ? 'ALL' : 'STAR')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
            selectedQuadrant === 'STAR'
              ? 'bg-amber-500/15 border-amber-500 text-amber-200'
              : 'bg-[#111827]/70 border-[#2D374E] hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>STARS (Bintang)</span>
            </span>
            <span className="text-sm font-black text-amber-300">{data.menuMatrixCounts.stars} Menu</span>
          </div>
          <p className="text-[11px] text-gray-400">Popularitas Tinggi, Margin Tinggi (&gt;65%)</p>
        </div>

        {/* Plowhorse */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'PLOWHORSE' ? 'ALL' : 'PLOWHORSE')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
            selectedQuadrant === 'PLOWHORSE'
              ? 'bg-blue-500/15 border-blue-500 text-blue-200'
              : 'bg-[#111827]/70 border-[#2D374E] hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">PLOWHORSES</span>
            <span className="text-sm font-black text-blue-300">{data.menuMatrixCounts.plowhorses} Menu</span>
          </div>
          <p className="text-[11px] text-gray-400">Popularitas Tinggi, Margin Rendah (&lt;60%)</p>
        </div>

        {/* Puzzle */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'PUZZLE' ? 'ALL' : 'PUZZLE')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
            selectedQuadrant === 'PUZZLE'
              ? 'bg-purple-500/15 border-purple-500 text-purple-200'
              : 'bg-[#111827]/70 border-[#2D374E] hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">PUZZLES (Teka-Teki)</span>
            <span className="text-sm font-black text-purple-300">{data.menuMatrixCounts.puzzles} Menu</span>
          </div>
          <p className="text-[11px] text-gray-400">Popularitas Rendah, Margin Tinggi (&gt;65%)</p>
        </div>

        {/* Dog */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'DOG' ? 'ALL' : 'DOG')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
            selectedQuadrant === 'DOG'
              ? 'bg-rose-500/15 border-rose-500 text-rose-200'
              : 'bg-[#111827]/70 border-[#2D374E] hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">DOGS (Anjing Beban)</span>
            <span className="text-sm font-black text-rose-300">{data.menuMatrixCounts.dogs} Menu</span>
          </div>
          <p className="text-[11px] text-gray-400">Popularitas Rendah, Margin Rendah</p>
        </div>
      </div>

      {/* Attach Rate & Category Mix Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-[#111827]/60 border border-[#2D374E]">
        <div className="space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">Beverage Attach Rate</div>
          <div className="text-lg font-black text-emerald-400">{data.beverageAttachRatePct}%</div>
          <p className="text-[10px] text-gray-400">Dari total transaksi makanan dine-in</p>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">Dessert Attach Rate</div>
          <div className="text-lg font-black text-purple-300">{data.dessertAttachRatePct}%</div>
          <p className="text-[10px] text-gray-400">Peluang upselling dessert penutup</p>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">Add-on Attach Rate</div>
          <div className="text-lg font-black text-pink-300">{data.addOnAttachRatePct}%</div>
          <p className="text-[10px] text-gray-400">Sambal, ekstra nasi, kerupuk, dll</p>
        </div>
      </div>

      {/* Menu Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-gray-300">
            {viewMode === 'top' ? 'Daftar Menu Terlaris (Ranking 1 - 10)' : 'Daftar Menu Terbawah (Bottom Sellers)'}
          </span>
          {selectedQuadrant !== 'ALL' && (
            <button
              onClick={() => setSelectedQuadrant('ALL')}
              className="text-pink-400 hover:underline font-bold text-[11px]"
            >
              Reset Filter Kuadran (Tampilkan Semua)
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2D374E] bg-[#111827]/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E2438] text-gray-300 font-bold border-b border-[#2D374E]">
              <tr>
                <th className="p-3 text-center w-12">#</th>
                <th className="p-3">Nama Menu</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Kuadran</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-right">HPP Resep</th>
                <th className="p-3 text-right">Margin %</th>
                <th className="p-3 text-right">Qty Terjual</th>
                <th className="p-3 text-right">Total Omzet</th>
                <th className="p-3 text-right">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/70 text-gray-200">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-[#1E2438]/60 transition-colors">
                  <td className="p-3 text-center font-bold text-gray-400">{item.rank}</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-100">{item.name}</div>
                    <div className="text-[10px] text-gray-400 max-w-xs truncate">{item.recommendation}</div>
                  </td>
                  <td className="p-3 text-gray-300">{item.category}</td>
                  <td className="p-3">{getQuadrantBadge(item.quadrant)}</td>
                  <td className="p-3 text-right font-medium">{formatRp(item.portionPrice)}</td>
                  <td className="p-3 text-right text-gray-400 font-medium">{formatRp(item.portionCostHpp)}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{(item.grossMarginPct ?? 0).toFixed(1)}%</td>
                  <td className="p-3 text-right font-bold text-gray-100">{(item.qtySold ?? 0).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right font-bold text-purple-300">{formatRp(item.totalRevenue ?? 0)}</td>
                  <td className="p-3 text-right font-bold text-gray-300">{(item.salesContributionPct ?? 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu Diagnostic Box */}
      {data.diagnosticInsights && data.diagnosticInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Menu &amp; Tindakan Rekayasa Menu (Rule-Based)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.title}
                category="MENU_ENGINEERING"
                description={insight.description}
                suggestedAction={insight.actionPlan}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
