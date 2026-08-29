import React from 'react';
import { X, Download, ShieldCheck, DollarSign, Calendar, CheckCircle2, Building, Printer } from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface PayslipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeePersonnel | null;
  periodName?: string;
}

export const PayslipDetailModal: React.FC<PayslipDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  periodName = 'Agustus 2026',
}) => {
  if (!isOpen || !employee) return null;

  // Mock standard salary calculation based on role
  const isSupervisor = employee.accessLevel === 'SUPERVISOR' || employee.accessLevel === 'MANAGER';
  const baseSalary = isSupervisor ? 4200000 : 3200000;
  const positionAllowance = isSupervisor ? 800000 : 350000;
  const mealTransportAllowance = 450000;
  const serviceChargeBonus = 650000;
  const overtimePay = 280000;

  const totalEarnings = baseSalary + positionAllowance + mealTransportAllowance + serviceChargeBonus + overtimePay;

  const bpjsKesehatan = 45000;
  const bpjsKetenagakerjaan = 65000;
  const kasbonDeduction = 200000;

  const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + kasbonDeduction;
  const netTakeHomePay = totalEarnings - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161C2C] border border-[#2D374E] rounded-[32px] overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D374E] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">E-Slip Gaji Karyawan</h3>
              <p className="text-[10px] text-gray-400">Periode: {periodName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slip Gaji Content (Printable Layout) */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Company Stamp & Employee Info */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-2.5">
              <div>
                <div className="text-xs font-black text-white tracking-wide">TROPICAL GARDEN RESTO</div>
                <div className="text-[10px] text-purple-400 font-mono">PT Tropical Kuliner Nusantara</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> PAID / DITRANSFER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400 block text-[10px]">Nama Karyawan</span>
                <span className="font-bold text-white">{employee.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">NIK / ID Staff</span>
                <span className="font-mono text-purple-300 font-semibold">{employee.nik || 'TG-2026-084'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Divisi / Jabatan</span>
                <span className="text-gray-200">{employee.department} • {employee.primaryPosition}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Rekening Payroll</span>
                <span className="font-mono text-gray-200">BCA •••• 9102</span>
              </div>
            </div>
          </div>

          {/* Penghasilan (Earnings) */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>A. Penghasilan (Earnings)</span>
              <span className="text-white font-mono">Rp {totalEarnings.toLocaleString('id-ID')}</span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between text-gray-300">
                <span>Gaji Pokok (Bulanan)</span>
                <span className="font-mono">Rp {baseSalary.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tunjangan Jabatan &amp; Keahlian</span>
                <span className="font-mono">Rp {positionAllowance.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Uang Makan &amp; Transportasi Shift</span>
                <span className="font-mono">Rp {mealTransportAllowance.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Bonus Bagi Hasil / Service Charge</span>
                <span className="font-mono text-emerald-400">Rp {serviceChargeBonus.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Upah Lembur Resmi (SPL 8 Jam)</span>
                <span className="font-mono text-emerald-400">Rp {overtimePay.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Potongan (Deductions) */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-2">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
              <span>B. Potongan (Deductions)</span>
              <span className="text-rose-400 font-mono">- Rp {totalDeductions.toLocaleString('id-ID')}</span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between text-gray-300">
                <span>BPJS Kesehatan (1%)</span>
                <span className="font-mono text-rose-300">- Rp {bpjsKesehatan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>BPJS Ketenagakerjaan (2%)</span>
                <span className="font-mono text-rose-300">- Rp {bpjsKetenagakerjaan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Potongan Cicilan Kasbon Karyawan</span>
                <span className="font-mono text-rose-300">- Rp {kasbonDeduction.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Take Home Pay Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-emerald-900/40 border border-purple-500/40 text-center space-y-1 shadow-lg">
            <span className="text-[10px] text-purple-200 uppercase tracking-widest font-bold">
              TOTAL GAJI DITERIMA (TAKE HOME PAY)
            </span>
            <div className="text-2xl font-black font-mono text-white tracking-wide">
              Rp {netTakeHomePay.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-gray-400">Telah ditransfer ke rekening payroll karyawan pada tanggal 25.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2D374E] bg-[#111827] flex items-center gap-2">
          <button
            onClick={() => alert('File PDF e-Slip Gaji ' + periodName + ' berhasil diunduh ke memori perangkat.')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh e-Slip Gaji (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
