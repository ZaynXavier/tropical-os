import { MenuPerformanceData, DashboardPeriod } from './types';

const emptyMenuPerformance: MenuPerformanceData = {
  topSellers: [],
  bottomSellers: [],
  menuMatrixCounts: {
    stars: 0,
    plowhorses: 0,
    puzzles: 0,
    dogs: 0,
  },
  categoryMix: [],
  beverageAttachRatePct: 0,
  dessertAttachRatePct: 0,
  addOnAttachRatePct: 0,
  diagnosticInsights: [],
};

export const mockMenuPerformance: Record<DashboardPeriod, MenuPerformanceData> = {
  month: emptyMenuPerformance,
  week: emptyMenuPerformance,
  today: emptyMenuPerformance,
  custom: emptyMenuPerformance,
};
