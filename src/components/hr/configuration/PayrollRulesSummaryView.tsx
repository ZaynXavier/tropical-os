import React, { useState } from 'react';
import { PayrollIntegrationContract, HRConfiguration } from '../../../types/hrConfiguration';
import { Code, CheckCircle, DollarSign } from 'lucide-react';

interface Props {
  config: HRConfiguration;
}

export const PayrollRulesSummaryView: React.FC<Props> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  // Generate sample contract based on current HR configuration
  const contractSample: PayrollIntegrationContract = {
    version: '2.0-simulation',
    generatedAt: new Date().toISOString(),
    restaurantLocation: config.location.locationName,
    shiftSummary: {
      totalActiveShifts: config.shifts.filter((s) => s.status === 'ACTIVE').length,
      defaultGracePeriodMinutes: config.attendance.gracePeriodMinutes,
    },
    attendanceDeductionContract: {
      formula: 'Late Minutes × (Hourly Rate / 60)',
      hourlyRateRupiah: config.attendance.lateDeductionHourlyRate,
      ratePerMinuteRupiah: Number((config.attendance.lateDeductionHourlyRate / 60).toFixed(2)),
      gracePeriodMinutes: config.attendance.gracePeriodMinutes,
      allowEarlyClockIn: config.attendance.allowEarlyCheckIn,
    },
    overtimeContract: {
      formula: 'Approved Overtime Hours × Hourly Rate',
      hourlyRateRupiah: config.overtime.hourlyRate,
      maxDailyHours: config.overtime.maxDailyHours,
      requireSupervisorApproval: config.overtime.requireApproval,
      isSimulationOnly: true,
    },
    breakContract: {
      standardDailyQuotaMinutes: config.breaks.standardBreakMinutes,
      excessiveThresholdMinutes: config.breaks.alertThresholdExcessiveMinutes,
      excessiveDeductionApplicable: false,
    },
    updatedAt: new Date().toISOString(),
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(contractSample, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6" id="payroll-rules-summary-section">
      {/* Header */}
      <div className="bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Kontrak Integrasi Modul Payroll & KPI</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Ringkasan data skema integrasi otomatis antara catatan Presensi, Master Shift, Istirahat, dan Lembur dengan
            perhitungan estimasi payroll karyawan.
          </p>
        </div>

        <button
          onClick={handleCopyJson}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#252D48] hover:bg-[#2F395A] text-white text-xs font-semibold rounded-xl transition-all border border-gray-700 cursor-pointer whitespace-nowrap"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Code className="w-4 h-4 text-purple-400" />}
          {copied ? 'Skema Disalin ke Clipboard!' : 'Salin Skema JSON Kontrak'}
        </button>
      </div>

      {/* Contract Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Deduction */}
        <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold">
              POTONGAN PRESENSI
            </span>
            <span className="text-xs text-gray-400 font-mono">Formula 1</span>
          </div>

          <h4 className="text-sm font-bold text-white">Potongan Keterlambatan</h4>
          <p className="text-xs text-gray-400">
            Dihitung otomatis saat staf clock-in melewati batas grace period.
          </p>

          <div className="p-3 bg-[#111827] rounded-xl border border-gray-800 space-y-1 text-xs">
            <div className="text-[11px] text-gray-400">Rumus Integrasi:</div>
            <div className="font-mono text-rose-400 font-semibold">
              Menit Terlambat × (Rp {(config.attendance?.lateDeductionHourlyRate || 0).toLocaleString('id-ID')} / 60)
            </div>
            <div className="text-[10px] text-gray-500 pt-1">
              Grace Period: {config.attendance?.gracePeriodMinutes || 0} Menit
            </div>
          </div>
        </div>

        {/* Overtime Simulation */}
        <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
              SIMULASI LEMBUR
            </span>
            <span className="text-xs text-gray-400 font-mono">Formula 2</span>
          </div>

          <h4 className="text-sm font-bold text-white">Insentif Lembur Karyawan</h4>
          <p className="text-xs text-gray-400">
            Dihitung berdasarkan jam lembur yang telah disetujui (APPROVED / COMPLETED).
          </p>

          <div className="p-3 bg-[#111827] rounded-xl border border-gray-800 space-y-1 text-xs">
            <div className="text-[11px] text-gray-400">Rumus Integrasi:</div>
            <div className="font-mono text-indigo-400 font-semibold">
              Durasi Lembur (Jam) × Rp {(config.overtime?.hourlyRate || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-gray-500 pt-1">
              Batas Maks: {config.overtime?.maxDailyHours || 0} Jam/Hari
            </div>
          </div>
        </div>

        {/* Break Management */}
        <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              KEDISIPLINAN ISTIRAHAT
            </span>
            <span className="text-xs text-gray-400 font-mono">Formula 3</span>
          </div>

          <h4 className="text-sm font-bold text-white">Tracking Overbreak</h4>
          <p className="text-xs text-gray-400">
            Digunakan sebagai parameter KPI kedisiplinan operasional restoran.
          </p>

          <div className="p-3 bg-[#111827] rounded-xl border border-gray-800 space-y-1 text-xs">
            <div className="text-[11px] text-gray-400">Batas Toleransi:</div>
            <div className="font-mono text-amber-400 font-semibold">
              Standar {config.breaks.standardBreakMinutes}m | Alert &gt; {config.breaks.alertThresholdExcessiveMinutes}m
            </div>
            <div className="text-[10px] text-gray-500 pt-1">
              Persetujuan: {config.breaks.requireApprovalForAdditionalBreak ? 'Wajib Supervisor' : 'Otomatis'}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Schema Viewer */}
      <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            Payload Skema JSON Kontrak HR
          </h4>
          <span className="text-[11px] text-gray-400 font-mono">v{contractSample.version}</span>
        </div>

        <div className="bg-[#0D111A] p-4 rounded-xl border border-gray-800 overflow-x-auto">
          <pre className="text-xs text-purple-300/90 font-mono leading-relaxed">
            {JSON.stringify(contractSample, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
