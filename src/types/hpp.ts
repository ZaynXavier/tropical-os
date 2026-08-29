/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — HPP & FOOD COST TYPES
 */

import { RecipeCategory } from './recipe';
import { UnitOfMeasurement } from './inventory';

export type ProfitabilityStatus =
  | 'Sangat Menguntungkan' // Star: Food Cost <= target & Margin >= 70%
  | 'Sehat'               // Healthy: Food Cost <= target
  | 'Perlu Evaluasi'      // Needs Evaluation: Food Cost > target
  | 'Risiko Tinggi';      // High Risk: Food Cost > 40% or Gross Profit < 0

export type MenuEngineeringCategory = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
export type MenuEngineeringQuadrant = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';

export type VarianceSeverity = 'FAVORABLE' | 'WARNING' | 'UNFAVORABLE' | 'CRITICAL';

export interface MenuEngineeringItem {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  menuCategory: RecipeCategory;
  sellingPrice: number;
  hppPerPortion: number;
  foodCostPercentage: number;
  targetFoodCostPercentage: number;
  grossMarginPercentage: number;
  grossProfitPerPortion: number;
  monthlySalesVolume: number;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  quadrant: MenuEngineeringQuadrant;
  actionRecommendation: string;
}

export interface IngredientUsageVariance {
  inventoryItemId: string;
  inventoryItemSku: string;
  inventoryItemName: string;
  unit: string;
  unitCost: number;
  theoreticalUsage: number;
  actualUsage: number;
  varianceQuantity: number;
  variancePercentage: number;
  varianceCost: number;
  rootCause: string;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
}

export interface RecipeHppBreakdown {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  category: RecipeCategory;
  version: number;
  yieldQuantity: number;
  yieldUnit: UnitOfMeasurement;
  portionSize: number;
  portionUnit: UnitOfMeasurement;
  totalPortions: number;
  
  // Cost breakdown
  rawMaterialCost: number; // Sum of effective ingredient costs
  packagingCost: number; // Box, cup, cutlery
  laborOverheadCost: number; // Operating buffer
  productionLossCost: number; // Cook loss cost
  totalRecipeCost: number; // raw + pack + labor + loss
  
  // Per Portion Metrics
  rawCostPerPortion: number;
  totalHppPerPortion: number; // totalRecipeCost / totalPortions
  sellingPrice: number;
  
  // Margins
  grossProfit: number; // sellingPrice - totalHppPerPortion
  grossMarginPercentage: number; // (grossProfit / sellingPrice) * 100
  foodCostPercentage: number; // (totalHppPerPortion / sellingPrice) * 100
  targetFoodCostPercentage: number;
  targetMarginPercentage: number;
  foodCostVariancePercentage: number; // actual food cost % - target food cost %
  
  contributionMargin: number; // sellingPrice - rawCostPerPortion
  profitabilityStatus: ProfitabilityStatus;
}

export interface ConsumptionVarianceItem {
  inventoryItemId: string;
  sku: string;
  name: string;
  category: string;
  unit: UnitOfMeasurement;
  unitCost: number;
  theoreticalConsumption: number; // Based on POS sales * recipe
  actualConsumption: number; // Based on stock movements & waste
  varianceQuantity: number; // actual - theoretical
  variancePercentage: number; // (variance / theoretical) * 100
  varianceCostValue: number; // varianceQuantity * unitCost
  severity: VarianceSeverity;
  primaryDrivers: string[]; // e.g. ["Yield Rendah", "Pencatatan Waste Kurang"]
}

export interface MenuPerformanceContract {
  menuId: string;
  recipeId: string;
  recipeCode: string;
  menuName: string;
  category: RecipeCategory;
  sellingPrice: number;
  hpp: number;
  foodCostPercentage: number;
  grossMargin: number;
  grossMarginPercentage: number;
  salesQuantity: number; // e.g. Monthly sales volume from POS
  salesRevenue: number; // salesQuantity * sellingPrice
  totalCogs: number; // salesQuantity * hpp
  totalGrossProfit: number; // salesRevenue - totalCogs
  popularityScore: number; // Volume percentile 0 - 100
  profitabilityScore: number; // Margin percentile 0 - 100
  classification: MenuEngineeringCategory;
  profitabilityStatus: ProfitabilityStatus;
}

export interface HppSummaryKpi {
  totalActiveRecipes: number;
  averageFoodCostPercentage: number;
  targetFoodCostPercentage: number;
  recipesAboveTargetCount: number;
  averageGrossMarginPercentage: number;
  totalMonthlyTheoreticalCogs: number;
  totalMonthlyActualCogs: number;
  cogsVarianceAmount: number;
  cogsVariancePercentage: number;
  highRiskMenuCount: number;
  highestCostIngredient: {
    name: string;
    totalSpendCost: number;
    percentageOfTotalSpend: number;
  };
}

export interface HppAnalyticsData {
  categoryBreakdown: {
    category: RecipeCategory;
    recipeCount: number;
    averageFoodCost: number;
    averageMargin: number;
    totalRevenue: number;
    totalCogs: number;
  }[];
  topHppRecipes: {
    recipeName: string;
    category: RecipeCategory;
    hpp: number;
    sellingPrice: number;
    foodCostPercentage: number;
  }[];
  topMarginRecipes: {
    recipeName: string;
    category: RecipeCategory;
    grossMargin: number;
    grossMarginPercentage: number;
    foodCostPercentage: number;
  }[];
  costDrivers: {
    ingredientName: string;
    category: string;
    monthlyCost: number;
    impactPercentage: number;
  }[];
}
