import React, { useState } from 'react';
import { X, Download, DollarSign, Calendar, CheckCircle2, ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { PayslipDetailModal } from './PayslipDetailModal';

interface PayrollHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeePersonnel | null;
}

export const PayrollHistoryModal: React.FC<PayrollHistoryModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const isSupervisor = employee.accessLevel === 'SUPERVISOR' || employee.accessLevel === 'MANAGER';
  const baseSalary = isSupervisor ? 4200000 : 3200000;
  const positionAllowance = isSupervisor ? 800000 : 350000;

  const historyList = [
    {
      id: 'PAY-2026-08',
      period: 'Agustus 2026',
      transferDate: '25 Agustus 2026',
      totalGross: baseSalary + positionAllowance + 450000 + 650000 + 280000,
      totalDeductions: 310000,
      netPay: baseSalary + positionAllowance + 450000 + 650000 + 280000 - 310000,
      status: 'DITRANSFER',
      bank: 'BCA •••• 9102',
    },
    {
      id: 'PAY-2026-07',
      period: 'Juli 2026',
      transferDate: '25 Juli 2026',
      totalGross: baseSalary + positionAllowance + 450000 + 580000 + 190000,
      totalDeductions: 310000,
      netPay: baseSalary + positionAllowance + 450000 + 580000 + 190000 - 310000,
      status: 'DITRANSFER',
      bank: 'BCA •••• 9102',
    },
    {
      id: 'PAY-2026-06',
      period: 'Juni 2026',
      transferDate: '25 Juni 2026',
      totalGross: baseSalary + positionAllowance + 450000 + 720000 + 350000,
      totalDeductions: 310000,
      netPay: baseSalary + positionAllowance + 450000 + 720000 + 350000 - 310000,
      status: 'DITRANSFER',
      bank: 'BCA •••• 9102',
    },
    {
      id: 'PAY-2026-05',
      period: 'Mei 2026',
      transferDate: '25 Mei 2026',
      totalGross: baseSalary + positionAllowance + 450000 + 500000 + 140000,
      totalDeductions: 110000,
      netPay: baseSalary + positionAllowance + 450000 + 500000 + 140000 - 110000,
      status: 'DITRANSFER',
      bank: 'BCA •••• 9102',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161C2C] border border-[#2D374E] rounded-[32px] overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#2D374E] flex items-center justify-between bg-[#111827]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white leading-tight">History &amp; Arsip Gaji</h3>
                <p className="text-[10px] text-gray-400">Riwayat Slip Gaji Bulanan Karyawan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto space-y-3 text-xs">
            {/* Employee Quick Info */}
            <div className="p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">Karyawan</span>
                <span className="font-bold text-white text-xs">{employee.name}</span>
                <div className="text-[10px] text-purple-300">{employee.department} • {employee.primaryPosition}</div>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#161C2C] text-emerald-300 border border-emerald-500/30">
                {employee.nik || 'TG-2026-084'}
              </span>
            </div>

            {/* List of Payslips */}
            <div className="space-y-2 pt-1">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPeriod(item.period)}
                  className="p-3.5 rounded-2xl bg-[#0F1420] border border-[#2D374E] hover:border-purple-500/50 transition-all cursor-pointer shadow flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.period}</span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Transfer: {item.transferDate} • {item.bank}
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      Rp {item.netPay.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`File PDF Slip Gaji ${item.period} berhasil diunduh.`);
                      }}
                      title="Unduh PDF"
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600/30 text-gray-300 hover:text-purple-200 border border-white/10 flex items-center justify-center transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Period Payslip Detail */}
      {selectedPeriod && (
        <PayslipDetailModal
          isOpen={!!selectedPeriod}
          onClose={() => setSelectedPeriod(null)}
          employee={employee}
          periodName={selectedPeriod}
        />
      )}
    </>
  );
};
