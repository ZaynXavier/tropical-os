/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — SUPPLIER SERVICE
 * Manages Master Supplier directory, ratings, and performance simulations.
 */

import { Supplier, SupplierStatus, SupplierPerformance } from '../types/procurement';
import { MOCK_PROCUREMENT_SUPPLIERS, MOCK_SUPPLIER_PERFORMANCE } from '../data/mockProcurementData';

const STORAGE_KEY = 'tropicalos_master_suppliers';

const getStoredSuppliers = (): Supplier[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROCUREMENT_SUPPLIERS));
      return MOCK_PROCUREMENT_SUPPLIERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PROCUREMENT_SUPPLIERS;
  } catch (err) {
    console.error('Error reading suppliers from localStorage:', err);
    return MOCK_PROCUREMENT_SUPPLIERS;
  }
};

const saveSuppliers = (data: Supplier[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving suppliers to localStorage:', err);
  }
};

export const supplierService = {
  async getSuppliers(): Promise<Supplier[]> {
    return getStoredSuppliers();
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    const list = getStoredSuppliers();
    return list.find((s) => s.id === id) || null;
  },

  async createSupplier(
    data: Omit<Supplier, 'id' | 'supplierCode' | 'createdAt' | 'updatedAt'>,
    actorId: string = 'SYSTEM'
  ): Promise<Supplier> {
    const list = getStoredSuppliers();
    const count = list.length + 1;
    const catCode = (data.category || 'OTH').substring(0, 3).toUpperCase();
    const supplierCode = `SUP-${catCode}-${count < 10 ? '0' + count : count}`;
    
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      supplierCode,
      createdAt: new Date().toISOString(),
      createdBy: actorId,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newSupplier, ...list];
    saveSuppliers(updated);
    return newSupplier;
  },

  async updateSupplier(id: string, data: Partial<Supplier>, actorId: string = 'SYSTEM'): Promise<Supplier> {
    const list = getStoredSuppliers();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Supplier with ID ${id} not found.`);

    const updatedItem: Supplier = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };

    list[index] = updatedItem;
    saveSuppliers(list);
    return updatedItem;
  },

  async updateSupplierStatus(id: string, status: SupplierStatus, actorId: string = 'SYSTEM'): Promise<Supplier> {
    return this.updateSupplier(id, { status }, actorId);
  },

  async getSupplierPerformance(supplierId: string): Promise<SupplierPerformance | null> {
    const mockPerf = MOCK_SUPPLIER_PERFORMANCE.find((p) => p.supplierId === supplierId);
    if (mockPerf) return mockPerf;

    const supplier = await this.getSupplierById(supplierId);
    if (!supplier) return null;

    return {
      supplierId,
      supplierName: supplier.supplierName,
      onTimeDeliveryScore: 90,
      priceConsistencyScore: 90,
      orderFulfillmentScore: 92,
      qualityRatingScore: Math.round(supplier.rating * 20),
      overallScore: Math.round((90 + 90 + 92 + supplier.rating * 20) / 4),
      ratingTier: supplier.rating >= 4.5 ? 'EXCELLENT' : supplier.rating >= 4.0 ? 'GOOD' : 'NEEDS_ATTENTION',
      totalOrders: 10,
      completedOrders: 9,
      onTimeOrders: 9,
    };
  },

  async getAllSupplierPerformances(): Promise<SupplierPerformance[]> {
    const suppliers = await this.getSuppliers();
    const results: SupplierPerformance[] = [];
    for (const sup of suppliers) {
      const perf = await this.getSupplierPerformance(sup.id);
      if (perf) results.push(perf);
    }
    return results;
  },

  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
