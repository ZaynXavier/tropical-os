/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — CREATE PURCHASE REQUEST MODAL
 */

import React, { useState, useEffect } from 'react';
import { PurchaseRequestPriority, PurchaseRequestItem } from '../../../types/procurement';
import { InventoryItem } from '../../../types/inventory';
import { inventoryService } from '../../../services/inventoryService';
import { supplierService } from '../../../services/supplierService';
import { Supplier } from '../../../types/procurement';
import { Plus, Trash2, AlertCircle, Sparkles, X, Package } from 'lucide-react';

interface CreatePurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, isDraft: boolean) => Promise<void>;
  currentUser: any;
}

export const CreatePurchaseRequestModal: React.FC<CreatePurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [department, setDepartment] = useState(currentUser?.department || 'Kitchen');
  const [operationalArea, setOperationalArea] = useState('Main Area');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<PurchaseRequestPriority>('MEDIUM');
  const [reason, setReason] = useState('');
  const [operationalReason, setOperationalReason] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  const loadMasterData = async () => {
    const inv = await inventoryService.getInventoryItems();
    setInventoryList(inv || []);
    const sups = await supplierService.getSuppliers();
    setSuppliers(sups || []);
  };

  if (!isOpen) return null;

  const handleAddItem = (invItem: InventoryItem) => {
    if (items.some((i) => i.inventoryItemId === invItem.id)) return;

    const newItem: PurchaseRequestItem = {
      id: `pri-${Date.now()}-${items.length + 1}`,
      inventoryItemId: invItem.id,
      sku: invItem.sku,
      itemName: invItem.name,
      category: invItem.category,
      currentStock: invItem.currentStock || 0,
      minimumStock: invItem.minimumStock || 0,
      requestedQuantity: Math.max(1, (invItem.reorderPoint || 10) - (invItem.currentStock || 0)),
      unit: invItem.unit,
      estimatedUnitPrice: invItem.lastPurchaseCost || invItem.averageCost || 10000,
      estimatedTotal:
        Math.max(1, (invItem.reorderPoint || 10) - (invItem.currentStock || 0)) *
        (invItem.lastPurchaseCost || invItem.averageCost || 10000),
      preferredSupplierId: invItem.supplierId,
    };

    setItems([...items, newItem]);
    setSelectedInventoryId('');
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof PurchaseRequestItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[idx], [field]: val };
    if (field === 'requestedQuantity' || field === 'estimatedUnitPrice') {
      current.estimatedTotal = (current.requestedQuantity || 0) * (current.estimatedUnitPrice || 0);
    }
    updated[idx] = current;
    setItems(updated);
  };

  const handleAddReorderRecommendations = async () => {
    const recs = await inventoryService.getReorderRecommendations();
    if (!recs || recs.length === 0) return;

    const newItems: PurchaseRequestItem[] = [];
    for (const rec of recs) {
      if (items.some((i) => i.inventoryItemId === rec.itemId)) continue;
      const inv = inventoryList.find((i) => i.id === rec.itemId);
      newItems.push({
        id: `pri-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        inventoryItemId: rec.itemId,
        sku: rec.sku,
        itemName: rec.name,
        category: rec.category,
        currentStock: rec.currentStock,
        minimumStock: rec.minimumStock,
        requestedQuantity: rec.recommendedOrderQty,
        unit: rec.unit,
        estimatedUnitPrice: inv?.lastPurchaseCost || inv?.averageCost || 10000,
        estimatedTotal: rec.recommendedOrderQty * (inv?.lastPurchaseCost || inv?.averageCost || 10000),
        preferredSupplierId: rec.supplierId,
      });
    }

    setItems([...items, ...newItems]);
    if (recs.some((r) => r.urgency === 'CRITICAL')) {
      setPriority('URGENT');
      setReason('Restock otomatis item berstatus Kritis & Low Stock.');
      setOperationalReason('Mencegah potensi out-of-stock yang mengganggu servis harian resto.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Harap tambahkan minimal 1 item ke dalam Purchase Request.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Alasan pembelian (Reason) wajib diisi.');
      return;
    }
    if ((priority === 'HIGH' || priority === 'URGENT') && !operationalReason.trim()) {
      setErrorMessage('Alasan operasional wajib diisi untuk prioritas HIGH atau URGENT.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          requestedBy: currentUser?.id || 'E001',
          requestedByName: currentUser?.name || 'Staff User',
          department,
          operationalArea,
          requestDate: new Date().toISOString().slice(0, 10),
          requiredDate,
          priority,
          reason,
          operationalReason,
          items,
          notes,
        },
        isDraft
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal membuat Purchase Request.');
    }
  };

  const totalEstimatedCost = items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span>Buat Permintaan Pembelian (Purchase Request)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulir pengajuan stok bahan baku/supplies baru ke tim procurement.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Reorder Recommendation Banner */}
        <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
            <span>Rekomendasi Restock Otomatis berdasarkan Minimum Stock &amp; Reorder Point.</span>
          </div>
          <button
            type="button"
            onClick={handleAddReorderRecommendations}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px] transition-all cursor-pointer shrink-0"
          >
            + Ambil Item Kritis
          </button>
        </div>

        <form className="space-y-4 text-xs">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Departemen *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Bar">Bar</option>
                <option value="Service">Service</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Purchasing">Purchasing</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Area Operasional</label>
              <input
                type="text"
                value={operationalArea}
                onChange={(e) => setOperationalArea(e.target.value)}
                placeholder="misal: Hot Kitchen"
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Dibutuhkan Tanggal *</label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Tingkat Prioritas *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PurchaseRequestPriority)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
              >
                <option value="LOW">LOW — Kebutuhan Rutin Normal</option>
                <option value="MEDIUM">MEDIUM — Standar Restock Mingguan</option>
                <option value="HIGH">HIGH — Stok Tinggal Sedikit (Penting)</option>
                <option value="URGENT">URGENT — Kehabisan / Kritis (Segera)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Alasan Pembelian (Reason) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Restock persiapan banquet weekend"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          {(priority === 'HIGH' || priority === 'URGENT') && (
            <div>
              <label className="font-semibold text-amber-300 block mb-1">
                Alasan Operasional (Wajib untuk HIGH/URGENT) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Jelaskan dampak operasional jika pengadaan ini terlambat..."
                value={operationalReason}
                onChange={(e) => setOperationalReason(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-amber-500/30 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          )}

          {/* Item Selector */}
          <div className="border-t border-white/10 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Item Master Inventory</h4>
              <span className="text-xs text-slate-400">{items.length} item dipilih</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedInventoryId}
                onChange={(e) => setSelectedInventoryId(e.target.value)}
                className="flex-1 p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827]"
              >
                <option value="">-- Pilih Item dari Master Inventory --</option>
                {inventoryList.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    [{inv.sku}] {inv.name} (Stok: {inv.currentStock} {inv.unit})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const inv = inventoryList.find((i) => i.id === selectedInventoryId);
                  if (inv) handleAddItem(inv);
                }}
                disabled={!selectedInventoryId}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item</span>
              </button>
            </div>

            {/* Item Table */}
            {items.length > 0 ? (
              <div className="bg-[#0B0F19] border border-white/10 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#111827] text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="p-3">Kode &amp; Item</th>
                      <th className="p-3">Stok Saat Ini</th>
                      <th className="p-3">Qty Request</th>
                      <th className="p-3">Satuan</th>
                      <th className="p-3">Est. Harga (Rp)</th>
                      <th className="p-3">Est. Total</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <strong className="text-white block">{item.itemName}</strong>
                          <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={
                              item.currentStock <= item.minimumStock
                                ? 'text-red-400 font-bold'
                                : 'text-slate-300'
                            }
                          >
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => handleUpdateItem(idx, 'requestedQuantity', Number(e.target.value))}
                            className="w-20 p-1.5 bg-[#151B2B] border border-white/10 rounded-lg text-white text-center font-mono focus:outline-hidden focus:border-purple-500"
                          />
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{item.unit}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.estimatedUnitPrice}
                            onChange={(e) => handleUpdateItem(idx, 'estimatedUnitPrice', Number(e.target.value))}
                            className="w-28 p-1.5 bg-[#151B2B] border border-white/10 rounded-lg text-white font-mono focus:outline-hidden focus:border-purple-500"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          Rp {(item.estimatedTotal || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-[#0B0F19] rounded-xl border border-dashed border-white/10 text-center text-slate-500 text-xs">
                Belum ada item dipilih. Gunakan dropdown di atas atau tombol rekomendasi restock.
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Catatan Tambahan (Optional)</label>
            <input
              type="text"
              placeholder="Spesifikasi kemasan, waktu antar, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Summary & Buttons */}
          <div className="p-4 bg-[#0B0F19] rounded-xl border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Total Estimasi Pengadaan:</span>
              <span className="font-mono text-slate-300 text-[11px]">{items.length} Kategori SKU</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                Rp {(totalEstimatedCost ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={(e) => handleFormSubmit(e, true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-xs cursor-pointer"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleFormSubmit(e, false)}
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-lg shadow-purple-600/30"
            >
              {isSubmitting ? 'Memproses...' : 'Submit Permintaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
