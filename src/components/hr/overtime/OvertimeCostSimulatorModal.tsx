import React, { useState } from 'react';
import { OvertimeType, OvertimeCostSimulationResult } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import {
  Calculator,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Building,
  Info,
} from 'lucide-react';

interface OvertimeCostSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OvertimeCostSimulatorModal: React.FC<OvertimeCostSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [department, setDepartment] = useState<string>('Kitchen');
  const [headcount, setHeadcount] = useState<number>(3);
  const [hoursPerPerson, setHoursPerPerson] = useState<number>(2.0);
  const [overtimeType, setOvertimeType] = useState<OvertimeType>('POST_SHIFT');
  const [averageHourlyRate, setAverageHourlyRate] = useState<number>(26000);

  const multiplier = overtimeType === 'OFF_DAY' || overtimeType === 'SPECIAL_EVENT' ? 2.0 : 1.5;

  const simulation: OvertimeCostSimulationResult = overtimeService.simulateOvertimeCost({
    department,
    headcount,
    hoursPerPerson,
    overtimeType,
    averageHourlyRate,
    rateMultiplier: multiplier,
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDeptChange = (dept: string) => {
    setDepartment(dept);
    if (dept === 'Kitchen') setAverageHourlyRate(26000);
    else if (dept === 'Bar') setAverageHourlyRate(25000);
    else if (dept === 'Service') setAverageHourlyRate(24000);
    else if (dept === 'Management') setAverageHourlyRate(32000);
    else if (dept === 'Purchasing') setAverageHourlyRate(28000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#181E2E] rounded-2xl border border-[#2D374E] max-w-xl w-full p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Simulator Biaya Lembur Operasional</h2>
              <p className="text-xs text-gray-400">Proyeksi dampak anggaran payroll lembur sebelum penerbitan SPL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252D42] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form Fields */}
        <div className="space-y-4">
          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-400" /> Divisi / Departemen
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['Kitchen', 'Bar', 'Service', 'Management', 'Purchasing'].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleDeptChange(dept)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    department === dept
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-[#111622] text-gray-400 hover:bg-[#252D42] border border-[#2D374E]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Type of Overtime */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Tipe Lembur & Pengali Regulasi
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setOvertimeType('POST_SHIFT')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  overtimeType === 'POST_SHIFT'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-[#111622] border-[#2D374E] text-gray-400'
                }`}
              >
                <div className="text-xs font-bold text-purple-300">Hari Kerja Reguler (1.5x)</div>
                <div className="text-[10px] text-gray-400">Pre-Shift / Post-Shift Operasional</div>
              </button>

              <button
                type="button"
                onClick={() => setOvertimeType('OFF_DAY')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  overtimeType === 'OFF_DAY'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-[#111622] border-[#2D374E] text-gray-400'
                }`}
              >
                <div className="text-xs font-bold text-purple-300">Hari Libur / Acara (2.0x)</div>
                <div className="text-[10px] text-gray-400">Off-Day & Special Event Banquet</div>
              </button>
            </div>
          </div>

          {/* Headcount & Hours Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#111622] p-4 rounded-xl border border-[#2D374E]">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Jumlah Karyawan:
                </span>
                <span className="text-xs font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  {headcount} Orang
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={headcount}
                onChange={(e) => setHeadcount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Durasi per Orang:
                </span>
                <span className="text-xs font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  {hoursPerPerson} Jam
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={hoursPerPerson}
                onChange={(e) => setHoursPerPerson(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="p-4 bg-purple-950/20 rounded-xl border border-purple-500/30 space-y-3">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Hasil Kalkulasi Proyeksi
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#111622] p-3 rounded-lg border border-[#2D374E]">
                <span className="text-[11px] text-gray-400 block">Total Jam Lembur:</span>
                <span className="text-base font-bold text-white">{simulation.totalHours} Jam</span>
              </div>

              <div className="bg-[#111622] p-3 rounded-lg border border-[#2D374E]">
                <span className="text-[11px] text-gray-400 block">Biaya per Karyawan:</span>
                <span className="text-base font-bold text-purple-300">
                  {formatRupiah(simulation.perEmployeeCost)}
                </span>
              </div>

              <div className="bg-[#111622] p-3 rounded-lg border border-[#2D374E] col-span-2 sm:col-span-1">
                <span className="text-[11px] text-gray-400 block">Total Proyeksi Biaya:</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatRupiah(simulation.totalEstimatedCost)}
                </span>
              </div>
            </div>

            {/* Budget Impact Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Utilisasi Batas Harian (Rp 500k):</span>
                <span
                  className={`font-bold ${
                    simulation.dailyBudgetImpactPercentage > 100
                      ? 'text-rose-400'
                      : simulation.dailyBudgetImpactPercentage > 75
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {simulation.dailyBudgetImpactPercentage}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#111622] rounded-full overflow-hidden border border-[#2D374E]">
                <div
                  className={`h-full rounded-full transition-all ${
                    simulation.dailyBudgetImpactPercentage > 100
                      ? 'bg-rose-500'
                      : simulation.dailyBudgetImpactPercentage > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, simulation.dailyBudgetImpactPercentage)}%` }}
                />
              </div>
            </div>

            {/* Recommendation note */}
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                simulation.dailyBudgetImpactPercentage > 100
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-[#111622] border-[#2D374E] text-gray-300'
              }`}
            >
              {simulation.dailyBudgetImpactPercentage > 100 ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              )}
              <span className="leading-relaxed">{simulation.recommendation}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-[#2D374E]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#252D42] hover:bg-[#2D374E] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
