/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — POS, SALES & DAILY REVENUE TYPES
 * Source of Truth: PRD.md, RBAC.md & Phase 3.8 Technical Architecture
 */

import { RecipeCategory } from './recipe';

export type SalesTransactionStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'CONFIRMED'
  | 'PAID'
  | 'COMPLETED'
  | 'VOID'
  | 'REFUNDED'
  | 'PARTIAL_REFUND'
  | 'CANCELLED';

export type OrderType =
  | 'DINE_IN'
  | 'TAKE_AWAY'
  | 'DELIVERY'
  | 'EVENT'
  | 'CATERING'
  | 'OTHER';

export type PaymentMethodType =
  | 'CASH'
  | 'QRIS'
  | 'EDC'
  | 'BANK_TRANSFER'
  | 'E_WALLET'
  | 'OTHER';

export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'FAILED';

export type RecipeMappingStatus = 'MAPPED' | 'NO_RECIPE_MAPPING';

export interface TransactionPayment {
  paymentId?: string;
  transactionId?: string;
  paymentMethod: PaymentMethodType;
  amount: number;
  paidAt?: string;
  referenceNumber?: string;
  edcBank?: string; // e.g. 'BCA', 'Mandiri', 'BRI'
  eWalletProvider?: string; // e.g. 'GoPay', 'OVO', 'ShopeePay'
  cashierId?: string;
  status?: 'SUCCESS' | 'PENDING' | 'REFUNDED' | 'FAILED';
  notes?: string;
}

export interface DiscountRecord {
  discountId: string;
  reason: string;
  type?: 'PERCENTAGE' | 'FIXED' | 'ITEM_LEVEL' | 'PROMOTIONAL';
  percentage?: number;
  amount: number;
  actorId?: string;
  actorName?: string;
  appliedAt: string;
}

export interface RefundRecord {
  refundId: string;
  transactionId: string;
  amount: number;
  reason: string;
  refundedBy?: string;
  refundedByName?: string;
  refundedAt: string;
  paymentMethod?: PaymentMethodType;
}

export interface SalesAuditTrailRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorId?: string;
  role: string;
  action:
    | 'CREATE'
    | 'OPEN'
    | 'CONFIRM'
    | 'PAYMENT'
    | 'COMPLETE'
    | 'VOID'
    | 'REFUND'
    | 'DISCOUNT_OVERRIDE'
    | 'SETTLEMENT_SUBMIT'
    | 'SETTLEMENT_VERIFY'
    | 'SETTLEMENT_REJECT';
  entityId: string;
  previousState?: string;
  newState?: string;
  amount?: number;
  note?: string;
}

export interface SalesTransactionItem {
  itemId: string;
  productId: string;
  productName: string;
  recipeId?: string;
  category: RecipeCategory | string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  hppPerUnit: number;
  totalHpp: number;
  grossProfit: number;
  grossMarginPercentage: number;
  recipeMappingStatus: RecipeMappingStatus;
  notes?: string;
}

export interface SalesTransaction {
  id: string;
  transactionNumber: string; // e.g. "TRX-20260820-001"
  businessDate: string; // 'YYYY-MM-DD'
  transactionDate: string; // 'YYYY-MM-DD'
  transactionTime: string; // 'HH:mm:ss'
  cashierId: string;
  cashierName: string;
  shiftId: string;
  shiftName: string; // 'Shift Pagi', 'Shift Siang/Malam', 'Event Khusus'
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  orderType: OrderType;
  items: SalesTransactionItem[];
  subtotal: number;
  discountAmount: number;
  discounts?: DiscountRecord[];
  serviceCharge: number; // typically 5%
  taxAmount: number; // PB1 typically 10%
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethods: TransactionPayment[];
  transactionStatus: SalesTransactionStatus;
  
  // Void Audit Trail
  voidReason?: string;
  voidedBy?: string;
  voidedByName?: string;
  voidedAt?: string;

  // Refund Audit Trail
  refundReason?: string;
  refundAmount?: number;
  refundedBy?: string;
  refundedByName?: string;
  refundedAt?: string;
  refunds?: RefundRecord[];

  auditTrail?: SalesAuditTrailRecord[];

  notes?: string;
  source: 'MOCK_POS' | 'OLSERA' | 'MOKA' | 'MAJOO' | 'PAWOON' | 'MANUAL_IMPORT' | 'CUSTOM_API';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface DailySalesSummary {
  date: string; // 'YYYY-MM-DD'
  grossRevenue: number;
  discountAmount: number;
  refundAmount: number;
  netRevenue: number;
  taxAmount: number;
  serviceCharge: number;
  transactionCount: number;
  averageTransactionValue: number;
  totalItemsSold: number;
  averageItemsPerTransaction: number;

  // Payment Breakdown
  cashRevenue: number;
  qrisRevenue: number;
  edcRevenue: number;
  bankTransferRevenue: number;
  eWalletRevenue: number;
  otherPaymentRevenue: number;

  // Order Type Breakdown
  dineInRevenue: number;
  takeAwayRevenue: number;
  deliveryRevenue: number;
  eventRevenue: number;
  cateringRevenue: number;
  otherOrderRevenue: number;

  // Profitability
  estimatedHpp: number;
  grossProfit: number;
  grossMarginPercentage: number;
  blendedFoodCostPercentage: number;
}

export type CashierClosingStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REVISION_REQUIRED';
export type CashVarianceStatus = 'BALANCED' | 'SHORT' | 'OVER';

export interface CashierDailyClosing {
  id: string;
  closingNumber?: string;
  businessDate: string;
  cashierId: string;
  cashierName: string;
  shiftId: string;
  shiftName: string;
  openingFloat?: number;
  cashSales?: number;
  cashRefunds?: number;
  cashPayout?: number;
  expectedCash: number;
  actualCash: number;
  cashVariance: number; // actualCash - expectedCash
  varianceStatus: CashVarianceStatus;
  qrisAmount: number;
  edcAmount: number;
  bankTransferAmount: number;
  eWalletAmount: number;
  totalTransactions: number;
  totalRevenue: number;
  notes?: string;
  status: CashierClosingStatus;
  submittedAt?: string;
  submittedBy?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  auditTrail?: SalesAuditTrailRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface TheoreticalIngredientContribution {
  productId: string;
  productName: string;
  quantitySold: number;
  consumptionPerUnit: number;
  totalConsumption: number;
}

export interface TheoreticalIngredientUsage {
  ingredientId: string;
  ingredientSku: string;
  ingredientName: string;
  category: string;
  unit: string;
  unitCost: number;
  theoreticalUsageQuantity: number;
  theoreticalCost: number;
  actualUsageQuantity?: number;
  actualCost?: number;
  varianceQuantity?: number;
  variancePercentage?: number;
  varianceCost?: number;
  varianceSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  contributingProducts: TheoreticalIngredientContribution[];
}

export interface ProductSalesPerformance {
  productId: string;
  productName: string;
  recipeId?: string;
  category: string;
  quantitySold: number;
  grossRevenue: number;
  discountAmount: number;
  netRevenue: number;
  unitHpp: number;
  totalHpp: number;
  grossProfit: number;
  grossMarginPercentage: number;
  foodCostPercentage: number;
  recipeMappingStatus: RecipeMappingStatus;
  salesContributionPercentage: number;
  rank: number;
}

export interface ShiftSalesPerformance {
  shiftId: string;
  shiftName: string;
  timeRange: string;
  transactionCount: number;
  totalItemsSold: number;
  grossRevenue: number;
  netRevenue: number;
  averageTransactionValue: number;
  estimatedHpp: number;
  grossProfit: number;
  grossMarginPercentage: number;
  cashierNames: string[];
}

export interface CashierSalesPerformance {
  cashierId: string;
  cashierName: string;
  totalTransactions: number;
  totalItemsSold: number;
  grossRevenue: number;
  netRevenue: number;
  averageTransactionValue: number;
  refundCount: number;
  refundAmount: number;
  voidCount: number;
  paymentBreakdown: {
    cash: number;
    qris: number;
    edc: number;
    bankTransfer: number;
    eWallet: number;
  };
}

export interface PaymentMethodAnalysis {
  paymentMethod: PaymentMethodType;
  label: string;
  transactionCount: number;
  totalRevenue: number;
  percentageOfTotal: number;
}

export type SalesPeriodFilter =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface SalesFilterOptions {
  period: SalesPeriodFilter;
  startDate?: string;
  endDate?: string;
  shiftId?: string | 'ALL';
  cashierId?: string | 'ALL';
  orderType?: OrderType | 'ALL';
  paymentMethod?: PaymentMethodType | 'ALL';
  transactionStatus?: SalesTransactionStatus | 'ALL';
  searchQuery?: string;
}

export interface SalesLaborAnalytics {
  period: string;
  totalRevenue: number;
  totalPayrollCost: number;
  laborCostPercentage: number;
  totalOvertimeCost: number;
  overtimePercentage: number;
  totalLaborHours: number;
  revenuePerLaborHour: number;
  status: 'OPTIMAL' | 'MODERATE' | 'OVER_BUDGET';
}

export interface SalesOperationsCorrelation {
  period: string;
  salesPressureLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
  highSalesDayCount: number;
  operationalIssuesCount: number;
  wastingTotalCost: number;
  checklistComplianceRate: number;
  correlationInsights: string[];
}

// -------------------------------------------------------------
// POS INTEGRATION CONTRACT & ADAPTER ABSTRACTIONS
// -------------------------------------------------------------
export type PosProviderType =
  | 'MOCK_POS'
  | 'OLSERA'
  | 'MOKA'
  | 'MAJOO'
  | 'PAWOON'
  | 'CUSTOM_CSV'
  | 'REST_API';

export interface NormalizedPosTransactionPayload {
  externalId: string;
  externalTransactionNumber: string;
  timestamp: string;
  cashierName: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  items: {
    externalSku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  grandTotal: number;
  payments: {
    method: PaymentMethodType;
    amount: number;
    reference?: string;
  }[];
  status: 'SUCCESS' | 'CANCELLED' | 'REFUNDED';
}

export interface PosProviderAdapter {
  providerName: PosProviderType;
  version: string;
  normalizeTransaction(rawPayload: any): NormalizedPosTransactionPayload;
  validateTransaction(payload: NormalizedPosTransactionPayload): { isValid: boolean; errors?: string[] };
  importTransactions(rawData: any[]): Promise<{ importedCount: number; failedCount: number; errors?: string[] }>;
}
