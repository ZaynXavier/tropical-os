/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — EXECUTIVE RISK SUMMARY VIEW (OWNER PERSONA)
 * High-level executive overview for Owner / Management highlighting operational risk,
 * SLA compliance, top problematic stations, and recurring issues.
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, AlertOctagon, Repeat } from 'lucide-react';
import { IssueDashboardMetrics, IssueAnalyticsData, OperationalIssue } from '../../../types/operationalIssue';
import { OperationalIssueCard } from './OperationalIssueCard';

interface OperationalIssueExecutiveSummaryProps {
  metrics: IssueDashboardMetrics;
  analytics: IssueAnalyticsData;
  criticalIssues: OperationalIssue[];
  onSelectIssue: (issue: OperationalIssue) => void;
  getCategoryLabel: (cat: any) => string;
}

export const OperationalIssueExecutiveSummary: React.FC<OperationalIssueExecutiveSummaryProps> = ({
  metrics,
  analytics,
  criticalIssues,
  onSelectIssue,
  getCategoryLabel,
}) => {
  return (
    <div className="space-y-5">
      {/* Executive Risk Banner */}
      <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Ringkasan Risiko Operasional Eksekutif (Executive Summary)</h3>
            <p className="text-xs text-slate-400">
              Laporan khusus Owner/Direksi untuk pemantauan SLA Compliance, insiden kritis, dan titik risiko sistemik
            </p>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">SLA Compliance Rate</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${metrics.slaCompliancePercentage >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.slaCompliancePercentage}%
              </span>
              <span className="text-[10px] text-slate-500">Target ≥ 90%</span>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Insiden Kritis (Critical CCP)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-400">{metrics.criticalIssues}</span>
              <span className="text-[10px] text-rose-300">SLA 15 Menit</span>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">SLA Terlewati (Breached)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-400">{metrics.slaBreachedCount}</span>
              <span className="text-[10px] text-slate-500">Issue</span>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Rata-rata Waktu Selesai</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-purple-400">{metrics.avgResolutionMinutes}</span>
              <span className="text-[10px] text-slate-500">Menit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Incidents Spotlight */}
      {criticalIssues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            Perhatian Khusus: Insiden Kritis Aktif ({criticalIssues.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalIssues.map((issue) => (
              <OperationalIssueCard
                key={issue.id}
                issue={issue}
                onClick={onSelectIssue}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Problematic Stations & Recurring Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Problem Stations */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Top 5 Stasiun Kerja Paling Sering Bermasalah
          </h4>

          <div className="space-y-2 text-xs">
            {analytics.topProblemStations.length === 0 ? (
              <div className="text-slate-500 text-center py-4">Belum ada data stasiun bermasalah.</div>
            ) : (
              analytics.topProblemStations.map((stn, idx) => (
                <div
                  key={stn.stationId || idx}
                  className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{stn.stationName}</span>
                    <span className="text-[11px] text-slate-400">Area: {stn.areaName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-400 block">{stn.issueCount} Kendala</span>
                    {stn.criticalCount > 0 && (
                      <span className="text-[10px] text-rose-300 font-bold">({stn.criticalCount} Critical)</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recurring Systemic Issues */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Repeat className="w-4 h-4 text-amber-400" />
            Isu Berulang (Recurring Issues Matrix)
          </h4>

          <div className="space-y-2 text-xs">
            {analytics.recurringIssues.length === 0 ? (
              <div className="text-slate-500 text-center py-4">Tidak ada tren isu berulang yang terdeteksi.</div>
            ) : (
              analytics.recurringIssues.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rec.stationName} — {rec.categoryLabel}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.frequencyRisk === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.count}x Kejadian Berulang
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Contoh: "{rec.sampleIssueTitles.join(', ')}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
