/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Master Salary Management View
 * Source of Truth: PRD.md, RBAC.md
 */

import React, { useState, useEffect } from 'react';
import { SalaryMaster, SalaryStatus } from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import { payrollService, formatCurrency, formatDate } from '../../../services/payrollService';
import { SalaryFormModal } from './SalaryFormModal';
import { SalaryDetailModal } from './SalaryDetailModal';
import { SalaryAdvanceModal } from './SalaryAdvanceModal';
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  CreditCard,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  History,
  RotateCcw,
} from 'lucide-react';

interface SalaryManagementViewProps {
  currentUserId?: string;
  userRole?: string;
}

export const SalaryManagementView: React.FC<SalaryManagementViewProps> = ({
  currentUserId = 'emp-02',
  userRole = 'MANAGER',
}) => {
  const [salaries, setSalaries] = useState<SalaryMaster[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | 'ALL'>('ACTIVE');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryMaster | null>(null);
  const [editingSalary, setEditingSalary] = useState<SalaryMaster | null>(null);

  // Permission flags
  const canManageSalary = userRole === 'MANAGER' || userRole === 'OWNER' || userRole === 'HR';
  const canApproveAdvance = userRole === 'MANAGER' || userRole === 'FINANCE' || userRole === 'OWNER';

  useEffect(() => {
    loadSalaries();
  }, [departmentFilter, statusFilter, searchQuery]);

  const loadSalaries = async () => {
    try {
      setLoading(true);
      const res = await payrollService.getAllSalaries({
        department: departmentFilter,
        status: statusFilter,
        searchQuery,
      });
      setSalaries(res);
    } catch (err) {
      console.error('Failed to load salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregated summary metrics for active salaries
  const activeSalaries = salaries.filter((s) => s.salaryStatus === 'ACTIVE');
  const totalMonthlyBasic = activeSalaries.reduce((acc, s) => acc + s.basicSalary, 0);
  const totalMonthlyAllowance = activeSalaries.reduce((acc, s) => acc + s.fixedAllowance, 0);
  const totalMonthlyCommitment = totalMonthlyBasic + totalMonthlyAllowance;

  const departments = Array.from(new Set(MASTER_EMPLOYEES.map((e) => e.department)));

  const handleOpenEdit = (sal: SalaryMaster) => {
    setEditingSalary(sal);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (sal: SalaryMaster) => {
    setSelectedSalary(sal);
    setIsDetailModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingSalary(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">Simulasi Master Penggajian (Salary Foundation)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Data Simulasi
              </span>
            </div>
            <p className="text-gray-300 text-[11px] mt-0.5">
              Struktur gaji pokok & tunjangan tetap 24 personnel terintegrasi dengan riwayat penyesuaian (Salary History).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Manajemen Kasbon</span>
          </button>
          {canManageSalary && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tetapkan Gaji</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
          <p className="text-xs font-semibold text-gray-400">Total Karyawan Bergaji</p>
          <p className="text-2xl font-bold text-white">{activeSalaries.length} / 24</p>
          <p className="text-[11px] text-gray-500">Personnel terdaftar</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
          <p className="text-xs font-semibold text-gray-400">Total Gaji Pokok Bulanan</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalMonthlyBasic)}</p>
          <p className="text-[11px] text-gray-500">Kompensasi dasar operasional</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
          <p className="text-xs font-semibold text-gray-400">Total Tunjangan Tetap</p>
          <p className="text-xl font-bold text-purple-400">{formatCurrency(totalMonthlyAllowance)}</p>
          <p className="text-[11px] text-gray-500">Makan, Transport, Jabatan</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#181F32] border border-emerald-500/30 bg-emerald-500/5 space-y-1">
          <p className="text-xs font-bold text-emerald-400">Komitmen Gaji Tetap (Gross)</p>
          <p className="text-xl font-bold text-emerald-300">{formatCurrency(totalMonthlyCommitment)}</p>
          <p className="text-[11px] text-gray-400">Sebelum lembur & potongan</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan berdasarkan nama, kode pegawai, atau jabatan..."
            className="w-full bg-[#111827] border border-[#2D374E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif Berlaku</option>
              <option value="HISTORICAL">Historis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary Master Table (Desktop) */}
      <div className="hidden md:block bg-[#181F32] border border-[#2D374E] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#2D374E]">
              <tr>
                <th className="px-5 py-3.5">Karyawan</th>
                <th className="px-4 py-3.5">Departemen</th>
                <th className="px-4 py-3.5 text-right">Gaji Pokok</th>
                <th className="px-4 py-3.5 text-right">Tunjangan Tetap</th>
                <th className="px-4 py-3.5 text-right">Gross Fixed</th>
                <th className="px-4 py-3.5">Mulai Berlaku</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    Memuat data master gaji...
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    Tidak ada data gaji yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                salaries.map((sal) => {
                  const emp = MASTER_EMPLOYEES.find((e) => e.id === sal.employeeId);
                  const gross = sal.basicSalary + sal.fixedAllowance;

                  return (
                    <tr key={sal.salaryId} className="hover:bg-[#252D42]/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs">
                            {emp?.fullName.charAt(0) || 'K'}
                          </div>
                          <div>
                            <p className="font-bold text-white">{emp?.fullName || 'Karyawan'}</p>
                            <p className="text-[10px] text-gray-400">
                              {emp?.employeeCode} • {emp?.primaryPosition}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          {emp?.department || '-'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-white">
                        {formatCurrency(sal.basicSalary)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold text-purple-300">
                        {formatCurrency(sal.fixedAllowance)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                        {formatCurrency(gross)}
                      </td>

                      <td className="px-4 py-3.5 text-gray-400">
                        {formatDate(sal.effectiveDate)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sal.salaryStatus === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {sal.salaryStatus === 'ACTIVE' ? 'Aktif' : 'Historis'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(sal)}
                            className="p-1.5 rounded-lg bg-[#111827] text-gray-300 hover:text-white hover:bg-purple-600/30 border border-[#2D374E] transition-colors cursor-pointer"
                            title="Lihat Rincian & Histori"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canManageSalary && (
                            <button
                              onClick={() => handleOpenEdit(sal)}
                              className="p-1.5 rounded-lg bg-[#111827] text-gray-300 hover:text-purple-300 hover:bg-purple-600/30 border border-[#2D374E] transition-colors cursor-pointer"
                              title="Ubah Gaji"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Master Cards (Mobile) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-6 text-xs text-gray-500">Memuat data gaji...</p>
        ) : salaries.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-500">Tidak ada data gaji.</p>
        ) : (
          salaries.map((sal) => {
            const emp = MASTER_EMPLOYEES.find((e) => e.id === sal.employeeId);
            const gross = sal.basicSalary + sal.fixedAllowance;

            return (
              <div
                key={sal.salaryId}
                className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold">
                      {emp?.fullName.charAt(0) || 'K'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{emp?.fullName}</p>
                      <p className="text-[10px] text-gray-400">
                        {emp?.employeeCode} • {emp?.primaryPosition}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sal.salaryStatus === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {sal.salaryStatus === 'ACTIVE' ? 'Aktif' : 'Historis'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#111827] rounded-xl border border-[#2D374E]/60 text-[11px]">
                  <div>
                    <span className="text-gray-400">Gaji Pokok:</span>
                    <p className="font-bold text-white">{formatCurrency(sal.basicSalary)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Tunj. Tetap:</span>
                    <p className="font-semibold text-purple-300">{formatCurrency(sal.fixedAllowance)}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#2D374E] flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">Gross Fixed:</span>
                    <span className="font-bold text-emerald-300">{formatCurrency(gross)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500">Berlaku: {formatDate(sal.effectiveDate)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetail(sal)}
                      className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-gray-300 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>
                    {canManageSalary && (
                      <button
                        onClick={() => handleOpenEdit(sal)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ubah</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <SalaryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadSalaries}
        editingSalary={editingSalary}
        currentUserId={currentUserId}
      />

      <SalaryDetailModal
        salary={selectedSalary}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
        canEdit={canManageSalary}
      />

      <SalaryAdvanceModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSuccess={loadSalaries}
        currentUserId={currentUserId}
        canApprove={canApproveAdvance}
      />
    </div>
  );
};
