/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINANCIAL PERIOD CONTROL & CLOSING COMPONENT
 * Phase 3.9 — Financial Control, Expense/OPEX & Period Closing
 */

import React, { useState, useEffect } from 'react';
import { FinancialPeriod, FinancialPeriodStatus } from '../../types/finance';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  History,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  RotateCcw,
  X,
  FileCheck,
} from 'lucide-react';

export const PeriodControlView: React.FC = () => {
  const { currentUser } = useAuth();
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPeriodKey, setNewPeriodKey] = useState('');
  const [newPeriodName, setNewPeriodName] = useState('');

  const [transitionModalPeriod, setTransitionModalPeriod] = useState<FinancialPeriod | null>(null);
  const [targetStatus, setTargetStatus] = useState<FinancialPeriodStatus>('REVIEW');
  const [transitionReason, setTransitionReason] = useState('');

  const [historyModalPeriod, setHistoryModalPeriod] = useState<FinancialPeriod | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = currentUser?.role === 'OWNER';
  const isManagerOrOwner = isOwner || currentUser?.role === 'MANAGER';

  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      const list = await financeService.getFinancialPeriods();
      setPeriods(list);
    } catch (err) {
      console.error('Failed to load financial periods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodKey) return;

    const actor = {
      id: currentUser?.id || 'usr-owner',
      name: currentUser?.name || 'Authorized User',
      role: currentUser?.role || 'OWNER',
    };

    try {
      await financeService.createFinancialPeriod(newPeriodKey, newPeriodName, actor);
      showNotification(`Periode finansial ${newPeriodKey} berhasil dibuka.`);
      setIsCreateModalOpen(false);
      setNewPeriodKey('');
      setNewPeriodName('');
      loadPeriods();
    } catch (err: any) {
      setActionError(err.message || 'Gagal membuat periode.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const openTransitionModal = (period: FinancialPeriod, next: FinancialPeriodStatus) => {
    setTransitionModalPeriod(period);
    setTargetStatus(next);
    setTransitionReason('');
  };

  const handleConfirmTransition = async () => {
    if (!transitionModalPeriod || !transitionReason.trim()) {
      alert('Alasan perubahan status periode wajib dicantumkan.');
      return;
    }

    const actor = {
      id: currentUser?.id || 'usr-owner',
      name: currentUser?.name || 'Management',
      role: currentUser?.role || 'OWNER',
    };

    try {
      await financeService.transitionPeriodStatus(
        transitionModalPeriod.periodKey,
        targetStatus,
        actor,
        transitionReason
      );
      showNotification(
        `Status periode ${transitionModalPeriod.periodName} berhasil diubah ke [${targetStatus}].`
      );
      setTransitionModalPeriod(null);
      loadPeriods();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const getStatusBadge = (status: FinancialPeriodStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Unlock className="w-3 h-3" /> OPEN (Aktif)
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> REVIEW (Rekonsiliasi)
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Lock className="w-3 h-3" /> LOCKED (Terkunci)
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30">
            <ShieldCheck className="w-3 h-3" /> CLOSED (Tutup Buku)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-200">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{actionError}</span>
        </div>
      )}

      {/* Governance Banner */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Tata Kelola &amp; Tutup Buku Periode (Period Closing)</h3>
            <p className="text-xs text-gray-400">
              Kontrol status pembukuan: OPEN &rarr; REVIEW &rarr; LOCKED &rarr; CLOSED. Periode LOCKED/CLOSED memproteksi transaksi dari manipulasi atau mutasi susulan.
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Buka Periode Baru
          </button>
        )}
      </div>

      {/* Periods Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#151B2B] text-gray-400 border-b border-white/10 font-semibold">
                <th className="py-3.5 px-4">Periode / Tanggal</th>
                <th className="py-3.5 px-4">Status Buku</th>
                <th className="py-3.5 px-4 text-right">Omzet (Sales SSoT)</th>
                <th className="py-3.5 px-4 text-right">COGS / HPP</th>
                <th className="py-3.5 px-4 text-right">Beban OPEX</th>
                <th className="py-3.5 px-4 text-right">Laba Bersih</th>
                <th className="py-3.5 px-4 text-center">Riwayat</th>
                <th className="py-3.5 px-4 text-right">Kontrol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Memuat status periode finansial...
                  </td>
                </tr>
              ) : periods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Belum ada periode finansial terdaftar.
                  </td>
                </tr>
              ) : (
                periods.map((p) => {
                  return (
                    <tr key={p.periodId} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Dates */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{p.periodName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {p.startDate} s/d {p.endDate}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                      {/* Revenue */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-medium">
                        {p.salesRevenueSnapshot
                          ? `Rp ${(p.salesRevenueSnapshot.grossRevenue ?? 0).toLocaleString('id-ID')}`
                          : '-'}
                      </td>

                      {/* COGS */}
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-medium">
                        {p.cogsRecognized ? `Rp ${(p.cogsRecognized ?? 0).toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* OPEX */}
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400 font-medium">
                        {p.opexRecognized ? `Rp ${(p.opexRecognized ?? 0).toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {p.netProfitRecognized ? `Rp ${(p.netProfitRecognized ?? 0).toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* Transition History Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setHistoryModalPeriod(p)}
                          title="Lihat Log Perubahan Status"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-300 transition-all cursor-pointer"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Status Transition Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === 'OPEN' && isManagerOrOwner && (
                            <button
                              onClick={() => openTransitionModal(p, 'REVIEW')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Clock className="w-3 h-3" /> Mulai Review
                            </button>
                          )}

                          {p.status === 'REVIEW' && isManagerOrOwner && (
                            <button
                              onClick={() => openTransitionModal(p, 'LOCKED')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                            >
                              <Lock className="w-3 h-3" /> Lock Periode
                            </button>
                          )}

                          {p.status === 'LOCKED' && isManagerOrOwner && (
                            <button
                              onClick={() => openTransitionModal(p, 'CLOSED')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                            >
                              <FileCheck className="w-3 h-3" /> Tutup Buku Final
                            </button>
                          )}

                          {p.status === 'CLOSED' && isOwner && (
                            <button
                              onClick={() => openTransitionModal(p, 'OPEN')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" /> Reopen (Owner)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PERIOD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Buka Periode Finansial Baru
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bulan Periode (Format: YYYY-MM)
                </label>
                <input
                  type="month"
                  value={newPeriodKey}
                  onChange={(e) => {
                    setNewPeriodKey(e.target.value);
                    if (e.target.value && e.target.value.includes('-')) {
                      const parts = e.target.value.split('-');
                      const yr = parts[0] || '';
                      const mo = parts[1] || '';
                      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                      const moIdx = Number(mo) - 1;
                      const moName = (moIdx >= 0 && moIdx < months.length) ? months[moIdx] : mo;
                      setNewPeriodName(`${moName} ${yr}`.trim());
                    }
                  }}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Periode</label>
                <input
                  type="text"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  placeholder="Contoh: September 2026"
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Buat Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSITION CONFIRMATION MODAL */}
      {transitionModalPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Ubah Status Periode &rarr; [{targetStatus}]
              </h3>
              <button
                onClick={() => setTransitionModalPeriod(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-950/30 border border-purple-500/20 p-3.5 rounded-xl text-xs text-purple-200 space-y-1">
                <div className="font-bold text-white">
                  Periode: {transitionModalPeriod.periodName} ({transitionModalPeriod.periodKey})
                </div>
                <div>Status Saat Ini: <strong className="text-white">{transitionModalPeriod.status}</strong></div>
                <div>Status Target: <strong className="text-emerald-300">{targetStatus}</strong></div>
                {targetStatus === 'LOCKED' && (
                  <p className="text-[11px] text-amber-300 pt-1">
                    * Perhatian: Mengunci periode (LOCKED) akan menghentikan mutasi beban pengeluaran baru dan mengambil snapshot kontrak pendapatan/HPP/Payroll.
                  </p>
                )}
                {targetStatus === 'CLOSED' && (
                  <p className="text-[11px] text-amber-300 pt-1">
                    * Perhatian: Menutup buku (CLOSED) bersifat final. Hanya Owner yang dapat membuka kembali dengan justifikasi audit.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Alasan Perubahan Status (Wajib Diisi untuk Audit)
                </label>
                <textarea
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  rows={3}
                  placeholder="Misal: Rekonsiliasi selesai, siap lockdown pembukuan..."
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransitionModalPeriod(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransition}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Konfirmasi Perubahan Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERIOD HISTORY MODAL */}
      {historyModalPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Riwayat Tata Kelola Periode ({historyModalPeriod.periodName})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Jejak perubahan status dan penutupan buku</p>
              </div>
              <button
                onClick={() => setHistoryModalPeriod(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
                {(historyModalPeriod.history || []).map((h, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#151B2B] border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs shrink-0 z-10 font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-[#151B2B] border border-white/10 rounded-xl p-3.5 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Status: {h.status}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(h.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-300">
                        Oleh: {h.changedBy?.name} ({h.changedBy?.role || 'MANAGEMENT'})
                      </div>
                      <div className="text-[11px] text-gray-300 bg-white/5 p-2 rounded mt-1 italic">
                        "{h.reason}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151B2B] px-6 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setHistoryModalPeriod(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
