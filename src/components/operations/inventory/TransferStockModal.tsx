/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — TRANSFER STOCK MODAL
 * Modal form for relocating inventory items between storage locations/areas.
 */

import React, { useState } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { stockMovementService } from '../../../services/stockMovementService';
import { X, ArrowRightLeft, MapPin } from 'lucide-react';

interface TransferStockModalProps {
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

const STORAGE_LOCATIONS = [
  'Dry Storage (Gudang Kering)',
  'Cold Storage (Chiller Utama)',
  'Freezer Room -18C',
  'Kitchen Display / Prep Area',
  'Bar Station & Beverage Counter',
  'Pastry & Bakery Storage',
  'Service Station 1',
];

export const TransferStockModal: React.FC<TransferStockModalProps> = ({
  item,
  allItems,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [selectedItemId, setSelectedItemId] = useState(item?.id || allItems[0]?.id || '');
  const targetItem = allItems.find((i) => i.id === selectedItemId) || item;

  const [fromLocation, setFromLocation] = useState(
    targetItem ? `${targetItem.storageArea} (${targetItem.storageLocation})` : STORAGE_LOCATIONS[0]
  );
  const [toLocation, setToLocation] = useState(STORAGE_LOCATIONS[1]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem || quantity <= 0) return;

    if (quantity > targetItem.currentStock) {
      alert(`Jumlah transfer (${quantity}) melebihi stok yang tersedia (${targetItem.currentStock} ${targetItem.unit})!`);
      return;
    }

    stockMovementService.transferStock({
      itemId: targetItem.id,
      quantity,
      sourceLocation: fromLocation,
      destinationLocation: toLocation,
      actorId: currentUser.id,
      actorName: currentUser.name,
      reason: notes,
    });

    alert(`Berhasil memindahkan ${quantity} ${targetItem.unit} ${targetItem.name} ke ${toLocation}!`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#151B2B] w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl animate-scale-up text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Form Transfer Lokasi Internal</h3>
              <p className="text-[11px] text-slate-400">Pindahkan stok antar area penyimpanan</p>
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
            <label className="block text-slate-300 font-semibold mb-1">Barang yang Dipindahkan</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const sel = allItems.find((i) => i.id === e.target.value);
                if (sel) {
                  setFromLocation(`${sel.storageArea} (${sel.storageLocation})`);
                }
              }}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {allItems.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.sku}] {i.name} — Stok Saat Ini: {i.currentStock} {i.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* From Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lokasi Asal</label>
              <input
                type="text"
                required
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* To Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lokasi Tujuan</label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Jumlah Dipindahkan ({targetItem?.unit || 'Pcs'})
            </label>
            <input
              type="number"
              min="0.01"
              max={targetItem?.currentStock || 9999}
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl font-bold font-mono text-white focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Maksimal stok tersedia: {targetItem?.currentStock} {targetItem?.unit}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan / Petunjuk Transfer</label>
            <textarea
              rows={2}
              placeholder="Guna persiapan shift malam / permintaan head chef..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Actions */}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Proses Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
