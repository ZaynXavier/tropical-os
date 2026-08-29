import React from 'react';
import { SupervisorOperationalData } from '../../data/dashboard/types';
import { User } from '../../types';
import {
  Users,
  Utensils,
  Coffee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SupervisorCommandCenterProps {
  data: SupervisorOperationalData;
  currentUser: User | null;
}

export const SupervisorCommandCenter: React.FC<SupervisorCommandCenterProps> = ({
  data,
  currentUser,
}) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Shift Live Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E2438] via-[#231A3B] to-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E]/70 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Command Center Supervisor
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Shift Aktif: {data.shiftName} ({data.shiftHours})</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gray-100">
              Pusat Kendali Shift Lapangan — {currentUser?.name}
            </h1>
          </div>

          <div className="text-xs text-gray-300 bg-[#111827]/80 p-3 rounded-xl border border-[#2D374E] space-y-0.5 shrink-0">
            <div className="text-gray-400">Shift Supervisor In-Charge:</div>
            <strong className="text-pink-300 font-bold">{data.onDutyLead}</strong>
          </div>
        </div>

        <p className="text-xs text-gray-300">
          Monitoring kelancaran alur meja makan, antrean tiket masak dapur, kecepatan bar, kepatuhan checklist stasiun, dan kasir shift handover.
        </p>
      </div>

      {/* Real-Time Operational KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Table Occupancy */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Kapasitas &amp; Okupansi Meja</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-gray-100">
              {data.activeTablesCount} / {data.totalTablesCapacity} <span className="text-sm font-normal text-gray-400">Meja</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Tingkat Okupansi:</span>
              <strong className="text-emerald-400 font-bold">{data.occupancyRatePct}%</strong>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${data.occupancyRatePct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Kitchen Live Orders & Ticket Speed */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-pink-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Kitchen Live Queue &amp; Speed</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-gray-100">
              {data.liveKitchenOrdersCount} <span className="text-sm font-normal text-gray-400">Tiket Aktif</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Rata-rata Masak:</span>
              <strong className="text-emerald-400 font-bold">{data.kitchenAvgPrepMinutes} Menit</strong>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 pt-1 border-t border-[#2D374E]/60 flex items-center justify-between">
            <span>Standar Kitchen: &lt;15 Mnt</span>
            <span className="text-emerald-400 font-bold">On Time</span>
          </div>
        </div>

        {/* Card 3: Bar Live Orders & Speed */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-emerald-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Bar Live Queue &amp; Speed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coffee className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-gray-100">
              {data.liveBarOrdersCount} <span className="text-sm font-normal text-gray-400">Tiket Minuman</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Rata-rata Bar:</span>
              <strong className="text-emerald-400 font-bold">{data.barAvgPrepMinutes} Menit</strong>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 pt-1 border-t border-[#2D374E]/60 flex items-center justify-between">
            <span>Standar Bar: &lt;5 Mnt</span>
            <span className="text-emerald-400 font-bold">Optimal</span>
          </div>
        </div>

        {/* Card 4: Attendance on Duty Today */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-blue-500/40 transition-all space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Kru Hadir di Lapangan</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-gray-100">
              {data.attendanceSummary.present} / {data.attendanceSummary.totalExpected}{' '}
              <span className="text-sm font-normal text-gray-400">Personel</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Sedang Istirahat:</span>
              <strong className="text-blue-300">{data.attendanceSummary.onBreak} Orang</strong>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 pt-1 border-t border-[#2D374E]/60 flex items-center justify-between">
            <span>Terlambat:</span>
            <span className="text-emerald-400 font-bold">0 Kru (Nihil)</span>
          </div>
        </div>
      </div>

      {/* 2 Columns: Station Checklists & Cashier / Wasting Handover Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Col 1: Station Checklist Progress */}
        <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Progres Checklist 4 Stasiun Operasional</span>
            </h3>
            <span className="text-[11px] text-purple-300 font-mono">Live Sync</span>
          </div>

          <div className="space-y-3">
            {data.checklistProgress.map((dept) => (
              <div key={dept.department} className="p-3 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-100 flex items-center gap-2">
                    {dept.department === 'Kitchen' && <Utensils className="w-3.5 h-3.5 text-pink-400" />}
                    {dept.department === 'Bar' && <Coffee className="w-3.5 h-3.5 text-amber-400" />}
                    {dept.department === 'Service' && <Users className="w-3.5 h-3.5 text-blue-400" />}
                    {dept.department === 'Cleaning' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    Stasiun {dept.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {dept.completedCount} / {dept.totalCount} SOP Selesai
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dept.percentage === 100
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {dept.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#1E2438] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dept.percentage === 100 ? 'bg-emerald-400' : 'bg-purple-500'
                    }`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Link
              to="/operations"
              className="w-full py-2.5 rounded-xl bg-[#111827] hover:bg-[#283049] text-gray-300 hover:text-white border border-[#2D374E] text-xs font-bold flex items-center justify-center gap-2 transition-all block text-center"
            >
              <span>Buka Menu Operasional &amp; Checklist Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Col 2: Cashier Handover & Wasting Alert */}
        <div className="space-y-4">
          {/* Cashier Handover Status */}
          <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Status Kasir &amp; Rekonsiliasi Handover</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ Opening Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1">
                <span className="text-[11px] text-gray-400">Modal Kasir Awal (Float):</span>
                <div className="text-base font-bold text-gray-100">
                  {formatRp(data.cashierHandoverStatus.floatCashAmount)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1">
                <span className="text-[11px] text-gray-400">Estimasi Omzet Kasir Shift Ini:</span>
                <div className="text-base font-bold text-emerald-400">
                  {formatRp(data.cashierHandoverStatus.currentTurnoverEstimate)}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 bg-[#111827]/40 p-2.5 rounded-xl border border-[#2D374E]/60 flex items-center justify-between">
              <span>Rekonsiliasi Terakhir:</span>
              <strong className="text-gray-300">{data.cashierHandoverStatus.lastReconciliationTime}</strong>
            </div>
          </div>

          {/* Today's Wasting Summary */}
          <div className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Wasting Log Hari Ini</span>
              </h3>
              <span className="text-[11px] text-gray-400">
                {data.todayWastingSummary.itemsCount} Catatan Wasting
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827]/70 border border-[#2D374E]">
              <div>
                <span className="text-xs text-gray-400 block">Estimasi Nilai Bahan Rusak:</span>
                <div className="text-lg font-black text-rose-400">
                  {formatRp(data.todayWastingSummary.totalEstimatedLossRp)}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Terkendali (&lt; Rp 300rb)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
