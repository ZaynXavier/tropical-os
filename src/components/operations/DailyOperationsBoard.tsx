/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — DAILY OPERATIONS BOARD
 * Comprehensive daily operations station board grouped by 9 Operational Areas
 * with real-time staffing indicators, personnel chips, checklist status, and assign actions.
 */

import React, { useState } from 'react';
import {
  Layers,
  Users,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Eye,
  Search,
  Filter,
  FileCheck2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  OperationalArea,
  OperationalStation,
  EnrichedStationAssignment,
  StationCoverage,
} from '../../types/operations';

interface DailyOperationsBoardProps {
  areas: OperationalArea[];
  coverages: StationCoverage[];
  selectedAreaId: string;
  onSelectArea: (areaId: string) => void;
  onOpenAssignModal: (stationId: string, areaId: string) => void;
  onInspectStation: (station: OperationalStation) => void;
  onViewAssignmentDetail: (assignment: EnrichedStationAssignment) => void;
  canManage?: boolean;
}

export const DailyOperationsBoard: React.FC<DailyOperationsBoardProps> = ({
  areas,
  coverages,
  selectedAreaId,
  onSelectArea,
  onOpenAssignModal,
  onInspectStation,
  onViewAssignmentDetail,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [onlyUnderstaffed, setOnlyUnderstaffed] = useState(false);

  const getCapacityBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return (
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-md">
            Optimal
          </span>
        );
      case 'ADEQUATE':
        return (
          <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold px-2 py-0.5 rounded-md">
            Memadai
          </span>
        );
      case 'MINIMUM':
        return (
          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold px-2 py-0.5 rounded-md">
            Batas Minimum
          </span>
        );
      case 'UNDERSTAFFED':
        return (
          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-2 py-0.5 rounded-md animate-pulse">
            Kurang Personel
          </span>
        );
      case 'OVERSTAFFED':
        return (
          <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold px-2 py-0.5 rounded-md">
            Kelebihan
          </span>
        );
      default:
        return null;
    }
  };

  const filteredCoverages = coverages.filter((c) => {
    const matchesArea = selectedAreaId === 'ALL' || c.station?.areaId === selectedAreaId;
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (c.station?.name || '').toLowerCase().includes(searchLower) ||
      (c.station?.code || '').toLowerCase().includes(searchLower) ||
      c.assignments.some((a) => (a.employeeName || '').toLowerCase().includes(searchLower));
    const matchesUnderstaffed = !onlyUnderstaffed || c.capacity?.status === 'UNDERSTAFFED';
    return matchesArea && matchesSearch && matchesUnderstaffed;
  });

  // Group coverages by Area
  const groupedByArea = areas
    .filter((a) => selectedAreaId === 'ALL' || a.id === selectedAreaId)
    .map((area) => {
      const stationsInArea = filteredCoverages.filter((c) => c.station.areaId === area.id);
      return {
        area,
        coverages: stationsInArea,
      };
    })
    .filter((g) => g.coverages.length > 0 || selectedAreaId === g.area.id);

  return (
    <div className="space-y-4">
      {/* Area Filter Buttons Bar */}
      <div className="bg-[#151B2B] p-3.5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Horizontal scrollable Area tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => onSelectArea('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedAreaId === 'ALL'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                : 'bg-[#0B0F19] text-slate-400 hover:text-slate-200 hover:bg-[#1E2438] border border-white/10'
            }`}
          >
            Semua Area ({areas.length})
          </button>
          {areas.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea(area.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedAreaId === area.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                  : 'bg-[#0B0F19] text-slate-400 hover:text-slate-200 hover:bg-[#1E2438] border border-white/10'
              }`}
            >
              <span>{area.name}</span>
            </button>
          ))}
        </div>

        {/* Search & Understaffed toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari stasiun / staf..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyUnderstaffed(!onlyUnderstaffed)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              onlyUnderstaffed
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold shadow-rose-900/30'
                : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:text-white hover:bg-[#1E2438]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Kurang Staf</span>
          </button>
        </div>
      </div>

      {/* Board Columns per Area */}
      <div className="space-y-6">
        {groupedByArea.length === 0 ? (
          <div className="p-8 bg-[#151B2B] rounded-2xl border border-white/10 text-center space-y-2 shadow-xl">
            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Tidak ada stasiun yang cocok dengan filter.</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau pilih area lain.</p>
          </div>
        ) : (
          groupedByArea.map(({ area, coverages: areaCoverages }) => (
            <div
              key={area.id}
              className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl"
            >
              {/* Area Group Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1E2438] text-purple-300 border border-white/10 flex items-center justify-center font-bold text-xs">
                    {area.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{area.name}</h3>
                    <p className="text-[11px] text-slate-400">{area.description}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-white/10">
                  {areaCoverages.length} Stasiun
                </span>
              </div>

              {/* Station Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {areaCoverages.map((cov) => {
                  const { station, capacity, assignments } = cov;
                  const isUnderstaffed = capacity.status === 'UNDERSTAFFED';

                  return (
                    <div
                      key={station.id}
                      className={`bg-[#151B2B] rounded-xl border p-4 shadow-lg flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition ${
                        isUnderstaffed ? 'border-rose-500/40 bg-[#171A2E]' : 'border-white/10'
                      }`}
                    >
                      {/* Card Top: Title & Status */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{station.name}</span>
                              <span className="text-[10px] font-mono font-semibold bg-[#0B0F19] text-purple-300 border border-white/10 px-1.5 py-0.2 rounded-sm">
                                {station.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {station.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onInspectStation(station)}
                            title="Lihat Relasi SOP & Role"
                            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1E2438] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Capacity Status Pill & Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">
                              Personel: <strong className="text-white">{capacity.currentAssigned}</strong>{' '}
                              (Min {station.minimumStaff}, Ideal {station.recommendedStaff})
                            </span>
                            {getCapacityBadge(capacity.status)}
                          </div>
                          <div className="w-full bg-[#0B0F19] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                capacity.status === 'OPTIMAL'
                                  ? 'bg-emerald-500'
                                  : capacity.status === 'UNDERSTAFFED'
                                  ? 'bg-rose-500'
                                  : capacity.status === 'MINIMUM'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${capacity.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Assigned Personnel List / Chips */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" /> Personel Bertugas:
                          </span>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => onOpenAssignModal(station.id, area.id)}
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Tugaskan
                            </button>
                          )}
                        </div>

                        {assignments.length === 0 ? (
                          <div className="py-2 px-2.5 bg-[#0B0F19] rounded-lg text-center text-[11px] text-slate-500 border border-dashed border-white/10">
                            Belum ada personel ditugaskan
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {assignments.map((asgn) => (
                              <div
                                key={asgn.id}
                                onClick={() => onViewAssignmentDetail(asgn)}
                                className="p-2 bg-[#0B0F19] hover:bg-[#1E2438] rounded-lg border border-white/10 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {asgn.employeeName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-white block truncate text-[11px]">
                                      {asgn.employeeName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {asgn.roleName}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 group-hover:text-purple-400">
                                  Lihat &rarr;
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
