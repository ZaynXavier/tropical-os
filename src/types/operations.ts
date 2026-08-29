/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS FOUNDATION & MASTER DATA
 * Core Data Models & TypeScript Interfaces for TropicalOS Operations
 */

export type OperationalAreaId =
  | 'area-kitchen'
  | 'area-bar'
  | 'area-service'
  | 'area-cleaning'
  | 'area-cashier'
  | 'area-purchasing'
  | 'area-inventory'
  | 'area-production'
  | 'area-management'
  | string;

export type OperationalStatus =
  | 'PLANNED'
  | 'READY'
  | 'OPEN'
  | 'RUNNING'
  | 'PAUSED'
  | 'CLOSING'
  | 'CLOSED'
  | 'ISSUE'
  | 'CANCELLED';

export type StationStatus = 'ACTIVE' | 'INACTIVE';
export type AreaStatus = 'ACTIVE' | 'INACTIVE';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type StationStaffingStatus =
  | 'OPTIMAL'
  | 'ADEQUATE'
  | 'MINIMUM'
  | 'UNDERSTAFFED'
  | 'OVERSTAFFED';

export type OperationalDayPhase =
  | 'BEFORE_OPENING'
  | 'OPENING'
  | 'RUNNING'
  | 'CLOSING'
  | 'CLOSED';

export type OperationalTaskCategory =
  | 'PREPARATION'
  | 'EXECUTION'
  | 'MONITORING'
  | 'QUALITY_CONTROL'
  | 'SANITATION'
  | 'HANDOVER'
  | 'ADMINISTRATION';

// ============================================================================
// 1. MASTER OPERATIONAL AREA
// ============================================================================
export interface OperationalArea {
  id: string; // e.g. 'area-kitchen'
  code: string; // e.g. 'KIT'
  name: string; // e.g. 'Kitchen'
  description: string;
  iconName: string; // Lucide icon identifier
  isSystem: boolean; // Cannot be deleted if system
  isControlLayer?: boolean; // e.g. Management / Operations Control
  status: AreaStatus;
  displayOrder: number;
  colorTheme?: string; // Tailwind color token (e.g. 'amber', 'emerald', 'blue')
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

// ============================================================================
// 2. MASTER OPERATIONAL STATION
// ============================================================================
export interface OperationalStation {
  id: string; // e.g. 'stn-hot-kitchen'
  code: string; // e.g. 'STN-KIT-01'
  name: string; // e.g. 'Hot Kitchen'
  areaId: string; // Ref to OperationalArea.id
  description: string;
  minimumStaff: number;
  recommendedStaff: number;
  maximumStaff: number;
  status: StationStatus;
  defaultRoleId?: string; // Ref to OperationalRole.id
  defaultShiftTypes?: string[]; // e.g. ['SHIFT_PAGI', 'SHIFT_SIANG']
  checklistTemplateIds?: string[]; // References to Phase 2C.9 ChecklistTemplate.id
  sopIds?: string[]; // References to Phase 2C.9 SopDocument.id
  ikaIds?: string[]; // References to Phase 2C.9 IkaDocument.id
  kpiIds?: string[]; // References to KPI Metric references
  displayOrder: number;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

// ============================================================================
// 3. MASTER OPERATIONAL ROLE
// ============================================================================
export interface OperationalRole {
  id: string; // e.g. 'role-kitchen-staff'
  code: string; // e.g. 'OP-ROLE-KIT-01'
  name: string; // e.g. 'Kitchen Staff'
  areaId?: string; // Primary area association
  description: string;
  status: RoleStatus;
  jobDescriptionId?: string; // Reference to Phase 2C.9 JobDescriptionDocument.id
  requiredSkills?: string[];
  displayOrder: number;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

// ============================================================================
// 4. STATION ASSIGNMENT (Employee -> Station)
// ============================================================================
export interface StationAssignment {
  id: string; // e.g. 'asgn-20260818-01'
  assignmentId?: string; // alias
  employeeId: string; // Ref to Employee.id (24 Personnel)
  areaId: string; // Ref to OperationalArea.id
  stationId: string; // Ref to OperationalStation.id
  operationalRoleId: string; // Ref to OperationalRole.id
  date: string; // YYYY-MM-DD
  shiftId: string; // 'shift-pagi' | 'shift-siang' (from scheduleService)
  status: AssignmentStatus;
  assignedBy: string; // Employee ID of manager/supervisor who assigned
  assignedAt: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  updatedBy?: string;
  updatedAt: string;
}

// Enriched assignment for UI presentation
export interface EnrichedStationAssignment extends StationAssignment {
  employeeName: string;
  employeeCode: string;
  employeePosition: string;
  employeeDepartment: string;
  additionalResponsibilities: string[];
  areaName: string;
  stationName: string;
  stationCode: string;
  roleName: string;
  shiftName: string;
  shiftHours: string;
}

// ============================================================================
// 5. STATION CAPACITY & COVERAGE
// ============================================================================
export interface StationCapacity {
  minimumStaff: number;
  recommendedStaff: number;
  maximumStaff: number;
  currentAssigned: number;
  status: StationStaffingStatus;
  percentage: number; // e.g. (current / recommended) * 100
}

export interface StationCoverage {
  station: OperationalStation;
  area: OperationalArea;
  capacity: StationCapacity;
  assignments: EnrichedStationAssignment[];
  date: string;
  shiftId: string;
  shiftName: string;
  status: OperationalStatus;
  checklistStatus?: {
    total: number;
    completed: number;
    pending: number;
  };
  openIssuesCount: number;
}

export interface DepartmentCoverageSummary {
  areaId: string;
  areaName: string;
  areaCode: string;
  totalStations: number;
  activeStations: number;
  totalRequiredMin: number;
  totalRequiredRec: number;
  currentAssigned: number;
  coveragePercentage: number;
  status: StationStaffingStatus;
}

// ============================================================================
// 6. OPERATIONAL ACTIVITIES & TASKS
// ============================================================================
export interface OperationalActivity {
  id: string;
  code: string;
  name: string;
  areaId: string;
  stationId?: string;
  category: OperationalTaskCategory;
  phase: OperationalDayPhase;
  description: string;
  estimatedDurationMinutes: number;
  checklistReferenceId?: string;
  sopReferenceId?: string;
  isMandatory: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
}

// ============================================================================
// 7. OPERATIONAL ISSUE (RE-EXPORTED FROM OPERATIONALISSUE.TS)
export type {
  OperationalIssue,
  OperationalIssueCategory,
  OperationalIssueSeverity,
  OperationalIssueStatus,
} from './operationalIssue';

// ============================================================================
// 8. OPERATIONS CONFIGURATION
// ============================================================================
export interface OperationsConfiguration {
  id: string;
  openingTime: string; // e.g. '09:00'
  runningCheckTimes: string[]; // e.g. ['11:30', '18:00']
  closingTime: string; // e.g. '22:00'
  defaultGraceMinutes: number; // e.g. 15
  autoAssignmentEnabled: boolean;
  requireSopAcknowledgmentForStation: boolean;
  strictStaffingAlerts: boolean;
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// 9. DAILY OPERATIONS CONTEXT
// ============================================================================
export interface DailyOperationsContext {
  date: string; // YYYY-MM-DD
  businessDay: string; // e.g. 'Selasa, 18 Agustus 2026'
  currentShift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  operationalDayPhase: OperationalDayPhase;
  operationalStatus: OperationalStatus;
  totalEmployeesCount: number;
  assignedEmployeesCount: number;
  unassignedEmployeesCount: number;
  totalStationsCount: number;
  activeStationsCount: number;
  understaffedStationsCount: number;
  optimalStationsCount: number;
  openIssuesCount: number;
  pendingChecklistsCount: number;
  completedChecklistsCount: number;
  verifiedChecklistsCount: number;
  overallReadinessScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

// Filter query parameters
export interface StationAssignmentFilter {
  date?: string;
  shiftId?: string;
  areaId?: string;
  stationId?: string;
  employeeId?: string;
  status?: AssignmentStatus | 'ALL';
  search?: string;
}
