/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER CARD (Mobile & Responsive Grid View)
 */

import React from 'react';
import {
  Clock,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ListTodo,
  FileText,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Camera,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';

interface HandoverCardProps {
  handover: HandoverRecord;
  onInspect: (handover: HandoverRecord) => void;
  onReceive?: (handover: HandoverRecord) => void;
  onVerify?: (handover: HandoverRecord) => void;
  onRequestRevision?: (handover: HandoverRecord) => void;
  currentUserId?: string;
  canVerify?: boolean;
  canReceive?: boolean;
}

export const HandoverCard: React.FC<HandoverCardProps> = ({
  handover,
  onInspect,
  onReceive,
  onVerify,
  onRequestRevision,
  currentUserId,
  canVerify,
  canReceive,
}) => {
  const getConditionBadge = (condition: HandoverRecord['overallCondition']) => {
    switch (condition) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            NORMAL
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            ATTENTION
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            CRITICAL
          </span>
        );
    }
  };

  const getStatusBadge = (status: HandoverRecord['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Terverifikasi
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Diterima
          </span>
        );
      case 'SUBMITTED':
      case 'PENDING_RECEIPT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Menunggu Diterima
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Perlu Revisi
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Draft
          </span>
        );
    }
  };

  const isPendingMyReceipt =
    canReceive &&
    (handover.status === 'SUBMITTED' || handover.status === 'PENDING_RECEIPT') &&
    (currentUserId === handover.toEmployeeId || !currentUserId);

  const isPendingVerification =
    canVerify &&
    handover.status === 'RECEIVED' &&
    !handover.verifiedBy;

  return (
    <div
      onClick={() => onInspect(handover)}
      className="bg-[#151B2B] hover:bg-[#1A2236] rounded-2xl border border-white/10 p-4 transition-all duration-200 cursor-pointer group shadow-sm hover:border-purple-500/30 space-y-3"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-purple-400">
              {handover.handoverNumber}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {handover.date}
            </span>
            {getStatusBadge(handover.status)}
          </div>
          <h3 className="text-sm font-bold text-white mt-1 group-hover:text-purple-300 transition-colors">
            {handover.areaName} {handover.stationName ? `— ${handover.stationName}` : ''}
          </h3>
        </div>
        <div className="shrink-0">{getConditionBadge(handover.overallCondition)}</div>
      </div>

      {/* Shift Transition & Staff Info */}
      <div className="bg-[#0B0F19]/60 rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs gap-2">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Pengirim</p>
          <p className="font-semibold text-slate-200 truncate">{handover.fromEmployeeName}</p>
          <p className="text-[10px] text-purple-400/80 truncate">{handover.fromShiftName.split(' ')[0]}</p>
        </div>

        <div className="flex flex-col items-center justify-center px-1">
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div className="text-right min-w-0">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Penerima</p>
          <p className="font-semibold text-slate-200 truncate">{handover.toEmployeeName}</p>
          <p className="text-[10px] text-sky-400/80 truncate">{handover.toShiftName.split(' ')[0]}</p>
        </div>
      </div>

      {/* Summary Excerpt */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
        {handover.summary}
      </p>

      {/* Metadata Badges (Pending tasks, Critical issues, Evidence) */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          {handover.pendingTasks && handover.pendingTasks.length > 0 && (
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <ListTodo className="w-3.5 h-3.5" />
              {handover.pendingTasks.length} tugas
            </span>
          )}

          {handover.criticalIssueCount > 0 && (
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <AlertOctagon className="w-3.5 h-3.5" />
              {handover.criticalIssueCount} isu kritis
            </span>
          )}

          {handover.evidence && handover.evidence.length > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Camera className="w-3.5 h-3.5" />
              {handover.evidence.length} foto
            </span>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isPendingMyReceipt && onReceive && (
            <button
              onClick={() => onReceive(handover)}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Terima
            </button>
          )}

          {isPendingVerification && onVerify && (
            <button
              onClick={() => onVerify(handover)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Verifikasi
            </button>
          )}

          <button
            onClick={() => onInspect(handover)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
