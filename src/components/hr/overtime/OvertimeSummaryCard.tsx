import React from 'react';
import { OvertimeSummary } from '../../../types/overtime';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Calendar,
} from 'lucide-react';

interface OvertimeSummaryCardProps {
  summary: OvertimeSummary | null;
  loading?: boolean;
}

export const OvertimeSummaryCard: React.FC<OvertimeSummaryCardProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#1E2438] rounded-2xl border border-[#2D374E]" />
        ))}
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Permintaan */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Total Pengajuan</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">{summary.totalRequests}</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <span className="text-purple-400 font-medium">{summary.totalPlannedHours} Jam</span> diajukan
          </div>
        </div>
      </div>

      {/* 2. Menunggu Approval */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Menunggu Approval</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{summary.pendingRequests}</div>
          <div className="text-xs text-gray-400 mt-1">
            Perlu verifikasi SPV / Manager
          </div>
        </div>
      </div>

      {/* 3. Lembur Aktif Saat Ini */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Lembur Aktif</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 relative">
            <Activity className="w-4 h-4" />
            {summary.activeNow > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{summary.activeNow}</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">Staf sedang bertugas</span> di resto
          </div>
        </div>
      </div>

      {/* 4. Total Jam Disetujui */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Jam Disetujui</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {summary.totalApprovedHours} <span className="text-sm font-normal text-gray-400">Jam</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
            <span>{summary.completedCount} sesi selesai</span>
            {summary.totalExcessHours > 0 && (
              <span className="text-rose-400 font-medium">+{summary.totalExcessHours}h excess</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Estimasi Biaya Lembur */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-sm sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Estimasi Biaya</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-indigo-300 tracking-tight">
            {formatRupiah(summary.totalFinalCost || summary.totalEstimatedCost)}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
            <span>Masuk payroll bulan ini</span>
          </div>
        </div>
      </div>
    </div>
  );
};
