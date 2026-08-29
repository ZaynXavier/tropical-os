/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — PRODUCTION & BATCH MANAGEMENT TYPES
 */

import { UnitOfMeasurement } from './inventory';

export type ProductionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ProductionType =
  | 'BATCH_PREP'
  | 'PORTION_PREP'
  | 'SAUCE_MAKING'
  | 'CENTRAL_KITCHEN'
  | 'DAILY_MISE_EN_PLACE'
  | 'BUTCHERY_PREP'
  | 'BAKERY_BATCH'
  | 'BEVERAGE_SYRUP'
  | 'COOK_AND_CHILL';

export type YieldStatus = 'OPTIMAL' | 'BELOW_TARGET' | 'EXCESS' | 'CRITICAL_VARIANCE';

export type RecipeDeviationSeverity = 'WITHIN_STANDARD' | 'MINOR_DEVIATION' | 'MAJOR_DEVIATION';

export interface ProductionIngredientUsage {
  inventoryItemId: string;
  inventoryItemSku: string;
  inventoryItemName: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: UnitOfMeasurement;
  unitCost: number;
  totalCost: number;
  varianceQuantity: number; // actual - expected
  variancePercentage: number; // (actual - expected) / expected * 100
  batchNumberUsed?: string;
  notes?: string;
}

export interface ProductionWasteLog {
  id: string;
  productionId: string;
  recipeId: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  wasteQuantity: number;
  wasteUnit: UnitOfMeasurement;
  estimatedCost: number;
  reasonCategory:
    | 'Preparation Loss'
    | 'Cooking Loss'
    | 'Spoilage'
    | 'Overproduction'
    | 'Human Error'
    | 'Quality Rejection'
    | 'Burned / Overcooked'
    | 'Expired'
    | 'Other';
  notes: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
}

export interface RecipeDeviationLog {
  id: string;
  productionId: string;
  recipeId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: UnitOfMeasurement;
  varianceQuantity: number;
  variancePercentage: number;
  severity: RecipeDeviationSeverity;
  reason: string;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
}

export interface ProductionBatch {
  id: string;
  productionNumber: string; // e.g. PROD-20260820-001
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  recipeVersion: number;
  productionDate: string; // YYYY-MM-DD
  productionType: ProductionType;
  stationId?: string;
  stationName?: string;
  targetDepartment?: 'Kitchen' | 'Bar' | 'Pastry' | 'Butchery' | 'Central Kitchen';
  plannedBatchCount: number; // e.g. 2 batches
  plannedQuantity: number; // Planned output yield
  yieldUnit: UnitOfMeasurement;
  theoreticalYield: number; // Planned batch output
  actualYield: number; // Actual measured output after cooking
  yieldVariance: number; // actualYield - theoreticalYield
  yieldPercentage: number; // (actualYield / theoreticalYield) * 100
  yieldStatus: YieldStatus;
  status: ProductionStatus;
  
  // Cost tracking
  theoreticalCost: number; // Total planned ingredient cost
  actualCost: number; // Total actual ingredient cost
  theoreticalUnitHpp: number; // theoreticalCost / theoreticalYield
  actualUnitHpp: number; // actualCost / actualYield
  costVariance: number; // actualCost - theoreticalCost
  
  // Ingredients & Details
  ingredients: ProductionIngredientUsage[];
  wasteLogs: ProductionWasteLog[];
  deviations: RecipeDeviationLog[];
  
  // Resulting Inventory Batch (if stored as semi-finished good)
  generatedBatchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;

  notes?: string;
  
  // Audit Trail
  createdBy: string;
  createdByName: string;
  createdAt: string;
  startedBy?: string;
  startedByName?: string;
  startedAt?: string;
  completedBy?: string;
  completedByName?: string;
  completedAt?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface ProductionFilterParams {
  status?: ProductionStatus | 'ALL';
  productionType?: ProductionType | 'ALL';
  recipeId?: string | 'ALL';
  stationId?: string | 'ALL';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  yieldStatus?: YieldStatus | 'ALL';
}

export interface ProductionSummary {
  totalBatchesToday: number;
  plannedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  averageYieldPercentage: number;
  totalProductionCostMonth: number;
  totalProductionWasteCost: number;
  criticalYieldVarianceCount: number;
}
