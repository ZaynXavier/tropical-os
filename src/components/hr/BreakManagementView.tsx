import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { breakService } from '../../services/breakService';
import {
  EnrichedBreakRecord,
  BreakSummary,
  BreakFilterParams,
  BreakMonitoringAlert,
} from '../../types/break';
import { BreakSummaryCard } from './BreakSummaryCard';
import { MyBreakView } from './MyBreakView';
import { TeamBreakManagementView } from './TeamBreakManagementView';
import { BreakHistoryView } from './BreakHistoryView';
import { BreakApprovalModal } from './BreakApprovalModal';
import {
  Coffee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Download,
  RotateCcw,
  Calendar,
  Users,
  Activity,
  Layers,
  ShieldCheck,
  Play,
  Square,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export const BreakManagementView: React.FC = () => {
  const { currentUser } = useAuth();

  // If user is Supervisor, default to TeamBreakManagementView or tabbed navigation
  const defaultTab =
    currentUser?.accessLevel === 'OWNER'
      ? 'executive'
      : currentUser?.accessLevel === 'MANAGER'
      ? 'overview'
      : currentUser?.accessLevel === 'SUPERVISOR'
      ? 'team'
      : 'my-break';

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<BreakSummary | null>(null);
  const [breaks, setBreaks] = useState<EnrichedBreakRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters for Manager All Breaks view
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [alertFilter, setAlertFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Approval Modal
  const [selectedBreakForAction, setSelectedBreakForAction] = useState<{
    record: EnrichedBreakRecord;
    mode: 'APPROVE' | 'REJECT';
  } | null>(null);

  useEffect(() => {
    if (currentUser?.accessLevel !== 'STAFF') {
      loadData();
    }
  }, [selectedDate, departmentFilter, statusFilter, typeFilter, alertFilter, currentUser?.accessLevel]);

  // If user is Staff, render Staff Experience directly
  if (currentUser?.accessLevel === 'STAFF') {
    return <MyBreakView />;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, list] = await Promise.all([
        breakService.getBreakSummary({
          date: selectedDate,
          department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        }),
        breakService.getBreaks({
          date: selectedDate,
          department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
          type: typeFilter !== 'ALL' ? (typeFilter as any) : undefined,
          alertLevel: alertFilter !== 'ALL' ? (alertFilter as any) : undefined,
        }),
      ]);
      setSummary(sum);
      setBreaks(list);
    } catch (err) {
      console.error('Error loading break management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBreaks = breaks.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.employee?.fullName.toLowerCase().includes(q);
      const matchCode = b.employee?.employeeCode.toLowerCase().includes(q);
      const matchPos = b.employee?.primaryPosition.toLowerCase().includes(q);
      const matchReason = b.reason?.toLowerCase().includes(q);
      return matchName || matchCode || matchPos || matchReason;
    }
    return true;
  });

  const activeBreaks = breaks.filter((b) => b.status === 'ACTIVE');
  const pendingRequests = breaks.filter((b) => b.status === 'PENDING');
  const excessiveBreaks = breaks.filter((b) => b.isExcessive);

  const handleExportCSV = () => {
    if (breaks.length === 0) return;
    const headers = [
      'ID',
      'Tanggal',
      'Kode Pegawai',
      'Nama Karyawan',
      'Departemen',
      'Posisi',
      'Shift',
      'Jenis Break',
      'Status',
      'Mulai',
      'Selesai',
      'Durasi (Menit)',
      'Overtime/Excessive',
      'Alasan',
      'Disetujui Oleh',
      'Alasan Penolakan',
    ];

    const rows = breaks.map((b) => [
      b.id,
      b.date,
      b.employee?.employeeCode || '',
      `"${b.employee?.fullName || ''}"`,
      b.employee?.department || '',
      b.employee?.primaryPosition || '',
      b.shiftName || '',
      b.type,
      b.status,
      b.actualStart || '',
      b.actualEnd || '',
      b.durationMinutes ?? b.requestedDurationMinutes ?? '',
      b.isExcessive ? 'YA' : 'TIDAK',
      `"${(b.reason || '').replace(/"/g, '""')}"`,
      `"${(b.approvedBy || '').replace(/"/g, '""')}"`,
      `"${(b.rejectionReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TropicalOS_Break_Report_${selectedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOwner = currentUser?.accessLevel === 'OWNER';
  const isManager = currentUser?.accessLevel === 'MANAGER';
  const isSupervisor = currentUser?.accessLevel === 'SUPERVISOR';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Module Header */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Break Management & Monitoring Portal
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOwner
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isManager
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {isOwner ? 'EXECUTIVE VIEW' : isManager ? 'MANAGER CONTROL' : 'SUPERVISOR'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Standard Break (60m), permohonan Additional Break, live timer monitoring & deteksi
              overtime
            </p>
          </div>
        </div>

        {/* Global Date & Export */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500"
          />
          <button
            onClick={handleExportCSV}
            disabled={breaks.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111827] border border-[#2D374E] hover:border-purple-500 rounded-2xl text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Ekspor</span>
          </button>
          <button
            onClick={loadData}
            title="Segarkan"
            className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-1.5 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {isOwner ? (
          <>
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'executive'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Laporan & Audit Log
            </button>
          </>
        ) : isManager ? (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Live Command Center
            </button>
            <button
              onClick={() => setActiveTab('all-breaks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all-breaks'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Daftar Sesi Hari Ini ({breaks.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Riwayat & Audit Log
            </button>
            <button
              onClick={() => setActiveTab('my-break')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-break'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Portal Istirahat Saya
            </button>
          </>
        ) : (
          /* Supervisor */
          <>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Supervisi Tim
            </button>
            <button
              onClick={() => setActiveTab('my-break')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-break'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Portal Istirahat Saya
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Riwayat Break Tim
            </button>
          </>
        )}
      </div>

      {/* TAB 1: OWNER EXECUTIVE SUMMARY */}
      {activeTab === 'executive' && (
        <div className="space-y-6 animate-fade-in">
          <BreakSummaryCard
            summary={summary}
            loading={loading}
            title={`Ringkasan Eksekutif Istirahat Resto • ${selectedDate}`}
          />

          {/* Department Comparison Card */}
          <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Analisis Efisiensi Istirahat & Tingkat Kepatuhan Staf
                </h3>
              </div>
              <span className="text-xs text-gray-400">Total Karyawan Aktif: 23 Staf</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {summary?.departmentBreakdown.map((dept) => (
                <div
                  key={dept.department}
                  className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{dept.department}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      {dept.totalBreaks} Sesi
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Standard Break:</span>
                      <span className="font-bold text-emerald-400">{dept.standardBreaks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Additional Break:</span>
                      <span className="font-bold text-blue-400">{dept.additionalBreaks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rata-rata Durasi:</span>
                      <span className="font-bold text-white">{dept.averageDurationMinutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overtime / Excessive:</span>
                      <span
                        className={`font-bold ${
                          dept.excessiveCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {dept.excessiveCount} Kasus
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2D374E] flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Status Kedisiplinan:</span>
                    <span
                      className={`font-semibold ${
                        dept.excessiveCount === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {dept.excessiveCount === 0 ? 'Tertib' : 'Perlu Evaluasi'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER LIVE COMMAND CENTER */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary KPIs */}
          <BreakSummaryCard
            summary={summary}
            loading={loading}
            title={`Command Center Istirahat Resto • ${selectedDate}`}
          />

          {/* Realtime Active Breaks Live Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Staf Sedang Break (Active Live Monitoring) */}
            <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Staf Sedang Istirahat Saat Ini ({activeBreaks.length})
                  </h3>
                </div>
                <span className="text-[11px] text-purple-300 font-semibold">Live Real-time</span>
              </div>

              {activeBreaks.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  Saat ini tidak ada staf yang sedang beristirahat. Seluruh tim berada di stasiun.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBreaks.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 bg-[#111827] border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{b.employee?.fullName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300">
                            {b.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {b.employee?.department} • {b.employee?.primaryPosition} • Mulai {b.actualStart} WIB
                        </div>
                        <div className="text-[10px] text-gray-500 italic truncate max-w-xs">
                          {b.reason}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-purple-300 block">
                          Batas {b.approvedDurationMinutes ?? (b.type === 'STANDARD' ? 60 : 30)}m
                        </span>
                        {b.alertLevel === 'WARNING' && (
                          <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 justify-end">
                            <AlertTriangle className="w-3 h-3" /> Overtime
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Pending Requests Ready for Approval */}
            <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                    Pengajuan Menunggu Persetujuan ({pendingRequests.length})
                  </h3>
                </div>
                <span className="text-[11px] text-amber-400/80">Otorisasi Manager / Supervisor</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  Nihil pengajuan additional break yang berstatus PENDING.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-[#111827] border border-amber-500/30 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-white block">
                            {req.employee?.fullName} ({req.employee?.employeeCode})
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {req.employee?.department} • {req.employee?.primaryPosition} • {req.shiftName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {req.requestedDurationMinutes}m req
                        </span>
                      </div>

                      <div className="p-2 bg-[#161B2E] border border-[#2D374E] rounded-xl text-gray-300 italic text-[11px]">
                        &ldquo;{req.reason}&rdquo;
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-500">
                          Diajukan: {new Date(req.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedBreakForAction({ record: req, mode: 'REJECT' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() =>
                              setSelectedBreakForAction({ record: req, mode: 'APPROVE' })
                            }
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGER ALL BREAKS LIST FOR SELECTED DATE */}
      {activeTab === 'all-breaks' && (
        <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4 animate-fade-in">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, kode pegawai, posisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bar">Bar</option>
              <option value="Service">Service</option>
              <option value="Cleaning">Cleaning & Dishwash</option>
              <option value="CRM">CRM</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="STANDARD">Standard (60m)</option>
              <option value="ADDITIONAL">Additional</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Memuat data break...</div>
          ) : filteredBreaks.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Tidak ada catatan break untuk kriteria ini.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2D374E] text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Karyawan</th>
                    <th className="py-3 px-3">Departemen & Shift</th>
                    <th className="py-3 px-3">Tipe</th>
                    <th className="py-3 px-3">Mulai - Selesai</th>
                    <th className="py-3 px-3 text-center">Durasi</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Alasan / Catatan Otorisasi</th>
                    <th className="py-3 px-3 text-right">Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D374E]/50 text-gray-200">
                  {filteredBreaks.map((item) => (
                    <tr key={item.id} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-white">
                          {item.employee?.fullName || 'Karyawan'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {item.employee?.employeeCode || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-gray-300 font-medium">
                          {item.employee?.department || '-'}
                        </div>
                        <div className="text-[10px] text-purple-400">{item.shiftName}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === 'STANDARD'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                        {item.actualStart ? `${item.actualStart} - ${item.actualEnd || 'Aktif'}` : '-'}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {item.durationMinutes ? (
                          <span
                            className={`font-bold ${
                              item.isExcessive ? 'text-rose-400 font-extrabold' : 'text-emerald-400'
                            }`}
                          >
                            {item.durationMinutes}m
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {item.requestedDurationMinutes ? `${item.requestedDurationMinutes}m req` : '-'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'ACTIVE'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                              : item.status === 'APPROVED'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : item.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-gray-400 max-w-xs truncate">
                        {item.status === 'REJECTED' ? (
                          <span className="text-rose-400 italic">
                            Ditolak: {item.rejectionReason}
                          </span>
                        ) : item.approvedBy ? (
                          <span className="text-emerald-400">
                            Disetujui: {item.approvedBy}
                          </span>
                        ) : (
                          item.reason || '-'
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {item.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setSelectedBreakForAction({ record: item, mode: 'REJECT' })
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 cursor-pointer"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() =>
                                setSelectedBreakForAction({ record: item, mode: 'APPROVE' })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUPERVISOR TEAM TAB */}
      {activeTab === 'team' && <TeamBreakManagementView />}

      {/* TAB 5: HISTORY & AUDIT LOG TAB */}
      {activeTab === 'history' && <BreakHistoryView />}

      {/* TAB 6: PERSONAL MY BREAK VIEW */}
      {activeTab === 'my-break' && <MyBreakView />}

      {/* Approval Modal */}
      {selectedBreakForAction && (
        <BreakApprovalModal
          isOpen={Boolean(selectedBreakForAction)}
          onClose={() => setSelectedBreakForAction(null)}
          onSuccess={() => {
            setSelectedBreakForAction(null);
            loadData();
          }}
          breakRecord={selectedBreakForAction.record}
          currentUser={currentUser!}
          initialMode={selectedBreakForAction.mode}
        />
      )}
    </div>
  );
};
