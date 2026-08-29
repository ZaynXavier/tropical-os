/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SOP Compliance & Read Confirmation Report View
 */

import React, { useState } from 'react';
import { SopComplianceReportData } from '../../../types/hrReports';
import { BookOpen, CheckCircle2, AlertTriangle, Building2, Download, Search, ExternalLink, ShieldCheck, Bell } from 'lucide-react';

interface SopComplianceReportViewProps {
  data: SopComplianceReportData;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const SopComplianceReportView: React.FC<SopComplianceReportViewProps> = ({
  data,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  const {
    summary = {} as any,
    departmentBreakdown = [],
    unreadStaffList = [],
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

  const handleSendReminder = (name: string) => {
    setReminderSent(name);
    setTimeout(() => setReminderSent(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>Laporan Kepatuhan Pembacaan Standard Operating Procedure (SOP)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Audit kepatuhan staf dalam membaca, memahami, dan mengonfirmasi SOP resmi Tropical Garden Resto.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export SOP (CSV)</span>
        </button>
      </div>

      {reminderSent && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengingat konfirmasi SOP berhasil dikirim ke <b>{reminderSent}</b>.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Kepatuhan Pembacaan SOP</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.overallComplianceRate}%</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3" /> Target 100%
          </span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Total Konfirmasi Selesai</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.totalReadConfirmed}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Dari {summary.totalAssignedRecords} Penugasan SOP</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Menunggu Konfirmasi</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.totalPendingRead}</div>
          <span className="text-[10px] text-amber-400/80 mt-0.5">{summary.staffWithUnreadCount} Staf Terlibat</span>
        </div>

        <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E]">
          <span className="text-[11px] text-gray-400 block">Katalog SOP Aktif</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">{summary.totalSops} Dokumen</div>
          <span className="text-[10px] text-gray-400 mt-0.5">Multi-divisi</span>
        </div>
      </div>

      {/* Unread Staff Action Panel */}
      {unreadStaffList.length > 0 && (
        <div className="bg-gradient-to-br from-[#1E2438] to-purple-950/20 rounded-2xl border border-purple-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Daftar Staf Belum Membaca SOP ({unreadStaffList.length} Personel)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unreadStaffList.map((staf) => (
              <div key={staf.employeeId} className="bg-[#111827] p-3 rounded-xl border border-[#2D374E] flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-xs">{staf.name}</div>
                  <div className="text-[10px] text-gray-400">{staf.position} &bull; {staf.department}</div>
                  <div className="text-[10px] text-rose-300 mt-1">
                    Belum Dibaca: {staf.unreadSopTitles.join(', ')}
                  </div>
                </div>

                <button
                  onClick={() => handleSendReminder(staf.name)}
                  className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Bell className="w-3 h-3" />
                  <span>Ingatkan</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Breakdown */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Kepatuhan Pembacaan SOP Per Divisi</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departmentBreakdown.map((dept) => (
            <div key={dept.department} className="bg-[#111827] p-3.5 rounded-xl border border-[#2D374E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{dept.department}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  dept.complianceRate >= 95
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {dept.complianceRate}%
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Dibaca: <b className="text-emerald-400">{dept.readCount}</b> / {dept.assignedCount}</span>
                <span>Pending: <b className="text-amber-400">{dept.pendingCount}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee SOP Roster Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Status Pembacaan SOP Seluruh Staf</span>
            </h4>
            <p className="text-xs text-gray-400">Pencatatan konfirmasi baca dan pemahaman instruksi kerja</p>
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
                <th className="py-2.5 px-2 font-semibold text-center">SOP Ditugaskan</th>
                <th className="py-2.5 px-2 font-semibold text-center">Selesai Dibaca</th>
                <th className="py-2.5 px-2 font-semibold text-center">Pending</th>
                <th className="py-2.5 px-2 font-semibold text-center">Kepatuhan %</th>
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
                  <td className="py-2.5 px-2 text-center text-gray-300 font-semibold">
                    {emp.assignedSopsCount} SOP
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                    {emp.readSopsCount}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {emp.pendingSopsCount > 0 ? (
                      <span className="text-amber-400 font-bold">{emp.pendingSopsCount}</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      emp.complianceRate >= 95
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {emp.complianceRate}%
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
