/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, KpiIncentivePolicy, KpiIncentiveRule, BaseIncentiveType, CalculationMethod } from "../../types";
import { PayrollService } from "../../services/payrollService";
import {
  Scale,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";

interface KpiIncentivePolicyViewProps {
  user: User;
}

export const KpiIncentivePolicyView: React.FC<KpiIncentivePolicyViewProps> = ({ user }) => {
  const [policies, setPolicies] = useState<KpiIncentivePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<KpiIncentivePolicy | null>(null);
  const [rules, setRules] = useState<KpiIncentiveRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Policy Modal
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<KpiIncentivePolicy | null>(null);
  const [policyCode, setPolicyCode] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [policyDivision, setPolicyDivision] = useState<string>("ALL");
  const [policyPosition, setPolicyPosition] = useState<string>("");
  const [policyMinScore, setPolicyMinScore] = useState<number>(0);
  const [policyMaxScore, setPolicyMaxScore] = useState<number>(100);
  const [policyBaseType, setPolicyBaseType] = useState<BaseIncentiveType>("FIXED_AMOUNT");
  const [policyBaseValue, setPolicyBaseValue] = useState<number>(1000000);
  const [policyCalcMethod, setPolicyCalcMethod] = useState<CalculationMethod>("SCORE_PROPORTIONAL");
  const [policyStartDate, setPolicyStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [policyEndDate, setPolicyEndDate] = useState<string>("");
  const [policyActive, setPolicyActive] = useState<boolean>(true);

  // Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KpiIncentiveRule | null>(null);
  const [ruleGrade, setRuleGrade] = useState<string>("");
  const [ruleMinScore, setRuleMinScore] = useState<number>(0);
  const [ruleMaxScore, setRuleMaxScore] = useState<number>(100);
  const [ruleMultiplier, setRuleMultiplier] = useState<number>(1.0000);
  const [ruleFixedAmount, setRuleFixedAmount] = useState<string>("");
  const [rulePercentage, setRulePercentage] = useState<string>("");
  const [rulePriority, setRulePriority] = useState<number>(1);
  const [ruleActive, setRuleActive] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState(false);
  const isManager = user.role === "MANAGER";

  const loadPolicies = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await PayrollService.getKpiIncentivePolicies();
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      const dataList = res.data || [];
      setPolicies(dataList);
      // Auto-select first policy if none selected
      if (dataList.length > 0 && !selectedPolicy) {
        setSelectedPolicy(dataList[0]);
      } else if (selectedPolicy) {
        const updated = dataList.find(p => p.id === selectedPolicy.id);
        if (updated) setSelectedPolicy(updated);
      }
    }
    setLoading(false);
  };

  const loadRules = async (policyId: string) => {
    const res = await PayrollService.getKpiIncentiveRules(policyId);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setRules(res.data || []);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    if (selectedPolicy) {
      loadRules(selectedPolicy.id);
    } else {
      setRules([]);
    }
  }, [selectedPolicy]);

  const openAddPolicy = () => {
    setEditingPolicy(null);
    setPolicyCode(`POL-${Math.floor(1000 + Math.random() * 9000)}`);
    setPolicyName("");
    setPolicyDesc("");
    setPolicyDivision("ALL");
    setPolicyPosition("");
    setPolicyMinScore(0);
    setPolicyMaxScore(100);
    setPolicyBaseType("FIXED_AMOUNT");
    setPolicyBaseValue(1000000);
    setPolicyCalcMethod("SCORE_PROPORTIONAL");
    setPolicyStartDate(new Date().toISOString().split("T")[0]);
    setPolicyEndDate("");
    setPolicyActive(true);
    setIsPolicyModalOpen(true);
  };

  const openEditPolicy = (p: KpiIncentivePolicy) => {
    setEditingPolicy(p);
    setPolicyCode(p.code);
    setPolicyName(p.name);
    setPolicyDesc(p.description || "");
    setPolicyDivision(p.division || "ALL");
    setPolicyPosition(p.position || "");
    setPolicyMinScore(p.minimum_score);
    setPolicyMaxScore(p.maximum_score);
    setPolicyBaseType(p.base_incentive_type);
    setPolicyBaseValue(p.base_incentive_value);
    setPolicyCalcMethod(p.calculation_method);
    setPolicyStartDate(p.effective_start_date);
    setPolicyEndDate(p.effective_end_date || "");
    setPolicyActive(p.is_active);
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      code: policyCode,
      name: policyName,
      description: policyDesc || null,
      division: policyDivision === "ALL" ? null : policyDivision,
      position: policyPosition.trim() || null,
      minimum_score: Number(policyMinScore),
      maximum_score: Number(policyMaxScore),
      base_incentive_type: policyBaseType,
      base_incentive_value: Number(policyBaseValue),
      calculation_method: policyCalcMethod,
      effective_start_date: policyStartDate,
      effective_end_date: policyEndDate || null,
      is_active: policyActive
    };

    let res;
    if (editingPolicy) {
      res = await PayrollService.updateKpiIncentivePolicy(editingPolicy.id, payload, user.id);
    } else {
      res = await PayrollService.createKpiIncentivePolicy(payload, user.id);
    }

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Kebijakan insentif berhasil ${editingPolicy ? "diperbarui" : "dibuat"}.`);
      setIsPolicyModalOpen(false);
      await loadPolicies();
      if (!editingPolicy && res.data) {
        setSelectedPolicy(res.data);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kebijakan insentif ini? Tindakan ini tidak dapat dibatalkan jika kebijakan belum terikat transaksi.")) {
      return;
    }
    setLoading(true);
    const res = await PayrollService.deleteKpiIncentivePolicy(id, user.id);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Kebijakan insentif berhasil dihapus.");
      setSelectedPolicy(null);
      await loadPolicies();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
    setLoading(false);
  };

  const openAddRule = () => {
    setEditingRule(null);
    setRuleGrade("");
    setRuleMinScore(0);
    setRuleMaxScore(100);
    setRuleMultiplier(1.0000);
    setRuleFixedAmount("");
    setRulePercentage("");
    setRulePriority(1);
    setRuleActive(true);
    setIsRuleModalOpen(true);
  };

  const openEditRule = (r: KpiIncentiveRule) => {
    setEditingRule(r);
    setRuleGrade(r.grade || "");
    setRuleMinScore(r.min_score);
    setRuleMaxScore(r.max_score);
    setRuleMultiplier(r.multiplier);
    setRuleFixedAmount(r.fixed_amount ? String(r.fixed_amount) : "");
    setRulePercentage(r.percentage ? String(r.percentage) : "");
    setRulePriority(r.priority);
    setRuleActive(r.is_active);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      policy_id: selectedPolicy.id,
      grade: ruleGrade.trim() || null,
      min_score: Number(ruleMinScore),
      max_score: Number(ruleMaxScore),
      multiplier: Number(ruleMultiplier),
      fixed_amount: ruleFixedAmount ? Number(ruleFixedAmount) : null,
      percentage: rulePercentage ? Number(rulePercentage) : null,
      priority: Number(rulePriority),
      is_active: ruleActive
    };

    let res;
    if (editingRule) {
      res = await PayrollService.updateKpiIncentiveRule(editingRule.id, payload, user.id);
    } else {
      res = await PayrollService.createKpiIncentiveRule(payload, user.id);
    }

    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Aturan insentif berhasil ${editingRule ? "diperbarui" : "ditambahkan"}.`);
      setIsRuleModalOpen(false);
      await loadRules(selectedPolicy.id);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus aturan insentif ini?")) {
      return;
    }
    setLoading(true);
    const res = await PayrollService.deleteKpiIncentiveRule(id, user.id);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Aturan insentif berhasil dihapus.");
      if (selectedPolicy) await loadRules(selectedPolicy.id);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-950/80 border border-indigo-800 text-indigo-400 rounded-xl shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                Performance-Based Incentive Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Server-Side Policy Manager
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
              Aturan Kebijakan Insentif KPI
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Konfigurasi kebijakan insentif performa karyawan berbasis target KPI. Mesin penentu insentif multi-prioritas, dengan perlindungan imutabilitas saat payroll divalidasi.
            </p>
          </div>
        </div>

        {isManager && (
          <button
            onClick={openAddPolicy}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kebijakan Baru</span>
          </button>
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

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Policies List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Daftar Kebijakan Aktif</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Memuat kebijakan insentif...
            </div>
          ) : policies.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Belum ada kebijakan insentif yang terdaftar.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {policies.map((p) => {
                const isSelected = selectedPolicy?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPolicy(p)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-950/30 border-indigo-700 shadow-inner"
                        : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-wider block">
                          {p.code}
                        </span>
                        <h4 className="font-bold text-slate-200 text-xs mt-0.5">{p.name}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.is_active
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-850 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.description || "Tanpa deskripsi"}</p>

                    {/* Meta Targets */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                      <div>
                        <span className="text-slate-500 block">Target Divisi:</span>
                        <span className="text-slate-300 font-sans font-semibold">{p.division || "Semua Divisi"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Target Posisi:</span>
                        <span className="text-slate-300 font-sans font-semibold">{p.position || "Semua Posisi"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Rules & Details */}
        <div className="lg:col-span-7 space-y-6">
          {selectedPolicy ? (
            <>
              {/* Selected Policy Info Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-extrabold tracking-widest">{selectedPolicy.code}</span>
                    <h2 className="text-lg font-bold text-slate-100">{selectedPolicy.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedPolicy.description || "Tidak ada deskripsi kebijakan."}</p>
                  </div>
                  
                  {isManager && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditPolicy(selectedPolicy)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="Edit Kebijakan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(selectedPolicy.id)}
                        className="p-1.5 bg-rose-950/20 hover:bg-rose-900 border border-rose-900 text-rose-400 hover:text-rose-200 rounded-lg transition-all"
                        title="Hapus Kebijakan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Policy Specs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                    <span className="text-slate-500 block text-[10px] uppercase">Batas Skor KPI</span>
                    <span className="font-extrabold text-slate-200 font-mono">
                      {selectedPolicy.minimum_score} - {selectedPolicy.maximum_score}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                    <span className="text-slate-500 block text-[10px] uppercase">Metode Kalkulasi</span>
                    <span className="font-extrabold text-indigo-300">
                      {selectedPolicy.calculation_method}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 col-span-2 md:col-span-1">
                    <span className="text-slate-500 block text-[10px] uppercase">Dasar Insentif Acuan</span>
                    <div className="font-bold text-emerald-400">
                      {selectedPolicy.base_incentive_type === "FIXED_AMOUNT" 
                        ? `Rp ${(selectedPolicy.base_incentive_value ?? 0).toLocaleString("id-ID")}` 
                        : `${selectedPolicy.base_incentive_value}% (${selectedPolicy.base_incentive_type === "PERCENTAGE_OF_BASE_SALARY" ? "Gaji" : "Insentif"})`}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 col-span-2">
                    <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Periode Efektif Kebijakan</span>
                    </span>
                    <span className="font-bold text-slate-300 font-mono text-[11px]">
                      {selectedPolicy.effective_start_date} s/d {selectedPolicy.effective_end_date || "Seterusnya"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules List Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Rules &amp; Multiplier Skoring</h3>
                  </div>
                  
                  {isManager && (
                    <button
                      onClick={openAddRule}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tambah Rule</span>
                    </button>
                  )}
                </div>

                {rules.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Info className="w-8 h-8 text-slate-600" />
                    <p>Kebijakan ini belum memiliki aturan pengali insentif.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 border border-slate-750 flex items-center justify-center rounded-lg font-mono font-bold text-indigo-400">
                            P{rule.priority}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">
                              {selectedPolicy.calculation_method === "GRADE" ? (
                                <span>Grade KPI: <strong className="text-indigo-400 font-mono font-extrabold">{rule.grade || "C"}</strong></span>
                              ) : (
                                <span>Skor KPI: <strong className="text-slate-300 font-mono">{rule.min_score} - {rule.max_score}</strong></span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {rule.fixed_amount ? (
                                <span>Override Nominal: Rp {(rule.fixed_amount ?? 0).toLocaleString("id-ID")}</span>
                              ) : rule.percentage ? (
                                <span>Override Persentase: {rule.percentage}% dari Gaji Pokok</span>
                              ) : (
                                <span>Pengali Base: {rule.multiplier}x</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-indigo-300 font-mono bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-900">
                            {rule.multiplier}x
                          </span>
                          
                          {isManager && (
                            <div className="flex items-center gap-1 border-l border-slate-850 pl-2">
                              <button
                                onClick={() => openEditRule(rule)}
                                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                title="Edit Rule"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1 text-rose-500/70 hover:text-rose-400 transition-colors"
                                title="Hapus Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 shadow-sm flex flex-col items-center justify-center gap-4">
              <Scale className="w-12 h-12 text-indigo-500/20" />
              <div>
                <h4 className="font-bold text-slate-300 text-sm">Pilih Kebijakan Insentif</h4>
                <p className="text-slate-500 mt-1 max-w-sm">
                  Silakan pilih salah satu kebijakan dari menu di samping untuk melihat aturan bobot, pengali (multiplier), override nominal, dan detail efektivitas.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD/EDIT POLICY */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">
                {editingPolicy ? "Edit Kebijakan Insentif KPI" : "Buat Kebijakan Insentif Baru"}
              </h3>
              <button onClick={() => setIsPolicyModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Kode Kebijakan</label>
                  <input
                    type="text"
                    required
                    value={policyCode}
                    onChange={(e) => setPolicyCode(e.target.value)}
                    placeholder="Contoh: POL-KITCHEN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Nama Kebijakan</label>
                  <input
                    type="text"
                    required
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    placeholder="Contoh: Kebijakan Bonus Dapur"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-bold">Deskripsi Kebijakan</label>
                  <textarea
                    value={policyDesc}
                    onChange={(e) => setPolicyDesc(e.target.value)}
                    placeholder="Jelaskan cakupan dan peruntukan kebijakan insentif ini..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 h-16"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Target Divisi (Matching)</label>
                  <select
                    value={policyDivision}
                    onChange={(e) => setPolicyDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ALL">Semua Divisi (Global)</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BARISTA">Barista</option>
                    <option value="WAITER">Waiter</option>
                    <option value="CASHIER">Cashier / Kasir</option>
                    <option value="FINANCE">Finance</option>
                    <option value="CRM">CRM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Target Posisi (Matching)</label>
                  <input
                    type="text"
                    value={policyPosition}
                    onChange={(e) => setPolicyPosition(e.target.value)}
                    placeholder="Contoh: Cook, Barista, Waiter (Kosongkan jika semua)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Skor KPI Minimum</label>
                  <input
                    type="number"
                    required
                    value={policyMinScore}
                    onChange={(e) => setPolicyMinScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Skor KPI Maksimum</label>
                  <input
                    type="number"
                    required
                    value={policyMaxScore}
                    onChange={(e) => setPolicyMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Tipe Insentif Acuan (Base)</label>
                  <select
                    value={policyBaseType}
                    onChange={(e) => setPolicyBaseType(e.target.value as BaseIncentiveType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                    <option value="PERCENTAGE_OF_BASE_SALARY">% dari Gaji Pokok</option>
                    <option value="PERCENTAGE_OF_INCENTIVE_COMPONENT">% dari Komponen Insentif Kontrak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Nilai Insentif Acuan</label>
                  <input
                    type="number"
                    required
                    value={policyBaseValue}
                    onChange={(e) => setPolicyBaseValue(Number(e.target.value))}
                    placeholder="Contoh: 1000000 atau 10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Metode Kalkulasi Aturan</label>
                  <select
                    value={policyCalcMethod}
                    onChange={(e) => setPolicyCalcMethod(e.target.value as CalculationMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="SCORE_PROPORTIONAL">Proporsional Skor (Base * (Skor/100) * Mult)</option>
                    <option value="SCORE_MULTIPLIER">Pengali Skoring (Base * Mult)</option>
                    <option value="GRADE">Berdasarkan Abjad/Grade (Base * Mult)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Tanggal Mulai Efektif</label>
                  <input
                    type="date"
                    required
                    value={policyStartDate}
                    onChange={(e) => setPolicyStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Tanggal Berakhir Efektif (Optional)</label>
                  <input
                    type="date"
                    value={policyEndDate}
                    onChange={(e) => setPolicyEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 font-mono text-center"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="policyActive"
                    checked={policyActive}
                    onChange={(e) => setPolicyActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="policyActive" className="text-slate-300 font-bold cursor-pointer">Kebijakan Aktif</label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? "Menyimpan..." : "Simpan Kebijakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT RULE */}
      {isRuleModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">
                {editingRule ? "Edit Aturan Skoring" : "Tambah Aturan Skoring Baru"}
              </h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div className="space-y-3">
                {selectedPolicy.calculation_method === "GRADE" ? (
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Grade KPI (A, B, C, D, E, F)</label>
                    <input
                      type="text"
                      required
                      value={ruleGrade}
                      onChange={(e) => setRuleGrade(e.target.value.toUpperCase())}
                      placeholder="Contoh: A"
                      maxLength={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-extrabold font-mono"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Skor Minimal</label>
                      <input
                        type="number"
                        required
                        value={ruleMinScore}
                        onChange={(e) => setRuleMinScore(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Skor Maksimal</label>
                      <input
                        type="number"
                        required
                        value={ruleMaxScore}
                        onChange={(e) => setRuleMaxScore(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Pengali Insentif (Multiplier)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={ruleMultiplier}
                    onChange={(e) => setRuleMultiplier(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Override Spesifik (Opsional - Mengabaikan Base)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-medium">Nominal Override (Rp)</label>
                      <input
                        type="number"
                        value={ruleFixedAmount}
                        onChange={(e) => setRuleFixedAmount(e.target.value)}
                        placeholder="Contoh: 1500000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-medium">Persentase Override (%)</label>
                      <input
                        type="number"
                        value={rulePercentage}
                        onChange={(e) => setRulePercentage(e.target.value)}
                        placeholder="Contoh: 15"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Prioritas Evaluasi</label>
                    <input
                      type="number"
                      required
                      value={rulePriority}
                      onChange={(e) => setRulePriority(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-600 text-center font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="ruleActive"
                      checked={ruleActive}
                      onChange={(e) => setRuleActive(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-950 border-slate-800"
                    />
                    <label htmlFor="ruleActive" className="text-slate-300 font-bold cursor-pointer">Rule Aktif</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? "Menyimpan..." : "Simpan Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
