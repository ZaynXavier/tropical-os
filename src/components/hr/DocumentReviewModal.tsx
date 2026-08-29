/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, HrDocument } from "../../types";
import { HrDocumentService } from "../../services/hrDocumentService";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Archive,
  Send,
  AlertCircle
} from "lucide-react";

export type DocumentWorkflowAction = "SUBMIT" | "APPROVE" | "REJECT" | "ACTIVATE" | "ARCHIVE";

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HrDocument;
  action: DocumentWorkflowAction;
  user: User;
  onSuccess: () => void;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  isOpen,
  onClose,
  document,
  action,
  user,
  onSuccess,
}) => {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const actionConfig = {
    SUBMIT: {
      title: "Ajukan Review Dokumen",
      desc: "Kirimkan dokumen ke Supervisor/Manager untuk ditinjau dan divalidasi standarnya.",
      icon: Send,
      color: "from-blue-600 to-indigo-600",
      btnText: "Kirim Pengajuan Review",
      requireNotes: false,
      placeholderNotes: "Tuliskan poin penting yang perlu ditinjau jika ada...",
    },
    APPROVE: {
      title: "Setujui Dokumen (Approve)",
      desc: "Menyetujui dokumen SOP/Regulasi ini. Dokumen akan siap diterbitkan (Active).",
      icon: CheckCircle2,
      color: "from-emerald-600 to-teal-600",
      btnText: "Setujui Dokumen",
      requireNotes: false,
      placeholderNotes: "Catatan persetujuan (opsional)...",
    },
    REJECT: {
      title: "Tolak Dokumen (Reject to Draft)",
      desc: "Kembalikan dokumen ke status Draft untuk direvisi oleh pembuat dokumen.",
      icon: XCircle,
      color: "from-rose-600 to-red-600",
      btnText: "Tolak & Minta Revisi",
      requireNotes: true,
      placeholderNotes: "Jelaskan alasan penolakan dan instruksi revisi wajib...",
    },
    ACTIVATE: {
      title: "Terbitkan & Aktifkan Dokumen",
      desc: "Mengubah status dokumen menjadi ACTIVE sehingga langsung berlaku untuk staf terkait.",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      btnText: "Aktifkan Dokumen",
      requireNotes: false,
      placeholderNotes: "Catatan rilis...",
    },
    ARCHIVE: {
      title: "Arsipkan Dokumen",
      desc: "Mengarsipkan dokumen karena digantikan standar baru atau masa berlaku berakhir.",
      icon: Archive,
      color: "from-purple-600 to-slate-700",
      btnText: "Arsipkan Dokumen",
      requireNotes: false,
      placeholderNotes: "Alasan pengarsipan...",
    },
  }[action];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (actionConfig.requireNotes && !notes.trim()) {
      setErrorMsg("Catatan alasan penolakan/revisi wajib diisi.");
      return;
    }

    setSubmitting(true);
    let res: { success: boolean; error: string | null } = { success: false, error: null };

    switch (action) {
      case "SUBMIT":
        res = await HrDocumentService.submitForReview(document.id, notes);
        break;
      case "APPROVE":
        res = await HrDocumentService.approveDocument(document.id, notes);
        break;
      case "REJECT":
        res = await HrDocumentService.rejectDocument(document.id, notes);
        break;
      case "ACTIVATE":
        res = await HrDocumentService.activateDocument(document.id);
        break;
      case "ARCHIVE":
        res = await HrDocumentService.archiveDocument(document.id, notes);
        break;
    }

    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  const IconComp = actionConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="document-review-modal"
        className="w-full max-w-lg bg-[#120D2C] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-white"
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${actionConfig.color} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{actionConfig.title}</h2>
              <p className="text-xs text-white/80 line-clamp-1">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-purple-200/80 leading-relaxed">{actionConfig.desc}</p>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[10px] text-purple-200/60 font-mono">DOKUMEN TARGET:</div>
            <div className="text-xs font-bold text-white line-clamp-1">{document.title}</div>
            <div className="text-[11px] text-amber-400 font-mono">
              {document.document_code || "DOC"} • Versi {document.version} • {document.document_type}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200/90">
              Catatan / Instruksi {actionConfig.requireNotes && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              rows={3}
              required={actionConfig.requireNotes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={actionConfig.placeholderNotes}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A143D] border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{actionConfig.btnText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
