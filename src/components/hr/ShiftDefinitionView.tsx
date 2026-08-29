import React, { useState, useEffect } from 'react';
import { Shift } from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import {
  Clock,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  AlertCircle,
  Timer,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const ShiftDefinitionView: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShifts = async () => {
      setLoading(true);
      try {
        const data = await scheduleService.getShifts();
        setShifts(data);
      } catch (err) {
        console.error('Error loading shifts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadShifts();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Educational Banner Mandate */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#1E2438] to-indigo-900/40 border border-purple-500/30 shadow-xl flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Prinsip Perhitungan Jam Kerja Tropical Garden Resto
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Kebijakan Resmi
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed max-w-4xl">
            <strong className="text-purple-300 font-semibold">
              &ldquo;Durasi terjadwal bukan berarti durasi kerja aktual.&rdquo;
            </strong>{' '}
            Durasi aktual kerja dihitung secara otomatis dan presisi dari selisih waktu presensi:{' '}
            <span className="font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Check In
            </span>{' '}
            —{' '}
            <span className="font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20">
              Check Out
            </span>{' '}
            —{' '}
            <span className="font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
              Break / Istirahat
            </span>
            . Jadwal shift berfungsi sebagai acuan jam operasional dan dispensasi ketepatan waktu (grace period).
          </p>
        </div>
      </div>

      {/* 2 Official Master Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map((shift) => {
          const isMorning = shift.id === 'shift-pagi';

          return (
            <div
              key={shift.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden transition-all ${
                isMorning
                  ? 'bg-gradient-to-br from-[#1E2438] via-[#1C2339] to-[#171E33] border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-gradient-to-br from-[#1E2438] via-[#1A2035] to-[#161B2E] border-purple-500/30 hover:border-purple-500/50'
              }`}
            >
              {/* Top Shift Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl border shadow-lg ${
                        isMorning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-purple-500/10'
                      }`}
                    >
                      {isMorning ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white tracking-wide">{shift.name}</h3>
                        <span className="font-mono text-[11px] text-gray-400">({shift.id})</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {isMorning ? 'Operational Morning & Lunch Service' : 'Operational Evening & Dinner Peak'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {shift.status}
                  </span>
                </div>

                {/* Primary Time Display */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                      Jam Kerja Terjadwal
                    </div>
                    <div className="font-mono text-2xl font-black text-white mt-1 tracking-wider">
                      {shift.startTime} <span className="text-gray-500 font-sans text-lg">—</span> {shift.endTime}{' '}
                      <span className="text-xs font-sans text-gray-400 font-normal">WITA</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-gray-400">Durasi Terjadwal</div>
                    <div
                      className={`text-lg font-bold ${
                        isMorning ? 'text-amber-400' : 'text-purple-400'
                      }`}
                    >
                      {shift.scheduledDurationMinutes / 60} Jam
                    </div>
                  </div>
                </div>

                {/* Parameters & Grace Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Grace Period Toleransi</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {shift.gracePeriodMinutes} Menit{' '}
                      <span className="text-[10px] text-gray-400 font-normal">
                        (Maks: {shift.startTime ? shift.startTime.split(':')[0] : '00'}:{shift.gracePeriodMinutes})
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Departemen Berlakunya</span>
                    </div>
                    <div className="text-sm font-bold text-white">Semua Divisi Resto</div>
                  </div>
                </div>

                {/* Operational Description */}
                <div className="p-3.5 rounded-2xl bg-[#111827]/70 border border-[#2D374E] space-y-1.5">
                  <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    <span>Cakupan Tugas Operasional Shift:</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{shift.description}</p>
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="pt-3 border-t border-[#2D374E] flex items-center justify-between text-[11px] text-gray-400">
                <span>Master Shift Konfigurasi Sistem</span>
                <span className="text-gray-500">ID: {shift.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
