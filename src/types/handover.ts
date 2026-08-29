/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — SHIFT & HANDOVER MANAGEMENT DATA MODELS
 * Type definitions, interfaces, and enums for TropicalOS Shift Handover System
 */

export type HandoverStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_RECEIPT'
  | 'RECEIVED'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'CANCELLED'
  | 'EXPIRED';

export type OverallCondition = 'NORMAL' | 'ATTENTION' | 'CRITICAL';

export type PendingTaskSourceType =
  | 'CHECKLIST'
  | 'ISSUE'
  | 'INVENTORY'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OTHER';

export type PendingTaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PendingTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PendingTask {
  taskId: string;
  title: string;
  description: string;
  areaId: string;
  areaName?: string;
  stationId?: string;
  stationName?: string;
  priority: PendingTaskPriority;
  status: PendingTaskStatus;
  assignedTo: string;
  assignedToName?: string;
  dueTime?: string; // e.g. '15:30' or 'Sebelum Dinner Rush'
  sourceType: PendingTaskSourceType;
  sourceId?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface HandoverEvidence {
  id: string;
  photoUrl: string;
  timestamp: string;
  uploadedBy: string;
  uploadedByName: string;
  description: string;
  category?: 'EQUIPMENT' | 'STATION' | 'STOCK' | 'CLEANLINESS' | 'DAMAGE' | 'OTHER';
}

export interface HandoverAuditTrailEntry {
  id: string;
  handoverId: string;
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'SUBMITTED'
    | 'RECEIVED'
    | 'VERIFIED'
    | 'REVISION_REQUESTED'
    | 'CANCELLED';
  performedBy: string;
  performedByName: string;
  role: string;
  details: string;
  timestamp: string;
}

export interface LinkedIssueSummary {
  issueId: string;
  issueNumber: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  assignedToName?: string;
  stationName?: string;
}

export interface LinkedChecklistSummary {
  checklistId: string;
  templateTitle: string;
  completionPercentage: number;
  status: string;
  failedCount: number;
  criticalCount: number;
}

export interface HandoverRecord {
  id: string; // standard identifier
  handoverId: string; // explicit alias
  handoverNumber: string; // e.g. 'HO-20260818-KIT-01'

  date: string; // YYYY-MM-DD

  fromShiftId: string; // 'shift-pagi' | 'shift-siang'
  toShiftId: string;
  fromShiftName: string;
  toShiftName: string;

  fromEmployeeId: string;
  fromEmployeeName: string;
  fromEmployeeCode?: string;
  fromRole?: string;

  toEmployeeId: string;
  toEmployeeName: string;
  toEmployeeCode?: string;
  toRole?: string;

  department: string;
  areaId: string;
  areaName: string;

  stationId?: string;
  stationName?: string;

  status: HandoverStatus;
  overallCondition: OverallCondition;

  criticalIssueCount: number;
  pendingTaskCount: number;

  summary: string;

  criticalNotes?: string;
  operationalNotes?: string;
  equipmentNotes?: string;
  inventoryNotes?: string;
  guestExperienceNotes?: string;
  cleanlinessNotes?: string;
  safetyNotes?: string;

  pendingTasks: PendingTask[];

  issueReferences?: string[];
  linkedIssues?: LinkedIssueSummary[];

  checklistReferences?: string[];
  linkedChecklists?: LinkedChecklistSummary[];

  wastingReferences?: string[];

  evidence: HandoverEvidence[];
  auditTrail: HandoverAuditTrailEntry[];

  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;

  submittedBy?: string;
  submittedAt?: string;

  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
  receiptNotes?: string;

  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNotes?: string;

  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  cancelledBy?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface HandoverTemplateSection {
  title: string;
  description: string;
  required: boolean;
  defaultPrompt: string;
}

export interface HandoverAreaTemplate {
  areaId: string;
  areaName: string;
  department: string;
  sections: HandoverTemplateSection[];
  recommendedCheckpoints: string[];
}

export interface HandoverDashboardMetrics {
  totalHandovers: number;
  completedHandovers: number; // Received or Verified
  pendingReceiptCount: number;
  pendingVerificationCount: number;
  verifiedCount: number;
  revisionRequiredCount: number;
  criticalConditionCount: number;
  attentionConditionCount: number;
  normalConditionCount: number;
  complianceRate: number; // percentage (Verified / Total Required) * 100
  lateHandoversCount: number;
  totalPendingTasks: number;
  openCriticalIssues: number;
}

export interface DepartmentHandoverMetric {
  department: string;
  areaId: string;
  areaName: string;
  total: number;
  verified: number;
  pending: number;
  revisionRequired: number;
  criticalIssues: number;
  complianceRate: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL';
}

export interface HandoverAnalyticsData {
  period: string;
  overallComplianceRate: number;
  departmentMetrics: DepartmentHandoverMetric[];
  conditionDistribution: {
    normal: number;
    attention: number;
    critical: number;
  };
  issueCategoryFrequency: {
    category: string;
    count: number;
  }[];
  trendData: {
    date: string;
    total: number;
    verified: number;
    critical: number;
    complianceRate: number;
  }[];
}

export interface HandoverFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  fromShiftId?: string;
  toShiftId?: string;
  department?: string;
  areaId?: string;
  stationId?: string;
  employeeId?: string;
  status?: HandoverStatus | 'ALL';
  overallCondition?: OverallCondition | 'ALL';
  criticalOnly?: boolean;
  hasPendingTasksOnly?: boolean;
  searchQuery?: string;
}
