/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Attendance Report & Punctuality Analysis View
 */

import React, { useState } from 'react';
import { AttendanceReportData, AttendanceReportItem } from '../../../types/hrReports';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingUp,
  Download,
  Search,
  ExternalLink,
} from 'lucide-react';

interface AttendanceReportViewProps {
  data: AttendanceReportData;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const AttendanceReportView: React.FC<AttendanceReportViewProps> = ({
  data,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const {
    summary = {} as any,
    dailyTrend = [],
    departmentComparison = [],
    employees = [],
  } = data || {};

  const filteredEmployees = (employees || []).filter((e) => {
    const matchDept = selectedDept === 'ALL' || e.department.toUpperCase() === selectedDept.toUpperCase();
    const q = search.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      e.name.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q);
    return matchDept && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Laporan Rekapitulasi Presensi &amp; Ketepatan Waktu</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Analisis tingkat kehadiran, rasio keterlambatan shift, dan akumulasi penalti potongan waktu kerja.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Presensi (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Tingkat Kehadiran</span>
          <div className="text-xl font-bold text-white mt-1">{summary.attendanceRate}%</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Target 95%
          </span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Hadir Shift</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{summary.presentCount}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Shift Tepat Waktu</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Keterlambatan</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{summary.lateCount}</div>
          <span className="text-[10px] text-amber-400/80 mt-0.5">Rasio: {summary.lateRate}%</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Rata-rata Telat</span>
          <div className="text-xl font-bold text-white mt-1">{summary.averageLateMinutes} Menit</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Per kejadian telat</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Izin / Sakit / Alpha</span>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {summary.leaveCount + summary.absentCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Alpha: {summary.absentCount}</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Denda Telat</span>
          <div className="text-xl font-bold text-purple-300 mt-1">
            Rp {(summary.totalLatePenalty ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Rp 10.000 / jam telat</span>
        </div>
      </div>

      {/* Daily Trend & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Bar Preview */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Tren Kehadiran Harian (14 Hari Terakhir)</span>
            </h4>
          </div>

          <div className="space-y-2">
            {dailyTrend.slice(-7).map((d) => (
              <div key={d.date} className="flex items-center gap-3 text-xs">
                <span className="w-20 text-gray-400 shrink-0 font-medium">
                  {d.date.substring(5)} ({d.dayLabel})
                </span>
                <div className="flex-1 bg-[#111827] rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(d.present / 24) * 100}%` }}
                    title={`Hadir: ${d.present}`}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${(d.late / 24) * 100}%` }}
                    title={`Telat: ${d.late}`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(d.absent / 24) * 100}%` }}
                    title={`Alpha: ${d.absent}`}
                  />
                </div>
                <span className="w-12 text-right font-bold text-white">{d.attendanceRate}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-[#2D374E]/60">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Hadir Tepat Waktu</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> Terlambat</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Alpha / Izin</span>
          </div>
        </div>

        {/* Department Comparison Table */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Perbandingan Presensi Antar Divisi</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400">
                  <th className="pb-2 font-semibold">Divisi</th>
                  <th className="pb-2 font-semibold text-center">Headcount</th>
                  <th className="pb-2 font-semibold text-center">Kehadiran</th>
                  <th className="pb-2 font-semibold text-center">Telat</th>
                  <th className="pb-2 font-semibold text-right">Denda Telat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/50 text-gray-300">
                {departmentComparison.map((dept) => (
                  <tr key={dept.department} className="hover:bg-[#111827]/40">
                    <td className="py-2.5 font-bold text-white">{dept.department}</td>
                    <td className="py-2.5 text-center text-gray-400">{dept.headcount}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-bold ${dept.attendanceRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {dept.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="text-amber-300 font-semibold">{dept.lateCount}x</span>
                      <span className="text-[10px] text-gray-500 block">({dept.avgLateMinutes}m avg)</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-200">
                      Rp {(dept.totalPenalty ?? 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Employee Attendance Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Daftar Presensi Per Karyawan (24 Personel)</span>
            </h4>
            <p className="text-xs text-gray-400">Klik baris nama karyawan untuk membuka drill-down detail personal</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-purple-500 w-40"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="BAR">Bar</option>
              <option value="SERVICE">Service</option>
              <option value="CLEANING">Cleaning</option>
              <option value="CRM">CRM</option>
              <option value="FINANCE">Finance</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                <th className="py-2.5 px-3 font-semibold">Karyawan</th>
                <th className="py-2.5 px-2 font-semibold">Divisi &amp; Jabatan</th>
                <th className="py-2.5 px-2 font-semibold text-center">Hadir</th>
                <th className="py-2.5 px-2 font-semibold text-center">Telat</th>
                <th className="py-2.5 px-2 font-semibold text-center">Izin/Off</th>
                <th className="py-2.5 px-2 font-semibold text-center">Presensi %</th>
                <th className="py-2.5 px-2 font-semibold text-right">Potongan Denda</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.employeeId}
                  className="hover:bg-[#111827]/60 transition-colors group cursor-pointer"
                  onClick={() => onOpenEmployeeDrawer(emp.employeeId)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {emp.name}
                    </div>
                    <div className="text-[10px] text-gray-400">{emp.employeeCode}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-gray-200 font-medium">{emp.position}</span>
                    <span className="text-[10px] text-gray-400 block">{emp.department}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                    {emp.presentCount}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-semibold ${emp.lateCount > 2 ? 'text-rose-400 font-bold' : emp.lateCount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                      {emp.lateCount}x
                    </span>
                    {emp.totalLateMinutes > 0 && (
                      <span className="text-[10px] text-gray-500 block">({emp.totalLateMinutes}m)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-gray-400">
                    {emp.leaveCount + emp.offCount}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      emp.attendanceRate >= 95
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : emp.attendanceRate >= 85
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {emp.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-gray-200">
                    {emp.latePenaltyAmount > 0 ? (
                      <span className="text-amber-300">Rp {(emp.latePenaltyAmount ?? 0).toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmployeeDrawer(emp.employeeId);
                      }}
                      className="p-1.5 rounded-lg bg-[#111827] hover:bg-purple-600 hover:text-white text-gray-400 transition-colors cursor-pointer"
                      title="Buka detail analytics karyawan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
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
