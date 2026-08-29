/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES TRANSACTION CARD (MOBILE-OPTIMIZED)
 * Compact and informative mobile card for POS transactions.
 */

import React from 'react';
import {
  Clock,
  User,
  Utensils,
  CreditCard,
  Eye,
  AlertTriangle,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { SalesTransaction } from '../../../types/sales';

interface SalesTransactionCardProps {
  transaction: SalesTransaction;
  onViewDetail: (tx: SalesTransaction) => void;
  onVoid?: (tx: SalesTransaction) => void;
  onRefund?: (tx: SalesTransaction) => void;
  canManage?: boolean;
}

export const SalesTransactionCard: React.FC<SalesTransactionCardProps> = ({
  transaction,
  onViewDetail,
  onVoid,
  onRefund,
  canManage = false,
}) => {
  const getStatusBadge = () => {
    switch (transaction.transactionStatus) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case 'VOID':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Void
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Refunded
          </span>
        );
      case 'PARTIAL_REFUND':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Part-Refund
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {transaction.transactionStatus}
          </span>
        );
    }
  };

  const totalItemsCount = transaction.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      onClick={() => onViewDetail(transaction)}
      className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-3 cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.99] shadow-md shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-purple-300">
            {transaction.transactionNumber}
          </span>
          {transaction.tableNumber && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#1E2438] text-[10px] text-slate-300 font-medium border border-white/5">
              {transaction.tableNumber}
            </span>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>{transaction.businessDate} {transaction.transactionTime}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate justify-end">
          <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-slate-300 truncate">{transaction.cashierName}</span>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5 space-y-1 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>{(transaction.orderType || '').replace('_', ' ')} • {totalItemsCount} item</span>
          <span className="text-slate-500">{transaction.shiftName ? transaction.shiftName.split(' ')[0] : '-'}</span>
        </div>
        {(transaction.items || []).slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-300">
            <span className="truncate pr-2">
              {item.quantity}x {item.productName}
            </span>
            <span className="font-mono text-slate-400">
              Rp {(item.subtotal ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
        {(transaction.items?.length || 0) > 2 && (
          <div className="text-[10px] text-purple-400 italic">
            +{(transaction.items?.length || 0) - 2} menu lainnya...
          </div>
        )}
      </div>

      {/* Footer Total & Payment */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(transaction.paymentMethods || []).map((pm, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
            >
              {pm.paymentMethod}
            </span>
          ))}
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Grand Total</div>
          <div className="text-sm font-bold text-white font-mono">
            Rp {(transaction.grandTotal ?? 0).toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
};
