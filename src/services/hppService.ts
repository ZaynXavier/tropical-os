/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — HPP & FOOD COST SERVICE
 * Comprehensive Costing Engine, Menu Engineering (Star/Plowhorse/Puzzle/Dog),
 * Theoretical vs Actual Variance, and Profitability Analytics.
 */

import { recipeService } from './recipeService';
import { productionService } from './productionService';
import {
  RecipeHppBreakdown,
  MenuPerformanceContract,
  HppAnalyticsData,
  MenuEngineeringItem,
  IngredientUsageVariance,
} from '../types/hpp';
import { Recipe } from '../types/recipe';

class HppService {
  /**
   * Get complete HPP breakdown for all active and draft recipes
   */
  public async getAllRecipeBreakdowns(): Promise<RecipeHppBreakdown[]> {
    const recipes = await recipeService.getRecipes();
    return recipes
      .filter((r) => r.status !== 'ARCHIVED')
      .map((r) => recipeService.calculateRecipeMetrics(r));
  }

  /**
   * Get single recipe HPP breakdown
   */
  public async getRecipeBreakdownById(recipeId: string): Promise<RecipeHppBreakdown | null> {
    const recipe = await recipeService.getRecipeById(recipeId);
    if (!recipe) return null;
    return recipeService.calculateRecipeMetrics(recipe);
  }

  /**
   * Generate Menu Engineering BCG Matrix Data
   */
  public async getMenuEngineeringAnalysis(): Promise<MenuEngineeringItem[]> {
    const recipes = await recipeService.getActiveRecipes();
    const sellableRecipes = recipes.filter((r) => r.sellingPrice > 0);

    // Monthly sales volume mapping
    const salesVolumeMap: Record<string, number> = {
      'rcp-001': 320, // Meltique Steak
      'rcp-002': 450, // Chicken Alfredo
      'rcp-003': 380, // Crispy Dory
      'rcp-006': 520, // Iced Caramel Macchiato
      'rcp-007': 160, // Caesar Salad
      'rcp-008': 85,  // AUS Tenderloin
      'rcp-009': 45,  // Mocktail
    };

    const items = sellableRecipes.map((r) => {
      const metrics = recipeService.calculateRecipeMetrics(r);
      const salesQty = salesVolumeMap[r.id] || 120;
      const totalRevenue = salesQty * (metrics.sellingPrice ?? 0);
      const totalCost = salesQty * (metrics.totalHppPerPortion ?? 0);
      const totalGrossProfit = totalRevenue - totalCost;
      const grossProfitPerPortion = Math.max(0, (metrics.sellingPrice ?? 0) - (metrics.totalHppPerPortion ?? 0));

      return {
        recipeId: r.id,
        recipeCode: r.recipeCode,
        recipeName: r.recipeName,
        menuCategory: r.menuCategory,
        sellingPrice: metrics.sellingPrice,
        hppPerPortion: metrics.totalHppPerPortion,
        foodCostPercentage: metrics.foodCostPercentage,
        targetFoodCostPercentage: metrics.targetFoodCostPercentage,
        grossMarginPercentage: metrics.grossMarginPercentage,
        grossProfitPerPortion,
        monthlySalesVolume: salesQty,
        totalRevenue,
        totalCost,
        totalGrossProfit,
      };
    });

    if (items.length === 0) return [];

    const totalSalesQty = items.reduce((acc, i) => acc + i.monthlySalesVolume, 0);
    const avgSalesQty = totalSalesQty / items.length;
    const avgMarginPercentage = items.reduce((acc, i) => acc + i.grossMarginPercentage, 0) / items.length;

    return items.map((item) => {
      const isHighPopularity = item.monthlySalesVolume >= avgSalesQty;
      const isHighMargin = item.grossMarginPercentage >= avgMarginPercentage;

      let quadrant: MenuEngineeringItem['quadrant'] = 'STAR';
      let actionRecommendation = '';

      if (isHighPopularity && isHighMargin) {
        quadrant = 'STAR';
        actionRecommendation = 'Pertahankan kualitas rasa, SOP plating konsisten, dan prioritaskan display menu utama.';
      } else if (isHighPopularity && !isHighMargin) {
        quadrant = 'PLOWHORSE';
        actionRecommendation = 'Tingkatkan margin dengan re-negosiasi supplier, kontrol porsi, atau naikkan harga bertahap 3-5%.';
      } else if (!isHighPopularity && isHighMargin) {
        quadrant = 'PUZZLE';
        actionRecommendation = 'Tingkatkan promosi table-side, pairing bundle hemat, dan rekomendasikan aktif oleh waiter/waitress.';
      } else {
        quadrant = 'DOG';
        actionRecommendation = 'Pertimbangkan resep ulang secara menyeluruh, turunkan HPP, atau ganti dengan menu seasonal baru.';
      }

      return {
        ...item,
        quadrant,
        actionRecommendation,
      };
    });
  }

  /**
   * Get ingredient usage variance data
   */
  public async getIngredientUsageVariances(): Promise<IngredientUsageVariance[]> {
    const rawBreakdowns: IngredientUsageVariance[] = [
      {
        inventoryItemId: 'inv-meat-01',
        inventoryItemSku: 'SKU-MT-001',
        inventoryItemName: 'Beef Brisket Meltique',
        unit: 'Kg',
        unitCost: 145000,
        theoreticalUsage: 70.4,
        actualUsage: 73.5,
        varianceQuantity: 3.1,
        variancePercentage: 4.4,
        varianceCost: 449500,
        rootCause: 'Trimming fat cap lebih tebal pada batch kiriman 15 Agustus',
        status: 'ACCEPTABLE',
      },
      {
        inventoryItemId: 'inv-meat-02',
        inventoryItemSku: 'SKU-MT-002',
        inventoryItemName: 'Beef Tenderloin AUS',
        unit: 'Kg',
        unitCost: 220000,
        theoreticalUsage: 19.55,
        actualUsage: 22.0,
        varianceQuantity: 2.45,
        variancePercentage: 12.5,
        varianceCost: 539000,
        rootCause: 'Silver skin removal dan porsi over-portioning di hot line',
        status: 'WARNING',
      },
      {
        inventoryItemId: 'inv-poultry-01',
        inventoryItemSku: 'SKU-PL-001',
        inventoryItemName: 'Chicken Breast Boneless Skinless',
        unit: 'Kg',
        unitCost: 52000,
        theoreticalUsage: 54.0,
        actualUsage: 55.2,
        varianceQuantity: 1.2,
        variancePercentage: 2.2,
        varianceCost: 62400,
        rootCause: 'Normal butchery loss & portioning tolerance',
        status: 'OPTIMAL',
      },
      {
        inventoryItemId: 'inv-veg-01',
        inventoryItemSku: 'SKU-VG-001',
        inventoryItemName: 'Romaine Lettuce Organik',
        unit: 'Kg',
        unitCost: 28000,
        theoreticalUsage: 19.2,
        actualUsage: 24.5,
        varianceQuantity: 5.3,
        variancePercentage: 27.6,
        varianceCost: 148400,
        rootCause: 'Daun luar layu & spoilage di chiller sebelum diproses',
        status: 'CRITICAL',
      },
      {
        inventoryItemId: 'inv-dairy-01',
        inventoryItemSku: 'SKU-DY-001',
        inventoryItemName: 'Fresh Milk UHT Greenfields 1L',
        unit: 'Pcs',
        unitCost: 19500,
        theoreticalUsage: 140.3,
        actualUsage: 144.0,
        varianceQuantity: 3.7,
        variancePercentage: 2.6,
        varianceCost: 72150,
        rootCause: 'Steam pitcher leftover foam di bar station',
        status: 'OPTIMAL',
      },
    ];

    return rawBreakdowns;
  }

  /**
   * Legacy wrapper for Menu Performance
   */
  public async getMenuPerformance(): Promise<MenuPerformanceContract[]> {
    const analysis = await this.getMenuEngineeringAnalysis();
    return analysis.map((item) => ({
      menuId: item.recipeId,
      recipeId: item.recipeId,
      recipeCode: item.recipeCode,
      menuName: item.recipeName,
      category: item.menuCategory,
      sellingPrice: item.sellingPrice,
      hpp: item.hppPerPortion,
      foodCostPercentage: item.foodCostPercentage,
      grossMargin: item.grossProfitPerPortion,
      grossMarginPercentage: item.grossMarginPercentage,
      salesQuantity: item.monthlySalesVolume,
      salesRevenue: item.totalRevenue,
      totalCogs: item.totalCost,
      totalGrossProfit: item.totalGrossProfit,
      popularityScore: 75,
      profitabilityScore: 80,
      classification: item.quadrant,
      profitabilityStatus: item.foodCostPercentage <= 30 ? 'Sangat Menguntungkan' : 'Perlu Evaluasi',
    }));
  }

  /**
   * Get high-level executive HPP analytics and trend indicators
   */
  public async getHppAnalytics(): Promise<any> {
    const analysis = await this.getMenuEngineeringAnalysis();

    const totalRevenue = analysis.reduce((acc, i) => acc + i.totalRevenue, 0);
    const totalFoodCost = analysis.reduce((acc, i) => acc + i.totalCost, 0);
    const totalGrossProfit = totalRevenue - totalFoodCost;
    const overallFoodCostPercentage = totalRevenue > 0 ? Number(((totalFoodCost / totalRevenue) * 100).toFixed(2)) : 28.5;
    const overallGrossMarginPercentage = totalRevenue > 0 ? Number(((totalGrossProfit / totalRevenue) * 100).toFixed(2)) : 71.5;

    // Monthly trend simulation for analytical charts
    const monthlyCostTrend = [
      { month: 'Mar 2026', totalRevenue: 98000000, totalFoodCost: 28420000, foodCostPercentage: 29.0, targetPercentage: 30.0 },
      { month: 'Apr 2026', totalRevenue: 104500000, totalFoodCost: 29782500, foodCostPercentage: 28.5, targetPercentage: 30.0 },
      { month: 'Mei 2026', totalRevenue: 118000000, totalFoodCost: 33630000, foodCostPercentage: 28.5, targetPercentage: 30.0 },
      { month: 'Jun 2026', totalRevenue: 125400000, totalFoodCost: 36616800, foodCostPercentage: 29.2, targetPercentage: 30.0 },
      { month: 'Jul 2026', totalRevenue: 138000000, totalFoodCost: 39744000, foodCostPercentage: 28.8, targetPercentage: 30.0 },
      { month: 'Agu 2026 (MTD)', totalRevenue: totalRevenue || 142500000, totalFoodCost: totalFoodCost || 40612500, foodCostPercentage: overallFoodCostPercentage || 28.5, targetPercentage: 30.0 },
    ];

    // Category breakdown
    const categoryTotals: Record<string, { revenue: number; cost: number }> = {};
    analysis.forEach((item) => {
      if (!categoryTotals[item.menuCategory]) {
        categoryTotals[item.menuCategory] = { revenue: 0, cost: 0 };
      }
      categoryTotals[item.menuCategory].revenue += item.totalRevenue;
      categoryTotals[item.menuCategory].cost += item.totalCost;
    });

    const categoryCostBreakdown = Object.entries(categoryTotals).map(([category, vals]) => {
      const fcPct = vals.revenue > 0 ? Number(((vals.cost / vals.revenue) * 100).toFixed(2)) : 0;
      return {
        category,
        totalRevenue: vals.revenue,
        totalCost: vals.cost,
        foodCostPercentage: fcPct,
      };
    });

    // Top cost variance / risk items
    const topCostVarianceItems = analysis
      .map((item) => ({
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        sellingPrice: item.sellingPrice,
        actualFoodCostPercentage: item.foodCostPercentage,
        targetFoodCostPercentage: item.targetFoodCostPercentage,
        variancePercentage: Number((item.foodCostPercentage - item.targetFoodCostPercentage).toFixed(2)),
      }))
      .sort((a, b) => b.variancePercentage - a.variancePercentage)
      .slice(0, 5);

    // Matrix distribution
    const matrixDistribution = {
      stars: analysis.filter((i) => i.quadrant === 'STAR').length,
      plowhorses: analysis.filter((i) => i.quadrant === 'PLOWHORSE').length,
      puzzles: analysis.filter((i) => i.quadrant === 'PUZZLE').length,
      dogs: analysis.filter((i) => i.quadrant === 'DOG').length,
    };

    return {
      totalRevenue,
      totalFoodCost,
      totalGrossProfit,
      overallFoodCostPercentage,
      targetFoodCostPercentage: 30.0,
      overallGrossMarginPercentage,
      monthlyCostTrend,
      categoryCostBreakdown,
      topCostVarianceItems,
      matrixDistribution,
    };
  }

  /**
   * Theoretical vs Actual Raw Material Consumption Variance Analysis
   */
  public async getConsumptionVarianceAnalysis() {
    const rawBreakdowns = [
      {
        inventoryItemId: 'inv-meat-01',
        itemName: 'Beef Brisket Meltique',
        unit: 'Kg',
        unitCost: 145000,
        theoreticalUsage: 70.4, // Calculated from 320 portions * 0.22kg
        actualUsage: 73.5,     // From inventory stock movements
        varianceQty: 3.1,
        varianceCost: 449500,
        variancePercentage: 4.4,
        reason: 'Trimming fat cap lebih tebal pada batch kiriman 15 Agustus',
        status: 'ACCEPTABLE',
      },
      {
        inventoryItemId: 'inv-meat-02',
        itemName: 'Beef Tenderloin AUS',
        unit: 'Kg',
        unitCost: 220000,
        theoreticalUsage: 19.55,
        actualUsage: 22.0,
        varianceQty: 2.45,
        varianceCost: 539000,
        variancePercentage: 12.5,
        reason: 'Silver skin removal dan porsi over-portioning di hot line',
        status: 'WARNING',
      },
      {
        inventoryItemId: 'inv-poultry-01',
        itemName: 'Chicken Breast Boneless Skinless',
        unit: 'Kg',
        unitCost: 52000,
        theoreticalUsage: 54.0,
        actualUsage: 55.2,
        varianceQty: 1.2,
        varianceCost: 62400,
        variancePercentage: 2.2,
        reason: 'Normal butchery loss',
        status: 'OPTIMAL',
      },
      {
        inventoryItemId: 'inv-veg-01',
        itemName: 'Romaine Lettuce Organik',
        unit: 'Kg',
        unitCost: 28000,
        theoreticalUsage: 19.2,
        actualUsage: 24.5,
        varianceQty: 5.3,
        varianceCost: 148400,
        variancePercentage: 27.6,
        reason: 'Daun luar layu & spoilage di chiller sebelum diproses',
        status: 'CRITICAL',
      },
      {
        inventoryItemId: 'inv-dairy-01',
        itemName: 'Fresh Milk UHT Greenfields 1L',
        unit: 'Pcs',
        unitCost: 19500,
        theoreticalUsage: 140.3,
        actualUsage: 144.0,
        varianceQty: 3.7,
        varianceCost: 72150,
        variancePercentage: 2.6,
        reason: 'Steam pitcher leftover foam di bar station',
        status: 'OPTIMAL',
      },
    ];

    const totalTheoreticalCost = rawBreakdowns.reduce((acc, i) => acc + (i.theoreticalUsage * i.unitCost), 0);
    const totalActualCost = rawBreakdowns.reduce((acc, i) => acc + (i.actualUsage * i.unitCost), 0);
    const netVarianceCost = totalActualCost - totalTheoreticalCost;
    const netVariancePercentage = totalTheoreticalCost > 0 ? Number(((netVarianceCost / totalTheoreticalCost) * 100).toFixed(2)) : 0;

    return {
      items: rawBreakdowns,
      totalTheoreticalCost,
      totalActualCost,
      netVarianceCost,
      netVariancePercentage,
    };
  }
}

export const hppService = new HppService();
