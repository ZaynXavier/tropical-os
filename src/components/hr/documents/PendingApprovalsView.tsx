/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Pending Document Approvals & Verification Workstation
 */

import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  Building,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { HRDocument } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface PendingApprovalsViewProps {
  currentUser: AuthUser;
  onViewDocument: (doc: HRDocument) => void;
  onVerifyDocument: (doc: HRDocument) => void;
  canManage: boolean;
  onDataChanged: () => void;
}

export const PendingApprovalsView: React.FC<PendingApprovalsViewProps> = ({
  currentUser,
  onViewDocument,
  onVerifyDocument,
  canManage,
  onDataChanged,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [quickNote, setQuickNote] = useState('');

  const pendingDocs = hrDocumentService.getPendingDocuments();

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pendingDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingDocs.map((d) => d.id));
    }
  };

  const handleBatchVerify = async () => {
    if (selectedIds.length === 0) return;
    setIsBatchProcessing(true);
    const verifierName = currentUser.name || currentUser.username || 'HR Reviewer';

    selectedIds.forEach((id) => {
      hrDocumentService.verifyDocument(id, verifierName, quickNote || 'Batch approval via verification workstation');
    });

    setSelectedIds([]);
    setQuickNote('');
    setIsBatchProcessing(false);
    onDataChanged();
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Banner */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Antrean Verifikasi Dokumen
            </span>
            <span className="text-xs text-purple-200/60 font-mono">
              {pendingDocs.length} Berkas Menunggu Otorisasi
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Workstation Verifikasi &amp; Validasi Berkas SDM
          </h2>
          <p className="text-xs text-purple-200/70 max-w-xl mt-0.5">
            Periksa kesesuaian berkas identitas, surat izin, sertifikasi kebersihan, dan perjanjian kerja sebelum disahkan secara resmi di sistem.
          </p>
        </div>

        {canManage && pendingDocs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSelectAll}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold transition-all cursor-pointer"
            >
              {selectedIds.length === pendingDocs.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
            </button>
            <button
              onClick={handleBatchVerify}
              disabled={selectedIds.length === 0 || isBatchProcessing}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
                selectedIds.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-600/30 cursor-pointer'
                  : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verifikasi Terpilih ({selectedIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Main List */}
      {pendingDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#130F30]/60 border border-white/10 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Semua Berkas Telah Terverifikasi</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tidak ada dokumen yang menunggu review saat ini. Seluruh berkas masuk telah diproses oleh HR.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDocs.map((doc) => {
            const emp = hrDocumentService.getEmployee(doc.employeeId);
            const cat = hrDocumentService.getCategoryById(doc.documentCategoryId);
            const isSelected = selectedIds.includes(doc.id);

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-3xl border backdrop-blur-2xl transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-400 shadow-purple-950/30'
                    : 'bg-[#130F30]/80 border-white/10 hover:border-purple-500/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {canManage && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(doc.id)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20 cursor-pointer"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            v{doc.version}
                          </span>
                          <h3 className="font-bold text-sm text-white">{doc.documentName}</h3>
                        </div>
                        <p className="text-xs text-purple-200/70 mt-0.5">
                          {emp?.fullName || emp?.name} ({emp?.department} • {emp?.primaryPosition || emp?.role})
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                      PENDING REVIEW
                    </span>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-200/70">
                    <span>Kategori: <strong className="text-white">{cat?.name || doc.documentCategoryId}</strong></span>
                    {doc.documentNumber && (
                      <span>No: <strong className="text-white font-mono">{doc.documentNumber}</strong></span>
                    )}
                    {doc.expiryDate && (
                      <span>Exp: <strong className="text-white font-mono">{doc.expiryDate}</strong></span>
                    )}
                  </div>

                  {doc.description && (
                    <p className="text-[11px] text-gray-300 line-clamp-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      {doc.description}
                    </p>
                  )}

                  <div className="text-[10px] text-gray-400 font-mono">
                    Diupload oleh <strong>{doc.uploadedBy}</strong> pada {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewDocument(doc)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-300" />
                    <span>Lihat Berkas</span>
                  </button>

                  {canManage && (
                    <button
                      onClick={() => onVerifyDocument(doc)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review &amp; Otorisasi</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
