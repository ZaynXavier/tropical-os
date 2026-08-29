/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, HrDocument, HrDocumentVersion } from "../../types";
import { HrDocumentService } from "../../services/hrDocumentService";
import {
  X,
  History,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Upload,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface DocumentVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HrDocument;
  user: User;
  onVersionAdded: () => void;
}

export const DocumentVersionHistoryModal: React.FC<DocumentVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  document,
  user,
  onVersionAdded,
}) => {
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [newVersion, setNewVersion] = useState(() => {
    const currentVer = parseFloat(document.version) || 1.0;
    return (currentVer + 0.1).toFixed(1);
  });
  const [changeSummary, setChangeSummary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const canManageVersions =
    user.role === "MANAGER" ||
    (user.role === "SUPERVISOR" && (!document.target_division || document.target_division === user.division));

  const handleAddVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!changeSummary.trim()) {
      setErrorMsg("Catatan ringkasan perubahan (Change Summary) wajib diisi.");
      return;
    }

    if (!newVersion.trim()) {
      setErrorMsg("Nomor versi baru wajib diisi.");
      return;
    }

    setSubmitting(true);
    let uploadedFileUrl: string | undefined = undefined;
    let uploadedStoragePath: string | undefined = undefined;

    if (file) {
      setIsUploading(true);
      const uploadRes = await HrDocumentService.uploadDocumentFile(file);
      setIsUploading(false);

      if (uploadRes.error) {
        setSubmitting(false);
        setErrorMsg(`Gagal upload berkas versi baru: ${uploadRes.error}`);
        return;
      }

      uploadedFileUrl = uploadRes.url || undefined;
      uploadedStoragePath = uploadRes.path || undefined;
    }

    const res = await HrDocumentService.createDocumentVersion({
      document_id: document.id,
      version: newVersion.trim(),
      change_summary: changeSummary.trim(),
      effective_date: effectiveDate,
      file_url: uploadedFileUrl || document.file_url || undefined,
      storage_path: uploadedStoragePath || document.storage_path || undefined,
    });

    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsAddingVersion(false);
      setChangeSummary("");
      setFile(null);
      onVersionAdded();
    }
  };

  const handleDownloadVersion = (ver: HrDocumentVersion) => {
    if (ver.file_url) {
      HrDocumentService.logDocumentDownload(document.id, `${document.title} (v${ver.version})`);
      window.open(ver.file_url, "_blank");
    }
  };

  const versions = document.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        id="document-version-history-modal"
        className="w-full max-w-2xl my-8 bg-[#120D2C] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/70 via-[#1A143D] to-orange-950/50 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded-md">
                  {document.document_code || "DOC"}
                </span>
                <span className="text-xs text-purple-200/60 font-semibold">Riwayat Versi Dokumen</span>
              </div>
              <h2 className="text-base font-black text-white line-clamp-1">{document.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-white">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add New Version Form (Toggle) */}
          {canManageVersions && (
            <div>
              {!isAddingVersion ? (
                <button
                  type="button"
                  onClick={() => setIsAddingVersion(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Rilis Revisi / Versi Baru Dokumen Ini</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddVersionSubmit}
                  className="p-5 rounded-2xl bg-white/5 border border-amber-500/30 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Form Penerbitan Versi Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingVersion(false)}
                      className="text-xs text-purple-200/60 hover:text-white"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-purple-200/80">Nomor Versi Baru</label>
                      <input
                        type="text"
                        required
                        value={newVersion}
                        onChange={(e) => setNewVersion(e.target.value)}
                        placeholder="Contoh: 1.1 atau 2.0"
                        className="w-full px-3 py-2 rounded-xl bg-[#1A143D] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-purple-200/80">Tanggal Efektif Versi</label>
                      <input
                        type="date"
                        required
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1A143D] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-purple-200/80">
                      Ringkasan Perubahan (Change Summary) <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Contoh: Pembaruan langkah sanitasi deep cleaning chiller & penyesuaian suhu holding."
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A143D] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Upload new file if changed */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-purple-200/80">
                      Upload Berkas Baru (Opsional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="w-full text-xs text-purple-200/80 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingVersion(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || isUploading}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      {submitting || isUploading ? (
                        <span>Menyimpan...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terbitkan Versi v{newVersion}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Version Timeline */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-purple-200/70 uppercase tracking-wider">
              Daftar Riwayat Perubahan Versi
            </div>

            {versions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
                <FileText className="w-8 h-8 text-purple-300/40 mx-auto mb-2" />
                <p className="text-xs text-purple-200/60">
                  Dokumen ini berada pada versi dasar v{document.version}.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {versions.map((ver, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={ver.id || idx} className="relative group animate-fade-in">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isLatest
                            ? "bg-amber-500 border-amber-300 text-black shadow-md shadow-amber-500/30"
                            : "bg-[#1A143D] border-white/20 text-white/50"
                        }`}
                      >
                        <span className="text-[9px] font-black">{isLatest ? "★" : "•"}</span>
                      </div>

                      {/* Content Card */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isLatest
                            ? "bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/40 shadow-lg"
                            : "bg-white/5 border-white/10 opacity-80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 bg-amber-500/20 rounded-md border border-amber-500/30">
                                v{ver.version}
                              </span>
                              {isLatest ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Versi Aktif Saat Ini
                                </span>
                              ) : (
                                <span className="text-[10px] text-purple-200/50 bg-white/5 px-2 py-0.5 rounded-full">
                                  Arsip Riwayat
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white font-medium mt-2 leading-relaxed">
                              {ver.change_summary || "Pembaruan dokumen SOP"}
                            </p>
                          </div>

                          {ver.file_url && (
                            <button
                              type="button"
                              onClick={() => handleDownloadVersion(ver)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Unduh berkas versi ini"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Berkas</span>
                            </button>
                          )}
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-purple-200/60 mt-3 pt-2.5 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400/80" />
                            Efektif: {ver.effective_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-amber-400/80" />
                            Oleh: {ver.creator_name || "HR System"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Tutup Riwayat
          </button>
        </div>
      </div>
    </div>
  );
};
