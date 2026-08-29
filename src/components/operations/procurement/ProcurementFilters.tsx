/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PROCUREMENT FILTERS
 */

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface ProcurementFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (priority: string) => void;
  startDate?: string;
  onStartDateChange?: (date: string) => void;
  endDate?: string;
  onEndDateChange?: (date: string) => void;
  statusOptions?: { value: string; label: string }[];
  onReset: () => void;
}

export const ProcurementFilters: React.FC<ProcurementFiltersProps> = ({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  priorityFilter = 'ALL',
  onPriorityChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  statusOptions,
  onReset,
}) => {
  return (
    <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor PR/PO, SKU, nama barang, atau supplier..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        {/* Action / Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
        {/* Department */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Departemen</label>
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full p-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
          >
            <option value="ALL">Semua Departemen</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bar">Bar</option>
            <option value="Service">Service</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Purchasing">Purchasing</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full p-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
          >
            {statusOptions ? (
              statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              <>
                <option value="ALL">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
        </div>

        {/* Priority (if enabled) */}
        {onPriorityChange && (
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Prioritas</label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="w-full p-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        )}

        {/* Start Date */}
        {onStartDateChange && (
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full p-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
        )}

        {/* End Date */}
        {onEndDateChange && (
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full p-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
