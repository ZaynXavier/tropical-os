/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — HR Document Viewer & Preview Modal
 */

import React from 'react';
import {
  X,
  Download,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Layers,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { HRDocument } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';

interface HRDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HRDocument | null;
  onVerifyClick?: (doc: HRDocument) => void;
  onNewVersionClick?: (doc: HRDocument) => void;
  canManage?: boolean;
}

export const HRDocumentViewerModal: React.FC<HRDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  onVerifyClick,
  onNewVersionClick,
  canManage,
}) => {
  if (!isOpen || !document) return null;

  const emp = hrDocumentService.getEmployee(document.employeeId);
  const category = hrDocumentService.getCategoryById(document.documentCategoryId);
  const docType = hrDocumentService.getDocumentTypeById(document.documentTypeId);
  const daysExpiry = hrDocumentService.getDaysUntilExpiry(document.expiryDate);

  const handleDownload = () => {
    // Generate simulated downloadable file
    const content = `TROPICAL GARDEN RESTO - CANGGU BALI
==================================================
DOKUMEN KEPEGAWAIAN RESMI
==================================================
Nama Dokumen     : ${document.documentName}
Nomor Dokumen    : ${document.documentNumber || '-'}
Karyawan         : ${emp?.fullName || emp?.name || document.employeeId} (${emp?.employeeCode || emp?.employeeNo || '-'})
Departemen/Posisi: ${emp?.department} - ${emp?.primaryPosition || emp?.role}
Kategori         : ${category?.name || '-'}
Tipe Dokumen     : ${docType?.name || '-'}
Tanggal Rilis    : ${document.issueDate || '-'}
Tanggal Kedaluwarsa: ${document.expiryDate || 'Seumur Hidup'}
Versi            : v${document.version}
Status           : ${document.status}
Diupload Oleh    : ${document.uploadedBy} (${new Date(document.uploadedAt).toLocaleDateString('id-ID')})
Diverifikasi Oleh: ${document.verifiedBy || '-'} (${document.verifiedAt ? new Date(document.verifiedAt).toLocaleDateString('id-ID') : '-'})
Catatan          : ${document.notes || '-'}
==================================================
TROPICALOS CLOUD HR ARCHIVE SYSTEM
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.fileName.replace(/\.[^/.]+$/, '')}_export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi (Valid)</span>
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Segera Berakhir ({daysExpiry} hari)</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Kedaluwarsa</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-600/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" />
            <span>Ditolak</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gray-500/20 text-gray-300 border border-gray-500/30 flex items-center gap-1.5">
            <span>Diarsipkan</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white/10 text-white border border-white/20">
            {document.status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#130F30] border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/50 via-[#1E1248] to-[#130F30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-white">{document.documentName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-purple-200 border border-white/10">
                  v{document.version}
                </span>
              </div>
              <p className="text-xs text-purple-200/70">
                {category?.name} • {docType?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span className="hidden sm:inline">Unduh Berkas</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content - 2 Columns (Preview & Metadata) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 custom-scrollbar">
          {/* Left Column: Simulated Document View (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-[#0E0B25] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 min-h-[360px]">
            <div className="w-full max-w-md bg-[#1B1440] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 text-gray-200 text-xs relative overflow-hidden">
              {/* Resto Watermark Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                    TG
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs tracking-wide">TROPICAL GARDEN</h4>
                    <span className="text-[9px] text-purple-300/70 block">Resto &amp; Hospitality Canggu</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-purple-300/80 bg-white/5 px-2 py-1 rounded-md">
                  {document.documentNumber || `DOC-${document.id.slice(-6).toUpperCase()}`}
                </span>
              </div>

              {/* Document Canvas Presentation */}
              <div className="space-y-3 py-2">
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                    ARSIP RESMI KEPEGAWAIAN
                  </span>
                  <h3 className="text-base font-black text-white">{document.documentName}</h3>
                </div>

                <div className="bg-black/30 rounded-xl p-3.5 space-y-2 border border-white/5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nama Personel:</span>
                    <span className="font-bold text-white">{emp?.fullName || emp?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nomor Induk:</span>
                    <span className="font-mono text-purple-200">{emp?.employeeCode || emp?.employeeNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Divisi / Posisi:</span>
                    <span className="text-gray-200">{emp?.department} / {emp?.primaryPosition || emp?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Masa Berlaku:</span>
                    <span className="font-semibold text-emerald-300">
                      {document.expiryDate ? `${document.issueDate || '-'} s/d ${document.expiryDate}` : 'Berlaku Seumur Hidup'}
                    </span>
                  </div>
                </div>

                {document.notes && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                    <strong className="block text-[10px] uppercase tracking-wider text-purple-300">Catatan HR:</strong>
                    {document.notes}
                  </div>
                )}

                {document.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-200">
                    <strong className="block text-[10px] uppercase tracking-wider text-rose-300">Alasan Penolakan:</strong>
                    {document.rejectionReason}
                  </div>
                )}
              </div>

              {/* Digital Verification Stamp */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-gray-400">
                <div className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TropicalOS Digital Seal</span>
                </div>
                <span>v{document.version}.0 • {document.fileName}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Sidebar & Actions (5 cols) */}
          <div className="lg:col-span-5 p-5 md:p-6 space-y-5 bg-[#130F30]">
            {/* Status Section */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider">Status Validasi</span>
              <div>{getStatusBadge()}</div>
            </div>

            {/* Quick Metadata List */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Kategori:</span>
                  <span className="font-semibold text-white">{category?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sifat Wajib:</span>
                  <span className={`font-bold ${document.isRequired ? 'text-amber-300' : 'text-gray-300'}`}>
                    {document.isRequired ? 'Wajib (Mandatory)' : 'Opsional / Tambahan'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ukuran File:</span>
                  <span className="font-mono text-gray-300">{(document.fileSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Format File:</span>
                  <span className="font-mono text-purple-300 uppercase">{document.fileType.split('/')[1] || document.fileType}</span>
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                  Riwayat Audit &amp; Verifikasi
                </span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2 text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Diupload Oleh:</span>
                      <strong className="text-white">{document.uploadedBy}</strong>
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(document.uploadedAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {document.verifiedBy && (
                    <div className="flex items-start gap-2 text-gray-300 pt-1 border-t border-white/5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block">Diverifikasi Oleh:</span>
                        <strong className="text-emerald-300">{document.verifiedBy}</strong>
                        <span className="text-[10px] text-gray-400 block">
                          {document.verifiedAt ? new Date(document.verifiedAt).toLocaleString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>
                  )}

                  {document.rejectedBy && (
                    <div className="flex items-start gap-2 text-gray-300 pt-1 border-t border-white/5">
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block">Ditolak Oleh:</span>
                        <strong className="text-rose-300">{document.rejectedBy}</strong>
                        <span className="text-[10px] text-gray-400 block">
                          {document.rejectedAt ? new Date(document.rejectedAt).toLocaleString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Manager / Supervisor */}
            {canManage && (
              <div className="pt-2 space-y-2">
                {document.status === 'PENDING_REVIEW' && onVerifyClick && (
                  <button
                    onClick={() => {
                      onVerifyClick(document);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi / Review Berkas</span>
                  </button>
                )}

                {onNewVersionClick && (
                  <button
                    onClick={() => {
                      onNewVersionClick(document);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <History className="w-4 h-4 text-purple-300" />
                    <span>Perbarui Versi Dokumen (v{document.version + 1})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
