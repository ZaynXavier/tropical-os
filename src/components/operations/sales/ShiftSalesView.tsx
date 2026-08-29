/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SHIFT SALES VIEW
 * Morning vs Evening shift comparison, revenue breakdown, items velocity,
 * HPP, and cashier duty performance.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sun,
  Moon,
  TrendingUp,
  Receipt,
  Users,
  DollarSign,
  Percent,
  Calendar,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { ShiftSalesPerformance, SalesPeriodFilter } from '../../../types/sales';

export const ShiftSalesView: React.FC = () => {
  const [period, setPeriod] = useState<SalesPeriodFilter>('this_month');
  const [shiftSummaries, setShiftSummaries] = useState<ShiftSalesPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShiftData = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getShiftSalesPerformance(period);
        setShiftSummaries(data);
      } catch (err) {
        console.error('Error loading shift sales:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadShiftData();
  }, [period]);

  const morningShift = shiftSummaries.find((s) => s.shiftId.includes('morning'));
  const eveningShift = shiftSummaries.find((s) => s.shiftId.includes('evening'));

  const totalRev = shiftSummaries.reduce((acc, s) => acc + s.netRevenue, 0) || 1;
  const morningPct = ((morningShift?.netRevenue ?? 0) / totalRev) * 100;
  const eveningPct = ((eveningShift?.netRevenue ?? 0) / totalRev) * 100;

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Analisis Penjualan Berdasarkan Shift Kerja</h3>
            <p className="text-xs text-slate-400">Komparasi produktivitas shift pagi vs shift siang/malam</p>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-[#151B2B] rounded-2xl border border-white/5" />
          <div className="h-64 bg-[#151B2B] rounded-2xl border border-white/5" />
        </div>
      ) : (
        <>
          {/* Shift Comparison Bar */}
          <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Kontribusi Pendapatan Antar Shift:</span>
              <span className="text-slate-400">
                Total Omzet: <strong className="text-white">Rp {(totalRev ?? 0).toLocaleString('id-ID')}</strong>
              </span>
            </div>

            <div className="w-full bg-[#111827] h-4 rounded-full overflow-hidden flex border border-white/5">
              <div
                style={{ width: `${morningPct}%` }}
                className="bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center text-[10px] font-bold text-slate-900"
                title={`Pagi: ${morningPct.toFixed(1)}%`}
              >
                {morningPct > 15 && `Pagi ${morningPct.toFixed(0)}%`}
              </div>
              <div
                style={{ width: `${eveningPct}%` }}
                className="bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                title={`Malam: ${eveningPct.toFixed(1)}%`}
              >
                {eveningPct > 15 && `Malam ${eveningPct.toFixed(0)}%`}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Shift Pagi: Rp {(morningShift?.netRevenue ?? 0).toLocaleString('id-ID')} ({morningPct.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                <span>Shift Malam: Rp {(eveningShift?.netRevenue ?? 0).toLocaleString('id-ID')} ({eveningPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Cards for Shift Morning vs Shift Evening */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Morning Shift Card */}
            <div className="bg-[#151B2B] rounded-2xl border border-amber-500/20 p-5 space-y-4 shadow-lg shadow-black/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Shift Pagi</h4>
                    <span className="text-[11px] text-amber-300 font-mono">08:00 - 16:00 (Lunch Rush)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {morningPct.toFixed(1)}% Omzet
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Net Revenue:</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    Rp {(morningShift?.netRevenue ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Total Transaksi:</span>
                  <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                    {morningShift?.transactionCount ?? 0} orders
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Avg Ticket:</span>
                  <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                    Rp {(morningShift?.averageTransactionValue ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Gross Margin:</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {(morningShift?.grossMarginPercentage ?? 0).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Kasir Bertugas:</span>
                <span className="text-slate-200 font-medium">{morningShift?.cashierNames.join(', ') || 'Rina Kusuma, Siti Rahayu'}</span>
              </div>
            </div>

            {/* Evening Shift Card */}
            <div className="bg-[#151B2B] rounded-2xl border border-indigo-500/20 p-5 space-y-4 shadow-lg shadow-black/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Shift Siang / Malam</h4>
                    <span className="text-[11px] text-indigo-300 font-mono">15:30 - 23:30 (Dinner Peak)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {eveningPct.toFixed(1)}% Omzet
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Net Revenue:</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    Rp {(eveningShift?.netRevenue ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Total Transaksi:</span>
                  <div className="text-lg font-bold text-indigo-300 font-mono mt-1">
                    {eveningShift?.transactionCount ?? 0} orders
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Avg Ticket:</span>
                  <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                    Rp {(eveningShift?.averageTransactionValue ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
                  <span className="text-slate-400">Gross Margin:</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {(eveningShift?.grossMarginPercentage ?? 0).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Kasir Bertugas:</span>
                <span className="text-slate-200 font-medium">{eveningShift?.cashierNames.join(', ') || 'Dedi Prasetyo, Maya Indah'}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
