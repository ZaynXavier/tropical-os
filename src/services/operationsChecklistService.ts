/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — OPERATIONS CHECKLIST SERVICE
 * Core abstraction engine for Checklist Generation, Staff Execution,
 * Photo/Numeric Evidence, Supervisor Verification, Failure Issue Logging,
 * and Station Compliance Analytics.
 */

import {
  ChecklistTemplate,
  DailyChecklist,
  ChecklistExecution,
  ChecklistEvidence,
  CorrectiveAction,
  AuditTrailEntry,
  ChecklistDashboardMetrics,
  StationChecklistMetrics,
  EmployeeChecklistMetrics,
  ChecklistFilterParams,
  ChecklistType,
  DailyChecklistStatus,
} from '../types/operationsChecklist';
import {
  INITIAL_CHECKLIST_TEMPLATES,
  INITIAL_DAILY_CHECKLISTS,
  INITIAL_CORRECTIVE_ACTIONS,
  MOCK_TODAY_STR,
} from '../data/mockOperationsChecklists';
import { operationsService, getJakartaDateString, getJakartaTimeString } from './operationsService';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { INITIAL_OPERATIONAL_STATIONS } from '../data/mockOperationalStations';
import { INITIAL_OPERATIONAL_AREAS } from '../data/mockOperationalAreas';

const TEMPLATES_KEY = 'tropicalos_operations_checklist_templates';
const DAILY_CHECKLISTS_KEY = 'tropicalos_operations_daily_checklists';
const CORRECTIVE_ACTIONS_KEY = 'tropicalos_operations_corrective_actions';

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

class OperationsChecklistServiceClass {
  // =========================================================================
  // STORAGE HELPERS (Safe Fallback Engine)
  // =========================================================================

  private getStoredTemplates(): ChecklistTemplate[] {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsChecklistService] Error reading templates from storage:', e);
    }
    this.saveTemplates(INITIAL_CHECKLIST_TEMPLATES);
    return INITIAL_CHECKLIST_TEMPLATES;
  }

  private saveTemplates(templates: ChecklistTemplate[]): void {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('[OperationsChecklistService] Error saving templates:', e);
    }
  }

  private getStoredDailyChecklists(): DailyChecklist[] {
    try {
      const stored = localStorage.getItem(DAILY_CHECKLISTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsChecklistService] Error reading daily checklists from storage:', e);
    }
    this.saveDailyChecklists(INITIAL_DAILY_CHECKLISTS);
    return INITIAL_DAILY_CHECKLISTS;
  }

  private saveDailyChecklists(checklists: DailyChecklist[]): void {
    try {
      localStorage.setItem(DAILY_CHECKLISTS_KEY, JSON.stringify(checklists));
    } catch (e) {
      console.error('[OperationsChecklistService] Error saving daily checklists:', e);
    }
  }

  private getStoredCorrectiveActions(): CorrectiveAction[] {
    try {
      const stored = localStorage.getItem(CORRECTIVE_ACTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsChecklistService] Error reading corrective actions from storage:', e);
    }
    this.saveCorrectiveActions(INITIAL_CORRECTIVE_ACTIONS);
    return INITIAL_CORRECTIVE_ACTIONS;
  }

  private saveCorrectiveActions(actions: CorrectiveAction[]): void {
    try {
      localStorage.setItem(CORRECTIVE_ACTIONS_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error('[OperationsChecklistService] Error saving corrective actions:', e);
    }
  }

  // =========================================================================
  // 1. TEMPLATES (CRUD & LOOKUP)
  // =========================================================================

  async getChecklistTemplates(filter?: {
    areaId?: string;
    stationId?: string;
    checklistType?: string;
    status?: string;
  }): Promise<ChecklistTemplate[]> {
    await delay();
    let templates = this.getStoredTemplates();
    if (filter?.areaId && filter.areaId !== 'ALL') {
      templates = templates.filter((t) => t.areaId === filter.areaId);
    }
    if (filter?.stationId && filter.stationId !== 'ALL') {
      templates = templates.filter((t) => t.stationId === filter.stationId);
    }
    if (filter?.checklistType && filter.checklistType !== 'ALL') {
      templates = templates.filter((t) => t.checklistType === filter.checklistType);
    }
    if (filter?.status && filter.status !== 'ALL') {
      templates = templates.filter((t) => t.status === filter.status);
    }
    return templates;
  }

  async getChecklistTemplateById(id: string): Promise<ChecklistTemplate | null> {
    await delay();
    const templates = this.getStoredTemplates();
    return templates.find((t) => t.id === id || t.templateId === id) || null;
  }

  async createChecklistTemplate(
    data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ChecklistTemplate> {
    await delay();
    const templates = this.getStoredTemplates();
    const id = `tmpl-${data.stationId.replace('stn-', '')}-${data.checklistType.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newTemplate: ChecklistTemplate = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  async updateChecklistTemplate(
    id: string,
    data: Partial<ChecklistTemplate>
  ): Promise<ChecklistTemplate> {
    await delay();
    const templates = this.getStoredTemplates();
    const index = templates.findIndex((t) => t.id === id || t.templateId === id);
    if (index === -1) throw new Error(`Template ${id} not found`);

    const updated: ChecklistTemplate = {
      ...templates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    templates[index] = updated;
    this.saveTemplates(templates);
    return updated;
  }

  // =========================================================================
  // 2. DAILY CHECKLIST GENERATION ENGINE
  // =========================================================================

  /**
   * Generates or retrieves existing daily checklists for the active shift assignments.
   * Duplicate prevention: checks unique combination (date + shiftId + stationId + templateId + assignedEmployeeId).
   */
  async generateDailyChecklists(
    date = getJakartaDateString(),
    shiftId = 'shift-pagi'
  ): Promise<{ createdCount: number; existingCount: number; checklists: DailyChecklist[] }> {
    await delay(60);
    const existingChecklists = this.getStoredDailyChecklists();
    const templates = this.getStoredTemplates().filter((t) => t.status === 'ACTIVE');
    const stations = await operationsService.getStations();
    const areas = await operationsService.getOperationalAreas();
    const assignments = await operationsService.getEnrichedStationAssignments({
      date,
      shiftId,
      status: 'ALL',
    });

    const activeAssignments = assignments.filter(
      (a) => a.status === 'ASSIGNED' || a.status === 'ACTIVE'
    );

    const stationMap = new Map(stations.map((s) => [s.id, s]));
    const areaMap = new Map(areas.map((a) => [a.id, a]));

    let createdCount = 0;
    let existingCount = 0;
    const resultChecklists: DailyChecklist[] = [...existingChecklists];

    for (const asgn of activeAssignments) {
      const station = stationMap.get(asgn.stationId);
      const area = areaMap.get(asgn.areaId);
      if (!station || !area) continue;

      // Find matching templates for station
      const matchingTemplates = templates.filter((t) => {
        const matchesStation = t.stationId === station.id || (t.areaId === area.id && t.stationId === 'ALL');
        const matchesShift = t.shiftType === 'ALL' || t.shiftType === shiftId;
        return matchesStation && matchesShift;
      });

      for (const tmpl of matchingTemplates) {
        // Check duplicate
        const isDuplicate = resultChecklists.some(
          (c) =>
            c.date === date &&
            c.shiftId === shiftId &&
            c.stationId === asgn.stationId &&
            c.templateId === tmpl.id &&
            c.assignedEmployeeId === asgn.employeeId
        );

        if (isDuplicate) {
          existingCount++;
          continue;
        }

        // Instantiate new DailyChecklist
        const newChecklistId = `dchk-${date.replace(/-/g, '')}-${station.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${tmpl.checklistType.toLowerCase()}-${asgn.employeeId.slice(-3)}`;

        const executions: ChecklistExecution[] = tmpl.items.map((item, idx) => ({
          id: `exec-${newChecklistId}-${idx + 1}`,
          checklistId: newChecklistId,
          itemId: item.id,
          sequence: item.sequence,
          title: item.title,
          description: item.description,
          category: item.category,
          isRequired: item.isRequired,
          requiresPhoto: item.requiresPhoto,
          requiresNote: item.requiresNote,
          requiresNumericValue: item.requiresNumericValue,
          minValue: item.minValue,
          maxValue: item.maxValue,
          unit: item.unit,
          criticalControlPoint: item.criticalControlPoint,
          sopReferenceId: item.sopReferenceId,
          sopReferenceCode: item.sopReferenceCode,
          ikaReferenceId: item.ikaReferenceId,
          ikaReferenceCode: item.ikaReferenceCode,
          status: 'PENDING',
        }));

        const newDailyChecklist: DailyChecklist = {
          id: newChecklistId,
          templateId: tmpl.id,
          templateCode: tmpl.templateCode,
          templateTitle: tmpl.templateName,
          checklistType: tmpl.checklistType,
          date,
          shiftId,
          shiftName: asgn.shiftName || (shiftId === 'shift-pagi' ? 'Shift Pagi (09:00 - 19:00)' : 'Shift Siang (13:00 - 23:00)'),
          stationId: station.id,
          stationCode: station.code,
          stationName: station.name,
          areaId: area.id,
          areaName: area.name,
          assignedEmployeeId: asgn.employeeId,
          assignedEmployeeCode: asgn.employeeCode,
          assignedEmployeeName: asgn.employeeName,
          assignedRoleId: asgn.operationalRoleId,
          assignedRoleName: asgn.roleName,
          status: 'NOT_STARTED',
          isOverdue: false,
          overdueMinutes: 0,
          expectedCompletionTime: tmpl.expectedCompletionTime || '10:00',
          completionPercentage: 0,
          totalItemsCount: executions.length,
          completedItemsCount: 0,
          failedItemsCount: 0,
          skippedItemsCount: 0,
          criticalIssueCount: 0,
          issueCount: 0,
          items: executions,
          auditTrail: [
            {
              id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
              checklistId: newChecklistId,
              action: 'CHECKLIST_AUTO_GENERATED',
              performedBy: 'SYSTEM_ENGINE',
              performedByName: 'Auto Generator',
              role: 'SYSTEM',
              details: `Checklist dibuat otomatis dari penugasan stasiun ${station.name}.`,
              timestamp: new Date().toISOString(),
            },
          ],
          createdBy: 'SYSTEM_ENGINE',
          createdAt: new Date().toISOString(),
          updatedBy: 'SYSTEM_ENGINE',
          updatedAt: new Date().toISOString(),
        };

        resultChecklists.unshift(newDailyChecklist);
        createdCount++;
      }
    }

    this.saveDailyChecklists(resultChecklists);
    return {
      createdCount,
      existingCount,
      checklists: resultChecklists.filter((c) => c.date === date && c.shiftId === shiftId),
    };
  }

  // =========================================================================
  // 3. DAILY CHECKLIST QUERIES & FILTERS
  // =========================================================================

  async getDailyChecklists(filters?: ChecklistFilterParams): Promise<DailyChecklist[]> {
    await delay();
    let list = this.getStoredDailyChecklists();

    if (filters?.date && filters.date !== 'ALL') {
      list = list.filter((c) => c.date === filters.date);
    }
    if (filters?.shiftId && filters.shiftId !== 'ALL') {
      list = list.filter((c) => c.shiftId === filters.shiftId);
    }
    if (filters?.areaId && filters.areaId !== 'ALL') {
      list = list.filter((c) => c.areaId === filters.areaId);
    }
    if (filters?.stationId && filters.stationId !== 'ALL') {
      list = list.filter((c) => c.stationId === filters.stationId);
    }
    if (filters?.employeeId && filters.employeeId !== 'ALL') {
      list = list.filter((c) => c.assignedEmployeeId === filters.employeeId);
    }
    if (filters?.checklistType && filters.checklistType !== 'ALL') {
      list = list.filter((c) => c.checklistType === filters.checklistType);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.criticalOnly) {
      list = list.filter((c) => c.criticalIssueCount > 0 || c.items.some((i) => i.criticalControlPoint && i.status === 'FAILED'));
    }
    if (filters?.overdueOnly) {
      list = list.filter((c) => c.isOverdue || c.status === 'OVERDUE');
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.templateTitle.toLowerCase().includes(q) ||
          c.templateCode.toLowerCase().includes(q) ||
          c.stationName.toLowerCase().includes(q) ||
          c.areaName.toLowerCase().includes(q) ||
          c.assignedEmployeeName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getChecklistById(id: string): Promise<DailyChecklist | null> {
    await delay();
    const list = this.getStoredDailyChecklists();
    return list.find((c) => c.id === id || c.checklistId === id) || null;
  }

  async getChecklistsByEmployee(
    employeeId: string,
    date = getJakartaDateString()
  ): Promise<DailyChecklist[]> {
    await delay();
    const list = this.getStoredDailyChecklists();
    return list.filter(
      (c) => c.assignedEmployeeId === employeeId && (date === 'ALL' || c.date === date)
    );
  }

  async getPendingVerificationChecklists(areaId?: string): Promise<DailyChecklist[]> {
    await delay();
    const list = this.getStoredDailyChecklists();
    return list.filter((c) => {
      const isPending = c.status === 'VERIFICATION_REQUIRED' || (c.status === 'COMPLETED' && !c.verifiedBy);
      const matchesArea = !areaId || areaId === 'ALL' || c.areaId === areaId;
      return isPending && matchesArea;
    });
  }

  // =========================================================================
  // 4. STAFF EXECUTION ENGINE
  // =========================================================================

  /**
   * Start executing a checklist (transitions status from NOT_STARTED to IN_PROGRESS)
   */
  async startChecklist(
    checklistId: string,
    employeeId: string,
    employeeName: string
  ): Promise<DailyChecklist> {
    await delay();
    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const updated: DailyChecklist = {
      ...current,
      status: current.status === 'NOT_STARTED' || current.status === 'OVERDUE' ? 'IN_PROGRESS' : current.status,
      startedAt: current.startedAt || new Date().toISOString(),
      updatedBy: employeeId,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: 'CHECKLIST_STARTED',
          performedBy: employeeId,
          performedByName: employeeName,
          role: current.assignedRoleName,
          details: `Staf memulai pengerjaan checklist stasiun.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  /**
   * Complete an individual checklist item (mark PASSED)
   */
  async completeChecklistItem(
    checklistId: string,
    executionId: string,
    data: {
      value?: number;
      note?: string;
      photoUrl?: string;
      employeeId: string;
      employeeName: string;
    }
  ): Promise<DailyChecklist> {
    await delay();
    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const items = [...current.items];
    const itemIndex = items.findIndex((i) => i.id === executionId);
    if (itemIndex === -1) throw new Error(`Item pengerjaan ${executionId} tidak ditemukan.`);

    const item = items[itemIndex];

    // Build evidence if photo or note provided
    const evidenceList: ChecklistEvidence[] = item.evidence ? [...item.evidence] : [];
    if (data.photoUrl) {
      evidenceList.push({
        evidenceId: `ev-${Date.now()}-${Math.random().toString(36).slice(-3)}`,
        executionId,
        type: 'PHOTO',
        previewUrl: data.photoUrl,
        createdBy: data.employeeId,
        createdAt: new Date().toISOString(),
      });
    }

    const updatedItem: ChecklistExecution = {
      ...item,
      status: 'PASSED',
      completedBy: data.employeeId,
      completedByName: data.employeeName,
      completedAt: new Date().toISOString(),
      value: data.value !== undefined ? data.value : item.value,
      note: data.note !== undefined ? data.note : item.note,
      evidence: evidenceList.length > 0 ? evidenceList : item.evidence,
      failureReason: undefined,
      correctiveAction: undefined,
    };

    items[itemIndex] = updatedItem;

    // Recalculate checklist progress counts
    const completedCount = items.filter((i) => i.status === 'PASSED').length;
    const failedCount = items.filter((i) => i.status === 'FAILED').length;
    const skippedCount = items.filter((i) => i.status === 'SKIPPED').length;
    const totalCount = items.length || 1;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const updated: DailyChecklist = {
      ...current,
      status: current.status === 'NOT_STARTED' || current.status === 'OVERDUE' ? 'IN_PROGRESS' : current.status,
      startedAt: current.startedAt || new Date().toISOString(),
      items,
      completedItemsCount: completedCount,
      failedItemsCount: failedCount,
      skippedItemsCount: skippedCount,
      completionPercentage: percentage,
      updatedBy: data.employeeId,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  /**
   * Fail an individual checklist item (mark FAILED, log failure reason, corrective action, and optionally trigger Operational Issue)
   */
  async failChecklistItem(
    checklistId: string,
    executionId: string,
    data: {
      reason: string;
      correctiveActionText?: string;
      createIssue?: boolean;
      issueCategory?: any;
      issueSeverity?: any;
      photoUrl?: string;
      value?: number;
      employeeId: string;
      employeeName: string;
    }
  ): Promise<DailyChecklist> {
    await delay();
    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const items = [...current.items];
    const itemIndex = items.findIndex((i) => i.id === executionId);
    if (itemIndex === -1) throw new Error(`Item ${executionId} tidak ditemukan.`);

    const item = items[itemIndex];

    let issueId: string | undefined;
    let issueNumber: string | undefined;

    // Optionally create real Operational Issue in operationsService
    if (data.createIssue) {
      try {
        const newIssue = await operationsService.createOperationalIssue({
          title: `[Checklist Kendala] ${item.title}`,
          date: current.date,
          areaId: current.areaId,
          stationId: current.stationId,
          reportedBy: data.employeeId,
          reportedByName: data.employeeName,
          category: data.issueCategory || (item.criticalControlPoint ? 'SAFETY_HAZARD' : 'FACILITY_BREAKDOWN'),
          severity: data.issueSeverity || (item.criticalControlPoint ? 'CRITICAL' : 'HIGH'),
          description: `Gagal pada item checklist '${item.title}': ${data.reason}. Tindakan koreksi yang diajukan: ${data.correctiveActionText || 'Perbaikan segera.'}`,
          status: 'OPEN',
        });
        issueId = newIssue.id;
        issueNumber = newIssue.issueNumber;
      } catch (err) {
        console.error('Failed to create operational issue from checklist:', err);
      }
    }

    const evidenceList: ChecklistEvidence[] = item.evidence ? [...item.evidence] : [];
    if (data.photoUrl) {
      evidenceList.push({
        evidenceId: `ev-${Date.now()}-${Math.random().toString(36).slice(-3)}`,
        executionId,
        type: 'PHOTO',
        previewUrl: data.photoUrl,
        createdBy: data.employeeId,
        createdAt: new Date().toISOString(),
      });
    }

    const updatedItem: ChecklistExecution = {
      ...item,
      status: 'FAILED',
      completedBy: data.employeeId,
      completedByName: data.employeeName,
      completedAt: new Date().toISOString(),
      failureReason: data.reason,
      correctiveAction: data.correctiveActionText,
      value: data.value !== undefined ? data.value : item.value,
      issueId,
      issueNumber,
      evidence: evidenceList.length > 0 ? evidenceList : item.evidence,
    };

    items[itemIndex] = updatedItem;

    // Save corrective action if text exists
    if (data.correctiveActionText) {
      const actions = this.getStoredCorrectiveActions();
      actions.unshift({
        actionId: `act-${Date.now().toString().slice(-6)}`,
        issueId,
        executionId,
        checklistId,
        actionDescription: data.correctiveActionText,
        assignedTo: data.employeeId,
        assignedToName: data.employeeName,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
      this.saveCorrectiveActions(actions);
    }

    const completedCount = items.filter((i) => i.status === 'PASSED').length;
    const failedCount = items.filter((i) => i.status === 'FAILED').length;
    const criticalCount = items.filter((i) => i.criticalControlPoint && i.status === 'FAILED').length;
    const totalCount = items.length || 1;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const updated: DailyChecklist = {
      ...current,
      status: current.status === 'NOT_STARTED' || current.status === 'OVERDUE' ? 'IN_PROGRESS' : current.status,
      items,
      completedItemsCount: completedCount,
      failedItemsCount: failedCount,
      criticalIssueCount: criticalCount,
      issueCount: items.filter((i) => !!i.issueId).length,
      completionPercentage: percentage,
      updatedBy: data.employeeId,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: item.criticalControlPoint ? 'ITEM_FAILED_CRITICAL' : 'ITEM_FAILED',
          performedBy: data.employeeId,
          performedByName: data.employeeName,
          role: current.assignedRoleName,
          details: `Item '${item.title}' ditandai gagal: ${data.reason}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  /**
   * Submit checklist for supervisor verification
   */
  async submitChecklist(
    checklistId: string,
    employeeId: string,
    employeeName: string
  ): Promise<DailyChecklist> {
    await delay();
    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];

    // Check if there are unattempted required items
    const unattemptedRequired = current.items.filter((i) => i.isRequired && i.status === 'PENDING');
    if (unattemptedRequired.length > 0) {
      throw new Error(`Masih ada ${unattemptedRequired.length} item wajib yang belum diperiksa.`);
    }

    const updated: DailyChecklist = {
      ...current,
      status: 'VERIFICATION_REQUIRED',
      completedAt: new Date().toISOString(),
      updatedBy: employeeId,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: 'SUBMITTED_FOR_VERIFICATION',
          performedBy: employeeId,
          performedByName: employeeName,
          role: current.assignedRoleName,
          details: `Seluruh item telah diisi. Mengajukan ke supervisor untuk verifikasi.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  // =========================================================================
  // 5. SUPERVISOR VERIFICATION & REJECTION
  // =========================================================================

  /**
   * Verify checklist (Supervisor approves)
   */
  async verifyChecklist(
    checklistId: string,
    param2:
      | {
          verifiedBy: string;
          verifiedByName: string;
          note?: string;
        }
      | string,
    param3?: string,
    param4?: string
  ): Promise<DailyChecklist> {
    await delay();
    const data =
      typeof param2 === 'string'
        ? {
            verifiedBy: param2,
            verifiedByName: param3 || 'Supervisor',
            note: param4,
          }
        : param2;

    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const items = current.items.map((i) => ({
      ...i,
      verificationStatus: 'VERIFIED' as const,
      verifiedBy: data.verifiedBy,
      verifiedAt: new Date().toISOString(),
    }));

    const updated: DailyChecklist = {
      ...current,
      status: 'VERIFIED',
      verifiedBy: data.verifiedBy,
      verifiedByName: data.verifiedByName,
      verifiedAt: new Date().toISOString(),
      verificationNote: data.note || 'Terverifikasi sesuai standar.',
      rejectedBy: undefined,
      rejectedByName: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      items,
      updatedBy: data.verifiedBy,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: 'VERIFIED_BY_SUPERVISOR',
          performedBy: data.verifiedBy,
          performedByName: data.verifiedByName,
          role: 'Supervisor / Manager',
          details: `Checklist disetujui & diverifikasi: ${data.note || 'Lengkap & akurat.'}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  /**
   * Reject checklist (Supervisor requests revision / rework)
   */
  async rejectChecklist(
    checklistId: string,
    param2:
      | {
          rejectedBy: string;
          rejectedByName: string;
          reason: string;
        }
      | string,
    param3?: string,
    param4?: string
  ): Promise<DailyChecklist> {
    await delay();
    const data =
      typeof param2 === 'string'
        ? {
            rejectedBy: param2,
            rejectedByName: param3 || 'Supervisor',
            reason: param4 || 'Harap periksa dan lengkapi item yang belum sesuai.',
          }
        : param2;

    if (!data.reason || data.reason.trim().length < 3) {
      throw new Error('Alasan penolakan / instruksi perbaikan wajib diisi.');
    }

    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const items = current.items.map((i) => ({
      ...i,
      verificationStatus: (i.status === 'FAILED' ? 'REJECTED' : i.verificationStatus) as any,
    }));

    const updated: DailyChecklist = {
      ...current,
      status: 'REJECTED',
      rejectedBy: data.rejectedBy,
      rejectedByName: data.rejectedByName,
      rejectedAt: new Date().toISOString(),
      rejectionReason: data.reason,
      verifiedBy: undefined,
      verifiedByName: undefined,
      verifiedAt: undefined,
      items,
      updatedBy: data.rejectedBy,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: 'REJECTED_BY_SUPERVISOR',
          performedBy: data.rejectedBy,
          performedByName: data.rejectedByName,
          role: 'Supervisor / Manager',
          details: `Checklist ditolak: ${data.reason}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  /**
   * Manager Override (force verify or resolve)
   */
  async overrideVerification(
    checklistId: string,
    param2:
      | {
          managerId: string;
          managerName: string;
          reason: string;
        }
      | string,
    param3?: string,
    param4?: string
  ): Promise<DailyChecklist> {
    await delay();
    const data =
      typeof param2 === 'string'
        ? {
            managerId: param2,
            managerName: param3 || 'General Manager',
            reason: param4 || 'Manager override verifikasi.',
          }
        : param2;

    const list = this.getStoredDailyChecklists();
    const index = list.findIndex((c) => c.id === checklistId);
    if (index === -1) throw new Error(`Checklist ${checklistId} tidak ditemukan.`);

    const current = list[index];
    const updated: DailyChecklist = {
      ...current,
      status: 'VERIFIED',
      isManagerOverride: true,
      overrideReason: data.reason,
      verifiedBy: data.managerId,
      verifiedByName: data.managerName,
      verifiedAt: new Date().toISOString(),
      verificationNote: `[MANAGER OVERRIDE] ${data.reason}`,
      updatedBy: data.managerId,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          checklistId,
          action: 'MANAGER_OVERRIDE_VERIFICATION',
          performedBy: data.managerId,
          performedByName: data.managerName,
          role: 'General Manager',
          details: `Manager override verifikasi: ${data.reason}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list[index] = updated;
    this.saveDailyChecklists(list);
    return updated;
  }

  managerOverride = this.overrideVerification;
  getComplianceMetrics = this.getChecklistDashboardMetrics;
  getStationReadinessMatrix = this.getStationChecklistMetrics;
  exportChecklistReportCSV = this.exportChecklistsToCsv;

  // =========================================================================
  // 6. METRICS & COMPLIANCE ANALYTICS
  // =========================================================================

  async getChecklistDashboardMetrics(date = getJakartaDateString(), shiftId?: string): Promise<ChecklistDashboardMetrics> {
    await delay();
    const list = this.getStoredDailyChecklists().filter(
      (c) =>
        (date === 'ALL' || !date || c.date === date) &&
        (!shiftId || shiftId === 'ALL' || c.shiftId === shiftId)
    );
    const total = list.length;
    const completed = list.filter((c) => c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'VERIFICATION_REQUIRED').length;
    const inProgress = list.filter((c) => c.status === 'IN_PROGRESS').length;
    const pendingVerification = list.filter((c) => c.status === 'VERIFICATION_REQUIRED').length;
    const verified = list.filter((c) => c.status === 'VERIFIED').length;
    const rejected = list.filter((c) => c.status === 'REJECTED').length;
    const overdue = list.filter((c) => c.isOverdue || c.status === 'OVERDUE').length;
    const criticalFailed = list.filter((c) => c.criticalIssueCount > 0).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const verificationRate = completed > 0 ? Math.round((verified / completed) * 100) : 0;

    let overallReadiness: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL' = 'OPTIMAL';
    if (criticalFailed > 0 || rejected > 2) overallReadiness = 'CRITICAL';
    else if (overdue > 2 || completionRate < 70) overallReadiness = 'ATTENTION';
    else if (completionRate < 90) overallReadiness = 'ADEQUATE';

    return {
      totalChecklists: total,
      completedChecklists: completed,
      inProgressChecklists: inProgress,
      pendingVerificationCount: pendingVerification,
      verifiedCount: verified,
      rejectedCount: rejected,
      overdueCount: overdue,
      criticalFailedCount: criticalFailed,
      completionRate,
      verificationRate,
      averageExecutionMinutes: 24,
      overallReadiness,
    };
  }

  async getStationChecklistMetrics(date = getJakartaDateString(), shiftId?: string): Promise<StationChecklistMetrics[]> {
    await delay();
    const checklists = this.getStoredDailyChecklists().filter(
      (c) =>
        (date === 'ALL' || !date || c.date === date) &&
        (!shiftId || shiftId === 'ALL' || c.shiftId === shiftId)
    );
    const stations = await operationsService.getStations();
    const areas = await operationsService.getOperationalAreas();
    const areaMap = new Map(areas.map((a) => [a.id, a]));

    return stations.map((stn) => {
      const area = areaMap.get(stn.areaId);
      const stnChecklists = checklists.filter((c) => c.stationId === stn.id);
      const assignedCount = stnChecklists.length;
      const completedCount = stnChecklists.filter((c) => c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'VERIFICATION_REQUIRED').length;
      const verifiedCount = stnChecklists.filter((c) => c.status === 'VERIFIED').length;
      const failedItems = stnChecklists.reduce((acc, c) => acc + c.failedItemsCount, 0);
      const criticalFailed = stnChecklists.reduce((acc, c) => acc + c.criticalIssueCount, 0);

      const compliancePercentage = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 100;

      let status: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL' = 'OPTIMAL';
      if (criticalFailed > 0) status = 'CRITICAL';
      else if (failedItems > 1 || compliancePercentage < 70) status = 'ATTENTION';
      else if (compliancePercentage < 90) status = 'ADEQUATE';

      return {
        stationId: stn.id,
        stationName: stn.name,
        stationCode: stn.code,
        areaId: stn.areaId,
        areaName: area?.name || 'Area',
        assignedCount,
        completedCount,
        verifiedCount,
        failedItemsCount: failedItems,
        criticalFailedCount: criticalFailed,
        compliancePercentage,
        status,
      };
    });
  }

  async getEmployeeChecklistMetrics(date = getJakartaDateString()): Promise<EmployeeChecklistMetrics[]> {
    await delay();
    const checklists = this.getStoredDailyChecklists().filter((c) => date === 'ALL' || c.date === date);
    const employees = INITIAL_EMPLOYEES;

    return employees.map((emp) => {
      const empChecklists = checklists.filter((c) => c.assignedEmployeeId === emp.id);
      const assignedCount = empChecklists.length;
      const completedCount = empChecklists.filter((c) => c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'VERIFICATION_REQUIRED').length;
      const verifiedCount = empChecklists.filter((c) => c.status === 'VERIFIED').length;
      const failedCount = empChecklists.reduce((acc, c) => acc + c.failedItemsCount, 0);
      const overdueCount = empChecklists.filter((c) => c.isOverdue || c.status === 'OVERDUE').length;

      const compliancePercentage = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 100;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode || emp.id,
        employeeName: emp.name,
        department: emp.department,
        stationName: empChecklists[0]?.stationName || '-',
        assignedCount,
        completedCount,
        verifiedCount,
        failedCount,
        overdueCount,
        compliancePercentage,
      };
    }).filter((m) => m.assignedCount > 0);
  }

  // =========================================================================
  // 7. CSV EXPORT & AUDIT
  // =========================================================================

  exportChecklistsToCsv(
    checklistsOrDate?: DailyChecklist[] | string,
    shiftId?: string
  ): string {
    let checklists: DailyChecklist[] = [];
    if (Array.isArray(checklistsOrDate)) {
      checklists = checklistsOrDate;
    } else {
      const date = checklistsOrDate || getJakartaDateString();
      checklists = this.getStoredDailyChecklists().filter(
        (c) =>
          (date === 'ALL' || !date || c.date === date) &&
          (!shiftId || shiftId === 'ALL' || c.shiftId === shiftId)
      );
    }
    const headers = [
      'Date',
      'Shift',
      'Area',
      'Station Code',
      'Station Name',
      'Template Title',
      'Assigned Employee',
      'Status',
      'Completion %',
      'Total Items',
      'Passed Items',
      'Failed Items',
      'Critical Issues',
      'Verified By',
      'Verified At',
      'Rejection Reason',
    ];

    const rows = checklists.map((c) => [
      `"${c.date}"`,
      `"${c.shiftName}"`,
      `"${c.areaName}"`,
      `"${c.stationCode}"`,
      `"${c.stationName}"`,
      `"${c.templateTitle}"`,
      `"${c.assignedEmployeeName}"`,
      `"${c.status}"`,
      `"${c.completionPercentage}%"`,
      c.totalItemsCount,
      c.completedItemsCount,
      c.failedItemsCount,
      c.criticalIssueCount,
      `"${c.verifiedByName || '-'}"`,
      `"${c.verifiedAt || '-'}"`,
      `"${c.rejectionReason || '-'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // =========================================================================
  // 8. RESET TO DEFAULTS
  // =========================================================================

  async resetToDefaults(): Promise<void> {
    await delay(100);
    this.saveTemplates(INITIAL_CHECKLIST_TEMPLATES);
    this.saveDailyChecklists(INITIAL_DAILY_CHECKLISTS);
    this.saveCorrectiveActions(INITIAL_CORRECTIVE_ACTIONS);
  }
}

export const operationsChecklistService = new OperationsChecklistServiceClass();
