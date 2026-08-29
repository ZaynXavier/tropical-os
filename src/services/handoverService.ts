/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — SHIFT & HANDOVER MANAGEMENT SERVICE
 * Abstraction service layer for Shift Handover Lifecycle,
 * Rule-Based Automatic Summary Engine, Audit Trail, and Analytics.
 */

import {
  HandoverRecord,
  HandoverStatus,
  OverallCondition,
  PendingTask,
  HandoverFilterParams,
  HandoverDashboardMetrics,
  HandoverAnalyticsData,
  HandoverAreaTemplate,
  HandoverAuditTrailEntry,
} from '../types/handover';
import { INITIAL_MOCK_HANDOVERS, HANDOVER_AREA_TEMPLATES } from '../data/mockHandovers';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { OFFICIAL_SHIFTS } from '../data/mockShifts';
import { getJakartaDateString, getJakartaTimeString } from './operationsService';

const HANDOVERS_STORAGE_KEY = 'tropicalos_master_handovers';

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

class HandoverServiceClass {
  // =========================================================================
  // STORAGE HELPERS (Safe LocalStorage Engine)
  // =========================================================================

  private getStoredHandovers(): HandoverRecord[] {
    try {
      const stored = localStorage.getItem(HANDOVERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[HandoverService] Error reading handovers from storage:', e);
    }
    this.saveHandovers(INITIAL_MOCK_HANDOVERS);
    return INITIAL_MOCK_HANDOVERS;
  }

  private saveHandovers(handovers: HandoverRecord[]): void {
    try {
      localStorage.setItem(HANDOVERS_STORAGE_KEY, JSON.stringify(handovers));
    } catch (e) {
      console.error('[HandoverService] Error saving handovers to storage:', e);
    }
  }

  // =========================================================================
  // 1. QUERY METHODS
  // =========================================================================

  async getHandovers(params?: HandoverFilterParams): Promise<HandoverRecord[]> {
    await delay();
    let list = this.getStoredHandovers();

    if (!params) return list;

    if (params.date && params.date !== 'ALL') {
      list = list.filter((h) => h.date === params.date);
    }
    if (params.startDate) {
      list = list.filter((h) => h.date >= (params.startDate as string));
    }
    if (params.endDate) {
      list = list.filter((h) => h.date <= (params.endDate as string));
    }
    if (params.fromShiftId && params.fromShiftId !== 'ALL') {
      list = list.filter((h) => h.fromShiftId === params.fromShiftId);
    }
    if (params.toShiftId && params.toShiftId !== 'ALL') {
      list = list.filter((h) => h.toShiftId === params.toShiftId);
    }
    if (params.department && params.department !== 'ALL') {
      list = list.filter((h) => h.department.toLowerCase() === (params.department as string).toLowerCase());
    }
    if (params.areaId && params.areaId !== 'ALL') {
      list = list.filter((h) => h.areaId === params.areaId);
    }
    if (params.stationId && params.stationId !== 'ALL') {
      list = list.filter((h) => h.stationId === params.stationId);
    }
    if (params.employeeId) {
      list = list.filter(
        (h) => h.fromEmployeeId === params.employeeId || h.toEmployeeId === params.employeeId
      );
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((h) => h.status === params.status);
    }
    if (params.overallCondition && params.overallCondition !== 'ALL') {
      list = list.filter((h) => h.overallCondition === params.overallCondition);
    }
    if (params.criticalOnly) {
      list = list.filter((h) => h.overallCondition === 'CRITICAL' || h.criticalIssueCount > 0);
    }
    if (params.hasPendingTasksOnly) {
      list = list.filter((h) => (h.pendingTasks?.length || 0) > 0);
    }
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (h) =>
          h.handoverNumber.toLowerCase().includes(q) ||
          h.fromEmployeeName.toLowerCase().includes(q) ||
          h.toEmployeeName.toLowerCase().includes(q) ||
          h.areaName.toLowerCase().includes(q) ||
          (h.summary && h.summary.toLowerCase().includes(q)) ||
          (h.issueReferences && h.issueReferences.some((iss) => iss.toLowerCase().includes(q)))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getHandoverById(id: string): Promise<HandoverRecord | null> {
    await delay();
    const list = this.getStoredHandovers();
    return list.find((h) => h.id === id || h.handoverId === id) || null;
  }

  async getHandoversByDate(date: string): Promise<HandoverRecord[]> {
    return this.getHandovers({ date });
  }

  async getHandoversByShift(shiftId: string): Promise<HandoverRecord[]> {
    return this.getHandovers({ fromShiftId: shiftId });
  }

  async getHandoversByArea(areaId: string): Promise<HandoverRecord[]> {
    return this.getHandovers({ areaId });
  }

  async getHandoversByEmployee(employeeId: string): Promise<HandoverRecord[]> {
    return this.getHandovers({ employeeId });
  }

  async getPendingHandovers(): Promise<HandoverRecord[]> {
    await delay();
    const list = this.getStoredHandovers();
    return list.filter(
      (h) =>
        h.status === 'SUBMITTED' ||
        h.status === 'PENDING_RECEIPT' ||
        h.status === 'RECEIVED' ||
        h.status === 'REVISION_REQUIRED'
    );
  }

  async getCriticalHandovers(): Promise<HandoverRecord[]> {
    await delay();
    const list = this.getStoredHandovers();
    return list.filter((h) => h.overallCondition === 'CRITICAL' || h.criticalIssueCount > 0);
  }

  getAreaTemplates(): Record<string, HandoverAreaTemplate> {
    return HANDOVER_AREA_TEMPLATES;
  }

  // =========================================================================
  // 2. LIFECYCLE MUTATION METHODS
  // =========================================================================

  async createHandover(data: Partial<HandoverRecord>): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const now = new Date().toISOString();
    const today = data.date || getJakartaDateString();

    const areaCode = (data.areaId || 'OPS').replace('area-', '').toUpperCase().slice(0, 3);
    const countToday = list.filter((h) => h.date === today).length + 1;
    const handoverNumber = `HO-${today.replace(/-/g, '')}-${areaCode}-${String(countToday).padStart(2, '0')}`;
    const id = `ho-${Date.now()}-${Math.random().toString(36).slice(-4)}`;

    const fromShift = OFFICIAL_SHIFTS.find((s) => s.id === data.fromShiftId) || OFFICIAL_SHIFTS[0];
    const toShift = OFFICIAL_SHIFTS.find((s) => s.id === data.toShiftId) || OFFICIAL_SHIFTS[1];

    const fromEmp = INITIAL_EMPLOYEES.find((e) => e.id === data.fromEmployeeId);
    const toEmp = INITIAL_EMPLOYEES.find((e) => e.id === data.toEmployeeId);

    const auditTrail: HandoverAuditTrailEntry[] = [
      {
        id: `aud-${Date.now()}-01`,
        handoverId: id,
        action: data.status === 'SUBMITTED' ? 'SUBMITTED' : 'CREATED',
        performedBy: data.fromEmployeeId || 'emp-02',
        performedByName: data.fromEmployeeName || fromEmp?.name || 'Staff',
        role: fromEmp?.primaryPosition || 'Staff',
        details: data.status === 'SUBMITTED' ? 'Handover diserahkan langsung ke shift penerima.' : 'Draft handover dibuat.',
        timestamp: now,
      },
    ];

    const newRecord: HandoverRecord = {
      id,
      handoverId: id,
      handoverNumber,
      date: today,
      fromShiftId: fromShift.id,
      toShiftId: toShift.id,
      fromShiftName: fromShift.name,
      toShiftName: toShift.name,
      fromEmployeeId: data.fromEmployeeId || 'emp-06',
      fromEmployeeName: data.fromEmployeeName || fromEmp?.name || 'Staff Pengirim',
      fromEmployeeCode: fromEmp?.employeeCode || fromEmp?.id,
      fromRole: fromEmp?.primaryPosition || 'Staff',
      toEmployeeId: data.toEmployeeId || 'emp-07',
      toEmployeeName: data.toEmployeeName || toEmp?.name || 'Staff Penerima',
      toEmployeeCode: toEmp?.employeeCode || toEmp?.id,
      toRole: toEmp?.primaryPosition || 'Staff',
      department: data.department || fromEmp?.department || 'Kitchen',
      areaId: data.areaId || 'area-kitchen',
      areaName: data.areaName || 'Kitchen',
      stationId: data.stationId,
      stationName: data.stationName,
      status: data.status || 'SUBMITTED',
      overallCondition: data.overallCondition || 'NORMAL',
      criticalIssueCount: data.criticalIssueCount || (data.overallCondition === 'CRITICAL' ? 1 : 0),
      pendingTaskCount: data.pendingTasks?.length || 0,
      summary: data.summary || 'Serah terima operasional shift berjalan lancar.',
      criticalNotes: data.criticalNotes,
      operationalNotes: data.operationalNotes,
      equipmentNotes: data.equipmentNotes,
      inventoryNotes: data.inventoryNotes,
      guestExperienceNotes: data.guestExperienceNotes,
      cleanlinessNotes: data.cleanlinessNotes,
      safetyNotes: data.safetyNotes,
      pendingTasks: data.pendingTasks || [],
      issueReferences: data.issueReferences || [],
      linkedIssues: data.linkedIssues || [],
      checklistReferences: data.checklistReferences || [],
      linkedChecklists: data.linkedChecklists || [],
      wastingReferences: data.wastingReferences || [],
      evidence: data.evidence || [],
      auditTrail,
      createdBy: data.fromEmployeeId || 'emp-06',
      createdAt: now,
      updatedBy: data.fromEmployeeId || 'emp-06',
      updatedAt: now,
      submittedBy: data.status === 'SUBMITTED' ? data.fromEmployeeId : undefined,
      submittedAt: data.status === 'SUBMITTED' ? now : undefined,
    };

    list.unshift(newRecord);
    this.saveHandovers(list);
    return newRecord;
  }

  async updateHandover(id: string, data: Partial<HandoverRecord>): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const auditEntry: HandoverAuditTrailEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
      handoverId: id,
      action: 'UPDATED',
      performedBy: data.updatedBy || current.fromEmployeeId,
      performedByName: current.fromEmployeeName,
      role: current.fromRole || 'Staff',
      details: 'Catatan dan parameter serah terima diperbarui.',
      timestamp: now,
    };

    const updated: HandoverRecord = {
      ...current,
      ...data,
      pendingTaskCount: data.pendingTasks ? data.pendingTasks.length : current.pendingTasks.length,
      updatedAt: now,
      auditTrail: [...current.auditTrail, auditEntry],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  async submitHandover(id: string, employeeId = 'emp-06', employeeName = 'Staff'): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const updated: HandoverRecord = {
      ...current,
      status: 'SUBMITTED',
      submittedBy: employeeId,
      submittedAt: now,
      updatedBy: employeeId,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          handoverId: id,
          action: 'SUBMITTED',
          performedBy: employeeId,
          performedByName: employeeName,
          role: current.fromRole || 'Staff',
          details: `Handover resmi diserahkan kepada ${current.toEmployeeName}.`,
          timestamp: now,
        },
      ],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  async receiveHandover(
    id: string,
    employeeId = 'emp-07',
    employeeName = 'Staff Penerima',
    notes?: string
  ): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const updated: HandoverRecord = {
      ...current,
      status: 'RECEIVED',
      receivedBy: employeeId,
      receivedByName: employeeName,
      receivedAt: now,
      receiptNotes: notes || 'Serah terima operasional diterima dengan baik.',
      updatedBy: employeeId,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          handoverId: id,
          action: 'RECEIVED',
          performedBy: employeeId,
          performedByName: employeeName,
          role: current.toRole || 'Staff Penerima',
          details: `Handover diterima oleh ${employeeName}: ${notes || 'Kondisi stasiun sesuai laporan.'}`,
          timestamp: now,
        },
      ],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  async verifyHandover(
    id: string,
    supervisorId = 'emp-02',
    supervisorName = 'Heri Setiawan',
    notes?: string
  ): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const updated: HandoverRecord = {
      ...current,
      status: 'VERIFIED',
      verifiedBy: supervisorId,
      verifiedByName: supervisorName,
      verifiedAt: now,
      verificationNotes: notes || 'Terverifikasi dan disetujui supervisor.',
      rejectedBy: undefined,
      rejectedByName: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      updatedBy: supervisorId,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          handoverId: id,
          action: 'VERIFIED',
          performedBy: supervisorId,
          performedByName: supervisorName,
          role: 'Supervisor / Manager',
          details: `Handover disetujui & diverifikasi: ${notes || 'Lengkap dan akurat.'}`,
          timestamp: now,
        },
      ],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  async requestHandoverRevision(
    id: string,
    supervisorId = 'emp-02',
    supervisorName = 'Heri Setiawan',
    reason = 'Catatan belum lengkap'
  ): Promise<HandoverRecord> {
    await delay();
    if (!reason || reason.trim().length < 3) {
      throw new Error('Alasan permintaan revisi wajib diisi.');
    }

    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const updated: HandoverRecord = {
      ...current,
      status: 'REVISION_REQUIRED',
      rejectedBy: supervisorId,
      rejectedByName: supervisorName,
      rejectedAt: now,
      rejectionReason: reason,
      verifiedBy: undefined,
      verifiedByName: undefined,
      verifiedAt: undefined,
      updatedBy: supervisorId,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          handoverId: id,
          action: 'REVISION_REQUESTED',
          performedBy: supervisorId,
          performedByName: supervisorName,
          role: 'Supervisor / Manager',
          details: `Revisi diminta: ${reason}`,
          timestamp: now,
        },
      ],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  async cancelHandover(
    id: string,
    employeeId = 'emp-02',
    employeeName = 'Manager',
    reason = 'Dibatalkan oleh manajemen'
  ): Promise<HandoverRecord> {
    await delay();
    const list = this.getStoredHandovers();
    const index = list.findIndex((h) => h.id === id || h.handoverId === id);
    if (index === -1) throw new Error(`Handover ${id} tidak ditemukan.`);

    const current = list[index];
    const now = new Date().toISOString();

    const updated: HandoverRecord = {
      ...current,
      status: 'CANCELLED',
      cancelledBy: employeeId,
      cancelledByName: employeeName,
      cancelledAt: now,
      cancellationReason: reason,
      updatedBy: employeeId,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          handoverId: id,
          action: 'CANCELLED',
          performedBy: employeeId,
          performedByName: employeeName,
          role: 'Manager',
          details: `Handover dibatalkan: ${reason}`,
          timestamp: now,
        },
      ],
    };

    list[index] = updated;
    this.saveHandovers(list);
    return updated;
  }

  // =========================================================================
  // 3. RULE-BASED AUTOMATIC SUMMARY ENGINE (No External AI)
  // =========================================================================

  generateHandoverSummary(context: {
    areaId: string;
    areaName?: string;
    fromShiftName?: string;
    condition: OverallCondition;
    pendingTasksCount: number;
    criticalIssuesCount: number;
    equipmentNotes?: string;
    inventoryNotes?: string;
    operationalNotes?: string;
  }): string {
    const areaName = context.areaName || 'Operasional';
    const shift = context.fromShiftName || 'Shift Pagi';
    const condition = context.condition;

    let conditionClause = '';
    if (condition === 'NORMAL') {
      conditionClause = `${areaName} ${shift} selesai dalam kondisi NORMAL dan optimal. Seluruh stasiun siap pakai.`;
    } else if (condition === 'ATTENTION') {
      conditionClause = `${areaName} ${shift} selesai dengan catatan ATTENTION. Terdapat ${context.pendingTasksCount} tugas lanjutan yang perlu diperhatikan shift berikutnya.`;
    } else {
      conditionClause = `PERHATIAN: ${areaName} ${shift} berakhir dalam status CRITICAL (${context.criticalIssuesCount} isu membutuhkan tindakan segera).`;
    }

    let detailClause = '';
    if (context.equipmentNotes && context.equipmentNotes.trim().length > 5) {
      detailClause += ` Status alat: ${context.equipmentNotes.trim()}.`;
    }
    if (context.inventoryNotes && context.inventoryNotes.trim().length > 5) {
      detailClause += ` Status stok: ${context.inventoryNotes.trim()}.`;
    }
    if (context.operationalNotes && context.operationalNotes.trim().length > 5) {
      detailClause += ` Aktivitas operasional: ${context.operationalNotes.trim()}.`;
    }

    if (!detailClause) {
      detailClause = ' Sanitasi, ketersediaan bahan mise en place, dan checklist kesiapan telah dieksekusi sesuai standar SOP Tropical Garden Resto.';
    }

    return `${conditionClause}${detailClause}`;
  }

  async getPendingTasksForHandover(context: { areaId?: string; date?: string }): Promise<PendingTask[]> {
    await delay();
    const handovers = this.getStoredHandovers();
    const tasks: PendingTask[] = [];

    handovers.forEach((h) => {
      if ((!context.areaId || context.areaId === 'ALL' || h.areaId === context.areaId) && h.pendingTasks) {
        h.pendingTasks.forEach((pt) => {
          if (pt.status === 'OPEN' || pt.status === 'IN_PROGRESS') {
            tasks.push(pt);
          }
        });
      }
    });

    return tasks;
  }

  // =========================================================================
  // 4. METRICS & ANALYTICS
  // =========================================================================

  async getHandoverSummary(period = 'TODAY', date = getJakartaDateString()): Promise<HandoverDashboardMetrics> {
    await delay();
    let list = this.getStoredHandovers();

    if (period === 'TODAY' && date !== 'ALL') {
      list = list.filter((h) => h.date === date);
    }

    const total = list.length;
    const verified = list.filter((h) => h.status === 'VERIFIED').length;
    const received = list.filter((h) => h.status === 'RECEIVED').length;
    const completed = verified + received;
    const pendingReceipt = list.filter((h) => h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT').length;
    const pendingVerification = list.filter((h) => h.status === 'RECEIVED').length;
    const revisionRequired = list.filter((h) => h.status === 'REVISION_REQUIRED').length;

    const critical = list.filter((h) => h.overallCondition === 'CRITICAL').length;
    const attention = list.filter((h) => h.overallCondition === 'ATTENTION').length;
    const normal = list.filter((h) => h.overallCondition === 'NORMAL').length;

    const totalPendingTasks = list.reduce(
      (acc, h) => acc + (h.pendingTasks?.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length || 0),
      0
    );
    const openCriticalIssues = list.reduce((acc, h) => acc + (h.criticalIssueCount || 0), 0);

    const complianceRate = total > 0 ? Math.round((verified / total) * 100) : 100;

    return {
      totalHandovers: total,
      completedHandovers: completed,
      pendingReceiptCount: pendingReceipt,
      pendingVerificationCount: pendingVerification,
      verifiedCount: verified,
      revisionRequiredCount: revisionRequired,
      criticalConditionCount: critical,
      attentionConditionCount: attention,
      normalConditionCount: normal,
      complianceRate,
      lateHandoversCount: 0,
      totalPendingTasks,
      openCriticalIssues,
    };
  }

  async getHandoverAnalytics(period = 'THIS_WEEK'): Promise<HandoverAnalyticsData> {
    await delay();
    const list = this.getStoredHandovers();
    const total = list.length;
    const verified = list.filter((h) => h.status === 'VERIFIED').length;
    const overallComplianceRate = total > 0 ? Math.round((verified / total) * 100) : 100;

    const departments = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'Cashier', 'Management'];
    const departmentMetrics = departments.map((dept) => {
      const deptList = list.filter((h) => h.department.toLowerCase() === dept.toLowerCase());
      const dTotal = deptList.length;
      const dVerified = deptList.filter((h) => h.status === 'VERIFIED').length;
      const dPending = deptList.filter(
        (h) => h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT' || h.status === 'RECEIVED'
      ).length;
      const dRevision = deptList.filter((h) => h.status === 'REVISION_REQUIRED').length;
      const dCritical = deptList.filter((h) => h.overallCondition === 'CRITICAL').length;
      const dCompliance = dTotal > 0 ? Math.round((dVerified / dTotal) * 100) : 100;

      let status: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL' = 'OPTIMAL';
      if (dCritical > 0 || dRevision > 1) status = 'CRITICAL';
      else if (dPending > 2 || dCompliance < 75) status = 'ATTENTION';
      else if (dCompliance < 90) status = 'ADEQUATE';

      return {
        department: dept,
        areaId: `area-${dept.toLowerCase()}`,
        areaName: dept,
        total: dTotal,
        verified: dVerified,
        pending: dPending,
        revisionRequired: dRevision,
        criticalIssues: dCritical,
        complianceRate: dCompliance,
        status,
      };
    });

    const normal = list.filter((h) => h.overallCondition === 'NORMAL').length;
    const attention = list.filter((h) => h.overallCondition === 'ATTENTION').length;
    const critical = list.filter((h) => h.overallCondition === 'CRITICAL').length;

    const issueCategoryFrequency = [
      { category: 'Peralatan & Mesin', count: list.filter((h) => (h.equipmentNotes || '').length > 5).length },
      { category: 'Stok & Receiving', count: list.filter((h) => (h.inventoryNotes || '').length > 5).length },
      { category: 'Sanitasi & Kebersihan', count: list.filter((h) => (h.cleanlinessNotes || '').length > 5).length },
      { category: 'Reservasi & Tamu VIP', count: list.filter((h) => (h.guestExperienceNotes || '').length > 5).length },
      { category: 'Keselamatan Kerja', count: list.filter((h) => (h.safetyNotes || '').length > 5).length },
    ];

    const today = getJakartaDateString();
    const trendData = [
      { date: '14/08', total: 4, verified: 4, critical: 0, complianceRate: 100 },
      { date: '15/08', total: 5, verified: 5, critical: 0, complianceRate: 100 },
      { date: '16/08', total: 5, verified: 4, critical: 1, complianceRate: 80 },
      { date: '17/08', total: 5, verified: 5, critical: 0, complianceRate: 100 },
      { date: '18/08', total: list.filter((h) => h.date === today).length || 5, verified: verified, critical: critical, complianceRate: overallComplianceRate },
    ];

    return {
      period,
      overallComplianceRate,
      departmentMetrics,
      conditionDistribution: {
        normal,
        attention,
        critical,
      },
      issueCategoryFrequency,
      trendData,
    };
  }

  // =========================================================================
  // 5. CSV EXPORT
  // =========================================================================

  exportHandoversToCsv(handoversOrDate?: HandoverRecord[] | string, shiftId?: string): string {
    let handovers: HandoverRecord[] = [];
    if (Array.isArray(handoversOrDate)) {
      handovers = handoversOrDate;
    } else {
      const date = handoversOrDate || getJakartaDateString();
      handovers = this.getStoredHandovers().filter(
        (h) => (date === 'ALL' || !date || h.date === date) && (!shiftId || shiftId === 'ALL' || h.fromShiftId === shiftId)
      );
    }

    const headers = [
      'Handover Number',
      'Date',
      'From Shift',
      'To Shift',
      'Department',
      'Area',
      'Station',
      'Sender',
      'Receiver',
      'Condition',
      'Status',
      'Critical Issues',
      'Pending Tasks',
      'Summary',
      'Verified By',
      'Verified At',
      'Rejection Reason',
    ];

    const rows = handovers.map((h) => [
      `"${h.handoverNumber}"`,
      `"${h.date}"`,
      `"${h.fromShiftName}"`,
      `"${h.toShiftName}"`,
      `"${h.department}"`,
      `"${h.areaName}"`,
      `"${h.stationName || '-'}"`,
      `"${h.fromEmployeeName}"`,
      `"${h.toEmployeeName}"`,
      `"${h.overallCondition}"`,
      `"${h.status}"`,
      h.criticalIssueCount || 0,
      h.pendingTasks?.length || 0,
      `"${(h.summary || '').replace(/"/g, '""')}"`,
      `"${h.verifiedByName || '-'}"`,
      `"${h.verifiedAt || '-'}"`,
      `"${h.rejectionReason || '-'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // =========================================================================
  // 6. RESET TO DEFAULTS
  // =========================================================================

  async resetToDefaults(): Promise<void> {
    await delay(100);
    this.saveHandovers(INITIAL_MOCK_HANDOVERS);
  }
}

export const handoverService = new HandoverServiceClass();
