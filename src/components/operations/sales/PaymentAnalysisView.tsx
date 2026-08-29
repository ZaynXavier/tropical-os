/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — PAYMENT ANALYSIS & RECONCILIATION VIEW
 * Payment channel distribution, settlement status, digital vs cash share,
 * and EDC/E-wallet breakdowns.
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  Wallet,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { PaymentMethodAnalysis, SalesPeriodFilter } from '../../../types/sales';

export const PaymentAnalysisView: React.FC = () => {
  const [period, setPeriod] = useState<SalesPeriodFilter>('this_month');
  const [paymentSummaries, setPaymentSummaries] = useState<PaymentMethodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getPaymentAnalysis(period);
        setPaymentSummaries(data);
      } catch (err) {
        console.error('Error loading payment analysis:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPaymentData();
  }, [period]);

  const totalAmountAll = paymentSummaries.reduce((acc, p) => acc + p.totalRevenue, 0) || 1;
  const totalTxAll = paymentSummaries.reduce((acc, p) => acc + p.transactionCount, 0) || 1;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'QRIS':
        return <QrCode className="w-5 h-5 text-purple-400" />;
      case 'EDC':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'CASH':
        return <Banknote className="w-5 h-5 text-emerald-400" />;
      case 'BANK_TRANSFER':
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'E_WALLET':
        return <Wallet className="w-5 h-5 text-amber-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'QRIS':
        return 'QRIS Dinamis / Statis';
      case 'EDC':
        return 'Mesin EDC (Debit & Credit Card)';
      case 'CASH':
        return 'Uang Tunai (Cash Drawer)';
      case 'BANK_TRANSFER':
        return 'Transfer Bank (Direct)';
      case 'E_WALLET':
        return 'E-Wallet (GoPay, OVO, ShopeePay)';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Analisis Kanal Pembayaran & Rekonsiliasi</h3>
            <p className="text-xs text-slate-400">Komparasi transaksi nontunai (QRIS/EDC) vs tunai kasir</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(['today', 'this_week', 'this_month'] as SalesPeriodFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === p
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p === 'today' ? 'Hari Ini' : p === 'this_week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 bg-[#151B2B] rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Method Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentSummaries.map((p) => {
              const pct = (p.totalRevenue / totalAmountAll) * 100;

              return (
                <div
                  key={p.paymentMethod}
                  className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg shadow-black/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5">
                        {getMethodIcon(p.paymentMethod)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{getMethodLabel(p.paymentMethod)}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.transactionCount} transaksi
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">Total Nominal Diterima:</span>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      Rp {(p.totalRevenue ?? 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      style={{ width: `${Math.min(100, pct)}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Rata-rata per Transaksi:</span>
                    <span className="font-mono text-slate-300 font-medium">
                      Rp {p.transactionCount > 0 ? Math.round((p.totalRevenue ?? 0) / p.transactionCount).toLocaleString('id-ID') : 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cashless vs Cash Breakdown Ratio */}
          <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Rasio Nontunai (Digital) vs Tunai (Cash):</span>
              <span className="text-slate-400">
                Total Settlement: <strong className="text-white">Rp {(totalAmountAll ?? 0).toLocaleString('id-ID')}</strong>
              </span>
            </div>

            {(() => {
              const cashAmt = paymentSummaries.find((p) => p.paymentMethod === 'CASH')?.totalRevenue || 0;
              const nonCashAmt = (totalAmountAll || 0) - cashAmt;
              const nonCashPct = totalAmountAll > 0 ? (nonCashAmt / totalAmountAll) * 100 : 0;
              const cashPct = totalAmountAll > 0 ? (cashAmt / totalAmountAll) * 100 : 0;

              return (
                <>
                  <div className="w-full bg-[#111827] h-4 rounded-full overflow-hidden flex border border-white/5">
                    <div
                      style={{ width: `${nonCashPct}%` }}
                      className="bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                      title={`Digital: ${nonCashPct.toFixed(1)}%`}
                    >
                      {nonCashPct > 15 && `Digital ${nonCashPct.toFixed(0)}%`}
                    </div>
                    <div
                      style={{ width: `${cashPct}%` }}
                      className="bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center text-[10px] font-bold text-slate-900"
                      title={`Tunai: ${cashPct.toFixed(1)}%`}
                    >
                      {cashPct > 15 && `Cash ${cashPct.toFixed(0)}%`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                      <span>Nontunai (QRIS / EDC / Transfer): Rp {(nonCashAmt ?? 0).toLocaleString('id-ID')} ({nonCashPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span>Tunai (Cash Drawer): Rp {(cashAmt ?? 0).toLocaleString('id-ID')} ({cashPct.toFixed(1)}%)</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};
