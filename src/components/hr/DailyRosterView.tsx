import React, { useState, useEffect, useMemo } from 'react';
import {
  EmployeeSchedule,
  EnrichedEmployeeSchedule,
  DailyRosterSummary,
  Shift,
} from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { AssignScheduleModal } from './AssignScheduleModal';
import { BulkScheduleAssignmentModal } from './BulkScheduleAssignmentModal';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import {
  Calendar,
  Clock,
  Users,
  Sun,
  Moon,
  Plus,
  Zap,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Activity,
  Edit2,
  Ban,
  UserPlus,
} from 'lucide-react';

interface DailyRosterViewProps {
  canManage?: boolean;
}

export const DailyRosterView: React.FC<DailyRosterViewProps> = ({ canManage = true }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [summary, setSummary] = useState<DailyRosterSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUnassigned, setShowUnassigned] = useState<boolean>(true);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [assignInitialEmployeeId, setAssignInitialEmployeeId] = useState<string>('');
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] =
    useState<EnrichedEmployeeSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null);

  const loadDailyData = async () => {
    setLoading(true);
    try {
      const [allShifts, dailySchedules, summaryData] = await Promise.all([
        scheduleService.getShifts(),
        scheduleService.getSchedulesByDate(selectedDate),
        scheduleService.getDailyRosterSummary(selectedDate),
      ]);

      setShifts(allShifts);
      setSchedules(dailySchedules);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading daily roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  // Enrich schedules with Employee details
  const enrichedSchedules: EnrichedEmployeeSchedule[] = useMemo(() => {
    return schedules.map((sch) => {
      const employee = INITIAL_EMPLOYEES.find((e) => e.id === sch.employeeId);
      const shift = shifts.find((s) => s.id === sch.shiftId);
      return {
        ...sch,
        employee,
        shift,
      };
    });
  }, [schedules, shifts]);

  // Filtered by department and search
  const filteredSchedules = useMemo(() => {
    return enrichedSchedules.filter((sch) => {
      if (sch.status === 'CANCELLED') return false; // Hide cancelled from active roster columns
      const matchesDept =
        departmentFilter === 'ALL' || sch.employee?.department === departmentFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        (sch.employee?.fullName && sch.employee.fullName.toLowerCase().includes(q)) ||
        (sch.employee?.employeeCode && sch.employee.employeeCode.toLowerCase().includes(q)) ||
        (sch.employee?.primaryPosition && sch.employee.primaryPosition.toLowerCase().includes(q));
      return matchesDept && matchesQuery;
    });
  }, [enrichedSchedules, departmentFilter, searchQuery]);

  const shiftPagiSchedules = useMemo(() => {
    return filteredSchedules.filter((s) => s.shiftId === 'shift-pagi');
  }, [filteredSchedules]);

  const shiftSiangSchedules = useMemo(() => {
    return filteredSchedules.filter((s) => s.shiftId === 'shift-siang');
  }, [filteredSchedules]);

  // Unassigned active employees on this date (Day Off / Unassigned)
  const scheduledEmpIds = useMemo(() => {
    return new Set(
      schedules.filter((s) => s.status !== 'CANCELLED').map((s) => s.employeeId)
    );
  }, [schedules]);

  const unassignedEmployees = useMemo(() => {
    return INITIAL_EMPLOYEES.filter(
      (e) =>
        e.id !== 'emp-01' &&
        e.status === 'ACTIVE' &&
        !scheduledEmpIds.has(e.id) &&
        (departmentFilter === 'ALL' || e.department === departmentFilter) &&
        (searchQuery.trim() === '' ||
          e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [scheduledEmpIds, departmentFilter, searchQuery]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleAssignSpecificEmployee = (empId: string) => {
    setEditingSchedule(null);
    setAssignInitialEmployeeId(empId);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Header & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl">
        {/* Date Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#111827] border border-[#2D374E] rounded-2xl p-1 shadow-inner">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-2 rounded-2xl bg-[#111827] hover:bg-[#2D374E] border border-[#2D374E] text-xs font-semibold text-gray-300 transition-all cursor-pointer"
          >
            Hari Ini
          </button>

          <div className="text-xs text-gray-300 font-semibold hidden sm:block">
            {new Date(selectedDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {canManage && (
            <>
              <button
                onClick={() => {
                  setEditingSchedule(null);
                  setAssignInitialEmployeeId('');
                  setIsAssignModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tugaskan Karyawan</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Penugasan Massal</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>Total Terjadwal</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {summary?.totalScheduled || 0}{' '}
            <span className="text-xs font-normal text-gray-400">/ 23 Staff</span>
          </div>
          <div className="text-[10px] text-gray-400">Karyawan aktif on duty</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E2438] border border-amber-500/30 space-y-1">
          <div className="text-xs text-amber-400 flex items-center justify-between">
            <span>Shift Pagi</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {summary?.shiftPagiCount || 0}
          </div>
          <div className="text-[10px] text-gray-400">09:00 — 19:00 WITA</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E2438] border border-purple-500/30 space-y-1">
          <div className="text-xs text-purple-400 flex items-center justify-between">
            <span>Shift Siang</span>
            <Moon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {summary?.shiftSiangCount || 0}
          </div>
          <div className="text-[10px] text-gray-400">13:00 — 23:00 WITA</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>Libur (OFF) / Belum Dijadwal</span>
            <Layers className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-300">
            {summary?.unassignedCount || 0}
          </div>
          <div className="text-[10px] text-gray-500">Roster Day Off</div>
        </div>
      </div>

      {/* DEPARTMENT OPERATIONAL COVERAGE INDICATORS */}
      {summary?.coverages && summary.coverages.length > 0 && (
        <div className="bg-[#1E2438] border border-[#2D374E] p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D374E] pb-3">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Status Coverage Staffing Operasional Resto
              </h4>
            </div>
            <span className="text-[11px] text-gray-400">
              Target minimum operasional harian per departemen
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {summary.coverages.map((cov) => {
              const isOptimal = cov.status === 'OPTIMAL';
              const isAdequate = cov.status === 'ADEQUATE';
              const isMinimum = cov.status === 'MINIMUM';
              const isUnderstaffed = cov.status === 'UNDERSTAFFED';

              return (
                <div
                  key={cov.department}
                  className={`p-3 rounded-2xl border transition-all ${
                    isOptimal
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                      : isAdequate
                      ? 'bg-blue-500/5 border-blue-500/30 text-blue-300'
                      : isMinimum
                      ? 'bg-amber-500/5 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cov.department}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isOptimal
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isAdequate
                          ? 'bg-blue-500/20 text-blue-400'
                          : isMinimum
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {cov.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{cov.scheduledStaff}</span>
                    <span className="text-xs text-gray-400">/ {cov.requiredStaff} min</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOptimal
                          ? 'bg-emerald-500'
                          : isAdequate
                          ? 'bg-blue-500'
                          : isMinimum
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, cov.coveragePercentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-gray-300">Filter Divisi:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Divisi Resto</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bar">Bar</option>
            <option value="Service">Service</option>
            <option value="Cleaning">Cleaning</option>
            <option value="CRM">CRM</option>
            <option value="Operations">Operations</option>
            <option value="Management">Management</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, kode, atau posisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3.5 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* ROSTER COLUMNS: SHIFT PAGI & SHIFT SIANG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHIFT PAGI COLUMN */}
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Shift Header Banner */}
          <div className="px-6 py-4 border-b border-[#2D374E] bg-gradient-to-r from-amber-950/40 to-[#161B2E] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">SHIFT PAGI</h3>
                <p className="text-[11px] text-gray-400">
                  09:00 — 19:00 WITA • Durasi: 10 Jam • Grace: 10 mnt
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {shiftPagiSchedules.length} Personel
            </span>
          </div>

          {/* List of Scheduled Personnel */}
          <div className="p-4 divide-y divide-[#2D374E] flex-1">
            {shiftPagiSchedules.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                Belum ada personel yang ditugaskan pada Shift Pagi untuk tanggal ini.
              </div>
            ) : (
              shiftPagiSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="py-3 px-3 hover:bg-[#111827]/80 rounded-2xl transition-all flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => setSelectedScheduleForDetail(sch)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                      {sch.employee?.fullName
                        ? sch.employee.fullName
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
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{sch.employee?.fullName}</span>
                        <span className="font-mono text-[10px] text-gray-400 font-normal">
                          ({sch.employee?.employeeCode})
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {sch.employee?.department} • {sch.employee?.primaryPosition}
                      </div>
                      {sch.supervisorNote && (
                        <div className="text-[10px] text-amber-300/80 italic mt-0.5 line-clamp-1">
                          &ldquo;{sch.supervisorNote}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedScheduleForDetail(sch)}
                      className="px-2.5 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSchedule(sch);
                          setIsAssignModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors cursor-pointer"
                        title="Ubah Jadwal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SHIFT SIANG COLUMN */}
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Shift Header Banner */}
          <div className="px-6 py-4 border-b border-[#2D374E] bg-gradient-to-r from-purple-950/40 to-[#161B2E] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">SHIFT SIANG</h3>
                <p className="text-[11px] text-gray-400">
                  13:00 — 23:00 WITA • Durasi: 10 Jam • Grace: 10 mnt
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {shiftSiangSchedules.length} Personel
            </span>
          </div>

          {/* List of Scheduled Personnel */}
          <div className="p-4 divide-y divide-[#2D374E] flex-1">
            {shiftSiangSchedules.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                Belum ada personel yang ditugaskan pada Shift Siang untuk tanggal ini.
              </div>
            ) : (
              shiftSiangSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="py-3 px-3 hover:bg-[#111827]/80 rounded-2xl transition-all flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => setSelectedScheduleForDetail(sch)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                      {sch.employee?.fullName
                        ? sch.employee.fullName
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
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{sch.employee?.fullName}</span>
                        <span className="font-mono text-[10px] text-gray-400 font-normal">
                          ({sch.employee?.employeeCode})
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {sch.employee?.department} • {sch.employee?.primaryPosition}
                      </div>
                      {sch.supervisorNote && (
                        <div className="text-[10px] text-purple-300/80 italic mt-0.5 line-clamp-1">
                          &ldquo;{sch.supervisorNote}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedScheduleForDetail(sch)}
                      className="px-2.5 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSchedule(sch);
                          setIsAssignModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors cursor-pointer"
                        title="Ubah Jadwal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* UNASSIGNED / DAY OFF COLLAPSIBLE ACCORDION */}
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowUnassigned(!showUnassigned)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#111827]/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-gray-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-200">
                Personel Belum Dijadwalkan / Libur Shift (OFF)
              </h4>
              <p className="text-[11px] text-gray-400">
                {unassignedEmployees.length} Personel tidak memiliki jadwal shift aktif pada tanggal ini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300">
              {unassignedEmployees.length} Personel
            </span>
            {showUnassigned ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {showUnassigned && (
          <div className="p-6 pt-0 border-t border-[#2D374E] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in mt-4">
            {unassignedEmployees.length === 0 ? (
              <div className="col-span-full py-6 text-center text-gray-400 text-xs">
                Seluruh staf telah memiliki jadwal shift untuk tanggal ini.
              </div>
            ) : (
              unassignedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-200 flex items-center gap-1.5">
                      <span>{emp.fullName}</span>
                      <span className="font-mono text-[10px] text-gray-400 font-normal">
                        ({emp.employeeCode})
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {emp.department} • {emp.primaryPosition}
                    </div>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleAssignSpecificEmployee(emp.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tugaskan</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignScheduleModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setEditingSchedule(null);
          setAssignInitialEmployeeId('');
        }}
        onSuccess={loadDailyData}
        initialDate={selectedDate}
        initialEmployeeId={assignInitialEmployeeId}
        editingSchedule={editingSchedule}
      />

      <BulkScheduleAssignmentModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadDailyData}
        initialDate={selectedDate}
      />

      <ScheduleDetailModal
        schedule={selectedScheduleForDetail}
        isOpen={!!selectedScheduleForDetail}
        onClose={() => setSelectedScheduleForDetail(null)}
        onSuccess={loadDailyData}
        canManage={canManage}
        onEdit={(sch) => {
          setEditingSchedule(sch);
          setIsAssignModalOpen(true);
        }}
      />
    </div>
  );
};

