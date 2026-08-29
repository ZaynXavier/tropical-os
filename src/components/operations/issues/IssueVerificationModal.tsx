/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE VERIFICATION MODAL
 * Modal for Supervisor/Manager to verify resolution or request revision with notes
 */

import React, { useState } from 'react';
import { X, ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';

interface IssueVerificationModalProps {
  isOpen: boolean;
  issue: OperationalIssue | null;
  onClose: () => void;
  onVerify: (data: { verifiedBy: string; verifiedByName: string; verificationNote?: string }) => Promise<void>;
  onRequestRevision: (data: { verifiedBy: string; verifiedByName: string; revisionReason: string }) => Promise<void>;
  currentActorId?: string;
  currentActorName?: string;
}

export const IssueVerificationModal: React.FC<IssueVerificationModalProps> = ({
  isOpen,
  issue,
  onClose,
  onVerify,
  onRequestRevision,
  currentActorId = 'emp-02',
  currentActorName = 'Heri Setiawan',
}) => {
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState<'VERIFY' | 'REVISION'>('VERIFY');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (actionType === 'VERIFY') {
        await onVerify({
          verifiedBy: currentActorId,
          verifiedByName: currentActorName,
          verificationNote: note.trim() || 'Hasil penanganan telah diverifikasi & disetujui.',
        });
      } else {
        if (!note.trim()) return;
        await onRequestRevision({
          verifiedBy: currentActorId,
          verifiedByName: currentActorName,
          revisionReason: note.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Verifikasi Penyelesaian Kendala
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue Details Box */}
        <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span>{issue.issueNumber}</span>
            <span className="text-emerald-400 font-bold">RESOVED BY: {issue.resolvedByName || 'PIC'}</span>
          </div>
          <div className="font-bold text-white">{issue.title}</div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-200">
            <span className="font-semibold block mb-0.5">Catatan Penyelesaian PIC:</span>
            {issue.resolution || issue.resolutionNotes || 'Tidak ada catatan.'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action Choice */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                actionType === 'VERIFY'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Setujui & Verifikasi
            </button>

            <button
              type="button"
              onClick={() => setActionType('REVISION')}
              className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                actionType === 'REVISION'
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Minta Revisi
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {actionType === 'VERIFY' ? 'Catatan Verifikasi Supervisor (Opsional)' : 'Alasan Permintaan Revisi *'}
            </label>
            <textarea
              required={actionType === 'REVISION'}
              rows={3}
              placeholder={
                actionType === 'VERIFY'
                  ? 'Catatan tambahan terkait kualitas perbaikan...'
                  : 'Jelaskan bagian perbaikan yang belum sempurna atau memerlukan pengerjaan ulang...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (actionType === 'REVISION' && !note.trim())}
              className={`px-5 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${
                actionType === 'VERIFY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {loading
                ? 'Memproses...'
                : actionType === 'VERIFY'
                ? 'Konfirmasi Verifikasi'
                : 'Kirim Permintaan Revisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
