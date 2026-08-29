/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll Record Detail Modal
 */

import React from 'react';
import { PayrollRecord, PayrollPeriod } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { formatCurrency, formatDate } from '../../../services/payrollService';
import {
  X,
  DollarSign,
  User,
  Building2,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Coffee,
  ShieldCheck,
  CreditCard,
  Printer,
  Sparkles,
} from 'lucide-react';

interface PayrollDetailModalProps {
  record: PayrollRecord | null;
  period: PayrollPeriod | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPayslip?: (record: PayrollRecord) => void;
  onOpenAdjustment?: (record: PayrollRecord) => void;
}

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({
  record,
  period,
  isOpen,
  onClose,
  onOpenPayslip,
  onOpenAdjustment,
}) => {
  if (!isOpen || !record) return null;

  const employee = MASTER_EMPLOYEES.find((e) => e.id === record.employeeId);
  const isLocked = period?.status === 'LOCKED' || period?.status === 'PAID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D374E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Rincian Perhitungan Payroll Karyawan</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Simulasi Payroll
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Periode: {period?.periodName || 'Agustus 2026'} ({period?.startDate} s/d {period?.endDate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#252D42] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Banner */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-lg">
              {employee?.fullName.charAt(0) || 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{employee?.fullName}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {employee?.employeeCode}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {employee?.primaryPosition} • <span className="text-gray-300">{employee?.department}</span>
              </p>
            </div>
          </div>

          <div className="text-right self-end sm:self-center">
            <p className="text-[10px] text-gray-400">Status Periode</p>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isLocked
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isLocked ? 'FINAL (Terkunci)' : 'PREVIEW (Dalam Review)'}
            </span>
          </div>
        </div>

        {/* 2-Column Earnings & Deductions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2D374E]">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Komponen Penerimaan (Earnings)
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {formatCurrency(record.grossSalary)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Gaji Pokok (Basic Salary)</span>
                <span className="font-semibold text-white">{formatCurrency(record.basicSalary)}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Tunjangan Makan</span>
                <span className="font-semibold">{formatCurrency(record.mealAllowance)}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Tunjangan Transport</span>
                <span className="font-semibold">{formatCurrency(record.transportAllowance)}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Tunjangan Jabatan</span>
                <span className="font-semibold">{formatCurrency(record.positionAllowance)}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Tunjangan Lainnya</span>
                <span className="font-semibold">{formatCurrency(record.otherAllowance)}</span>
              </div>

              <div className="flex justify-between text-gray-300 pt-1 border-t border-[#2D374E]/40">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upah Lembur Disetujui ({record.overtimeSummary?.totalApprovedHours || 0} Jam)</span>
                </div>
                <span className="font-semibold text-amber-400">
                  {formatCurrency(record.overtimeAmount)}
                </span>
              </div>

              {record.otherEarnings > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Bonus & Penyesuaian</span>
                  <span className="font-semibold text-emerald-400">
                    +{formatCurrency(record.otherEarnings)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#2D374E] flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Total Penghasilan Kotor (Gross)</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(record.grossSalary)}
              </span>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-rose-500/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2D374E]">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Komponen Pemotongan (Deductions)
              </span>
              <span className="text-xs font-bold text-rose-300">
                -{formatCurrency(record.totalDeduction)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Potongan Keterlambatan ({record.attendanceSummary?.totalLateMinutes || 0} Menit)</span>
                </div>
                <span className="font-semibold text-rose-300">
                  {record.lateDeduction > 0 ? `-${formatCurrency(record.lateDeduction)}` : 'Rp 0'}
                </span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Potongan Ketidakhadiran (Absence)</span>
                <span className="font-semibold text-gray-400">
                  {record.absenceDeduction > 0 ? `-${formatCurrency(record.absenceDeduction)}` : 'Rp 0'}
                </span>
              </div>

              <div className="flex justify-between text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Potongan Kasbon (Salary Advance)</span>
                </div>
                <span className="font-semibold text-blue-300">
                  {record.advanceDeduction > 0 ? `-${formatCurrency(record.advanceDeduction)}` : 'Rp 0'}
                </span>
              </div>

              {record.otherDeduction > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Potongan Lainnya / Koreksi</span>
                  <span className="font-semibold text-rose-300">
                    -{formatCurrency(record.otherDeduction)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#2D374E] flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Total Seluruh Potongan</span>
              <span className="text-sm font-bold text-rose-400">
                -{formatCurrency(record.totalDeduction)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#111827] to-emerald-950/40 border border-emerald-500/40 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Gaji Bersih Diterima (Take Home Pay / Net Salary)
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Gross Salary ({formatCurrency(record.grossSalary)}) — Deductions ({formatCurrency(record.totalDeduction)})
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(record.netSalary)}
            </span>
          </div>
        </div>

        {/* Operational Context Data (Attendance, Overtime, Break, KPI) */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-3">
          <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Konteks Operasional Resto (Operational Aggregates)
          </h5>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Attendance */}
            <div className="p-3 rounded-xl bg-[#181F32] border border-[#2D374E]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Kehadiran</span>
              </div>
              <p className="font-bold text-white text-sm">
                {record.attendanceSummary?.presentDays || 22} Hari Hadir
              </p>
              <p className="text-[10px] text-gray-500">
                Terlambat: {record.attendanceSummary?.totalLateMinutes || 0}m ({record.attendanceSummary?.lateDays || 0}x)
              </p>
            </div>

            {/* Overtime */}
            <div className="p-3 rounded-xl bg-[#181F32] border border-[#2D374E]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lembur (SPL)</span>
              </div>
              <p className="font-bold text-amber-300 text-sm">
                {record.overtimeSummary?.totalApprovedHours || 0} Jam Disetujui
              </p>
              <p className="text-[10px] text-gray-500">
                Rate: Rp 10.000/jam • {record.overtimeSummary?.splCount || 0} Form SPL
              </p>
            </div>

            {/* Break */}
            <div className="p-3 rounded-xl bg-[#181F32] border border-[#2D374E]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Coffee className="w-3.5 h-3.5 text-purple-400" />
                <span>Istirahat</span>
              </div>
              <p className="font-bold text-purple-300 text-sm">Standar 60m/hari</p>
              <p className="text-[10px] text-emerald-400">Patuh SOP Resto</p>
            </div>

            {/* KPI */}
            <div className="p-3 rounded-xl bg-[#181F32] border border-[#2D374E]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Award className="w-3.5 h-3.5 text-rose-400" />
                <span>Kinerja / KPI</span>
              </div>
              <p className="font-bold text-emerald-400 text-sm">
                Skor {record.kpiSummary?.kpiScore || 88}
              </p>
              <p className="text-[10px] text-gray-400">{record.kpiSummary?.performanceRating || 'Sangat Baik'}</p>
            </div>
          </div>
        </div>

        {/* Audit Footer */}
        <div className="p-3 rounded-2xl bg-[#111827]/40 border border-[#2D374E] text-[10px] text-gray-400 flex flex-wrap items-center justify-between gap-2">
          <span>Dihitung: {record.calculatedBy || 'System Engine'} ({formatDate(record.calculatedAt)})</span>
          {record.approvedBy && <span>Disetujui: {record.approvedBy} ({formatDate(record.approvedAt)})</span>}
          {record.lockedBy && <span>Dikunci: {record.lockedBy} ({formatDate(record.lockedAt)})</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2D374E]">
          {!isLocked && onOpenAdjustment ? (
            <button
              onClick={() => {
                onClose();
                onOpenAdjustment(record);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-xs font-semibold text-purple-300 hover:bg-purple-600/20 transition-colors cursor-pointer"
            >
              + Tambah Penyesuaian
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2D374E] text-xs font-semibold text-gray-300 hover:bg-[#111827] transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {onOpenPayslip && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayslip(record);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka Slip Gaji</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
