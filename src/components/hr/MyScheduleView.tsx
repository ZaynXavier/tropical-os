import React, { useState, useEffect, useMemo } from 'react';
import {
  EmployeeSchedule,
  EnrichedEmployeeSchedule,
  Shift,
} from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { EmployeePersonnel } from '../../types/employee';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  AlertCircle,
  FileText,
  Timer,
  Sparkles,
  Info,
  CalendarDays,
} from 'lucide-react';

interface MyScheduleViewProps {
  currentEmployee?: EmployeePersonnel | null;
}

export const MyScheduleView: React.FC<MyScheduleViewProps> = ({
  currentEmployee,
}) => {
  // If no employee provided (e.g. previewing as staff), fallback to Ulum (emp-06 Cook)
  const employee = currentEmployee || INITIAL_EMPLOYEES.find((e) => e.id === 'emp-06')!;

  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Calculate start of current week (Monday)
  const currentWeekDays = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    const list: { dateStr: string; label: string; fullDay: string; isToday: boolean }[] = [];
    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const fullDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const dateStr = cur.toISOString().split('T')[0];
      list.push({
        dateStr,
        label: `${dayLabels[i]}, ${cur.getDate()} ${cur.toLocaleDateString('id-ID', { month: 'short' })}`,
        fullDay: fullDays[i],
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }, [todayStr]);

  const loadMySchedules = async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const [allShifts, mySchedules] = await Promise.all([
        scheduleService.getShifts(),
        scheduleService.getSchedulesByEmployee(employee.id),
      ]);
      setShifts(allShifts);
      setSchedules(mySchedules);
    } catch (err) {
      console.error('Error loading my schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMySchedules();
  }, [employee?.id]);

  // Today's schedule
  const todaySchedule = useMemo(() => {
    const found = schedules.find((s) => s.date === todayStr && s.status !== 'CANCELLED');
    if (!found) return null;
    return {
      ...found,
      shift: shifts.find((sh) => sh.id === found.shiftId),
    };
  }, [schedules, shifts, todayStr]);

  // Tomorrow's schedule
  const tomorrowSchedule = useMemo(() => {
    const found = schedules.find((s) => s.date === tomorrowStr && s.status !== 'CANCELLED');
    if (!found) return null;
    return {
      ...found,
      shift: shifts.find((sh) => sh.id === found.shiftId),
    };
  }, [schedules, shifts, tomorrowStr]);

  // Schedule lookup for current week
  const weekScheduleMap = useMemo(() => {
    const map = new Map<string, { schedule: EmployeeSchedule; shift?: Shift }>();
    schedules.forEach((s) => {
      if (s.status !== 'CANCELLED') {
        map.set(s.date, {
          schedule: s,
          shift: shifts.find((sh) => sh.id === s.shiftId),
        });
      }
    });
    return map;
  }, [schedules, shifts]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personalized Welcome Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#1E2438] to-indigo-900/40 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {employee.fullName
              ? employee.fullName
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
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Jadwal Kerja: {employee.fullName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Staff Roster
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {employee.department} • {employee.primaryPosition} (NIP: {employee.employeeCode})
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-gray-400">Hari Ini</div>
          <div className="text-xs font-bold text-white mt-0.5">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* TODAY & TOMORROW HIGHLIGHT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TODAY'S SHIFT CARD */}
        <div className="p-6 rounded-3xl bg-[#1E2438] border border-[#2D374E] shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Jadwal Hari Ini
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </h4>
                </div>
              </div>

              {todaySchedule ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bertugas
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5" />
                  Libur (OFF)
                </span>
              )}
            </div>

            {todaySchedule ? (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    todaySchedule.shiftId === 'shift-pagi'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-current">
                      {todaySchedule.shiftId === 'shift-pagi' ? (
                        <Sun className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Moon className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-black text-white">
                        {todaySchedule.shift?.name}
                      </div>
                      <div className="font-mono text-xs font-bold mt-0.5">
                        {todaySchedule.shift?.startTime} — {todaySchedule.shift?.endTime} WITA
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Toleransi Grace</div>
                    <div className="font-bold text-emerald-400 text-xs mt-0.5">
                      +{todaySchedule.shift?.gracePeriodMinutes || 10} mnt
                    </div>
                  </div>
                </div>

                {todaySchedule.supervisorNote && (
                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-xs text-gray-300 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-300 block font-semibold">
                        Instruksi Supervisor:
                      </strong>
                      <span className="italic leading-relaxed">
                        &ldquo;{todaySchedule.supervisorNote}&rdquo;
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#111827]/60 border border-[#2D374E] text-center space-y-2">
                <Coffee className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs font-bold text-gray-300">Hari ini Anda Libur Roster (Day Off)</p>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Gunakan waktu istirahat dengan baik. Silakan hubungi supervisor jika membutuhkan penyesuaian jadwal.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-2 border-t border-[#2D374E]">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Pastikan melakukan Check-In via modul Attendance sebelum batas grace period.</span>
          </div>
        </div>

        {/* TOMORROW'S SHIFT CARD */}
        <div className="p-6 rounded-3xl bg-[#1E2438] border border-[#2D374E] shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    Jadwal Besok
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {tomorrow.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </h4>
                </div>
              </div>

              {tomorrowSchedule ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Terjadwal
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">
                  Libur (OFF)
                </span>
              )}
            </div>

            {tomorrowSchedule ? (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    tomorrowSchedule.shiftId === 'shift-pagi'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-current">
                      {tomorrowSchedule.shiftId === 'shift-pagi' ? (
                        <Sun className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Moon className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-black text-white">
                        {tomorrowSchedule.shift?.name}
                      </div>
                      <div className="font-mono text-xs font-bold mt-0.5">
                        {tomorrowSchedule.shift?.startTime} — {tomorrowSchedule.shift?.endTime} WITA
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Durasi Terjadwal</div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {tomorrowSchedule.shift?.scheduledDurationMinutes ? tomorrowSchedule.shift.scheduledDurationMinutes / 60 : 10} Jam
                    </div>
                  </div>
                </div>

                {tomorrowSchedule.supervisorNote && (
                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-xs text-gray-300 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-300 block font-semibold">
                        Instruksi Operasional Besok:
                      </strong>
                      <span className="italic leading-relaxed">
                        &ldquo;{tomorrowSchedule.supervisorNote}&rdquo;
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#111827]/60 border border-[#2D374E] text-center space-y-2">
                <Coffee className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs font-bold text-gray-300">Besok Anda Libur Roster (Day Off)</p>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Tidak ada shift yang dijadwalkan untuk hari esok.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-2 border-t border-[#2D374E]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Persiapkan kehadiran tepat waktu untuk kelancaran operasional resto.</span>
          </div>
        </div>
      </div>

      {/* THIS WEEK (MINGGU INI) 7-DAY ROSTER CARDS */}
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Roster Jadwal Minggu Ini (7 Hari)
            </h4>
          </div>
          <span className="text-xs text-gray-400">
            {currentWeekDays[0]?.label} — {currentWeekDays[6]?.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {currentWeekDays.map((day) => {
            const entry = weekScheduleMap.get(day.dateStr);
            const isMorning = entry?.schedule.shiftId === 'shift-pagi';

            return (
              <div
                key={day.dateStr}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  day.isToday
                    ? 'bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                    : 'bg-[#111827] border-[#2D374E]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{day.fullDay}</span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{day.label ? (day.label.split(', ')[1] || day.label) : ''}</div>
                </div>

                {entry ? (
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isMorning
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {isMorning ? (
                        <Sun className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Moon className="w-3 h-3 text-purple-400" />
                      )}
                      <span>{entry.shift?.name}</span>
                    </div>
                    <div className="font-mono text-[10px] text-gray-300 mt-1 font-semibold">
                      {entry.shift?.startTime} — {entry.shift?.endTime}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-center text-gray-500 text-[11px] font-medium flex items-center justify-center gap-1">
                    <Coffee className="w-3 h-3" />
                    <span>Libur (OFF)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
