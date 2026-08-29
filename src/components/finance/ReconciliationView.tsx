/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINANCIAL RECONCILIATION ENGINE COMPONENT
 * Phase 3.9 — Financial Control, Expense/OPEX & Period Closing
 */

import React, { useState, useEffect } from 'react';
import {
  FinancialReconciliationContract,
  ReconciliationItemContract,
  ReconciliationStatus,
} from '../../types/contracts';
import { ReconciliationThresholds } from '../../types/finance';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Users,
  Utensils,
  CreditCard,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';

export const ReconciliationView: React.FC = () => {
  const { currentUser } = useAuth();
  const [reconciliation, setReconciliation] = useState<FinancialReconciliationContract | null>(null);
  const [thresholds, setThresholds] = useState<ReconciliationThresholds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');

  // Config Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempMinorPct, setTempMinorPct] = useState(1.0);
  const [tempMaterialPct, setTempMaterialPct] = useState(3.0);
  const [tempCashNominal, setTempCashNominal] = useState(50000);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const isManagerOrOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  const loadReconciliationData = async () => {
    try {
      setIsLoading(true);
      const th = await financeService.getReconciliationThresholds();
      setThresholds(th);
      setTempMinorPct(th.minorVariancePercentage);
      setTempMaterialPct(th.materialVariancePercentage);
      setTempCashNominal(th.allowableCashVarianceNominal);

      const rec = await financeService.runFinancialReconciliation(selectedPeriod);
      setReconciliation(rec);
    } catch (err) {
      console.error('Failed to load reconciliation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliationData();
  }, [selectedPeriod]);

  const handleRunReconciliation = async () => {
    try {
      setIsReconciling(true);
      const actor = {
        id: currentUser?.id || 'usr-runner',
        name: currentUser?.name || 'Staff Finance',
        role: currentUser?.role || 'MANAGER',
      };
      const rec = await financeService.runFinancialReconciliation(selectedPeriod, actor);
      setReconciliation(rec);
      setSaveSuccessMsg('Rekonsiliasi lintas domain berhasil dieksekusi.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal mengeksekusi rekonsiliasi: ${err.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempMaterialPct <= tempMinorPct) {
      alert('Ambang batas Material harus lebih besar dari ambang batas Minor.');
      return;
    }

    const actor = {
      id: currentUser?.id || 'usr-runner',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'MANAGER',
    };

    try {
      const updated = await financeService.updateReconciliationThresholds(
        {
          minorVariancePercentage: tempMinorPct,
          materialVariancePercentage: tempMaterialPct,
          allowableCashVarianceNominal: tempCashNominal,
        },
        actor
      );
      setThresholds(updated);
      setIsConfigModalOpen(false);
      setSaveSuccessMsg('Konfigurasi batas toleransi varians berhasil disimpan.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      handleRunReconciliation();
    } catch (err: any) {
      alert(`Gagal menyimpan ambang batas: ${err.message}`);
    }
  };

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'BALANCED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> BALANCED (Klop 100%)
          </span>
        );
      case 'MINOR_VARIANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> MINOR VARIANCE
          </span>
        );
      case 'MATERIAL_VARIANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5" /> MATERIAL VARIANCE
          </span>
        );
      case 'UNRESOLVED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Scale className="w-3.5 h-3.5" /> UNRESOLVED
          </span>
        );
    }
  };

  const getDomainIcon = (domain: ReconciliationItemContract['domain']) => {
    switch (domain) {
      case 'SALES_POS':
        return <Receipt className="w-5 h-5 text-emerald-400" />;
      case 'PAYMENT_METHODS':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'INVENTORY_COGS':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'PAYROLL_HR':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'EXPENSE_OPEX':
        return <Building2 className="w-5 h-5 text-pink-400" />;
      default:
        return <Scale className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-200">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header & Overall Status Banner */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Mesin Rekonsiliasi Finansial Lintas Domain
                </h3>
                <p className="text-xs text-gray-400">
                  Memvalidasi integritas data Sales SSoT, Kasir Z-Report, HPP Resep/COGS, Payroll SDM, dan Buku Beban OPEX.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-06">Juni 2026</option>
            </select>

            {isManagerOrOwner && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" /> Ambang Batas
              </button>
            )}

            <button
              onClick={handleRunReconciliation}
              disabled={isReconciling}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
              {isReconciling ? 'Merekonsiliasi...' : 'Jalankan Rekonsiliasi'}
            </button>
          </div>
        </div>

        {/* Overall Status Card */}
        {reconciliation && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151B2B] p-4 rounded-xl">
            <div>
              <span className="text-xs text-gray-400">Status Rekonsiliasi Keseluruhan:</span>
              <div className="mt-1">{getStatusBadge(reconciliation.overallStatus)}</div>
            </div>
            <div className="text-xs text-gray-400 sm:text-right font-mono">
              <div>Direkonsiliasi Pada: {new Date(reconciliation.reconciledAt).toLocaleString('id-ID')}</div>
              <div>Oleh: <span className="text-purple-300 font-sans font-medium">{reconciliation.reconciledBy}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Domain Reconciliation Cards Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 text-center text-gray-400">
            Menganalisis dan menyinkronkan data kontrak lintas domain...
          </div>
        ) : !reconciliation ? (
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 text-center text-gray-400">
            Belum ada hasil rekonsiliasi. Silakan klik "Jalankan Rekonsiliasi".
          </div>
        ) : (
          reconciliation.items.map((item, idx) => {
            const hasVariance = Math.abs(item.variance) > 0;
            return (
              <div
                key={idx}
                className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg space-y-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {getDomainIcon(item.domain)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400">{item.sourceName}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151B2B] p-4 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block font-sans">Sumber Operasional:</span>
                    <span className="text-sm font-bold text-white">
                      Rp {(item.sourceTotal ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-sans">Diakui Finansial (Finance):</span>
                    <span className="text-sm font-bold text-purple-300">
                      Rp {(item.financeRecognizedTotal ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-sans">Selisih / Varians:</span>
                    <span
                      className={`text-sm font-bold ${
                        hasVariance ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.variance > 0 ? '+' : ''}Rp {(item.variance ?? 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-normal">({item.variancePercentage}%)</span>
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div className="text-xs text-gray-300 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-lg">
                    {item.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* THRESHOLDS CONFIG MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Konfigurasi Ambang Batas Varians (Thresholds)
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThresholds} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Ambang Batas Varians Minor (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={tempMinorPct}
                  onChange={(e) => setTempMinorPct(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <span className="text-[11px] text-gray-400">
                  Selisih di bawah angka ini dikategorikan sebagai Minor Variance.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Ambang Batas Varians Material (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="20"
                  value={tempMaterialPct}
                  onChange={(e) => setTempMaterialPct(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <span className="text-[11px] text-gray-400">
                  Selisih melebihi angka ini dikategorikan sebagai Material Variance dan memblokir tutup buku.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Toleransi Selisih Kasir Fisik (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={tempCashNominal}
                  onChange={(e) => setTempCashNominal(Number(e.target.value))}
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
                <span className="text-[11px] text-gray-400">
                  Maksimum toleransi selisih cash drawer harian kasir.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
