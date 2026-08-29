/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY DETAIL MODAL
 * Inspection modal displaying item attributes, FEFO batches, and movement ledger history.
 */

import React, { useEffect, useState } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { StockMovement } from '../../../types/stockMovement';
import { stockMovementService } from '../../../services/stockMovementService';
import { inventoryService } from '../../../services/inventoryService';
import {
  X,
  Package,
  Clock,
  Layers,
  MapPin,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldAlert,
  AlertTriangle,
  History,
  FileText,
} from 'lucide-react';

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onReportIssue?: (item: InventoryItem) => void;
  onTransfer?: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
}

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  item,
  onClose,
  onReportIssue,
  onTransfer,
  onAdjust,
}) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    stockMovementService.getStockMovementsByItem(item.id).then((movs) => {
      setMovements(movs);
      setLoading(false);
    });
  }, [item]);

  if (!item) return null;

  const status = inventoryService.getStockStatus(item);
  const expiryRisk = inventoryService.getExpiryRisk(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#151B2B] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-purple-300">
                  {item.sku}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {item.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{item.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1E2438] p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block mb-1">Stok Saat Ini</span>
              <p className="text-base font-bold text-white">
                {item.currentStock} {item.unit}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">
                Min: {item.minimumStock} | Reorder: {item.reorderPoint}
              </span>
            </div>

            <div className="bg-[#1E2438] p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block mb-1">Estimasi Nilai Stok</span>
              <p className="text-base font-bold text-emerald-400">
                Rp {(item.stockValue ?? 0).toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-slate-400">
                Avg Cost: Rp {(item.averageCost ?? 0).toLocaleString('id-ID')}/{item.baseUnit}
              </span>
            </div>

            <div className="bg-[#1E2438] p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block mb-1">Status Ketersediaan</span>
              {status === 'OPTIMAL' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Optimal
                </span>
              )}
              {status === 'LOW_STOCK' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Low Stock
                </span>
              )}
              {status === 'CRITICAL' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                  Kritis
                </span>
              )}
              {status === 'OUT_OF_STOCK' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-red-600/30 text-red-300 border border-red-500/50">
                  Habis Total
                </span>
              )}
            </div>

            <div className="bg-[#1E2438] p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block mb-1">Risiko Kedaluwarsa (FEFO)</span>
              {expiryRisk === 'NONE' && (
                <span className="text-slate-400 font-medium">Non-Expiry</span>
              )}
              {expiryRisk === 'SAFE' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Aman (&gt; 30 Hari)
                </span>
              )}
              {expiryRisk === 'WARNING_EXPIRING' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Perhatian (&lt; 30 Hari)
                </span>
              )}
              {expiryRisk === 'CRITICAL_EXPIRING' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Segera Gunakan (&lt; 7 Hari)
                </span>
              )}
              {expiryRisk === 'EXPIRED' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  EXPIRED
                </span>
              )}
            </div>
          </div>

          {/* Location & Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1E2438] p-4 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Penyimpanan &amp; Konversi
              </span>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    Lokasi: <strong className="text-white">{item.storageArea}</strong> ({item.storageLocation})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Satuan Transaksi: <strong className="text-white">{item.unit}</strong> | Satuan Dasar:{' '}
                    <strong className="text-white">{item.baseUnit}</strong>
                  </span>
                </div>
                {item.conversionFactor > 1 && (
                  <div className="text-[11px] text-purple-300 pl-5">
                    Faktor Konversi: 1 {item.unit} = {item.conversionFactor} {item.baseUnit}
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Supplier &amp; Pembelian
              </span>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Supplier Utama: <strong className="text-white">{item.supplierName || 'Tidak ditentukan'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Pembelian Terakhir: Rp {(item.lastPurchaseCost ?? 0).toLocaleString('id-ID')}/{item.baseUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Tracking (FEFO) */}
          {item.expiryTracking && item.batches && item.batches.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Batch &amp; Expiry Schedule (FEFO Sorted)</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#1E2438]">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-[#111827] text-[10px] text-slate-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Batch No</th>
                      <th className="p-2.5">Tgl Terima</th>
                      <th className="p-2.5">Tgl Kedaluwarsa</th>
                      <th className="p-2.5 text-right">Jumlah</th>
                      <th className="p-2.5 text-right">Harga Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {item.batches.map((batch, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-2.5 font-mono text-purple-300">{batch.batchNumber}</td>
                        <td className="p-2.5 text-slate-400">{batch.receivedDate || '-'}</td>
                        <td className="p-2.5 font-semibold text-orange-400">
                          {batch.expiryDate || 'No Expiry'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">
                          {batch.quantity} {item.baseUnit}
                        </td>
                        <td className="p-2.5 text-right text-slate-300">
                          Rp {(batch.unitCost ?? 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Movement History Ledger */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Riwayat Pergerakan Stok (Ledger History)</span>
            </h4>

            {loading ? (
              <div className="p-4 text-center text-slate-400">Memuat riwayat ledger...</div>
            ) : movements.length === 0 ? (
              <div className="p-4 bg-[#1E2438] rounded-xl text-center text-slate-400 border border-white/10">
                Belum ada transaksi pergerakan stok untuk barang ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#1E2438]">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-[#111827] text-[10px] text-slate-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Waktu</th>
                      <th className="p-2.5">Tipe Movement</th>
                      <th className="p-2.5">Lokasi</th>
                      <th className="p-2.5 text-right">Jumlah</th>
                      <th className="p-2.5 text-right">Total Nilai</th>
                      <th className="p-2.5">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movements.map((mov) => {
                      const isIncoming =
                        mov.movementType === 'PURCHASE_RECEIVE' ||
                        mov.movementType === 'TRANSFER_IN' ||
                        mov.movementType === 'ADJUSTMENT_IN' ||
                        mov.movementType === 'OPENING_BALANCE';

                      return (
                        <tr key={mov.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-2.5 text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(mov.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                isIncoming
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                              }`}
                            >
                              {isIncoming ? (
                                <ArrowDownRight className="w-3 h-3" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3" />
                              )}
                              <span>{mov.movementType}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-300 text-[11px]">
                            {mov.sourceLocation || '-'} → {mov.destinationLocation || '-'}
                          </td>
                          <td className={`p-2.5 text-right font-bold ${isIncoming ? 'text-emerald-400' : 'text-pink-400'}`}>
                            {isIncoming ? '+' : '-'}{mov.quantity} {mov.unit}
                          </td>
                          <td className="p-2.5 text-right text-slate-300">
                            Rp {(mov.totalValue ?? 0).toLocaleString('id-ID')}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {mov.createdByName || mov.createdBy}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#111827] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onReportIssue && (
              <button
                onClick={() => {
                  onClose();
                  onReportIssue(item);
                }}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-semibold border border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Laporkan Kendala</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onTransfer && (
              <button
                onClick={() => {
                  onClose();
                  onTransfer(item);
                }}
                className="px-3.5 py-2 bg-[#1E2438] hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                Transfer Stok
              </button>
            )}

            {onAdjust && (
              <button
                onClick={() => {
                  onClose();
                  onAdjust(item);
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-purple-600/30"
              >
                Koreksi Stok
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
