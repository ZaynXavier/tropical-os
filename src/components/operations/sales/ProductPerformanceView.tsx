/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — PRODUCT SALES PERFORMANCE VIEW
 * Product sales ranking, revenue share %, gross margin, HPP, and recipe linkage status.
 */

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  TrendingUp,
  Search,
  ArrowUpDown,
  Layers,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { ProductSalesPerformance, SalesPeriodFilter } from '../../../types/sales';

export const ProductPerformanceView: React.FC = () => {
  const [period, setPeriod] = useState<SalesPeriodFilter>('this_month');
  const [products, setProducts] = useState<ProductSalesPerformance[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'margin'>('revenue');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getProductPerformance(period);
        setProducts(data);
      } catch (err) {
        console.error('Error loading product performance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [period]);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.netRevenue - a.netRevenue;
      if (sortBy === 'quantity') return b.quantitySold - a.quantitySold;
      if (sortBy === 'margin') return b.grossMarginPercentage - a.grossMarginPercentage;
      return 0;
    });

  const totalRevenueAll = products.reduce((acc, p) => acc + p.netRevenue, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Analisis Performa Penjualan Menu</h3>
            <p className="text-xs text-slate-400">Ranking omzet, volume terjual, HPP resep, dan margin keuntungan</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(['today', 'this_week', 'this_month'] as SalesPeriodFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === p
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p === 'today' ? 'Hari Ini' : p === 'this_week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg shadow-black/20">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#151B2B]">
                {c === 'ALL' ? 'Semua Kategori Menu' : c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 font-semibold focus:outline-none focus:border-purple-500"
          >
            <option value="revenue" className="bg-[#151B2B]">Urutkan: Omzet Tertinggi (Revenue)</option>
            <option value="quantity" className="bg-[#151B2B]">Urutkan: Volume Terlaris (Qty)</option>
            <option value="margin" className="bg-[#151B2B]">Urutkan: Margin Laba Tertinggi (%)</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Memuat analisis performa menu...</p>
        </div>
      ) : (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111827] text-slate-400 border-b border-white/10 font-semibold">
                  <th className="py-3 px-4"># Rank</th>
                  <th className="py-3 px-4">Nama Menu</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-center">Porsi Terjual</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-right">Net Revenue</th>
                  <th className="py-3 px-3 text-right">Share %</th>
                  <th className="py-3 px-3 text-right">HPP / Unit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                  <th className="py-3 px-4 text-center">BOM Resep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredProducts.map((p, idx) => {
                  const sharePct = (p.netRevenue / totalRevenueAll) * 100;
                  const isHighMargin = p.grossMarginPercentage >= 65;

                  return (
                    <tr key={p.productId} className="hover:bg-[#1E2438]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">
                        #{idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{p.productName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#1E2438] text-[11px] text-slate-300 border border-white/5">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        {p.quantitySold}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        Rp {(p.unitPrice ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-200">
                        Rp {(p.netRevenue ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {sharePct.toFixed(1)}%
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-rose-300">
                        Rp {(p.hppPerUnit ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            isHighMargin ? 'text-emerald-400' : 'text-amber-400'
                          }
                        >
                          {p.grossMarginPercentage.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.recipeMappingStatus === 'MAPPED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>BOM Resep</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>Unmapped</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
