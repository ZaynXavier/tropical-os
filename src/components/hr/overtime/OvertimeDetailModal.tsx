import React, { useState } from 'react';
import { EnrichedOvertimeRecord } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import {
  Clock,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  X,
  FileText,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

interface OvertimeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EnrichedOvertimeRecord | null;
  onRecordUpdated: (updated: EnrichedOvertimeRecord) => void;
  canManage?: boolean;
}

export const OvertimeDetailModal: React.FC<OvertimeDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onRecordUpdated,
  canManage = false,
}) => {
  if (!isOpen || !record) return null;

  const [loading, setLoading] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStartOvertime = async () => {
    setLoading(true);
    try {
      const res = await overtimeService.startOvertime(record.id);
      if (res.success && res.data) {
        onRecordUpdated(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOvertime = async () => {
    setLoading(true);
    try {
      const res = await overtimeService.completeOvertime(record.id, undefined, completeNotes);
      if (res.success && res.data) {
        onRecordUpdated(res.data);
        setShowCompleteForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Masukkan alasan pembatalan lembur:');
    if (!reason) return;

    setLoading(true);
    try {
      const res = await overtimeService.cancelOvertimeRequest(record.id, 'Staf / Supervisor', reason);
      if (res.success && res.data) {
        onRecordUpdated(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (record.status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Menunggu Approval
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Disetujui (Siap Mulai)
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Lembur Sedang Aktif
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Selesai
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Ditolak
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#181E2E] rounded-2xl border border-[#2D374E] max-w-2xl w-full p-6 shadow-2xl my-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Detail Surat Perintah Lembur</h2>
                <span className="text-xs font-mono text-gray-400">#{record.id}</span>
              </div>
              <p className="text-xs text-gray-400">Audit trail, verifikasi jam kerja, dan rincian payroll lembur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252D42] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning flags */}
        {record.warningFlags && record.warningFlags.length > 0 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-amber-300 text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Catatan Peringatan Sistem:
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-200/90 pl-1">
              {record.warningFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 2-Column Info Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Employee & Schedule Info */}
          <div className="bg-[#111622] rounded-xl border border-[#2D374E] p-4 space-y-3">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Data Karyawan
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Nama:</span>
                <span className="font-semibold text-white">{record.employee?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kode & NIK:</span>
                <span className="text-gray-300">{record.employee?.employeeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Departemen:</span>
                <span className="text-gray-300">{record.employee?.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jabatan Pokok:</span>
                <span className="text-gray-300">{record.employee?.primaryPosition}</span>
              </div>
              <div className="flex justify-between border-t border-[#2D374E]/60 pt-1.5">
                <span className="text-gray-400">Jadwal Shift:</span>
                <span className="text-purple-300 font-medium">{record.shiftName}</span>
              </div>
            </div>
          </div>

          {/* Time & Execution Logs */}
          <div className="bg-[#111622] rounded-xl border border-[#2D374E] p-4 space-y-3">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Log Pelaksanaan Waktu
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Tanggal:</span>
                <span className="font-semibold text-white">{record.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rencana Waktu:</span>
                <span className="text-gray-300">
                  {record.plannedStart} - {record.plannedEnd} ({record.plannedHours}h)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aktual Waktu:</span>
                <span className="text-emerald-400 font-semibold">
                  {record.actualStart ? `${record.actualStart} - ${record.actualEnd || 'Sedang Berjalan'}` : 'Belum Mulai'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jam Disetujui:</span>
                <span className="text-white font-bold">{record.approvedHours || record.plannedHours} Jam</span>
              </div>
              {record.excessHours !== undefined && record.excessHours > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold border-t border-[#2D374E]/60 pt-1.5">
                  <span>Kelebihan (Excess):</span>
                  <span>+{record.excessHours} Jam (Unapproved)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reason & Task Description */}
        <div className="bg-[#111622] rounded-xl border border-[#2D374E] p-4 mb-4 space-y-2">
          <div className="text-xs font-bold text-gray-300">Alasan Kebutuhan Lembur:</div>
          <div className="text-xs text-gray-200 leading-relaxed italic bg-[#181E2E] p-2.5 rounded-lg border border-[#2D374E]/50">
            "{record.reason}"
          </div>

          {record.taskDescription && (
            <div className="mt-2 pt-2 border-t border-[#2D374E]/50 text-xs">
              <span className="text-gray-400 font-semibold block mb-1">Rincian Checklist Tugas:</span>
              <p className="text-gray-300 leading-relaxed">{record.taskDescription}</p>
            </div>
          )}
        </div>

        {/* Financial & Compensation Metadata Box */}
        <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3 border-b border-purple-500/20 pb-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Integrasi Payroll & Kompensasi
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">
              {record.compensationType === 'PAYROLL' ? 'Uang Lembur (Payroll)' : 'Cuti Pengganti (Compensatory Off)'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Tarif Dasar:</span>
              <span className="text-white font-medium">{formatRupiah(record.hourlyBaseRate)} / jam</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Pengali Regulasi:</span>
              <span className="text-purple-300 font-bold">{record.rateMultiplier}x</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Estimasi Biaya:</span>
              <span className="text-gray-300 font-medium">{formatRupiah(record.estimatedCost)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Total Biaya Akhir:</span>
              <span className="text-emerald-400 font-bold text-sm">{formatRupiah(record.finalCost || record.estimatedCost)}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <div className="border-t border-[#2D374E] pt-4 mb-5">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Audit Trail & Otoritas
          </div>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>Diajukan oleh: <strong className="text-white">{record.requestedBy}</strong></span>
              <span className="text-[11px]">{new Date(record.requestedAt).toLocaleString('id-ID')}</span>
            </div>

            {record.approvedBy && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Disetujui oleh: <strong>{record.approvedBy}</strong></span>
                <span className="text-[11px]">{record.approvedAt ? new Date(record.approvedAt).toLocaleString('id-ID') : '-'}</span>
              </div>
            )}

            {record.approvalNotes && (
              <div className="text-[11px] text-gray-300 pl-4 border-l-2 border-emerald-500/40 italic">
                "{record.approvalNotes}"
              </div>
            )}

            {record.rejectedBy && (
              <div className="flex items-center justify-between text-rose-400">
                <span>Ditolak oleh: <strong>{record.rejectedBy}</strong></span>
                <span className="text-[11px]">{record.rejectedAt ? new Date(record.rejectedAt).toLocaleString('id-ID') : '-'}</span>
              </div>
            )}

            {record.rejectionReason && (
              <div className="text-[11px] text-rose-300 pl-4 border-l-2 border-rose-500/40 italic">
                Alasan: "{record.rejectionReason}"
              </div>
            )}

            {record.cancelledBy && (
              <div className="flex items-center justify-between text-gray-400">
                <span>Dibatalkan oleh: <strong>{record.cancelledBy}</strong></span>
                <span className="text-[11px]">{record.cancelledAt ? new Date(record.cancelledAt).toLocaleString('id-ID') : '-'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Actions if Active or Approved */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2D374E]">
          <div className="flex items-center gap-2">
            {record.status === 'APPROVED' && (
              <button
                type="button"
                disabled={loading}
                onClick={handleStartOvertime}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Mulai Lembur Sekarang</span>
              </button>
            )}

            {record.status === 'ACTIVE' && !showCompleteForm && (
              <button
                type="button"
                onClick={() => setShowCompleteForm(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Selesaikan Lembur</span>
              </button>
            )}

            {(record.status === 'PENDING' || record.status === 'APPROVED') && (
              <button
                type="button"
                disabled={loading}
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Batalkan Permintaan
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#252D42] text-gray-300 hover:text-white transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* Complete Overtime Dialog Inline */}
        {showCompleteForm && (
          <div className="mt-4 p-4 bg-[#111622] rounded-xl border border-purple-500/30 animate-fade-in space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Square className="w-4 h-4 text-purple-400" /> Konfirmasi Penyelesaian Lembur
            </div>
            <p className="text-xs text-gray-400">
              Waktu selesai aktual akan dicatat saat ini. Jam kerja aktual akan dihitung otomatis terhadap jam disetujui.
            </p>
            <input
              type="text"
              placeholder="Catatan hasil output lembur (opsional)..."
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              className="w-full bg-[#181E2E] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCompleteForm(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteOvertime}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Konfirmasi Selesai'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
