import { ProfitabilityData, ExecutiveKPI, DashboardPeriod } from './types';

const emptyProfitability: ProfitabilityData = {
  grossRevenue: 0,
  discountAndPromotion: 0,
  netRevenue: 0,
  cogsAmount: 0,
  cogsPercentage: 0,
  grossProfitAmount: 0,
  grossProfitPercentage: 0,
  laborExpense: 0,
  operationalExpense: 0,
  marketingExpense: 0,
  maintenanceExpense: 0,
  administrativeExpense: 0,
  totalOperatingExpenses: 0,
  operatingProfitAmount: 0,
  operatingProfitPercentage: 0,
  depreciationAndAmortization: 0,
  taxAndInterest: 0,
  ebitdaAmount: 0,
  ebitdaPercentage: 0,
  netProfitAmount: 0,
  netProfitPercentage: 0,
  breakEvenPointMonthlyRp: 0,
  waterfallBreakdown: [],
};

export const mockProfitabilityData: Record<DashboardPeriod, ProfitabilityData> = {
  month: emptyProfitability,
  week: emptyProfitability,
  today: emptyProfitability,
  custom: emptyProfitability,
};

const emptyKPI: ExecutiveKPI = {
  totalSales: 0,
  salesTarget: 0,
  achievementPercentage: 0,
  salesVsLastMonth: {
    value: 0,
    percentage: 0,
    isPositive: true,
    comparisonLabel: 'vs Bulan Lalu (Rp 0)',
  },
  salesVsLastYear: {
    value: 0,
    percentage: 0,
    isPositive: true,
    comparisonLabel: 'vs Tahun Lalu (Rp 0)',
  },
  guestCount: 0,
  transactionCount: 0,
  averageCheck: 0,
  foodCostPercentage: 0,
  laborCostPercentage: 0,
  grossProfit: 0,
  grossProfitMargin: 0,
  operatingProfit: 0,
  operatingProfitMargin: 0,
  netProfit: 0,
  netProfitMargin: 0,
  ebitda: 0,
  ebitdaMargin: 0,
};

export const mockExecutiveKPI: Record<DashboardPeriod, ExecutiveKPI> = {
  month: emptyKPI,
  week: emptyKPI,
  today: emptyKPI,
  custom: emptyKPI,
};
