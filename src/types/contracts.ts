/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — SHARED CROSS-DOMAIN DATA CONTRACTS
 * 
 * Standardized data transfer interfaces between core domains:
 * - Inventory → Recipe / Production / Finance
 * - Recipe → HPP / Production / Finance
 * - Production → Inventory / Finance
 * - POS & Sales → Dashboard / Finance / CRM
 * - HR Payroll → Finance OPEX
 */

// ==========================================
// 1. INVENTORY → RECIPE / FINANCE CONTRACT
// ==========================================
export interface InventoryCostContract {
  itemId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  averageCost: number;
  lastPurchaseCost: number;
  totalValuation: number;
  lastUpdatedAt: string;
}

// ==========================================
// 2. RECIPE → HPP / FINANCE CONTRACT
// ==========================================
export interface RecipeCostContract {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  category: string;
  portionSize: number;
  portionUnit: string;
  costPerPortion: number;
  packagingCostPerPortion: number;
  totalHppPerPortion: number;
  sellingPrice: number;
  foodCostPercentage: number;
  targetFoodCostPercentage: number;
  grossMarginPercentage: number;
  grossProfitPerPortion: number;
  calculatedAt: string;
}

// ==========================================
// 3. PRODUCTION → INVENTORY / FINANCE CONTRACT
// ==========================================
export interface ProductionBatchCostContract {
  batchId: string;
  batchNumber: string;
  recipeId: string;
  recipeName: string;
  targetQuantity: number;
  actualQuantity: number;
  yieldUnit: string;
  yieldPercentage: number;
  rawMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  totalBatchCost: number;
  unitCostAchieved: number;
  varianceCost: number;
  completedAt?: string;
}

// ==========================================
// 4. POS / SALES → FINANCE / DASHBOARD CONTRACT
// ==========================================
export interface SalesRevenueContract {
  date: string;
  periodLabel?: string;
  grossRevenue: number;
  discounts: number;
  refunds: number;
  netRevenue: number;
  cogsAmount: number;
  grossProfit: number;
  grossMarginPercentage?: number;
  foodCostPercentage?: number;
  serviceCharge: number;
  taxAmount: number;
  grandTotal: number;
  transactionCount: number;
  cashRevenue: number;
  qrisRevenue: number;
  edcRevenue: number;
  transferRevenue: number;
  eWalletRevenue?: number;
  dineInRevenue?: number;
  takeAwayRevenue?: number;
  deliveryRevenue?: number;
  averageTicketSize: number;
}

// ==========================================
// 5. HR PAYROLL → FINANCE OPEX CONTRACT
// ==========================================
export interface PayrollCostContract {
  periodMonth: string; // e.g. "2025-05"
  periodLabel: string; // e.g. "Mei 2025"
  totalEmployees: number;
  basicSalaryTotal: number;
  allowanceTotal: number;
  overtimeTotal: number;
  lateDeductionsTotal: number;
  kasbonDeductionsTotal: number;
  totalDeductions: number;
  grossPayroll: number;
  netPayroll: number;
  status: 'DRAFT' | 'APPROVED' | 'DISBURSED';
  disbursedAt?: string;
}

// ==========================================
// 6. STOCK MOVEMENT LEDGER CONTRACT
// ==========================================
export type StockMovementTypeContract =
  | 'PURCHASE_RECEIPT'
  | 'PRODUCTION_USAGE'
  | 'PRODUCTION_YIELD'
  | 'WASTING'
  | 'STOCK_ADJUSTMENT'
  | 'TRANSFER'
  | 'SALES_VARIANCE';

export interface StockMovementRecordContract {
  movementId: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  movementType: StockMovementTypeContract;
  quantityChange: number; // positive for IN, negative for OUT
  unit: string;
  unitCost: number;
  totalValue: number;
  referenceNumber: string;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

// ==========================================
// 7. FINANCE EXPENSE / OPEX CONTRACT
// ==========================================
export interface FinanceExpenseContract {
  periodMonth: string; // e.g. "2026-08"
  periodLabel: string;
  totalExpensesCount: number;
  totalPostedAmount: number;
  totalPendingAmount: number;
  totalTaxAmount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  departmentBreakdown: {
    department: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
}

// ==========================================
// 8. FINANCIAL PERIOD CONTROL CONTRACT
// ==========================================
export interface FinancialPeriodContract {
  periodKey: string; // e.g. "2026-08"
  periodName: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'OPEN' | 'REVIEW' | 'LOCKED' | 'CLOSED';
  isLocked: boolean;
  isClosed: boolean;
  totalRevenueRecognized: number;
  totalCogsRecognized: number;
  totalOpexRecognized: number;
  netProfitRecognized: number;
  closedAt?: string;
  closedBy?: string;
}

// ==========================================
// 9. FINANCIAL RECONCILIATION CONTRACT
// ==========================================
export type ReconciliationStatus = 'BALANCED' | 'MINOR_VARIANCE' | 'MATERIAL_VARIANCE' | 'UNRESOLVED';

export interface ReconciliationItemContract {
  domain: 'SALES_POS' | 'CASHIER_DRAWER' | 'PAYMENT_METHODS' | 'INVENTORY_COGS' | 'PAYROLL_HR' | 'EXPENSE_OPEX';
  title: string;
  sourceName: string;
  sourceTotal: number;
  financeRecognizedTotal: number;
  variance: number;
  variancePercentage: number;
  status: ReconciliationStatus;
  notes?: string;
  thresholdApplied: {
    minorMaxPercentage: number;
    materialMinPercentage: number;
  };
}

export interface FinancialReconciliationContract {
  periodKey: string;
  reconciledAt: string;
  reconciledBy: string;
  overallStatus: ReconciliationStatus;
  items: ReconciliationItemContract[];
  totalSourceRevenue: number;
  totalFinanceRevenue: number;
  totalSourceCogs: number;
  totalFinanceCogs: number;
  totalSourceOpex: number;
  totalFinanceOpex: number;
  netProfitCalculated: number;
}

