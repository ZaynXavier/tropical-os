/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK MOVEMENT SERVICE
 * Immutable stock movement ledger tracking all receipts, transfers,
 * adjustments, waste, staff meals, and opening balances.
 */

import { StockMovement, StockMovementFilterParams, StockMovementType } from '../types/stockMovement';
import { StockMovementRecordContract, StockMovementTypeContract } from '../types/contracts';
import { MOCK_STOCK_MOVEMENTS } from '../data/mockInventoryData';
import { inventoryService } from './inventoryService';
import { UnitOfMeasurement } from '../types/inventory';

const STORAGE_KEY_MOVEMENTS = 'tropicalos_master_stock_movements';

class StockMovementService {
  private getStorageMovements(): StockMovement[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(MOCK_STOCK_MOVEMENTS));
        return MOCK_STOCK_MOVEMENTS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('[StockMovementService] Error reading localStorage:', e);
      return MOCK_STOCK_MOVEMENTS;
    }
  }

  private saveStorageMovements(movements: StockMovement[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('[StockMovementService] Error saving localStorage:', e);
    }
  }

  /**
   * Get all stock movements with optional filtering
   */
  public async getStockMovements(filters?: StockMovementFilterParams): Promise<StockMovement[]> {
    let movements = this.getStorageMovements();

    if (!filters) return movements;

    const query = (filters.searchQuery || '').toLowerCase().trim();

    return movements.filter((m) => {
      if (filters.itemId && m.itemId !== filters.itemId) return false;
      if (filters.category && filters.category !== 'ALL' && m.category !== filters.category) return false;
      if (filters.movementType && filters.movementType !== 'ALL' && m.movementType !== filters.movementType) return false;

      if (filters.startDate) {
        const mDate = m.createdAt.slice(0, 10);
        if (mDate < filters.startDate) return false;
      }
      if (filters.endDate) {
        const mDate = m.createdAt.slice(0, 10);
        if (mDate > filters.endDate) return false;
      }

      if (query) {
        const itemMatch = (m.itemName || '').toLowerCase().includes(query);
        const skuMatch = (m.itemSku || '').toLowerCase().includes(query);
        const refMatch = (m.referenceId || '').toLowerCase().includes(query);
        const userMatch = (m.createdByName || '').toLowerCase().includes(query);
        const reasonMatch = (m.reason || '').toLowerCase().includes(query);
        if (!itemMatch && !skuMatch && !refMatch && !userMatch && !reasonMatch) return false;
      }

      return true;
    });
  }

  /**
   * Get stock movements for a specific item ID
   */
  public async getStockMovementsByItem(itemId: string): Promise<StockMovement[]> {
    const movements = this.getStorageMovements();
    return movements.filter((m) => m.itemId === itemId);
  }

  /**
   * RECEIVING: Record PURCHASE_RECEIVE movement
   */
  public async receiveStock(data: {
    itemId: string;
    quantity: number; // in baseUnit or converted
    unit: UnitOfMeasurement;
    unitCost: number;
    supplierId?: string;
    supplierName?: string;
    batchNumber?: string;
    expiryDate?: string; // YYYY-MM-DD
    destinationLocation?: string;
    invoiceNumber?: string;
    notes?: string;
    actorId: string;
    actorName: string;
  }): Promise<StockMovement> {
    const item = await inventoryService.getInventoryItemById(data.itemId);
    if (!item) throw new Error(`Inventory item ${data.itemId} not found.`);

    const now = new Date().toISOString();
    const qty = Math.abs(data.quantity);
    const totalValue = qty * data.unitCost;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      category: item.category,
      movementType: 'PURCHASE_RECEIVE',
      quantity: qty,
      unit: data.unit || item.unit,
      unitCost: data.unitCost,
      totalValue,
      batchNumber: data.batchNumber || `BAT-${Date.now().toString().slice(-6)}`,
      expiryDate: data.expiryDate,
      sourceLocation: data.supplierName || 'Supplier',
      destinationLocation: data.destinationLocation || item.storageArea,
      referenceType: 'RECEIVING',
      referenceId: data.invoiceNumber || `RCV-${Date.now().toString().slice(-6)}`,
      reason: data.notes || 'Penerimaan barang dari supplier',
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    // Save movement to ledger
    const movements = this.getStorageMovements();
    movements.unshift(movement);
    this.saveStorageMovements(movements);

    // Update inventory item stock balance
    // Calculate new weighted average cost
    const currentStock = item.currentStock || 0;
    const currentAvgCost = item.averageCost || 0;
    const newStock = currentStock + qty;
    const newAvgCost = newStock > 0 ? ((currentStock * currentAvgCost) + (qty * data.unitCost)) / newStock : data.unitCost;

    const batch = data.batchNumber
      ? {
          batchNumber: data.batchNumber,
          quantity: qty,
          unitCost: data.unitCost,
          expiryDate: data.expiryDate,
          receivedDate: now.slice(0, 10),
          supplierId: data.supplierId,
        }
      : undefined;

    inventoryService.updateStockQuantity(item.id, qty, newAvgCost, batch);

    return movement;
  }

  /**
   * TRANSFER: Record TRANSFER_OUT and TRANSFER_IN
   */
  public async transferStock(data: {
    itemId: string;
    quantity: number;
    sourceLocation: string;
    destinationLocation: string;
    reason?: string;
    actorId: string;
    actorName: string;
  }): Promise<{ transferOut: StockMovement; transferIn: StockMovement }> {
    const item = await inventoryService.getInventoryItemById(data.itemId);
    if (!item) throw new Error(`Inventory item ${data.itemId} not found.`);

    if ((item.currentStock || 0) < data.quantity) {
      throw new Error(`Stok tidak mencukupi untuk transfer. Stok saat ini: ${item.currentStock} ${item.unit}.`);
    }

    const now = new Date().toISOString();
    const refId = `TRF-${Date.now().toString().slice(-6)}`;
    const unitCost = item.averageCost || 0;
    const totalValue = data.quantity * unitCost;

    const transferOut: StockMovement = {
      id: `mov-${Date.now()}-out`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      category: item.category,
      movementType: 'TRANSFER_OUT',
      quantity: data.quantity,
      unit: item.unit,
      unitCost,
      totalValue,
      sourceLocation: data.sourceLocation,
      destinationLocation: data.destinationLocation,
      referenceType: 'TRANSFER',
      referenceId: refId,
      reason: data.reason || `Transfer stok dari ${data.sourceLocation} ke ${data.destinationLocation}`,
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    const transferIn: StockMovement = {
      id: `mov-${Date.now()}-in`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      category: item.category,
      movementType: 'TRANSFER_IN',
      quantity: data.quantity,
      unit: item.unit,
      unitCost,
      totalValue,
      sourceLocation: data.sourceLocation,
      destinationLocation: data.destinationLocation,
      referenceType: 'TRANSFER',
      referenceId: refId,
      reason: data.reason || `Transfer stok dari ${data.sourceLocation} ke ${data.destinationLocation}`,
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    const movements = this.getStorageMovements();
    movements.unshift(transferOut, transferIn);
    this.saveStorageMovements(movements);

    return { transferOut, transferIn };
  }

  /**
   * ADJUSTMENT: Record ADJUSTMENT_IN or ADJUSTMENT_OUT
   */
  public async adjustStock(data: {
    itemId: string;
    systemQty: number;
    physicalQty: number;
    reason: string;
    actorId: string;
    actorName: string;
  }): Promise<StockMovement> {
    const item = await inventoryService.getInventoryItemById(data.itemId);
    if (!item) throw new Error(`Inventory item ${data.itemId} not found.`);

    const delta = data.physicalQty - data.systemQty;
    if (delta === 0) {
      throw new Error('Jumlah fisik sama dengan jumlah sistem, tidak ada penyesuaian.');
    }

    const movementType: StockMovementType = delta > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
    const absQty = Math.abs(delta);
    const unitCost = item.averageCost || 0;
    const totalValue = absQty * unitCost;
    const now = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${Date.now()}-adj`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      category: item.category,
      movementType,
      quantity: absQty,
      unit: item.unit,
      unitCost,
      totalValue,
      sourceLocation: item.storageArea,
      referenceType: 'ADJUSTMENT',
      referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
      reason: data.reason,
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    const movements = this.getStorageMovements();
    movements.unshift(movement);
    this.saveStorageMovements(movements);

    // Update stock in inventory
    const qtyDelta = delta; // positive or negative
    inventoryService.updateStockQuantity(item.id, qtyDelta);

    return movement;
  }

  /**
   * STAFF MEAL: Record STAFF_MEAL movement
   */
  public async recordStaffMeal(data: {
    itemId: string;
    quantity: number;
    reason?: string;
    actorId: string;
    actorName: string;
  }): Promise<StockMovement> {
    const item = await inventoryService.getInventoryItemById(data.itemId);
    if (!item) throw new Error(`Inventory item ${data.itemId} not found.`);

    const now = new Date().toISOString();
    const unitCost = item.averageCost || 0;
    const totalValue = data.quantity * unitCost;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-sm`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      category: item.category,
      movementType: 'STAFF_MEAL',
      quantity: data.quantity,
      unit: item.unit,
      unitCost,
      totalValue,
      sourceLocation: item.storageArea,
      referenceType: 'STAFF_MEAL',
      referenceId: `SM-${Date.now().toString().slice(-6)}`,
      reason: data.reason || 'Jatah makan/minuman staf',
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    const movements = this.getStorageMovements();
    movements.unshift(movement);
    this.saveStorageMovements(movements);

    // Decrement stock
    inventoryService.updateStockQuantity(item.id, -data.quantity);

    return movement;
  }

  /**
   * WASTE: Record WASTE movement (Synced with Wasting Log)
   */
  public async recordWasteMovement(data: {
    itemId?: string;
    itemName: string;
    category?: string;
    quantity: number;
    unit: string;
    unitCost: number;
    reason: string;
    wastingLogId?: string;
    actorId: string;
    actorName: string;
  }): Promise<StockMovement> {
    let item = data.itemId ? await inventoryService.getInventoryItemById(data.itemId) : null;

    if (!item) {
      // Find item by name matching
      const allItems = await inventoryService.getInventoryItems();
      item = allItems.find((i) => i.name.toLowerCase() === data.itemName.toLowerCase()) || null;
    }

    const now = new Date().toISOString();
    const unitCost = data.unitCost || (item ? item.averageCost : 0);
    const totalValue = data.quantity * unitCost;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-wst`,
      itemId: item ? item.id : `raw-${Date.now()}`,
      itemSku: item ? item.sku : 'SKU-WST-RAW',
      itemName: data.itemName,
      category: item ? item.category : data.category || 'Other',
      movementType: 'WASTE',
      quantity: data.quantity,
      unit: (data.unit as UnitOfMeasurement) || (item ? item.unit : 'Pcs'),
      unitCost,
      totalValue,
      sourceLocation: item ? item.storageArea : 'Kitchen',
      referenceType: 'WASTE_LOG',
      referenceId: data.wastingLogId || `WST-${Date.now().toString().slice(-6)}`,
      reason: data.reason,
      createdBy: data.actorId,
      createdByName: data.actorName,
      createdAt: now,
    };

    const movements = this.getStorageMovements();
    movements.unshift(movement);
    this.saveStorageMovements(movements);

    if (item) {
      // Decrement stock in inventory
      inventoryService.updateStockQuantity(item.id, -data.quantity);
    }

    return movement;
  }

  /**
   * GENERAL: Record custom stock movement (e.g. PRODUCTION_OUT, PRODUCTION_IN, SALE_CONSUMPTION)
   */
  public async recordMovement(data: {
    itemId: string;
    itemSku?: string;
    itemName: string;
    category?: string;
    movementType: StockMovementType;
    quantity: number;
    unit: UnitOfMeasurement;
    unitCost: number;
    totalValue?: number;
    batchNumber?: string;
    expiryDate?: string;
    sourceLocation?: string;
    destinationLocation?: string;
    referenceType?: 'RECEIVING' | 'TRANSFER' | 'ADJUSTMENT' | 'OPNAME' | 'WASTE_LOG' | 'STAFF_MEAL' | 'SYSTEM';
    referenceId?: string;
    reason?: string;
    createdBy: string;
    createdByName?: string;
  }): Promise<StockMovement> {
    const now = new Date().toISOString();
    const qty = Math.abs(data.quantity);
    const totalValue = data.totalValue ?? qty * data.unitCost;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: data.itemId,
      itemSku: data.itemSku || 'SKU-GEN',
      itemName: data.itemName,
      category: data.category || 'General',
      movementType: data.movementType,
      quantity: qty,
      unit: data.unit,
      unitCost: data.unitCost,
      totalValue,
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate,
      sourceLocation: data.sourceLocation,
      destinationLocation: data.destinationLocation,
      referenceType: data.referenceType || 'SYSTEM',
      referenceId: data.referenceId,
      reason: data.reason,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdAt: now,
    };

    const movements = this.getStorageMovements();
    movements.unshift(movement);
    this.saveStorageMovements(movements);

    // Update inventory quantity
    if (data.movementType === 'PRODUCTION_OUT' || data.movementType === 'SALE_CONSUMPTION' || data.movementType === 'WASTE') {
      inventoryService.updateStockQuantity(data.itemId, -qty);
    } else if (data.movementType === 'PRODUCTION_IN' || data.movementType === 'PURCHASE_RECEIVE') {
      inventoryService.updateStockQuantity(data.itemId, qty, data.unitCost);
    }

    return movement;
  }

  /**
   * Export movements to CSV string
   */
  public exportMovementsToCsv(movements: StockMovement[]): string {
    const headers = ['ID', 'Waktu', 'SKU', 'Nama Barang', 'Kategori', 'Tipe Movement', 'Jumlah', 'Satuan', 'Harga Satuan (Rp)', 'Total Nilai (Rp)', 'Lokasi Asal', 'Lokasi Tujuan', 'Referensi ID', 'Alasan', 'Petugas'];

    const rows = movements.map((m) => [
      m.id,
      m.createdAt,
      m.itemSku,
      `"${m.itemName.replace(/"/g, '""')}"`,
      m.category,
      m.movementType,
      m.quantity,
      m.unit,
      m.unitCost,
      m.totalValue,
      m.sourceLocation || '-',
      m.destinationLocation || '-',
      m.referenceId || '-',
      `"${(m.reason || '').replace(/"/g, '""')}"`,
      m.createdByName || m.createdBy,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Get shared Stock Movement Ledger Contracts
   */
  public async getStockMovementRecordContracts(filters?: StockMovementFilterParams): Promise<StockMovementRecordContract[]> {
    const movements = await this.getStockMovements(filters);
    return movements.map((m) => {
      let contractType: StockMovementTypeContract = 'STOCK_ADJUSTMENT';
      if (m.movementType === 'PURCHASE_RECEIVE') contractType = 'PURCHASE_RECEIPT';
      else if (m.movementType === 'PRODUCTION_OUT') contractType = 'PRODUCTION_USAGE';
      else if (m.movementType === 'PRODUCTION_IN') contractType = 'PRODUCTION_YIELD';
      else if (m.movementType === 'WASTE') contractType = 'WASTING';
      else if (m.movementType === 'TRANSFER_IN' || m.movementType === 'TRANSFER_OUT') contractType = 'TRANSFER';
      else if (m.movementType === 'SALE_CONSUMPTION') contractType = 'SALES_VARIANCE';

      return {
        movementId: m.id,
        itemId: m.itemId,
        itemSku: m.itemSku,
        itemName: m.itemName,
        movementType: contractType,
        quantityChange: m.quantity,
        unit: m.unit,
        unitCost: m.unitCost,
        totalValue: m.totalValue,
        referenceNumber: m.referenceId || m.id,
        notes: m.reason,
        performedBy: m.createdByName || m.createdBy,
        timestamp: m.createdAt,
      };
    });
  }

  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_MOVEMENTS);
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(MOCK_STOCK_MOVEMENTS));
  }
}

export const stockMovementService = new StockMovementService();
