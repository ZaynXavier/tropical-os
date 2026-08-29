import React from 'react';
import { BreakSummary, BreakMonitoringAlert } from '../../types/break';
import {
  Coffee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  XCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface BreakSummaryCardProps {
  summary: BreakSummary | null;
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
  showDetails?: boolean;
}

export const BreakSummaryCard: React.FC<BreakSummaryCardProps> = ({
  summary,
  loading = false,
  title = 'Ringkasan Istirahat Staf Resto',
  showDetails = true,
}) => {
  if (loading) {
    return (
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl animate-pulse space-y-4">
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-gray-800 rounded-2xl"></div>
          <div className="h-20 bg-gray-800 rounded-2xl"></div>
          <div className="h-20 bg-gray-800 rounded-2xl"></div>
          <div className="h-20 bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const alertBadge = (level: BreakMonitoringAlert = 'NORMAL') => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            CRITICAL MONITOR
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING ALERT
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Activity className="w-3.5 h-3.5" />
            ATTENTION
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NORMAL & TERKONTROL
          </span>
        );
    }
  };

  return (
    <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-gray-400">
              Monitoring utilisasi standard break, additional break & ketertiban lantai resto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {alertBadge(summary?.overallAlertLevel)}
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Break */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Total Break</span>
            <Coffee className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{summary?.totalBreaks ?? 0}</div>
          <div className="text-[10px] text-gray-400">Sesi tercatat</div>
        </div>

        {/* Standard Break */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Standard</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {summary?.standardBreaks ?? 0}
          </div>
          <div className="text-[10px] text-gray-400">Maks. 60 menit</div>
        </div>

        {/* Additional Break */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Additional</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400">
            {summary?.additionalBreaks ?? 0}
          </div>
          <div className="text-[10px] text-gray-400">Pengajuan izin</div>
        </div>

        {/* Active Now */}
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
          <div className="text-[11px] text-purple-300 flex items-center justify-between font-semibold">
            <span>Sedang Break</span>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
          </div>
          <div className="text-xl font-bold text-purple-200">
            {summary?.activeBreaks ?? 0}
          </div>
          <div className="text-[10px] text-purple-300/80">Staf di ruang break</div>
        </div>

        {/* Pending Requests */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <div className="text-[11px] text-amber-300 flex items-center justify-between font-semibold">
            <span>Pending</span>
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300">
            {summary?.pendingRequests ?? 0}
          </div>
          <div className="text-[10px] text-amber-300/80">Menunggu approval</div>
        </div>

        {/* Average Duration */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Rata-rata</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {summary?.averageDurationMinutes ?? 0}{' '}
            <span className="text-[11px] font-normal text-gray-400">menit</span>
          </div>
          <div className="text-[10px] text-gray-400">Per sesi break</div>
        </div>

        {/* Completed */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Selesai</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {summary?.completedBreaks ?? 0}
          </div>
          <div className="text-[10px] text-gray-400">Tepat waktu</div>
        </div>

        {/* Excessive Breaks Alert */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            (summary?.excessiveBreaksCount ?? 0) > 0
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : 'bg-[#111827] border-[#2D374E] text-gray-400'
          }`}
        >
          <div className="text-[11px] flex items-center justify-between font-semibold">
            <span>Excessive</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            {summary?.excessiveBreaksCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-400">Melebihi batas</div>
        </div>
      </div>

      {/* Department Breakdown Mini-Bar */}
      {showDetails && summary?.departmentBreakdown && summary.departmentBreakdown.length > 0 && (
        <div className="pt-2">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Distribusi Break Per Departemen Resto
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              Rata-rata durasi & status keteraturan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {summary.departmentBreakdown.map((dept) => (
              <div
                key={dept.department}
                className="p-3 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {dept.department}
                  </span>
                  {dept.activeNow > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300">
                      {dept.activeNow} Aktif
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="text-gray-400">{dept.totalBreaks} sesi</span>
                  <span className="font-semibold text-gray-300">
                    avg {dept.averageDurationMinutes}m
                  </span>
                </div>

                {dept.excessiveCount > 0 ? (
                  <div className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{dept.excessiveCount} overtime</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Tertib</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
