/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — DAILY OPERATIONS EXECUTION & STATION CHECKLIST
 * Data Models & TypeScript Interfaces for Daily Station Checklists,
 * Execution Records, Evidence, Supervisor Verification, and Compliance.
 */

import { RestoDivision } from './operationalKnowledge';

// ============================================================================
// 1. ENUMS & CORE STATUSES
// ============================================================================

export type ChecklistType =
  | 'OPENING'
  | 'RUNNING'
  | 'CLOSING'
  | 'SAFETY'
  | 'SANITATION'
  | 'QUALITY'
  | 'STOCK'
  | 'EQUIPMENT';

export type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type DailyChecklistStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFICATION_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'OVERDUE';

export type ChecklistItemStatus =
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'SKIPPED'
  | 'NA';

export type ItemCategory =
  | 'HYGIENE'
  | 'SAFETY'
  | 'EQUIPMENT'
  | 'PREPARATION'
  | 'FOOD_QUALITY'
  | 'SERVICE'
  | 'ADMIN'
  | 'STOCK';

export type EvidenceType = 'PHOTO' | 'NOTE' | 'NUMERIC' | 'DOCUMENT';

// ============================================================================
// 2. CHECKLIST TEMPLATE & ITEMS (MASTER DEFINITIONS)
// ============================================================================

export interface ChecklistItem {
  id: string;
  itemId?: string; // alias
  templateId: string;
  sequence: number;
  title: string;
  description: string;
  category: ItemCategory;
  isRequired: boolean;
  requiresPhoto: boolean;
  requiresNote: boolean;
  requiresNumericValue: boolean;
  minValue?: number;
  maxValue?: number;
  unit?: string; // e.g. '°C', 'bar', 'pcs', 'kg'
  criticalControlPoint: boolean; // CCP Flag
  sopReferenceId?: string; // Ref to SopDocument.id
  sopReferenceCode?: string; // e.g. 'SOP-KIT-001'
  ikaReferenceId?: string; // Ref to IkaDocument.id
  ikaReferenceCode?: string; // e.g. 'IKA-KIT-001'
  expectedMinutes?: number;
}

export interface ChecklistTemplate {
  id: string;
  templateId?: string; // alias
  templateCode: string; // e.g. 'TMPL-KIT-HOT-OPEN'
  templateName: string;
  areaId: string; // Ref to OperationalArea.id
  stationId: string; // Ref to OperationalStation.id
  checklistType: ChecklistType;
  shiftType: string; // 'shift-pagi' | 'shift-siang' | 'ALL'
  operationalRoleId?: string; // Ref to OperationalRole.id
  sopId?: string;
  ikaId?: string;
  version: string;
  status: TemplateStatus;
  effectiveDate: string;
  expectedCompletionTime?: string; // e.g. '10:00' for opening, '23:30' for closing
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// 3. EVIDENCE & AUDIT RECORD
// ============================================================================

export interface ChecklistEvidence {
  evidenceId: string;
  executionId: string;
  type: EvidenceType;
  previewUrl?: string;
  noteText?: string;
  numericValue?: number;
  unit?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditTrailEntry {
  id: string;
  checklistId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  role: string;
  details: string;
  timestamp: string;
}

// ============================================================================
// 4. DAILY CHECKLIST ITEM EXECUTION
// ============================================================================

export interface ChecklistExecution {
  id: string;
  executionId?: string; // alias
  checklistId: string;
  itemId: string;
  sequence: number;
  title: string;
  description: string;
  category: ItemCategory;
  isRequired: boolean;
  requiresPhoto: boolean;
  requiresNote: boolean;
  requiresNumericValue: boolean;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  criticalControlPoint: boolean;
  sopReferenceId?: string;
  sopReferenceCode?: string;
  sopReferenceTitle?: string;
  ikaReferenceId?: string;
  ikaReferenceCode?: string;
  ikaReferenceTitle?: string;
  status: ChecklistItemStatus;
  completedBy?: string;
  completedByName?: string;
  completedAt?: string;
  value?: number;
  note?: string;
  evidence?: ChecklistEvidence[];
  issueId?: string;
  issueNumber?: string;
  failureReason?: string;
  correctiveAction?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
}

// ============================================================================
// 5. DAILY CHECKLIST INSTANCE
// ============================================================================

export interface DailyChecklist {
  id: string;
  checklistId?: string; // alias
  templateId: string;
  templateCode: string;
  templateTitle: string;
  checklistType: ChecklistType;
  date: string; // YYYY-MM-DD
  shiftId: string; // 'shift-pagi' | 'shift-siang'
  shiftName: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  areaId: string;
  areaName: string;
  assignedEmployeeId: string;
  assignedEmployeeCode: string;
  assignedEmployeeName: string;
  assignedRoleId: string;
  assignedRoleName: string;
  status: DailyChecklistStatus;
  startedAt?: string;
  completedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNote?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isManagerOverride?: boolean;
  overrideReason?: string;
  isOverdue: boolean;
  overdueMinutes: number;
  expectedCompletionTime?: string; // e.g. '10:00'
  completionPercentage: number;
  totalItemsCount: number;
  completedItemsCount: number;
  failedItemsCount: number;
  skippedItemsCount: number;
  criticalIssueCount: number;
  issueCount: number;
  items: ChecklistExecution[];
  auditTrail: AuditTrailEntry[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// 6. CORRECTIVE ACTION
// ============================================================================

export interface CorrectiveAction {
  actionId: string;
  issueId?: string;
  executionId: string;
  checklistId: string;
  actionDescription: string;
  assignedTo: string;
  assignedToName?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
}

// ============================================================================
// 7. METRICS & COMPLIANCE
// ============================================================================

export interface ChecklistDashboardMetrics {
  totalChecklists: number;
  completedChecklists: number;
  inProgressChecklists: number;
  pendingVerificationCount: number;
  verifiedCount: number;
  rejectedCount: number;
  overdueCount: number;
  criticalFailedCount: number;
  completionRate: number; // percentage (Completed / Total) * 100
  verificationRate: number; // percentage (Verified / Completed) * 100
  averageExecutionMinutes: number;
  overallReadiness: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL';
}

export interface StationChecklistMetrics {
  stationId: string;
  stationName: string;
  stationCode: string;
  areaId: string;
  areaName: string;
  assignedCount: number;
  completedCount: number;
  verifiedCount: number;
  failedItemsCount: number;
  criticalFailedCount: number;
  compliancePercentage: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'ATTENTION' | 'CRITICAL';
}

export interface EmployeeChecklistMetrics {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  stationName: string;
  assignedCount: number;
  completedCount: number;
  verifiedCount: number;
  failedCount: number;
  overdueCount: number;
  compliancePercentage: number;
}

export interface ChecklistFilterParams {
  date?: string;
  shiftId?: string;
  areaId?: string;
  stationId?: string;
  employeeId?: string;
  checklistType?: ChecklistType | 'ALL';
  status?: DailyChecklistStatus | 'ALL';
  criticalOnly?: boolean;
  overdueOnly?: boolean;
  searchQuery?: string;
}

// Aliases for compatibility
export type ChecklistItemTemplate = ChecklistItem;
export type ChecklistComplianceMetrics = ChecklistDashboardMetrics;
export type StationReadinessMatrix = StationChecklistMetrics;

