/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — RECIPE SERVICE
 * Core service layer managing Master Recipes, Ingredients, Recipe Versioning,
 * and calculations linked directly to inventory master data.
 */

import { Recipe, RecipeFilterParams, RecipeIngredient, RecipeVersionHistory } from '../types/recipe';
import { MOCK_RECIPES, MOCK_RECIPE_VERSIONS } from '../data/mockRecipes';
import { inventoryService } from './inventoryService';
import { RecipeHppBreakdown } from '../types/hpp';
import { RecipeCostContract } from '../types/contracts';

const STORAGE_KEY_RECIPES = 'tropicalos_master_recipes';
const STORAGE_KEY_VERSIONS = 'tropicalos_recipe_versions';

class RecipeService {
  private getStorageRecipes(): Recipe[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECIPES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(MOCK_RECIPES));
        return MOCK_RECIPES;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : MOCK_RECIPES;
    } catch (e) {
      console.error('[RecipeService] Error reading localStorage:', e);
      return MOCK_RECIPES;
    }
  }

  private saveStorageRecipes(recipes: Recipe[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('[RecipeService] Error saving recipes to localStorage:', e);
    }
  }

  private getStorageVersions(): RecipeVersionHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(MOCK_RECIPE_VERSIONS));
        return MOCK_RECIPE_VERSIONS;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : MOCK_RECIPE_VERSIONS;
    } catch (e) {
      console.error('[RecipeService] Error reading versions localStorage:', e);
      return MOCK_RECIPE_VERSIONS;
    }
  }

  private saveStorageVersions(versions: RecipeVersionHistory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.error('[RecipeService] Error saving versions to localStorage:', e);
    }
  }

  /**
   * Recalculate ingredient effective quantities and total costs using latest inventory unit costs
   */
  public async enrichIngredientsWithInventory(ingredients: RecipeIngredient[]): Promise<RecipeIngredient[]> {
    if (!Array.isArray(ingredients)) return [];

    const inventoryItems = await inventoryService.getInventoryItems();
    const invMap = new Map(inventoryItems.map((item) => [item.id, item]));

    return ingredients.map((ing) => {
      const matchedInv = invMap.get(ing.inventoryItemId);
      const unitCost = matchedInv ? (matchedInv.averageCost || matchedInv.lastPurchaseCost || 0) : (ing.unitCost || 0);
      const prepLoss = Math.max(0, Number(ing.preparationLossPercentage) || 0);
      const cookLoss = Math.max(0, Number(ing.cookingLossPercentage) || 0);
      const totalLossPercentage = prepLoss + cookLoss;
      
      const baseQty = Math.max(0, Number(ing.quantity) || 0);
      // Effective quantity includes yield loss: Base * (1 + totalLoss / 100)
      const effectiveQuantity = Number((baseQty * (1 + totalLossPercentage / 100)).toFixed(4));
      const totalCost = Math.round(effectiveQuantity * unitCost);

      return {
        ...ing,
        inventoryItemSku: matchedInv?.sku || ing.inventoryItemSku || '',
        inventoryItemName: matchedInv?.name || ing.inventoryItemName || 'Unknown Ingredient',
        unit: ing.unit || matchedInv?.unit || 'Kg',
        preparationLossPercentage: prepLoss,
        cookingLossPercentage: cookLoss,
        totalLossPercentage,
        effectiveQuantity,
        unitCost,
        totalCost,
      };
    });
  }

  /**
   * Get all recipes with optional filtering
   */
  public async getRecipes(filters?: RecipeFilterParams): Promise<Recipe[]> {
    let recipes = this.getStorageRecipes();

    if (!filters) return recipes;

    const query = (filters.searchQuery || '').toLowerCase().trim();

    return recipes.filter((r) => {
      if (filters.category && filters.category !== 'ALL' && r.menuCategory !== filters.category) return false;
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) return false;
      if (filters.stationId && filters.stationId !== 'ALL' && r.stationId !== filters.stationId) return false;

      if (query) {
        const nameMatch = (r.recipeName || '').toLowerCase().includes(query);
        const codeMatch = (r.recipeCode || '').toLowerCase().includes(query);
        const descMatch = (r.description || '').toLowerCase().includes(query);
        const ingMatch = (r.ingredients || []).some((i) =>
          (i.inventoryItemName || '').toLowerCase().includes(query)
        );
        if (!nameMatch && !codeMatch && !descMatch && !ingMatch) return false;
      }

      if (filters.foodCostRange && filters.foodCostRange !== 'ALL') {
        const calc = this.calculateRecipeMetrics(r);
        const diff = calc.foodCostPercentage - (r.targetFoodCostPercentage || 30);
        if (filters.foodCostRange === 'UNDER_TARGET' && diff >= 0) return false;
        if (filters.foodCostRange === 'ON_TARGET' && (diff < -2 || diff > 2)) return false;
        if (filters.foodCostRange === 'OVER_TARGET' && diff <= 0) return false;
      }

      return true;
    });
  }

  /**
   * Get active recipes only (for Production and POS integration)
   */
  public async getActiveRecipes(): Promise<Recipe[]> {
    const recipes = this.getStorageRecipes();
    return recipes.filter((r) => r.status === 'ACTIVE');
  }

  /**
   * Get single recipe by ID
   */
  public async getRecipeById(id: string): Promise<Recipe | null> {
    const recipes = this.getStorageRecipes();
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return null;

    // Refresh ingredient prices from inventory
    const updatedIngredients = await this.enrichIngredientsWithInventory(recipe.ingredients || []);
    return {
      ...recipe,
      ingredients: updatedIngredients,
    };
  }

  /**
   * Calculate standard HPP, food cost, and margins for a recipe
   */
  public calculateRecipeMetrics(recipe: Recipe): RecipeHppBreakdown {
    const ingredients = recipe.ingredients || [];
    
    // Sum raw material costs
    const rawMaterialCost = ingredients.reduce((acc, curr) => {
      const lineCost = curr.totalCost ?? (curr.effectiveQuantity ?? curr.quantity ?? 0) * (curr.unitCost ?? 0);
      return acc + (Number.isFinite(lineCost) ? lineCost : 0);
    }, 0);

    const packagingCost = Math.max(0, Number(recipe.packagingCost) || 0);
    const laborOverheadCost = Math.max(0, Number(recipe.laborOverheadCost) || 0);
    
    // Production loss cost buffer (from cooking loss)
    const productionLossCost = ingredients.reduce((acc, curr) => {
      const cookLossPct = Math.max(0, Number(curr.cookingLossPercentage) || 0);
      const baseCost = (curr.quantity || 0) * (curr.unitCost || 0);
      return acc + (baseCost * cookLossPct) / 100;
    }, 0);

    const totalRecipeCost = rawMaterialCost + packagingCost + laborOverheadCost;
    const totalPortions = Math.max(1, Number(recipe.totalPortions) || Number(recipe.yieldQuantity) || 1);

    const rawCostPerPortion = Math.round(rawMaterialCost / totalPortions);
    const totalHppPerPortion = Math.round(totalRecipeCost / totalPortions);
    const sellingPrice = Math.max(0, Number(recipe.sellingPrice) || 0);

    const grossProfit = Math.max(0, sellingPrice - totalHppPerPortion);
    const grossMarginPercentage = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;
    const foodCostPercentage = sellingPrice > 0 ? Number(((totalHppPerPortion / sellingPrice) * 100).toFixed(2)) : 0;
    const targetFoodCost = recipe.targetFoodCostPercentage ?? 30;
    const targetMargin = recipe.targetMarginPercentage ?? 70;
    const foodCostVariancePercentage = Number((foodCostPercentage - targetFoodCost).toFixed(2));
    const contributionMargin = Math.max(0, sellingPrice - (rawCostPerPortion + packagingCost));

    let profitabilityStatus: RecipeHppBreakdown['profitabilityStatus'] = 'Sehat';
    if (foodCostPercentage <= targetFoodCost && grossMarginPercentage >= 70) {
      profitabilityStatus = 'Sangat Menguntungkan';
    } else if (foodCostPercentage <= targetFoodCost) {
      profitabilityStatus = 'Sehat';
    } else if (foodCostPercentage > 40 || grossProfit <= 0) {
      profitabilityStatus = 'Risiko Tinggi';
    } else {
      profitabilityStatus = 'Perlu Evaluasi';
    }

    return {
      recipeId: recipe.id,
      recipeCode: recipe.recipeCode,
      recipeName: recipe.recipeName,
      category: recipe.menuCategory,
      version: recipe.version || 1,
      yieldQuantity: recipe.yieldQuantity || 1,
      yieldUnit: recipe.yieldUnit || 'Portion',
      portionSize: recipe.portionSize || 1,
      portionUnit: recipe.portionUnit || 'Portion',
      totalPortions,
      rawMaterialCost,
      packagingCost,
      laborOverheadCost,
      productionLossCost,
      totalRecipeCost,
      rawCostPerPortion,
      totalHppPerPortion,
      sellingPrice,
      grossProfit,
      grossMarginPercentage,
      foodCostPercentage,
      targetFoodCostPercentage: targetFoodCost,
      targetMarginPercentage: targetMargin,
      foodCostVariancePercentage,
      contributionMargin,
      profitabilityStatus,
    };
  }

  /**
   * Create a new Recipe
   */
  public async createRecipe(
    data: Omit<Recipe, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName' | 'updatedBy' | 'updatedByName'>,
    currentUser?: { id: string; name: string }
  ): Promise<Recipe> {
    const recipes = this.getStorageRecipes();
    const enrichedIngredients = await this.enrichIngredientsWithInventory(data.ingredients || []);

    const newRecipe: Recipe = {
      ...data,
      id: `rcp-${Date.now()}`,
      version: 1,
      ingredients: enrichedIngredients,
      createdBy: currentUser?.id || 'emp-user',
      createdByName: currentUser?.name || 'Authorized Staff',
      createdAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'emp-user',
      updatedByName: currentUser?.name || 'Authorized Staff',
      updatedAt: new Date().toISOString(),
    };

    recipes.unshift(newRecipe);
    this.saveStorageRecipes(recipes);

    // Also record Version 1 in version history
    const versions = this.getStorageVersions();
    const calc = this.calculateRecipeMetrics(newRecipe);
    const initialVersion: RecipeVersionHistory = {
      id: `ver-${newRecipe.id}-v1`,
      recipeId: newRecipe.id,
      version: 1,
      recipeCode: newRecipe.recipeCode,
      recipeName: newRecipe.recipeName,
      snapshotDate: new Date().toISOString(),
      changedBy: currentUser?.id || 'emp-user',
      changedByName: currentUser?.name || 'Authorized Staff',
      changeReason: 'Inisialisasi Master Recipe baru',
      sellingPrice: newRecipe.sellingPrice,
      calculatedHpp: calc.totalHppPerPortion,
      foodCostPercentage: calc.foodCostPercentage,
      yieldQuantity: newRecipe.yieldQuantity,
      yieldUnit: newRecipe.yieldUnit,
      status: newRecipe.status,
      ingredientsSnapshot: enrichedIngredients,
    };
    versions.unshift(initialVersion);
    this.saveStorageVersions(versions);

    return newRecipe;
  }

  /**
   * Update an existing Recipe and create a new immutable Version in audit history
   */
  public async updateRecipe(
    id: string,
    data: Partial<Recipe>,
    changeReason: string = 'Penyesuaian komposisi resep & harga',
    currentUser?: { id: string; name: string }
  ): Promise<Recipe> {
    const recipes = this.getStorageRecipes();
    const index = recipes.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Recipe with ID ${id} not found.`);

    const currentRecipe = recipes[index];
    const newVersion = (currentRecipe.version || 1) + 1;

    let updatedIngredients = currentRecipe.ingredients;
    if (data.ingredients) {
      updatedIngredients = await this.enrichIngredientsWithInventory(data.ingredients);
    }

    const updatedRecipe: Recipe = {
      ...currentRecipe,
      ...data,
      version: newVersion,
      ingredients: updatedIngredients,
      updatedBy: currentUser?.id || 'emp-user',
      updatedByName: currentUser?.name || 'Authorized Staff',
      updatedAt: new Date().toISOString(),
    };

    recipes[index] = updatedRecipe;
    this.saveStorageRecipes(recipes);

    // Save snapshot to version history
    const versions = this.getStorageVersions();
    const calc = this.calculateRecipeMetrics(updatedRecipe);
    const versionEntry: RecipeVersionHistory = {
      id: `ver-${updatedRecipe.id}-v${newVersion}`,
      recipeId: updatedRecipe.id,
      version: newVersion,
      recipeCode: updatedRecipe.recipeCode,
      recipeName: updatedRecipe.recipeName,
      snapshotDate: new Date().toISOString(),
      changedBy: currentUser?.id || 'emp-user',
      changedByName: currentUser?.name || 'Authorized Staff',
      changeReason,
      sellingPrice: updatedRecipe.sellingPrice,
      calculatedHpp: calc.totalHppPerPortion,
      foodCostPercentage: calc.foodCostPercentage,
      yieldQuantity: updatedRecipe.yieldQuantity,
      yieldUnit: updatedRecipe.yieldUnit,
      status: updatedRecipe.status,
      ingredientsSnapshot: updatedIngredients,
    };
    versions.unshift(versionEntry);
    this.saveStorageVersions(versions);

    return updatedRecipe;
  }

  /**
   * Duplicate a recipe (creates DRAFT with new code)
   */
  public async duplicateRecipe(
    id: string,
    currentUser?: { id: string; name: string }
  ): Promise<Recipe> {
    const recipe = await this.getRecipeById(id);
    if (!recipe) throw new Error(`Recipe ${id} not found.`);

    const newCode = `${recipe.recipeCode}-COPY-${Math.floor(100 + Math.random() * 900)}`;
    const newName = `${recipe.recipeName} (Copy)`;

    return this.createRecipe(
      {
        ...recipe,
        recipeCode: newCode,
        recipeName: newName,
        status: 'DRAFT',
        approvedBy: undefined,
        approvedByName: undefined,
        approvedAt: undefined,
        archivedBy: undefined,
        archivedByName: undefined,
        archivedAt: undefined,
      },
      currentUser
    );
  }

  /**
   * Archive a recipe (cannot be used for new production)
   */
  public async archiveRecipe(
    id: string,
    currentUser?: { id: string; name: string }
  ): Promise<Recipe> {
    const recipes = this.getStorageRecipes();
    const index = recipes.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Recipe ${id} not found.`);

    recipes[index].status = 'ARCHIVED';
    recipes[index].archivedBy = currentUser?.id || 'emp-user';
    recipes[index].archivedByName = currentUser?.name || 'Authorized Staff';
    recipes[index].archivedAt = new Date().toISOString();
    recipes[index].updatedAt = new Date().toISOString();

    this.saveStorageRecipes(recipes);
    return recipes[index];
  }

  /**
   * Get version history for a recipe
   */
  public async getRecipeVersions(recipeId: string): Promise<RecipeVersionHistory[]> {
    const versions = this.getStorageVersions();
    return versions.filter((v) => v.recipeId === recipeId);
  }

  /**
   * Get shared Recipe Cost Contracts for Finance / HPP / Dashboard
   */
  public async getRecipeCostContracts(): Promise<RecipeCostContract[]> {
    const recipes = await this.getActiveRecipes();
    return recipes.map((recipe) => {
      const metrics = this.calculateRecipeMetrics(recipe);
      const portions = Number(recipe.portionSize ?? 1) || 1;
      const packagingCostPerPortion = Math.round((metrics.packagingCost || 0) / portions);
      return {
        recipeId: recipe.id,
        recipeCode: recipe.recipeCode,
        recipeName: recipe.recipeName,
        category: recipe.menuCategory,
        portionSize: recipe.portionSize,
        portionUnit: recipe.portionUnit,
        costPerPortion: metrics.rawCostPerPortion,
        packagingCostPerPortion,
        totalHppPerPortion: metrics.totalHppPerPortion,
        sellingPrice: metrics.sellingPrice,
        foodCostPercentage: metrics.foodCostPercentage,
        targetFoodCostPercentage: metrics.targetFoodCostPercentage,
        grossMarginPercentage: metrics.grossMarginPercentage,
        grossProfitPerPortion: metrics.grossProfit,
        calculatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Reset master recipes and version history to initial mock dataset
   */
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_RECIPES);
    localStorage.removeItem(STORAGE_KEY_VERSIONS);
    this.getStorageRecipes();
    this.getStorageVersions();
  }
}

export const recipeService = new RecipeService();
