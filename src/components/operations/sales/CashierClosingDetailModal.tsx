/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CASHIER CLOSING DETAIL MODAL
 * Displays the complete physical cash count breakdown (banknotes & coins down to Rp 100).
 */

import React from 'react';
import {
  X,
  Banknote,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Printer,
  Calendar,
  Layers,
} from 'lucide-react';
import { CashierDailyClosing } from '../../../types/sales';

interface CashierClosingDetailModalProps {
  closing: CashierDailyClosing;
  onClose: () => void;
  onVerify?: (id: string) => void;
  canVerify?: boolean;
}

export const CashierClosingDetailModal: React.FC<CashierClosingDetailModalProps> = ({
  closing,
  onClose,
  onVerify,
  canVerify = false,
}) => {
  const d = closing.cashBreakdown || {
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
  };

  const banknotes = [
    { label: 'Rp 100.000', qty: d.b100k, rate: 100000 },
    { label: 'Rp 50.000', qty: d.b50k, rate: 50000 },
    { label: 'Rp 20.000', qty: d.b20k, rate: 20000 },
    { label: 'Rp 10.000', qty: d.b10k, rate: 10000 },
    { label: 'Rp 5.000', qty: d.b5k, rate: 5000 },
    { label: 'Rp 2.000', qty: d.b2k, rate: 2000 },
    { label: 'Rp 1.000 (Kertas)', qty: d.b1k, rate: 1000 },
  ];

  const coins = [
    { label: 'Rp 1.000 (Koin)', qty: d.c1k, rate: 1000 },
    { label: 'Rp 500 (Koin)', qty: d.c500, rate: 500 },
    { label: 'Rp 200 (Koin)', qty: d.c200, rate: 200 },
    { label: 'Rp 100 (Koin)', qty: d.c100, rate: 100 },
  ];

  const totalBanknotes = banknotes.reduce((acc, b) => acc + b.qty * b.rate, 0);
  const totalCoins = coins.reduce((acc, c) => acc + c.qty * c.rate, 0);
  const actualCash = closing.actualCash ?? (closing as any).actualCountedCash ?? (totalBanknotes + totalCoins);
  const expectedCash = closing.expectedCash ?? (closing as any).systemExpectedCash ?? 0;
  const variance = actualCash - expectedCash;
  const isVerified = closing.status === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-[#151B2B] border border-[#2D374E] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Berita Acara Closing Kasir</span>
                {isVerified ? (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Submitted
                  </span>
                )}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {closing.businessDate} • {closing.shiftName || 'Shift Pagi'} • Kasir: {closing.cashierName}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">
          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
              <span className="text-slate-400 text-[10px] block">Expected (Target Sistem)</span>
              <span className="font-mono font-bold text-white text-sm">
                Rp {expectedCash.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-[#111827] rounded-xl border border-emerald-500/30">
              <span className="text-slate-400 text-[10px] block">Total Fisik di Laci</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                Rp {actualCash.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
              <span className="text-slate-400 text-[10px] block">Status Selisih</span>
              <span
                className={`font-mono font-bold text-sm ${
                  variance === 0 ? 'text-emerald-400' : variance > 0 ? 'text-blue-300' : 'text-rose-400'
                }`}
              >
                {variance === 0
                  ? 'Pas (Rp 0)'
                  : variance > 0
                  ? `+Rp ${variance.toLocaleString('id-ID')}`
                  : `-Rp ${Math.abs(variance).toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          {/* 💵 UANG KERTAS DETAIL */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Rincian Uang Kertas (Banknotes)</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">
                Rp {totalBanknotes.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {banknotes.map((b, i) => (
                <div key={i} className="p-2 bg-[#151B2B] rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{b.label}</span>
                    <span className="font-mono font-bold text-white text-xs">
                      {b.qty} lembar
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">
                    Rp {(b.qty * b.rate).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 🪙 UANG KOIN DETAIL */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Rincian Uang Logam (Koin Rp 1.000 s/d Rp 100)</span>
              </span>
              <span className="font-mono font-bold text-amber-300">
                Rp {totalCoins.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {coins.map((c, i) => (
                <div key={i} className="p-2 bg-[#151B2B] rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{c.label}</span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {c.qty} keping
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">
                    Rp {(c.qty * c.rate).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Audit Info */}
          {closing.notes && (
            <div className="p-3 bg-[#111827] rounded-xl border border-white/5">
              <span className="text-slate-400 text-[10px] block font-medium">Catatan Kasir:</span>
              <p className="text-slate-200 mt-0.5">{closing.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111827] border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white border border-white/10"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Berita Acara</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white border border-white/10"
            >
              Tutup
            </button>
            {!isVerified && canVerify && onVerify && (
              <button
                type="button"
                onClick={() => {
                  onVerify(closing.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi Kasir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
