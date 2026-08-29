import { ProductionBatch, ProductionSummary } from '../types/production';

export const MOCK_PRODUCTION_BATCHES: ProductionBatch[] = [];

export const MOCK_PRODUCTION_SUMMARY: ProductionSummary = {
  totalBatchesToday: 0,
  plannedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  cancelledCount: 0,
  averageYieldPercentage: 100.0,
  totalProductionCostMonth: 0,
  totalProductionWasteCost: 0,
  criticalYieldVarianceCount: 0,
};
