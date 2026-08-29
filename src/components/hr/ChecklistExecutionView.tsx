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
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  Trash2,
  Send,
  FileText,
  ShieldAlert,
  ArrowLeft,
  X,
  Eye,
  Info,
} from "lucide-react";

interface ChecklistExecutionViewProps {
  user: User;
  assignmentId: string;
  onBack: () => void;
  onSubmitted?: () => void;
}

export const ChecklistExecutionView: React.FC<ChecklistExecutionViewProps> = ({
  user,
  assignmentId,
  onBack,
  onSubmitted,
}) => {
  const [assignment, setAssignment] = useState<ChecklistAssignment | null>(null);
  const [executions, setExecutions] = useState<ChecklistExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active note editing / evidence uploading per item
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [submittingChecklist, setSubmittingChecklist] = useState(false);

  // Image preview modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadExecutionData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const res = await ChecklistService.getChecklistExecution(assignmentId);
    if (res.error || !res.data) {
      setErrorMessage(res.error || "Gagal memuat detail checklist");
    } else {
      setAssignment(res.data.assignment);
      setExecutions(res.data.executions);

      const notesMap: Record<string, string> = {};
      res.data.executions.forEach((e) => {
        notesMap[e.id] = e.notes || "";
      });
      setActiveNotes(notesMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExecutionData();
  }, [assignmentId]);

  const handleStartChecklist = async () => {
    if (!assignment) return;
    const res = await ChecklistService.startChecklist(assignment.id);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      loadExecutionData();
    }
  };

  const handleToggleComplete = async (exec: ChecklistExecution) => {
    if (!assignment || isReadOnly) return;

    // If currently not started, auto start
    if (assignment.status === "ASSIGNED") {
      await ChecklistService.startChecklist(assignment.id);
    }

    if (exec.status === "COMPLETED") {
      // Cannot uncomplete verified items directly, or we can toggle to pending
      return;
    }

    // Check evidence requirement
    if (exec.item?.requires_evidence && (!exec.evidence || exec.evidence.length === 0)) {
      setErrorMessage(
        `Tugas "${exec.item.task_name}" memerlukan bukti (foto/dokumen). Silakan unggah bukti terlebih dahulu.`
      );
      return;
    }

    const res = await ChecklistService.completeChecklistItem(
      exec.id,
      activeNotes[exec.id] || undefined
    );

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Tugas "${exec.item?.task_name}" selesai dikerjakan`);
      loadExecutionData();
    }
  };

  const handleSaveNotes = async (execId: string) => {
    const noteText = activeNotes[execId];
    if (noteText === undefined) return;
    await ChecklistService.updateChecklistItemNotes(execId, noteText);
  };

  const handleFileUpload = async (execId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemId(execId);
    setErrorMessage(null);

    const res = await ChecklistService.uploadChecklistEvidence(execId, file, activeNotes[execId] || undefined);
    setUploadingItemId(null);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Bukti berhasil diunggah");
      loadExecutionData();
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (isReadOnly) return;
    const res = await ChecklistService.deleteChecklistEvidence(evidenceId);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      loadExecutionData();
    }
  };

  const handleSubmitAll = async () => {
    if (!assignment) return;
    setSubmittingChecklist(true);
    setErrorMessage(null);

    const res = await ChecklistService.submitChecklist(assignment.id);
    setSubmittingChecklist(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Checklist berhasil diserahkan ke Supervisor untuk diverifikasi!");
      loadExecutionData();
      if (onSubmitted) onSubmitted();
    }
  };

  const isReadOnly =
    assignment?.status === "VERIFIED" ||
    assignment?.status === "SUBMITTED" ||
    assignment?.status === "CANCELLED";

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
        <Clock className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
        <p className="text-sm">Memuat lembar eksekusi checklist...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-slate-200 font-medium">Data checklist tidak ditemukan</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>
    );
  }

  const completedCount = executions.filter((e) => e.status === "COMPLETED").length;
  const requiredCount = executions.filter((e) => e.item?.is_required).length;
  const completedRequiredCount = executions.filter((e) => e.item?.is_required && e.status === "COMPLETED").length;

  return (
    <div id="checklist-execution-sheet" className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </button>

        <div className="flex items-center gap-2">
          {assignment.status === "ASSIGNED" && (
            <button
              onClick={handleStartChecklist}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Mulai Mengerjakan Checklist
            </button>
          )}

          {!isReadOnly && (
            <button
              onClick={handleSubmitAll}
              disabled={submittingChecklist}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {submittingChecklist ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Checklist ke Supervisor
            </button>
          )}
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

      {/* Revision Notice Banner */}
      {assignment.status === "REVISION_REQUIRED" && (
        <div className="p-5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <ShieldAlert className="w-5 h-5" /> Catatan Revisi dari Supervisor:
          </div>
          <p className="text-sm bg-slate-950/60 p-3 rounded-lg border border-rose-900/60 text-slate-200">
            {assignment.verification_notes || "Silakan perbaiki item yang belum sesuai standar SOP operasional."}
          </p>
        </div>
      )}

      {/* Verified Banner */}
      {assignment.status === "VERIFIED" && (
        <div className="p-5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="font-bold text-slate-100">Checklist Telah Diverifikasi & Disetujui</h4>
              <p className="text-xs text-emerald-300 mt-0.5">
                Diverifikasi oleh: {assignment.verifier_name || "Supervisor"} • Catatan: {assignment.verification_notes || "Disetujui"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Skor Kepatuhan Final:</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">{assignment.score}%</div>
          </div>
        </div>
      )}

      {/* Assignment Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                {assignment.division}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                Shift: {assignment.shift_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">{assignment.assignment_date}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">{assignment.template?.title}</h2>
            {assignment.template?.document_title && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Referensi SOP:{" "}
                <span className="text-slate-200 font-medium">{assignment.template.document_title}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
                Progress Pengerjaan
              </span>
              <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
                {completedCount} / {executions.length} <span className="text-xs text-slate-500 font-normal">Tugas</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
                Skor Kepatuhan
              </span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {assignment.score}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>
              Item Wajib Diselesaikan: <strong className="text-slate-200">{completedRequiredCount} / {requiredCount}</strong>
            </span>
            <span className="font-mono font-medium text-slate-300">{assignment.completion_percentage}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${assignment.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Execution Items List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-400" /> Rincian Tugas Operasional
        </h3>

        <div className="space-y-3">
          {executions.map((exec, idx) => {
            const isCompleted = exec.status === "COMPLETED";
            const isRevision = exec.status === "REVISION_REQUIRED";

            return (
              <div
                key={exec.id}
                id={`task-item-${exec.id}`}
                className={`p-5 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-slate-900/80 border-emerald-900/60"
                    : isRevision
                    ? "bg-rose-950/30 border-rose-800"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => handleToggleComplete(exec)}
                      className={`mt-0.5 p-1 rounded-lg transition-colors ${
                        isCompleted
                          ? "text-emerald-400 bg-emerald-950 border border-emerald-800"
                          : "text-slate-500 hover:text-slate-300 bg-slate-950 border border-slate-800"
                      }`}
                    >
                      {isCompleted ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                        <h4
                          className={`font-semibold text-sm ${
                            isCompleted ? "text-slate-100 line-through opacity-80" : "text-slate-100"
                          }`}
                        >
                          {exec.item?.task_name}
                        </h4>

                        {exec.item?.is_required && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 border border-rose-800 text-rose-400 uppercase">
                            Wajib
                          </span>
                        )}

                        {exec.item?.requires_evidence && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Wajib Bukti ({exec.item.evidence_type})
                          </span>
                        )}

                        {exec.item?.area && (
                          <span className="text-xs text-slate-500">Area: {exec.item.area}</span>
                        )}
                      </div>

                      {exec.item?.instructions && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                          {exec.item.instructions}
                        </p>
                      )}

                      {/* Notes & Evidence Section */}
                      <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-3">
                        {/* Note Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            disabled={isReadOnly}
                            placeholder="Tambahkan catatan hasil pengecekan / kondisi..."
                            value={activeNotes[exec.id] || ""}
                            onChange={(e) =>
                              setActiveNotes({ ...activeNotes, [exec.id]: e.target.value })
                            }
                            onBlur={() => handleSaveNotes(exec.id)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                          />
                        </div>

                        {/* Uploaded Evidence Gallery */}
                        {exec.evidence && exec.evidence.length > 0 && (
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            {exec.evidence.map((ev) => (
                              <div
                                key={ev.id}
                                className="relative group bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-2 text-xs"
                              >
                                {ev.file_url ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewUrl(ev.file_url!)}
                                    className="flex items-center gap-1.5 text-cyan-400 hover:underline"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> {ev.file_name}
                                  </button>
                                ) : (
                                  <span className="text-slate-300">{ev.file_name}</span>
                                )}

                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvidence(ev.id)}
                                    className="text-slate-500 hover:text-rose-400 p-0.5 ml-1 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Action */}
                        {!isReadOnly && (
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors">
                              {uploadingItemId === exec.id ? (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              Unggah Bukti Foto / Dokumen
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(exec.id, e)}
                                disabled={uploadingItemId === exec.id}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-slate-500">Maksimal 10 MB (JPG, PNG, PDF)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-right">
                    {isCompleted ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                        Selesai
                      </span>
                    ) : isRevision ? (
                      <span className="text-xs font-semibold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
                        Revisi
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-4 relative shadow-2xl">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Pratinjau Bukti Checklist</h4>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-lg p-2">
              <img
                src={previewUrl}
                alt="Evidence Preview"
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
