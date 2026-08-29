/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Job Description Service
 * Manages Master Job Descriptions for all restaurant roles, core duties,
 * KPIs, required qualifications, and linkage to SOPs, IKAs, and Checklists.
 */

import {
  JobDescriptionDocument,
  JobDescriptionFilterParams,
} from '../types/operationalKnowledge';
import { INITIAL_JOB_DESCRIPTIONS } from '../data/mockOperationalKnowledge';

const STORAGE_KEY = 'tropicalos_master_job_descriptions';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class JobDescriptionServiceClass {
  private getStoredJobDescriptions(): JobDescriptionDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[JobDescriptionService] Error reading JDs from localStorage:', e);
    }
    this.saveToStorage(INITIAL_JOB_DESCRIPTIONS);
    return INITIAL_JOB_DESCRIPTIONS;
  }

  private saveToStorage(jds: JobDescriptionDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jds));
    } catch (e) {
      console.error('[JobDescriptionService] Error saving JDs to localStorage:', e);
    }
  }

  /**
   * Get all job descriptions with filtering
   */
  public async getJobDescriptions(params?: JobDescriptionFilterParams): Promise<JobDescriptionDocument[]> {
    await delay(120);
    let list = this.getStoredJobDescriptions();

    if (!params) return list;

    if (params.division && params.division !== 'ALL') {
      list = list.filter((jd) => jd.division === params.division || jd.division === 'ALL');
    }

    if (params.gradeLevel && params.gradeLevel !== 'ALL') {
      list = list.filter((jd) => jd.gradeLevel === params.gradeLevel);
    }

    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.toLowerCase().trim();
      list = list.filter(
        (jd) =>
          jd.positionTitle.toLowerCase().includes(q) ||
          jd.positionCode.toLowerCase().includes(q) ||
          jd.department.toLowerCase().includes(q) ||
          jd.jobSummary.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get JD by ID
   */
  public async getJobDescriptionById(id: string): Promise<JobDescriptionDocument | null> {
    await delay(80);
    const list = this.getStoredJobDescriptions();
    return list.find((j) => j.id === id) || null;
  }

  /**
   * Get JD by Position Title
   */
  public async getJobDescriptionByTitle(title: string): Promise<JobDescriptionDocument | null> {
    await delay(80);
    const list = this.getStoredJobDescriptions();
    const t = title.toLowerCase().trim();
    return list.find((j) => j.positionTitle.toLowerCase().includes(t) || t.includes(j.positionTitle.toLowerCase())) || null;
  }

  /**
   * Create a new Job Description
   */
  public async createJobDescription(data: Omit<JobDescriptionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobDescriptionDocument> {
    await delay(150);
    const list = this.getStoredJobDescriptions();
    const newId = `jd-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newJd: JobDescriptionDocument = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newJd);
    this.saveToStorage(list);
    return newJd;
  }

  /**
   * Update an existing Job Description
   */
  public async updateJobDescription(id: string, updates: Partial<JobDescriptionDocument>): Promise<JobDescriptionDocument> {
    await delay(150);
    const list = this.getStoredJobDescriptions();
    const index = list.findIndex((j) => j.id === id);
    if (index === -1) throw new Error(`Job Description dengan ID "${id}" tidak ditemukan.`);

    const existing = list[index];
    const updated: JobDescriptionDocument = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  /**
   * Delete a Job Description
   */
  public async deleteJobDescription(id: string): Promise<boolean> {
    await delay(120);
    let list = this.getStoredJobDescriptions();
    list = list.filter((j) => j.id !== id);
    this.saveToStorage(list);
    return true;
  }

  /**
   * Get JD statistics
   */
  public async getJobDescriptionStats(): Promise<{
    total: number;
    byGrade: Record<string, number>;
    byDepartment: Record<string, number>;
  }> {
    const list = this.getStoredJobDescriptions();
    const total = list.length;
    const byGrade: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};

    for (const jd of list) {
      byGrade[jd.gradeLevel] = (byGrade[jd.gradeLevel] || 0) + 1;
      byDepartment[jd.department] = (byDepartment[jd.department] || 0) + 1;
    }

    return {
      total,
      byGrade,
      byDepartment,
    };
  }
}

export const jobDescriptionService = new JobDescriptionServiceClass();
