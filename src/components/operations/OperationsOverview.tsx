/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS OVERVIEW DASHBOARD
 * Executive & Managerial Command Center overview with operational timeline ticker,
 * department readiness cards, and real-time gap highlights.
 */

import React from 'react';
import {
  Activity,
  Layers,
  Users,
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Sparkles as SparklesIcon,
  CreditCard,
  Package,
} from 'lucide-react';
import {
  DailyOperationsContext,
  DepartmentCoverageSummary,
  OperationalIssue,
  OperationalStation,
} from '../../types/operations';
import { OperationsKpiGrid } from './OperationsKpiGrid';

interface OperationsOverviewProps {
  context: DailyOperationsContext | null;
  departmentSummaries: DepartmentCoverageSummary[];
  recentIssues: OperationalIssue[];
  onNavigateToTab: (tabKey: string) => void;
  onOpenReportIssue: () => void;
  onFilterUnderstaffed: () => void;
  canManage?: boolean;
}

export const OperationsOverview: React.FC<OperationsOverviewProps> = ({
  context,
  departmentSummaries,
  recentIssues,
  onNavigateToTab,
  onOpenReportIssue,
  onFilterUnderstaffed,
  canManage = true,
}) => {
  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'OPENING_PREP':
        return 'Persiapan Opening (09:00 - 10:00)';
      case 'SERVICE_PEAK_1':
        return 'Peak Hour Siang (12:00 - 14:00)';
      case 'AFTERNOON_PREP':
        return 'Persiapan Sore & Break (14:30 - 17:00)';
      case 'SERVICE_PEAK_2':
        return 'Peak Hour Malam (18:30 - 21:00)';
      case 'CLOSING_PREP':
        return 'Persiapan Closing (21:30 - 23:00)';
      case 'CLOSED':
        return 'Restoran Tutup';
      default:
        return 'Layanan Reguler (Running)';
    }
  };

  const getDeptIcon = (deptOrArea?: string) => {
    const d = (deptOrArea || '').toUpperCase();
    if (d.includes('KIT') || d.includes('DAPUR') || d.includes('KITCHEN')) {
      return <UtensilsCrossed className="w-4 h-4" />;
    }
    if (d.includes('BAR') || d.includes('BEV') || d.includes('MINUMAN')) {
      return <Coffee className="w-4 h-4" />;
    }
    if (d.includes('CSH') || d.includes('CASH') || d.includes('KASIR')) {
      return <CreditCard className="w-4 h-4" />;
    }
    if (d.includes('LOG') || d.includes('STR') || d.includes('GUDANG') || d.includes('STORAGE') || d.includes('PURCHASING')) {
      return <Package className="w-4 h-4" />;
    }
    return <SparklesIcon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Operational Phase Banner */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
              Live Operations Control
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {context ? getPhaseName(context.currentPhase) : 'Memuat Status Operasional...'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Tropical Garden Resto — Sistem Manajemen Stasiun, Checklist Shift, Kesiapan Personel & Kontrol Kualitas Harian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('checklists')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" /> Checklist Harian
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('board')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Layers className="w-4 h-4" /> Board Stasiun &rarr;
          </button>
          <button
            type="button"
            onClick={onOpenReportIssue}
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" /> Laporkan Kendala
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <OperationsKpiGrid
        context={context}
        onOpenIssuesModal={() => onNavigateToTab('issues')}
        onFilterUnderstaffed={onFilterUnderstaffed}
      />

      {/* Department Readiness Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Kesiapan per Area Operasional
          </h3>
          <button
            type="button"
            onClick={() => onNavigateToTab('coverage')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            Lihat Matriks Lengkap &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentSummaries.map((dept, idx) => {
            const hasGaps = dept.status === 'UNDERSTAFFED' || dept.currentAssigned < dept.totalRequiredMin;

            return (
              <div
                key={dept.areaId || dept.areaCode || `dept-area-${idx}`}
                className={`bg-[#151B2B] rounded-2xl border p-4.5 shadow-lg space-y-3 hover:border-purple-500/40 hover:bg-[#182033] transition ${
                  hasGaps ? 'border-amber-500/30' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1E2438] text-purple-300 border border-white/5 flex items-center justify-center font-bold">
                      {getDeptIcon(dept.areaCode || dept.areaName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{dept.areaName}</h4>
                      <p className="text-[11px] text-slate-400">{dept.totalStations} Stasiun Kerja</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold px-2 py-0.5 rounded-lg border ${
                      dept.coveragePercentage >= 80
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : dept.coveragePercentage >= 60
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {dept.coveragePercentage}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Staf Ditugaskan:</span>
                    <span className="font-semibold text-slate-200">
                      {dept.currentAssigned} / {dept.totalRequiredRec} Org
                    </span>
                  </div>
                  <div className="w-full bg-[#0B0F19] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.coveragePercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(dept.coveragePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      hasGaps ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {hasGaps
                      ? `Kurang Staf (Min: ${dept.totalRequiredMin} Org)`
                      : 'Kapasitas Terpenuhi'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('board')}
                    className="text-slate-400 hover:text-white font-semibold cursor-pointer"
                  >
                    Detail &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Issues Quick Highlights */}
      {recentIssues.length > 0 && (
        <div className="bg-[#151B2B] rounded-2xl border border-rose-500/30 shadow-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Kendala Operasional Menunggu Tindakan ({recentIssues.length})
            </h4>
            <button
              type="button"
              onClick={() => onNavigateToTab('issues')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Lihat Log Kendala &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentIssues.slice(0, 4).map((iss, idx) => (
              <div
                key={iss.id || `recent-iss-${iss.issueNumber || idx}`}
                className="p-3.5 bg-[#1A1429] rounded-xl border border-rose-500/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white line-clamp-1">
                    {iss.title || iss.description || `Kendala #${iss.issueNumber}`}
                  </span>
                  <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-bold text-[10px]">
                    {iss.severity}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-1">{iss.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
