/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — BATCH PRODUCTION MANAGEMENT VIEW
 * Interactive dashboard for scheduling, tracking, and completing kitchen production runs.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChefHat,
  Search,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Layers,
  Scale,
  Percent,
  Clock,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  ProductionBatch,
  ProductionStatus,
  ProductionType,
  ProductionFilterParams,
} from '../../../types/production';
import { productionService } from '../../../services/productionService';
import { CreateProductionModal } from './CreateProductionModal';
import { CompleteProductionModal } from './CompleteProductionModal';
import { ProductionDetailModal } from './ProductionDetailModal';

interface ProductionManagementViewProps {
  currentUser?: { id: string; name: string; role?: string };
}

const STATUS_TABS: { label: string; value: ProductionStatus | 'ALL' }[] = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Direncanakan (Planned)', value: 'PLANNED' },
  { label: 'Sedang Proses (In Progress)', value: 'IN_PROGRESS' },
  { label: 'Selesai (Completed)', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
];

export const ProductionManagementView: React.FC<ProductionManagementViewProps> = ({ currentUser }) => {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProductionStatus | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ProductionType | 'ALL'>('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completeBatchTarget, setCompleteBatchTarget] = useState<ProductionBatch | null>(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [detailBatchTarget, setDetailBatchTarget] = useState<ProductionBatch | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch Production Batches
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await productionService.getProductions({
        searchQuery,
        status: selectedStatus,
        productionType: selectedType,
      });
      setBatches(data || []);
    } catch (e) {
      console.error('[ProductionManagementView] Error fetching batches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [searchQuery, selectedStatus, selectedType]);

  // Statistics
  const stats = useMemo(() => {
    const total = batches.length;
    const planned = batches.filter((b) => b.status === 'PLANNED').length;
    const inProgress = batches.filter((b) => b.status === 'IN_PROGRESS').length;
    const completed = batches.filter((b) => b.status === 'COMPLETED').length;

    let sumYieldPct = 0;
    let completedCount = 0;
    let totalCost = 0;
    let totalWasteCost = 0;

    batches.forEach((b) => {
      const batchCost = b.actualCost || b.theoreticalCost || 0;
      totalCost += batchCost;

      if (b.status === 'COMPLETED' && b.actualYield) {
        completedCount++;
        const yieldEval = productionService.calculateYieldStatus(b.theoreticalYield, b.actualYield);
        sumYieldPct += yieldEval.percentage;
      }

      if (b.wasteLogs && b.wasteLogs.length > 0) {
        b.wasteLogs.forEach((w) => {
          totalWasteCost += w.estimatedCost ?? 0;
        });
      }
    });

    const avgYield = completedCount > 0 ? Number((sumYieldPct / completedCount).toFixed(1)) : 98.2;

    return { total, planned, inProgress, completed, avgYield, totalCost, totalWasteCost };
  }, [batches]);

  // Batch Action Handlers
  const handleStartBatch = async (batch: ProductionBatch) => {
    try {
      await productionService.startProduction(batch.id, currentUser);
      await fetchBatches();
    } catch (err: any) {
      alert(`Gagal memulai batch: ${err.message || 'Unknown error'}`);
    }
  };

  const handleOpenComplete = (batch: ProductionBatch) => {
    setCompleteBatchTarget(batch);
    setIsCompleteOpen(true);
  };

  const handleOpenDetail = (batch: ProductionBatch) => {
    setDetailBatchTarget(batch);
    setIsDetailOpen(true);
  };

  const handleCancelBatch = async (batch: ProductionBatch) => {
    const reason = prompt('Masukkan alasan pembatalan batch:');
    if (reason !== null) {
      try {
        await productionService.cancelProduction(batch.id, reason || 'Dibatalkan oleh staf', currentUser);
        await fetchBatches();
      } catch (err: any) {
        alert(`Gagal membatalkan batch: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Banner */}
      <div className="bg-gradient-to-br from-[#151B2B] to-[#1E2438] rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/30 text-purple-400">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Kitchen Batch Production & Yield
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jadwal pengolahan bahan setengah jadi, batching bumbu, pemotongan daging, evaluasi yield, dan waste log.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Rencanakan Batch Produksi
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Batch Hari Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">Batch</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              Sedang Diproses (In Progress)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-sky-400">{stats.inProgress}</span>
              <span className="text-xs text-sky-400/80 font-medium">Batch Aktif</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Rata-rata Yield Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.avgYield}%</span>
              <span className="text-xs text-emerald-400/80 font-medium">Target: 95-105%</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
              Total Biaya Batch
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-purple-400">
                Rp {(stats.totalCost ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode batch, nama resep, stasiun..."
              className="w-full bg-[#1E2438] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-[#1E2438] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Tipe Produksi</option>
              <option value="BATCH_PREP">Batch Prep</option>
              <option value="SAUCE_MAKING">Sauce Making</option>
              <option value="BUTCHERY_PREP">Butchery Prep</option>
              <option value="DAILY_MISE_EN_PLACE">Daily Mise en Place</option>
              <option value="COOK_AND_CHILL">Cook & Chill</option>
            </select>
          </div>
        </div>

        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {STATUS_TABS.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#1E2438] text-slate-400 hover:text-white hover:bg-[#252c44]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Batch Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Memuat jadwal batch produksi...
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 text-center bg-[#151B2B] rounded-2xl border border-dashed border-white/10">
          <ChefHat className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Tidak ada batch produksi yang sesuai</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Klik tombol "Rencanakan Batch Produksi" di atas untuk menjadwalkan prep dapur baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => {
            const yieldEval = productionService.calculateYieldStatus(
              batch.theoreticalYield,
              batch.actualYield ?? batch.theoreticalYield
            );

            return (
              <div
                key={batch.id}
                className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                          {batch.productionNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            batch.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : batch.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : batch.status === 'PLANNED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{batch.recipeName}</h3>
                      <span className="text-[11px] text-slate-400">
                        {batch.productionType} • {batch.stationName || 'Kitchen'}
                      </span>
                    </div>
                  </div>

                  {/* Yield & Cost Metric Box */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-[#111827]/70 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target Yield</span>
                      <span className="font-bold text-white">
                        {batch.theoreticalYield} {batch.yieldUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Actual Yield</span>
                      <span className="font-bold text-emerald-400">
                        {batch.actualYield ? `${batch.actualYield} ${batch.yieldUnit}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Yield Evaluasi</span>
                      <span className="font-bold text-sky-400">
                        {batch.actualYield ? `${yieldEval.percentage}% (${yieldEval.status})` : 'Menunggu Selesai'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Biaya Batch</span>
                      <span className="font-bold text-purple-400">
                        Rp {(batch.actualCost || batch.theoreticalCost || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Info badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {batch.productionDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {(batch.ingredients || []).length} Bahan Baku
                    </span>
                  </div>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => handleOpenDetail(batch)}
                    className="py-1.5 px-3 bg-[#1E2438] hover:bg-[#28314d] text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" /> Detail
                  </button>

                  <div className="flex items-center gap-1.5">
                    {batch.status === 'PLANNED' && (
                      <button
                        onClick={() => handleStartBatch(batch)}
                        className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Mulai Batch
                      </button>
                    )}

                    {batch.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleOpenComplete(batch)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Selesai Batch
                      </button>
                    )}

                    {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelBatch(batch)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Batalkan Batch"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateProductionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchBatches}
        currentUser={currentUser}
      />

      <CompleteProductionModal
        batch={completeBatchTarget}
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onCompleted={fetchBatches}
        currentUser={currentUser}
      />

      <ProductionDetailModal
        batch={detailBatchTarget}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
