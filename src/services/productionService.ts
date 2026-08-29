/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — PRODUCTION SERVICE
 * Core service layer managing Batch Productions, Yields, Deviations,
 * Waste tracking, and stock movement integrations.
 */

import {
  ProductionBatch,
  ProductionFilterParams,
  ProductionSummary,
  YieldStatus,
  ProductionIngredientUsage,
  ProductionWasteLog,
  RecipeDeviationLog,
} from '../types/production';
import { ProductionBatchCostContract } from '../types/contracts';
import { MOCK_PRODUCTION_BATCHES, MOCK_PRODUCTION_SUMMARY } from '../data/mockProduction';
import { recipeService } from './recipeService';
import { stockMovementService } from './stockMovementService';

const STORAGE_KEY_PRODUCTIONS = 'tropicalos_production_batches';

class ProductionService {
  private getStorageProductions(): ProductionBatch[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PRODUCTIONS, JSON.stringify(MOCK_PRODUCTION_BATCHES));
        return MOCK_PRODUCTION_BATCHES;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : MOCK_PRODUCTION_BATCHES;
    } catch (e) {
      console.error('[ProductionService] Error reading localStorage:', e);
      return MOCK_PRODUCTION_BATCHES;
    }
  }

  private saveStorageProductions(batches: ProductionBatch[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTIONS, JSON.stringify(batches));
    } catch (e) {
      console.error('[ProductionService] Error saving localStorage:', e);
    }
  }

  /**
   * Determine yield status according to variance thresholds
   */
  public calculateYieldStatus(theoretical: number, actual: number): {
    variance: number;
    percentage: number;
    status: YieldStatus;
  } {
    const theo = Math.max(0, Number(theoretical) || 0);
    const act = Math.max(0, Number(actual) || 0);

    if (theo <= 0) {
      return { variance: 0, percentage: 100, status: 'OPTIMAL' };
    }

    const variance = Number((act - theo).toFixed(3));
    const percentage = Number(((act / theo) * 100).toFixed(1));

    let status: YieldStatus = 'OPTIMAL';
    if (percentage < 80 || percentage > 125) {
      status = 'CRITICAL_VARIANCE';
    } else if (percentage < 95) {
      status = 'BELOW_TARGET';
    } else if (percentage > 105) {
      status = 'EXCESS';
    } else {
      status = 'OPTIMAL';
    }

    return { variance, percentage, status };
  }

  /**
   * Get all production batches with optional filtering
   */
  public async getProductions(filters?: ProductionFilterParams): Promise<ProductionBatch[]> {
    let batches = this.getStorageProductions();

    if (!filters) return batches;

    const query = (filters.searchQuery || '').toLowerCase().trim();

    return batches.filter((b) => {
      if (filters.status && filters.status !== 'ALL' && b.status !== filters.status) return false;
      if (filters.productionType && filters.productionType !== 'ALL' && b.productionType !== filters.productionType) return false;
      if (filters.recipeId && filters.recipeId !== 'ALL' && b.recipeId !== filters.recipeId) return false;
      if (filters.stationId && filters.stationId !== 'ALL' && b.stationId !== filters.stationId) return false;
      if (filters.yieldStatus && filters.yieldStatus !== 'ALL' && b.yieldStatus !== filters.yieldStatus) return false;

      if (filters.startDate) {
        if (b.productionDate < filters.startDate) return false;
      }
      if (filters.endDate) {
        if (b.productionDate > filters.endDate) return false;
      }

      if (query) {
        const numMatch = (b.productionNumber || '').toLowerCase().includes(query);
        const nameMatch = (b.recipeName || '').toLowerCase().includes(query);
        const codeMatch = (b.recipeCode || '').toLowerCase().includes(query);
        const notesMatch = (b.notes || '').toLowerCase().includes(query);
        const picMatch = (b.createdByName || '').toLowerCase().includes(query);
        if (!numMatch && !nameMatch && !codeMatch && !notesMatch && !picMatch) return false;
      }

      return true;
    });
  }

  /**
   * Get single batch by ID
   */
  public async getProductionById(id: string): Promise<ProductionBatch | null> {
    const batches = this.getStorageProductions();
    return batches.find((b) => b.id === id) || null;
  }

  /**
   * Create a new Production Batch
   */
  public async createProduction(
    data: {
      recipeId: string;
      productionDate: string;
      productionType: ProductionBatch['productionType'];
      plannedBatchCount: number;
      stationId?: string;
      stationName?: string;
      targetDepartment?: ProductionBatch['targetDepartment'];
      notes?: string;
    },
    currentUser?: { id: string; name: string }
  ): Promise<ProductionBatch> {
    const recipe = await recipeService.getRecipeById(data.recipeId);
    if (!recipe) throw new Error(`Recipe with ID ${data.recipeId} not found.`);
    if (recipe.status === 'ARCHIVED') {
      throw new Error(`Cannot create production for an ARCHIVED recipe (${recipe.recipeName}).`);
    }

    const batchCount = Math.max(0.1, Number(data.plannedBatchCount) || 1);
    const theoreticalYield = Number(((recipe.yieldQuantity || 1) * batchCount).toFixed(2));
    const yieldUnit = recipe.yieldUnit || 'Portion';

    // Prepare expected ingredients
    const ingredientsUsage: ProductionIngredientUsage[] = (recipe.ingredients || []).map((ing) => {
      const expectedQty = Number(((ing.effectiveQuantity || ing.quantity || 0) * batchCount).toFixed(4));
      const lineCost = Math.round(expectedQty * (ing.unitCost || 0));
      return {
        inventoryItemId: ing.inventoryItemId,
        inventoryItemSku: ing.inventoryItemSku || '',
        inventoryItemName: ing.inventoryItemName || 'Ingredient',
        expectedQuantity: expectedQty,
        actualQuantity: expectedQty, // Initialized to expected
        unit: ing.unit,
        unitCost: ing.unitCost || 0,
        totalCost: lineCost,
        varianceQuantity: 0,
        variancePercentage: 0,
      };
    });

    const theoreticalCost = ingredientsUsage.reduce((sum, item) => sum + item.totalCost, 0);
    const theoreticalUnitHpp = theoreticalYield > 0 ? Math.round(theoreticalCost / theoreticalYield) : 0;

    const dateStr = (data.productionDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const productionNumber = `PROD-${dateStr}-${randomSuffix}`;

    const newBatch: ProductionBatch = {
      id: `prod-${Date.now()}`,
      productionNumber,
      recipeId: recipe.id,
      recipeCode: recipe.recipeCode,
      recipeName: recipe.recipeName,
      recipeVersion: recipe.version || 1,
      productionDate: data.productionDate || new Date().toISOString().slice(0, 10),
      productionType: data.productionType || 'BATCH_PREP',
      stationId: data.stationId || recipe.stationId || 'st-kitchen-prep',
      stationName: data.stationName || recipe.stationName || 'Kitchen Prep',
      targetDepartment: data.targetDepartment || 'Kitchen',
      plannedBatchCount: batchCount,
      plannedQuantity: theoreticalYield,
      yieldUnit,
      theoreticalYield,
      actualYield: 0,
      yieldVariance: 0,
      yieldPercentage: 0,
      yieldStatus: 'OPTIMAL',
      status: 'PLANNED',
      theoreticalCost,
      actualCost: theoreticalCost,
      theoreticalUnitHpp,
      actualUnitHpp: 0,
      costVariance: 0,
      ingredients: ingredientsUsage,
      wasteLogs: [],
      deviations: [],
      notes: data.notes || '',
      createdBy: currentUser?.id || 'emp-user',
      createdByName: currentUser?.name || 'Staff User',
      createdAt: new Date().toISOString(),
    };

    const batches = this.getStorageProductions();
    batches.unshift(newBatch);
    this.saveStorageProductions(batches);

    return newBatch;
  }

  /**
   * Start production batch (transitions PLANNED -> IN_PROGRESS)
   */
  public async startProduction(
    id: string,
    currentUser?: { id: string; name: string }
  ): Promise<ProductionBatch> {
    const batches = this.getStorageProductions();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Production batch ${id} not found.`);

    if (batches[index].status !== 'PLANNED') {
      throw new Error(`Batch cannot be started because status is ${batches[index].status}`);
    }

    batches[index].status = 'IN_PROGRESS';
    batches[index].startedBy = currentUser?.id || 'emp-user';
    batches[index].startedByName = currentUser?.name || 'Staff User';
    batches[index].startedAt = new Date().toISOString();

    this.saveStorageProductions(batches);
    return batches[index];
  }

  /**
   * Complete production batch with actual yields, deviations, and waste logs
   */
  public async completeProduction(
    id: string,
    completionData: {
      actualYield: number;
      actualIngredients?: ProductionIngredientUsage[];
      wasteLogs?: Omit<ProductionWasteLog, 'id' | 'productionId' | 'recipeId' | 'reportedAt'>[];
      deviations?: Omit<RecipeDeviationLog, 'id' | 'productionId' | 'recipeId' | 'recordedAt'>[];
      notes?: string;
      storageLocation?: string;
    },
    currentUser?: { id: string; name: string }
  ): Promise<ProductionBatch> {
    const batches = this.getStorageProductions();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Production batch ${id} not found.`);

    const batch = batches[index];
    const actualYield = Math.max(0, Number(completionData.actualYield) || 0);
    const yieldCalc = this.calculateYieldStatus(batch.theoreticalYield, actualYield);

    // Calculate actual ingredient costs & variances
    const ingredients = (completionData.actualIngredients || batch.ingredients || []).map((ing) => {
      const actualQty = Math.max(0, Number(ing.actualQuantity) ?? Number(ing.expectedQuantity) ?? 0);
      const expectedQty = Math.max(0, Number(ing.expectedQuantity) || 0);
      const varQty = Number((actualQty - expectedQty).toFixed(4));
      const varPct = expectedQty > 0 ? Number(((varQty / expectedQty) * 100).toFixed(2)) : 0;
      const totalCost = Math.round(actualQty * (ing.unitCost || 0));

      return {
        ...ing,
        actualQuantity: actualQty,
        varianceQuantity: varQty,
        variancePercentage: varPct,
        totalCost,
      };
    });

    const actualCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const actualUnitHpp = actualYield > 0 ? Math.round(actualCost / actualYield) : 0;
    const costVariance = actualCost - batch.theoreticalCost;

    // Process waste logs
    const wasteLogs: ProductionWasteLog[] = (completionData.wasteLogs || []).map((w, idx) => ({
      ...w,
      id: `pw-${Date.now()}-${idx}`,
      productionId: batch.id,
      recipeId: batch.recipeId,
      reportedBy: currentUser?.id || 'emp-user',
      reportedByName: currentUser?.name || 'Staff User',
      reportedAt: new Date().toISOString(),
    }));

    // Process deviations
    const deviations: RecipeDeviationLog[] = (completionData.deviations || []).map((d, idx) => ({
      ...d,
      id: `dev-${Date.now()}-${idx}`,
      productionId: batch.id,
      recipeId: batch.recipeId,
      recordedBy: currentUser?.id || 'emp-user',
      recordedByName: currentUser?.name || 'Staff User',
      recordedAt: new Date().toISOString(),
    }));

    // Auto-detect recipe deviations if actual quantity differs > 5%
    ingredients.forEach((ing, idx) => {
      if (Math.abs(ing.variancePercentage) >= 5 && !deviations.some((d) => d.inventoryItemId === ing.inventoryItemId)) {
        deviations.push({
          id: `dev-auto-${Date.now()}-${idx}`,
          productionId: batch.id,
          recipeId: batch.recipeId,
          inventoryItemId: ing.inventoryItemId,
          inventoryItemName: ing.inventoryItemName,
          expectedQuantity: ing.expectedQuantity,
          actualQuantity: ing.actualQuantity,
          unit: ing.unit,
          varianceQuantity: ing.varianceQuantity,
          variancePercentage: ing.variancePercentage,
          severity: Math.abs(ing.variancePercentage) > 15 ? 'MAJOR_DEVIATION' : 'MINOR_DEVIATION',
          reason: `Selisih pemakaian bahan aktual ${ing.varianceQuantity > 0 ? '+' : ''}${ing.varianceQuantity} ${ing.unit}`,
          recordedBy: currentUser?.id || 'emp-user',
          recordedByName: currentUser?.name || 'Staff User',
          recordedAt: new Date().toISOString(),
        });
      }
    });

    const generatedBatchNumber = `BAT-${batch.recipeCode.replace('RCP-', '')}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    const updatedBatch: ProductionBatch = {
      ...batch,
      actualYield,
      yieldVariance: yieldCalc.variance,
      yieldPercentage: yieldCalc.percentage,
      yieldStatus: yieldCalc.status,
      actualCost,
      actualUnitHpp,
      costVariance,
      ingredients,
      wasteLogs,
      deviations,
      generatedBatchNumber,
      storageLocation: completionData.storageLocation || 'Kitchen Chiller C-01',
      status: 'COMPLETED',
      notes: completionData.notes !== undefined ? completionData.notes : batch.notes,
      completedBy: currentUser?.id || 'emp-user',
      completedByName: currentUser?.name || 'Staff User',
      completedAt: new Date().toISOString(),
    };

    batches[index] = updatedBatch;
    this.saveStorageProductions(batches);

    // Record stock movements in background (deduct raw materials used)
    try {
      for (const ing of ingredients) {
        if (ing.actualQuantity > 0) {
          await stockMovementService.recordMovement({
            itemId: ing.inventoryItemId,
            itemSku: ing.inventoryItemSku,
            itemName: ing.inventoryItemName,
            category: 'Production Material',
            movementType: 'PRODUCTION_OUT',
            quantity: ing.actualQuantity,
            unit: ing.unit,
            unitCost: ing.unitCost,
            totalValue: ing.totalCost,
            referenceType: 'SYSTEM',
            referenceId: batch.productionNumber,
            reason: `Pemakaian bahan untuk batch produksi ${batch.productionNumber} (${batch.recipeName})`,
            createdBy: currentUser?.id || 'emp-user',
            createdByName: currentUser?.name || 'Staff User',
          });
        }
      }
    } catch (err) {
      console.warn('[ProductionService] Could not log all stock movements:', err);
    }

    return updatedBatch;
  }

  /**
   * Cancel a production batch
   */
  public async cancelProduction(
    id: string,
    reason: string,
    currentUser?: { id: string; name: string }
  ): Promise<ProductionBatch> {
    const batches = this.getStorageProductions();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Production batch ${id} not found.`);

    batches[index].status = 'CANCELLED';
    batches[index].cancellationReason = reason;
    batches[index].cancelledBy = currentUser?.id || 'emp-user';
    batches[index].cancelledByName = currentUser?.name || 'Staff User';
    batches[index].cancelledAt = new Date().toISOString();

    this.saveStorageProductions(batches);
    return batches[index];
  }

  /**
   * Get production summary statistics
   */
  public async getProductionSummary(): Promise<ProductionSummary> {
    const batches = this.getStorageProductions();
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayBatches = batches.filter((b) => b.productionDate === todayStr);
    const completedBatches = batches.filter((b) => b.status === 'COMPLETED');

    const totalYieldPct = completedBatches.reduce((acc, b) => acc + (b.yieldPercentage || 0), 0);
    const avgYield = completedBatches.length > 0 ? Number((totalYieldPct / completedBatches.length).toFixed(1)) : 100;

    const totalCost = completedBatches.reduce((acc, b) => acc + (b.actualCost || b.theoreticalCost || 0), 0);
    
    const totalWasteCost = completedBatches.reduce((acc, b) => {
      const batchWaste = (b.wasteLogs || []).reduce((wSum, w) => wSum + (w.estimatedCost || 0), 0);
      return acc + batchWaste;
    }, 0);

    const criticalCount = batches.filter((b) => b.yieldStatus === 'CRITICAL_VARIANCE').length;

    return {
      totalBatchesToday: todayBatches.length,
      plannedCount: batches.filter((b) => b.status === 'PLANNED').length,
      inProgressCount: batches.filter((b) => b.status === 'IN_PROGRESS').length,
      completedCount: completedBatches.length,
      cancelledCount: batches.filter((b) => b.status === 'CANCELLED').length,
      averageYieldPercentage: avgYield,
      totalProductionCostMonth: totalCost || MOCK_PRODUCTION_SUMMARY.totalProductionCostMonth,
      totalProductionWasteCost: totalWasteCost || MOCK_PRODUCTION_SUMMARY.totalProductionWasteCost,
      criticalYieldVarianceCount: criticalCount,
    };
  }

  /**
   * Get shared Production Batch Cost Contracts for Finance / Inventory Valuation
   */
  public async getProductionBatchCostContracts(): Promise<ProductionBatchCostContract[]> {
    const batches = this.getStorageProductions();
    return batches.map((b) => {
      const targetQty = Number(b.plannedQuantity ?? 0);
      const actualQty = Number(b.actualYield ?? targetQty);
      const rawCost = Number(b.actualCost ?? b.theoreticalCost ?? 0);
      const varianceCost = Number(b.costVariance ?? 0);
      const unitCost = actualQty > 0 ? Math.round(rawCost / actualQty) : 0;

      return {
        batchId: b.id,
        batchNumber: b.productionNumber || b.id,
        recipeId: b.recipeId,
        recipeName: b.recipeName,
        targetQuantity: targetQty,
        actualQuantity: actualQty,
        yieldUnit: b.yieldUnit,
        yieldPercentage: Number(b.yieldPercentage ?? 100),
        rawMaterialCost: rawCost,
        laborCost: 0,
        overheadCost: 0,
        totalBatchCost: rawCost,
        unitCostAchieved: unitCost,
        varianceCost,
        completedAt: (b as any).completedAt,
      };
    });
  }

  /**
   * Reset production data to mock dataset
   */
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_PRODUCTIONS);
    this.getStorageProductions();
  }
}

export const productionService = new ProductionService();
