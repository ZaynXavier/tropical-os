import React, { useState } from 'react';
import { EnrichedBreakRecord } from '../../types/break';
import { breakService } from '../../services/breakService';
import { EmployeePersonnel } from '../../types/employee';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface BreakApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  breakRecord: EnrichedBreakRecord | null;
  currentUser: EmployeePersonnel;
  initialMode?: 'APPROVE' | 'REJECT';
}

export const BreakApprovalModal: React.FC<BreakApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  breakRecord,
  currentUser,
  initialMode = 'APPROVE',
}) => {
  const [mode, setMode] = useState<'APPROVE' | 'REJECT'>(initialMode);
  const [approvedDuration, setApprovedDuration] = useState<number>(
    breakRecord?.requestedDurationMinutes || 30
  );
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !breakRecord) return null;

  const handleApprove = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await breakService.approveBreakRequestMock({
        breakId: breakRecord.id,
        approvedDurationMinutes: approvedDuration,
        approverName: `${currentUser.fullName} (${currentUser.primaryPosition})`,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyetujui permohonan istirahat.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setErrorMsg(null);
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setErrorMsg('Alasan penolakan wajib diisi secara jelas (minimal 5 karakter).');
      return;
    }

    setLoading(true);
    try {
      await breakService.rejectBreakRequestMock(
        breakRecord.id,
        rejectionReason.trim(),
        `${currentUser.fullName} (${currentUser.primaryPosition})`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menolak permohonan istirahat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                mode === 'APPROVE'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
              }`}
            >
              {mode === 'APPROVE' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'APPROVE' ? 'Persetujuan Additional Break' : 'Penolakan Additional Break'}
              </h3>
              <p className="text-xs text-gray-400">
                Otorisasi pengajuan istirahat staf oleh Supervisor / Manager
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
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#111827] border border-[#2D374E] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('APPROVE');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'APPROVE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui (Approve)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REJECT');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'REJECT'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Tolak (Reject)
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Employee Request Detail Card */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#2D374E]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Staf Pemohon
              </span>
              <span className="font-bold text-white">
                {breakRecord.employee?.fullName || 'Karyawan'} (
                {breakRecord.employee?.employeeCode || '-'})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div>
                <span className="text-gray-500">Departemen:</span>{' '}
                <span className="font-medium text-gray-200">
                  {breakRecord.employee?.department || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Posisi:</span>{' '}
                <span className="font-medium text-gray-200">
                  {breakRecord.employee?.primaryPosition || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tanggal:</span>{' '}
                <span className="font-medium text-gray-200">{breakRecord.date}</span>
              </div>
              <div>
                <span className="text-gray-500">Shift Aktif:</span>{' '}
                <span className="font-medium text-purple-300">
                  {breakRecord.shiftName || 'Shift Reguler'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2D374E]">
              <span className="text-gray-400 block mb-1">Durasi Yang Diajukan:</span>
              <span className="font-bold text-amber-400 text-sm">
                {breakRecord.requestedDurationMinutes ?? 30} Menit
              </span>
            </div>

            <div className="pt-2 border-t border-[#2D374E]">
              <span className="text-gray-400 block mb-1">Alasan Pengajuan:</span>
              <div className="p-2.5 rounded-xl bg-[#161B2E] border border-[#2D374E] text-gray-200 italic">
                &ldquo;{breakRecord.reason || 'Tidak ada keterangan khusus.'}&rdquo;
              </div>
            </div>
          </div>

          {/* APPROVE FORM */}
          {mode === 'APPROVE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Tentukan Durasi Yang Disetujui (Menit)
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {approvedDuration} Menit
                  </span>
                </label>

                {/* Preset Options */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setApprovedDuration(mins)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        approvedDuration === mins
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={5}
                  max={90}
                  step={5}
                  value={approvedDuration}
                  onChange={(e) => setApprovedDuration(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Catatan / Instruksi Supervisor (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pastikan stasiun bar sudah aman dan hand-off ke rekan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* REJECT FORM */}
          {mode === 'REJECT' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    Alasan Penolakan <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">Wajib diisi</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan alasan operasional penolakan (misal: Sedang peak hour reservasi / headcount lantai kurang)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#111827] border border-rose-500/30 rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-rose-500 transition-all resize-none"
                  required
                />
              </div>

              {/* Quick Reason Snippets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Template Alasan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Sedang jam peak order tamu resto',
                    'Headcount stasiun sedang minimum, tidak dapat ditinggal',
                    'Waktu istirahat mendekati jam closing resto',
                  ].map((snip) => (
                    <button
                      key={snip}
                      type="button"
                      onClick={() => setRejectionReason(snip)}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2D374E] text-[11px] text-gray-300 hover:text-white hover:border-purple-500 text-left transition-all"
                    >
                      {snip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Approver Identity Audit Stamp */}
          <div className="p-3 bg-[#111827] border border-[#2D374E] rounded-2xl flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Otorisator Terverifikasi:
            </span>
            <span className="font-semibold text-gray-200">
              {currentUser.fullName} ({currentUser.accessLevel})
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Tutup
            </button>
            {mode === 'APPROVE' ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui Permohonan</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Permohonan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
