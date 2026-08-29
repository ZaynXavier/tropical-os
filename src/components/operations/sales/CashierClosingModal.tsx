/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — CASHIER CLOSING MODAL
 * Shift end cash reconciliation, physical bill counting breakdown,
 * variance calculation, and closing submission.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { CashierDailyClosing } from '../../../types/sales';

interface CashierClosingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CashierClosingModal: React.FC<CashierClosingModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [businessDate, setBusinessDate] = useState('2026-08-20');
  const [shiftId, setShiftId] = useState('shift-morning');
  const [cashierId, setCashierId] = useState('emp-09');
  const [openingCash, setOpeningCash] = useState(500000); // Rp 500.000 modal awal
  const [systemCashSales, setSystemCashSales] = useState(0);
  const [systemQris, setSystemQris] = useState(0);
  const [systemEdc, setSystemEdc] = useState(0);
  const [systemTransfer, setSystemTransfer] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [pettyCashIn, setPettyCashIn] = useState(0);
  const [pettyCashOut, setPettyCashOut] = useState(0);
  const [actualCash, setActualCash] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load system recorded sales for this cashier + shift
  useEffect(() => {
    const loadSystemData = async () => {
      const allTxs = await salesService.getTransactions({
        period: 'custom',
        startDate: businessDate,
        endDate: businessDate,
        shiftId: shiftId === 'ALL' ? undefined : shiftId,
        cashierId: cashierId === 'ALL' ? undefined : cashierId,
        transactionStatus: 'COMPLETED',
      });

      let cashSum = 0;
      let qrisSum = 0;
      let edcSum = 0;
      let trfSum = 0;

      allTxs.forEach((tx) => {
        tx.paymentMethods.forEach((pm) => {
          if (pm.paymentMethod === 'CASH') cashSum += pm.amount;
          else if (pm.paymentMethod === 'QRIS') qrisSum += pm.amount;
          else if (pm.paymentMethod === 'EDC') edcSum += pm.amount;
          else if (pm.paymentMethod === 'BANK_TRANSFER') trfSum += pm.amount;
        });
      });

      setSystemCashSales(cashSum);
      setSystemQris(qrisSum);
      setSystemEdc(edcSum);
      setSystemTransfer(trfSum);
      setTxCount(allTxs.length);

      // default actual to expected
      const expected = openingCash + cashSum + pettyCashIn - pettyCashOut;
      setActualCash(expected);
    };

    loadSystemData();
  }, [businessDate, shiftId, cashierId, openingCash, pettyCashIn, pettyCashOut]);

  const expectedCash = openingCash + systemCashSales + pettyCashIn - pettyCashOut;
  const variance = actualCash - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const cashierName =
        cashierId === 'emp-09'
          ? 'Rina Kusuma'
          : cashierId === 'emp-10'
          ? 'Dedi Prasetyo'
          : cashierId === 'emp-11'
          ? 'Siti Rahayu'
          : 'Maya Indah';

      const shiftName = shiftId === 'shift-morning' ? 'Shift Pagi (08:00 - 16:00)' : 'Shift Siang/Malam (15:30 - 23:30)';

      await salesService.createCashierClosing({
        businessDate,
        shiftId,
        shiftName,
        cashierId,
        cashierName,
        expectedCash,
        actualCash,
        qrisAmount: systemQris,
        edcAmount: systemEdc,
        bankTransferAmount: systemTransfer,
        eWalletAmount: 0,
        totalTransactions: txCount,
        totalRevenue: systemCashSales + systemQris + systemEdc + systemTransfer,
        notes: notes || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan closing kasir');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151B2B] rounded-3xl border border-white/15 w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-900/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Formulir Closing Shift Kasir</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pencocokan uang tunai laci (cash drawer) & rekonsiliasi pembayaran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2438] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Date, Shift, Cashier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Tanggal Closing:</label>
              <input
                type="date"
                required
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Shift Kerja:</label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="shift-morning">Shift Pagi (08:00 - 16:00)</option>
                <option value="shift-evening">Shift Malam (15:30 - 23:30)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Kasir Bertugas:</label>
              <select
                value={cashierId}
                onChange={(e) => setCashierId(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="emp-09">Rina Kusuma</option>
                <option value="emp-10">Dedi Prasetyo</option>
                <option value="emp-11">Siti Rahayu</option>
                <option value="emp-04">Maya Indah</option>
              </select>
            </div>
          </div>

          {/* System Recorded Totals */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-3">
            <h3 className="font-semibold text-white flex items-center justify-between">
              <span>Data Penjualan Tercatat Sistem (POS Ledger):</span>
              <span className="text-[11px] font-normal text-purple-300 font-mono">
                {txCount} transaksi tercatat
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Tunai (Cash Sales)</span>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  Rp {(systemCashSales ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">QRIS</span>
                <div className="font-mono font-bold text-purple-300 mt-0.5">
                  Rp {(systemQris ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">EDC Debit/Credit</span>
                <div className="font-mono font-bold text-blue-300 mt-0.5">
                  Rp {(systemEdc ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Transfer Bank</span>
                <div className="font-mono font-bold text-indigo-300 mt-0.5">
                  Rp {(systemTransfer ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Cash Drawer Calculation */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Kalkulasi Uang Tunai Kasir:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Modal Awal Kasir (Rp):</label>
                <input
                  type="number"
                  min={0}
                  value={openingCash}
                  onChange={(e) => setOpeningCash(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Petty Cash Masuk (Rp):</label>
                <input
                  type="number"
                  min={0}
                  value={pettyCashIn}
                  onChange={(e) => setPettyCashIn(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Petty Cash Keluar (Rp):</label>
                <input
                  type="number"
                  min={0}
                  value={pettyCashOut}
                  onChange={(e) => setPettyCashOut(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-3 bg-[#151B2B] rounded-xl border border-white/5 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Expected Cash di Laci (Harusnya Ada):</span>
              <span className="font-mono text-white text-sm">
                Rp {(expectedCash ?? 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Actual Physical Cash Count */}
            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-emerald-400 block text-xs">
                Total Uang Fisik Hasil Hitung (Physical Cash Count) *:
              </label>
              <input
                type="number"
                min={0}
                required
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="w-full bg-[#1E2438] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Variance Alert Box */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                variance === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : variance > 0
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {variance === 0 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="font-bold">
                  Status Selisih:{' '}
                  {variance === 0
                    ? 'PAS (Balanced 0)'
                    : variance > 0
                    ? `LEBIH (Over +Rp ${(variance ?? 0).toLocaleString('id-ID')})`
                    : `KURANG (Short -Rp ${Math.abs(variance).toLocaleString('id-ID')})`}
                </span>
              </div>
              <span className="font-mono font-bold">
                {variance > 0 ? `+${variance}` : variance}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block">Catatan / Keterangan Selisih:</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan kasir atau penjelasan jika ada selisih uang..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Submit Closing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
