/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { salesService } from "../../services/salesService";
import { CashierDailyClosing, DailySalesSummary } from "../../types/sales";
import {
  Coins,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Send,
  CheckSquare,
  Square,
  CheckCircle2,
  Receipt,
  QrCode,
  CreditCard,
  ArrowRightLeft,
  Smartphone,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface CustomField {
  id: string;
  label: string;
  value: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface SubmittedCashierReport {
  id: string;
  date: string;
  shift: string;
  cashierName: string;
  cashAmount: number;
  qrisAmount: number;
  edcAmount: number;
  transferAmount: number;
  ovoAmount: number;
  transactionCount: number;
  totalRevenue: number;
  customFields: CustomField[];
  notes: string;
  status: "Verified" | "Pending Audit";
  submittedAt: string;
  variance?: number;
  varianceStatus?: "BALANCED" | "SHORT" | "OVER";
}

interface CashierRevenueReportProps {
  user: User;
}

export const CashierRevenueReport: React.FC<CashierRevenueReportProps> = ({ user }) => {
  const [date, setDate] = useState<string>("2026-08-20");
  const [shift, setShift] = useState<string>("Shift Pagi");

  // Income Breakdown State
  const [openingFloat, setOpeningFloat] = useState<number>(500000);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [qrisAmount, setQrisAmount] = useState<number>(0);
  const [edcAmount, setEdcAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [ovoAmount, setOvoAmount] = useState<number>(0);

  // Bill / Transaction Count
  const [transactionCount, setTransactionCount] = useState<number>(0);

  // POS Recorded Reference from salesService
  const [posSummary, setPosSummary] = useState<DailySalesSummary | null>(null);

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: "cf-1", label: "Sisa Modal Laci Kasir", value: "Rp 500.000" },
  ]);

  // Checklists
  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    { id: "chk-1", text: "Uang fisik laci sudah dihitung & dimasukkan brankas", checked: false },
    { id: "chk-2", text: "Mesin EDC kartu gesek sudah dilakukan Settlement", checked: false },
    { id: "chk-3", text: "Print Z-Report POS terbit & dilampirkan fisik", checked: false },
  ]);

  // Notes
  const [notes, setNotes] = useState<string>("");

  // Feedback State
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Closing Reports List
  const [submittedReports, setSubmittedReports] = useState<SubmittedCashierReport[]>([]);

  // Load closings from salesService & POS Summary for reconciliation
  const loadReportsAndPOS = async () => {
    try {
      const closings = await salesService.getCashierClosings();
      const mapped: SubmittedCashierReport[] = closings.map((c) => ({
        id: c.closingNumber || c.id,
        date: c.businessDate,
        shift: c.shiftName,
        cashierName: c.cashierName,
        cashAmount: c.actualCash,
        qrisAmount: c.qrisAmount,
        edcAmount: c.edcAmount,
        transferAmount: c.bankTransferAmount || 0,
        ovoAmount: c.eWalletAmount || 0,
        transactionCount: c.totalTransactions,
        totalRevenue: c.totalRevenue,
        customFields: [{ id: `cf-${c.id}`, label: "Modal Awal", value: `Rp ${(c.openingFloat || 500000).toLocaleString('id-ID')}` }],
        notes: c.notes || "-",
        status: c.status === "VERIFIED" ? "Verified" : "Pending Audit",
        submittedAt: c.submittedAt ? c.submittedAt.slice(0, 16).replace('T', ' ') : c.businessDate,
        variance: c.cashVariance,
        varianceStatus: c.varianceStatus,
      }));
      setSubmittedReports(mapped);

      // Load POS summary for the selected date
      const summary = await salesService.getDailySalesSummary(date);
      setPosSummary(summary);
    } catch (err) {
      console.error("Error loading cashier reports:", err);
    }
  };

  useEffect(() => {
    loadReportsAndPOS();
  }, [date]);

  // Verify / Audit Report by SPV or Manager
  const handleVerifyReport = async (id: string) => {
    if (user.role !== "MANAGER" && user.role !== "SUPERVISOR" && user.role !== "FINANCE") {
      alert("Akses Ditolak: Verifikasi & Audit Laporan Kasir hanya dapat dilakukan oleh Supervisor atau Manager.");
      return;
    }

    try {
      await salesService.verifyCashierClosing(id, {
        id: user.id || 'usr-spv',
        name: user.name,
      });

      setSubmittedReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Verified" } : r))
      );
    } catch (err) {
      console.error("Error verifying closing report:", err);
    }
  };

  // Calculate Live Total Revenue
  const liveTotalRevenue =
    (Number(cashAmount) || 0) +
    (Number(qrisAmount) || 0) +
    (Number(edcAmount) || 0) +
    (Number(transferAmount) || 0) +
    (Number(ovoAmount) || 0);

  // Expected cash from POS
  const expectedCashFromPOS = (posSummary?.cashRevenue ?? 0) + openingFloat;
  const cashVariance = (Number(cashAmount) || 0) - expectedCashFromPOS;

  // Add Custom Field
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      label: "Keterangan Baru",
      value: "Rp 0",
    };
    setCustomFields([...customFields, newField]);
  };

  // Remove Custom Field
  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  // Update Custom Field Label/Value
  const handleUpdateCustomField = (id: string, field: "label" | "value", newValue: string) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, [field]: newValue } : f))
    );
  };

  // Toggle Checklist
  const handleToggleChecklist = (id: string) => {
    setChecklists(
      checklists.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  // Submit Handler
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Submit to salesService as authoritative closing
      const createdClosing = await salesService.createCashierClosing(
        {
          businessDate: date,
          cashierId: user.id || "cashier-01",
          cashierName: user ? user.name : "Kasir Shift",
          shiftId: shift.toLowerCase().includes("pagi") ? "shift-morning" : "shift-evening",
          shiftName: shift,
          openingFloat,
          cashSales: Number(cashAmount) || 0,
          cashRefunds: 0,
          cashPayout: 0,
          expectedCash: expectedCashFromPOS,
          actualCash: Number(cashAmount) || 0,
          qrisAmount: Number(qrisAmount) || 0,
          edcAmount: Number(edcAmount) || 0,
          bankTransferAmount: Number(transferAmount) || 0,
          eWalletAmount: Number(ovoAmount) || 0,
          totalTransactions: Number(transactionCount) || (posSummary?.transactionCount ?? 1),
          totalRevenue: liveTotalRevenue,
          notes,
        },
        { id: user.id || "usr-01", name: user.name }
      );

      setShowSuccessToast(true);
      await loadReportsAndPOS();

      // Reset form after submission
      setTimeout(() => {
        setShowSuccessToast(false);
        setCashAmount(0);
        setQrisAmount(0);
        setEdcAmount(0);
        setTransferAmount(0);
        setOvoAmount(0);
        setTransactionCount(0);
        setNotes("");
      }, 2500);
    } catch (err: any) {
      alert(`Gagal menyimpan laporan kasir: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 text-white animate-fade-in max-w-5xl mx-auto">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <h4 className="font-black text-sm">Laporan Omset Berhasil Dikirim!</h4>
            <p className="text-xs text-emerald-100">
              Data transaksi kasir telah tercatat di salesService &amp; siap diverifikasi finance.
            </p>
          </div>
        </div>
      )}

      {/* Main Input Card */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Input Laporan Omset Kasir &amp; Z-Report Closing</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h2>
            <p className="text-xs text-purple-200/70 mt-0.5">
              Rekapitulasi pendapatan harian outlet per shift dengan breakdown tunai, non-tunai, EDC, transfer &amp; rekonsiliasi POS real-time.
            </p>
          </div>
        </div>

        {/* POS Live Comparison Info */}
        {posSummary && (
          <div className="p-4 bg-[#0D0926]/90 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Referensi Data POS Tercatat ({date}):</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                {posSummary.transactionCount} Transaksi Selesai
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-purple-300 block">POS Tunai</span>
                <strong className="text-emerald-400">Rp {(posSummary.cashRevenue ?? 0).toLocaleString("id-ID")}</strong>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-purple-300 block">POS QRIS</span>
                <strong className="text-purple-300">Rp {(posSummary.qrisRevenue ?? 0).toLocaleString("id-ID")}</strong>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-purple-300 block">POS EDC Card</span>
                <strong className="text-amber-300">Rp {(posSummary.edcRevenue ?? 0).toLocaleString("id-ID")}</strong>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-purple-300 block">Total Net POS</span>
                <strong className="text-white">Rp {(posSummary.netRevenue ?? 0).toLocaleString("id-ID")}</strong>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitReport} className="space-y-6">
          {/* Tanggal & Shift Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-purple-300/80 mb-1.5 uppercase tracking-wider">
                Tanggal Laporan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0D0926]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
                  required
                />
                <Calendar className="w-4 h-4 text-purple-400 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-purple-300/80 mb-1.5 uppercase tracking-wider">
                Pilih Shift
              </label>
              <div className="relative">
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-[#0D0926]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50 appearance-none"
                  required
                >
                  <option value="Shift Pagi">Shift Pagi (08:00 - 16:00)</option>
                  <option value="Shift Siang/Sore">Shift Siang/Sore (15:00 - 23:00)</option>
                  <option value="Shift Malam">Shift Malam / Closing (23:00 - Selesai)</option>
                </select>
                <Clock className="w-4 h-4 text-purple-400 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Modal Awal / Opening Float */}
          <div>
            <label className="block text-xs font-black text-purple-300/80 mb-1.5 uppercase tracking-wider">
              Modal Awal Kasir / Float (Laci)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
              <input
                type="number"
                min="0"
                value={openingFloat || ""}
                onChange={(e) => setOpeningFloat(Number(e.target.value))}
                className="w-full bg-[#0D0926]/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white font-bold font-mono focus:outline-none focus:border-purple-500/60"
              />
            </div>
          </div>

          {/* Breakdown Pendapatan (Manual) Box */}
          <div className="bg-[#0D0926]/60 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black text-purple-300/80 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-pink-400" />
                <span>BREAKDOWN PENDAPATAN (MANUAL)</span>
              </span>
              <span className="text-[10px] text-purple-300/60 font-bold">Rupiah (IDR)</span>
            </div>

            <div className="space-y-4">
              {/* 1. Uang Tunai / Cash */}
              <div>
                <label className="block text-xs font-bold text-purple-200/90 mb-1 flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Uang Tunai / Cash Fisik (Rupiah)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cashAmount || ""}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full bg-[#130F30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-right font-black text-emerald-400 text-base focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* 2. Digital QRIS */}
              <div>
                <label className="block text-xs font-bold text-purple-200/90 mb-1 flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>2. Digital QRIS (Rupiah)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={qrisAmount || ""}
                    onChange={(e) => setQrisAmount(Number(e.target.value))}
                    className="w-full bg-[#130F30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-right font-black text-purple-300 text-base focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* 3. Gesek Kartu / Mesin EDC */}
              <div>
                <label className="block text-xs font-bold text-purple-200/90 mb-1 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Gesek Kartu / Mesin EDC (Rupiah)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={edcAmount || ""}
                    onChange={(e) => setEdcAmount(Number(e.target.value))}
                    className="w-full bg-[#130F30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-right font-black text-amber-300 text-base focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* 4. Transfer Bank */}
              <div>
                <label className="block text-xs font-bold text-purple-200/90 mb-1 flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                  <span>4. Transfer Bank (Rupiah)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={transferAmount || ""}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full bg-[#130F30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-right font-black text-blue-300 text-base focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* 5. E-Wallet OVO / GoPay / ShopeePay */}
              <div>
                <label className="block text-xs font-bold text-purple-200/90 mb-1 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>5. E-Wallet OVO / GoPay / ShopeePay (Rupiah)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-purple-300/60">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={ovoAmount || ""}
                    onChange={(e) => setOvoAmount(Number(e.target.value))}
                    className="w-full bg-[#130F30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-right font-black text-indigo-300 text-base focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jumlah Transaksi (Bill/Struk Terbit) */}
          <div>
            <label className="block text-xs font-black text-purple-300/80 mb-1.5 uppercase tracking-wider">
              Jumlah Transaksi (Bill/Struk Terbit)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={transactionCount || ""}
              onChange={(e) => setTransactionCount(Number(e.target.value))}
              className="w-full bg-[#0D0926]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
              required
            />
          </div>

          {/* Live Total Revenue Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-purple-500/20 border border-emerald-500/40 backdrop-blur-xl flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">
                TOTAL PENDAPATAN SHIFT
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                Rp {liveTotalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
            {cashVariance !== 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${cashVariance < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                <AlertTriangle className="w-4 h-4" />
                <span>Selisih Kas: {cashVariance < 0 ? `-Rp ${Math.abs(cashVariance).toLocaleString('id-ID')}` : `+Rp ${cashVariance.toLocaleString('id-ID')}`}</span>
              </div>
            )}
          </div>

          {/* Custom Fields Tambahan */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-300/80 uppercase tracking-wider">
                Custom Fields Tambahan
              </label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Field</span>
              </button>
            </div>

            {customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateCustomField(field.id, "label", e.target.value)}
                  placeholder="Nama Field Custom"
                  className="w-1/2 bg-[#0D0926]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-purple-500/60"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleUpdateCustomField(field.id, "value", e.target.value)}
                  placeholder="Nilai (e.g. Rp 500.000)"
                  className="w-1/2 bg-[#0D0926]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-purple-500/60"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Checklist Closing Mandatori */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-black text-purple-300/80 uppercase tracking-wider">
              Checklist Closing Mandatori
            </label>
            <div className="space-y-2 bg-[#0D0926]/40 p-4 rounded-2xl border border-white/10">
              {checklists.map((chk) => (
                <div
                  key={chk.id}
                  onClick={() => handleToggleChecklist(chk.id)}
                  className="flex items-start gap-3 cursor-pointer group select-none"
                >
                  {chk.checked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-purple-300/50 group-hover:text-purple-300 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-xs font-bold transition-colors ${chk.checked ? "text-emerald-300" : "text-purple-200/80 group-hover:text-white"}`}>
                    {chk.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan Kasir / Keterangan Selisih */}
          <div>
            <label className="block text-xs font-black text-purple-300/80 mb-1.5 uppercase tracking-wider">
              Catatan Kasir / Keterangan Selisih
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Selisih minus Rp 2.000 karena pembulatan go-pay atau diskon manual yang disetujui SPV..."
              className="w-full bg-[#0D0926]/80 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Laporan Omset Harian</span>
          </button>
        </form>
      </div>

      {/* Submitted History Log Table */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-black text-white">Riwayat Laporan Omset Kasir Terdaftar</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            {submittedReports.length} Laporan
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-purple-300/70 font-black uppercase tracking-wider">
                <th className="py-3 px-3">Tanggal &amp; Shift</th>
                <th className="py-3 px-3">Kasir</th>
                <th className="py-3 px-3">Tunai</th>
                <th className="py-3 px-3">QRIS</th>
                <th className="py-3 px-3">EDC</th>
                <th className="py-3 px-3 text-blue-300">Transfer</th>
                <th className="py-3 px-3 text-indigo-300">OVO</th>
                <th className="py-3 px-3">Total Omset</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {submittedReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{report.date}</div>
                    <span className="text-[10px] text-purple-300/60">{report.shift}</span>
                  </td>
                  <td className="py-3 px-3 text-purple-200 font-bold">{report.cashierName}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    Rp {(report.cashAmount ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-purple-300">
                    Rp {(report.qrisAmount ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-amber-300">
                    Rp {(report.edcAmount ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-blue-300 font-bold">
                    Rp {(report.transferAmount ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-indigo-300 font-bold">
                    Rp {(report.ovoAmount ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-300 text-sm">
                    Rp {(report.totalRevenue ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3">
                    {report.status === "Pending Audit" ? (
                      user.role === "SUPERVISOR" || user.role === "MANAGER" ? (
                        <button
                          onClick={() => handleVerifyReport(report.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-black shadow-md cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Verifikasi Laporan
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pending Audit SPV/Mgr
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {report.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
