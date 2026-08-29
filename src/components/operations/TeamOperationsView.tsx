/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — TEAM OPERATIONS VIEW (SUPERVISOR PERSPECTIVE)
 * Dedicated view for Shift Supervisors and Floor Managers to oversee their squad,
 * track active station coverage, monitor gaps, and dispatch staff quickly.
 */

import React, { useState } from 'react';
import {
  Users,
  Layers,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Briefcase,
  FileCheck2,
} from 'lucide-react';
import {
  EnrichedStationAssignment,
  StationCoverage,
  OperationalArea,
  OperationalStation,
} from '../../types/operations';
import { Employee } from '../../types/employee';
import { INITIAL_EMPLOYEES } from '../../data/employees';

interface TeamOperationsViewProps {
  assignments: EnrichedStationAssignment[];
  coverages: StationCoverage[];
  areas: OperationalArea[];
  stations: OperationalStation[];
  onOpenAssignModal: (stationId?: string, areaId?: string) => void;
  onViewAssignmentDetail: (assignment: EnrichedStationAssignment) => void;
  canManage?: boolean;
}

export const TeamOperationsView: React.FC<TeamOperationsViewProps> = ({
  assignments,
  coverages,
  areas,
  stations,
  onOpenAssignModal,
  onViewAssignmentDetail,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const activeStaff = INITIAL_EMPLOYEES.filter(
    (e) => e.status === 'ACTIVE' && e.accessLevel !== 'OWNER'
  );

  const filteredStaff = activeStaff.filter((emp) => {
    const searchLower = (search || '').toLowerCase();
    const nameStr = (emp.fullName || emp.name || '').toLowerCase();
    const posStr = (emp.primaryPosition || emp.role || '').toLowerCase();
    const matchesSearch = !searchLower || nameStr.includes(searchLower) || posStr.includes(searchLower);
    const matchesDept =
      departmentFilter === 'ALL' ||
      emp.department === departmentFilter ||
      emp.division === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const understaffedCount = coverages.filter((c) => c.capacity.status === 'UNDERSTAFFED').length;

  return (
    <div className="space-y-5">
      {/* Supervisor Command Header */}
      <div className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pengawasan Tim & Alokasi Floor</h3>
            <p className="text-xs text-slate-400">
              Monitoring kesiapan personel dan stasiun untuk Shift Berjalan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {understaffedCount > 0 && (
            <div className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{understaffedCount} Stasiun Kurang Personel</span>
            </div>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => onOpenAssignModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Alokasikan Staf Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari anggota tim..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#0B0F19] font-medium text-white cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
        >
          <option value="ALL">Semua Departemen</option>
          <option value="KITCHEN">Kitchen / Produksi</option>
          <option value="SERVICE">Service & Floor</option>
          <option value="BAR">Bar & Beverage</option>
          <option value="CASHIER">Kasir & Finance</option>
          <option value="MANAGEMENT">Management / Spv</option>
        </select>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((emp) => {
          const empAssignment = assignments.find(
            (a) => a.employeeId === emp.id && a.status === 'ACTIVE'
          );

          return (
            <div
              key={emp.id}
              className={`bg-[#151B2B] rounded-2xl border p-4.5 shadow-lg space-y-3 hover:border-purple-500/40 transition ${
                empAssignment ? 'border-white/10' : 'border-dashed border-amber-500/40 bg-[#1A1A28]'
              }`}
            >
              {/* Top: Avatar & Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1E2438] text-purple-300 font-bold flex items-center justify-center text-xs border border-white/10">
                    {(emp.fullName || emp.name).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{emp.fullName || emp.name}</h4>
                    <p className="text-xs text-slate-400">
                      {emp.primaryPosition || emp.role} • {emp.department || emp.division}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-[#0B0F19] border border-white/10 px-1.5 py-0.5 rounded">
                  {emp.employeeCode || emp.id}
                </span>
              </div>

              {/* Special Responsibilities Chips */}
              {emp.additionalResponsibilities && emp.additionalResponsibilities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {emp.additionalResponsibilities.map((resp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md text-[10px] font-medium border border-emerald-500/30"
                    >
                      {resp}
                    </span>
                  ))}
                </div>
              )}

              {/* Current Station Assignment Status */}
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 space-y-1.5 text-xs">
                {empAssignment ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        {empAssignment.stationName}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.2 rounded">
                        {empAssignment.shiftName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Peran: {empAssignment.roleName}</span>
                      <button
                        type="button"
                        onClick={() => onViewAssignmentDetail(empAssignment)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Detail &rarr;
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-medium text-[11px]">
                      Belum ditugaskan ke stasiun
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal()}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        + Tugaskan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
