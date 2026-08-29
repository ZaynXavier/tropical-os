/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Global Filter Bar for HR Reports & People Analytics
 */

import React from 'react';
import { HRReportFilterState, ReportPeriod } from '../../../types/hrReports';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import { Calendar, Filter, Search, RotateCcw, Building2, User } from 'lucide-react';

interface HRReportFiltersProps {
  filters: HRReportFilterState;
  onChange: (filters: HRReportFilterState) => void;
  onReset: () => void;
  showEmployeeFilter?: boolean;
}

const DEPARTMENTS = [
  { id: 'ALL', name: 'Semua Divisi' },
  { id: 'KITCHEN', name: 'Kitchen' },
  { id: 'BAR', name: 'Bar' },
  { id: 'SERVICE', name: 'Service' },
  { id: 'CLEANING', name: 'Cleaning & Dishwash' },
  { id: 'CRM', name: 'CRM & Cashier' },
  { id: 'FINANCE', name: 'Finance & Purchasing' },
  { id: 'OPERATIONS', name: 'Operations & Management' },
];

const PERIODS: Array<{ id: ReportPeriod; label: string }> = [
  { id: 'TODAY', label: 'Hari Ini' },
  { id: 'THIS_WEEK', label: 'Minggu Ini' },
  { id: 'THIS_MONTH', label: 'Bulan Ini (Ags 2026)' },
  { id: 'LAST_MONTH', label: 'Bulan Lalu (Jul 2026)' },
  { id: 'CUSTOM', label: 'Kustom Tanggal' },
];

export const HRReportFilters: React.FC<HRReportFiltersProps> = ({
  filters,
  onChange,
  onReset,
  showEmployeeFilter = true,
}) => {
  const availableEmployees = React.useMemo(() => {
    if (filters.department === 'ALL') return INITIAL_EMPLOYEES;
    return INITIAL_EMPLOYEES.filter(
      (e) => e.department.toUpperCase() === filters.department.toUpperCase()
    );
  }, [filters.department]);

  return (
    <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 space-y-3">
      {/* Top row: Quick Period Badges & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mr-1 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            Periode:
          </span>
          {PERIODS.map((p) => {
            const isActive = filters.period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChange({ ...filters, period: p.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-[#111827] text-gray-400 hover:text-gray-200 hover:bg-[#1A2234]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari staf, NIK, jabatan..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl pl-9 pr-3 py-2 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Bottom row: Dropdowns for Department, Employee, and Custom Date Range */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2D374E]/60 text-xs">
        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <label className="text-gray-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            Divisi:
          </label>
          <select
            value={filters.department}
            onChange={(e) =>
              onChange({
                ...filters,
                department: e.target.value,
                employeeId: 'ALL', // reset employee when dept changes
              })
            }
            className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Filter */}
        {showEmployeeFilter && (
          <div className="flex items-center gap-2">
            <label className="text-gray-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Karyawan:
            </label>
            <select
              value={filters.employeeId || 'ALL'}
              onChange={(e) => onChange({ ...filters, employeeId: e.target.value })}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer max-w-[200px]"
            >
              <option value="ALL">Semua Karyawan (24 Personel)</option>
              {availableEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employeeCode} - {e.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Date Range */}
        {filters.period === 'CUSTOM' && (
          <div className="flex items-center gap-2 animate-fade-in">
            <input
              type="date"
              value={filters.startDate || '2026-08-01'}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-purple-500"
            />
            <span className="text-gray-400 text-xs">s/d</span>
            <input
              type="date"
              value={filters.endDate || '2026-08-31'}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="bg-[#111827] border border-[#2D374E] text-white text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Reset Button */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 bg-[#111827] hover:bg-[#1A2234] border border-[#2D374E] px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
