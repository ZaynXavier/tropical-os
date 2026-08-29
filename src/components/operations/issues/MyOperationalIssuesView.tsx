/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — MY OPERATIONAL ISSUES VIEW
 * Personal Queue for Staff (Issues reported by me, assigned to me, or at my station)
 */

import React, { useState } from 'react';
import { User, Plus, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';
import { OperationalIssueCard } from './OperationalIssueCard';
import { OperationalIssueTable } from './OperationalIssueTable';

interface MyOperationalIssuesViewProps {
  issues: OperationalIssue[];
  currentUserEmployeeId: string;
  onSelectIssue: (issue: OperationalIssue) => void;
  onOpenCreateModal: () => void;
  getCategoryLabel: (cat: any) => string;
}

export const MyOperationalIssuesView: React.FC<MyOperationalIssuesViewProps> = ({
  issues,
  currentUserEmployeeId,
  onSelectIssue,
  onOpenCreateModal,
  getCategoryLabel,
}) => {
  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'REPORTED' | 'ALL'>('ASSIGNED');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');

  const myAssigned = issues.filter((i) => i.assignedTo === currentUserEmployeeId);
  const myReported = issues.filter((i) => i.reportedBy === currentUserEmployeeId);

  let displayed = issues;
  if (activeTab === 'ASSIGNED') displayed = myAssigned;
  else if (activeTab === 'REPORTED') displayed = myReported;

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Antrean Kendala Saya (My Issues)</h3>
            <p className="text-xs text-slate-400">
              Daftar kendala yang ditugaskan kepada Anda atau dilaporkan dari stasiun Anda
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Laporkan Kendala
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ASSIGNED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'ASSIGNED'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ditugaskan Kepada Saya ({myAssigned.length})
          </button>
          <button
            onClick={() => setActiveTab('REPORTED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'REPORTED'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dilaporkan Oleh Saya ({myReported.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'ALL'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Issue Stasiun ({issues.length})
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('CARD')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'CARD' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kartu
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'TABLE' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tabel
          </button>
        </div>
      </div>

      {/* Render List */}
      {displayed.length === 0 ? (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs">
          Tidak ada kendala operasional dalam kategori ini.
        </div>
      ) : viewMode === 'CARD' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayed.map((issue) => (
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
          issues={displayed}
          onSelectIssue={onSelectIssue}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
};
