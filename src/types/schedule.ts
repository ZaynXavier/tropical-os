import { EmployeePersonnel } from './employee';

export type ShiftStatus = 'ACTIVE' | 'INACTIVE';
export type ScheduleStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface Shift {
  id: string; // 'shift-pagi' | 'shift-siang'
  name: string; // 'Shift Pagi' | 'Shift Siang'
  startTime: string; // '09:00'
  endTime: string; // '19:00'
  scheduledDurationMinutes: number; // 600 (10 jam)
  gracePeriodMinutes: number; // 10 menit
  status: ShiftStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string; // Relational reference to EmployeePersonnel.id
  shiftId: string; // Relational reference to Shift.id ('shift-pagi' | 'shift-siang')
  date: string; // 'YYYY-MM-DD'
  status: ScheduleStatus;
  supervisorNote?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface EnrichedEmployeeSchedule extends EmployeeSchedule {
  employee?: EmployeePersonnel;
  shift?: Shift;
}

export interface ScheduleFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  shiftId?: string;
  department?: string;
  status?: ScheduleStatus | 'ALL';
  searchQuery?: string;
}

export interface CreateScheduleInput {
  employeeId: string;
  shiftId: string;
  date: string;
  supervisorNote?: string;
  notes?: string;
  createdBy?: string;
}

export interface BulkScheduleInput {
  employeeIds: string[];
  shiftId: string;
  date: string;
  supervisorNote?: string;
  notes?: string;
  createdBy?: string;
}

export interface ScheduleConflict {
  employeeId: string;
  employeeName: string;
  date: string;
  existingScheduleId: string;
  existingShiftName: string;
  reason: string;
}

export interface DepartmentCoverage {
  department: string;
  requiredStaff: number;
  scheduledStaff: number;
  coveragePercentage: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'MINIMUM' | 'UNDERSTAFFED';
}

export interface DailyRosterSummary {
  date: string;
  totalEmployees: number;
  totalScheduled: number;
  shiftPagiCount: number;
  shiftSiangCount: number;
  offCount: number;
  unassignedCount: number;
  coverages: DepartmentCoverage[];
}

export interface WeeklyRosterSummary {
  startDate: string;
  endDate: string;
  totalSchedules: number;
  shiftPagiCount: number;
  shiftSiangCount: number;
  offCount: number;
  cancelledCount: number;
  departmentBreakdown: { department: string; count: number; requiredWeekly: number }[];
}
