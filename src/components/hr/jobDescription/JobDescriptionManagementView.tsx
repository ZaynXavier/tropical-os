/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Job Description (JD) Management View
 * Features: Master Job Descriptions for all restaurant positions, core duties,
 * KPI metrics, qualifications, and linkage to SOPs, IKAs, and Checklists.
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  Target,
  FileCheck,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  JobDescriptionDocument,
  JobGradeLevel,
  RestoDivision,
} from '../../../types/operationalKnowledge';
import { jobDescriptionService } from '../../../services/jobDescriptionService';
import { EmployeePersonnel } from '../../../types/employee';

interface JobDescriptionManagementViewProps {
  currentUser: EmployeePersonnel | null;
}

const GRADE_BADGES: Record<JobGradeLevel, { label: string; color: string }> = {
  STAFF: { label: 'Staff Pelaksana', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  SENIOR_STAFF: { label: 'Senior Staff', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
  HELPER: { label: 'Daily Worker / Helper', color: 'border-teal-500/30 text-teal-400 bg-teal-500/10' },
  SUPERVISOR: { label: 'Supervisor / Spv', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  MANAGEMENT: { label: 'Department Manager', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  EXECUTIVE: { label: 'Executive / Owner', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
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

export const JobDescriptionManagementView: React.FC<JobDescriptionManagementViewProps> = ({ currentUser }) => {
  const [jds, setJds] = useState<JobDescriptionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<RestoDivision | 'ALL'>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<JobGradeLevel | 'ALL'>('ALL');

  // Selected JD for Detail Dossier
  const [activeJd, setActiveJd] = useState<JobDescriptionDocument | null>(null);

  // Create / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<JobDescriptionDocument>>({
    positionCode: '',
    positionTitle: '',
    department: 'Kitchen Department',
    division: 'KITCHEN',
    gradeLevel: 'STAFF',
    reportsTo: 'Head Chef',
    jobSummary: '',
    coreResponsibilities: ['Melaksanakan persiapan dan eksekusi operasional harian.'],
    keyPerformanceIndicators: [{ kpiName: 'Kepatuhan SOP & Checklist', targetMetric: '≥ 95%' }],
    qualifications: ['Pendidikan minimal SMK Tata Boga / Hospitality', 'Pengalaman kerja relevan'],
    requiredSopIds: [],
    requiredIkaIds: [],
  });

  const canManage = currentUser?.accessLevel === 'OWNER' || currentUser?.accessLevel === 'MANAGER' || currentUser?.accessLevel === 'SUPERVISOR';

  const loadData = async () => {
    setLoading(true);
    const data = await jobDescriptionService.getJobDescriptions({
      division: selectedDivision,
      gradeLevel: selectedGrade,
      searchQuery,
    });
    setJds(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDivision, selectedGrade, searchQuery]);

  const handleOpenCreateModal = () => {
    setFormData({
      positionCode: `JD-${selectedDivision !== 'ALL' ? selectedDivision.substring(0, 3) : 'GEN'}-00${jds.length + 1}`,
      positionTitle: '',
      department: `${selectedDivision !== 'ALL' ? selectedDivision : 'Kitchen'} Department`,
      division: selectedDivision !== 'ALL' ? selectedDivision : 'KITCHEN',
      gradeLevel: 'STAFF',
      reportsTo: 'Supervisor / Manager',
      jobSummary: '',
      coreResponsibilities: ['Melaksanakan tugas operasional harian sesuai standar mutu resto.'],
      keyPerformanceIndicators: [{ kpiName: 'Kepatuhan Checklist', targetMetric: '100%' }],
      qualifications: ['Pengalaman minimal 1 tahun di bidang resto/hospitality'],
      requiredSopIds: [],
      requiredIkaIds: [],
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await jobDescriptionService.createJobDescription(formData as any);
      setIsFormModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Master Job Descriptions & Uraian Jabatan</h1>
                <p className="text-xs text-gray-400">
                  Struktur jabatan, uraian tugas pokok, indikator kinerja (KPI), serta kompetensi teknis seluruh staf Tropical Garden
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <button
                id="btn-create-jd"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Job Description
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#2D374E]/60">
          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Total Posisi Jabatan</span>
            <div className="text-xl font-bold text-white mt-1">{jds.length} Role</div>
            <span className="text-[10px] text-blue-400 mt-0.5">8 Divisi Lengkap</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Total Personel Aktif</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">24 Karyawan</div>
            <span className="text-[10px] text-gray-400 mt-0.5">100% Memiliki JD</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Penyelarasan KPI</span>
            <div className="text-xl font-bold text-purple-400 mt-1">100%</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Terhubung Performance Log</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Jabatan Anda</span>
            <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> {currentUser?.primaryPosition || 'Staff'}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">{currentUser?.division}</span>
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#1E2438] text-gray-400 hover:text-gray-200 border border-[#2D374E]'
                }`}
              >
                {div === 'ALL' ? 'Semua Divisi' : div}
              </button>
            );
          })}
        </div>

        {/* Grade & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="px-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Tingkat (Grade)</option>
            <option value="STAFF">Staff Pelaksana</option>
            <option value="SENIOR">Senior Staff</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="HEAD">Head Section</option>
            <option value="MANAGER">Manager</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama jabatan / tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* JD Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">Memuat katalog Uraian Jabatan...</div>
      ) : jds.length === 0 ? (
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-12 text-center">
          <Briefcase className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-300">Tidak ada Job Description yang sesuai filter</h3>
          <p className="text-xs text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter divisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jds.map((jd) => {
            const gradeInfo = GRADE_BADGES[jd.gradeLevel] || GRADE_BADGES.STAFF;
            return (
              <div
                key={jd.id}
                className="bg-[#1E2438] rounded-2xl border border-[#2D374E] hover:border-blue-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                      {jd.positionCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${gradeInfo.color}`}>
                      {gradeInfo.label}
                    </span>
                  </div>

                  {/* Title & Department */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                      {jd.positionTitle}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-gray-500" /> {jd.department}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {jd.jobSummary}
                  </p>

                  {/* Quick Specs */}
                  <div className="p-3 rounded-xl bg-[#131826] border border-[#2D374E]/60 space-y-1.5 text-xs text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px]">Atasan Langsung:</span>
                      <span className="font-semibold text-gray-200">{jd.reportsToPosition || (jd as any).reportsTo || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px]">Indikator Utama (KPI):</span>
                      <span className="font-bold text-emerald-400">{(jd.keyPerformanceIndicators || []).length} Target</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-[#2D374E]/60">
                  <button
                    onClick={() => setActiveJd(jd)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#131826] hover:bg-blue-600/20 text-blue-300 hover:text-blue-200 border border-blue-500/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Lihat Dossier Uraian Jabatan <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* JD DOSSIER MODAL */}
      {/* ========================================================================= */}
      {activeJd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2D374E] flex items-start justify-between gap-4 bg-[#181D2E]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {activeJd.positionCode}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${(GRADE_BADGES[activeJd.gradeLevel] || GRADE_BADGES.STAFF).color}`}>
                    {(GRADE_BADGES[activeJd.gradeLevel] || GRADE_BADGES.STAFF).label}
                  </span>
                  <span className="text-xs text-gray-400 bg-[#131826] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                    {activeJd.department}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeJd.positionTitle}</h2>
                <p className="text-xs text-gray-400">
                  Struktur Organisasi: Melapor kepada <strong className="text-white">{activeJd.reportsToPosition || (activeJd as any).reportsTo || '-'}</strong>
                  {(activeJd.directSubordinates || (activeJd as any).subordinates || []).length > 0 && (
                    <span> • Membawahi: <strong className="text-white">{(activeJd.directSubordinates || (activeJd as any).subordinates || []).join(', ')}</strong></span>
                  )}
                </p>
              </div>

              <button
                onClick={() => setActiveJd(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2D374E]/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-[#131826] border border-[#2D374E]">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Ikhtisar & Tujuan Jabatan (Job Summary)
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">{activeJd.jobSummary}</p>
              </div>

              {/* Core Responsibilities */}
              <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" /> Tugas Pokok & Tanggung Jawab Utama:
                </h4>
                <div className="space-y-2">
                  {(activeJd.coreDuties || (activeJd as any).coreResponsibilities || []).map((dutyItem: any, idx: number) => {
                    const dutyText = typeof dutyItem === 'string' ? dutyItem : dutyItem.duty;
                    const freq = typeof dutyItem === 'object' ? dutyItem.frequency : null;
                    const output = typeof dutyItem === 'object' ? dutyItem.standardOutput : null;
                    return (
                      <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#1E2438]/50 border border-[#2D374E]/40 text-xs text-gray-300">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-md bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium text-gray-200">{dutyText}</span>
                        </div>
                        {(freq || output) && (
                          <div className="ml-8 flex items-center gap-2 text-[10px] text-gray-400">
                            {freq && <span className="bg-[#131826] px-2 py-0.5 rounded border border-[#2D374E] text-blue-300">{freq}</span>}
                            {output && <span>Output Baku: <strong className="text-emerald-400">{output}</strong></span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KPIs */}
              <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Key Performance Indicators (KPI Target Kinerja):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeJd.keyPerformanceIndicators || []).map((kpi: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#1E2438] border border-[#2D374E] flex items-center justify-between">
                      <div className="pr-2">
                        <div className="text-xs font-bold text-white">{kpi.indicatorName || kpi.kpiName}</div>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{kpi.targetDescription || 'Target Evaluasi Berkala'}</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                        {kpi.weightPercentage ? `${kpi.weightPercentage}% Bobot` : (kpi.targetMetric || 'Target KPI')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-400" /> Kualifikasi & Kompetensi Minimum:
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  {typeof activeJd.qualifications === 'object' && activeJd.qualifications !== null ? (
                    <>
                      {activeJd.qualifications.education && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>Pendidikan: <strong className="text-white">{activeJd.qualifications.education}</strong></span>
                        </div>
                      )}
                      {activeJd.qualifications.experience && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>Pengalaman: <strong className="text-white">{activeJd.qualifications.experience}</strong></span>
                        </div>
                      )}
                      {(activeJd.qualifications.skills || []).length > 0 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>Keahlian Teknis: <span className="text-gray-200">{(activeJd.qualifications.skills || []).join(', ')}</span></span>
                        </div>
                      )}
                      {(activeJd.qualifications.certifications || []).length > 0 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>Sertifikasi: <span className="text-gray-200">{(activeJd.qualifications.certifications || []).join(', ')}</span></span>
                        </div>
                      )}
                    </>
                  ) : Array.isArray(activeJd.qualifications) ? (
                    (activeJd.qualifications as string[]).map((q, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Kualifikasi sesuai standar divisi.</p>
                  )}
                </div>
              </div>

              {/* Connected Knowledge & SOPs */}
              <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Integrasi SOP & Checklist Operasional Wajib:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">SOP INTEGRATION</span>
                      <div className="text-xs font-bold text-white mt-0.5">SOP Standar Divisi {activeJd.division}</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Wajib Baca</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-blue-400 font-mono font-bold">DAILY CHECKLIST</span>
                      <div className="text-xs font-bold text-white mt-0.5">Checklist Shift Opening & Closing</div>
                    </div>
                    <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">Eksekusi Harian</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2D374E] bg-[#181D2E] flex items-center justify-between">
              <div className="text-[11px] text-gray-400">
                Master Job Description Tropical Garden Resto • Terintegrasi dengan Sistem HR & KPI
              </div>

              <button
                onClick={() => setActiveJd(null)}
                className="px-4 py-2 rounded-xl bg-[#2D374E] text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE JD MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#2D374E] flex items-center justify-between bg-[#181D2E]">
              <h2 className="text-base font-bold text-white">Tambah Job Description Baru</h2>
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
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Kode Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.positionCode}
                    onChange={(e) => setFormData({ ...formData, positionCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Nama Jabatan (Position Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Demi Chef de Partie"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Tingkat (Grade) *</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STAFF">Staff Pelaksana</option>
                    <option value="SENIOR">Senior Staff</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="HEAD">Head Section</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Ikhtisar Jabatan (Job Summary) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan peran dan tujuan utama jabatan ini..."
                  value={formData.jobSummary}
                  onChange={(e) => setFormData({ ...formData, jobSummary: e.target.value })}
                  className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Simpan Job Description
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
