/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ChecklistAssignment } from "../../types";
import { ChecklistService } from "../../services/checklistService";
import { ChecklistExecutionView } from "./ChecklistExecutionView";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Filter,
} from "lucide-react";

interface MyChecklistViewProps {
  user: User;
}

export const MyChecklistView: React.FC<MyChecklistViewProps> = ({ user }) => {
  const [assignments, setAssignments] = useState<ChecklistAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected assignment for execution
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const loadMyAssignments = async () => {
    setLoading(true);
    setErrorMessage(null);

    const res = await ChecklistService.getMyAssignments(
      selectedDate || undefined,
      statusFilter !== "ALL" ? statusFilter : undefined
    );

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setAssignments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMyAssignments();
  }, [selectedDate, statusFilter]);

  if (activeAssignmentId) {
    return (
      <ChecklistExecutionView
        user={user}
        assignmentId={activeAssignmentId}
        onBack={() => {
          setActiveAssignmentId(null);
          loadMyAssignments();
        }}
        onSubmitted={() => {
          loadMyAssignments();
        }}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-medium">Belum Dikerjakan</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-950/80 border border-amber-800 text-amber-300 font-medium">Sedang Dikerjakan</span>;
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-medium">Menunggu Verifikasi</span>;
      case "VERIFIED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium">Terverifikasi</span>;
      case "REVISION_REQUIRED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-950/80 border border-rose-800 text-rose-300 font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Perlu Revisi</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-950 text-rose-400 font-medium">Ditolak</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div id="my-checklist-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm tracking-wide uppercase">
            <CheckSquare className="w-4 h-4" /> Daily Duty Execution
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-100">Checklist Tugas Saya</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Selesaikan tugas operasional shift Anda sesuai standar SOP, lengkapi bukti foto, dan serahkan untuk verifikasi supervisor.
          </p>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Date Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ASSIGNED">Belum Dikerjakan</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
            <option value="SUBMITTED">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="REVISION_REQUIRED">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* List of Assigned Checklists */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat checklist tugas...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="font-medium text-slate-300">Tidak ada checklist tugas untuk tanggal ini</p>
          <p className="text-xs text-slate-500 mt-1">
            Anda belum memiliki penugasan checklist shift hari ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => setActiveAssignmentId(a.id)}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-xl p-5 cursor-pointer transition-all shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      {a.division}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                      Shift: {a.shift_type}
                    </span>
                  </div>
                  {getStatusBadge(a.status)}
                </div>

                <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-300 transition-colors">
                  {a.template?.title || "Checklist Operasional"}
                </h3>

                {a.template?.document_title && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Referensi SOP:{" "}
                    <span className="text-slate-300">{a.template.document_title}</span>
                  </p>
                )}

                {a.status === "REVISION_REQUIRED" && a.verification_notes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
                    <strong>Catatan Revisi:</strong> {a.verification_notes}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Progress Selesai</span>
                    <span className="font-mono font-medium text-slate-200">
                      {a.completion_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
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
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Skor: <strong className="text-emerald-400 font-mono">{a.score}%</strong>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Buka Lembar Kerja <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
