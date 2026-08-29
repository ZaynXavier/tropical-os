/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE TABLE
 * High-density desktop table view for operational issues
 */

import React from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  RotateCcw,
  Paperclip,
} from 'lucide-react';
import { OperationalIssue, OperationalIssueSeverity, OperationalIssueStatus } from '../../../types/operationalIssue';
import { IssueSlaBadge } from './IssueSlaBadge';

interface OperationalIssueTableProps {
  issues: OperationalIssue[];
  onSelectIssue: (issue: OperationalIssue) => void;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueTable: React.FC<OperationalIssueTableProps> = ({
  issues,
  onSelectIssue,
  getCategoryLabel,
}) => {
  const getSeverityBadge = (severity: OperationalIssueSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase animate-pulse">CRITICAL</span>;
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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SELESAI (VERIF)</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">VERIFIED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">CLOSED</span>;
      case 'REVISION_REQUIRED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/30 text-amber-200 border border-amber-400/40 flex items-center gap-1"><RotateCcw className="w-3 h-3 text-amber-300" />REVISI</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-600/20 text-slate-400 border border-slate-600/30">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  if (issues.length === 0) {
    return (
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
        Tidak ada kendala operasional yang sesuai dengan filter pencarian.
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0B0F19] text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">No. Issue</th>
              <th className="py-3 px-4">Judul & Deskripsi</th>
              <th className="py-3 px-4">Departemen / Stasiun</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">SLA Target</th>
              <th className="py-3 px-4">Pelapor / PIC</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {issues.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-purple-400 whitespace-nowrap">
                  {issue.issueNumber}
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {issue.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {issue.description}
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-200">{issue.areaName}</div>
                  <div className="text-[11px] text-slate-400">{issue.stationName || '-'}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 text-[11px]">
                    {getCategoryLabel(issue.category)}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getSeverityBadge(issue.severity)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(issue.status)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <IssueSlaBadge issue={issue} showDetails />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="text-white font-medium">{issue.reportedByName}</div>
                  <div className="text-[11px] text-purple-400">
                    PIC: {issue.assignedToName || 'Belum Ditugaskan'}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIssue(issue);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all text-xs font-semibold"
                  >
                    Detail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
