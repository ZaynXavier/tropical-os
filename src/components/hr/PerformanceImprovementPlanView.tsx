/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, PerformanceImprovementPlan, PipActionPlanStep } from "../../types";
import { PipService } from "../../services/otherServices";
import { EmployeeService, EmployeeData } from "../../services/employeeService";
import {
  TrendingDown,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Calendar,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Info,
  Clock,
  CheckSquare,
  Square
} from "lucide-react";

interface PerformanceImprovementPlanViewProps {
  user: User;
}

export const PerformanceImprovementPlanView: React.FC<PerformanceImprovementPlanViewProps> = ({ user }) => {
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [selectedPip, setSelectedPip] = useState<PerformanceImprovementPlan | null>(null);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [trainingDocs, setTrainingDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [sourceKpiAssignmentId, setSourceKpiAssignmentId] = useState("");
  const [sourceIndicatorId, setSourceIndicatorId] = useState("");
  const [pipReason, setPipReason] = useState("");
  const [pipTargetScore, setPipTargetScore] = useState<number>(80);
  const [pipStartDate, setPipStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [pipEndDate, setPipEndDate] = useState<string>("");
  const [pipCoachId, setPipCoachId] = useState("");
  const [pipCoachName, setPipCoachName] = useState("");
  const [actionPlanSteps, setActionPlanSteps] = useState<{ step: string; due_date: string }[]>([]);
  const [newStepText, setNewStepText] = useState("");
  const [newStepDueDate, setNewStepDueDate] = useState<string>("");

  // Close Program state
  const [isCloseFormOpen, setIsCloseFormOpen] = useState(false);
  const [closeStatus, setCloseStatus] = useState<'SUCCESSFUL' | 'FAILED'>('SUCCESSFUL');
  const [closeResultScore, setCloseResultScore] = useState<number>(80);
  const [closeResultNotes, setCloseResultNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const isManager = user.role === "MANAGER";
  const isSupervisor = user.role === "SUPERVISOR";
  const canManage = isManager || isSupervisor;

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Load pips
    const fetchedPipsRes: any = await PipService.getAllPips();
    const fetchedPips = Array.isArray(fetchedPipsRes) ? fetchedPipsRes : (fetchedPipsRes?.data || []);
    setPips(fetchedPips);
    if (fetchedPips.length > 0 && !selectedPip) {
      setSelectedPip(fetchedPips[0]);
    } else if (selectedPip) {
      const updated = fetchedPips.find((p: any) => p.id === selectedPip.id);
      if (updated) setSelectedPip(updated);
    }

    // Load employees for the form dropdown
    const empRes = await EmployeeService.getAllEmployees();
    if (!empRes.error) {
      setEmployees(empRes.data);
    } else {
      // Fallback local mock employees
      setEmployees([
        { id: 'emp-001', emp_id: 'NIK-001', name: 'Budi Santoso', email: 'budi@tropicalos.com', role: 'Cook Helper', division: 'KITCHEN', status: 'Active' },
        { id: 'emp-002', emp_id: 'NIK-002', name: 'Siti Aminah', email: 'siti@tropicalos.com', role: 'Waiter', division: 'WAITER', status: 'Active' },
        { id: 'emp-003', emp_id: 'NIK-003', name: 'Slamet Riyadi', email: 'slamet@tropicalos.com', role: 'Barista', division: 'BARISTA', status: 'Active' }
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Whenever selected PIP changes, fetch its automatic training recommendations
  useEffect(() => {
    const fetchTraining = async () => {
      if (selectedPip) {
        const docs = await PipService.getTrainingRecommendations(selectedPip.source_kpi_assignment_id);
        setTrainingDocs(docs);
      } else {
        setTrainingDocs([]);
      }
    };
    fetchTraining();
  }, [selectedPip]);

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    const dueDate = newStepDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setActionPlanSteps([...actionPlanSteps, { step: newStepText.trim(), due_date: dueDate }]);
    setNewStepText("");
    setNewStepDueDate("");
  };

  const handleRemoveStep = (index: number) => {
    setActionPlanSteps(actionPlanSteps.filter((_, i) => i !== index));
  };

  const handleCreatePipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !pipReason.trim() || !pipStartDate || !pipEndDate) {
      setErrorMessage("Mohon lengkapi semua data wajib.");
      return;
    }

    if (actionPlanSteps.length === 0) {
      setErrorMessage("Rencana Peningkatan wajib memiliki minimal 1 langkah tindakan (action plan).");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const formattedSteps: PipActionPlanStep[] = actionPlanSteps.map(s => ({
      step: s.step,
      due_date: s.due_date,
      status: 'PENDING'
    }));

    // Find employee info for local representation
    const emp = employees.find(e => e.id === selectedEmployeeId);

    const newPipPayload = {
      employee_id: selectedEmployeeId,
      source_kpi_assignment_id: sourceKpiAssignmentId || 'manual-assignment-' + Date.now(),
      source_indicator_id: sourceIndicatorId || null,
      reason: pipReason,
      target_score: pipTargetScore,
      action_plan: formattedSteps,
      coach_id: pipCoachId || 'coach-profile-uuid',
      start_date: pipStartDate,
      end_date: pipEndDate,
      status: 'ACTIVE' as const,
      // Pass joins manually for fallback
      employee: emp ? { name: emp.name, role: emp.role, division: emp.division } : undefined,
      coach: { full_name: pipCoachName || 'Supervisor Pendamping' }
    };

    const res = await PipService.createPip(newPipPayload, user.uid);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Program PIP Karyawan berhasil diluncurkan.");
      setIsCreateModalOpen(false);
      // Reset form
      setSelectedEmployeeId("");
      setSourceKpiAssignmentId("");
      setSourceIndicatorId("");
      setPipReason("");
      setPipTargetScore(80);
      setPipCoachName("");
      setActionPlanSteps([]);
      loadData();
    }
  };

  const handleToggleStepStatus = async (stepIndex: number) => {
    if (!selectedPip || !canManage) return;

    const updatedSteps = selectedPip.action_plan.map((step, idx) => {
      if (idx === stepIndex) {
        return {
          ...step,
          status: step.status === 'COMPLETED' ? 'PENDING' as const : 'COMPLETED' as const
        };
      }
      return step;
    });

    const res = await PipService.updatePipStatus(
      selectedPip.id,
      selectedPip.status,
      selectedPip.result_score || undefined,
      selectedPip.result_notes || undefined,
      updatedSteps,
      user.uid
    );

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      // Instantly update UI state
      setSelectedPip({
        ...selectedPip,
        action_plan: updatedSteps
      });
      setPips(pips.map(p => p.id === selectedPip.id ? { ...p, action_plan: updatedSteps } : p));
    }
  };

  const handleClosePipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPip) return;

    setSubmitting(true);
    setErrorMessage(null);

    const res = await PipService.updatePipStatus(
      selectedPip.id,
      closeStatus,
      closeResultScore,
      closeResultNotes,
      undefined,
      user.uid
    );

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Evaluasi akhir program PIP berhasil disimpan dengan status ${closeStatus}.`);
      setIsCloseFormOpen(false);
      setCloseResultNotes("");
      loadData();
    }
  };

  // Filter calculation
  const filteredPips = pips.filter(p => {
    const nameMatch = p.employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const statusMatch = statusFilter === "ALL" || p.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-bold font-mono text-[10px] rounded-full uppercase">Aktif</span>;
      case "SUCCESSFUL":
        return <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-bold font-mono text-[10px] rounded-full uppercase">Selesai Berhasil</span>;
      case "FAILED":
        return <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-700/50 text-rose-300 font-bold font-mono text-[10px] rounded-full uppercase">Gagal (Sanksi/Mutasi)</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-400 font-bold font-mono text-[10px] rounded-full uppercase">Batal</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-400 font-bold font-mono text-[10px] rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded-xl flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header section with Stats */}
      <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Rencana Peningkatan Karyawan (PIP)</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Luncurkan program pendampingan, pemantauan tugas, dan pelatihan terstruktur untuk memulihkan standar performa staf operasional.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Luncurkan Program PIP
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total PIP Aktif</span>
            <span className="text-2xl font-black text-white font-mono">{pips.filter(p => p.status === 'ACTIVE').length}</span>
          </div>
          <Clock className="w-8 h-8 text-indigo-400/80" />
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kelulusan Berhasil</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{pips.filter(p => p.status === 'SUCCESSFUL').length}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/80" />
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Keberhasilan</span>
            <span className="text-2xl font-black text-indigo-300 font-mono">
              {pips.length > 0 
                ? `${Math.round((pips.filter(p => p.status === 'SUCCESSFUL').length / pips.length) * 100)}%`
                : '100%'}
            </span>
          </div>
          <Sparkles className="w-8 h-8 text-purple-400/80" />
        </div>
      </div>

      {/* Main layout splitting List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: PIP Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl space-y-3">
            <span className="text-xs font-black text-indigo-300 block uppercase tracking-wider">Navigasi Program</span>
            
            {/* Search and Filters */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Semua</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUCCESSFUL">Selesai</option>
                <option value="FAILED">Gagal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Memuat data program...</div>
            ) : filteredPips.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl text-xs text-slate-500">
                Tidak ada program PIP yang cocok dengan kriteria filter.
              </div>
            ) : (
              filteredPips.map(pip => {
                const totalSteps = pip.action_plan.length;
                const completedSteps = pip.action_plan.filter(s => s.status === 'COMPLETED').length;
                const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <div
                    key={pip.id}
                    onClick={() => {
                      setSelectedPip(pip);
                      setIsCloseFormOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPip?.id === pip.id
                        ? "bg-indigo-950/15 border-indigo-500/50 shadow-md shadow-indigo-950/40"
                        : "bg-slate-950/30 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{pip.employee?.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {pip.employee?.role} • Divisi {pip.employee?.division}
                        </span>
                      </div>
                      {getStatusBadge(pip.status)}
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Progress Tindakan:</span>
                        <span className="font-bold text-white">{completedSteps}/{totalSteps} ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progressPct}%` }}
                          className={`h-full transition-all duration-300 ${
                            pip.status === 'SUCCESSFUL' ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-3 border-t border-slate-900 pt-2.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {pip.start_date} s/d {pip.end_date}</span>
                      <span className="text-slate-400 font-bold flex items-center gap-1">Detail <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Focus view with data lineage, checklist, and training suggestions */}
        <div className="lg:col-span-7">
          {selectedPip ? (
            <div className="p-5 bg-slate-950/40 border border-slate-900/60 rounded-3xl space-y-6">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full text-[9px] font-black font-mono uppercase tracking-widest">
                    Evaluasi Terperinci
                  </span>
                  <h3 className="text-lg font-black text-white mt-1.5">{selectedPip.employee?.name}</h3>
                  <p className="text-xs text-slate-400">{selectedPip.employee?.role} • Divisi {selectedPip.employee?.division}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Status Program:</span>
                  <div className="mt-1">{getStatusBadge(selectedPip.status)}</div>
                </div>
              </div>

              {/* Data Lineage - Mathematical Proof of Trigger */}
              <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider font-mono">Silsilah Pemicu &amp; Justifikasi Audit</span>
                </div>
                <div className="text-xs text-slate-300 font-medium leading-relaxed">
                  {selectedPip.reason}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-rose-900/10 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Nilai Perbaikan:</span>
                    <span className="text-white font-extrabold">{selectedPip.target_score} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Supervisor Pendamping:</span>
                    <span className="text-indigo-300 font-extrabold">{selectedPip.coach?.full_name}</span>
                  </div>
                </div>
              </div>

              {/* Training recommendations linked dynamically from hr_documents */}
              <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Rekomendasi Pelatihan (SOP Link)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-black rounded font-mono">SOP CONNECTED</span>
                </div>

                {trainingDocs.length === 0 ? (
                  <div className="text-xs text-slate-500 font-medium italic">
                    Sistem tidak menemukan SOP langsung yang terhubung dengan indikator KPI ini. Silakan baca pedoman operasional dasar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trainingDocs.map(doc => (
                      <div key={doc.id} className="p-3 bg-slate-950/60 border border-indigo-950 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="px-1.5 py-0.5 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded text-[9px] font-black font-mono">
                            {doc.document_code || "SOP"}
                          </span>
                          <h5 className="text-xs font-extrabold text-white mt-1">{doc.title}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">Jenis: {doc.document_type}</span>
                        </div>
                        <button
                          onClick={() => alert(`Membuka dokumen SOP: ${doc.title}`)}
                          className="px-2.5 py-1 bg-indigo-600/25 hover:bg-indigo-600/45 border border-indigo-700/50 text-indigo-300 font-bold text-[10px] rounded-lg transition-all"
                        >
                          Pelajari SOP
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Plan Interactive Steps Checklist */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ClipboardList className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Rencana Tindakan Operasional</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedPip.action_plan.filter(s => s.status === 'COMPLETED').length} / {selectedPip.action_plan.length} Selesai
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedPip.action_plan.map((step, idx) => {
                    const isCompleted = step.status === 'COMPLETED';
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleStepStatus(idx)}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          canManage ? 'cursor-pointer' : ''
                        } ${
                          isCompleted
                            ? "bg-slate-950/25 border-slate-900 text-slate-500"
                            : "bg-slate-950/65 border-indigo-950/40 text-slate-200"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="space-y-1 text-left">
                          <span className={`text-xs block ${isCompleted ? 'line-through' : 'font-semibold'}`}>
                            {step.step}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" /> Batas: {step.due_date}
                          </span>
                          {step.notes && (
                            <div className="text-[10px] text-amber-300/80 bg-amber-950/15 border border-amber-900/10 p-1.5 rounded-lg mt-1 font-sans">
                              Catatan: {step.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close/Finalize form block */}
              {selectedPip.status === 'ACTIVE' && canManage && (
                <div className="border-t border-slate-900 pt-5 space-y-4">
                  {!isCloseFormOpen ? (
                    <button
                      onClick={() => setIsCloseFormOpen(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all"
                    >
                      Selesaikan &amp; Evaluasi Akhir Program
                    </button>
                  ) : (
                    <form onSubmit={handleClosePipSubmit} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Form Evaluasi Kelulusan PIP</span>
                        <button type="button" onClick={() => setIsCloseFormOpen(false)} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keputusan Akhir</label>
                          <select
                            value={closeStatus}
                            onChange={e => setCloseStatus(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                          >
                            <option value="SUCCESSFUL">LULUS (Kembali Kerja Standar)</option>
                            <option value="FAILED">GAGAL (Rekomendasi Mutasi/Sanksi)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skor Akhir Evaluasi</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={closeResultScore}
                            onChange={e => setCloseResultScore(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan Evaluasi Mentor &amp; HR</label>
                        <textarea
                          rows={3}
                          value={closeResultNotes}
                          onChange={e => setCloseResultNotes(e.target.value)}
                          placeholder="Jelaskan dasar keputusan, perkembangan sikap, dan kesiapan staf..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        {submitting ? "Menyimpan..." : "Kunci Hasil &amp; Selesaikan Program"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Historic results view */}
              {selectedPip.status !== 'ACTIVE' && (
                <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Hasil Penutupan Historis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Skor Hasil Akhir:</span>
                      <span className="text-white font-extrabold">{selectedPip.result_score !== null ? `${selectedPip.result_score} / 100` : "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Ditutup Pada:</span>
                      <span className="text-slate-300">{selectedPip.closed_at ? selectedPip.closed_at.split('T')[0] : "N/A"}</span>
                    </div>
                  </div>
                  {selectedPip.result_notes && (
                    <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 mt-2 leading-relaxed">
                      <span className="text-slate-400 block text-[10px] font-mono">Catatan Penutupan:</span>
                      {selectedPip.result_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-slate-950/20 border border-dashed border-slate-900 rounded-3xl text-center text-slate-500 text-xs">
              Pilih program PIP dari daftar navigasi untuk melihat justifikasi audit, silsilah data, dan rencana tindakan terinci.
            </div>
          )}
        </div>
      </div>

      {/* CREATE PIP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white tracking-tight">Formulir Peluncuran Program PIP</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePipSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pilih Karyawan Target</label>
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} - {emp.division})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Nilai Pemulihan</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pipTargetScore}
                    onChange={e => setPipTargetScore(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Supervisor Pendamping</label>
                  <input
                    type="text"
                    placeholder="Nama Supervisor..."
                    value={pipCoachName}
                    onChange={e => setPipCoachName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={pipStartDate}
                    onChange={e => setPipStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tanggal Berakhir (Est.)</label>
                  <input
                    type="date"
                    value={pipEndDate}
                    onChange={e => setPipEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Penyebab Justifikasi PIP (Alasan)</label>
                <textarea
                  rows={2}
                  value={pipReason}
                  onChange={e => setPipReason(e.target.value)}
                  required
                  placeholder="Contoh: Skor KPI Juli 2026 di bawah batas minimum dengan nilai 55.00 pada indikator Kebersihan Kitchen."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action Plan Creator */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">Penyusun Rencana Tindakan</span>
                
                {actionPlanSteps.length > 0 && (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {actionPlanSteps.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-950 rounded-lg border border-slate-900 text-xs">
                        <div>
                          <p className="font-semibold text-white">{step.step}</p>
                          <span className="text-[9px] text-slate-500 font-mono">Due: {step.due_date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Deskripsi tindakan baru..."
                    value={newStepText}
                    onChange={e => setNewStepText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={newStepDueDate}
                    onChange={e => setNewStepDueDate(e.target.value)}
                    className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {submitting ? "Menyimpan..." : "Luncurkan Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
