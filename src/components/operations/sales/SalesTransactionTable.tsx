/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES TRANSACTION TABLE
 * Desktop tabular ledger and mobile card list for POS transactions.
 */

import React, { useState } from 'react';
import {
  Eye,
  Ban,
  RotateCcw,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { SalesTransaction } from '../../../types/sales';
import { SalesTransactionCard } from './SalesTransactionCard';

interface SalesTransactionTableProps {
  transactions: SalesTransaction[];
  onViewDetail: (tx: SalesTransaction) => void;
  onVoid?: (tx: SalesTransaction) => void;
  onRefund?: (tx: SalesTransaction) => void;
  canManage?: boolean;
  isLoading?: boolean;
}

export const SalesTransactionTable: React.FC<SalesTransactionTableProps> = ({
  transactions,
  onViewDetail,
  onVoid,
  onRefund,
  canManage = false,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTxs = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            Completed
          </span>
        );
      case 'VOID':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
            Void
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
            Refunded
          </span>
        );
      case 'PARTIAL_REFUND':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
            Partial Refund
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-8 text-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Memuat data transaksi penjualan...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center shadow-lg shadow-black/20">
        <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 w-16 h-16 mx-auto mb-3 flex items-center justify-center border border-purple-500/20">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-white">Belum Ada Transaksi Penjualan</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Tidak ada transaksi yang cocok dengan filter atau tanggal yang dipilih. Coba ganti filter atau lakukan simulasi order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card List View (hidden on lg) */}
      <div className="block lg:hidden space-y-3">
        {paginatedTxs.map((tx) => (
          <SalesTransactionCard
            key={tx.id}
            transaction={tx}
            onViewDetail={onViewDetail}
            onVoid={onVoid}
            onRefund={onRefund}
            canManage={canManage}
          />
        ))}
      </div>

      {/* Desktop Table View (hidden on small/mobile) */}
      <div className="hidden lg:block bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#111827] text-slate-400 border-b border-white/10 font-semibold">
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-3">Tanggal & Jam</th>
                <th className="py-3 px-3">Kasir & Shift</th>
                <th className="py-3 px-3">Tipe & Meja</th>
                <th className="py-3 px-3">Item Menu</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3">Pembayaran</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {paginatedTxs.map((tx) => {
                const totalItems = tx.items.reduce((acc, i) => acc + i.quantity, 0);
                const isVoid = tx.transactionStatus === 'VOID';

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-[#1E2438]/50 transition-colors ${
                      isVoid ? 'opacity-50 line-through decoration-slate-500' : ''
                    }`}
                  >
                    {/* Transaction Number */}
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">
                      {tx.transactionNumber}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-white">{tx.businessDate}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tx.transactionTime}
                      </div>
                    </td>

                    {/* Cashier & Shift */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-white">{tx.cashierName || '-'}</div>
                      <div className="text-[11px] text-slate-400">{tx.shiftName ? tx.shiftName.split(' ')[0] : '-'}</div>
                    </td>

                    {/* Order Type & Table */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">
                        {(tx.orderType || '').replace('_', ' ')}
                      </div>
                      {tx.tableNumber && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#1E2438] text-[10px] text-slate-400 border border-white/5">
                          {tx.tableNumber}
                        </span>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-200 truncate">
                        {tx.items?.[0]?.productName || '-'} {tx.items?.[0]?.quantity ? `(x${tx.items[0].quantity})` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {totalItems} item total
                        {(tx.items?.length || 0) > 1 && ` (${tx.items.length} varian)`}
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      Rp {(tx.subtotal ?? 0).toLocaleString('id-ID')}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      Rp {(tx.grandTotal ?? 0).toLocaleString('id-ID')}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(tx.paymentMethods || []).map((pm, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium whitespace-nowrap"
                          >
                            {pm.paymentMethod}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(tx.transactionStatus)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(tx)}
                          title="Lihat Rincian Struk"
                          className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canManage && tx.transactionStatus === 'COMPLETED' && onVoid && (
                          <button
                            type="button"
                            onClick={() => onVoid(tx)}
                            title="Void Transaksi (Manager)"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canManage && tx.transactionStatus === 'COMPLETED' && onRefund && (
                          <button
                            type="button"
                            onClick={() => onRefund(tx)}
                            title="Refund Dana (Supervisor)"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-400">
        <div>
          Menampilkan <span className="text-white font-semibold">{Math.min(transactions.length, (currentPage - 1) * itemsPerPage + 1)}</span> -{' '}
          <span className="text-white font-semibold">{Math.min(transactions.length, currentPage * itemsPerPage)}</span> dari{' '}
          <span className="text-white font-semibold">{transactions.length}</span> transaksi
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-[#151B2B] text-slate-300 hover:text-white border border-white/10 disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 rounded-lg bg-[#1E2438] text-purple-300 font-semibold border border-white/10">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-[#151B2B] text-slate-300 hover:text-white border border-white/10 disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
