/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES KPI GRID
 * Executive KPI cards displaying Gross & Net Revenue, Transactions,
 * Average Ticket, Food Cost %, Labor Cost % correlation, and Refunds.
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Percent,
  RotateCcw,
  Users,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { DailySalesSummary, SalesLaborAnalytics } from '../../../types/sales';

interface SalesKpiGridProps {
  summary: DailySalesSummary | null;
  laborAnalytics?: SalesLaborAnalytics | null;
  revenueTarget?: number; // e.g. Rp 120.000.000
  isLoading?: boolean;
}

export const SalesKpiGrid: React.FC<SalesKpiGridProps> = ({
  summary,
  laborAnalytics,
  revenueTarget = 120000000,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-[#151B2B] rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  const netRevenue = summary?.netRevenue ?? 0;
  const grossRevenue = summary?.grossRevenue ?? 0;
  const grossProfit = summary?.grossProfit ?? 0;
  const grossMargin = summary?.grossMarginPercentage ?? 0;
  const foodCostPct = summary?.blendedFoodCostPercentage ?? 0;
  const txCount = summary?.transactionCount ?? 0;
  const avgTicket = summary?.averageTransactionValue ?? 0;
  const totalItems = summary?.totalItemsSold ?? 0;
  const refundAmount = summary?.refundAmount ?? 0;
  const discountAmount = summary?.discountAmount ?? 0;

  const targetAchievement = revenueTarget > 0 ? Math.min(150, (netRevenue / revenueTarget) * 100) : 0;
  const laborCostPct = laborAnalytics?.laborCostPercentage ?? 29.5;

  return (
    <div className="space-y-4">
      {/* 4 Primary Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Revenue */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Revenue (Penjualan Bersih)</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              Rp {(netRevenue ?? 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Gross: Rp {(grossRevenue ?? 0).toLocaleString('id-ID')}</span>
              {(discountAmount > 0 || refundAmount > 0) && (
                <span className="text-amber-400/90 font-medium">
                  (-Rp {(discountAmount + refundAmount).toLocaleString('id-ID')})
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Achievement:</span>
            <span className={`font-semibold ${targetAchievement >= 100 ? 'text-emerald-400' : 'text-purple-300'}`}>
              {targetAchievement.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 2: Gross Profit & Margin */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gross Profit (Laba Kotor)</span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-200 tracking-tight">
              Rp {(grossProfit ?? 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-slate-400">Gross Margin:</span>
              <span className="text-purple-400 font-semibold">{grossMargin.toFixed(1)}%</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Food Cost:</span>
              <span className={`font-semibold ${foodCostPct > 33 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {foodCostPct.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">HPP Terpakai:</span>
            <span className="text-slate-300 font-mono">
              Rp {(summary?.estimatedHpp ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Card 3: Transaction Count & Avg Ticket */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Transaksi & Average Ticket</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span>{txCount}</span>
              <span className="text-xs font-normal text-slate-400">orders</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Avg Ticket:</span>
              <span className="text-blue-300 font-semibold">Rp {(avgTicket ?? 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Item Terjual:</span>
            <span className="text-slate-200 font-semibold">{totalItems} porsi</span>
          </div>
        </div>

        {/* Card 4: Labor Cost % & Health Correlation */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Labor Cost % (SDM vs Sales)</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-indigo-200 tracking-tight flex items-baseline gap-1">
              <span>{laborCostPct.toFixed(1)}%</span>
              <span className="text-xs font-normal text-slate-400">(Beban Gaji)</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Overtime OT:</span>
              <span className="text-slate-300 font-medium">
                {laborAnalytics?.overtimePercentage ? `${laborAnalytics.overtimePercentage}%` : '8.2%'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Target: &lt;30%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Rev / Labor Hour:</span>
            <span className="text-emerald-400 font-semibold">
              Rp {(laborAnalytics?.revenuePerLaborHour ?? 85000).toLocaleString('id-ID')}/jam
            </span>
          </div>
        </div>
      </div>

      {/* Target Revenue Progress Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Progress Target Pendapatan:</span>
            <span className="text-purple-300 font-bold">
              Rp {(netRevenue ?? 0).toLocaleString('id-ID')} / Rp {(revenueTarget ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Sisa Target: Rp {Math.max(0, revenueTarget - netRevenue).toLocaleString('id-ID')}</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {targetAchievement.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-[#111827] rounded-full h-2.5 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              targetAchievement >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, targetAchievement)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
