/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES TRANSACTION DETAIL MODAL
 * Detailed receipt breakdown, items table, HPP gross margin, payment reconciliation,
 * recipe BOM mapping, and audit trail.
 */

import React, { useState } from 'react';
import {
  X,
  Receipt,
  User,
  Clock,
  Utensils,
  CreditCard,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Printer,
  CheckCircle2,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { SalesTransaction } from '../../../types/sales';

interface SalesTransactionDetailModalProps {
  transaction: SalesTransaction | null;
  onClose: () => void;
  onVoid?: (tx: SalesTransaction) => void;
  onRefund?: (tx: SalesTransaction) => void;
  canManage?: boolean;
}

export const SalesTransactionDetailModal: React.FC<SalesTransactionDetailModalProps> = ({
  transaction,
  onClose,
  onVoid,
  onRefund,
  canManage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'payment' | 'bom' | 'audit'>('items');

  if (!transaction) return null;

  const totalHpp = transaction.items.reduce((acc, item) => acc + item.totalHpp, 0);
  const grossProfit = transaction.subtotal - totalHpp;
  const grossMargin = transaction.subtotal > 0 ? (grossProfit / transaction.subtotal) * 100 : 0;
  const foodCostPct = transaction.subtotal > 0 ? (totalHpp / transaction.subtotal) * 100 : 0;

  const getStatusBadge = () => {
    switch (transaction.transactionStatus) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Completed (Selesai)
          </span>
        );
      case 'VOID':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            VOID (Dibatalkan)
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Refunded (Dikembalikan Penuh)
          </span>
        );
      case 'PARTIAL_REFUND':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Partial Refund
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {transaction.transactionStatus}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151B2B] rounded-3xl border border-white/15 w-full max-w-3xl overflow-hidden shadow-2xl shadow-purple-900/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                  {transaction.transactionNumber}
                </h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Struk POS Transaksi • {transaction.businessDate} {transaction.transactionTime}
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

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#111827]/50 border-b border-white/5 text-xs">
          <div>
            <span className="text-slate-400">Kasir:</span>
            <div className="font-semibold text-white truncate">{transaction.cashierName || '-'}</div>
          </div>
          <div>
            <span className="text-slate-400">Shift:</span>
            <div className="font-semibold text-purple-300 truncate">{transaction.shiftName ? transaction.shiftName.split(' ')[0] : '-'}</div>
          </div>
          <div>
            <span className="text-slate-400">Tipe Order & Meja:</span>
            <div className="font-semibold text-slate-200">
              {transaction.orderType} {transaction.tableNumber ? `(${transaction.tableNumber})` : ''}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Grand Total:</span>
            <div className="font-bold text-emerald-400 font-mono text-sm">
              Rp {(transaction.grandTotal ?? 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'items'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Daftar Menu ({(transaction.items?.length || 0)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'payment'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pembayaran & Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bom')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'bom'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recipe BOM & Margin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'audit'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          {/* TAB 1: ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 bg-[#0B0F19]/50">
                      <th className="py-2.5 px-4">Menu</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Diskon</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {transaction.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#1E2438]/40">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span
                              className={`text-[10px] font-medium ${
                                item.recipeMappingStatus === 'MAPPED'
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {item.recipeMappingStatus === 'MAPPED' ? '✓ Recipe Mapped' : '⚠ Tanpa Recipe'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-purple-300">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">
                          Rp {(item.unitPrice ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-amber-400">
                          {(item.discountAmount ?? 0) > 0 ? `-Rp ${(item.discountAmount ?? 0).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          Rp {(item.subtotal ?? 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Struk Summary */}
              <div className="bg-[#111827] rounded-2xl border border-white/5 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Item:</span>
                  <span className="font-mono text-slate-200">
                    Rp {(transaction.subtotal ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {(transaction.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Diskon Promo:</span>
                    <span className="font-mono">
                      -Rp {(transaction.discountAmount ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Service Charge (5%):</span>
                  <span className="font-mono text-slate-200">
                    Rp {(transaction.serviceCharge ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PB1 Resto Tax (10%):</span>
                  <span className="font-mono text-slate-200">
                    Rp {(transaction.taxAmount ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-400 text-base">
                    Rp {(transaction.grandTotal ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-[#111827] rounded-2xl border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Breakdown Metode Pembayaran</span>
                </h3>

                <div className="space-y-2">
                  {transaction.paymentMethods.map((pm, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#151B2B] rounded-xl border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                          {pm.paymentMethod}
                        </span>
                        {pm.edcBank && (
                          <span className="text-slate-300 font-medium">Bank {pm.edcBank}</span>
                        )}
                        {pm.eWalletProvider && (
                          <span className="text-slate-300 font-medium">{pm.eWalletProvider}</span>
                        )}
                        {pm.referenceNumber && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            (Ref: {pm.referenceNumber})
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-white">
                        Rp {(pm.amount ?? 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status Pembayaran:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {transaction.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECIPE BOM & MARGIN */}
          {activeTab === 'bom' && (
            <div className="space-y-4">
              {/* Gross Profit KPI */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#111827] rounded-xl p-3 border border-white/5 text-center">
                  <span className="text-[11px] text-slate-400">Total HPP (COGS)</span>
                  <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                    Rp {(totalHpp ?? 0).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-500">{foodCostPct.toFixed(1)}% Food Cost</span>
                </div>
                <div className="bg-[#111827] rounded-xl p-3 border border-white/5 text-center">
                  <span className="text-[11px] text-slate-400">Gross Profit (Laba)</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    Rp {(grossProfit ?? 0).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-emerald-500/80">{grossMargin.toFixed(1)}% Margin</span>
                </div>
                <div className="bg-[#111827] rounded-xl p-3 border border-white/5 text-center">
                  <span className="text-[11px] text-slate-400">Mapping Status</span>
                  <div className="text-xs font-semibold text-purple-300 mt-1">
                    {transaction.items.filter((i) => i.recipeMappingStatus === 'MAPPED').length}/
                    {transaction.items.length} Mapped
                  </div>
                </div>
              </div>

              {/* Item HPP Table */}
              <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 bg-[#0B0F19]/50">
                      <th className="py-2.5 px-4">Menu</th>
                      <th className="py-2.5 px-3 text-right">HPP / Unit</th>
                      <th className="py-2.5 px-3 text-right">Total HPP</th>
                      <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                      <th className="py-2.5 px-4 text-right">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {transaction.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-medium text-white">{item.productName}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                          Rp {(item.hppPerUnit ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                          Rp {(item.totalHpp ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                          Rp {(item.grossProfit ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-purple-300">
                          {item.grossMarginPercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dibuat Oleh:</span>
                  <span className="text-white font-medium">{transaction.createdBy || transaction.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Dibuat:</span>
                  <span className="text-slate-300 font-mono">{transaction.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sumber Integrasi:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px]">
                    {transaction.source}
                  </span>
                </div>

                {transaction.transactionStatus === 'VOID' && (
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 space-y-1 mt-3">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                      <Ban className="w-3.5 h-3.5" />
                      <span>Audit Trail VOID:</span>
                    </div>
                    <p className="text-slate-300">Alasan: {transaction.voidReason}</p>
                    <p className="text-[11px] text-slate-400">
                      Oleh: {transaction.voidedByName} • {transaction.voidedAt}
                    </p>
                  </div>
                )}

                {(transaction.transactionStatus === 'REFUNDED' || transaction.transactionStatus === 'PARTIAL_REFUND') && (
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1 mt-3">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Audit Trail Refund:</span>
                    </div>
                    <p className="text-slate-300">
                      Nilai Refund: Rp {(transaction.refundAmount || 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-slate-300">Alasan: {transaction.refundReason}</p>
                    <p className="text-[11px] text-slate-400">
                      Oleh: {transaction.refundedByName} • {transaction.refundedAt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#111827] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canManage && transaction.transactionStatus === 'COMPLETED' && onVoid && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVoid(transaction);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                Void Transaksi
              </button>
            )}

            {canManage && transaction.transactionStatus === 'COMPLETED' && onRefund && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRefund(transaction);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
              >
                Refund Dana
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1E2438] text-white hover:bg-[#28304a] border border-white/10 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
