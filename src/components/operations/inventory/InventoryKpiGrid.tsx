/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY KPI GRID
 * High-density KPI cards for Inventory Control Center.
 */

import React from 'react';
import { InventorySummary } from '../../../types/inventory';
import { Package, DollarSign, AlertTriangle, ShieldAlert, Clock, Trash2, CheckCircle2 } from 'lucide-react';

interface InventoryKpiGridProps {
  summary: InventorySummary;
}

export const InventoryKpiGrid: React.FC<InventoryKpiGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* 1. Total SKU */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Total SKU</span>
          <Package className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">{summary.totalSkus}</p>
        <span className="text-[10px] text-slate-400">Master Item Aktif</span>
      </div>

      {/* 2. Total Valuation */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Nilai Persediaan</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xl font-bold text-emerald-400 tracking-tight">
          Rp {(summary.totalValue ?? 0).toLocaleString('id-ID')}
        </p>
        <span className="text-[10px] text-slate-400">Estimasi Cost Average</span>
      </div>

      {/* 3. Low Stock */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Low Stock</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-xl font-bold text-amber-400 tracking-tight">{summary.lowStockCount}</p>
        <span className="text-[10px] text-amber-400/80">≤ Reorder Point</span>
      </div>

      {/* 4. Critical Stock */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-red-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Stok Kritis</span>
          <ShieldAlert className="w-4 h-4 text-red-400" />
        </div>
        <p className="text-xl font-bold text-red-400 tracking-tight">{summary.criticalStockCount + summary.outOfStockCount}</p>
        <span className="text-[10px] text-red-400/80">≤ Minimum / Habis</span>
      </div>

      {/* 5. Expiring Soon */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Risiko Expiry</span>
          <Clock className="w-4 h-4 text-orange-400" />
        </div>
        <p className="text-xl font-bold text-orange-400 tracking-tight">{summary.expiringCount + summary.expiredCount}</p>
        <span className="text-[10px] text-orange-400/80">FEFO Warning &lt; 30hr</span>
      </div>

      {/* 6. Waste Value Month */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Wasting Bln Ini</span>
          <Trash2 className="w-4 h-4 text-pink-400" />
        </div>
        <p className="text-xl font-bold text-pink-400 tracking-tight">
          Rp {(summary.totalWasteValueMonth ?? 0).toLocaleString('id-ID')}
        </p>
        <span className="text-[10px] text-slate-400">Total Food Loss</span>
      </div>

      {/* 7. Stock Accuracy */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Akurasi Stok</span>
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-xl font-bold text-blue-400 tracking-tight">{summary.stockAccuracyPercentage}%</p>
        <span className="text-[10px] text-slate-400">Target OPNAME ≥ 95%</span>
      </div>
    </div>
  );
};
