/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Standard Operating Procedure (SOP) Service
 * Manages SOP lifecycle, versioning, employee read acknowledgments,
 * search/filters, and linkage to Job Descriptions, IKAs, and Checklists.
 */

import {
  SopDocument,
  SopFilterParams,
  DocumentWorkflowStatus,
} from '../types/operationalKnowledge';
import { INITIAL_SOPS } from '../data/mockOperationalKnowledge';

const STORAGE_KEY = 'tropicalos_master_sops';

// Helper to simulate realistic async network delay
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class SopServiceClass {
  private getStoredSops(): SopDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[SopService] Error reading SOPs from localStorage:', e);
    }
    this.saveToStorage(INITIAL_SOPS);
    return INITIAL_SOPS;
  }

  private saveToStorage(sops: SopDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sops));
    } catch (e) {
      console.error('[SopService] Error saving SOPs to localStorage:', e);
    }
  }

  /**
   * Get all SOPs with optional filtering
   */
  public async getSops(params?: SopFilterParams): Promise<SopDocument[]> {
    await delay(120);
    let list = this.getStoredSops();

    if (!params) return list;

    if (params.division && params.division !== 'ALL') {
      list = list.filter((sop) => sop.division === params.division || sop.division === 'ALL');
    }

    if (params.category && params.category !== 'ALL') {
      list = list.filter((sop) => sop.category === params.category);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((sop) => sop.status === params.status);
    }

    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.toLowerCase().trim();
      list = list.filter(
        (sop) =>
          sop.title.toLowerCase().includes(q) ||
          sop.code.toLowerCase().includes(q) ||
          sop.purpose.toLowerCase().includes(q) ||
          sop.authorName.toLowerCase().includes(q) ||
          sop.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Get SOP by ID
   */
  public async getSopById(id: string): Promise<SopDocument | null> {
    await delay(80);
    const list = this.getStoredSops();
    return list.find((s) => s.id === id) || null;
  }

  /**
   * Create a new SOP document
   */
  public async createSop(data: Omit<SopDocument, 'id' | 'createdAt' | 'updatedAt' | 'acknowledgments' | 'revisionHistory'>): Promise<SopDocument> {
    await delay(150);
    const list = this.getStoredSops();
    const newId = `sop-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newSop: SopDocument = {
      ...data,
      id: newId,
      acknowledgments: [],
      revisionHistory: [
        {
          version: data.version || '1.0',
          revisedAt: now.split('T')[0],
          revisedBy: data.authorName,
          changeSummary: 'Penerbitan dokumen SOP baru.',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newSop);
    this.saveToStorage(list);
    return newSop;
  }

  /**
   * Update an existing SOP
   */
  public async updateSop(id: string, updates: Partial<SopDocument>): Promise<SopDocument> {
    await delay(150);
    const list = this.getStoredSops();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`SOP dengan ID "${id}" tidak ditemukan.`);

    const existing = list[index];
    const updated: SopDocument = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  /**
   * Acknowledge SOP (Employee marks as read & understood)
   */
  public async acknowledgeSop(
    sopId: string,
    employeeId: string,
    employeeName: string,
    position: string,
    notes?: string
  ): Promise<SopDocument> {
    await delay(120);
    const list = this.getStoredSops();
    const sop = list.find((s) => s.id === sopId);
    if (!sop) throw new Error('SOP tidak ditemukan.');

    // Check if already acknowledged
    const existingIndex = sop.acknowledgments.findIndex((a) => a.employeeId === employeeId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      sop.acknowledgments[existingIndex] = {
        employeeId,
        employeeName,
        position,
        acknowledgedAt: now,
        notes,
      };
    } else {
      sop.acknowledgments.push({
        employeeId,
        employeeName,
        position,
        acknowledgedAt: now,
        notes,
      });
    }

    sop.updatedAt = now;
    this.saveToStorage(list);
    return sop;
  }

  /**
   * Create a new version of an SOP
   */
  public async createNewVersion(
    sopId: string,
    newVersion: string,
    changeSummary: string,
    revisedBy: string,
    updates: Partial<SopDocument>
  ): Promise<SopDocument> {
    await delay(150);
    const list = this.getStoredSops();
    const sop = list.find((s) => s.id === sopId);
    if (!sop) throw new Error('SOP tidak ditemukan.');

    const now = new Date().toISOString();
    sop.version = newVersion;
    sop.revisionHistory.unshift({
      version: newVersion,
      revisedAt: now.split('T')[0],
      revisedBy,
      changeSummary,
    });

    Object.assign(sop, updates);
    sop.updatedAt = now;

    this.saveToStorage(list);
    return sop;
  }

  /**
   * Delete an SOP
   */
  public async deleteSop(id: string): Promise<boolean> {
    await delay(120);
    let list = this.getStoredSops();
    list = list.filter((s) => s.id !== id);
    this.saveToStorage(list);
    return true;
  }

  /**
   * Get SOP statistics
   */
  public async getSopStats(): Promise<{
    total: number;
    active: number;
    pendingReview: number;
    byDivision: Record<string, number>;
    totalAcknowledgments: number;
  }> {
    const list = this.getStoredSops();
    const total = list.length;
    const active = list.filter((s) => s.status === 'ACTIVE').length;
    const pendingReview = list.filter((s) => s.status === 'PENDING_REVIEW' || s.status === 'DRAFT').length;

    const byDivision: Record<string, number> = {};
    let totalAcknowledgments = 0;

    for (const sop of list) {
      byDivision[sop.division] = (byDivision[sop.division] || 0) + 1;
      totalAcknowledgments += sop.acknowledgments?.length || 0;
    }

    return {
      total,
      active,
      pendingReview,
      byDivision,
      totalAcknowledgments,
    };
  }
}

export const sopService = new SopServiceClass();
