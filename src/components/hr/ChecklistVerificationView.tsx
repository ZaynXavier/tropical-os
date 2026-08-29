/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  ChecklistAssignment,
  ChecklistExecution,
  ChecklistEvidence,
} from "../../types";
import { ChecklistService } from "../../services/checklistService";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Eye,
  CheckSquare,
  X,
  FileText,
  RotateCcw,
  Camera,
  Calendar,
} from "lucide-react";

interface ChecklistVerificationViewProps {
  user: User;
}

export const ChecklistVerificationView: React.FC<ChecklistVerificationViewProps> = ({ user }) => {
  const [assignments, setAssignments] = useState<ChecklistAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState(
    user.role === "SUPERVISOR" ? user.division || "ALL" : "ALL"
  );
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [selectedDate, setSelectedDate] = useState("");

  // Inspection Modal
  const [inspectedAssignmentId, setInspectedAssignmentId] = useState<string | null>(null);
  const [inspectedAssignment, setInspectedAssignment] = useState<ChecklistAssignment | null>(null);
  const [inspectedExecutions, setInspectedExecutions] = useState<ChecklistExecution[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Verification Form State
  const [supervisorNotes, setSupervisorNotes] = useState("");
  const [rejectedItemIds, setRejectedItemIds] = useState<Record<string, string>>({}); // execId -> reason
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const loadVerificationQueue = async () => {
    setLoading(true);
    setErrorMessage(null);

    const divParam = divisionFilter !== "ALL" ? divisionFilter : undefined;
    const res = await ChecklistService.getPendingVerifications(divParam);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setAssignments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVerificationQueue();
  }, [divisionFilter]);

  const handleOpenInspection = async (assignmentId: string) => {
    setInspectedAssignmentId(assignmentId);
    setModalLoading(true);
    setSupervisorNotes("");
    setRejectedItemIds({});

    const res = await ChecklistService.getChecklistExecution(assignmentId);
    if (res.error || !res.data) {
      setErrorMessage(res.error || "Gagal memuat rincian checklist");
      setInspectedAssignmentId(null);
    } else {
      setInspectedAssignment(res.data.assignment);
      setInspectedExecutions(res.data.executions);
    }
    setModalLoading(false);
  };

  const handleVerify = async () => {
    if (!inspectedAssignmentId) return;

    setProcessingAction(true);
    setErrorMessage(null);

    const res = await ChecklistService.verifyChecklist(
      inspectedAssignmentId,
      supervisorNotes.trim() || "Disetujui oleh Supervisor"
    );

    setProcessingAction(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Checklist berhasil diverifikasi dan disetujui");
      setInspectedAssignmentId(null);
      loadVerificationQueue();
    }
  };

  const handleRequestRevision = async () => {
    if (!inspectedAssignmentId) return;

    if (!supervisorNotes.trim()) {
      setErrorMessage("Wajib memberikan catatan supervisi saat meminta revisi");
      return;
    }

    setProcessingAction(true);
    setErrorMessage(null);

    const rejectIds = Object.keys(rejectedItemIds);

    const res = await ChecklistService.requestChecklistRevision(
      inspectedAssignmentId,
      supervisorNotes.trim(),
      rejectIds.length > 0 ? rejectIds : undefined
    );

    setProcessingAction(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Permintaan revisi telah dikirimkan kembali ke staf");
      setInspectedAssignmentId(null);
      loadVerificationQueue();
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      (a.employee_name && a.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.employee_emp_id && a.employee_emp_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.template?.title && a.template.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDate = !selectedDate || a.assignment_date === selectedDate;
    return matchesSearch && matchesDate;
  });

  return (
    <div id="checklist-verification-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" /> Operational Quality Assurance
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-100">Antrean Verifikasi Checklist</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspeksi tugas yang telah diselesaikan staf, periksa bukti foto kepatuhan SOP, lalu setujui atau minta perbaikan revisi.
          </p>
        </div>
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

      {/* Filters */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama staf atau checklist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />

            {user.role === "MANAGER" && (
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
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
          </div>
        </div>
      </div>

      {/* Queue Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat antrean verifikasi...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-medium text-slate-200">Semua checklist telah diverifikasi</p>
          <p className="text-xs text-slate-500 mt-1">
            Tidak ada tugas yang menunggu verifikasi supervisor saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((a) => (
            <div
              key={a.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-700/60 rounded-xl p-5 flex flex-col justify-between transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                      {a.division}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                      {a.shift_type}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 border border-amber-800 text-amber-300">
                    Menunggu Verifikasi
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-base line-clamp-1">
                  {a.template?.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Diserahkan oleh: <strong className="text-slate-200">{a.employee_name}</strong> (
                  {a.employee_emp_id})
                </p>

                {a.submitted_at && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Diserahkan:{" "}
                    {new Date(a.submitted_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {a.assignment_date}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Progress:</span>
                    <p className="font-medium text-slate-200">{a.completion_percentage}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Skor Kepatuhan:</span>
                    <p className="font-bold font-mono text-emerald-400">{a.score}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenInspection(a.id)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
                >
                  <Eye className="w-4 h-4" /> Inspeksi & Verifikasi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectedAssignmentId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-base">
                    Inspeksi & Verifikasi Kualitas Operasional
                  </h3>
                  <p className="text-xs text-slate-400">
                    {inspectedAssignment?.template?.title} • {inspectedAssignment?.employee_name} (
                    {inspectedAssignment?.employee_emp_id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedAssignmentId(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
              {modalLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  <p className="text-xs">Memuat data rincian tugas...</p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Header */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Divisi & Shift
                      </span>
                      <p className="font-medium text-slate-200 mt-0.5">
                        {inspectedAssignment?.division} ({inspectedAssignment?.shift_type})
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Penyelesaian
                      </span>
                      <p className="font-medium text-slate-200 mt-0.5">
                        {inspectedExecutions.filter((e) => e.status === "COMPLETED").length} /{" "}
                        {inspectedExecutions.length} Item ({inspectedAssignment?.completion_percentage}%)
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Skor Kepatuhan
                      </span>
                      <p className="font-bold font-mono text-emerald-400 mt-0.5 text-base">
                        {inspectedAssignment?.score}%
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Standar Lulus
                      </span>
                      <p className="font-medium text-slate-300 mt-0.5">
                        {inspectedAssignment?.template?.passing_score || 80}%
                      </p>
                    </div>
                  </div>

                  {/* Task Execution Items Inspection */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                      Item Checklist & Bukti Karyawan
                    </h4>

                    {inspectedExecutions.map((exec, idx) => {
                      const isRejected = !!rejectedItemIds[exec.id];

                      return (
                        <div
                          key={exec.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isRejected
                              ? "bg-rose-950/30 border-rose-800"
                              : exec.status === "COMPLETED"
                              ? "bg-slate-950/80 border-slate-800"
                              : "bg-slate-950/40 border-slate-800/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-500">#{idx + 1}</span>
                                <span className="font-medium text-slate-100 text-sm">
                                  {exec.item?.task_name}
                                </span>
                                {exec.item?.is_required && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                                    WAJIB
                                  </span>
                                )}
                              </div>

                              {exec.item?.instructions && (
                                <p className="text-xs text-slate-400">{exec.item.instructions}</p>
                              )}

                              {exec.notes && (
                                <div className="mt-2 text-xs bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
                                  <strong className="text-slate-400">Catatan Staf:</strong> {exec.notes}
                                </div>
                              )}

                              {/* Uploaded Evidence */}
                              {exec.evidence && exec.evidence.length > 0 && (
                                <div className="flex items-center gap-2 pt-2">
                                  <span className="text-[11px] text-slate-500">Bukti:</span>
                                  {exec.evidence.map((ev) => (
                                    <button
                                      key={ev.id}
                                      type="button"
                                      onClick={() => setPreviewEvidenceUrl(ev.file_url || null)}
                                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded"
                                    >
                                      <Camera className="w-3 h-3" /> {ev.file_name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Revision selector */}
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isRejected) {
                                    const next = { ...rejectedItemIds };
                                    delete next[exec.id];
                                    setRejectedItemIds(next);
                                  } else {
                                    setRejectedItemIds({
                                      ...rejectedItemIds,
                                      [exec.id]: "Perlu perbaikan",
                                    });
                                  }
                                }}
                                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                  isRejected
                                    ? "bg-rose-900/60 border-rose-700 text-rose-200"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {isRejected ? "Tandai Tolak/Revisi" : "Tolak Item Ini"}
                              </button>
                            </div>
                          </div>

                          {/* If marked for revision, specify reason */}
                          {isRejected && (
                            <div className="mt-3 pt-2 border-t border-rose-900/40">
                              <input
                                type="text"
                                placeholder="Alasan penolakan / standar yang belum terpenuhi..."
                                value={rejectedItemIds[exec.id] || ""}
                                onChange={(e) =>
                                  setRejectedItemIds({
                                    ...rejectedItemIds,
                                    [exec.id]: e.target.value,
                                  })
                                }
                                className="w-full bg-slate-900 border border-rose-800/80 rounded px-2.5 py-1 text-xs text-rose-200 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Supervisor Verification Notes */}
                  <div className="pt-4 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Catatan Evaluasi Supervisor / Bukti Verifikasi
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Masukkan catatan penilaian, instruksi perbaikan, atau feedback operasional..."
                      value={supervisorNotes}
                      onChange={(e) => setSupervisorNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <button
                type="button"
                onClick={() => setInspectedAssignmentId(null)}
                className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Batal
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  disabled={processingAction || modalLoading}
                  className="px-4 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Minta Revisi Staf
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={processingAction || modalLoading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {processingAction ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Setujui & Verifikasi Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Viewer */}
      {previewEvidenceUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setPreviewEvidenceUrl(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Bukti Operasional Staf</h4>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-lg p-2">
              <img
                src={previewEvidenceUrl}
                alt="Evidence"
                className="max-h-full max-w-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
