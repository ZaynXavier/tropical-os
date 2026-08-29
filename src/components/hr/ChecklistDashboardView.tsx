/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ChecklistDashboardMetrics } from "../../types";
import { ChecklistService } from "../../services/checklistService";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Users,
  ShieldCheck,
  RotateCcw,
  Calendar,
  Filter,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface ChecklistDashboardViewProps {
  user: User;
}

export const ChecklistDashboardView: React.FC<ChecklistDashboardViewProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<ChecklistDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [divisionFilter, setDivisionFilter] = useState(
    user.role === "SUPERVISOR" ? user.division || "ALL" : "ALL"
  );
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const loadMetrics = async () => {
    setLoading(true);
    setErrorMessage(null);

    const divParam = divisionFilter !== "ALL" ? divisionFilter : undefined;
    const res = await ChecklistService.getChecklistDashboardMetrics(divParam);

    if (res.error || !res.data) {
      setErrorMessage(res.error || "Gagal memuat metrik kepatuhan operasional");
    } else {
      setMetrics(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, [divisionFilter, startDate, endDate]);

  const getGradeBadge = (score: number) => {
    if (score >= 90) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
          Sangat Baik (A)
        </span>
      );
    } else if (score >= 80) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
          Baik (B)
        </span>
      );
    } else if (score >= 70) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
          Cukup (C)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
          Perlu Evaluasi (D)
        </span>
      );
    }
  };

  return (
    <div id="checklist-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm tracking-wide uppercase">
            <BarChart3 className="w-4 h-4" /> Operational Compliance Intelligence
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-100">Checklist & SOP Compliance Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Pantau tingkat kedisiplinan eksekusi checklist seluruh outlet, kepatuhan SOP divisi, dan integrasi bobot penilaian kinerja KPI operasional.
          </p>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Date & Division Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {user.role === "MANAGER" && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Divisi</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BARISTA">Barista</option>
                <option value="SERVICE">Service</option>
                <option value="CASHIER">Cashier</option>
                <option value="CLEANING">Cleaning</option>
                <option value="MANAGEMENT">Management</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Mengkalkulasi analitik kepatuhan operasional...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Top 6 Status Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total Assigned */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Ditugaskan
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {metrics.total_assigned}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                In Progress
              </span>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {metrics.in_progress}
              </div>
            </div>

            {/* Submitted */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                Menunggu Verif
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                {metrics.submitted}
              </div>
            </div>

            {/* Verified */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Terverifikasi
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                {metrics.verified}
              </div>
            </div>

            {/* Revision */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                Perlu Revisi
              </span>
              <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                {metrics.revision_required}
              </div>
            </div>

            {/* Overdue */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                Terlambat
              </span>
              <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
                {metrics.overdue}
              </div>
            </div>
          </div>

          {/* Key Rates Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Tingkat Penyelesaian (Completion)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-slate-100">
                {metrics.completion_rate}%
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${metrics.completion_rate}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Rata-Rata Skor Kepatuhan</span>
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-cyan-300">
                {metrics.average_score}%
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full" style={{ width: `${metrics.average_score}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Tingkat Kelulusan (Pass Rate)</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-indigo-300">
                {metrics.pass_rate}%
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-indigo-500 h-full" style={{ width: `${metrics.pass_rate}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Tingkat Verifikasi Supervisor</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-purple-300">
                {metrics.verification_rate}%
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full" style={{ width: `${metrics.verification_rate}%` }} />
              </div>
            </div>
          </div>

          {/* Division Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base">Kepatuhan Operasional Per Divisi</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rincian penugasan, penyelesaian, verifikasi, dan predikat mutu per divisi operasional.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {(() => {
                const divisionList = metrics.division_breakdown || (metrics.by_division
                  ? Object.entries(metrics.by_division).map(([division, stats]: [string, any]) => ({
                      division,
                      total: stats.assigned || 0,
                      completed: stats.completed || 0,
                      verified: stats.completed || 0,
                      avg_score: stats.avg_score || 0,
                    }))
                  : []);

                return (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Divisi</th>
                        <th className="px-4 py-3.5">Total Penugasan</th>
                        <th className="px-4 py-3.5">Selesai</th>
                        <th className="px-4 py-3.5">Terverifikasi</th>
                        <th className="px-4 py-3.5">Rata-Rata Skor</th>
                        <th className="px-5 py-3.5 text-right">Predikat Mutu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {divisionList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                            Belum ada data eksekusi checklist pada rentang waktu ini
                          </td>
                        </tr>
                      ) : (
                        divisionList.map((div, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-100 text-sm">
                              {div.division}
                            </td>
                            <td className="px-4 py-4 font-mono">{div.total}</td>
                            <td className="px-4 py-4 font-mono text-cyan-300">{div.completed}</td>
                            <td className="px-4 py-4 font-mono text-emerald-400">{div.verified}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-slate-100">
                                  {div.avg_score}%
                                </span>
                                <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                  <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${Math.min(100, div.avg_score)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">{getGradeBadge(div.avg_score)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>

          {/* KPI Bridge Indicator (Phase 4.5 Integration) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-base">
                    Integrasi KPI & Penilaian Kinerja Karyawan (Phase 4.5 Bridge)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                    Live Link
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Skor kepatuhan checklist operasional yang telah diverifikasi oleh Supervisor dihitung secara otomatis dan menjadi sumber metrik utama (KPI Source Metric) dalam modul penilaian kinerja karyawan dan perhitungan insentif bulanan.
                </p>
                <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Formula Penilaian: Rata-Rata Terbobot Item Checklist</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Audit Trail Log Aktif</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Perhitungan Server-Side RPC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
