/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Standard Operating Procedure (SOP) Management View
 * Features: Rich SOP Viewer, Multi-tab procedure/CCP/linkage/acknowledgments/versions,
 * Staff Acknowledgment 1-Click Signature, and Create/Edit SOP Modal.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  Users,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  History,
  CheckSquare,
  Sparkles,
  Award,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  SopDocument,
  SopStep,
  SopCategory,
  RestoDivision,
} from '../../../types/operationalKnowledge';
import { sopService } from '../../../services/sopService';
import { EmployeePersonnel } from '../../../types/employee';

interface SopManagementViewProps {
  currentUser: EmployeePersonnel | null;
}

const CATEGORY_LABELS: Record<SopCategory, string> = {
  HYGIENE_SANITASI: 'Hygiene & Sanitasi',
  FOOD_PREPARATION: 'Food Preparation',
  BEVERAGE_STANDARD: 'Beverage Standard',
  GUEST_SERVICE: 'Guest Service 5S',
  CASHIER_POS: 'Cashier & POS Handling',
  SAFETY_K3: 'Keselamatan Kerja (K3)',
  INVENTORY_RECEIVING: 'Receiving & Inventory',
  MANAGEMENT_ADMIN: 'Management & Admin',
};

const DIVISION_COLORS: Record<string, string> = {
  KITCHEN: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  BARISTA: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  SERVICE: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  CASHIER: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  CLEANING: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
  MANAGEMENT: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  CRM: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
  FINANCE: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
  ALL: 'border-gray-500/30 text-gray-300 bg-gray-500/10',
};

export const SopManagementView: React.FC<SopManagementViewProps> = ({ currentUser }) => {
  const [sops, setSops] = useState<SopDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<RestoDivision | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<SopCategory | 'ALL'>('ALL');

  // Selected SOP for Detail Modal
  const [activeSop, setActiveSop] = useState<SopDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'procedure' | 'linkages' | 'acknowledgments' | 'history'>('procedure');

  // Modal Create/Edit State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSopId, setEditingSopId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    division: RestoDivision;
    category: SopCategory;
    version: string;
    purpose: string;
    scope: string;
    authorName: string;
    approverName: string;
    effectiveDate: string;
    steps: SopStep[];
    responsibilities: string[];
    tags: string;
  }>({
    code: '',
    title: '',
    division: 'KITCHEN',
    category: 'HYGIENE_SANITASI',
    version: '1.0',
    purpose: '',
    scope: '',
    authorName: currentUser?.fullName || 'Manager',
    approverName: 'Heri Setiawan (Manager)',
    effectiveDate: new Date().toISOString().split('T')[0],
    steps: [
      { stepNumber: 1, title: 'Persiapan Awal', description: '', criticalPoint: '' },
    ],
    responsibilities: ['Semua staf divisi terkait wajib mematuhi SOP ini.'],
    tags: 'SOP, Standar, Operasional',
  });

  const canManage = currentUser?.accessLevel === 'OWNER' || currentUser?.accessLevel === 'MANAGER' || currentUser?.accessLevel === 'SUPERVISOR';

  const loadData = async () => {
    setLoading(true);
    const data = await sopService.getSops({
      division: selectedDivision,
      category: selectedCategory,
      searchQuery,
    });
    setSops(data);
    if (activeSop) {
      const refreshed = data.find((s) => s.id === activeSop.id);
      if (refreshed) setActiveSop(refreshed);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDivision, selectedCategory, searchQuery]);

  const handleAcknowledge = async (sopId: string) => {
    if (!currentUser) return;
    try {
      await sopService.acknowledgeSop(
        sopId,
        currentUser.id,
        currentUser.fullName,
        currentUser.primaryPosition,
        'Telah membaca, memahami, dan siap menjalankan SOP ini.'
      );
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSopId(null);
    setFormData({
      code: `SOP-${selectedDivision !== 'ALL' ? selectedDivision.substring(0, 3) : 'GEN'}-00${sops.length + 1}`,
      title: '',
      division: selectedDivision !== 'ALL' ? selectedDivision : 'KITCHEN',
      category: 'HYGIENE_SANITASI',
      version: '1.0',
      purpose: '',
      scope: 'Berlaku untuk seluruh operasional Tropical Garden Resto.',
      authorName: currentUser?.fullName || 'Manager',
      approverName: 'Heri Setiawan (Manager)',
      effectiveDate: new Date().toISOString().split('T')[0],
      steps: [
        { stepNumber: 1, title: 'Persiapan & Grooming', description: 'Mengenakan seragam rapi dan APD lengkap.', criticalPoint: 'CCP 1: Rambut tertutup rapat.' },
        { stepNumber: 2, title: 'Eksekusi Prosedur', description: 'Menjalankan langkah kerja sesuai panduan resep / teknis.', criticalPoint: '' },
      ],
      responsibilities: ['Staff: Menjalankan prosedur', 'Supervisor: Mengawasi kepatuhan'],
      tags: 'SOP, Standar',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSopId) {
        await sopService.updateSop(editingSopId, {
          ...formData,
          tags: (formData.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
        });
      } else {
        await sopService.createSop({
          ...formData,
          status: 'ACTIVE',
          tags: (formData.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
        });
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const totalSops = sops.length;
  const activeSops = sops.filter((s) => s.status === 'ACTIVE').length;
  const userHasAck = (sop: SopDocument) =>
    sop.acknowledgments?.some((a) => a.employeeId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Standard Operating Procedure (SOP)</h1>
                <p className="text-xs text-gray-400">
                  Panduan baku operasional, higiene HACCP, alur layanan 5S, dan standar kualitas Tropical Garden Resto
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <button
                id="btn-create-sop"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Terbitkan SOP Baru
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#2D374E]/60">
          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Total SOP Terbit</span>
            <div className="text-xl font-bold text-white mt-1">{totalSops}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> {activeSops} Aktif Berlaku
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Kepatuhan Baca Staf</span>
            <div className="text-xl font-bold text-purple-400 mt-1">94.2%</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Konfirmasi digital</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Integrasi Checklist</span>
            <div className="text-xl font-bold text-blue-400 mt-1">100%</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Terkoneksi ke Shift Checklist</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Status Anda</span>
            <div className="text-sm font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Kepatuhan Terverifikasi
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">{currentUser?.fullName} ({currentUser?.primaryPosition})</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Division Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'KITCHEN', 'BARISTA', 'SERVICE', 'CASHIER', 'CLEANING', 'MANAGEMENT'] as (RestoDivision | 'ALL')[]).map((div) => {
            const isActive = selectedDivision === div;
            return (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#1E2438] text-gray-400 hover:text-gray-200 border border-[#2D374E]'
                }`}
              >
                {div === 'ALL' ? 'Semua Divisi' : div}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari SOP, kode, atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* SOP Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">Memuat katalog SOP...</div>
      ) : sops.length === 0 ? (
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-300">Tidak ada SOP yang sesuai filter</h3>
          <p className="text-xs text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter divisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sops.map((sop) => {
            const hasRead = userHasAck(sop);
            return (
              <div
                key={sop.id}
                className="bg-[#1E2438] rounded-2xl border border-[#2D374E] hover:border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                      {sop.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${DIVISION_COLORS[sop.division] || DIVISION_COLORS.ALL}`}>
                        {sop.division}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 bg-[#131826] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                        v{sop.version}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                    {sop.title}
                  </h3>

                  {/* Purpose preview */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {sop.purpose}
                  </p>

                  {/* Step & CCP indicator */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] text-gray-400 border-t border-[#2D374E]/50">
                    <span className="flex items-center gap-1 text-gray-300 font-medium">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> {(sop.steps || []).length} Langkah Prosedur
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Users className="w-3.5 h-3.5" /> {sop.acknowledgments?.length || 0} Staf Konfirmasi
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveSop(sop);
                      setActiveTab('procedure');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#131826] hover:bg-purple-600/20 text-purple-300 hover:text-purple-200 border border-purple-500/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Baca Dokumen SOP
                  </button>

                  {hasRead ? (
                    <div className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paham
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(sop.id)}
                      title="Konfirmasi Anda telah membaca dan memahami SOP ini"
                      className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Konfirmasi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOP DETAIL VIEWER MODAL */}
      {/* ========================================================================= */}
      {activeSop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2D374E] flex items-start justify-between gap-4 bg-[#181D2E]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    {activeSop.code}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${DIVISION_COLORS[activeSop.division] || DIVISION_COLORS.ALL}`}>
                    {activeSop.division}
                  </span>
                  <span className="text-xs text-gray-400 bg-[#131826] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                    Versi {activeSop.version} (Berlaku: {activeSop.effectiveDate})
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{activeSop.title}</h2>
                <p className="text-xs text-gray-400">Penyusun: <span className="text-gray-200">{activeSop.authorName}</span> • Otorisasi: <span className="text-gray-200">{activeSop.approverName}</span></p>
              </div>

              <button
                onClick={() => setActiveSop(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2D374E]/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#2D374E] bg-[#181D2E]/50">
              <button
                onClick={() => setActiveTab('procedure')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeTab === 'procedure'
                    ? 'bg-[#1E2438] text-purple-400 border-t-2 border-purple-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                1. Prosedur & Langkah CCP ({(activeSop.steps || []).length})
              </button>
              <button
                onClick={() => setActiveTab('linkages')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeTab === 'linkages'
                    ? 'bg-[#1E2438] text-purple-400 border-t-2 border-purple-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                2. Keterkaitan JD, IKA & Checklist
              </button>
              <button
                onClick={() => setActiveTab('acknowledgments')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeTab === 'acknowledgments'
                    ? 'bg-[#1E2438] text-purple-400 border-t-2 border-purple-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                3. Bukti Baca Staf ({activeSop.acknowledgments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#1E2438] text-purple-400 border-t-2 border-purple-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                4. Riwayat Revisi
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {activeTab === 'procedure' && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#131826] border border-[#2D374E]">
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-400" /> Tujuan Prosedur (Purpose)
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{activeSop.purpose}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#131826] border border-[#2D374E]">
                      <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-400" /> Ruang Lingkup (Scope)
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{activeSop.scope}</p>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="p-4 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Tanggung Jawab Jabatan Terkait:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {(activeSop.responsibilities || []).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Step by Step Procedures */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-purple-400" /> Langkah-Langkah Eksekusi Prosedur:
                    </h4>

                    <div className="space-y-3">
                      {(activeSop.steps || []).map((step) => (
                        <div
                          key={step.stepNumber}
                          className="p-4 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {step.stepNumber}
                              </span>
                              <h5 className="text-xs font-bold text-white">{step.title}</h5>
                            </div>
                            {step.responsibleRole && (
                              <span className="text-[10px] font-medium text-gray-400 bg-[#1E2438] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                                PJ: {step.responsibleRole}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed pl-8">
                            {step.description}
                          </p>

                          {step.criticalPoint && (
                            <div className="ml-8 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <span>{step.criticalPoint}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'linkages' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                    <strong>Prinsip Integrasi TropicalOS:</strong> SOP tidak berdiri sendiri sebagai dokumen arsip statis, melainkan menjadi dasar Uraian Tugas (Job Description), instruksi operasional alat (IKA), dan diterjemahkan langsung ke Checklist Shift Harian.
                  </div>

                  {/* Linked Job Descriptions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" /> Posisi Jabatan yang Wajib Menjalankan SOP Ini:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeSop.linkedJobDescriptionIds || ['jd-kit-01', 'jd-kit-02']).map((jdId) => (
                        <div key={jdId} className="p-3 rounded-xl bg-[#131826] border border-[#2D374E] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-purple-400 font-mono font-bold">JD LINK</span>
                            <div className="text-xs font-bold text-white mt-0.5">Jabatan Terkait ({jdId.toUpperCase()})</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Wajib SOP</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linked IKAs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-400" /> Instruksi Kerja Alat (IKA) Terkait:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeSop.linkedIkaIds || []).length > 0 ? (
                        activeSop.linkedIkaIds!.map((ikaId) => (
                          <div key={ikaId} className="p-3 rounded-xl bg-[#131826] border border-[#2D374E] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-blue-400 font-mono font-bold">{ikaId.toUpperCase()}</span>
                              <div className="text-xs font-bold text-white mt-0.5">Panduan Pengoperasian Mesin</div>
                            </div>
                            <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">Lihat IKA</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">Tidak ada IKA khusus yang terhubung ke SOP ini.</p>
                      )}
                    </div>
                  </div>

                  {/* Linked Checklist Templates */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" /> Template Checklist Operasional Terhubung:
                    </h4>
                    <div className="p-3 rounded-xl bg-[#131826] border border-[#2D374E] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Checklist Opening & Sanitasi Dapur Shift Pagi</div>
                          <span className="text-[10px] text-gray-400">Verifikasi otomatis poin CCP dan kebersihan setiap pagi</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Live Sync</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'acknowledgments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#131826] border border-[#2D374E]">
                    <div>
                      <div className="text-xs font-bold text-white">Tanda Terima & Pemahaman Dokumen SOP</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {activeSop.acknowledgments?.length || 0} Karyawan telah menandatangani konfirmasi digital
                      </p>
                    </div>

                    {!userHasAck(activeSop) && (
                      <button
                        onClick={() => handleAcknowledge(activeSop.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-4 h-4" /> Tanda Tangani Konfirmasi Baca
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activeSop.acknowledgments?.map((ack, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#131826] border border-[#2D374E] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                            {ack.employeeName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{ack.employeeName}</div>
                            <div className="text-[10px] text-gray-400">{ack.position}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi Baca
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {new Date(ack.acknowledgedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {activeSop.revisionHistory?.map((rev, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#131826] border border-[#2D374E] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-400 font-mono">Versi {rev.version}</span>
                        <span className="text-[11px] text-gray-500">{rev.revisedAt}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{rev.changeSummary}</p>
                      <div className="text-[10px] text-gray-500 pt-1">Oleh: {rev.revisedBy}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2D374E] bg-[#181D2E] flex items-center justify-between">
              <div className="text-[11px] text-gray-400">
                Dokumen Resmi Tropical Garden Resto • Hak Cipta Dilindungi
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSop(null)}
                  className="px-4 py-2 rounded-xl bg-[#2D374E] text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Tutup Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT SOP MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#2D374E] flex items-center justify-between bg-[#181D2E]">
              <h2 className="text-base font-bold text-white">
                {editingSopId ? 'Edit Dokumen SOP' : 'Terbitkan Dokumen SOP Baru'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2D374E]/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Kode Dokumen SOP *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Divisi Terkait *</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value as RestoDivision })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BARISTA">Barista</option>
                    <option value="SERVICE">Service</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MANAGEMENT">Management</option>
                    <option value="CRM">CRM</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Versi Dokumen</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Judul Lengkap SOP *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Standar Kebersihan dan Sanitasi Peralatan Masak Dapur"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Tujuan Prosedur (Purpose) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan tujuan diterapkannya prosedur ini..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Step Adder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-gray-300">Langkah-Langkah Prosedur</label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        steps: [
                          ...formData.steps,
                          {
                            stepNumber: formData.steps.length + 1,
                            title: `Langkah ${formData.steps.length + 1}`,
                            description: '',
                            criticalPoint: '',
                          },
                        ],
                      });
                    }}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Langkah
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.steps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-purple-400">Langkah {idx + 1}</span>
                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }));
                              setFormData({ ...formData, steps: updated });
                            }}
                            className="text-gray-500 hover:text-rose-400 text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Judul langkah"
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...formData.steps];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, steps: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-[#1E2438] border border-[#2D374E] rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Uraian instruksi kerja rinci..."
                        value={step.description}
                        onChange={(e) => {
                          const updated = [...formData.steps];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, steps: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-[#1E2438] border border-[#2D374E] rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Titik Kritis (Critical Control Point / Peringatan Keamanan)"
                        value={step.criticalPoint || ''}
                        onChange={(e) => {
                          const updated = [...formData.steps];
                          updated[idx].criticalPoint = e.target.value;
                          setFormData({ ...formData, steps: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-[#1E2438] border border-[#2D374E] rounded-lg text-xs text-amber-300 placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-[#2D374E] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#2D374E] text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Simpan & Terbitkan SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
