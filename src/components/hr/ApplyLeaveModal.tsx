/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, LeaveType } from "../../types";
import { LeaveService } from "../../lib/supabase";
import { X, Calendar, AlertTriangle, CheckCircle2, HeartPulse, FileText } from "lucide-react";

interface ApplyLeaveModalProps {
  user: User;
  employeeId: string;
  employeeName: string;
  remainingLeave: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  user,
  employeeId,
  employeeName,
  remainingLeave,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [requestType, setRequestType] = useState<LeaveType>("CUTI");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val > endDate) setEndDate(val);
    calculateDays(val, endDate);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    calculateDays(startDate, val);
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setTotalDays(diffDays > 0 ? diffDays : 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan permohonan wajib diisi.");
      return;
    }

    if (requestType === "CUTI" && totalDays > remainingLeave) {
      setError(`Sisa kuota cuti Anda (${remainingLeave} hari) tidak mencukupi untuk permohonan ${totalDays} hari.`);
      return;
    }

    setLoading(true);
    setError(null);

    const res = await LeaveService.createLeaveRequest({
      employee_id: employeeId,
      request_type: requestType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason,
      attachment_url: attachmentUrl || undefined,
      status: "SUBMITTED",
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Permohonan izin/cuti berhasil diajukan dan menunggu persetujuan Supervisor / Manager.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A071E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ajukan Cuti &amp; Izin Mandiri</h3>
              <p className="text-xs text-purple-200/70">{employeeName} • Sisa Kuota Cuti: {remainingLeave} Hari</p>
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
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Jenis Permohonan *</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as LeaveType)}
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-cyan-400 font-medium"
            >
              <option value="CUTI">CUTI TAHUNAN (Mengurangi Kuota Cuti)</option>
              <option value="IZIN">IZIN TIDAK MASUK (Keperluan Pribadi/Keluarga)</option>
              <option value="SAKIT">SAKIT (Dengan/Tanpa Surat Dokter)</option>
              <option value="ISTIRAHAT">ISTIRAHAT / OFF ROSTER</option>
              <option value="LAINNYA">LAINNYA</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tanggal Mulai *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tanggal Selesai *</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                required
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-between text-cyan-200">
            <span className="font-bold">Total Durasi Permohonan:</span>
            <span className="text-sm font-black text-cyan-300">{totalDays} Hari</span>
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Alasan Lengkap *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Mengikuti acara keluarga di luar kota / Sakit demam dan istirahat dokter."
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Link Dokumen / Surat Keterangan Dokter (Opsional)</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Kirim Pengajuan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
