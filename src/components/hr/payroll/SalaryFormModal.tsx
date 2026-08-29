/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Salary Form Modal (Create / Update Master Salary)
 */

import React, { useState, useEffect } from 'react';
import { SalaryMaster } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { payrollService, formatCurrency } from '../../../services/payrollService';
import { X, DollarSign, User, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSalary?: SalaryMaster | null;
  currentUserId: string;
}

export const SalaryFormModal: React.FC<SalaryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingSalary,
  currentUserId,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number>(3000000);
  const [mealAllowance, setMealAllowance] = useState<number>(300000);
  const [transportAllowance, setTransportAllowance] = useState<number>(200000);
  const [positionAllowance, setPositionAllowance] = useState<number>(0);
  const [otherAllowance, setOtherAllowance] = useState<number>(0);
  const [changeReason, setChangeReason] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingSalary) {
      setEmployeeId(editingSalary.employeeId);
      setEffectiveDate(editingSalary.effectiveDate);
      setBasicSalary(editingSalary.basicSalary);
      setMealAllowance(editingSalary.mealAllowance);
      setTransportAllowance(editingSalary.transportAllowance);
      setPositionAllowance(editingSalary.positionAllowance);
      setOtherAllowance(editingSalary.otherAllowance);
      setNotes(editingSalary.notes || '');
      setChangeReason('');
    } else {
      setEmployeeId(MASTER_EMPLOYEES[0]?.id || '');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setBasicSalary(3000000);
      setMealAllowance(300000);
      setTransportAllowance(200000);
      setPositionAllowance(0);
      setOtherAllowance(0);
      setChangeReason('Penetapan struktur gaji awal');
      setNotes('');
    }
    setErrorMessage(null);
  }, [editingSalary, isOpen]);

  if (!isOpen) return null;

  const totalAllowance =
    Number(mealAllowance || 0) +
    Number(transportAllowance || 0) +
    Number(positionAllowance || 0) +
    Number(otherAllowance || 0);

  const grossFixed = Number(basicSalary || 0) + totalAllowance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setErrorMessage('Pilih karyawan terlebih dahulu.');
      return;
    }
    if (basicSalary < 0 || mealAllowance < 0 || transportAllowance < 0) {
      setErrorMessage('Nominal gaji atau tunjangan tidak boleh negatif.');
      return;
    }
    if (!effectiveDate) {
      setErrorMessage('Tanggal berlaku (Effective Date) wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan (Manager)';

      if (editingSalary) {
        await payrollService.updateSalary(editingSalary.salaryId, {
          basicSalary,
          mealAllowance,
          transportAllowance,
          positionAllowance,
          otherAllowance,
          notes,
          effectiveDate,
          changeReason: changeReason || 'Pembaruan data gaji',
          updatedBy: userName,
        });
      } else {
        await payrollService.createSalary({
          employeeId,
          effectiveDate,
          basicSalary,
          mealAllowance,
          transportAllowance,
          positionAllowance,
          otherAllowance,
          fixedAllowance: totalAllowance,
          salaryStatus: 'ACTIVE',
          notes,
          changeReason: changeReason || 'Penetapan struktur gaji baru',
          createdBy: userName,
          updatedBy: userName,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan struktur gaji.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = MASTER_EMPLOYEES.find((e) => e.id === employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D374E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingSalary ? 'Ubah Struktur Gaji Karyawan' : 'Tetapkan Struktur Gaji Baru'}
              </h3>
              <p className="text-xs text-gray-400">
                Pengaturan master gaji pokok & komponen tunjangan tetap
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

        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Pilih Karyawan (24 Master Personnel)
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!!editingSalary}
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-60 cursor-pointer"
            >
              {MASTER_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) — {emp.primaryPosition} [{emp.department}]
                </option>
              ))}
            </select>
          </div>

          {selectedEmp && (
            <div className="p-3 bg-[#111827]/70 rounded-2xl border border-[#2D374E] flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400 text-[10px]">Departemen & Jabatan</p>
                <p className="font-semibold text-gray-200">
                  {selectedEmp.department} • {selectedEmp.primaryPosition}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-[10px]">Status Kerja</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  {selectedEmp.employmentStatus}
                </span>
              </div>
            </div>
          )}

          {/* Effective Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Tanggal Berlaku (Effective Date)
            </label>
            <div className="relative">
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Gaji ini akan berlaku untuk seluruh payroll period yang dimulai pada atau setelah tanggal ini.
            </p>
          </div>

          {/* Basic Salary */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-[#2D374E] space-y-3">
            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                Gaji Pokok (Basic Salary) — Rp
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value)))}
                required
                className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Allowance Breakdown */}
            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider pt-2 border-t border-[#2D374E]/60">
              Komponen Tunjangan Tetap (Fixed Allowances)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tunjangan Makan</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={mealAllowance}
                  onChange={(e) => setMealAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tunjangan Transport</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tunjangan Jabatan</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={positionAllowance}
                  onChange={(e) => setPositionAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tunjangan Lainnya</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={otherAllowance}
                  onChange={(e) => setOtherAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Total Gross Fixed Preview */}
            <div className="pt-3 border-t border-[#2D374E] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400">Total Tunjangan Tetap</p>
                <p className="text-xs font-semibold text-purple-300">{formatCurrency(totalAllowance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Total Gaji Tetap (Gross Fixed)</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(grossFixed)}</p>
              </div>
            </div>
          </div>

          {/* Change Reason & Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Alasan Penyesuaian / Perubahan Gaji (Audit Trail)
            </label>
            <input
              type="text"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Contoh: Kenaikan berkala tahunan / Promosi jabatan"
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan administrasi penggajian..."
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D374E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2D374E] text-xs font-semibold text-gray-300 hover:bg-[#111827] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : editingSalary ? 'Simpan Perubahan' : 'Tetapkan Gaji'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
