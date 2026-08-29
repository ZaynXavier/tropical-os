import React, { useState } from 'react';
import { EnrichedOvertimeRecord } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertCircle,
  Calendar,
  X,
  FileText,
  DollarSign,
  Briefcase,
} from 'lucide-react';

interface OvertimeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: EnrichedOvertimeRecord) => void;
  record: EnrichedOvertimeRecord | null;
  mode: 'APPROVE' | 'REJECT';
  currentUserName: string;
  currentUserRole: string;
}

export const OvertimeApprovalModal: React.FC<OvertimeApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  record,
  mode,
  currentUserName,
  currentUserRole,
}) => {
  if (!isOpen || !record) return null;

  const [approvedHours, setApprovedHours] = useState<number>(record.plannedHours);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const calculatedCost =
    record.compensationType === 'COMPENSATORY_OFF'
      ? 0
      : Math.round(approvedHours * record.hourlyBaseRate * record.rateMultiplier);

  const handleApprove = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await overtimeService.approveOvertimeRequest({
        overtimeId: record.id,
        approvedHours: Number(approvedHours),
        approverName: currentUserName,
        approverRole: currentUserRole,
        approvalNotes: approvalNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal menyetujui lembur.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setErrorMessage('Alasan penolakan wajib diisi secara jelas (minimal 5 karakter).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await overtimeService.rejectOvertimeRequest({
        overtimeId: record.id,
        rejectionReason: rejectionReason.trim(),
        rejecterName: currentUserName,
        rejecterRole: currentUserRole,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal menolak lembur.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#181E2E] rounded-2xl border border-[#2D374E] max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                mode === 'APPROVE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {mode === 'APPROVE' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === 'APPROVE' ? 'Persetujuan Pengajuan Lembur' : 'Penolakan Pengajuan Lembur'}
              </h2>
              <p className="text-xs text-gray-400">Verifikasi otoritas atasan operasional resto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252D42] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Employee & Overtime Info Card */}
        <div className="bg-[#111622] rounded-xl border border-[#2D374E] p-3.5 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                {record.employee?.fullName.charAt(0) || 'K'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{record.employee?.fullName}</div>
                <div className="text-[10px] text-gray-400">
                  {record.employee?.employeeCode} • {record.employee?.department} ({record.employee?.primaryPosition})
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {record.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#2D374E]/60 text-gray-300">
            <div>
              <span className="text-[11px] text-gray-400 block">Tanggal & Waktu:</span>
              <span className="font-semibold text-white">
                {record.date} ({record.plannedStart} - {record.plannedEnd})
              </span>
            </div>
            <div>
              <span className="text-[11px] text-gray-400 block">Durasi Diajukan:</span>
              <span className="font-semibold text-purple-300">{record.plannedHours} Jam</span>
            </div>
          </div>

          <div className="text-xs pt-1">
            <span className="text-[11px] text-gray-400 block mb-0.5">Alasan Lembur:</span>
            <div className="p-2 rounded-lg bg-[#181E2E] text-gray-200 text-xs italic">
              "{record.reason}"
            </div>
          </div>

          {record.taskDescription && (
            <div className="text-xs">
              <span className="text-[11px] text-gray-400 block mb-0.5">Rincian Tugas:</span>
              <div className="text-gray-300 text-xs leading-relaxed">{record.taskDescription}</div>
            </div>
          )}
        </div>

        {mode === 'APPROVE' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Penyesuaian Durasi Jam Disetujui (Jam)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={approvedHours}
                  onChange={(e) => setApprovedHours(Number(e.target.value))}
                  className="w-32 bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
                <span className="text-xs text-gray-400">
                  Total biaya disetujui: <strong className="text-emerald-400">{formatRupiah(calculatedCost)}</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Catatan / Instruksi Pengawas (Opsional)
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Contoh: Disetujui untuk banquet. Pastikan area VIP steril sebelum pulang."
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Alasan Penolakan <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rincikan alasan penolakan agar staf dapat memahami pertimbangan operasional..."
                className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#2D374E]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#252D42] transition-colors"
          >
            Batal
          </button>
          {mode === 'APPROVE' ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleApprove}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui Lembur ({approvedHours}h)</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleReject}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Pengajuan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
