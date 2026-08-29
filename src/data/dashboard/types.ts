export type DashboardPeriod = 'today' | 'week' | 'month' | 'custom';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export interface MetricDelta {
  value: number;
  percentage: number;
  isPositive: boolean;
  comparisonLabel: string;
}

export interface ExecutiveKPI {
  totalSales: number;
  salesTarget: number;
  achievementPercentage: number;
  salesVsLastMonth: MetricDelta;
  salesVsLastYear: MetricDelta;
  guestCount: number;
  transactionCount: number;
  averageCheck: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingProfit: number;
  operatingProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  ebitda: number;
  ebitdaMargin: number;
}

export interface SalesChannelBreakdown {
  channel: 'Dine In' | 'Delivery (GoFood/Grab/Shopee)' | 'Take Away';
  revenue: number;
  percentage: number;
  transactions: number;
  averageCheck: number;
}

export interface ShiftSalesBreakdown {
  shift: 'Shift Pagi (10:00 - 16:00)' | 'Shift Siang/Malam (16:00 - 22:00)';
  revenue: number;
  percentage: number;
  guestCount: number;
  avgPrepTimeMinutes: number;
}

export interface HourlySalesPoint {
  hour: string;
  revenue: number;
  transactions: number;
  isPeak: boolean;
}

export interface DailySalesPoint {
  date: string;
  dayName: string;
  actualSales: number;
  targetSales: number;
  guestCount: number;
}

export interface SalesDiagnosticInsight {
  title: string;
  category: 'TRAFFIC' | 'BASKET_SIZE' | 'PRODUCT_MIX' | 'CHANNELS';
  description: string;
  impactRp: number;
  suggestedAction: string;
  confidenceScore: number;
}

export interface SalesPerformanceData {
  summary: {
    totalSales: number;
    targetSales: number;
    achievementRate: number;
    growthVsLastMonthPct: number;
    growthVsLastYearPct: number;
    totalTransactions: number;
    totalGuests: number;
    averageCheck: number;
    averagePaxPerTable: number;
  };
  dailyTrend: DailySalesPoint[];
  hourlyTrend: HourlySalesPoint[];
  channelBreakdown: SalesChannelBreakdown[];
  shiftBreakdown: ShiftSalesBreakdown[];
  diagnosticInsights: SalesDiagnosticInsight[];
}

export type MenuCategory = 'Makanan Utama' | 'Minuman' | 'Camilan & Appetizer' | 'Dessert';
export type MenuEngineeringQuadrant = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';

export interface MenuItemPerformance {
  rank: number;
  id: string;
  name: string;
  category: MenuCategory;
  portionPrice: number;
  portionCostHpp: number;
  grossMarginPct: number;
  qtySold: number;
  totalRevenue: number;
  totalProfit: number;
  salesContributionPct: number;
  quadrant: MenuEngineeringQuadrant;
  recommendation: string;
}

export interface MenuPerformanceData {
  topSellers: MenuItemPerformance[];
  bottomSellers: MenuItemPerformance[];
  menuMatrixCounts: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  categoryMix: {
    category: MenuCategory;
    revenue: number;
    percentage: number;
    qtySold: number;
  }[];
  beverageAttachRatePct: number;
  dessertAttachRatePct: number;
  addOnAttachRatePct: number;
  diagnosticInsights: {
    title: string;
    description: string;
    affectedMenuItems: string[];
    actionPlan: string;
  }[];
}

export interface IngredientVarianceItem {
  id: string;
  name: string;
  category: 'Daging & Protein' | 'Minyak & Bumbu' | 'Sayuran & Segar' | 'Dairy & Bar';
  unit: string;
  theoreticalQty: number;
  actualQty: number;
  varianceQty: number;
  varianceCostRp: number;
  variancePct: number;
  primaryReason: string;
}

export interface FoodCostData {
  openingStockValue: number;
  purchasesValue: number;
  transfersInValue: number;
  transfersOutValue: number;
  closingStockValue: number;
  actualFoodCostRp: number;
  actualFoodCostPct: number;
  theoreticalFoodCostPct: number;
  variancePct: number;
  varianceCostRp: number;
  wasteCostRp: number;
  spoilageCostRp: number;
  complimentaryCostRp: number;
  staffMealCostRp: number;
  historicalTrend: {
    period: string;
    actualPct: number;
    theoreticalPct: number;
    targetPct: number;
  }[];
  topVarianceIngredients: IngredientVarianceItem[];
  diagnosticInsights: {
    rootCause: string;
    impactRp: number;
    preventiveAction: string;
    responsiblePerson: string;
  }[];
}

export interface InventoryItemStatus {
  id: string;
  code: string;
  name: string;
  category: string;
  stockQty: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  classification: 'FAST_MOVING' | 'SLOW_MOVING' | 'DEAD_STOCK';
  daysOfInventory: number;
  fefoCompliant: boolean;
  expiryDate: string;
}

export interface InventoryData {
  overallAccuracyPct: number;
  fefoCompliancePct: number;
  totalInventoryValue: number;
  deadStockValue: number;
  slowMovingValue: number;
  fastMovingValue: number;
  totalSkus: number;
  stockOpnameDiscrepanciesCount: number;
  stockVarianceRp: number;
  problematicItems: InventoryItemStatus[];
  diagnosticInsights: {
    finding: string;
    impact: string;
    correctiveAction: string;
  }[];
}

export interface LaborData {
  totalEmployees: number;
  activeOnDutyToday: number;
  laborCostRp: number;
  laborCostPct: number;
  laborCostTargetPct: number;
  salesPerEmployeeRp: number;
  salesPerLaborHourRp: number;
  totalOvertimeHours: number;
  overtimeCostRp: number;
  attendanceRatePct: number;
  lateArrivalsCount: number;
  turnoverRatePct: number;
  staffingStatus: 'BALANCED' | 'OVERSTAFF' | 'UNDERSTAFF';
  staffingStatusNote: string;
  productivityByShift: {
    shift: string;
    staffCount: number;
    salesGeneratedRp: number;
    efficiencyRating: 'EXCELLENT' | 'GOOD' | 'NEEDS_OPTIMIZATION';
  }[];
  departmentHeadcount: {
    department: string;
    headcount: number;
    laborCostRp: number;
  }[];
}

export interface OpexCategoryItem {
  id: string;
  categoryName: string;
  actualAmount: number;
  budgetAmount: number;
  previousPeriodAmount: number;
  variancePercentage: number;
  status: 'NORMAL' | 'OVER_BUDGET' | 'SAVING';
  notes: string;
}

export interface OpexData {
  totalActualOpex: number;
  totalBudgetOpex: number;
  totalPreviousOpex: number;
  opexToSalesPct: number;
  budgetAdherencePct: number;
  categories: OpexCategoryItem[];
  diagnosticInsights: {
    category: string;
    issue: string;
    recommendation: string;
  }[];
}

export interface CustomerExperienceData {
  googleRating: number;
  totalGoogleReviews: number;
  newReviewsThisMonth: number;
  npsScore: number;
  averageTableWaitTimeMin: number;
  averageServingSpeedMin: number;
  totalComplaintsCount: number;
  totalVoidAmountRp: number;
  totalRefundAmountRp: number;
  voidTransactionCount: number;
  complaintBreakdown: {
    category: string;
    count: number;
    percentage: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  }[];
  recentFeedback: {
    guestName: string;
    rating: number;
    channel: 'Google Maps' | 'WhatsApp Hotline' | 'Direct Feedback';
    comment: string;
    date: string;
    status: 'FOLLOWED_UP' | 'PENDING';
  }[];
  diagnosticInsights: {
    alert: string;
    rootCause: string;
    sopReference: string;
    suggestedResolution: string;
  }[];
}

export interface QualityPeopleData {
  foodSafetyAuditScore: number;
  hygieneSanitationScore: number;
  mysteryShopperScore: number;
  internalAuditScore: number;
  serviceQualityScore: number;
  overallAuditRating: 'EXCELLENT' | 'GOOD' | 'ATTENTION' | 'CRITICAL';
  trainingHoursTotal: number;
  coachingSessionsCompleted: number;
  disciplinaryCasesCount: number;
  promotionsCount: number;
  recruitmentInProgress: number;
  resignationsCount: number;
  turnoverRatePct: number;
  criticalQualityCheckpoints: {
    checkpoint: string;
    department: string;
    scorePct: number;
    status: 'PASSED' | 'WARNING' | 'FAILED';
  }[];
}

export interface ProfitabilityData {
  grossRevenue: number;
  discountAndPromotion: number;
  netRevenue: number;
  cogsAmount: number;
  cogsPercentage: number;
  grossProfitAmount: number;
  grossProfitPercentage: number;
  laborExpense: number;
  operationalExpense: number;
  marketingExpense: number;
  maintenanceExpense: number;
  administrativeExpense: number;
  totalOperatingExpenses: number;
  operatingProfitAmount: number;
  operatingProfitPercentage: number;
  depreciationAndAmortization: number;
  taxAndInterest: number;
  ebitdaAmount: number;
  ebitdaPercentage: number;
  netProfitAmount: number;
  netProfitPercentage: number;
  breakEvenPointMonthlyRp: number;
  waterfallBreakdown: {
    stepName: string;
    amount: number;
    isReduction: boolean;
    remainingAmount: number;
    percentageOfRevenue: number;
  }[];
}

export type IssuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ManagementIssue {
  id: string;
  title: string;
  dimension: 'SALES' | 'COGS' | 'INVENTORY' | 'LABOR' | 'OPEX' | 'CX' | 'QUALITY' | 'PEOPLE' | 'PROFIT';
  priority: IssuePriority;
  impact: string;
  impactRp?: number;
  possibleRootCause: string;
  recommendedAction: string;
  responsiblePerson: string;
  responsibleRole: string;
  deadline: string;
  status: IssueStatus;
  createdAt: string;
  progressPercentage: number;
}

export interface SupervisorOperationalData {
  shiftName: string;
  shiftHours: string;
  onDutyLead: string;
  activeTablesCount: number;
  totalTablesCapacity: number;
  occupancyRatePct: number;
  liveKitchenOrdersCount: number;
  kitchenAvgPrepMinutes: number;
  liveBarOrdersCount: number;
  barAvgPrepMinutes: number;
  checklistProgress: {
    department: 'Kitchen' | 'Bar' | 'Service' | 'Cleaning';
    completedCount: number;
    totalCount: number;
    percentage: number;
    status: 'ON_TRACK' | 'PENDING' | 'OVERDUE';
  }[];
  todayWastingSummary: {
    itemsCount: number;
    totalEstimatedLossRp: number;
    urgentReviewNeeded: boolean;
  };
  attendanceSummary: {
    present: number;
    totalExpected: number;
    onBreak: number;
    late: number;
  };
  cashierHandoverStatus: {
    isOpeningSettled: boolean;
    floatCashAmount: number;
    currentTurnoverEstimate: number;
    lastReconciliationTime: string;
  };
}
