/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * HR Monthly Business Review (MBR) Report View & Action Plan Tracker
 */

import React, { useState } from 'react';
import { HRMonthlyReportData, HRActionPlanItem } from '../../../types/hrReports';
import {
  FileText,
  HeartPulse,
  Users,
  Clock,
  Coffee,
  DollarSign,
  FileCheck,
  BookOpen,
  ClipboardList,
  Award,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  Download,
  Printer,
  X,
} from 'lucide-react';

interface HRMonthlyReportViewProps {
  data: HRMonthlyReportData;
  canViewPayroll?: boolean;
  onAddActionPlan: (plan: Omit<HRActionPlanItem, 'id' | 'createdAt'>) => void;
  onUpdateActionPlanStatus: (id: string, status: HRActionPlanItem['status']) => void;
  onExportCsv: () => void;
}

export const HRMonthlyReportView: React.FC<HRMonthlyReportViewProps> = ({
  data,
  canViewPayroll = true,
  onAddActionPlan,
  onUpdateActionPlanStatus,
  onExportCsv,
}) => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('HR Manager');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newDueDate, setNewDueDate] = useState('2026-08-31');

  const {
    month = 'Agustus',
    year = 2026,
    generatedAt = '',
    summary = {} as any,
    peopleHealth = {} as any,
    departmentScorecard = [],
    actionPlans = [],
  } = data || {};

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddActionPlan({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Rencana aksi tindak lanjut operasional SDM.',
      category: 'GENERAL',
      priority: newPriority,
      assignedTo: newAssignee,
      targetDepartment: 'ALL',
      dueDate: newDueDate,
      status: 'OPEN',
      createdBy: 'HR / Management',
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddPlanModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Export and Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>HR Monthly Report &amp; Executive Business Review (MBR)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {month} {year}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Laporan eksekutif terpadu 14 pilar manajemen SDM Tropical Garden Resto untuk konsumsi Direksi dan Manajemen.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Cetak format MBR"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Cetak</span>
          </button>
          <button
            onClick={onExportCsv}
            className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export MBR (CSV)</span>
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY & HIGHLIGHTS */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white">1. Executive Summary &amp; Resto Health Index</h4>
          </div>
          <span className="text-[11px] text-gray-400">Digenerate: {generatedAt}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111827] p-4 rounded-xl border border-purple-500/30">
            <span className="text-xs text-gray-400 block">Resto People Health Score</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {peopleHealth.overallScore} <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
              Status: {peopleHealth.healthLevel} (Terkendali)
            </span>
          </div>

          <div className="bg-[#111827] p-4 rounded-xl border border-[#2D374E]">
            <span className="text-xs text-gray-400 block">Tingkat Presensi &amp; Disiplin</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{summary.attendanceRate}%</div>
            <span className="text-[10px] text-gray-400 block mt-1">
              Telat: {summary.lateRate}% &bull; Denda Telat: Rp {(summary.totalLatePenalty ?? 0).toLocaleString('id-ID')}
            </span>
          </div>

          {canViewPayroll ? (
            <div className="bg-[#111827] p-4 rounded-xl border border-[#2D374E]">
              <span className="text-xs text-gray-400 block">Total Payroll &amp; Labor Cost</span>
              <div className="text-2xl font-extrabold text-purple-300 mt-1">
                Rp {(summary.totalNetPayroll ?? 0).toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">
                Labor Cost Ratio: {summary.laborCostRatio}% (Target &le; 22%)
              </span>
            </div>
          ) : (
            <div className="bg-[#111827] p-4 rounded-xl border border-[#2D374E]">
              <span className="text-xs text-gray-400 block">Kepatuhan Operasional</span>
              <div className="text-3xl font-extrabold text-indigo-400 mt-1">{summary.checklistComplianceRate}%</div>
              <span className="text-[10px] text-gray-400 block mt-1">
                SOP: {summary.sopComplianceRate}% &bull; Dokumen: {summary.documentComplianceRate}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DEPARTMENT SCORECARD MATRIX */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>2. Rapor Evaluasi Kinerja Antar Divisi (Department Scorecard)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                <th className="py-2.5 px-3 font-semibold">Divisi</th>
                <th className="py-2.5 px-2 font-semibold text-center">Headcount</th>
                <th className="py-2.5 px-2 font-semibold text-center">Presensi</th>
                <th className="py-2.5 px-2 font-semibold text-center">Checklist</th>
                <th className="py-2.5 px-2 font-semibold text-center">SOP</th>
                <th className="py-2.5 px-2 font-semibold text-center">Lembur</th>
                <th className="py-2.5 px-2 font-semibold text-center">Health Score</th>
                <th className="py-2.5 px-2 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
              {departmentScorecard.map((dept) => (
                <tr key={dept.department} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{dept.department}</td>
                  <td className="py-3 px-2 text-center text-gray-400">{dept.headcount} Staf</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-200">{dept.attendanceRate}%</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-200">{dept.checklistScore}%</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-200">{dept.sopComplianceRate}%</td>
                  <td className="py-3 px-2 text-center text-amber-300">{dept.overtimeHours}j</td>
                  <td className="py-3 px-2 text-center font-extrabold text-purple-300 text-sm">
                    {dept.healthScore}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      dept.healthLevel === 'EXCELLENT'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : dept.healthLevel === 'HEALTHY'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {dept.healthLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. STRATEGIC ACTION PLANS & MBR RECOMMENDATIONS */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                3. Strategic HR Action Plans &amp; Tracker
              </h4>
              <p className="text-xs text-gray-400">
                Pencatatan komitmen tindak lanjut hasil audit SDM untuk evaluasi MBR bulan berikutnya
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/30 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Action Plan</span>
          </button>
        </div>

        <div className="space-y-3">
          {actionPlans.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Belum ada action plan yang dibuat. Klik "Tambah Action Plan" untuk membuat rencana tindak lanjut.
            </div>
          ) : (
            actionPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#111827] p-4 rounded-xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{plan.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      plan.priority === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {plan.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{plan.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
                    <span>PIC: <b className="text-gray-200">{plan.assignedTo}</b></span>
                    <span>Tenggat: <b>{plan.dueDate}</b></span>
                    <span>Target: <b>{plan.targetDepartment}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={plan.status}
                    onChange={(e) => onUpdateActionPlanStatus(plan.id, e.target.value as any)}
                    className="bg-[#1E2438] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="OPEN">Open (Baru)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed (Selesai)</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL TAMBAH ACTION PLAN */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <form onSubmit={handleCreatePlan} className="bg-[#1E2438] border border-[#2D374E] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span>Buat Action Plan Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPlanModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#111827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Judul Tindakan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Coaching Keterlambatan Shift Kitchen..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Deskripsi Tindakan</label>
                <textarea
                  rows={3}
                  placeholder="Rincian langkah pembinaan dan target hasil..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl p-3 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">PIC (Penanggung Jawab)</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tenggat Waktu</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPlanModal(false)}
                className="px-4 py-2 bg-[#111827] text-gray-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-purple-600/30"
              >
                Simpan Action Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
