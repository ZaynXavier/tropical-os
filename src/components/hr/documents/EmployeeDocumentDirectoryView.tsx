/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Employee Document Directory & Completeness Matrix
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Upload,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EmployeeDocumentCompleteness, CompletenessStatus } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';

interface EmployeeDocumentDirectoryViewProps {
  onSelectEmployee: (employeeId: string) => void;
  onOpenUploadForEmployee: (employeeId: string) => void;
  canManage: boolean;
}

const DEPARTMENTS = [
  'ALL',
  'Executive',
  'Management',
  'Service',
  'Kitchen',
  'Bar',
  'Cleaning',
  'Finance',
  'Marketing',
  'CRM',
];

export const EmployeeDocumentDirectoryView: React.FC<EmployeeDocumentDirectoryViewProps> = ({
  onSelectEmployee,
  onOpenUploadForEmployee,
  canManage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<CompletenessStatus | 'ALL'>('ALL');

  const allCompleteness = hrDocumentService.getAllEmployeeCompleteness();

  const filteredEmployees = allCompleteness.filter((emp) => {
    // Department filter
    if (selectedDepartment !== 'ALL' && emp.department !== selectedDepartment) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && emp.status !== selectedStatus) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = emp.employeeName.toLowerCase().includes(q);
      const matchCode = emp.employeeCode.toLowerCase().includes(q);
      const matchPos = emp.position.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPos && !matchDept) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status: CompletenessStatus, percentage: number) => {
    switch (status) {
      case 'COMPLETE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lengkap (100%)</span>
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sebagian ({percentage}%)</span>
          </span>
        );
      case 'INCOMPLETE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Lengkap ({percentage}%)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Controls: Search & Filters */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama staf, NIK, jabatan, atau divisi..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-bold hidden sm:inline">Divisi:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-[#1A133E] text-white">
                  {dept === 'ALL' ? 'Semua Divisi' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-bold hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL" className="bg-[#1A133E] text-white">Semua Kelengkapan</option>
              <option value="COMPLETE" className="bg-[#1A133E] text-white">Lengkap (100%)</option>
              <option value="PARTIAL" className="bg-[#1A133E] text-white">Sebagian (&ge;50%)</option>
              <option value="INCOMPLETE" className="bg-[#1A133E] text-white">Belum Lengkap (&lt;50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-[#130F30]/60 border border-white/10">
            <Users className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-white">Tidak ada karyawan yang cocok</h4>
            <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter divisi.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.employeeId}
              className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Header: Employee Name & Code */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/40 flex items-center justify-center font-black text-sm text-white shadow-md shadow-purple-900/30">
                    {emp.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                      {emp.employeeName}
                    </h3>
                    <p className="text-xs text-purple-200/70">
                      {emp.department} • <span className="text-gray-300">{emp.position}</span>
                    </p>
                    <span className="text-[10px] font-mono text-purple-300/80 bg-white/5 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {emp.employeeCode}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(emp.status, emp.completenessPercentage)}</div>
              </div>

              {/* Completeness Progress Bar */}
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Kelengkapan Berkas:</span>
                  <span className="font-mono font-bold text-white">
                    {emp.completedRequired} / {emp.totalRequired} Wajib
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      emp.completenessPercentage === 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : emp.completenessPercentage >= 50
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-orange-400'
                    }`}
                    style={{ width: `${emp.completenessPercentage}%` }}
                  />
                </div>
              </div>

              {/* Missing Documents Warning Tags */}
              {emp.missingDocuments.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span>Berkas Belum Diunggah ({emp.missingDocuments.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {emp.missingDocuments.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/25 text-[10px] text-rose-200"
                      >
                        {m.documentTypeName}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Semua berkas wajib telah lengkap dan terverifikasi.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                {canManage && (
                  <button
                    onClick={() => onOpenUploadForEmployee(emp.employeeId)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-purple-200 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectEmployee(emp.employeeId)}
                  className="flex-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer ml-auto"
                >
                  <span>Buka Profil Dokumen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
