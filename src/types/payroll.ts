/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll, Salary Management & Payslip Types
 * Source of Truth: PRD.md & RBAC.md
 */

import { Employee } from './employee';

export type SalaryStatus = 'ACTIVE' | 'INACTIVE' | 'HISTORICAL';

export interface SalaryMaster {
  salaryId: string;
  employeeId: string; // relational reference to Employee.id
  effectiveDate: string; // 'YYYY-MM-DD'
  basicSalary: number;
  fixedAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  otherAllowance: number;
  salaryStatus: SalaryStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface EnrichedSalaryMaster extends SalaryMaster {
  employee?: Employee;
  grossFixedSalary: number;
}

export interface SalaryHistoryItem {
  historyId: string;
  salaryId: string;
  employeeId: string;
  effectiveDate: string;
  basicSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  otherAllowance: number;
  totalAllowance: number;
  grossFixedSalary: number;
  salaryStatus: SalaryStatus;
  changeReason?: string;
  createdBy: string;
  createdAt: string;
}

export type PayrollPeriodStatus =
  | 'DRAFT'
  | 'CALCULATING'
  | 'REVIEW'
  | 'APPROVED'
  | 'LOCKED'
  | 'PAID';

export interface PayrollPeriod {
  periodId: string;
  periodCode: string; // e.g. '2026-08'
  periodName: string; // e.g. 'Agustus 2026'
  startDate: string; // '2026-08-01'
  endDate: string; // '2026-08-31'
  status: PayrollPeriodStatus;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalOvertimeAmount: number;
  notes?: string;
  calculatedAt?: string;
  calculatedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  lockedAt?: string;
  lockedBy?: string;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollEarning {
  basicSalary: number;
  fixedAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  otherAllowance: number;
  overtimeAmount: number;
  otherEarnings: number;
  grossSalary: number;
}

export interface PayrollDeduction {
  lateDeduction: number;
  absenceDeduction: number;
  advanceDeduction: number;
  otherDeduction: number;
  totalDeduction: number;
}

export type PayrollAdjustmentType = 'BONUS' | 'DEDUCTION' | 'CORRECTION' | 'OTHER';

export interface PayrollAdjustment {
  adjustmentId: string;
  payrollId: string;
  employeeId: string;
  type: PayrollAdjustmentType;
  amount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export type SalaryAdvanceStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DEDUCTED'
  | 'CANCELLED';

export interface SalaryAdvance {
  advanceId: string;
  employeeId: string;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  description: string;
  status: SalaryAdvanceStatus;
  payrollId?: string; // set when deducted
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  deductedAt?: string;
}

export interface PayrollRecord {
  payrollId: string;
  periodId: string;
  employeeId: string;

  // Snapshot of employee info
  employeeCode?: string;
  employeeName?: string;
  department?: string;
  position?: string;

  // Relational snapshot of salary
  salarySnapshot?: SalaryMaster;

  // Earnings
  basicSalary: number;
  fixedAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  otherAllowance: number;
  overtimeAmount: number;
  otherEarnings: number;
  grossSalary: number;

  // Deductions
  lateDeduction: number;
  absenceDeduction: number;
  advanceDeduction: number;
  otherDeduction: number;
  totalDeduction: number;

  // Net
  netSalary: number;

  // Operational aggregates snapshot
  attendanceSummary?: {
    presentDays: number;
    lateDays: number;
    totalLateMinutes: number;
    absentDays: number;
    leaveDays: number;
    offDays: number;
    incompleteDays: number;
    totalWorkHours: number;
  };

  overtimeSummary?: {
    totalApprovedMinutes: number;
    totalApprovedHours: number;
    totalEstimatedCost: number;
    excessMinutes: number;
    splCount: number;
  };

  breakSummary?: {
    totalStandardBreakMinutes: number;
    totalAdditionalBreakMinutes: number;
    excessBreakMinutes: number;
  };

  kpiSummary?: {
    kpiScore?: number;
    performanceRating?: string;
    bonusEligibility?: boolean;
    bonusAmount?: number;
  };

  adjustments?: PayrollAdjustment[];

  status: PayrollPeriodStatus;

  calculatedAt?: string;
  calculatedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  lockedAt?: string;
  lockedBy?: string;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedPayrollRecord extends PayrollRecord {
  employee?: Employee;
}

export interface Payslip {
  payslipId: string;
  payrollId: string;
  periodId: string;
  periodCode: string;
  periodName: string;
  periodStartDate: string;
  periodEndDate: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  joinDate?: string;
  bankAccount?: string;

  // Earnings
  basicSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  otherAllowance: number;
  totalAllowance: number;
  overtimePay: number;
  otherEarnings: number;
  grossSalary: number;

  // Deductions
  lateDeduction: number;
  absenceDeduction: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net
  netSalary: number;

  // Operational Context
  presentDays: number;
  lateMinutes: number;
  approvedOvertimeHours: number;
  kpiScore?: number;
  performanceRating?: string;

  isLocked: boolean;
  status: 'Preview' | 'Final';
  generatedAt: string;
  generatedBy: string;
}

export interface DepartmentPayrollMetric {
  department: string;
  employeeCount: number;
  grossSalary: number;
  overtime: number;
  deductions: number;
  netSalary: number;
}

export interface PayrollSummary {
  periodId: string;
  periodCode: string;
  periodName: string;
  status: PayrollPeriodStatus;
  totalHeadcount: number;
  totalBasicSalary: number;
  totalAllowance: number;
  totalOvertime: number;
  totalOtherEarnings: number;
  totalGrossSalary: number;
  totalLateDeductions: number;
  totalAbsenceDeductions: number;
  totalAdvanceDeductions: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  totalNetSalary: number;
  departmentBreakdown: DepartmentPayrollMetric[];
  laborCostPercentage?: number; // % of revenue
  estimatedRevenue?: number;
}

export interface PayrollFilterParams {
  periodId?: string;
  department?: string | 'ALL';
  status?: PayrollPeriodStatus | 'ALL';
  searchQuery?: string;
}

export interface SalaryFilterParams {
  department?: string | 'ALL';
  position?: string | 'ALL';
  status?: SalaryStatus | 'ALL';
  searchQuery?: string;
}

/**
 * Backend Integration Contract for Future Cloud Sync
 */
export interface PayrollInputContract {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  salarySnapshot: SalaryMaster;
  attendanceSummary: {
    presentDays: number;
    lateMinutes: number;
    lateDeduction: number;
    absentDays: number;
  };
  overtimeSummary: {
    approvedMinutes: number;
    rate: number;
    calculatedPay: number;
  };
  deductions: {
    advances: number;
    other: number;
  };
  adjustments: PayrollAdjustment[];
}

export interface PayrollOutputContract {
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  payrollStatus: PayrollPeriodStatus;
  calculatedAt: string;
}
