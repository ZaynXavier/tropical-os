/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  EssEmployeeProfile,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveRequest,
  OvertimeRequest,
  EmployeeDeduction,
  HrDocument,
} from "../../types";
import {
  EmployeeService,
  AttendanceService,
  AttendanceCorrectionService,
  LeaveService,
  OvertimeService,
  DeductionService,
  HrDocumentService,
} from "../../lib/supabase";
import { FaceIdAttendanceModal } from "./FaceIdAttendanceModal";
import { AttendanceCorrectionModal } from "./AttendanceCorrectionModal";
import { ApplyLeaveModal } from "./ApplyLeaveModal";
import { ApplyOvertimeModal } from "./ApplyOvertimeModal";
import { ApplyDeductionModal } from "./ApplyDeductionModal";
import {
  UserCheck,
  Calendar,
  Clock,
  Briefcase,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Coins,
  Send,
  Camera,
  RefreshCw,
  Edit3,
  Save,
  X,
  ChevronRight,
  TrendingUp,
  Download,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  HeartPulse,
} from "lucide-react";

interface EmployeeSelfServiceViewProps {
  user: User;
}

type EssTab =
  | "overview"
  | "profile"
  | "employment"
  | "attendance"
  | "overtime"
  | "leave"
  | "deductions"
  | "documents"
  | "submissions";

export const EmployeeSelfServiceView: React.FC<EmployeeSelfServiceViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<EssTab>("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<EssEmployeeProfile | null>(null);

  // Sub-data states
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [myAttendanceHistory, setMyAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [myCorrections, setMyCorrections] = useState<AttendanceCorrection[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [myOvertimes, setMyOvertimes] = useState<OvertimeRequest[]>([]);
  const [myDeductions, setMyDeductions] = useState<EmployeeDeduction[]>([]);
  const [myDocuments, setMyDocuments] = useState<HrDocument[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editBankAccount, setEditBankAccount] = useState("");
  const [editBankHolder, setEditBankHolder] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Modals
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);

  // Month filter for attendance history
  const [historyMonth, setHistoryMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    loadAllEssData();
  }, [user.email]);

  const loadAllEssData = async () => {
    setLoading(true);
    try {
      // 1. Load Profile
      const profRes = await EmployeeService.getCurrentEmployeeProfile(user.email);
      if (profRes.data) {
        setProfile(profRes.data);
        setEditPhone(profRes.data.phone || "");
        setEditAddress(profRes.data.address || "");
        setEditBankName(profRes.data.bank_name || "");
        setEditBankAccount(profRes.data.bank_account_number || "");
        setEditBankHolder(profRes.data.bank_account_holder || "");
        setEditEmergencyContact(profRes.data.emergency_contact || "");
        setEditEmergencyPhone(profRes.data.emergency_phone || "");

        const empId = profRes.data.id;

        // 2. Load Attendance
        const todayRes = await AttendanceService.getPersonalTodayAttendance(empId);
        setTodayAttendance(todayRes.data);

        const historyRes = await AttendanceService.getAttendanceRecords({ employeeId: empId });
        setMyAttendanceHistory(Array.isArray(historyRes) ? historyRes : (historyRes as any)?.data || []);

        // 3. Load Corrections
        const corrRes = await AttendanceCorrectionService.getCorrections({ employeeId: empId });
        setMyCorrections(corrRes.data);

        // 4. Load Leaves
        const leaveRes = await LeaveService.getLeaveRequests({ employeeId: empId });
        setMyLeaves(leaveRes.data);

        // 5. Load Overtime
        const otRes = await OvertimeService.getOvertimeRequests({ employeeId: empId });
        setMyOvertimes(otRes.data);

        // 6. Load Deductions
        const dedRes = await DeductionService.getDeductions({ employeeId: empId });
        setMyDeductions(dedRes.data);

        // 7. Load Documents (all active docs)
        const docRes = await HrDocumentService.getDocuments({ status: "ACTIVE" });
        setMyDocuments(docRes.data);
      }
    } catch (e) {
      console.error("Error loading ESS data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const res = await EmployeeService.updateSelfProfile(profile.id, {
      phone: editPhone,
      address: editAddress,
      bank_name: editBankName,
      bank_account_number: editBankAccount,
      bank_account_holder: editBankHolder,
      emergency_contact: editEmergencyContact,
      emergency_phone: editEmergencyPhone,
    });
    setSavingProfile(false);

    if (res.error) {
      alert("Gagal memperbarui profil: " + res.error);
      return;
    }

    alert("Profil dan data personal berhasil disimpan ke database!");
    setIsEditingProfile(false);
    loadAllEssData();
  };

  const handleCancelOvertime = async (otId: string) => {
    if (!confirm("Batalkan pengajuan lembur ini?")) return;
    const res = await OvertimeService.cancelOvertimeRequest(otId);
    if (res.error) {
      alert("Gagal membatalkan pengajuan: " + res.error);
    } else {
      alert("Pengajuan lembur berhasil dibatalkan.");
      loadAllEssData();
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm("Batalkan pengajuan izin/cuti ini?")) return;
    const res = await LeaveService.cancelLeaveRequest(leaveId);
    if (res.error) {
      alert("Gagal membatalkan pengajuan: " + res.error);
    } else {
      alert("Pengajuan cuti/izin berhasil dibatalkan.");
      loadAllEssData();
    }
  };

  const handleCancelCorrection = async (corrId: string) => {
    if (!confirm("Batalkan permohonan koreksi absensi ini?")) return;
    const res = await AttendanceCorrectionService.cancelCorrection(corrId);
    if (res.error) {
      alert("Gagal membatalkan permohonan: " + res.error);
    } else {
      alert("Permohonan koreksi absensi dibatalkan.");
      loadAllEssData();
    }
  };

  // Quick stats calculation
  const totalOvertimeThisMonth = myOvertimes
    .filter((o) => o.status === "APPROVED" && (o.date || "").startsWith(historyMonth))
    .reduce((acc, curr) => acc + (curr.hours || 0), 0);

  const totalPendingSubmissions =
    myLeaves.filter((l) => l.status === "SUBMITTED").length +
    myOvertimes.filter((o) => o.status === "SUBMITTED").length +
    myCorrections.filter((c) => c.status === "SUBMITTED").length;

  return (
    <div className="space-y-6 text-white animate-fade-in font-sans">
      {/* 1. Header Banner & Profile Snapshot */}
      <div className="bg-[#110D2C]/90 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-purple-600/30 shrink-0">
            {profile?.name ? profile.name.charAt(0) : user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">{profile?.name || user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                {profile?.status || "ACTIVE"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {profile?.employee_type || "Full-Time"}
              </span>
            </div>
            <p className="text-xs text-purple-200/70 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">{profile?.role || user.role}</span>
              <span>•</span>
              <span className="text-purple-300 font-bold">{profile?.division || user.division}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-purple-400 font-bold">ID: {profile?.emp_id || "EMP-..."}</span>
            </p>
          </div>
        </div>

        {/* Quick Attendance & Clock Action Bar */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="bg-[#080519] px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono">
            <span className="text-purple-300/70 block text-[10px] font-bold uppercase">Status Hari Ini</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-white text-xs">
                {todayAttendance?.clock_in
                  ? `Masuk ${todayAttendance.clock_in} ${todayAttendance.clock_out ? `• Pulang ${todayAttendance.clock_out}` : "(Bertugas)"}`
                  : "Belum Absen"}
              </strong>
            </div>
          </div>

          <button
            onClick={() => setIsFaceModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Clock In / Out Face ID</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10 scrollbar-none text-xs">
        {[
          { id: "overview", label: "Dashboard ESS", icon: TrendingUp },
          { id: "profile", label: "Profil Saya", icon: UserCheck },
          { id: "employment", label: "Data Kepegawaian", icon: Briefcase },
          { id: "attendance", label: "Absensi Saya", icon: Clock },
          { id: "leave", label: "Cuti & Perizinan", icon: Calendar, badge: profile?.remaining_leave ? `${profile.remaining_leave} Hari` : undefined },
          { id: "overtime", label: "Lembur Saya", icon: Flame },
          { id: "deductions", label: "Potongan & Kasbon", icon: Coins },
          { id: "documents", label: "Dokumen & SOP", icon: FileText },
          { id: "submissions", label: "Riwayat Pengajuan", icon: Send, badge: totalPendingSubmissions > 0 ? totalPendingSubmissions : undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EssTab)}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-purple-300/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white text-purple-900" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Views */}

      {/* ----------------- TAB: OVERVIEW ----------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-purple-300">
                <span className="text-xs font-bold">Jam Kerja Hari Ini</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {todayAttendance?.total_hours || (todayAttendance?.clock_in ? "Sedang Berjalan" : "0")} {todayAttendance?.total_hours ? "Jam" : ""}
              </div>
              <p className="text-[11px] text-purple-300/70">
                {todayAttendance?.clock_in ? `Masuk jam ${todayAttendance.clock_in}` : "Belum melakukan clock in"}
              </p>
            </div>

            <div className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-purple-300">
                <span className="text-xs font-bold">Sisa Kuota Cuti</span>
                <Calendar className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {profile?.remaining_leave ?? 12} Hari
              </div>
              <p className="text-[11px] text-purple-300/70">
                Total kuota: {profile?.leave_allowance || 12} • Terpakai: {profile?.used_leave || 0} hari
              </p>
            </div>

            <div className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-purple-300">
                <span className="text-xs font-bold">Total Lembur Bulan Ini</span>
                <Flame className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300 font-mono">
                {totalOvertimeThisMonth} Jam
              </div>
              <p className="text-[11px] text-purple-300/70">Disetujui periode {historyMonth}</p>
            </div>

            <div className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-purple-300">
                <span className="text-xs font-bold">Pengajuan Pending</span>
                <Send className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {totalPendingSubmissions}
              </div>
              <p className="text-[11px] text-purple-300/70">Menunggu persetujuan supervisor</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Aksi Cepat Layanan Mandiri Karyawan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => setIsFaceModalOpen(true)}
                className="p-4 bg-gradient-to-tr from-purple-900/40 to-indigo-900/40 hover:from-purple-800/50 hover:to-indigo-800/50 border border-purple-500/30 rounded-2xl text-left space-y-1.5 transition cursor-pointer group"
              >
                <Camera className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Presensi Face ID</div>
                <p className="text-[11px] text-purple-200/70">Catat jam masuk atau jam pulang via kamera biometrik.</p>
              </button>

              <button
                onClick={() => setIsCorrectionModalOpen(true)}
                className="p-4 bg-gradient-to-tr from-amber-900/40 to-orange-900/40 hover:from-amber-800/50 hover:to-orange-800/50 border border-amber-500/30 rounded-2xl text-left space-y-1.5 transition cursor-pointer group"
              >
                <Clock className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Koreksi Absensi</div>
                <p className="text-[11px] text-purple-200/70">Koreksi jam absensi jika lupa clock in/out.</p>
              </button>

              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="p-4 bg-gradient-to-tr from-cyan-900/40 to-blue-900/40 hover:from-cyan-800/50 hover:to-blue-800/50 border border-cyan-500/30 rounded-2xl text-left space-y-1.5 transition cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Ajukan Cuti / Izin</div>
                <p className="text-[11px] text-purple-200/70">Permohonan cuti tahunan, sakit, atau izin khusus.</p>
              </button>

              <button
                onClick={() => setIsOvertimeModalOpen(true)}
                className="p-4 bg-gradient-to-tr from-pink-900/40 to-purple-900/40 hover:from-pink-800/50 hover:to-purple-800/50 border border-pink-500/30 rounded-2xl text-left space-y-1.5 transition cursor-pointer group"
              >
                <Flame className="w-5 h-5 text-pink-300 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Ajukan Lembur</div>
                <p className="text-[11px] text-purple-200/70">Catat dan ajukan kompensasi jam kerja lembur.</p>
              </button>
            </div>
          </div>

          {/* Today's Shift & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shift Details */}
            <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center justify-between">
                <span>Shift &amp; Jadwal Kerja Saya</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {profile?.division}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-purple-300">Pola Shift:</span>
                  <strong className="text-white">Full Day (10:00 - 21:00 WIB)</strong>
                </div>
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-purple-300">Lokasi Penugasan:</span>
                  <strong className="text-emerald-300">Tropical Garden Resto Bali</strong>
                </div>
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-purple-300">Supervisor Divisi:</span>
                  <strong className="text-purple-200">{profile?.supervisor_name || "Manager Operasional"}</strong>
                </div>
              </div>
            </div>

            {/* Document / SOP Quick Access */}
            <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center justify-between">
                <span>Dokumen &amp; SOP Wajib Divisi</span>
                <button
                  onClick={() => setActiveTab("documents")}
                  className="text-[10px] text-purple-300 hover:text-white font-bold underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              </h3>

              <div className="space-y-2 text-xs">
                {myDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-bold">{doc.title}</strong>
                      <span className="text-[10px] text-purple-300/70">{doc.category} • Versi {doc.version}</span>
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-xl transition"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: PROFIL SAYA ----------------- */}
      {activeTab === "profile" && (
        <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-white">Biodata &amp; Informasi Personal</h3>
              <p className="text-xs text-purple-200/70">Karyawan dapat memperbarui informasi kontak, alamat, rekening, dan kontak darurat secara mandiri.</p>
            </div>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Kontak &amp; Rekening</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Read-Only Employment Info */}
            <div className="space-y-4 bg-[#080519] p-5 rounded-2xl border border-white/5">
              <h4 className="font-bold text-xs text-purple-300 uppercase tracking-wider">Data Identitas Kepegawaian (Terkunci)</h4>
              <div className="space-y-3 font-mono">
                <div>
                  <span className="text-purple-300/60 block text-[10px] font-bold">NAMA LENGKAP</span>
                  <span className="font-bold text-white text-sm">{profile?.name}</span>
                </div>
                <div>
                  <span className="text-purple-300/60 block text-[10px] font-bold">NOMOR INDUK KARYAWAN (NIK / EMP ID)</span>
                  <span className="font-bold text-purple-300">{profile?.emp_id}</span>
                </div>
                <div>
                  <span className="text-purple-300/60 block text-[10px] font-bold">EMAIL SISTEM TROPICALOS</span>
                  <span className="font-bold text-white">{profile?.email}</span>
                </div>
                <div>
                  <span className="text-purple-300/60 block text-[10px] font-bold">JABATAN &amp; DIVISI</span>
                  <span className="font-bold text-white">{profile?.role} • {profile?.division}</span>
                </div>
                <div>
                  <span className="text-purple-300/60 block text-[10px] font-bold">TANGGAL BERGABUNG</span>
                  <span className="font-bold text-white">{profile?.join_date || "10/01/2024"}</span>
                </div>
              </div>
            </div>

            {/* Editable Contact & Bank Details */}
            <div className="space-y-4 bg-[#080519] p-5 rounded-2xl border border-white/5">
              <h4 className="font-bold text-xs text-purple-300 uppercase tracking-wider">Kontak &amp; Rekening Payroll</h4>
              {isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-purple-200 font-bold mb-1">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 font-bold mb-1">Alamat Domisili</label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">Nama Bank</label>
                      <input
                        type="text"
                        value={editBankName}
                        placeholder="Contoh: BCA / Mandiri"
                        onChange={(e) => setEditBankName(e.target.value)}
                        className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        value={editBankAccount}
                        onChange={(e) => setEditBankAccount(e.target.value)}
                        className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-purple-200 font-bold mb-1">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      value={editBankHolder}
                      onChange={(e) => setEditBankHolder(e.target.value)}
                      className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">Kontak Darurat (Nama)</label>
                      <input
                        type="text"
                        value={editEmergencyContact}
                        placeholder="Orang tua / Pasangan"
                        onChange={(e) => setEditEmergencyContact(e.target.value)}
                        className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">Nomor Telp Darurat</label>
                      <input
                        type="text"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="w-full bg-[#110D2C] border border-white/15 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  <div>
                    <span className="text-purple-300/60 block text-[10px] font-bold">NOMOR TELEPON / WA</span>
                    <span className="font-bold text-white">{profile?.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="text-purple-300/60 block text-[10px] font-bold">ALAMAT TINGGAL</span>
                    <span className="font-bold text-white">{profile?.address || "-"}</span>
                  </div>
                  <div>
                    <span className="text-purple-300/60 block text-[10px] font-bold">REKENING BANK GAJI</span>
                    <span className="font-bold text-emerald-300">
                      {profile?.bank_name || "BCA"} - {profile?.bank_account_number || "-"} (a.n {profile?.bank_account_holder || profile?.name})
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-300/60 block text-[10px] font-bold">KONTAK DARURAT</span>
                    <span className="font-bold text-amber-300">
                      {profile?.emergency_contact ? `${profile.emergency_contact} (${profile.emergency_phone || "-"})` : "Belum diisi"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: DATA KEPEGAWAIAN ----------------- */}
      {activeTab === "employment" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>Status Kepegawaian &amp; Struktur Organisasi</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#080519] rounded-2xl border border-white/5">
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Status Kontrak</span>
                <strong className="text-white text-sm">{profile?.employee_type || "Karyawan Tetap (PKWTT)"}</strong>
              </div>
              <div className="p-4 bg-[#080519] rounded-2xl border border-white/5">
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Atasan Langsung</span>
                <strong className="text-purple-300 text-sm">{profile?.supervisor_name || "Head of Operations"}</strong>
              </div>
              <div className="p-4 bg-[#080519] rounded-2xl border border-white/5">
                <span className="text-purple-300/60 block text-[10px] font-bold uppercase">Nilai Evaluasi KPI Terakhir</span>
                <strong className="text-emerald-300 text-sm">{profile?.kpi_score ? `${profile.kpi_score}/100` : "88 / 100 (Sangat Baik)"}</strong>
              </div>
            </div>
          </div>

          {/* Rincian Komponen Gaji */}
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Struktur Komponen Gaji &amp; Tunjangan Aktif</span>
            </h3>

            {profile?.salary_components && profile.salary_components.length > 0 ? (
              <div className="space-y-2 text-xs font-mono">
                {profile.salary_components.map((comp) => (
                  <div key={comp.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <strong className="text-white">{comp.component_name}</strong>
                      <span className="text-[10px] text-purple-300 block">{comp.component_type}</span>
                    </div>
                    <span className="font-bold text-emerald-300 text-sm">
                      Rp {Number(comp.amount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#080519] rounded-2xl border border-white/5 text-xs text-purple-300 font-mono space-y-2">
                <div className="flex justify-between">
                  <span>Gaji Pokok:</span>
                  <strong className="text-white">Rp {(profile?.salary || 4500000).toLocaleString("id-ID")}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tunjangan Operasional:</span>
                  <strong className="text-white">Rp 500.000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Uang Makan &amp; Transportasi:</span>
                  <strong className="text-white">Rp 450.000</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: ABSENSI SAYA ----------------- */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Riwayat Kehadiran Personal</h3>
              <p className="text-xs text-purple-200/70">Pantau catatan waktu kerja, ketepatan kehadiran, dan ajukan koreksi bila terjadi kendala teknis.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="month"
                value={historyMonth}
                onChange={(e) => setHistoryMonth(e.target.value)}
                className="bg-[#080519] border border-white/15 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
              />
              <button
                onClick={() => setIsCorrectionModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Ajukan Koreksi Absensi</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-[#110D2C]/80 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A071E] border-b border-white/10 text-[10px] text-purple-300 uppercase tracking-wider font-sans">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Jam Masuk</th>
                    <th className="p-4">Jam Pulang</th>
                    <th className="p-4">Total Durasi</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myAttendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-purple-300 font-sans">
                        Belum ada catatan absensi untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    myAttendanceHistory.map((att) => (
                      <tr key={att.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white">{att.date}</td>
                        <td className="p-4 text-emerald-300 font-bold">{att.clock_in || "-"}</td>
                        <td className="p-4 text-purple-300 font-bold">{att.clock_out || "-"}</td>
                        <td className="p-4 text-white">{att.total_hours ? `${att.total_hours} Jam` : "-"}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              att.status === "HADIR"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : att.status === "TERLAMBAT"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="p-4 text-purple-300/70 text-[11px]">{att.verification_method || "FACE_ID"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => setIsCorrectionModalOpen(true)}
                            className="text-amber-300 hover:text-amber-200 underline text-[11px] font-sans font-bold cursor-pointer"
                          >
                            Koreksi
                          </button>
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

      {/* ----------------- TAB: CUTI & PERIZINAN ----------------- */}
      {activeTab === "leave" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Pengajuan &amp; Kuota Cuti Karyawan</h3>
              <p className="text-xs text-purple-200/70">
                Sisa kuota cuti tahunan Anda: <strong className="text-cyan-300">{profile?.remaining_leave ?? 12} Hari</strong> dari total {profile?.leave_allowance || 12} hari.
              </p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Ajukan Permohonan Cuti / Izin</span>
            </button>
          </div>

          {/* My Leaves List */}
          <div className="space-y-3">
            {myLeaves.length === 0 ? (
              <div className="p-8 bg-[#110D2C]/80 rounded-3xl border border-white/10 text-center text-purple-300 text-xs">
                Belum ada riwayat permohonan izin/cuti.
              </div>
            ) : (
              myLeaves.map((lv) => (
                <div key={lv.id} className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{lv.request_type} ({lv.total_days} Hari)</strong>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          lv.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : lv.status === "REJECTED"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {lv.status}
                      </span>
                    </div>
                    <p className="text-purple-300/80 font-mono">
                      Periode: {lv.start_date} s/d {lv.end_date}
                    </p>
                    <p className="text-purple-100 font-medium">"{lv.reason}"</p>
                    {lv.rejection_reason && (
                      <p className="text-red-300 text-[11px] font-bold">Catatan Penolakan: {lv.rejection_reason}</p>
                    )}
                  </div>

                  {lv.status === "SUBMITTED" && (
                    <button
                      onClick={() => handleCancelLeave(lv.id)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-center"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: LEMBUR SAYA ----------------- */}
      {activeTab === "overtime" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Kerja Lembur Mandiri (Overtime)</h3>
              <p className="text-xs text-purple-200/70">
                Total lembur disetujui bulan ini: <strong className="text-purple-300">{totalOvertimeThisMonth} Jam</strong>.
              </p>
            </div>
            <button
              onClick={() => setIsOvertimeModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Ajukan Jam Lembur</span>
            </button>
          </div>

          <div className="space-y-3">
            {myOvertimes.length === 0 ? (
              <div className="p-8 bg-[#110D2C]/80 rounded-3xl border border-white/10 text-center text-purple-300 text-xs">
                Belum ada pengajuan lembur yang tercatat.
              </div>
            ) : (
              myOvertimes.map((ot) => (
                <div key={ot.id} className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">Lembur {ot.hours} Jam ({ot.date})</strong>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ot.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : ot.status === "REJECTED"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {ot.status}
                      </span>
                    </div>
                    <p className="text-purple-300/80 font-mono">
                      Waktu: {ot.start_time || "17:00"} - {ot.end_time || "20:00"}
                    </p>
                    <p className="text-purple-100 font-medium">"{ot.reason}"</p>
                  </div>

                  {ot.status === "SUBMITTED" && (
                    <button
                      onClick={() => handleCancelOvertime(ot.id)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-center"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: POTONGAN & KASBON ----------------- */}
      {activeTab === "deductions" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Kasbon &amp; Potongan Karyawan</h3>
              <p className="text-xs text-purple-200/70">Pengajuan pinjaman atau pemotongan gaji berkala untuk keperluan darurat.</p>
            </div>
            <button
              onClick={() => setIsDeductionModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Ajukan Kasbon Mandiri</span>
            </button>
          </div>

          <div className="space-y-3">
            {myDeductions.length === 0 ? (
              <div className="p-8 bg-[#110D2C]/80 rounded-3xl border border-white/10 text-center text-purple-300 text-xs">
                Tidak ada catatan kasbon atau potongan gaji aktif.
              </div>
            ) : (
              myDeductions.map((ded) => (
                <div key={ded.id} className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{ded.deduction_type} (Rp {Number(ded.amount || 0).toLocaleString("id-ID")})</strong>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        {ded.status}
                      </span>
                    </div>
                    <p className="text-purple-300/80 font-mono">Periode Potong Gaji: {ded.period}</p>
                    <p className="text-purple-100 font-medium">"{ded.description}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: DOKUMEN & SOP SAYA ----------------- */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl">
            <h3 className="text-base font-black text-white">Dokumen Peraturan, SOP &amp; Panduan Divisi</h3>
            <p className="text-xs text-purple-200/70">Akses dokumen resmi perusahaan yang berlaku untuk divisi {profile?.division}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDocuments.map((doc) => (
              <div key={doc.id} className="bg-[#110D2C]/80 p-5 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
                      {doc.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{doc.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400">v{doc.version}</span>
                </div>
                <p className="text-xs text-purple-200/70 line-clamp-2">{doc.description || "Panduan kerja resmi standar operasional Tropical Garden Resto."}</p>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                  >
                    <FileText className="w-4 h-4 text-purple-300" />
                    <span>Baca Dokumen SOP</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: RIWAYAT PENGAJUAN (UNIFIED) ----------------- */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="bg-[#110D2C]/80 p-6 rounded-3xl border border-white/10 shadow-xl">
            <h3 className="text-base font-black text-white">Riwayat Pengajuan Mandiri Terpadu</h3>
            <p className="text-xs text-purple-200/70">Pelacakan status seluruh permohonan personal (Cuti, Lembur, Kasbon, Koreksi Absensi) secara realtime.</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Corrections */}
            {myCorrections.map((c) => (
              <div key={c.id} className="bg-[#110D2C]/80 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">KOREKSI ABSENSI</span>
                    <strong className="text-white">{c.date} ({c.correction_type})</strong>
                  </div>
                  <span className="text-[11px] text-purple-300 block mt-0.5">"{c.reason}"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    c.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : c.status === "REJECTED" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {c.status}
                  </span>
                  {c.status === "SUBMITTED" && (
                    <button onClick={() => handleCancelCorrection(c.id)} className="text-red-400 hover:underline">Batal</button>
                  )}
                </div>
              </div>
            ))}

            {/* 2. Leaves */}
            {myLeaves.map((lv) => (
              <div key={lv.id} className="bg-[#110D2C]/80 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">CUTI / IZIN</span>
                    <strong className="text-white">{lv.request_type} ({lv.total_days} Hari)</strong>
                  </div>
                  <span className="text-[11px] text-purple-300 block mt-0.5">{lv.start_date} s/d {lv.end_date} • "{lv.reason}"</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  lv.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : lv.status === "REJECTED" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {lv.status}
                </span>
              </div>
            ))}

            {/* 3. Overtimes */}
            {myOvertimes.map((ot) => (
              <div key={ot.id} className="bg-[#110D2C]/80 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-bold text-[10px]">LEMBUR</span>
                    <strong className="text-white">{ot.date} ({ot.hours} Jam)</strong>
                  </div>
                  <span className="text-[11px] text-purple-300 block mt-0.5">"{ot.reason}"</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  ot.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : ot.status === "REJECTED" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {ot.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals Container */}
      <FaceIdAttendanceModal
        isOpen={isFaceModalOpen}
        user={user}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccessRecord={() => loadAllEssData()}
      />

      {profile && (
        <>
          <AttendanceCorrectionModal
            isOpen={isCorrectionModalOpen}
            user={user}
            employeeId={profile.id}
            employeeName={profile.name}
            existingAttendance={todayAttendance}
            onClose={() => setIsCorrectionModalOpen(false)}
            onSuccess={() => loadAllEssData()}
          />

          <ApplyLeaveModal
            isOpen={isLeaveModalOpen}
            user={user}
            employeeId={profile.id}
            employeeName={profile.name}
            remainingLeave={profile.remaining_leave}
            onClose={() => setIsLeaveModalOpen(false)}
            onSuccess={() => loadAllEssData()}
          />

          <ApplyOvertimeModal
            isOpen={isOvertimeModalOpen}
            user={user}
            employeeId={profile.id}
            employeeName={profile.name}
            onClose={() => setIsOvertimeModalOpen(false)}
            onSuccess={() => loadAllEssData()}
          />

          <ApplyDeductionModal
            isOpen={isDeductionModalOpen}
            user={user}
            employeeId={profile.id}
            employeeName={profile.name}
            onClose={() => setIsDeductionModalOpen(false)}
            onSuccess={() => loadAllEssData()}
          />
        </>
      )}
    </div>
  );
};
