/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — RECEIVE GOODS MODAL (PENERIMAAN BARANG PO)
 */

import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../../../types/procurement';
import { Truck, CheckCircle2, AlertCircle, X, Calendar, Hash, FileText } from 'lucide-react';

interface ReceivingDetailState {
  poiId: string;
  inventoryItemId: string;
  itemName: string;
  sku: string;
  orderedQty: number;
  previouslyReceived: number;
  remainingQty: number;
  qtyReceivedNow: number;
  unit: string;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  discrepancyReason: string;
}

interface ReceiveGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  onReceive: (
    poId: string,
    receivingDetails: {
      poiId: string;
      inventoryItemId: string;
      qtyReceived: number;
      batchNumber?: string;
      expiryDate?: string;
      unitPrice: number;
      discrepancyReason?: string;
    }[],
    actor: { id: string; name: string; role: string },
    invoiceReference?: string
  ) => Promise<void>;
  currentUser: any;
}

export const ReceiveGoodsModal: React.FC<ReceiveGoodsModalProps> = ({
  isOpen,
  onClose,
  order,
  onReceive,
  currentUser,
}) => {
  const [receivingItems, setReceivingItems] = useState<ReceivingDetailState[]>([]);
  const [invoiceReference, setInvoiceReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      const today = new Date().toISOString().slice(0, 10);
      const itemsState: ReceivingDetailState[] = order.items.map((item) => ({
        poiId: item.id,
        inventoryItemId: item.inventoryItemId,
        itemName: item.itemName,
        sku: item.sku,
        orderedQty: item.orderedQuantity,
        previouslyReceived: item.receivedQuantity,
        remainingQty: item.remainingQuantity,
        qtyReceivedNow: item.remainingQuantity, // Default to receiving all remaining
        unit: item.unit,
        unitPrice: item.unitPrice,
        batchNumber: `BAT-${order.poNumber.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '2026-12-31',
        discrepancyReason: '',
      }));
      setReceivingItems(itemsState);
      setInvoiceReference(`INV-${order.supplierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleUpdateItem = (idx: number, field: keyof ReceivingDetailState, val: any) => {
    const updated = [...receivingItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setReceivingItems(updated);
  };

  const handleExecuteReceiving = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const activeItems = receivingItems.filter((i) => i.qtyReceivedNow > 0);
    if (activeItems.length === 0) {
      setErrorMsg('Harap masukkan jumlah penerimaan (Qty Diterima) minimal pada 1 item.');
      return;
    }

    for (const item of activeItems) {
      if (item.qtyReceivedNow < item.remainingQty && !item.discrepancyReason.trim()) {
        setErrorMsg(
          `Item "${item.itemName}" diterima kurang dari sisa order (${item.qtyReceivedNow} vs ${item.remainingQty}). Harap isi Alasan Ketidaksesuaian/Discrepancy.`
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onReceive(
        order.id,
        activeItems.map((i) => ({
          poiId: i.poiId,
          inventoryItemId: i.inventoryItemId,
          qtyReceived: i.qtyReceivedNow,
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate,
          unitPrice: i.unitPrice,
          discrepancyReason: i.discrepancyReason,
        })),
        {
          id: currentUser?.id || 'E001',
          name: currentUser?.name || 'Staff Receiving',
          role: currentUser?.role || 'SUPERVISOR',
        },
        invoiceReference
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal memproses penerimaan barang.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">Formulir Penerimaan Barang PO (Goods Receipt)</h3>
              <p className="text-xs font-mono text-emerald-400">{order.poNumber} — Supplier: {order.supplierName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleExecuteReceiving} className="space-y-4 text-xs">
          {/* Invoice / Delivery Note Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0B0F19] p-3.5 rounded-xl border border-white/10">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                No. Invoice / Surat Jalan Supplier
              </label>
              <input
                type="text"
                required
                placeholder="misal: SJ-2026/08/998"
                value={invoiceReference}
                onChange={(e) => setInvoiceReference(e.target.value)}
                className="w-full p-2.5 bg-[#151B2B] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Penerima Stok / Verifikator</label>
              <input
                type="text"
                disabled
                value={`${currentUser?.name || 'Staff Receiving'} (${currentUser?.role || 'Supervisor'})`}
                className="w-full p-2.5 bg-[#151B2B]/50 border border-white/5 rounded-xl text-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Receiving Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300">Item PO yang Diterima:</h4>
            <div className="bg-[#0B0F19] border border-white/10 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 bg-[#111827] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Dipesan / Sisa</th>
                    <th className="p-3">Qty Diterima Saat Ini</th>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Expired Date</th>
                    <th className="p-3">Alasan Selisih (Discrepancy)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {receivingItems.map((item, idx) => (
                    <tr key={item.poiId} className="hover:bg-white/5">
                      <td className="p-3">
                        <strong className="text-white block">{item.itemName}</strong>
                        <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                      </td>

                      <td className="p-3 font-mono">
                        <span className="text-slate-400">{item.orderedQty} {item.unit}</span>
                        <br />
                        <span className="text-amber-400 font-bold">Sisa: {item.remainingQty}</span>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max={item.remainingQty}
                          value={item.qtyReceivedNow}
                          onChange={(e) => handleUpdateItem(idx, 'qtyReceivedNow', Number(e.target.value))}
                          className="w-20 p-2 bg-[#151B2B] border border-emerald-500/50 rounded-lg text-white font-mono font-bold text-center focus:outline-hidden focus:border-emerald-400"
                        />
                        <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => handleUpdateItem(idx, 'batchNumber', e.target.value)}
                          placeholder="No Batch"
                          className="w-32 p-1.5 bg-[#151B2B] border border-white/10 rounded-lg text-white font-mono text-[11px] focus:outline-hidden focus:border-emerald-500"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleUpdateItem(idx, 'expiryDate', e.target.value)}
                          className="w-32 p-1.5 bg-[#151B2B] border border-white/10 rounded-lg text-white font-mono text-[11px] focus:outline-hidden focus:border-emerald-500"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          placeholder={
                            item.qtyReceivedNow < item.remainingQty
                              ? 'Wajib diisi jika ada selisih...'
                              : 'Optional...'
                          }
                          value={item.discrepancyReason}
                          onChange={(e) => handleUpdateItem(idx, 'discrepancyReason', e.target.value)}
                          className={`w-44 p-1.5 bg-[#151B2B] border rounded-lg text-white text-[11px] focus:outline-hidden ${
                            item.qtyReceivedNow < item.remainingQty
                              ? 'border-amber-500/50 focus:border-amber-400'
                              : 'border-white/10 focus:border-emerald-500'
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
            <strong>Catatan Otomatisasi Stok:</strong> Mengonfirmasi penerimaan barang akan secara otomatis memperbarui
            jumlah stok di Master Inventory dan menambahkan entri Ledger Mutasi Stok bertipe <code>PURCHASE_RECEIPT</code>.
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses Ledger Stok...' : 'Konfirmasi Penerimaan Barang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
