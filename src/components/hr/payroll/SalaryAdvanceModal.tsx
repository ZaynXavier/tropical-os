/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Salary Advance (Kasbon) Modal
 */

import React, { useState, useEffect } from 'react';
import { SalaryAdvance, SalaryAdvanceStatus } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { payrollService, formatCurrency, formatDate } from '../../../services/payrollService';
import {
  X,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  DollarSign,
} from 'lucide-react';

interface SalaryAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
  canApprove: boolean;
}

export const SalaryAdvanceModal: React.FC<SalaryAdvanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
  canApprove,
}) => {
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [employeeId, setEmployeeId] = useState(MASTER_EMPLOYEES[0]?.id || '');
  const [amount, setAmount] = useState<number>(200000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAdvances();
    }
  }, [isOpen]);

  const loadAdvances = async () => {
    try {
      setLoading(true);
      const res = await payrollService.getSalaryAdvances();
      setAdvances(res);
    } catch {
      setAdvances([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || amount <= 0 || !date || !description) {
      setErrorMsg('Semua kolom wajib diisi dengan benar.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan';

      await payrollService.createSalaryAdvance({
        employeeId,
        date,
        amount,
        description,
        status: canApprove ? 'APPROVED' : 'PENDING',
        payrollId: 'period-2026-08',
        createdBy: userName,
        approvedBy: canApprove ? userName : undefined,
        approvedAt: canApprove ? new Date().toISOString() : undefined,
      });

      setShowAddForm(false);
      setDescription('');
      setAmount(200000);
      await loadAdvances();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mencatat kasbon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (advId: string, newStatus: SalaryAdvanceStatus) => {
    try {
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan';

      await payrollService.updateSalaryAdvance(advId, {
        status: newStatus,
        approvedBy: newStatus === 'APPROVED' ? userName : undefined,
        approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : undefined,
      });
      await loadAdvances();
      onSuccess();
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#181F32] border border-[#2D374E] w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D374E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manajemen Kasbon Karyawan (Salary Advance)</h3>
              <p className="text-xs text-gray-400">
                Pencatatan pinjaman operasional & pemotongan otomatis pada payroll
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

        {/* Action Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Total {advances.length} catatan kasbon terdaftar
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Tutup Form' : 'Catat Kasbon Baru'}</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreateAdvance} className="p-4 bg-[#111827] rounded-2xl border border-amber-500/30 space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-amber-300">Form Pengajuan Kasbon</h4>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Karyawan</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {MASTER_EMPLOYEES.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Nominal Pinjaman (Rp)</label>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tanggal Kasbon</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Keterangan / Keperluan</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Kebutuhan medis mendesak"
                  required
                  className="w-full bg-[#181F32] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl border border-[#2D374E] text-xs text-gray-400 hover:bg-[#181F32]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Kasbon'}
              </button>
            </div>
          </form>
        )}

        {/* Advances List */}
        <div className="space-y-2.5">
          {loading ? (
            <p className="text-xs text-gray-500 py-4 text-center">Memuat data kasbon...</p>
          ) : advances.length === 0 ? (
            <div className="p-8 text-center bg-[#111827] rounded-2xl border border-[#2D374E] space-y-1">
              <CreditCard className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-xs font-semibold text-gray-300">Belum ada catatan kasbon</p>
              <p className="text-[11px] text-gray-500">Seluruh peminjaman karyawan akan tercatat di sini.</p>
            </div>
          ) : (
            advances.map((adv) => {
              const emp = MASTER_EMPLOYEES.find((e) => e.id === adv.employeeId);
              return (
                <div
                  key={adv.advanceId}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{emp?.fullName || 'Karyawan'}</span>
                      <span className="text-[10px] text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        {emp?.department}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          adv.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : adv.status === 'DEDUCTED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : adv.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {adv.status === 'APPROVED'
                          ? 'Disetujui (Siap Potong)'
                          : adv.status === 'DEDUCTED'
                          ? 'Telah Dipotong Payroll'
                          : adv.status === 'PENDING'
                          ? 'Menunggu Persetujuan'
                          : 'Ditolak / Batal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {adv.description} • Tanggal: {formatDate(adv.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-sm font-bold text-amber-400">
                      {formatCurrency(adv.amount)}
                    </span>

                    {canApprove && adv.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(adv.advanceId, 'APPROVED')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                          title="Setujui Kasbon"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(adv.advanceId, 'REJECTED')}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                          title="Tolak Kasbon"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#2D374E]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-xs font-semibold text-gray-300 hover:bg-[#252D42] cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
