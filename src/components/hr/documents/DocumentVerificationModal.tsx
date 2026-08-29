/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Document Verification & Approval Modal
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { HRDocument } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HRDocument | null;
  currentUser: AuthUser;
  onSuccess: (updatedDoc: HRDocument) => void;
}

const QUICK_REJECTION_REASONS = [
  'Foto/scan buram atau tidak terbaca dengan jelas',
  'Masa berlaku dokumen telah habis/kedaluwarsa',
  'Nama pada dokumen berbeda dengan identitas resmi karyawan',
  'Dokumen terpotong atau halaman tidak lengkap',
  'Tanda tangan atau stempel basah tidak tertera',
];

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  document,
  currentUser,
  onSuccess,
}) => {
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT'>('VERIFY');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const emp = hrDocumentService.getEmployee(document.employeeId);
  const reviewerName = currentUser.name || currentUser.username || 'HR Reviewer';

  const handleConfirm = async () => {
    setErrorMsg(null);
    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      setErrorMsg('Alasan penolakan dokumen wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      let updated: HRDocument | null = null;
      if (actionType === 'VERIFY') {
        updated = hrDocumentService.verifyDocument(
          document.id,
          reviewerName,
          verificationNotes || 'Dokumen telah diverifikasi dan sesuai standar HR Tropical Garden.'
        );
      } else {
        updated = hrDocumentService.rejectDocument(
          document.id,
          rejectionReason,
          reviewerName
        );
      }

      if (updated) {
        onSuccess(updated);
        onClose();
      } else {
        setErrorMsg('Gagal memperbarui status dokumen.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#130F30] border border-purple-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#1E1248] to-[#130F30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Verifikasi &amp; Validasi Dokumen</h2>
              <p className="text-xs text-purple-200/70">Pemeriksaan keabsahan berkas karyawan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Document & Employee Info Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>{document.documentName}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {document.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1">
              <div>
                <span className="text-gray-400 block">Karyawan:</span>
                <span className="font-semibold text-white">{emp?.fullName || emp?.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Divisi / Jabatan:</span>
                <span className="font-semibold text-white">
                  {emp?.department} ({emp?.primaryPosition || emp?.role})
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Nama File:</span>
                <span className="font-semibold text-white">{document.fileName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Diupload Oleh:</span>
                <span className="font-semibold text-white">{document.uploadedBy}</span>
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200">Keputusan Peninjauan:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('VERIFY')}
                className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'VERIFY'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi (Valid)</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'REJECT'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Dokumen</span>
              </button>
            </div>
          </div>

          {/* Dynamic Form based on action */}
          {actionType === 'VERIFY' ? (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-purple-200">Catatan Persetujuan (Opsional)</label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Misal: Dokumen asli telah diperiksa dan sesuai ketentuan legalitas."
                rows={3}
                className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-rose-300">Alasan Penolakan Dokumen *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tuliskan detail alasan penolakan agar staf dapat memperbaiki..."
                rows={2}
                className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-rose-500/30 focus:border-rose-400 focus:outline-none text-xs text-white placeholder:text-gray-500 resize-none"
              />

              {/* Quick Pick Reason Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400">Pilih Cepat Alasan Umum:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REJECTION_REASONS.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(r)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-[10px] text-gray-300 hover:text-rose-200 transition-all text-left cursor-pointer"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#17113C] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
              actionType === 'VERIFY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isSubmitting ? (
              <span>Memproses...</span>
            ) : actionType === 'VERIFY' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Verifikasi</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Konfirmasi Penolakan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
