/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — FINANCE DOMAIN TYPES & INTERFACES
 * Phase 3.9 — Financial Control, Expense/OPEX, Reconciliation & Period Closing
 */

import {
  FinanceExpenseContract,
  FinancialPeriodContract,
  FinancialReconciliationContract,
  ReconciliationStatus,
  SalesRevenueContract,
  PayrollCostContract,
  InventoryCostContract,
  RecipeCostContract,
} from './contracts';

// ==========================================
// 1. EXPENSE / OPEX TYPES & ENUMS
// ==========================================

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Telephone'
  | 'Maintenance'
  | 'Cleaning'
  | 'Marketing'
  | 'Advertising'
  | 'Transportation'
  | 'Office Supplies'
  | 'Equipment'
  | 'Professional Services'
  | 'Payroll-related OPEX'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Utilities',
  'Electricity',
  'Water',
  'Internet',
  'Telephone',
  'Maintenance',
  'Cleaning',
  'Marketing',
  'Advertising',
  'Transportation',
  'Office Supplies',
  'Equipment',
  'Professional Services',
  'Payroll-related OPEX',
  'Other',
];

export type ExpenseDepartment =
  | 'Executive'
  | 'Management'
  | 'Operations'
  | 'Kitchen'
  | 'Bar'
  | 'Service'
  | 'Marketing'
  | 'HR'
  | 'Finance';

export const EXPENSE_DEPARTMENTS: ExpenseDepartment[] = [
  'Executive',
  'Management',
  'Operations',
  'Kitchen',
  'Bar',
  'Service',
  'Marketing',
  'HR',
  'Finance',
];

export type ExpensePaymentMethod =
  | 'Bank Transfer'
  | 'Cash (Kasir / Petty Cash)'
  | 'Corporate Debit / Credit Card'
  | 'BCA Operasional Utama'
  | 'Other';

export const EXPENSE_PAYMENT_METHODS: ExpensePaymentMethod[] = [
  'Bank Transfer',
  'Cash (Kasir / Petty Cash)',
  'Corporate Debit / Credit Card',
  'BCA Operasional Utama',
  'Other',
];

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'POSTED'
  | 'REJECTED'
  | 'CANCELLED';

// ==========================================
// 2. FINANCIAL AUDIT TRAIL
// ==========================================

export type FinancialActionType =
  | 'CREATE'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'POST'
  | 'EDIT'
  | 'ADJUST'
  | 'REVERSE'
  | 'CANCEL'
  | 'PERIOD_LOCK'
  | 'PERIOD_CLOSE'
  | 'PERIOD_REOPEN';

export interface FinancialAuditEvent {
  eventId: string;
  entityType: 'EXPENSE' | 'PERIOD' | 'RECONCILIATION' | 'CASH_ACCOUNT' | 'CLOSING';
  entityId: string;
  action: FinancialActionType;
  actor: {
    id: string;
    name: string;
    role?: string;
  };
  timestamp: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
  metadata?: Record<string, any>;
}

// ==========================================
// 3. EXPENSE ITEM MODEL
// ==========================================

export interface ExpenseItem {
  expenseId: string;
  expenseNumber: string; // e.g. EXP-202608-001
  date: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  category: ExpenseCategory;
  description: string;
  amount: number;
  taxAmount?: number;
  vendor: string;
  paymentMethod: ExpensePaymentMethod;
  department: ExpenseDepartment;
  status: ExpenseStatus;
  
  // Actor metadata
  createdBy: {
    id: string;
    name: string;
    role?: string;
  };
  submittedBy?: {
    id: string;
    name: string;
    role?: string;
    timestamp: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
    timestamp: string;
  };
  postedBy?: {
    id: string;
    name: string;
    role?: string;
    timestamp: string;
  };
  rejectedBy?: {
    id: string;
    name: string;
    role?: string;
    timestamp: string;
    reason?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Context & Evidence
  notes?: string;
  attachmentUrl?: string;
  
  // Reversal / Adjustment references
  isReversal?: boolean;
  reversalOfExpenseId?: string;
  isAdjusted?: boolean;
  adjustmentOfExpenseId?: string;

  // Complete Audit Trail
  auditTrail: FinancialAuditEvent[];
}

export interface ExpenseFilterParams {
  period?: string; // YYYY-MM
  category?: ExpenseCategory | 'ALL';
  department?: ExpenseDepartment | 'ALL';
  status?: ExpenseStatus | 'ALL';
  paymentMethod?: ExpensePaymentMethod | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseSummary {
  period: string;
  totalExpensesCount: number;
  totalDraftAmount: number;
  totalSubmittedAmount: number;
  totalApprovedAmount: number;
  totalPostedAmount: number;
  totalRejectedAmount: number;
  grandTotalPosted: number;
  topCategory: {
    category: ExpenseCategory;
    amount: number;
  };
}

// ==========================================
// 4. FINANCIAL PERIOD CONTROL
// ==========================================

export type FinancialPeriodStatus = 'DRAFT' | 'OPEN' | 'REVIEW' | 'LOCKED' | 'CLOSED';

export interface FinancialPeriod {
  periodId: string;
  periodKey: string; // e.g. "2026-08"
  periodName: string; // e.g. "Agustus 2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: FinancialPeriodStatus;
  
  // Authoritative snapshots at lock/close
  salesRevenueSnapshot?: SalesRevenueContract;
  payrollCostSnapshot?: PayrollCostContract;
  cogsRecognized?: number;
  opexRecognized?: number;
  netProfitRecognized?: number;
  
  // Audit log
  history: {
    status: FinancialPeriodStatus;
    changedBy: {
      id: string;
      name: string;
      role?: string;
    };
    timestamp: string;
    reason: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
}

// ==========================================
// 5. RECONCILIATION ENGINE
// ==========================================

export interface ReconciliationThresholds {
  minorVariancePercentage: number; // default: 1.0 (1%)
  materialVariancePercentage: number; // default: 3.0 (3%)
  allowableCashVarianceNominal: number; // default: 50000 IDR
}

export interface DomainReconciliationSummary {
  periodKey: string;
  salesReconciliation: {
    posGrandTotal: number;
    cashierReportedTotal: number;
    paymentMethodsSum: number;
    variance: number;
    status: ReconciliationStatus;
  };
  cogsReconciliation: {
    recipeTheoreticalHpp: number;
    productionActualCost: number;
    recognizedCogs: number;
    variance: number;
    status: ReconciliationStatus;
  };
  payrollReconciliation: {
    hrGrossPayroll: number;
    financeRecognizedPayroll: number;
    variance: number;
    status: ReconciliationStatus;
  };
  opexReconciliation: {
    totalPostedExpenses: number;
    accruedOpex: number;
    variance: number;
    status: ReconciliationStatus;
  };
  overallStatus: ReconciliationStatus;
  lastReconciledAt: string;
}

// ==========================================
// 6. FINANCIAL KPI & PRESENTATION
// ==========================================

export interface FinancialKpiMetrics {
  periodLabel: string;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercentage: number;
  totalOpex: number;
  payrollCost: number;
  operatingOpex: number;
  ebitda: number;
  netProfitMargin: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  opexPercentage: number;
  cashVariance: number;
  pendingExpenseApprovalCount: number;
  pendingExpenseApprovalAmount: number;
  reconciliationStatus: ReconciliationStatus;
}

export interface CashFlowStatement {
  periodLabel: string;
  inflow: {
    cashSalesReceipts: number;
    bankTransferQrisSettlements: number;
    edcSettlements: number;
    otherInflows: number;
    totalOperatingInflow: number;
  };
  outflow: {
    purchasingSuppliersDisbursement: number;
    payrollDisbursement: number;
    postedOpexDisbursement: number;
    taxAndServiceDisbursement: number;
    totalOperatingOutflow: number;
  };
  netOperatingCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
}

// ==========================================
// 7. CRITICAL BUSINESS TEST SUITE
// ==========================================

export interface FinanceBusinessTestResult {
  testNumber: number;
  name: string;
  category: 'EXPENSE_LIFECYCLE' | 'CONTRACT_CONSUMPTION' | 'RECONCILIATION' | 'PERIOD_GOVERNANCE';
  passed: boolean;
  details: string;
  timestamp: string;
}
