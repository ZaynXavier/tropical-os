import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeftRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Utensils,
  PartyPopper
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { StaffReservationsTab } from './StaffReservationsTab';
import { MOCK_STAFF_RESERVATIONS } from '../../../data/mockReservations';

interface StaffScheduleTabProps {
  currentUser: EmployeePersonnel | null;
  onOpenSwapShift: () => void;
  initialSubTab?: 'shifts' | 'reservations';
}

export const StaffScheduleTab: React.FC<StaffScheduleTabProps> = ({
  currentUser,
  onOpenSwapShift,
  initialSubTab = 'shifts',
}) => {
  const [subTab, setSubTab] = useState<'shifts' | 'reservations'>(initialSubTab);
  const [selectedDay, setSelectedDay] = useState(4); // Friday (today)

  const weeklySchedule = [
    { day: 'Sen', date: '24 Agt', shift: 'PAGI', time: '08:00 - 16:00', isOff: false, role: 'Stasiun Utama' },
    { day: 'Sel', date: '25 Agt', shift: 'PAGI', time: '08:00 - 16:00', isOff: false, role: 'Stasiun Utama' },
    { day: 'Rab', date: '26 Agt', shift: 'MIDDLE', time: '12:00 - 20:00', isOff: false, role: 'Prep & Support' },
    { day: 'Kam', date: '27 Agt', shift: 'OFF', time: 'Hari Libur Roster', isOff: true, role: 'Istirahat' },
    { day: 'Jum', date: '28 Agt', shift: 'PAGI', time: '08:00 - 16:00', isOff: false, role: 'Stasiun Utama (Hari Ini)', isToday: true },
    { day: 'Sab', date: '29 Agt', shift: 'CLOSING', time: '15:00 - 23:00', isOff: false, role: 'Weekend Rush' },
    { day: 'Min', date: '30 Agt', shift: 'CLOSING', time: '15:00 - 23:00', isOff: false, role: 'Weekend Rush' },
  ];

  const teamShiftToday = [
    { name: 'Ulum', role: 'Kitchen Head', shift: 'Pagi (08:00 - 16:00)', isOnline: true },
    { name: 'Tasnim', role: 'Kitchen Line Cook', shift: 'Pagi (08:00 - 16:00)', isOnline: true },
    { name: 'Dina', role: 'Barista Head', shift: 'Pagi (08:00 - 16:00)', isOnline: true },
    { name: 'Azizah', role: 'Barista Service', shift: 'Middle (12:00 - 20:00)', isOnline: false },
    { name: 'Maya Anggraini', role: 'Captain Waiter', shift: 'Pagi (08:00 - 16:00)', isOnline: true },
    { name: 'Putri Okta', role: 'Supervisor Outlet', shift: 'All Shift (08:00 - 20:00)', isOnline: true },
  ];

  const todayReservationsCount = MOCK_STAFF_RESERVATIONS.filter(r => r.date === '2026-08-28').length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Switcher: Roster Shift vs Jadwal Reservasi Tamu */}
      <div className="bg-[#161C2C] p-1 rounded-2xl border border-[#2D374E] flex items-center shadow-lg">
        <button
          onClick={() => setSubTab('shifts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'shifts'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal Shift Staff</span>
        </button>

        <button
          onClick={() => setSubTab('reservations')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            subTab === 'reservations'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-cyan-300" />
          <span>Jadwal Reservasi</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
            subTab === 'reservations' ? 'bg-white text-blue-900' : 'bg-blue-500/30 text-cyan-300'
          }`}>
            {todayReservationsCount}
          </span>
        </button>
      </div>

      {/* SubTab Content */}
      {subTab === 'reservations' ? (
        <StaffReservationsTab currentUser={currentUser} />
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Week Header */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C2337] to-[#121724] border border-[#2D374E] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Roster Jadwal Shift Mingguan</h2>
                  <p className="text-[10px] text-gray-400">Periode: 24 - 30 Agustus 2026</p>
                </div>
              </div>
              <button
                onClick={onOpenSwapShift}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Tukar Shift</span>
              </button>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {weeklySchedule.map((s, idx) => (
                <button
                  key={s.date}
                  onClick={() => setSelectedDay(idx)}
                  className={`p-1.5 rounded-xl text-center transition-all cursor-pointer ${
                    selectedDay === idx
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 font-bold scale-105'
                      : s.isOff
                      ? 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
                      : s.isToday
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-[#0B0F19] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-[9px] uppercase">{s.day}</div>
                  <div className="text-[11px] font-mono">{s.date.split(' ')[0]}</div>
                  <div className="text-[8px] truncate mt-0.5">
                    {s.isOff ? 'OFF' : s.shift.charAt(0)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Shift Detail Card */}
          <div className="p-4 rounded-2xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">
                  Detail Shift: {weeklySchedule[selectedDay].day}, {weeklySchedule[selectedDay].date}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  weeklySchedule[selectedDay].isOff
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {weeklySchedule[selectedDay].shift}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0F1420] border border-[#2D374E]">
                <span className="text-[10px] text-gray-400 block">Jam Operasional</span>
                <span className="font-bold text-white font-mono">{weeklySchedule[selectedDay].time}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0F1420] border border-[#2D374E]">
                <span className="text-[10px] text-gray-400 block">Penugasan Stasiun</span>
                <span className="font-bold text-purple-300">{weeklySchedule[selectedDay].role}</span>
              </div>
            </div>
          </div>

          {/* Quick Banner: Direct link to Reservations today */}
          <div
            onClick={() => setSubTab('reservations')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/40 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ada {todayReservationsCount} Reservasi VIP Hari Ini</div>
                <div className="text-[10px] text-blue-200">Lihat detail meja, pre-order &amp; tugas stasiun staff</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyan-300 bg-blue-500/30 px-2 py-1 rounded-lg">
              Buka Jadwal →
            </span>
          </div>

          {/* Teammates on Shift Today */}
          <div className="p-4 rounded-2xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Rekan Kerja Satu Shift Hari Ini</span>
              </div>
              <span className="text-[10px] text-gray-400">{teamShiftToday.length} Karyawan</span>
            </div>

            <div className="space-y-2">
              {teamShiftToday.map((tm) => (
                <div
                  key={tm.name}
                  className="p-2.5 rounded-xl bg-[#0F1420] border border-[#2D374E] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {tm.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{tm.name}</span>
                        {tm.isOnline && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{tm.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-[#161C2C] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                    {tm.shift}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
