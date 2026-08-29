import { EmployeePersonnel } from './employee';
import { EmployeeSchedule } from './schedule';

export type BreakType = 'STANDARD' | 'ADDITIONAL';

export type BreakStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'COMPLETED';

export type BreakMonitoringAlert = 'NORMAL' | 'ATTENTION' | 'WARNING' | 'CRITICAL';

export interface BreakRecord {
  id: string;
  employeeId: string; // relational reference to Employee.id
  scheduleId: string; // relational reference to EmployeeSchedule.id
  date: string; // 'YYYY-MM-DD'
  type: BreakType;
  status: BreakStatus;

  plannedStart?: string; // 'HH:mm'
  plannedEnd?: string; // 'HH:mm'

  actualStart?: string; // 'HH:mm'
  actualEnd?: string; // 'HH:mm'

  durationMinutes?: number; // total actual duration in minutes
  requestedDurationMinutes?: number; // requested duration for additional break
  approvedDurationMinutes?: number; // approved duration by supervisor/manager

  reason?: string; // required for ADDITIONAL break

  requestedBy?: string; // name or role who requested

  approvedBy?: string;
  approvedAt?: string;

  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  createdAt: string;
  createdBy: string;

  updatedAt?: string;
  updatedBy?: string;

  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface EnrichedBreakRecord extends BreakRecord {
  employee?: EmployeePersonnel;
  schedule?: EmployeeSchedule;
  shiftName?: string;
  shiftHours?: string;
  isExcessive?: boolean;
  alertLevel?: BreakMonitoringAlert;
}

export interface BreakRequestInput {
  employeeId: string;
  scheduleId: string;
  date: string;
  type: BreakType;
  requestedDurationMinutes: number;
  reason: string;
  requestedBy?: string;
  plannedStart?: string;
  plannedEnd?: string;
}

export interface BreakApprovalInput {
  breakId: string;
  approvedDurationMinutes: number;
  approverName: string;
  notes?: string;
}

export interface BreakFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  department?: string;
  shiftId?: string;
  type?: BreakType | 'ALL';
  status?: BreakStatus | 'ALL';
  alertLevel?: BreakMonitoringAlert | 'ALL';
  searchQuery?: string;
}

export interface DepartmentBreakMetric {
  department: string;
  totalBreaks: number;
  standardBreaks: number;
  additionalBreaks: number;
  totalMinutes: number;
  averageDurationMinutes: number;
  excessiveCount: number;
  activeNow: number;
}

export interface BreakSummary {
  date?: string;
  totalBreaks: number;
  standardBreaks: number;
  additionalBreaks: number;
  activeBreaks: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedBreaks: number;
  cancelledRequests: number;
  averageDurationMinutes: number;
  longestBreakMinutes: number;
  excessiveBreaksCount: number;
  overallAlertLevel: BreakMonitoringAlert;
  departmentBreakdown: DepartmentBreakMetric[];
}

export interface EmployeeBreakSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftName: string;
  hasSchedule: boolean;
  totalBreaks: number;
  standardBreaksCount: number;
  additionalBreaksCount: number;
  totalDurationMinutes: number;
  remainingStandardMinutes: number;
  excessiveCount: number;
  hasActiveBreak: boolean;
  activeBreakRecord?: BreakRecord;
  records: BreakRecord[];
}
