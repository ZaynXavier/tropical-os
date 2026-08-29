/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER EXECUTIVE SUMMARY (Owner View)
 * Clean executive dashboard for Resto Owners & Board to monitor shift handovers,
 * compliance rates, and department operational risks without operational buttons.
 */

import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Building2,
  FileText,
  Clock,
} from 'lucide-react';
import { HandoverDashboardMetrics, HandoverAnalyticsData, HandoverRecord } from '../../../types/handover';
import { HandoverKpiGrid } from './HandoverKpiGrid';
import { HandoverCard } from './HandoverCard';

interface HandoverExecutiveSummaryProps {
  metrics: HandoverDashboardMetrics | null;
  analytics: HandoverAnalyticsData | null;
  handovers: HandoverRecord[];
  onInspect: (handover: HandoverRecord) => void;
}

export const HandoverExecutiveSummary: React.FC<HandoverExecutiveSummaryProps> = ({
  metrics,
  analytics,
  handovers,
  onInspect,
}) => {
  const criticalHandovers = handovers.filter(
    (h) => h.overallCondition === 'CRITICAL' || h.criticalIssueCount > 0
  );

  return (
    <div className="space-y-5">
      {/* Executive Welcome Header */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">
              Ringkasan Eksekutif Serah Terima Shift (Owner Overview)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan tingkat kepatuhan operasional, mitigasi risiko antar-shift, dan kontinuitas layanan Tropical Garden Resto
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[#0B0F19] px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Kepatuhan Resto:{' '}
            <strong className="text-emerald-300 font-bold">{metrics?.complianceRate || 100}%</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <HandoverKpiGrid metrics={metrics} />

      {/* Critical Operational Risk Escalation Box */}
      {criticalHandovers.length > 0 && (
        <div className="bg-rose-500/10 rounded-2xl border border-rose-500/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h4 className="text-sm font-bold">
              Eskalasi Isu Kritis Lintas Shift ({criticalHandovers.length})
            </h4>
          </div>
          <p className="text-xs text-rose-200/90">
            Berikut adalah laporan serah terima yang membutuhkan perhatian manajerial terkait kerusakan mesin atau potensi gangguan stok:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {criticalHandovers.map((h) => (
              <HandoverCard
                key={h.id}
                handover={h}
                onInspect={onInspect}
                canReceive={false}
                canVerify={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Department Compliance Breakdown */}
      {analytics && (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Matriks Risiko & Kepatuhan per Departemen
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.departmentMetrics.map((dept) => (
              <div
                key={dept.department}
                className="bg-[#0B0F19] rounded-xl p-3.5 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{dept.department}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dept.status === 'OPTIMAL'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : dept.status === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Kepatuhan Audit:</span>
                  <span className="font-bold text-white">{dept.complianceRate}%</span>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      dept.complianceRate >= 90
                        ? 'bg-emerald-500'
                        : dept.complianceRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${dept.complianceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
