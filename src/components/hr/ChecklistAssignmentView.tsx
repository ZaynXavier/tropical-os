/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  ChecklistAssignment,
  ChecklistTemplate,
  ChecklistShiftType,
} from "../../types";
import { ChecklistService } from "../../services/checklistService";
import { EmployeeService, EmployeeData } from "../../services/employeeService";
import {
  Calendar,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  UserCheck,
  RotateCcw,
  CheckSquare,
  X,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";

interface ChecklistAssignmentViewProps {
  user: User;
  onSelectAssignment?: (assignmentId: string) => void;
}

export const ChecklistAssignmentView: React.FC<ChecklistAssignmentViewProps> = ({
  user,
  onSelectAssignment,
}) => {
  const [assignments, setAssignments] = useState<ChecklistAssignment[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState(
    user.role === "SUPERVISOR" ? user.division || "ALL" : "ALL"
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"single" | "bulk">("single");

  // Single Assign Form
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("");
  const [shiftType, setShiftType] = useState<ChecklistShiftType>("OPENING");

  // Bulk Assign Form
  const [bulkDivision, setBulkDivision] = useState(user.division || "KITCHEN");
  const [bulkRole, setBulkRole] = useState("ALL");

  const [submitting, setSubmitting] = useState(false);

  const canManage = user.role === "MANAGER" || user.role === "SUPERVISOR";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const divParam = divisionFilter !== "ALL" ? divisionFilter : undefined;
    const [assignRes, tmplRes, empRes] = await Promise.all([
      ChecklistService.getChecklistAssignments({
        division: divParam,
        date: selectedDate || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      }),
      ChecklistService.getChecklistTemplates(divParam),
      EmployeeService.getAllEmployees(),
    ]);

    if (assignRes.error) {
      setErrorMessage(assignRes.error);
    } else {
      setAssignments(assignRes.data || []);
    }

    if (!tmplRes.error && tmplRes.data) {
      setTemplates(tmplRes.data.filter((t) => t.is_active));
      if (tmplRes.data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(tmplRes.data[0].id);
      }
    }

    if (!empRes.error && empRes.data) {
      setEmployees(empRes.data.filter((e) => e.status === "ACTIVE"));
      if (empRes.data.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empRes.data[0].id);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [divisionFilter, statusFilter, selectedDate]);

  const handleOpenAssignModal = (mode: "single" | "bulk") => {
    setAssignMode(mode);
    setAssignDate(new Date().toISOString().split("T")[0]);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      setErrorMessage("Silakan pilih template checklist");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const dueAtIso = dueTime ? `${assignDate}T${dueTime}:00` : null;

    if (assignMode === "single") {
      if (!selectedEmployeeId) {
        setErrorMessage("Silakan pilih karyawan penerima penugasan");
        setSubmitting(false);
        return;
      }

      const res = await ChecklistService.assignChecklist({
        template_id: selectedTemplateId,
        employee_id: selectedEmployeeId,
        assignment_date: assignDate,
        due_at: dueAtIso,
        shift_type: shiftType,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Checklist berhasil ditugaskan ke karyawan");
        setIsAssignModalOpen(false);
        loadData();
      }
    } else {
      // Bulk Mode
      const res = await ChecklistService.bulkAssignChecklist({
        template_id: selectedTemplateId,
        division: bulkDivision,
        role_target: bulkRole !== "ALL" ? bulkRole : undefined,
        assignment_date: assignDate,
        due_at: dueAtIso,
        shift_type: shiftType,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        const count = (res.data as any)?.assigned_count ?? (Array.isArray(res.data) ? res.data.length : 1);
        setSuccessMessage(`Berhasil menugaskan checklist ke ${count} staf secara serentak`);
        setIsAssignModalOpen(false);
        loadData();
      }
    }
    setSubmitting(false);
  };

  // Filtered Assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      (a.employee_name && a.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.employee_emp_id && a.employee_emp_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.template?.title && a.template.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-medium">Ditugaskan</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-950/80 border border-amber-800 text-amber-300 font-medium">Sedang Dikerjakan</span>;
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-medium">Menunggu Verifikasi</span>;
      case "VERIFIED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium">Terverifikasi</span>;
      case "REVISION_REQUIRED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">Perlu Revisi</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-950 text-rose-400 font-medium">Ditolak</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div id="checklist-assignment-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm tracking-wide uppercase">
            <Calendar className="w-4 h-4" /> Shift Operations & Task Delegation
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-100">Checklist Assignment Management</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Distribusikan checklist tugas harian kepada staf divisi secara individu maupun massal (bulk dispatch) sesuai jadwal shift.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-bulk-assign"
              onClick={() => handleOpenAssignModal("bulk")}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3.5 py-2.5 rounded-lg text-sm transition-all"
            >
              <Users className="w-4 h-4 text-cyan-400" /> Penugasan Massal (Bulk)
            </button>
            <button
              id="btn-single-assign"
              onClick={() => handleOpenAssignModal("single")}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tugaskan Individu
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Date Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-assignments"
              type="text"
              placeholder="Cari nama staf, NIK, atau checklist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            />

            {user.role === "MANAGER" && (
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Divisi</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BARISTA">Barista</option>
                <option value="SERVICE">Service</option>
                <option value="CASHIER">Cashier</option>
                <option value="CLEANING">Cleaning</option>
                <option value="MANAGEMENT">Management</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ASSIGNED">Ditugaskan</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SUBMITTED">Menunggu Verifikasi</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="REVISION_REQUIRED">Perlu Revisi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat daftar penugasan checklist...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <CheckSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="font-medium text-slate-300">Tidak ada penugasan checklist pada filter ini</p>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan tombol "Tugaskan Individu" atau "Penugasan Massal" untuk mendelegasikan checklist hari ini.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Karyawan</th>
                  <th className="px-5 py-3.5">Template Checklist</th>
                  <th className="px-4 py-3.5">Shift & Tanggal</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Skor Kepatuhan</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Employee */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-100 text-sm">{a.employee_name || "Tanpa Nama"}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {a.employee_emp_id} • {a.division}
                      </div>
                    </td>

                    {/* Template */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">{a.template?.title || "Checklist Task"}</div>
                      {a.template?.document_title && (
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <CheckSquare className="w-3 h-3 text-emerald-400" />
                          SOP: {a.template.document_title}
                        </div>
                      )}
                    </td>

                    {/* Shift & Date */}
                    <td className="px-4 py-4">
                      <div className="text-slate-200 font-medium">{a.assignment_date}</div>
                      <div className="text-slate-500 text-[11px]">
                        Shift: <span className="text-slate-300">{a.shift_type}</span>
                        {a.due_at && (
                          <span className="text-amber-400 ml-1.5">
                            (Batas: {new Date(a.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all ${
                              a.completion_percentage >= 100
                                ? "bg-emerald-500"
                                : a.completion_percentage >= 50
                                ? "bg-amber-500"
                                : "bg-cyan-500"
                            }`}
                            style={{ width: `${a.completion_percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium text-slate-300 text-[11px]">
                          {a.completion_percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                        <span
                          className={
                            a.score >= 80
                              ? "text-emerald-400"
                              : a.score >= 60
                              ? "text-amber-400"
                              : "text-slate-400"
                          }
                        >
                          {a.score}
                        </span>
                        <span className="text-slate-500 font-normal text-xs">/ 100</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">{getStatusBadge(a.status)}</td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">
                      {onSelectAssignment && (
                        <button
                          onClick={() => onSelectAssignment(a.id)}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium text-xs px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/40 transition-colors"
                        >
                          Periksa Detail <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL (SINGLE / BULK) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-lg">
                  {assignMode === "single" ? "Tugaskan Checklist ke Karyawan" : "Penugasan Checklist Massal (Bulk)"}
                </h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-sm text-slate-300">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Pilih Template Checklist <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="">-- Pilih Template Checklist Aktif --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.division}] {t.title} ({t.shift_type})
                    </option>
                  ))}
                </select>
              </div>

              {assignMode === "single" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Karyawan Penerima Tugas <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.emp_id}) - {emp.division} [{emp.role}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Divisi</label>
                    <select
                      value={bulkDivision}
                      onChange={(e) => setBulkDivision(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                    >
                      <option value="KITCHEN">Kitchen</option>
                      <option value="BARISTA">Barista</option>
                      <option value="SERVICE">Service</option>
                      <option value="CASHIER">Cashier</option>
                      <option value="CLEANING">Cleaning</option>
                      <option value="MANAGEMENT">Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Role</label>
                    <select
                      value={bulkRole}
                      onChange={(e) => setBulkRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                    >
                      <option value="ALL">Semua Role Staf</option>
                      <option value="STAFF">Hanya Staff</option>
                      <option value="SUPERVISOR">Supervisor</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Tugas</label>
                  <input
                    type="date"
                    required
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Shift</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as ChecklistShiftType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Shift</option>
                    <option value="OPENING">Opening</option>
                    <option value="MIDDLE">Middle</option>
                    <option value="CLOSING">Closing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Batas Waktu (Due)</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2"
                >
                  {submitting && <Clock className="w-3.5 h-3.5 animate-spin" />}
                  {assignMode === "single" ? "Kirim Penugasan" : "Tugaskan Massal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
