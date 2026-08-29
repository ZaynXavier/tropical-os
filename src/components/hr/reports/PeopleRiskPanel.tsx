/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rule-based People Risk Alerts Panel & Action Plan Generator
 */

import React from 'react';
import { PeopleRiskAlert } from '../../../types/hrReports';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  FileWarning,
  BookX,
  UserX,
  Zap,
  ArrowRight,
  ShieldAlert,
  PlusCircle,
} from 'lucide-react';

interface PeopleRiskPanelProps {
  risks: PeopleRiskAlert[];
  onOpenEmployeeDrawer: (employeeId: string) => void;
  onCreateActionPlan: (risk: PeopleRiskAlert) => void;
}

export const PeopleRiskPanel: React.FC<PeopleRiskPanelProps> = ({
  risks,
  onOpenEmployeeDrawer,
  onCreateActionPlan,
}) => {
  const getSeverityBadge = (severity: PeopleRiskAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          label: 'Critical Risk',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
        };
      case 'HIGH':
        return {
          label: 'High Attention',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'MEDIUM':
        return {
          label: 'Moderate',
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
        };
    }
  };

  const getRiskIcon = (type: PeopleRiskAlert['riskType']) => {
    switch (type) {
      case 'REPEATED_LATE':
      case 'HIGH_ABSENCE':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'EXCESSIVE_OVERTIME':
      case 'EXCESSIVE_BREAK':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'MISSING_DOCUMENTS':
        return <FileWarning className="w-4 h-4 text-rose-400" />;
      case 'SOP_NON_COMPLIANCE':
      case 'CHECKLIST_NON_COMPLIANCE':
        return <BookX className="w-4 h-4 text-indigo-400" />;
      case 'KPI_BELOW_TARGET':
        return <UserX className="w-4 h-4 text-purple-400" />;
    }
  };

  const riskList = risks || [];

  return (
    <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D374E] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>People Risk &amp; Early Warning System</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold">
                {riskList.length} Peringatan Aktif
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Deteksi dini otomatis terhadap anomali presensi, over-fatigue lembur, kedaluwarsa dokumen, dan ketertinggalan SOP
            </p>
          </div>
        </div>
      </div>

      {riskList.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          Tidak ada peringatan risiko SDM pada filter yang dipilih. Seluruh indikator berada dalam batas wajar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {riskList.map((risk) => {
            const badge = getSeverityBadge(risk.severity);
            return (
              <div
                key={risk.id}
                className="bg-[#111827] rounded-xl border border-[#2D374E] p-4 flex flex-col justify-between space-y-3 hover:border-gray-600 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#1E2438] border border-[#2D374E]">
                        {getRiskIcon(risk.riskType)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenEmployeeDrawer(risk.employeeId)}
                          className="text-xs font-bold text-white hover:text-purple-400 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        >
                          <span>{risk.employeeName}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({risk.employeeCode})
                          </span>
                        </button>
                        <div className="text-[10px] text-gray-400">
                          {risk.position} &bull; {risk.department}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 shrink-0 ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    {risk.issue}
                  </p>

                  <div className="flex items-center justify-between text-[11px] bg-[#1E2438] px-2.5 py-1.5 rounded-lg border border-[#2D374E]/60 text-gray-400">
                    <span>Metrik: <b className="text-amber-300">{risk.metricValue}</b></span>
                    <span>Periode: <b>{risk.period}</b></span>
                  </div>

                  <div className="text-[11px] text-purple-200/80 bg-purple-950/20 border border-purple-500/20 p-2 rounded-lg">
                    <span className="font-semibold text-purple-300 block mb-0.5">Rekomendasi Tindakan:</span>
                    {risk.suggestedAction}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2D374E]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenEmployeeDrawer(risk.employeeId)}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Detail Karyawan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onCreateActionPlan(risk)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/30 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Buat Action Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
