/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — PRODUCTION BATCH DETAIL MODAL
 */

import React from 'react';
import {
  X,
  ChefHat,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  Scale,
  Percent,
  Trash2,
  MapPin,
  Clock,
  FileText,
} from 'lucide-react';
import { ProductionBatch } from '../../../types/production';
import { productionService } from '../../../services/productionService';

interface ProductionDetailModalProps {
  batch: ProductionBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionDetailModal: React.FC<ProductionDetailModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !batch) return null;

  const yieldEval = productionService.calculateYieldStatus(
    batch.theoreticalYield,
    batch.actualYield ?? batch.theoreticalYield
  );

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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{batch.recipeName}</h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
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
              <p className="text-xs text-slate-400 mt-0.5">
                Tipe: <span className="text-slate-300">{batch.productionType}</span> • Stasiun:{' '}
                <span className="text-slate-300">{batch.stationName || 'Kitchen'}</span> • Tanggal:{' '}
                <span className="text-slate-300">{batch.productionDate}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Yield</span>
              <span className="text-base font-bold text-white">
                {batch.theoreticalYield} {batch.yieldUnit}
              </span>
            </div>

            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Actual Yield</span>
              <span className="text-base font-bold text-emerald-400">
                {batch.actualYield ?? '-'} {batch.actualYield ? batch.yieldUnit : ''}
              </span>
            </div>

            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evaluasi Yield</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-sky-400">
                  {batch.actualYield ? `${yieldEval.percentage}%` : '-'}
                </span>
                {batch.actualYield && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                    {yieldEval.status}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#1e293b]/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Biaya Batch</span>
              <span className="text-base font-bold text-purple-400">
                Rp {(batch.actualCost || batch.theoreticalCost || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Notes & Storage */}
          {(batch.notes || batch.storageLocation) && (
            <div className="p-3.5 bg-[#151b2b] rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {batch.storageLocation && (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Lokasi Simpan: <strong className="text-white">{batch.storageLocation}</strong>
                  </span>
                </div>
              )}
              {batch.notes && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    Catatan: <strong className="text-white">{batch.notes}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Ingredient Usage Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" /> Pemakaian Bahan Baku (BOM vs Aktual)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#151b2b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1e293b]/50">
                    <th className="py-2.5 px-3">Bahan Baku</th>
                    <th className="py-2.5 px-2 text-right">Target Teoritis</th>
                    <th className="py-2.5 px-2 text-right">Pemakaian Riil</th>
                    <th className="py-2.5 px-2 text-center">Selisih</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(batch.ingredients || []).map((ing, idx) => (
                    <tr key={ing.inventoryItemId || idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium text-white">{ing.inventoryItemName}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                        {ing.expectedQuantity} {ing.unit}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-200 font-bold">
                        {ing.actualQuantity ?? ing.expectedQuantity} {ing.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {ing.variancePercentage !== undefined ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              Math.abs(ing.variancePercentage) <= 5
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {(ing.varianceQuantity ?? 0) > 0 ? '+' : ''}
                            {ing.varianceQuantity ?? 0} ({ing.variancePercentage}%)
                          </span>
                        ) : (
                          '-'
                        )}
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

          {/* Waste Logs */}
          {batch.wasteLogs && batch.wasteLogs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" /> Log Limbah Produksi
              </h3>

              <div className="space-y-2">
                {batch.wasteLogs.map((waste) => (
                  <div
                    key={waste.id}
                    className="p-3 bg-[#151b2b] rounded-xl border border-rose-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-300">{waste.reasonCategory}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{waste.notes || 'Tanpa keterangan'}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-rose-400 font-bold">
                        {waste.wasteQuantity} {waste.wasteUnit}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        Est. Rp {(waste.estimatedCost ?? 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#151b2b] border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dibuat oleh: <span className="text-slate-300">{batch.createdByName || 'Staff'}</span>
            {batch.completedAt && (
              <span>
                {' '}
                • Selesai:{' '}
                <span className="text-slate-300">
                  {new Date(batch.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            )}
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
