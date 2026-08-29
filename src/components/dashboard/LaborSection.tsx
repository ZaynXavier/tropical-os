import React from 'react';
import { LaborData } from '../../data/dashboard/types';
import {
  Users,
  Briefcase,
  Clock,
  UserCheck,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface LaborSectionProps {
  data: LaborData;
}

export const LaborSection: React.FC<LaborSectionProps> = ({ data }) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Dimensi 5
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Produktivitas SDM &amp; Pengendalian Labor Cost</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Efisiensi manpower, rasio labor cost terhadap omzet, penjualan per jam kerja, dan tracking lembur/absensi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Staffing: {data.staffingStatus}</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Labor Cost % */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Labor Cost % (SDM / Sales)</span>
          <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-2">
            <span>{(data.laborCostPct ?? 0).toFixed(1)}%</span>
            <span className="text-xs font-medium text-gray-400">Target &lt; {data.laborCostTargetPct}%</span>
          </div>
          <div className="text-[11px] text-gray-300">Total Beban: {formatRp(data.laborCostRp)}</div>
          <p className="text-[10px] text-gray-400">Gaji pokok, tunjangan, lembur &amp; BPJS karyawan.</p>
        </div>

        {/* Card 2: Sales Per Employee & Hour */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Sales per Labor Hour (SPLH)</span>
          <div className="text-2xl font-black text-blue-300">{formatRp(data.salesPerLaborHourRp)}</div>
          <div className="text-[11px] text-gray-300">
            Per Karyawan: {formatRp(data.salesPerEmployeeRp)}
          </div>
          <p className="text-[10px] text-gray-400">Rasio output finansial per jam kerja staf.</p>
        </div>

        {/* Card 3: Attendance & Punctuality */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Tingkat Kehadiran (Attendance)</span>
          <div className="text-2xl font-black text-purple-300">{data.attendanceRatePct}%</div>
          <div className="text-[11px] text-gray-300">
            {data.activeOnDutyToday} Hadir / {data.totalEmployees} Total Kru Resto
          </div>
          <p className="text-[10px] text-gray-400">{data.lateArrivalsCount} keterlambatan bulan ini (Tertangani).</p>
        </div>

        {/* Card 4: Overtime Control */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Lembur (Overtime Tracking)</span>
          <div className="text-2xl font-black text-amber-300">{data.totalOvertimeHours} Jam</div>
          <div className="text-[11px] text-gray-300">Biaya Lembur: {formatRp(data.overtimeCostRp)}</div>
          <p className="text-[10px] text-gray-400">Terkendali di bawah batas maksimum 50 jam/bln.</p>
        </div>
      </div>

      {/* Productivity by Shift & Department Cost Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Productivity Shift */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Produktivitas Shift Kerja</span>
          </h3>

          <div className="space-y-3 pt-1">
            {data.productivityByShift.map((shift) => (
              <div key={shift.shift} className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-200">
                  <span>{shift.shift}</span>
                  <span className="text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px]">
                    Rating: {shift.efficiencyRating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Manpower: {shift.staffCount} Orang</span>
                  <strong className="text-gray-100">{formatRp(shift.salesGeneratedRp)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Headcount Breakdown */}
        {data.departmentHeadcount && data.departmentHeadcount.length > 0 && (
          <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Alokasi Karyawan per Departemen (24 Orang)</span>
            </h3>

            <div className="space-y-2 pt-1 text-xs">
              {data.departmentHeadcount.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1E2438]/80 border border-[#2D374E]/60 text-gray-200"
                >
                  <span className="font-semibold text-gray-300">{dept.department}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-300 font-bold">{dept.headcount} Orang</span>
                    <span className="text-gray-400 text-[11px]">{formatRp(dept.laborCostRp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
