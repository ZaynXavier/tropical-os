import React, { useState, useEffect, useMemo } from 'react';
import {
  EmployeeSchedule,
  EnrichedEmployeeSchedule,
  Shift,
} from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import { AssignScheduleModal } from './AssignScheduleModal';
import {
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  Ban,
  FileText,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface EmployeeScheduleViewProps {
  canManage?: boolean;
  defaultEmployeeId?: string;
}

export const EmployeeScheduleView: React.FC<EmployeeScheduleViewProps> = ({
  canManage = true,
  defaultEmployeeId,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    defaultEmployeeId || 'emp-06' // Default to Ulum (emp-06) or provided employee
  );
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] =
    useState<EnrichedEmployeeSchedule | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Active roster employees (excluding Owner emp-01)
  const rosterStaff = INITIAL_EMPLOYEES.filter(
    (e) => e.id !== 'emp-01' && e.status === 'ACTIVE'
  );

  const selectedEmployee = INITIAL_EMPLOYEES.find((e) => e.id === selectedEmployeeId);

  const loadEmployeeSchedules = async () => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    try {
      const [allShifts, empSchedules] = await Promise.all([
        scheduleService.getShifts(),
        scheduleService.getSchedulesByEmployee(selectedEmployeeId),
      ]);
      setShifts(allShifts);
      setSchedules(empSchedules);
    } catch (err) {
      console.error('Error loading employee schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeSchedules();
  }, [selectedEmployeeId]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Enriched & filtered schedules in chronological order
  const filteredSchedules: EnrichedEmployeeSchedule[] = useMemo(() => {
    const enriched = schedules.map((sch) => {
      const shift = shifts.find((s) => s.id === sch.shiftId);
      return {
        ...sch,
        employee: selectedEmployee,
        shift,
      };
    });

    return enriched
      .filter((s) => {
        if (timelineFilter === 'UPCOMING') return s.date >= todayStr;
        if (timelineFilter === 'PAST') return s.date < todayStr;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, shifts, selectedEmployee, timelineFilter, todayStr]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Employee Selector & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-gray-300">Pilih Karyawan:</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 font-semibold outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              {rosterStaff.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) — {emp.department} • {emp.primaryPosition}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline filters & Add button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#111827] border border-[#2D374E] rounded-2xl p-1">
            <button
              onClick={() => setTimelineFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timelineFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTimelineFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timelineFilter === 'UPCOMING'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Mendatang
            </button>
            <button
              onClick={() => setTimelineFilter('PAST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timelineFilter === 'PAST'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Riwayat Lalu
            </button>
          </div>

          {canManage && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tugaskan Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Employee Summary Card */}
      {selectedEmployee && (
        <div className="p-6 rounded-3xl bg-[#1E2438] border border-[#2D374E] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {selectedEmployee.fullName
                ? selectedEmployee.fullName
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
              <h3 className="text-base font-bold text-white tracking-wide">
                {selectedEmployee.fullName}
              </h3>
              <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-purple-400">
                  {selectedEmployee.employeeCode}
                </span>
                <span>•</span>
                <span>{selectedEmployee.department}</span>
                <span>•</span>
                <span>{selectedEmployee.primaryPosition}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#111827] border border-[#2D374E] text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                Total Jadwal Terdata
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {schedules.filter((s) => s.status !== 'CANCELLED').length} Hari
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline of Schedules */}
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl p-6">
        <h4 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Timeline Penugasan Roster ({filteredSchedules.length} Catatan)</span>
        </h4>

        {filteredSchedules.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            Belum ada jadwal yang sesuai untuk filter ini.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((sch) => {
              const isMorning = sch.shiftId === 'shift-pagi';
              const isToday = sch.date === todayStr;
              const dateObj = new Date(sch.date);

              return (
                <div
                  key={sch.id}
                  onClick={() => setSelectedScheduleForDetail(sch)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isToday
                      ? 'bg-purple-950/20 border-purple-500/50 shadow-md'
                      : 'bg-[#111827] border-[#2D374E] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Shift Icon */}
                    <div
                      className={`p-3 rounded-2xl border shrink-0 ${
                        isMorning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}
                    >
                      {isMorning ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {dateObj.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isMorning ? 'text-amber-400' : 'text-purple-400'
                          }`}
                        >
                          {sch.shift?.name || sch.shiftId}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-gray-300">
                          {sch.shift?.startTime} — {sch.shift?.endTime} WITA
                        </span>
                        <span>•</span>
                        <span>Toleransi: {sch.shift?.gracePeriodMinutes || 10} mnt</span>
                      </div>

                      {sch.supervisorNote && (
                        <div className="text-[11px] text-gray-300 italic flex items-center gap-1.5 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          <span>&ldquo;{sch.supervisorNote}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2D374E]">
                    {sch.status === 'SCHEDULED' && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Terjadwal
                      </span>
                    )}
                    {sch.status === 'COMPLETED' && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Selesai
                      </span>
                    )}
                    {sch.status === 'CANCELLED' && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        Dibatalkan
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleDetailModal
        schedule={selectedScheduleForDetail}
        isOpen={!!selectedScheduleForDetail}
        onClose={() => setSelectedScheduleForDetail(null)}
        onSuccess={loadEmployeeSchedules}
        canManage={canManage}
      />

      <AssignScheduleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadEmployeeSchedules}
        initialEmployeeId={selectedEmployeeId}
      />
    </div>
  );
};
