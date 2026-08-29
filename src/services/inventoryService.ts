/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY SERVICE
 * Core service layer managing inventory master items, status, valuation,
 * FEFO batch tracking, and reorder recommendations.
 */

import {
  InventoryItem,
  InventorySummary,
  ReorderRecommendation,
  StockStatus,
  ExpiryRiskLevel,
  InventoryCategory,
} from '../types/inventory';
import { InventoryCostContract } from '../types/contracts';
import { MOCK_INVENTORY_ITEMS } from '../data/mockInventoryData';

const STORAGE_KEY_INVENTORY = 'tropicalos_master_inventory';

class InventoryService {
  private getStorageItems(): InventoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(MOCK_INVENTORY_ITEMS));
        return MOCK_INVENTORY_ITEMS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('[InventoryService] Error reading localStorage:', e);
      return MOCK_INVENTORY_ITEMS;
    }
  }

  private saveStorageItems(items: InventoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
    } catch (e) {
      console.error('[InventoryService] Error saving to localStorage:', e);
    }
  }

  /**
   * Helper to determine stock status
   */
  public getStockStatus(item: InventoryItem): StockStatus {
    const stock = item.currentStock ?? 0;
    if (stock <= 0) return 'OUT_OF_STOCK';
    if (stock <= (item.minimumStock ?? 0)) return 'CRITICAL';
    if (stock <= (item.reorderPoint ?? 0)) return 'LOW_STOCK';
    return 'OPTIMAL';
  }

  /**
   * Helper to determine expiry risk level
   */
  public getExpiryRisk(item: InventoryItem): ExpiryRiskLevel {
    if (!item.expiryTracking || !item.batches || item.batches.length === 0) {
      return 'NONE';
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let highestRisk: ExpiryRiskLevel = 'SAFE';

    for (const batch of item.batches) {
      if (!batch.expiryDate) continue;

      const expDate = new Date(batch.expiryDate);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || batch.expiryDate < todayStr) {
        return 'EXPIRED'; // Immediate return for highest priority
      } else if (diffDays <= 7) {
        highestRisk = 'CRITICAL_EXPIRING';
      } else if (diffDays <= 30 && highestRisk !== 'CRITICAL_EXPIRING') {
        highestRisk = 'WARNING_EXPIRING';
      }
    }

    return highestRisk;
  }

  /**
   * Get all inventory items with optional filters
   */
  public async getInventoryItems(filters?: {
    category?: string;
    location?: string;
    status?: StockStatus | 'ALL';
    expiryRisk?: ExpiryRiskLevel | 'ALL';
    searchQuery?: string;
  }): Promise<InventoryItem[]> {
    let items = this.getStorageItems();

    if (!filters) return items;

    const query = (filters.searchQuery || '').toLowerCase().trim();

    return items.filter((item) => {
      // Category filter
      if (filters.category && filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location !== 'ALL') {
        const itemLoc = `${item.storageArea || ''} ${item.storageLocation || ''}`.toLowerCase();
        if (!itemLoc.includes(filters.location.toLowerCase())) return false;
      }

      // Stock status filter
      if (filters.status && filters.status !== 'ALL') {
        const itemStatus = this.getStockStatus(item);
        if (itemStatus !== filters.status) return false;
      }

      // Expiry risk filter
      if (filters.expiryRisk && filters.expiryRisk !== 'ALL') {
        const risk = this.getExpiryRisk(item);
        if (risk !== filters.expiryRisk) return false;
      }

      // Search query filter
      if (query) {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const skuMatch = (item.sku || '').toLowerCase().includes(query);
        const catMatch = (item.category || '').toLowerCase().includes(query);
        const supplierMatch = (item.supplierName || '').toLowerCase().includes(query);
        if (!nameMatch && !skuMatch && !catMatch && !supplierMatch) return false;
      }

      return true;
    });
  }

  /**
   * Get single inventory item by ID
   */
  public async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const items = this.getStorageItems();
    return items.find((i) => i.id === id) || null;
  }

  /**
   * Create new inventory item
   */
  public async createInventoryItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'stockValue'>): Promise<InventoryItem> {
    const items = this.getStorageItems();
    const now = new Date().toISOString();

    const stockValue = (data.currentStock ?? 0) * (data.averageCost ?? 0);

    const newItem: InventoryItem = {
      ...data,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stockValue,
      active: data.active ?? true,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newItem);
    this.saveStorageItems(items);
    return newItem;
  }

  /**
   * Update existing inventory item
   */
  public async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const items = this.getStorageItems();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      throw new Error(`Inventory item with ID ${id} not found.`);
    }

    const existing = items[index];
    const currentStock = updates.currentStock !== undefined ? updates.currentStock : existing.currentStock;
    const averageCost = updates.averageCost !== undefined ? updates.averageCost : existing.averageCost;
    const stockValue = currentStock * averageCost;

    const updatedItem: InventoryItem = {
      ...existing,
      ...updates,
      stockValue,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    this.saveStorageItems(items);
    return updatedItem;
  }

  /**
   * Direct stock quantity update (called by StockMovementService)
   */
  public updateStockQuantity(itemId: string, qtyDelta: number, newAverageCost?: number, newBatch?: any): void {
    const items = this.getStorageItems();
    const index = items.findIndex((i) => i.id === itemId);

    if (index === -1) return;

    const existing = items[index];
    const newStock = Math.max(0, (existing.currentStock ?? 0) + qtyDelta);
    const avgCost = newAverageCost !== undefined ? newAverageCost : existing.averageCost;
    const stockValue = newStock * avgCost;

    // FEFO Batch Handling
    let updatedBatches = existing.batches ? [...existing.batches] : [];
    if (newBatch && qtyDelta > 0) {
      updatedBatches.push(newBatch);
    } else if (qtyDelta < 0 && updatedBatches.length > 0) {
      // Consume stock from earliest expiring batch (FEFO)
      let consumeQty = Math.abs(qtyDelta);
      updatedBatches.sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'));

      for (let i = 0; i < updatedBatches.length; i++) {
        if (consumeQty <= 0) break;
        if (updatedBatches[i].quantity <= consumeQty) {
          consumeQty -= updatedBatches[i].quantity;
          updatedBatches[i].quantity = 0;
        } else {
          updatedBatches[i].quantity -= consumeQty;
          consumeQty = 0;
        }
      }
      updatedBatches = updatedBatches.filter((b) => b.quantity > 0);
    }

    items[index] = {
      ...existing,
      currentStock: newStock,
      averageCost: avgCost,
      stockValue,
      batches: updatedBatches,
      updatedAt: new Date().toISOString(),
    };

    this.saveStorageItems(items);
  }

  /**
   * Reorder Recommendations (Restock Alert Engine)
   */
  public async getReorderRecommendations(): Promise<ReorderRecommendation[]> {
    const items = this.getStorageItems();

    const recommendations: ReorderRecommendation[] = [];

    for (const item of items) {
      if (!item.active) continue;

      const stock = item.currentStock ?? 0;
      const reorderPoint = item.reorderPoint ?? 0;
      const minStock = item.minimumStock ?? 0;
      const maxStock = item.maximumStock ?? reorderPoint * 2;

      if (stock <= reorderPoint) {
        const recommendedOrderQty = Math.max(1, maxStock - stock);
        const urgency = stock <= minStock ? 'CRITICAL' : 'WARNING';
        const estimatedCost = recommendedOrderQty * (item.lastPurchaseCost || item.averageCost || 0);

        recommendations.push({
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          currentStock: stock,
          unit: item.unit,
          minimumStock: minStock,
          reorderPoint: reorderPoint,
          maximumStock: maxStock,
          recommendedOrderQty,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          estimatedCost,
          urgency,
        });
      }
    }

    return recommendations.sort((a, b) => (a.urgency === 'CRITICAL' ? -1 : 1));
  }

  /**
   * Expiring Items Report (FEFO Alert)
   */
  public async getExpiringItems(days: number = 30): Promise<{ item: InventoryItem; batchNumber: string; expiryDate: string; daysRemaining: number; qty: number }[]> {
    const items = this.getStorageItems();
    const result: { item: InventoryItem; batchNumber: string; expiryDate: string; daysRemaining: number; qty: number }[] = [];

    const now = new Date();

    for (const item of items) {
      if (!item.expiryTracking || !item.batches) continue;

      for (const batch of item.batches) {
        if (!batch.expiryDate) continue;

        const expDate = new Date(batch.expiryDate);
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= days) {
          result.push({
            item,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate,
            daysRemaining: diffDays,
            qty: batch.quantity,
          });
        }
      }
    }

    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Overall Inventory Executive Dashboard Summary
   */
  public async getInventorySummary(): Promise<InventorySummary> {
    const items = this.getStorageItems();

    let totalValue = 0;
    let optimalCount = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;

    for (const item of items) {
      const val = (item.currentStock ?? 0) * (item.averageCost ?? 0);
      totalValue += val;

      const status = this.getStockStatus(item);
      if (status === 'OPTIMAL') optimalCount++;
      else if (status === 'LOW_STOCK') lowStockCount++;
      else if (status === 'CRITICAL') criticalStockCount++;
      else if (status === 'OUT_OF_STOCK') outOfStockCount++;

      const risk = this.getExpiryRisk(item);
      if (risk === 'EXPIRED') expiredCount++;
      else if (risk === 'CRITICAL_EXPIRING' || risk === 'WARNING_EXPIRING') expiringCount++;
    }

    return {
      totalSkus: items.length,
      totalValue,
      optimalCount,
      lowStockCount,
      criticalStockCount,
      outOfStockCount,
      expiringCount,
      expiredCount,
      totalWasteValueMonth: 48000, // Sync with mock wasting log total
      stockAccuracyPercentage: 95.2,
      positiveVarianceCount: 0,
      negativeVarianceCount: 1,
    };
  }

  /**
   * Get shared Inventory Cost Contracts for Recipe / Production / Finance
   */
  public async getInventoryCostContracts(): Promise<InventoryCostContract[]> {
    const items = this.getStorageItems();
    return items.map((item) => {
      const avgCost = Number(item.averageCost ?? item.lastPurchaseCost ?? 0);
      const stock = Number(item.currentStock ?? 0);
      return {
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: stock,
        minimumStock: Number(item.minimumStock ?? 0),
        averageCost: avgCost,
        lastPurchaseCost: Number(item.lastPurchaseCost ?? avgCost),
        totalValuation: Math.round(stock * avgCost),
        lastUpdatedAt: (item as any).lastRestockedAt || item.updatedAt || new Date().toISOString(),
      };
    });
  }

  /**
   * Reset Inventory Master Data to Defaults
   */
  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_INVENTORY);
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(MOCK_INVENTORY_ITEMS));
  }
}

export const inventoryService = new InventoryService();
