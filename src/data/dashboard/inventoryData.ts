import { InventoryData, DashboardPeriod } from './types';

const emptyInventoryData: InventoryData = {
  overallAccuracyPct: 100.0,
  fefoCompliancePct: 100.0,
  totalInventoryValue: 0,
  deadStockValue: 0,
  slowMovingValue: 0,
  fastMovingValue: 0,
  totalSkus: 32,
  stockOpnameDiscrepanciesCount: 0,
  stockVarianceRp: 0,
  problematicItems: [],
  diagnosticInsights: [],
};

export const mockInventoryData: Record<DashboardPeriod, InventoryData> = {
  month: emptyInventoryData,
  week: emptyInventoryData,
  today: emptyInventoryData,
  custom: emptyInventoryData,
};
