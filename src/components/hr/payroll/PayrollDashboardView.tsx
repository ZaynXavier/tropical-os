/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll Dashboard View (Command Center)
 * Central Aggregator for Attendance, Overtime, Salary Master, Advances, and Payslips
 */

import React, { useState, useEffect } from 'react';
import {
  PayrollPeriod,
  PayrollRecord,
  PayrollSummary,
  PayrollPeriodStatus,
} from '../../../types/payroll';
import { MASTER_EMPLOYEES } from '../../../config/employees';
import {
  payrollService,
  formatCurrency,
  formatNumber,
  formatDate,
} from '../../../services/payrollService';
import { PayrollDetailModal } from './PayrollDetailModal';
import { PayrollAdjustmentModal } from './PayrollAdjustmentModal';
import { PayrollPeriodModal } from './PayrollPeriodModal';
import { PayslipModal } from './PayslipModal';
import { SalaryAdvanceModal } from './SalaryAdvanceModal';
import { SalaryManagementView } from './SalaryManagementView';
import { MyPayslipView } from './MyPayslipView';
import { LaborCostAnalyticsView } from './LaborCostAnalyticsView';
import {
  DollarSign,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  Building2,
  TrendingUp,
  Award,
  AlertTriangle,
  CreditCard,
  Printer,
  Sparkles,
  PieChart,
  Users,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface PayrollDashboardViewProps {
  currentUserId?: string;
  userRole?: string;
}

export const PayrollDashboardView: React.FC<PayrollDashboardViewProps> = ({
  currentUserId = 'emp-02', // Heri Setiawan (Manager)
  userRole = 'MANAGER',
}) => {
  // Authorization: STRICTLY Owner, Manager, HR Officer (emp-24), Finance Officer (emp-23)
  const isAuthorized =
    userRole === 'MANAGER' ||
    userRole === 'OWNER' ||
    userRole === 'FINANCE' ||
    currentUserId === 'emp-02' ||
    currentUserId === 'emp-23' ||
    currentUserId === 'emp-24';

  // Roles & Permissions
  const canApprove = userRole === 'MANAGER' || userRole === 'OWNER';
  const canLock = userRole === 'MANAGER' || userRole === 'FINANCE' || userRole === 'OWNER';
  const canCalculate = userRole === 'MANAGER' || userRole === 'FINANCE' || userRole === 'OWNER';
  const canManageSalary = userRole === 'MANAGER' || userRole === 'OWNER';

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<'PAYROLL' | 'LABOR_COST' | 'SALARY_MASTER' | 'MY_PAYSLIP'>('PAYROLL');

  // Period State
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('period-2026-08');
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedPayslipTarget, setSelectedPayslipTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      loadPeriodsAndData();
    }
  }, [selectedPeriodId, departmentFilter, searchQuery, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-3xl bg-[#13192B] border border-red-500/30 text-white space-y-4 max-w-2xl mx-auto my-12 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            Akses Terbatas — Kerahasiaan Perusahaan
          </span>
          <h2 className="text-xl font-black text-white mt-2">Fitur Payroll &amp; Penggajian Resto</h2>
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            Data gaji, tunjangan, dan master payroll hanya dapat diakses oleh <strong>General Manager</strong>, <strong>HR Officer</strong>, dan <strong>Finance Officer</strong>. Supervisor, Kepala Bagian (Head), dan Staf tidak memiliki izin akses ke modul ini.
          </p>
        </div>
      </div>
    );
  }

  const loadPeriodsAndData = async () => {
    try {
      setLoading(true);
      const allPeriods = await payrollService.getPayrollPeriods();
      setPeriods(allPeriods);

      const targetPeriodId = selectedPeriodId || allPeriods[0]?.periodId || 'period-2026-08';
      setSelectedPeriodId(targetPeriodId);

      const [summaryRes, recordsRes] = await Promise.all([
        payrollService.getPayrollSummary(targetPeriodId),
        payrollService.getPayrollRecords(targetPeriodId, {
          department: departmentFilter,
          searchQuery,
        }),
      ]);

      setSummary(summaryRes);
      setRecords(recordsRes);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayroll = async () => {
    try {
      setCalculating(true);
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan (Manager)';
      await payrollService.calculatePayroll(selectedPeriodId, userName);
      await loadPeriodsAndData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menghitung payroll');
    } finally {
      setCalculating(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!window.confirm('Setujui draft payroll periode ini untuk diajukan ke tahap penguncian?')) return;
    try {
      setLoading(true);
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Heri Setiawan (Manager)';
      await payrollService.approvePayroll(selectedPeriodId, userName);
      await loadPeriodsAndData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyetujui payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPayroll = async () => {
    if (
      !window.confirm(
        'KUNCI & TERBITKAN PAYROLL: Periode ini akan berstatus LOCKED dan slip gaji resmi akan digenerate untuk seluruh 24 personel. Lanjutkan?'
      )
    )
      return;
    try {
      setLoading(true);
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Ristania Larasati (Finance)';
      await payrollService.lockPayroll(selectedPeriodId, userName);
      await loadPeriodsAndData();
    } catch (err: any) {
      alert(err?.message || 'Gagal mengunci payroll');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPayroll = async () => {
    if (!window.confirm('Tandai seluruh payroll pada periode ini telah ditransfer/dibayarkan?')) return;
    try {
      setLoading(true);
      const currentUser = MASTER_EMPLOYEES.find((e) => e.id === currentUserId);
      const userName = currentUser?.fullName || 'Ristania Larasati (Finance)';
      await payrollService.payPayroll(selectedPeriodId, userName);
      await loadPeriodsAndData();
    } catch (err: any) {
      alert(err?.message || 'Gagal mencatat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset seluruh data simulasi payroll, master gaji, dan kasbon ke konfigurasi default?'))
      return;
    try {
      setLoading(true);
      await payrollService.resetToDefaults();
      await loadPeriodsAndData();
    } catch (err: any) {
      alert(err?.message || 'Gagal mereset data');
    } finally {
      setLoading(false);
    }
  };

  const currentPeriod = periods.find((p) => p.periodId === selectedPeriodId);
  const isLocked = currentPeriod?.status === 'LOCKED' || currentPeriod?.status === 'PAID';
  const isPaid = currentPeriod?.status === 'PAID';
  const departments = Array.from(new Set(MASTER_EMPLOYEES.map((e) => e.department)));

  const handleOpenDetail = (rec: PayrollRecord) => {
    setSelectedRecord(rec);
    setIsDetailModalOpen(true);
  };

  const handleOpenAdjustment = (rec: PayrollRecord) => {
    setSelectedRecord(rec);
    setIsAdjustmentModalOpen(true);
  };

  const handleOpenPayslip = (rec: PayrollRecord) => {
    setSelectedPayslipTarget(rec.payrollId);
    setIsPayslipModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Level Subtab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#2D374E]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PAYROLL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PAYROLL'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#181F32] text-gray-400 hover:text-white border border-[#2D374E]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Kalkulator & Dashboard Payroll</span>
          </button>

          <button
            onClick={() => setActiveTab('LABOR_COST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'LABOR_COST'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#181F32] text-gray-400 hover:text-white border border-[#2D374E]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Labor Cost % vs Omzet (7shifts)</span>
          </button>

          <button
            onClick={() => setActiveTab('SALARY_MASTER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'SALARY_MASTER'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#181F32] text-gray-400 hover:text-white border border-[#2D374E]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master Struktur Gaji</span>
          </button>

          <button
            onClick={() => setActiveTab('MY_PAYSLIP')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'MY_PAYSLIP'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#181F32] text-gray-400 hover:text-white border border-[#2D374E]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Slip Gaji Mandiri (Self-Service)</span>
          </button>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-xl border border-[#2D374E] text-gray-400 hover:text-white hover:bg-[#181F32] text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Reset data ke mock default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Data Default</span>
        </button>
      </div>

      {/* Render Active Subtab */}
      {activeTab === 'MY_PAYSLIP' ? (
        <MyPayslipView currentUserId={currentUserId} userRole={userRole} />
      ) : activeTab === 'SALARY_MASTER' ? (
        <SalaryManagementView currentUserId={currentUserId} userRole={userRole} />
      ) : activeTab === 'LABOR_COST' ? (
        <LaborCostAnalyticsView />
      ) : (
        <div className="space-y-6">
          {/* Simulation Header Banner & Period Controls */}
          <div className="p-5 rounded-3xl bg-[#181F32] border border-[#2D374E] space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white tracking-tight">
                      Simulasi Payroll Aggregator
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Simulasi Payroll
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Aggregator otomatis kompensasi: Kehadiran + Lembur Disetujui (SPL) + Kasbon + KPI
                  </p>
                </div>
              </div>

              {/* Period Selector & New Period */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-[#111827] border border-[#2D374E] rounded-2xl px-3.5 py-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <select
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    {periods.map((p) => (
                      <option key={p.periodId} value={p.periodId}>
                        {p.periodName} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>

                {canCalculate && (
                  <button
                    onClick={() => setIsPeriodModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-[#111827] hover:bg-[#252D42] border border-[#2D374E] text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Periode Baru</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAdvanceModalOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Kasbon</span>
                </button>
              </div>
            </div>

            {/* Lifecycle Action Bar */}
            <div className="pt-3 border-t border-[#2D374E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Status Siklus:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    currentPeriod?.status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : currentPeriod?.status === 'LOCKED'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : currentPeriod?.status === 'APPROVED'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : currentPeriod?.status === 'REVIEW'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                  }`}
                >
                  {currentPeriod?.status === 'PAID'
                    ? 'TERBAYAR (PAID)'
                    : currentPeriod?.status === 'LOCKED'
                    ? 'FINAL & TERKUNCI (LOCKED)'
                    : currentPeriod?.status === 'APPROVED'
                    ? 'DISETUJUI (APPROVED)'
                    : currentPeriod?.status === 'REVIEW'
                    ? 'DALAM REVIEW'
                    : 'DRAFT'}
                </span>
                {currentPeriod?.lockedAt && (
                  <span className="text-[11px] text-gray-500">
                    Dikunci: {formatDate(currentPeriod.lockedAt)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {!isLocked && canCalculate && (
                  <button
                    onClick={handleCalculatePayroll}
                    disabled={calculating}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
                    <span>{calculating ? 'Menghitung...' : 'Hitung Ulang'}</span>
                  </button>
                )}

                {currentPeriod?.status === 'REVIEW' && canApprove && (
                  <button
                    onClick={handleApprovePayroll}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Payroll</span>
                  </button>
                )}

                {(currentPeriod?.status === 'APPROVED' || currentPeriod?.status === 'REVIEW') && canLock && (
                  <button
                    onClick={handleLockPayroll}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci & Terbitkan Slip</span>
                  </button>
                )}

                {currentPeriod?.status === 'LOCKED' && canLock && !isPaid && (
                  <button
                    onClick={handlePayPayroll}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Terbayar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top KPI Metrics Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-[#181F32] border border-emerald-500/40 bg-emerald-500/5 space-y-1 shadow-lg">
                <p className="text-xs font-bold text-emerald-400">Total Payroll Bersih (Net)</p>
                <p className="text-2xl font-black text-white tracking-tight">
                  {formatCurrency(summary.totalNetSalary)}
                </p>
                <p className="text-[10px] text-gray-400">Take Home Pay 24 Pegawai</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
                <p className="text-xs font-semibold text-gray-400">Total Penghasilan Kotor</p>
                <p className="text-xl font-bold text-white">{formatCurrency(summary.totalGrossSalary)}</p>
                <p className="text-[10px] text-gray-500">Pokok + Tunjangan + Lembur</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
                <p className="text-xs font-semibold text-gray-400">Upah Lembur Disetujui</p>
                <p className="text-xl font-bold text-amber-400">
                  {formatCurrency(summary.totalOvertime)}
                </p>
                <p className="text-[10px] text-gray-500">Rate Rp 10.000/jam (SPL)</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
                <p className="text-xs font-semibold text-gray-400">Total Pemotongan</p>
                <p className="text-xl font-bold text-rose-400">
                  -{formatCurrency(summary.totalDeductions)}
                </p>
                <p className="text-[10px] text-gray-500">
                  Telat: {formatCurrency(summary.totalLateDeductions)} • Kasbon: {formatCurrency(summary.totalAdvanceDeductions)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-1">
                <p className="text-xs font-semibold text-gray-400">Labor Cost % Revenue</p>
                <p className="text-2xl font-bold text-purple-300">
                  {summary.laborCostPercentage || 21.9}%
                </p>
                <p className="text-[10px] text-gray-500">
                  Est. Omzet {formatCurrency(summary.estimatedRevenue)}
                </p>
              </div>
            </div>
          )}

          {/* Department Payroll Breakdown (Analytics) */}
          {summary && summary.departmentBreakdown.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#181F32] border border-[#2D374E] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Alokasi Pengeluaran Payroll Berdasarkan Departemen
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400">24 Total Personnel</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {summary.departmentBreakdown.map((dept) => (
                  <div
                    key={dept.department}
                    className="p-3 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1 text-xs"
                  >
                    <p className="text-[11px] font-bold text-gray-300 truncate">{dept.department}</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {formatCurrency(dept.netSalary)}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-[#2D374E]/60">
                      <span>{dept.employeeCount} Staf</span>
                      <span>OT {formatCurrency(dept.overtime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari karyawan berdasarkan nama, kode, atau jabatan..."
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
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
            </div>
          </div>

          {/* Payroll Records Table (Desktop) */}
          <div className="hidden md:block bg-[#181F32] border border-[#2D374E] rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#2D374E]">
                  <tr>
                    <th className="px-5 py-3.5">Karyawan</th>
                    <th className="px-4 py-3.5">Departemen</th>
                    <th className="px-4 py-3.5 text-right">Gaji Pokok</th>
                    <th className="px-4 py-3.5 text-right">Tunjangan</th>
                    <th className="px-4 py-3.5 text-right">Lembur (SPL)</th>
                    <th className="px-4 py-3.5 text-right">Gross</th>
                    <th className="px-4 py-3.5 text-right">Potongan</th>
                    <th className="px-4 py-3.5 text-right">Net Salary</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                        Memuat data payroll periode...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                        Tidak ada catatan payroll yang sesuai dengan kriteria.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => {
                      const emp = MASTER_EMPLOYEES.find((e) => e.id === rec.employeeId);
                      return (
                        <tr key={rec.payrollId} className="hover:bg-[#252D42]/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs">
                                {rec.employeeName?.charAt(0) || 'K'}
                              </div>
                              <div>
                                <p className="font-bold text-white">{rec.employeeName}</p>
                                <p className="text-[10px] text-gray-400">
                                  {rec.employeeCode} • {rec.position}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
                              {rec.department || '-'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right font-semibold text-white">
                            {formatCurrency(rec.basicSalary)}
                          </td>

                          <td className="px-4 py-3.5 text-right text-gray-300">
                            {formatCurrency(rec.fixedAllowance)}
                          </td>

                          <td className="px-4 py-3.5 text-right font-semibold text-amber-400">
                            {rec.overtimeAmount > 0 ? formatCurrency(rec.overtimeAmount) : '-'}
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold text-white">
                            {formatCurrency(rec.grossSalary)}
                          </td>

                          <td className="px-4 py-3.5 text-right font-semibold text-rose-300">
                            {rec.totalDeduction > 0 ? `-${formatCurrency(rec.totalDeduction)}` : '-'}
                          </td>

                          <td className="px-4 py-3.5 text-right font-black text-emerald-400">
                            {formatCurrency(rec.netSalary)}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenDetail(rec)}
                                className="p-1.5 rounded-lg bg-[#111827] text-gray-300 hover:text-white hover:bg-purple-600/30 border border-[#2D374E] transition-colors cursor-pointer"
                                title="Lihat Rincian Perhitungan"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {!isLocked && (
                                <button
                                  onClick={() => handleOpenAdjustment(rec)}
                                  className="p-1.5 rounded-lg bg-[#111827] text-purple-300 hover:text-white hover:bg-purple-600/30 border border-[#2D374E] transition-colors cursor-pointer"
                                  title="Tambah Penyesuaian/Bonus"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenPayslip(rec)}
                                className="p-1.5 rounded-lg bg-[#111827] text-emerald-300 hover:text-white hover:bg-emerald-600/30 border border-[#2D374E] transition-colors cursor-pointer"
                                title="Buka Slip Gaji"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
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

          {/* Payroll Records Cards (Mobile) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <p className="text-center py-6 text-xs text-gray-500">Memuat catatan payroll...</p>
            ) : records.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-500">Tidak ada catatan payroll.</p>
            ) : (
              records.map((rec) => (
                <div
                  key={rec.payrollId}
                  className="p-4 rounded-2xl bg-[#181F32] border border-[#2D374E] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold">
                        {rec.employeeName?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{rec.employeeName}</p>
                        <p className="text-[10px] text-gray-400">
                          {rec.employeeCode} • {rec.position} [{rec.department}]
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#111827] rounded-xl border border-[#2D374E]/60 text-[11px]">
                    <div>
                      <span className="text-gray-400">Gaji Pokok:</span>
                      <p className="font-semibold text-white">{formatCurrency(rec.basicSalary)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Lembur:</span>
                      <p className="font-semibold text-amber-400">{formatCurrency(rec.overtimeAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Potongan:</span>
                      <p className="font-semibold text-rose-300">-{formatCurrency(rec.totalDeduction)}</p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Take Home Pay:</span>
                      <p className="font-black text-emerald-300 text-xs">{formatCurrency(rec.netSalary)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenDetail(rec)}
                      className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-gray-300 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>
                    {!isLocked && (
                      <button
                        onClick={() => handleOpenAdjustment(rec)}
                        className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-purple-300 font-medium flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Koreksi</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenPayslip(rec)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Global Modals */}
      <PayrollDetailModal
        record={selectedRecord}
        period={currentPeriod || null}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenPayslip={(rec) => handleOpenPayslip(rec)}
        onOpenAdjustment={(rec) => handleOpenAdjustment(rec)}
      />

      <PayrollAdjustmentModal
        record={selectedRecord}
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={loadPeriodsAndData}
        currentUserId={currentUserId}
      />

      <PayrollPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSuccess={(newId) => {
          setSelectedPeriodId(newId);
          loadPeriodsAndData();
        }}
        currentUserId={currentUserId}
      />

      <PayslipModal
        payslipIdOrRecord={selectedPayslipTarget}
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
      />

      <SalaryAdvanceModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSuccess={loadPeriodsAndData}
        currentUserId={currentUserId}
        canApprove={canLock}
      />
    </div>
  );
};
