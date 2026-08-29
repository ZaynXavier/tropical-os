/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER RECEIVE MODAL
 * Modal for incoming shift staff to accept handover or request immediate revision
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';

interface HandoverReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: HandoverRecord | null;
  onConfirmReceive: (handoverId: string, notes?: string) => Promise<void>;
  onRequestRevision: (handoverId: string, reason: string) => Promise<void>;
}

export const HandoverReceiveModal: React.FC<HandoverReceiveModalProps> = ({
  isOpen,
  onClose,
  handover,
  onConfirmReceive,
  onRequestRevision,
}) => {
  const [mode, setMode] = useState<'RECEIVE' | 'REVISION'>('RECEIVE');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !handover) return null;

  const handleSubmit = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (mode === 'RECEIVE') {
        await onConfirmReceive(handover.id, receiptNotes.trim());
      } else {
        if (!revisionReason || revisionReason.trim().length < 3) {
          setErrorMsg('Alasan permintaan revisi wajib diisi.');
          setSubmitting(false);
          return;
        }
        await onRequestRevision(handover.id, revisionReason.trim());
      }
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal memproses serah terima.');
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
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Penerimaan Handover</h3>
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
          {/* Handover Brief Recap */}
          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Departemen / Area:</span>
              <span className="font-semibold text-white">{handover.areaName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Pengirim Shift Pagi:</span>
              <span className="font-semibold text-purple-300">{handover.fromEmployeeName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Kondisi Operasional:</span>
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
            <p className="text-slate-300 italic pt-1 border-t border-white/5 line-clamp-2">
              "{handover.summary}"
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2 bg-[#0B0F19] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setMode('RECEIVE')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'RECEIVE'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Terima Laporan
            </button>
            <button
              type="button"
              onClick={() => setMode('REVISION')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'REVISION'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Minta Revisi Catatan
            </button>
          </div>

          {/* Mode Specific Input */}
          {mode === 'RECEIVE' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Catatan Penerimaan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Diterima. Stasiun hot line bersih, fisik kasir balance, dan siap melanjutkan shift."
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                className="w-full p-3 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-amber-300 block">
                Alasan Permintaan Revisi (Wajib)
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan bagian catatan, stok, atau isu yang perlu dilengkapi pengirim..."
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
              mode === 'RECEIVE'
                ? 'bg-sky-600 hover:bg-sky-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {submitting
              ? 'Memproses...'
              : mode === 'RECEIVE'
              ? 'Konfirmasi Diterima'
              : 'Kirim Permintaan Revisi'}
          </button>
        </div>
      </div>
    </div>
  );
};
