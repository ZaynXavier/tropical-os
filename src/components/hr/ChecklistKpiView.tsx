/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  KpiTemplate,
  EmployeeKpiAssignment,
  ChecklistTemplate,
  KpiAssignmentStatus,
} from "../../types";
import { KpiService } from "../../services/kpiService";
import { EmployeeService, EmployeeData } from "../../services/employeeService";
import { ChecklistDashboardView } from "./ChecklistDashboardView";
import { MyChecklistView } from "./MyChecklistView";
import { ChecklistAssignmentView } from "./ChecklistAssignmentView";
import { ChecklistVerificationView } from "./ChecklistVerificationView";
import { ChecklistTemplateManagementView } from "./ChecklistTemplateManagementView";
import { KpiAssignmentWorkflowView } from "./KpiAssignmentWorkflowView";
import { KpiPerformanceDashboardView } from "./KpiPerformanceDashboardView";
import {
  CheckSquare,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  UserCheck,
  Star,
  X,
  Target,
  BarChart3,
  ShieldCheck,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface ChecklistKpiViewProps {
  user: User;
  initialTab?: "checklist_dashboard" | "my_checklist" | "checklist_assignments" | "checklist_verification" | "checklist_templates" | "kpi_eval" | "kpi_templates" | "kpi_analytics";
}

export const ChecklistKpiView: React.FC<ChecklistKpiViewProps> = ({
  user,
  initialTab = user.role === "STAFF" ? "kpi_analytics" : "checklist_dashboard",
}) => {
  const [activeTab, setActiveTab] = useState<
    | "checklist_dashboard"
    | "my_checklist"
    | "checklist_assignments"
    | "checklist_verification"
    | "checklist_templates"
    | "kpi_eval"
    | "kpi_templates"
    | "kpi_analytics"
  >(initialTab);

  const [kpiTemplates, setKpiTemplates] = useState<KpiTemplate[]>([]);
  const [kpiAssignments, setKpiAssignments] = useState<EmployeeKpiAssignment[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");

  // Create KPI Template Modal
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [kpiTitle, setKpiTitle] = useState("");
  const [kpiDivision, setKpiDivision] = useState("KITCHEN");
  const [kpiPosition, setKpiPosition] = useState("Cook / Helper");
  const [kpiPeriodType, setKpiPeriodType] = useState("MONTHLY");
  const [indicators, setIndicators] = useState<
    { indicator_name: string; target_description: string; weight: number; max_score: number }[]
  >([
    { indicator_name: "Kecepatan Order & Sajian", target_description: "Order tersaji < 15 menit", weight: 30, max_score: 100 },
    { indicator_name: "Kepatuhan SOP Hygiene", target_description: "Nilai kebersihan area 100%", weight: 30, max_score: 100 },
    { indicator_name: "Disiplin & Absensi", target_description: "Nol keterlambatan", weight: 40, max_score: 100 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const canManage = user.role === "MANAGER" || user.role === "SUPERVISOR";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const [kpiRes, assignRes, empRes] = await Promise.all([
      KpiService.getKpiTemplates(divisionFilter !== "ALL" ? divisionFilter : undefined),
      KpiService.getKpiAssignments(),
      EmployeeService.getAllEmployees(),
    ]);

    if (kpiRes.error) setErrorMessage(kpiRes.error);
    setKpiTemplates(kpiRes.data || []);
    setKpiAssignments(assignRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [divisionFilter, user]);

  const handleCreateKpiTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiTitle || indicators.length === 0) {
      setErrorMessage("Mohon lengkapi judul KPI dan minimal satu indikator.");
      return;
    }

    setSubmitting(true);
    const res = await KpiService.createKpiTemplate({
      title: kpiTitle,
      division: kpiDivision,
      position: kpiPosition,
      period_type: kpiPeriodType,
      indicators,
    });

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Template KPI berhasil dibuat.");
      setIsKpiModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl shadow-inner">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                Phase 4.4 • Operational Quality Assurance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Checklist Operasional &amp; Evaluasi KPI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
              Checklist Operasional &amp; Kepatuhan SOP
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Standardisasi checklist harian divisi resto, kepatuhan dokumen SOP/IKA, eksekusi staf dengan bukti foto, serta integrasi penilaian KPI kinerja.
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsKpiModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Buat Template KPI</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("checklist_dashboard")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "checklist_dashboard"
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Dashboard Kepatuhan</span>
        </button>

        <button
          onClick={() => setActiveTab("my_checklist")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "my_checklist"
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Checklist Tugas Saya</span>
        </button>

        {canManage && (
          <>
            <button
              onClick={() => setActiveTab("checklist_assignments")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "checklist_assignments"
                  ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Penugasan Checklist</span>
            </button>

            <button
              onClick={() => setActiveTab("checklist_verification")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "checklist_verification"
                  ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Antrean Verifikasi</span>
            </button>

            <button
              onClick={() => setActiveTab("checklist_templates")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "checklist_templates"
                  ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Master Template Checklist</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("kpi_eval")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "kpi_eval"
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Penilaian KPI Karyawan</span>
        </button>

        <button
          onClick={() => setActiveTab("kpi_analytics")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "kpi_analytics"
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Analitik Performa KPI</span>
        </button>

        {canManage && (
          <button
            onClick={() => setActiveTab("kpi_templates")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "kpi_templates"
                ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <Target className="w-4 h-4 text-purple-400" />
            <span>Master Template KPI</span>
          </button>
        )}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "checklist_dashboard" && <ChecklistDashboardView user={user} />}
      {activeTab === "my_checklist" && <MyChecklistView user={user} />}
      {activeTab === "checklist_assignments" && <ChecklistAssignmentView user={user} />}
      {activeTab === "checklist_verification" && <ChecklistVerificationView user={user} />}
      {activeTab === "checklist_templates" && <ChecklistTemplateManagementView user={user} />}

      {/* KPI EVALUATION */}
      {activeTab === "kpi_eval" && <KpiAssignmentWorkflowView user={user} />}

      {/* KPI PERFORMANCE & DEPARTMENT ANALYTICS DASHBOARD */}
      {activeTab === "kpi_analytics" && <KpiPerformanceDashboardView user={user} />}

      {/* KPI MASTER TEMPLATES */}
      {activeTab === "kpi_templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiTemplates.map((t) => (
            <div key={t.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {t.division} • {t.period_type}
                </span>
                <span className="text-xs text-slate-500 font-mono">{t.position}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{t.title}</h3>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Indikator Penilaian:
                </span>
                {(t.indicators || []).map((ind, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-300">
                    <span>• {ind.indicator_name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{ind.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE KPI TEMPLATE */}
      {isKpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">Buat Master Template KPI</h3>
              <button onClick={() => setIsKpiModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateKpiTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Judul KPI</label>
                  <input
                    type="text"
                    required
                    value={kpiTitle}
                    onChange={(e) => setKpiTitle(e.target.value)}
                    placeholder="Contoh: KPI Standar Cook Kitchen Canggu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Divisi</label>
                  <select
                    value={kpiDivision}
                    onChange={(e) => setKpiDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BARISTA">Barista</option>
                    <option value="SERVICE">Service</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Posisi</label>
                  <input
                    type="text"
                    required
                    value={kpiPosition}
                    onChange={(e) => setKpiPosition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Indikator Penilaian &amp; Bobot</span>
                  <button
                    type="button"
                    onClick={() =>
                      setIndicators([
                        ...indicators,
                        { indicator_name: "", target_description: "", weight: 20, max_score: 100 },
                      ])
                    }
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    + Tambah Indikator
                  </button>
                </div>
                {indicators.map((ind, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nama Indikator"
                      value={ind.indicator_name}
                      onChange={(e) => {
                        const copy = [...indicators];
                        copy[idx].indicator_name = e.target.value;
                        setIndicators(copy);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="Bobot %"
                      value={ind.weight}
                      onChange={(e) => {
                        const copy = [...indicators];
                        copy[idx].weight = Number(e.target.value);
                        setIndicators(copy);
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setIndicators(indicators.filter((_, i) => i !== idx))}
                      className="text-rose-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsKpiModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Simpan Template KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
