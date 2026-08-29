/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, DeductionType } from "../../types";
import { DeductionService } from "../../lib/supabase";
import { X, DollarSign, AlertTriangle, CheckCircle2, Coins } from "lucide-react";

interface ApplyDeductionModalProps {
  user: User;
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyDeductionModal: React.FC<ApplyDeductionModalProps> = ({
  user,
  employeeId,
  employeeName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentPeriod = new Date().toISOString().substring(0, 7);
  const [deductionType, setDeductionType] = useState<DeductionType>("KASBON");
  const [amount, setAmount] = useState<number>(500000);
  const [period, setPeriod] = useState(currentPeriod);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Alasan permohonan kasbon/potongan wajib diisi.");
      return;
    }
    if (amount <= 0) {
      setError("Nominal harus lebih besar dari 0.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await DeductionService.createDeduction({
      employee_id: employeeId,
      deduction_type: deductionType,
      amount,
      period,
      description,
      status: "ACTIVE",
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    alert("Permohonan kasbon/potongan berhasil diajukan ke HR / Finance.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A071E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ajukan Kasbon &amp; Pinjaman Karyawan</h3>
              <p className="text-xs text-purple-200/70">{employeeName} ({user.division})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Tipe Pemotongan *</label>
              <select
                value={deductionType}
                onChange={(e) => setDeductionType(e.target.value as DeductionType)}
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="KASBON">KASBON (Pinjaman Sementara)</option>
                <option value="PINJAMAN">PINJAMAN KOPERASI / PERUSAHAAN</option>
                <option value="LAINNYA">LAINNYA</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-200 font-bold mb-1.5">Periode Pemotongan Gaji *</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full bg-[#080519] border border-white/15 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Nominal Kasbon / Pinjaman (Rp) *</label>
            <input
              type="number"
              min="50000"
              step="50000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-3 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1.5">Keperluan / Keterangan *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Contoh: Kebutuhan mendesak pengobatan keluarga / Biaya pendidikan anak."
              required
              className="w-full bg-[#080519] border border-white/15 rounded-2xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200">
            <span className="font-bold">Ketentuan Kasbon:</span> Nominal kasbon yang disetujui akan dipotong secara otomatis pada slip gaji periode {period}.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-purple-200 rounded-2xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Kirim Permohonan Kasbon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
