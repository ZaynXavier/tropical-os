/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Employee Performance & People Health Score Ranking View
 */

import React, { useState } from 'react';
import { EmployeePerformanceRankingData } from '../../../types/hrReports';
import {
  Award,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Download,
  Search,
  ExternalLink,
  Star,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface EmployeePerformanceViewProps {
  data: EmployeePerformanceRankingData;
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const EmployeePerformanceView: React.FC<EmployeePerformanceViewProps> = ({
  data,
  onOpenEmployeeDrawer,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<'ALL' | 'EXCELLENT' | 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL'>('ALL');

  const {
    overallScoreAverage = data?.summary?.averageHealthScore ?? 88,
    topPerformers = [],
    needsAttention = [],
    allRankings = data?.allEmployees || [],
  } = data || {};

  const filteredRankings = (allRankings || []).filter((emp) => {
    const matchDept = selectedDept === 'ALL' || emp.department.toUpperCase() === selectedDept.toUpperCase();
    const matchTier = selectedTier === 'ALL' || emp.healthLevel === selectedTier;
    const q = search.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      emp.name.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q);
    return matchDept && matchTier && matchSearch;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'EXCELLENT':
        return {
          label: 'Tier 1: Star Performer',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'HEALTHY':
        return {
          label: 'Tier 2: Solid Contributor',
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
      case 'NEEDS_ATTENTION':
        return {
          label: 'Tier 3: Needs Coaching',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'CRITICAL':
        return {
          label: 'Tier 4: Action Required',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      default:
        return {
          label: tier,
          bg: 'bg-gray-800 text-gray-300 border-gray-700',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span>Matriks Kinerja &amp; Peringkat People Health Score</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Sintesis multi-indikator kedisiplinan, presensi, kualitas checklist harian, kepatuhan SOP, dan skor evaluasi KPI bulanan.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Kinerja (CSV)</span>
        </button>
      </div>

      {/* Top Performers vs Needs Attention Spotlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Performers */}
        <div className="bg-gradient-to-br from-[#1E2438] to-emerald-950/20 rounded-2xl border border-emerald-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Top 3 Teladan (Star Performers)</span>
            </h4>
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Skor &ge; 90 Poin
            </span>
          </div>

          <div className="space-y-2.5">
            {topPerformers.map((emp, idx) => (
              <div
                key={emp.employeeId}
                onClick={() => onOpenEmployeeDrawer(emp.employeeId)}
                className="bg-[#111827] p-3 rounded-xl border border-[#2D374E] flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{emp.name}</div>
                    <div className="text-[10px] text-gray-400">{emp.position} &bull; {emp.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-300">{emp.overallHealthScore}</div>
                    <div className="text-[9px] text-gray-400">KPI: {emp.kpiScore}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention Tier */}
        <div className="bg-gradient-to-br from-[#1E2438] to-amber-950/20 rounded-2xl border border-amber-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Perlu Pembinaan &amp; Coaching ({needsAttention.length} Staf)</span>
            </h4>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Skor &lt; 75 Poin
            </span>
          </div>

          <div className="space-y-2.5">
            {needsAttention.slice(0, 3).map((emp) => (
              <div
                key={emp.employeeId}
                onClick={() => onOpenEmployeeDrawer(emp.employeeId)}
                className="bg-[#111827] p-3 rounded-xl border border-[#2D374E] flex items-center justify-between gap-3 hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">{emp.name}</div>
                  <div className="text-[10px] text-gray-400">{emp.position} &bull; {emp.department}</div>
                  <div className="text-[10px] text-rose-300 mt-0.5">
                    Presensi: {emp.attendanceRate}% &bull; Telat: {emp.lateCount}x &bull; Checklist: {emp.checklistScore}%
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-amber-400">{emp.overallHealthScore}</div>
                    <div className="text-[9px] text-gray-400">Health Score</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Rankings Matrix Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-purple-400" />
              <span>Matriks Lengkap People Health Score (24 Personel)</span>
            </h4>
            <p className="text-xs text-gray-400">Rata-rata Skor Resto: <b className="text-purple-300">{overallScoreAverage} Poin</b></p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari staf..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-purple-500 w-36"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="BAR">Bar</option>
              <option value="SERVICE">Service</option>
              <option value="CLEANING">Cleaning</option>
              <option value="CRM">CRM</option>
              <option value="FINANCE">Finance</option>
              <option value="OPERATIONS">Operations</option>
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Tier</option>
              <option value="EXCELLENT">Tier 1: Star Performer (90+)</option>
              <option value="HEALTHY">Tier 2: Solid Contributor (75–89)</option>
              <option value="NEEDS_ATTENTION">Tier 3: Needs Coaching (60–74)</option>
              <option value="CRITICAL">Tier 4: Action Required (&lt;60)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400 bg-[#111827]/60">
                <th className="py-2.5 px-3 font-semibold text-center w-12">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Karyawan</th>
                <th className="py-2.5 px-2 font-semibold">Divisi &amp; Jabatan</th>
                <th className="py-2.5 px-2 font-semibold text-center">Presensi %</th>
                <th className="py-2.5 px-2 font-semibold text-center">Checklist %</th>
                <th className="py-2.5 px-2 font-semibold text-center">SOP %</th>
                <th className="py-2.5 px-2 font-semibold text-center">Dokumen %</th>
                <th className="py-2.5 px-2 font-semibold text-center">Skor KPI</th>
                <th className="py-2.5 px-2 font-semibold text-center">Health Score</th>
                <th className="py-2.5 px-2 font-semibold text-center">Klasifikasi Tier</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/40 text-gray-300">
              {filteredRankings.map((emp) => {
                const tier = getTierBadge(emp.healthLevel);
                return (
                  <tr
                    key={emp.employeeId}
                    className="hover:bg-[#111827]/60 transition-colors group cursor-pointer"
                    onClick={() => onOpenEmployeeDrawer(emp.employeeId)}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400 group-hover:text-purple-300">
                      #{emp.rank}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                        {emp.name}
                      </div>
                      <div className="text-[10px] text-gray-400">{emp.employeeCode}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-gray-200 font-medium">{emp.position}</span>
                      <span className="text-[10px] text-gray-400 block">{emp.department}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-300">
                      {emp.attendanceRate}%
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-300">
                      {emp.checklistScore}%
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-300">
                      {emp.sopComplianceRate}%
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-300">
                      {emp.documentComplianceRate}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-white">
                      {emp.kpiScore}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="text-sm font-extrabold text-purple-300">
                        {emp.overallHealthScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tier.bg}`}>
                        {tier.label.split(':')[1] || tier.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEmployeeDrawer(emp.employeeId);
                        }}
                        className="p-1.5 rounded-lg bg-[#111827] hover:bg-purple-600 hover:text-white text-gray-400 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
