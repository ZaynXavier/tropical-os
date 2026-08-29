/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Document Archive Modal
 */

import React, { useState } from 'react';
import { X, Archive, AlertTriangle, FileText } from 'lucide-react';
import { HRDocument } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface DocumentArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HRDocument | null;
  currentUser: AuthUser;
  onSuccess: (archivedDoc: HRDocument) => void;
}

export const DocumentArchiveModal: React.FC<DocumentArchiveModalProps> = ({
  isOpen,
  onClose,
  document,
  currentUser,
  onSuccess,
}) => {
  const [archiveReason, setArchiveReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const archiverName = currentUser.name || currentUser.username || 'HR Officer';

  const handleArchive = async () => {
    setErrorMsg(null);
    if (!archiveReason.trim()) {
      setErrorMsg('Masukkan alasan pengarsipan dokumen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = hrDocumentService.archiveDocument(document.id, archiveReason, archiverName);
      if (res) {
        onSuccess(res);
        onClose();
      } else {
        setErrorMsg('Gagal mengarsipkan dokumen.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#130F30] border border-purple-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#1E1248] to-[#130F30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Arsipkan Dokumen</h2>
              <p className="text-xs text-purple-200/70">Pindahkan dokumen dari status aktif ke arsip</p>
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
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
            <span className="text-purple-300 font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{document.documentName}</span>
            </span>
            <p className="text-gray-400 text-[11px]">
              Dokumen ini akan disembunyikan dari daftar kepatuhan aktif namun tetap tersimpan dalam riwayat arsip.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200">Alasan Pengarsipan *</label>
            <textarea
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="Contoh: Digantikan oleh kontrak baru periode 2026 / Karyawan non-aktif..."
              rows={3}
              className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-gray-500 resize-none"
            />
          </div>
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
            onClick={handleArchive}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengarsipkan...' : 'Arsipkan Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
