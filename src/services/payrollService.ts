/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll & Salary Calculation Engine
 * Aggregates Employee, Salary Master, Attendance, Overtime, Break, Kasbon, and KPI data.
 */

import {
  SalaryMaster,
  SalaryHistoryItem,
  SalaryStatus,
  PayrollPeriod,
  PayrollPeriodStatus,
  PayrollRecord,
  Payslip,
  PayrollSummary,
  PayrollAdjustment,
  SalaryAdvance,
  PayrollFilterParams,
  SalaryFilterParams,
  DepartmentPayrollMetric,
} from '../types/payroll';
import { PayrollCostContract } from '../types/contracts';
import { MASTER_EMPLOYEES } from '../config/employees';
import { Employee } from '../types/employee';
import {
  INITIAL_SALARIES,
  INITIAL_SALARY_HISTORIES,
  INITIAL_PAYROLL_PERIODS,
  INITIAL_SALARY_ADVANCES,
  INITIAL_PAYROLL_ADJUSTMENTS,
} from '../data/mockPayroll';
import { attendanceService } from './attendanceService';
import { attendanceRuleService } from './attendanceRuleService';
import { overtimeService } from './overtimeService';
import { hrConfigurationService } from './hrConfigurationService';

const STORAGE_KEYS = {
  SALARIES: 'tropicalos_master_salary',
  SALARY_HISTORIES: 'tropicalos_master_salary_history',
  PERIODS: 'tropicalos_master_payroll_periods',
  RECORDS: 'tropicalos_master_payroll_records',
  ADVANCES: 'tropicalos_master_salary_advances',
  ADJUSTMENTS: 'tropicalos_master_payroll_adjustments',
  PAYSLIPS: 'tropicalos_master_payslips',
};

const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

/** Safe numeric conversion helper */
export const safeNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === 'number' ? val : Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

/** Safe Rupiah Currency Formatter */
export const formatCurrency = (val: any): string => {
  const num = safeNumber(val);
  return `Rp ${(num ?? 0).toLocaleString('id-ID')}`;
};

/** Safe Number Formatter */
export const formatNumber = (val: any): string => {
  const num = safeNumber(val);
  return (num ?? 0).toLocaleString('id-ID');
};

/** Safe Date Formatter */
export const formatDate = (val: string | null | undefined): string => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
};

class PayrollServiceEngine {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[PayrollService] Failed to save storage for ${key}:`, e);
    }
  }

  // ==========================================
  // SALARY MASTER MANAGEMENT
  // ==========================================

  public async getAllSalaries(params?: SalaryFilterParams): Promise<SalaryMaster[]> {
    await delay();
    let list = this.getStorage<SalaryMaster[]>(STORAGE_KEYS.SALARIES, INITIAL_SALARIES);

    if (params) {
      if (params.status && params.status !== 'ALL') {
        list = list.filter((s) => s.salaryStatus === params.status);
      }
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        list = list.filter((s) => {
          const emp = MASTER_EMPLOYEES.find((e) => e.id === s.employeeId);
          const name = emp?.fullName.toLowerCase() || '';
          const code = emp?.employeeCode.toLowerCase() || '';
          return name.includes(q) || code.includes(q);
        });
      }
      if (params.department && params.department !== 'ALL') {
        list = list.filter((s) => {
          const emp = MASTER_EMPLOYEES.find((e) => e.id === s.employeeId);
          return emp?.department === params.department;
        });
      }
    }

    return list;
  }

  public async getSalaryByEmployee(employeeId: string): Promise<SalaryMaster | null> {
    await delay();
    const list = this.getStorage<SalaryMaster[]>(STORAGE_KEYS.SALARIES, INITIAL_SALARIES);
    const found = list.find((s) => s.employeeId === employeeId && s.salaryStatus === 'ACTIVE');
    return found || list.find((s) => s.employeeId === employeeId) || null;
  }

  public async getSalaryHistory(employeeId: string): Promise<SalaryHistoryItem[]> {
    await delay();
    const historyList = this.getStorage<SalaryHistoryItem[]>(
      STORAGE_KEYS.SALARY_HISTORIES,
      INITIAL_SALARY_HISTORIES
    );
    return historyList
      .filter((h) => h.employeeId === employeeId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  }

  public async createSalary(
    data: Omit<SalaryMaster, 'salaryId' | 'createdAt' | 'updatedAt'> & { changeReason?: string }
  ): Promise<SalaryMaster> {
    await delay();
    const salaries = this.getStorage<SalaryMaster[]>(STORAGE_KEYS.SALARIES, INITIAL_SALARIES);
    const histories = this.getStorage<SalaryHistoryItem[]>(
      STORAGE_KEYS.SALARY_HISTORIES,
      INITIAL_SALARY_HISTORIES
    );

    const now = new Date().toISOString();
    const existing = salaries.find(
      (s) => s.employeeId === data.employeeId && s.salaryStatus === 'ACTIVE'
    );

    // If an active salary exists, archive it into history and mark historical
    if (existing) {
      existing.salaryStatus = 'HISTORICAL';
      existing.updatedAt = now;
      existing.updatedBy = data.createdBy;

      const historyItem: SalaryHistoryItem = {
        historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        salaryId: existing.salaryId,
        employeeId: existing.employeeId,
        effectiveDate: existing.effectiveDate,
        basicSalary: existing.basicSalary,
        mealAllowance: existing.mealAllowance,
        transportAllowance: existing.transportAllowance,
        positionAllowance: existing.positionAllowance,
        otherAllowance: existing.otherAllowance,
        totalAllowance: existing.fixedAllowance,
        grossFixedSalary: existing.basicSalary + existing.fixedAllowance,
        salaryStatus: 'HISTORICAL',
        changeReason: data.changeReason || 'Penyesuaian struktur gaji baru',
        createdBy: data.createdBy,
        createdAt: now,
      };
      histories.unshift(historyItem);
    }

    const calculatedFixedAllowance =
      safeNumber(data.mealAllowance) +
      safeNumber(data.transportAllowance) +
      safeNumber(data.positionAllowance) +
      safeNumber(data.otherAllowance);

    const newSalary: SalaryMaster = {
      salaryId: `sal-${data.employeeId}-${Date.now().toString().slice(-4)}`,
      employeeId: data.employeeId,
      effectiveDate: data.effectiveDate,
      basicSalary: Math.max(0, safeNumber(data.basicSalary)),
      fixedAllowance: calculatedFixedAllowance,
      mealAllowance: Math.max(0, safeNumber(data.mealAllowance)),
      transportAllowance: Math.max(0, safeNumber(data.transportAllowance)),
      positionAllowance: Math.max(0, safeNumber(data.positionAllowance)),
      otherAllowance: Math.max(0, safeNumber(data.otherAllowance)),
      salaryStatus: 'ACTIVE',
      notes: data.notes || '',
      createdBy: data.createdBy,
      createdAt: now,
      updatedBy: data.createdBy,
      updatedAt: now,
    };

    salaries.unshift(newSalary);
    this.setStorage(STORAGE_KEYS.SALARIES, salaries);
    this.setStorage(STORAGE_KEYS.SALARY_HISTORIES, histories);

    return newSalary;
  }

  public async updateSalary(
    salaryId: string,
    data: Partial<SalaryMaster> & { changeReason?: string; updatedBy: string }
  ): Promise<SalaryMaster> {
    await delay();
    const salaries = this.getStorage<SalaryMaster[]>(STORAGE_KEYS.SALARIES, INITIAL_SALARIES);
    const index = salaries.findIndex((s) => s.salaryId === salaryId);
    if (index === -1) {
      throw new Error(`Data gaji dengan ID ${salaryId} tidak ditemukan.`);
    }

    const current = salaries[index];
    const histories = this.getStorage<SalaryHistoryItem[]>(
      STORAGE_KEYS.SALARY_HISTORIES,
      INITIAL_SALARY_HISTORIES
    );

    const now = new Date().toISOString();

    // Log old state to history
    const historyItem: SalaryHistoryItem = {
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      salaryId: current.salaryId,
      employeeId: current.employeeId,
      effectiveDate: current.effectiveDate,
      basicSalary: current.basicSalary,
      mealAllowance: current.mealAllowance,
      transportAllowance: current.transportAllowance,
      positionAllowance: current.positionAllowance,
      otherAllowance: current.otherAllowance,
      totalAllowance: current.fixedAllowance,
      grossFixedSalary: current.basicSalary + current.fixedAllowance,
      salaryStatus: 'HISTORICAL',
      changeReason: data.changeReason || 'Pembaruan data gaji',
      createdBy: data.updatedBy,
      createdAt: now,
    };
    histories.unshift(historyItem);

    const meal = data.mealAllowance !== undefined ? safeNumber(data.mealAllowance) : current.mealAllowance;
    const transport = data.transportAllowance !== undefined ? safeNumber(data.transportAllowance) : current.transportAllowance;
    const pos = data.positionAllowance !== undefined ? safeNumber(data.positionAllowance) : current.positionAllowance;
    const other = data.otherAllowance !== undefined ? safeNumber(data.otherAllowance) : current.otherAllowance;
    const fixed = meal + transport + pos + other;

    const updated: SalaryMaster = {
      ...current,
      ...data,
      basicSalary: data.basicSalary !== undefined ? Math.max(0, safeNumber(data.basicSalary)) : current.basicSalary,
      mealAllowance: meal,
      transportAllowance: transport,
      positionAllowance: pos,
      otherAllowance: other,
      fixedAllowance: fixed,
      updatedBy: data.updatedBy,
      updatedAt: now,
    };

    salaries[index] = updated;
    this.setStorage(STORAGE_KEYS.SALARIES, salaries);
    this.setStorage(STORAGE_KEYS.SALARY_HISTORIES, histories);

    return updated;
  }

  // ==========================================
  // SALARY ADVANCE (KASBON) MANAGEMENT
  // ==========================================

  public async getSalaryAdvances(employeeId?: string): Promise<SalaryAdvance[]> {
    await delay();
    const list = this.getStorage<SalaryAdvance[]>(STORAGE_KEYS.ADVANCES, INITIAL_SALARY_ADVANCES);
    if (employeeId) {
      return list.filter((a) => a.employeeId === employeeId);
    }
    return list;
  }

  public async createSalaryAdvance(
    data: Omit<SalaryAdvance, 'advanceId' | 'createdAt'>
  ): Promise<SalaryAdvance> {
    await delay();
    const list = this.getStorage<SalaryAdvance[]>(STORAGE_KEYS.ADVANCES, INITIAL_SALARY_ADVANCES);
    const newAdvance: SalaryAdvance = {
      ...data,
      advanceId: `adv-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAdvance);
    this.setStorage(STORAGE_KEYS.ADVANCES, list);
    return newAdvance;
  }

  public async updateSalaryAdvance(
    advanceId: string,
    data: Partial<SalaryAdvance>
  ): Promise<SalaryAdvance> {
    await delay();
    const list = this.getStorage<SalaryAdvance[]>(STORAGE_KEYS.ADVANCES, INITIAL_SALARY_ADVANCES);
    const idx = list.findIndex((a) => a.advanceId === advanceId);
    if (idx === -1) throw new Error('Kasbon tidak ditemukan');
    list[idx] = { ...list[idx], ...data };
    this.setStorage(STORAGE_KEYS.ADVANCES, list);
    return list[idx];
  }

  // ==========================================
  // PAYROLL ADJUSTMENTS
  // ==========================================

  public async getPayrollAdjustments(
    periodId: string,
    employeeId?: string
  ): Promise<PayrollAdjustment[]> {
    await delay();
    const list = this.getStorage<PayrollAdjustment[]>(
      STORAGE_KEYS.ADJUSTMENTS,
      INITIAL_PAYROLL_ADJUSTMENTS
    );
    return list.filter(
      (a) => a.payrollId === periodId && (!employeeId || a.employeeId === employeeId)
    );
  }

  public async createPayrollAdjustment(
    data: Omit<PayrollAdjustment, 'adjustmentId' | 'createdAt'>
  ): Promise<PayrollAdjustment> {
    await delay();
    const list = this.getStorage<PayrollAdjustment[]>(
      STORAGE_KEYS.ADJUSTMENTS,
      INITIAL_PAYROLL_ADJUSTMENTS
    );
    const newAdj: PayrollAdjustment = {
      ...data,
      adjustmentId: `adj-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAdj);
    this.setStorage(STORAGE_KEYS.ADJUSTMENTS, list);
    return newAdj;
  }

  // ==========================================
  // PAYROLL PERIOD MANAGEMENT
  // ==========================================

  public async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    await delay();
    return this.getStorage<PayrollPeriod[]>(STORAGE_KEYS.PERIODS, INITIAL_PAYROLL_PERIODS);
  }

  public async getPayrollPeriodById(periodId: string): Promise<PayrollPeriod | null> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );
    return periods.find((p) => p.periodId === periodId) || null;
  }

  public async createPayrollPeriod(data: {
    periodCode: string;
    periodName: string;
    startDate: string;
    endDate: string;
    notes?: string;
    createdBy: string;
  }): Promise<PayrollPeriod> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );

    const exists = periods.some((p) => p.periodCode === data.periodCode);
    if (exists) {
      throw new Error(`Periode payroll dengan kode ${data.periodCode} sudah terdaftar.`);
    }

    const now = new Date().toISOString();
    const newPeriod: PayrollPeriod = {
      periodId: `period-${data.periodCode}`,
      periodCode: data.periodCode,
      periodName: data.periodName,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'DRAFT',
      totalEmployees: 24,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      totalOvertimeAmount: 0,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    periods.unshift(newPeriod);
    this.setStorage(STORAGE_KEYS.PERIODS, periods);

    // Automatically trigger initial calculation draft
    await this.calculatePayroll(newPeriod.periodId, data.createdBy);

    return newPeriod;
  }

  public async updatePayrollPeriod(
    periodId: string,
    data: Partial<PayrollPeriod>
  ): Promise<PayrollPeriod> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );
    const index = periods.findIndex((p) => p.periodId === periodId);
    if (index === -1) {
      throw new Error(`Periode payroll ${periodId} tidak ditemukan.`);
    }

    // Locked check: Cannot edit basic fields if period is locked unless transitioning status or updating computed aggregates
    if (
      periods[index].status === 'LOCKED' &&
      data.status !== undefined &&
      data.status !== 'PAID' &&
      data.status !== 'LOCKED'
    ) {
      throw new Error('Periode payroll telah TERKUNCI (LOCKED). Tidak dapat dimodifikasi secara langsung.');
    }

    const updated = {
      ...periods[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    periods[index] = updated;
    this.setStorage(STORAGE_KEYS.PERIODS, periods);
    return updated;
  }

  public async approvePayroll(
    periodId: string,
    approvedBy: string
  ): Promise<PayrollPeriod> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );
    const index = periods.findIndex((p) => p.periodId === periodId);
    if (index === -1) throw new Error('Periode tidak ditemukan');

    const now = new Date().toISOString();
    periods[index].status = 'APPROVED';
    periods[index].approvedAt = now;
    periods[index].approvedBy = approvedBy;
    periods[index].updatedAt = now;
    this.setStorage(STORAGE_KEYS.PERIODS, periods);

    // Update records status to APPROVED
    const records = this.getStorage<PayrollRecord[]>(STORAGE_KEYS.RECORDS, []);
    const updatedRecords = records.map((r) =>
      r.periodId === periodId ? { ...r, status: 'APPROVED' as PayrollPeriodStatus, approvedAt: now, approvedBy } : r
    );
    this.setStorage(STORAGE_KEYS.RECORDS, updatedRecords);

    return periods[index];
  }

  public async lockPayroll(
    periodId: string,
    lockedBy: string
  ): Promise<PayrollPeriod> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );
    const index = periods.findIndex((p) => p.periodId === periodId);
    if (index === -1) throw new Error('Periode tidak ditemukan');

    const now = new Date().toISOString();
    periods[index].status = 'LOCKED';
    periods[index].lockedAt = now;
    periods[index].lockedBy = lockedBy;
    periods[index].updatedAt = now;
    this.setStorage(STORAGE_KEYS.PERIODS, periods);

    // Update records status to LOCKED & generate permanent Payslips
    const records = this.getStorage<PayrollRecord[]>(STORAGE_KEYS.RECORDS, []);
    const updatedRecords = records.map((r) =>
      r.periodId === periodId ? { ...r, status: 'LOCKED' as PayrollPeriodStatus, lockedAt: now, lockedBy } : r
    );
    this.setStorage(STORAGE_KEYS.RECORDS, updatedRecords);

    // Generate Payslips
    await this.generatePayslipsForPeriod(periodId, lockedBy);

    // Mark advances as DEDUCTED
    const advances = this.getStorage<SalaryAdvance[]>(STORAGE_KEYS.ADVANCES, INITIAL_SALARY_ADVANCES);
    const updatedAdvances = advances.map((adv) => {
      if (adv.status === 'APPROVED' && adv.payrollId === periodId) {
        return { ...adv, status: 'DEDUCTED' as const, deductedAt: now };
      }
      return adv;
    });
    this.setStorage(STORAGE_KEYS.ADVANCES, updatedAdvances);

    return periods[index];
  }

  public async payPayroll(
    periodId: string,
    paidBy: string
  ): Promise<PayrollPeriod> {
    await delay();
    const periods = this.getStorage<PayrollPeriod[]>(
      STORAGE_KEYS.PERIODS,
      INITIAL_PAYROLL_PERIODS
    );
    const index = periods.findIndex((p) => p.periodId === periodId);
    if (index === -1) throw new Error('Periode tidak ditemukan');

    const now = new Date().toISOString();
    periods[index].status = 'PAID';
    periods[index].paidAt = now;
    periods[index].paidBy = paidBy;
    periods[index].updatedAt = now;
    this.setStorage(STORAGE_KEYS.PERIODS, periods);

    return periods[index];
  }

  // ==========================================
  // CORE CALCULATION ENGINE (AGGREGATOR)
  // ==========================================

  public calculateGrossSalary(data: {
    basicSalary: number;
    fixedAllowance: number;
    overtimeAmount: number;
    otherEarnings: number;
  }): number {
    return (
      Math.max(0, safeNumber(data.basicSalary)) +
      Math.max(0, safeNumber(data.fixedAllowance)) +
      Math.max(0, safeNumber(data.overtimeAmount)) +
      Math.max(0, safeNumber(data.otherEarnings))
    );
  }

  public calculateTotalDeduction(data: {
    lateDeduction: number;
    absenceDeduction: number;
    advanceDeduction: number;
    otherDeduction: number;
  }): number {
    return (
      Math.max(0, safeNumber(data.lateDeduction)) +
      Math.max(0, safeNumber(data.absenceDeduction)) +
      Math.max(0, safeNumber(data.advanceDeduction)) +
      Math.max(0, safeNumber(data.otherDeduction))
    );
  }

  public calculateNetSalary(gross: number, deduction: number): number {
    const safeGross = Math.max(0, safeNumber(gross));
    const safeDed = Math.max(0, safeNumber(deduction));
    return Math.max(0, safeGross - safeDed);
  }

  /**
   * Main Payroll Aggregator for a single employee in a period
   */
  public async calculateEmployeePayroll(
    periodId: string,
    employeeId: string,
    calculatedBy = 'System Engine'
  ): Promise<PayrollRecord> {
    const period = await this.getPayrollPeriodById(periodId);
    if (!period) throw new Error(`Periode ${periodId} tidak ditemukan.`);

    const employee = MASTER_EMPLOYEES.find((e) => e.id === employeeId);
    if (!employee) throw new Error(`Karyawan dengan ID ${employeeId} tidak ditemukan.`);

    // 1. Fetch Salary Structure
    const salary = await this.getSalaryByEmployee(employeeId);
    const basicSalary = salary ? safeNumber(salary.basicSalary) : 0;
    const mealAllowance = salary ? safeNumber(salary.mealAllowance) : 0;
    const transportAllowance = salary ? safeNumber(salary.transportAllowance) : 0;
    const positionAllowance = salary ? safeNumber(salary.positionAllowance) : 0;
    const otherAllowance = salary ? safeNumber(salary.otherAllowance) : 0;
    const fixedAllowance = salary ? safeNumber(salary.fixedAllowance) : 0;

    // 2. Fetch Attendance Aggregates (Consumes attendanceService & attendanceRuleService)
    const attendances = await attendanceService.getAttendanceRecords({
      employeeId,
      startDate: period.startDate,
      endDate: period.endDate,
    });

    let presentDays = 0;
    let lateDays = 0;
    let totalLateMinutes = 0;
    let lateDeduction = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let offDays = 0;
    let incompleteDays = 0;
    let totalWorkHours = 0;

    // If attendanceService records exist, aggregate them
    if (attendances && attendances.length > 0) {
      attendances.forEach((att) => {
        if (att.status === 'PRESENT') presentDays++;
        else if (att.status === 'LATE') {
          presentDays++;
          lateDays++;
          totalLateMinutes += safeNumber(att.lateMinutes);
          // Prefer existing calculated deduction, or calculate dynamically
          const ded = att.lateDeductionAmount !== undefined
            ? safeNumber(att.lateDeductionAmount)
            : attendanceRuleService.calculateLateDeduction(att.lateMinutes);
          lateDeduction += ded;
        } else if (att.status === 'ABSENT') {
          absentDays++;
        } else if (att.status === 'LEAVE') {
          leaveDays++;
        } else if (att.status === 'OFF') {
          offDays++;
        } else if (att.status === 'INCOMPLETE') {
          incompleteDays++;
        }

        totalWorkHours += safeNumber(att.total_hours || att.durationHours || 8);
      });
    } else {
      // Deterministic fallback for employee simulation if no specific attendance logs entered
      // Default: 22 working days, 0 late unless specific employee personas
      if (employee.id === 'emp-11') {
        // Budi: Late 60 mins once
        presentDays = 21;
        lateDays = 1;
        totalLateMinutes = 60;
        lateDeduction = 10000;
      } else if (employee.id === 'emp-20') {
        // Reno: Late 30 mins
        presentDays = 21;
        lateDays = 1;
        totalLateMinutes = 30;
        lateDeduction = 10000;
      } else {
        presentDays = 22;
      }
      totalWorkHours = presentDays * 8;
    }

    // Absence Deduction (Simulation contract - Default 'NONE')
    const absenceDeduction = 0; // Default NONE

    // 3. Fetch Overtime Aggregates (Consumes overtimeService)
    // ONLY APPROVED or COMPLETED records are counted into payroll
    const allOvertimes = await overtimeService.getOvertimeRecords({
      employeeId,
      startDate: period.startDate,
      endDate: period.endDate,
    });

    let totalApprovedMinutes = 0;
    let totalApprovedHours = 0;
    let overtimeAmount = 0;
    let excessMinutes = 0;
    let splCount = 0;

    const hrConfig = await hrConfigurationService.getHRConfiguration();
    const defaultOtRate = hrConfig?.overtime?.hourlyRate || 10000; // Rp 10.000 / jam

    allOvertimes.forEach((ot) => {
      if (ot.status === 'APPROVED' || ot.status === 'COMPLETED') {
        splCount++;
        const approvedHrs = safeNumber(ot.approvedHours || ot.plannedHours);
        const approvedMins = Math.round(approvedHrs * 60);
        totalApprovedMinutes += approvedMins;
        totalApprovedHours += approvedHrs;

        // Formula: approvedMinutes / 60 * 10,000
        const otCost = Math.round((approvedMins / 60) * defaultOtRate);
        overtimeAmount += otCost;

        if (ot.excessHours && ot.excessHours > 0) {
          excessMinutes += Math.round(ot.excessHours * 60);
        }
      }
    });

    // 4. Kasbon / Salary Advance Deductions
    const allAdvances = await this.getSalaryAdvances(employeeId);
    let advanceDeduction = 0;
    allAdvances.forEach((adv) => {
      if (adv.status === 'APPROVED' && (!adv.payrollId || adv.payrollId === periodId)) {
        advanceDeduction += safeNumber(adv.amount);
      }
    });

    // 5. Adjustments & Other Earnings/Deductions
    const adjustments = await this.getPayrollAdjustments(periodId, employeeId);
    let otherEarnings = 0;
    let otherDeduction = 0;

    adjustments.forEach((adj) => {
      if (adj.type === 'BONUS') {
        otherEarnings += safeNumber(adj.amount);
      } else if (adj.type === 'DEDUCTION') {
        otherDeduction += safeNumber(adj.amount);
      } else if (adj.type === 'CORRECTION') {
        if (adj.amount >= 0) otherEarnings += safeNumber(adj.amount);
        else otherDeduction += Math.abs(safeNumber(adj.amount));
      } else {
        if (adj.amount >= 0) otherEarnings += safeNumber(adj.amount);
        else otherDeduction += Math.abs(safeNumber(adj.amount));
      }
    });

    // 6. Summary Totals
    const grossSalary = this.calculateGrossSalary({
      basicSalary,
      fixedAllowance,
      overtimeAmount,
      otherEarnings,
    });

    const totalDeduction = this.calculateTotalDeduction({
      lateDeduction,
      absenceDeduction,
      advanceDeduction,
      otherDeduction,
    });

    const netSalary = this.calculateNetSalary(grossSalary, totalDeduction);

    const now = new Date().toISOString();

    const record: PayrollRecord = {
      payrollId: `pay-${periodId}-${employeeId}`,
      periodId,
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.fullName,
      department: employee.department,
      position: employee.primaryPosition,
      salarySnapshot: salary || undefined,

      basicSalary,
      fixedAllowance,
      mealAllowance,
      transportAllowance,
      positionAllowance,
      otherAllowance,
      overtimeAmount,
      otherEarnings,
      grossSalary,

      lateDeduction,
      absenceDeduction,
      advanceDeduction,
      otherDeduction,
      totalDeduction,

      netSalary,

      attendanceSummary: {
        presentDays,
        lateDays,
        totalLateMinutes,
        absentDays,
        leaveDays,
        offDays,
        incompleteDays,
        totalWorkHours,
      },

      overtimeSummary: {
        totalApprovedMinutes,
        totalApprovedHours: Number(totalApprovedHours.toFixed(2)),
        totalEstimatedCost: overtimeAmount,
        excessMinutes,
        splCount,
      },

      breakSummary: {
        totalStandardBreakMinutes: presentDays * 60,
        totalAdditionalBreakMinutes: 0,
        excessBreakMinutes: 0,
      },

      kpiSummary: {
        kpiScore: 88,
        performanceRating: 'Sangat Baik (A)',
        bonusEligibility: false,
        bonusAmount: 0,
      },

      adjustments,
      status: period.status,
      calculatedAt: now,
      calculatedBy,
      createdAt: now,
      updatedAt: now,
    };

    return record;
  }

  /**
   * Calculates all records for an entire period and persists them
   */
  public async calculatePayroll(
    periodId: string,
    calculatedBy = 'Heri Setiawan (Manager)',
    force = false
  ): Promise<PayrollRecord[]> {
    await delay(120);
    const period = await this.getPayrollPeriodById(periodId);
    if (!period) throw new Error(`Periode ${periodId} tidak ditemukan.`);

    if (!force && (period.status === 'LOCKED' || period.status === 'PAID')) {
      throw new Error('Periode payroll telah terkunci. Tidak dapat dihitung ulang secara langsung.');
    }

    // Calculate for all 24 master employees
    const records: PayrollRecord[] = [];
    let totalGross = 0;
    let totalDeds = 0;
    let totalNet = 0;
    let totalOt = 0;

    for (const emp of MASTER_EMPLOYEES) {
      const rec = await this.calculateEmployeePayroll(periodId, emp.id, calculatedBy);
      records.push(rec);
      totalGross += rec.grossSalary;
      totalDeds += rec.totalDeduction;
      totalNet += rec.netSalary;
      totalOt += rec.overtimeAmount;
    }

    // Save records
    const allRecords = this.getStorage<PayrollRecord[]>(STORAGE_KEYS.RECORDS, []);
    const otherPeriodRecords = allRecords.filter((r) => r.periodId !== periodId);
    const mergedRecords = [...otherPeriodRecords, ...records];
    this.setStorage(STORAGE_KEYS.RECORDS, mergedRecords);

    // Update Period Aggregates without demoting LOCKED or PAID status
    const targetStatus = (period.status === 'LOCKED' || period.status === 'PAID')
      ? period.status
      : (period.status === 'DRAFT' ? 'REVIEW' : period.status);

    await this.updatePayrollPeriod(periodId, {
      status: targetStatus,
      totalEmployees: records.length,
      totalGrossSalary: totalGross,
      totalDeductions: totalDeds,
      totalNetSalary: totalNet,
      totalOvertimeAmount: totalOt,
      calculatedAt: period.calculatedAt || new Date().toISOString(),
      calculatedBy: period.calculatedBy || calculatedBy,
    });

    return records;
  }

  public async getPayrollRecords(
    periodId: string,
    params?: PayrollFilterParams
  ): Promise<PayrollRecord[]> {
    await delay();
    let records = this.getStorage<PayrollRecord[]>(STORAGE_KEYS.RECORDS, []);
    let periodRecords = records.filter((r) => r.periodId === periodId);

    // If empty for this period, generate initial calculation automatically with force flag to preserve locked status
    if (periodRecords.length === 0) {
      periodRecords = await this.calculatePayroll(periodId, 'System Initializer', true);
    }

    if (params) {
      if (params.department && params.department !== 'ALL') {
        periodRecords = periodRecords.filter((r) => r.department === params.department);
      }
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        periodRecords = periodRecords.filter(
          (r) =>
            (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
            (r.employeeCode && r.employeeCode.toLowerCase().includes(q)) ||
            (r.position && r.position.toLowerCase().includes(q))
        );
      }
    }

    return periodRecords;
  }

  public async getPayrollRecordByEmployee(
    periodId: string,
    employeeId: string
  ): Promise<PayrollRecord | null> {
    await delay();
    const records = await this.getPayrollRecords(periodId);
    return records.find((r) => r.employeeId === employeeId) || null;
  }

  public async getPayrollSummary(periodId: string): Promise<PayrollSummary | null> {
    await delay();
    const period = await this.getPayrollPeriodById(periodId);
    if (!period) return null;

    const records = await this.getPayrollRecords(periodId);

    const deptMap: Record<string, DepartmentPayrollMetric> = {};

    let totalBasic = 0;
    let totalAllowance = 0;
    let totalOvertime = 0;
    let totalOtherEarnings = 0;
    let totalLate = 0;
    let totalAbsence = 0;
    let totalAdvance = 0;
    let totalOtherDeds = 0;

    records.forEach((r) => {
      totalBasic += r.basicSalary;
      totalAllowance += r.fixedAllowance;
      totalOvertime += r.overtimeAmount;
      totalOtherEarnings += r.otherEarnings;
      totalLate += r.lateDeduction;
      totalAbsence += r.absenceDeduction;
      totalAdvance += r.advanceDeduction;
      totalOtherDeds += r.otherDeduction;

      const dept = r.department || 'Operations';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          employeeCount: 0,
          grossSalary: 0,
          overtime: 0,
          deductions: 0,
          netSalary: 0,
        };
      }
      deptMap[dept].employeeCount++;
      deptMap[dept].grossSalary += r.grossSalary;
      deptMap[dept].overtime += r.overtimeAmount;
      deptMap[dept].deductions += r.totalDeduction;
      deptMap[dept].netSalary += r.netSalary;
    });

    const departmentBreakdown = Object.values(deptMap);

    // Mock Estimated Monthly Revenue from Dashboard (e.g. Rp 380.000.000)
    const estimatedRevenue = 380000000;
    const laborCostPercentage =
      estimatedRevenue > 0
        ? Number(((period.totalGrossSalary / estimatedRevenue) * 100).toFixed(1))
        : 0;

    return {
      periodId: period.periodId,
      periodCode: period.periodCode,
      periodName: period.periodName,
      status: period.status,
      totalHeadcount: records.length,
      totalBasicSalary: totalBasic,
      totalAllowance: totalAllowance,
      totalOvertime: totalOvertime,
      totalOtherEarnings: totalOtherEarnings,
      totalGrossSalary: period.totalGrossSalary,
      totalLateDeductions: totalLate,
      totalAbsenceDeductions: totalAbsence,
      totalAdvanceDeductions: totalAdvance,
      totalOtherDeductions: totalOtherDeds,
      totalDeductions: period.totalDeductions,
      totalNetSalary: period.totalNetSalary,
      departmentBreakdown,
      laborCostPercentage,
      estimatedRevenue,
    };
  }

  /**
   * Get shared HR Payroll Cost Contract for Finance OPEX
   */
  public async getPayrollCostContract(periodId?: string): Promise<PayrollCostContract> {
    const periods = await this.getPayrollPeriods();
    const activePeriod = periodId 
      ? periods.find((p) => p.periodId === periodId) || periods[0]
      : periods[0];

    if (!activePeriod) {
      return {
        periodMonth: '2025-05',
        periodLabel: 'Mei 2025',
        totalEmployees: 24,
        basicSalaryTotal: 120000000,
        allowanceTotal: 25000000,
        overtimeTotal: 8500000,
        lateDeductionsTotal: 1200000,
        kasbonDeductionsTotal: 3000000,
        totalDeductions: 4200000,
        grossPayroll: 153500000,
        netPayroll: 149300000,
        status: 'APPROVED',
      };
    }

    const summary = await this.getPayrollSummary(activePeriod.periodId);
    return {
      periodMonth: activePeriod.startDate ? activePeriod.startDate.slice(0, 7) : '2025-05',
      periodLabel: activePeriod.periodName,
      totalEmployees: summary.totalHeadcount,
      basicSalaryTotal: summary.totalBasicSalary,
      allowanceTotal: summary.totalAllowance,
      overtimeTotal: summary.totalOvertime,
      lateDeductionsTotal: summary.totalLateDeductions,
      kasbonDeductionsTotal: summary.totalAdvanceDeductions,
      totalDeductions: summary.totalDeductions,
      grossPayroll: summary.totalGrossSalary,
      netPayroll: summary.totalNetSalary,
      status: activePeriod.status === 'PAID' ? 'DISBURSED' : activePeriod.status === 'LOCKED' ? 'APPROVED' : 'DRAFT',
      disbursedAt: activePeriod.paidAt,
    };
  }

  // ==========================================
  // PAYSLIP GENERATION & RETRIEVAL
  // ==========================================

  private async generatePayslipsForPeriod(
    periodId: string,
    generatedBy: string
  ): Promise<Payslip[]> {
    const period = await this.getPayrollPeriodById(periodId);
    if (!period) return [];

    const records = await this.getPayrollRecords(periodId);
    const payslips: Payslip[] = [];
    const now = new Date().toISOString();

    records.forEach((r) => {
      const emp = MASTER_EMPLOYEES.find((e) => e.id === r.employeeId);
      const isLocked = period.status === 'LOCKED' || period.status === 'PAID';

      const slip: Payslip = {
        payslipId: `slip-${periodId}-${r.employeeId}`,
        payrollId: r.payrollId,
        periodId: period.periodId,
        periodCode: period.periodCode,
        periodName: period.periodName,
        periodStartDate: period.startDate,
        periodEndDate: period.endDate,
        employeeId: r.employeeId,
        employeeCode: r.employeeCode || emp?.employeeCode || 'TG-EMP',
        employeeName: r.employeeName || emp?.fullName || 'Karyawan',
        department: r.department || emp?.department || 'Operations',
        position: r.position || emp?.primaryPosition || 'Staff',
        joinDate: emp?.joinDate,
        bankAccount: 'BCA 849-0192-881 (a.n. ' + (r.employeeName || 'Karyawan') + ')',

        basicSalary: r.basicSalary,
        mealAllowance: r.mealAllowance,
        transportAllowance: r.transportAllowance,
        positionAllowance: r.positionAllowance,
        otherAllowance: r.otherAllowance,
        totalAllowance: r.fixedAllowance,
        overtimePay: r.overtimeAmount,
        otherEarnings: r.otherEarnings,
        grossSalary: r.grossSalary,

        lateDeduction: r.lateDeduction,
        absenceDeduction: r.absenceDeduction,
        advanceDeduction: r.advanceDeduction,
        otherDeductions: r.otherDeduction,
        totalDeductions: r.totalDeduction,

        netSalary: r.netSalary,

        presentDays: r.attendanceSummary?.presentDays || 22,
        lateMinutes: r.attendanceSummary?.totalLateMinutes || 0,
        approvedOvertimeHours: r.overtimeSummary?.totalApprovedHours || 0,
        kpiScore: r.kpiSummary?.kpiScore,
        performanceRating: r.kpiSummary?.performanceRating,

        isLocked,
        status: isLocked ? 'Final' : 'Preview',
        generatedAt: now,
        generatedBy,
      };

      payslips.push(slip);
    });

    const allSlips = this.getStorage<Payslip[]>(STORAGE_KEYS.PAYSLIPS, []);
    const filtered = allSlips.filter((s) => s.periodId !== periodId);
    const updated = [...filtered, ...payslips];
    this.setStorage(STORAGE_KEYS.PAYSLIPS, updated);

    return payslips;
  }

  public async getPayslip(payslipOrPayrollId: string): Promise<Payslip | null> {
    await delay();
    const slips = this.getStorage<Payslip[]>(STORAGE_KEYS.PAYSLIPS, []);
    let found = slips.find(
      (s) => s.payslipId === payslipOrPayrollId || s.payrollId === payslipOrPayrollId
    );

    if (!found) {
      // Build dynamic preview payslip on the fly from payroll record
      const records = this.getStorage<PayrollRecord[]>(STORAGE_KEYS.RECORDS, []);
      const rec = records.find(
        (r) => r.payrollId === payslipOrPayrollId || `slip-${r.periodId}-${r.employeeId}` === payslipOrPayrollId
      );

      if (rec) {
        const period = await this.getPayrollPeriodById(rec.periodId);
        const emp = MASTER_EMPLOYEES.find((e) => e.id === rec.employeeId);
        if (period && emp) {
          const isLocked = period.status === 'LOCKED' || period.status === 'PAID';
          return {
            payslipId: `slip-${period.periodId}-${rec.employeeId}`,
            payrollId: rec.payrollId,
            periodId: period.periodId,
            periodCode: period.periodCode,
            periodName: period.periodName,
            periodStartDate: period.startDate,
            periodEndDate: period.endDate,
            employeeId: rec.employeeId,
            employeeCode: rec.employeeCode || emp.employeeCode,
            employeeName: rec.employeeName || emp.fullName,
            department: rec.department || emp.department,
            position: rec.position || emp.primaryPosition,
            joinDate: emp.joinDate,
            bankAccount: 'BCA 849-0192-881',
            basicSalary: rec.basicSalary,
            mealAllowance: rec.mealAllowance,
            transportAllowance: rec.transportAllowance,
            positionAllowance: rec.positionAllowance,
            otherAllowance: rec.otherAllowance,
            totalAllowance: rec.fixedAllowance,
            overtimePay: rec.overtimeAmount,
            otherEarnings: rec.otherEarnings,
            grossSalary: rec.grossSalary,
            lateDeduction: rec.lateDeduction,
            absenceDeduction: rec.absenceDeduction,
            advanceDeduction: rec.advanceDeduction,
            otherDeductions: rec.otherDeduction,
            totalDeductions: rec.totalDeduction,
            netSalary: rec.netSalary,
            presentDays: rec.attendanceSummary?.presentDays || 22,
            lateMinutes: rec.attendanceSummary?.totalLateMinutes || 0,
            approvedOvertimeHours: rec.overtimeSummary?.totalApprovedHours || 0,
            kpiScore: rec.kpiSummary?.kpiScore,
            performanceRating: rec.kpiSummary?.performanceRating,
            isLocked,
            status: isLocked ? 'Final' : 'Preview',
            generatedAt: new Date().toISOString(),
            generatedBy: 'System Auto Preview',
          };
        }
      }
    }

    return found || null;
  }

  public async getEmployeePayslips(employeeId: string): Promise<Payslip[]> {
    await delay();
    const periods = await this.getPayrollPeriods();
    const payslips: Payslip[] = [];

    for (const period of periods) {
      try {
        const record = await this.getPayrollRecordByEmployee(period.periodId, employeeId);
        if (record) {
          const slip = await this.getPayslip(record.payrollId);
          if (slip) {
            payslips.push(slip);
          }
        }
      } catch (err) {
        console.warn(`[PayrollService] Could not load payslip for period ${period.periodId}:`, err);
      }
    }

    return payslips;
  }

  /**
   * Reset all payroll and salary storage to default mock data
   */
  public async resetToDefaults(): Promise<void> {
    await delay();
    localStorage.removeItem(STORAGE_KEYS.SALARIES);
    localStorage.removeItem(STORAGE_KEYS.SALARY_HISTORIES);
    localStorage.removeItem(STORAGE_KEYS.PERIODS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.ADVANCES);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTMENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYSLIPS);

    this.setStorage(STORAGE_KEYS.SALARIES, INITIAL_SALARIES);
    this.setStorage(STORAGE_KEYS.SALARY_HISTORIES, INITIAL_SALARY_HISTORIES);
    this.setStorage(STORAGE_KEYS.PERIODS, INITIAL_PAYROLL_PERIODS);
    this.setStorage(STORAGE_KEYS.ADVANCES, INITIAL_SALARY_ADVANCES);
    this.setStorage(STORAGE_KEYS.ADJUSTMENTS, INITIAL_PAYROLL_ADJUSTMENTS);

    // Trigger calculation for default periods with force flag to support locked/paid periods
    for (const p of INITIAL_PAYROLL_PERIODS) {
      await this.calculatePayroll(p.periodId, 'System Reset', true);
    }
  }
}

export type PayrollPeriodData = PayrollPeriod;
export type PayrollRecordData = PayrollRecord;

export const payrollService = new PayrollServiceEngine();

/** Legacy Compatibility Adapter */
export const PayrollService = {
  getPayrollPeriods: async () => {
    try {
      const data = await payrollService.getPayrollPeriods();
      return { data, error: null };
    } catch (err: any) {
      return { data: [], error: err?.message || 'Error' };
    }
  },
  getPayrollRecords: async (periodId?: string) => {
    try {
      const id = periodId || 'period-2026-08';
      const data = await payrollService.getPayrollRecords(id);
      return { data, error: null };
    } catch (err: any) {
      return { data: [], error: err?.message || 'Error' };
    }
  },
  processPayroll: async (periodMonth?: string, year?: number) => {
    return { success: true, data: {}, error: null };
  },
  createPayrollPeriod: async (data: any) => {
    try {
      const period = await payrollService.createPayrollPeriod(data);
      return { success: true, data: period, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err?.message };
    }
  },
  calculatePayroll: async (id: string, calculatedBy?: string) => {
    try {
      const res = await payrollService.calculatePayroll(id, calculatedBy);
      return { success: true, data: res, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err?.message };
    }
  },
  approvePayroll: async (id: string, approvedBy = 'Manager') => {
    try {
      const res = await payrollService.approvePayroll(id, approvedBy);
      return { success: true, data: res, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err?.message };
    }
  },
  finalizePayroll: async (id: string, lockedBy = 'Finance') => {
    try {
      const res = await payrollService.lockPayroll(id, lockedBy);
      return { success: true, data: res, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err?.message };
    }
  },
  getKpiIncentivePolicies: async (..._args: any[]) => ({ data: [], error: null }),
  getKpiIncentiveRules: async (..._args: any[]) => ({ data: [], error: null }),
  updateKpiIncentivePolicy: async (..._args: any[]) => ({ success: true, data: null, error: null }),
  createKpiIncentivePolicy: async (..._args: any[]) => ({ success: true, data: null, error: null }),
  deleteKpiIncentivePolicy: async (..._args: any[]) => ({ success: true, error: null }),
  updateKpiIncentiveRule: async (..._args: any[]) => ({ success: true, data: null, error: null }),
  createKpiIncentiveRule: async (..._args: any[]) => ({ success: true, data: null, error: null }),
  deleteKpiIncentiveRule: async (..._args: any[]) => ({ success: true, error: null }),
};
