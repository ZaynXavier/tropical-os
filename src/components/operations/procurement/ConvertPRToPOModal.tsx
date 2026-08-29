/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — CONVERT PURCHASE REQUEST TO PO MODAL
 */

import React, { useState, useEffect } from 'react';
import { PurchaseRequest, Supplier } from '../../../types/procurement';
import { supplierService } from '../../../services/supplierService';
import { ShoppingBag, AlertCircle, X, ArrowRight, Truck, DollarSign } from 'lucide-react';

interface ConvertPRToPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PurchaseRequest | null;
  onConvert: (
    request: PurchaseRequest,
    supplier: { id: string; name: string; contact: string; paymentTerms: string },
    expectedDeliveryDate: string,
    actor: { id: string; name: string; role: string }
  ) => Promise<void>;
  currentUser: any;
}

export const ConvertPRToPOModal: React.FC<ConvertPRToPOModalProps> = ({
  isOpen,
  onClose,
  request,
  onConvert,
  currentUser,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  const loadSuppliers = async () => {
    const list = await supplierService.getSuppliers();
    const active = list.filter((s) => s.status === 'ACTIVE');
    setSuppliers(active);

    if (request?.items?.[0]?.preferredSupplierId) {
      const pref = active.find((s) => s.id === request.items?.[0]?.preferredSupplierId);
      if (pref) setSelectedSupplierId(pref.id);
      else if (active.length > 0) setSelectedSupplierId(active[0]?.id || '');
    } else if (active.length > 0) {
      setSelectedSupplierId(active[0]?.id || '');
    }
  };

  if (!isOpen || !request) return null;

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleExecuteConvert = async () => {
    setErrorMsg('');
    if (!selectedSupplier) {
      setErrorMsg('Pemasok / Supplier wajib dipilih.');
      return;
    }
    if (!expectedDeliveryDate) {
      setErrorMsg('Tanggal estimasi pengiriman (Expected Delivery) wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConvert(
        request,
        {
          id: selectedSupplier.id,
          name: selectedSupplier.supplierName,
          contact: `${selectedSupplier.contactPerson} (${selectedSupplier.phone})`,
          paymentTerms: selectedSupplier.paymentTerms,
        },
        expectedDeliveryDate,
        {
          id: currentUser?.id || 'E001',
          name: currentUser?.name || 'Staff User',
          role: currentUser?.role || 'MANAGER',
        }
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal mengonversi PR ke PO.');
    }
  };

  const estimatedSubtotal = request.items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
  const estimatedTax = Math.round(estimatedSubtotal * 0.11);
  const estimatedGrandTotal = estimatedSubtotal + estimatedTax;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base text-white">Konversi PR ke Purchase Order (PO)</h3>
              <p className="text-xs font-mono text-purple-300">Sumber: {request.requestNumber}</p>
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

        {/* PR Info */}
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/10 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span>
              Pemohon: <strong className="text-white">{request.requestedByName}</strong> ({request.department})
            </span>
            <span>
              Tgl PR: <strong className="font-mono text-white">{request.requestDate}</strong>
            </span>
          </div>
          <p className="text-slate-400 italic">"{request.reason}"</p>
        </div>

        {/* Supplier & Delivery Setup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Pilih Supplier *</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-blue-500 [&>option]:bg-[#111827]"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.supplierName} ({sup.paymentTerms} - Lead: {sup.leadTimeDays} Hari)
                </option>
              ))}
            </select>
            {selectedSupplier && (
              <span className="text-[10px] text-blue-400 block mt-1">
                Kontak: {selectedSupplier.contactPerson} ({selectedSupplier.phone}) | Min. Order: Rp{' '}
                {(selectedSupplier.minimumOrderAmount ?? 0).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Tanggal Estimasi Pengiriman *</label>
            <input
              type="date"
              required
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Item Review Table */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-300">Daftar Barang yang Di-PO-kan:</h4>
          <div className="bg-[#0B0F19] border border-white/10 rounded-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Barang / SKU</th>
                  <th className="p-3">Qty PO</th>
                  <th className="p-3">Harga Satuan</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {request.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <strong className="text-white block">{item.itemName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-300">
                      {item.requestedQuantity} {item.unit}
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      Rp {(item.estimatedUnitPrice ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400 text-right">
                      Rp {(item.estimatedTotal ?? 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Calculation Summary */}
        <div className="p-3.5 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal Estimasi:</span>
            <span>Rp {(estimatedSubtotal ?? 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>PPN 11%:</span>
            <span>Rp {(estimatedTax ?? 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-white/10">
            <span>Total Grand Total PO:</span>
            <span className="text-emerald-400">Rp {(estimatedGrandTotal ?? 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteConvert}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
          >
            <span>{isSubmitting ? 'Memproses...' : 'Terbitkan PO Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
