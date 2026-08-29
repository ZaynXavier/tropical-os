import React, { useState } from 'react';
import { EnrichedEmployeeSchedule, EmployeeSchedule } from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import {
  X,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sun,
  Moon,
  Ban,
  Building2,
  Trash2,
} from 'lucide-react';

interface ScheduleDetailModalProps {
  schedule: EnrichedEmployeeSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onEdit?: (schedule: EmployeeSchedule) => void;
  canManage?: boolean;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onSuccess,
  onEdit,
  canManage = false,
}) => {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !schedule) return null;

  const isMorning = schedule.shiftId === 'shift-pagi';

  const handleCancelSchedule = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await scheduleService.cancelScheduleMock(
        schedule.id,
        cancelReason.trim() || 'Dibatalkan oleh Supervisor/Manager'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membatalkan jadwal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isMorning
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              }`}
            >
              {isMorning ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Rincian Penugasan Roster
              </h3>
              <p className="text-xs text-gray-400">ID: {schedule.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* Employee Card */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                {schedule.employee?.fullName
                  ? schedule.employee.fullName
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
                <h4 className="font-bold text-white text-sm">{schedule.employee?.fullName}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-purple-400">
                    {schedule.employee?.employeeCode}
                  </span>
                  <span>•</span>
                  <span>{schedule.employee?.primaryPosition}</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{schedule.employee?.department}</p>
              </div>
            </div>

            <div>
              {schedule.status === 'SCHEDULED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terjadwal
                </span>
              )}
              {schedule.status === 'COMPLETED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Selesai (Completed)
                </span>
              )}
              {schedule.status === 'CANCELLED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5" />
                  Dibatalkan
                </span>
              )}
            </div>
          </div>

          {/* Shift & Time Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Tanggal Roster</span>
              </div>
              <div className="font-bold text-white text-sm">
                {new Date(schedule.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shift Ditugaskan</span>
              </div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                {isMorning ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-purple-400" />
                )}
                <span>{schedule.shift?.name || schedule.shiftId}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400">Jam Kerja Terjadwal</div>
              <div className="font-mono font-bold text-white text-base">
                {schedule.shift?.startTime} — {schedule.shift?.endTime} WITA
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400">Grace Period Toleransi</div>
              <div className="font-bold text-emerald-400 text-base">
                {schedule.shift?.gracePeriodMinutes || 10} Menit
              </div>
            </div>
          </div>

          {/* Supervisor Notes */}
          {schedule.supervisorNote && (
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Instruksi Supervisor:</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{schedule.supervisorNote}</p>
            </div>
          )}

          {/* Audit Trail Section */}
          <div className="p-3.5 bg-[#111827] border border-[#2D374E] rounded-2xl space-y-2 text-xs">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Log & Jejak Penugasan</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
              <div>
                <span className="text-gray-500">Dibuat Oleh:</span>{' '}
                <span className="font-semibold text-gray-200">
                  {schedule.createdBy || 'Heri Setiawan (Manager)'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Waktu Dibuat:</span>{' '}
                <span className="font-semibold text-gray-200">
                  {schedule.createdAt
                    ? new Date(schedule.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </div>

              {schedule.updatedBy && (
                <>
                  <div>
                    <span className="text-gray-500">Diperbarui Oleh:</span>{' '}
                    <span className="font-semibold text-gray-200">{schedule.updatedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Waktu Diperbarui:</span>{' '}
                    <span className="font-semibold text-gray-200">
                      {schedule.updatedAt
                        ? new Date(schedule.updatedAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {schedule.status === 'CANCELLED' && (
              <div className="mt-2 pt-2 border-t border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                <div>
                  <span className="text-rose-400 font-semibold">Dibatalkan Oleh:</span>{' '}
                  {schedule.cancelledBy || 'Manager Operasional'}
                  {schedule.cancelledAt && (
                    <span className="text-gray-400 ml-1">
                      (
                      {new Date(schedule.cancelledAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      )
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-rose-400 font-semibold">Alasan Pembatalan:</span>{' '}
                  <span className="italic text-gray-200">
                    &ldquo;{schedule.cancellationReason || 'Tidak disebutkan'}&rdquo;
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cancel Confirmation Prompt */}
          {showCancelPrompt && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-rose-300">Konfirmasi Pembatalan Jadwal</h5>
                  <p className="text-xs text-gray-300 mt-1">
                    Record jadwal tidak akan dihapus demi audit trail, status akan diubah menjadi{' '}
                    <strong>CANCELLED</strong>.
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Alasan pembatalan (contoh: Permohonan cuti disetujui, tukar shift)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-rose-500/40 rounded-xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-rose-400"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCancelSchedule}
                  disabled={loading}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30"
                >
                  {loading ? 'Membatalkan...' : 'Ya, Batalkan Jadwal'}
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2D374E] bg-[#161B2E] flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            Dibuat: {new Date(schedule.createdAt || Date.now()).toLocaleDateString('id-ID')}
          </div>

          <div className="flex items-center gap-2">
            {canManage && schedule.status === 'SCHEDULED' && !showCancelPrompt && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Batalkan Jadwal</span>
                </button>

                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onEdit(schedule);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Ubah
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2D374E] hover:bg-[#3B4866] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
