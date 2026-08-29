/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, HrDocument, ChecklistTemplate, KpiTemplate } from "../../types";
import { HrDocumentService } from "../../services/hrDocumentService";
import { DocumentReviewModal, DocumentWorkflowAction } from "./DocumentReviewModal";
import { DocumentVersionHistoryModal } from "./DocumentVersionHistoryModal";
import {
  X,
  FileText,
  Download,
  Calendar,
  Layers,
  Shield,
  CheckCircle2,
  AlertTriangle,
  History,
  Send,
  XCircle,
  Archive,
  Trash2,
  ExternalLink,
  CheckSquare,
  Award,
  Building,
  User as UserIcon,
  Clock,
  FileCheck
} from "lucide-react";

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  user: User;
  onDocumentMutated: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  documentId,
  user,
  onDocumentMutated,
}) => {
  const [doc, setDoc] = useState<HrDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Linked Operational Entities
  const [relatedChecklists, setRelatedChecklists] = useState<ChecklistTemplate[]>([]);
  const [relatedKpis, setRelatedKpis] = useState<KpiTemplate[]>([]);

  // Sub-Modals
  const [workflowAction, setWorkflowAction] = useState<DocumentWorkflowAction | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const loadDocumentDetails = async () => {
    if (!documentId) return;
    setLoading(true);
    setErrorMsg(null);

    const [docRes, clRes, kpiRes] = await Promise.all([
      HrDocumentService.getDocumentById(documentId),
      HrDocumentService.getRelatedChecklists(documentId),
      HrDocumentService.getRelatedKpis(documentId),
    ]);

    if (docRes.error) {
      setErrorMsg(docRes.error);
    } else {
      setDoc(docRes.data);
    }

    setRelatedChecklists(clRes.data || []);
    setRelatedKpis(kpiRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadDocumentDetails();
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const isManager = user.role === "MANAGER";
  const isSupervisor =
    user.role === "SUPERVISOR" && (!doc?.target_division || doc?.target_division === user.division);
  const canManage = isManager || isSupervisor;

  const handleDownload = () => {
    if (doc?.file_url) {
      HrDocumentService.logDocumentDownload(doc.id, doc.title);
      window.open(doc.file_url, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!doc || !isManager) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus permanen dokumen "${doc.title}"?`)) return;

    const res = await HrDocumentService.deleteDocument(doc.id);
    if (res.error) {
      alert(`Gagal menghapus dokumen: ${res.error}`);
    } else {
      onDocumentMutated();
      onClose();
    }
  };

  const getStatusBadge = (status: string, isExpired?: boolean) => {
    if (isExpired) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> EXPIRED (Kedaluwarsa)
        </span>
      );
    }

    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE (Berlaku Resmi)
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED (Disetujui)
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> PENDING REVIEW
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-purple-200/80 border border-white/20 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> DRAFT (Konsep)
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5" /> ARCHIVED (Diarsipkan)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div
          id="document-detail-modal"
          className="w-full max-w-4xl my-8 bg-[#120D2C] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-amber-950/70 via-[#1A143D] to-orange-950/50 border-b border-amber-500/20 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-black text-amber-300 px-2.5 py-0.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                    {doc?.document_code || "DOC-SOP"}
                  </span>
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 bg-white/10 rounded-lg">
                    v{doc?.version || "1.0"}
                  </span>
                  <span className="text-[11px] font-bold text-purple-200/80 px-2 py-0.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    {doc?.document_type}
                  </span>
                  {doc && getStatusBadge(doc.status, doc.is_expired)}
                </div>
                <h1 className="text-xl font-black text-white mt-1.5 leading-snug">
                  {doc?.title || "Memuat Dokumen..."}
                </h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-purple-200/60 font-mono">Mengambil data dokumen dan relasi operasional...</p>
              </div>
            ) : errorMsg || !doc ? (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-400" />
                <span>{errorMsg || "Dokumen tidak ditemukan atau tidak memiliki hak akses."}</span>
              </div>
            ) : (
              <>
                {/* Expired / Revision Notice */}
                {doc.is_expired && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                    <div>
                      <strong className="block font-bold">Masa Berlaku Dokumen Berakhir (Expired)</strong>
                      <span>
                        Dokumen ini melewati batas berlaku pada {doc.expiry_date}. Harap terbitkan versi revisi
                        baru atau lakukan perpanjangan persetujuan.
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Ringkasan &amp; Ruang Lingkup Prosedur
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {doc.description || "Tidak ada deskripsi rinci untuk dokumen ini."}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-purple-200/60 font-mono flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-400" /> TARGET SASARAN
                    </div>
                    <div className="text-xs font-bold text-white">
                      {doc.target_division ? `Divisi ${doc.target_division}` : "Seluruh Perusahaan"}
                    </div>
                    <div className="text-[10px] text-purple-200/60">
                      {doc.target_role ? `Role ${doc.target_role}` : "Semua Jabatan"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-purple-200/60 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> TANGGAL EFEKTIF
                    </div>
                    <div className="text-xs font-bold text-white">{doc.effective_date}</div>
                    <div className="text-[10px] text-purple-200/60">
                      Kedaluwarsa: {doc.expiry_date || "Permanen"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-purple-200/60 font-mono flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" /> PENYUSUN DOKUMEN
                    </div>
                    <div className="text-xs font-bold text-white">{doc.creator_name || "HR Admin"}</div>
                    <div className="text-[10px] text-purple-200/60 font-mono">
                      Dibuat: {doc.created_at?.split("T")[0]}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-purple-200/60 font-mono flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" /> PENINJAU / APPROVER
                    </div>
                    <div className="text-xs font-bold text-white">
                      {doc.reviewer_name || (doc.status === "ACTIVE" ? "Management" : "Belum Direview")}
                    </div>
                    <div className="text-[10px] text-purple-200/60 font-mono">
                      {doc.reviewed_at ? doc.reviewed_at.split("T")[0] : "-"}
                    </div>
                  </div>
                </div>

                {/* Review Notes (if present) */}
                {doc.review_notes && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Catatan Review &amp; Validasi
                    </div>
                    <p className="text-xs text-amber-100 italic leading-relaxed">
                      &quot;{doc.review_notes}&quot;
                    </p>
                  </div>
                )}

                {/* File Attachment Action Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1A143D] to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Berkas Resmi Dokumen (Versi v{doc.version})</div>
                      <p className="text-[11px] text-purple-200/70 mt-0.5">
                        {doc.file_url ? "Tersedia di Penyimpanan Digital Dokumen" : "Belum ada lampiran berkas digital"}
                      </p>
                    </div>
                  </div>

                  {doc.file_url ? (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Buka / Unduh Berkas</span>
                    </button>
                  ) : (
                    <span className="text-xs text-purple-200/50 italic">Tidak ada berkas terlampir</span>
                  )}
                </div>

                {/* Related Operational Relations: Checklist & KPI Preparation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Checklist Relation */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" /> Checklist Terkait
                      </div>
                      <span className="text-[10px] text-purple-200/60 font-mono">
                        {relatedChecklists.length} Template
                      </span>
                    </div>

                    {relatedChecklists.length === 0 ? (
                      <p className="text-xs text-purple-200/50 italic py-2">
                        Belum ada template checklist operasional yang terhubung dengan dokumen SOP ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {relatedChecklists.map((cl) => (
                          <div
                            key={cl.id}
                            className="p-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white">{cl.title}</span>
                              <div className="text-[10px] text-purple-200/60 mt-0.5 font-mono">
                                Shift: {cl.shift_type} • Divisi {cl.division}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Linked
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* KPI Relation */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" /> KPI Template Terkait
                      </div>
                      <span className="text-[10px] text-purple-200/60 font-mono">
                        {relatedKpis.length} Template
                      </span>
                    </div>

                    {relatedKpis.length === 0 ? (
                      <p className="text-xs text-purple-200/50 italic py-2">
                        Belum ada matriks indikator KPI yang menggunakan dokumen ini sebagai acuan penilaian.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {relatedKpis.map((kpi) => (
                          <div
                            key={kpi.id}
                            className="p-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white">{kpi.title}</span>
                              <div className="text-[10px] text-purple-200/60 mt-0.5 font-mono">
                                Posisi: {kpi.position || "Semua"} • Periode {kpi.period_type}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                              Linked
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Version History Quick Preview */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Riwayat Versi &amp; Audit Dokumen</div>
                      <p className="text-[10px] text-purple-200/60">
                        {doc.versions?.length || 1} Versi terdaftar • Seluruh perubahan tercatat immutable
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVersionModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Lihat / Tambah Versi</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Action Bar (RBAC Guided) */}
          {doc && (
            <div className="p-4 bg-white/5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isManager && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              {/* Workflow Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Submit for Review (if DRAFT) */}
                {doc.status === "DRAFT" && canManage && (
                  <button
                    type="button"
                    onClick={() => setWorkflowAction("SUBMIT")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ajukan Review</span>
                  </button>
                )}

                {/* Approve & Reject (if PENDING_REVIEW and Supervisor/Manager) */}
                {doc.status === "PENDING_REVIEW" && canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setWorkflowAction("REJECT")}
                      className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak (Revisi)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowAction("APPROVE")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui (Approve)</span>
                    </button>
                  </>
                )}

                {/* Activate (if APPROVED and Supervisor/Manager) */}
                {doc.status === "APPROVED" && canManage && (
                  <button
                    type="button"
                    onClick={() => setWorkflowAction("ACTIVATE")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terbitkan (Aktifkan)</span>
                  </button>
                )}

                {/* Archive (if ACTIVE and canManage) */}
                {doc.status === "ACTIVE" && canManage && (
                  <button
                    type="button"
                    onClick={() => setWorkflowAction("ARCHIVE")}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Arsipkan</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Modal: Workflow Review/Approval Modal */}
      {workflowAction && doc && (
        <DocumentReviewModal
          isOpen={true}
          onClose={() => setWorkflowAction(null)}
          document={doc}
          action={workflowAction}
          user={user}
          onSuccess={() => {
            loadDocumentDetails();
            onDocumentMutated();
          }}
        />
      )}

      {/* Sub-Modal: Version History Modal */}
      {isVersionModalOpen && doc && (
        <DocumentVersionHistoryModal
          isOpen={true}
          onClose={() => setIsVersionModalOpen(false)}
          document={doc}
          user={user}
          onVersionAdded={() => {
            loadDocumentDetails();
            onDocumentMutated();
          }}
        />
      )}
    </>
  );
};
