/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE MANAGEMENT VIEW (MANAGER CONSOLE)
 * Central Manager Console for full operational issue lifecycle management, filters,
 * CSV export, SLA monitoring, and data resetting.
 */

import React, { useState } from 'react';
import { Layers, Download, RefreshCw, Plus, ShieldCheck } from 'lucide-react';
import { OperationalIssue, IssueFilterParams } from '../../../types/operationalIssue';
import { OperationalIssueFilters } from './OperationalIssueFilters';
import { OperationalIssueCard } from './OperationalIssueCard';
import { OperationalIssueTable } from './OperationalIssueTable';

interface OperationalIssueManagementViewProps {
  issues: OperationalIssue[];
  filters: IssueFilterParams;
  onFilterChange: (filters: IssueFilterParams) => void;
  onResetFilters: () => void;
  onSelectIssue: (issue: OperationalIssue) => void;
  onOpenCreateModal: () => void;
  onExportCsv: () => void;
  onResetToDefaults: () => void;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueManagementView: React.FC<OperationalIssueManagementViewProps> = ({
  issues,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectIssue,
  onOpenCreateModal,
  onExportCsv,
  onResetToDefaults,
  getCategoryLabel,
}) => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARD'>('TABLE');

  return (
    <div className="space-y-4">
      {/* Top Banner & Primary Actions */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Konsol Manajemen Kendala Operasional (Manager Console)</h3>
            <p className="text-xs text-slate-400">
              Pusat kendali laporan kendala, penugasan PIC, SLA compliance, dan histori audit trail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={onResetToDefaults}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10 transition-all"
            title="Reset Data ke Default Initial"
          >
            Reset Master
          </button>
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" />
            Buat Issue
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <OperationalIssueFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        onExportCsv={onExportCsv}
        getCategoryLabel={getCategoryLabel}
      />

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 font-semibold">
          Menampilkan <span className="text-white font-bold">{issues.length}</span> kendala operasional
        </span>

        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'TABLE' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tabel
          </button>
          <button
            onClick={() => setViewMode('CARD')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'CARD' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kartu
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'TABLE' ? (
        <OperationalIssueTable
          issues={issues}
          onSelectIssue={onSelectIssue}
          getCategoryLabel={getCategoryLabel}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {issues.map((issue) => (
            <OperationalIssueCard
              key={issue.id}
              issue={issue}
              onClick={onSelectIssue}
              getCategoryLabel={getCategoryLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
