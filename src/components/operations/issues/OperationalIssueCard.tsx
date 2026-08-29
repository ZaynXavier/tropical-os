/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE CARD
 * Mobile-first card view for operational issues
 */

import React from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  AlertOctagon,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { OperationalIssue, OperationalIssueSeverity, OperationalIssueStatus } from '../../../types/operationalIssue';
import { IssueSlaBadge } from './IssueSlaBadge';

interface OperationalIssueCardProps {
  issue: OperationalIssue;
  onClick: (issue: OperationalIssue) => void;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueCard: React.FC<OperationalIssueCardProps> = ({
  issue,
  onClick,
  getCategoryLabel,
}) => {
  const getSeverityBadge = (severity: OperationalIssueSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wide animate-pulse">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-300 border border-slate-500/40 uppercase">LOW</span>;
    }
  };

  const getStatusBadge = (status: OperationalIssueStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">BARU</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">DITERIMA</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">PROSES</span>;
      case 'ESCALATED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/30 text-rose-200 border border-rose-400/50 flex items-center gap-1"><AlertOctagon className="w-3 h-3 text-rose-400" />ESKALASI</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SELESAI (PERLU VERIFIKASI)</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">TERVERIFIKASI</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">DITUTUP</span>;
      case 'REVISION_REQUIRED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/30 text-amber-200 border border-amber-400/40 flex items-center gap-1"><RotateCcw className="w-3 h-3 text-amber-300" />PERLU REVISI</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-600/20 text-slate-400 border border-slate-600/30">DIBATALKAN</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  return (
    <div
      onClick={() => onClick(issue)}
      className="bg-[#111827] border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            {issue.issueNumber}
          </span>
          {getSeverityBadge(issue.severity)}
          {getStatusBadge(issue.status)}
        </div>
        <IssueSlaBadge issue={issue} />
      </div>

      {/* Title & Desc */}
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {issue.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {issue.description}
        </p>
      </div>

      {/* Location & Tags */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0B0F19] p-2.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{issue.areaName} — {issue.stationName || 'Stasiun'}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end truncate">
          <span className="text-slate-400 text-[11px] truncate">{getCategoryLabel(issue.category)}</span>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300 font-medium">{issue.reportedByName}</span>
          </span>
          {issue.evidenceCount > 0 && (
            <span className="flex items-center gap-1 text-purple-300">
              <Paperclip className="w-3.5 h-3.5" />
              {issue.evidenceCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-purple-400 group-hover:translate-x-1 transition-transform font-medium">
          <span>Detail</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
