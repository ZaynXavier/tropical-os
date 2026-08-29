/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — RECEIVE STOCK MODAL
 * Modal form for receiving stock (Purchase Orders or direct receiving) with FEFO expiry tracking.
 */

import React, { useState } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { stockMovementService } from '../../../services/stockMovementService';
import { X, PackageCheck, Calendar, Building2, Tag } from 'lucide-react';

interface ReceiveStockModalProps {
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

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  item,
  allItems,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [selectedItemId, setSelectedItemId] = useState(item?.id || allItems[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(item?.averageCost || 10000);
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Date.now().toString().slice(-6)}`);
  const [expiryDate, setExpiryDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [supplierName, setSupplierName] = useState(item?.supplierName || '');
  const [notes, setNotes] = useState('');

  const targetItem = allItems.find((i) => i.id === selectedItemId) || item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem || quantity <= 0) return;

    stockMovementService.receiveStock({
      itemId: targetItem.id,
      quantity,
      unit: targetItem.unit,
      unitCost,
      batchNumber,
      expiryDate: expiryDate || undefined,
      invoiceNumber: poNumber || undefined,
      supplierName: supplierName || targetItem.supplierName,
      actorId: currentUser.id,
      actorName: currentUser.name,
      notes,
    });

    alert(`Berhasil menerima ${quantity} ${targetItem.unit} ${targetItem.name}! Stok master telah diperbarui.`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#151B2B] w-full max-w-lg rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl animate-scale-up text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Form Penerimaan Barang (PO / Non-PO)</h3>
              <p className="text-[11px] text-slate-400">Catat persediaan masuk &amp; tanggal kedaluwarsa FEFO</p>
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
            <label className="block text-slate-300 font-semibold mb-1">Pilih Barang Inventaris</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const sel = allItems.find((i) => i.id === e.target.value);
                if (sel) {
                  setUnitCost(sel.averageCost);
                  setSupplierName(sel.supplierName || '');
                }
              }}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer text-xs"
            >
              {allItems.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.sku}] {i.name} ({i.category}) — Stok: {i.currentStock} {i.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity Received */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Jumlah Diterima ({targetItem?.unit || 'Pcs'})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl font-bold font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Beli / Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Batch Number */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Batch (FEFO)</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Kedaluwarsa</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* PO Reference */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Purchase Order (PO)</label>
              <input
                type="text"
                placeholder="PO-2026-001"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Supplier</label>
              <input
                type="text"
                placeholder="PT Sumber Segar"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Penerimaan / Fisik Barang</label>
            <textarea
              rows={2}
              placeholder="Kondisi kemasan utuh, temperatur dingin sesuai standar..."
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Proses Penerimaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
