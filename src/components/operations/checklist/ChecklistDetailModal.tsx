/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — CHECKLIST DETAIL & AUDIT INSPECTOR MODAL
 * Complete inspector for a Daily Checklist instance with item results,
 * photo evidence viewer, supervisor approval/rejection triggers, and full audit trail timeline.
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Camera,
  BookOpen,
  FileText,
  User,
  History,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DailyChecklist, ChecklistExecution } from '../../../types/operationsChecklist';
import { SopIkaViewerModal } from './SopIkaViewerModal';

interface ChecklistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: DailyChecklist | null;
  onVerify?: (checklistId: string, note?: string) => void;
  onReject?: (checklistId: string, reason: string) => void;
  onManagerOverride?: (checklistId: string, reason: string) => void;
  canVerify?: boolean;
}

export const ChecklistDetailModal: React.FC<ChecklistDetailModalProps> = ({
  isOpen,
  onClose,
  checklist,
  onVerify,
  onReject,
  onManagerOverride,
  canVerify = false,
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'AUDIT' | 'EVIDENCE'>('ITEMS');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // SOP/IKA modal state
  const [sopIkaTarget, setSopIkaTarget] = useState<{ sopId?: string; ikaId?: string } | null>(null);

  if (!isOpen || !checklist) return null;

  const handleApprove = () => {
    if (onVerify) {
      onVerify(checklist.id, verificationNote);
      onClose();
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) return;
    if (onReject) {
      onReject(checklist.id, rejectionReason);
      setIsRejectOpen(false);
      onClose();
    }
  };

  const handleConfirmOverride = () => {
    if (!overrideReason.trim()) return;
    if (onManagerOverride) {
      onManagerOverride(checklist.id, overrideReason);
      setIsOverrideOpen(false);
      onClose();
    }
  };

  // Collect all photos from execution items
  const allEvidencePhotos = checklist.items.flatMap((i) =>
    (i.evidence || []).map((e) => ({
      ...e,
      itemTitle: i.title,
      itemStatus: i.status,
    }))
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#151B2B] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {checklist.templateCode}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      checklist.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : checklist.status === 'VERIFICATION_REQUIRED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : checklist.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : checklist.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {checklist.status}
                  </span>
                  {checklist.isOverdue && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Terlambat {checklist.overdueMinutes}m
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{checklist.templateTitle}</h3>
                <p className="text-xs text-slate-400">
                  {checklist.stationName} ({checklist.areaName}) • {checklist.shiftName} • {checklist.date}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition self-start md:self-auto cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stat Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#151B2B]/60 border-b border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Petugas Pelaksana</span>
              <span className="font-bold text-white">{checklist.assignedEmployeeName}</span>
              <span className="text-[10px] text-slate-400 block">{checklist.assignedRoleName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Progress Penyelesaian</span>
              <span className="font-bold text-emerald-400">
                {checklist.completedItemsCount} / {checklist.totalItemsCount} Task ({checklist.completionPercentage}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status Verifikasi</span>
              <span className="font-bold text-white">
                {checklist.verifiedByName ? `Diverifikasi: ${checklist.verifiedByName}` : 'Belum Diverifikasi'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Kendala / Critical Failed</span>
              <span className={`font-bold ${checklist.criticalIssueCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {checklist.failedItemsCount} Gagal ({checklist.criticalIssueCount} CCP Kritis)
              </span>
            </div>
          </div>

          {/* Rejection Alert if rejected */}
          {checklist.status === 'REJECTED' && checklist.rejectionReason && (
            <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Instruksi Perbaikan dari Supervisor ({checklist.rejectedByName}):</span>
                <p className="mt-0.5">{checklist.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-[#151B2B]">
            <button
              onClick={() => setActiveTab('ITEMS')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'ITEMS'
                  ? 'bg-[#111827] text-purple-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Item Task ({checklist.items.length})
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'EVIDENCE'
                  ? 'bg-[#111827] text-purple-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Galeri Bukti ({allEvidencePhotos.length})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'AUDIT'
                  ? 'bg-[#111827] text-purple-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Log Audit ({checklist.auditTrail?.length || 0})
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {activeTab === 'ITEMS' && (
              <div className="space-y-3">
                {checklist.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      item.status === 'PASSED'
                        ? 'bg-[#151B2B]/70 border-white/10'
                        : item.status === 'FAILED'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-[#151B2B]/40 border-white/5'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-white/5 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {item.sequence}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        {item.criticalControlPoint && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> CCP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'PASSED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 pl-8 mb-3 leading-relaxed">{item.description}</p>

                    {/* Meta / Values / Notes recorded */}
                    <div className="pl-8 flex flex-wrap items-center gap-3 text-xs">
                      {item.value !== undefined && (
                        <div className="px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-white/10 text-slate-300">
                          <span className="text-slate-400 text-[10px]">Nilai Ukur: </span>
                          <span className="font-bold text-white">
                            {item.value} {item.unit || ''}
                          </span>
                        </div>
                      )}

                      {item.note && (
                        <div className="px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-white/10 text-slate-300 flex-1 min-w-[200px]">
                          <span className="text-slate-400 text-[10px]">Catatan: </span>
                          <span className="text-slate-200">{item.note}</span>
                        </div>
                      )}

                      {/* Linked SOP / IKA buttons */}
                      {item.sopReferenceId && (
                        <button
                          type="button"
                          onClick={() =>
                            setSopIkaTarget({ sopId: item.sopReferenceId, ikaId: item.ikaReferenceId })
                          }
                          className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" /> {item.sopReferenceCode || 'SOP'}
                        </button>
                      )}

                      {item.ikaReferenceId && (
                        <button
                          type="button"
                          onClick={() => setSopIkaTarget({ ikaId: item.ikaReferenceId })}
                          className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> {item.ikaReferenceCode || 'IKA'}
                        </button>
                      )}
                    </div>

                    {/* Failure details if FAILED */}
                    {item.status === 'FAILED' && (
                      <div className="ml-8 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Alasan Kendala: {item.failureReason}</span>
                        </div>
                        {item.correctiveAction && (
                          <p className="text-[11px] text-rose-200/90 pl-5">
                            <span className="font-semibold text-rose-300">Tindakan Koreksi: </span>
                            {item.correctiveAction}
                          </p>
                        )}
                        {item.issueNumber && (
                          <div className="pt-1 pl-5 text-[10px] text-rose-300/80 font-mono">
                            Tiket Kendala: {item.issueNumber}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence thumbnails */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="ml-8 mt-3 flex flex-wrap gap-2">
                        {item.evidence.map((ev, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 w-20 h-14">
                            <img src={ev.previewUrl} alt="Bukti" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'EVIDENCE' && (
              <div className="space-y-4">
                {allEvidencePhotos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Camera className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                    <p className="text-xs">Belum ada lampiran foto bukti pada checklist ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allEvidencePhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[#151B2B] border border-white/10 space-y-2 overflow-hidden"
                      >
                        <img
                          src={photo.previewUrl}
                          alt={photo.itemTitle}
                          className="w-full h-36 object-cover rounded-lg"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white truncate">{photo.itemTitle}</h5>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(photo.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'AUDIT' && (
              <div className="space-y-3">
                {checklist.auditTrail?.map((aud) => (
                  <div
                    key={aud.id}
                    className="p-3 rounded-xl bg-[#151B2B] border border-white/5 flex items-start gap-3 text-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 text-purple-400 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{aud.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(aud.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{aud.details}</p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Oleh: {aud.performedByName} ({aud.role})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Bar for Supervisor / Manager */}
          <div className="p-4 border-t border-white/10 bg-[#151B2B] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              ID: <span className="font-mono text-slate-300">{checklist.id}</span>
            </div>

            <div className="flex items-center gap-2">
              {canVerify && (checklist.status === 'VERIFICATION_REQUIRED' || checklist.status === 'COMPLETED' || checklist.status === 'REJECTED') && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectOpen(true)}
                    className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Tolak & Minta Perbaikan
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Verifikasi & Setujui
                  </button>
                </>
              )}

              {canVerify && checklist.status !== 'VERIFIED' && (
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(true)}
                  className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Manager Override
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal dialog */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#111827] border border-rose-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Tolak Checklist & Minta Perbaikan
            </h4>
            <p className="text-xs text-slate-300">
              Tuliskan instruksi koreksi yang harus segera dilakukan staf sebelum checklist dapat disetujui:
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Suhu bilas dishwasher masih rendah (68°C). Mohon tunggu pemanasan boiler dan ulangi cycle test."
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRejectOpen(false)}
                className="px-3 py-1.5 bg-white/5 text-slate-300 text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Override dialog */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#111827] border border-purple-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Manager Override Verifikasi
            </h4>
            <p className="text-xs text-slate-300">
              Masukkan alasan persetujuan manual tingkat manajemen:
            </p>
            <textarea
              rows={3}
              required
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Contoh: Telah dicek langsung oleh GM di lapangan, operasional dapat dilanjutkan."
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsOverrideOpen(false)}
                className="px-3 py-1.5 bg-white/5 text-slate-300 text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Konfirmasi Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP / IKA Modal */}
      {sopIkaTarget && (
        <SopIkaViewerModal
          isOpen={!!sopIkaTarget}
          onClose={() => setSopIkaTarget(null)}
          sopId={sopIkaTarget.sopId}
          ikaId={sopIkaTarget.ikaId}
        />
      )}
    </>
  );
};
