/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, AttendanceRecord, AttendanceCorrection, Division } from "../../types";
import {
  AttendanceService,
  AttendanceCorrectionService,
  EmployeeService,
} from "../../lib/supabase";
import { FaceIdAttendanceModal } from "./FaceIdAttendanceModal";
import { ManualAttendanceModal } from "./ManualAttendanceModal";
import { AttendanceCorrectionReviewModal } from "./AttendanceCorrectionReviewModal";
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  UserCheck,
  FileText,
  Building2,
  Award,
  Filter,
  RefreshCw,
  Camera,
  AlertTriangle,
  ChevronDown,
  Download,
  Flame,
} from "lucide-react";

interface AttendanceAndLeaveViewProps {
  user: User;
}

export const AttendanceAndLeaveView: React.FC<AttendanceAndLeaveViewProps> = ({ user }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDivision, setSelectedDivision] = useState<string>(
    user.role === "SUPERVISOR" ? user.division : "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Data States
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [correctionsList, setCorrectionsList] = useState<AttendanceCorrection[]>([]);
  const [activeTab, setActiveTab] = useState<"attendance" | "corrections">("attendance");

  // Modal States
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrection | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedDivision]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch attendance records
      const attFilters: any = {};
      if (selectedDate) attFilters.date = selectedDate;
      if (selectedDivision !== "ALL") attFilters.division = selectedDivision as Division;

      const attRes = await AttendanceService.getAttendanceRecords(attFilters);
      setAttendanceList(Array.isArray(attRes) ? attRes : (attRes as any)?.data || []);

      // 2. Fetch pending / all corrections
      const corrFilters: any = {};
      if (selectedDivision !== "ALL") corrFilters.division = selectedDivision as Division;
      const corrRes = await AttendanceCorrectionService.getCorrections(corrFilters);
      setCorrectionsList(corrRes.data);
    } catch (err) {
      console.error("Error loading attendance management data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered attendance based on search
  const filteredRecords = attendanceList.filter((att) => {
    const matchesSearch =
      (att.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.division || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filtered corrections
  const filteredCorrections = correctionsList.filter((c) => {
    const matchesSearch =
      (c.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.division || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingCorrectionsCount = correctionsList.filter((c) => c.status === "SUBMITTED").length;

  // Stats Calculations
  const totalHadir = filteredRecords.filter((a) => a.status === "HADIR").length;
  const totalTerlambat = filteredRecords.filter((a) => a.status === "TERLAMBAT").length;
  const totalIzinSakitCuti = filteredRecords.filter(
    (a) => a.status === "IZIN" || a.status === "SAKIT" || a.status === "CUTI"
  ).length;
  const totalAlpa = filteredRecords.filter((a) => a.status === "ALPA").length;
  const totalHoursWorked = filteredRecords.reduce((acc, curr) => acc + (curr.total_hours || 0), 0);

  return (
    <div className="space-y-6 text-white animate-fade-in font-sans">
      {/* 1. Header Banner & Action Center */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#110D2C]/90 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-600/20 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Manajemen Kehadiran &amp; Absensi Resto</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {user.role} • {user.division}
                </span>
              </h2>
              <p className="text-xs text-purple-200/70 mt-0.5">
                Monitoring presensi Face ID &amp; GPS real-time, approval koreksi absensi, dan pencatatan jam kerja operasional.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            onClick={() => setIsFaceModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition"
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Face ID</span>
          </button>

          {(user.role === "MANAGER" || user.role === "SUPERVISOR") && (
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Input Manual Staf</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-2xl transition cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-[#110D2C]/80 border border-white/10 shadow-xl space-y-1">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Hadir Tepat Waktu</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalHadir}</div>
          <span className="text-[10px] text-emerald-300 font-bold">Presensi Face ID Valid</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#110D2C]/80 border border-white/10 shadow-xl space-y-1">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Terlambat</span>
          <div className="text-2xl font-black text-amber-300 font-mono">{totalTerlambat}</div>
          <span className="text-[10px] text-amber-400 font-bold">Melewati Batas Shift</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#110D2C]/80 border border-white/10 shadow-xl space-y-1">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Izin / Sakit / Cuti</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{totalIzinSakitCuti}</div>
          <span className="text-[10px] text-cyan-400 font-bold">Disetujui Otoritas</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#110D2C]/80 border border-white/10 shadow-xl space-y-1">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Alpa / Tanpa Kabar</span>
          <div className="text-2xl font-black text-red-400 font-mono">{totalAlpa}</div>
          <span className="text-[10px] text-red-300 font-bold">Perlu Konfirmasi</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#110D2C]/80 border border-white/10 shadow-xl space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Jam Kerja</span>
          <div className="text-2xl font-black text-purple-300 font-mono">{totalHoursWorked} Jam</div>
          <span className="text-[10px] text-purple-400 font-bold">Akumulasi Tanggal Terpilih</span>
        </div>
      </div>

      {/* 3. Filter & Tab Navigation Toolbar */}
      <div className="bg-[#110D2C]/80 p-4 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "attendance"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-purple-300 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rekap Absensi Harian</span>
          </button>

          <button
            onClick={() => setActiveTab("corrections")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 relative ${
              activeTab === "corrections"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-purple-300 hover:text-white"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Persetujuan Koreksi Absensi</span>
            {pendingCorrectionsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-purple-950 animate-pulse">
                {pendingCorrectionsCount} Baru
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[#080519] px-3 py-1.5 rounded-2xl border border-white/10 text-xs">
            <Calendar className="w-4 h-4 text-purple-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono"
            />
          </div>

          {/* Division Filter */}
          {user.role === "MANAGER" ? (
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-[#080519] border border-white/10 text-white text-xs rounded-2xl px-3 py-2 focus:outline-none font-bold"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="BAR">Bar</option>
              <option value="SERVICE">Service</option>
              <option value="CASHIER">Cashier</option>
              <option value="MANAGEMENT">Management</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-[#080519] border border-white/10 rounded-2xl text-xs text-purple-300 font-bold">
              Divisi: {user.division}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300/60" />
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 bg-[#080519] border border-white/10 rounded-2xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-purple-400 w-44"
            />
          </div>
        </div>
      </div>

      {/* 4. Tab 1: Attendance Table */}
      {activeTab === "attendance" && (
        <div className="bg-[#110D2C]/80 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0A071E] border-b border-white/10 text-[10px] text-purple-300 uppercase tracking-wider font-sans">
                <tr>
                  <th className="p-4">Staf Karyawan</th>
                  <th className="p-4">Divisi</th>
                  <th className="p-4">Shift</th>
                  <th className="p-4">Jam Masuk</th>
                  <th className="p-4">Jam Pulang</th>
                  <th className="p-4">Total Durasi</th>
                  <th className="p-4">Status Kehadiran</th>
                  <th className="p-4">Lokasi &amp; Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-purple-300 font-sans">
                      {loading ? "Memuat catatan presensi..." : "Tidak ada data absensi untuk filter tanggal & divisi ini."}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-white/5 transition font-mono">
                      <td className="p-4 font-sans">
                        <strong className="text-white block text-sm">{att.employee_name || "Karyawan"}</strong>
                        <span className="text-[10px] text-purple-300/70 font-mono">
                          ID: {att.employee_id?.slice(0, 8)}... • {att.date}
                        </span>
                      </td>
                      <td className="p-4 font-sans font-bold text-purple-200">{att.division}</td>
                      <td className="p-4 text-purple-300">{att.shift_type || "FULL_DAY"}</td>
                      <td className="p-4 text-emerald-400 font-bold">{att.clock_in || "-"}</td>
                      <td className="p-4 text-purple-300 font-bold">{att.clock_out || "-"}</td>
                      <td className="p-4 text-white font-bold">{att.total_hours ? `${att.total_hours} Jam` : "-"}</td>
                      <td className="p-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            att.status === "HADIR"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : att.status === "TERLAMBAT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : att.status === "ALPA"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-purple-200/80 text-[11px] max-w-xs truncate">
                        {att.notes || att.location || "Verifikasi Biometrik Face ID"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Corrections Review Table */}
      {activeTab === "corrections" && (
        <div className="space-y-4">
          <div className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Daftar Permohonan Koreksi Absensi</h3>
              <p className="text-xs text-purple-200/70">
                Persetujuan dari Supervisor atau Manager akan memperbarui rekaman absensi karyawan di database secara otomatis.
              </p>
            </div>
          </div>

          <div className="bg-[#110D2C]/80 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A071E] border-b border-white/10 text-[10px] text-purple-300 uppercase tracking-wider font-sans">
                  <tr>
                    <th className="p-4">Tanggal &amp; Karyawan</th>
                    <th className="p-4">Divisi</th>
                    <th className="p-4">Tipe Koreksi</th>
                    <th className="p-4">Usulan Jam Baru</th>
                    <th className="p-4">Alasan Staf</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi Otoritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredCorrections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-purple-300 font-sans">
                        Tidak ada permohonan koreksi absensi yang masuk.
                      </td>
                    </tr>
                  ) : (
                    filteredCorrections.map((corr) => (
                      <tr key={corr.id} className="hover:bg-white/5 transition">
                        <td className="p-4">
                          <strong className="text-white block text-sm">{corr.employee_name}</strong>
                          <span className="text-[10px] text-purple-300 font-mono">{corr.date}</span>
                        </td>
                        <td className="p-4 font-bold text-purple-200">{corr.division}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            {corr.correction_type}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-cyan-300">
                          {corr.proposed_clock_in ? `In: ${corr.proposed_clock_in}` : ""}{" "}
                          {corr.proposed_clock_out ? `Out: ${corr.proposed_clock_out}` : ""}
                        </td>
                        <td className="p-4 text-purple-100 max-w-xs truncate text-[11px]">
                          "{corr.reason}"
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              corr.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : corr.status === "REJECTED"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {corr.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {corr.status === "SUBMITTED" && (user.role === "MANAGER" || user.role === "SUPERVISOR") ? (
                            <button
                              onClick={() => setSelectedCorrection(corr)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                            >
                              Review &amp; Approval
                            </button>
                          ) : (
                            <span className="text-[10px] text-purple-300/60 font-mono">
                              {corr.reviewer_name ? `Oleh: ${corr.reviewer_name}` : "Selesai"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FaceIdAttendanceModal
        isOpen={isFaceModalOpen}
        user={user}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccessRecord={() => loadData()}
      />

      <ManualAttendanceModal
        user={user}
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <AttendanceCorrectionReviewModal
        isOpen={!!selectedCorrection}
        user={user}
        correction={selectedCorrection}
        onClose={() => setSelectedCorrection(null)}
        onSuccess={() => {
          setSelectedCorrection(null);
          loadData();
        }}
      />
    </div>
  );
};
