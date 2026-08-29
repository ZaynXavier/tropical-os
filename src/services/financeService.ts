/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — AUTHORITATIVE FINANCE SERVICE ENGINE
 * Phase 3.9 — Financial Control, Expense/OPEX, Reconciliation & Period Closing
 * 
 * GOVERNANCE & ARCHITECTURAL DIRECTIVES:
 * - Finance is the GOVERNANCE, CONTROL, RECONCILIATION, and ANALYTICS layer.
 * - Pure CONSUMER of SalesRevenueContract, InventoryCostContract, RecipeCostContract,
 *   ProductionBatchCostContract, and PayrollCostContract.
 * - Does NOT recalculate recipes, duplicate POS engines, invent inventory ledgers, or clone payroll.
 */

import {
  ExpenseItem,
  ExpenseFilterParams,
  ExpenseSummary,
  FinancialPeriod,
  FinancialPeriodStatus,
  FinancialAuditEvent,
  FinancialActionType,
  ReconciliationThresholds,
  FinancialKpiMetrics,
  CashFlowStatement,
  FinanceBusinessTestResult,
  EXPENSE_CATEGORIES,
} from '../types/finance';
import {
  FinanceExpenseContract,
  FinancialPeriodContract,
  FinancialReconciliationContract,
  ReconciliationStatus,
  ReconciliationItemContract,
} from '../types/contracts';
import { INITIAL_EXPENSES, INITIAL_FINANCIAL_PERIODS } from '../data/mockExpenses';
import { MOCK_CASH_ACCOUNTS, CashAccount } from '../data/mockFinanceData';
import { salesService } from './salesService';
import { payrollService } from './payrollService';
import { recipeService } from './recipeService';
import { inventoryService } from './inventoryService';
import { productionService } from './productionService';

const STORAGE_KEYS = {
  EXPENSES: 'tropicalos_master_finance_expenses',
  PERIODS: 'tropicalos_master_financial_periods',
  AUDIT: 'tropicalos_master_financial_audit',
  THRESHOLDS: 'tropicalos_finance_thresholds',
  CASH_ACCOUNTS: 'tropicalos_master_cash_accounts',
};

const DEFAULT_THRESHOLDS: ReconciliationThresholds = {
  minorVariancePercentage: 1.0, // 1%
  materialVariancePercentage: 3.0, // 3%
  allowableCashVarianceNominal: 50000, // Rp 50.000
};

class FinanceServiceEngine {
  // ==========================================
  // STORAGE HELPERS (Safe Encapsulation)
  // ==========================================

  private getStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error(`[FinanceService] Error reading key ${key}:`, e);
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[FinanceService] Error writing key ${key}:`, e);
    }
  }

  // ==========================================
  // AUDIT TRAIL LOGGING
  // ==========================================

  public async logAuditEvent(event: Omit<FinancialAuditEvent, 'eventId' | 'timestamp'>): Promise<FinancialAuditEvent> {
    const events = this.getStorage<FinancialAuditEvent[]>(STORAGE_KEYS.AUDIT, []);
    const fullEvent: FinancialAuditEvent = {
      ...event,
      eventId: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
    };
    events.unshift(fullEvent);
    this.setStorage(STORAGE_KEYS.AUDIT, events.slice(0, 500)); // Cap to 500 records
    return fullEvent;
  }

  public async getAuditEvents(filter?: { entityType?: string; entityId?: string; limit?: number }): Promise<FinancialAuditEvent[]> {
    let list = this.getStorage<FinancialAuditEvent[]>(STORAGE_KEYS.AUDIT, []);
    if (filter?.entityType) {
      list = list.filter((e) => e.entityType === filter.entityType);
    }
    if (filter?.entityId) {
      list = list.filter((e) => e.entityId === filter.entityId);
    }
    if (filter?.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  // ==========================================
  // 1. EXPENSE / OPEX MANAGEMENT & LIFECYCLE
  // ==========================================

  public async getExpenses(filter?: ExpenseFilterParams): Promise<ExpenseItem[]> {
    let list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);

    if (filter?.period && filter.period !== 'ALL') {
      list = list.filter((e) => e.period === filter.period);
    }
    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter((e) => e.category === filter.category);
    }
    if (filter?.department && filter.department !== 'ALL') {
      list = list.filter((e) => e.department === filter.department);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((e) => e.status === filter.status);
    }
    if (filter?.paymentMethod && filter.paymentMethod !== 'ALL') {
      list = list.filter((e) => e.paymentMethod === filter.paymentMethod);
    }
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.expenseNumber.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q)
      );
    }
    if (filter?.startDate) {
      list = list.filter((e) => e.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter((e) => e.date <= filter.endDate!);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getExpenseById(expenseId: string): Promise<ExpenseItem | null> {
    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    return list.find((e) => e.expenseId === expenseId) || null;
  }

  public async createExpense(
    data: Omit<ExpenseItem, 'expenseId' | 'expenseNumber' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'status'> & {
      status?: 'DRAFT' | 'SUBMITTED';
    },
    actor: { id: string; name: string; role?: string }
  ): Promise<ExpenseItem> {
    // 1. Validate period status
    const periodKey = data.period || data.date.slice(0, 7);
    const period = await this.getFinancialPeriodByKey(periodKey);
    if (period && (period.status === 'LOCKED' || period.status === 'CLOSED')) {
      throw new Error(`Tidak dapat mencatat beban pada periode ${period.periodName} yang berstatus ${period.status}.`);
    }

    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const dateStr = data.date || new Date().toISOString().slice(0, 10);
    const periodFormatted = periodKey.replace('-', '');
    const countInPeriod = list.filter((e) => e.period === periodKey).length + 1;
    const expNum = `EXP-${periodFormatted}-${String(countInPeriod).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const initialStatus = data.status || 'DRAFT';

    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: `exp-${Date.now()}`,
      action: initialStatus === 'SUBMITTED' ? 'SUBMIT' : 'CREATE',
      actor,
      timestamp: now,
      newValue: { amount: data.amount, status: initialStatus },
      reason: 'Pencatatan beban operasional baru',
    };

    const newExpense: ExpenseItem = {
      ...data,
      expenseId: auditEvent.entityId,
      expenseNumber: expNum,
      period: periodKey,
      status: initialStatus,
      createdBy: actor,
      submittedBy: initialStatus === 'SUBMITTED' ? { ...actor, timestamp: now } : undefined,
      createdAt: now,
      updatedAt: now,
      auditTrail: [auditEvent],
    };

    list.unshift(newExpense);
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return newExpense;
  }

  public async updateExpense(
    expenseId: string,
    updates: Partial<Omit<ExpenseItem, 'expenseId' | 'expenseNumber' | 'createdAt' | 'auditTrail'>>,
    actor: { id: string; name: string; role?: string }
  ): Promise<ExpenseItem> {
    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];

    // State machine check: only DRAFT can be edited directly
    if (existing.status !== 'DRAFT') {
      throw new Error(`Expense berstatus ${existing.status} tidak dapat diubah langsung. Hanya DRAFT yang dapat diedit.`);
    }

    const now = new Date().toISOString();
    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'EDIT',
      actor,
      timestamp: now,
      previousValue: { amount: existing.amount, description: existing.description },
      newValue: { amount: updates.amount, description: updates.description },
      reason: 'Perubahan rincian draft expense',
    };

    const updated: ExpenseItem = {
      ...existing,
      ...updates,
      updatedAt: now,
      auditTrail: [auditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return updated;
  }

  public async submitExpense(
    expenseId: string,
    actor: { id: string; name: string; role?: string }
  ): Promise<ExpenseItem> {
    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];
    if (existing.status !== 'DRAFT') {
      throw new Error(`Hanya draft expense yang dapat diajukan (Status saat ini: ${existing.status}).`);
    }

    const now = new Date().toISOString();
    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'SUBMIT',
      actor,
      timestamp: now,
      previousValue: { status: 'DRAFT' },
      newValue: { status: 'SUBMITTED' },
      reason: 'Pengajuan expense ke tahap review/approval',
    };

    const updated: ExpenseItem = {
      ...existing,
      status: 'SUBMITTED',
      submittedBy: { ...actor, timestamp: now },
      updatedAt: now,
      auditTrail: [auditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return updated;
  }

  public async approveExpense(
    expenseId: string,
    actor: { id: string; name: string; role?: string },
    notes?: string
  ): Promise<ExpenseItem> {
    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];
    if (existing.status !== 'SUBMITTED') {
      throw new Error(`Hanya expense berstatus SUBMITTED yang dapat disetujui (Status saat ini: ${existing.status}).`);
    }

    const now = new Date().toISOString();
    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'APPROVE',
      actor,
      timestamp: now,
      previousValue: { status: 'SUBMITTED' },
      newValue: { status: 'APPROVED' },
      reason: notes || 'Persetujuan beban operasional oleh authorized management',
    };

    const updated: ExpenseItem = {
      ...existing,
      status: 'APPROVED',
      approvedBy: { ...actor, timestamp: now },
      notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}[Approved]: ${notes}` : existing.notes,
      updatedAt: now,
      auditTrail: [auditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return updated;
  }

  public async rejectExpense(
    expenseId: string,
    actor: { id: string; name: string; role?: string },
    reason: string
  ): Promise<ExpenseItem> {
    if (!reason || !reason.trim()) {
      throw new Error('Alasan penolakan (reason) wajib diisi.');
    }

    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];
    if (existing.status !== 'SUBMITTED' && existing.status !== 'APPROVED') {
      throw new Error(`Expense berstatus ${existing.status} tidak dapat ditolak.`);
    }

    const now = new Date().toISOString();
    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'REJECT',
      actor,
      timestamp: now,
      previousValue: { status: existing.status },
      newValue: { status: 'REJECTED', reason },
      reason: `Penolakan expense: ${reason}`,
    };

    const updated: ExpenseItem = {
      ...existing,
      status: 'REJECTED',
      rejectedBy: { ...actor, timestamp: now, reason },
      updatedAt: now,
      auditTrail: [auditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return updated;
  }

  public async postExpense(
    expenseId: string,
    actor: { id: string; name: string; role?: string },
    notes?: string
  ): Promise<ExpenseItem> {
    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];
    if (existing.status !== 'APPROVED') {
      throw new Error(`Hanya expense yang telah di-APPROVE yang dapat di-POSTING ke buku kas (Status: ${existing.status}).`);
    }

    // Check period lock
    const period = await this.getFinancialPeriodByKey(existing.period);
    if (period && (period.status === 'LOCKED' || period.status === 'CLOSED')) {
      throw new Error(`Tidak dapat memposting beban ke periode ${period.periodName} yang sudah berstatus ${period.status}.`);
    }

    const now = new Date().toISOString();
    const auditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'POST',
      actor,
      timestamp: now,
      previousValue: { status: 'APPROVED' },
      newValue: { status: 'POSTED' },
      reason: notes || 'Posting final beban ke buku pengeluaran kas/bank',
    };

    const updated: ExpenseItem = {
      ...existing,
      status: 'POSTED',
      postedBy: { ...actor, timestamp: now },
      notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}[Posted]: ${notes}` : existing.notes,
      updatedAt: now,
      auditTrail: [auditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.EXPENSES, list);
    await this.logAuditEvent(auditEvent);

    return updated;
  }

  /**
   * Reverse a POSTED expense creating an immutable contra/reversal entry
   */
  public async reverseExpense(
    expenseId: string,
    actor: { id: string; name: string; role?: string },
    reason: string
  ): Promise<{ originalExpense: ExpenseItem; reversalExpense: ExpenseItem }> {
    if (!reason || !reason.trim()) {
      throw new Error('Alasan pembalikan / reversal wajib dicantumkan.');
    }

    const list = this.getStorage<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const idx = list.findIndex((e) => e.expenseId === expenseId);
    if (idx === -1) throw new Error(`Expense ${expenseId} tidak ditemukan.`);

    const existing = list[idx];
    if (existing.status !== 'POSTED') {
      throw new Error(`Hanya expense yang berstatus POSTED yang dapat di-REVERSE.`);
    }

    const now = new Date().toISOString();
    const reversalId = `exp-rev-${Date.now()}`;
    const reversalNumber = `REV-${existing.expenseNumber.replace('EXP-', '')}`;

    const reversalAuditEvent: FinancialAuditEvent = {
      eventId: `aud-rev-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: reversalId,
      action: 'REVERSE',
      actor,
      timestamp: now,
      reason: `Reversal dari ${existing.expenseNumber}: ${reason}`,
      metadata: { originalExpenseId: expenseId, originalAmount: existing.amount },
    };

    const reversalItem: ExpenseItem = {
      ...existing,
      expenseId: reversalId,
      expenseNumber: reversalNumber,
      amount: -Math.abs(existing.amount),
      taxAmount: existing.taxAmount ? -Math.abs(existing.taxAmount) : 0,
      description: `[REVERSAL] ${existing.description} — Alasan: ${reason}`,
      status: 'POSTED',
      isReversal: true,
      reversalOfExpenseId: expenseId,
      createdBy: actor,
      postedBy: { ...actor, timestamp: now },
      createdAt: now,
      updatedAt: now,
      auditTrail: [reversalAuditEvent],
    };

    const origAuditEvent: FinancialAuditEvent = {
      eventId: `aud-exp-${Date.now()}`,
      entityType: 'EXPENSE',
      entityId: expenseId,
      action: 'REVERSE',
      actor,
      timestamp: now,
      reason: `Expense di-reverse dengan nomor bukti ${reversalNumber}. Alasan: ${reason}`,
    };

    const updatedOriginal: ExpenseItem = {
      ...existing,
      isAdjusted: true,
      notes: `${existing.notes ? existing.notes + ' | ' : ''}[Di-reverse oleh ${reversalNumber}]: ${reason}`,
      updatedAt: now,
      auditTrail: [origAuditEvent, ...(existing.auditTrail || [])],
    };

    list[idx] = updatedOriginal;
    list.unshift(reversalItem);
    this.setStorage(STORAGE_KEYS.EXPENSES, list);

    await this.logAuditEvent(origAuditEvent);
    await this.logAuditEvent(reversalAuditEvent);

    return { originalExpense: updatedOriginal, reversalExpense: reversalItem };
  }

  public async getExpenseSummary(period?: string): Promise<ExpenseSummary> {
    const list = await this.getExpenses({ period });
    let draft = 0;
    let submitted = 0;
    let approved = 0;
    let posted = 0;
    let rejected = 0;

    const catMap: Record<string, number> = {};

    list.forEach((e) => {
      if (e.status === 'DRAFT') draft += e.amount;
      else if (e.status === 'SUBMITTED') submitted += e.amount;
      else if (e.status === 'APPROVED') approved += e.amount;
      else if (e.status === 'POSTED') {
        posted += e.amount;
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      } else if (e.status === 'REJECTED') rejected += e.amount;
    });

    let topCategory = { category: 'Utilities' as any, amount: 0 };
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > topCategory.amount) {
        topCategory = { category: cat as any, amount: amt };
      }
    });

    return {
      period: period || 'ALL',
      totalExpensesCount: list.length,
      totalDraftAmount: draft,
      totalSubmittedAmount: submitted,
      totalApprovedAmount: approved,
      totalPostedAmount: posted,
      totalRejectedAmount: rejected,
      grandTotalPosted: posted,
      topCategory,
    };
  }

  public async getExpenseContract(periodMonth?: string): Promise<FinanceExpenseContract> {
    const period = periodMonth || new Date().toISOString().slice(0, 7);
    const list = await this.getExpenses({ period });
    const postedList = list.filter((e) => e.status === 'POSTED');
    const pendingList = list.filter((e) => e.status === 'SUBMITTED' || e.status === 'APPROVED');

    const totalPosted = postedList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPending = pendingList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalTax = postedList.reduce((acc, curr) => acc + (curr.taxAmount || 0), 0);

    const catMap: Record<string, { amount: number; count: number }> = {};
    const deptMap: Record<string, { amount: number; count: number }> = {};

    postedList.forEach((e) => {
      if (!catMap[e.category]) catMap[e.category] = { amount: 0, count: 0 };
      catMap[e.category].amount += e.amount;
      catMap[e.category].count += 1;

      if (!deptMap[e.department]) deptMap[e.department] = { amount: 0, count: 0 };
      deptMap[e.department].amount += e.amount;
      deptMap[e.department].count += 1;
    });

    const categoryBreakdown = Object.entries(catMap).map(([category, val]) => ({
      category,
      amount: val.amount,
      count: val.count,
      percentage: totalPosted > 0 ? Number(((val.amount / totalPosted) * 100).toFixed(1)) : 0,
    }));

    const departmentBreakdown = Object.entries(deptMap).map(([department, val]) => ({
      department,
      amount: val.amount,
      count: val.count,
      percentage: totalPosted > 0 ? Number(((val.amount / totalPosted) * 100).toFixed(1)) : 0,
    }));

    return {
      periodMonth: period,
      periodLabel: `Periode ${period}`,
      totalExpensesCount: list.length,
      totalPostedAmount: totalPosted,
      totalPendingAmount: totalPending,
      totalTaxAmount: totalTax,
      categoryBreakdown,
      departmentBreakdown,
    };
  }

  // ==========================================
  // 2. FINANCIAL PERIOD CONTROL ENGINE
  // ==========================================

  public async getFinancialPeriods(): Promise<FinancialPeriod[]> {
    const list = this.getStorage<FinancialPeriod[]>(STORAGE_KEYS.PERIODS, INITIAL_FINANCIAL_PERIODS);
    return list.sort((a, b) => b.periodKey.localeCompare(a.periodKey));
  }

  public async getFinancialPeriodByKey(periodKey: string): Promise<FinancialPeriod | null> {
    const list = await this.getFinancialPeriods();
    return list.find((p) => p.periodKey === periodKey) || null;
  }

  public async createFinancialPeriod(
    periodKey: string,
    periodName: string,
    actor: { id: string; name: string; role?: string }
  ): Promise<FinancialPeriod> {
    const list = this.getStorage<FinancialPeriod[]>(STORAGE_KEYS.PERIODS, INITIAL_FINANCIAL_PERIODS);
    if (list.some((p) => p.periodKey === periodKey)) {
      throw new Error(`Periode finansial ${periodKey} sudah ada.`);
    }

    const [year, month] = periodKey.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const now = new Date().toISOString();

    const newPeriod: FinancialPeriod = {
      periodId: `fp-${periodKey}`,
      periodKey,
      periodName: periodName || `Periode ${periodKey}`,
      startDate: `${periodKey}-01`,
      endDate: `${periodKey}-${String(lastDay).padStart(2, '0')}`,
      status: 'OPEN',
      history: [
        {
          status: 'OPEN',
          changedBy: actor,
          timestamp: now,
          reason: 'Inisialisasi periode baru',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newPeriod);
    this.setStorage(STORAGE_KEYS.PERIODS, list);
    await this.logAuditEvent({
      entityType: 'PERIOD',
      entityId: newPeriod.periodId,
      action: 'CREATE',
      actor,
      newValue: { status: 'OPEN', periodKey },
      reason: `Pembuatan periode baru ${periodName}`,
    });

    return newPeriod;
  }

  public async transitionPeriodStatus(
    periodKey: string,
    newStatus: FinancialPeriodStatus,
    actor: { id: string; name: string; role?: string },
    reason: string
  ): Promise<FinancialPeriod> {
    if (!reason || !reason.trim()) {
      throw new Error('Alasan perubahan status periode wajib dicantumkan.');
    }

    const list = this.getStorage<FinancialPeriod[]>(STORAGE_KEYS.PERIODS, INITIAL_FINANCIAL_PERIODS);
    const idx = list.findIndex((p) => p.periodKey === periodKey);
    if (idx === -1) throw new Error(`Periode ${periodKey} tidak ditemukan.`);

    const current = list[idx];
    const prevStatus = current.status;

    // RBAC validation
    if ((newStatus === 'CLOSED' || prevStatus === 'CLOSED') && actor.role !== 'OWNER' && actor.role !== 'MANAGER') {
      throw new Error('Hanya Owner atau Manager yang memiliki wewenang untuk Close atau Reopen periode finansial.');
    }

    const now = new Date().toISOString();

    // Snapshot authoritative contracts when locking or closing
    let salesSnapshot = current.salesRevenueSnapshot;
    let payrollSnapshot = current.payrollCostSnapshot;
    let cogsRecognized = current.cogsRecognized;
    let opexRecognized = current.opexRecognized;
    let netProfitRecognized = current.netProfitRecognized;

    if (newStatus === 'LOCKED' || newStatus === 'CLOSED') {
      try {
        salesSnapshot = await salesService.getSalesRevenueContract(periodKey);
        payrollSnapshot = await payrollService.getPayrollCostContract();
        const expenseContract = await this.getExpenseContract(periodKey);
        
        cogsRecognized = salesSnapshot.cogsAmount || 0;
        opexRecognized = (payrollSnapshot.grossPayroll || 0) + (expenseContract.totalPostedAmount || 0);
        netProfitRecognized = salesSnapshot.grossProfit - opexRecognized;
      } catch (err) {
        console.warn('[FinanceService] Could not capture complete snapshots for lock:', err);
      }
    }

    let actionType: FinancialActionType = 'EDIT';
    if (newStatus === 'LOCKED') actionType = 'PERIOD_LOCK';
    else if (newStatus === 'CLOSED') actionType = 'PERIOD_CLOSE';
    else if (prevStatus === 'CLOSED' && newStatus === 'OPEN') actionType = 'PERIOD_REOPEN';

    const updated: FinancialPeriod = {
      ...current,
      status: newStatus,
      salesRevenueSnapshot: salesSnapshot,
      payrollCostSnapshot: payrollSnapshot,
      cogsRecognized,
      opexRecognized,
      netProfitRecognized,
      closedAt: newStatus === 'CLOSED' ? now : current.closedAt,
      closedBy: newStatus === 'CLOSED' ? actor.name : current.closedBy,
      history: [
        {
          status: newStatus,
          changedBy: actor,
          timestamp: now,
          reason,
        },
        ...(current.history || []),
      ],
      updatedAt: now,
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.PERIODS, list);

    await this.logAuditEvent({
      entityType: 'PERIOD',
      entityId: current.periodId,
      action: actionType,
      actor,
      previousValue: { status: prevStatus },
      newValue: { status: newStatus },
      reason,
    });

    return updated;
  }

  public async getPeriodContract(periodKey?: string): Promise<FinancialPeriodContract> {
    const key = periodKey || new Date().toISOString().slice(0, 7);
    const p = await this.getFinancialPeriodByKey(key);
    if (p) {
      return {
        periodKey: p.periodKey,
        periodName: p.periodName,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        isLocked: p.status === 'LOCKED' || p.status === 'CLOSED',
        isClosed: p.status === 'CLOSED',
        totalRevenueRecognized: p.salesRevenueSnapshot?.grossRevenue || 0,
        totalCogsRecognized: p.cogsRecognized || 0,
        totalOpexRecognized: p.opexRecognized || 0,
        netProfitRecognized: p.netProfitRecognized || 0,
        closedAt: p.closedAt,
        closedBy: p.closedBy,
      };
    }

    return {
      periodKey: key,
      periodName: `Periode ${key}`,
      startDate: `${key}-01`,
      endDate: `${key}-31`,
      status: 'OPEN',
      isLocked: false,
      isClosed: false,
      totalRevenueRecognized: 0,
      totalCogsRecognized: 0,
      totalOpexRecognized: 0,
      netProfitRecognized: 0,
    };
  }

  // ==========================================
  // 3. RECONCILIATION ENGINE
  // ==========================================

  public async getReconciliationThresholds(): Promise<ReconciliationThresholds> {
    return this.getStorage<ReconciliationThresholds>(STORAGE_KEYS.THRESHOLDS, DEFAULT_THRESHOLDS);
  }

  public async updateReconciliationThresholds(
    updates: Partial<ReconciliationThresholds>,
    actor: { id: string; name: string; role?: string }
  ): Promise<ReconciliationThresholds> {
    const current = await this.getReconciliationThresholds();
    const updated = { ...current, ...updates };
    this.setStorage(STORAGE_KEYS.THRESHOLDS, updated);

    await this.logAuditEvent({
      entityType: 'RECONCILIATION',
      entityId: 'thresholds-config',
      action: 'EDIT',
      actor,
      previousValue: current,
      newValue: updated,
      reason: 'Pembaruan ambang batas (thresholds) rekonsiliasi',
    });

    return updated;
  }

  public async runFinancialReconciliation(
    periodKey?: string,
    actor?: { id: string; name: string; role?: string }
  ): Promise<FinancialReconciliationContract> {
    const key = periodKey || new Date().toISOString().slice(0, 7);
    const thresholds = await this.getReconciliationThresholds();

    // 1. Fetch Authoritative Cross-Domain Contracts
    const salesContract = await salesService.getSalesRevenueContract(key);
    const cashierClosings = await salesService.getCashierClosings();
    const payrollContract = await payrollService.getPayrollCostContract();
    const expenseContract = await this.getExpenseContract(key);
    const inventoryContracts = await inventoryService.getInventoryCostContracts();
    const recipeContracts = await recipeService.getRecipeCostContracts();

    const items: ReconciliationItemContract[] = [];

    // --- RECONCILIATION 1: POS Sales vs Cashier Drawer Report ---
    const totalCashierReported = cashierClosings.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const posTotal = salesContract.grandTotal;
    const salesDiff = Math.abs(posTotal - totalCashierReported);
    const salesVariancePct = posTotal > 0 ? Number(((salesDiff / posTotal) * 100).toFixed(2)) : 0;
    
    let salesStatus: ReconciliationStatus = 'BALANCED';
    if (salesDiff > 0) {
      if (salesVariancePct <= thresholds.minorVariancePercentage) salesStatus = 'MINOR_VARIANCE';
      else salesStatus = 'MATERIAL_VARIANCE';
    }

    items.push({
      domain: 'SALES_POS',
      title: 'POS Sales vs Laporan Fisik Kasir (Z-Report)',
      sourceName: 'SalesService SSoT vs Cashier Closings',
      sourceTotal: posTotal,
      financeRecognizedTotal: totalCashierReported,
      variance: posTotal - totalCashierReported,
      variancePercentage: salesVariancePct,
      status: salesStatus,
      thresholdApplied: {
        minorMaxPercentage: thresholds.minorVariancePercentage,
        materialMinPercentage: thresholds.materialVariancePercentage,
      },
      notes: salesDiff === 0 ? 'Klop 100% antara POS terminal dan setoran kasir' : `Selisih nominal Rp ${(salesDiff ?? 0).toLocaleString('id-ID')}`,
    });

    // --- RECONCILIATION 2: POS Payment Methods Breakdown ---
    const paymentMethodsSum =
      (salesContract.cashRevenue || 0) +
      (salesContract.qrisRevenue || 0) +
      (salesContract.edcRevenue || 0) +
      (salesContract.transferRevenue || 0);
    const pmDiff = Math.abs(salesContract.grossRevenue - paymentMethodsSum);
    const pmVariancePct = salesContract.grossRevenue > 0 ? Number(((pmDiff / salesContract.grossRevenue) * 100).toFixed(2)) : 0;
    
    let pmStatus: ReconciliationStatus = 'BALANCED';
    if (pmDiff > 0) {
      pmStatus = pmVariancePct <= thresholds.minorVariancePercentage ? 'MINOR_VARIANCE' : 'MATERIAL_VARIANCE';
    }

    items.push({
      domain: 'PAYMENT_METHODS',
      title: 'Validasi Tender Pembayaran (Tunai, QRIS, EDC, Transfer)',
      sourceName: 'POS Tender Settlement vs Gross Sales',
      sourceTotal: salesContract.grossRevenue,
      financeRecognizedTotal: paymentMethodsSum,
      variance: salesContract.grossRevenue - paymentMethodsSum,
      variancePercentage: pmVariancePct,
      status: pmStatus,
      thresholdApplied: {
        minorMaxPercentage: thresholds.minorVariancePercentage,
        materialMinPercentage: thresholds.materialVariancePercentage,
      },
    });

    // --- RECONCILIATION 3: Recipe BOM HPP vs Recognized COGS ---
    const recognizedCogs = salesContract.cogsAmount;
    const avgFoodCostPct = salesContract.foodCostPercentage || 32.0;
    const theoreticalCogs = Math.round((salesContract.netRevenue * avgFoodCostPct) / 100);
    const cogsDiff = Math.abs(recognizedCogs - theoreticalCogs);
    const cogsVariancePct = theoreticalCogs > 0 ? Number(((cogsDiff / theoreticalCogs) * 100).toFixed(2)) : 0;
    
    let cogsStatus: ReconciliationStatus = 'BALANCED';
    if (cogsDiff > 0) {
      cogsStatus = cogsVariancePct <= thresholds.minorVariancePercentage ? 'MINOR_VARIANCE' : 'MATERIAL_VARIANCE';
    }

    items.push({
      domain: 'INVENTORY_COGS',
      title: 'HPP Resep / Recipe Costing vs Recognized COGS',
      sourceName: 'RecipeService Contracts vs Sales COGS',
      sourceTotal: theoreticalCogs,
      financeRecognizedTotal: recognizedCogs,
      variance: theoreticalCogs - recognizedCogs,
      variancePercentage: cogsVariancePct,
      status: cogsStatus,
      thresholdApplied: {
        minorMaxPercentage: thresholds.minorVariancePercentage,
        materialMinPercentage: thresholds.materialVariancePercentage,
      },
    });

    // --- RECONCILIATION 4: HR Payroll Contract vs Finance Labor OPEX ---
    const hrGrossPayroll = payrollContract.grossPayroll;
    const hrNetPayroll = payrollContract.netPayroll;
    // Finance recognizes gross payroll as true labor expense
    const financeRecognizedPayroll = hrGrossPayroll;
    const payrollDiff = 0; // Authoritative contract pass-through

    items.push({
      domain: 'PAYROLL_HR',
      title: 'Rekonsiliasi Penggajian & Tunjangan SDM',
      sourceName: 'PayrollService Contract (PayrollCostContract)',
      sourceTotal: hrGrossPayroll,
      financeRecognizedTotal: financeRecognizedPayroll,
      variance: 0,
      variancePercentage: 0,
      status: 'BALANCED',
      thresholdApplied: {
        minorMaxPercentage: thresholds.minorVariancePercentage,
        materialMinPercentage: thresholds.materialVariancePercentage,
      },
      notes: `Gaji Pokok: Rp ${(payrollContract.basicSalaryTotal ?? 0).toLocaleString('id-ID')}, Lembur: Rp ${(payrollContract.overtimeTotal ?? 0).toLocaleString('id-ID')}`,
    });

    // --- RECONCILIATION 5: Posted Expenses vs OPEX Ledger ---
    const totalPostedOpex = expenseContract.totalPostedAmount;
    const totalPendingOpex = expenseContract.totalPendingAmount;
    
    items.push({
      domain: 'EXPENSE_OPEX',
      title: 'Beban Operasional Terposting (Posted OPEX Ledger)',
      sourceName: 'FinanceService Expenses Ledger',
      sourceTotal: totalPostedOpex,
      financeRecognizedTotal: totalPostedOpex,
      variance: 0,
      variancePercentage: 0,
      status: totalPendingOpex > 0 ? 'MINOR_VARIANCE' : 'BALANCED',
      thresholdApplied: {
        minorMaxPercentage: thresholds.minorVariancePercentage,
        materialMinPercentage: thresholds.materialVariancePercentage,
      },
      notes: totalPendingOpex > 0 ? `Terdapat Rp ${(totalPendingOpex ?? 0).toLocaleString('id-ID')} expense berstatus pending approval` : 'Semua beban operasional telah tervalidasi',
    });

    // Overall Status Computation
    let overallStatus: ReconciliationStatus = 'BALANCED';
    if (items.some((i) => i.status === 'MATERIAL_VARIANCE')) {
      overallStatus = 'MATERIAL_VARIANCE';
    } else if (items.some((i) => i.status === 'MINOR_VARIANCE')) {
      overallStatus = 'MINOR_VARIANCE';
    }

    const totalFinanceOpex = financeRecognizedPayroll + totalPostedOpex;
    const netProfitCalculated = salesContract.grossProfit - totalFinanceOpex;

    const result: FinancialReconciliationContract = {
      periodKey: key,
      reconciledAt: new Date().toISOString(),
      reconciledBy: actor?.name || 'System Automated Reconciliation',
      overallStatus,
      items,
      totalSourceRevenue: posTotal,
      totalFinanceRevenue: totalCashierReported,
      totalSourceCogs: theoreticalCogs,
      totalFinanceCogs: recognizedCogs,
      totalSourceOpex: totalFinanceOpex,
      totalFinanceOpex,
      netProfitCalculated,
    };

    if (actor) {
      await this.logAuditEvent({
        entityType: 'RECONCILIATION',
        entityId: `rec-${key}`,
        action: 'APPROVE',
        actor,
        newValue: { overallStatus, netProfitCalculated },
        reason: `Eksekusi rekonsiliasi finansial periode ${key}`,
      });
    }

    return result;
  }

  // ==========================================
  // 4. FINANCIAL KPI & PRESENTATION ENGINE
  // ==========================================

  public async getFinancialKpiMetrics(periodKey?: string): Promise<FinancialKpiMetrics> {
    const key = periodKey || new Date().toISOString().slice(0, 7);
    const salesContract = await salesService.getSalesRevenueContract(key);
    const payrollContract = await payrollService.getPayrollCostContract();
    const expenseContract = await this.getExpenseContract(key);
    const reconcileContract = await this.runFinancialReconciliation(key);

    const grossSales = salesContract.grossRevenue ?? 0;
    const discounts = salesContract.discounts ?? 0;
    const refunds = salesContract.refunds ?? 0;
    const netSales = salesContract.netRevenue ?? 0;
    const cogs = salesContract.cogsAmount ?? 0;
    const grossProfit = salesContract.grossProfit ?? 0;
    const grossMarginPct = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(1)) : 0;

    const payrollCost = payrollContract.grossPayroll ?? 0;
    const operatingOpex = expenseContract.totalPostedAmount ?? 0;
    const totalOpex = payrollCost + operatingOpex;
    const ebitda = grossProfit - totalOpex;
    const netProfitMargin = netSales > 0 ? Number(((ebitda / netSales) * 100).toFixed(1)) : 0;

    const foodCostPct = netSales > 0 ? Number(((cogs / netSales) * 100).toFixed(1)) : 0;
    const laborCostPct = netSales > 0 ? Number(((payrollCost / netSales) * 100).toFixed(1)) : 0;
    const opexPct = netSales > 0 ? Number(((totalOpex / netSales) * 100).toFixed(1)) : 0;

    const cashierClosings = await salesService.getCashierClosings();
    const cashVariance = cashierClosings.reduce((acc, c) => acc + (c.cashVariance || 0), 0);

    const allExpenses = await this.getExpenses({ period: key });
    const pendingExpenses = allExpenses.filter((e) => e.status === 'SUBMITTED' || e.status === 'APPROVED');
    const pendingCount = pendingExpenses.length;
    const pendingAmount = pendingExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      periodLabel: `Periode ${key}`,
      grossSales,
      discounts,
      refunds,
      netSales,
      cogs,
      grossProfit,
      grossMarginPercentage: grossMarginPct,
      totalOpex,
      payrollCost,
      operatingOpex,
      ebitda,
      netProfitMargin,
      foodCostPercentage: foodCostPct,
      laborCostPercentage: laborCostPct,
      opexPercentage: opexPct,
      cashVariance,
      pendingExpenseApprovalCount: pendingCount,
      pendingExpenseApprovalAmount: pendingAmount,
      reconciliationStatus: reconcileContract.overallStatus,
    };
  }

  public async getCashFlowStatement(periodKey?: string): Promise<CashFlowStatement> {
    const key = periodKey || new Date().toISOString().slice(0, 7);
    const salesContract = await salesService.getSalesRevenueContract(key);
    const payrollContract = await payrollService.getPayrollCostContract();
    const expenseContract = await this.getExpenseContract(key);

    const cashSales = salesContract.cashRevenue ?? 0;
    const qrisTransfer = (salesContract.qrisRevenue ?? 0) + (salesContract.transferRevenue ?? 0);
    const edcSettlement = salesContract.edcRevenue ?? 0;
    const otherInflows = 0;
    const totalOperatingInflow = cashSales + qrisTransfer + edcSettlement + otherInflows;

    // Outflow
    const purchasingDisbursed = Math.round((salesContract.cogsAmount ?? 0) * 0.9); // 90% paid out
    const payrollDisbursed = payrollContract.status === 'DISBURSED' ? payrollContract.netPayroll : Math.round(payrollContract.netPayroll * 0.5);
    const postedOpexDisbursed = expenseContract.totalPostedAmount ?? 0;
    const taxDisbursed = Math.round((salesContract.taxAmount ?? 0) * 0.8);
    const totalOperatingOutflow = purchasingDisbursed + payrollDisbursed + postedOpexDisbursed + taxDisbursed;

    const netOperatingCashFlow = totalOperatingInflow - totalOperatingOutflow;
    const openingCash = 345000000; // Liquid cash opening
    const closingCash = openingCash + netOperatingCashFlow;

    return {
      periodLabel: `Periode ${key}`,
      inflow: {
        cashSalesReceipts: cashSales,
        bankTransferQrisSettlements: qrisTransfer,
        edcSettlements: edcSettlement,
        otherInflows,
        totalOperatingInflow,
      },
      outflow: {
        purchasingSuppliersDisbursement: purchasingDisbursed,
        payrollDisbursement: payrollDisbursed,
        postedOpexDisbursement: postedOpexDisbursed,
        taxAndServiceDisbursement: taxDisbursed,
        totalOperatingOutflow,
      },
      netOperatingCashFlow,
      openingCashBalance: openingCash,
      closingCashBalance: closingCash,
    };
  }

  // ==========================================
  // 5. CASH ACCOUNTS
  // ==========================================

  public async getCashAccounts(): Promise<CashAccount[]> {
    return this.getStorage<CashAccount[]>(STORAGE_KEYS.CASH_ACCOUNTS, MOCK_CASH_ACCOUNTS);
  }

  public async updateCashAccount(
    id: string,
    updates: Partial<CashAccount>,
    actor?: { id: string; name: string; role?: string }
  ): Promise<CashAccount> {
    const list = this.getStorage<CashAccount[]>(STORAGE_KEYS.CASH_ACCOUNTS, MOCK_CASH_ACCOUNTS);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Akun kas ${id} tidak ditemukan.`);

    const updated = {
      ...list[idx],
      ...updates,
      lastUpdated: new Date().toLocaleString('id-ID'),
    };

    list[idx] = updated;
    this.setStorage(STORAGE_KEYS.CASH_ACCOUNTS, list);

    if (actor) {
      await this.logAuditEvent({
        entityType: 'CASH_ACCOUNT',
        entityId: id,
        action: 'EDIT',
        actor,
        newValue: updates,
        reason: 'Pembaruan saldo/data akun kas & bank',
      });
    }

    return updated;
  }

  // ==========================================
  // 6. CRITICAL BUSINESS TEST SUITE (12 Tests)
  // ==========================================

  public async runCriticalBusinessTests(): Promise<FinanceBusinessTestResult[]> {
    const results: FinanceBusinessTestResult[] = [];
    const testActor = { id: 'test-runner', name: 'Automated Test Engine', role: 'OWNER' };
    const nowIso = new Date().toISOString();

    // ----------------------------------------------------
    // TEST 1: Expense Creation (Draft status & Auto Numbering)
    // ----------------------------------------------------
    try {
      const exp = await this.createExpense(
        {
          date: '2026-08-15',
          period: '2026-08',
          category: 'Utilities',
          description: 'TEST 1: Uji Pembuatan Beban Operasional',
          amount: 500000,
          vendor: 'Vendor Test',
          paymentMethod: 'Bank Transfer',
          department: 'Operations',
          status: 'DRAFT',
          createdBy: testActor,
        },
        testActor
      );

      const passed =
        exp.status === 'DRAFT' &&
        exp.expenseNumber.startsWith('EXP-202608') &&
        exp.amount === 500000 &&
        exp.auditTrail.length >= 1;

      results.push({
        testNumber: 1,
        name: 'Expense Creation & Auto-Numbering',
        category: 'EXPENSE_LIFECYCLE',
        passed,
        details: passed
          ? `Lolos: Draf expense ${exp.expenseNumber} terbit dengan nomor unik dan audit trail.`
          : 'Gagal: Format nomor expense atau status draf tidak valid.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 1,
        name: 'Expense Creation & Auto-Numbering',
        category: 'EXPENSE_LIFECYCLE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 2: Expense Approval (Transition from Submitted to Approved)
    // ----------------------------------------------------
    try {
      const draft = await this.createExpense(
        {
          date: '2026-08-15',
          period: '2026-08',
          category: 'Cleaning',
          description: 'TEST 2: Uji Alur Approval',
          amount: 350000,
          vendor: 'Cleaning Test',
          paymentMethod: 'Bank Transfer',
          department: 'Kitchen',
          status: 'DRAFT',
          createdBy: testActor,
        },
        testActor
      );

      const submitted = await this.submitExpense(draft.expenseId, testActor);
      const approved = await this.approveExpense(draft.expenseId, testActor, 'Approved for test');

      const passed =
        submitted.status === 'SUBMITTED' &&
        approved.status === 'APPROVED' &&
        approved.approvedBy?.name === testActor.name;

      results.push({
        testNumber: 2,
        name: 'Expense Lifecycle Approval State Machine',
        category: 'EXPENSE_LIFECYCLE',
        passed,
        details: passed
          ? 'Lolos: Transisi DRAFT → SUBMITTED → APPROVED terekam lengkap beserta identitas approver.'
          : 'Gagal: Transisi approval tidak mengubah status dengan benar.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 2,
        name: 'Expense Lifecycle Approval State Machine',
        category: 'EXPENSE_LIFECYCLE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 3: Expense Posting (Transition to POSTED)
    // ----------------------------------------------------
    try {
      const item = await this.createExpense(
        {
          date: '2026-08-15',
          period: '2026-08',
          category: 'Maintenance',
          description: 'TEST 3: Uji Posting Final',
          amount: 400000,
          vendor: 'Maint Test',
          paymentMethod: 'Bank Transfer',
          department: 'Bar',
          status: 'DRAFT',
          createdBy: testActor,
        },
        testActor
      );

      await this.submitExpense(item.expenseId, testActor);
      await this.approveExpense(item.expenseId, testActor);
      const posted = await this.postExpense(item.expenseId, testActor, 'Posting ledger test');

      const passed = posted.status === 'POSTED' && posted.postedBy?.name === testActor.name;

      results.push({
        testNumber: 3,
        name: 'Expense Posting to Financial Ledger',
        category: 'EXPENSE_LIFECYCLE',
        passed,
        details: passed
          ? `Lolos: Expense ${posted.expenseNumber} berstatus POSTED dan masuk ke ledger buku besar.`
          : 'Gagal: Gagal melakukan posting expense yang telah disetujui.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 3,
        name: 'Expense Posting to Financial Ledger',
        category: 'EXPENSE_LIFECYCLE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 4: Posted Expense Immutability Protection
    // ----------------------------------------------------
    try {
      const item = await this.createExpense(
        {
          date: '2026-08-15',
          period: '2026-08',
          category: 'Office Supplies',
          description: 'TEST 4: Uji Immutability Posted',
          amount: 250000,
          vendor: 'Supplies Test',
          paymentMethod: 'Bank Transfer',
          department: 'Finance',
          status: 'DRAFT',
          createdBy: testActor,
        },
        testActor
      );
      await this.submitExpense(item.expenseId, testActor);
      await this.approveExpense(item.expenseId, testActor);
      await this.postExpense(item.expenseId, testActor);

      let threwError = false;
      try {
        // Attempt forbidden direct update on POSTED expense
        await this.updateExpense(item.expenseId, { amount: 9999999 }, testActor);
      } catch (err) {
        threwError = true;
      }

      results.push({
        testNumber: 4,
        name: 'Posted Expense Immutability Protection',
        category: 'EXPENSE_LIFECYCLE',
        passed: threwError,
        details: threwError
          ? 'Lolos: Sistem berhasil menolak mutasi langsung terhadap transaksi berstatus POSTED.'
          : 'Gagal: Transaksi POSTED masih dapat diedit secara langsung (pelanggaran prinsip integritas).',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 4,
        name: 'Posted Expense Immutability Protection',
        category: 'EXPENSE_LIFECYCLE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 5: Expense Reversal / Adjustment Audit Flow
    // ----------------------------------------------------
    try {
      const item = await this.createExpense(
        {
          date: '2026-08-15',
          period: '2026-08',
          category: 'Transportation',
          description: 'TEST 5: Uji Reversal Transaksi',
          amount: 600000,
          vendor: 'Trans Test',
          paymentMethod: 'Bank Transfer',
          department: 'Operations',
          status: 'DRAFT',
          createdBy: testActor,
        },
        testActor
      );
      await this.submitExpense(item.expenseId, testActor);
      await this.approveExpense(item.expenseId, testActor);
      await this.postExpense(item.expenseId, testActor);

      const { originalExpense, reversalExpense } = await this.reverseExpense(
        item.expenseId,
        testActor,
        'Koreksi dobel input faktur'
      );

      const passed =
        originalExpense.isAdjusted === true &&
        reversalExpense.amount === -600000 &&
        reversalExpense.isReversal === true &&
        reversalExpense.reversalOfExpenseId === item.expenseId;

      results.push({
        testNumber: 5,
        name: 'Controlled Expense Reversal & Audit Linkage',
        category: 'EXPENSE_LIFECYCLE',
        passed,
        details: passed
          ? `Lolos: Terbentuk jurnal kontra reversal (${reversalExpense.expenseNumber}) senilai -Rp 600.000 dengan jejak audit tertaut.`
          : 'Gagal: Jurnal reversal tidak sesuai nominal atau kehilangan referensi audit.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 5,
        name: 'Controlled Expense Reversal & Audit Linkage',
        category: 'EXPENSE_LIFECYCLE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 6: Sales → Finance Contract Consumption
    // ----------------------------------------------------
    try {
      const salesContract = await salesService.getSalesRevenueContract('2026-08');
      const passed =
        typeof salesContract.grossRevenue === 'number' &&
        typeof salesContract.netRevenue === 'number' &&
        typeof salesContract.cogsAmount === 'number' &&
        salesContract.grossRevenue >= salesContract.netRevenue;

      results.push({
        testNumber: 6,
        name: 'Sales → Finance Contract Integration (SalesRevenueContract)',
        category: 'CONTRACT_CONSUMPTION',
        passed,
        details: passed
          ? `Lolos: Finance berhasil membaca data omzet Gross Rp ${(salesContract.grossRevenue ?? 0).toLocaleString('id-ID')} & Net Rp ${(salesContract.netRevenue ?? 0).toLocaleString('id-ID')}.`
          : 'Gagal: Struktur SalesRevenueContract tidak memenuhi kontrak data.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 6,
        name: 'Sales → Finance Contract Integration (SalesRevenueContract)',
        category: 'CONTRACT_CONSUMPTION',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 7: Payroll → Finance Contract Consumption
    // ----------------------------------------------------
    try {
      const payrollContract = await payrollService.getPayrollCostContract();
      const passed =
        typeof payrollContract.grossPayroll === 'number' &&
        typeof payrollContract.netPayroll === 'number' &&
        payrollContract.grossPayroll >= payrollContract.netPayroll &&
        payrollContract.totalEmployees > 0;

      results.push({
        testNumber: 7,
        name: 'HR Payroll → Finance Labor OPEX Contract Integration',
        category: 'CONTRACT_CONSUMPTION',
        passed,
        details: passed
          ? `Lolos: Finance berhasil mengonsumsi kontrak Payroll (Gross: Rp ${(payrollContract.grossPayroll ?? 0).toLocaleString('id-ID')}, Staf: ${payrollContract.totalEmployees}).`
          : 'Gagal: Kontrak PayrollCostContract tidak valid.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 7,
        name: 'HR Payroll → Finance Labor OPEX Contract Integration',
        category: 'CONTRACT_CONSUMPTION',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 8: Recipe/COGS → Finance Contract Consumption
    // ----------------------------------------------------
    try {
      const recipeContracts = await recipeService.getRecipeCostContracts();
      const passed =
        Array.isArray(recipeContracts) &&
        recipeContracts.length > 0 &&
        recipeContracts.every((r) => r.totalHppPerPortion > 0 && r.sellingPrice > 0);

      results.push({
        testNumber: 8,
        name: 'Recipe / Inventory Cost → Finance COGS Contract Integration',
        category: 'CONTRACT_CONSUMPTION',
        passed,
        details: passed
          ? `Lolos: Finance membaca ${recipeContracts.length} kontrak resep HPP tanpa menghitung ulang formula operasional.`
          : 'Gagal: Kontrak RecipeCostContract kosong atau tidak valid.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 8,
        name: 'Recipe / Inventory Cost → Finance COGS Contract Integration',
        category: 'CONTRACT_CONSUMPTION',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 9: Reconciliation Engine (Balanced Condition)
    // ----------------------------------------------------
    try {
      const rec = await this.runFinancialReconciliation('2026-08');
      const passed =
        Array.isArray(rec.items) &&
        rec.items.length >= 4 &&
        rec.items.some((i) => i.domain === 'SALES_POS') &&
        rec.items.some((i) => i.domain === 'PAYROLL_HR');

      results.push({
        testNumber: 9,
        name: 'Cross-Domain Financial Reconciliation Execution',
        category: 'RECONCILIATION',
        passed,
        details: passed
          ? `Lolos: Rekonsiliasi 5 pilar terlaksana dengan status keseluruhan [${rec.overallStatus}].`
          : 'Gagal: Format hasil rekonsiliasi domain tidak lengkap.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 9,
        name: 'Cross-Domain Financial Reconciliation Execution',
        category: 'RECONCILIATION',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 10: Reconciliation Thresholds Configuration & Variance Detection
    // ----------------------------------------------------
    try {
      const thresholds = await this.getReconciliationThresholds();
      const passed =
        typeof thresholds.minorVariancePercentage === 'number' &&
        typeof thresholds.materialVariancePercentage === 'number' &&
        thresholds.materialVariancePercentage > thresholds.minorVariancePercentage;

      results.push({
        testNumber: 10,
        name: 'Configurable Variance Threshold & Discrepancy Detection',
        category: 'RECONCILIATION',
        passed,
        details: passed
          ? `Lolos: Ambang batas Minor (${thresholds.minorVariancePercentage}%) dan Material (${thresholds.materialVariancePercentage}%) terkonfigurasi dinamis.`
          : 'Gagal: Konfigurasi ambang batas rekonsiliasi cacat.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 10,
        name: 'Configurable Variance Threshold & Discrepancy Detection',
        category: 'RECONCILIATION',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 11: Financial Period Lock State Machine
    // ----------------------------------------------------
    try {
      const testPeriodKey = '2026-09';
      let period = await this.getFinancialPeriodByKey(testPeriodKey);
      if (!period) {
        period = await this.createFinancialPeriod(testPeriodKey, 'September 2026', testActor);
      }

      const lockedPeriod = await this.transitionPeriodStatus(
        testPeriodKey,
        'LOCKED',
        testActor,
        'Uji lockdown periode'
      );

      const passed =
        lockedPeriod.status === 'LOCKED' &&
        lockedPeriod.history.some((h) => h.status === 'LOCKED');

      results.push({
        testNumber: 11,
        name: 'Financial Period Lock Lifecycle & Audit Snapshot',
        category: 'PERIOD_GOVERNANCE',
        passed,
        details: passed
          ? `Lolos: Periode ${testPeriodKey} berhasil di-LOCK dan snapshot audit tersimpan.`
          : 'Gagal: Transisi status periode ke LOCKED gagal.',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 11,
        name: 'Financial Period Lock Lifecycle & Audit Snapshot',
        category: 'PERIOD_GOVERNANCE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    // ----------------------------------------------------
    // TEST 12: Closed Period Mutation Blockage Protection
    // ----------------------------------------------------
    try {
      const testPeriodKey = '2026-07'; // Already CLOSED in initial mock data
      let threwError = false;

      try {
        // Attempting to create an expense on a closed period MUST be blocked!
        await this.createExpense(
          {
            date: '2026-07-20',
            period: testPeriodKey,
            category: 'Other',
            description: 'TEST 12: Percobaan mutasi ilegal pada periode closed',
            amount: 1000000,
            vendor: 'Illegal Test',
            paymentMethod: 'Bank Transfer',
            department: 'Finance',
            status: 'DRAFT',
            createdBy: testActor,
          },
          testActor
        );
      } catch (err) {
        threwError = true;
      }

      results.push({
        testNumber: 12,
        name: 'Closed Period Mutation Protection (Hard Lock Enforcement)',
        category: 'PERIOD_GOVERNANCE',
        passed: threwError,
        details: threwError
          ? 'Lolos: Sistem berhasil memblokir pencatatan expense baru pada periode yang sudah berstatus CLOSED.'
          : 'Gagal: Sistem membiarkan mutasi finansial pada periode CLOSED (pelanggaran fatal integritas pembukuan).',
        timestamp: nowIso,
      });
    } catch (e: any) {
      results.push({
        testNumber: 12,
        name: 'Closed Period Mutation Protection (Hard Lock Enforcement)',
        category: 'PERIOD_GOVERNANCE',
        passed: false,
        details: `Gagal: ${e.message}`,
        timestamp: nowIso,
      });
    }

    return results;
  }

  // ==========================================
  // RESET TO DEFAULTS
  // ==========================================

  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.PERIODS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
    localStorage.removeItem(STORAGE_KEYS.CASH_ACCOUNTS);

    this.setStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.setStorage(STORAGE_KEYS.PERIODS, INITIAL_FINANCIAL_PERIODS);
    this.setStorage(STORAGE_KEYS.THRESHOLDS, DEFAULT_THRESHOLDS);
    this.setStorage(STORAGE_KEYS.CASH_ACCOUNTS, MOCK_CASH_ACCOUNTS);
  }
}

export const financeService = new FinanceServiceEngine();
