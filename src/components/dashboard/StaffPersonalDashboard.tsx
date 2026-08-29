/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../../types";
import { FaceIdAttendanceModal } from "../hr/FaceIdAttendanceModal";
import { PwaInstallBanner } from "../common/PwaInstallBanner";
import {
  UserCheck,
  CheckSquare,
  CheckCircle2,
  Square,
  Clock,
  Sparkles,
  Coins,
  Receipt,
  QrCode,
  CreditCard,
  ShoppingBag,
  Package,
  Layers,
  Utensils,
  Coffee,
  Trash2,
  FileVideo,
  FileText,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  Bell,
  Check
} from "lucide-react";

interface StaffPersonalDashboardProps {
  user: User;
}

interface ChecklistTask {
  id: string;
  task: string;
  completed: boolean;
  time: string;
}

export const StaffPersonalDashboard: React.FC<StaffPersonalDashboardProps> = ({ user }) => {
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [lastAttendance, setLastAttendance] = useState<any>(null);

  // Initial task state based on staff division and department
  const getInitialTasks = (): ChecklistTask[] => {
    const div = (user.division || '').toUpperCase();
    const dept = ((user as any).department || '').toUpperCase();
    const pos = ((user as any).primaryPosition || '').toUpperCase();

    if (div === 'KASIR' || dept === 'FINANCE' || pos.includes('KASIR')) {
      return [
        { id: "ks-1", task: "Hitung modal awal laci kasir (Float Money Rp 500.000)", completed: true, time: "Shift Pagi" },
        { id: "ks-2", task: "Tes koneksi Mesin EDC (BCA, Mandiri) & Settlement Test", completed: true, time: "Shift Pagi" },
        { id: "ks-3", task: "Cek kertas thermal printer struk & barcode scanner", completed: true, time: "Shift Pagi" },
        { id: "ks-4", task: "Pastikan QRIS Static & Dynamic tersambung ke POS", completed: false, time: "Shift Siang" },
        { id: "ks-5", task: "Input Laporan Omset Kasir & Closing Settlement", completed: false, time: "Shift Full Day" },
      ];
    }

    if (div === 'WAITER' || dept === 'SERVICE' || pos.includes('WAITER') || pos.includes('GREETER') || pos.includes('SERVER')) {
      return [
        { id: "wt-1", task: "Sanitasi permukaan meja & kursi Garden & Indoor AC", completed: true, time: "Shift Pagi" },
        { id: "wt-2", task: "Folding napkin, cutlery polisher & menu card placement", completed: true, time: "Shift Pagi" },
        { id: "wt-3", task: "Pemeriksaan tablet POS Wireless & printer kasir", completed: true, time: "Shift Siang" },
        { id: "wt-4", task: "Cek lilin aromaterapi & lampu gantung garden", completed: false, time: "Shift Full Day" },
      ];
    }

    if (div === 'KITCHEN' || dept === 'KITCHEN' || pos.includes('COOK') || pos.includes('CHEF') || pos.includes('PREP')) {
      return [
        { id: "kt-1", task: "Cek suhu Chiller & Freezer (Target 2-4°C & -18°C)", completed: true, time: "Shift Pagi" },
        { id: "kt-2", task: "Sanitasi talenan warna (Merah, Hijau, Biru, Kuning)", completed: true, time: "Shift Pagi" },
        { id: "kt-3", task: "Persiapan Deep Frying Oil & Kalibrasi Suhu Stove", completed: true, time: "Shift Pagi" },
        { id: "kt-4", task: "Restock FIFO daging steak, seafood & porsi pasta", completed: false, time: "Shift Siang" },
        { id: "kt-5", task: "Catat Wasting Log jika ada bahan rusak/human error", completed: false, time: "Shift Full Day" },
      ];
    }

    if (div === 'BARISTA' || dept === 'BAR' || pos.includes('BARISTA') || pos.includes('BARTENDER') || pos.includes('MIXOLOGIST')) {
      return [
        { id: "bar-1", task: "Flushing & Backflush mesin Espresso La Marzocco", completed: true, time: "Shift Pagi" },
        { id: "bar-2", task: "Dial-in grind size kopi Arabica Single Origin", completed: true, time: "Shift Pagi" },
        { id: "bar-3", task: "Restock Fresh Milk, Syrup, Ice Cube & Garnish", completed: false, time: "Shift Siang" },
        { id: "bar-4", task: "Cek kebersihan blender, shaker & jigger glass", completed: true, time: "Shift Full Day" },
      ];
    }

    if (div === 'HOUSEKEEPING' || dept === 'CLEANING' || pos.includes('DISHWASH') || pos.includes('CLEANING') || pos.includes('GARDEN')) {
      return [
        { id: "hk-1", task: "Refill hand soap, tissue paper & hand sanitizer", completed: true, time: "Shift Pagi" },
        { id: "hk-2", task: "Mop lantai area koridor VIP & area kasir", completed: true, time: "Shift Pagi" },
        { id: "hk-3", task: "Pembersihan area kolam ikan garden & daun gugur", completed: false, time: "Shift Siang" },
        { id: "hk-4", task: "Sanitasi kebersihan toilet & tempat sampah utama", completed: true, time: "Shift Full Day" },
      ];
    }

    if (div === 'CONTENT_CREATOR' || dept === 'MARKETING' || pos.includes('CONTENT') || pos.includes('MEDIA')) {
      return [
        { id: "cc-1", task: "Jadwalkan postingan Instagram Reels & TikTok promo harian", completed: true, time: "Shift Pagi" },
        { id: "cc-2", task: "Pengambilan foto/video menu rekomendasi chef & ambience resto", completed: true, time: "Shift Siang" },
        { id: "cc-3", task: "Balas komentar & DM media sosial pelanggan", completed: false, time: "Shift Siang" },
        { id: "cc-4", task: "Cek performa engagement rate campaign active", completed: true, time: "Shift Full Day" },
      ];
    }

    if (div === 'CRM' || dept === 'CRM' || pos.includes('GUEST') || pos.includes('RESERVATION')) {
      return [
        { id: "crm-1", task: "Follow-up konfirmasi reservasi meja VIP & Event hari ini", completed: true, time: "Shift Pagi" },
        { id: "crm-2", task: "Kirim pesan ucapan selamat ulang tahun & promo ke member VIP", completed: true, time: "Shift Pagi" },
        { id: "crm-3", task: "Cek ulasan & umpan balik pelanggan di Google Maps & WA Hotline", completed: false, time: "Shift Siang" },
        { id: "crm-4", task: "Input data lead prospek event wedding & gathering", completed: false, time: "Shift Full Day" },
      ];
    }

    return [
      { id: "gen-1", task: "Presensi kehadiran shift operasional via Face ID", completed: true, time: "Shift Pagi" },
      { id: "gen-2", task: "Pemeriksaan area kerja & kelengkapan seragam", completed: true, time: "Shift Pagi" },
      { id: "gen-3", task: "Briefing pagi bersama Supervisor & Head Division", completed: false, time: "Shift Siang" },
      { id: "gen-4", task: "Monitoring kelancaran SOP & laporan harian", completed: true, time: "Shift Full Day" },
    ];
  };

  const [tasks, setTasks] = useState<ChecklistTask[]>(getInitialTasks());

  React.useEffect(() => {
    setTasks(getInitialTasks());
  }, [user.id, user.division]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-6 text-white animate-fade-in max-w-7xl mx-auto">
      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* 1. TOP DASHBOARD HEADER */}
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-[#130F30] via-[#1B154B] to-[#130F30] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Dashboard Staff Operasional
            </h1>
          </div>
          <p className="text-xs text-purple-200/80">
            Selamat bekerja, <strong className="text-white font-extrabold">{user.name}</strong> ({user.division})
          </p>
        </div>

        <div className="shrink-0 relative z-10">
          <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOP Shift Active</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN GRID: KPI SCORE & BIOMETRIC FACE ID SCANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Skor KPI & Kinerja Staff */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-black text-sm text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Skor KPI &amp; Kinerja Staff</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              KUARTAL BERJALAN
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score Ring Dial */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="90, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white tracking-tight">90</span>
                <span className="text-[9px] font-black text-purple-300/80 uppercase">SKOR KERJA</span>
              </div>
            </div>

            {/* Performance Text Details */}
            <div className="space-y-3 flex-1 w-full">
              <div>
                <div className="text-[11px] font-bold text-purple-300/80">Status Kinerja</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  Sangat Istimewa (A)
                </div>
                <p className="text-[10px] text-purple-200/60 mt-0.5">
                  Dihitung otomatis berdasarkan kepatuhan SOP harian &amp; ketepatan absensi Face ID.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="p-2.5 rounded-2xl bg-[#09061C] border border-white/10">
                  <span className="text-[9px] text-purple-300 block font-sans">Task Diambil</span>
                  <strong className="text-xs text-white font-bold">{completedCount} Tugas</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#09061C] border border-white/10">
                  <span className="text-[9px] text-purple-300 block font-sans">Kepatuhan SOP Shift</span>
                  <strong className="text-xs text-emerald-400 font-bold">100% Sesuai SOP</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Presensi Biometrik (Face ID Scanner) */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-black text-sm text-white tracking-tight flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Presensi Biometrik (Face ID Scanner)</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SECURE BIOMETRIC
            </span>
          </div>

          <p className="text-xs text-purple-200/80 leading-relaxed">
            Silakan lakukan presensi masuk atau pulang menggunakan teknologi Face ID biometrik wajah. Pastikan pencahayaan ruangan cukup.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setIsFaceModalOpen(true)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Face ID: Masuk Shift</span>
            </button>

            <button
              onClick={() => setIsFaceModalOpen(true)}
              className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white font-extrabold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-purple-300" />
              <span>Face ID: Pulang</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-[#09061C] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-mono">
            <span className="text-purple-300/80 font-sans text-[11px]">Presensi Terakhir Hari Ini:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] shrink-0">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>
                {lastAttendance
                  ? `${lastAttendance.actionType} (${lastAttendance.time})`
                  : "Check In Face ID 08.00 WIB"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. LAYANAN MANDIRI KARYAWAN (SELF-SERVICE HR) */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Layanan Mandiri HR (Staff Self-Service)</span>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </h2>
              <p className="text-xs text-purple-200/70">
                Akses mandiri slip gaji, jadwal shift kerja, dan panduan standar operasional resto.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            Privasi Aman &amp; Terproteksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Presensi & Pengajuan Lembur Card */}
          <Link
            to="/hr?sub=overtime"
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-[#0D0926] to-[#18123B] border border-purple-500/30 hover:border-purple-400/60 transition-all group hover:scale-[1.02] flex flex-col justify-between space-y-3 cursor-pointer shadow-lg shadow-purple-900/20"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SPL &amp; Absensi
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <span>Pengajuan Lembur (SPL)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-purple-200/70 mt-1 leading-relaxed">
                Buat pengajuan surat perintah lembur, lihat persetujuan supervisor, dan rekap jam lembur.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-purple-300">
              <span>Buka Form Lembur</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </Link>

          {/* Jadwal Shift & Roster Card */}
          <Link
            to="/hr?sub=shifts"
            className="p-4 rounded-2xl bg-[#0D0926]/70 border border-white/10 hover:border-purple-500/40 transition-all group hover:scale-[1.02] flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Roster Mingguan
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                <span>Jadwal Shift &amp; Roster</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-purple-200/70 mt-1 leading-relaxed">
                Pantau pembagian shift kerja mingguan dan ajukan permohonan tukar shift antar staf.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-blue-300">
              <span>Lihat Jadwal Shift</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </Link>

          {/* SOP & Panduan Kerja Card */}
          <Link
            to="/hr?sub=sop"
            className="p-4 rounded-2xl bg-[#0D0926]/70 border border-white/10 hover:border-purple-500/40 transition-all group hover:scale-[1.02] flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Standar Resto
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>SOP &amp; Pedoman Kerja</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-purple-200/70 mt-1 leading-relaxed">
                Buku panduan standar pelayanan tamu, resep dapur, kebersihan, dan keselamatan kerja.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span>Buka Dokumen SOP</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. CRM & VIP NOTICE BROADCAST CARD */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/30">
            CRM &amp; VIP NOTICE
          </span>
          <h3 className="font-black text-sm text-white flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-pink-400" />
            <span>Jadwal Reservasi CRM (Broadcast ke Seluruh Staff)</span>
          </h3>
        </div>
        <p className="text-xs text-purple-200/70">
          Daftar meja reservasi &amp; permintaan khusus tamu VIP yang dikirimkan oleh Tim CRM untuk dipersiapkan tim Dapur &amp; Waiters.
        </p>

        <div className="p-4 rounded-2xl bg-[#09061C] border border-white/10 text-center text-xs text-purple-300/60 py-6">
          Belum ada jadwal reservasi khusus yang disiarkan CRM untuk shift ini.
        </div>
      </div>

      {/* 4. CHECKLIST OPERASIONAL DIVISI */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Checklist Operasional Divisi {user.division}</span>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </h2>
              <p className="text-xs text-purple-200/70 mt-0.5">
                Centang tugas operasional harian yang sudah Anda laksanakan selama shift.
              </p>
            </div>
          </div>

          <div className="bg-[#0D0926]/80 p-3.5 rounded-2xl border border-white/10 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-purple-200">Progress Divisi Anda</span>
              <span className="text-emerald-400 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-purple-300/60 mt-1 text-right font-mono">
              {completedCount} dari {total} Tugas Selesai
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none group ${
                t.completed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                  : "bg-[#0D0926]/60 border-white/10 text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {t.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-purple-300/50 group-hover:text-purple-300 shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-extrabold block ${t.completed ? "line-through text-emerald-300/70" : "text-white"}`}>
                    {t.task}
                  </span>
                  <span className="text-[10px] text-purple-300/60 font-mono">Target: {t.time}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                  t.completed
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-white/5 text-purple-300 border-white/10"
                }`}
              >
                {t.completed ? "Selesai" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Face ID Biometric Attendance Modal */}
      <FaceIdAttendanceModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        user={user}
        onSuccessRecord={(rec) => setLastAttendance(rec)}
      />
    </div>
  );
};


// Helper Sub-Component for Metric Cards
interface MetricCardProps {
  title: string;
  value: string;
  badge: string;
  color: "emerald" | "purple" | "blue" | "amber" | "pink";
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, badge, color, icon: Icon }) => {
  const colorMap = {
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  return (
    <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      </div>
      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${colorMap[color]}`}>
          {badge}
        </span>
      </div>
    </div>
  );
};
