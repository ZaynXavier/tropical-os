/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll Adjustment Modal
 */

import React, { useState } from 'react';
import { PayrollRecord, PayrollAdjustmentType } from '../../../types/payroll';
import { payrollService } from '../../../services/payrollService';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { X, Sparkles, AlertCircle, DollarSign, FileText } from 'lucide-react';

interface PayrollAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: PayrollRecord | null;
  currentUserId: string;
}

export const PayrollAdjustmentModal: React.FC<PayrollAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  record,
  currentUserId,
}) => {
  const [type, setType] = useState<PayrollAdjustmentType>('BONUS');
  const [amount, setAmount] = useState<number>(100000);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || amount <= 0) {
      setErrorMsg('Alasan penyesuaian dan nominal wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan (Manager)';

      await payrollService.createPayrollAdjustment({
        payrollId: record.periodId,
        employeeId: record.employeeId,
        type,
        amount,
        reason,
        createdBy: userName,
        approvedBy: userName,
        approvedAt: new Date().toISOString(),
      });

      // Recalculate employee payroll record
      await payrollService.calculateEmployeePayroll(record.periodId, record.employeeId, userName);

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menambahkan penyesuaian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-[#2D374E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tambah Penyesuaian Gaji</h3>
              <p className="text-xs text-gray-400">
                {record.employeeName} ({record.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#252D42] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Jenis Penyesuaian</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PayrollAdjustmentType)}
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="BONUS">Bonus / Reward Tambahan (+)</option>
              <option value="DEDUCTION">Potongan Khusus (-)</option>
              <option value="CORRECTION">Koreksi Hitungan (Manual)</option>
              <option value="OTHER">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Nominal (Rp)</label>
            <input
              type="number"
              min="10000"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              required
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Alasan Penyesuaian</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Bonus kepemimpinan event catering private dining"
              required
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#2D374E]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#2D374E] text-gray-300 hover:bg-[#111827]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-purple-600/30"
            >
              {loading ? 'Menyimpan...' : 'Simpan Penyesuaian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
