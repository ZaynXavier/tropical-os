/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — CASHIER CLOSING MODAL
 * Shift end cash reconciliation, physical bill & coin breakdown (Rp 100k to Rp 100 coin),
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
  Coins,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { CashierDailyClosing, CashDenominationBreakdown } from '../../../types/sales';

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
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cash Denomination Breakdown State
  const [denominations, setDenominations] = useState<CashDenominationBreakdown>({
    b100k: 0,
    b50k: 0,
    b20k: 0,
    b10k: 0,
    b5k: 0,
    b2k: 0,
    b1k: 0,
    c1k: 0,
    c500: 0,
    c200: 0,
    c100: 0,
  });

  const [useDenominationSheet, setUseDenominationSheet] = useState(true);
  const [manualActualCash, setManualActualCash] = useState<number | null>(null);

  // Calculate total from denominations
  const totalBanknotes =
    denominations.b100k * 100000 +
    denominations.b50k * 50000 +
    denominations.b20k * 20000 +
    denominations.b10k * 10000 +
    denominations.b5k * 5000 +
    denominations.b2k * 2000 +
    denominations.b1k * 1000;

  const totalCoins =
    denominations.c1k * 1000 +
    denominations.c500 * 500 +
    denominations.c200 * 200 +
    denominations.c100 * 100;

  const denominationTotal = totalBanknotes + totalCoins;
  const actualCash = useDenominationSheet ? denominationTotal : (manualActualCash ?? 0);

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

      // Auto-prefill sample denominations matching expected cash if all are 0
      const expected = openingCash + cashSum + pettyCashIn - pettyCashOut;
      if (denominationTotal === 0 && expected > 0) {
        // Sample smart split
        let remaining = expected;
        const b100 = Math.floor(remaining / 100000);
        remaining %= 100000;
        const b50 = Math.floor(remaining / 50000);
        remaining %= 50000;
        const b20 = Math.floor(remaining / 20000);
        remaining %= 20000;
        const b10 = Math.floor(remaining / 10000);
        remaining %= 10000;
        const b5 = Math.floor(remaining / 5000);
        remaining %= 5000;
        const b2 = Math.floor(remaining / 2000);
        remaining %= 2000;
        const b1 = Math.floor(remaining / 1000);
        remaining %= 1000;
        const c5 = Math.floor(remaining / 500);
        remaining %= 500;
        const c2 = Math.floor(remaining / 200);
        remaining %= 200;
        const c1 = Math.floor(remaining / 100);

        setDenominations({
          b100k: b100,
          b50k: b50,
          b20k: b20,
          b10k: b10,
          b5k: b5,
          b2k: b2,
          b1k: b1,
          c1k: 0,
          c500: c5,
          c200: c2,
          c100: c1,
        });
        setManualActualCash(expected);
      }
    };

    loadSystemData();
  }, [businessDate, shiftId, cashierId, openingCash, pettyCashIn, pettyCashOut]);

  const updateDenom = (key: keyof CashDenominationBreakdown, val: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

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

      const shiftName = shiftId === 'shift-morning' ? 'Shift Pagi (08:00 - 16:00)' : 'Shift Malam (15:30 - 23:30)';

      const closingPayload: Omit<CashierDailyClosing, 'id' | 'createdAt' | 'updatedAt'> = {
        businessDate,
        cashierId,
        cashierName,
        shiftId,
        shiftName,
        openingFloat: openingCash,
        cashSales: systemCashSales,
        expectedCash,
        actualCash,
        cashVariance: variance,
        varianceStatus: variance === 0 ? 'BALANCED' : variance < 0 ? 'SHORT' : 'OVER',
        qrisAmount: systemQris,
        edcAmount: systemEdc,
        bankTransferAmount: systemTransfer,
        eWalletAmount: 0,
        totalTransactions: txCount,
        totalRevenue: systemCashSales + systemQris + systemEdc + systemTransfer,
        notes: notes || undefined,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        submittedBy: cashierName,
        cashBreakdown: denominations,
      };

      await salesService.submitCashierClosing(closingPayload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan rekonsiliasi kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-[#151B2B] border border-[#2D374E] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Closing Kasir &amp; Rekonsiliasi Uang Fisik</span>
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Denominasi Lengkap
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Hitung pecahan uang kertas (Rp 100rb) hingga koin (Rp 100) dan validasi selisih kas.
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

          {/* Float & Petty Cash */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Modal Awal Kasir (Rp):</label>
              <input
                type="number"
                min={0}
                value={openingCash}
                onChange={(e) => setOpeningCash(Number(e.target.value))}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Petty Cash Masuk (Rp):</label>
              <input
                type="number"
                min={0}
                value={pettyCashIn}
                onChange={(e) => setPettyCashIn(Number(e.target.value))}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Petty Cash Keluar (Rp):</label>
              <input
                type="number"
                min={0}
                value={pettyCashOut}
                onChange={(e) => setPettyCashOut(Number(e.target.value))}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* EXPECTED CASH TARGET */}
          <div className="p-3 bg-[#111827] rounded-xl border border-white/5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Expected Cash di Laci (Harusnya Ada):</span>
            <span className="font-mono text-white text-sm font-bold text-purple-300">
              Rp {(expectedCash ?? 0).toLocaleString('id-ID')}
            </span>
          </div>

          {/* 🌟 CASH DENOMINATIONS BREAKDOWN (Banknotes & Coins) */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Hitung Pecahan Uang Fisik Kasir (Cash Count Sheet)</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Mode Lembar/Koin</span>
                <input
                  type="checkbox"
                  checked={useDenominationSheet}
                  onChange={(e) => setUseDenominationSheet(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
              </div>
            </div>

            {useDenominationSheet ? (
              <div className="space-y-4">
                {/* 1. BANKNOTES (Uang Kertas) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Uang Kertas (Banknotes)</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Subtotal: Rp {totalBanknotes.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { key: 'b100k', label: 'Rp 100.000', rate: 100000 },
                      { key: 'b50k', label: 'Rp 50.000', rate: 50000 },
                      { key: 'b20k', label: 'Rp 20.000', rate: 20000 },
                      { key: 'b10k', label: 'Rp 10.000', rate: 10000 },
                      { key: 'b5k', label: 'Rp 5.000', rate: 5000 },
                      { key: 'b2k', label: 'Rp 2.000', rate: 2000 },
                      { key: 'b1k', label: 'Rp 1.000 (Kertas)', rate: 1000 },
                    ].map((item) => {
                      const qty = (denominations as any)[item.key] || 0;
                      const sub = qty * item.rate;
                      return (
                        <div
                          key={item.key}
                          className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-slate-400 text-[10px] block">{item.label}</span>
                            <span className="font-mono font-bold text-white text-xs">
                              Rp {sub.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateDenom(item.key as any, qty - 1)}
                              className="w-6 h-6 rounded bg-[#1E2438] text-slate-300 hover:text-white flex items-center justify-center border border-white/10"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={qty}
                              onChange={(e) => updateDenom(item.key as any, Number(e.target.value))}
                              className="w-12 text-center bg-[#111827] border border-white/10 rounded px-1 py-0.5 text-white font-mono font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => updateDenom(item.key as any, qty + 1)}
                              className="w-6 h-6 rounded bg-[#1E2438] text-slate-300 hover:text-white flex items-center justify-center border border-white/10"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. COINS (Uang Logam / Koin) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Uang Logam (Koin Rp 1.000 hingga Rp 100)</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      Subtotal: Rp {totalCoins.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: 'c1k', label: 'Rp 1.000 (Koin)', rate: 1000 },
                      { key: 'c500', label: 'Rp 500 (Koin)', rate: 500 },
                      { key: 'c200', label: 'Rp 200 (Koin)', rate: 200 },
                      { key: 'c100', label: 'Rp 100 (Koin)', rate: 100 },
                    ].map((item) => {
                      const qty = (denominations as any)[item.key] || 0;
                      const sub = qty * item.rate;
                      return (
                        <div
                          key={item.key}
                          className="p-2.5 bg-[#151B2B] rounded-xl border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-slate-400 text-[10px] block">{item.label}</span>
                            <span className="font-mono font-bold text-amber-300 text-xs">
                              Rp {sub.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateDenom(item.key as any, qty - 1)}
                              className="w-6 h-6 rounded bg-[#1E2438] text-slate-300 hover:text-white flex items-center justify-center border border-white/10"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={qty}
                              onChange={(e) => updateDenom(item.key as any, Number(e.target.value))}
                              className="w-10 text-center bg-[#111827] border border-white/10 rounded px-1 py-0.5 text-white font-mono font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => updateDenom(item.key as any, qty + 1)}
                              className="w-6 h-6 rounded bg-[#1E2438] text-slate-300 hover:text-white flex items-center justify-center border border-white/10"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-bold text-emerald-400 block text-xs">
                  Total Uang Fisik Hasil Hitung Manual (Rp):
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={manualActualCash ?? 0}
                  onChange={(e) => setManualActualCash(Number(e.target.value))}
                  className="w-full bg-[#1E2438] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Total Physical Cash Calculated Box */}
            <div className="p-3 bg-[#151B2B] rounded-xl border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-bold block text-xs">
                  Grand Total Uang Fisik di Laci Kasir:
                </span>
                <span className="text-[10px] text-slate-400">
                  (Kertas: Rp {totalBanknotes.toLocaleString('id-ID')} + Koin: Rp {totalCoins.toLocaleString('id-ID')})
                </span>
              </div>
              <span className="font-mono text-lg font-black text-emerald-400">
                Rp {actualCash.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Variance Status Box */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                variance === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : variance > 0
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {variance === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <div>
                  <div className="font-bold">
                    Status Selisih:{' '}
                    {variance === 0
                      ? 'PAS (Balanced Rp 0)'
                      : variance > 0
                      ? `LEBIH (Surplus +Rp ${(variance ?? 0).toLocaleString('id-ID')})`
                      : `KURANG (Shortage -Rp ${Math.abs(variance).toLocaleString('id-ID')})`}
                  </div>
                  <span className="text-[10px] opacity-80">
                    {variance === 0
                      ? 'Uang fisik di laci cocok 100% dengan transaksi kasir.'
                      : variance > 0
                      ? 'Terdapat kelebihan uang kas dibanding pencatatan kasir.'
                      : 'Terdapat kekurangan uang kas di laci kasir! Wajib beri keterangan.'}
                  </span>
                </div>
              </div>
              <span className="font-mono font-black text-sm">
                {variance > 0 ? `+Rp ${variance.toLocaleString('id-ID')}` : variance < 0 ? `-Rp ${Math.abs(variance).toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block font-medium">Catatan / Keterangan Selisih Closing:</label>
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Submit Rekonsiliasi Kasir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
