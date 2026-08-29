/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — TEAM OPERATIONAL ISSUES VIEW
 * Supervisor Team Queue for Acknowledging, Assigning PIC, Escalating, and Verifying
 */

import React, { useState } from 'react';
import { ShieldCheck, UserCheck, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';
import { OperationalIssueCard } from './OperationalIssueCard';
import { OperationalIssueTable } from './OperationalIssueTable';

interface TeamOperationalIssuesViewProps {
  issues: OperationalIssue[];
  onSelectIssue: (issue: OperationalIssue) => void;
  getCategoryLabel: (cat: any) => string;
}

export const TeamOperationalIssuesView: React.FC<TeamOperationalIssuesViewProps> = ({
  issues,
  onSelectIssue,
  getCategoryLabel,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNASSIGNED' | 'RESOLVED' | 'ESCALATED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');

  const unassignedCount = issues.filter((i) => !i.assignedTo && i.status !== 'CLOSED' && i.status !== 'CANCELLED').length;
  const pendingVerificationCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const escalatedCount = issues.filter((i) => i.status === 'ESCALATED').length;

  let filtered = issues;
  if (filterMode === 'UNASSIGNED') {
    filtered = issues.filter((i) => !i.assignedTo && i.status !== 'CLOSED' && i.status !== 'CANCELLED');
  } else if (filterMode === 'RESOLVED') {
    filtered = issues.filter((i) => i.status === 'RESOLVED');
  } else if (filterMode === 'ESCALATED') {
    filtered = issues.filter((i) => i.status === 'ESCALATED');
  }

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Antrean Penanganan Supervisor (Team Queue)</h3>
            <p className="text-xs text-slate-400">
              Monitoring seluruh kendala tim, penugasan PIC, eskalasi, dan verifikasi hasil perbaikan
            </p>
          </div>
        </div>

        {/* Quick Filter Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              filterMode === 'ALL'
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 font-bold'
                : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] uppercase block text-slate-500">Semua Issue Tim</span>
            <span className="text-base font-bold text-white">{issues.length}</span>
          </button>

          <button
            onClick={() => setFilterMode('UNASSIGNED')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              filterMode === 'UNASSIGNED'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-bold'
                : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] uppercase block text-slate-500">Belum Ditugaskan</span>
            <span className="text-base font-bold text-blue-400">{unassignedCount}</span>
          </button>

          <button
            onClick={() => setFilterMode('RESOLVED')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              filterMode === 'RESOLVED'
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] uppercase block text-slate-500">Perlu Verifikasi</span>
            <span className="text-base font-bold text-amber-400">{pendingVerificationCount}</span>
          </button>

          <button
            onClick={() => setFilterMode('ESCALATED')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              filterMode === 'ESCALATED'
                ? 'bg-rose-600/20 border-rose-500/50 text-rose-300 font-bold'
                : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] uppercase block text-slate-500">Ter-eskalasi</span>
            <span className="text-base font-bold text-rose-400">{escalatedCount}</span>
          </button>
        </div>
      </div>

      {/* Render List */}
      {filtered.length === 0 ? (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs">
          Tidak ada issue tim dalam antrean ini.
        </div>
      ) : viewMode === 'CARD' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((issue) => (
            <OperationalIssueCard
              key={issue.id}
              issue={issue}
              onClick={onSelectIssue}
              getCategoryLabel={getCategoryLabel}
            />
          ))}
        </div>
      ) : (
        <OperationalIssueTable
          issues={filtered}
          onSelectIssue={onSelectIssue}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
};
