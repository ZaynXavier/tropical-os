/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — RECIPE DETAIL & PRINTABLE KITCHEN SOP MODAL
 */

import React from 'react';
import {
  X,
  ChefHat,
  Clock,
  DollarSign,
  Scale,
  Percent,
  Layers,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Edit,
} from 'lucide-react';
import { Recipe } from '../../../types/recipe';
import { recipeService } from '../../../services/recipeService';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !recipe) return null;

  const metrics = recipeService.calculateRecipeMetrics(recipe);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151b2b]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">{recipe.recipeName}</h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                  {recipe.recipeCode} (v{recipe.version ?? 1})
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    recipe.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : recipe.status === 'DRAFT'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {recipe.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kategori: <span className="text-slate-300 font-medium">{recipe.menuCategory}</span> • Stasiun:{' '}
                <span className="text-slate-300 font-medium">{recipe.stationName || 'Kitchen'}</span> • Tingkat:{' '}
                <span className="text-slate-300 font-medium">{recipe.difficulty || 'MEDIUM'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(recipe);
                }}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Harga Jual</span>
              <span className="text-base font-bold text-emerald-400">
                Rp {(metrics.sellingPrice ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">HPP Porsi</span>
              <span className="text-base font-bold text-purple-400">
                Rp {(metrics.totalHppPerPortion ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Food Cost %</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-base font-bold ${
                    metrics.foodCostPercentage <= (metrics.targetFoodCostPercentage ?? 30)
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {metrics.foodCostPercentage ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500">
                  / Tgt {metrics.targetFoodCostPercentage ?? 30}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gross Margin</span>
              <span className="text-base font-bold text-sky-400">
                {metrics.grossMarginPercentage ?? 0}% (Rp {(metrics.grossProfit ?? 0).toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <div className="p-3.5 bg-[#151b2b] rounded-xl border border-white/10 text-xs text-slate-300">
              {recipe.description}
            </div>
          )}

          {/* Bill of Materials (BOM) Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Bill of Materials (BOM) & Komposisi
              </h3>
              <span className="text-xs text-slate-400">
                Yield: {recipe.yieldQuantity ?? 1} {recipe.yieldUnit || 'Porsi'} ({recipe.totalPortions ?? 1} porsi)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse bg-[#151b2b]">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1e293b]/50">
                    <th className="py-2.5 px-3">Bahan Baku</th>
                    <th className="py-2.5 px-2">SKU</th>
                    <th className="py-2.5 px-2 text-right">Takaran Net</th>
                    <th className="py-2.5 px-2 text-center">Prep Loss</th>
                    <th className="py-2.5 px-2 text-center">Cook Loss</th>
                    <th className="py-2.5 px-2 text-right">Qty Efektif</th>
                    <th className="py-2.5 px-2 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(recipe.ingredients || []).map((ing, idx) => (
                    <tr key={ing.id || idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        {ing.isKeyIngredient && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Key Ingredient" />
                        )}
                        {ing.inventoryItemName}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400">{ing.inventoryItemSku || '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                        {ing.quantity} {ing.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                        {ing.preparationLossPercentage ?? 0}%
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                        {ing.cookingLossPercentage ?? 0}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-200">
                        {ing.effectiveQuantity ?? ing.quantity} {ing.unit}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                        Rp {(ing.unitCost ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-400">
                        Rp {(ing.totalCost ?? 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cost Breakdown Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#1e293b]/40 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block">Total Bahan Baku:</span>
                <span className="font-bold text-white">
                  Rp {(metrics.rawMaterialCost ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Kemasan + Overhead:</span>
                <span className="font-bold text-slate-300">
                  Rp {((metrics.packagingCost ?? 0) + (metrics.laborOverheadCost ?? 0)).toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Biaya Resep (Total BOM):</span>
                <span className="font-bold text-purple-400">
                  Rp {(metrics.totalRecipeCost ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Cooking Instructions (SOP) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Panduan & Standar Memasak (SOP)
            </h3>

            {recipe.instructions && recipe.instructions.length > 0 ? (
              <div className="space-y-2.5">
                {recipe.instructions.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3.5 bg-[#151b2b] rounded-xl border border-white/10 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{step.title}</span>
                        {step.timeMinutes && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.timeMinutes} Menit
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{step.description}</p>
                      {step.criticalPoints && (
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-[11px] flex items-center gap-1.5 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong>Critical Point:</strong> {step.criticalPoints}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada panduan instruksi memasak tertulis.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#151b2b] border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dibuat oleh: <span className="text-slate-300">{recipe.createdByName || 'Staff'}</span> • Terakhir diupdate:{' '}
            <span className="text-slate-300">{new Date(recipe.updatedAt).toLocaleDateString('id-ID')}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
