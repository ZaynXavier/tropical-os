/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER MANAGEMENT CONSOLE
 * Comprehensive management console for General Manager & Operational Managers
 * with CSV export, advanced search, cancellation, and master audit trail.
 */

import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { HandoverRecord, HandoverFilterParams } from '../../../types/handover';
import { HandoverFilters } from './HandoverFilters';
import { HandoverTable } from './HandoverTable';
import { handoverService } from '../../../services/handoverService';

interface HandoverManagementViewProps {
  handovers: HandoverRecord[];
  filters: HandoverFilterParams;
  onFilterChange: (filters: HandoverFilterParams) => void;
  onResetFilters: () => void;
  onInspect: (handover: HandoverRecord) => void;
  onVerify: (handover: HandoverRecord) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const HandoverManagementView: React.FC<HandoverManagementViewProps> = ({
  handovers,
  filters,
  onFilterChange,
  onResetFilters,
  onInspect,
  onVerify,
  onCreateNew,
  onRefresh,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const csvData = handoverService.exportHandoversToCsv(handovers);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TropicalOS_ShiftHandovers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export CSV:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan data serah terima ke mock awal TropicalOS?')) {
      await handoverService.resetToDefaults();
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Console Top Actions */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Konsol Manajemen Handover Operasional
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pusat kontrol histori serah terima, audit kepatuhan, ekspor laporan CSV, dan verifikasi manajerial
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 bg-[#0B0F19] hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Ekspor CSV
          </button>

          <button
            onClick={handleResetToDefaults}
            title="Reset ke Mock Default"
            className="p-2 bg-[#0B0F19] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            + Buat Handover
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <HandoverFilters
        filters={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
      />

      {/* Main Table */}
      <HandoverTable
        handovers={handovers}
        onInspect={onInspect}
        onVerify={onVerify}
        canVerify={true}
      />
    </div>
  );
};
