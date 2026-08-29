import React, { useState, useEffect } from 'react';
import { Shift, ScheduleConflict } from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

interface BulkScheduleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
}

export const BulkScheduleAssignmentModal: React.FC<BulkScheduleAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedShiftId, setSelectedShiftId] = useState<string>('shift-pagi');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [supervisorNote, setSupervisorNote] = useState<string>('');

  // Department and Search filters for the employee selector list
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Existing schedules mapping on selectedDate for real-time conflict checking
  const [existingScheduledEmpIds, setExistingScheduledEmpIds] = useState<
    Map<string, { shiftId: string; shiftName: string }>
  >(new Map());

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active roster staff (excluding Owner emp-01)
  const rosterStaff = INITIAL_EMPLOYEES.filter(
    (e) => e.id !== 'emp-01' && e.status === 'ACTIVE'
  );

  useEffect(() => {
    const loadShifts = async () => {
      const data = await scheduleService.getShifts();
      setShifts(data);
    };
    loadShifts();
  }, []);

  // Fetch existing schedules on selectedDate to detect conflicts
  useEffect(() => {
    const fetchExistingSchedules = async () => {
      if (!selectedDate) return;
      const schedules = await scheduleService.getSchedulesByDate(selectedDate);
      const shiftList = await scheduleService.getShifts();
      const map = new Map<string, { shiftId: string; shiftName: string }>();

      schedules.forEach((s) => {
        if (s.status !== 'CANCELLED') {
          const shift = shiftList.find((sh) => sh.id === s.shiftId);
          map.set(s.employeeId, {
            shiftId: s.shiftId,
            shiftName: shift?.name || s.shiftId,
          });
        }
      });

      setExistingScheduledEmpIds(map);
    };

    fetchExistingSchedules();
  }, [selectedDate, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate || new Date().toISOString().split('T')[0]);
      setSelectedShiftId('shift-pagi');
      setSelectedEmpIds([]);
      setSupervisorNote('');
      setErrorMessage(null);
    }
  }, [isOpen, initialDate]);

  // Filtered employees in selection list
  const filteredEmployees = rosterStaff.filter((emp) => {
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const toggleSelectEmployee = (empId: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSelectAllFiltered = () => {
    const availableFilteredIds = filteredEmployees
      .filter((e) => !existingScheduledEmpIds.has(e.id))
      .map((e) => e.id);

    const merged = Array.from(new Set([...selectedEmpIds, ...availableFilteredIds]));
    setSelectedEmpIds(merged);
  };

  const handleDeselectAll = () => {
    setSelectedEmpIds([]);
  };

  // Find any conflicts in currently selected employees
  const detectedConflicts: { empName: string; existingShift: string }[] = [];
  selectedEmpIds.forEach((empId) => {
    const existing = existingScheduledEmpIds.get(empId);
    if (existing) {
      const emp = INITIAL_EMPLOYEES.find((e) => e.id === empId);
      detectedConflicts.push({
        empName: emp?.fullName || empId,
        existingShift: existing.shiftName,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmpIds.length === 0) {
      setErrorMessage('Pilih minimal satu karyawan untuk ditugaskan.');
      return;
    }

    if (detectedConflicts.length > 0) {
      setErrorMessage(
        `Terdapat ${detectedConflicts.length} konflik jadwal. Batalkan pilihan karyawan yang sudah memiliki jadwal atau ubah tanggal.`
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await scheduleService.createBulkSchedulesMock({
        employeeIds: selectedEmpIds,
        shiftId: selectedShiftId,
        date: selectedDate,
        supervisorNote: supervisorNote.trim() || undefined,
        notes: 'Penugasan Roster Massal',
      });

      if (res.conflicts.length > 0) {
        setErrorMessage(`Sebagian gagal: ${res.conflicts.map((c) => c.reason).join(', ')}`);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses penugasan massal.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Penugasan Jadwal Massal (Bulk Assignment)
              </h3>
              <p className="text-xs text-gray-400">
                Tugaskan beberapa personel sekaligus ke satu shift • Tropical Garden Resto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* Target Date and Shift Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Tanggal Penugasan</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 transition-all font-medium cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Pilih Master Shift Target</span>
              </label>
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 transition-all font-semibold cursor-pointer"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} — {s.endTime} WITA • {s.scheduledDurationMinutes / 60} Jam)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supervisor Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">
              Instruksi / Catatan Supervisor untuk Roster Ini (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Roster weekend peak prep & closing washdown..."
              value={supervisorNote}
              onChange={(e) => setSupervisorNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Employee Selection Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Pilih Personel ({selectedEmpIds.length} Dipilih)</span>
              </label>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2.5 py-1 bg-[#111827] border border-[#2D374E] rounded-xl text-[11px] text-gray-300 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Departemen</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Bar">Bar</option>
                  <option value="Service">Service</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="CRM">CRM</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold rounded-xl border border-purple-500/30 transition-colors cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-[11px] rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Employee Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau jabatan personel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3.5 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Employee Selectable Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmpIds.includes(emp.id);
                const existing = existingScheduledEmpIds.get(emp.id);
                const hasConflict = !!existing;

                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleSelectEmployee(emp.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? hasConflict
                          ? 'bg-amber-500/10 border-amber-500 text-amber-200'
                          : 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : hasConflict
                        ? 'bg-[#111827]/40 border-[#2D374E] opacity-60'
                        : 'bg-[#111827] border-[#2D374E] hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{emp.fullName}</span>
                        <span className="font-mono text-[10px] text-gray-400 font-normal">
                          ({emp.employeeCode})
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {emp.department} • {emp.primaryPosition}
                      </div>

                      {hasConflict && (
                        <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Sudah: {existing.shiftName}</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? hasConflict
                            ? 'bg-amber-500 border-amber-400 text-white'
                            : 'bg-purple-600 border-purple-400 text-white'
                          : 'border-gray-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict Warnings Notice */}
          {detectedConflicts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Terdeteksi {detectedConflicts.length} Konflik Jadwal:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-200">
                {detectedConflicts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.empName}</strong> sudah memiliki jadwal <em>{c.existingShift}</em> pada tanggal tersebut.
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-amber-300 font-semibold pt-1">
                Karyawan tidak boleh memiliki lebih dari satu shift pada hari yang sama.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2D374E]">
            <div className="text-xs text-gray-400">
              Total Personel Terpilih:{' '}
              <strong className="text-purple-400">{selectedEmpIds.length}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-[#2D374E] hover:bg-[#3B4866] text-gray-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || selectedEmpIds.length === 0 || detectedConflicts.length > 0}
                className={`px-6 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2 ${
                  detectedConflicts.length > 0 || selectedEmpIds.length === 0
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Memproses...'
                    : `Tugaskan (${selectedEmpIds.length} Karyawan)`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
