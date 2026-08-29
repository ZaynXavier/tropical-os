/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES FILTERS
 * Unified filter system for period presets, shifts, cashiers, order types,
 * payment methods, transaction status, and full-text search.
 */

import React from 'react';
import {
  Search,
  RotateCcw,
  Calendar,
  Filter,
  Download,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  SalesPeriodFilter,
  SalesFilterOptions,
  OrderType,
  PaymentMethodType,
  SalesTransactionStatus,
} from '../../../types/sales';

interface SalesFiltersProps {
  filters: SalesFilterOptions;
  onChange: (newFilters: SalesFilterOptions) => void;
  onReset: () => void;
  onExportCsv?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenClosingModal?: () => void;
  isExporting?: boolean;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onExportCsv,
  onOpenNewOrderModal,
  onOpenClosingModal,
  isExporting = false,
}) => {
  const periodPresets: { id: SalesPeriodFilter; label: string }[] = [
    { id: 'today', label: 'Hari Ini' },
    { id: 'yesterday', label: 'Kemarin' },
    { id: 'this_week', label: 'Minggu Ini' },
    { id: 'last_week', label: 'Minggu Lalu' },
    { id: 'this_month', label: 'Bulan Ini' },
    { id: 'last_month', label: 'Bulan Lalu' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-4 shadow-lg shadow-black/20">
      {/* Top Row: Period Presets & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          {periodPresets.map((p) => {
            const isActive = filters.period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...filters, period: p.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#1E2438]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenNewOrderModal && (
            <button
              type="button"
              onClick={onOpenNewOrderModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulasi Order</span>
            </button>
          )}

          {onOpenClosingModal && (
            <button
              type="button"
              onClick={onOpenClosingModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Closing Shift Kasir</span>
            </button>
          )}

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white hover:bg-[#28304a] border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            title="Reset Seluruh Filter"
            className="p-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#1E2438] hover:bg-[#28304a] border border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker (shown when period === 'custom') */}
      {filters.period === 'custom' && (
        <div className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl border border-purple-500/30 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Rentang Tanggal Khusus:</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Dari:</label>
            <input
              type="date"
              value={filters.startDate || '2026-08-01'}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="bg-[#1E2438] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Sampai:</label>
            <input
              type="date"
              value={filters.endDate || '2026-08-20'}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="bg-[#1E2438] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )}

      {/* Second Row: Multi-Criteria Filter Dropdowns & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Transaksi, Kasir, Menu, Meja..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Shift Filter */}
        <div>
          <select
            value={filters.shiftId || 'ALL'}
            onChange={(e) => onChange({ ...filters, shiftId: e.target.value })}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL" className="bg-[#151B2B] text-white">Semua Shift</option>
            <option value="shift-morning" className="bg-[#151B2B] text-white">Shift Pagi</option>
            <option value="shift-evening" className="bg-[#151B2B] text-white">Shift Siang/Malam</option>
          </select>
        </div>

        {/* Cashier Filter */}
        <div>
          <select
            value={filters.cashierId || 'ALL'}
            onChange={(e) => onChange({ ...filters, cashierId: e.target.value })}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL" className="bg-[#151B2B] text-white">Semua Kasir</option>
            <option value="emp-09" className="bg-[#151B2B] text-white">Rina Kusuma</option>
            <option value="emp-10" className="bg-[#151B2B] text-white">Dedi Prasetyo</option>
            <option value="emp-11" className="bg-[#151B2B] text-white">Siti Rahayu</option>
            <option value="emp-04" className="bg-[#151B2B] text-white">Maya Indah</option>
          </select>
        </div>

        {/* Order Type */}
        <div>
          <select
            value={filters.orderType || 'ALL'}
            onChange={(e) => onChange({ ...filters, orderType: e.target.value as OrderType | 'ALL' })}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL" className="bg-[#151B2B] text-white">Semua Tipe Order</option>
            <option value="DINE_IN" className="bg-[#151B2B] text-white">Dine In (Makan Ditempat)</option>
            <option value="TAKE_AWAY" className="bg-[#151B2B] text-white">Take Away (Bungkus)</option>
            <option value="DELIVERY" className="bg-[#151B2B] text-white">Delivery Online</option>
            <option value="EVENT" className="bg-[#151B2B] text-white">Event / Gathering</option>
            <option value="CATERING" className="bg-[#151B2B] text-white">Catering Service</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.transactionStatus || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                transactionStatus: e.target.value as SalesTransactionStatus | 'ALL',
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL" className="bg-[#151B2B] text-white">Semua Status</option>
            <option value="COMPLETED" className="bg-[#151B2B] text-emerald-400">Completed (Selesai)</option>
            <option value="VOID" className="bg-[#151B2B] text-rose-400">Void (Dibatalkan)</option>
            <option value="REFUNDED" className="bg-[#151B2B] text-amber-400">Refunded</option>
            <option value="PARTIAL_REFUND" className="bg-[#151B2B] text-amber-300">Partial Refund</option>
          </select>
        </div>
      </div>
    </div>
  );
};
