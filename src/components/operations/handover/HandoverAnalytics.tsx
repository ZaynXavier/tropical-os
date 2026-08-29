/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER ANALYTICS
 * Interactive charts & compliance rate visualizer
 */

import React from 'react';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import { HandoverAnalyticsData } from '../../../types/handover';

interface HandoverAnalyticsProps {
  analytics: HandoverAnalyticsData | null;
  loading?: boolean;
}

export const HandoverAnalytics: React.FC<HandoverAnalyticsProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-8 text-center animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/4 mx-auto mb-4" />
        <div className="h-32 bg-white/5 rounded-xl" />
      </div>
    );
  }

  const {
    overallComplianceRate,
    departmentMetrics,
    conditionDistribution,
    issueCategoryFrequency,
    trendData,
  } = analytics;

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Overall Compliance */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Tingkat Kepatuhan (Compliance)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{overallComplianceRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">Verified On-Time</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${overallComplianceRate}%` }}
            />
          </div>
        </div>

        {/* Condition Distribution */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Distribusi Kondisi Operasional</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Normal: {conditionDistribution.normal}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Attention: {conditionDistribution.attention}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-slate-300">Critical: {conditionDistribution.critical}</span>
            </div>
          </div>
        </div>

        {/* Issue Frequency */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Tren Isu Terbanyak</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xs text-slate-300">
            Top Category: <span className="font-bold text-white">Peralatan & Mesin (Kitchen/Bar)</span>
          </p>
        </div>
      </div>

      {/* Department Compliance Matrix */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Matriks Kepatuhan per Departemen
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentMetrics.map((dept) => (
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
                <span className="text-slate-400 text-[11px]">Compliance Rate:</span>
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

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Total: {dept.total}</span>
                <span>Verified: {dept.verified}</span>
                <span>Pending: {dept.pending}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
