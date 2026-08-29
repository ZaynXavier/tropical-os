/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK OPNAME SERVICE
 * Complete Stock Opname workflow service (Draft -> Counting -> Review -> Approve -> Post)
 * with variance calculation and accuracy scoring.
 */

import { StockOpname, StockOpnameLine, StockOpnameStatus } from '../types/stockOpname';
import { MOCK_STOCK_OPNAMES } from '../data/mockInventoryData';
import { inventoryService } from './inventoryService';
import { stockMovementService } from './stockMovementService';

const STORAGE_KEY_OPNAME = 'tropicalos_master_stock_opname';

class StockOpnameService {
  private getStorageOpnames(): StockOpname[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPNAME);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_OPNAME, JSON.stringify(MOCK_STOCK_OPNAMES));
        return MOCK_STOCK_OPNAMES;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('[StockOpnameService] Error reading localStorage:', e);
      return MOCK_STOCK_OPNAMES;
    }
  }

  private saveStorageOpnames(opnames: StockOpname[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_OPNAME, JSON.stringify(opnames));
    } catch (e) {
      console.error('[StockOpnameService] Error saving localStorage:', e);
    }
  }

  /**
   * Recalculate Stock Opname totals & accuracy
   */
  public calculateOpnameTotals(lines: StockOpnameLine[]): {
    totalSystemItems: number;
    totalCountedItems: number;
    totalMatchedItems: number;
    accuracyPercentage: number;
    totalPositiveVarianceValue: number;
    totalNegativeVarianceValue: number;
    totalNetVarianceValue: number;
  } {
    const totalCountedItems = lines.length;
    let totalMatchedItems = 0;
    let totalPositiveVarianceValue = 0;
    let totalNegativeVarianceValue = 0;

    for (const line of lines) {
      const variance = line.physicalQty - line.systemQty;
      line.varianceQty = variance;
      line.varianceValue = variance * line.unitCost;

      if (variance === 0) {
        totalMatchedItems++;
      } else if (variance > 0) {
        totalPositiveVarianceValue += line.varianceValue;
      } else {
        totalNegativeVarianceValue += line.varianceValue; // negative
      }
    }

    const accuracyPercentage = totalCountedItems > 0 ? (totalMatchedItems / totalCountedItems) * 100 : 100;
    const totalNetVarianceValue = totalPositiveVarianceValue + totalNegativeVarianceValue;

    return {
      totalSystemItems: lines.length,
      totalCountedItems,
      totalMatchedItems,
      accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
      totalPositiveVarianceValue,
      totalNegativeVarianceValue,
      totalNetVarianceValue,
    };
  }

  /**
   * Get all stock opnames
   */
  public async getStockOpnames(): Promise<StockOpname[]> {
    return this.getStorageOpnames();
  }

  /**
   * Get single stock opname by ID
   */
  public async getStockOpnameById(id: string): Promise<StockOpname | null> {
    const opnames = this.getStorageOpnames();
    return opnames.find((o) => o.id === id) || null;
  }

  /**
   * Initialize a new Stock Opname session
   */
  public async createStockOpname(data: {
    location: string;
    categoryFilter?: string;
    notes?: string;
    actorId: string;
    actorName: string;
  }): Promise<StockOpname> {
    const items = await inventoryService.getInventoryItems({
      location: data.location !== 'ALL' ? data.location : undefined,
      category: data.categoryFilter !== 'ALL' ? data.categoryFilter : undefined,
    });

    const lines: StockOpnameLine[] = items.map((item, idx) => ({
      id: `line-${Date.now()}-${idx}`,
      opnameId: '',
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      category: item.category,
      unit: item.unit,
      systemQty: item.currentStock,
      physicalQty: item.currentStock, // Default physical = system
      varianceQty: 0,
      unitCost: item.averageCost || 0,
      varianceValue: 0,
      notes: '',
    }));

    const totals = this.calculateOpnameTotals(lines);
    const now = new Date().toISOString();
    const opnameId = `sop-${Date.now()}`;

    lines.forEach((l) => (l.opnameId = opnameId));

    const newOpname: StockOpname = {
      id: opnameId,
      opnameNumber: `SOP-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      date: now.slice(0, 10),
      location: data.location || 'All Storage Areas',
      categoryFilter: data.categoryFilter,
      status: 'COUNTING',
      lines,
      ...totals,
      notes: data.notes || '',
      countedBy: data.actorId,
      countedByName: data.actorName,
      createdAt: now,
      updatedAt: now,
    };

    const opnames = this.getStorageOpnames();
    opnames.unshift(newOpname);
    this.saveStorageOpnames(opnames);

    return newOpname;
  }

  /**
   * Update physical counts on opname lines
   */
  public async updateOpnameLines(opnameId: string, updatedLines: StockOpnameLine[]): Promise<StockOpname> {
    const opnames = this.getStorageOpnames();
    const index = opnames.findIndex((o) => o.id === opnameId);

    if (index === -1) throw new Error(`Stock opname ${opnameId} not found.`);

    const existing = opnames[index];
    if (existing.status === 'POSTED') {
      throw new Error('Stock opname yang sudah ter-POSTING tidak dapat diubah.');
    }

    const totals = this.calculateOpnameTotals(updatedLines);
    const updated: StockOpname = {
      ...existing,
      lines: updatedLines,
      ...totals,
      updatedAt: new Date().toISOString(),
    };

    opnames[index] = updated;
    this.saveStorageOpnames(opnames);
    return updated;
  }

  /**
   * Submit Opname for Review
   */
  public async submitStockOpname(id: string, actorId: string, actorName: string): Promise<StockOpname> {
    const opnames = this.getStorageOpnames();
    const index = opnames.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Stock opname ${id} not found.`);

    const existing = opnames[index];
    const updated: StockOpname = {
      ...existing,
      status: 'REVIEW',
      reviewedBy: actorId,
      reviewedByName: actorName,
      updatedAt: new Date().toISOString(),
    };

    opnames[index] = updated;
    this.saveStorageOpnames(opnames);
    return updated;
  }

  /**
   * Approve Opname
   */
  public async approveStockOpname(id: string, actorId: string, actorName: string): Promise<StockOpname> {
    const opnames = this.getStorageOpnames();
    const index = opnames.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Stock opname ${id} not found.`);

    const existing = opnames[index];
    const updated: StockOpname = {
      ...existing,
      status: 'APPROVED',
      approvedBy: actorId,
      approvedByName: actorName,
      updatedAt: new Date().toISOString(),
    };

    opnames[index] = updated;
    this.saveStorageOpnames(opnames);
    return updated;
  }

  /**
   * Post Stock Opname (Applies Stock Adjustments to Ledger & Inventory)
   */
  public async postStockOpname(id: string, actorId: string, actorName: string): Promise<StockOpname> {
    const opnames = this.getStorageOpnames();
    const index = opnames.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Stock opname ${id} not found.`);

    const existing = opnames[index];
    if (existing.status === 'POSTED') {
      return existing; // Already posted
    }

    const now = new Date().toISOString();

    // Create adjustment movements for lines with variance
    for (const line of existing.lines) {
      if (line.varianceQty !== 0) {
        await stockMovementService.adjustStock({
          itemId: line.itemId,
          systemQty: line.systemQty,
          physicalQty: line.physicalQty,
          reason: line.reason || `Hasil Stock Opname ${existing.opnameNumber}`,
          actorId,
          actorName,
        });
      }
    }

    const updated: StockOpname = {
      ...existing,
      status: 'POSTED',
      postedBy: actorId,
      postedByName: actorName,
      postedAt: now,
      updatedAt: now,
    };

    opnames[index] = updated;
    this.saveStorageOpnames(opnames);
    return updated;
  }

  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_OPNAME);
    localStorage.setItem(STORAGE_KEY_OPNAME, JSON.stringify(MOCK_STOCK_OPNAMES));
  }
}

export const stockOpnameService = new StockOpnameService();
