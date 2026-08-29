/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE, INCIDENT & ESCALATION SERVICE
 * Central Service Abstraction Layer with SLA Engine, Persistence,
 * Escalation Flow, Audit Trail, and CSV Export.
 */

import {
  OperationalIssue,
  OperationalIssueSeverity,
  OperationalIssueStatus,
  OperationalIssueCategory,
  IssueFilterParams,
  IssueDashboardMetrics,
  IssueAnalyticsData,
  RecurringIssueGroup,
  IssueAuditEvent,
  IssueEvidence,
  RootCauseCategory,
} from '../types/operationalIssue';
import { INITIAL_OPERATIONAL_ISSUES } from '../data/mockOperationalIssues';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { INITIAL_OPERATIONAL_STATIONS } from '../data/mockOperationalStations';
import { INITIAL_OPERATIONAL_AREAS } from '../data/mockOperationalAreas';

const ISSUES_PRIMARY_KEY = 'tropicalos_master_operational_issues';
const ISSUES_LEGACY_KEY = 'tropicalos_master_operations_issues';

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Target SLA Internal TropicalOS Helpers
 */
export function getSlaMinutes(severity: OperationalIssueSeverity): number {
  switch (severity) {
    case 'CRITICAL':
      return 15; // 15 menit
    case 'HIGH':
      return 30; // 30 menit
    case 'MEDIUM':
      return 120; // 2 jam
    case 'LOW':
      return 1440; // 24 jam (1 hari)
    default:
      return 120;
  }
}

export function calculateSlaDeadline(createdAtStr: string, severity: OperationalIssueSeverity): string {
  const createdDate = new Date(createdAtStr);
  const slaMins = getSlaMinutes(severity);
  const deadlineDate = new Date(createdDate.getTime() + slaMins * 60 * 1000);
  return deadlineDate.toISOString();
}

export function calculateResponseMinutes(createdAtStr: string, acknowledgedAtStr?: string): number {
  if (!acknowledgedAtStr) return 0;
  const start = new Date(createdAtStr).getTime();
  const ack = new Date(acknowledgedAtStr).getTime();
  return Math.max(0, Math.round((ack - start) / (1000 * 60)));
}

export function isSlaBreached(issue: Partial<OperationalIssue>): boolean {
  if (issue.isSlaBreached) return true;
  if (!issue.createdAt || !issue.severity) return false;

  const deadline = issue.slaDeadline
    ? new Date(issue.slaDeadline).getTime()
    : new Date(calculateSlaDeadline(issue.createdAt, issue.severity)).getTime();

  // If issue is resolved or closed, check if it was resolved after deadline
  const endPoint = issue.resolvedAt
    ? new Date(issue.resolvedAt).getTime()
    : issue.closedAt
    ? new Date(issue.closedAt).getTime()
    : Date.now();

  return endPoint > deadline;
}

export function calculateResolutionMinutes(issue: Partial<OperationalIssue>): number {
  if (!issue.createdAt) return 0;
  const start = new Date(issue.createdAt).getTime();
  const end = issue.resolvedAt
    ? new Date(issue.resolvedAt).getTime()
    : issue.closedAt
    ? new Date(issue.closedAt).getTime()
    : Date.now();
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
}

export function calculateSlaCompliance(issues: OperationalIssue[]): number {
  if (!issues || issues.length === 0) return 100;
  const breachedCount = issues.filter((i) => isSlaBreached(i)).length;
  const compliance = Math.round(((issues.length - breachedCount) / issues.length) * 100);
  return Math.max(0, Math.min(100, compliance));
}

class OperationalIssueServiceClass {
  // =========================================================================
  // STORAGE ENGINE & SAFE NORMALIZATION
  // =========================================================================

  private getStoredIssues(): OperationalIssue[] {
    try {
      // Primary storage
      const primary = localStorage.getItem(ISSUES_PRIMARY_KEY);
      if (primary) {
        const parsed = JSON.parse(primary);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.normalizeIssues(parsed);
        }
      }

      // Legacy fallback
      const legacy = localStorage.getItem(ISSUES_LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = this.normalizeIssues(parsed);
          this.saveIssues(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('[OperationalIssueService] Storage parse error, falling back to mock:', e);
    }

    const defaultList = this.normalizeIssues(INITIAL_OPERATIONAL_ISSUES);
    this.saveIssues(defaultList);
    return defaultList;
  }

  private saveIssues(issues: OperationalIssue[]): void {
    try {
      localStorage.setItem(ISSUES_PRIMARY_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('[OperationalIssueService] Error saving issues:', e);
    }
  }

  private normalizeIssues(rawList: any[]): OperationalIssue[] {
    return (rawList || []).map((item, idx) => {
      const createdAt = item.createdAt || new Date().toISOString();
      const severity = item.severity || 'MEDIUM';
      const category = item.category || item.issueType || 'OPERATIONAL';
      const status = item.status || 'OPEN';

      const slaMins = item.slaMinutes || getSlaMinutes(severity);
      const slaDeadline = item.slaDeadline || calculateSlaDeadline(createdAt, severity);
      const breached = item.isSlaBreached !== undefined ? item.isSlaBreached : isSlaBreached({ createdAt, slaDeadline, severity, resolvedAt: item.resolvedAt, status });

      return {
        id: item.id || `issue-${idx + 1}`,
        issueNumber: item.issueNumber || `ISS-20260818-${String(idx + 1).padStart(3, '0')}`,
        title: item.title || 'Kendala Operasional Stasiun',
        description: item.description || '',
        areaId: item.areaId || 'area-kitchen',
        areaName: item.areaName || 'Kitchen',
        stationId: item.stationId || 'stn-kit-hot',
        stationName: item.stationName || 'Stasiun Kerja',
        department: item.department || item.areaName || 'Kitchen',
        shiftId: item.shiftId || 'shift-pagi',
        shiftName: item.shiftName || 'Shift Pagi',
        date: item.date || createdAt.slice(0, 10),
        reportedBy: item.reportedBy || 'emp-09',
        reportedByName: item.reportedByName || 'Staf Operasional',
        reportedAt: item.reportedAt || createdAt,
        assignedTo: item.assignedTo || undefined,
        assignedToName: item.assignedToName || undefined,
        assignedAt: item.assignedAt || undefined,
        assignedBy: item.assignedBy || undefined,
        assignedByName: item.assignedByName || undefined,
        category,
        issueType: category,
        severity,
        status,
        slaMinutes: slaMins,
        slaDeadline,
        acknowledgedAt: item.acknowledgedAt || undefined,
        responseMinutes: item.responseMinutes || (item.acknowledgedAt ? calculateResponseMinutes(createdAt, item.acknowledgedAt) : undefined),
        isSlaBreached: breached,
        resolution: item.resolution || item.resolutionNotes || '',
        resolutionNotes: item.resolutionNotes || item.resolution || '',
        rootCauseCategory: item.rootCauseCategory || undefined,
        rootCause: item.rootCause || undefined,
        correctiveAction: item.correctiveAction || undefined,
        preventiveAction: item.preventiveAction || undefined,
        resolvedBy: item.resolvedBy || undefined,
        resolvedByName: item.resolvedByName || undefined,
        resolvedAt: item.resolvedAt || undefined,
        resolutionMinutes: item.resolutionMinutes || (item.resolvedAt ? calculateResolutionMinutes({ createdAt, resolvedAt: item.resolvedAt }) : undefined),
        verifiedBy: item.verifiedBy || undefined,
        verifiedByName: item.verifiedByName || undefined,
        verifiedAt: item.verifiedAt || undefined,
        verificationNote: item.verificationNote || undefined,
        escalationLevel: item.escalationLevel || undefined,
        escalated: !!item.escalated,
        escalatedAt: item.escalatedAt || undefined,
        escalatedBy: item.escalatedBy || undefined,
        escalatedByName: item.escalatedByName || undefined,
        escalationReason: item.escalationReason || undefined,
        checklistId: item.checklistId || undefined,
        checklistItemId: item.checklistItemId || undefined,
        handoverId: item.handoverId || undefined,
        sopId: item.sopId || undefined,
        ikaId: item.ikaId || undefined,
        handoverReceivedBy: item.handoverReceivedBy || undefined,
        handoverReceivedAt: item.handoverReceivedAt || undefined,
        evidenceCount: item.evidenceCount || (item.evidence?.length || 0),
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
        createdBy: item.createdBy || item.reportedBy || 'SYSTEM',
        createdAt,
        updatedBy: item.updatedBy || undefined,
        updatedAt: item.updatedAt || createdAt,
        closedBy: item.closedBy || undefined,
        closedByName: item.closedByName || undefined,
        closedAt: item.closedAt || undefined,
        cancellationReason: item.cancellationReason || undefined,
        auditTrail: Array.isArray(item.auditTrail) ? item.auditTrail : [],
        isRecurring: !!item.isRecurring,
        recurringCount: item.recurringCount || 1,
      };
    });
  }

  // =========================================================================
  // PUBLIC READ METHODS
  // =========================================================================

  async getIssues(params?: IssueFilterParams): Promise<OperationalIssue[]> {
    await delay();
    let list = this.getStoredIssues();

    if (!params) {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (params.date && params.date !== 'ALL') {
      list = list.filter((i) => i.date === params.date);
    }

    if (params.department && params.department !== 'ALL') {
      list = list.filter((i) => i.department === params.department || i.areaName === params.department);
    }

    if (params.areaId && params.areaId !== 'ALL') {
      list = list.filter((i) => i.areaId === params.areaId);
    }

    if (params.stationId && params.stationId !== 'ALL') {
      list = list.filter((i) => i.stationId === params.stationId);
    }

    if (params.category && params.category !== 'ALL') {
      list = list.filter((i) => i.category === params.category);
    }

    if (params.severity && params.severity !== 'ALL') {
      list = list.filter((i) => i.severity === params.severity);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((i) => i.status === params.status);
    }

    if (params.assignedTo) {
      list = list.filter((i) => i.assignedTo === params.assignedTo);
    }

    if (params.reportedBy) {
      list = list.filter((i) => i.reportedBy === params.reportedBy);
    }

    if (params.isSlaBreached !== undefined && params.isSlaBreached !== 'ALL') {
      list = list.filter((i) => isSlaBreached(i) === params.isSlaBreached);
    }

    if (params.isRecurring) {
      list = list.filter((i) => i.isRecurring);
    }

    if (params.searchQuery) {
      const query = params.searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.issueNumber ?? '').toLowerCase().includes(query) ||
          (i.title ?? '').toLowerCase().includes(query) ||
          (i.description ?? '').toLowerCase().includes(query) ||
          (i.reportedByName ?? '').toLowerCase().includes(query) ||
          (i.assignedToName ?? '').toLowerCase().includes(query) ||
          (i.stationName ?? '').toLowerCase().includes(query)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getIssueById(id: string): Promise<OperationalIssue | null> {
    await delay();
    const list = this.getStoredIssues();
    return list.find((i) => i.id === id || i.issueNumber === id) || null;
  }

  async getIssuesByEmployee(employeeId: string): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.reportedBy === employeeId || i.assignedTo === employeeId);
  }

  async getIssuesByDepartment(department: string): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.department === department || i.areaName === department);
  }

  async getIssuesByStation(stationId: string): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.stationId === stationId);
  }

  async getIssuesByDate(date: string): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.date === date);
  }

  async getOpenIssues(): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.status === 'OPEN' || i.status === 'ACKNOWLEDGED' || i.status === 'IN_PROGRESS' || i.status === 'WAITING' || i.status === 'ESCALATED');
  }

  async getCriticalIssues(): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.severity === 'CRITICAL');
  }

  async getSlaBreachedIssues(): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => isSlaBreached(i));
  }

  async getPendingVerificationIssues(): Promise<OperationalIssue[]> {
    await delay();
    const list = this.getStoredIssues();
    return list.filter((i) => i.status === 'RESOLVED');
  }

  async getIssueSummary(period = 'TODAY'): Promise<IssueDashboardMetrics> {
    await delay();
    const list = this.getStoredIssues();

    const openIssues = list.filter((i) => i.status === 'OPEN' || i.status === 'ACKNOWLEDGED').length;
    const criticalIssues = list.filter((i) => i.severity === 'CRITICAL' && i.status !== 'CLOSED' && i.status !== 'CANCELLED').length;
    const slaBreachedCount = list.filter((i) => isSlaBreached(i)).length;
    const inProgressCount = list.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'WAITING' || i.status === 'ESCALATED').length;
    const pendingVerificationCount = list.filter((i) => i.status === 'RESOLVED').length;
    const resolvedCount = list.filter((i) => i.status === 'RESOLVED' || i.status === 'VERIFIED').length;
    const closedCount = list.filter((i) => i.status === 'CLOSED').length;

    // Calculate Avg Resolution Minutes
    const resolvedItems = list.filter((i) => i.resolvedAt);
    const totalResMins = resolvedItems.reduce((acc, i) => acc + calculateResolutionMinutes(i), 0);
    const avgResolutionMinutes = resolvedItems.length > 0 ? Math.round(totalResMins / resolvedItems.length) : 0;

    const slaCompliancePercentage = calculateSlaCompliance(list);

    return {
      totalIssues: list.length,
      openIssues,
      criticalIssues,
      slaBreachedCount,
      inProgressCount,
      pendingVerificationCount,
      resolvedCount,
      closedCount,
      avgResolutionMinutes,
      slaCompliancePercentage,
    };
  }

  async getIssueAnalytics(period = 'THIS_WEEK'): Promise<IssueAnalyticsData> {
    await delay();
    const list = this.getStoredIssues();

    // By Department
    const deptMap: Record<string, { total: number; open: number; resolved: number; critical: number; slaBreached: number }> = {};
    INITIAL_OPERATIONAL_AREAS.forEach((a) => {
      deptMap[a.name] = { total: 0, open: 0, resolved: 0, critical: 0, slaBreached: 0 };
    });

    list.forEach((i) => {
      const dept = i.department || i.areaName || 'Other';
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, open: 0, resolved: 0, critical: 0, slaBreached: 0 };
      }
      deptMap[dept].total += 1;
      if (i.status === 'OPEN' || i.status === 'IN_PROGRESS' || i.status === 'ACKNOWLEDGED') deptMap[dept].open += 1;
      if (i.status === 'RESOLVED' || i.status === 'VERIFIED' || i.status === 'CLOSED') deptMap[dept].resolved += 1;
      if (i.severity === 'CRITICAL') deptMap[dept].critical += 1;
      if (isSlaBreached(i)) deptMap[dept].slaBreached += 1;
    });

    const byDepartment = Object.entries(deptMap).map(([department, data]) => ({
      department,
      ...data,
    }));

    // By Severity
    const bySeverity: Record<OperationalIssueSeverity, number> = {
      CRITICAL: list.filter((i) => i.severity === 'CRITICAL').length,
      HIGH: list.filter((i) => i.severity === 'HIGH').length,
      MEDIUM: list.filter((i) => i.severity === 'MEDIUM').length,
      LOW: list.filter((i) => i.severity === 'LOW').length,
    };

    // By Category
    const byCategory: Record<OperationalIssueCategory, number> = {
      EQUIPMENT: list.filter((i) => i.category === 'EQUIPMENT').length,
      INVENTORY: list.filter((i) => i.category === 'INVENTORY').length,
      FOOD_SAFETY: list.filter((i) => i.category === 'FOOD_SAFETY').length,
      HYGIENE: list.filter((i) => i.category === 'HYGIENE').length,
      GUEST_COMPLAINT: list.filter((i) => i.category === 'GUEST_COMPLAINT').length,
      STAFF: list.filter((i) => i.category === 'STAFF').length,
      FACILITY: list.filter((i) => i.category === 'FACILITY').length,
      CASHIER_POS: list.filter((i) => i.category === 'CASHIER_POS').length,
      SAFETY_K3: list.filter((i) => i.category === 'SAFETY_K3').length,
      OPERATIONAL: list.filter((i) => i.category === 'OPERATIONAL').length,
      OTHER: list.filter((i) => i.category === 'OTHER').length,
    };

    // SLA Compliance
    const breachedCount = list.filter((i) => isSlaBreached(i)).length;
    const withinSla = list.length - breachedCount;
    const percentage = calculateSlaCompliance(list);

    // Avg Resolution Time By Severity
    const avgResolutionTimeBySeverity: Record<OperationalIssueSeverity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as OperationalIssueSeverity[]).forEach((sev) => {
      const items = list.filter((i) => i.severity === sev && i.resolvedAt);
      if (items.length > 0) {
        const sum = items.reduce((acc, i) => acc + calculateResolutionMinutes(i), 0);
        avgResolutionTimeBySeverity[sev] = Math.round(sum / items.length);
      }
    });

    // Recurring Issues
    const recurringIssues = this.calculateRecurringIssues(list);

    // Top Problem Stations
    const stationMap: Record<string, { stationName: string; areaName: string; count: number; critical: number }> = {};
    list.forEach((i) => {
      const stnKey = i.stationId || 'unknown';
      if (!stationMap[stnKey]) {
        stationMap[stnKey] = {
          stationName: i.stationName || 'Stasiun Kerja',
          areaName: i.areaName || 'Kitchen',
          count: 0,
          critical: 0,
        };
      }
      stationMap[stnKey].count += 1;
      if (i.severity === 'CRITICAL') stationMap[stnKey].critical += 1;
    });

    const topProblemStations = Object.entries(stationMap)
      .map(([stationId, data]) => ({
        stationId,
        stationName: data.stationName,
        areaName: data.areaName,
        issueCount: data.count,
        criticalCount: data.critical,
      }))
      .sort((a, b) => b.issueCount - a.issueCount)
      .slice(0, 5);

    return {
      byDepartment,
      bySeverity,
      byCategory,
      slaCompliance: {
        withinSla,
        slaBreached: breachedCount,
        percentage,
      },
      avgResolutionTimeBySeverity,
      recurringIssues,
      topProblemStations,
    };
  }

  private calculateRecurringIssues(list: OperationalIssue[]): RecurringIssueGroup[] {
    const groupMap: Record<string, { stationName: string; category: OperationalIssueCategory; count: number; titles: string[]; lastAt: string }> = {};

    list.forEach((i) => {
      const key = `${i.stationId}_${i.category}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          stationName: i.stationName || i.areaName || 'Stasiun Kerja',
          category: i.category,
          count: 0,
          titles: [],
          lastAt: i.createdAt,
        };
      }
      groupMap[key].count += 1;
      if (!groupMap[key].titles.includes(i.title)) {
        groupMap[key].titles.push(i.title);
      }
      if (new Date(i.createdAt).getTime() > new Date(groupMap[key].lastAt).getTime()) {
        groupMap[key].lastAt = i.createdAt;
      }
    });

    return Object.entries(groupMap)
      .filter(([_, g]) => g.count >= 2)
      .map(([stnCatKey, g]) => {
        const [stationId] = stnCatKey.split('_');
        let frequencyRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (g.count >= 5) frequencyRisk = 'HIGH';
        else if (g.count >= 3) frequencyRisk = 'MEDIUM';

        return {
          stationId,
          stationName: g.stationName,
          category: g.category,
          categoryLabel: this.getCategoryLabel(g.category),
          count: g.count,
          frequencyRisk,
          lastOccurredAt: g.lastAt,
          sampleIssueTitles: g.titles.slice(0, 3),
        };
      });
  }

  public getCategoryLabel(cat: OperationalIssueCategory): string {
    switch (cat) {
      case 'EQUIPMENT':
        return 'Peralatan';
      case 'INVENTORY':
        return 'Persediaan';
      case 'FOOD_SAFETY':
        return 'Keamanan Pangan';
      case 'HYGIENE':
        return 'Kebersihan';
      case 'GUEST_COMPLAINT':
        return 'Keluhan Tamu';
      case 'STAFF':
        return 'Karyawan';
      case 'FACILITY':
        return 'Fasilitas';
      case 'CASHIER_POS':
        return 'Kasir / POS';
      case 'SAFETY_K3':
        return 'Keselamatan K3';
      case 'OPERATIONAL':
        return 'Operasional';
      default:
        return 'Lainnya';
    }
  }

  // =========================================================================
  // MUTATION METHODS
  // =========================================================================

  async createIssue(
    data: Omit<OperationalIssue, 'id' | 'issueNumber' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'slaMinutes' | 'isSlaBreached' | 'evidenceCount' | 'auditTrail'> & {
      evidence?: IssueEvidence[];
    }
  ): Promise<OperationalIssue> {
    await delay();
    const list = this.getStoredIssues();
    const count = list.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const issueNumber = `ISS-${dateStr}-${String(count).padStart(3, '0')}`;

    const createdAt = new Date().toISOString();
    const severity = data.severity || 'MEDIUM';
    const slaMinutes = getSlaMinutes(severity);
    const slaDeadline = calculateSlaDeadline(createdAt, severity);

    const reporterEmp = INITIAL_EMPLOYEES.find((e) => e.id === data.reportedBy);
    const reporterName = data.reportedByName || reporterEmp?.name || 'Staf Operasional';

    const areaObj = INITIAL_OPERATIONAL_AREAS.find((a) => a.id === data.areaId);
    const stationObj = INITIAL_OPERATIONAL_STATIONS.find((s) => s.id === data.stationId);

    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}-01`,
      issueId: `issue-${Date.now()}`,
      action: 'CREATED',
      actorId: data.reportedBy,
      actorName: reporterName,
      actorRole: reporterEmp?.primaryPosition || 'Staff',
      timestamp: createdAt,
      reason: 'Pelaporan kendala baru.',
    };

    const newIssue: OperationalIssue = {
      ...data,
      id: `issue-${Date.now()}`,
      issueNumber,
      title: data.title || 'Kendala Operasional',
      description: data.description || '',
      areaId: data.areaId || 'area-kitchen',
      areaName: data.areaName || areaObj?.name || 'Kitchen',
      stationId: data.stationId || 'stn-kit-hot',
      stationName: data.stationName || stationObj?.name || 'Stasiun Kerja',
      department: data.department || areaObj?.name || 'Kitchen',
      shiftId: data.shiftId || 'shift-pagi',
      shiftName: data.shiftName || 'Shift Pagi',
      date: data.date || createdAt.slice(0, 10),
      reportedBy: data.reportedBy,
      reportedByName: reporterName,
      reportedAt: createdAt,
      category: data.category || 'OPERATIONAL',
      issueType: data.category || 'OPERATIONAL',
      severity,
      status: 'OPEN',
      slaMinutes,
      slaDeadline,
      isSlaBreached: false,
      evidenceCount: data.evidence?.length || 0,
      evidence: data.evidence || [],
      createdBy: data.reportedBy,
      createdAt,
      updatedBy: data.reportedBy,
      updatedAt: createdAt,
      auditTrail: [auditEvent],
    };

    list.unshift(newIssue);
    this.saveIssues(list);
    return newIssue;
  }

  async updateIssue(id: string, data: Partial<OperationalIssue>): Promise<OperationalIssue> {
    await delay();
    const list = this.getStoredIssues();
    const index = list.findIndex((i) => i.id === id || i.issueNumber === id);
    if (index === -1) throw new Error(`Issue ${id} not found`);

    const current = list[index];
    const updated: OperationalIssue = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveIssues(list);
    return updated;
  }

  async acknowledgeIssue(id: string, employeeId: string, employeeName: string): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const responseMins = calculateResponseMinutes(issue.createdAt, now);

    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'ACKNOWLEDGED',
      actorId: employeeId,
      actorName: employeeName,
      actorRole: 'Supervisor / PIC',
      timestamp: now,
      reason: 'Issue telah diterima & dikonfirmasi oleh PIC.',
    };

    return this.updateIssue(id, {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: now,
      responseMinutes: responseMins,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async assignIssue(
    id: string,
    data: {
      assignedTo: string;
      assignedToName: string;
      assignedBy: string;
      assignedByName: string;
    }
  ): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'ASSIGNED',
      actorId: data.assignedBy,
      actorName: data.assignedByName,
      actorRole: 'Manager / Supervisor',
      timestamp: now,
      reason: `Penugasan PIC baru kepada ${data.assignedToName}.`,
    };

    return this.updateIssue(id, {
      assignedTo: data.assignedTo,
      assignedToName: data.assignedToName,
      assignedAt: now,
      assignedBy: data.assignedBy,
      assignedByName: data.assignedByName,
      status: issue.status === 'OPEN' ? 'ACKNOWLEDGED' : issue.status,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async escalateIssue(
    id: string,
    data: {
      escalatedBy: string;
      escalatedByName: string;
      escalationReason: string;
      escalationLevel?: 'LEVEL_1_SUPERVISOR' | 'LEVEL_2_MANAGER' | 'LEVEL_3_EXECUTIVE';
    }
  ): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'ESCALATED',
      actorId: data.escalatedBy,
      actorName: data.escalatedByName,
      actorRole: 'Supervisor / Staff',
      timestamp: now,
      reason: data.escalationReason,
    };

    return this.updateIssue(id, {
      status: 'ESCALATED',
      escalated: true,
      escalatedAt: now,
      escalatedBy: data.escalatedBy,
      escalatedByName: data.escalatedByName,
      escalationReason: data.escalationReason,
      escalationLevel: data.escalationLevel || 'LEVEL_2_MANAGER',
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async resolveIssue(
    id: string,
    data: {
      resolution: string;
      rootCauseCategory: RootCauseCategory;
      rootCause: string;
      correctiveAction?: string;
      preventiveAction?: string;
      resolvedBy: string;
      resolvedByName: string;
      evidence?: IssueEvidence[];
    }
  ): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const resMins = calculateResolutionMinutes({ createdAt: issue.createdAt, resolvedAt: now });

    const updatedEvidence = [...(issue.evidence || []), ...(data.evidence || [])];

    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'RESOLVED',
      actorId: data.resolvedBy,
      actorName: data.resolvedByName,
      actorRole: 'PIC / Staff',
      timestamp: now,
      reason: `Penanganan diselesaikan: ${data.resolution}`,
    };

    return this.updateIssue(id, {
      status: 'RESOLVED',
      resolution: data.resolution,
      resolutionNotes: data.resolution,
      rootCauseCategory: data.rootCauseCategory,
      rootCause: data.rootCause,
      correctiveAction: data.correctiveAction,
      preventiveAction: data.preventiveAction,
      resolvedBy: data.resolvedBy,
      resolvedByName: data.resolvedByName,
      resolvedAt: now,
      resolutionMinutes: resMins,
      evidence: updatedEvidence,
      evidenceCount: updatedEvidence.length,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async verifyIssue(
    id: string,
    data: {
      verifiedBy: string;
      verifiedByName: string;
      verificationNote?: string;
    }
  ): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'VERIFIED',
      actorId: data.verifiedBy,
      actorName: data.verifiedByName,
      actorRole: 'Supervisor / Manager',
      timestamp: now,
      reason: data.verificationNote || 'Penanganan disetujui & diverifikasi.',
    };

    return this.updateIssue(id, {
      status: 'VERIFIED',
      verifiedBy: data.verifiedBy,
      verifiedByName: data.verifiedByName,
      verifiedAt: now,
      verificationNote: data.verificationNote,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async requestRevision(
    id: string,
    data: {
      verifiedBy: string;
      verifiedByName: string;
      revisionReason: string;
    }
  ): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'REVISION_REQUESTED',
      actorId: data.verifiedBy,
      actorName: data.verifiedByName,
      actorRole: 'Supervisor / Manager',
      timestamp: now,
      reason: data.revisionReason,
    };

    return this.updateIssue(id, {
      status: 'REVISION_REQUIRED',
      verificationNote: data.revisionReason,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async closeIssue(id: string, employeeId: string, employeeName: string): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'CLOSED',
      actorId: employeeId,
      actorName: employeeName,
      actorRole: 'Manager',
      timestamp: now,
      reason: 'Issue resmi ditutup setelah verifikasi.',
    };

    return this.updateIssue(id, {
      status: 'CLOSED',
      closedBy: employeeId,
      closedByName: employeeName,
      closedAt: now,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  async cancelIssue(id: string, reason: string, employeeId: string, employeeName: string): Promise<OperationalIssue> {
    await delay();
    const issue = await this.getIssueById(id);
    if (!issue) throw new Error(`Issue ${id} not found`);

    const now = new Date().toISOString();
    const auditEvent: IssueAuditEvent = {
      id: `aud-${Date.now()}`,
      issueId: issue.id,
      action: 'CANCELLED',
      actorId: employeeId,
      actorName: employeeName,
      actorRole: 'Manager',
      timestamp: now,
      reason,
    };

    return this.updateIssue(id, {
      status: 'CANCELLED',
      cancellationReason: reason,
      auditTrail: [auditEvent, ...issue.auditTrail],
    });
  }

  // =========================================================================
  // AUTOMATIC CHECKLIST INTEGRATION
  // =========================================================================

  async createAutomaticIssueFromChecklist(
    item: {
      itemId: string;
      title: string;
      category?: string;
      isCriticalControlPoint?: boolean;
      notes?: string;
    },
    checklistContext: {
      checklistId: string;
      areaId: string;
      areaName: string;
      stationId?: string;
      stationName?: string;
      shiftId?: string;
      shiftName?: string;
    },
    reporterId: string
  ): Promise<OperationalIssue | null> {
    await delay();
    const list = this.getStoredIssues();

    // Prevent duplicate active issue for same checklist item
    const existing = list.find(
      (i) =>
        i.checklistItemId === item.itemId &&
        i.checklistId === checklistContext.checklistId &&
        (i.status === 'OPEN' || i.status === 'IN_PROGRESS' || i.status === 'ACKNOWLEDGED')
    );

    if (existing) {
      return existing; // Return existing issue, do not duplicate
    }

    const reporterEmp = INITIAL_EMPLOYEES.find((e) => e.id === reporterId);
    const isCCP = !!item.isCriticalControlPoint;
    const severity: OperationalIssueSeverity = isCCP ? 'CRITICAL' : 'HIGH';

    let category: OperationalIssueCategory = 'OPERATIONAL';
    if (item.category === 'CLEANLINESS') category = 'HYGIENE';
    else if (item.category === 'EQUIPMENT') category = 'EQUIPMENT';
    else if (item.category === 'FOOD') category = 'FOOD_SAFETY';
    else if (isCCP) category = 'FOOD_SAFETY';

    return this.createIssue({
      title: `${isCCP ? 'CCP Failure' : 'Checklist Failure'} — ${item.title}`,
      description: item.notes || `Gagal pemeriksaan checklist stasiun ${checklistContext.stationName || checklistContext.areaName}.`,
      areaId: checklistContext.areaId,
      areaName: checklistContext.areaName,
      stationId: checklistContext.stationId || 'stn-gen',
      stationName: checklistContext.stationName || checklistContext.areaName,
      department: checklistContext.areaName,
      shiftId: checklistContext.shiftId,
      shiftName: checklistContext.shiftName,
      date: new Date().toISOString().slice(0, 10),
      reportedBy: reporterId,
      reportedByName: reporterEmp?.name || 'Staf Pemeriksa Checklist',
      reportedAt: new Date().toISOString(),
      createdBy: reporterId,
      status: 'OPEN',
      evidence: [],
      category,
      severity,
      checklistId: checklistContext.checklistId,
      checklistItemId: item.itemId,
    });
  }

  // =========================================================================
  // CSV EXPORT
  // =========================================================================

  exportIssuesToCsv(issues: OperationalIssue[]): string {
    const headers = [
      'Issue Number',
      'Title',
      'Category',
      'Severity',
      'Department',
      'Area',
      'Station',
      'Reporter',
      'PIC',
      'Status',
      'SLA Status',
      'SLA Deadline',
      'Created At',
      'Resolved At',
      'Resolution Mins',
      'Root Cause Category',
    ];

    const rows = issues.map((i) => {
      const isBreached = isSlaBreached(i);
      return [
        `"${i.issueNumber}"`,
        `"${i.title.replace(/"/g, '""')}"`,
        `"${this.getCategoryLabel(i.category)}"`,
        `"${i.severity}"`,
        `"${i.department}"`,
        `"${i.areaName}"`,
        `"${i.stationName || ''}"`,
        `"${i.reportedByName}"`,
        `"${i.assignedToName || 'Unassigned'}"`,
        `"${i.status}"`,
        `"${isBreached ? 'SLA TERLEWATI' : 'DALAM SLA'}"`,
        `"${i.slaDeadline}"`,
        `"${i.createdAt}"`,
        `"${i.resolvedAt || ''}"`,
        `"${i.resolutionMinutes || ''}"`,
        `"${i.rootCauseCategory || ''}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // =========================================================================
  // RESET DEFAULTS
  // =========================================================================

  async resetToDefaults(): Promise<void> {
    await delay(100);
    const defaultList = this.normalizeIssues(INITIAL_OPERATIONAL_ISSUES);
    this.saveIssues(defaultList);
  }
}

export const operationalIssueService = new OperationalIssueServiceClass();
