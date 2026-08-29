import { OpexData, DashboardPeriod } from './types';

const emptyOpexData: OpexData = {
  totalActualOpex: 0,
  totalBudgetOpex: 0,
  totalPreviousOpex: 0,
  opexToSalesPct: 0,
  budgetAdherencePct: 100.0,
  categories: [],
  diagnosticInsights: [],
};

export const mockOpexData: Record<DashboardPeriod, OpexData> = {
  month: emptyOpexData,
  week: emptyOpexData,
  today: emptyOpexData,
  custom: emptyOpexData,
};
