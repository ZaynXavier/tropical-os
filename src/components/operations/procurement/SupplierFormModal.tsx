/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — SUPPLIER FORM MODAL (ADD / EDIT SUPPLIER)
 */

import React, { useState, useEffect } from 'react';
import { Supplier, SupplierCategory, SupplierStatus } from '../../../types/procurement';
import { Users, AlertCircle, X, Save } from 'lucide-react';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSubmit: (data: any, isEdit: boolean) => Promise<void>;
  currentUser: any;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSubmit,
  currentUser,
}) => {
  const [supplierName, setSupplierName] = useState('');
  const [category, setCategory] = useState<SupplierCategory>('FOOD');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('NET 14');
  const [leadTimeDays, setLeadTimeDays] = useState(2);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(1000000);
  const [status, setStatus] = useState<SupplierStatus>('ACTIVE');
  const [rating, setRating] = useState(4.5);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setSupplierName(supplier.supplierName);
        setCategory(supplier.category);
        setContactPerson(supplier.contactPerson);
        setPhone(supplier.phone);
        setEmail(supplier.email);
        setAddress(supplier.address);
        setPaymentTerms(supplier.paymentTerms);
        setLeadTimeDays(supplier.leadTimeDays);
        setMinimumOrderAmount(supplier.minimumOrderAmount);
        setStatus(supplier.status);
        setRating(supplier.rating);
        setNotes(supplier.notes || '');
      } else {
        setSupplierName('');
        setCategory('FOOD');
        setContactPerson('');
        setPhone('');
        setEmail('');
        setAddress('');
        setPaymentTerms('NET 14');
        setLeadTimeDays(2);
        setMinimumOrderAmount(1000000);
        setStatus('ACTIVE');
        setRating(4.5);
        setNotes('');
      }
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supplierName.trim()) {
      setErrorMsg('Nama Supplier wajib diisi.');
      return;
    }
    if (!contactPerson.trim() || !phone.trim()) {
      setErrorMsg('Nama kontak Person & nomor telepon wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          supplierName,
          category,
          contactPerson,
          phone,
          email,
          address,
          paymentTerms,
          leadTimeDays,
          minimumOrderAmount,
          status,
          rating,
          notes,
        },
        !!supplier
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal menyimpan data supplier.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-base text-white">
              {supplier ? 'Edit Master Supplier' : 'Tambah Supplier Baru'}
            </h3>
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

        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nama Perusahaan / Supplier *</label>
              <input
                type="text"
                required
                placeholder="misal: PT Tropical Daging Nusantara"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Kategori Supplier *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupplierCategory)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500 [&>option]:bg-[#111827]"
              >
                <option value="FOOD">FOOD — Makanan / Bahan Olahan</option>
                <option value="MEAT">MEAT — Daging &amp; Unggas</option>
                <option value="SEAFOOD">SEAFOOD — Ikan &amp; Hasil Laut</option>
                <option value="VEGETABLE">VEGETABLE — Sayuran &amp; Buah</option>
                <option value="BEVERAGE">BEVERAGE — Minuman &amp; Kopi</option>
                <option value="DRY_GOODS">DRY_GOODS — Beras, Bumbu, Minyak</option>
                <option value="PACKAGING">PACKAGING — Kemasan &amp; Box</option>
                <option value="CLEANING">CLEANING — Kebersihan &amp; Chemical</option>
                <option value="EQUIPMENT">EQUIPMENT — Peralatan Resto</option>
                <option value="OTHER">OTHER — Lain-lain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="Nama Sales / Manager"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">No. Telepon / WA *</label>
              <input
                type="text"
                required
                placeholder="0812-xxxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                placeholder="order@supplier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Alamat Kantor / Gudang</label>
            <input
              type="text"
              placeholder="Jl. Bypass Ngurah Rai..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Term Pembayaran</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500 [&>option]:bg-[#111827]"
              >
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="CBD">CBD (Cash before Delivery)</option>
                <option value="NET 7">NET 7 Hari</option>
                <option value="NET 14">NET 14 Hari</option>
                <option value="NET 30">NET 30 Hari</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Lead Time (Hari)</label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Min. Order (Rp)</label>
              <input
                type="number"
                min="0"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Status Supplier</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SupplierStatus)}
                className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500 [&>option]:bg-[#111827]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Catatan Tambahan</label>
            <input
              type="text"
              placeholder="Catatan komitmen kualitas, armada, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-yellow-500"
            />
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
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-yellow-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : supplier ? 'Simpan Perubahan' : 'Tambah Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
