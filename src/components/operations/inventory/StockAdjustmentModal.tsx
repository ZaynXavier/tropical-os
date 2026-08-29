/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK ADJUSTMENT MODAL
 * Modal form for manual inventory adjustments and stock corrections.
 */

import React, { useState } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { inventoryService } from '../../../services/inventoryService';
import { stockMovementService } from '../../../services/stockMovementService';
import { X, Sliders, AlertCircle } from 'lucide-react';

interface StockAdjustmentModalProps {
  item?: InventoryItem | null;
  allItems: InventoryItem[];
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  item,
  allItems,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [selectedItemId, setSelectedItemId] = useState(item?.id || allItems[0]?.id || '');
  const targetItem = allItems.find((i) => i.id === selectedItemId) || item;

  const [newStock, setNewStock] = useState<number>(targetItem?.currentStock || 0);
  const [reason, setReason] = useState('Koreksi Stok Hasil Opname Harian');
  const [notes, setNotes] = useState('');

  const currentStock = targetItem?.currentStock || 0;
  const difference = newStock - currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem) return;

    if (difference === 0) {
      alert('Stok baru sama dengan stok saat ini. Tidak ada perubahan yang disimpan.');
      return;
    }

    stockMovementService.adjustStock({
      itemId: targetItem.id,
      systemQty: currentStock,
      physicalQty: newStock,
      reason: `${reason}${notes ? ` - ${notes}` : ''}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
    });

    alert(`Stok ${targetItem.name} berhasil disesuaikan dari ${currentStock} menjadi ${newStock} ${targetItem.unit}.`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#151B2B] w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl animate-scale-up text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Koreksi &amp; Penyesuaian Stok</h3>
              <p className="text-[11px] text-slate-400">Penyesuaian stok manual dengan catatan alasan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Barang Target</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const sel = allItems.find((i) => i.id === e.target.value);
                if (sel) setNewStock(sel.currentStock);
              }}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {allItems.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.sku}] {i.name} — Stok Sistem: {i.currentStock} {i.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#1E2438] p-3 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-slate-400 block">Stok Sistem Saat Ini</span>
              <p className="text-sm font-bold font-mono text-white">
                {currentStock} {targetItem?.unit}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Selisih Koreksi</span>
              <p
                className={`text-sm font-bold font-mono ${
                  difference === 0
                    ? 'text-slate-400'
                    : difference > 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {difference > 0 ? `+${difference}` : difference} {targetItem?.unit}
              </p>
            </div>
          </div>

          {/* New Stock Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Stok Fisik Baru Real ({targetItem?.unit})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={newStock}
              onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-purple-500/50 rounded-xl font-bold font-mono text-base text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Alasan Penyesuaian</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="Koreksi Stok Hasil Opname Harian">Koreksi Stok Hasil Opname Harian</option>
              <option value="Kerusakan / Kebocoran Kemasan">Kerusakan / Kebocoran Kemasan</option>
              <option value="Koreksi Kesalahan Input Sistem">Koreksi Kesalahan Input Sistem</option>
              <option value="Sampel Uji Coba Resep Baru">Sampel Uji Coba Resep Baru</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Keterangan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan detail penyebab penyesuaian..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Simpan Koreksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
