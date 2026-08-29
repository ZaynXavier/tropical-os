/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — MASTER DATA RELATIONSHIP DRAWER
 * Interactive visual inspector for Area → Station → Role → Employee → Checklist / SOP hierarchy.
 */

import React from 'react';
import {
  X,
  Layers,
  MapPin,
  Briefcase,
  Users,
  FileCheck2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { OperationalStation, OperationalArea, EnrichedStationAssignment } from '../../types/operations';

interface MasterDataRelationshipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  station: OperationalStation | null;
  area: OperationalArea | null;
  assignments: EnrichedStationAssignment[];
  onOpenAssignModal?: (stationId: string) => void;
}

export const MasterDataRelationshipDrawer: React.FC<MasterDataRelationshipDrawerProps> = ({
  isOpen,
  onClose,
  station,
  area,
  assignments,
  onOpenAssignModal,
}) => {
  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        id="master-data-relationship-drawer"
        className="w-full max-w-lg bg-[#151B2B] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] border-b border-white/10 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Struktur Relasi Master Data</h3>
              <p className="text-xs text-slate-400">Area → Station → Role → Checklist & SOP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#151B2B]">
          {/* Step 1: Area */}
          <div className="p-4 bg-[#0B0F19] border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> Tingkat 1: Operational Area
              </span>
              <span className="text-xs font-mono bg-[#1E2438] px-2 py-0.5 rounded border border-white/10 text-slate-300">
                {area?.code || 'AREA'}
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{area?.name || 'Operational Area'}</h4>
            <p className="text-xs text-slate-400">{area?.description}</p>
          </div>

          {/* Step 2: Station */}
          <div className="p-4 bg-[#0B0F19] border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Tingkat 2: Operational Station
              </span>
              <span className="text-xs font-mono bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-semibold">
                {station.code}
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{station.name}</h4>
            <p className="text-xs text-slate-400">{station.description}</p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="bg-[#1E2438] px-2.5 py-1 rounded-md border border-white/10">
                Min: <strong className="font-mono text-white">{station.minimumStaff}</strong>
              </span>
              <span className="bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400">
                Ideal: <strong className="font-mono">{station.recommendedStaff}</strong>
              </span>
              <span className="bg-[#1E2438] px-2.5 py-1 rounded-md border border-white/10">
                Max: <strong className="font-mono text-white">{station.maximumStaff}</strong>
              </span>
            </div>
          </div>

          {/* Step 3: Assigned Personnel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" /> Personel Ditugaskan ({assignments.length})
              </span>
              {onOpenAssignModal && (
                <button
                  type="button"
                  onClick={() => onOpenAssignModal(station.id)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  + Tambah Staf
                </button>
              )}
            </div>

            {assignments.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                <span>Belum ada staf yang ditugaskan ke stasiun ini hari ini.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.map((asgn) => (
                  <div
                    key={asgn.id}
                    className="p-3 bg-[#0B0F19] border border-white/10 rounded-xl flex items-center justify-between text-xs hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1E2438] text-purple-300 font-bold flex items-center justify-center text-xs border border-white/10">
                        {asgn.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{asgn.employeeName}</p>
                        <p className="text-[11px] text-slate-400">
                          {asgn.roleName} • {asgn.shiftName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {asgn.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Linked SOPs & Checklists */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" /> Referensi SOP & Checklist Template
            </h5>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Standar Prosedur (SOP)
                </span>
                {station.sopIds && station.sopIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {station.sopIds.map((sopId) => (
                      <span
                        key={sopId}
                        className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-mono text-[11px] border border-purple-500/30"
                      >
                        {sopId.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">SOP operasional umum berlaku.</p>
                )}
              </div>

              <div className="p-3 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Checklist Templates Terkait
                </span>
                {station.checklistTemplateIds && station.checklistTemplateIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {station.checklistTemplateIds.map((tmplId) => (
                      <span
                        key={tmplId}
                        className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md font-mono text-[11px] border border-emerald-500/30"
                      >
                        {tmplId.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">Checklist shift standar berlaku.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111827] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-white border border-white/10 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
