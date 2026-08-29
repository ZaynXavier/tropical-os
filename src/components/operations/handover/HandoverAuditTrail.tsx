/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER AUDIT TRAIL
 * Timeline-based immutable audit trail renderer
 */

import React from 'react';
import {
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  FilePlus,
  Send,
} from 'lucide-react';
import { HandoverAuditTrailEntry } from '../../../types/handover';

interface HandoverAuditTrailProps {
  auditTrail: HandoverAuditTrailEntry[];
}

export const HandoverAuditTrail: React.FC<HandoverAuditTrailProps> = ({ auditTrail }) => {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500">
        Belum ada riwayat aktivitas yang tercatat.
      </div>
    );
  }

  const getActionBadge = (action: HandoverAuditTrailEntry['action']) => {
    switch (action) {
      case 'CREATED':
        return {
          label: 'Dibuat',
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          icon: FilePlus,
        };
      case 'SUBMITTED':
        return {
          label: 'Diserahkan',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          icon: Send,
        };
      case 'RECEIVED':
        return {
          label: 'Diterima',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          icon: CheckCircle2,
        };
      case 'VERIFIED':
        return {
          label: 'Diverifikasi',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          icon: Shield,
        };
      case 'REVISION_REQUESTED':
        return {
          label: 'Revisi Diminta',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          icon: RotateCcw,
        };
      case 'CANCELLED':
        return {
          label: 'Dibatalkan',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          icon: XCircle,
        };
      default:
        return {
          label: action,
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {auditTrail.map((entry, idx) => {
          const config = getActionBadge(entry.action);
          const Icon = config.icon;
          const formattedTime = new Date(entry.timestamp).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          return (
            <div key={entry.id || idx} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${config.color} shrink-0`}
              >
                <Icon className="w-2.5 h-2.5" />
              </div>

              <div className="bg-[#0B0F19]/70 rounded-xl p-3 border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {entry.performedByName}
                    </span>
                    <span className="text-[11px] text-slate-400">({entry.role})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formattedTime}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
                  {entry.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
