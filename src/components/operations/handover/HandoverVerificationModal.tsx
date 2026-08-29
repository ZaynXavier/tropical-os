/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER VERIFICATION MODAL
 * Modal for Supervisors / Managers to audit and verify handover or request revision
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';

interface HandoverVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: HandoverRecord | null;
  onConfirmVerify: (handoverId: string, notes?: string) => Promise<void>;
  onRequestRevision: (handoverId: string, reason: string) => Promise<void>;
}

export const HandoverVerificationModal: React.FC<HandoverVerificationModalProps> = ({
  isOpen,
  onClose,
  handover,
  onConfirmVerify,
  onRequestRevision,
}) => {
  const [actionType, setActionType] = useState<'VERIFY' | 'REVISE'>('VERIFY');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !handover) return null;

  const handleSubmit = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (actionType === 'VERIFY') {
        await onConfirmVerify(handover.id, verifyNotes.trim());
      } else {
        if (!revisionReason || revisionReason.trim().length < 3) {
          setErrorMsg('Alasan permintaan revisi wajib diisi untuk tim operasional.');
          setSubmitting(false);
          return;
        }
        await onRequestRevision(handover.id, revisionReason.trim());
      }
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal memproses verifikasi supervisor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 max-w-lg w-full overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verifikasi Audit Supervisor</h3>
              <p className="text-xs text-slate-400 font-mono">{handover.handoverNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Area / Departemen:</span>
              <span className="font-semibold text-white">{handover.areaName} ({handover.department})</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Pengirim → Penerima:</span>
              <span className="font-semibold text-emerald-300">
                {handover.fromEmployeeName} → {handover.toEmployeeName}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Status Operasional:</span>
              <span
                className={`font-bold ${
                  handover.overallCondition === 'CRITICAL'
                    ? 'text-rose-400'
                    : handover.overallCondition === 'ATTENTION'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {handover.overallCondition}
              </span>
            </div>
          </div>

          {/* Action Choice */}
          <div className="grid grid-cols-2 gap-2 bg-[#0B0F19] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                actionType === 'VERIFY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui & Verifikasi
            </button>
            <button
              type="button"
              onClick={() => setActionType('REVISE')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                actionType === 'REVISE'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Kembalikan untuk Revisi
            </button>
          </div>

          {actionType === 'VERIFY' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Catatan Evaluasi Supervisor (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Laporan serah terima lengkap, rekonsiliasi kasir balance, dan penanganan isu sesuai SOP."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full p-3 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-amber-300 block">
                Catatan Instruksi Revisi (Wajib)
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan secara spesifik poin apa yang harus diperbaiki atau dilengkapi oleh staf..."
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="w-full p-3 bg-[#0B0F19] rounded-xl border border-amber-500/30 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0B0F19] flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-2 ${
              actionType === 'VERIFY'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {submitting
              ? 'Memproses...'
              : actionType === 'VERIFY'
              ? 'Verifikasi Laporan'
              : 'Kembalikan Revisi'}
          </button>
        </div>
      </div>
    </div>
  );
};
