/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — HPP & FOOD COST MANAGEMENT DASHBOARD
 * Menu Engineering BCG Matrix (Star, Plowhorse, Puzzle, Dog), Target vs Actual FC %, and Commodity Variance.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Zap,
  HelpCircle,
  AlertOctagon,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  BarChart3,
  Flame,
} from 'lucide-react';
import { MenuEngineeringItem, MenuEngineeringQuadrant, IngredientUsageVariance } from '../../types/hpp';
import { hppService } from '../../services/hppService';
import { recipeService } from '../../services/recipeService';

interface HppDashboardViewProps {
  currentUser?: { id: string; name: string; role?: string };
}

export const HppDashboardView: React.FC<HppDashboardViewProps> = () => {
  const [menuItems, setMenuItems] = useState<MenuEngineeringItem[]>([]);
  const [ingredientVariances, setIngredientVariances] = useState<IngredientUsageVariance[]>([]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<MenuEngineeringQuadrant | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      hppService.getMenuEngineeringAnalysis(),
      hppService.getIngredientUsageVariances(),
    ])
      .then(([menus, variances]) => {
        setMenuItems(menus || []);
        setIngredientVariances(variances || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalRev = 0;
    let totalCost = 0;
    let totalMargin = 0;
    let highRiskCount = 0;

    menuItems.forEach((item) => {
      totalRev += item.totalRevenue ?? 0;
      totalCost += (item.hppPerPortion ?? 0) * (item.monthlySalesVolume ?? 0);
      totalMargin += item.totalGrossProfit ?? 0;
      if ((item.foodCostPercentage ?? 0) > 33) {
        highRiskCount++;
      }
    });

    const blendedFoodCostPct =
      totalRev > 0 ? Number(((totalCost / totalRev) * 100).toFixed(1)) : 28.5;
    const blendedMarginPct =
      totalRev > 0 ? Number(((totalMargin / totalRev) * 100).toFixed(1)) : 71.5;

    const stars = menuItems.filter((m) => m.quadrant === 'STAR').length;
    const plowhorses = menuItems.filter((m) => m.quadrant === 'PLOWHORSE').length;
    const puzzles = menuItems.filter((m) => m.quadrant === 'PUZZLE').length;
    const dogs = menuItems.filter((m) => m.quadrant === 'DOG').length;

    return {
      totalRev,
      totalCost,
      totalMargin,
      blendedFoodCostPct,
      blendedMarginPct,
      highRiskCount,
      stars,
      plowhorses,
      puzzles,
      dogs,
    };
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedQuadrant === 'ALL') return menuItems;
    return menuItems.filter((m) => m.quadrant === selectedQuadrant);
  }, [menuItems, selectedQuadrant]);

  const getQuadrantBadge = (quadrant: MenuEngineeringQuadrant) => {
    switch (quadrant) {
      case 'STAR':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> STAR
          </span>
        );
      case 'PLOWHORSE':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-sky-400" /> PLOWHORSE
          </span>
        );
      case 'PUZZLE':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> PUZZLE
          </span>
        );
      case 'DOG':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> DOG
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Banner */}
      <div className="bg-gradient-to-br from-[#151B2B] to-[#1E2438] rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/30 text-purple-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  HPP & Food Cost Analytics
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Boston Consulting Group Menu Engineering Matrix, simulasi Food Cost %, dan analisa deviasi bahan baku.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#0f172a]/70 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Target Resto: <strong>30.0% FC</strong>
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Omzet Menu (MTD)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">
                Rp {(summary.totalRev ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
              Blended Food Cost %
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-black ${
                  summary.blendedFoodCostPct <= 30 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {summary.blendedFoodCostPct}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Target: 30%</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              Gross Margin %
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-sky-400">{summary.blendedMarginPct}%</span>
              <span className="text-xs text-slate-400 font-medium">
                (Rp {(summary.totalMargin ?? 0).toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
              Menu Risiko Tinggi (FC &gt; 33%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">{summary.highRiskCount}</span>
              <span className="text-xs text-rose-400/80 font-medium">Perlu Optimasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: BOSTON CONSULTING GROUP MENU ENGINEERING MATRIX */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Menu Engineering Matrix (BCG 4-Quadrant)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klasifikasi menu berdasarkan tingkat popularitas volume penjualan vs margin laba per porsi.
            </p>
          </div>

          {/* Quadrant Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedQuadrant('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuadrant === 'ALL'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1E2438] text-slate-400 hover:text-white'
              }`}
            >
              Semua Menu ({menuItems.length})
            </button>
            <button
              onClick={() => setSelectedQuadrant('STAR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuadrant === 'STAR'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-[#1E2438] text-emerald-400 hover:text-white'
              }`}
            >
              ⭐ Stars ({summary.stars})
            </button>
            <button
              onClick={() => setSelectedQuadrant('PLOWHORSE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuadrant === 'PLOWHORSE'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-[#1E2438] text-sky-400 hover:text-white'
              }`}
            >
              ⚡ Plowhorses ({summary.plowhorses})
            </button>
            <button
              onClick={() => setSelectedQuadrant('PUZZLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuadrant === 'PUZZLE'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1E2438] text-purple-400 hover:text-white'
              }`}
            >
              🧩 Puzzles ({summary.puzzles})
            </button>
            <button
              onClick={() => setSelectedQuadrant('DOG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuadrant === 'DOG'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-[#1E2438] text-rose-400 hover:text-white'
              }`}
            >
              ⚠️ Dogs ({summary.dogs})
            </button>
          </div>
        </div>

        {/* 4 Quadrants Explanatory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-emerald-400" /> Stars (Bintang)
              </span>
              <span className="text-xs font-bold text-emerald-300">{summary.stars} Menu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Margin Tinggi & Penjualan Tinggi. Pertahankan kualitas rasa dan konsistensi plating.
            </p>
          </div>

          <div className="p-3.5 bg-sky-950/20 border border-sky-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Plowhorses (Pekerja Keras)
              </span>
              <span className="text-xs font-bold text-sky-300">{summary.plowhorses} Menu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Margin Rendah tapi Sangat Laris. Evaluasi porsi bahan baku, renegosiasi supplier, atau naikkan harga bertahap.
            </p>
          </div>

          <div className="p-3.5 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Puzzles (Teka-Teki)
              </span>
              <span className="text-xs font-bold text-purple-300">{summary.puzzles} Menu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Margin Sangat Tinggi tapi Kurang Laris. Lakukan promosi table-side, pairing bundle, atau perbarui nama menu.
            </p>
          </div>

          <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> Dogs (Beban)
              </span>
              <span className="text-xs font-bold text-rose-300">{summary.dogs} Menu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Margin Rendah & Jarang Laku. Pertimbangkan perombakan resep secara menyeluruh atau hilangkan dari menu.
            </p>
          </div>
        </div>

        {/* Menu Engineering Analysis Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111827]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1E2438]/60">
                <th className="py-3 px-4">Menu & Kategori</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-right">HPP Porsi</th>
                <th className="py-3 px-3 text-center">Food Cost %</th>
                <th className="py-3 px-3 text-right">Margin / Porsi</th>
                <th className="py-3 px-3 text-center">Volume (Bln)</th>
                <th className="py-3 px-3 text-right">Total Profit</th>
                <th className="py-3 px-3 text-center">Kuadran BCG</th>
                <th className="py-3 px-4">Rekomendasi Chef & Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMenuItems.map((item) => (
                <tr key={item.recipeId} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">
                    {item.recipeName}
                    <span className="block text-[10px] text-slate-400 font-normal">{item.menuCategory}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    Rp {(item.sellingPrice ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-purple-400">
                    Rp {(item.hppPerPortion ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        item.foodCostPercentage <= 30
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {item.foodCostPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sky-400">
                    Rp {(item.grossProfitPerPortion ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-white">
                    {item.monthlySalesVolume} porsi
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                    Rp {(item.totalGrossProfit ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center">{getQuadrantBadge(item.quadrant)}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs leading-tight">
                    {item.actionRecommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: INGREDIENT USAGE & VARIANCE ANALYSIS */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Deviasi Bahan Baku Komoditas (Theoretical vs Actual Usage)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring selisih pemakaian bahan baku utama terhadap BOM standar untuk mendeteksi pemborosan, porsi berlebih, atau pencurian.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111827]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1E2438]/60">
                <th className="py-3 px-4">Bahan Baku Komoditas</th>
                <th className="py-3 px-3 text-right">Target Teoritis</th>
                <th className="py-3 px-3 text-right">Pemakaian Riil</th>
                <th className="py-3 px-3 text-center">Selisih (Variance)</th>
                <th className="py-3 px-3 text-right">Nilai Kerugian / Biaya</th>
                <th className="py-3 px-4">Analisa Akar Masalah & Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ingredientVariances.map((v) => (
                <tr key={v.inventoryItemId} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">
                    {v.inventoryItemName}
                    <span className="block text-[10px] text-slate-400 font-normal">SKU: {v.inventoryItemSku}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {v.theoreticalUsage} {v.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {v.actualUsage} {v.unit}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        Math.abs(v.variancePercentage) <= 3
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {v.varianceQuantity > 0 ? '+' : ''}
                      {v.varianceQuantity} {v.unit} ({v.variancePercentage}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                    Rp {(v.varianceCost ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] leading-tight max-w-sm">
                    {v.rootCause}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
