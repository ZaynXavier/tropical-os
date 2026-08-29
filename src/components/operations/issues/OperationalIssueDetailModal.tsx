/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE DETAIL MODAL
 * Comprehensive inspector modal displaying complete issue context, SLA tracking,
 * resolution details, audit trail, evidence, and workflow actions.
 */

import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  FileText,
  Bookmark,
  Share2,
  Trash2,
  History,
  Paperclip,
} from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';
import { IssueSlaBadge } from './IssueSlaBadge';
import { IssueAuditTrail } from './IssueAuditTrail';
import { IssueEvidenceGallery } from './IssueEvidenceGallery';
import { isSlaBreached } from '../../../services/operationalIssueService';

interface OperationalIssueDetailModalProps {
  isOpen: boolean;
  issue: OperationalIssue | null;
  onClose: () => void;
  onAcknowledge?: (issueId: string) => void;
  onAssign?: (issue: OperationalIssue) => void;
  onEscalate?: (issue: OperationalIssue) => void;
  onResolve?: (issue: OperationalIssue) => void;
  onVerify?: (issue: OperationalIssue) => void;
  onCloseIssue?: (issueId: string) => void;
  onCancelIssue?: (issueId: string, reason: string) => void;
  getCategoryLabel: (cat: any) => string;
  canManage?: boolean;
}

export const OperationalIssueDetailModal: React.FC<OperationalIssueDetailModalProps> = ({
  isOpen,
  issue,
  onClose,
  onAcknowledge,
  onAssign,
  onEscalate,
  onResolve,
  onVerify,
  onCloseIssue,
  onCancelIssue,
  getCategoryLabel,
  canManage = true,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'AUDIT'>('DETAILS');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !issue) return null;

  const breached = isSlaBreached(issue);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-3xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                {issue.issueNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                {getCategoryLabel(issue.category)}
              </span>
              <IssueSlaBadge issue={issue} showDetails />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{issue.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'DETAILS'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Detail kendala & Penanganan
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail Aktivitas ({issue.auditTrail?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs text-slate-300">
          {activeTab === 'AUDIT' ? (
            <IssueAuditTrail auditTrail={issue.auditTrail} />
          ) : (
            <>
              {/* SLA Alert Box */}
              {breached && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold block">Peringatan: Target SLA Terlewati (Breached)</span>
                    Target penanganan {issue.slaMinutes} menit telah terlewati sejak deadline {new Date(issue.slaDeadline).toLocaleTimeString('id-ID')}. Segera lakukan tindakan penanganan atau eskalasi.
                  </div>
                </div>
              )}

              {/* Deskripsi & Lokasi */}
              <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Deskripsi Kendala Operasional
                </span>
                <p className="text-slate-200 leading-relaxed">{issue.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Departemen / Area:</span>
                    <span className="font-semibold text-white">{issue.areaName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stasiun Kerja:</span>
                    <span className="font-semibold text-white">{issue.stationName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Shift Context:</span>
                    <span className="font-semibold text-white">{issue.shiftName || 'Shift Operasional'}</span>
                  </div>
                </div>
              </div>

              {/* Status & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    Pelapor (Reporter)
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold text-white">{issue.reportedByName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(issue.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    Penanggung Jawab (PIC Assigned)
                  </span>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">
                        {issue.assignedToName || 'Belum Ditugaskan'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {issue.assignedAt ? `Ditugaskan: ${new Date(issue.assignedAt).toLocaleTimeString('id-ID')}` : 'Perlu Penugasan PIC'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Section (If Resolved / Verified / Revision Required) */}
              {(issue.resolution || issue.resolutionNotes) && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Laporan Penyelesaian (Resolution)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {issue.resolvedAt && new Date(issue.resolvedAt).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-slate-200">{issue.resolution || issue.resolutionNotes}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                    <div>
                      <span className="text-emerald-400/80 block">Kategori Akar Masalah:</span>
                      <span className="font-semibold text-white">{issue.rootCauseCategory || '-'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400/80 block">Akar Masalah (Root Cause):</span>
                      <span className="font-semibold text-white">{issue.rootCause || '-'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400/80 block">Waktu Penanganan:</span>
                      <span className="font-semibold text-white">{issue.resolutionMinutes || '-'} Menit</span>
                    </div>
                  </div>

                  {issue.preventiveAction && (
                    <div className="text-[11px] text-emerald-200/90 pt-1 border-t border-emerald-500/20">
                      <span className="font-bold">Tindakan Pencegahan Ulang:</span> {issue.preventiveAction}
                    </div>
                  )}
                </div>
              )}

              {/* Verification Section */}
              {issue.verifiedBy && (
                <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl flex items-start gap-2 text-purple-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                  <div>
                    <span className="font-bold block">Status Verifikasi Atasan</span>
                    Diverifikasi oleh <span className="font-bold text-white">{issue.verifiedByName}</span> pada {issue.verifiedAt && new Date(issue.verifiedAt).toLocaleString('id-ID')}.
                    {issue.verificationNote && <p className="text-slate-300 mt-1 italic">"{issue.verificationNote}"</p>}
                  </div>
                </div>
              )}

              {/* Photo Evidence */}
              <IssueEvidenceGallery evidence={issue.evidence || []} />

              {/* Related References (Checklist, Handover, SOP) */}
              {(issue.checklistId || issue.handoverId || issue.sopId) && (
                <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    Referensi Terkait Modul Lain
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {issue.checklistId && (
                      <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[11px]">
                        Checklist: {issue.checklistId}
                      </span>
                    )}
                    {issue.handoverId && (
                      <span className="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-[11px]">
                        Handover: {issue.handoverId}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Workflow Buttons */}
        {canManage && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {issue.status !== 'CLOSED' && issue.status !== 'CANCELLED' && onCancelIssue && (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(!showCancelConfirm)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-semibold text-xs"
                >
                  Batalkan Issue
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Acknowledge */}
              {issue.status === 'OPEN' && onAcknowledge && (
                <button
                  type="button"
                  onClick={() => onAcknowledge(issue.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30"
                >
                  Acknowledge Issue
                </button>
              )}

              {/* Assign */}
              {(issue.status === 'OPEN' || issue.status === 'ACKNOWLEDGED' || issue.status === 'IN_PROGRESS') && onAssign && (
                <button
                  type="button"
                  onClick={() => onAssign(issue)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  {issue.assignedTo ? 'Ganti PIC' : 'Tugaskan PIC'}
                </button>
              )}

              {/* Escalate */}
              {issue.status !== 'CLOSED' && issue.status !== 'CANCELLED' && issue.status !== 'VERIFIED' && onEscalate && (
                <button
                  type="button"
                  onClick={() => onEscalate(issue)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Eskalasi
                </button>
              )}

              {/* Resolve */}
              {(issue.status === 'OPEN' || issue.status === 'ACKNOWLEDGED' || issue.status === 'IN_PROGRESS' || issue.status === 'ESCALATED' || issue.status === 'REVISION_REQUIRED') && onResolve && (
                <button
                  type="button"
                  onClick={() => onResolve(issue)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Laporkan Selesai
                </button>
              )}

              {/* Verify */}
              {issue.status === 'RESOLVED' && onVerify && (
                <button
                  type="button"
                  onClick={() => onVerify(issue)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-purple-600/30"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verifikasi atasan
                </button>
              )}

              {/* Close */}
              {issue.status === 'VERIFIED' && onCloseIssue && (
                <button
                  type="button"
                  onClick={() => onCloseIssue(issue.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                >
                  Tutup Resmi (Close Issue)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Drawer */}
        {showCancelConfirm && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-rose-300 block">Konfirmasi Pembatalan Laporan Issue</span>
            <input
              type="text"
              placeholder="Masukkan alasan pembatalan..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300"
              >
                Batal
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={() => {
                  if (onCancelIssue && cancelReason.trim()) {
                    onCancelIssue(issue.id, cancelReason.trim());
                    setShowCancelConfirm(false);
                    onClose();
                  }
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold disabled:opacity-50"
              >
                Konfirmasi Batalkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
