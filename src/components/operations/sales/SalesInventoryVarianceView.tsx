/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — THEORETICAL SALES INVENTORY VARIANCE VIEW
 * Compares theoretical ingredient usage (BOM x Product Sales) against actual inventory usage
 * to detect kitchen waste, over-portioning, theft, and shrinkage.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  Scale,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { TheoreticalIngredientUsage, SalesPeriodFilter } from '../../../types/sales';

export const SalesInventoryVarianceView: React.FC = () => {
  const [period, setPeriod] = useState<SalesPeriodFilter>('this_month');
  const [variances, setVariances] = useState<TheoreticalIngredientUsage[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVarianceData = async () => {
      try {
        setIsLoading(true);
        const { startDate, endDate } = salesService.resolvePeriodDates(period);
        const data = await salesService.getSalesInventoryVariance(startDate, endDate);
        setVariances(data);
      } catch (err) {
        console.error('Error loading inventory variance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVarianceData();
  }, [period]);

  const filteredVariances = variances.filter((v) => {
    const matchSearch =
      v.ingredientName.toLowerCase().includes(search.toLowerCase()) ||
      v.ingredientSku.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'ALL' || v.varianceSeverity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const totalCostImpact = variances.reduce((acc, v) => acc + (v.varianceCost ?? 0), 0);
  const criticalCount = variances.filter((v) => v.varianceSeverity === 'CRITICAL').length;
  const warningCount = variances.filter((v) => v.varianceSeverity === 'WARNING').length;
  const normalCount = variances.filter((v) => v.varianceSeverity === 'NORMAL').length;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Normal (&lt;5%)</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Waspada (5-15%)</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Kritis (&gt;15%)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Audit Selisih Bahan Baku (Teoritis vs Aktual)</h3>
            <p className="text-xs text-slate-400">
              Validasi pemakaian bahan baku resep BOM vs stok fisik & potensi waste kitchen
            </p>
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

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Total Kerugian Selisih</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            Rp {(totalCostImpact ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400">Biaya pemborosan/waste</span>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Bahan Status Kritis</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {criticalCount} <span className="text-xs font-normal text-slate-400">item</span>
          </div>
          <span className="text-[11px] text-rose-400/80">Selisih &gt;15% dari resep</span>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Bahan Status Waspada</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {warningCount} <span className="text-xs font-normal text-slate-400">item</span>
          </div>
          <span className="text-[11px] text-amber-400/80">Selisih 5% - 15%</span>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Bahan Sesuai Resep</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {normalCount} <span className="text-xs font-normal text-slate-400">item</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">Toleransi aman (&lt;5%)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama bahan baku atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'CRITICAL', 'WARNING', 'NORMAL'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {sev === 'ALL'
                ? 'Semua'
                : sev === 'CRITICAL'
                ? 'Kritis'
                : sev === 'WARNING'
                ? 'Waspada'
                : 'Normal'}
            </button>
          ))}
        </div>
      </div>

      {/* Variances Table */}
      {isLoading ? (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Menghitung varian teoritis vs aktual...</p>
        </div>
      ) : (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111827] text-slate-400 border-b border-white/10 font-semibold">
                  <th className="py-3 px-4">Bahan Baku</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-right">Pemakaian Teoritis (BOM)</th>
                  <th className="py-3 px-3 text-right">Pemakaian Aktual (Fisik)</th>
                  <th className="py-3 px-3 text-right">Selisih Fisik</th>
                  <th className="py-3 px-3 text-right">Selisih (%)</th>
                  <th className="py-3 px-3 text-right">Dampak Biaya (Rp)</th>
                  <th className="py-3 px-4 text-center">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredVariances.map((v) => (
                  <tr key={v.ingredientId} className="hover:bg-[#1E2438]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {v.ingredientName}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {v.ingredientSku}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-purple-300">
                      {(v.theoreticalUsageQuantity ?? 0).toLocaleString('id-ID')} {v.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {(v.actualUsageQuantity ?? v.theoreticalUsageQuantity).toLocaleString('id-ID')} {v.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-300">
                      +{(v.varianceQuantity ?? 0).toLocaleString('id-ID')} {v.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          v.varianceSeverity === 'CRITICAL'
                            ? 'text-rose-400'
                            : v.varianceSeverity === 'WARNING'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        +{((v.variancePercentage ?? 0)).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                      Rp {(v.varianceCost ?? 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getSeverityBadge(v.varianceSeverity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
