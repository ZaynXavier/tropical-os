/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — OPERATIONS CHECKLIST COMPLIANCE & READINESS DASHBOARD
 * Complete executive and station performance analytics dashboard:
 * KPIs, Station Matrix with Health Badges, CCP Failures, Leaderboards, and CSV Export.
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  Layers,
  Users,
  Activity,
  Calendar,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  ChecklistComplianceMetrics,
  DailyChecklist,
  StationReadinessMatrix,
} from '../../../types/operationsChecklist';
import { Employee } from '../../../types/employee';
import { operationsChecklistService } from '../../../services/operationsChecklistService';
import { ChecklistDetailModal } from './ChecklistDetailModal';

interface ChecklistDashboardViewProps {
  currentEmployee: Employee;
  selectedDate?: string;
  selectedShiftId?: string;
  onRefreshParent?: () => void;
  onNavigateToStaffChecklist?: () => void;
  onNavigateToVerification?: () => void;
}

export const ChecklistDashboardView: React.FC<ChecklistDashboardViewProps> = ({
  currentEmployee,
  selectedDate = '2026-08-18',
  selectedShiftId = 'shift-pagi',
  onRefreshParent,
  onNavigateToStaffChecklist,
  onNavigateToVerification,
}) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ChecklistComplianceMetrics | null>(null);
  const [matrix, setMatrix] = useState<StationReadinessMatrix[]>([]);
  const [checklists, setChecklists] = useState<DailyChecklist[]>([]);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');

  // Deep inspect modal
  const [inspectChecklist, setInspectChecklist] = useState<DailyChecklist | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricData, matrixData, listData] = await Promise.all([
        operationsChecklistService.getComplianceMetrics(selectedDate, selectedShiftId),
        operationsChecklistService.getStationReadinessMatrix(selectedDate, selectedShiftId),
        operationsChecklistService.getDailyChecklists({ date: selectedDate, shiftId: selectedShiftId }),
      ]);
      setMetrics(metricData);
      setMatrix(matrixData);
      setChecklists(listData);
    } catch (err) {
      console.error('Failed to load checklist dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate, selectedShiftId]);

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const csvContent = await operationsChecklistService.exportChecklistReportCSV(
        selectedDate,
        selectedShiftId
      );
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `TropicalOS_Checklist_Report_${selectedDate}_${selectedShiftId}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  // Auto Generate Checklists
  const handleGenerateToday = async () => {
    setLoading(true);
    try {
      await operationsChecklistService.generateDailyChecklists(selectedDate, selectedShiftId);
      await loadDashboardData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Failed to generate daily checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatrix = matrix.filter((m) =>
    selectedAreaFilter === 'ALL' ? true : m.areaId === selectedAreaFilter
  );

  const areas = Array.from(new Set(matrix.map((m) => ({ id: m.areaId, name: m.areaName }))));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Action & KPI Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Monitoring Kepatuhan Checklist Operasional</h3>
            <p className="text-xs text-slate-400">
              Analisis kesiapan stasiun kerja, skor audit, dan mitigasi titik kritis (CCP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            title="Muat ulang data"
            className="p-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" /> Unduh CSV
          </button>

          <button
            type="button"
            onClick={handleGenerateToday}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Auto-Generate Shift
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Checklists */}
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Checklist Shift</span>
          <div className="text-2xl font-black text-white">{metrics?.totalChecklists || 0}</div>
          <span className="text-[10px] text-slate-400 block">Stasiun terjadwal</span>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Tingkat Penyelesaian</span>
          <div className="text-2xl font-black text-emerald-400">
            {metrics?.completionRate || 0}%
          </div>
          <span className="text-[10px] text-slate-400 block">
            {metrics?.completedChecklists || 0} dari {metrics?.totalChecklists || 0} selesai
          </span>
        </div>

        {/* Verification Rate */}
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Tingkat Verifikasi Spv</span>
          <div className="text-2xl font-black text-purple-300">
            {metrics?.verificationRate || 0}%
          </div>
          <span className="text-[10px] text-slate-400 block">
            {metrics?.verifiedChecklists || 0} disetujui supervisor
          </span>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Keterlambatan Task</span>
          <div
            className={`text-2xl font-black ${
              (metrics?.overdueChecklists || 0) > 0 ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            {metrics?.overdueChecklists || 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Melewati batas shift</span>
        </div>

        {/* CCP Critical Failures */}
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-rose-500/30 shadow-lg space-y-1 bg-rose-500/5">
          <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Titik Kritis (CCP)
          </span>
          <div className="text-2xl font-black text-rose-400">
            {metrics?.criticalControlFailures || 0} Gagal
          </div>
          <span className="text-[10px] text-rose-300/80 block">Wajib tindakan perbaikan</span>
        </div>
      </div>

      {/* Station Readiness & Health Matrix */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Matriks Kesiapan & Status Stasiun Operasional
            </h4>
            <p className="text-xs text-slate-400">
              Evaluasi kesiapan setiap station berdasarkan hasil checklist dan inspeksi
            </p>
          </div>

          {/* Area Filter Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAreaFilter}
              onChange={(e) => setSelectedAreaFilter(e.target.value)}
              className="bg-[#0B0F19] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 focus:outline-hidden cursor-pointer [&>option]:bg-[#111827]"
            >
              <option value="ALL">Semua Area Operasional</option>
              <option value="area-kitchen">Kitchen (Dapur)</option>
              <option value="area-bar">Bar & Beverage</option>
              <option value="area-service">Service & Dining Floor</option>
              <option value="area-cleaning">Steward & Sanitasi</option>
              <option value="area-purchasing">Purchasing & Logistik</option>
              <option value="area-inventory">Gudang / Inventory</option>
              <option value="area-production">Central Production</option>
            </select>
          </div>
        </div>

        {/* Matrix Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMatrix.map((item) => {
            const isCritical = item.healthStatus === 'CRITICAL';
            const isAttention = item.healthStatus === 'ATTENTION';
            const isOptimal = item.healthStatus === 'OPTIMAL';

            return (
              <div
                key={item.stationId}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCritical
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-md shadow-rose-500/5'
                    : isAttention
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isOptimal
                    ? 'bg-[#111827] border-emerald-500/30'
                    : 'bg-[#111827] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {item.areaName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOptimal
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isAttention
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {item.healthStatus}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white">{item.stationName}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Petugas: <span className="text-slate-200 font-semibold">{item.assignedStaffName}</span>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Penyelesaian:</span>
                    <span className="font-bold text-white">{item.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#0B0F19] rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? 'bg-rose-500'
                          : isAttention
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Bottom stats & issues */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    {item.failedItemsCount > 0 ? (
                      <span className="text-rose-400 font-bold">
                        {item.failedItemsCount} Gagal ({item.criticalFailuresCount} CCP)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Semua Lulus</span>
                    )}
                  </div>

                  {item.checklistId && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetChk = checklists.find((c) => c.id === item.checklistId);
                        if (targetChk) setInspectChecklist(targetChk);
                      }}
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspeksi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Detail Modal */}
      {inspectChecklist && (
        <ChecklistDetailModal
          isOpen={!!inspectChecklist}
          onClose={() => {
            setInspectChecklist(null);
            loadDashboardData();
          }}
          checklist={inspectChecklist}
          canVerify={
            currentEmployee.accessLevel === 'MANAGER' ||
            currentEmployee.accessLevel === 'OWNER' ||
            currentEmployee.accessLevel === 'SUPERVISOR'
          }
          onVerify={async (id, note) => {
            await operationsChecklistService.verifyChecklist(
              id,
              currentEmployee.id,
              currentEmployee.name,
              note
            );
            loadDashboardData();
          }}
          onReject={async (id, reason) => {
            await operationsChecklistService.rejectChecklist(
              id,
              currentEmployee.id,
              currentEmployee.name,
              reason
            );
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};
