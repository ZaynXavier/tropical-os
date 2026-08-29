/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER FILTERS
 * Interactive filter bar for search, shifts, departments, status, and condition
 */

import React from 'react';
import {
  Search,
  Calendar,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Clock,
} from 'lucide-react';
import { HandoverFilterParams, HandoverStatus, OverallCondition } from '../../../types/handover';
import { OFFICIAL_SHIFTS } from '../../../data/mockShifts';

interface HandoverFiltersProps {
  filters: HandoverFilterParams;
  onChange: (filters: HandoverFilterParams) => void;
  onReset: () => void;
  showAdvanced?: boolean;
}

export const HandoverFilters: React.FC<HandoverFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const departments = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'Cashier', 'Management'];

  return (
    <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Handover, nama staf, area, atau isu..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0B0F19] rounded-xl border border-white/10 px-3 py-1.5">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
            <input
              type="date"
              value={filters.date === 'ALL' ? '' : filters.date || ''}
              onChange={(e) => onChange({ ...filters, date: e.target.value || 'ALL' })}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => onChange({ ...filters, date: 'ALL' })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.date === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#0B0F19] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Semua Hari
          </button>

          <button
            onClick={onReset}
            title="Reset Filter"
            className="p-2 rounded-xl bg-[#0B0F19] text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Filter Selectors & Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-white/5">
        {/* Shift Filter */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
            Shift
          </label>
          <select
            value={filters.fromShiftId || 'ALL'}
            onChange={(e) => onChange({ ...filters, fromShiftId: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Shift</option>
            {OFFICIAL_SHIFTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
            Departemen
          </label>
          <select
            value={filters.department || 'ALL'}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
            Kondisi Operasional
          </label>
          <select
            value={filters.overallCondition || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                overallCondition: e.target.value as OverallCondition | 'ALL',
              })
            }
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="NORMAL">NORMAL (Optimal)</option>
            <option value="ATTENTION">ATTENTION (Perlu Perhatian)</option>
            <option value="CRITICAL">CRITICAL (Tindakan Segera)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
            Status Handover
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as HandoverStatus | 'ALL',
              })
            }
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">SUBMITTED (Diserahkan)</option>
            <option value="PENDING_RECEIPT">PENDING RECEIPT (Menunggu Diterima)</option>
            <option value="RECEIVED">RECEIVED (Diterima)</option>
            <option value="VERIFIED">VERIFIED (Terverifikasi)</option>
            <option value="REVISION_REQUIRED">REVISION REQUIRED (Revisi Diminta)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
