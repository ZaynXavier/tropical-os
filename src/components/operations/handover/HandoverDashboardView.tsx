/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER DASHBOARD VIEW
 * Executive & Operational Overview Dashboard with KPIs, Shift status breakdown, and quick actions.
 */

import React from 'react';
import {
  Layers,
  ShieldCheck,
  Plus,
  AlertOctagon,
  Clock,
  ArrowRight,
  ListTodo,
  CheckCircle2,
} from 'lucide-react';
import { HandoverDashboardMetrics, HandoverRecord } from '../../../types/handover';
import { HandoverKpiGrid } from './HandoverKpiGrid';
import { HandoverCard } from './HandoverCard';

interface HandoverDashboardViewProps {
  metrics: HandoverDashboardMetrics | null;
  handovers: HandoverRecord[];
  onInspect: (handover: HandoverRecord) => void;
  onReceive: (handover: HandoverRecord) => void;
  onVerify: (handover: HandoverRecord) => void;
  onCreateNew: () => void;
  canVerify?: boolean;
}

export const HandoverDashboardView: React.FC<HandoverDashboardViewProps> = ({
  metrics,
  handovers,
  onInspect,
  onReceive,
  onVerify,
  onCreateNew,
  canVerify,
}) => {
  const pendingHandovers = handovers.filter(
    (h) => h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT' || h.status === 'RECEIVED'
  );

  const criticalHandovers = handovers.filter(
    (h) => h.overallCondition === 'CRITICAL' || h.criticalIssueCount > 0
  );

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Dasbor Serah Terima Shift (Shift Handover Hub)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau pergantian shift, serah terima alat & stok, serta verifikasi laporan real-time
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Buat Handover Baru
        </button>
      </div>

      {/* KPI Stats Grid */}
      <HandoverKpiGrid metrics={metrics} />

      {/* Pending Action & Critical Alert Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Approval / Receipt Queue */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Menunggu Penerimaan / Verifikasi ({pendingHandovers.length})
            </h4>
          </div>

          {pendingHandovers.length === 0 ? (
            <div className="bg-[#0B0F19] rounded-xl p-6 text-center border border-white/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Antrean Serah Terima Bersih</p>
              <p className="text-[11px] text-slate-400">Seluruh laporan shift telah diterima & diverifikasi.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingHandovers.slice(0, 3).map((h) => (
                <HandoverCard
                  key={h.id}
                  handover={h}
                  onInspect={onInspect}
                  onReceive={onReceive}
                  onVerify={onVerify}
                  canReceive={true}
                  canVerify={canVerify}
                />
              ))}
            </div>
          )}
        </div>

        {/* Critical Issues Queue */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Laporan Kondisi Kritis ({criticalHandovers.length})
            </h4>
          </div>

          {criticalHandovers.length === 0 ? (
            <div className="bg-[#0B0F19] rounded-xl p-6 text-center border border-white/5">
              <ShieldCheck className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Operasional Aman (Normal)</p>
              <p className="text-[11px] text-slate-400">Tidak ada laporan kerusakan mesin atau kendala kritis.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {criticalHandovers.slice(0, 3).map((h) => (
                <HandoverCard
                  key={h.id}
                  handover={h}
                  onInspect={onInspect}
                  onReceive={onReceive}
                  onVerify={onVerify}
                  canReceive={true}
                  canVerify={canVerify}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
