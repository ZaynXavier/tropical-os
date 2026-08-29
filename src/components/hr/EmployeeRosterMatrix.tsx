import React, { useState, useEffect, useMemo } from 'react';
import {
  EmployeeSchedule,
  EnrichedEmployeeSchedule,
  WeeklyRosterSummary,
  Shift,
} from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { AssignScheduleModal } from './AssignScheduleModal';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Users,
  Info,
  Activity,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';

interface EmployeeRosterMatrixProps {
  canManage?: boolean;
}

export const EmployeeRosterMatrix: React.FC<EmployeeRosterMatrixProps> = ({
  canManage = true,
}) => {
  // Start of current week (Monday)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyRosterSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // View mode: Table vs Mobile Cards
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] =
    useState<EnrichedEmployeeSchedule | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignInitialDate, setAssignInitialDate] = useState<string>('');
  const [assignInitialEmployeeId, setAssignInitialEmployeeId] = useState<string>('');

  // 7 Days of current week (Monday through Sunday)
  const weekDays = useMemo(() => {
    const days: { dateStr: string; label: string; dayName: string; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const fullDayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekMonday);
      d.setDate(currentWeekMonday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      days.push({
        dateStr,
        label: `${dayLabels[i]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayName: fullDayNames[i],
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentWeekMonday]);

  const startDateStr = weekDays[0]?.dateStr;
  const endDateStr = weekDays[6]?.dateStr;

  const loadData = async () => {
    if (!startDateStr || !endDateStr) return;
    setLoading(true);
    try {
      const [allShifts, weekSchedules, summary] = await Promise.all([
        scheduleService.getShifts(),
        scheduleService.getSchedules({
          startDate: startDateStr,
          endDate: endDateStr,
        }),
        scheduleService.getWeeklyRosterSummary(startDateStr, endDateStr),
      ]);
      setShifts(allShifts);
      setSchedules(weekSchedules);
      setWeeklySummary(summary);
    } catch (err) {
      console.error('Error loading roster matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDateStr, endDateStr]);

  // Active roster personnel (excluding emp-01 Tri Hermawanto)
  const filteredEmployees = useMemo(() => {
    return INITIAL_EMPLOYEES.filter((emp) => {
      if (emp.id === 'emp-01' || emp.status !== 'ACTIVE') return false;
      const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.primaryPosition.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [departmentFilter, searchQuery]);

  // Lookup map: employeeId + date -> EmployeeSchedule
  const scheduleMap = useMemo(() => {
    const map = new Map<string, EmployeeSchedule>();
    schedules.forEach((s) => {
      if (s.status !== 'CANCELLED') {
        map.set(`${s.employeeId}_${s.date}`, s);
      }
    });
    return map;
  }, [schedules]);

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    setCurrentWeekMonday(d);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekMonday(new Date(d.setDate(diff)));
  };

  const handleCellClick = (employeeId: string, dateStr: string) => {
    const existing = scheduleMap.get(`${employeeId}_${dateStr}`);
    if (existing) {
      const employee = INITIAL_EMPLOYEES.find((e) => e.id === employeeId);
      const shift = shifts.find((s) => s.id === existing.shiftId);
      setSelectedScheduleForDetail({
        ...existing,
        employee,
        shift,
      });
    } else if (canManage) {
      // Assign on this date
      setAssignInitialEmployeeId(employeeId);
      setAssignInitialDate(dateStr);
      setIsAssignModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigator & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl">
        {/* Week Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#111827] border border-[#2D374E] rounded-2xl p-1 shadow-inner">
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                {weekDays[0]?.label} — {weekDays[6]?.label}
              </span>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentWeek}
            className="px-3.5 py-2 rounded-2xl bg-[#111827] hover:bg-[#2D374E] border border-[#2D374E] text-xs font-semibold text-gray-300 transition-all cursor-pointer"
          >
            Minggu Ini
          </button>
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Switch View Toggle */}
          <div className="flex items-center bg-[#111827] border border-[#2D374E] rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Tampilan Matriks Tabel"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Matriks</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Tampilan Kartu Personel"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Kartu</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none cursor-pointer"
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
              placeholder="Cari personel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-48 pl-8 pr-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* WEEKLY SUMMARY & DEPARTMENT BREAKDOWN */}
      {weeklySummary && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 3 Metric cards on left */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="p-4 rounded-3xl bg-[#1E2438] border border-[#2D374E] space-y-1">
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>Total Shift Minggu Ini</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {weeklySummary.totalSchedules}{' '}
                <span className="text-xs text-gray-400 font-normal">Slot Penugasan</span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#1E2438] border border-amber-500/30 space-y-1">
              <div className="text-xs text-amber-400 flex items-center justify-between">
                <span>Shift Pagi vs Siang</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">{weeklySummary.shiftPagiCount} Pagi</span>
                <span className="text-gray-500">•</span>
                <span className="text-purple-400">{weeklySummary.shiftSiangCount} Siang</span>
              </div>
            </div>
          </div>

          {/* Department Breakdown on right */}
          <div className="lg:col-span-3 bg-[#1E2438] border border-[#2D374E] p-4 rounded-3xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Distribusi Shift Mingguan Per Departemen</span>
              </div>
              <span className="text-[11px] text-gray-400">Total slot 7 hari</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {weeklySummary.departmentBreakdown.map((dept) => {
                const percentage = Math.round((dept.count / dept.requiredWeekly) * 100);
                const isGood = percentage >= 100;

                return (
                  <div
                    key={dept.department}
                    className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1"
                  >
                    <div className="text-[11px] font-bold text-gray-300 truncate">
                      {dept.department}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">{dept.count}</span>
                      <span className="text-[10px] text-gray-400">/ {dept.requiredWeekly}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isGood ? 'bg-emerald-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E2438]/70 border border-[#2D374E] p-4 rounded-2xl text-xs text-gray-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-gray-400 text-[11px] uppercase tracking-wider">
            Keterangan Roster:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center">
              <Sun className="w-2 h-2" />
            </span>
            <span className="text-xs text-amber-300 font-medium">Shift Pagi (09:00 — 19:00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 text-purple-400 flex items-center justify-center">
              <Moon className="w-2 h-2" />
            </span>
            <span className="text-xs text-purple-300 font-medium">Shift Siang (13:00 — 23:00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center">
              <Coffee className="w-2 h-2" />
            </span>
            <span className="text-xs text-gray-400">Libur Shift (OFF)</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-purple-400" />
          <span>Klik kotak jadwal untuk melihat rincian atau mengubah</span>
        </div>
      </div>

      {/* View Mode 1: Roster Matrix Table */}
      {viewMode === 'matrix' ? (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-[#2D374E] bg-[#161B2E]">
                  <th className="py-4 px-5 text-xs font-bold text-gray-300 uppercase tracking-wider sticky left-0 bg-[#161B2E] z-10 w-64 border-r border-[#2D374E]">
                    Karyawan & Posisi
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`py-4 px-3 text-center text-xs font-bold uppercase tracking-wider ${
                        day.isToday
                          ? 'bg-purple-950/40 text-purple-300 border-b-2 border-purple-500'
                          : 'text-gray-300'
                      }`}
                    >
                      <div>{day.dayName}</div>
                      <div className="text-[10px] font-normal text-gray-400">
                        {day.label ? day.label.split(' ')[1] || day.label : ''}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/70 text-xs">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      Tidak ada karyawan yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#111827]/40 transition-colors">
                      {/* Employee Profile Cell (Sticky Left) */}
                      <td className="py-3.5 px-5 sticky left-0 bg-[#1E2438] z-10 border-r border-[#2D374E]">
                        <div className="font-bold text-white text-xs">{emp.fullName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-purple-400">{emp.employeeCode}</span>
                          <span>•</span>
                          <span>{emp.department}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">{emp.primaryPosition}</div>
                      </td>

                      {/* 7 Day Schedule Cells */}
                      {weekDays.map((day) => {
                        const schedule = scheduleMap.get(`${emp.id}_${day.dateStr}`);
                        const isMorning = schedule?.shiftId === 'shift-pagi';

                        return (
                          <td
                            key={day.dateStr}
                            onClick={() => handleCellClick(emp.id, day.dateStr)}
                            className={`p-2 text-center transition-all cursor-pointer ${
                              day.isToday ? 'bg-purple-950/20' : ''
                            }`}
                          >
                            {schedule ? (
                              <div
                                className={`p-2 rounded-2xl border transition-all hover:scale-105 shadow-sm ${
                                  isMorning
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400'
                                    : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                                  {isMorning ? (
                                    <Sun className="w-3 h-3 text-amber-400" />
                                  ) : (
                                    <Moon className="w-3 h-3 text-purple-400" />
                                  )}
                                  <span>{isMorning ? 'Pagi' : 'Siang'}</span>
                                </div>
                                <div className="font-mono text-[9px] text-gray-400 mt-0.5">
                                  {isMorning ? '09:00 - 19:00' : '13:00 - 23:00'}
                                </div>
                              </div>
                            ) : (
                              <div className="p-2 rounded-2xl bg-[#111827]/50 border border-transparent hover:border-gray-700 text-gray-500 text-[11px] font-medium flex items-center justify-center gap-1">
                                <span>OFF</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode 2: Mobile/Tablet Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-3xl shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#2D374E] pb-2.5">
                <div>
                  <h4 className="font-bold text-white text-xs">{emp.fullName}</h4>
                  <p className="text-[11px] text-gray-400">
                    {emp.employeeCode} • {emp.department} • {emp.primaryPosition}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((day) => {
                  const schedule = scheduleMap.get(`${emp.id}_${day.dateStr}`);
                  const isMorning = schedule?.shiftId === 'shift-pagi';

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => handleCellClick(emp.id, day.dateStr)}
                      className={`p-2 rounded-xl text-center border cursor-pointer transition-all ${
                        schedule
                          ? isMorning
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                          : 'bg-[#111827] border-[#2D374E] text-gray-500'
                      }`}
                    >
                      <div className="text-[9px] font-bold text-gray-400">
                        {day.label ? day.label.split(' ')[0] || day.label : ''}
                      </div>
                      <div className="mt-1 flex justify-center">
                        {schedule ? (
                          isMorning ? (
                            <Sun className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Moon className="w-3 h-3 text-purple-400" />
                          )
                        ) : (
                          <span className="text-[9px]">OFF</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ScheduleDetailModal
        schedule={selectedScheduleForDetail}
        isOpen={!!selectedScheduleForDetail}
        onClose={() => setSelectedScheduleForDetail(null)}
        onSuccess={loadData}
        canManage={canManage}
      />

      {/* Assign Modal from empty cell click */}
      <AssignScheduleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadData}
        initialDate={assignInitialDate}
        initialEmployeeId={assignInitialEmployeeId}
      />
    </div>
  );
};

