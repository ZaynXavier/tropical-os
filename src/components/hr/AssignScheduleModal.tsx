import React, { useState, useEffect } from 'react';
import { Shift, EmployeeSchedule, CreateScheduleInput } from '../../types/schedule';
import { EmployeePersonnel } from '../../types/employee';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
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
  Sparkles,
} from 'lucide-react';

interface AssignScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  initialEmployeeId?: string;
  initialShiftId?: string;
  editingSchedule?: EmployeeSchedule | null;
}

export const AssignScheduleModal: React.FC<AssignScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialEmployeeId,
  initialShiftId,
  editingSchedule,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialEmployeeId || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    initialShiftId || 'shift-pagi'
  );
  const [supervisorNote, setSupervisorNote] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active roster personnel (excluding emp-01 Tri Hermawanto)
  const availableEmployees = INITIAL_EMPLOYEES.filter(
    (e) => e.id !== 'emp-01' && e.status === 'ACTIVE'
  );

  useEffect(() => {
    const loadShifts = async () => {
      const data = await scheduleService.getShifts();
      setShifts(data);
    };
    loadShifts();
  }, []);

  useEffect(() => {
    if (editingSchedule) {
      setSelectedEmployeeId(editingSchedule.employeeId);
      setSelectedDate(editingSchedule.date);
      setSelectedShiftId(editingSchedule.shiftId);
      setSupervisorNote(editingSchedule.supervisorNote || '');
      setNotes(editingSchedule.notes || '');
    } else {
      setSelectedEmployeeId(initialEmployeeId || (availableEmployees[0]?.id || ''));
      setSelectedDate(initialDate || new Date().toISOString().split('T')[0]);
      setSelectedShiftId(initialShiftId || 'shift-pagi');
      setSupervisorNote('');
      setNotes('');
    }
    setConflictWarning(null);
    setErrorMessage(null);
  }, [isOpen, editingSchedule, initialDate, initialEmployeeId, initialShiftId]);

  // Real-time conflict validation check
  useEffect(() => {
    const checkConflict = async () => {
      if (!selectedEmployeeId || !selectedDate || !selectedShiftId) {
        setConflictWarning(null);
        return;
      }

      const input: CreateScheduleInput = {
        employeeId: selectedEmployeeId,
        date: selectedDate,
        shiftId: selectedShiftId,
      };

      const res = await scheduleService.validateScheduleInput(
        input,
        editingSchedule ? editingSchedule.id : undefined
      );

      if (!res.valid) {
        setConflictWarning(res.error || 'Konflik jadwal terdeteksi.');
      } else {
        setConflictWarning(null);
      }
    };

    checkConflict();
  }, [selectedEmployeeId, selectedDate, selectedShiftId, editingSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (editingSchedule) {
        await scheduleService.updateScheduleMock(editingSchedule.id, {
          employeeId: selectedEmployeeId,
          shiftId: selectedShiftId,
          date: selectedDate,
          supervisorNote: supervisorNote.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await scheduleService.createScheduleMock({
          employeeId: selectedEmployeeId,
          shiftId: selectedShiftId,
          date: selectedDate,
          supervisorNote: supervisorNote.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan penugasan jadwal.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {editingSchedule ? 'Ubah Penugasan Jadwal' : 'Penugasan Jadwal Karyawan'}
              </h3>
              <p className="text-xs text-gray-400">Master Roster • Tropical Garden Resto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* Employee Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Pilih Karyawan</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) — {emp.department} • {emp.primaryPosition}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Tanggal Jadwal</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 transition-all cursor-pointer font-medium"
            />
          </div>

          {/* Shift Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Pilih Master Shift</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shifts.map((shift) => {
                const isSelected = selectedShiftId === shift.id;
                const isMorning = shift.id === 'shift-pagi';

                return (
                  <div
                    key={shift.id}
                    onClick={() => setSelectedShiftId(shift.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? isMorning
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                          : 'bg-purple-500/10 border-purple-500 text-white shadow-md shadow-purple-500/10'
                        : 'bg-[#111827] border-[#2D374E] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMorning ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="font-bold text-xs">{shift.name}</span>
                      </div>
                      {isSelected && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isMorning ? 'bg-amber-400' : 'bg-purple-400'
                          }`}
                        />
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-gray-200 mt-2">
                      {shift.startTime} — {shift.endTime}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Durasi: {shift.scheduledDurationMinutes / 60} Jam
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Instruksi / Catatan Supervisor (Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus prep lunch service & sanitasi area..."
              value={supervisorNote}
              onChange={(e) => setSupervisorNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Conflict Warning Notice */}
          {conflictWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Peringatan Konflik Jadwal</strong>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#2D374E] hover:bg-[#3B4866] text-gray-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !!conflictWarning}
              className={`px-6 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2 ${
                conflictWarning
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : editingSchedule ? 'Simpan Perubahan' : 'Tugaskan Jadwal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
