/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EXPENSE & OPEX MANAGEMENT COMPONENT
 * Phase 3.9 — Financial Control, Expense/OPEX & Period Closing
 */

import React, { useState, useEffect } from 'react';
import {
  ExpenseItem,
  ExpenseCategory,
  ExpenseDepartment,
  ExpensePaymentMethod,
  ExpenseStatus,
  EXPENSE_CATEGORIES,
  EXPENSE_DEPARTMENTS,
  EXPENSE_PAYMENT_METHODS,
  ExpenseSummary,
  FinancialAuditEvent,
} from '../../types/finance';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Eye,
  History,
  FileText,
  Building2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Tag,
  Calendar,
  CreditCard,
  Layers,
  Edit2,
  Trash2,
  Send,
  Check,
  X,
} from 'lucide-react';

export const ExpenseManagerView: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<ExpenseDepartment | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [auditModalExpense, setAuditModalExpense] = useState<ExpenseItem | null>(null);
  const [rejectModalExpense, setRejectModalExpense] = useState<ExpenseItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reverseModalExpense, setReverseModalExpense] = useState<ExpenseItem | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    period: new Date().toISOString().slice(0, 7),
    category: 'Utilities' as ExpenseCategory,
    description: '',
    amount: 100000,
    taxAmount: 0,
    vendor: '',
    paymentMethod: 'Bank Transfer' as ExpensePaymentMethod,
    department: 'Operations' as ExpenseDepartment,
    notes: '',
    submitDirectly: false,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isManagerOrOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  const loadExpensesData = async () => {
    try {
      setIsLoading(true);
      const list = await financeService.getExpenses({
        period: periodFilter !== 'ALL' ? periodFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        searchQuery: searchQuery || undefined,
      });
      setExpenses(list);

      const sum = await financeService.getExpenseSummary(periodFilter !== 'ALL' ? periodFilter : undefined);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpensesData();
  }, [periodFilter, categoryFilter, departmentFilter, statusFilter, searchQuery]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      period: new Date().toISOString().slice(0, 7),
      category: 'Utilities',
      description: '',
      amount: 150000,
      taxAmount: 0,
      vendor: '',
      paymentMethod: 'Bank Transfer',
      department: 'Operations',
      notes: '',
      submitDirectly: false,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (exp: ExpenseItem) => {
    if (exp.status !== 'DRAFT') return;
    setEditingExpense(exp);
    setFormData({
      date: exp.date,
      period: exp.period,
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      taxAmount: exp.taxAmount || 0,
      vendor: exp.vendor,
      paymentMethod: exp.paymentMethod,
      department: exp.department,
      notes: exp.notes || '',
      submitDirectly: false,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.description.trim()) {
      setFormError('Deskripsi beban pengeluaran wajib diisi.');
      return;
    }
    if (formData.amount <= 0) {
      setFormError('Nominal beban harus lebih besar dari 0.');
      return;
    }
    if (!formData.vendor.trim()) {
      setFormError('Nama vendor / penerima wajib diisi.');
      return;
    }

    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'STAFF',
    };

    try {
      if (editingExpense) {
        await financeService.updateExpense(
          editingExpense.expenseId,
          {
            date: formData.date,
            period: formData.period,
            category: formData.category,
            description: formData.description,
            amount: formData.amount,
            taxAmount: formData.taxAmount,
            vendor: formData.vendor,
            paymentMethod: formData.paymentMethod,
            department: formData.department,
            notes: formData.notes,
          },
          actor
        );
        showNotification(`Draf pengeluaran ${editingExpense.expenseNumber} berhasil diperbarui.`);
      } else {
        const created = await financeService.createExpense(
          {
            date: formData.date,
            period: formData.period,
            category: formData.category,
            description: formData.description,
            amount: formData.amount,
            taxAmount: formData.taxAmount,
            vendor: formData.vendor,
            paymentMethod: formData.paymentMethod,
            department: formData.department,
            notes: formData.notes,
            status: formData.submitDirectly ? 'SUBMITTED' : 'DRAFT',
            createdBy: actor,
          },
          actor
        );
        showNotification(`Pengeluaran ${created.expenseNumber} berhasil dicatat.`);
      }
      setIsFormModalOpen(false);
      loadExpensesData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan pengeluaran.');
    }
  };

  const handleSubmitDraft = async (exp: ExpenseItem) => {
    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'STAFF',
    };
    try {
      await financeService.submitExpense(exp.expenseId, actor);
      showNotification(`Expense ${exp.expenseNumber} telah diajukan ke tahap review.`);
      loadExpensesData();
    } catch (err: any) {
      alert(`Gagal mengajukan: ${err.message}`);
    }
  };

  const handleApprove = async (exp: ExpenseItem) => {
    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'MANAGER',
    };
    try {
      await financeService.approveExpense(exp.expenseId, actor);
      showNotification(`Expense ${exp.expenseNumber} disetujui.`);
      loadExpensesData();
    } catch (err: any) {
      alert(`Gagal approve: ${err.message}`);
    }
  };

  const handlePost = async (exp: ExpenseItem) => {
    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'MANAGER',
    };
    try {
      await financeService.postExpense(exp.expenseId, actor);
      showNotification(`Expense ${exp.expenseNumber} berhasil diposting ke ledger kas.`);
      loadExpensesData();
    } catch (err: any) {
      alert(`Gagal posting: ${err.message}`);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalExpense || !rejectReason.trim()) {
      alert('Mohon isi alasan penolakan.');
      return;
    }
    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'MANAGER',
    };
    try {
      await financeService.rejectExpense(rejectModalExpense.expenseId, actor, rejectReason);
      showNotification(`Expense ${rejectModalExpense.expenseNumber} ditolak.`);
      setRejectModalExpense(null);
      setRejectReason('');
      loadExpensesData();
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message}`);
    }
  };

  const handleConfirmReverse = async () => {
    if (!reverseModalExpense || !reverseReason.trim()) {
      alert('Mohon masukkan alasan reversal / pembalikan jurnal.');
      return;
    }
    const actor = {
      id: currentUser?.id || 'emp-user',
      name: currentUser?.name || 'Staff Finance',
      role: currentUser?.role || 'MANAGER',
    };
    try {
      const { reversalExpense } = await financeService.reverseExpense(
        reverseModalExpense.expenseId,
        actor,
        reverseReason
      );
      showNotification(`Reversal ${reversalExpense.expenseNumber} berhasil diterbitkan.`);
      setReverseModalExpense(null);
      setReverseReason('');
      loadExpensesData();
    } catch (err: any) {
      alert(`Gagal reverse: ${err.message}`);
    }
  };

  const getStatusBadge = (status: ExpenseStatus, isReversal?: boolean) => {
    if (isReversal) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <RotateCcw className="w-3 h-3" /> REVERSAL
        </span>
      );
    }
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> DRAFT
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Send className="w-3 h-3" /> SUBMITTED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Check className="w-3 h-3" /> APPROVED
          </span>
        );
      case 'POSTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldCheck className="w-3 h-3" /> POSTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <X className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-200">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-emerald-950/40 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Header & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Posted OPEX</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            Rp {((summary?.grandTotalPosted ?? 0)).toLocaleString('id-ID')}
          </div>
          <p className="mt-1 text-xs text-gray-400">Tervalidasi &amp; terposting ke buku kas</p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Menunggu Approval</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-300 tracking-tight">
            Rp {((summary?.totalSubmittedAmount ?? 0)).toLocaleString('id-ID')}
          </div>
          <p className="mt-1 text-xs text-gray-400">Perlu persetujuan Manager / Owner</p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Draf Belum Diajukan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-300 tracking-tight">
            Rp {((summary?.totalDraftAmount ?? 0)).toLocaleString('id-ID')}
          </div>
          <p className="mt-1 text-xs text-gray-400">Draf operasional belum submit</p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Kategori Terbesar</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-white tracking-tight truncate">
            {summary?.topCategory?.category || 'Utilities'}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Rp {((summary?.topCategory?.amount ?? 0)).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-4 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari deskripsi, vendor, nomor..."
                className="w-full bg-[#151B2B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Period Filter */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Periode</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-06">Juni 2026</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Kategori</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Departemen</option>
              {EXPENSE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="POSTED">POSTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* New Expense Button */}
          <button
            onClick={handleOpenCreateModal}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Catat Pengeluaran Baru
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#151B2B] text-gray-400 border-b border-white/10 font-semibold">
                <th className="py-3 px-4">No. Bukti / Tanggal</th>
                <th className="py-3 px-4">Deskripsi &amp; Vendor</th>
                <th className="py-3 px-4">Kategori &amp; Dept</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal Beban</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Audit</th>
                <th className="py-3 px-4 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Memuat data pengeluaran operasional...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Tidak ada transaksi beban pengeluaran yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const isNegative = exp.amount < 0;
                  return (
                    <tr
                      key={exp.expenseId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        exp.isReversal ? 'bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Number & Date */}
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        <div>{exp.expenseNumber}</div>
                        <div className="text-[11px] text-gray-400 font-sans">{exp.date}</div>
                      </td>

                      {/* Description & Vendor */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white max-w-xs truncate">{exp.description}</div>
                        <div className="text-[11px] text-purple-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {exp.vendor}
                        </div>
                      </td>

                      {/* Category & Department */}
                      <td className="py-3.5 px-4">
                        <div className="inline-block px-2 py-0.5 bg-white/5 rounded text-[11px] text-gray-200">
                          {exp.category}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{exp.department}</div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-gray-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[120px]">{exp.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={isNegative ? 'text-rose-400' : 'text-emerald-400'}>
                          {isNegative ? '-' : ''}Rp {Math.abs(exp.amount ?? 0).toLocaleString('id-ID')}
                        </span>
                        {exp.taxAmount ? (
                          <div className="text-[10px] text-gray-400 font-normal">
                            +PPN Rp {(exp.taxAmount ?? 0).toLocaleString('id-ID')}
                          </div>
                        ) : null}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(exp.status, exp.isReversal)}
                      </td>

                      {/* Audit Trail Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setAuditModalExpense(exp)}
                          title="Lihat Log Audit Trail"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-300 transition-all cursor-pointer"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* DRAFT Actions */}
                          {exp.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(exp)}
                                title="Edit Draf"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSubmitDraft(exp)}
                                title="Ajukan (Submit) untuk Approval"
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" /> Submit
                              </button>
                            </>
                          )}

                          {/* SUBMITTED Actions (Manager/Owner) */}
                          {exp.status === 'SUBMITTED' && isManagerOrOwner && (
                            <>
                              <button
                                onClick={() => {
                                  setRejectModalExpense(exp);
                                  setRejectReason('');
                                }}
                                title="Tolak Expense"
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleApprove(exp)}
                                title="Setujui (Approve)"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                            </>
                          )}

                          {/* APPROVED Actions (Post to Ledger) */}
                          {exp.status === 'APPROVED' && isManagerOrOwner && (
                            <>
                              <button
                                onClick={() => {
                                  setRejectModalExpense(exp);
                                  setRejectReason('');
                                }}
                                title="Batalkan Approval"
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePost(exp)}
                                title="Posting ke Buku Kas"
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                              >
                                <ShieldCheck className="w-3 h-3" /> Post Ledger
                              </button>
                            </>
                          )}

                          {/* POSTED Actions (Immutable - Reversal Only) */}
                          {exp.status === 'POSTED' && !exp.isReversal && !exp.isAdjusted && isManagerOrOwner && (
                            <button
                              onClick={() => {
                                setReverseModalExpense(exp);
                                setReverseReason('');
                              }}
                              title="Terbitkan Jurnal Pembalik (Reversal)"
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" /> Reverse
                            </button>
                          )}

                          {exp.isAdjusted && (
                            <span className="text-[10px] text-purple-400 italic">Telah di-reverse</span>
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

      {/* CREATE / EDIT EXPENSE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                {editingExpense ? `Edit Draf Pengeluaran (${editingExpense.expenseNumber})` : 'Pencatatan Beban / OPEX Baru'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Periode Buku (YYYY-MM)</label>
                  <input
                    type="month"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Deskripsi Beban Pengeluaran</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Pembayaran Listrik PLN Gardu Utama Resto"
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Kategori OPEX</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Departemen Alokasi</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {EXPENSE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Vendor / Penerima</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Contoh: PT PLN (Persero)"
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Metode Pembayaran</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {EXPENSE_PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nominal Beban (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">PPN / Pajak (Opsional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: Number(e.target.value) })}
                    className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Keterangan peruntukan atau nomor faktur vendor..."
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {!editingExpense && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="submitDirectly"
                    checked={formData.submitDirectly}
                    onChange={(e) => setFormData({ ...formData, submitDirectly: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 bg-[#151B2B] border-white/20 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="submitDirectly" className="text-xs text-gray-300 cursor-pointer">
                    Langsung ajukan (Submit) untuk verifikasi &amp; persetujuan Manager
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {editingExpense ? 'Simpan Perubahan' : formData.submitDirectly ? 'Simpan & Ajukan' : 'Simpan Draf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-rose-950/40 px-6 py-4 border-b border-rose-500/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                Tolak Beban Pengeluaran ({rejectModalExpense.expenseNumber})
              </h3>
              <button
                onClick={() => setRejectModalExpense(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-300">
                Apakah Anda yakin ingin menolak pengeluaran senilai{' '}
                <strong className="text-white">
                  Rp {(rejectModalExpense.amount ?? 0).toLocaleString('id-ID')}
                </strong>{' '}
                dari vendor <strong className="text-white">{rejectModalExpense.vendor}</strong>?
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Alasan Penolakan (Wajib Diisi)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan alasan penolakan, faktur tidak valid, atau beban salah alokasi..."
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalExpense(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Konfirmasi Penolakan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVERSAL MODAL */}
      {reverseModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-purple-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-purple-950/40 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                Terbitkan Jurnal Pembalik (Reversal)
              </h3>
              <button
                onClick={() => setReverseModalExpense(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-950/30 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200">
                Sesuai prinsip integritas buku besar, data POSTED tidak boleh dihapus langsung. Sistem akan
                menerbitkan transaksi kontra negatif senilai{' '}
                <strong className="text-white">
                  -Rp {(reverseModalExpense.amount ?? 0).toLocaleString('id-ID')}
                </strong>{' '}
                dengan referensi audit lengkap.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Alasan Reversal (Wajib Diisi)
                </label>
                <textarea
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  rows={3}
                  placeholder="Misal: Kesalahan double posting invoice atau retur tagihan listrik..."
                  className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReverseModalExpense(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReverse}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Eksekusi Jurnal Pembalik
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL MODAL */}
      {auditModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Jejak Audit Finansial ({auditModalExpense.expenseNumber})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{auditModalExpense.description}</p>
              </div>
              <button
                onClick={() => setAuditModalExpense(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
                {(auditModalExpense.auditTrail || []).map((ev, idx) => (
                  <div key={ev.eventId || idx} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#151B2B] border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs shrink-0 z-10">
                      {idx + 1}
                    </div>
                    <div className="bg-[#151B2B] border border-white/10 rounded-xl p-3.5 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{ev.action}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(ev.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-300">
                        Oleh: {ev.actor?.name} ({ev.actor?.role || 'STAFF'})
                      </div>
                      {ev.reason && (
                        <div className="text-[11px] text-gray-300 bg-white/5 p-2 rounded mt-1 italic">
                          "{ev.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151B2B] px-6 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setAuditModalExpense(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
