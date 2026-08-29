/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE AUDIT TRAIL
 * Timeline logger component displaying immutable audit events
 */

import React from 'react';
import {
  History,
  User,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  UserCheck,
} from 'lucide-react';
import { IssueAuditEvent } from '../../../types/operationalIssue';

interface IssueAuditTrailProps {
  auditTrail: IssueAuditEvent[];
}

export const IssueAuditTrail: React.FC<IssueAuditTrailProps> = ({ auditTrail }) => {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div className="bg-[#0B0F19] rounded-xl p-4 text-center border border-white/5 text-xs text-slate-500">
        Belum ada riwayat aktivitas tercatat.
      </div>
    );
  }

  const getActionIcon = (action: IssueAuditEvent['action']) => {
    switch (action) {
      case 'CREATED':
        return <PlusCircle className="w-4 h-4 text-purple-400" />;
      case 'ACKNOWLEDGED':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'ESCALATED':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'REVISION_REQUESTED':
        return <RotateCcw className="w-4 h-4 text-amber-400" />;
      case 'CLOSED':
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
      default:
        return <History className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative border-l-2 border-white/10 ml-3.5 pl-5 space-y-4">
        {auditTrail.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Dot Icon */}
            <div className="absolute -left-[29px] top-0 p-1 rounded-full bg-[#151B2B] border border-white/10">
              {getActionIcon(event.action)}
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  {event.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(event.timestamp).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <User className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="font-semibold text-white">{event.actorName}</span>
                <span className="text-slate-500">({event.actorRole})</span>
              </div>

              {event.reason && (
                <p className="text-[11px] text-slate-400 italic pt-0.5 border-t border-white/5 mt-1">
                  "{event.reason}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
