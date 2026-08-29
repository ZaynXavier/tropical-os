/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, EmployeeDeduction, DeductionType, DeductionStatus } from "../../types";
import { DeductionService } from "../../services/otherServices";
import { EmployeeService, EmployeeData } from "../../services/employeeService";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Calendar,
  DollarSign,
  X,
  Clock,
  ShieldCheck
} from "lucide-react";

interface DeductionsManagementViewProps {
  user: User;
}

export const DeductionsManagementView: React.FC<DeductionsManagementViewProps> = ({ user }) => {
  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [deductionType, setDeductionType] = useState<DeductionType>("KASBON");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(200000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canApprove = user.role === "MANAGER" || (user as any).accessLevel === "MANAGER";
  const isStaff = user.role === "STAFF";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const [dedRes, empRes] = await Promise.all([
      DeductionService.getDeductions(),
      EmployeeService.getAllEmployees(),
    ]);

    if (dedRes.error) setErrorMessage(dedRes.error);
    setDeductions(dedRes.data);
    setEmployees(empRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    const empId = isStaff ? (user.employee_id || employees[0]?.id || "") : selectedEmployeeId;

    if (!empId || !description || amount <= 0) {
      setErrorMessage("Mohon lengkapi seluruh formulir potongan.");
      return;
    }

    setSubmitting(true);
    const res = await DeductionService.createDeduction({
      employee_id: empId,
      deduction_type: deductionType,
      description,
      amount,
      date,
      notes,
    });

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Potongan / kasbon berhasil dicatat.");
      setIsModalOpen(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: DeductionStatus) => {
    setSubmitting(true);
    const res = await DeductionService.updateDeductionStatus(id, newStatus);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Status potongan berhasil diubah menjadi ${newStatus}.`);
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const resetForm = () => {
    setDeductionType("KASBON");
    setDescription("");
    setAmount(200000);
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const filteredDeductions = deductions.filter((d) => {
    const matchesSearch =
      (d.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || d.deduction_type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/70 via-[#130F30] to-rose-950/50 border border-red-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                Phase 4.1 Kasbon &amp; Potongan
              </span>
              <span className="text-xs text-purple-200/60 font-mono">
                Scope: {user.role === "MANAGER" ? "ALL EMPLOYEES" : user.role === "SUPERVISOR" ? "TEAM SUPERVISED" : "MY OWN DEDUCTIONS"}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Manajemen Potongan &amp; Kasbon
            </h1>
            <p className="text-xs text-purple-200/70 max-w-xl">
              Pencatatan kasbon karyawan, pinjaman internal, dan pemotongan operasional dengan histori terverifikasi.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setSelectedEmployeeId(employees[0].id || "");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{isStaff ? "Ajukan Kasbon" : "Catat Potongan / Kasbon"}</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#130F30]/80 border border-white/10">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs">
          <Search className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan / deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-purple-300/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-purple-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs text-purple-200 focus:outline-none"
          >
            <option value="ALL">Semua Jenis Potongan</option>
            <option value="KASBON">Kasbon</option>
            <option value="LOAN">Pinjaman Karyawan</option>
            <option value="CORRECTION">Koreksi Absensi</option>
            <option value="ADMIN_FEE">Biaya Admin</option>
            <option value="OTHER">Lainnya</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs text-purple-200 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DEDUCTED">DEDUCTED (Sudah Dipotong)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-3xl bg-[#130F30]/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 animate-spin text-red-400" />
            <span>Memuat data potongan...</span>
          </div>
        ) : filteredDeductions.length === 0 ? (
          <div className="p-12 text-center text-purple-300/60 text-xs space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-purple-400/50" />
            <p>Belum ada data potongan tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-purple-200/70 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Jenis Potongan</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Approver</th>
                  {canApprove && <th className="py-3.5 px-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDeductions.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{d.employee_name || "Karyawan"}</div>
                      <div className="text-[10px] text-purple-300/60 font-mono">{d.division || "RESTO"}</div>
                    </td>
                    <td className="py-3 px-4 text-purple-200">{d.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                        {d.deduction_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium max-w-xs">{d.description}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-red-400 text-sm">
                      - Rp {(d.amount ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                        d.status === "APPROVED" || d.status === "DEDUCTED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : d.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-purple-300/70 font-mono">
                      {d.approver_name || "-"}
                    </td>
                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {d.status === "SUBMITTED" ? (
                          <button
                            onClick={() => handleStatusUpdate(d.id, "APPROVED")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-300/40">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#130F30] border border-white/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-400" />
                <span>{isStaff ? "Form Pengajuan Kasbon" : "Catat Kasbon / Potongan"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeduction} className="space-y-4 text-xs">
              {!isStaff && (
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Pilih Karyawan</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id || emp.emp_id} value={emp.id || emp.emp_id}>
                        {emp.name} ({emp.emp_id} - {emp.division})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Jenis Potongan</label>
                  <select
                    value={deductionType}
                    onChange={(e) => setDeductionType(e.target.value as DeductionType)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="KASBON">Kasbon</option>
                    <option value="LOAN">Pinjaman</option>
                    <option value="CORRECTION">Koreksi Absensi</option>
                    <option value="ADMIN_FEE">Biaya Admin</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  placeholder="Rincian kasbon / kebutuhan darurat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Potongan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
