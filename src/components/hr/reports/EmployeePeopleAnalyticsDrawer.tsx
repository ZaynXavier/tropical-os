/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 360-Degree Employee People Analytics Sliding Drawer
 */

import React, { useState } from 'react';
import { EmployeeDrillDownData } from '../../../types/hrReports';
import {
  X,
  User,
  HeartPulse,
  Clock,
  Coffee,
  DollarSign,
  FileCheck,
  BookOpen,
  ClipboardList,
  Award,
  Calendar,
  Building2,
  Mail,
  Phone,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface EmployeePeopleAnalyticsDrawerProps {
  data: EmployeeDrillDownData | null;
  isOpen: boolean;
  onClose: () => void;
  canViewPayroll?: boolean;
}

type TabKey = 'OVERVIEW' | 'ATTENDANCE' | 'BREAK_OT' | 'PAYROLL' | 'COMPLIANCE' | 'SOP_CHECKLIST' | 'KPI';

export const EmployeePeopleAnalyticsDrawer: React.FC<EmployeePeopleAnalyticsDrawerProps> = ({
  data,
  isOpen,
  onClose,
  canViewPayroll = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');

  if (!isOpen || !data) return null;

  const { employee, healthScore, attendance, breakAndOvertime, payroll, documents, sops, checklists, kpi } = data;

  const getTierBadge = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'HEALTHY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'NEEDS_ATTENTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#181D2D] border-l border-[#2D374E] text-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 bg-[#1E2438] border-b border-[#2D374E]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                  {employee.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{employee.fullName}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadge(healthScore.healthLevel)}`}>
                      {healthScore.healthLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {employee.employeeCode} &bull; <b className="text-gray-200">{employee.position}</b> ({employee.department})
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-[#111827] text-gray-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Micro Info */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#2D374E]/60 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Divisi: {employee.department}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{employee.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Gabung: {employee.joinDate || '2024-01-15'}</span>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 mt-4 overflow-x-auto custom-scrollbar pb-1">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab('ATTENDANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'ATTENDANCE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                Presensi &amp; Shift
              </button>
              <button
                onClick={() => setActiveTab('BREAK_OT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'BREAK_OT'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                Break &amp; Lembur
              </button>
              <button
                onClick={() => setActiveTab('PAYROLL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'PAYROLL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                Payroll
              </button>
              <button
                onClick={() => setActiveTab('COMPLIANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'COMPLIANCE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                Dokumen
              </button>
              <button
                onClick={() => setActiveTab('SOP_CHECKLIST')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'SOP_CHECKLIST'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                SOP &amp; Checklist
              </button>
              <button
                onClick={() => setActiveTab('KPI')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'KPI'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200'
                }`}
              >
                KPI
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4 animate-fade-in">
                {/* Health Score Summary Card */}
                <div className="bg-[#1E2438] rounded-2xl border border-purple-500/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-sm text-white">People Health Score Personal</span>
                    </div>
                    <div className="text-xl font-extrabold text-purple-300">
                      {healthScore.overallScore} <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      style={{ width: `${healthScore.overallScore}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2D374E]/60 text-[11px]">
                    <div className="bg-[#111827] p-2 rounded-lg">
                      <span className="text-gray-400 block">Kehadiran:</span>
                      <b className="text-emerald-400">{healthScore.attendanceScore}%</b>
                    </div>
                    <div className="bg-[#111827] p-2 rounded-lg">
                      <span className="text-gray-400 block">Disiplin:</span>
                      <b className="text-amber-400">{healthScore.disciplineScore}%</b>
                    </div>
                    <div className="bg-[#111827] p-2 rounded-lg">
                      <span className="text-gray-400 block">KPI Score:</span>
                      <b className="text-blue-400">{healthScore.kpiScore} Poin</b>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1E2438] p-3.5 rounded-xl border border-[#2D374E]">
                    <span className="text-gray-400 text-[11px] block">Presensi Bulan Ini</span>
                    <div className="text-base font-bold text-white mt-0.5">{attendance.attendanceRate}%</div>
                    <span className="text-[10px] text-gray-400">Hadir: {attendance.presentDays} hari &bull; Telat: {attendance.lateDays}x</span>
                  </div>

                  <div className="bg-[#1E2438] p-3.5 rounded-xl border border-[#2D374E]">
                    <span className="text-gray-400 text-[11px] block">Lembur Disetujui</span>
                    <div className="text-base font-bold text-amber-300 mt-0.5">{breakAndOvertime.overtimeApprovedHours} Jam</div>
                    <span className="text-[10px] text-gray-400">Simulasi: Rp {(breakAndOvertime.overtimeCostSimulation ?? 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="bg-[#1E2438] p-3.5 rounded-xl border border-[#2D374E]">
                    <span className="text-gray-400 text-[11px] block">Kepatuhan Checklist</span>
                    <div className="text-base font-bold text-white mt-0.5">{checklists.completionRate}%</div>
                    <span className="text-[10px] text-gray-400">Skor Rata-rata: {checklists.avgScore}</span>
                  </div>

                  <div className="bg-[#1E2438] p-3.5 rounded-xl border border-[#2D374E]">
                    <span className="text-gray-400 text-[11px] block">Kepatuhan SOP</span>
                    <div className="text-base font-bold text-white mt-0.5">{sops.complianceRate}%</div>
                    <span className="text-[10px] text-gray-400">Dibaca: {sops.readCount} dari {sops.assignedCount} SOP</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ATTENDANCE */}
            {activeTab === 'ATTENDANCE' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Statistik Kehadiran Periode Aktif</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Hari Hadir:</span>
                      <b className="text-emerald-400">{attendance.presentDays} Hari</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Terlambat:</span>
                      <b className="text-amber-400">{attendance.lateDays} Kali ({attendance.totalLateMinutes}m)</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Alpha / Tanpa Ket:</span>
                      <b className="text-rose-400">{attendance.absentDays} Hari</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Izin / Sakit:</span>
                      <b className="text-blue-400">{attendance.leaveDays} Hari</b>
                    </div>
                  </div>
                  <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Potongan Denda Keterlambatan:</span>
                    <b className="text-amber-300 font-bold">
                      Rp {(attendance.latePenaltyAmount ?? 0).toLocaleString('id-ID')}
                    </b>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BREAK & OVERTIME */}
            {activeTab === 'BREAK_OT' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-purple-400" />
                    <span>Disiplin Istirahat (Break Management)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Sesi Istirahat:</span>
                      <b>{breakAndOvertime.breakSessionsCount} Sesi</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Rata-rata Durasi:</span>
                      <b>{breakAndOvertime.averageBreakMinutes} Menit</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Insiden Over-Break:</span>
                      <b className={breakAndOvertime.excessBreakCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {breakAndOvertime.excessBreakCount} Kali
                      </b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Additional Break:</span>
                      <b>{breakAndOvertime.additionalBreakApproved} / {breakAndOvertime.additionalBreakRequested} Disetujui</b>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Rekap Lembur (Surat Perintah Lembur)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Lembur Disetujui:</span>
                      <b className="text-amber-300">{breakAndOvertime.overtimeApprovedHours} Jam</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Lembur Diajukan:</span>
                      <b>{breakAndOvertime.overtimeRequestedHours} Jam</b>
                    </div>
                  </div>
                  <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Simulasi Pembayaran Lembur:</span>
                    <b className="text-amber-300 font-bold">
                      Rp {(breakAndOvertime.overtimeCostSimulation ?? 0).toLocaleString('id-ID')}
                    </b>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PAYROLL */}
            {activeTab === 'PAYROLL' && (
              <div className="space-y-4 animate-fade-in">
                {canViewPayroll ? (
                  <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2D374E] pb-2">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Rincian Slip Gaji Karyawan</span>
                      </h4>
                      <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {payroll.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-[#2D374E]/40">
                        <span className="text-gray-400">Gaji Pokok:</span>
                        <span className="font-semibold text-gray-200">Rp {(payroll.basicSalary ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#2D374E]/40">
                        <span className="text-gray-400">Tunjangan Posisi &amp; Transport:</span>
                        <span className="font-semibold text-gray-200">Rp {(payroll.allowances ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#2D374E]/40">
                        <span className="text-gray-400">Upah Lembur:</span>
                        <span className="font-semibold text-amber-300">Rp {(payroll.overtimePay ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#2D374E]/40">
                        <span className="text-gray-400">Potongan Denda Telat:</span>
                        <span className="font-semibold text-rose-400">-Rp {(payroll.lateDeductions ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#2D374E]/40">
                        <span className="text-gray-400">Potongan Cicilan Kasbon:</span>
                        <span className="font-semibold text-rose-400">-Rp {(payroll.kasbonDeductions ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between py-2 pt-3 text-xs bg-[#111827] px-3 rounded-lg border border-[#2D374E]">
                        <span className="font-bold text-white">Take Home Pay Bersih:</span>
                        <span className="font-extrabold text-emerald-400 text-sm">
                          Rp {(payroll.netSalary ?? 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E2438] p-6 rounded-xl border border-[#2D374E] text-center space-y-2">
                    <Lock className="w-8 h-8 text-gray-500 mx-auto" />
                    <h4 className="font-bold text-white text-xs">Akses Terbatas (Privasi Gaji)</h4>
                    <p className="text-gray-400 text-[11px]">
                      Data rincian gaji personel dilindungi oleh kebijakan RBAC TropicalOS. Hanya dapat diakses oleh Owner, Finance, atau staf bersangkutan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: COMPLIANCE */}
            {activeTab === 'COMPLIANCE' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-indigo-400" />
                      <span>Status Kelengkapan Berkas SDM</span>
                    </h4>
                    <span className="font-bold text-emerald-400">{documents.completionRate}% Lengkap</span>
                  </div>

                  <div className="space-y-2">
                    {documents.uploadedDocuments && documents.uploadedDocuments.length > 0 ? (
                      documents.uploadedDocuments.map((doc, idx) => (
                        <div key={idx} className="bg-[#111827] p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-white block">{doc.title}</span>
                            <span className="text-[10px] text-gray-400">Masa Berlaku: {doc.expiryDate || 'Seumur Hidup'}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-[11px]">Belum ada berkas terunggah</div>
                    )}
                  </div>

                  {documents.missingDocuments && documents.missingDocuments.length > 0 && (
                    <div className="bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg text-[11px] text-rose-300">
                      <span className="font-bold block mb-0.5">Dokumen Wajib Belum Diunggah:</span>
                      {documents.missingDocuments.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SOP & CHECKLIST */}
            {activeTab === 'SOP_CHECKLIST' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Kepatuhan SOP ({sops.complianceRate}%)</span>
                  </h4>
                  <div className="text-[11px] text-gray-300">
                    Telah membaca dan mengonfirmasi <b>{sops.readCount}</b> dari <b>{sops.assignedCount}</b> SOP operasional yang ditugaskan.
                  </div>
                </div>

                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-blue-400" />
                    <span>Kepatuhan Checklist Harian</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Selesai:</span>
                      <b className="text-emerald-400">{checklists.completedCount} / {checklists.assignedCount}</b>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg flex justify-between">
                      <span className="text-gray-400">Foto Bukti:</span>
                      <b className="text-purple-300">{checklists.photoEvidenceRate}%</b>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: KPI */}
            {activeTab === 'KPI' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#1E2438] p-4 rounded-xl border border-[#2D374E] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Evaluasi Key Performance Indicator (KPI)</span>
                    </h4>
                    <span className="text-sm font-extrabold text-amber-300">{kpi.score} Poin</span>
                  </div>

                  <p className="text-gray-400 text-[11px]">
                    Evaluasi komprehensif atas pencapaian output kerja, disiplin service time, kepatuhan hygiene, dan kerjasama tim.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-[#1E2438] border-t border-[#2D374E] flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
