/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payslip Modal with Print Capability
 */

import React, { useState, useEffect } from 'react';
import { Payslip, PayrollRecord } from '../../../types/payroll';
import { payrollService } from '../../../services/payrollService';
import { PayslipPrintView } from './PayslipPrintView';
import {
  X,
  Printer,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PayslipModalProps {
  payslipIdOrRecord?: string | PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payslipIdOrRecord,
  isOpen,
  onClose,
}) => {
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && payslipIdOrRecord) {
      loadSlip();
    }
  }, [isOpen, payslipIdOrRecord]);

  const loadSlip = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      let slip: Payslip | null = null;
      if (typeof payslipIdOrRecord === 'string') {
        slip = await payrollService.getPayslip(payslipIdOrRecord);
      } else if (payslipIdOrRecord && typeof payslipIdOrRecord === 'object') {
        slip = await payrollService.getPayslip(payslipIdOrRecord.payrollId);
      }

      setPayslip(slip);
      if (!slip) {
        setErrorMsg('Data slip gaji tidak ditemukan.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memuat slip gaji.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up my-8 max-h-[95vh] overflow-y-auto custom-scrollbar print:border-none print:shadow-none print:p-0 print:bg-white print:max-h-none print:overflow-visible">
        {/* Modal Toolbar (Hidden during browser print) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D374E] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Slip Gaji Elektronik (E-Payslip)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {payslip?.status === 'Final' ? 'Final Resmi' : 'Simulasi Preview'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {payslip?.employeeName} ({payslip?.employeeCode}) • {payslip?.periodName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#252D42] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <p>Memuat rincian slip gaji...</p>
          </div>
        ) : errorMsg || !payslip ? (
          <div className="p-6 text-center text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p>{errorMsg || 'Slip gaji tidak tersedia.'}</p>
          </div>
        ) : (
          <div className="pt-2">
            <PayslipPrintView payslip={payslip} />
          </div>
        )}

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2D374E] text-xs text-gray-400 print:hidden">
          <span>Format cetak standar A4 / Dokumen Pembayaran Karyawan</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#2D374E] text-xs font-semibold text-gray-300 hover:bg-[#111827] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
