import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import {
  Users,
  Clock,
  Briefcase,
  Award,
  FileEdit,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckSquare,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Download,
  Building,
  Sparkles,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const TopicalHrDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'statistik' | 'kehadiran' | 'lembur' | 'payroll' | 'kpi' | 'perubahanData' | 'checklist'
  >('statistik');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. STATS CALCULATIONS FOR DEMOGRAPHY (Based on Master 25 Personnel)
  const totalEmployees = INITIAL_EMPLOYEES.length;
  const maleCount = INITIAL_EMPLOYEES.filter((e) => e.gender === 'MALE').length;
  const femaleCount = INITIAL_EMPLOYEES.filter((e) => e.gender === 'FEMALE').length;

  const genderData = [
    { name: 'Pria', value: maleCount, color: '#EF4444' }, // Red like reference Image 2
    { name: 'Wanita', value: femaleCount, color: '#3B82F6' }, // Blue like reference Image 2
  ];

  // Generation demographics:
  // Gen Z (1997-2012): majority in F&B (~16 people)
  // Gen Millenial (1981-1996): (~8 people)
  // Gen X (1965-1980): (~1 person / Owner)
  const generationData = [
    { name: 'Baby Boomer (1946-1964)', value: 0, color: '#FACC15' },
    { name: 'Gen X (1965-1980)', value: 1, color: '#DC2626' },
    { name: 'Gen Millenial (1981-1996)', value: 8, color: '#2563EB' },
    { name: 'Gen Z (1997-2012)', value: 16, color: '#22C55E' },
    { name: 'Gen Alpha (2013-2025)', value: 0, color: '#9CA3AF' },
  ];

  const contractData = [
    { name: 'Tetap (Permanent)', count: 18, fill: '#8B5CF6' },
    { name: 'Kontrak (PKWT)', count: 6, fill: '#3B82F6' },
    { name: 'Probation (Percobaan)', count: 1, fill: '#F59E0B' },
  ];

  // 2. CHECKLIST COMPLIANCE DATA
  const divisionChecklists = [
    { division: 'Kitchen', total: 6, completed: 5, pendingApproval: 1, status: '92% On-Track' },
    { division: 'Bar', total: 3, completed: 3, pendingApproval: 0, status: '100% Selesai' },
    { division: 'Service', total: 4, completed: 4, pendingApproval: 0, status: '100% Selesai' },
    { division: 'Cleaning', total: 2, completed: 2, pendingApproval: 0, status: '100% Selesai' },
    { division: 'Kasir & Finance', total: 2, completed: 2, pendingApproval: 0, status: '100% Selesai' },
    { division: 'CRM & WhatsApp', total: 2, completed: 2, pendingApproval: 0, status: '100% Selesai' },
    { division: 'Konten Kreator', total: 1, completed: 1, pendingApproval: 0, status: '100% Selesai' },
    { division: 'HPP & F&B', total: 3, completed: 3, pendingApproval: 0, status: '100% Selesai' },
    { division: 'Supervisor (Putri)', total: 1, completed: 1, pendingApproval: 1, status: 'Menunggu Review GM' },
    { division: 'Manager (Heri)', total: 1, completed: 1, pendingApproval: 0, status: '100% Selesai' },
  ];

  // 3. ATTENDANCE SNAPSHOT
  const todayAttendance = {
    present: 24,
    onTime: 22,
    late: 2,
    onLeave: 1,
    alpha: 0,
    totalShift: 25,
  };

  // 4. DATA CHANGE REQUESTS
  const [dataRequests, setDataRequests] = useState([
    {
      id: 'REQ-001',
      employeeName: 'Roziqin',
      department: 'Service',
      type: 'Perubahan Rekening Bank',
      detail: 'BCA 8839201928 a.n Roziqin',
      date: '2026-08-27',
      status: 'PENDING',
    },
    {
      id: 'REQ-002',
      employeeName: 'Tian',
      department: 'Kitchen',
      type: 'Update Kontak Darurat',
      detail: 'Ibu Sumiati (+62 813-9999-888)',
      date: '2026-08-26',
      status: 'APPROVED',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header Card (HRD Pintar Style Inspired) */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Dashboard Topical HR
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  HRD Pintar Style
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Pusat Statistik Kepegawaian, Checklist Divisi, Roster Kehadiran, & Payroll Tropical Garden Resto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 bg-[#1E2438] px-3 py-1.5 rounded-xl border border-[#2D374E] flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              TROPICAL GARDEN RESTO
            </span>
          </div>
        </div>

        {/* Sub-Tabs (Direct Translation of Reference Image 2) */}
        <div className="mt-5 pt-4 border-t border-[#2D374E] overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { id: 'statistik', label: 'Statistik & Demografi', icon: PieChartIcon },
              { id: 'kehadiran', label: 'Kehadiran & Roster', icon: Clock },
              { id: 'checklist', label: 'Daily Checklist All-Divisi', icon: CheckSquare },
              { id: 'lembur', label: 'Lembur & Terlambat / Cuti', icon: AlertTriangle },
              { id: 'payroll', label: 'Gaji & Kontrak (Payroll)', icon: DollarSign },
              { id: 'kpi', label: 'KPI & Kinerja', icon: Award },
              { id: 'perubahanData', label: 'Pengajuan Perubahan Data', icon: FileEdit },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: STATISTIK & DEMOGRAFI (MATCHING REFERENCE IMAGE 2) */}
      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Quick Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Total Personel</span>
              <div className="text-2xl font-black text-white mt-1">{totalEmployees} Orang</div>
              <span className="text-[11px] text-emerald-400 font-medium">100% Formasi Lengkap</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Rasio Pria : Wanita</span>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {maleCount} : {femaleCount}
              </div>
              <span className="text-[11px] text-gray-400">({Math.round((maleCount / totalEmployees) * 100)}% Pria)</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Karyawan Tetap (PKWTT)</span>
              <div className="text-2xl font-black text-purple-400 mt-1">18 Orang</div>
              <span className="text-[11px] text-purple-300 font-medium">72% Staf Inti</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Tingkat Retensi</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">96.8%</div>
              <span className="text-[11px] text-emerald-300 font-medium">Turnover Rendah</span>
            </div>
          </div>

          {/* Gender & Generasi Charts (Exact visual pattern of Image 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Pie Chart */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2D374E] pb-3 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Gender / Jenis Kelamin
                </h3>
                <span className="text-xs text-gray-400 font-medium">25 Karyawan</span>
              </div>

              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                  <span className="w-4 h-3 rounded-xs bg-[#EF4444] inline-block"></span>
                  Pria ({maleCount} orang - {Math.round((maleCount / totalEmployees) * 100)}%)
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                  <span className="w-4 h-3 rounded-xs bg-[#3B82F6] inline-block"></span>
                  Wanita ({femaleCount} orang - {Math.round((femaleCount / totalEmployees) * 100)}%)
                </div>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={0}
                      dataKey="value"
                      stroke="#1E2438"
                      strokeWidth={3}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`gender-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#2D374E',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Generasi Pie Chart */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2D374E] pb-3 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Generasi Demografi
                </h3>
                <span className="text-xs text-gray-400 font-medium">Usia & Karakter</span>
              </div>

              {/* Legends matching reference image 2 */}
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs bg-[#FACC15]"></span>
                  Baby Boomer (1946-1964): 0
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs bg-[#DC2626]"></span>
                  Gen X (1965-1980): 1
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs bg-[#2563EB]"></span>
                  Gen Millenial (1981-1996): 8
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs bg-[#22C55E]"></span>
                  Gen Z (1997-2012): 16
                </div>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={generationData.filter((g) => g.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      dataKey="value"
                      stroke="#1E2438"
                      strokeWidth={3}
                    >
                      {generationData.map((entry, index) => (
                        <Cell key={`gen-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#2D374E',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Status Kontrak Bar Breakdown */}
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Distribusi Status Kontrak Kepegawaian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contractData.map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1">
                  <span className="text-xs text-gray-400">{item.name}</span>
                  <div className="text-xl font-bold text-white">{item.count} Personel</div>
                  <div className="w-full bg-[#1E2438] rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.count / totalEmployees) * 100}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEHADIRAN & ROSTER */}
      {activeTab === 'kehadiran' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Total Hadir Hari Ini</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">24 / 25</div>
              <span className="text-[11px] text-gray-400">1 Orang Izin Sakit</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Tepat Waktu</span>
              <div className="text-2xl font-black text-blue-400 mt-1">22 Orang</div>
              <span className="text-[11px] text-blue-300 font-medium">91.6% Akurasi</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Terlambat (&gt;15m)</span>
              <div className="text-2xl font-black text-amber-400 mt-1">2 Orang</div>
              <span className="text-[11px] text-amber-300 font-medium">Denda Otomatis Terhitung</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Alpha / Tanpa Kabar</span>
              <div className="text-2xl font-black text-gray-400 mt-1">0 Orang</div>
              <span className="text-[11px] text-emerald-400 font-medium">Disiplin Optimal</span>
            </div>
          </div>

          {/* Live Attendance Table */}
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Presensi Realtime Shift Hari Ini
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                    <th className="py-3 px-3">Nama & Posisi</th>
                    <th className="py-3 px-3">Divisi</th>
                    <th className="py-3 px-3">Jadwal Shift</th>
                    <th className="py-3 px-3">Clock-In Aktual</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Verifikasi Selfie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D374E]">
                  {INITIAL_EMPLOYEES.filter((e) =>
                    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.department.toLowerCase().includes(searchTerm.toLowerCase())
                  ).slice(0, 8).map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-[#111827]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[11px] text-gray-400">{emp.primaryPosition}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{emp.department}</td>
                      <td className="py-3 px-3 text-gray-300">08:00 - 16:00 (Pagi)</td>
                      <td className="py-3 px-3 font-mono text-gray-200">
                        {i === 1 ? '08:18 WIB' : i === 6 ? '08:12 WIB' : '07:54 WIB'}
                      </td>
                      <td className="py-3 px-3">
                        {i === 1 || i === 6 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Terlambat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Tepat Waktu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[11px] text-blue-400 font-medium cursor-pointer hover:underline">
                          Verified GPS (12m)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY CHECKLIST ALL-DIVISI */}
      {activeTab === 'checklist' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  Monitoring Kepatuhan Daily Checklist Seluruh Divisi
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Verifikasi pelaksanaan SOP Opening, Mid-shift, dan Closing shift hari ini.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/40">
                  Wewenang Approval: Supervisor & Manager
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {divisionChecklists.map((div) => (
                <div
                  key={div.division}
                  className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{div.division}</span>
                      <span className="text-[11px] text-gray-400">
                        ({div.completed}/{div.total} Checklist)
                      </span>
                    </div>
                    <div className="text-xs text-gray-300">
                      Status:{' '}
                      <span
                        className={`font-semibold ${
                          div.pendingApproval > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {div.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {div.pendingApproval > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {div.pendingApproval} Menunggu Review
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEMBUR & TERLAMBAT / CUTI */}
      {activeTab === 'lembur' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Rekapitulasi Pengajuan Lembur & Disiplin Kehadiran
            </h3>
            <p className="text-xs text-gray-400">
              Setiap permohonan lembur dan kasbon wajib disetujui secara terpusat oleh General Manager.
            </p>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">2 Permohonan Lembur Menunggu Approval Manager:</span>
                <p className="text-gray-300 mt-0.5">
                  Ulum (Kitchen - 2 Jam Prep Weekend) & Azizah (Bar - 1.5 Jam Event Banquet).
                </p>
              </div>
              <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs cursor-pointer">
                Buka Antrean Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GAJI & KONTRAK (PAYROLL) */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Ringkasan Penggajian & Kontrak Resto
                </h3>
                <p className="text-xs text-gray-400">
                  Estimasi Take Home Pay (THP), Tunjangan Jabatan, Lembur, dan Potongan Keterlambatan.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40">
                Akses Terproteksi: GM & HR Officer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Total Payroll Periode Ini</span>
                <div className="text-xl font-bold text-white mt-1">Rp 84.500.000</div>
                <span className="text-[11px] text-gray-400">25 Personel</span>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Total Estimasi Lembur</span>
                <div className="text-xl font-bold text-amber-400 mt-1">Rp 3.850.000</div>
                <span className="text-[11px] text-gray-400">42 Jam Lembur Terverifikasi</span>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Total Potongan Disiplin</span>
                <div className="text-xl font-bold text-rose-400 mt-1">Rp 450.000</div>
                <span className="text-[11px] text-gray-400">Keterlambatan Shift</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: KPI & KINERJA */}
      {activeTab === 'kpi' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Skor KPI & Evaluasi Kinerja Karyawan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Rata-Rata KPI Resto</span>
                <div className="text-2xl font-black text-purple-400 mt-1">94.2 / 100</div>
                <span className="text-[11px] text-emerald-400 font-semibold">Predikat: Sangat Baik</span>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Divisi Terbaik Bulan Ini</span>
                <div className="text-2xl font-black text-blue-400 mt-1">Bar & Beverage</div>
                <span className="text-[11px] text-blue-300 font-semibold">Skor: 96.8 / 100</span>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
                <span className="text-xs text-gray-400">Employee of the Month</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">Dina (Head Bar)</div>
                <span className="text-[11px] text-emerald-300 font-semibold">Zero Complaint & Perfect Hygiene</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PENGAJUAN PERUBAHAN DATA */}
      {activeTab === 'perubahanData' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-blue-400" />
                Permohonan Pengajuan Perubahan Data Karyawan
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                    <th className="py-3 px-3">ID & Karyawan</th>
                    <th className="py-3 px-3">Divisi</th>
                    <th className="py-3 px-3">Jenis Perubahan</th>
                    <th className="py-3 px-3">Rincian Data Baru</th>
                    <th className="py-3 px-3">Tanggal Submit</th>
                    <th className="py-3 px-3 text-right">Aksi HR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D374E]">
                  {dataRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#111827]/50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white">{req.employeeName}</span>
                        <div className="text-[10px] text-gray-400 font-mono">{req.id}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{req.department}</td>
                      <td className="py-3 px-3 text-blue-400 font-medium">{req.type}</td>
                      <td className="py-3 px-3 text-gray-200">{req.detail}</td>
                      <td className="py-3 px-3 text-gray-400">{req.date}</td>
                      <td className="py-3 px-3 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setDataRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
                                );
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Verifikasi & Simpan
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Disetujui
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
