/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Employee Document Detail & Checklist Modal
 */

import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Upload,
  Eye,
  Download,
  History,
  Archive,
  FileText,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { HRDocument, EmployeeDocumentCompleteness } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface EmployeeDocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  currentUser: AuthUser;
  onUploadForEmployee: (employeeId: string, docTypeId?: string) => void;
  onViewDocument: (doc: HRDocument) => void;
  onVerifyDocument: (doc: HRDocument) => void;
  onArchiveDocument: (doc: HRDocument) => void;
  onVersionDocument: (doc: HRDocument) => void;
  canManage: boolean;
}

export const EmployeeDocumentDetailModal: React.FC<EmployeeDocumentDetailModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  currentUser,
  onUploadForEmployee,
  onViewDocument,
  onVerifyDocument,
  onArchiveDocument,
  onVersionDocument,
  canManage,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  if (!isOpen || !employeeId) return null;

  const emp = hrDocumentService.getEmployee(employeeId);
  const completeness = hrDocumentService.getEmployeeCompleteness(employeeId);
  const employeeDocs = hrDocumentService.getDocumentsByEmployee(employeeId);
  const categories = hrDocumentService.getCategories();
  const allDocTypes = hrDocumentService.getDocumentTypes();

  const filteredDocs = employeeDocs.filter((doc) => {
    if (activeCategoryFilter === 'ALL') return true;
    return doc.documentCategoryId === activeCategoryFilter;
  });

  const getStatusBadge = (status: string, isExpired?: boolean) => {
    if (isExpired || status === 'EXPIRED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> EXPIRED
        </span>
      );
    }
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> TERVERIFIKASI
          </span>
        );
      case 'PENDING_REVIEW':
      case 'UPLOADED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> SEGERA BERAKHIR
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> DITOLAK
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Archive className="w-3 h-3" /> ARSIP
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#120D2C] border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-purple-950/80 via-[#1A133E] to-indigo-950/70 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/40 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-purple-900/40 shrink-0">
              {emp?.fullName?.charAt(0) || emp?.name?.charAt(0) || 'K'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-white">{emp?.fullName || emp?.name}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {emp?.employeeCode || emp?.employeeNo || employeeId}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {emp?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1 flex items-center gap-2">
                <span className="font-bold text-white">{emp?.department}</span>
                <span>•</span>
                <span>{emp?.primaryPosition || emp?.role}</span>
                <span>•</span>
                <span className="text-gray-400">Bergabung: {emp?.joinDate || '-'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* Completeness Summary Banner */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Status Kelengkapan Berkas
                </span>
              </div>
              <p className="text-xs text-purple-200/70">
                {completeness?.completedRequired} dari {completeness?.totalRequired} berkas wajib telah diverifikasi.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-2xl font-black text-white">
                  {completeness?.completenessPercentage}%
                </div>
                <div className="text-[10px] text-gray-400">Skor Kepatuhan</div>
              </div>
              {canManage && (
                <button
                  onClick={() => onUploadForEmployee(employeeId)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Unggah Berkas Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Missing Required Documents Alert */}
          {completeness && completeness.missingDocuments.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-950/30 border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Berkas Wajib yang Belum Dilengkapi ({completeness.missingDocuments.length})</span>
                </div>
                <span className="text-[10px] text-rose-400/80 font-mono">Tindakan Diperlukan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completeness.missingDocuments.map((missing, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-rose-900/20 border border-rose-500/20 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{missing.documentTypeName}</div>
                      <div className="text-[10px] text-purple-200/60">{missing.categoryName}</div>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => onUploadForEmployee(employeeId, missing.documentTypeId)}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/30 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Unggah</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Daftar Dokumen Tersimpan ({employeeDocs.length})</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-white/10">
              <button
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Semua Kategori ({employeeDocs.length})
              </button>
              {categories.map((cat) => {
                const count = employeeDocs.filter((d) => d.documentCategoryId === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCategoryFilter === cat.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Document Cards / List */}
            <div className="space-y-3">
              {filteredDocs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <FileText className="w-8 h-8 text-purple-400/40 mx-auto" />
                  <p className="text-xs text-gray-300 font-bold">Belum ada dokumen pada kategori ini</p>
                  <p className="text-[11px] text-gray-400">Silakan unggah dokumen untuk melengkapi arsip.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const cat = hrDocumentService.getCategoryById(doc.documentCategoryId);
                  const docType = hrDocumentService.getDocumentTypeById(doc.documentTypeId);
                  const isExp = hrDocumentService.isDocumentExpired(doc.expiryDate);

                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            v{doc.version}
                          </span>
                          <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                            {doc.documentName}
                          </h4>
                          {getStatusBadge(doc.status, isExp)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-200/70">
                          <span>Kategori: <strong className="text-white">{cat?.name || doc.documentCategoryId}</strong></span>
                          {doc.documentNumber && (
                            <span>No: <strong className="text-white font-mono">{doc.documentNumber}</strong></span>
                          )}
                          {doc.expiryDate && (
                            <span className={isExp ? 'text-rose-400 font-bold' : ''}>
                              Berlaku s/d: {doc.expiryDate}
                            </span>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-[11px] text-gray-400 line-clamp-1">{doc.description}</p>
                        )}

                        <div className="text-[10px] text-gray-400 font-mono">
                          Diupload oleh {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                          {doc.verifiedBy && ` • Diverifikasi oleh ${doc.verifiedBy}`}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Lihat & Baca Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-300" />
                          <span>Lihat</span>
                        </button>

                        {canManage && doc.status === 'PENDING_REVIEW' && (
                          <button
                            onClick={() => onVerifyDocument(doc)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verifikasi</span>
                          </button>
                        )}

                        {canManage && (
                          <>
                            <button
                              onClick={() => onVersionDocument(doc)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-purple-300 hover:text-purple-100 transition-colors cursor-pointer"
                              title="Terbitkan Versi Baru"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onArchiveDocument(doc)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Arsipkan Dokumen"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Total {employeeDocs.length} dokumen tersimpan di arsip kepegawaian
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
