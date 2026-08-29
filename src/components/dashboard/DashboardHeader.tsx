import React, { useState } from 'react';
import { User } from '../../types';
import { DashboardPeriod, CustomDateRange } from '../../data/dashboard/types';
import {
  Calendar,
  Clock,
  RotateCw,
  Download,
  Shield,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface DashboardHeaderProps {
  currentUser: User | null;
  selectedPeriod: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  customDateRange?: CustomDateRange;
  onCustomDateChange?: (range: CustomDateRange) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  selectedPeriod,
  onPeriodChange,
  customDateRange,
  onCustomDateChange,
  onRefresh,
  isLoading = false,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(customDateRange?.startDate || '2025-05-01');
  const [endDate, setEndDate] = useState(customDateRange?.endDate || '2025-05-31');

  const periodOptions: { key: DashboardPeriod; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: 'Minggu Ini' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'custom', label: 'Kustom' },
  ];

  const handleApplyCustom = () => {
    if (onCustomDateChange) {
      onCustomDateChange({ startDate, endDate });
    }
    onPeriodChange('custom');
    setIsCustomModalOpen(false);
  };

  const getRoleLabel = () => {
    switch (currentUser?.accessLevel) {
      case 'OWNER':
        return 'Executive Management Command Center';
      case 'MANAGER':
        return 'Operational & Strategic Command Center';
      case 'SUPERVISOR':
        return 'Supervisor Shift Command Center';
      default:
        return 'Staff Command Center';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-4">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: Role info, title, and live status */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {getRoleLabel()}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#111827] text-gray-300 border border-[#2D374E]">
              {currentUser?.department || 'Executive'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System (Phase 1)</span>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-100 tracking-tight flex items-center gap-2">
            <span>Pusat Kendali Bisnis & Operasional</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-3xl leading-relaxed">
            Monitoring performa 10 dimensi analitik Tropical Garden Resto dengan diagnostik akar masalah dan rekomendasi tindakan.
          </p>
        </div>

        {/* Action Controls: Refresh & MBR Export */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-gray-300 hover:text-white hover:border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data Dashboard"
          >
            <RotateCw className={`w-3.5 h-3.5 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Perbarui</span>
          </button>

          {(currentUser?.accessLevel === 'OWNER' || currentUser?.accessLevel === 'MANAGER') && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              title="Cetak Ringkasan Eksekutif MBR"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export MBR</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Global Period Selector */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2D374E]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-gray-300">Periode Analisis:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#111827] p-1 rounded-xl border border-[#2D374E]">
          {periodOptions.map((opt) => {
            const isActive = selectedPeriod === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  if (opt.key === 'custom') {
                    setIsCustomModalOpen(true);
                  } else {
                    onPeriodChange(opt.key);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in text-white">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Pilih Rentang Tanggal Kustom</span>
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Tanggal Mulai:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Tanggal Selesai:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2D374E]">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#283049] text-gray-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
