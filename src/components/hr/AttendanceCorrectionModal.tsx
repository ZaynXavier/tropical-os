/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, CorrectionType, AttendanceStatus, AttendanceRecord } from "../../types";
import { AttendanceCorrectionService } from "../../lib/supabase";
import { X, Clock, AlertTriangle, FileText, CheckCircle2, Calendar } from "lucide-react";

interface AttendanceCorrectionModalProps {
  user: User;
  employeeId: string;
  employeeName: string;
  defaultDate?: string;
  existingAttendance?: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  user,
  employeeId,
  employeeName,
  defaultDate,
  existingAttendance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(defaultDate || todayStr);
  const [correctionType, setCorrectionType] = useState<CorrectionType>("BOTH");
  const [proposedClockIn, setProposedClockIn] = useState(existingAttendance?.clock_in || "08:00");
  const [proposedClockOut, setProposedClockOut] = useState(existingAttendance?.clock_out || "17:00");
  const [proposedStatus, setProposedStatus] = useState<AttendanceStatus>("HADIR");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan koreksi absensi wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await AttendanceCorrectionService.submitCorrection({
      employee_id: employeeId,
      attendance_id: existingAttendance?.id,
      date,
      correction_type: correctionType,
      proposed_clock_in: correctionType === "CLOCK_OUT" ? undefined : proposedClockIn,
      proposed_clock_out: correctionType === "CLOCK_IN" ? undefined : proposedClockOut,
      proposed_status: proposedStatus,
      reason,
      attachment_url: attachmentUrl || undefined,
      status: "SUBMITTED",
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Pengajuan koreksi absensi berhasil dikirim ke Supervisor / Manager.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A071E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ajukan Koreksi Absensi</h3>
              <p className="text-xs text-purple-200/70">{employeeName} ({user.division})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tanggal Absensi *</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tipe Koreksi *</label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value as CorrectionType)}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="BOTH">Jam Masuk &amp; Pulang (Keduanya)</option>
                <option value="CLOCK_IN">Jam Masuk Saja (Lupa Clock In)</option>
                <option value="CLOCK_OUT">Jam Pulang Saja (Lupa Clock Out)</option>
                <option value="STATUS">Status Kehadiran Saja</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Time fields */}
          {(correctionType === "CLOCK_IN" || correctionType === "BOTH" || correctionType === "OTHER") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 font-bold mb-1.5">Usulan Jam Masuk</label>
                <input
                  type="time"
                  value={proposedClockIn}
                  onChange={(e) => setProposedClockIn(e.target.value)}
                  className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-1.5">Status Usulan</label>
                <select
                  value={proposedStatus}
                  onChange={(e) => setProposedStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="HADIR">HADIR</option>
                  <option value="TERLAMBAT">TERLAMBAT</option>
                  <option value="IZIN">IZIN</option>
                  <option value="SAKIT">SAKIT</option>
                  <option value="CUTI">CUTI</option>
                </select>
              </div>
            </div>
          )}

          {(correctionType === "CLOCK_OUT" || correctionType === "BOTH") && (
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Usulan Jam Pulang</label>
              <input
                type="time"
                value={proposedClockOut}
                onChange={(e) => setProposedClockOut(e.target.value)}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Alasan Koreksi / Keterangan *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Lupa clock out karena lembur operasional mendesak di dapur / Kendala koneksi jaringan pada perangkat Face ID."
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Attachment URL */}
          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Link Bukti / Foto Lampiran (Opsional)</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300">
            <span className="font-bold">Info Workflow:</span> Pengajuan koreksi absensi akan diverifikasi oleh Supervisor Divisi atau Manager. Setelah disetujui, catatan absensi otomatis diperbarui di database.
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-purple-200 rounded-2xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Kirim Permohonan Koreksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
