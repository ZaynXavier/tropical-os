/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Document Compliance & Expiration Report View
 */

import React, { useState } from 'react';
import { DocumentComplianceReportData } from '../../../types/hrReports';
import { FileCheck, FileWarning, AlertTriangle, Building2, Download, Search, ExternalLink, ShieldCheck } from 'lucide-react';

interface DocumentComplianceReportViewProps {
  data: DocumentComplianceReportData;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const DocumentComplianceReportView: React.FC<DocumentComplianceReportViewProps> = ({
  data,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const {
    summary = {} as any,
    departmentBreakdown = [],
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
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <span>Laporan Kepatuhan &amp; Masa Berlaku Dokumen SDM</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Audit kelengkapan berkas kontrak kerja, KTP, sertifikat hygiene sanitasi, dan peringatan kedaluwarsa 30/60/90 hari.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Dokumen (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Tingkat Kelengkapan</span>
          <div className="text-xl font-bold text-white mt-1">{summary.overallCompletionRate}%</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3" /> Target 100%
          </span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Dokumen Terverifikasi</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{summary.verifiedDocumentsTotal}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Status Valid</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Menunggu Verifikasi</span>
          <div className="text-xl font-bold text-blue-400 mt-1">{summary.pendingVerificationTotal}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Antrean Review HR</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Expired &le; 30 Hari</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{summary.expiringIn30DaysTotal}</div>
          <span className="text-[10px] text-amber-400/80 mt-0.5">Perlu Tindak Lanjut</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Sudah Kedaluwarsa</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{summary.expiredTotal}</div>
          <span className="text-[10px] text-rose-400/80 mt-0.5">Perpanjangan Wajib</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Berkas Kurang</span>
          <div className="text-xl font-bold text-purple-300 mt-1">{summary.missingCriticalTotal}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Belum Diunggah</span>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Kelengkapan Berkas Per Divisi</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departmentBreakdown.map((dept) => (
            <div key={dept.department} className="bg-[#111827] p-3.5 rounded-xl border border-[#2D374E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{dept.department}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  dept.avgCompletionRate >= 95
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {dept.avgCompletionRate}%
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Staf: <b className="text-gray-200">{dept.employeeCount}</b></span>
                <span>Missing: <b className="text-rose-400">{dept.missingDocsCount}</b></span>
              </div>
              <div className="text-[10px] text-amber-400/80 flex items-center justify-between pt-1 border-t border-[#2D374E]/60">
                <span>Akan Kedaluwarsa:</span>
                <b>{dept.expiringDocsCount} dokumen</b>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Document Roster Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Status Dokumen Karyawan</span>
            </h4>
            <p className="text-xs text-gray-400">Daftar kelengkapan dan peringatan dokumen per personel</p>
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
                <th className="py-2.5 px-2 font-semibold text-center">Kelengkapan</th>
                <th className="py-2.5 px-2 font-semibold text-center">Valid</th>
                <th className="py-2.5 px-2 font-semibold">Berkas Kurang</th>
                <th className="py-2.5 px-2 font-semibold text-center">Peringatan Expired</th>
                <th className="py-2.5 px-2 font-semibold text-center">Status</th>
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
                  <td className="py-2.5 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      emp.completionRate >= 95
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {emp.completionRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                    {emp.verifiedCount}
                  </td>
                  <td className="py-2.5 px-2">
                    {emp.missingDocumentsList && emp.missingDocumentsList.length > 0 ? (
                      <div className="text-rose-300 text-[11px]">
                        {emp.missingDocumentsList.join(', ')}
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-medium">Lengkap</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {emp.expiringIn30DaysCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {emp.expiringIn30DaysCount} Dokumen (&le;30h)
                      </span>
                    ) : emp.expiredCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        {emp.expiredCount} Expired
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      emp.overallStatus === 'COMPLETE'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : emp.overallStatus === 'NEEDS_ATTENTION'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {emp.overallStatus}
                    </span>
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
