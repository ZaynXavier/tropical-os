/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — HR Document Dashboard & Compliance Overview
 */

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileCheck,
  FolderOpen,
  XCircle,
  Upload,
} from 'lucide-react';
import { DocumentComplianceSummary, HRDocument } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';

interface HRDocumentDashboardViewProps {
  summary: DocumentComplianceSummary;
  onNavigateTab?: (tabId: string, params?: any) => void;
  onOpenUploadModal: () => void;
  onVerifyDocument: (doc: HRDocument) => void;
  onViewDocument: (doc: HRDocument) => void;
  canManage: boolean;
}

export const HRDocumentDashboardView: React.FC<HRDocumentDashboardViewProps> = ({
  summary,
  onNavigateTab,
  onOpenUploadModal,
  onVerifyDocument,
  onViewDocument,
  canManage,
}) => {
  const pendingDocs = hrDocumentService.getPendingDocuments();
  const expiringDocs = hrDocumentService.getExpiringSoonDocuments(14);
  const expiredDocs = hrDocumentService.getExpiredDocuments();

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* 1. Attention Center Alerts Banner (Critical & High) */}
      {(summary?.attentionAlerts || []).length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Pusat Perhatian Dokumen HR (Attention Center)</span>
            </span>
            <span className="text-[10px] text-gray-400">
              {(summary?.attentionAlerts || []).length} Peringatan Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(summary?.attentionAlerts || []).slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigateTab?.(alert.targetSubView || 'expirations')}
                className={`p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between space-y-2 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400 shadow-lg shadow-rose-950/20'
                    : alert.severity === 'HIGH'
                    ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/20'
                    : 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{alert.title}</h4>
                  <p className="text-[11px] text-gray-300 line-clamp-2 mt-0.5">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Key Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tingkat Kepatuhan (Compliance Rate) */}
        <div
          onClick={() => onNavigateTab?.('directory')}
          className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              TINGKAT KEPATUHAN SDM
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.complianceRate}%</span>
              <span className="text-xs text-emerald-400 font-bold">Lengkap</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
            <span className="text-gray-400 font-medium">
              {summary.completeEmployeesCount} dari {summary.totalEmployees} Karyawan
            </span>
            <span className="text-purple-300 text-[10px] font-bold group-hover:underline">Lihat Detail →</span>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div
          onClick={() => onNavigateTab?.('approvals')}
          className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              MENUNGGU VERIFIKASI
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.pendingReviewCount}</span>
              <span className="text-xs text-blue-300 font-bold">Berkas</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
            <span className="text-gray-400 font-medium">Membutuhkan validasi HR</span>
            <span className="text-blue-300 text-[10px] font-bold group-hover:underline">Review →</span>
          </div>
        </div>

        {/* Card 3: Segera Kedaluwarsa (<= 30 Hari) */}
        <div
          onClick={() => onNavigateTab?.('expirations')}
          className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              SEGERA BERAKHIR (&le;30H)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.expiringSoonCount}</span>
              <span className="text-xs text-amber-300 font-bold">Dokumen</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
            <span className="text-gray-400 font-medium">Termasuk kontrak &amp; sertifikat</span>
            <span className="text-amber-300 text-[10px] font-bold group-hover:underline">Pantau →</span>
          </div>
        </div>

        {/* Card 4: Dokumen Kedaluwarsa (Expired) */}
        <div
          onClick={() => onNavigateTab?.('expirations')}
          className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:border-rose-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              KEDALUWARSA (EXPIRED)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.expiredCount}</span>
              <span className="text-xs text-rose-400 font-bold">Harus Diperbarui</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
            <span className="text-gray-400 font-medium">Tindakan segera diperlukan</span>
            <span className="text-rose-300 text-[10px] font-bold group-hover:underline">Perbarui →</span>
          </div>
        </div>
      </div>

      {/* 3. Two Columns: Pending Approval Queue & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Antrean Verifikasi Dokumen Masuk (7 cols) */}
        <div className="lg:col-span-7 bg-[#130F30]/80 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <span>Antrean Verifikasi Berkas Masuk</span>
              </h3>
              <p className="text-xs text-purple-200/70">
                Pemeriksaan keabsahan dokumen yang diunggah oleh staf operasional
              </p>
            </div>
            {canManage && (
              <button
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Dokumen</span>
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
            {pendingDocs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-gray-200">Semua Berkas Telah Terverifikasi</p>
                <p className="text-[11px] text-gray-400">Tidak ada dokumen tertunda yang membutuhkan review saat ini.</p>
              </div>
            ) : (
              pendingDocs.map((doc) => {
                const emp = hrDocumentService.getEmployee(doc.employeeId);
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          PENDING
                        </span>
                        <h4 className="text-xs font-black text-white">{doc.documentName}</h4>
                      </div>
                      <p className="text-[11px] text-gray-300">
                        {emp?.fullName || emp?.name} • <span className="text-purple-300">{emp?.department}</span> ({emp?.primaryPosition || emp?.role})
                      </p>
                      <div className="text-[10px] text-gray-400">
                        Diupload: {new Date(doc.uploadedAt).toLocaleDateString('id-ID')} oleh {doc.uploadedBy}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        Lihat
                      </button>
                      {canManage && (
                        <button
                          onClick={() => onVerifyDocument(doc)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Distribusi Kategori Dokumen (5 cols) */}
        <div className="lg:col-span-5 bg-[#130F30]/80 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-400" />
                <span>Distribusi Kategori Dokumen</span>
              </h3>
              <p className="text-xs text-purple-200/70">Cakupan 13 kategori master berkas kepegawaian</p>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
            {summary.categoryDistribution.map((cat) => {
              const pct =
                summary.totalDocuments > 0
                  ? Math.round((cat.totalDocuments / summary.totalDocuments) * 100)
                  : 0;
              return (
                <div key={cat.categoryId} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{cat.categoryName}</span>
                    <span className="text-[11px] font-mono text-purple-300">
                      {cat.totalDocuments} Berkas ({cat.verifiedCount} Valid)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct * 2, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
