/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER KPI GRID
 * Reusable metric statistics cards for Shift Handover
 */

import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ListTodo,
  AlertOctagon,
} from 'lucide-react';
import { HandoverDashboardMetrics } from '../../../types/handover';

interface HandoverKpiGridProps {
  metrics: HandoverDashboardMetrics | null;
  loading?: boolean;
}

export const HandoverKpiGrid: React.FC<HandoverKpiGridProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-[#151B2B] rounded-2xl p-4 border border-white/10 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Total Handover',
      value: metrics.totalHandovers,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Laporan shift terdata',
    },
    {
      label: 'Kepatuhan (Verified)',
      value: `${metrics.complianceRate}%`,
      icon: ShieldCheck,
      color: metrics.complianceRate >= 90 ? 'text-emerald-400' : 'text-amber-400',
      bg: metrics.complianceRate >= 90 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
      description: `${metrics.verifiedCount} terverifikasi supervisor`,
    },
    {
      label: 'Menunggu Diterima',
      value: metrics.pendingReceiptCount,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      description: 'Perlu konfirmasi shift siang',
    },
    {
      label: 'Kondisi Kritis',
      value: metrics.criticalConditionCount,
      icon: AlertOctagon,
      color: metrics.criticalConditionCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: metrics.criticalConditionCount > 0 ? 'bg-rose-500/20 border-rose-500/30' : 'bg-white/5 border-white/10',
      description: 'Memerlukan tindakan segera',
    },
    {
      label: 'Minta Revisi',
      value: metrics.revisionRequiredCount,
      icon: RotateCcw,
      color: metrics.revisionRequiredCount > 0 ? 'text-amber-400' : 'text-slate-400',
      bg: metrics.revisionRequiredCount > 0 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-white/5 border-white/10',
      description: 'Perlu perbaikan catatan',
    },
    {
      label: 'Tugas Tertunda',
      value: metrics.totalPendingTasks,
      icon: ListTodo,
      color: metrics.totalPendingTasks > 0 ? 'text-purple-400' : 'text-slate-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      description: 'Pending task lintas shift',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl p-4 border transition-all ${item.bg} hover:border-white/20`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-medium text-slate-400 leading-tight truncate">
                {item.label}
              </span>
              <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold tracking-tight text-white`}>
                {item.value}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
