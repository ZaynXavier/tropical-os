import { FoodCostData, DashboardPeriod } from './types';

const emptyFoodCostData: FoodCostData = {
  openingStockValue: 0,
  purchasesValue: 0,
  transfersInValue: 0,
  transfersOutValue: 0,
  closingStockValue: 0,
  actualFoodCostRp: 0,
  actualFoodCostPct: 0,
  theoreticalFoodCostPct: 0,
  variancePct: 0,
  varianceCostRp: 0,
  wasteCostRp: 0,
  spoilageCostRp: 0,
  complimentaryCostRp: 0,
  staffMealCostRp: 0,
  historicalTrend: [],
  topVarianceIngredients: [],
  diagnosticInsights: [],
};

export const mockFoodCostData: Record<DashboardPeriod, FoodCostData> = {
  month: emptyFoodCostData,
  week: emptyFoodCostData,
  today: emptyFoodCostData,
  custom: emptyFoodCostData,
};
