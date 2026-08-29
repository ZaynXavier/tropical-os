/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — RECIPE TYPES & DATA CONTRACTS
 * Core types for Master Recipes, Recipe Ingredients, Versioning, and Loss calculations.
 */

import { UnitOfMeasurement } from './inventory';

export type RecipeCategory =
  | 'Main Course'
  | 'Appetizer'
  | 'Dessert'
  | 'Beverage'
  | 'Sauce / Semi-Finished'
  | 'Bakery'
  | 'Bakery / Pastry'
  | 'Side Dish'
  | 'Snack'
  | 'Soup / Broth'
  | 'Marinade / Seasoning'
  | 'Other';

export type RecipeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CHEF_SPECIAL';

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  inventoryItemId: string;
  inventoryItemSku?: string;
  inventoryItemName?: string;
  quantity: number; // Base required quantity per batch/recipe
  unit: UnitOfMeasurement;
  preparationLossPercentage: number; // e.g. 5% peeling loss
  cookingLossPercentage: number; // e.g. 10% shrinkage / boiling loss
  totalLossPercentage: number; // prepLoss + cookLoss
  effectiveQuantity: number; // quantity * (1 + totalLossPercentage / 100)
  unitCost: number; // Cost per unit from inventory weighted average
  totalCost: number; // effectiveQuantity * unitCost
  notes?: string;
  isKeyIngredient?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeInstructionStep {
  stepNumber: number;
  title: string;
  description: string;
  timeMinutes?: number;
  criticalPoints?: string;
  temperatureCelsius?: number;
}

export interface RecipeVersionHistory {
  id: string;
  recipeId: string;
  version: number;
  recipeCode: string;
  recipeName: string;
  snapshotDate: string;
  changedBy: string;
  changedByName: string;
  changeReason: string;
  sellingPrice: number;
  calculatedHpp: number;
  foodCostPercentage: number;
  yieldQuantity: number;
  yieldUnit: UnitOfMeasurement;
  ingredientsSnapshot: RecipeIngredient[];
  status: RecipeStatus;
}

export interface Recipe {
  id: string;
  recipeCode: string; // e.g. RCP-STEAK-001
  recipeName: string;
  menuCategory: RecipeCategory;
  description: string;
  status: RecipeStatus;
  version: number;
  sellingPrice: number; // Retail selling price on POS
  targetFoodCostPercentage: number; // Target e.g. 30%
  targetMarginPercentage: number; // Target e.g. 70%
  yieldQuantity: number; // Output of 1 batch (e.g. 1 portion or 10 liters)
  yieldUnit: UnitOfMeasurement;
  portionSize: number; // Standard serving size (e.g. 1 portion = 250 gram)
  portionUnit: UnitOfMeasurement;
  totalPortions: number; // yieldQuantity / portionSize (e.g. 10 portions)
  preparationTimeMinutes: number;
  cookingTimeMinutes: number;
  totalTimeMinutes: number;
  difficulty?: RecipeDifficulty;
  stationId?: string; // e.g. "Kitchen Hot Line", "Kitchen Prep", "Bar Counter"
  stationName?: string;
  packagingCost: number; // Box, wrapper, takeaway cutlery per portion
  laborOverheadCost: number; // Fixed operational buffer per portion
  ingredients: RecipeIngredient[];
  instructions?: RecipeInstructionStep[];
  imageUrl?: string;
  notes?: string;
  // Audit
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  archivedBy?: string;
  archivedByName?: string;
  archivedAt?: string;
}

export interface RecipeFilterParams {
  category?: RecipeCategory | 'ALL';
  status?: RecipeStatus | 'ALL';
  stationId?: string | 'ALL';
  searchQuery?: string;
  foodCostRange?: 'ALL' | 'UNDER_TARGET' | 'ON_TARGET' | 'OVER_TARGET';
}
