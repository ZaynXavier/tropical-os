/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, LeaveRequest, LeaveRequestType, LeaveStatus } from "../../types";
import { LeaveService } from "../../services/otherServices";
import { EmployeeService, EmployeeData } from "../../services/employeeService";
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Clock,
  X,
  ShieldCheck,
  Coffee,
  Paperclip
} from "lucide-react";

interface LeaveManagementViewProps {
  user: User;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ user }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
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
  const [requestType, setRequestType] = useState<LeaveRequestType>("ISTIRAHAT");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Review Modal
  const [reviewItem, setReviewItem] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const canApprove = user.role === "MANAGER" || (user as any).accessLevel === "MANAGER";
  const isStaff = user.role === "STAFF";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const [lvRes, empRes] = await Promise.all([
      LeaveService.getLeaveRequests(),
      EmployeeService.getAllEmployees(),
    ]);

    if (lvRes.error) setErrorMessage(lvRes.error);
    setRequests(lvRes.data);
    setEmployees(empRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Recalculate days
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = e.getTime() - s.getTime();
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      setTotalDays(days);
    } catch {
      setTotalDays(1);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const empId = isStaff ? (user.employee_id || employees[0]?.id || "") : selectedEmployeeId;

    if (!empId || !reason || totalDays <= 0) {
      setErrorMessage("Mohon lengkapi formulir pengajuan istirahat / cuti.");
      return;
    }

    setSubmitting(true);
    const res = await LeaveService.submitLeaveRequest({
      employee_id: empId,
      request_type: requestType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason,
      attachment_url: attachmentUrl || undefined,
    });

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Pengajuan istirahat / cuti berhasil diajukan.");
      setIsModalOpen(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleReview = async (action: "APPROVED" | "REJECTED") => {
    if (!reviewItem) return;
    if (action === "REJECTED" && !rejectionReason.trim()) {
      setErrorMessage("Mohon sertakan alasan penolakan.");
      return;
    }

    setSubmitting(true);
    const res = await LeaveService.reviewLeaveRequest(reviewItem.id, action, rejectionReason);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Pengajuan ${reviewItem.request_type} berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}.`);
      setReviewItem(null);
      setRejectionReason("");
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const resetForm = () => {
    setRequestType("ISTIRAHAT");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setTotalDays(1);
    setReason("");
    setAttachmentUrl("");
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.request_type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#130F30] to-indigo-950/50 border border-purple-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Coffee className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                Phase 4.1 Istirahat, Izin &amp; Cuti
              </span>
              <span className="text-xs text-purple-200/60 font-mono">
                Scope: {user.role === "MANAGER" ? "ALL RESTO" : user.role === "SUPERVISOR" ? "DIVISI SUPERVISI" : "PENGAJUAN SAYA"}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Pengajuan Istirahat &amp; Izin Cuti
            </h1>
            <p className="text-xs text-purple-200/70 max-w-xl">
              Alur pengajuan hak istirahat operasional, izin sakit, cuti tahunan dengan validasi kuota dan approval berjenjang.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setSelectedEmployeeId(employees[0].id || "");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Istirahat / Cuti</span>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#130F30]/80 border border-white/10">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs">
          <Search className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan / alasan..."
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
            <option value="ALL">Semua Jenis Pengajuan</option>
            <option value="ISTIRAHAT">Istirahat Shift (ISTIRAHAT)</option>
            <option value="IZIN">Izin Tidak Masuk (IZIN)</option>
            <option value="CUTI">Cuti Tahunan (CUTI)</option>
            <option value="SAKIT">Surat Sakit (SAKIT)</option>
            <option value="LAINNYA">Lainnya</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs text-purple-200 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">Menunggu Persetujuan</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-3xl bg-[#130F30]/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 animate-spin text-purple-400" />
            <span>Memuat data pengajuan izin/cuti...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-purple-300/60 text-xs space-y-2">
            <Coffee className="w-8 h-8 mx-auto text-purple-400/50" />
            <p>Belum ada permohonan istirahat/cuti yang tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-purple-200/70 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Jenis</th>
                  <th className="py-3.5 px-4">Periode Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Durasi</th>
                  <th className="py-3.5 px-4">Alasan &amp; Bukti</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  {canApprove && <th className="py-3.5 px-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{r.employee_name || "Karyawan"}</div>
                      <div className="text-[10px] text-purple-300/60 font-mono">{r.division || "RESTO"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {r.request_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-purple-200">
                      {r.start_date} s/d {r.end_date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/5 text-purple-300 border border-white/10">
                        {r.total_days} Hari
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-white font-medium">{r.reason}</div>
                      {r.attachment_url && (
                        <a
                          href={r.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Lampiran Dokumen</span>
                        </a>
                      )}
                      {r.rejection_reason && (
                        <div className="text-[10px] text-red-300 mt-1 italic">
                          Alasan Ditolak: {r.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                        r.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : r.status === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-purple-300/70 font-mono">
                      {r.reviewer_name || "-"}
                    </td>
                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {r.status === "SUBMITTED" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setReviewItem(r);
                                setRejectionReason("");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 font-bold text-[11px] cursor-pointer"
                            >
                              Review
                            </button>
                          </div>
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
                <Coffee className="w-5 h-5 text-purple-400" />
                <span>Form Pengajuan Istirahat &amp; Cuti</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              {!isStaff && (
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Karyawan</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
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

              <div>
                <label className="block text-purple-300 font-bold mb-1">Tipe Pengajuan</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as LeaveRequestType)}
                  className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ISTIRAHAT">Istirahat / Off Day (ISTIRAHAT)</option>
                  <option value="IZIN">Izin Keperluan Mendesak (IZIN)</option>
                  <option value="CUTI">Cuti Tahunan (CUTI)</option>
                  <option value="SAKIT">Izin Sakit / Surat Dokter (SAKIT)</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Tgl Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e.target.value, endDate)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Tgl Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(startDate, e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Total Hari</label>
                  <input
                    type="number"
                    value={totalDays}
                    onChange={(e) => setTotalDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Alasan Pengajuan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan keperluan istirahat / cuti..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Link Dokumen Pendukung (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "Submit Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#130F30] border border-purple-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Review Pengajuan Cuti / Izin</span>
              </h2>
              <button
                onClick={() => setReviewItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">{reviewItem.employee_name}</div>
              <div className="text-purple-300">
                Jenis: <strong className="text-purple-300 font-bold">{reviewItem.request_type}</strong>
              </div>
              <div className="text-purple-300">
                Periode: <strong className="text-white">{reviewItem.start_date}</strong> s/d <strong className="text-white">{reviewItem.end_date}</strong> ({reviewItem.total_days} Hari)
              </div>
              <div className="pt-1 border-t border-white/10 text-purple-200/90">
                <strong>Alasan:</strong> {reviewItem.reason}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-purple-300 font-bold">Catatan Penolakan (Wajib jika Ditolak)</label>
              <textarea
                rows={2}
                placeholder="Alasan jika menolak..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0D0926] border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleReview("REJECTED")}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-bold cursor-pointer disabled:opacity-50"
              >
                Tolak Pengajuan
              </button>
              <button
                type="button"
                onClick={() => handleReview("APPROVED")}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                Setujui (Approve)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
