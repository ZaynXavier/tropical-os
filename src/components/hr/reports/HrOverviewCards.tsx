/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Executive Overview Cards & Transparent People Health Score
 */

import React, { useState } from 'react';
import { HROverviewMetrics, PeopleHealthScoreBreakdown } from '../../../types/hrReports';
import {
  HeartPulse,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  FileCheck,
  BookOpen,
  ClipboardList,
  Info,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

interface HrOverviewCardsProps {
  metrics: HROverviewMetrics;
  canViewPayroll?: boolean;
  onOpenHealthDetail?: () => void;
}

export const HrOverviewCards: React.FC<HrOverviewCardsProps> = ({
  metrics,
  canViewPayroll = true,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const { peopleHealth } = metrics;

  const getHealthBadge = (level: PeopleHealthScoreBreakdown['healthLevel']) => {
    switch (level) {
      case 'EXCELLENT':
        return {
          label: 'Excellent (Sangat Sehat)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'HEALTHY':
        return {
          label: 'Healthy (Sehat & Stabil)',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
        };
      case 'NEEDS_ATTENTION':
        return {
          label: 'Needs Attention (Perlu Perhatian)',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
        };
      case 'CRITICAL':
        return {
          label: 'Critical (Intervensi Diperlukan)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
        };
    }
  };

  const badge = getHealthBadge(peopleHealth.healthLevel);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. PEOPLE HEALTH SCORE (MAIN HERO CARD) */}
        <div className="bg-gradient-to-br from-[#1E2438] via-[#1E2438] to-purple-950/40 rounded-2xl border border-purple-500/30 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>People Health Score</span>
                  <button
                    onClick={() => setShowFormulaModal(true)}
                    className="text-gray-400 hover:text-purple-300 cursor-pointer p-0.5"
                    title="Penjelasan rumus & bobot skor"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <p className="text-[11px] text-gray-400">Indikator internal SDM</p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${badge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              <span>{badge.label.split(' ')[0]}</span>
            </div>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {peopleHealth.overallScore}
            </div>
            <div className="text-xs text-gray-400">/ 100 poin</div>
          </div>

          {/* Progress mini bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, peopleHealth.overallScore)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Kehadiran: {peopleHealth.attendanceScore}%</span>
              <span>Disiplin: {peopleHealth.disciplineScore}%</span>
              <span>KPI: {peopleHealth.kpiScore}%</span>
            </div>
          </div>
        </div>

        {/* 2. ATTENDANCE & PUNCTUALITY */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-400">Tingkat Presensi</h4>
                <div className="text-xl font-bold text-white">{metrics.attendanceRate}%</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Telat {metrics.lateRate}%
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Total Aktif: <b className="text-white">{metrics.totalActiveEmployees}</b> dari {metrics.totalHeadcount}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" /> +1.4% MoM
            </span>
          </div>
        </div>

        {/* 3. OVERTIME & SIMULASI COST */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-400">Lembur &amp; Beban Jam</h4>
                <div className="text-xl font-bold text-white">{metrics.overtimeHours} Jam</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">Simulasi Biaya</span>
              <span className="text-xs font-bold text-amber-300">
                Rp {(metrics.overtimeCostSimulation ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Tarif: Rp 10.000 / jam (Flat)</span>
            <span className="text-blue-400 font-semibold">{metrics.activeBreaksCount} Staf Sedang Break</span>
          </div>
        </div>

        {/* 4. TOTAL PAYROLL / COMPLIANCE SUITE */}
        {canViewPayroll ? (
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400">Estimasi Beban Gaji</h4>
                  <div className="text-xl font-bold text-emerald-400">
                    Rp {(metrics.payrollCost ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between text-[11px] text-gray-400">
              <span>Periode: Agustus 2026</span>
              <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">
                Status Review
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400">Kepatuhan Dokumen</h4>
                  <div className="text-xl font-bold text-white">{metrics.documentComplianceRate}%</div>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between text-[11px] text-gray-400">
              <span>SOP: {metrics.sopComplianceRate}%</span>
              <span>Checklist: {metrics.checklistComplianceRate}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Compliance Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1E2438]/80 border border-[#2D374E] rounded-xl p-3 flex items-center gap-3">
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 truncate">Dokumen Lengkap</div>
            <div className="text-sm font-bold text-white">{metrics.documentComplianceRate}%</div>
          </div>
        </div>

        <div className="bg-[#1E2438]/80 border border-[#2D374E] rounded-xl p-3 flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 truncate">SOP Dibaca</div>
            <div className="text-sm font-bold text-white">{metrics.sopComplianceRate}%</div>
          </div>
        </div>

        <div className="bg-[#1E2438]/80 border border-[#2D374E] rounded-xl p-3 flex items-center gap-3">
          <ClipboardList className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 truncate">Checklist Operasional</div>
            <div className="text-sm font-bold text-white">{metrics.checklistComplianceRate}%</div>
          </div>
        </div>

        <div className="bg-[#1E2438]/80 border border-[#2D374E] rounded-xl p-3 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 truncate">Rata-rata KPI</div>
            <div className="text-sm font-bold text-white">{metrics.averageKpiScore} Poin</div>
          </div>
        </div>
      </div>

      {/* MODAL PENJELASAN FORMULA PEOPLE HEALTH SCORE */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Transparansi People Health Score</h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              <b>People Health Score</b> adalah indikator sintetis operasional TropicalOS (rentang 0–100) yang merangkum kesehatan kedisiplinan dan kinerja tim secara objektif tanpa bias.
            </p>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-purple-300">Komposisi Bobot Terbuka:</h4>
              <div className="grid grid-cols-2 gap-2 bg-[#111827] p-3 rounded-xl border border-[#2D374E]">
                <div>• Kehadiran (Presensi): <b>20%</b></div>
                <div>• Ketepatan Waktu: <b>15%</b></div>
                <div>• Kepatuhan Checklist: <b>15%</b></div>
                <div>• Skor KPI Personal: <b>20%</b></div>
                <div>• Konfirmasi SOP: <b>10%</b></div>
                <div>• Kelengkapan Dokumen: <b>10%</b></div>
                <div>• Disiplin Lembur: <b>10%</b></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-semibold text-gray-300">Kategori Skor:</h4>
              <ul className="space-y-1 text-gray-400">
                <li><span className="text-emerald-400 font-bold">90 – 100</span>: Excellent (Sangat Sehat &amp; Teladan)</li>
                <li><span className="text-blue-400 font-bold">75 – 89</span>: Healthy (Sehat, Disiplin Terjaga)</li>
                <li><span className="text-amber-400 font-bold">60 – 74</span>: Needs Attention (Butuh Pembinaan)</li>
                <li><span className="text-rose-400 font-bold">0 – 59</span>: Critical (Evaluasi Khusus &amp; SP)</li>
              </ul>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/20 p-3 rounded-xl text-[11px] text-purple-200/80">
              <i>Catatan: Indikator internal TropicalOS berdasarkan data operasional yang tersedia. Digunakan sebagai sarana evaluasi pembinaan, bukan pemutusan sepihak.</i>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
