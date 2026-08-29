/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE ANALYTICS
 * Interactive Analytics Dashboard with visual charts, department breakdowns, SLA compliance analysis.
 */

import React, { useState } from 'react';
import { BarChart3, PieChart, ShieldCheck, Clock, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { IssueAnalyticsData, IssueDashboardMetrics } from '../../../types/operationalIssue';

interface OperationalIssueAnalyticsProps {
  analytics: IssueAnalyticsData;
  metrics: IssueDashboardMetrics;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueAnalytics: React.FC<OperationalIssueAnalyticsProps> = ({
  analytics,
  metrics,
  getCategoryLabel,
}) => {
  const [period, setPeriod] = useState<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>('THIS_WEEK');

  const totalIssues = metrics.totalIssues || 1;

  return (
    <div className="space-y-5">
      {/* Top Title & Period Bar */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Analitik Kendala Operasional (Operational Issue Analytics)</h3>
            <p className="text-xs text-slate-400">
              Analisis statistik insiden berdasarkan departemen, tingkat keparahan, kategori, dan kepatuhan SLA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/10 text-xs font-semibold shrink-0">
          <button
            onClick={() => setPeriod('TODAY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'TODAY' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('THIS_WEEK')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              period === 'THIS_WEEK' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setPeriod('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              period === 'THIS_MONTH' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Grid 1: Department Matrix & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Breakdown Matrix */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Distribusi Kendala Per Departemen
          </h4>

          <div className="space-y-3 text-xs">
            {analytics.byDepartment.map((dept) => {
              const pct = Math.round((dept.total / totalIssues) * 100);
              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white">{dept.department}</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {dept.total} Issue ({pct}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Aktif: <strong className="text-amber-400">{dept.open}</strong></span>
                    <span>Selesai: <strong className="text-emerald-400">{dept.resolved}</strong></span>
                    <span>Critical: <strong className="text-rose-400">{dept.critical}</strong></span>
                    <span>SLA Breached: <strong className="text-rose-300">{dept.slaBreached}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & Avg Resolution Time */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Tingkat Keparahan (Severity) & Rata-rata Waktu Penyelesaian
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-rose-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">CRITICAL (Target 15m)</span>
              <div className="text-xl font-extrabold text-white">{analytics.bySeverity.CRITICAL} <span className="text-xs font-normal text-slate-400">Issue</span></div>
              <div className="text-[10px] text-rose-300 font-mono">
                Rata-rata: {analytics.avgResolutionTimeBySeverity.CRITICAL || 0}m
              </div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">HIGH (Target 30m)</span>
              <div className="text-xl font-extrabold text-white">{analytics.bySeverity.HIGH} <span className="text-xs font-normal text-slate-400">Issue</span></div>
              <div className="text-[10px] text-amber-300 font-mono">
                Rata-rata: {analytics.avgResolutionTimeBySeverity.HIGH || 0}m
              </div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-sky-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">MEDIUM (Target 2h)</span>
              <div className="text-xl font-extrabold text-white">{analytics.bySeverity.MEDIUM} <span className="text-xs font-normal text-slate-400">Issue</span></div>
              <div className="text-[10px] text-sky-300 font-mono">
                Rata-rata: {analytics.avgResolutionTimeBySeverity.MEDIUM || 0}m
              </div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">LOW (Target 24h)</span>
              <div className="text-xl font-extrabold text-white">{analytics.bySeverity.LOW} <span className="text-xs font-normal text-slate-400">Issue</span></div>
              <div className="text-[10px] text-slate-300 font-mono">
                Rata-rata: {analytics.avgResolutionTimeBySeverity.LOW || 0}m
              </div>
            </div>
          </div>

          {/* SLA Gauge Banner */}
          <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">SLA Target Compliance</span>
              <span className="text-emerald-400 font-bold">{analytics.slaCompliance.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${analytics.slaCompliance.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Dalam SLA: {analytics.slaCompliance.withinSla} Issue</span>
              <span className="text-rose-400">Breached: {analytics.slaCompliance.slaBreached} Issue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Category Distribution */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          Breakdown Berdasarkan Kategori Masalah
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {Object.entries(analytics.byCategory).map(([catKey, count]) => (
            <div key={catKey} className="bg-[#0B0F19] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-slate-300 font-medium truncate">{getCategoryLabel(catKey)}</span>
              <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
