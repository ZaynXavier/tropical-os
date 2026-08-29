/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Instruksi Kerja Alat (IKA) Management View
 * Features: Step-by-step equipment operational manual, safety hazards (K3),
 * required PPE/APD, troubleshooting matrices, and preventive maintenance.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  IkaDocument,
  RestoDivision,
} from '../../../types/operationalKnowledge';
import { ikaService } from '../../../services/ikaService';
import { EmployeePersonnel } from '../../../types/employee';

interface IkaManagementViewProps {
  currentUser: EmployeePersonnel | null;
}

const HAZARD_BADGES: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Bahaya Ringan', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  MEDIUM: { label: 'Bahaya Sedang', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  HIGH: { label: 'Bahaya Tinggi (K3)', color: 'border-orange-500/30 text-orange-400 bg-orange-500/10' },
  CRITICAL: { label: 'Bahaya Kritis (K3)', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
};

const DIVISION_COLORS: Record<string, string> = {
  KITCHEN: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  BARISTA: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  SERVICE: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  CASHIER: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  CLEANING: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
  MANAGEMENT: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  ALL: 'border-gray-500/30 text-gray-300 bg-gray-500/10',
};

export const IkaManagementView: React.FC<IkaManagementViewProps> = ({ currentUser }) => {
  const [ikas, setIkas] = useState<IkaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<RestoDivision | 'ALL'>('ALL');

  // Selected IKA for Manual Viewer
  const [activeIka, setActiveIka] = useState<IkaDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'operation' | 'safety' | 'troubleshoot' | 'maintenance'>('operation');

  // Create Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<IkaDocument>>({
    code: '',
    title: '',
    equipmentName: '',
    brandModel: '',
    locationStation: 'Hot Kitchen Line',
    division: 'KITCHEN',
    hazardLevel: 'MEDIUM',
    requiredPpe: ['Sarung Tangan Panas / Tahan Panas'],
    operationSteps: [{ stepNumber: 1, action: 'Nyalakan switch utama', keyCheck: 'Indikator menyala hijau' }],
    cleaningSteps: ['Tunggu dingin sebelum dibersihkan', 'Lap dengan kain microfiber lembap'],
    troubleshooting: [{ symptom: 'Mesin tidak menyala', possibleCause: 'Kabel power longgar', solution: 'Periksa colokan listrik' }],
    maintenanceSchedule: 'Preventive service berkala setiap 3 bulan.',
  });

  const canManage = currentUser?.accessLevel === 'OWNER' || currentUser?.accessLevel === 'MANAGER' || currentUser?.accessLevel === 'SUPERVISOR';

  const loadData = async () => {
    setLoading(true);
    const data = await ikaService.getIkas({
      division: selectedDivision,
      searchQuery,
    });
    setIkas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDivision, searchQuery]);

  const handleOpenCreateModal = () => {
    setFormData({
      code: `IKA-${selectedDivision !== 'ALL' ? selectedDivision.substring(0, 3) : 'KIT'}-00${ikas.length + 1}`,
      title: '',
      equipmentName: '',
      brandModel: '',
      locationStation: `${selectedDivision !== 'ALL' ? selectedDivision : 'Kitchen'} Station`,
      division: selectedDivision !== 'ALL' ? selectedDivision : 'KITCHEN',
      hazardLevel: 'MEDIUM',
      requiredPpe: ['Sarung Tangan Pelindung', 'Sepatu Safety Anti-Selip'],
      operationSteps: [
        { stepNumber: 1, action: 'Pemeriksaan Visual Awal & Sambungan Listrik/Gas', keyCheck: 'Tidak ada bau bocor atau kabel terkelupas' },
        { stepNumber: 2, action: 'Nyalakan Unit & Atur Parameter Operasional', keyCheck: 'Display menyala normal' },
      ],
      cleaningSteps: ['Matikan arus listrik utama', 'Bersihkan wadah dan lap kering'],
      troubleshooting: [{ symptom: 'Alat tidak merespons', possibleCause: 'Sekring MCB / Steker', solution: 'Laporkan ke teknisi/SPV' }],
      maintenanceSchedule: 'Pengecekan teknis mingguan & servis berkala 3 bulan.',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ikaService.createIka(formData as any);
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
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Instruksi Kerja Alat (IKA) & Manual Mesin</h1>
                <p className="text-xs text-gray-400">
                  Panduan teknis pengoperasian mesin resto, standar keselamatan K3, sanitasi peralatan, dan matriks pemecahan masalah
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <button
                id="btn-create-ika"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Instruksi Kerja Alat
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#2D374E]/60">
          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Total Alat Terdaftar</span>
            <div className="text-xl font-bold text-white mt-1">{ikas.length} Mesin</div>
            <span className="text-[10px] text-amber-400 mt-0.5">Kitchen, Bar, & Service</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Standar APD & K3</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">100% Wajib</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Zero Accident Target</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Troubleshooting Solutif</span>
            <div className="text-xl font-bold text-blue-400 mt-1">Lengkap</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Panduan penanganan mandiri</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131826] border border-[#2D374E]/40">
            <span className="text-[11px] font-medium text-gray-400">Integrasi Checklist</span>
            <div className="text-xl font-bold text-purple-400 mt-1">Terhubung</div>
            <span className="text-[10px] text-gray-400 mt-0.5">Verifikasi pembersihan harian</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Division Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'KITCHEN', 'BARISTA', 'SERVICE', 'CASHIER', 'CLEANING'] as (RestoDivision | 'ALL')[]).map((div) => {
            const isActive = selectedDivision === div;
            return (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
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
            placeholder="Cari nama mesin, merek, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* IKA Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">Memuat katalog Instruksi Kerja Alat...</div>
      ) : ikas.length === 0 ? (
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-12 text-center">
          <Cpu className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-300">Tidak ada IKA yang sesuai filter</h3>
          <p className="text-xs text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter divisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ikas.map((ika) => {
            const hazard = HAZARD_BADGES[(ika as any).hazardLevel || 'MEDIUM'] || HAZARD_BADGES.MEDIUM;
            const stepsCount = (ika.steps || (ika as any).operationSteps || []).length;
            const ppeCount = (ika.safetyEquipment || (ika as any).requiredPpe || []).length;
            const tbCount = (ika.troubleshootingGuide || (ika as any).troubleshooting || []).length;

            return (
              <div
                key={ika.id}
                className="bg-[#1E2438] rounded-2xl border border-[#2D374E] hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {ika.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${hazard.color}`}>
                      {hazard.label}
                    </span>
                  </div>

                  {/* Title & Equipment */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {ika.title}
                    </h3>
                    <div className="text-xs font-semibold text-gray-300 mt-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {ika.equipmentName} {ika.brandModel ? `(${ika.brandModel})` : ''}
                    </div>
                  </div>

                  {/* Station & APD */}
                  <div className="p-3 rounded-xl bg-[#131826] border border-[#2D374E]/60 space-y-1.5 text-xs text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px]">Lokasi Penempatan:</span>
                      <span className="font-semibold text-gray-200">{ika.locationStation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px]">APD Wajib:</span>
                      <span className="font-medium text-amber-300">{ppeCount} Perlengkapan</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] text-gray-400 border-t border-[#2D374E]/50">
                    <span className="flex items-center gap-1 text-gray-300 font-medium">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> {stepsCount} Tahap Kerja
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 font-medium">
                      <Wrench className="w-3.5 h-3.5" /> {tbCount} Solusi Masalah
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-[#2D374E]/60">
                  <button
                    onClick={() => {
                      setActiveIka(ika);
                      setActiveTab('operation');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#131826] hover:bg-amber-600/20 text-amber-300 hover:text-amber-200 border border-amber-500/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Buka Panduan & Manual Mesin <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* IKA MANUAL VIEWER MODAL */}
      {/* ========================================================================= */}
      {activeIka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2D374E] flex items-start justify-between gap-4 bg-[#181D2E]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {activeIka.code}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${(HAZARD_BADGES[(activeIka as any).hazardLevel || 'MEDIUM'] || HAZARD_BADGES.MEDIUM).color}`}>
                    {(HAZARD_BADGES[(activeIka as any).hazardLevel || 'MEDIUM'] || HAZARD_BADGES.MEDIUM).label}
                  </span>
                  <span className="text-xs text-gray-400 bg-[#131826] px-2 py-0.5 rounded-lg border border-[#2D374E]">
                    {activeIka.locationStation}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{activeIka.title}</h2>
                <p className="text-xs text-gray-300">
                  Mesin: <strong className="text-amber-400">{activeIka.equipmentName}</strong> {activeIka.brandModel ? `• Model: ${activeIka.brandModel}` : ''}
                </p>
              </div>

              <button
                onClick={() => setActiveIka(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2D374E]/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#2D374E] bg-[#181D2E]/50 overflow-x-auto">
              <button
                onClick={() => setActiveTab('operation')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'operation'
                    ? 'bg-[#1E2438] text-amber-400 border-t-2 border-amber-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                1. Langkah Pengoperasian ({(activeIka.steps || (activeIka as any).operationSteps || []).length})
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'safety'
                    ? 'bg-[#1E2438] text-amber-400 border-t-2 border-amber-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                2. Standar APD & Keselamatan (K3)
              </button>
              <button
                onClick={() => setActiveTab('troubleshoot')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'troubleshoot'
                    ? 'bg-[#1E2438] text-amber-400 border-t-2 border-amber-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                3. Matriks Troubleshooting ({(activeIka.troubleshootingGuide || (activeIka as any).troubleshooting || []).length})
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'maintenance'
                    ? 'bg-[#1E2438] text-amber-400 border-t-2 border-amber-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                4. Sanitasi & Preventive Service
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {activeTab === 'operation' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <strong>Peringatan Operator:</strong> Pastikan seluruh APD telah dikenakan sebelum menyalakan daya mesin. Jangan meninggalkan mesin tanpa pengawasan saat beroperasi.
                  </div>

                  <div className="space-y-3">
                    {(activeIka.steps || (activeIka as any).operationSteps || []).map((step: any, idx: number) => {
                      const stepNum = step.stepNumber || idx + 1;
                      const title = step.title || step.action;
                      const instruction = step.instruction || step.action;
                      const caution = step.safetyWarning;
                      const keyCheck = step.keyCheck;

                      return (
                        <div
                          key={stepNum}
                          className="p-4 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {stepNum}
                            </span>
                            <span className="text-xs font-bold text-white leading-relaxed">{title}</span>
                          </div>

                          {instruction && instruction !== title && (
                            <p className="ml-9 text-xs text-gray-300 leading-relaxed">{instruction}</p>
                          )}

                          {keyCheck && (
                            <div className="ml-9 p-2.5 rounded-lg bg-[#1E2438] border border-[#2D374E] text-xs text-emerald-400 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>Indikator Keberhasilan: <strong className="text-gray-200">{keyCheck}</strong></span>
                            </div>
                          )}

                          {caution && (
                            <div className="ml-9 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <span><strong>Peringatan K3:</strong> {caution}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" /> Alat Pelindung Diri (APD / PPE) Wajib Digunakan:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeIka.safetyEquipment || (activeIka as any).requiredPpe || []).map((ppe: string, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-[#1E2438] border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          <span>{ppe}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety warnings from steps or custom */}
                  {((activeIka as any).safetyHazards || (activeIka.steps || []).filter((s: any) => s.safetyWarning)).length > 0 && (
                    <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Potensi Bahaya & Tindakan Pencegahan K3:
                      </h4>
                      <ul className="space-y-2 text-xs text-gray-300">
                        {((activeIka as any).safetyHazards || []).map((hazard: string, i: number) => (
                          <li key={`h-${i}`} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{hazard}</span>
                          </li>
                        ))}
                        {(activeIka.steps || []).filter((s: any) => s.safetyWarning).map((step: any, i: number) => (
                          <li key={`sw-${i}`} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Langkah {step.stepNumber}:</strong> {step.safetyWarning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'troubleshoot' && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-400">
                    Gunakan panduan berikut sebelum memanggil teknisi eksternal untuk efisiensi biaya dan waktu resto.
                  </div>

                  <div className="space-y-3">
                    {(activeIka.troubleshootingGuide || (activeIka as any).troubleshooting || []).map((tb: any, idx: number) => {
                      const problem = tb.problem || tb.symptom;
                      const cause = tb.possibleCause;
                      const solution = tb.actionSolution || tb.solution;

                      return (
                        <div key={idx} className="p-4 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Gejala / Problem: {problem}</span>
                          </div>

                          {cause && (
                            <div className="text-xs text-gray-400 pl-6">
                              Kemungkinan Penyebab: <span className="text-gray-200">{cause}</span>
                            </div>
                          )}

                          {solution && (
                            <div className="ml-6 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                              <span><strong>Solusi Mandiri Operator:</strong> {solution}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  {/* Cleaning Steps */}
                  <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-400" /> Prosedur Pembersihan & Sanitasi:
                      </h4>
                      {activeIka.cleaningFrequency && (
                        <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
                          Frekuensi: {activeIka.cleaningFrequency.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {((activeIka as any).cleaningSteps || (activeIka.steps || []).filter((s: any) => s.phase === 'CLEANING_AFTER' || s.phase === 'MAINTENANCE') || []).map((cs: any, i: number) => {
                        const stepText = typeof cs === 'string' ? cs : (cs.instruction || cs.title);
                        return (
                          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#1E2438] border border-[#2D374E]/40 text-xs text-gray-300">
                            <span className="w-5 h-5 rounded-md bg-teal-600/20 text-teal-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{stepText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Maintenance Schedule */}
                  <div className="p-5 rounded-xl bg-[#131826] border border-[#2D374E] space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" /> Jadwal Preventive Maintenance & Servis Berkala:
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {(activeIka as any).maintenanceSchedule || 'Pengecekan teknis mingguan & pembersihan berkala sesuai SOP Resto.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2D374E] bg-[#181D2E] flex items-center justify-between">
              <div className="text-[11px] text-gray-400">
                Instruksi Kerja Alat Resmi Tropical Garden Resto • K3 & Keselamatan Terjamin
              </div>

              <button
                onClick={() => setActiveIka(null)}
                className="px-4 py-2 rounded-xl bg-[#2D374E] text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Tutup Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE IKA MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#2D374E] flex items-center justify-between bg-[#181D2E]">
              <h2 className="text-base font-bold text-white">Tambah Instruksi Kerja Alat Baru</h2>
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
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Kode IKA *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Nama Mesin/Alat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mesin Espresso 2-Group"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Tingkat Bahaya (Hazard) *</label>
                  <select
                    value={formData.hazardLevel}
                    onChange={(e) => setFormData({ ...formData, hazardLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LOW">Bahaya Ringan</option>
                    <option value="MEDIUM">Bahaya Sedang</option>
                    <option value="HIGH">Bahaya Tinggi (K3)</option>
                    <option value="CRITICAL">Bahaya Kritis (K3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Judul Instruksi Kerja *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengoperasian & Kalibrasi Mesin Espresso La Marzocco"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Merek & Model</label>
                  <input
                    type="text"
                    placeholder="Contoh: La Marzocco Linea PB"
                    value={formData.brandModel}
                    onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Lokasi Stasiun</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bar Counter Front"
                    value={formData.locationStation}
                    onChange={(e) => setFormData({ ...formData, locationStation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#131826] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Simpan IKA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
