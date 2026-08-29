import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Check,
  X,
  Eye,
  AlertCircle
} from 'lucide-react';

interface PendingApproval {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  type: 'LEAVE' | 'OVERTIME' | 'SHIFT_SWAP' | 'BREAK';
  title: string;
  detail: string;
  duration: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'app-01',
    employeeName: 'Azizah',
    employeeCode: 'TG-BAR-002',
    department: 'Bar',
    type: 'LEAVE',
    title: 'Pengajuan Cuti Tahunan',
    detail: 'Keperluan keluarga mendesak di luar kota (2 hari). Sudah koordinasi dengan Dina (Lead Bar).',
    duration: '2 Hari (28 - 29 Ags)',
    date: '2026-08-28',
    status: 'PENDING',
  },
  {
    id: 'app-02',
    employeeName: 'Andun',
    employeeCode: 'TG-KIT-001',
    department: 'Kitchen',
    type: 'OVERTIME',
    title: 'Surat Perintah Lembur (SPL)',
    detail: 'Persiapan Banquet Dinner VIP 45 Pax & Restocking Cold Storage setelah closing.',
    duration: '3.0 Jam (18:00 - 21:00)',
    date: '2026-08-26',
    status: 'PENDING',
  },
  {
    id: 'app-03',
    employeeName: 'Bintang',
    employeeCode: 'TG-SRV-002',
    department: 'Service',
    type: 'SHIFT_SWAP',
    title: 'Permohonan Tukar Shift',
    detail: 'Tukar jadwal Shift Pagi dengan Yuda (Shift Siang) untuk tanggal 27 Agustus.',
    duration: 'Shift Siang ⇄ Shift Pagi',
    date: '2026-08-27',
    status: 'PENDING',
  },
  {
    id: 'app-04',
    employeeName: 'Fandi',
    employeeCode: 'TG-KIT-005',
    department: 'Kitchen',
    type: 'LEAVE',
    title: 'Izin Sakit dengan Surat Dokter',
    detail: 'Pemeriksaan rawat jalan tipes ringan, surat keterangan dokter klinik Canggu terlampir.',
    duration: '1 Hari (26 Ags)',
    date: '2026-08-26',
    status: 'PENDING',
  },
];

export const HRCommandCenterView: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    const item = approvals.find((a) => a.id === id);
    const actionLabel = newStatus === 'APPROVED' ? 'disetujui' : 'ditolak';
    setFeedbackToast(`Pengajuan ${item?.title} atas nama ${item?.employeeName} berhasil ${actionLabel}.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const filteredApprovals = approvals.filter((app) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PENDING') return app.status === 'PENDING';
    return app.type === filterType;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-gray-100 animate-fade-in">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{feedbackToast}</span>
        </div>
      )}

      {/* Main Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B1538] via-[#161B33] to-[#0F172A] p-6 md:p-8 border border-purple-500/30 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HR &amp; People Operations Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Manajemen Sumber Daya Manusia
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Monitoring terpadu 25 personel Tropical Garden Resto Canggu: presensi harian, pembagian stasiun, antrean otorisasi cuti &amp; lembur, serta integrasi pengembangan SDM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/hr?sub=attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#283049] hover:bg-[#343e5e] text-gray-100 text-xs font-bold transition-all border border-[#3E4C6D] cursor-pointer shadow-sm"
            >
              <Clock className="w-4 h-4 text-purple-300" />
              <span>Log Presensi Shift</span>
            </button>
            <button
              onClick={() => navigate('/development')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-white" />
              <span>Modul Development</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Headcount */}
        <div
          onClick={() => navigate('/hr?sub=employees')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white group-hover:text-purple-300 transition-colors">25</span>
            <span className="text-xs text-gray-400 font-semibold">Personel Terdaftar</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-emerald-400 font-medium">19 Tetap</span>
            <span className="text-blue-300 font-medium">5 Kontrak</span>
            <span className="text-amber-300 font-medium">1 Probation</span>
          </div>
        </div>

        {/* Card 2: Attendance Today */}
        <div
          onClick={() => navigate('/hr?sub=attendance')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-emerald-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kehadiran Hari Ini</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">21 / 21</span>
            <span className="text-xs text-emerald-400/90 font-bold">(100% On-Duty)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-gray-300">2 Off Libur</span>
            <span className="text-amber-300">2 Cuti / Izin</span>
            <span className="text-emerald-400 font-bold">0 Alpha</span>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-amber-500/50 transition-all space-y-3 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Antrean Otorisasi</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{pendingCount}</span>
            <span className="text-xs text-gray-400 font-semibold">Menunggu Review HR</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-amber-300 font-medium">Cuti, SPL &amp; Swap</span>
            <span className="text-purple-300 font-semibold">Respons Segera</span>
          </div>
        </div>

        {/* Card 4: Discipline & SOP */}
        <div
          onClick={() => navigate('/hr?sub=kpi')}
          className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-blue-500/50 transition-all cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skor Kepatuhan SOP</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-300 group-hover:text-blue-200 transition-colors">98.6%</span>
            <span className="text-xs text-emerald-400 font-bold">+1.4% MoM</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#283049] text-gray-400">
            <span className="text-gray-300">Grooming &amp; Hygiene</span>
            <span className="text-emerald-400 font-semibold">Grade A</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Approvals Hub & Station Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Approval & HR Actions Hub */}
        <div className="lg:col-span-2 rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#283049] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-100">Pusat Persetujuan &amp; Otorisasi HR</h3>
                <p className="text-xs text-gray-400">Verifikasi permohonan cuti, SPL lembur, dan pergantian shift kerja</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#2D374E] overflow-x-auto text-xs">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'PENDING', label: `Pending (${pendingCount})` },
                { id: 'LEAVE', label: 'Cuti / Sakit' },
                { id: 'OVERTIME', label: 'SPL Lembur' },
                { id: 'SHIFT_SWAP', label: 'Tukar Shift' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Approvals */}
          <div className="space-y-3">
            {filteredApprovals.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#111827] border border-[#283049] text-gray-400 text-xs">
                Tidak ada pengajuan dalam kategori ini.
              </div>
            ) : (
              filteredApprovals.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    app.status === 'APPROVED'
                      ? 'bg-emerald-950/20 border-emerald-900/40'
                      : app.status === 'REJECTED'
                      ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
                      : 'bg-[#111827] border-[#2D374E] hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          app.type === 'LEAVE'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : app.type === 'OVERTIME'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {app.type === 'LEAVE' ? 'Cuti / Sakit' : app.type === 'OVERTIME' ? 'Lembur SPL' : 'Tukar Shift'}
                      </span>
                      <span className="font-bold text-sm text-gray-200">{app.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#1E2438] text-gray-300 border border-[#2D374E]">
                        {app.duration}
                      </span>
                      {app.status === 'APPROVED' && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Disetujui
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                          <X className="w-3 h-3" /> Ditolak
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{app.detail}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1E2438] text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{app.employeeName}</span>
                      <span>•</span>
                      <span>{app.employeeCode}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-medium">{app.department}</span>
                    </div>

                    {app.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleAction(app.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/60 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">Status telah diperbarui oleh HR</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Station Radar & Headcount Allocation */}
        <div className="space-y-6">
          {/* Station Roster Radar */}
          <div className="rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-gray-100">Kekuatan Stasiun Hari Ini</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                Lengkap (100%)
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Kitchen & Dapur', count: 8, detail: 'Head Chef, 4 Cook, 3 Prep/Helper', status: 'Optimal' },
                { name: 'Bar & Beverage', count: 3, detail: 'Lead Barista & 2 Mixologists', status: 'Optimal' },
                { name: 'Floor Service', count: 4, detail: 'Supervisor, Greeter & 2 Waitstaff', status: 'Optimal' },
                { name: 'Cleaning & Stewarding', count: 2, detail: '2 Hygiene & Dishwasher', status: 'Optimal' },
                { name: 'CRM & Front Desk', count: 2, detail: 'Guest Relation & Reservation', status: 'Optimal' },
                { name: 'Finance, Marketing & HR', count: 6, detail: 'Executive, Mgr, HR, Fin, Content', status: 'Optimal' },
              ].map((st, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#111827] border border-[#283049] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-200">{st.name}</span>
                    <span className="font-extrabold text-purple-300 font-mono">{st.count} Staf</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>{st.detail}</span>
                    <span className="text-emerald-400 font-medium">● {st.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probation & Contract Expiry Reminder */}
          <div className="rounded-3xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#283049] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-gray-100">Status Probation &amp; Kontrak</h3>
              </div>
              <span className="text-[10px] text-amber-300 font-bold">2 Perhatian</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">Budi (Cook Helper)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Probation</span>
                </div>
                <p className="text-[11px] text-gray-300">Masa percobaan 3 bulan berakhir: 30 September 2026. Jadwal evaluasi berkala telah siap.</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-300">Fandi (Cook)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Kontrak</span>
                </div>
                <p className="text-[11px] text-gray-300">Masa kontrak berakhir dalam 24 hari. Rekomendasi perpanjangan SPK telah diajukan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Banner to Development Module */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#1E2438] to-indigo-950/60 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-white">Integrasi Modul Pengembangan &amp; HR Academy</h4>
            <p className="text-xs text-gray-300 max-w-2xl mt-0.5">
              Kelola kurikulum pelatihan karyawan, bank materi SOP, form assessment 360, serta action plan peningkatan performa staf resto.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/development')}
          className="shrink-0 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
        >
          <span>Buka Modul Development</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
