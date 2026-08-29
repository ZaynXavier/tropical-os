import { Employee } from './employee';
import { EmployeeSchedule } from './schedule';
import { AttendanceRecord } from './attendance';

export type OvertimeType = 'PRE_SHIFT' | 'POST_SHIFT' | 'OFF_DAY' | 'SPECIAL_EVENT';

export type OvertimeStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type OvertimeCompensationType = 'PAYROLL' | 'COMPENSATORY_OFF';

export type OvertimeApprovalLevel = 'SUPERVISOR' | 'MANAGER' | 'OWNER_OVERRIDE';

export interface OvertimeRecord {
  id: string;
  employeeId: string; // relational reference to Employee.id
  scheduleId?: string; // relational reference to EmployeeSchedule.id if applicable
  attendanceId?: string; // relational reference to Attendance.id

  date: string; // 'YYYY-MM-DD'
  type: OvertimeType;
  status: OvertimeStatus;
  compensationType: OvertimeCompensationType;

  // Planned / Requested Hours
  plannedStart: string; // 'HH:mm'
  plannedEnd: string; // 'HH:mm'
  plannedHours: number; // e.g. 2.5

  // Actual Hours Clocked
  actualStart?: string; // 'HH:mm'
  actualEnd?: string; // 'HH:mm'
  actualHours?: number; // e.g. 3.0

  // Approved Hours (by supervisor/manager)
  approvedHours?: number; // e.g. 2.5
  excessHours?: number; // e.g. 0.5 (actual - approved if > 0)

  // Reason & Task Specification
  reason: string;
  taskDescription?: string;

  // Multiplier & Financials
  hourlyBaseRate: number; // e.g. Rp 25,000 - Rp 35,000/hr based on position
  rateMultiplier: number; // 1.5 or 2.0
  estimatedCost: number; // plannedHours * hourlyBaseRate * rateMultiplier
  finalCost?: number; // approvedHours * hourlyBaseRate * rateMultiplier

  // Request & Audit Trail
  requestedBy: string; // employeeId or userName
  requestedAt: string; // ISO string

  reviewedBy?: string;
  reviewedAt?: string;
  
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;

  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedOvertimeRecord extends OvertimeRecord {
  employee?: Employee;
  schedule?: EmployeeSchedule;
  attendance?: AttendanceRecord;
  shiftName?: string;
  shiftHours?: string;
  isExcessive?: boolean;
  warningFlags?: string[];
}

export interface OvertimeRequestInput {
  employeeId: string;
  scheduleId?: string;
  date: string;
  type: OvertimeType;
  compensationType: OvertimeCompensationType;
  plannedStart: string;
  plannedEnd: string;
  reason: string;
  taskDescription?: string;
  requestedBy?: string;
  hourlyBaseRate?: number;
}

export interface OvertimeApprovalInput {
  overtimeId: string;
  approvedHours: number;
  approverName: string;
  approverRole: string;
  approvalNotes?: string;
}

export interface OvertimeRejectionInput {
  overtimeId: string;
  rejectionReason: string;
  rejecterName: string;
  rejecterRole: string;
}

export interface OvertimeFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  department?: string;
  status?: OvertimeStatus | 'ALL';
  type?: OvertimeType | 'ALL';
  compensationType?: OvertimeCompensationType | 'ALL';
  searchQuery?: string;
}

export interface DepartmentOvertimeMetric {
  department: string;
  totalRequests: number;
  approvedHours: number;
  actualHours: number;
  excessHours: number;
  estimatedCost: number;
  finalCost: number;
  activeNow: number;
  pendingCount: number;
}

export interface OvertimeSummary {
  date?: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeNow: number;
  completedCount: number;
  cancelledCount: number;
  
  totalPlannedHours: number;
  totalApprovedHours: number;
  totalActualHours: number;
  totalExcessHours: number;
  
  totalEstimatedCost: number;
  totalFinalCost: number;
  
  departmentBreakdown: DepartmentOvertimeMetric[];
  reasonBreakdown: { reason: string; count: number; hours: number }[];
  monthlyTrend: { month: string; hours: number; cost: number }[];
}

export interface OvertimeCostSimulationParams {
  department: string;
  headcount: number;
  hoursPerPerson: number;
  overtimeType: OvertimeType;
  averageHourlyRate: number;
  rateMultiplier: number;
}

export interface OvertimeCostSimulationResult {
  totalHours: number;
  totalEstimatedCost: number;
  perEmployeeCost: number;
  dailyBudgetImpactPercentage: number;
  recommendation: string;
}
