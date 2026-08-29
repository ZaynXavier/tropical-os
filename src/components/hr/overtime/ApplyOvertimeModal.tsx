import React, { useState, useEffect } from 'react';
import {
  OvertimeType,
  OvertimeCompensationType,
  OvertimeRequestInput,
  EnrichedOvertimeRecord,
} from '../../../types/overtime';
import { overtimeService, getBaseHourlyRateForPosition } from '../../../services/overtimeService';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import { Employee } from '../../../types/employee';
import {
  Clock,
  Calendar,
  User,
  FileText,
  DollarSign,
  AlertCircle,
  X,
  Check,
  CheckCircle2,
  Info,
  Briefcase,
} from 'lucide-react';

interface ApplyOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: EnrichedOvertimeRecord) => void;
  defaultEmployeeId?: string;
  isStaffMode?: boolean;
}

export const ApplyOvertimeModal: React.FC<ApplyOvertimeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultEmployeeId,
  isStaffMode = false,
}) => {
  const [employeeId, setEmployeeId] = useState<string>(defaultEmployeeId || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<OvertimeType>('POST_SHIFT');
  const [compensationType, setCompensationType] = useState<OvertimeCompensationType>('PAYROLL');
  const [plannedStart, setPlannedStart] = useState<string>('22:00');
  const [plannedEnd, setPlannedEnd] = useState<string>('23:30');
  const [reason, setReason] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync defaultEmployeeId if passed
  useEffect(() => {
    if (defaultEmployeeId) {
      setEmployeeId(defaultEmployeeId);
    } else if (INITIAL_EMPLOYEES.length > 0 && !employeeId) {
      setEmployeeId(INITIAL_EMPLOYEES[3]?.id || INITIAL_EMPLOYEES[0].id);
    }
  }, [defaultEmployeeId, isOpen]);

  if (!isOpen) return null;

  const selectedEmployee = INITIAL_EMPLOYEES.find((e) => e.id === employeeId);

  // Calculate planned hours
  const calculateHours = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 24 * 60; // Overnight
    return Number(((min2 - min1) / 60).toFixed(2));
  };

  const plannedHours = calculateHours(plannedStart, plannedEnd);
  const hourlyRate = selectedEmployee
    ? getBaseHourlyRateForPosition(selectedEmployee.primaryPosition, selectedEmployee.department)
    : 25000;
  const multiplier = type === 'OFF_DAY' || type === 'SPECIAL_EVENT' ? 2.0 : 1.5;
  const estimatedCost = compensationType === 'COMPENSATORY_OFF' ? 0 : Math.round(plannedHours * hourlyRate * multiplier);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeId) {
      setErrorMessage('Pilih karyawan yang mengajukan lembur.');
      return;
    }

    if (plannedHours <= 0) {
      setErrorMessage('Jam selesai harus lebih besar dari jam mulai.');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMessage('Alasan lembur wajib diisi secara jelas (minimal 5 karakter).');
      return;
    }

    setLoading(true);
    try {
      const input: OvertimeRequestInput = {
        employeeId,
        date,
        type,
        compensationType,
        plannedStart,
        plannedEnd,
        reason: reason.trim(),
        taskDescription: taskDescription.trim() || undefined,
        requestedBy: selectedEmployee?.fullName,
        hourlyBaseRate: hourlyRate,
      };

      const res = await overtimeService.createOvertimeRequest(input);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal mengajukan lembur.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#181E2E] rounded-2xl border border-[#2D374E] max-w-xl w-full p-6 shadow-2xl my-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Formulir Pengajuan Lembur</h2>
              <p className="text-xs text-gray-400">Pencatatan Surat Perintah Lembur (SPL) & Verifikasi Operasional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252D42] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Karyawan Pemohon
            </label>
            {isStaffMode ? (
              <div className="p-3 bg-[#111622] rounded-xl border border-[#2D374E] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                    {selectedEmployee?.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{selectedEmployee?.fullName}</div>
                    <div className="text-[11px] text-gray-400">
                      {selectedEmployee?.employeeCode} • {selectedEmployee?.department} ({selectedEmployee?.primaryPosition})
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  Pemohon
                </span>
              </div>
            ) : (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE').map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode}) — {emp.department} / {emp.primaryPosition}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tanggal & Tipe Lembur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tanggal Pelaksanaan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tipe Lembur
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OvertimeType)}
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="POST_SHIFT">Lembur Setelah Shift (Post-Shift)</option>
                <option value="PRE_SHIFT">Lembur Sebelum Shift (Pre-Shift)</option>
                <option value="OFF_DAY">Lembur Hari Libur (Off-Day / 2.0x)</option>
                <option value="SPECIAL_EVENT">Lembur Acara Khusus / Banquet (2.0x)</option>
              </select>
            </div>
          </div>

          {/* Jam Rencana Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Rencana Mulai
              </label>
              <input
                type="time"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Rencana Selesai
              </label>
              <input
                type="time"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Skema Kompensasi */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Skema Kompensasi Lembur
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompensationType('PAYROLL')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  compensationType === 'PAYROLL'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-[#111622] border-[#2D374E] text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300">Uang Lembur (Payroll)</span>
                  {compensationType === 'PAYROLL' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <div className="text-[10px] text-gray-400">Masuk ke akumulasi slip gaji bulan berjalan</div>
              </button>

              <button
                type="button"
                onClick={() => setCompensationType('COMPENSATORY_OFF')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  compensationType === 'COMPENSATORY_OFF'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-[#111622] border-[#2D374E] text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300">Cuti Pengganti (Off Day)</span>
                  {compensationType === 'COMPENSATORY_OFF' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <div className="text-[10px] text-gray-400">Kompensasi libur ekstra tanpa pembayaran kas</div>
              </button>
            </div>
          </div>

          {/* Alasan & Uraian Tugas */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Alasan Kebutuhan Lembur <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Persiapan banquet 50 pax, stock opname bulanan, deep cleaning"
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Rincian Tugas & Target Output (Opsional)
            </label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Rincikan checklist item pekerjaan yang harus diselesaikan..."
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Kalkulasi Ringkasan & Estimasi Biaya Box */}
          <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Durasi Rencana:</span>
              <span className="font-bold text-white">{plannedHours} Jam</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Tarif Dasar ({selectedEmployee?.primaryPosition || 'Staf'}):</span>
              <span className="text-gray-300">{formatRupiah(hourlyRate)} / jam</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Pengali Lembur:</span>
              <span className="text-purple-300 font-semibold">{multiplier}x (Sesuai Regulasi Resto)</span>
            </div>
            <div className="border-t border-purple-500/20 pt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">Proyeksi Biaya Lembur:</span>
              <span className="text-sm font-bold text-purple-400">{formatRupiah(estimatedCost)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#252D42] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
