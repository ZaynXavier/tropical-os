/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE FILTERS
 * Filter bar component for searching and categorizing operational issues
 */

import React from 'react';
import { Search, Filter, RefreshCw, Download, Layers } from 'lucide-react';
import { IssueFilterParams, OperationalIssueCategory, OperationalIssueSeverity, OperationalIssueStatus } from '../../../types/operationalIssue';
import { INITIAL_OPERATIONAL_AREAS } from '../../../data/mockOperationalAreas';

interface OperationalIssueFiltersProps {
  filters: IssueFilterParams;
  onFilterChange: (newFilters: IssueFilterParams) => void;
  onResetFilters: () => void;
  onExportCsv?: () => void;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueFilters: React.FC<OperationalIssueFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCsv,
  getCategoryLabel,
}) => {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan No Issue, judul, pelapor, stasiun..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Select Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
        {/* Department / Area */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Departemen</label>
          <select
            value={filters.department || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua Departemen</option>
            {INITIAL_OPERATIONAL_AREAS.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Kategori</label>
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="EQUIPMENT">Peralatan</option>
            <option value="INVENTORY">Persediaan</option>
            <option value="FOOD_SAFETY">Keamanan Pangan</option>
            <option value="HYGIENE">Kebersihan</option>
            <option value="GUEST_COMPLAINT">Keluhan Tamu</option>
            <option value="STAFF">Karyawan</option>
            <option value="FACILITY">Fasilitas</option>
            <option value="CASHIER_POS">Kasir / POS</option>
            <option value="SAFETY_K3">Keselamatan K3</option>
            <option value="OPERATIONAL">Operasional</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Severity</label>
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua Severity</option>
            <option value="CRITICAL">CRITICAL (15m)</option>
            <option value="HIGH">HIGH (30m)</option>
            <option value="MEDIUM">MEDIUM (2h)</option>
            <option value="LOW">LOW (24h)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Status</label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">BARU (OPEN)</option>
            <option value="ACKNOWLEDGED">DITERIMA (ACK)</option>
            <option value="IN_PROGRESS">PROSES PENANGANAN</option>
            <option value="ESCALATED">ESKALASI</option>
            <option value="RESOLVED">SELESAI (PERLU VERIFIKASI)</option>
            <option value="VERIFIED">TERVERIFIKASI</option>
            <option value="CLOSED">DITUTUP (CLOSED)</option>
            <option value="REVISION_REQUIRED">PERLU REVISI</option>
            <option value="CANCELLED">DIBATALKAN</option>
          </select>
        </div>

        {/* SLA Status Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">SLA Compliance</label>
          <select
            value={filters.isSlaBreached === undefined ? 'ALL' : filters.isSlaBreached ? 'TRUE' : 'FALSE'}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                ...filters,
                isSlaBreached: val === 'ALL' ? ('ALL' as any) : val === 'TRUE',
              });
            }}
            className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua SLA</option>
            <option value="FALSE">Dalam SLA Target</option>
            <option value="TRUE">SLA Terlewati (Breached)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
