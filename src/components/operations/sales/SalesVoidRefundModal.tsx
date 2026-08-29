/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES VOID & REFUND MODAL
 * Mandatory reason, role permission confirmation, and audit trail execution.
 */

import React, { useState } from 'react';
import { X, Ban, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SalesTransaction } from '../../../types/sales';

interface SalesVoidRefundModalProps {
  transaction: SalesTransaction | null;
  mode: 'VOID' | 'REFUND';
  onClose: () => void;
  onConfirmVoid: (txId: string, reason: string) => Promise<void>;
  onConfirmRefund: (txId: string, amount: number, reason: string) => Promise<void>;
}

export const SalesVoidRefundModal: React.FC<SalesVoidRefundModalProps> = ({
  transaction,
  mode,
  onClose,
  onConfirmVoid,
  onConfirmRefund,
}) => {
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(transaction?.grandTotal || 0);
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transaction) return null;

  const maxRefund = transaction.grandTotal || transaction.subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan wajib diisi untuk pencatatan audit log.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (mode === 'VOID') {
        await onConfirmVoid(transaction.id, reason);
      } else {
        const amt = isFullRefund ? maxRefund : refundAmount;
        if (amt <= 0 || amt > maxRefund) {
          setError(`Nilai refund harus antara Rp 1 s/d Rp ${(maxRefund ?? 0).toLocaleString('id-ID')}`);
          setIsSubmitting(false);
          return;
        }
        await onConfirmRefund(transaction.id, amt, reason);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151B2B] rounded-3xl border border-white/15 w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-900/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                mode === 'VOID'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {mode === 'VOID' ? <Ban className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'VOID' ? 'Konfirmasi VOID Transaksi' : 'Proses Refund Transaksi'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {transaction.transactionNumber} • Rp {(transaction.grandTotal ?? 0).toLocaleString('id-ID')}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#111827] rounded-xl border border-white/5 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Kasir Pembuat:</span>
              <span className="text-white font-medium">{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Waktu Transaksi:</span>
              <span className="text-slate-300 font-mono">{transaction.businessDate} {transaction.transactionTime}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Tagihan:</span>
              <span className="text-emerald-400 font-mono font-bold">
                Rp {(transaction.grandTotal ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Refund Amount Options if REFUND mode */}
          {mode === 'REFUND' && (
            <div className="space-y-3 p-3.5 bg-[#111827] rounded-xl border border-white/5">
              <label className="font-semibold text-white block">Tipe Refund:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="refundType"
                    checked={isFullRefund}
                    onChange={() => setIsFullRefund(true)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Full Refund (100% - Rp {(maxRefund ?? 0).toLocaleString('id-ID')})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="refundType"
                    checked={!isFullRefund}
                    onChange={() => setIsFullRefund(false)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Partial Refund (Sebagian)</span>
                </label>
              </div>

              {!isFullRefund && (
                <div className="mt-2 space-y-1">
                  <label className="text-slate-400">Nominal Refund Parsial (Rp):</label>
                  <input
                    type="number"
                    min={1}
                    max={maxRefund}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full bg-[#1E2438] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-white flex items-center justify-between">
              <span>Alasan / Justifikasi {mode === 'VOID' ? 'Void' : 'Refund'} (Wajib):</span>
              <span className="text-[11px] text-purple-400">Audit Compliance</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder={
                mode === 'VOID'
                  ? 'Contoh: Salah input pesanan sebelum diproses kitchen / customer batal sebelum serving...'
                  : 'Contoh: Komplain makanan dingin / keterlambatan serving / pergantian menu...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Tindakan ini akan tercatat secara permanen di audit trail dan memotong laporan pendapatan harian secara otomatis.
            </span>
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
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                mode === 'VOID'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              {isSubmitting ? 'Memproses...' : mode === 'VOID' ? 'Konfirmasi VOID' : 'Eksekusi Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
