/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PROCUREMENT KPI GRID
 */

import React from 'react';
import { ProcurementSummary } from '../../../types/procurement';
import {
  FileText,
  Clock,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface ProcurementKpiGridProps {
  summary?: ProcurementSummary | null;
  kpis?: ProcurementSummary | null;
  loading?: boolean;
}

export const ProcurementKpiGrid: React.FC<ProcurementKpiGridProps> = ({ summary, kpis, loading }) => {
  const data = kpis || summary;

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* 1. Total PR */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Total PR</span>
          <FileText className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">{data.totalRequests ?? 0}</p>
        <span className="text-[10px] text-slate-400">Permintaan Pembelian</span>
      </div>

      {/* 2. Pending Approvals */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Butuh Approval</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-xl font-bold text-amber-400 tracking-tight">{data.pendingRequestApprovals ?? 0}</p>
        <span className="text-[10px] text-amber-400/80">Antrean Review</span>
      </div>

      {/* 3. Active PO */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">PO Aktif</span>
          <ShoppingBag className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-xl font-bold text-blue-400 tracking-tight">{data.activePurchaseOrders ?? 0}</p>
        <span className="text-[10px] text-slate-400">Status Dalam Proses</span>
      </div>

      {/* 4. Outstanding PO */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Outstanding PO</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xl font-bold text-emerald-400 tracking-tight">{data.outstandingPoCount ?? 0}</p>
        <span className="text-[10px] text-slate-400">Belum Selesai Diterima</span>
      </div>

      {/* 5. Overdue PO */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">PO Terlambat</span>
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <p className="text-xl font-bold text-red-400 tracking-tight">{data.overduePoCount ?? 0}</p>
        <span className="text-[10px] text-red-400/80">Melewati Expected Date</span>
      </div>

      {/* 6. Total Spend Month */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Pengeluaran PO</span>
          <DollarSign className="w-4 h-4 text-pink-400" />
        </div>
        <p className="text-lg font-bold text-pink-400 tracking-tight">
          Rp {(data.totalPurchaseValueMonth ?? 0).toLocaleString('id-ID')}
        </p>
        <span className="text-[10px] text-slate-400">Bulan Ini</span>
      </div>

      {/* 7. Price Variance */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Rata2 Variasi Harga</span>
          <TrendingUp className="w-4 h-4 text-amber-300" />
        </div>
        <p className="text-xl font-bold text-amber-300 tracking-tight">
          {(data.averagePriceVariancePercentage ?? 0) > 0 ? `+${data.averagePriceVariancePercentage}%` : `${data.averagePriceVariancePercentage ?? 0}%`}
        </p>
        <span className="text-[10px] text-slate-400">vs Pembelian Lalu</span>
      </div>

      {/* 8. Rating Supplier */}
      <div className="bg-[#151B2B] p-3.5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Rating Supplier</span>
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
        <p className="text-xl font-bold text-yellow-400 tracking-tight">{(data.averageSupplierRating ?? 0).toFixed(1)} / 5</p>
        <span className="text-[10px] text-slate-400">Pemasok Aktif</span>
      </div>
    </div>
  );
};
