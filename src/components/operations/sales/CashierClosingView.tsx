/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — CASHIER CLOSING VIEW
 * Shift closing records ledger, discrepancy auditor, and supervisor verification workflow.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  RotateCcw,
  Search,
  Calendar,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { CashierDailyClosing, SalesPeriodFilter } from '../../../types/sales';
import { CashierClosingModal } from './CashierClosingModal';

interface CashierClosingViewProps {
  canVerify?: boolean;
}

export const CashierClosingView: React.FC<CashierClosingViewProps> = ({
  canVerify = true,
}) => {
  const [period, setPeriod] = useState<SalesPeriodFilter>('this_month');
  const [closings, setClosings] = useState<CashierDailyClosing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClosings = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getCashierClosings();
      setClosings(data);
    } catch (err) {
      console.error('Error loading closings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClosings();
  }, [period]);

  const handleVerify = async (closingId: string) => {
    try {
      await salesService.verifyCashierClosing(closingId, {
        id: 'emp-01',
        name: 'Budi Santoso',
        role: 'General Manager',
      });
      loadClosings();
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi closing');
    }
  };

  const filteredClosings = closings.filter((c) => {
    return (
      c.cashierName.toLowerCase().includes(search.toLowerCase()) ||
      c.businessDate.includes(search) ||
      c.shiftName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const balancedCount = closings.filter((c) => c.varianceStatus === 'BALANCED').length;
  const shortageCount = closings.filter((c) => c.varianceStatus === 'SHORT').length;
  const surplusCount = closings.filter((c) => c.varianceStatus === 'OVER').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Buku Closing Shift Kasir & Rekonsiliasi</h3>
            <p className="text-xs text-slate-400">Verifikasi fisik kas laci kasir dan catatan selisih</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all cursor-pointer shadow-md shadow-purple-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Form Closing Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Total Shift Closing</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{closings.length}</div>
          <span className="text-[11px] text-slate-400">Periode terpilih</span>
        </div>
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Kas Sesuai (Balanced)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {balancedCount} <span className="text-xs font-normal text-slate-400">({closings.length > 0 ? ((balancedCount / closings.length) * 100).toFixed(0) : 0}%)</span>
          </div>
          <span className="text-[11px] text-emerald-500/80">Nol selisih</span>
        </div>
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4">
          <span className="text-xs text-slate-400">Ada Selisih (Short/Over)</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {shortageCount + surplusCount} <span className="text-xs font-normal text-slate-400">({shortageCount} minus, {surplusCount} lebih)</span>
          </div>
          <span className="text-[11px] text-slate-400">Butuh audit supervisor</span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Memuat riwayat closing kasir...</p>
        </div>
      ) : (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111827] text-slate-400 border-b border-white/10 font-semibold">
                  <th className="py-3 px-4">Tanggal & Shift</th>
                  <th className="py-3 px-3">Kasir</th>
                  <th className="py-3 px-3 text-right">Modal Awal</th>
                  <th className="py-3 px-3 text-right">Expected Kas</th>
                  <th className="py-3 px-3 text-right">Fisik Kas Hitung</th>
                  <th className="py-3 px-3 text-right">Selisih (Variance)</th>
                  <th className="py-3 px-3 text-right">Nontunai (QRIS/EDC)</th>
                  <th className="py-3 px-3">Status Verifikasi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredClosings.map((c) => {
                  const isBalanced = c.varianceStatus === 'BALANCED';
                  const isShortage = c.varianceStatus === 'SHORTAGE';
                  const isVerified = c.status === 'VERIFIED';
                  const nonCashTotal = c.systemQrisTotal + c.systemEdcTotal + c.systemTransferTotal;

                  return (
                    <tr key={c.id} className="hover:bg-[#1E2438]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{c.businessDate}</div>
                        <div className="text-[11px] text-slate-400">{c.shiftName ? c.shiftName.split(' ')[0] : '-'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block">{c.cashierName}</span>
                        <span className="text-[11px] text-slate-400">{c.totalTransactionCount} orders</span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        Rp {(c.openingCashFloat ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-200">
                        Rp {(c.systemExpectedCash ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        Rp {(c.actualCountedCash ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {isBalanced ? (
                          <span className="text-emerald-400">Rp 0 (Pas)</span>
                        ) : isShortage ? (
                          <span className="text-rose-400">
                            -Rp {Math.abs(c.cashVariance).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-blue-300">
                            +Rp {(c.cashVariance ?? 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-purple-300">
                        Rp {(nonCashTotal ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>Submitted</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {!isVerified && canVerify ? (
                          <button
                            type="button"
                            onClick={() => handleVerify(c.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            Verifikasi
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Telah Diverifikasi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cashier Closing Modal */}
      {isModalOpen && (
        <CashierClosingModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadClosings}
        />
      )}
    </div>
  );
};
