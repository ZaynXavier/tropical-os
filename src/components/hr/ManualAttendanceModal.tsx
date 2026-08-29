/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, AttendanceStatus, ShiftType } from "../../types";
import { AttendanceService, EmployeeService } from "../../lib/supabase";
import { X, Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck } from "lucide-react";

interface ManualAttendanceModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState(todayStr);
  const [clockIn, setClockIn] = useState("08:00");
  const [clockOut, setClockOut] = useState("17:00");
  const [shiftType, setShiftType] = useState<string>("FULL_DAY");
  const [status, setStatus] = useState<AttendanceStatus>("HADIR");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    const res = await EmployeeService.getAllEmployees();
    if (res.data) {
      // If Supervisor, filter only for supervised division
      let list = res.data;
      if (user.role === "SUPERVISOR") {
        list = list.filter((e) => e.division === user.division);
      }
      setEmployees(list);
      if (list.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(list[0].id || "");
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError("Pilih karyawan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await AttendanceService.logManualAttendance({
      employee_id: selectedEmployeeId,
      date,
      clock_in: (status === "HADIR" || status === "TERLAMBAT") ? clockIn : undefined,
      clock_out: (status === "HADIR" || status === "TERLAMBAT") ? clockOut : undefined,
      shift_type: shiftType,
      status,
      notes,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Catatan absensi manual berhasil disimpan.");
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
              <h3 className="text-base font-black text-white">Input Absensi Manual</h3>
              <p className="text-xs text-purple-200/70">Otoritas {user.role} ({user.division})</p>
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
            <label className="block text-purple-200 font-bold mb-1.5">Pilih Karyawan *</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-medium"
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.emp_id}) - {emp.division}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tanggal Absensi *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Status Kehadiran *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-medium"
              >
                <option value="HADIR">HADIR</option>
                <option value="TERLAMBAT">TERLAMBAT</option>
                <option value="IZIN">IZIN</option>
                <option value="SAKIT">SAKIT</option>
                <option value="CUTI">CUTI</option>
                <option value="ALPA">ALPA (Tanpa Keterangan)</option>
                <option value="OFF">OFF / LIBUR</option>
              </select>
            </div>
          </div>

          {(status === "HADIR" || status === "TERLAMBAT") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 font-bold mb-1.5">Jam Masuk (Clock In)</label>
                <input
                  type="time"
                  value={clockIn}
                  onChange={(e) => setClockIn(e.target.value)}
                  className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-1.5">Jam Pulang (Clock Out)</label>
                <input
                  type="time"
                  value={clockOut}
                  onChange={(e) => setClockOut(e.target.value)}
                  className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Tipe Shift</label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400 font-medium"
            >
              <option value="FULL_DAY">Full Day (08:00 - 17:00)</option>
              <option value="MORNING_SHIFT">Shift Pagi (07:00 - 15:00)</option>
              <option value="EVENING_SHIFT">Shift Sore (15:00 - 23:00)</option>
              <option value="NIGHT_SHIFT">Shift Malam (23:00 - 07:00)</option>
              <option value="MIDDLE_SHIFT">Shift Middle (11:00 - 20:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Catatan / Keterangan Manual</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Keterangan penyesuaian oleh Supervisor/Manager..."
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Simpan Catatan Absensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
