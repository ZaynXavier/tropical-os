/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PURCHASE REQUEST APPROVAL MODAL
 */

import React, { useState } from 'react';
import { PurchaseRequest } from '../../../types/procurement';
import { CheckCircle2, XCircle, AlertCircle, X, MessageSquare, ShieldCheck } from 'lucide-react';

interface PurchaseRequestApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PurchaseRequest | null;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const PurchaseRequestApprovalModal: React.FC<PurchaseRequestApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !request) return null;

  const quickRejectionReasons = [
    'Stock masih mencukupi di gudang',
    'Prioritas operasional rendah untuk minggu ini',
    'Anggaran belum tersedia / Melewati batas budget',
    'Permintaan terindikasi duplikat dengan PR lain',
    'Supplier belum tersedia / perlu klarifikasi harga',
  ];

  const handleExecuteAction = async () => {
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      if (actionType === 'APPROVE') {
        await onApprove(request.id, approvalNotes);
      } else {
        if (!rejectionReason.trim()) {
          setErrorMsg('Alasan penolakan (Rejection Reason) wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        await onReject(request.id, rejectionReason);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal memproses persetujuan.');
    }
  };

  const estimatedTotal = request.items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-base text-white">Review &amp; Persetujuan Purchase Request</h3>
              <p className="text-xs font-mono text-purple-300">{request.requestNumber}</p>
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

        {/* Request Summary Card */}
        <div className="bg-[#0B0F19] p-4 rounded-xl border border-white/10 space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-white/10 pb-3">
            <div>
              <span className="text-slate-400 block text-[10px]">PEMOHON</span>
              <strong className="text-white block">{request.requestedByName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DEPARTEMEN</span>
              <strong className="text-slate-200 block">{request.department}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">PRIORITAS</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block ${
                  request.priority === 'URGENT'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : request.priority === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {request.priority}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DIBUTUHKAN TANGGAL</span>
              <strong className="text-white font-mono block">{request.requiredDate}</strong>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">ALASAN PEMBELIAN</span>
            <p className="text-slate-200 font-medium">{request.reason}</p>
          </div>

          {request.operationalReason && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300">
              <span className="font-bold block text-[10px] text-amber-400">ALASAN OPERASIONAL:</span>
              <p>{request.operationalReason}</p>
            </div>
          )}
        </div>

        {/* Items List Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Rincian Item Ditingkatkan:</h4>
          <div className="bg-[#0B0F19] border border-white/10 rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Nama Barang / SKU</th>
                  <th className="p-3">Stok Saat Ini</th>
                  <th className="p-3">Qty Diajukan</th>
                  <th className="p-3">Est. Harga</th>
                  <th className="p-3 text-right">Est. Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {request.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <strong className="text-white block">{item.itemName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-300">
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
          <div className="flex justify-between items-center text-xs p-2.5 bg-[#0B0F19] rounded-xl border border-white/10">
            <span className="text-slate-400">Total Estimasi Anggaran Pengadaan:</span>
            <strong className="text-emerald-400 font-mono text-base">
              Rp {(estimatedTotal ?? 0).toLocaleString('id-ID')}
            </strong>
          </div>
        </div>

        {/* Action Toggle Tab */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActionType('APPROVE')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-[#0B0F19] text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Setujui Permintaan (Approve)</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('REJECT')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                actionType === 'REJECT'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#0B0F19] text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Tolak Permintaan (Reject)</span>
            </button>
          </div>

          {actionType === 'APPROVE' ? (
            <div>
              <label className="text-slate-300 font-semibold block mb-1 text-xs">Catatan Persetujuan (Optional)</label>
              <input
                type="text"
                placeholder="Catatan persetujuan untuk requester/procurement..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-red-400 font-semibold block text-xs">Alasan Penolakan (Wajib) *</label>

              {/* Quick Reasons Chips */}
              <div className="flex flex-wrap gap-1.5">
                {quickRejectionReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setRejectionReason(qr)}
                    className="px-2.5 py-1 bg-[#0B0F19] hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 rounded-lg text-[10px] cursor-pointer transition-all"
                  >
                    + {qr}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                required
                placeholder="Tuliskan alasan spesifik penolakan request ini..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-red-500/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>
          )}
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
            onClick={handleExecuteAction}
            disabled={isSubmitting}
            className={`px-5 py-2 text-white font-bold rounded-xl cursor-pointer shadow-lg ${
              actionType === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
            }`}
          >
            {isSubmitting
              ? 'Memproses...'
              : actionType === 'APPROVE'
              ? 'Konfirmasi Persetujuan'
              : 'Konfirmasi Penolakan'}
          </button>
        </div>
      </div>
    </div>
  );
};
