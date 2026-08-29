/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  EmployeeKpiAssignment,
  KpiTemplate,
  KpiIndicatorResult,
  KpiAssignmentStatus,
  KpiGrade,
  CreateKpiAssignmentInput,
  UpdateIndicatorResultInput,
} from "../../types";
import { KpiService, EmployeeService, EmployeeData } from "../../lib/supabase";
import {
  Award,
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  UserCheck,
  X,
  Target,
  BarChart3,
  ShieldCheck,
  Calendar,
  Lock,
  RotateCcw,
  Check,
  Eye,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Percent,
} from "lucide-react";

interface KpiAssignmentWorkflowViewProps {
  user: User;
}

export const KpiAssignmentWorkflowView: React.FC<KpiAssignmentWorkflowViewProps> = ({ user }) => {
  const [assignments, setAssignments] = useState<EmployeeKpiAssignment[]>([]);
  const [templates, setTemplates] = useState<KpiTemplate[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");

  // Active Assignment in View / Modal
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeKpiAssignment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  // Create Assignment Form
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createTemplateId, setCreateTemplateId] = useState("");
  const [createPeriod, setCreatePeriod] = useState("2026-08");
  const [createStartDate, setCreateStartDate] = useState("2026-08-01");
  const [createEndDate, setCreateEndDate] = useState("2026-08-31");
  const [createNotes, setCreateNotes] = useState("");

  // Evaluation Form State for Active Modal
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalActuals, setEvalActuals] = useState<Record<string, number>>({});
  const [evalNotes, setEvalNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isManager = user.role === "MANAGER";
  const isSupervisor = user.role === "SUPERVISOR";
  const isStaff = user.role === "STAFF";
  const canManage = isManager || isSupervisor;

  // Load All Data
  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [assignRes, tmplRes, empRes] = await Promise.all([
        KpiService.getKpiAssignments(
          isSupervisor && !isManager
            ? { division: user.division }
            : isStaff
            ? { employeeId: user.employeeId || user.id }
            : undefined
        ),
        KpiService.getKpiTemplates(isSupervisor && !isManager ? user.division : undefined),
        EmployeeService.getAllEmployees(),
      ]);

      if (assignRes.error) setErrorMessage(assignRes.error);
      else setAssignments(assignRes.data);

      if (!tmplRes.error && tmplRes.data) {
        setTemplates(tmplRes.data.filter((t) => t.is_active));
      }

      if (empRes.data) {
        const activeEmps = empRes.data.filter((e) => e.status === "ACTIVE");
        if (isSupervisor && !isManager) {
          setEmployees(activeEmps.filter((e) => e.division === user.division));
        } else {
          setEmployees(activeEmps);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal memuat data penugasan KPI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Distinct Periods for Filter
  const distinctPeriods = useMemo(() => {
    const set = new Set(assignments.map((a) => a.period));
    return Array.from(set);
  }, [assignments]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee_emp_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.template_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.period.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        divisionFilter === "ALL" || item.division === divisionFilter;

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesPeriod =
        periodFilter === "ALL" || item.period === periodFilter;

      return matchesSearch && matchesDivision && matchesStatus && matchesPeriod;
    });
  }, [assignments, searchQuery, divisionFilter, statusFilter, periodFilter]);

  // Handle open evaluation / detail
  const handleOpenDetail = async (assign: EmployeeKpiAssignment) => {
    setLoading(true);
    const res = await KpiService.getKpiAssignmentById(assign.id);
    setLoading(false);

    if (res.data) {
      setSelectedAssignment(res.data);
      const scores: Record<string, number> = {};
      const actuals: Record<string, number> = {};
      const notes: Record<string, string> = {};

      (res.data.indicator_results || []).forEach((ind) => {
        scores[ind.id] = ind.score || 0;
        actuals[ind.id] = ind.actual_value || 0;
        notes[ind.id] = ind.evaluator_notes || "";
      });

      setEvalScores(scores);
      setEvalActuals(actuals);
      setEvalNotes(notes);
      setIsDetailOpen(true);
    } else {
      setErrorMessage(res.error || "Gagal membuka detail penugasan");
    }
  };

  // Create Assignment Submit
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmployeeId || !createTemplateId || !createPeriod) {
      setErrorMessage("Karyawan, Template KPI, dan Periode wajib dipilih.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const input: CreateKpiAssignmentInput = {
      employee_id: createEmployeeId,
      template_id: createTemplateId,
      period: createPeriod.trim(),
      period_start_date: createStartDate || null,
      period_end_date: createEndDate || null,
      notes: createNotes.trim() || null,
    };

    const res = await KpiService.createKpiAssignment(input);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Penugasan KPI berhasil dibuat dan snapshot indikator telah disiapkan.");
      setIsCreateModalOpen(false);
      setCreateNotes("");
      loadData();
    }
  };

  // Real-time calculation of modal total score and grade
  const modalLiveStats = useMemo(() => {
    if (!selectedAssignment?.indicator_results) {
      return { totalScore: 0, grade: "D" as KpiGrade, weightedBreakdown: [] };
    }

    let totalWeightedScore = 0;
    const breakdown = selectedAssignment.indicator_results.map((ind) => {
      const score = evalScores[ind.id] !== undefined ? evalScores[ind.id] : ind.score;
      const weight = ind.weight;
      const weightedScore = Number(((score * weight) / 100).toFixed(2));
      totalWeightedScore += weightedScore;
      return {
        id: ind.id,
        name: ind.indicator_name_snapshot,
        score,
        weight,
        weightedScore,
      };
    });

    const finalScore = Math.min(100, Math.max(0, Number(totalWeightedScore.toFixed(2))));
    let grade: KpiGrade = "D";
    if (finalScore >= 90) grade = "A";
    else if (finalScore >= 80) grade = "B";
    else if (finalScore >= 70) grade = "C";
    else grade = "D";

    return { totalScore: finalScore, grade, weightedBreakdown: breakdown };
  }, [selectedAssignment, evalScores]);

  // Save Indicator Evaluations
  const handleSaveIndicators = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Update each indicator result
      for (const ind of selectedAssignment.indicator_results || []) {
        const score = evalScores[ind.id] !== undefined ? evalScores[ind.id] : ind.score;
        const actual = evalActuals[ind.id] !== undefined ? evalActuals[ind.id] : ind.actual_value;
        const note = evalNotes[ind.id] !== undefined ? evalNotes[ind.id] : ind.evaluator_notes;

        await KpiService.updateIndicatorResult(ind.id, {
          score,
          actual_value: actual,
          evaluator_notes: note,
        });
      }

      // If status is ACTIVE, transition to IN_PROGRESS
      if (selectedAssignment.status === "ACTIVE" || selectedAssignment.status === "DRAFT") {
        await KpiService.startKpiAssignment(selectedAssignment.id);
      }

      const refreshed = await KpiService.getKpiAssignmentById(selectedAssignment.id);
      if (refreshed.data) {
        setSelectedAssignment(refreshed.data);
      }

      setSuccessMessage("Nilai indikator berhasil disimpan & skor terhitung secara otomatis.");
      loadData();
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menyimpan nilai evaluasi");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit KPI Assignment
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMessage(null);

    // Save indicators first
    await handleSaveIndicators();

    const res = await KpiService.submitKpiAssignment(selectedAssignment.id);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Evaluasi KPI berhasil diajukan untuk verifikasi Manager.");
      setSelectedAssignment(res.data);
      loadData();
    }
  };

  // Approve KPI Assignment
  const handleApproveAssignment = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await KpiService.approveKpiAssignment(selectedAssignment.id);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Evaluasi KPI disetujui (APPROVED).");
      setSelectedAssignment(res.data);
      loadData();
    }
  };

  // Finalize KPI Assignment
  const handleFinalizeAssignment = async () => {
    if (!selectedAssignment) return;
    if (!confirm("Apakah Anda yakin ingin memfinalisasi penilaian KPI ini? Nilai akan dikunci permanen (IMMUTABLE) dan tidak dapat diubah lagi.")) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await KpiService.finalizeKpiAssignment(selectedAssignment.id);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Evaluasi KPI berhasil difinalisasi (FINALIZED) dan dikunci permanen.");
      setSelectedAssignment(res.data);
      loadData();
    }
  };

  
  const handleRefreshKpiMetrics = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Import Ingestion Service directly here or call API (assuming we can import it)
    try {
      const { KpiIngestionService } = await import('../../lib/supabase');
      const res = await KpiIngestionService.refreshKpiMetrics(selectedAssignment.id);
      
      setSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        const stats = res.data;
        if (stats?.zero_data_indicators && !stats?.completed_indicators) {
           setSuccessMessage("Proses selesai. Tidak ada data eligible untuk metrik otomatis.");
        } else if (stats?.failed_indicators) {
           setErrorMessage("Sebagian metrik otomatis gagal diperbarui. Silakan coba lagi.");
        } else {
           setSuccessMessage("Data KPI berhasil diperbarui dari sumber (Checklist & Attendance).");
        }
        
        // Reload specific assignment
        const updatedAssign = await KpiService.getKpiAssignmentById(selectedAssignment.id);
        if (updatedAssign.data) {
           setSelectedAssignment(updatedAssign.data);
           // Resync local states
           const nScores: Record<string, number> = {};
           const nActuals: Record<string, number> = {};
           const nNotes: Record<string, string> = {};
           updatedAssign.data.indicator_results?.forEach(ind => {
               nScores[ind.id] = ind.score || 0;
               nActuals[ind.id] = ind.actual_value || 0;
               nNotes[ind.id] = ind.evaluator_notes || "";
           });
           setEvalScores(nScores);
           setEvalActuals(nActuals);
           setEvalNotes(nNotes);
        }
        loadData();
      }
    } catch (e: any) {
      setSubmitting(false);
      setErrorMessage("Data KPI gagal diperbarui. Silakan coba lagi.");
    }
  };

  // Request Revision Submit
  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !revisionReason.trim()) {
      setErrorMessage("Alasan permintaan revisi wajib disertakan.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await KpiService.requestKpiRevision(selectedAssignment.id, revisionReason);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Permintaan revisi berhasil dikirim ke Supervisor.");
      setIsRevisionModalOpen(false);
      setRevisionReason("");
      setSelectedAssignment(res.data);
      loadData();
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: KpiAssignmentStatus) => {
    switch (status) {
      case "FINALIZED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-700 shadow-sm">
            <Lock className="w-3 h-3" />
            <span>FINALIZED</span>
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-950/90 text-teal-300 border border-teal-700 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>APPROVED</span>
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-950/90 text-sky-300 border border-sky-700 shadow-sm">
            <Clock className="w-3 h-3" />
            <span>SUBMITTED</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-950/90 text-amber-300 border border-amber-700 shadow-sm">
            <RotateCcw className="w-3 h-3" />
            <span>IN PROGRESS</span>
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-950/90 text-indigo-300 border border-indigo-700 shadow-sm">
            <Target className="w-3 h-3" />
            <span>ACTIVE</span>
          </span>
        );
      case "REVISION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-950/90 text-rose-300 border border-rose-700 shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            <span>REVISION REQ</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-950/90 text-red-300 border border-red-800 shadow-sm">
            <X className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Grade Badge Helper
  const renderGradeBadge = (grade?: string | null, score?: number) => {
    if (!grade) {
      return <span className="font-mono text-slate-500">-</span>;
    }

    let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
    if (grade === "A") colorClass = "bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm";
    else if (grade === "B") colorClass = "bg-blue-950 text-blue-300 border-blue-600";
    else if (grade === "C") colorClass = "bg-amber-950 text-amber-300 border-amber-600";
    else if (grade === "D") colorClass = "bg-rose-950 text-rose-300 border-rose-600";

    return (
      <span className={`inline-flex items-center justify-center font-mono font-black text-xs px-2.5 py-0.5 rounded-md border ${colorClass}`}>
        Grade {grade}
      </span>
    );
  };

  const isLocked = selectedAssignment?.status === "FINALIZED" || (selectedAssignment?.status === "APPROVED" && !isManager);

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Penugasan &amp; Evaluasi Kinerja (KPI)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alur penilaian objektif berbasis template snapshot, pembobotan 100%, verifikasi berjenjang &amp; proteksi data permanen.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tugaskan KPI Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan, NIK, template, atau periode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {isManager && (
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="BARISTA">Barista</option>
            <option value="WAITER">Waiter</option>
            <option value="CASHIER">Kasir</option>
            <option value="PURCHASING">Purchasing</option>
            <option value="FINANCE">Finance</option>
            <option value="HOUSEKEEPING">Housekeeping</option>
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="REVISION_REQUIRED">REVISION_REQUIRED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="FINALIZED">FINALIZED (Terkunci)</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        {distinctPeriods.length > 0 && (
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Periode</option>
            {distinctPeriods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Assignment Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Memuat daftar penugasan evaluasi KPI...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs space-y-2">
            <Award className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
            <p>Tidak ada penugasan KPI yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Divisi &amp; Posisi</th>
                  <th className="py-3.5 px-4">Template KPI</th>
                  <th className="py-3.5 px-4 text-center">Periode</th>
                  <th className="py-3.5 px-4 text-center">Skor Akhir</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{assign.employee_name || "Karyawan"}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{assign.employee_emp_id || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-semibold">{assign.division || "-"}</div>
                      <div className="text-[10px] text-slate-500">{assign.position || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold">{assign.template_title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{assign.template_code || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {assign.period}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span className={assign.score >= 80 ? "text-emerald-400" : assign.score >= 70 ? "text-amber-400" : "text-rose-400"}>
                        {assign.score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderGradeBadge(assign.grade, assign.score)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge(assign.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(assign)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          assign.status === "FINALIZED"
                            ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700"
                        }`}
                      >
                        {assign.status === "FINALIZED" ? <Eye className="w-3.5 h-3.5" /> : <EditIcon className="w-3.5 h-3.5" />}
                        <span>{assign.status === "FINALIZED" || !canManage ? "Lihat Detail" : "Evaluasi"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREATE KPI ASSIGNMENT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-base">Buat Penugasan KPI Baru</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Karyawan *</label>
                <select
                  required
                  value={createEmployeeId}
                  onChange={(e) => setCreateEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Pilih Karyawan Aktif --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.emp_id}) — Divisi: {emp.division} ({emp.position || "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Master Template KPI *</label>
                <select
                  required
                  value={createTemplateId}
                  onChange={(e) => setCreateTemplateId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Pilih Template KPI Aktif (100% Bobot) --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} [{t.code}] — Divisi: {t.division} ({t.indicators?.length || 0} Indikator)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Semua indikator dan bobot akan disnapshot secara otomatis saat penugasan dibuat.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Periode *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026-08"
                    value={createPeriod}
                    onChange={(e) => setCreatePeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mulai</label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selesai</label>
                  <input
                    type="date"
                    value={createEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Arahan target khusus untuk periode ini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition-all"
                >
                  {submitting ? "Memproses..." : "Simpan & Snapshot KPI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVALUATION DETAIL & SCORING WORKFLOW */}
      {isDetailOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-lg">
                    {selectedAssignment.employee_name}
                  </h3>
                  {renderStatusBadge(selectedAssignment.status)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>NIK: <strong className="text-slate-200 font-mono">{selectedAssignment.employee_emp_id || "-"}</strong></span>
                  <span>•</span>
                  <span>Divisi: <strong className="text-slate-200">{selectedAssignment.division}</strong></span>
                  <span>•</span>
                  <span>Template: <strong className="text-slate-200">{selectedAssignment.template_title}</strong></span>
                  <span>•</span>
                  <span>Periode: <strong className="text-slate-200 font-mono">{selectedAssignment.period}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Performance Score Dashboard Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Skor Akhir Terhitung</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black font-mono ${modalLiveStats.totalScore >= 80 ? "text-emerald-400" : modalLiveStats.totalScore >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                    {modalLiveStats.totalScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 100.00</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Predikat Kinerja</span>
                <div>
                  {renderGradeBadge(modalLiveStats.grade, modalLiveStats.totalScore)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Evaluasi</span>
                <div className="text-xs text-slate-300 font-semibold">
                  {selectedAssignment.status === "FINALIZED" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Terkunci Permanen
                    </span>
                  ) : (
                    <span>{selectedAssignment.status}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Revision Reason Alert if any */}
            {selectedAssignment.revision_reason && (
              <div className="p-3.5 bg-amber-950/80 border border-amber-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Catatan Permintaan Revisi dari Manager:
                </span>
                <p className="text-amber-200">{selectedAssignment.revision_reason}</p>
              </div>
            )}

            {/* Indicator Results List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Indikator Penilaian Snapshot ({selectedAssignment.indicator_results?.length || 0} Indikator):
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Total Bobot: <strong>100%</strong>
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {(selectedAssignment.indicator_results || []).map((ind, idx) => {
                  const score = evalScores[ind.id] !== undefined ? evalScores[ind.id] : ind.score;
                  const actual = evalActuals[ind.id] !== undefined ? evalActuals[ind.id] : ind.actual_value;
                  const note = evalNotes[ind.id] !== undefined ? evalNotes[ind.id] : (ind.evaluator_notes || "");
                  const weighted = Number(((score * ind.weight) / 100).toFixed(2));
                  const isManual = !ind.source_data_type || ind.source_data_type.includes("MANUAL");
                  const isAuto = !isManual;
                  const sourceMetadata = typeof ind.source_metadata === 'string' ? JSON.parse(ind.source_metadata) : (ind.source_metadata || {});
                  

                  return (
                    <div
                      key={ind.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                            #{idx + 1} • {ind.indicator_code_snapshot || `IND-${idx + 1}`}
                          </span>
                          <h5 className="text-sm font-bold text-slate-100">{ind.indicator_name_snapshot}</h5>
                          {ind.target_description_snapshot && (
                            <p className="text-xs text-slate-400">{ind.target_description_snapshot}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                            Bobot: {ind.weight}%
                          </span>
                          <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                            Nilai Bobot: {weighted.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-850">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Target ({ind.measurement_unit || "SCORE"})
                          </label>
                          <input
                            type="text"
                            disabled
                            value={ind.target_value}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Realisasi Aktual
                          </label>
                          <input
                            type="number"
                            disabled={isLocked || !canManage || isAuto}
                            value={actual}
                            onChange={(e) =>
                              setEvalActuals({
                                ...evalActuals,
                                [ind.id]: Number(e.target.value),
                              })
                            }
                            className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${isAuto ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-500"}`}
                          />
                          {isAuto && (
                            <p className="text-[9px] text-slate-500 mt-1">Dihitung otomatis (Server)</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Skor Penilaian (0 - 100) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isLocked || !canManage || isAuto}
                            value={score}
                            onChange={(e) =>
                              setEvalScores({
                                ...evalScores,
                                [ind.id]: Number(e.target.value),
                              })
                            }
                            className={`w-full border rounded-lg p-2 text-xs font-mono font-bold focus:outline-none ${isAuto ? "bg-slate-950 border-slate-800 text-emerald-500/50" : "bg-slate-900 border-slate-700 text-emerald-300 focus:border-emerald-500"}`}
                          />
                        </div>
                      </div>

                      {isAuto && sourceMetadata?.source && (
                        <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-3 mt-2 space-y-2">
                           <div className="flex items-center gap-2 mb-2">
                             <Layers className="w-3.5 h-3.5 text-indigo-400" />
                             <span className="text-[10px] font-bold text-slate-300 uppercase">Data Lineage: {sourceMetadata.source.replace(/_/g, ' ')}</span>
                           </div>
                           
                           {sourceMetadata.source === "CHECKLIST_AGGREGATE" && (
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                               <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                 <span className="block text-[9px] text-slate-500">Total Checklist</span>
                                 <span className="block text-xs font-mono text-slate-300">{sourceMetadata.total_relevant_checklists}</span>
                               </div>
                               <div className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                                 <span className="block text-[9px] text-emerald-500">Verified</span>
                                 <span className="block text-xs font-mono text-emerald-400">{sourceMetadata.verified_checklists}</span>
                               </div>
                               <div className="bg-rose-950/30 p-2 rounded border border-rose-900/50">
                                 <span className="block text-[9px] text-rose-500">Excluded</span>
                                 <span className="block text-xs font-mono text-rose-400">{sourceMetadata.excluded_checklists}</span>
                               </div>
                               <div className="bg-sky-950/30 p-2 rounded border border-sky-900/50">
                                 <span className="block text-[9px] text-sky-500">Compliance Rate</span>
                                 <span className="block text-xs font-mono text-sky-400">{sourceMetadata.compliance_rate}%</span>
                               </div>
                             </div>
                           )}

                           {sourceMetadata.source === "ATTENDANCE_PRESENCE" && (
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                               <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                 <span className="block text-[9px] text-slate-500">Eligible Days</span>
                                 <span className="block text-xs font-mono text-slate-300">{sourceMetadata.eligible_days}</span>
                               </div>
                               <div className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                                 <span className="block text-[9px] text-emerald-500">Present</span>
                                 <span className="block text-xs font-mono text-emerald-400">{sourceMetadata.present_days}</span>
                               </div>
                               <div className="bg-rose-950/30 p-2 rounded border border-rose-900/50">
                                 <span className="block text-[9px] text-rose-500">Absent</span>
                                 <span className="block text-xs font-mono text-rose-400">{sourceMetadata.absent_days}</span>
                               </div>
                               <div className="bg-sky-950/30 p-2 rounded border border-sky-900/50">
                                 <span className="block text-[9px] text-sky-500">Attendance Rate</span>
                                 <span className="block text-xs font-mono text-sky-400">{sourceMetadata.attendance_rate}%</span>
                               </div>
                             </div>
                           )}

                           {sourceMetadata.source === "ATTENDANCE_PUNCTUALITY" && (
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                               <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                 <span className="block text-[9px] text-slate-500">Eligible Days</span>
                                 <span className="block text-xs font-mono text-slate-300">{sourceMetadata.eligible_days}</span>
                               </div>
                               <div className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                                 <span className="block text-[9px] text-emerald-500">On Time</span>
                                 <span className="block text-xs font-mono text-emerald-400">{sourceMetadata.on_time_days}</span>
                               </div>
                               <div className="bg-rose-950/30 p-2 rounded border border-rose-900/50">
                                 <span className="block text-[9px] text-rose-500">Late</span>
                                 <span className="block text-xs font-mono text-rose-400">{sourceMetadata.late_days}</span>
                               </div>
                               <div className="bg-sky-950/30 p-2 rounded border border-sky-900/50">
                                 <span className="block text-[9px] text-sky-500">Punctuality Rate</span>
                                 <span className="block text-xs font-mono text-sky-400">{sourceMetadata.punctuality_rate}%</span>
                               </div>
                             </div>
                           )}
                           
                           <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                              <span>Kalkulasi v{sourceMetadata.calculation_version || "1.0"}</span>
                              <span>Terakhir dihitung: {sourceMetadata.calculated_at ? new Date(sourceMetadata.calculated_at).toLocaleString('id-ID') : '-'}</span>
                           </div>
                        </div>
                      )}
                      
                      {isAuto && !sourceMetadata?.source && (
                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 mt-2">
                           <span className="text-[10px] font-bold text-slate-400 block mb-1">Source Data (Automated)</span>
                           <pre className="text-[9px] text-slate-500 font-mono whitespace-pre-wrap">
                             {JSON.stringify(sourceMetadata, null, 2)}
                           </pre>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Catatan Indikator
                        </label>
                        <input
                          type="text"
                          disabled={isLocked || !canManage}
                          value={note}
                          onChange={(e) =>
                            setEvalNotes({
                              ...evalNotes,
                              [ind.id]: e.target.value,
                            })
                          }
                          placeholder="Catatan pencapaian atau feedback untuk karyawan..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {!isLocked && canManage && (
                  <>
                    
                    {(selectedAssignment.status !== "FINALIZED" && selectedAssignment.status !== "APPROVED" && selectedAssignment.status !== "SUBMITTED") && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleRefreshKpiMetrics}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                        Refresh Data KPI
                      </button>
                    )}
                    
                    {/* Simpan Draf */}
<button
                      type="button"
                      disabled={submitting}
                      onClick={handleSaveIndicators}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Draf Penilaian"}
                    </button>

                    {selectedAssignment.status !== "SUBMITTED" && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmitAssignment}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Ajukan ke Manager (Submit)
                      </button>
                    )}
                  </>
                )}

                {/* Manager Approvals & Finalize */}
                {isManager && selectedAssignment.status === "SUBMITTED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRevisionModalOpen(true)}
                      className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition-all"
                    >
                      Minta Revisi
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleApproveAssignment}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Setujui (Approve)
                    </button>
                  </>
                )}

                {isManager && selectedAssignment.status === "APPROVED" && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleFinalizeAssignment}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Finalisasi &amp; Kunci Permanen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST REVISION */}
      {isRevisionModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Permintaan Revisi Evaluasi KPI
              </h3>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRevisionSubmit} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Tuliskan alasan revisi yang jelas untuk Supervisor agar dapat memperbaiki nilai penilaian karyawan:
              </p>

              <textarea
                required
                rows={4}
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                placeholder="Contoh: Tolong evaluasi ulang indikator kebersihan area karena ada komplain tamu tanggal 15..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-rose-500 focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Kirim Permintaan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
