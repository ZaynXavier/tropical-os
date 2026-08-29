/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS KPI GRID
 * Executive & Operational Key Performance Indicator Metric Cards
 */

import React from 'react';
import {
  Activity,
  Layers,
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { DailyOperationsContext } from '../../types/operations';

interface OperationsKpiGridProps {
  context: DailyOperationsContext | null;
  onOpenIssuesModal?: () => void;
  onFilterUnderstaffed?: () => void;
}

export const OperationsKpiGrid: React.FC<OperationsKpiGridProps> = ({
  context,
  onOpenIssuesModal,
  onFilterUnderstaffed,
}) => {
  if (!context) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-[#151B2B] rounded-2xl border border-white/10" />
        ))}
      </div>
    );
  }

  const staffAssignmentRate =
    context.totalEmployeesCount > 0
      ? Math.round((context.assignedEmployeesCount / context.totalEmployeesCount) * 100)
      : 0;

  const stationReadinessRate =
    context.activeStationsCount > 0
      ? Math.round(
          ((context.activeStationsCount - context.understaffedStationsCount) /
            context.activeStationsCount) *
            100
        )
      : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Readiness Score */}
      <div
        id="kpi-card-readiness"
        className="p-4 bg-[#151B2B] rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Operational Readiness
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              context.overallReadinessScore >= 80
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : context.overallReadinessScore >= 60
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {context.overallReadinessScore}%
          </span>
          <span
            className={`text-[11px] font-semibold ${
              context.overallReadinessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {context.overallReadinessScore >= 80 ? 'Optimal' : 'Needs Review'}
          </span>
        </div>
        <div className="mt-2 w-full bg-[#0B0F19] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              context.overallReadinessScore >= 80
                ? 'bg-emerald-500'
                : context.overallReadinessScore >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${context.overallReadinessScore}%` }}
          />
        </div>
      </div>

      {/* 2. Station Coverage */}
      <div
        id="kpi-card-stations"
        onClick={onFilterUnderstaffed}
        className="p-4 bg-[#151B2B] rounded-2xl border border-white/10 shadow-lg hover:border-blue-500/40 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Station Coverage
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {stationReadinessRate}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {context.optimalStationsCount} / {context.activeStationsCount} Stasiun
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Understaffed:</span>
          <span
            className={`font-semibold ${
              context.understaffedStationsCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'
            }`}
          >
            {context.understaffedStationsCount} Station
          </span>
        </div>
      </div>

      {/* 3. Staff Assignment */}
      <div
        id="kpi-card-staff"
        className="p-4 bg-[#151B2B] rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/40 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Staff Assignment
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {context.assignedEmployeesCount}
            <span className="text-sm font-normal text-slate-400">/{context.totalEmployeesCount}</span>
          </span>
          <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
            {staffAssignmentRate}%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Belum Ditugaskan:</span>
          <span className="font-semibold text-slate-200">{context.unassignedEmployeesCount} Org</span>
        </div>
      </div>

      {/* 4. Checklist Readiness */}
      <div
        id="kpi-card-checklists"
        className="p-4 bg-[#151B2B] rounded-2xl border border-white/10 shadow-lg hover:border-teal-500/40 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Checklist Status
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {context.completedChecklistsCount}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            {context.verifiedChecklistsCount} Diverifikasi
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Pending:</span>
          <span className="font-semibold text-amber-400">{context.pendingChecklistsCount} Form</span>
        </div>
      </div>

      {/* 5. Open Issues */}
      <div
        id="kpi-card-issues"
        onClick={onOpenIssuesModal}
        className="p-4 bg-[#151B2B] rounded-2xl border border-white/10 shadow-lg hover:border-rose-500/40 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Operational Issues
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border group-hover:scale-105 transition ${
              context.openIssuesCount > 0
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-2xl font-black tracking-tight ${
              context.openIssuesCount > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {context.openIssuesCount}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Issue Aktif</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Status Operasi:</span>
          <span
            className={`font-semibold px-1.5 py-0.2 rounded-md border ${
              context.operationalStatus === 'RUNNING' || context.operationalStatus === 'READY'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : context.operationalStatus === 'ISSUE'
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-[#1E2438] text-slate-300 border-white/10'
            }`}
          >
            {context.operationalStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
