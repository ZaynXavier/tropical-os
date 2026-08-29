import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AttendanceRecord, AttendanceSummary, AttendanceStatus } from '../../../types/attendance';
import { Department } from '../../../types/employee';
import { attendanceService } from '../../../services/attendanceService';
import { FaceIdAttendanceModal } from '../FaceIdAttendanceModal';
import { AttendanceDetailModal } from './AttendanceDetailModal';
import { GeofenceStatusCard } from './GeofenceStatusCard';
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Clock3,
  CalendarCheck,
  ChevronRight,
  Download,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [todayPersonalRecord, setTodayPersonalRecord] = useState<AttendanceRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modals
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<'IN' | 'OUT'>('IN');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AttendanceRecord | null>(
    null
  );

  // Live WITA Clock
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WITA (UTC+8)
      setCurrentTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WITA'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const [allRecords, summaryData] = await Promise.all([
        attendanceService.getAttendanceRecords(),
        attendanceService.getAttendanceSummary(selectedDate),
      ]);

      setRecords(allRecords);
      setSummary(summaryData);

      if (currentUser) {
        const todayRec = await attendanceService.getTodayAttendanceByEmployee(currentUser.id);
        setTodayPersonalRecord(todayRec);
      }
    } catch (e) {
      console.error('Error loading attendance data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, currentUser]);

  // Handle Role Scoping:
  // - STAFF: only personal data
  // - SUPERVISOR: team scope (their department)
  // - MANAGER / OWNER: full visibility
  const scopedRecords = useMemo(() => {
    if (!currentUser) return [];

    let filtered = records;

    // 1. Role boundary filter
    if (currentUser.accessLevel === 'STAFF') {
      filtered = filtered.filter((r) => r.employeeId === currentUser.id);
    } else if (currentUser.accessLevel === 'SUPERVISOR') {
      // Supervisor sees their department team
      filtered = filtered.filter(
        (r) => r.department === currentUser.department || r.employeeId === currentUser.id
      );
    }

    // 2. Date filter (default to selected date if viewing history table for that date, or all if searching)
    if (selectedDate) {
      filtered = filtered.filter((r) => r.date === selectedDate);
    }

    // 3. Department dropdown filter (for Manager/Owner)
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.department === departmentFilter);
    }

    // 4. Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // 5. Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
          (r.employeeNo && r.employeeNo.toLowerCase().includes(q)) ||
          (r.department && r.department.toLowerCase().includes(q)) ||
          (r.primaryPosition && r.primaryPosition.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [records, currentUser, selectedDate, departmentFilter, statusFilter, searchQuery]);

  // Personal Monthly History for Staff
  const personalMonthlyRecords = useMemo(() => {
    if (!currentUser) return [];
    return records.filter((r) => r.employeeId === currentUser.id);
  }, [records, currentUser]);

  const personalStats = useMemo(() => {
    const total = personalMonthlyRecords.length;
    const present = personalMonthlyRecords.filter((r) => r.status === 'PRESENT').length;
    const late = personalMonthlyRecords.filter((r) => r.status === 'LATE').length;
    const leave = personalMonthlyRecords.filter((r) => r.status === 'LEAVE').length;
    const off = personalMonthlyRecords.filter((r) => r.status === 'OFF').length;
    const rate = total > 0 ? (((present + late) / (total - off || 1)) * 100).toFixed(1) : '100';

    return { total, present, late, leave, off, rate };
  }, [personalMonthlyRecords]);

  const handleOpenCheckInModal = () => {
    setModalActionType('IN');
    setIsFaceModalOpen(true);
  };

  const handleOpenCheckOutModal = () => {
    setModalActionType('OUT');
    setIsFaceModalOpen(true);
  };

  const handleRecordSuccess = (newRecord: AttendanceRecord) => {
    setTodayPersonalRecord(newRecord);
    loadAttendanceData();
  };

  const exportAttendanceCSV = () => {
    if (scopedRecords.length === 0) return;
    const headers = [
      'ID',
      'Tanggal',
      'Kode Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Check In',
      'Check Out',
      'Durasi (Jam)',
      'Status',
      'Keterlambatan (Mnt)',
      'Validasi GPS',
      'Face Verification',
    ];

    const rows = scopedRecords.map((r) => [
      r.id,
      r.date,
      r.employeeNo || '',
      `"${r.employeeName || ''}"`,
      r.department || '',
      r.primaryPosition || '',
      r.checkIn || '',
      r.checkOut || '',
      r.durationHours || 0,
      r.status,
      r.lateMinutes || 0,
      r.locationStatus,
      r.faceVerificationStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Tropical_Resto_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isStaff = currentUser?.accessLevel === 'STAFF';
  const isSupervisor = currentUser?.accessLevel === 'SUPERVISOR';
  const isManagerOrOwner =
    currentUser?.accessLevel === 'MANAGER' || currentUser?.accessLevel === 'OWNER';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Tropical HR — Attendance & Presensi
              </h2>
              <p className="text-xs text-gray-400">
                Presensi terverifikasi Geofence Resto & Face ID • Tropical Garden Resto
              </p>
            </div>
          </div>
        </div>

        {/* Live WITA Clock & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
              {currentTimeStr}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#111827] border border-[#2D374E] rounded-2xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-200 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={loadAttendanceData}
            className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-gray-300 hover:text-white hover:bg-[#2D374E] transition-all cursor-pointer"
            title="Refresh Data Presensi"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          {!isStaff && (
            <button
              onClick={exportAttendanceCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: Personal Status & Primary Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check In / Out Main Interactive Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1E2438] via-[#1A2035] to-[#161B2E] border border-[#2D374E] p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  {currentUser?.fullName
                    ? currentUser.fullName
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((n) => n[0] || '')
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'TG'
                    : 'TG'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {currentUser?.fullName || 'Personel Resto'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {currentUser?.primaryPosition} • {currentUser?.department}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {todayPersonalRecord ? (
                  todayPersonalRecord.status === 'LATE' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" />
                      Terlambat ({todayPersonalRecord.lateMinutes} mnt)
                    </span>
                  ) : todayPersonalRecord.status === 'PRESENT' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hadir Hari Ini
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {todayPersonalRecord.status}
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">
                    Belum Check In
                  </span>
                )}
              </div>
            </div>

            {/* Timestamps Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#111827]/80 border border-[#2D374E] rounded-2xl p-3.5 space-y-1">
                <div className="text-[11px] text-gray-400">Jam Masuk (Check In)</div>
                <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                  {todayPersonalRecord?.checkIn || '--:--:--'}
                </div>
              </div>

              <div className="bg-[#111827]/80 border border-[#2D374E] rounded-2xl p-3.5 space-y-1">
                <div className="text-[11px] text-gray-400">Jam Pulang (Check Out)</div>
                <div className="font-mono font-bold text-purple-400 text-sm sm:text-base">
                  {todayPersonalRecord?.checkOut || '--:--:--'}
                </div>
              </div>

              <div className="bg-[#111827]/80 border border-[#2D374E] rounded-2xl p-3.5 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-gray-400">Durasi Kerja Aktual</div>
                <div className="font-bold text-white text-sm sm:text-base">
                  {todayPersonalRecord?.durationHours
                    ? `${todayPersonalRecord.durationHours} Jam`
                    : todayPersonalRecord?.checkIn
                    ? 'Sedang Berjalan'
                    : '0 Jam'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
            {!todayPersonalRecord?.checkIn ? (
              <button
                onClick={handleOpenCheckInModal}
                className="flex-1 min-w-[200px] py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5" />
                <span>CHECK IN (MASUK SHIFT)</span>
              </button>
            ) : !todayPersonalRecord?.checkOut ? (
              <button
                onClick={handleOpenCheckOutModal}
                className="flex-1 min-w-[200px] py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Clock className="w-5 h-5" />
                <span>CHECK OUT (PULANG SHIFT)</span>
              </button>
            ) : (
              <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Presensi Hari Ini Sudah Lengkap (Check In & Check Out Tersimpan)</span>
              </div>
            )}
          </div>
        </div>

        {/* Info & Geofence Status Side Card */}
        <div className="flex flex-col justify-between space-y-4">
          <GeofenceStatusCard className="h-full bg-[#1E2438]! border-[#2D374E]! text-gray-100" />
        </div>
      </div>

      {/* SECTION 2: Attendance Summary Metrics */}
      {isStaff ? (
        // Staff Personal Monthly Overview
        <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Ringkasan Kehadiran Pribadi (Bulan Ini)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {personalStats.rate}% Tingkat Kehadiran
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-center">
              <div className="text-[11px] text-gray-400">Total Hari Kerja</div>
              <div className="text-xl font-bold text-white mt-1">{personalStats.total}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-center">
              <div className="text-[11px] text-emerald-400">Tepat Waktu</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{personalStats.present}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-center">
              <div className="text-[11px] text-amber-400">Terlambat</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{personalStats.late}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-center">
              <div className="text-[11px] text-blue-400">Cuti / Izin</div>
              <div className="text-xl font-bold text-blue-400 mt-1">{personalStats.leave}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] text-gray-400">Libur Shift</div>
              <div className="text-xl font-bold text-gray-300 mt-1">{personalStats.off}</div>
            </div>
          </div>
        </div>
      ) : (
        // Supervisor & Management Summary Cards (24 Personnel Master)
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>Total Karyawan</span>
              <Users className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-white">{summary?.totalEmployees || 24}</div>
            <div className="text-[10px] text-gray-500">Master Personel Resto</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E2438] border border-emerald-500/30 space-y-1">
            <div className="text-xs text-emerald-400 flex items-center justify-between">
              <span>Hadir Tepat Waktu</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{summary?.present || 18}</div>
            <div className="text-[10px] text-gray-400">On-time on shift</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E2438] border border-amber-500/30 space-y-1">
            <div className="text-xs text-amber-400 flex items-center justify-between">
              <span>Terlambat</span>
              <Clock3 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{summary?.late || 2}</div>
            <div className="text-[10px] text-gray-400">Tercatat dispensasi</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E2438] border border-blue-500/30 space-y-1">
            <div className="text-xs text-blue-400 flex items-center justify-between">
              <span>Cuti / Izin</span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">{summary?.leave || 1}</div>
            <div className="text-[10px] text-gray-400">Permohonan disetujui</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>Libur / Off</span>
              <Layers className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-300">{summary?.off || 2}</div>
            <div className="text-[10px] text-gray-500">Roster Day Off</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E2438] border border-purple-500/30 space-y-1">
            <div className="text-xs text-purple-400 flex items-center justify-between">
              <span>Attendance Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {summary?.attendanceRate || 91.7}%
            </div>
            <div className="text-[10px] text-gray-400">Tingkat kehadiran resto</div>
          </div>
        </div>
      )}

      {/* SECTION 3: Attendance History & Search Table */}
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl overflow-hidden space-y-4 p-6">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-purple-400" />
              <span>
                {isStaff
                  ? 'Riwayat Presensi Pribadi'
                  : isSupervisor
                  ? `Log Presensi Tim Divisi (${currentUser?.department})`
                  : 'Log Master Presensi Seluruh Personel'}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Menampilkan {scopedRecords.length} catatan presensi untuk tanggal{' '}
              {new Date(selectedDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isStaff && (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / kode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all w-44"
                />
              </div>
            )}

            {isManagerOrOwner && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Departemen</option>
                <option value="Executive">Executive</option>
                <option value="Management">Management</option>
                <option value="Operations">Operations</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bar">Bar</option>
                <option value="Service">Service</option>
                <option value="Cleaning">Cleaning</option>
                <option value="CRM">CRM</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PRESENT">Hadir (Present)</option>
              <option value="LATE">Terlambat (Late)</option>
              <option value="LEAVE">Cuti / Izin (Leave)</option>
              <option value="OFF">Libur (Off)</option>
              <option value="ABSENT">Alpha / Tidak Hadir</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto custom-scrollbar border border-[#2D374E] rounded-2xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161B2E] text-[11px] text-gray-400 font-semibold border-b border-[#2D374E] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen / Posisi</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validasi GPS</th>
                <th className="py-3 px-4">Face Verification</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E] bg-[#111827]">
              {scopedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Tidak ada catatan presensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                scopedRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecordForDetail(rec)}
                    className="hover:bg-[#1E2438]/70 transition-colors cursor-pointer"
                  >
                    {/* Employee */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{rec.employeeName}</div>
                      <div className="font-mono text-[10px] text-purple-400">{rec.employeeNo}</div>
                    </td>

                    {/* Department / Position */}
                    <td className="py-3 px-4">
                      <div className="text-gray-200">{rec.primaryPosition}</div>
                      <div className="text-[10px] text-gray-400">{rec.department}</div>
                    </td>

                    {/* Check In */}
                    <td className="py-3 px-4 font-mono">
                      {rec.checkIn ? (
                        <span className="text-emerald-400 font-bold">{rec.checkIn}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="py-3 px-4 font-mono">
                      {rec.checkOut ? (
                        <span className="text-purple-400 font-bold">{rec.checkOut}</span>
                      ) : rec.checkIn ? (
                        <span className="text-amber-400 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">
                          On Duty
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4">
                      {rec.durationHours ? `${rec.durationHours} Jam` : '-'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {rec.status === 'PRESENT' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Hadir
                        </span>
                      )}
                      {rec.status === 'LATE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Terlambat ({rec.lateMinutes}m)
                        </span>
                      )}
                      {rec.status === 'LEAVE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Cuti
                        </span>
                      )}
                      {rec.status === 'OFF' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400">
                          Off
                        </span>
                      )}
                      {rec.status === 'ABSENT' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Alpha
                        </span>
                      )}
                    </td>

                    {/* GPS Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          rec.locationStatus === 'VALID'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-gray-500 bg-gray-800'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        {rec.locationStatus === 'VALID'
                          ? `${rec.distanceMeters || 18}m (Valid)`
                          : rec.locationStatus}
                      </span>
                    </td>

                    {/* Face Verification */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          rec.faceVerificationStatus === 'VERIFIED'
                            ? 'text-purple-400 bg-purple-500/10'
                            : 'text-gray-500 bg-gray-800'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        {rec.faceVerificationStatus === 'VERIFIED'
                          ? `Verified (${rec.faceConfidence || 97}%)`
                          : rec.faceVerificationStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecordForDetail(rec);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face ID & Geofence Modal */}
      {currentUser && (
        <FaceIdAttendanceModal
          isOpen={isFaceModalOpen}
          onClose={() => setIsFaceModalOpen(false)}
          user={{
            id: currentUser.id,
            name: currentUser.fullName,
            email: currentUser.email,
            role: currentUser.accessLevel as any,
            division: currentUser.department as any,
            employee_id: currentUser.employeeCode,
          }}
          actionType={modalActionType}
          onSuccessRecord={handleRecordSuccess}
        />
      )}

      {/* Attendance Detail Drawer/Modal */}
      <AttendanceDetailModal
        record={selectedRecordForDetail}
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
      />
    </div>
  );
};
