/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY TYPES
 */

export type InventoryCategory =
  | 'Meat'
  | 'Seafood'
  | 'Poultry'
  | 'Vegetable'
  | 'Fruit'
  | 'Dairy'
  | 'Dry Goods'
  | 'Beverage'
  | 'Condiment'
  | 'Packaging'
  | 'Cleaning Chemical'
  | 'Other';

export type UnitOfMeasurement =
  | 'Kg'
  | 'Gram'
  | 'Liter'
  | 'Ml'
  | 'Pcs'
  | 'Box'
  | 'Bottle'
  | 'Pack'
  | 'Tray'
  | 'Portion';

export type StockStatus = 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';

export type ExpiryRiskLevel = 'EXPIRED' | 'CRITICAL_EXPIRING' | 'WARNING_EXPIRING' | 'SAFE' | 'NONE';

export interface InventoryBatch {
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string; // YYYY-MM-DD
  receivedDate: string;
  supplierId?: string;
  storageLocation?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  subCategory?: string;
  unit: UnitOfMeasurement;
  baseUnit: UnitOfMeasurement;
  conversionFactor: number; // e.g. 1 Box = 12 Pcs -> conversionFactor = 12
  currentStock: number; // In baseUnit
  minimumStock: number; // In baseUnit
  reorderPoint: number; // In baseUnit
  maximumStock: number; // In baseUnit
  averageCost: number; // Cost per baseUnit
  lastPurchaseCost: number; // Cost per baseUnit
  stockValue: number; // currentStock * averageCost
  supplierId?: string;
  supplierName?: string;
  storageArea: string; // e.g. "Central Storage", "Kitchen Dry Store", "Walk-in Chiller", "Bar Counter"
  storageLocation: string; // e.g. "Shelf A1", "Chiller R3", "Freezer F2"
  expiryTracking: boolean;
  batchTracking: boolean;
  fefoEnabled: boolean;
  batches?: InventoryBatch[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderRecommendation {
  itemId: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: UnitOfMeasurement;
  minimumStock: number;
  reorderPoint: number;
  maximumStock: number;
  recommendedOrderQty: number; // maximumStock - currentStock
  supplierId?: string;
  supplierName?: string;
  estimatedCost: number;
  urgency: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface InventorySummary {
  totalSkus: number;
  totalValue: number;
  optimalCount: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
  expiringCount: number; // Expiring < 30 days
  expiredCount: number;
  totalWasteValueMonth: number;
  stockAccuracyPercentage: number;
  positiveVarianceCount: number;
  negativeVarianceCount: number;
}
