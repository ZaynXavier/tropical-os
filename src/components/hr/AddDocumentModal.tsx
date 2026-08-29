/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { User, HrDocumentType, HrDocumentStatus } from "../../types";
import { HrDocumentService } from "../../services/hrDocumentService";
import {
  X,
  FileText,
  Upload,
  Calendar,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  Users
} from "lucide-react";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

const DIVISIONS = [
  { id: "WAITER", label: "Waiter & Service" },
  { id: "KITCHEN", label: "Kitchen & Production" },
  { id: "BARISTA", label: "Barista & Beverage" },
  { id: "CASHIER", label: "Kasir & POS" },
  { id: "PURCHASING", label: "Purchasing & Inventory" },
  { id: "DISHWASH_CLEANING", label: "Dishwash & Cleaning" },
  { id: "FINANCE", label: "Finance & Accounting" },
  { id: "CONTENT_CREATOR", label: "Marketing & Creative" },
  { id: "CRM", label: "CRM & Membership" },
];

const ROLES = [
  { id: "STAFF", label: "Staff Pelaksana" },
  { id: "SUPERVISOR", label: "Supervisor / Section Leader" },
  { id: "MANAGER", label: "Manager & HR" },
];

const DOCUMENT_TYPES: { id: HrDocumentType; label: string; desc: string }[] = [
  { id: "SOP", label: "SOP (Standar Operasional Prosedur)", desc: "Prosedur baku langkah kerja operasional" },
  { id: "COMPANY_REGULATION", label: "Peraturan Perusahaan", desc: "Regulasi resmi, tata tertib & kode etik" },
  { id: "JOB_DESK", label: "Job Deskripsi (Job Desc)", desc: "Tugas pokok & wewenang jabatan" },
  { id: "IKA", label: "IKA (Instruksi Kerja Area)", desc: "Petunjuk teknis pengoperasian alat / workstation" },
  { id: "POLICY", label: "Kebijakan Internal (Policy)", desc: "Kebijakan cuti, fasilitas, hygiene & keamanan" },
  { id: "OTHER", label: "Dokumen HR Lainnya", desc: "Formulir resmi, surat edaran, panduan umum" },
];

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const [title, setTitle] = useState("");
  const [documentCode, setDocumentCode] = useState("");
  const [documentType, setDocumentType] = useState<HrDocumentType>("SOP");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState<HrDocumentStatus>(
    user.role === "MANAGER" ? "ACTIVE" : "PENDING_REVIEW"
  );
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [targetScope, setTargetScope] = useState<"ALL" | "DIVISION" | "ROLE">("ALL");
  const [targetDivision, setTargetDivision] = useState(user.role === "SUPERVISOR" ? user.division || "" : "");
  const [targetRole, setTargetRole] = useState("");
  const [changeSummary, setChangeSummary] = useState("Versi perdana rilis dokumen");

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 15 * 1024 * 1024) {
        setErrorMsg("Ukuran file melebihi batas 15MB.");
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
    }
  };

  const generateAutoCode = (type: string, div: string) => {
    const typePrefix = type === "SOP" ? "SOP" : type === "JOB_DESK" ? "JD" : type === "IKA" ? "IKA" : type === "COMPANY_REGULATION" ? "PP" : "DOC";
    const divPrefix = div ? div.substring(0, 3).toUpperCase() : "GEN";
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${typePrefix}-${divPrefix}-${randomNum}`;
  };

  const handleTypeChange = (newType: any) => {
    setDocumentType(newType);
    if (!documentCode) {
      setDocumentCode(generateAutoCode(String(newType), targetDivision));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul dokumen wajib diisi.");
      return;
    }

    if (targetScope === "DIVISION" && !targetDivision) {
      setErrorMsg("Pilih divisi target dokumen.");
      return;
    }

    setSubmitting(true);
    let uploadedFileUrl = externalUrl.trim() || undefined;
    let uploadedStoragePath: string | undefined = undefined;

    // Handle Storage upload if file selected
    if (file) {
      setIsUploading(true);
      const uploadRes = await HrDocumentService.uploadDocumentFile(file);
      setIsUploading(false);

      if (uploadRes.error) {
        setSubmitting(false);
        setErrorMsg(`Upload gagal: ${uploadRes.error}`);
        return;
      }

      uploadedFileUrl = uploadRes.url || undefined;
      uploadedStoragePath = uploadRes.path || undefined;
    }

    const res = await HrDocumentService.createDocument({
      title: title.trim(),
      document_code: documentCode.trim() || generateAutoCode(documentType, targetDivision),
      document_type: documentType,
      description: description.trim() || undefined,
      file_url: uploadedFileUrl,
      storage_path: uploadedStoragePath,
      version: version.trim() || "1.0",
      status: status,
      effective_date: effectiveDate,
      expiry_date: expiryDate || undefined,
      is_active: status === "ACTIVE",
      target_division: targetScope === "DIVISION" ? targetDivision : null,
      target_role: targetScope === "ROLE" ? targetRole : null,
      change_summary: changeSummary.trim(),
    });

    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        id="add-document-modal"
        className="w-full max-w-3xl my-8 bg-[#120D2C] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/70 via-[#1A143D] to-orange-950/50 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Tambah Dokumen HR &amp; SOP</h2>
              <p className="text-xs text-purple-200/70">
                Daftarkan Peraturan, SOP, Job Desk, atau IKA baru ke repositori resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-white">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Metadata Dasar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <FileCheck className="w-4 h-4" /> Informasi Utama Dokumen
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">
                  Judul Dokumen <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SOP Pembukaan & Sanitasi Kitchen Siang"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">Kode Dokumen</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SOP-KIT-001"
                    value={documentCode}
                    onChange={(e) => setDocumentCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setDocumentCode(generateAutoCode(documentType, targetDivision))}
                    className="px-2.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold whitespace-nowrap"
                    title="Generate kode otomatis"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-200/90">
                Kategori / Tipe Dokumen <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DOCUMENT_TYPES.map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => handleTypeChange(dt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      documentType === dt.id
                        ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{dt.label}</div>
                    <div className="text-[10px] text-purple-200/60 mt-0.5 line-clamp-1">{dt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-200/90">Ringkasan &amp; Deskripsi Cakupan</label>
              <textarea
                rows={2}
                placeholder="Jelaskan ringkas tujuan dokumen, cakupan prosedur, atau poin kepatuhan wajib..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 2: Target Audience & Scope */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Users className="w-4 h-4" /> Ruang Lingkup &amp; Sasaran Dokumen
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetScope("ALL");
                  setTargetDivision("");
                  setTargetRole("");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetScope === "ALL"
                    ? "bg-amber-500/20 border-amber-500 text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  Perusahaan (Umum)
                </div>
                <div className="text-[10px] text-purple-200/60 mt-1">Berlaku untuk seluruh divisi &amp; staf</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope("DIVISION")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetScope === "DIVISION"
                    ? "bg-amber-500/20 border-amber-500 text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Spesifik Divisi
                </div>
                <div className="text-[10px] text-purple-200/60 mt-1">Hanya divisi operasional tertentu</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope("ROLE")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetScope === "ROLE"
                    ? "bg-amber-500/20 border-amber-500 text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Spesifik Role / Jabatan
                </div>
                <div className="text-[10px] text-purple-200/60 mt-1">Level Staff, SPV, atau Manager</div>
              </button>
            </div>

            {targetScope === "DIVISION" && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-fade-in">
                <label className="text-xs font-semibold text-purple-200/90">Pilih Divisi Operasional Target</label>
                <select
                  value={targetDivision}
                  onChange={(e) => setTargetDivision(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Pilih Divisi --</option>
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === "ROLE" && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-fade-in">
                <label className="text-xs font-semibold text-purple-200/90">Pilih Tingkat Jabatan Target</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Pilih Role --</option>
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 3: Masa Berlaku & Versi */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" /> Versi &amp; Masa Berlaku
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">Nomor Versi</label>
                <input
                  type="text"
                  placeholder="1.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">Status Awal</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as HrDocumentStatus)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {user.role === "MANAGER" && <option value="ACTIVE">ACTIVE (Langsung Terbit)</option>}
                  <option value="PENDING_REVIEW">PENDING_REVIEW (Ajukan Review)</option>
                  <option value="DRAFT">DRAFT (Konsep Internal)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">Tanggal Efektif</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-200/90">Masa Berlaku (Opsional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-200/90">Catatan Perubahan Versi (Audit)</label>
              <input
                type="text"
                placeholder="Rilis standar operasional prosedur baru"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 4: File Attachment */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Upload className="w-4 h-4" /> Lampiran Berkas Dokumen (Digital Storage)
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                file
                  ? "bg-amber-500/10 border-amber-500/50 text-white"
                  : "bg-white/5 border-white/15 hover:border-amber-400/50 hover:bg-white/10 text-purple-200/70"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-white">{file.name}</p>
                    <p className="text-xs text-amber-400 font-mono">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Siap diunggah ke hr-documents
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-white">Klik atau Tarik File ke Sini</p>
                    <p className="text-xs text-purple-200/60 mt-1">
                      Mendukung PDF, Word (.docx), Excel (.xlsx), atau Gambar (Maks 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-200/70">
                Atau Tautan Eksternal (Google Docs, Drive, PDF Web)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || isUploading}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting || isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isUploading ? "Mengunggah Berkas..." : "Menyimpan Dokumen..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan &amp; Terbitkan Dokumen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
