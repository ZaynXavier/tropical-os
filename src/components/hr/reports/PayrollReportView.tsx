/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Payroll Report & Salary Cost Analysis View
 */

import React, { useState } from 'react';
import { PayrollReportData } from '../../../types/hrReports';
import {
  DollarSign,
  Building2,
  TrendingUp,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface PayrollReportViewProps {
  data: PayrollReportData;
  canViewAllPayroll?: boolean;
  currentUserId?: string;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const PayrollReportView: React.FC<PayrollReportViewProps> = ({
  data,
  canViewAllPayroll = true,
  currentUserId,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const {
    summary = {} as any,
    departmentCosts = [],
    records = [],
    periodMonth = 'Agustus',
    periodYear = 2026,
    periodStatus = 'CALCULATED',
  } = data || {};

  const visibleRecords = React.useMemo(() => {
    const list = records || [];
    if (!canViewAllPayroll) {
      return list.filter((r) => r.employeeId === currentUserId);
    }
    return list.filter((r) => {
      const matchDept = selectedDept === 'ALL' || r.department.toUpperCase() === selectedDept.toUpperCase();
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        r.name.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.position.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [records, canViewAllPayroll, currentUserId, selectedDept, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Laporan Beban Gaji &amp; Analisis Payroll Cost</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Periode {periodMonth} {periodYear} &bull; {periodStatus}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Rekapitulasi gaji pokok, tunjangan kehadiran, overtime, potongan kasbon/denda, serta rasio labor cost resto.
          </p>
        </div>
        {canViewAllPayroll && (
          <button
            onClick={onExportCsv}
            className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export Payroll (CSV)</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      {canViewAllPayroll && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
            <span className="text-[11px] text-gray-400 block">Total Net Payroll Resto</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              Rp {(summary.totalNetPayroll ?? 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">24 Personel Aktif</span>
          </div>

          <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
            <span className="text-[11px] text-gray-400 block">Gaji Pokok + Tunjangan</span>
            <div className="text-2xl font-bold text-white mt-1">
              Rp {(summary.totalGrossSalary + summary.totalAllowances).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Tunjangan: Rp {(summary.totalAllowances ?? 0).toLocaleString('id-ID')}</span>
          </div>

          <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
            <span className="text-[11px] text-gray-400 block">Overtime Pay Disetujui</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              Rp {(summary.totalOvertime ?? 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Denda &amp; Kasbon: -Rp {(summary.totalLateDeduction + summary.totalKasbon).toLocaleString('id-ID')}</span>
          </div>

          <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
            <span className="text-[11px] text-gray-400 block">Labor Cost Ratio</span>
            <div className="text-2xl font-bold text-purple-300 mt-1">{summary.laborCostRatio || 21.8}%</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Benchmark Sehat (18–22%)
            </span>
          </div>
        </div>
      )}

      {/* Department Payroll Cost Distribution */}
      {canViewAllPayroll && (
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Alokasi Beban Payroll Per Departemen</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                  <th className="py-2.5 px-3 font-semibold">Divisi</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Headcount</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Gaji Pokok</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Tunjangan</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Lembur</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Potongan</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Net Payroll</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Porsi (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
                {departmentCosts.map((dept) => (
                  <tr key={dept.department} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{dept.department}</td>
                    <td className="py-2.5 px-2 text-center text-gray-400">{dept.headcount}</td>
                    <td className="py-2.5 px-2 text-right text-gray-300">Rp {(dept.basicSalaryTotal ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right text-gray-300">Rp {(dept.allowanceTotal ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right text-amber-300">Rp {(dept.overtimeTotal ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right text-rose-400">-Rp {(dept.deductionTotal + dept.kasbonTotal).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">Rp {(dept.netPayrollTotal ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#111827] text-purple-300 border border-[#2D374E]">
                        {dept.percentageOfTotal}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{canViewAllPayroll ? 'Rincian Slip Gaji Karyawan' : 'Slip Gaji Saya'}</span>
            </h4>
            <p className="text-xs text-gray-400">
              {canViewAllPayroll
                ? 'Daftar rincian take home pay seluruh personel periode aktif'
                : 'Data penghasilan mandiri Anda yang terintegrasi dari modul presensi dan lembur'}
            </p>
          </div>

          {canViewAllPayroll && (
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
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                <th className="py-2.5 px-3 font-semibold">Karyawan</th>
                <th className="py-2.5 px-2 font-semibold">Divisi &amp; Jabatan</th>
                <th className="py-2.5 px-2 font-semibold text-right">Gaji Pokok</th>
                <th className="py-2.5 px-2 font-semibold text-right">Tunjangan</th>
                <th className="py-2.5 px-2 font-semibold text-right">Lembur</th>
                <th className="py-2.5 px-2 font-semibold text-right">Potongan/Kasbon</th>
                <th className="py-2.5 px-3 font-semibold text-right">Take Home Pay</th>
                <th className="py-2.5 px-2 font-semibold text-center">Status</th>
                {canViewAllPayroll && <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
              {visibleRecords.map((r) => (
                <tr
                  key={r.recordId}
                  className="hover:bg-[#111827]/60 transition-colors group cursor-pointer"
                  onClick={() => onOpenEmployeeDrawer(r.employeeId)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {r.name}
                    </div>
                    <div className="text-[10px] text-gray-400">{r.employeeCode}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-gray-200 font-medium">{r.position}</span>
                    <span className="text-[10px] text-gray-400 block">{r.department}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-300">
                    Rp {(r.basicSalary ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-300">
                    Rp {(r.allowances ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-2 text-right text-amber-300 font-medium">
                    {r.overtimePay > 0 ? `Rp ${(r.overtimePay ?? 0).toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right text-rose-400">
                    {r.lateDeductions + r.kasbonDeductions > 0
                      ? `-Rp ${(r.lateDeductions + r.kasbonDeductions).toLocaleString('id-ID')}`
                      : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                    Rp {(r.netSalary ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {r.status}
                    </span>
                  </td>
                  {canViewAllPayroll && (
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEmployeeDrawer(r.employeeId);
                        }}
                        className="p-1.5 rounded-lg bg-[#111827] hover:bg-purple-600 hover:text-white text-gray-400 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
