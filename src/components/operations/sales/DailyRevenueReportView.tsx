/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — DAILY REVENUE REPORT VIEW
 * Executive financial & operational daily revenue summary with payment reconciliations,
 * order type breakdown, top items, and profit margin analysis.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar,
  CreditCard,
  Utensils,
  Download,
  Printer,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { DailySalesSummary, ProductSalesPerformance } from '../../../types/sales';

export const DailyRevenueReportView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [summary, setSummary] = useState<DailySalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<ProductSalesPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getDailySalesSummary(selectedDate);
        setSummary(data);

        const products = await salesService.getProductPerformance('custom', selectedDate, selectedDate);
        setTopProducts(products.slice(0, 5));
      } catch (e) {
        console.error('Error loading daily report:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Membuat laporan harian untuk {selectedDate}...</p>
      </div>
    );
  }

  const s = summary;

  return (
    <div className="space-y-6">
      {/* Date Selector & Print/Export Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Laporan Harian Pendapatan Resto</h3>
            <p className="text-xs text-slate-400">Audit reconciliations and consolidated daily ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white hover:bg-[#28304a] border border-white/10 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Net Sales Revenue</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            Rp {(s?.netRevenue ?? 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Gross: Rp {(s?.grossRevenue ?? 0).toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Laba Kotor (Gross Profit)</span>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
            Rp {(s?.grossProfit ?? 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-purple-400 mt-1">
            Gross Margin: {(s?.grossMarginPercentage ?? 0).toFixed(1)}%
          </div>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Estimasi HPP (Food Cost)</span>
          <div className="text-2xl font-bold text-rose-300 font-mono mt-1">
            Rp {(s?.estimatedHpp ?? 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Food Cost: {(s?.blendedFoodCostPercentage ?? 0).toFixed(1)}%
          </div>
        </div>

        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Transaksi & Avg Ticket</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {s?.transactionCount ?? 0} <span className="text-xs font-normal text-slate-400">trx</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg: Rp {(s?.averageTransactionValue ?? 0).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Two-Column Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Revenue & Reconciliation Breakdown */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg shadow-black/20">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Rekonsiliasi Pendapatan Harian</span>
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Gross Sales (Kotor):</span>
              <span className="font-mono font-medium text-white">
                Rp {(s?.grossRevenue ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Diskon & Promo:</span>
              <span className="font-mono">
                -Rp {(s?.discountAmount ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Refund & Void:</span>
              <span className="font-mono">
                -Rp {(s?.refundAmount ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
              <span className="text-emerald-400">Net Sales:</span>
              <span className="font-mono text-emerald-400">
                Rp {(s?.netRevenue ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service Charge Resto (5%):</span>
              <span className="font-mono text-slate-300">
                Rp {(s?.serviceCharge ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pajak Restoran PB1 (10%):</span>
              <span className="font-mono text-slate-300">
                Rp {(s?.taxAmount ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
              <span>Total Diterima (Nett + Tax + SC):</span>
              <span className="font-mono text-white text-base">
                Rp {((s?.netRevenue ?? 0) + (s?.taxAmount ?? 0) + (s?.serviceCharge ?? 0)).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Order Type Distribution */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Distribusi Penjualan per Tipe Order:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Dine In (Makan Ditempat)</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  Rp {(s?.dineInRevenue ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Take Away (Bungkus)</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  Rp {(s?.takeAwayRevenue ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Delivery Online</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  Rp {(s?.deliveryRevenue ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-400 text-[11px]">Event / Catering</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  Rp {((s?.eventRevenue ?? 0) + (s?.cateringRevenue ?? 0)).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Methods & Top Items */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg shadow-black/20">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Penerimaan per Metode Pembayaran</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-300">QRIS Dinamis / Statis</span>
                <span className="font-mono font-bold text-purple-300">
                  Rp {(s?.qrisRevenue ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-300">EDC Debit / Kredit (BCA/Mandiri)</span>
                <span className="font-mono font-bold text-blue-300">
                  Rp {(s?.edcRevenue ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-300">Uang Tunai Fisik (Cash Drawer)</span>
                <span className="font-mono font-bold text-emerald-400">
                  Rp {(s?.cashRevenue ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-300">Bank Transfer (Event/DP)</span>
                <span className="font-mono font-bold text-indigo-300">
                  Rp {(s?.bankTransferRevenue ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#111827] rounded-xl border border-white/5">
                <span className="text-slate-300">E-Wallet (GoPay/OVO/ShopeePay)</span>
                <span className="font-mono font-bold text-amber-300">
                  Rp {(s?.eWalletRevenue ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Items of the Day */}
          <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg shadow-black/20">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Top 5 Menu Terlaris Hari Ini</span>
            </h4>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada data penjualan pada tanggal ini.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between p-2.5 bg-[#111827] rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 text-[10px] font-bold flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-white block truncate">{p.productName}</span>
                        <span className="text-[10px] text-slate-400">{p.category}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="font-mono font-bold text-purple-200 block">
                        Rp {(p.netRevenue ?? 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.quantitySold} porsi terjual</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
