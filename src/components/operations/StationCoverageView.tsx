/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — STATION COVERAGE VIEW
 * Detailed Station Coverage Matrix table with staffing capacity indicators,
 * gap calculations, and quick assignment triggers.
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Users,
  Eye,
  Info,
} from 'lucide-react';
import {
  StationCoverage,
  OperationalArea,
  OperationalStation,
  EnrichedStationAssignment,
} from '../../types/operations';

interface StationCoverageViewProps {
  coverages: StationCoverage[];
  areas: OperationalArea[];
  onOpenAssignModal: (stationId: string, areaId: string) => void;
  onInspectStation: (station: OperationalStation) => void;
  onViewAssignmentDetail: (assignment: EnrichedStationAssignment) => void;
  canManage?: boolean;
}

export const StationCoverageView: React.FC<StationCoverageViewProps> = ({
  coverages,
  areas,
  onOpenAssignModal,
  onInspectStation,
  onViewAssignmentDetail,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDERSTAFFED' | 'OPTIMAL' | 'ADEQUATE'>('ALL');

  const areaMap = new Map<string, OperationalArea>(areas.map((a) => [a.id, a]));

  const filteredCoverages = coverages.filter((c) => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (c.station?.name || '').toLowerCase().includes(searchLower) ||
      (c.station?.code || '').toLowerCase().includes(searchLower) ||
      c.assignments.some((a) => (a.employeeName || '').toLowerCase().includes(searchLower));
    const matchesArea = selectedAreaId === 'ALL' || c.station?.areaId === selectedAreaId;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNDERSTAFFED' && c.capacity?.status === 'UNDERSTAFFED') ||
      (statusFilter === 'OPTIMAL' && c.capacity?.status === 'OPTIMAL') ||
      (statusFilter === 'ADEQUATE' && (c.capacity?.status === 'ADEQUATE' || c.capacity?.status === 'MINIMUM'));
    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari stasiun atau personel ditugaskan..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#0B0F19] font-medium text-white cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Area ({areas.length})</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#0B0F19] font-medium text-white cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Status Cakupan</option>
            <option value="UNDERSTAFFED">Kurang Personel (Understaffed)</option>
            <option value="OPTIMAL">Optimal</option>
            <option value="ADEQUATE">Memadai / Minimum</option>
          </select>
        </div>
      </div>

      {/* Coverage Table */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Stasiun & Area</th>
                <th className="px-4 py-3.5 text-center">Standar Kapasitas</th>
                <th className="px-4 py-3.5 text-center">Jumlah Saat Ini</th>
                <th className="px-4 py-3.5">Cakupan Personel (Coverage)</th>
                <th className="px-4 py-3.5">Personel Ditugaskan</th>
                {canManage && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredCoverages.map((cov) => {
                const { station, capacity, assignments } = cov;
                const area = areaMap.get(station.areaId);
                const isUnderstaffed = capacity.status === 'UNDERSTAFFED';

                return (
                  <tr
                    key={station.id}
                    className={`hover:bg-[#1E2438]/60 transition ${
                      isUnderstaffed ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    {/* Station & Area */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">{station.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-sm">
                            {station.code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {area?.name || station.areaId}
                        </span>
                      </div>
                    </td>

                    {/* Standard Capacity */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-xs">
                        <span className="bg-[#0B0F19] border border-white/10 px-2 py-0.5 rounded text-slate-400 font-semibold" title="Min">
                          Min: {station.minimumStaff}
                        </span>
                        <span className="bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-400 font-bold" title="Ideal">
                          Ideal: {station.recommendedStaff}
                        </span>
                      </div>
                    </td>

                    {/* Current Assigned */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`font-mono text-sm font-bold px-2 py-0.5 rounded-lg border ${
                          isUnderstaffed
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : capacity.status === 'OPTIMAL'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-[#0B0F19] text-slate-300 border-white/10'
                        }`}
                      >
                        {capacity.currentAssigned} Org
                      </span>
                    </td>

                    {/* Progress Bar & Status */}
                    <td className="px-4 py-3.5 min-w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold ${
                              isUnderstaffed
                                ? 'text-rose-400'
                                : capacity.status === 'OPTIMAL'
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {capacity.status === 'UNDERSTAFFED'
                              ? 'Kurang Personel'
                              : capacity.status === 'OPTIMAL'
                              ? 'Optimal'
                              : capacity.status === 'ADEQUATE'
                              ? 'Memadai'
                              : 'Batas Minimum'}
                          </span>
                          <span className="font-mono text-slate-400">{capacity.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isUnderstaffed
                                ? 'bg-rose-500'
                                : capacity.status === 'OPTIMAL'
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${capacity.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Assigned Personnel Chips */}
                    <td className="px-4 py-3.5">
                      {assignments.length === 0 ? (
                        <span className="text-slate-500 text-[11px] italic">Belum ada staf</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignments.map((asgn) => (
                            <button
                              key={asgn.id}
                              type="button"
                              onClick={() => onViewAssignmentDetail(asgn)}
                              className="px-2 py-1 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-200 border border-white/10 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {asgn.employeeName}
                              <span className="text-[10px] text-slate-400">({asgn.roleName})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectStation(station)}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-[#1E2438] text-slate-400 hover:text-white cursor-pointer"
                            title="Lihat Relasi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(station.id, station.areaId)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Tambah Staf
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
