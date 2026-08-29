/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — IKA (Instruksi Kerja Alat & Teknis) Service
 * Manages equipment operational instructions, safety warnings (K3),
 * troubleshooting matrices, and linkage to SOPs and Checklist items.
 */

import {
  IkaDocument,
  IkaFilterParams,
} from '../types/operationalKnowledge';
import { INITIAL_IKAS } from '../data/mockOperationalKnowledge';

const STORAGE_KEY = 'tropicalos_master_ikas';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class IkaServiceClass {
  private getStoredIkas(): IkaDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[IkaService] Error reading IKAs from localStorage:', e);
    }
    this.saveToStorage(INITIAL_IKAS);
    return INITIAL_IKAS;
  }

  private saveToStorage(ikas: IkaDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ikas));
    } catch (e) {
      console.error('[IkaService] Error saving IKAs to localStorage:', e);
    }
  }

  /**
   * Get all IKAs with optional filtering
   */
  public async getIkas(params?: IkaFilterParams): Promise<IkaDocument[]> {
    await delay(120);
    let list = this.getStoredIkas();

    if (!params) return list;

    if (params.division && params.division !== 'ALL') {
      list = list.filter((ika) => ika.division === params.division || ika.division === 'ALL');
    }

    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.toLowerCase().trim();
      list = list.filter(
        (ika) =>
          ika.title.toLowerCase().includes(q) ||
          ika.code.toLowerCase().includes(q) ||
          ika.equipmentName.toLowerCase().includes(q) ||
          ika.brandModel.toLowerCase().includes(q) ||
          ika.locationStation.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get IKA by ID
   */
  public async getIkaById(id: string): Promise<IkaDocument | null> {
    await delay(80);
    const list = this.getStoredIkas();
    return list.find((i) => i.id === id) || null;
  }

  /**
   * Create a new IKA document
   */
  public async createIka(data: Omit<IkaDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<IkaDocument> {
    await delay(150);
    const list = this.getStoredIkas();
    const newId = `ika-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newIka: IkaDocument = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newIka);
    this.saveToStorage(list);
    return newIka;
  }

  /**
   * Update an existing IKA
   */
  public async updateIka(id: string, updates: Partial<IkaDocument>): Promise<IkaDocument> {
    await delay(150);
    const list = this.getStoredIkas();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`IKA dengan ID "${id}" tidak ditemukan.`);

    const existing = list[index];
    const updated: IkaDocument = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  /**
   * Delete an IKA
   */
  public async deleteIka(id: string): Promise<boolean> {
    await delay(120);
    let list = this.getStoredIkas();
    list = list.filter((i) => i.id !== id);
    this.saveToStorage(list);
    return true;
  }

  /**
   * Get IKA statistics
   */
  public async getIkaStats(): Promise<{
    total: number;
    byDivision: Record<string, number>;
  }> {
    const list = this.getStoredIkas();
    const total = list.length;
    const byDivision: Record<string, number> = {};

    for (const ika of list) {
      byDivision[ika.division] = (byDivision[ika.division] || 0) + 1;
    }

    return {
      total,
      byDivision,
    };
  }
}

export const ikaService = new IkaServiceClass();
