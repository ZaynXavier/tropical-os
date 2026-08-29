import React, { useState, useEffect } from 'react';
import { breakService } from '../../services/breakService';
import { scheduleService } from '../../services/scheduleService';
import { EmployeePersonnel } from '../../types/employee';
import { EnrichedEmployeeSchedule } from '../../types/schedule';
import {
  X,
  Coffee,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';

interface AdditionalBreakRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: EmployeePersonnel;
  initialDate?: string;
}

export const AdditionalBreakRequestModal: React.FC<AdditionalBreakRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  initialDate,
}) => {
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState<number>(30);
  const [reason, setReason] = useState<string>('');
  const [plannedStart, setPlannedStart] = useState<string>('');
  const [plannedEnd, setPlannedEnd] = useState<string>('');

  const [activeSchedule, setActiveSchedule] = useState<EnrichedEmployeeSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSubmitting(false);
      loadEmployeeSchedule(date);
    }
  }, [isOpen, date, currentUser.id]);

  const loadEmployeeSchedule = async (targetDate: string) => {
    setLoadingSchedule(true);
    try {
      const schedules = await scheduleService.getSchedules({
        employeeId: currentUser.id,
        date: targetDate,
      });
      const active = schedules.find((s) => s.status !== 'CANCELLED');
      setActiveSchedule(active || null);

      // Suggest planned times based on current time
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setPlannedStart(`${h}:${m}`);

      const endMinutes = now.getMinutes() + duration;
      const endHour = now.getHours() + Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      setPlannedEnd(
        `${String(endHour % 24).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
      );
    } catch (err) {
      console.error('Error fetching schedule for break request:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    if (plannedStart) {
      const [h, m] = plannedStart.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const total = h * 60 + m + minutes;
        const eh = Math.floor(total / 60) % 24;
        const em = total % 60;
        setPlannedEnd(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason || reason.trim().length < 5) {
      setErrorMsg('Alasan permohonan istirahat tambahan wajib diisi (minimal 5 karakter).');
      return;
    }

    if (!activeSchedule) {
      setErrorMsg(`Anda tidak memiliki jadwal shift aktif pada tanggal ${date}.`);
      return;
    }

    setSubmitting(true);
    try {
      await breakService.createAdditionalBreakRequestMock({
        employeeId: currentUser.id,
        scheduleId: activeSchedule.id,
        date,
        type: 'ADDITIONAL',
        requestedDurationMinutes: duration,
        reason: reason.trim(),
        requestedBy: currentUser.fullName,
        plannedStart: plannedStart || undefined,
        plannedEnd: plannedEnd || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengajukan Additional Break.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ajukan Additional Break</h3>
              <p className="text-xs text-gray-400">
                Permohonan istirahat tambahan di luar kuota Standard Break (60m)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111827] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User & Active Shift Info Card */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pemohon:</span>
              <span className="font-bold text-white">
                {currentUser.fullName} ({currentUser.employeeCode})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Departemen / Posisi:</span>
              <span className="text-gray-300">
                {currentUser.department} • {currentUser.primaryPosition}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#2D374E]">
              <span className="text-gray-400">Status Shift Pada Tanggal Ini:</span>
              {loadingSchedule ? (
                <span className="text-gray-500">Memeriksa jadwal...</span>
              ) : activeSchedule ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeSchedule.shiftId === 'shift-pagi'
                    ? 'Shift Pagi (09:00 - 19:00)'
                    : 'Shift Siang (13:00 - 23:00)'}
                </span>
              ) : (
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Tidak Ada Shift (OFF)
                </span>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Tanggal Istirahat
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 transition-all"
              required
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Durasi Istirahat Yang Diajukan
              </span>
              <span className="text-purple-400 font-mono font-bold">{duration} Menit</span>
            </label>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleDurationChange(mins)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    duration === mins
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mins} Menit
                </button>
              ))}
            </div>

            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Planned Start and End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Rencana Mulai (WIB)
              </label>
              <input
                type="time"
                value={plannedStart}
                onChange={(e) => {
                  setPlannedStart(e.target.value);
                  const [h, m] = e.target.value.split(':').map(Number);
                  if (!isNaN(h) && !isNaN(m)) {
                    const total = h * 60 + m + duration;
                    const eh = Math.floor(total / 60) % 24;
                    const em = total % 60;
                    setPlannedEnd(
                      `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`
                    );
                  }
                }}
                className="w-full px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Rencana Selesai (Estimasi)
              </label>
              <input
                type="time"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Mandatory Reason Field */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Alasan / Keperluan Break Tambahan <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Wajib diisi</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Perlu minum obat di ruang istirahat / koordinasi serah terima pesanan supplier / keperluan mendesak..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all resize-none"
              required
            />
          </div>

          {/* Policy Note */}
          <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-[11px] text-purple-300/90 leading-relaxed">
            💡 <strong>Ketentuan Operasional:</strong> Additional Break memerlukan persetujuan
            dari Supervisor atau Manager sebelum dapat dimulai di area kerja. Mohon pastikan stasiun
            kerja telah di-back up oleh rekan tim saat Anda istirahat.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !activeSchedule}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
