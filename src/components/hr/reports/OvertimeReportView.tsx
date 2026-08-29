/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Overtime & SPL Analytics Report View
 */

import React, { useState } from 'react';
import { OvertimeReportData } from '../../../types/hrReports';
import { Clock, DollarSign, Building2, TrendingUp, AlertTriangle, Download, Search, ExternalLink, Zap } from 'lucide-react';

interface OvertimeReportViewProps {
  data: OvertimeReportData;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const OvertimeReportView: React.FC<OvertimeReportViewProps> = ({
  data,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const {
    summary = {} as any,
    departmentBreakdown = [],
    reasonsBreakdown = [],
    monthlyTrend = [],
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Laporan Surat Perintah Lembur (Overtime &amp; SPL)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitoring jam lembur diajukan vs disetujui, analisis alasan operasional, dan simulasi beban biaya lembur resto.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Lembur (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Jam Lembur Disetujui</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalApprovedHours} Jam</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Diajukan: {summary.totalRequestedHours} Jam ({summary.approvedRatePercent}% Approval)</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Simulasi Biaya Lembur</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            Rp {(summary.totalSimulationCost ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-0.5">Tarif Flat: Rp 10.000 / Jam</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Jam Aktual Kerja Lembur</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.totalActualHours} Jam</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Excess Jam: {summary.totalExcessHours} Jam</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Tren Beban MoM</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">-8.2% MoM</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Efisiensi Lembur Meningkat
          </span>
        </div>
      </div>

      {/* Breakdown Reasons & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reasons */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Kategori Alasan Operasional Lembur</span>
          </h4>

          <div className="space-y-3">
            {reasonsBreakdown.map((r) => (
              <div key={r.reason} className="bg-[#111827] p-3 rounded-xl border border-[#2D374E] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{r.reason}</span>
                  <span className="font-bold text-amber-300">{r.hours} Jam</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Frekuensi: {r.count} Pengajuan SPL</span>
                  <span>Estimasi Biaya: Rp {(r.hours * 10000).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overtime Summary */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Alokasi Biaya Lembur Per Divisi</span>
          </h4>

          <div className="space-y-2.5">
            {departmentBreakdown.map((d) => (
              <div key={d.department} className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-[#2D374E]/60 text-xs">
                <div>
                  <span className="font-bold text-white block">{d.department}</span>
                  <span className="text-[10px] text-gray-400">{d.employeeCount} Staf Terlibat</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-300 block">
                    Rp {(d.simulationCost ?? 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-gray-400">{d.approvedHours} Jam Disetujui</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Overtime Roster Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Rincian Jam Lembur Per Karyawan</span>
            </h4>
            <p className="text-xs text-gray-400">Pencatatan jam SPL dan estimasi nominal lembur masuk payroll</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari staf..."
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
                <th className="py-2.5 px-2 font-semibold text-center">Diajukan</th>
                <th className="py-2.5 px-2 font-semibold text-center">Disetujui</th>
                <th className="py-2.5 px-2 font-semibold text-center">Aktual</th>
                <th className="py-2.5 px-2 font-semibold text-right">Simulasi Biaya Lembur</th>
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
                  <td className="py-2.5 px-2 text-center text-gray-400">
                    {emp.requestedHours > 0 ? `${emp.requestedHours} j` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-bold ${emp.approvedHours > 10 ? 'text-amber-400' : emp.approvedHours > 0 ? 'text-white' : 'text-gray-500'}`}>
                      {emp.approvedHours > 0 ? `${emp.approvedHours} j` : '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400 font-semibold">
                    {emp.actualHours > 0 ? `${emp.actualHours} j` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium">
                    {emp.simulationCost > 0 ? (
                      <span className="text-amber-300 font-bold">
                        Rp {(emp.simulationCost ?? 0).toLocaleString('id-ID')}
                      </span>
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
