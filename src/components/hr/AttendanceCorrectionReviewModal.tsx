/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, AttendanceCorrection } from "../../types";
import { AttendanceCorrectionService } from "../../lib/supabase";
import { X, CheckCircle, XCircle, Clock, Calendar, UserCheck, AlertCircle } from "lucide-react";

interface AttendanceCorrectionReviewModalProps {
  user: User;
  correction: AttendanceCorrection;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceCorrectionReviewModal: React.FC<AttendanceCorrectionReviewModalProps> = ({
  user,
  correction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!confirm(`Konfirmasi setujui permohonan koreksi absensi untuk ${correction.employee_name || 'karyawan'}? Catatan absensi akan otomatis diperbarui.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    const res = await AttendanceCorrectionService.reviewCorrection(correction.id, "APPROVED");
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Permohonan koreksi absensi telah disetujui.");
    onSuccess();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await AttendanceCorrectionService.reviewCorrection(correction.id, "REJECTED", rejectionReason);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Permohonan koreksi absensi telah ditolak.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A071E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Review Koreksi Absensi</h3>
              <p className="text-xs text-purple-200/70">{correction.employee_name} • {correction.division}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-[#080519] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Tanggal Absensi</span>
                <span className="font-bold text-white text-sm">{correction.date}</span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Tipe Koreksi</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {correction.correction_type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Usulan Jam Masuk</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">
                  {correction.proposed_clock_in || "-"}
                </span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Usulan Jam Pulang</span>
                <span className="font-mono font-bold text-purple-300 text-sm">
                  {correction.proposed_clock_out || "-"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-purple-300/60 block text-[10px] font-bold uppercase mb-1">Alasan Pengajuan Karyawan</span>
              <p className="text-purple-100 bg-white/5 p-3 rounded-xl border border-white/10 font-medium">
                "{correction.reason}"
              </p>
            </div>

            {correction.attachment_url && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase mb-1">Lampiran Bukti</span>
                <a
                  href={correction.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 underline font-medium hover:text-cyan-200"
                >
                  Buka Lampiran / Bukti Foto
                </a>
              </div>
            )}
          </div>

          {/* Rejection input toggle */}
          {showRejectInput && (
            <div className="space-y-1.5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in">
              <label className="block text-red-300 font-bold">Alasan Penolakan *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="Tuliskan alasan penolakan untuk karyawan..."
                className="w-full bg-[#080519] border border-red-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-400 text-xs"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-purple-200 rounded-2xl font-bold transition cursor-pointer"
            >
              Tutup
            </button>

            <div className="flex items-center gap-2">
              {!showRejectInput ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-2xl font-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleApprove}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Setujui Koreksi</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-2 bg-white/10 text-purple-200 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black transition disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Konfirmasi Tolak"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
