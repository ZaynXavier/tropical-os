/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { OvertimeService } from "../../lib/supabase";
import { X, Clock, AlertTriangle, CheckCircle2, Flame } from "lucide-react";

interface ApplyOvertimeModalProps {
  user: User;
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyOvertimeModal: React.FC<ApplyOvertimeModalProps> = ({
  user,
  employeeId,
  employeeName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("20:00");
  const [hours, setHours] = useState(3);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateHours = (s: string, e: string) => {
    if (!s || !e) return;
    const [sh, sm] = s.split(":").map(Number);
    const [eh, em] = e.split(":").map(Number);
    let sMin = sh * 60 + sm;
    let eMin = eh * 60 + em;
    if (eMin < sMin) eMin += 24 * 60;
    const h = Math.round(((eMin - sMin) / 60) * 10) / 10;
    setHours(h > 0 ? h : 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan / Uraian pekerjaan lembur wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await OvertimeService.createOvertimeRequest({
      employee_id: employeeId,
      date,
      start_time: startTime,
      end_time: endTime,
      hours,
      reason,
      status: "SUBMITTED",
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Pengajuan lembur berhasil dikirim dan menunggu persetujuan Supervisor / Manager.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A071E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ajukan Kerja Lembur Mandiri</h3>
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
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Tanggal Lembur *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Jam Mulai Lembur</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  calculateHours(e.target.value, endTime);
                }}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Jam Selesai Lembur</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  calculateHours(startTime, e.target.value);
                }}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between text-purple-200">
            <span className="font-bold">Estimasi Durasi Lembur:</span>
            <span className="text-sm font-black text-purple-300">{hours} Jam</span>
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Alasan / Target Pekerjaan Lembur *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Menangani lonjakan pesanan katering VIP di kitchen / Penutupan kasir bulanan."
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-3 text-white focus:outline-none focus:border-purple-400"
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
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-black shadow-lg shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Kirim Pengajuan Lembur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
