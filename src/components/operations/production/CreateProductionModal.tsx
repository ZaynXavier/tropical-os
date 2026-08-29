/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — CREATE PRODUCTION BATCH MODAL
 * Modal to schedule/plan new kitchen batch production runs with live BOM requirements preview.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  ChefHat,
  Calendar,
  Layers,
  DollarSign,
  AlertCircle,
  Save,
  CheckCircle,
} from 'lucide-react';
import { Recipe } from '../../../types/recipe';
import { ProductionType, ProductionBatch } from '../../../types/production';
import { recipeService } from '../../../services/recipeService';
import { productionService } from '../../../services/productionService';

interface CreateProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (batch: ProductionBatch) => void;
  currentUser?: { id: string; name: string };
}

const PRODUCTION_TYPES: { label: string; value: ProductionType }[] = [
  { label: 'Batch Prep (Bumbu & Olahan)', value: 'BATCH_PREP' },
  { label: 'Sauce Making (Saus & Dressing)', value: 'SAUCE_MAKING' },
  { label: 'Butchery Prep (Portioning Daging/Ikan)', value: 'BUTCHERY_PREP' },
  { label: 'Daily Mise en Place (Sayur & Bahan Segar)', value: 'DAILY_MISE_EN_PLACE' },
  { label: 'Cook & Chill (Kaldu & Sup)', value: 'COOK_AND_CHILL' },
];

export const CreateProductionModal: React.FC<CreateProductionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  currentUser,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [productionDate, setProductionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [productionType, setProductionType] = useState<ProductionType>('BATCH_PREP');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      recipeService.getActiveRecipes().then((data) => {
        setRecipes(data || []);
        if (data && data.length > 0) {
          setSelectedRecipeId(data[0].id);
        }
      });
      setBatchCount(1);
      setNotes('');
      setProductionDate(new Date().toISOString().slice(0, 10));
      setProductionType('BATCH_PREP');
    }
  }, [isOpen]);

  const selectedRecipe = useMemo(() => {
    return recipes.find((r) => r.id === selectedRecipeId) || null;
  }, [recipes, selectedRecipeId]);

  // Live Calculations for Theoretical Requirements
  const requirements = useMemo(() => {
    if (!selectedRecipe) return { items: [], totalTheoreticalCost: 0, theoreticalYield: 0 };

    const multiplier = Math.max(0.1, Number(batchCount) || 1);
    const theoreticalYield = Number(((selectedRecipe.yieldQuantity || 1) * multiplier).toFixed(2));

    const items = (selectedRecipe.ingredients || []).map((ing) => {
      const neededQty = Number(((ing.effectiveQuantity || ing.quantity || 0) * multiplier).toFixed(4));
      const lineCost = Math.round(neededQty * (ing.unitCost || 0));
      return {
        ...ing,
        neededQty,
        lineCost,
      };
    });

    const totalTheoreticalCost = items.reduce((sum, i) => sum + i.lineCost, 0);

    return { items, totalTheoreticalCost, theoreticalYield };
  }, [selectedRecipe, batchCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) {
      alert('Pilih resep yang akan diproduksi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await productionService.createProduction(
        {
          recipeId: selectedRecipeId,
          productionDate,
          productionType,
          plannedBatchCount: batchCount,
          stationId: selectedRecipe?.stationId,
          stationName: selectedRecipe?.stationName,
          targetDepartment: 'Kitchen',
          notes,
        },
        currentUser
      );
      onCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Gagal membuat batch produksi: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151b2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Rencanakan Batch Produksi Baru</h2>
              <p className="text-xs text-slate-400">
                Pilih formula resep standar, tentukan jumlah porsi/batch, dan periksa kebutuhan bahan baku.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Recipe */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Pilih Master Resep <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.recipeName} ({r.recipeCode}) - {r.menuCategory} [Yield: {r.yieldQuantity} {r.yieldUnit}]
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Count Multiplier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Pengali Batch (Batch Count) <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.max(0.1, Number(e.target.value) || 1))}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
                />
                <div className="flex items-center px-3 bg-[#1e293b] border border-white/10 rounded-xl text-xs text-purple-300 whitespace-nowrap">
                  = {requirements.theoreticalYield} {selectedRecipe?.yieldUnit || 'Porsi'}
                </div>
              </div>
            </div>

            {/* Production Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tipe Produksi</label>
              <select
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as ProductionType)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {PRODUCTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Production Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tanggal Pelaksanaan</label>
              <input
                type="date"
                required
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
              </input>
            </div>

            {/* Stasiun */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Stasiun Kerja</label>
              <input
                type="text"
                readOnly
                value={selectedRecipe?.stationName || 'Kitchen Prep'}
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Catatan Instruksi Khusus</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="Contoh: Simpan di chiller C-02 setelah matang, gunakan label expiry 3 hari..."
            />
          </div>

          {/* Live BOM Requirements Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Kebutuhan Bahan Baku Teoritis (BOM)
              </h3>
              <span className="text-xs text-slate-400">
                Estimasi Biaya:{' '}
                <strong className="text-emerald-400">
                  Rp {(requirements.totalTheoreticalCost ?? 0).toLocaleString('id-ID')}
                </strong>
              </span>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#151b2b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1e293b]/50">
                    <th className="py-2.5 px-3">Bahan Baku</th>
                    <th className="py-2.5 px-2 text-right">Kebutuhan Net</th>
                    <th className="py-2.5 px-2 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requirements.items.map((ing, idx) => (
                    <tr key={ing.id || idx}>
                      <td className="py-2 px-3 text-white font-medium">{ing.inventoryItemName}</td>
                      <td className="py-2 px-2 text-right font-mono text-purple-300">
                        {ing.neededQty} {ing.unit}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-400">
                        Rp {(ing.unitCost ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                        Rp {(ing.lineCost ?? 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#151b2b] border-t border-white/10 -mx-6 -mb-6 flex items-center justify-between">
            <div className="text-xs text-slate-400">Status awal batch: PLANNED</div>
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
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Memproses...' : 'Jadwalkan Batch Produksi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
