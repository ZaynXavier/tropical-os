import { SalesPerformanceData, DashboardPeriod } from './types';

const emptySalesData: SalesPerformanceData = {
  summary: {
    totalSales: 0,
    targetSales: 0,
    achievementRate: 0,
    growthVsLastMonthPct: 0,
    growthVsLastYearPct: 0,
    totalTransactions: 0,
    totalGuests: 0,
    averageCheck: 0,
    averagePaxPerTable: 0,
  },
  dailyTrend: [],
  hourlyTrend: [],
  channelBreakdown: [],
  shiftBreakdown: [],
  diagnosticInsights: [],
};

export const mockSalesPerformance: Record<DashboardPeriod, SalesPerformanceData> = {
  month: emptySalesData,
  week: emptySalesData,
  today: emptySalesData,
  custom: emptySalesData,
};
