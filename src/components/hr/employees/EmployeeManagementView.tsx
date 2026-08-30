import React, { useState, useEffect, useMemo } from 'react';
import {
  Employee,
  Department,
  AccessLevel,
  EmploymentStatus,
  EmployeeActiveStatus,
  EmployeeStatistics,
} from '../../../types/employee';
import { employeeService } from '../../../services/employeeService';
import { useAuth } from '../../../context/AuthContext';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeStatusModal } from './EmployeeStatusModal';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  RotateCcw,
  UserPlus,
  Eye,
  Edit3,
  Power,
  Shield,
  Briefcase,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronDown,
} from 'lucide-react';

export const EmployeeManagementView: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const isManager = hasRole('MANAGER');
  const isOwner = hasRole('OWNER');
  const isSupervisor = hasRole('SUPERVISOR');
  const canManage = isManager; // Only Manager can mutate master data

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<EmployeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [selectedAccess, setSelectedAccess] = useState<AccessLevel | 'ALL'>('ALL');
  const [selectedEmployment, setSelectedEmployment] = useState<EmploymentStatus | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<EmployeeActiveStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [formEmployee, setFormEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusEmployee, setStatusEmployee] = useState<Employee | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Load Data
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([
        employeeService.getEmployees(),
        employeeService.getEmployeeStatistics(),
      ]);
      setEmployees(list);
      setStatistics(stats);
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal memuat data karyawan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Supervisor scope constraint if needed (by default supervisor sees directory)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = emp.fullName.toLowerCase().includes(q);
        const matchCode = emp.employeeCode.toLowerCase().includes(q);
        const matchEmail = emp.email.toLowerCase().includes(q);
        const matchPhone = emp.phone.includes(q);
        const matchPos = emp.primaryPosition.toLowerCase().includes(q);
        const matchDept = emp.department.toLowerCase().includes(q);
        const matchResp = emp.additionalResponsibilities.some((r) => r.toLowerCase().includes(q));
        if (!matchName && !matchCode && !matchEmail && !matchPhone && !matchPos && !matchDept && !matchResp) {
          return false;
        }
      }

      if (selectedDept !== 'ALL' && emp.department !== selectedDept) {
        return false;
      }

      if (selectedAccess !== 'ALL' && emp.accessLevel !== selectedAccess) {
        return false;
      }

      if (selectedEmployment !== 'ALL' && emp.employmentStatus !== selectedEmployment) {
        return false;
      }

      if (selectedStatus !== 'ALL' && emp.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [employees, searchQuery, selectedDept, selectedAccess, selectedEmployment, selectedStatus]);

  // Handle Save (Create or Update)
  const handleSaveEmployee = async (data: any) => {
    try {
      if (formEmployee) {
        await employeeService.updateEmployee(formEmployee.id, data);
        setFeedback({ type: 'success', message: `Data karyawan ${data.fullName} berhasil diperbarui.` });
      } else {
        await employeeService.createEmployee(data);
        setFeedback({ type: 'success', message: `Karyawan baru ${data.fullName} berhasil didaftarkan.` });
      }
      await loadEmployees();
    } catch (err: any) {
      throw err;
    }
  };

  // Handle Status Toggle
  const handleConfirmStatus = async (employeeId: string, newActiveState: boolean) => {
    try {
      if (newActiveState) {
        await employeeService.activateEmployee(employeeId);
        setFeedback({ type: 'success', message: 'Status karyawan berhasil diaktifkan kembali.' });
      } else {
        await employeeService.deactivateEmployee(employeeId);
        setFeedback({ type: 'success', message: 'Status karyawan berhasil dinonaktifkan.' });
      }
      await loadEmployees();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengubah status karyawan.' });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('ALL');
    setSelectedAccess('ALL');
    setSelectedEmployment('ALL');
    setSelectedStatus('ALL');
  };

  // Reset to initial 24 official
  const handleResetDatabase = async () => {
    if (window.confirm('Reset master database ke 24 personil resmi Tropical Garden Resto?')) {
      await employeeService.resetToInitial();
      await loadEmployees();
      setFeedback({ type: 'success', message: 'Database telah direset ke 24 personil resmi Tropical Garden Resto.' });
    }
  };

  const getAccessBadge = (level: AccessLevel) => {
    switch (level) {
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MANAGER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'SUPERVISOR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'ON_LEAVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3 text-xs font-semibold">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 bg-black/20 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#13192B] to-indigo-950/40 border border-purple-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/40 text-white flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest px-2.5 py-0.5 bg-purple-500/10 rounded-full border border-purple-500/20">
                Single Source of Truth
              </span>
              <span className="text-xs text-purple-200/60 font-mono">Master HR &amp; Personnel</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Direktori &amp; Manajemen Karyawan
            </h1>
            <p className="text-xs text-purple-200/70 max-w-2xl mt-0.5">
              Pusat data {employees.length} personil Tropical Garden Resto dengan pemetaan jabatan pokok, tanggung jawab khusus, dan kredensial login akun.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canManage && (
            <button
              onClick={() => {
                setFormEmployee(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Karyawan</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={handleResetDatabase}
              title="Reset ke 24 personil resmi"
              className="p-2.5 bg-[#1E2438] hover:bg-gray-800 text-gray-400 hover:text-white rounded-2xl border border-[#2D374E] text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold">Total Karyawan</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {statistics?.totalEmployees ?? employees.length} <span className="text-xs font-normal text-gray-400">Personel</span>
          </div>
          <div className="text-[11px] text-purple-300/80">Master resmi resto</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold">Karyawan Aktif</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {statistics?.activeEmployees ?? employees.filter((e) => e.isActive).length}{' '}
            <span className="text-xs font-normal text-gray-400">Orang</span>
          </div>
          <div className="text-[11px] text-emerald-300/80">Status siap tugas</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold">Non-Aktif / Cuti</span>
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {(statistics?.inactiveEmployees ?? 0) + (statistics?.onLeaveEmployees ?? 0)}{' '}
            <span className="text-xs font-normal text-gray-400">Orang</span>
          </div>
          <div className="text-[11px] text-gray-400">Cuti/Non-aktif</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold">Departemen</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            8 <span className="text-xs font-normal text-gray-400">Divisi Operasional</span>
          </div>
          <div className="text-[11px] text-indigo-200/80">Kitchen, Bar, Svc, CRM, dll.</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kode TG-, email, posisi, atau tanggung jawab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Selectors & View Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="px-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Kitchen">Kitchen (Dapur)</option>
              <option value="Bar">Bar</option>
              <option value="Service">Service (Pelayanan)</option>
              <option value="Cleaning">Cleaning &amp; Dishwash</option>
              <option value="CRM">CRM &amp; Reservasi</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing / Content</option>
              <option value="Management">Management</option>
              <option value="Executive">Executive</option>
            </select>

            {/* Access Level Filter */}
            <select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value as any)}
              className="px-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Level RBAC</option>
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="STAFF">Staff</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Non-Aktif</option>
              <option value="ON_LEAVE">Cuti</option>
            </select>

            {/* Reset Button */}
            {(searchQuery || selectedDept !== 'ALL' || selectedAccess !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold border border-red-500/30 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#1E2438] p-1 rounded-xl border border-[#2D374E]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Menampilkan <strong className="text-purple-300">{filteredEmployees.length}</strong> dari{' '}
          <strong className="text-white">{employees.length}</strong> Karyawan
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-[#13192B] border border-[#2D374E] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-mono">Memuat Direktori Karyawan Tropical Garden...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#13192B] border border-[#2D374E] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Tidak Ada Karyawan Ditemukan</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tidak ada data karyawan yang cocok dengan kriteria pencarian atau filter yang Anda terapkan.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <>
          {/* 1. TABLE VIEW (Desktop / Tablet) */}
          <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'}`}>
            <div className="bg-[#13192B] rounded-3xl border border-[#2D374E] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1E2438] text-gray-400 uppercase tracking-wider text-[10px] font-black border-b border-[#2D374E]">
                      <th className="py-3.5 px-4">Karyawan &amp; Kode</th>
                      <th className="py-3.5 px-4">Departemen</th>
                      <th className="py-3.5 px-4">Jabatan Pokok</th>
                      <th className="py-3.5 px-4">Tanggung Jawab Khusus</th>
                      <th className="py-3.5 px-4">Level Akses</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#1E2438]/50 transition-colors">
                        {/* Karyawan & Kode */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-700 border border-purple-400/30 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                              {emp.fullName
                                ? emp.fullName
                                    .trim()
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .map((n) => n[0] || '')
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase() || 'TG'
                                : 'TG'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate hover:text-purple-300 cursor-pointer" onClick={() => setDetailEmployee(emp)}>
                                {emp.fullName}
                              </span>
                              <span className="font-mono text-[10px] text-purple-400 block">{emp.employeeCode}</span>
                            </div>
                          </div>
                        </td>

                        {/* Departemen */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-[#1E2438] border border-[#2D374E] text-xs text-gray-200 font-semibold">
                            {emp.department}
                          </span>
                        </td>

                        {/* Jabatan Pokok */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white text-xs">{emp.primaryPosition}</span>
                          <span className="text-[10px] text-gray-400 block">{emp.employmentStatus}</span>
                        </td>

                        {/* Tanggung Jawab Khusus */}
                        <td className="py-3.5 px-4">
                          {emp.additionalResponsibilities.length === 0 ? (
                            <span className="text-gray-500 text-[11px] italic">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {emp.additionalResponsibilities.map((resp, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold"
                                >
                                  {resp}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Level Akses */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${getAccessBadge(
                              emp.accessLevel
                            )}`}
                          >
                            {emp.accessLevel}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusBadge(
                              emp.status
                            )}`}
                          >
                            {emp.status === 'ACTIVE' ? 'Aktif' : emp.status === 'INACTIVE' ? 'Non-Aktif' : 'Cuti'}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailEmployee(emp)}
                              title="Lihat Detail Profil & Garis Komando"
                              className="p-1.5 bg-[#1E2438] hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg border border-[#2D374E] transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {canManage && (
                              <button
                                onClick={() => {
                                  setFormEmployee(emp);
                                  setIsFormOpen(true);
                                }}
                                title="Edit Data Karyawan"
                                className="p-1.5 bg-[#1E2438] hover:bg-indigo-600 text-gray-300 hover:text-white rounded-lg border border-[#2D374E] transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canManage && emp.accessLevel !== 'OWNER' && (
                              <button
                                onClick={() => {
                                  setStatusEmployee(emp);
                                  setIsStatusOpen(true);
                                }}
                                title={emp.isActive ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  emp.isActive
                                    ? 'bg-[#1E2438] hover:bg-red-600 text-gray-400 hover:text-white border-[#2D374E]'
                                    : 'bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. CARD VIEW (Mobile Always, Desktop on Toggle) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
              viewMode === 'table' ? 'md:hidden' : ''
            }`}
          >
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-5 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 border border-purple-400/30 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                        {emp.fullName
                          ? emp.fullName
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean)
                              .map((n) => n[0] || '')
                              .slice(0, 2)
                              .join('')
                              .toUpperCase() || 'TG'
                          : 'TG'}
                      </div>
                      <div>
                        <h3
                          className="font-black text-base text-white hover:text-purple-300 cursor-pointer"
                          onClick={() => setDetailEmployee(emp)}
                        >
                          {emp.fullName}
                        </h3>
                        <span className="font-mono text-xs text-purple-400">{emp.employeeCode}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusBadge(
                        emp.status
                      )}`}
                    >
                      {emp.status === 'ACTIVE' ? 'Aktif' : emp.status === 'INACTIVE' ? 'Non-Aktif' : 'Cuti'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Jabatan:</span>
                      <strong className="text-white">{emp.primaryPosition}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Departemen:</span>
                      <strong className="text-purple-300">{emp.department}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level Akses:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getAccessBadge(
                          emp.accessLevel
                        )}`}
                      >
                        {emp.accessLevel}
                      </span>
                    </div>
                  </div>

                  {emp.additionalResponsibilities.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        Tanggung Jawab Khusus:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {emp.additionalResponsibilities.map((resp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold"
                          >
                            {resp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2D374E] flex items-center gap-2">
                  <button
                    onClick={() => setDetailEmployee(emp)}
                    className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold border border-purple-500/30 transition-all cursor-pointer text-center min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Profil</span>
                  </button>

                  {canManage && (
                    <button
                      onClick={() => {
                        setFormEmployee(emp);
                        setIsFormOpen(true);
                      }}
                      className="p-2.5 bg-[#1E2438] hover:bg-indigo-600 text-gray-300 hover:text-white rounded-xl border border-[#2D374E] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canManage && emp.accessLevel !== 'OWNER' && (
                    <button
                      onClick={() => {
                        setStatusEmployee(emp);
                        setIsStatusOpen(true);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        emp.isActive
                          ? 'bg-[#1E2438] hover:bg-red-600 text-gray-400 hover:text-white border-[#2D374E]'
                          : 'bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                      }`}
                      title="Ubah Status"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      <EmployeeDetailModal
        employee={detailEmployee}
        allEmployees={employees}
        isOpen={!!detailEmployee}
        onClose={() => setDetailEmployee(null)}
        onEdit={(emp) => {
          setDetailEmployee(null);
          setFormEmployee(emp);
          setIsFormOpen(true);
        }}
        onToggleStatus={(emp) => {
          setDetailEmployee(null);
          setStatusEmployee(emp);
          setIsStatusOpen(true);
        }}
        canManage={canManage}
      />

      {/* Form Modal (Create / Edit) */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialEmployee={formEmployee}
        allEmployees={employees}
      />

      {/* Status Toggle Modal */}
      <EmployeeStatusModal
        employee={statusEmployee}
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
          setStatusEmployee(null);
        }}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
};
