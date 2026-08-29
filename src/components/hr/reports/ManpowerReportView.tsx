/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Manpower & Labor Utilization Report View
 */

import React from 'react';
import { ManpowerReportData } from '../../../types/hrReports';
import { Users, Clock, Building2, CheckCircle2, TrendingUp, Download, PieChart, ShieldAlert } from 'lucide-react';

interface ManpowerReportViewProps {
  data: ManpowerReportData;
  onExportCsv: () => void;
}

export const ManpowerReportView: React.FC<ManpowerReportViewProps> = ({
  data,
  onExportCsv,
}) => {
  const {
    summary = {} as any,
    departments = [],
    shiftDistribution = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Laporan Utilisasi Tenaga Kerja (Manpower &amp; Staffing)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluasi alokasi jam kerja terjadwal vs aktual, coverage shift harian, dan efisiensi headcount operasional resto.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Manpower (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Headcount Terjadwal</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalScheduledStaff} Personel</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Aktual Hadir: {summary.totalActualPresent}</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Staffing Coverage</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.overallCoverageRate}%</div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5">Target Minimum 90%</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Jam Kerja Terjadwal</span>
          <div className="text-2xl font-bold text-white mt-1">{(summary.totalScheduledHours ?? 0).toLocaleString('id-ID')} Jam</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Aktual: {(summary.totalActualHours ?? 0).toLocaleString('id-ID')} Jam</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Labor Utilization Rate</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">{summary.overallUtilizationRate}%</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Efisiensi jam shift aktual</span>
        </div>
      </div>

      {/* Shift Coverage Strip */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Distribusi Kesiapan Shift Operasional (Coverage per Roster)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shiftDistribution.map((shift) => (
            <div key={shift.shiftName} className="bg-[#111827] p-3 rounded-xl border border-[#2D374E]">
              <div className="text-xs font-bold text-white mb-1">{shift.shiftName}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                <span>Alokasi: {shift.actualCount} / {shift.scheduledCount} Staff</span>
                <span className={`font-bold ${shift.coverageRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {shift.coverageRate}%
                </span>
              </div>
              <div className="w-full bg-[#1E2438] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${shift.coverageRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${shift.coverageRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Manpower Breakdown Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Rincian Manpower &amp; Utilisasi Per Divisi</span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Owner dikecualikan dari alokasi manpower operasional floor.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                <th className="py-2.5 px-3 font-semibold">Divisi</th>
                <th className="py-2.5 px-3 font-semibold text-center">Staf Terjadwal</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aktual Hadir</th>
                <th className="py-2.5 px-3 font-semibold text-center">Staffing Coverage</th>
                <th className="py-2.5 px-3 font-semibold text-right">Jam Terjadwal</th>
                <th className="py-2.5 px-3 font-semibold text-right">Jam Aktual</th>
                <th className="py-2.5 px-3 font-semibold text-center">Utilisasi Jam</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
              {departments.map((dept) => (
                <tr key={dept.department} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{dept.department}</td>
                  <td className="py-3 px-3 text-center text-gray-300 font-semibold">{dept.scheduledEmployees}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{dept.actualPresentEmployees}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-white">{dept.staffingCoverageRate}%</span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400">{(dept.scheduledLaborHours ?? 0).toLocaleString('id-ID')} j</td>
                  <td className="py-3 px-3 text-right text-gray-200 font-medium">{(dept.actualWorkingHours ?? 0).toLocaleString('id-ID')} j</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {dept.laborUtilizationRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      dept.statusText === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {dept.statusText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
