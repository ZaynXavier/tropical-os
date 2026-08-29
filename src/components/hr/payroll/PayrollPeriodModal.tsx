/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Create Payroll Period Modal
 */

import React, { useState } from 'react';
import { payrollService } from '../../../services/payrollService';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { X, Calendar, Plus, AlertCircle, Sparkles } from 'lucide-react';

interface PayrollPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPeriodId: string) => void;
  currentUserId: string;
}

export const PayrollPeriodModal: React.FC<PayrollPeriodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}) => {
  const [periodCode, setPeriodCode] = useState('2026-09');
  const [periodName, setPeriodName] = useState('September 2026');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodCode || !periodName || !startDate || !endDate) {
      setErrorMsg('Semua kolom periode wajib diisi.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan (Manager)';

      const period = await payrollService.createPayrollPeriod({
        periodCode,
        periodName,
        startDate,
        endDate,
        notes,
        createdBy: userName,
      });

      onSuccess(period.periodId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal membuat periode payroll baru.');
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Buat Periode Payroll Baru</h3>
              <p className="text-xs text-gray-400">Inisialisasi kalkulasi penggajian bulanan</p>
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Kode Periode</label>
              <input
                type="text"
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                placeholder="2026-09"
                required
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Nama Periode</label>
              <input
                type="text"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                placeholder="September 2026"
                required
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Catatan Periode</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan administrasi periode penggajian..."
              className="w-full bg-[#111827] border border-[#2D374E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-[#111827] rounded-xl border border-purple-500/20 text-[11px] text-gray-400">
            <span className="text-purple-300 font-semibold">Otomatisasi Aggregator: </span>
            Sistem akan langsung menghitung simulasi draft penggajian untuk 24 personel berdasarkan data presensi & lembur pada rentang tanggal ini.
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
              {loading ? 'Membuat...' : 'Inisialisasi Periode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
