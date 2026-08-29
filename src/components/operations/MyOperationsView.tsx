/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — MY OPERATIONS VIEW (STAFF PERSPECTIVE)
 * Mobile-first operational dashboard for staff members showing today's station assignment,
 * shift timing, operational role expectations, linked SOPs, and issue reporting.
 */

import React from 'react';
import {
  MapPin,
  Layers,
  Clock,
  Briefcase,
  FileCheck2,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { EnrichedStationAssignment, OperationalArea, OperationalStation } from '../../types/operations';
import { Employee } from '../../types/employee';

interface MyOperationsViewProps {
  currentEmployee: Employee;
  todayAssignments: EnrichedStationAssignment[];
  areas: OperationalArea[];
  stations: OperationalStation[];
  onOpenReportIssue: () => void;
  onNavigateToChecklist?: () => void;
}

export const MyOperationsView: React.FC<MyOperationsViewProps> = ({
  currentEmployee,
  todayAssignments,
  areas,
  stations,
  onOpenReportIssue,
  onNavigateToChecklist,
}) => {
  const activeAssignment = todayAssignments.find((a) => a.status === 'ACTIVE');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Staff Greeting & Status Card */}
      <div className="bg-[#151B2B] text-white rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xl">
            {(currentEmployee.fullName || currentEmployee.name || 'EM').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Staff On-Duty
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentEmployee.employeeCode || currentEmployee.id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {currentEmployee.fullName || currentEmployee.name}
            </h3>
            <p className="text-xs text-slate-300">
              {currentEmployee.primaryPosition || currentEmployee.role} • {currentEmployee.department || currentEmployee.division}
            </p>
          </div>
        </div>

        {/* Special Roles Badge */}
        {currentEmployee.additionalResponsibilities && currentEmployee.additionalResponsibilities.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Tanggung Jawab Khusus:</span>
            {currentEmployee.additionalResponsibilities.map((resp, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md text-[11px] font-medium"
              >
                {resp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active Station Assignment Card */}
      {activeAssignment ? (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Penugasan Stasiun Hari Ini</h4>
                <p className="text-[11px] text-slate-400">Alokasi stasiun kerja & peran operasional</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activeAssignment.shiftName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> Area
              </span>
              <p className="font-bold text-white text-sm">{activeAssignment.areaName}</p>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Stasiun Kerja
              </span>
              <p className="font-bold text-white text-sm">{activeAssignment.stationName}</p>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Peran Operasional
              </span>
              <p className="font-bold text-white text-sm">{activeAssignment.roleName}</p>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Jam Kerja
              </span>
              <p className="font-bold text-white text-sm">{activeAssignment.shiftHours}</p>
            </div>
          </div>

          {activeAssignment.notes && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-amber-300">Instruksi Supervisor:</span>
              <p className="text-amber-200/90 leading-relaxed">{activeAssignment.notes}</p>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {onNavigateToChecklist && (
              <button
                type="button"
                onClick={onNavigateToChecklist}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" /> Buka Checklist Shift
              </button>
            )}
            <button
              type="button"
              onClick={onOpenReportIssue}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Laporkan Kendala
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[#151B2B] rounded-2xl border border-white/10 shadow-xl text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="font-bold text-white text-sm">Belum Ada Penugasan Stasiun Hari Ini</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hubungi Supervisor Shift atau Manager Anda untuk verifikasi penugasan stasiun harian Anda.
          </p>
          <button
            type="button"
            onClick={onOpenReportIssue}
            className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Laporkan Pertanyaan / Kendala
          </button>
        </div>
      )}

      {/* Operational Hygiene & Standards Reminder */}
      <div className="p-4 bg-[#151B2B] border border-white/10 rounded-2xl space-y-2 text-xs text-slate-300 shadow-xl">
        <h5 className="font-bold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Standar Operasional Tropical Garden
        </h5>
        <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px] leading-relaxed">
          <li>Pastikan seragam, celemek, dan hairnet/topi terpasang rapi sebelum masuk stasiun.</li>
          <li>Lakukan cuci tangan 6 langkah sesuai standar SOP Sanitasi di awal dan pergantian tugas.</li>
          <li>Laporkan segera ke Supervisor jika terdapat bahan baku di bawah standar kualitas.</li>
        </ul>
      </div>
    </div>
  );
};
