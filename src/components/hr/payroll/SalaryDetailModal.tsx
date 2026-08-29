/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Salary Detail Modal
 */

import React, { useState, useEffect } from 'react';
import { SalaryMaster, SalaryHistoryItem } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { payrollService, formatCurrency, formatDate } from '../../../services/payrollService';
import {
  X,
  DollarSign,
  User,
  Building2,
  Calendar,
  Clock,
  Edit2,
  History,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SalaryDetailModalProps {
  salary: SalaryMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (salary: SalaryMaster) => void;
  canEdit?: boolean;
}

export const SalaryDetailModal: React.FC<SalaryDetailModalProps> = ({
  salary,
  isOpen,
  onClose,
  onEdit,
  canEdit,
}) => {
  const [histories, setHistories] = useState<SalaryHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (salary) {
      loadHistory(salary.employeeId);
    }
  }, [salary]);

  const loadHistory = async (empId: string) => {
    try {
      setLoadingHistory(true);
      const res = await payrollService.getSalaryHistory(empId);
      setHistories(res);
    } catch {
      setHistories([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !salary) return null;

  const employee = MASTER_EMPLOYEES.find((e) => e.id === salary.employeeId);
  const totalAllowance =
    Number(salary.mealAllowance || 0) +
    Number(salary.transportAllowance || 0) +
    Number(salary.positionAllowance || 0) +
    Number(salary.otherAllowance || 0);

  const grossFixed = Number(salary.basicSalary || 0) + totalAllowance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 animate-scale-up my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D374E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rincian Master Gaji Karyawan</h3>
              <p className="text-xs text-gray-400">
                Struktur kompensasi tetap & riwayat audit penyesuaian gaji
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

        {/* Employee Card */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-base">
              {employee?.fullName.charAt(0) || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{employee?.fullName || 'Karyawan'}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {employee?.employeeCode}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {employee?.primaryPosition} • <span className="text-gray-300">{employee?.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                salary.salaryStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {salary.salaryStatus === 'ACTIVE' ? 'Aktif Berlaku' : 'Historis'}
            </span>
          </div>
        </div>

        {/* Salary Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
            <p className="text-[11px] text-gray-400">Gaji Pokok</p>
            <p className="text-lg font-bold text-white">{formatCurrency(salary.basicSalary)}</p>
            <p className="text-[10px] text-emerald-400">Kompensasi dasar bulanan</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
            <p className="text-[11px] text-gray-400">Total Tunjangan Tetap</p>
            <p className="text-lg font-bold text-purple-300">{formatCurrency(totalAllowance)}</p>
            <p className="text-[10px] text-purple-400">4 komponen tunjangan</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <p className="text-[11px] text-emerald-300 font-semibold">Gross Fixed Salary</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(grossFixed)}</p>
            <p className="text-[10px] text-gray-400">Gaji Pokok + Tunjangan</p>
          </div>
        </div>

        {/* Fixed Allowance Details */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-3">
          <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Rincian Komponen Tunjangan
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#181F32] border border-[#2D374E]/60">
              <p className="text-[10px] text-gray-400">Tunj. Makan</p>
              <p className="font-semibold text-white">{formatCurrency(salary.mealAllowance)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#181F32] border border-[#2D374E]/60">
              <p className="text-[10px] text-gray-400">Tunj. Transport</p>
              <p className="font-semibold text-white">{formatCurrency(salary.transportAllowance)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#181F32] border border-[#2D374E]/60">
              <p className="text-[10px] text-gray-400">Tunj. Jabatan</p>
              <p className="font-semibold text-white">{formatCurrency(salary.positionAllowance)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#181F32] border border-[#2D374E]/60">
              <p className="text-[10px] text-gray-400">Tunj. Lainnya</p>
              <p className="font-semibold text-white">{formatCurrency(salary.otherAllowance)}</p>
            </div>
          </div>
        </div>

        {/* Effective Date & Notes */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tanggal Mulai Berlaku:</span>
            <span className="font-semibold text-white">{formatDate(salary.effectiveDate)}</span>
          </div>
          {salary.notes && (
            <div className="pt-2 border-t border-[#2D374E] text-gray-400">
              <span className="text-gray-300 font-medium">Catatan: </span>
              {salary.notes}
            </div>
          )}
        </div>

        {/* Salary History Timeline */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
              <History className="w-4 h-4 text-purple-400" />
              <span>Riwayat Perubahan Gaji (Salary History)</span>
            </div>
            <span className="text-[11px] text-gray-500">{histories.length} catatan</span>
          </div>

          {loadingHistory ? (
            <p className="text-xs text-gray-500 py-2">Memuat histori gaji...</p>
          ) : histories.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">
              Belum ada riwayat perubahan gaji sebelumnya. Struktur saat ini merupakan versi awal.
            </p>
          ) : (
            <div className="space-y-2.5 pt-1">
              {histories.map((hist) => (
                <div
                  key={hist.historyId}
                  className="p-3 rounded-xl bg-[#181F32] border border-[#2D374E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-300">
                        {formatCurrency(hist.basicSalary)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        + Tunj. {formatCurrency(hist.totalAllowance)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        = {formatCurrency(hist.grossFixedSalary)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Berlaku: {formatDate(hist.effectiveDate)} • {hist.changeReason || 'Penyesuaian'}
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right shrink-0">
                    Oleh {hist.createdBy} • {formatDate(hist.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Footer */}
        <div className="p-3 rounded-2xl bg-[#111827]/50 border border-[#2D374E] text-[10px] text-gray-400 flex flex-wrap items-center justify-between gap-2">
          <span>Dibuat: {salary.createdBy} ({formatDate(salary.createdAt)})</span>
          <span>Diperbarui: {salary.updatedBy} ({formatDate(salary.updatedAt)})</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2D374E] text-xs font-semibold text-gray-300 hover:bg-[#111827] transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(salary);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Gaji</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
