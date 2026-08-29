/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  ChecklistTemplate,
  ChecklistTemplateItem,
  ChecklistFrequency,
  ChecklistShiftType,
  ChecklistEvidenceType,
  HrDocument,
} from "../../types";
import { ChecklistService } from "../../services/checklistService";
import { HrDocumentService } from "../../services/hrDocumentService";
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  Copy,
  Edit2,
  Trash2,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Camera,
  FileCheck,
  Info,
} from "lucide-react";

interface ChecklistTemplateManagementViewProps {
  user: User;
}

export const ChecklistTemplateManagementView: React.FC<ChecklistTemplateManagementViewProps> = ({ user }) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [hrDocs, setHrDocs] = useState<HrDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState(user.role === "SUPERVISOR" ? user.division || "ALL" : "ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [division, setDivision] = useState(user.division || "KITCHEN");
  const [shiftType, setShiftType] = useState<ChecklistShiftType>("OPENING");
  const [roleTarget, setRoleTarget] = useState("STAFF");
  const [frequency, setFrequency] = useState<ChecklistFrequency>("DAILY");
  const [documentId, setDocumentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(true);
  const [passingScore, setPassingScore] = useState(80);

  // Items State
  const [items, setItems] = useState<
    {
      task_name: string;
      is_required: boolean;
      area: string;
      instructions: string;
      requires_evidence: boolean;
      evidence_type: ChecklistEvidenceType;
      weight: number;
      max_score: number;
    }[]
  >([
    {
      task_name: "Pengecekan kebersihan station & sanitasi",
      is_required: true,
      area: "Work Station",
      instructions: "Bersihkan permukaan dengan sanitizer standar SOP",
      requires_evidence: true,
      evidence_type: "PHOTO",
      weight: 1.0,
      max_score: 100.0,
    },
  ]);

  const [saving, setSaving] = useState(false);

  const canManage = user.role === "MANAGER" || user.role === "SUPERVISOR";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const divParam = divisionFilter !== "ALL" ? divisionFilter : undefined;
    const [tmplRes, docRes] = await Promise.all([
      ChecklistService.getChecklistTemplates(divParam),
      HrDocumentService.getDocuments(),
    ]);

    if (tmplRes.error) {
      setErrorMessage(tmplRes.error);
    } else {
      setTemplates(tmplRes.data);
    }

    if (!docRes.error) {
      setHrDocs(docRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [divisionFilter]);

  const resetForm = () => {
    setEditingTemplateId(null);
    setTitle("");
    setCode("");
    setDivision(user.division || "KITCHEN");
    setShiftType("OPENING");
    setRoleTarget("STAFF");
    setFrequency("DAILY");
    setDocumentId("");
    setDescription("");
    setRequiresVerification(true);
    setPassingScore(80);
    setItems([
      {
        task_name: "Pengecekan kebersihan station & sanitasi",
        is_required: true,
        area: "Work Station",
        instructions: "Bersihkan permukaan dengan sanitizer standar SOP",
        requires_evidence: true,
        evidence_type: "PHOTO",
        weight: 1.0,
        max_score: 100.0,
      },
    ]);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: ChecklistTemplate) => {
    setEditingTemplateId(tmpl.id);
    setTitle(tmpl.title);
    setCode(tmpl.code || "");
    setDivision(tmpl.division);
    setShiftType((tmpl.shift_type as ChecklistShiftType) || "ALL");
    setRoleTarget(tmpl.role_target || "STAFF");
    setFrequency((tmpl.frequency as ChecklistFrequency) || "DAILY");
    setDocumentId(tmpl.document_id || "");
    setDescription(tmpl.description || "");
    setRequiresVerification(tmpl.requires_verification !== false);
    setPassingScore(tmpl.passing_score ?? 80);

    if (tmpl.items && tmpl.items.length > 0) {
      setItems(
        tmpl.items.map((it) => ({
          task_name: it.task_name,
          is_required: it.is_required,
          area: it.area || "",
          instructions: it.instructions || it.instruction || "",
          requires_evidence: it.requires_evidence === true,
          evidence_type: it.evidence_type || "NONE",
          weight: it.weight ?? 1.0,
          max_score: it.max_score ?? 100.0,
        }))
      );
    } else {
      setItems([
        {
          task_name: "Item Operasional 1",
          is_required: true,
          area: "Area Utama",
          instructions: "",
          requires_evidence: false,
          evidence_type: "NONE",
          weight: 1.0,
          max_score: 100.0,
        },
      ]);
    }

    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        task_name: "",
        is_required: true,
        area: "",
        instructions: "",
        requires_evidence: false,
        evidence_type: "NONE",
        weight: 1.0,
        max_score: 100.0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    const res = await ChecklistService.duplicateChecklistTemplate(id);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage("Template berhasil diduplikasi");
      loadData();
    }
    setLoading(false);
  };

  const handleToggleStatus = async (tmpl: ChecklistTemplate) => {
    if (tmpl.is_active) {
      await ChecklistService.deactivateChecklistTemplate(tmpl.id);
    } else {
      await ChecklistService.activateChecklistTemplate(tmpl.id);
    }
    loadData();
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Judul checklist wajib diisi");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      code: code.trim() || undefined,
      division,
      shift_type: shiftType,
      role_target: roleTarget,
      frequency,
      document_id: documentId || null,
      description: description.trim() || null,
      requires_verification: requiresVerification,
      passing_score: passingScore,
      items: items.map((it, idx) => ({
        task_name: it.task_name || `Item ${idx + 1}`,
        task_order: idx + 1,
        sequence: idx + 1,
        is_required: it.is_required,
        area: it.area || undefined,
        instructions: it.instructions || undefined,
        requires_evidence: it.requires_evidence,
        evidence_type: it.evidence_type,
        weight: it.weight,
        max_score: it.max_score,
      })),
    };

    let res;
    if (editingTemplateId) {
      res = await ChecklistService.updateChecklistTemplate(editingTemplateId, payload);
    } else {
      res = await ChecklistService.createChecklistTemplate(payload);
    }

    setSaving(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(editingTemplateId ? "Template berhasil diperbarui" : "Template berhasil dibuat");
      setIsModalOpen(false);
      loadData();
    }
  };

  // Selected document info
  const selectedDoc = hrDocs.find((d) => d.id === documentId);

  // Filtered list
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesShift = shiftFilter === "ALL" || t.shift_type === shiftFilter;
    const matchesStatus =
      statusFilter === "ALL" || (statusFilter === "ACTIVE" ? t.is_active : !t.is_active);

    return matchesSearch && matchesShift && matchesStatus;
  });

  return (
    <div id="checklist-template-management" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm tracking-wide uppercase">
            <Layers className="w-4 h-4" /> Operational Checklist Architecture
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-100">Checklist Template Management</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Definisikan standar tugas harian, hubungkan langsung dengan dokumen SOP/IKA, dan atur kriteria bukti serta nilai kelulusan operasional.
          </p>
        </div>
        {canManage && (
          <button
            id="btn-create-checklist-template"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Buat Template Baru
          </button>
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
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-template"
              type="text"
              placeholder="Cari judul checklist, kode, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {user.role === "MANAGER" && (
              <select
                id="filter-division"
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
              id="filter-shift"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Shift</option>
              <option value="OPENING">Opening</option>
              <option value="MIDDLE">Middle</option>
              <option value="CLOSING">Closing</option>
              <option value="CUSTOM">Custom</option>
            </select>

            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat data template checklist...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
          <CheckSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="font-medium text-slate-300">Belum ada template checklist</p>
          <p className="text-xs text-slate-500 mt-1">
            Buat template baru untuk menetapkan SOP operasional harian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              id={`template-card-${tmpl.id}`}
              className={`bg-slate-900 border ${
                tmpl.is_active ? "border-slate-800 hover:border-slate-700" : "border-slate-800/60 opacity-75"
              } rounded-xl p-5 flex flex-col justify-between transition-all shadow-sm`}
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      {tmpl.division}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                      {tmpl.shift_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                      {tmpl.frequency || "DAILY"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      tmpl.is_active
                        ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tmpl.is_active ? "Aktif" : "Non-Aktif"}
                  </span>
                </div>

                {/* Title & Code */}
                <h3 className="font-semibold text-slate-100 text-base line-clamp-1">{tmpl.title}</h3>
                {tmpl.code && <p className="text-xs text-slate-500 font-mono mt-0.5">{tmpl.code}</p>}

                {tmpl.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{tmpl.description}</p>
                )}

                {/* Linked Document Indicator */}
                {tmpl.document_title ? (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2 text-xs">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Sumber Dokumen:</span>
                      <p className="text-slate-200 font-medium line-clamp-1">
                        {tmpl.document_code ? `[${tmpl.document_code}] ` : ""}
                        {tmpl.document_title}
                      </p>
                      {tmpl.document_status && tmpl.document_status !== "ACTIVE" && tmpl.document_status !== "APPROVED" && (
                        <span className="text-amber-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> Status Dokumen: {tmpl.document_status}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2 rounded-lg bg-slate-950/40 border border-slate-800/40 text-xs text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Standar Independen (Tanpa Dokumen Terhubung)
                  </div>
                )}

                {/* Meta details */}
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Jumlah Tugas:</span>
                    <p className="font-medium text-slate-200">{tmpl.items?.length || 0} Item</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Passing Score:</span>
                    <p className="font-medium text-emerald-400">{tmpl.passing_score || 80}%</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(tmpl)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      tmpl.is_active
                        ? "border-slate-700 text-slate-400 hover:text-slate-200"
                        : "border-emerald-800 text-emerald-400 hover:bg-emerald-950/40"
                    }`}
                  >
                    {tmpl.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(tmpl.id)}
                      title="Duplikasi Template"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(tmpl)}
                      title="Edit Template"
                      className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-lg">
                  {editingTemplateId ? "Edit Template Checklist" : "Buat Template Checklist Baru"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Judul Template Checklist <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kitchen Opening & Food Hygiene Checklist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Kode Template (Opsional)</label>
                  <input
                    type="text"
                    placeholder="CHK-KIT-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Divisi Target</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Shift Type</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as ChecklistShiftType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Shift (All)</option>
                    <option value="OPENING">Opening</option>
                    <option value="MIDDLE">Middle</option>
                    <option value="CLOSING">Closing</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Frekuensi</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ChecklistFrequency)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DAILY">Harian (Daily)</option>
                    <option value="WEEKLY">Mingguan (Weekly)</option>
                    <option value="MONTHLY">Bulanan (Monthly)</option>
                    <option value="ADHOC">Ad-Hoc / On-Demand</option>
                  </select>
                </div>

                {/* Hubungkan Dokumen SOP / IKA */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Hubungkan Dokumen SOP / IKA
                  </label>
                  <select
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Tanpa Dokumen SOP / Standar Bebas --</option>
                    {hrDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        [{doc.document_type}] {doc.document_code ? `${doc.document_code} - ` : ""}
                        {doc.title} (v{doc.version || "1.0"})
                      </option>
                    ))}
                  </select>
                  {selectedDoc && (
                    <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-2">
                      <span>Status Dokumen:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          selectedDoc.status === "ACTIVE" || selectedDoc.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {selectedDoc.status}
                      </span>
                      {selectedDoc.status !== "ACTIVE" && selectedDoc.status !== "APPROVED" && (
                        <span className="text-amber-400 text-[11px]">
                          (Perhatian: Dokumen belum disetujui penuh)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Passing Score Minimal (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi / Ruang Lingkup</label>
                  <textarea
                    rows={2}
                    placeholder="Penjelasan ringkas panduan dan tujuan checklist ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Checklist Items Editor */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">Daftar Item Tugas Checklist</h4>
                    <p className="text-xs text-slate-400">
                      Tentukan urutan langkah, kriteria wajib, dan jenis bukti yang harus diunggah staf.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Tambah Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">Tugas #{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, "up")}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMoveItem(idx, "down")}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Nama tugas/kegiatan yang harus diselesaikan..."
                            value={it.task_name}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].task_name = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Area / Posisi (misal: Storage Room)"
                            value={it.area}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].area = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <input
                            type="text"
                            placeholder="Instruksi detail / Standar baku operasional..."
                            value={it.instructions}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].instructions = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Toggles and evidence requirement */}
                        <div className="md:col-span-3 flex flex-wrap items-center gap-4 pt-1 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={it.is_required}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx].is_required = e.target.checked;
                                setItems(newItems);
                              }}
                              className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                            />
                            Wajib Diselesaikan (Required)
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={it.requires_evidence}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx].requires_evidence = e.target.checked;
                                if (e.target.checked && newItems[idx].evidence_type === "NONE") {
                                  newItems[idx].evidence_type = "PHOTO";
                                }
                                setItems(newItems);
                              }}
                              className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                            />
                            Wajib Bukti (Evidence)
                          </label>

                          {it.requires_evidence && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Tipe Bukti:</span>
                              <select
                                value={it.evidence_type}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].evidence_type = e.target.value as ChecklistEvidenceType;
                                  setItems(newItems);
                                }}
                                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="PHOTO">Foto (Photo)</option>
                                <option value="DOCUMENT">Dokumen (PDF/Doc)</option>
                                <option value="NOTE">Catatan (Note)</option>
                                <option value="PHOTO_AND_NOTE">Foto & Catatan</option>
                              </select>
                            </div>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-slate-500">Bobot:</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="10"
                              value={it.weight}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx].weight = Number(e.target.value);
                                setItems(newItems);
                              }}
                              className="w-14 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Clock className="w-3.5 h-3.5 animate-spin" />}
                  {editingTemplateId ? "Simpan Perubahan" : "Buat Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
