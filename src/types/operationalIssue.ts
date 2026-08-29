/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE, INCIDENT & ESCALATION MANAGEMENT
 * TypeScript Data Models & Interfaces for TropicalOS
 */

export type OperationalIssueCategory =
  | 'EQUIPMENT'
  | 'INVENTORY'
  | 'FOOD_SAFETY'
  | 'HYGIENE'
  | 'GUEST_COMPLAINT'
  | 'STAFF'
  | 'FACILITY'
  | 'CASHIER_POS'
  | 'SAFETY_K3'
  | 'OPERATIONAL'
  | 'OTHER';

export type OperationalIssueSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type OperationalIssueStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'ESCALATED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REVISION_REQUIRED';

export type RootCauseCategory =
  | 'PEOPLE'
  | 'PROCESS'
  | 'EQUIPMENT'
  | 'INVENTORY'
  | 'ENVIRONMENT'
  | 'TRAINING'
  | 'SUPPLIER'
  | 'OTHER';

export type EscalationLevel = 'LEVEL_1_SUPERVISOR' | 'LEVEL_2_MANAGER' | 'LEVEL_3_EXECUTIVE';

export interface IssueEvidence {
  id: string;
  fileName: string;
  photoUrl?: string;
  type: string; // 'IMAGE' | 'DOCUMENT'
  uploadedBy: string; // Employee ID
  uploadedByName: string;
  uploadedAt: string; // ISO string
  description?: string;
}

export interface IssueAuditEvent {
  id: string;
  issueId: string;
  action:
    | 'CREATED'
    | 'ACKNOWLEDGED'
    | 'ASSIGNED'
    | 'UPDATED'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'VERIFICATION_REQUESTED'
    | 'VERIFIED'
    | 'REVISION_REQUESTED'
    | 'CLOSED'
    | 'CANCELLED';
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string; // ISO string
  reason?: string;
  metadata?: Record<string, any>;
}

export interface OperationalIssue {
  id: string; // e.g. 'issue-20260818-01'
  issueNumber: string; // e.g. 'ISS-20260818-001'
  title: string;
  description: string;

  // Location & Hierarchy
  areaId: string;
  areaName?: string;
  stationId: string;
  stationName?: string;
  department?: string;

  // Shift & Schedule Context
  shiftId?: string;
  shiftName?: string;
  scheduleId?: string;
  date: string; // YYYY-MM-DD

  // Reporter Info
  reportedBy: string; // Employee ID
  reportedByName?: string;
  reportedAt?: string; // ISO string

  // Assignment Info
  assignedTo?: string; // Employee ID
  assignedToName?: string;
  assignedAt?: string;
  assignedBy?: string;
  assignedByName?: string;

  // Classification
  category: OperationalIssueCategory; // Also aliased as issueType
  issueType?: OperationalIssueCategory;
  severity: OperationalIssueSeverity;
  status: OperationalIssueStatus;

  // SLA Management
  slaMinutes?: number; // e.g., 15 for CRITICAL, 30 for HIGH, 120 for MEDIUM, 1440 for LOW
  slaDeadline?: string; // ISO string
  acknowledgedAt?: string;
  responseMinutes?: number; // Minutes from creation to acknowledgment
  isSlaBreached?: boolean;

  // Resolution Flow
  resolution?: string;
  resolutionNotes?: string; // Backward compatibility
  rootCauseCategory?: RootCauseCategory;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionMinutes?: number; // Minutes from creation to resolution

  // Verification
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNote?: string;

  // Escalation Engine
  escalationLevel?: EscalationLevel;
  escalated?: boolean;
  escalatedAt?: string;
  escalatedBy?: string;
  escalatedByName?: string;
  escalationReason?: string;

  // Related Records
  checklistId?: string;
  checklistItemId?: string;
  handoverId?: string;
  sopId?: string;
  ikaId?: string;

  // Handover Context
  handoverReceivedBy?: string;
  handoverReceivedAt?: string;

  // Evidence & Attachments
  evidenceCount?: number;
  evidence?: IssueEvidence[];

  // Audit & System Metadata
  createdBy?: string;
  createdAt: string; // ISO string
  updatedBy?: string;
  updatedAt: string; // ISO string
  closedBy?: string;
  closedByName?: string;
  closedAt?: string; // ISO string
  cancellationReason?: string;

  // Activity Log
  auditTrail?: IssueAuditEvent[];

  // Recurring Issue Indicator
  isRecurring?: boolean;
  recurringCount?: number;
}

export interface IssueFilterParams {
  date?: string; // YYYY-MM-DD or 'ALL'
  dateRange?: { startDate: string; endDate: string };
  department?: string;
  areaId?: string;
  stationId?: string;
  category?: OperationalIssueCategory | 'ALL';
  severity?: OperationalIssueSeverity | 'ALL';
  status?: OperationalIssueStatus | 'ALL';
  assignedTo?: string;
  reportedBy?: string;
  isSlaBreached?: boolean | 'ALL';
  isRecurring?: boolean;
  searchQuery?: string;
}

export interface IssueDashboardMetrics {
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  slaBreachedCount: number;
  inProgressCount: number;
  pendingVerificationCount: number;
  resolvedCount: number;
  closedCount: number;
  avgResolutionMinutes: number;
  slaCompliancePercentage: number;
}

export interface RecurringIssueGroup {
  stationId: string;
  stationName: string;
  category: OperationalIssueCategory;
  categoryLabel: string;
  count: number;
  frequencyRisk: 'LOW' | 'MEDIUM' | 'HIGH'; // Based on internal counts (e.g. 1-2 = LOW, 3-5 = MEDIUM, 6+ = HIGH)
  lastOccurredAt: string;
  sampleIssueTitles: string[];
}

export interface IssueAnalyticsData {
  byDepartment: Array<{
    department: string;
    total: number;
    open: number;
    resolved: number;
    critical: number;
    slaBreached: number;
  }>;
  bySeverity: Record<OperationalIssueSeverity, number>;
  byCategory: Record<OperationalIssueCategory, number>;
  slaCompliance: {
    withinSla: number;
    slaBreached: number;
    percentage: number;
  };
  avgResolutionTimeBySeverity: Record<OperationalIssueSeverity, number>; // in minutes
  recurringIssues: RecurringIssueGroup[];
  topProblemStations: Array<{
    stationId: string;
    stationName: string;
    areaName: string;
    issueCount: number;
    criticalCount: number;
  }>;
}
