/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — TEAM HANDOVER VIEW (Supervisor Queue & Team Verification)
 * Dedicated view for Floor Captains & Shift Supervisors to audit team handovers and manage escalations.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Users,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';
import { HandoverCard } from './HandoverCard';
import { HandoverTable } from './HandoverTable';

interface TeamHandoverViewProps {
  handovers: HandoverRecord[];
  onInspect: (handover: HandoverRecord) => void;
  onVerify: (handover: HandoverRecord) => void;
  onRequestRevision: (handover: HandoverRecord) => void;
  supervisorName?: string;
}

export const TeamHandoverView: React.FC<TeamHandoverViewProps> = ({
  handovers,
  onInspect,
  onVerify,
  onRequestRevision,
  supervisorName = 'Supervisor',
}) => {
  const [filterMode, setFilterMode] = useState<'PENDING_VERIFY' | 'ALL' | 'CRITICAL'>('PENDING_VERIFY');

  // Pending verification queue
  const pendingVerifyList = handovers.filter(
    (h) => h.status === 'RECEIVED' || h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT'
  );

  const criticalList = handovers.filter(
    (h) => h.overallCondition === 'CRITICAL' || h.criticalIssueCount > 0
  );

  const displayList =
    filterMode === 'PENDING_VERIFY'
      ? pendingVerifyList
      : filterMode === 'CRITICAL'
      ? criticalList
      : handovers;

  return (
    <div className="space-y-4">
      {/* Supervisor Header Banner */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Antrean Verifikasi Tim Supervisor ({supervisorName})
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit laporan serah terima shift antar-stasiun, evaluasi kondisi, dan setujui verifikasi
          </p>
        </div>

        {/* Quick Filter Switchers */}
        <div className="flex items-center gap-2 bg-[#0B0F19] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setFilterMode('PENDING_VERIFY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'PENDING_VERIFY'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Menunggu Verifikasi ({pendingVerifyList.length})
          </button>
          <button
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isu Kritis ({criticalList.length})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Laporan
          </button>
        </div>
      </div>

      {/* Main Content Display */}
      {displayList.length === 0 ? (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Antrean Verifikasi Bersih</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Seluruh laporan serah terima shift tim telah terverifikasi penuh tanpa kendala.
          </p>
        </div>
      ) : (
        <HandoverTable
          handovers={displayList}
          onInspect={onInspect}
          onVerify={onVerify}
          onRequestRevision={onRequestRevision}
          canVerify={true}
        />
      )}
    </div>
  );
};
