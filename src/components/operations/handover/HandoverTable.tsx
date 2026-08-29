/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER TABLE (Desktop High-Density Table View)
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
  Eye,
  Check,
  RotateCcw,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';

interface HandoverTableProps {
  handovers: HandoverRecord[];
  onInspect: (handover: HandoverRecord) => void;
  onReceive?: (handover: HandoverRecord) => void;
  onVerify?: (handover: HandoverRecord) => void;
  onRequestRevision?: (handover: HandoverRecord) => void;
  currentUserId?: string;
  canVerify?: boolean;
  canReceive?: boolean;
}

export const HandoverTable: React.FC<HandoverTableProps> = ({
  handovers,
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            NORMAL
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            ATTENTION
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Terverifikasi
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Diterima
          </span>
        );
      case 'SUBMITTED':
      case 'PENDING_RECEIPT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Menunggu Diterima
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Perlu Revisi
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Draft
          </span>
        );
    }
  };

  if (!handovers || handovers.length === 0) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-white mb-1">Belum Ada Catatan Serah Terima</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Tidak ada data serah terima shift yang sesuai dengan filter yang dipilih.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0B0F19]/80 border-b border-white/10 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">No. Handover</th>
              <th className="py-3 px-4">Tanggal & Shift</th>
              <th className="py-3 px-4">Area & Stasiun</th>
              <th className="py-3 px-4">Pengirim & Penerima</th>
              <th className="py-3 px-4 text-center">Kondisi</th>
              <th className="py-3 px-4 text-center">Tugas / Isu</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {handovers.map((h) => {
              const isPendingMyReceipt =
                canReceive &&
                (h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT') &&
                (currentUserId === h.toEmployeeId || !currentUserId);

              const isPendingVerification =
                canVerify &&
                h.status === 'RECEIVED' &&
                !h.verifiedBy;

              return (
                <tr
                  key={h.id}
                  onClick={() => onInspect(h)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  {/* No Handover */}
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                    {h.handoverNumber}
                  </td>

                  {/* Tanggal & Shift */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{h.date}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{h.fromShiftName.split(' ')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                      <span>{h.toShiftName.split(' ')[0]}</span>
                    </div>
                  </td>

                  {/* Area & Stasiun */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{h.areaName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {h.stationName || h.department}
                    </div>
                  </td>

                  {/* Pengirim & Penerima */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-normal">Dari: </span>
                      <span className="font-medium text-white">{h.fromEmployeeName}</span>
                    </div>
                    <div className="text-slate-300 mt-0.5">
                      <span className="text-slate-500 font-normal">Ke: </span>
                      <span className="font-medium text-sky-300">{h.toEmployeeName}</span>
                    </div>
                  </td>

                  {/* Kondisi */}
                  <td className="py-3.5 px-4 text-center">
                    {getConditionBadge(h.overallCondition)}
                  </td>

                  {/* Tugas / Isu */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {h.pendingTasks && h.pendingTasks.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-medium text-[11px] flex items-center gap-1">
                          <ListTodo className="w-3 h-3" />
                          {h.pendingTasks.length}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}

                      {h.criticalIssueCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[11px] flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          {h.criticalIssueCount}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(h.status)}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {isPendingMyReceipt && onReceive && (
                        <button
                          onClick={() => onReceive(h)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          Terima
                        </button>
                      )}

                      {isPendingVerification && onVerify && (
                        <button
                          onClick={() => onVerify(h)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          Verifikasi
                        </button>
                      )}

                      <button
                        onClick={() => onInspect(h)}
                        title="Lihat Detail Handover"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
