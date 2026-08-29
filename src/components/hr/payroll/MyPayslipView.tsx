/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — My Payslip (Staff Self-Service View)
 */

import React, { useState, useEffect } from 'react';
import { Payslip } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { payrollService, formatCurrency, formatDate } from '../../../services/payrollService';
import { PayslipModal } from './PayslipModal';
import {
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface MyPayslipViewProps {
  currentUserId?: string;
  userRole?: string;
}

export const MyPayslipView: React.FC<MyPayslipViewProps> = ({
  currentUserId = 'emp-11', // default demo as Budi / Staff
  userRole = 'MANAGER',
}) => {
  const isStaff = userRole === 'STAFF';
  const [selectedEmpId, setSelectedEmpId] = useState(currentUserId);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isStaff) {
      setSelectedEmpId(currentUserId);
    }
  }, [isStaff, currentUserId]);

  const employee = MASTER_EMPLOYEES.find((e) => e.id === (isStaff ? currentUserId : selectedEmpId));

  useEffect(() => {
    loadPayslips();
  }, [selectedEmpId, isStaff, currentUserId]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const targetId = isStaff ? currentUserId : selectedEmpId;
      const slips = await payrollService.getEmployeePayslips(targetId);
      setPayslips(slips);
      if (slips.length > 0) {
        setSelectedSlip(slips[0]);
      }
    } catch (err) {
      console.error('Failed to load employee payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSlip = (slip: Payslip) => {
    setSelectedSlip(slip);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Self Service Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-[#181F32] border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Portal Slip Gaji Mandiri (Self-Service)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Akses Karyawan
              </span>
            </div>
            <p className="text-gray-300 text-xs mt-0.5">
              Rincian kompensasi bulanan, upah lembur, tunjangan, dan pemotongan resmi Anda.
            </p>
          </div>
        </div>

        {/* Demo Switcher for Preview Testing - Only for Manager/Admin preview */}
        {!isStaff && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Lihat sebagai:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {MASTER_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.primaryPosition})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Employee Quick Profile Card */}
      {employee && (
        <div className="p-5 rounded-3xl bg-[#181F32] border border-[#2D374E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-black text-xl text-purple-300">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{employee.fullName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {employee.employeeCode}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {employee.primaryPosition} • <span className="text-gray-300">{employee.department}</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Bergabung sejak: {formatDate(employee.joinDate)} • Status: {employee.employmentStatus}
              </p>
            </div>
          </div>

          {selectedSlip && (
            <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 bg-emerald-500/5 text-right space-y-0.5 min-w-[200px]">
              <p className="text-[11px] text-emerald-400 font-semibold">Gaji Bersih Periode Terakhir</p>
              <p className="text-2xl font-black text-emerald-300">{formatCurrency(selectedSlip.netSalary)}</p>
              <p className="text-[10px] text-gray-400">{selectedSlip.periodName} ({selectedSlip.status})</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly Payslips List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Daftar Riwayat Slip Gaji Bulanan
        </h4>

        {loading ? (
          <p className="text-xs text-gray-500 py-6 text-center">Memuat riwayat slip gaji...</p>
        ) : payslips.length === 0 ? (
          <div className="p-8 text-center bg-[#181F32] rounded-3xl border border-[#2D374E] space-y-2">
            <FileText className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs font-bold text-gray-300">Belum ada slip gaji diterbitkan</p>
            <p className="text-[11px] text-gray-500">
              Slip gaji akan muncul otomatis setelah periode payroll dihitung atau dikunci.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payslips.map((slip) => (
              <div
                key={slip.payslipId}
                className="p-5 rounded-3xl bg-[#181F32] border border-[#2D374E] hover:border-purple-500/40 transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{slip.periodName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slip.status === 'Final'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {slip.status === 'Final' ? 'Resmi (Final)' : 'Simulasi Preview'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {slip.periodStartDate} s/d {slip.periodEndDate}
                  </p>
                </div>

                <div className="p-3 bg-[#111827] rounded-2xl border border-[#2D374E] space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Penerimaan Kotor:</span>
                    <span className="font-semibold text-white">{formatCurrency(slip.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Total Pemotongan:</span>
                    <span className="font-semibold text-rose-300">-{formatCurrency(slip.totalDeductions)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#2D374E] flex justify-between items-center font-bold">
                    <span className="text-emerald-400">Take Home Pay:</span>
                    <span className="text-sm text-emerald-300">{formatCurrency(slip.netSalary)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Hadir: {slip.presentDays} Hari</span>
                  <span>Lembur: {slip.approvedOvertimeHours} Jam</span>
                </div>

                <button
                  onClick={() => handleOpenSlip(slip)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka & Cetak Slip Gaji</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        payslipIdOrRecord={selectedSlip?.payslipId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
