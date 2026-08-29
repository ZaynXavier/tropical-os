/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Department Health Cards Grid
 */

import React from 'react';
import { DepartmentHealthItem } from '../../../types/hrReports';
import { Building2, Users, CheckCircle2, Clock, FileCheck, BookOpen, HeartPulse } from 'lucide-react';

interface DepartmentHealthCardProps {
  departments: DepartmentHealthItem[];
  onSelectDepartment?: (dept: string) => void;
}

export const DepartmentHealthCard: React.FC<DepartmentHealthCardProps> = ({
  departments,
  onSelectDepartment,
}) => {
  const getBadge = (level: DepartmentHealthItem['healthLevel']) => {
    switch (level) {
      case 'EXCELLENT':
        return {
          label: 'Excellent',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          bar: 'bg-emerald-400',
        };
      case 'HEALTHY':
        return {
          label: 'Healthy',
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          bar: 'bg-blue-400',
        };
      case 'NEEDS_ATTENTION':
        return {
          label: 'Attention',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          bar: 'bg-amber-400',
        };
      case 'CRITICAL':
        return {
          label: 'Critical',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          bar: 'bg-rose-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Kesehatan SDM Per Divisi (Department Health Score)</span>
          </h3>
          <p className="text-xs text-gray-400">
            Monitoring komparatif performa kehadiran, checklist, SOP, dan beban lembur antar divisi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(departments || []).map((dept) => {
          const badge = getBadge(dept.healthLevel);
          return (
            <div
              key={dept.department}
              onClick={() => onSelectDepartment && onSelectDepartment(dept.department)}
              className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4.5 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#2D374E] flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {dept.department}
                      </h4>
                      <span className="text-[11px] text-gray-400">{dept.headcount} Personel</span>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </div>
                </div>

                {/* Score & Progress */}
                <div className="bg-[#111827] p-3 rounded-xl border border-[#2D374E]/60 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400 flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-purple-400" />
                      Health Score
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {dept.healthScore} <span className="text-[10px] text-gray-500">/ 100</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1E2438] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${badge.bar}`}
                      style={{ width: `${Math.min(100, dept.healthScore)}%` }}
                    />
                  </div>
                </div>

                {/* Micro stats */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center justify-between bg-[#111827]/40 px-2 py-1 rounded">
                    <span>Presensi:</span>
                    <b className="text-gray-200">{dept.attendanceRate}%</b>
                  </div>
                  <div className="flex items-center justify-between bg-[#111827]/40 px-2 py-1 rounded">
                    <span>Checklist:</span>
                    <b className="text-gray-200">{dept.checklistScore}%</b>
                  </div>
                  <div className="flex items-center justify-between bg-[#111827]/40 px-2 py-1 rounded">
                    <span>SOP Read:</span>
                    <b className="text-gray-200">{dept.sopComplianceRate}%</b>
                  </div>
                  <div className="flex items-center justify-between bg-[#111827]/40 px-2 py-1 rounded">
                    <span>Lembur:</span>
                    <b className="text-gray-200">{dept.overtimeHours}j</b>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#2D374E]/60 flex items-center justify-between text-[10px] text-gray-400">
                <span>Rata-rata KPI: <b className="text-white">{dept.kpiScore} Poin</b></span>
                <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
