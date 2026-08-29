/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — HR Document Management Master Container View
 * Integrates Compliance Dashboard, Employee Directory, Master Document Repository,
 * Expiration Tracking, and Verification Workflow.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FolderOpen,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { User as AuthUser } from '../../../types';
import { HRDocument, DocumentComplianceSummary } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { HRDocumentDashboardView } from './HRDocumentDashboardView';
import { EmployeeDocumentDirectoryView } from './EmployeeDocumentDirectoryView';
import { MasterDocumentListView } from './MasterDocumentListView';
import { ExpirationTrackerView } from './ExpirationTrackerView';
import { PendingApprovalsView } from './PendingApprovalsView';
import { UploadHRDocumentModal } from './UploadHRDocumentModal';
import { HRDocumentViewerModal } from './HRDocumentViewerModal';
import { DocumentVerificationModal } from './DocumentVerificationModal';
import { DocumentArchiveModal } from './DocumentArchiveModal';
import { EmployeeDocumentDetailModal } from './EmployeeDocumentDetailModal';

export type HRDocTab = 'dashboard' | 'directory' | 'master' | 'expirations' | 'approvals';

interface HRDocumentManagementViewProps {
  currentUser?: AuthUser;
}

export const HRDocumentManagementView: React.FC<HRDocumentManagementViewProps> = ({ currentUser }) => {
  // Default mock user if not supplied
  const activeUser: AuthUser = currentUser || {
    id: 'emp-02',
    name: 'Budi Santoso',
    username: 'budi.manager',
    role: 'MANAGER',
    department: 'Management',
  };

  const [activeTab, setActiveTab] = useState<HRDocTab>('dashboard');
  const [summary, setSummary] = useState<DocumentComplianceSummary>(hrDocumentService.getComplianceSummary());
  const [refreshKey, setRefreshKey] = useState(0);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetEmployeeId, setUploadTargetEmployeeId] = useState<string | undefined>(undefined);
  const [uploadTargetDocTypeId, setUploadTargetDocTypeId] = useState<string | undefined>(undefined);
  const [editingDocument, setEditingDocument] = useState<HRDocument | null>(null);

  const [viewingDoc, setViewingDoc] = useState<HRDocument | null>(null);
  const [verifyingDoc, setVerifyingDoc] = useState<HRDocument | null>(null);
  const [archivingDoc, setArchivingDoc] = useState<HRDocument | null>(null);
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);

  const canManage =
    (activeUser as any).role === 'OWNER' ||
    (activeUser as any).role === 'MANAGER' ||
    (activeUser as any).role === 'SUPERVISOR' ||
    (activeUser as any).accessLevel === 'OWNER' ||
    (activeUser as any).accessLevel === 'MANAGER' ||
    (activeUser as any).accessLevel === 'SUPERVISOR';

  const refreshData = () => {
    setSummary(hrDocumentService.getComplianceSummary());
    setRefreshKey((prev) => prev + 1);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data berkas HR ke data bawaan simulasi?')) {
      hrDocumentService.resetToDefaults();
      refreshData();
      showToast('success', 'Basis data dokumen HR berhasil direset ke konfigurasi awal.');
    }
  };

  const handleOpenUpload = (employeeId?: string, docTypeId?: string) => {
    setEditingDocument(null);
    setUploadTargetEmployeeId(employeeId);
    setUploadTargetDocTypeId(docTypeId);
    setIsUploadModalOpen(true);
  };

  const handleOpenNewVersion = (doc: HRDocument) => {
    setEditingDocument(doc);
    setUploadTargetEmployeeId(doc.employeeId);
    setUploadTargetDocTypeId(doc.documentTypeId);
    setIsUploadModalOpen(true);
  };

  const pendingCount = summary.pendingReviewCount;
  const expiredCount = summary.expiredCount;

  return (
    <div className="space-y-6 animate-fade-in text-white" key={refreshKey}>
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#130F30] to-indigo-950/70 border border-purple-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 text-white flex items-center justify-center shadow-xl shadow-purple-900/30 flex-shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                Phase 2C.8 HR Document Management
              </span>
              <span className="text-xs text-purple-200/60 font-mono hidden sm:inline">
                Arsip Digital, Kontrak &amp; Sertifikasi
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Manajemen Dokumen &amp; Berkas Kepegawaian
            </h1>
            <p className="text-xs text-purple-200/70 max-w-2xl">
              Pusat administrasi berkas 24 karyawan Tropical Garden Resto: KTP, KK, NPWP, BPJS, Kontrak PKWT, Sertifikasi Higiene &amp; Sanitasi, serta audit kepatuhan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 self-end md:self-center">
          <button
            onClick={handleResetData}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Data Simulasi Dokumen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              onClick={() => handleOpenUpload()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Unggah Dokumen</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ringkasan &amp; Kepatuhan</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direktori Karyawan</span>
          </button>

          <button
            onClick={() => setActiveTab('master')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'master'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Pusat Berkas Master</span>
          </button>

          <button
            onClick={() => setActiveTab('expirations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'expirations'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Pantau Kedaluwarsa</span>
            {expiredCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white">
                {expiredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>Antrean Verifikasi</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {activeTab === 'dashboard' && (
        <HRDocumentDashboardView
          summary={summary}
          onNavigateTab={(tab) => setActiveTab(tab as HRDocTab)}
          onOpenUploadModal={() => handleOpenUpload()}
          onVerifyDocument={(doc) => setVerifyingDoc(doc)}
          onViewDocument={(doc) => setViewingDoc(doc)}
          canManage={canManage}
        />
      )}

      {activeTab === 'directory' && (
        <EmployeeDocumentDirectoryView
          onSelectEmployee={(empId) => setDetailEmployeeId(empId)}
          onOpenUploadForEmployee={(empId) => handleOpenUpload(empId)}
          canManage={canManage}
        />
      )}

      {activeTab === 'master' && (
        <MasterDocumentListView
          currentUser={activeUser}
          onOpenUploadModal={() => handleOpenUpload()}
          onViewDocument={(doc) => setViewingDoc(doc)}
          onVerifyDocument={(doc) => setVerifyingDoc(doc)}
          onArchiveDocument={(doc) => setArchivingDoc(doc)}
          onVersionDocument={(doc) => handleOpenNewVersion(doc)}
          canManage={canManage}
          onDataChanged={refreshData}
        />
      )}

      {activeTab === 'expirations' && (
        <ExpirationTrackerView
          currentUser={activeUser}
          onViewDocument={(doc) => setViewingDoc(doc)}
          onVersionDocument={(doc) => handleOpenNewVersion(doc)}
          onArchiveDocument={(doc) => setArchivingDoc(doc)}
          canManage={canManage}
        />
      )}

      {activeTab === 'approvals' && (
        <PendingApprovalsView
          currentUser={activeUser}
          onViewDocument={(doc) => setViewingDoc(doc)}
          onVerifyDocument={(doc) => setVerifyingDoc(doc)}
          canManage={canManage}
          onDataChanged={refreshData}
        />
      )}

      {/* MODALS */}
      {/* 1. Upload & Edit Modal */}
      {isUploadModalOpen && (
        <UploadHRDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={(doc) => {
            refreshData();
            showToast('success', `Dokumen "${doc.documentName}" berhasil disimpan.`);
          }}
          currentUser={activeUser}
          defaultEmployeeId={uploadTargetEmployeeId}
          defaultDocumentTypeId={uploadTargetDocTypeId}
          editingDocument={editingDocument}
        />
      )}

      {/* 2. Viewer Modal */}
      {viewingDoc && (
        <HRDocumentViewerModal
          isOpen={true}
          onClose={() => setViewingDoc(null)}
          document={viewingDoc}
          onVerifyClick={(doc) => {
            setViewingDoc(null);
            setVerifyingDoc(doc);
          }}
          onNewVersionClick={(doc) => {
            setViewingDoc(null);
            handleOpenNewVersion(doc);
          }}
          canManage={canManage}
        />
      )}

      {/* 3. Verification & Approval Modal */}
      {verifyingDoc && (
        <DocumentVerificationModal
          isOpen={true}
          onClose={() => setVerifyingDoc(null)}
          document={verifyingDoc}
          currentUser={activeUser}
          onSuccess={(doc) => {
            refreshData();
            showToast(
              'success',
              doc.status === 'VERIFIED'
                ? `Dokumen "${doc.documentName}" berhasil diverifikasi.`
                : `Dokumen "${doc.documentName}" telah ditolak dengan catatan evaluasi.`
            );
          }}
        />
      )}

      {/* 4. Archive Modal */}
      {archivingDoc && (
        <DocumentArchiveModal
          isOpen={true}
          onClose={() => setArchivingDoc(null)}
          document={archivingDoc}
          currentUser={activeUser}
          onSuccess={(doc) => {
            refreshData();
            showToast('success', `Dokumen "${doc.documentName}" berhasil dipindahkan ke arsip.`);
          }}
        />
      )}

      {/* 5. Employee Document Detail Modal */}
      {detailEmployeeId && (
        <EmployeeDocumentDetailModal
          isOpen={true}
          onClose={() => setDetailEmployeeId(null)}
          employeeId={detailEmployeeId}
          currentUser={activeUser}
          onUploadForEmployee={(empId, docTypeId) => handleOpenUpload(empId, docTypeId)}
          onViewDocument={(doc) => setViewingDoc(doc)}
          onVerifyDocument={(doc) => setVerifyingDoc(doc)}
          onArchiveDocument={(doc) => setArchivingDoc(doc)}
          onVersionDocument={(doc) => handleOpenNewVersion(doc)}
          canManage={canManage}
        />
      )}
    </div>
  );
};
