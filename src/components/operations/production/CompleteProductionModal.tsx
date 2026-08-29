/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — COMPLETE PRODUCTION BATCH MODAL
 * Records actual yield, actual ingredient consumption, variances, waste logs, and deviations.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Scale,
  Trash2,
  Plus,
  Layers,
  Percent,
  DollarSign,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  ProductionBatch,
  ProductionIngredientUsage,
  ProductionWasteLog,
  RecipeDeviationLog,
  YieldStatus,
} from '../../../types/production';
import { productionService } from '../../../services/productionService';

interface CompleteProductionModalProps {
  batch: ProductionBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (updatedBatch: ProductionBatch) => void;
  currentUser?: { id: string; name: string };
}

export const CompleteProductionModal: React.FC<CompleteProductionModalProps> = ({
  batch,
  isOpen,
  onClose,
  onCompleted,
  currentUser,
}) => {
  const [actualYield, setActualYield] = useState<number>(0);
  const [ingredients, setIngredients] = useState<ProductionIngredientUsage[]>([]);
  const [wasteLogs, setWasteLogs] = useState<
    Omit<ProductionWasteLog, 'id' | 'productionId' | 'recipeId' | 'reportedAt'>[]
  >([]);
  const [deviations, setDeviations] = useState<
    Omit<RecipeDeviationLog, 'id' | 'productionId' | 'recipeId' | 'recordedAt'>[]
  >([]);
  const [storageLocation, setStorageLocation] = useState<string>('Kitchen Chiller C-01');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch && isOpen) {
      setActualYield(batch.theoreticalYield || 1);
      setIngredients(
        (batch.ingredients || []).map((ing) => ({
          ...ing,
          actualQuantity: ing.actualQuantity || ing.expectedQuantity || 0,
        }))
      );
      setWasteLogs([]);
      setDeviations([]);
      setStorageLocation('Kitchen Chiller C-01');
      setNotes(batch.notes || '');
    }
  }, [batch, isOpen]);

  // Live Yield Status Calculation
  const yieldStatus = useMemo(() => {
    if (!batch) return { variance: 0, percentage: 100, status: 'OPTIMAL' as YieldStatus };
    return productionService.calculateYieldStatus(batch.theoreticalYield, actualYield);
  }, [batch, actualYield]);

  // Handle Actual Ingredient Usage Update
  const handleUpdateIngredient = (index: number, actualQty: number) => {
    setIngredients((prev) => {
      const copy = [...prev];
      const current = { ...copy[index] };
      const expected = current.expectedQuantity || 0;
      const act = Math.max(0, actualQty);
      const varQty = Number((act - expected).toFixed(4));
      const varPct = expected > 0 ? Number(((varQty / expected) * 100).toFixed(2)) : 0;
      const lineCost = Math.round(act * (current.unitCost || 0));

      copy[index] = {
        ...current,
        actualQuantity: act,
        varianceQuantity: varQty,
        variancePercentage: varPct,
        totalCost: lineCost,
      };
      return copy;
    });
  };

  // Add Waste Log Line
  const handleAddWasteLog = () => {
    setWasteLogs((prev) => [
      ...prev,
      {
        wasteQuantity: 0.1,
        wasteUnit: batch?.yieldUnit || 'Kg',
        estimatedCost: 5000,
        reasonCategory: 'Preparation Loss',
        notes: '',
        reportedBy: currentUser?.id || 'emp-user',
        reportedByName: currentUser?.name || 'Staff User',
      },
    ]);
  };

  // Update Waste Log Line
  const handleUpdateWasteLog = (
    index: number,
    updates: Partial<Omit<ProductionWasteLog, 'id' | 'productionId' | 'recipeId' | 'reportedAt'>>
  ) => {
    setWasteLogs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Delete Waste Log Line
  const handleDeleteWasteLog = (index: number) => {
    setWasteLogs((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    if (actualYield <= 0) {
      alert('Hasil masak aktual (actual yield) harus lebih besar dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const completed = await productionService.completeProduction(
        batch.id,
        {
          actualYield,
          actualIngredients: ingredients,
          wasteLogs,
          deviations,
          storageLocation,
          notes,
        },
        currentUser
      );
      onCompleted(completed);
      onClose();
    } catch (err: any) {
      alert(`Gagal menyelesaikan batch produksi: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151b2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Penyelesaian Batch: {batch.recipeName}</h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                  {batch.productionNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Input hasil masak aktual (yield), pemakaian bahan riil, dan pencatatan waste/sisa produksi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Yield Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#111827] border-b border-white/10 text-xs">
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Target Yield Teoritis</span>
            <span className="text-sm font-bold text-white">
              {batch.theoreticalYield} {batch.yieldUnit}
            </span>
          </div>

          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Hasil Masak Aktual</span>
            <span className="text-sm font-bold text-emerald-400">
              {actualYield} {batch.yieldUnit}
            </span>
          </div>

          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Yield Percentage</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-sky-400">{yieldStatus.percentage}%</span>
              <span className="text-[10px] text-slate-400">
                ({yieldStatus.variance > 0 ? '+' : ''}
                {yieldStatus.variance} {batch.yieldUnit})
              </span>
            </div>
          </div>

          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Status Evaluasi Yield</span>
            <span
              className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-0.5 ${
                yieldStatus.status === 'OPTIMAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : yieldStatus.status === 'BELOW_TARGET'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : yieldStatus.status === 'EXCESS'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {yieldStatus.status}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Yield & Storage Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hasil Masak Bersih (Actual Yield) <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={actualYield}
                  onChange={(e) => setActualYield(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center px-3 bg-[#1e293b] border border-white/10 rounded-xl text-xs text-slate-300 whitespace-nowrap">
                  {batch.yieldUnit}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Lokasi Penyimpanan Chiller/Freezer</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Contoh: Walk-in Chiller C-01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Catatan Kualitas & Rasa</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Aroma, tekstur, tingkat kematangan..."
              />
            </div>
          </div>

          {/* Actual Ingredients Usage Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" /> Pemakaian Bahan Baku Riil (Actual Ingredients)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Sesuaikan kuantitas riil jika terjadi selisih pemakaian dari takaran teoritis.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#151b2b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1e293b]/50">
                    <th className="py-2.5 px-3">Bahan Baku</th>
                    <th className="py-2.5 px-2 text-right">Target Teoritis</th>
                    <th className="py-2.5 px-2 text-right">Pemakaian Riil</th>
                    <th className="py-2.5 px-2 text-center">Selisih (Variance)</th>
                    <th className="py-2.5 px-3 text-right">Biaya Riil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ingredients.map((ing, idx) => (
                    <tr key={ing.inventoryItemId || idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium text-white">{ing.inventoryItemName}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                        {ing.expectedQuantity} {ing.unit}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={ing.actualQuantity}
                            onChange={(e) => handleUpdateIngredient(idx, Number(e.target.value) || 0)}
                            className="w-24 bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-purple-500"
                          />
                          <span className="text-[11px] text-slate-400">{ing.unit}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            Math.abs(ing.variancePercentage || 0) <= 5
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {(ing.varianceQuantity ?? 0) > 0 ? '+' : ''}
                          {ing.varianceQuantity ?? 0} {ing.unit} ({ing.variancePercentage ?? 0}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-400">
                        Rp {(ing.totalCost ?? 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Waste Logs Entry Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" /> Log Limbah / Waste Produksi
                </h3>
                <p className="text-[11px] text-slate-400">
                  Catat bagian yang terbuang, gosong, trimming berlebih, atau spoilage selama proses produksi.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddWasteLog}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Log Waste
              </button>
            </div>

            {wasteLogs.length === 0 ? (
              <div className="p-3 bg-[#151b2b] rounded-xl border border-white/5 text-xs text-slate-400 text-center">
                Tidak ada waste signifikan yang dicatat pada batch ini.
              </div>
            ) : (
              <div className="space-y-2">
                {wasteLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#151b2b] rounded-xl border border-rose-500/20 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-center"
                  >
                    <div>
                      <label className="block text-[10px] text-slate-400">Kategori Waste</label>
                      <select
                        value={log.reasonCategory}
                        onChange={(e) => handleUpdateWasteLog(idx, { reasonCategory: e.target.value as any })}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Preparation Loss">Preparation Loss</option>
                        <option value="Cooking Loss">Cooking Loss</option>
                        <option value="Spoilage">Spoilage</option>
                        <option value="Expired">Expired</option>
                        <option value="Spillage">Spillage / Jatuh</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Jumlah Terbuang</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={log.wasteQuantity}
                          onChange={(e) =>
                            handleUpdateWasteLog(idx, { wasteQuantity: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                        />
                        <span className="px-2 py-1 bg-[#1e293b] rounded-lg text-slate-400 text-xs">
                          {log.wasteUnit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Keterangan Penyebab</label>
                      <input
                        type="text"
                        value={log.notes || ''}
                        onChange={(e) => handleUpdateWasteLog(idx, { notes: e.target.value })}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
                        placeholder="Contoh: Kulit kering, reduksi api..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteWasteLog(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#151b2b] border-t border-white/10 -mx-6 -mb-6 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Menyelesaikan batch akan otomatis mencatat pemotongan stok bahan baku & log pergerakan inventaris.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Menyelesaikan...' : 'Konfirmasi Selesai Batch'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
