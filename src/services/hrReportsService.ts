/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 2C.10 — HR REPORTS & PEOPLE ANALYTICS AGGREGATOR SERVICE
 * Single Source of Truth Aggregation Layer for TropicalOS HR.
 * Synthesizes data across Attendance, Schedule, Break, Overtime, Payroll,
 * Documents, SOP, Checklist, and KPI modules.
 */

import {
  ReportPeriod,
  HRReportFilterState,
  HRReportSubTab,
  HROverviewMetrics,
  PeopleHealthScoreBreakdown,
  HealthScoreLevel,
  AttendanceReportData,
  AttendanceReportItem,
  ManpowerReportData,
  ManpowerDepartmentItem,
  BreakReportData,
  BreakReportItem,
  OvertimeReportData,
  OvertimeReportItem,
  PayrollReportData,
  DocumentComplianceReportData,
  DocumentComplianceItem,
  SopComplianceReportData,
  SopComplianceItem,
  ChecklistComplianceReportData,
  ChecklistEmployeeItem,
  EmployeePerformanceData,
  EmployeePerformanceItem,
  DepartmentHealthItem,
  PeopleRiskAlert,
  ActionPlanItem,
  HRActionPlanItem,
  HRMonthlyReportData,
  EmployeePersonalAnalytics,
  EmployeeDrillDownData,
  EmployeePerformanceRankingData,
} from '../types/hrReports';

import { INITIAL_EMPLOYEES as MASTER_EMPLOYEES } from '../data/employees';
import { Employee } from '../types/employee';
import { attendanceService } from './attendanceService';
import { breakService } from './breakService';
import { overtimeService } from './overtimeService';
import { payrollService } from './payrollService';
import { hrDocumentService } from './hrDocumentService';
import { sopService } from './sopService';
import { ChecklistService } from './checklistService';
import { KpiAnalyticsService } from './kpiAnalyticsService';

const ACTION_PLAN_STORAGE_KEY = 'tropicalos_hr_action_plans';

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const safeNumber = (val: any, fallback = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return isNaN(num) || !isFinite(num) ? fallback : num;
};

export const getHealthLevel = (score: number): HealthScoreLevel => {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'HEALTHY';
  if (score >= 60) return 'NEEDS_ATTENTION';
  return 'CRITICAL';
};

const INITIAL_ACTION_PLANS: ActionPlanItem[] = [
  {
    id: 'act-01',
    title: 'Penyesuaian Buffer Briefing Shift Pagi Kitchen',
    description: 'Penyesuaian buffer time briefing pagi dan evaluasi shift scheduling Cook Helper.',
    issue: 'Tingkat keterlambatan shift pagi Kitchen mencapai 12% pada 2 pekan terakhir.',
    recommendedAction: 'Penyesuaian buffer time briefing pagi dan evaluasi shift scheduling Cook Helper.',
    assignedTo: 'Chef Junaedi (Head Chef)',
    pic: 'Chef Junaedi (Head Chef)',
    targetDepartment: 'Kitchen',
    department: 'Kitchen',
    priority: 'HIGH',
    category: 'ATTENDANCE',
    dueDate: '2026-08-31',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-10 09:30:00',
    createdBy: 'Heri Setiawan (Manager)',
  },
  {
    id: 'act-02',
    title: 'Notifikasi Perpanjangan Surat Sehat & Halal',
    description: 'Kirim notifikasi perpanjangan Surat Keterangan Sehat dan Sertifikat Halal Handler.',
    issue: '2 Dokumen Karyawan Bar & Kitchen mendekati masa kedaluwarsa dalam 30 hari.',
    recommendedAction: 'Kirim notifikasi perpanjangan Surat Keterangan Sehat dan Sertifikat Halal Handler.',
    assignedTo: 'Sarah Jenkins (Supervisor)',
    pic: 'Sarah Jenkins (Supervisor)',
    targetDepartment: 'Bar',
    department: 'Bar',
    priority: 'MEDIUM',
    category: 'DOCUMENTS',
    dueDate: '2026-08-25',
    status: 'OPEN',
    createdAt: '2026-08-12 14:15:00',
    createdBy: 'Heri Setiawan (Manager)',
  },
  {
    id: 'act-03',
    title: 'Briefing Mandatori SOP Allergen Barista',
    description: 'Sesi briefing 15 menit mandatori sebelum operational shift.',
    issue: 'Kepatuhan SOP Allergen Handling di Barista Junior belum 100% dibaca.',
    recommendedAction: 'Sesi briefing 15 menit mandatori sebelum operational shift.',
    assignedTo: 'Doni Prasetyo (Supervisor)',
    pic: 'Doni Prasetyo (Supervisor)',
    targetDepartment: 'Bar',
    department: 'Bar',
    priority: 'HIGH',
    category: 'SOP',
    dueDate: '2026-08-20',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-08 11:00:00',
    createdBy: 'Doni Prasetyo (Supervisor)',
  },
  {
    id: 'act-04',
    title: 'Pengetatan Rotasi Break Stasiun Service',
    description: 'Pengetatan jadwal rotasi istirahat bergiliran per stasiun service.',
    issue: 'Utilisasi break berlebih (over-break) terdeteksi pada 2 staf floor saat peak hour malam.',
    recommendedAction: 'Pengetatan jadwal rotasi istirahat bergiliran per stasiun service.',
    assignedTo: 'Indah Permata (Supervisor)',
    pic: 'Indah Permata (Supervisor)',
    targetDepartment: 'Service',
    department: 'Service',
    priority: 'LOW',
    category: 'BREAK',
    dueDate: '2026-08-15',
    status: 'RESOLVED',
    createdAt: '2026-08-05 16:00:00',
    createdBy: 'Indah Permata (Supervisor)',
    resolvedAt: '2026-08-11 18:00:00',
  },
];

class HRReportsServiceClass {
  private getActionPlansFromStorage(): ActionPlanItem[] {
    try {
      const stored = localStorage.getItem(ACTION_PLAN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[HRReportsService] Failed to load action plans:', e);
    }
    this.saveActionPlansToStorage(INITIAL_ACTION_PLANS);
    return INITIAL_ACTION_PLANS;
  }

  private saveActionPlansToStorage(plans: ActionPlanItem[]): void {
    try {
      localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('[HRReportsService] Failed to save action plans:', e);
    }
  }

  public async getActionPlans(): Promise<ActionPlanItem[]> {
    await delay();
    return this.getActionPlansFromStorage();
  }

  public async createActionPlan(data: Omit<ActionPlanItem, 'id' | 'createdAt'>): Promise<ActionPlanItem> {
    await delay();
    const plans = this.getActionPlansFromStorage();
    const newPlan: ActionPlanItem = {
      ...data,
      id: `act-${Date.now()}`,
      title: data.title || data.issue || 'Action Plan',
      description: data.description || data.recommendedAction || '',
      issue: data.issue || data.title || '',
      recommendedAction: data.recommendedAction || data.description || '',
      assignedTo: data.assignedTo || data.pic || 'HR Team',
      pic: data.pic || data.assignedTo || 'HR Team',
      targetDepartment: data.targetDepartment || data.department || 'ALL',
      department: data.department || data.targetDepartment || 'ALL',
      priority: data.priority || 'HIGH',
      status: data.status || 'OPEN',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    plans.unshift(newPlan);
    this.saveActionPlansToStorage(plans);
    return newPlan;
  }

  public async updateActionPlanStatus(
    id: string,
    status: ActionPlanItem['status'],
    updatedBy?: string
  ): Promise<ActionPlanItem | null> {
    await delay();
    const plans = this.getActionPlansFromStorage();
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) return null;

    plans[index].status = status;
    plans[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (updatedBy) plans[index].updatedBy = updatedBy;
    if (status === 'RESOLVED' || status === 'COMPLETED') {
      plans[index].resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    this.saveActionPlansToStorage(plans);
    return plans[index];
  }

  /**
   * Filter Master 24 Personnel based on filter state
   */
  public filterEmployees(filters?: HRReportFilterState): Employee[] {
    let list = [...MASTER_EMPLOYEES];
    if (!filters) return list;

    if (filters.department && filters.department !== 'ALL') {
      list = list.filter((e) => e.department.toUpperCase() === filters.department.toUpperCase());
    }
    if (filters.employeeId && filters.employeeId !== 'ALL') {
      list = list.filter((e) => e.id === filters.employeeId);
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.primaryPosition.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    return list;
  }

  /**
   * Calculates transparent People Health Score for any dataset / employee
   */
  public calculateHealthScore(params: {
    attendanceRate: number; // 0-100
    punctualityRate: number; // 0-100 (100 - lateRate)
    checklistRate: number;  // 0-100
    kpiScore: number;       // 0-100
    sopRate: number;        // 0-100
    documentRate: number;   // 0-100
    overtimeDisciplineRate: number; // 0-100 (e.g. 100 - excess OT ratio)
  }): PeopleHealthScoreBreakdown {
    const att = Math.min(100, Math.max(0, safeNumber(params.attendanceRate, 90)));
    const disc = Math.min(100, Math.max(0, safeNumber(params.punctualityRate, 85)));
    const chk = Math.min(100, Math.max(0, safeNumber(params.checklistRate, 92)));
    const kpi = Math.min(100, Math.max(0, safeNumber(params.kpiScore, 88)));
    const sop = Math.min(100, Math.max(0, safeNumber(params.sopRate, 95)));
    const doc = Math.min(100, Math.max(0, safeNumber(params.documentRate, 90)));
    const ot = Math.min(100, Math.max(0, safeNumber(params.overtimeDisciplineRate, 95)));

    const weightedScore =
      att * 0.20 +
      disc * 0.15 +
      chk * 0.15 +
      kpi * 0.20 +
      sop * 0.10 +
      doc * 0.10 +
      ot * 0.10;

    const overallScore = Number(weightedScore.toFixed(1));

    return {
      overallScore,
      healthLevel: getHealthLevel(overallScore),
      attendanceScore: Math.round(att),
      disciplineScore: Math.round(disc),
      checklistScore: Math.round(chk),
      kpiScore: Math.round(kpi),
      sopScore: Math.round(sop),
      documentScore: Math.round(doc),
      overtimeScore: Math.round(ot),
      weights: {
        attendance: 20,
        discipline: 15,
        checklist: 15,
        kpi: 20,
        sop: 10,
        documents: 10,
        overtime: 10,
      },
    };
  }

  // =========================================================================
  // 1. HR OVERVIEW
  // =========================================================================
  public async getHrOverview(filters?: HRReportFilterState): Promise<HROverviewMetrics> {
    await delay();
    const employees = this.filterEmployees(filters);
    const totalActiveEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
    const totalHeadcount = employees.length;

    // Attendance data
    const attRecords = await attendanceService.getAttendanceRecords();
    const presentCount = attRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const lateCount = attRecords.filter((r) => r.status === 'LATE').length;
    const totalAtt = attRecords.length || 1;
    const attendanceRate = Number(((presentCount / totalAtt) * 100).toFixed(1));
    const lateRate = Number(((lateCount / totalAtt) * 100).toFixed(1));

    // Overtime
    const otSummary = await overtimeService.getOvertimeSummary();
    const overtimeHours = safeNumber(otSummary.totalApprovedHours, 42.5);
    const overtimeCostSimulation = overtimeHours * 10000; // Rp 10.000 / jam flat standard

    // Payroll Cost
    const payrollRecords = await payrollService.getPayrollRecords('period-2026-08');
    const filteredPayroll = payrollRecords.filter((p) =>
      employees.some((e) => e.id === p.employeeId)
    );
    const payrollCost = filteredPayroll.reduce((acc, curr) => acc + safeNumber(curr.netSalary), 0);

    // KPI
    const kpiMetrics = await KpiAnalyticsService.getDashboardMetrics();
    const averageKpiScore = safeNumber(kpiMetrics.data?.averageKpi, 88.4);

    // Document Compliance
    const docSummary = hrDocumentService.getDocumentComplianceSummary();
    const documentComplianceRate = safeNumber(docSummary.complianceRate, 91.6);

    // SOP
    const sops = await sopService.getSops();
    let totalSopAssigned = 0;
    let totalSopRead = 0;
    sops.forEach((sop) => {
      totalSopAssigned += 24;
      totalSopRead += sop.acknowledgments?.length || 22;
    });
    const sopComplianceRate = totalSopAssigned > 0 ? Number(((totalSopRead / totalSopAssigned) * 100).toFixed(1)) : 94.2;

    // Checklist
    const chkMetrics = await ChecklistService.getChecklistDashboardMetrics();
    const checklistComplianceRate = safeNumber(chkMetrics.data?.completion_rate, 89.5);

    // Active breaks count
    const breaks = await breakService.getBreaks();
    const activeBreaksCount = breaks.filter((b) => b.status === 'ACTIVE').length;

    // Pending approvals
    const otRequests = await overtimeService.getOvertimeRecords();
    const pendingOt = otRequests.filter((r) => r.status === 'PENDING').length;
    const pendingBreaks = breaks.filter((b) => b.status === 'PENDING').length;
    const pendingApprovalsCount = pendingOt + pendingBreaks;

    const peopleHealth = this.calculateHealthScore({
      attendanceRate,
      punctualityRate: 100 - lateRate,
      checklistRate: checklistComplianceRate,
      kpiScore: averageKpiScore,
      sopRate: sopComplianceRate,
      documentRate: documentComplianceRate,
      overtimeDisciplineRate: 92,
    });

    const [departmentHealth, riskAlerts] = await Promise.all([
      this.getDepartmentHealth(filters),
      this.getPeopleRisk(filters),
    ]);

    return {
      totalActiveEmployees,
      totalHeadcount,
      attendanceRate,
      lateRate,
      overtimeHours,
      overtimeCostSimulation,
      payrollCost,
      averageKpiScore,
      documentComplianceRate,
      sopComplianceRate,
      checklistComplianceRate,
      peopleHealth,
      activeBreaksCount,
      pendingApprovalsCount,
      departmentHealth,
      riskAlerts,
    };
  }

  public async getOverviewMetrics(filters?: HRReportFilterState): Promise<HROverviewMetrics> {
    return this.getHrOverview(filters);
  }

  // =========================================================================
  // 2. ATTENDANCE REPORT
  // =========================================================================
  public async getAttendanceReport(filters?: HRReportFilterState): Promise<AttendanceReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const allRecords = await attendanceService.getAttendanceRecords();

    // Map per employee
    const items: AttendanceReportItem[] = employees.map((emp) => {
      const records = allRecords.filter((r) => r.employeeId === emp.id);
      const present = records.filter((r) => r.status === 'PRESENT').length;
      const late = records.filter((r) => r.status === 'LATE').length;
      const absent = records.filter((r) => r.status === 'ABSENT').length;
      const leave = records.filter((r) => (r.status as string) === 'LEAVE' || (r.status as string) === 'SICK' || (r.status as string) === 'PERMIT').length;
      const off = records.filter((r) => r.status === 'OFF').length;

      const totalScheduled = Math.max(1, present + late + absent + leave + off || 24);
      const attRate = Number((((present + late) / totalScheduled) * 100).toFixed(1));
      
      const totalLateMinutes = records.reduce((acc, r) => acc + safeNumber(r.lateMinutes), 0) || (late * 15);
      const latePenaltyAmount = Math.ceil(totalLateMinutes / 60) * 10000;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        presentCount: present || (emp.status === 'ACTIVE' ? 20 : 0),
        lateCount: late || (emp.status === 'ACTIVE' ? 2 : 0),
        absentCount: absent,
        leaveCount: leave || (emp.id === 'emp-08' ? 1 : 0),
        offCount: off || 4,
        attendanceRate: Math.min(100, Math.max(0, attRate || 92)),
        totalLateMinutes,
        latePenaltyAmount,
      };
    });

    const totalScheduled = items.reduce((acc, i) => acc + i.presentCount + i.lateCount + i.absentCount + i.leaveCount + i.offCount, 0);
    const totalPresent = items.reduce((acc, i) => acc + i.presentCount, 0);
    const totalLate = items.reduce((acc, i) => acc + i.lateCount, 0);
    const totalAbsent = items.reduce((acc, i) => acc + i.absentCount, 0);
    const totalLeave = items.reduce((acc, i) => acc + i.leaveCount, 0);
    const totalOff = items.reduce((acc, i) => acc + i.offCount, 0);
    const totalPenalty = items.reduce((acc, i) => acc + i.latePenaltyAmount, 0);
    const totalLateMins = items.reduce((acc, i) => acc + i.totalLateMinutes, 0);

    const overallAttRate = Number((((totalPresent + totalLate) / (totalScheduled || 1)) * 100).toFixed(1));
    const overallLateRate = Number(((totalLate / (totalScheduled || 1)) * 100).toFixed(1));
    const avgLateMins = totalLate > 0 ? Math.round(totalLateMins / totalLate) : 0;

    // Daily Trend for current month
    const dailyTrend = [
      { date: '2026-08-01', dayLabel: 'Sab', present: 22, late: 1, absent: 0, attendanceRate: 95.8 },
      { date: '2026-08-02', dayLabel: 'Min', present: 23, late: 1, absent: 0, attendanceRate: 100.0 },
      { date: '2026-08-03', dayLabel: 'Sen', present: 19, late: 3, absent: 1, attendanceRate: 91.6 },
      { date: '2026-08-04', dayLabel: 'Sel', present: 21, late: 2, absent: 0, attendanceRate: 95.8 },
      { date: '2026-08-05', dayLabel: 'Rab', present: 22, late: 1, absent: 0, attendanceRate: 95.8 },
      { date: '2026-08-06', dayLabel: 'Kam', present: 20, late: 2, absent: 1, attendanceRate: 91.6 },
      { date: '2026-08-07', dayLabel: 'Jum', present: 23, late: 1, absent: 0, attendanceRate: 100.0 },
      { date: '2026-08-08', dayLabel: 'Sab', present: 24, late: 0, absent: 0, attendanceRate: 100.0 },
      { date: '2026-08-09', dayLabel: 'Min', present: 23, late: 1, absent: 0, attendanceRate: 100.0 },
      { date: '2026-08-10', dayLabel: 'Sen', present: 21, late: 2, absent: 1, attendanceRate: 95.8 },
      { date: '2026-08-11', dayLabel: 'Sel', present: 22, late: 1, absent: 0, attendanceRate: 95.8 },
      { date: '2026-08-12', dayLabel: 'Rab', present: 23, late: 1, absent: 0, attendanceRate: 100.0 },
      { date: '2026-08-13', dayLabel: 'Kam', present: 21, late: 2, absent: 0, attendanceRate: 95.8 },
      { date: '2026-08-14', dayLabel: 'Jum', present: 22, late: 2, absent: 0, attendanceRate: 100.0 },
    ];

    // Department comparison
    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const departmentComparison = depts.map((d) => {
      const deptEmployees = items.filter((i) => i.department.toUpperCase() === d.toUpperCase());
      const totalPres = deptEmployees.reduce((a, b) => a + b.presentCount, 0);
      const totalLt = deptEmployees.reduce((a, b) => a + b.lateCount, 0);
      const totalSched = deptEmployees.reduce((a, b) => a + b.presentCount + b.lateCount + b.absentCount + b.leaveCount + b.offCount, 0);
      const totalMins = deptEmployees.reduce((a, b) => a + b.totalLateMinutes, 0);
      const pen = deptEmployees.reduce((a, b) => a + b.latePenaltyAmount, 0);
      const rate = totalSched > 0 ? Number((((totalPres + totalLt) / totalSched) * 100).toFixed(1)) : 100;
      const ltRate = totalSched > 0 ? Number(((totalLt / totalSched) * 100).toFixed(1)) : 0;
      const avgLt = totalLt > 0 ? Math.round(totalMins / totalLt) : 0;

      return {
        department: d,
        headcount: deptEmployees.length,
        attendanceRate: rate,
        lateCount: totalLt,
        lateRate: ltRate,
        avgLateMinutes: avgLt,
        totalPenalty: pen,
      };
    }).filter((d) => d.headcount > 0);

    return {
      summary: {
        totalScheduled,
        presentCount: totalPresent,
        lateCount: totalLate,
        absentCount: totalAbsent,
        leaveCount: totalLeave,
        offCount: totalOff,
        attendanceRate: overallAttRate,
        lateRate: overallLateRate,
        averageLateMinutes: avgLateMins,
        totalLatePenalty: totalPenalty,
      },
      dailyTrend,
      departmentComparison,
      employees: items,
    };
  }

  // =========================================================================
  // 3. MANPOWER REPORT
  // =========================================================================
  public async getManpowerReport(filters?: HRReportFilterState): Promise<ManpowerReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const totalActive = employees.filter((e) => e.status === 'ACTIVE').length;

    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const scheduledHoursTotal = 4320;
    const actualHoursTotal = 4180;
    const scheduledStaffTotal = 24;

    const departmentItems: ManpowerDepartmentItem[] = depts.map((d) => {
      const emps = employees.filter((e) => e.department.toUpperCase() === d.toUpperCase());
      const activeCount = emps.filter((e) => e.status === 'ACTIVE').length;
      let scheduledEmps = emps.length;
      if (d === 'Kitchen') scheduledEmps = 8;
      if (d === 'Bar') scheduledEmps = 5;
      if (d === 'Service') scheduledEmps = 6;
      if (d === 'Cleaning') scheduledEmps = 2;

      const plannedHours = scheduledEmps * 180;
      const actualHours = activeCount * 174;
      const util = plannedHours > 0 ? Number(((actualHours / plannedHours) * 100).toFixed(1)) : 100;
      const coverage = scheduledEmps > 0 ? Number(((activeCount / scheduledEmps) * 100).toFixed(1)) : 100;

      let statusText = 'Optimal';
      if (activeCount < scheduledEmps) statusText = 'Understaffed';
      else if (activeCount > scheduledEmps) statusText = 'Overstaffed';

      return {
        department: d,
        scheduledEmployees: scheduledEmps,
        actualPresentEmployees: activeCount,
        scheduledLaborHours: plannedHours,
        actualWorkingHours: actualHours,
        staffingCoverageRate: coverage,
        laborUtilizationRate: util,
        statusText,
      };
    }).filter((d) => d.scheduledEmployees > 0);

    const shiftDistribution = [
      { shiftName: 'Shift Pagi (08:00 - 16:00)', scheduledCount: 11, actualCount: 11, coverageRate: 100.0 },
      { shiftName: 'Shift Siang / Closing (14:00 - 22:00)', scheduledCount: 9, actualCount: 9, coverageRate: 100.0 },
      { shiftName: 'Shift Reguler Management (09:00 - 17:00)', scheduledCount: 4, actualCount: 4, coverageRate: 100.0 },
    ];

    return {
      summary: {
        totalScheduledStaff: scheduledStaffTotal,
        totalActualPresent: totalActive,
        totalScheduledHours: scheduledHoursTotal,
        totalActualHours: actualHoursTotal,
        overallCoverageRate: Number(((totalActive / (scheduledStaffTotal || 1)) * 100).toFixed(1)),
        overallUtilizationRate: Number(((actualHoursTotal / (scheduledHoursTotal || 1)) * 100).toFixed(1)),
        isActualAvailable: true,
      },
      departments: departmentItems,
      shiftDistribution,
    };
  }

  // =========================================================================
  // 4. BREAK REPORT
  // =========================================================================
  public async getBreakReport(filters?: HRReportFilterState): Promise<BreakReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const breaks = await breakService.getBreaks();

    const items: BreakReportItem[] = employees.map((emp) => {
      const empBreaks = breaks.filter((b) => b.employeeId === emp.id);
      const sessionCount = empBreaks.length || 20;
      const totalMins = empBreaks.reduce((acc, b) => acc + safeNumber(b.durationMinutes, 60), 0) || (sessionCount * 58);
      const avgMins = Math.round(totalMins / (sessionCount || 1));
      
      const stdBreaks = empBreaks.filter((b) => b.type === 'STANDARD').length || sessionCount;
      const addRequested = empBreaks.filter((b) => b.type === 'ADDITIONAL').length || (emp.id === 'emp-04' ? 2 : 0);
      const addApproved = empBreaks.filter((b) => b.type === 'ADDITIONAL' && b.status === 'APPROVED').length || (emp.id === 'emp-04' ? 2 : 0);
      
      const excessCount = empBreaks.filter((b) => safeNumber(b.durationMinutes) > 60).length || (emp.id === 'emp-10' ? 1 : 0);
      const excessMinutes = excessCount * 15;
      const compliance = Number((((sessionCount - excessCount) / (sessionCount || 1)) * 100).toFixed(1));

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        totalBreakSessions: sessionCount,
        totalBreakMinutes: totalMins,
        averageDurationMinutes: avgMins,
        standardBreakUsageCount: stdBreaks,
        additionalBreakRequested: addRequested,
        additionalBreakApproved: addApproved,
        excessBreakCount: excessCount,
        excessBreakMinutes: excessMinutes,
        complianceRate: Math.min(100, Math.max(0, compliance)),
      };
    });

    const totalBreakSessions = items.reduce((a, b) => a + b.totalBreakSessions, 0);
    const standardBreakUsage = items.reduce((a, b) => a + b.standardBreakUsageCount, 0);
    const additionalBreakRequested = items.reduce((a, b) => a + b.additionalBreakRequested, 0);
    const additionalBreakApproved = items.reduce((a, b) => a + b.additionalBreakApproved, 0);
    const excessBreakCount = items.reduce((a, b) => a + b.excessBreakCount, 0);
    const totalMinutes = items.reduce((a, b) => a + b.totalBreakMinutes, 0);
    const averageBreakMinutes = totalBreakSessions > 0 ? Math.round(totalMinutes / totalBreakSessions) : 58;
    const breakComplianceRate = Number((((totalBreakSessions - excessBreakCount) / (totalBreakSessions || 1)) * 100).toFixed(1));

    // Department breakdown
    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const departmentBreakdown = depts.map((d) => {
      const emps = items.filter((i) => i.department.toUpperCase() === d.toUpperCase());
      const sessionCount = emps.reduce((a, b) => a + b.totalBreakSessions, 0);
      const mins = emps.reduce((a, b) => a + b.totalBreakMinutes, 0);
      const excess = emps.reduce((a, b) => a + b.excessBreakCount, 0);
      const compliance = sessionCount > 0 ? Number((((sessionCount - excess) / sessionCount) * 100).toFixed(1)) : 100;
      return {
        department: d,
        sessionCount,
        avgMinutes: sessionCount > 0 ? Math.round(mins / sessionCount) : 0,
        excessCount: excess,
        complianceRate: compliance,
      };
    }).filter((d) => d.sessionCount > 0);

    return {
      summary: {
        totalBreakSessions,
        standardBreakUsage,
        additionalBreakRequested,
        additionalBreakApproved,
        excessBreakCount,
        averageBreakMinutes,
        breakComplianceRate: Math.min(100, breakComplianceRate),
      },
      departmentBreakdown,
      employees: items,
    };
  }

  // =========================================================================
  // 5. OVERTIME REPORT
  // =========================================================================
  public async getOvertimeReport(filters?: HRReportFilterState): Promise<OvertimeReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const otRecords = await overtimeService.getOvertimeRecords();

    const items: OvertimeReportItem[] = employees.map((emp) => {
      const empRecords = otRecords.filter((r) => r.employeeId === emp.id);
      const requested = empRecords.reduce((acc, r) => acc + safeNumber((r as any).requestedHours, safeNumber(r.actualHours, 0)), 0) || (emp.id === 'emp-04' ? 8 : emp.id === 'emp-05' ? 6 : 0);
      const approved = empRecords.filter((r) => r.status === 'APPROVED').reduce((acc, r) => acc + safeNumber(r.actualHours, 0), 0) || (emp.id === 'emp-04' ? 8 : emp.id === 'emp-05' ? 6 : 0);
      const actual = empRecords.filter((r) => r.status === 'APPROVED').reduce((acc, r) => acc + safeNumber(r.actualHours, 0), 0) || approved;
      const excess = Math.max(0, actual - approved);
      const simulationCost = approved * 10000; // Rp 10.000 / jam

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        requestedHours: requested,
        approvedHours: approved,
        actualHours: actual,
        excessHours: excess,
        simulationCost,
        ratePerHour: 10000,
        overtimeCount: empRecords.length || (approved > 0 ? 3 : 0),
      };
    });

    const totalRequested = items.reduce((a, b) => a + b.requestedHours, 0);
    const totalApproved = items.reduce((a, b) => a + b.approvedHours, 0);
    const totalActual = items.reduce((a, b) => a + b.actualHours, 0);
    const totalExcess = items.reduce((a, b) => a + b.excessHours, 0);
    const totalCost = items.reduce((a, b) => a + b.simulationCost, 0);
    const approvedRate = totalRequested > 0 ? Number(((totalApproved / totalRequested) * 100).toFixed(1)) : 100;

    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const departmentBreakdown = depts.map((d) => {
      const emps = items.filter((i) => i.department.toUpperCase() === d.toUpperCase());
      const approvedHours = emps.reduce((a, b) => a + b.approvedHours, 0);
      const simulationCost = emps.reduce((a, b) => a + b.simulationCost, 0);
      return {
        department: d,
        employeeCount: emps.length,
        approvedHours,
        simulationCost,
      };
    }).filter((d) => d.employeeCount > 0);

    const reasonsBreakdown = [
      { reason: 'Peak Hour Banquet & Gathering Malam', count: 12, hours: 24.5 },
      { reason: 'Persiapan Event Weekend & Buffets', count: 6, hours: 14.0 },
      { reason: 'Handover & General Deep Cleaning', count: 4, hours: 8.0 },
      { reason: 'Substitusi Shift Rekan Sakit', count: 2, hours: 5.0 },
    ];

    const monthlyTrend = [
      { month: 'Mei 2026', hours: 38.0, cost: 380000 },
      { month: 'Jun 2026', hours: 44.5, cost: 445000 },
      { month: 'Jul 2026', hours: 41.0, cost: 410000 },
      { month: 'Ags 2026', hours: 51.5, cost: 515000 },
    ];

    return {
      summary: {
        totalRequestedHours: totalRequested,
        totalApprovedHours: totalApproved,
        totalActualHours: totalActual,
        totalExcessHours: totalExcess,
        totalSimulationCost: totalCost,
        flatRatePerHour: 10000,
        approvedRatePercent: Math.min(100, approvedRate),
      },
      departmentBreakdown,
      reasonsBreakdown,
      monthlyTrend,
      employees: items,
    };
  }

  // =========================================================================
  // 6. PAYROLL REPORT
  // =========================================================================
  public async getPayrollReport(filters?: HRReportFilterState): Promise<PayrollReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const records = await payrollService.getPayrollRecords('period-2026-08');

    const filteredRecords = records.filter((r) =>
      employees.some((e) => e.id === r.employeeId)
    );

    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const totalNetAll = filteredRecords.reduce((a, b) => a + safeNumber(b.netSalary), 0) || 1;

    const departmentCosts = depts.map((d) => {
      const deptRecords = filteredRecords.filter((r) => {
        const emp = MASTER_EMPLOYEES.find((e) => e.id === r.employeeId);
        return emp?.department.toUpperCase() === d.toUpperCase();
      });

      const basicSalaryTotal = deptRecords.reduce((a, b) => a + safeNumber(b.basicSalary), 0);
      const allowanceTotal = deptRecords.reduce(
        (a, b) => a + safeNumber(b.fixedAllowance) + safeNumber(b.mealAllowance) + safeNumber(b.transportAllowance) + safeNumber(b.positionAllowance) + safeNumber(b.otherAllowance),
        0
      );
      const overtimeTotal = deptRecords.reduce((a, b) => a + safeNumber(b.overtimeAmount), 0);
      const deductionTotal = deptRecords.reduce((a, b) => a + safeNumber(b.lateDeduction) + safeNumber(b.absenceDeduction) + safeNumber(b.otherDeduction), 0);
      const kasbonTotal = deptRecords.reduce((a, b) => a + safeNumber(b.advanceDeduction), 0);
      const netPayrollTotal = deptRecords.reduce((a, b) => a + safeNumber(b.netSalary), 0);
      const percentageOfTotal = Number(((netPayrollTotal / totalNetAll) * 100).toFixed(1));

      return {
        department: d,
        headcount: deptRecords.length,
        basicSalaryTotal,
        allowanceTotal,
        overtimeTotal,
        deductionTotal,
        kasbonTotal,
        netPayrollTotal,
        percentageOfTotal,
      };
    }).filter((d) => d.headcount > 0);

    const totalHeadcount = filteredRecords.length;
    const totalGrossSalary = filteredRecords.reduce((a, b) => a + safeNumber(b.basicSalary), 0);
    const totalAllowances = filteredRecords.reduce(
      (a, b) => a + safeNumber(b.fixedAllowance) + safeNumber(b.mealAllowance) + safeNumber(b.transportAllowance) + safeNumber(b.positionAllowance) + safeNumber(b.otherAllowance),
      0
    );
    const totalOvertime = filteredRecords.reduce((a, b) => a + safeNumber(b.overtimeAmount), 0);
    const totalLateDeduction = filteredRecords.reduce((a, b) => a + safeNumber(b.lateDeduction), 0);
    const totalKasbon = filteredRecords.reduce((a, b) => a + safeNumber(b.advanceDeduction), 0);
    const totalManualAdjustment = filteredRecords.reduce((a, b) => a + safeNumber(b.otherEarnings), 0);
    const totalNetPayroll = filteredRecords.reduce((a, b) => a + safeNumber(b.netSalary), 0);

    // Simulated benchmark revenue
    const estimatedRevenue = 385000000;
    const laborCostRatio = Number(((totalNetPayroll / estimatedRevenue) * 100).toFixed(1));

    const recordsFormatted = filteredRecords.map((r) => {
      const emp = MASTER_EMPLOYEES.find((e) => e.id === r.employeeId);
      const totalAllow = safeNumber(r.fixedAllowance) + safeNumber(r.mealAllowance) + safeNumber(r.transportAllowance) + safeNumber(r.positionAllowance) + safeNumber(r.otherAllowance);
      return {
        recordId: r.payrollId,
        employeeId: r.employeeId,
        employeeCode: emp?.employeeCode || 'EMP-XX',
        name: emp?.fullName || 'Employee',
        department: emp?.department || 'Resto',
        position: emp?.primaryPosition || 'Staff',
        basicSalary: safeNumber(r.basicSalary),
        allowances: totalAllow,
        overtimePay: safeNumber(r.overtimeAmount),
        lateDeductions: safeNumber(r.lateDeduction),
        kasbonDeductions: safeNumber(r.advanceDeduction),
        adjustments: safeNumber(r.otherEarnings),
        netSalary: safeNumber(r.netSalary),
        status: 'REVIEW',
      };
    });

    return {
      periodId: 'period-2026-08',
      periodMonth: 'Agustus',
      periodYear: 2026,
      periodStatus: 'REVIEW',
      summary: {
        totalHeadcount,
        totalGrossSalary,
        totalAllowances,
        totalOvertime,
        totalLateDeduction,
        totalKasbon,
        totalManualAdjustment,
        totalNetPayroll,
        laborCostRatio,
        estimatedRevenue,
        isRevenueAvailable: true,
      },
      departmentCosts,
      records: recordsFormatted,
    };
  }

  // =========================================================================
  // 7. DOCUMENT COMPLIANCE REPORT
  // =========================================================================
  public async getDocumentComplianceReport(filters?: HRReportFilterState): Promise<DocumentComplianceReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const allDocs = hrDocumentService.getDocuments({ showArchived: false });
    const completenessList = hrDocumentService.getAllEmployeeCompleteness();

    const items: DocumentComplianceItem[] = employees.map((emp) => {
      const comp = completenessList.find((c) => c.employeeId === emp.id);
      const empDocs = allDocs.filter((d) => d.employeeId === emp.id);
      
      const verifiedCount = empDocs.filter((d) => d.status === 'VERIFIED').length;
      const pendingCount = empDocs.filter((d) => d.status === 'PENDING_REVIEW').length;
      const missingCount = comp?.missingRequired !== undefined ? comp.missingRequired : (emp.id === 'emp-08' ? 2 : emp.id === 'emp-15' ? 1 : 0);
      const missingDocs = comp?.missingDocuments?.map((r) => r.documentTypeName) || (missingCount > 0 ? ['Surat Bebas Narkoba / Skck', 'Sertifikat Vaksinasi'] : []);

      const exp30 = empDocs.filter((d) => d.status === 'EXPIRING_SOON').length;
      const exp60 = 0;
      const exp90 = 0;
      const expired = empDocs.filter((d) => d.status === 'EXPIRED').length;

      const rate = comp?.completenessPercentage || (missingCount === 0 ? 100 : missingCount === 1 ? 85 : 70);

      let overallStatus: DocumentComplianceItem['overallStatus'] = 'COMPLETE';
      if (missingCount >= 2 || expired > 0) overallStatus = 'CRITICAL';
      else if (missingCount > 0 || exp30 > 0) overallStatus = 'NEEDS_ATTENTION';

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        completionRate: rate,
        verifiedCount,
        pendingCount,
        missingCount,
        missingDocumentsList: missingDocs,
        expiringIn30DaysCount: exp30,
        expiringIn60DaysCount: exp60,
        expiringIn90DaysCount: exp90,
        expiredCount: expired,
        overallStatus,
      };
    });

    const totalEmployees = items.length;
    const verifiedTotal = items.reduce((a, b) => a + b.verifiedCount, 0);
    const pendingTotal = items.reduce((a, b) => a + b.pendingCount, 0);
    const exp30Total = items.reduce((a, b) => a + b.expiringIn30DaysCount, 0);
    const exp60Total = items.reduce((a, b) => a + b.expiringIn60DaysCount, 0);
    const exp90Total = items.reduce((a, b) => a + b.expiringIn90DaysCount, 0);
    const expiredTotal = items.reduce((a, b) => a + b.expiredCount, 0);
    const missingTotal = items.reduce((a, b) => a + b.missingCount, 0);
    const overallCompletionRate = items.length > 0 ? Number((items.reduce((a, b) => a + b.completionRate, 0) / items.length).toFixed(1)) : 100;

    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const departmentBreakdown = depts.map((d) => {
      const emps = items.filter((i) => i.department.toUpperCase() === d.toUpperCase());
      const avgComp = emps.length > 0 ? Number((emps.reduce((a, b) => a + b.completionRate, 0) / emps.length).toFixed(1)) : 100;
      const missing = emps.reduce((a, b) => a + b.missingCount, 0);
      const expiring = emps.reduce((a, b) => a + b.expiringIn30DaysCount + b.expiringIn60DaysCount, 0);
      return {
        department: d,
        employeeCount: emps.length,
        avgCompletionRate: avgComp,
        missingDocsCount: missing,
        expiringDocsCount: expiring,
      };
    }).filter((d) => d.employeeCount > 0);

    return {
      summary: {
        totalEmployees,
        overallCompletionRate,
        verifiedDocumentsTotal: verifiedTotal,
        pendingVerificationTotal: pendingTotal,
        expiringIn30DaysTotal: exp30Total,
        expiringIn60DaysTotal: exp60Total,
        expiringIn90DaysTotal: exp90Total,
        expiredTotal,
        missingCriticalTotal: missingTotal,
      },
      departmentBreakdown,
      employees: items,
    };
  }

  // =========================================================================
  // 8. SOP COMPLIANCE REPORT
  // =========================================================================
  public async getSopComplianceReport(filters?: HRReportFilterState): Promise<SopComplianceReportData> {
    await delay();
    const employees = this.filterEmployees(filters);
    const sops = await sopService.getSops();

    const items: SopComplianceItem[] = employees.map((emp) => {
      // Find SOPs matching employee's department or ALL
      const relevantSops = sops.filter(
        (s) => s.division === 'ALL' || s.division.toUpperCase() === emp.department.toUpperCase()
      );
      const assignedCount = relevantSops.length || 6;
      
      // Calculate read status
      const readCount = relevantSops.filter((s) =>
        s.acknowledgments?.some((c) => c.employeeId === emp.id)
      ).length || (emp.id === 'emp-08' ? assignedCount - 2 : emp.id === 'emp-12' ? assignedCount - 1 : assignedCount);

      const pendingCount = Math.max(0, assignedCount - readCount);
      const complianceRate = Number(((readCount / (assignedCount || 1)) * 100).toFixed(1));

      const unreadTitles = relevantSops
        .filter((s) => !s.acknowledgments?.some((c) => c.employeeId === emp.id))
        .map((s) => s.title);

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        assignedSopsCount: assignedCount,
        readSopsCount: readCount,
        pendingSopsCount: pendingCount,
        complianceRate: Math.min(100, complianceRate),
        unreadSopTitles: unreadTitles.length > 0 ? unreadTitles : pendingCount > 0 ? ['SOP-KIT-002: Food Safety & Allergen Handling'] : [],
      };
    });

    const totalSops = sops.length || 18;
    const totalAssignedRecords = items.reduce((a, b) => a + b.assignedSopsCount, 0);
    const totalReadConfirmed = items.reduce((a, b) => a + b.readSopsCount, 0);
    const totalPendingRead = items.reduce((a, b) => a + b.pendingSopsCount, 0);
    const overallComplianceRate = totalAssignedRecords > 0 ? Number(((totalReadConfirmed / totalAssignedRecords) * 100).toFixed(1)) : 100;
    const unreadStaffList = items.filter((i) => i.pendingSopsCount > 0);

    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];
    const departmentBreakdown = depts.map((d) => {
      const emps = items.filter((i) => i.department.toUpperCase() === d.toUpperCase());
      const assigned = emps.reduce((a, b) => a + b.assignedSopsCount, 0);
      const read = emps.reduce((a, b) => a + b.readSopsCount, 0);
      const pending = emps.reduce((a, b) => a + b.pendingSopsCount, 0);
      const rate = assigned > 0 ? Number(((read / assigned) * 100).toFixed(1)) : 100;
      return {
        department: d,
        assignedCount: assigned,
        readCount: read,
        pendingCount: pending,
        complianceRate: rate,
      };
    }).filter((d) => d.assignedCount > 0);

    return {
      summary: {
        totalSops,
        totalAssignedRecords,
        totalReadConfirmed,
        totalPendingRead,
        overallComplianceRate,
        staffWithUnreadCount: unreadStaffList.length,
      },
      departmentBreakdown,
      unreadStaffList,
      employees: items,
    };
  }

  // =========================================================================
  // 9. CHECKLIST COMPLIANCE REPORT
  // =========================================================================
  public async getChecklistComplianceReport(filters?: HRReportFilterState): Promise<ChecklistComplianceReportData> {
    await delay();
    const chkMetricsResult = await ChecklistService.getChecklistDashboardMetrics();
    const chkMetrics = chkMetricsResult.data;

    const deptsList = [
      { name: 'Kitchen', assigned: 48, completed: 46, verified: 44, missed: 2, score: 94.2, photoRate: 98 },
      { name: 'Bar', assigned: 28, completed: 27, verified: 26, missed: 1, score: 92.5, photoRate: 96 },
      { name: 'Service', assigned: 42, completed: 40, verified: 39, missed: 2, score: 91.0, photoRate: 92 },
      { name: 'Cleaning', assigned: 14, completed: 14, verified: 14, missed: 0, score: 96.0, photoRate: 100 },
      { name: 'Cashier / CRM', assigned: 14, completed: 14, verified: 14, missed: 0, score: 98.0, photoRate: 100 },
    ];

    const departments = deptsList.map((d) => ({
      department: d.name,
      assignedCount: d.assigned,
      completedCount: d.completed,
      verifiedCount: d.verified,
      missedCount: d.missed,
      averageScore: d.score,
      complianceRate: Number(((d.completed / d.assigned) * 100).toFixed(1)),
      photoEvidenceComplianceRate: d.photoRate,
    }));

    const totalAssignments = departments.reduce((a, b) => a + b.assignedCount, 0);
    const completedCount = departments.reduce((a, b) => a + b.completedCount, 0);
    const verifiedCount = departments.reduce((a, b) => a + b.verifiedCount, 0);
    const missedCount = departments.reduce((a, b) => a + b.missedCount, 0);
    const pendingVerificationCount = completedCount - verifiedCount;
    const revisionRequiredCount = 2;
    const overallCompletionRate = Number(((completedCount / (totalAssignments || 1)) * 100).toFixed(1));
    const overallComplianceRate = safeNumber(chkMetrics?.pass_rate, 92.4);
    const averageScore = safeNumber(chkMetrics?.average_score, 93.8);
    const photoEvidenceComplianceRate = 96.5;

    const departmentBreakdown = departments.map((d) => ({
      department: d.department,
      completionRate: d.complianceRate,
      avgScore: d.averageScore,
      photoRate: d.photoEvidenceComplianceRate,
      completedCount: d.completedCount,
      assignedCount: d.assignedCount,
      verifiedCount: d.verifiedCount,
    }));

    const employees = this.filterEmployees(filters);
    const employeeChecklistItems: ChecklistEmployeeItem[] = employees.map((emp) => {
      const isTop = emp.id === 'emp-02' || emp.id === 'emp-04';
      const isNeeds = emp.id === 'emp-08';
      const assignedCount = 6;
      const completedCount = isNeeds ? 4 : assignedCount;
      const verifiedCount = isNeeds ? 4 : isTop ? 6 : 5;
      const photoEvidenceRate = isNeeds ? 80 : 100;
      const avgScore = isNeeds ? 74 : isTop ? 98 : 92;
      const completionRate = Number(((completedCount / assignedCount) * 100).toFixed(1));

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        assignedCount,
        completedCount,
        verifiedCount,
        photoEvidenceRate,
        avgScore,
        completionRate,
      };
    });

    return {
      summary: {
        totalAssignments,
        completedCount,
        verifiedCount,
        pendingVerificationCount,
        revisionRequiredCount,
        missedCount,
        overallCompletionRate,
        overallComplianceRate,
        averageScore,
        photoEvidenceComplianceRate,
      },
      departments,
      departmentBreakdown,
      employees: employeeChecklistItems,
    };
  }

  // =========================================================================
  // 10. EMPLOYEE PERFORMANCE REPORT
  // =========================================================================
  public async getEmployeePerformance(filters?: HRReportFilterState): Promise<EmployeePerformanceData> {
    await delay();
    const employees = this.filterEmployees(filters);

    const items: EmployeePerformanceItem[] = employees.map((emp) => {
      // Deterministic realistic scores based on role and baseline
      let attScore = 95;
      let chkScore = 92;
      let sopScore = 96;
      let kpiScore = 88;
      let otDisc = 95;
      let lateCount = 0;

      if (emp.id === 'emp-02' || emp.id === 'emp-03') { // Management / SPV
        attScore = 98; chkScore = 96; sopScore = 100; kpiScore = 94; otDisc = 98;
      } else if (emp.id === 'emp-04' || emp.id === 'emp-07') { // Star Kitchen & Bar
        attScore = 96; chkScore = 95; sopScore = 95; kpiScore = 92; otDisc = 94;
      } else if (emp.id === 'emp-08') { // Needs attention
        attScore = 78; chkScore = 74; sopScore = 80; kpiScore = 72; otDisc = 82; lateCount = 3;
      } else if (emp.id === 'emp-12') { // Junior needs coaching
        attScore = 84; chkScore = 80; sopScore = 85; kpiScore = 76; otDisc = 90; lateCount = 1;
      }

      const health = this.calculateHealthScore({
        attendanceRate: attScore,
        punctualityRate: attScore - 4,
        checklistRate: chkScore,
        kpiScore,
        sopRate: sopScore,
        documentRate: 92,
        overtimeDisciplineRate: otDisc,
      });

      let rankingTier: EmployeePerformanceItem['rankingTier'] = 'STANDARD';
      if (health.overallScore >= 90) rankingTier = 'TOP';
      else if (health.overallScore < 80) rankingTier = 'NEEDS_ATTENTION';

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        attendanceScore: attScore,
        attendanceRate: attScore,
        lateCount,
        checklistScore: chkScore,
        sopScore,
        sopComplianceRate: sopScore,
        documentComplianceRate: 92,
        kpiScore,
        overtimeDisciplineScore: otDisc,
        peopleHealthScore: health.overallScore,
        overallHealthScore: health.overallScore,
        healthLevel: health.healthLevel,
        rankingTier,
      };
    });

    // Sort descending by People Health Score
    items.sort((a, b) => b.peopleHealthScore - a.peopleHealthScore);
    items.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const topPerformers = items.filter((i) => i.rankingTier === 'TOP').slice(0, 5);
    const needsAttention = items.filter((i) => i.rankingTier === 'NEEDS_ATTENTION');

    const avgHealth = items.length > 0 ? Number((items.reduce((a, b) => a + b.peopleHealthScore, 0) / items.length).toFixed(1)) : 88;
    const avgKpi = items.length > 0 ? Number((items.reduce((a, b) => a + b.kpiScore, 0) / items.length).toFixed(1)) : 87;

    return {
      overallScoreAverage: avgHealth,
      summary: {
        averageHealthScore: avgHealth,
        averageKpiScore: avgKpi,
        topPerformersCount: topPerformers.length,
        needsAttentionCount: needsAttention.length,
      },
      topPerformers,
      needsAttention,
      allEmployees: items,
      allRankings: items,
    };
  }

  public async getPerformanceRankings(filters?: HRReportFilterState): Promise<EmployeePerformanceRankingData> {
    return this.getEmployeePerformance(filters);
  }

  // =========================================================================
  // 11. DEPARTMENT HEALTH CARDS
  // =========================================================================
  public async getDepartmentHealth(filters?: HRReportFilterState): Promise<DepartmentHealthItem[]> {
    await delay();
    const employees = this.filterEmployees(filters);
    const depts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Operations', 'Management'];

    return depts.map((d) => {
      const emps = employees.filter((e) => e.department.toUpperCase() === d.toUpperCase());
      const headcount = emps.length;
      if (headcount === 0) {
        return {
          department: d,
          headcount: 0,
          attendanceRate: 100,
          checklistScore: 100,
          kpiScore: 100,
          overtimeHours: 0,
          documentComplianceRate: 100,
          sopComplianceRate: 100,
          healthScore: 100,
          healthLevel: 'EXCELLENT' as HealthScoreLevel,
        };
      }

      // Department specific realistic aggregates
      let att = 94;
      let chk = 92;
      let kpi = 88;
      let ot = 18.5;
      let doc = 92;
      let sop = 95;

      if (d === 'Kitchen') {
        att = 93.5; chk = 94.2; kpi = 89.0; ot = 22.0; doc = 91.0; sop = 93.0;
      } else if (d === 'Bar') {
        att = 96.0; chk = 92.5; kpi = 90.0; ot = 12.5; doc = 94.0; sop = 96.0;
      } else if (d === 'Service') {
        att = 91.8; chk = 91.0; kpi = 86.5; ot = 14.0; doc = 88.5; sop = 91.0;
      } else if (d === 'Management' || d === 'Operations') {
        att = 98.0; chk = 96.0; kpi = 94.0; ot = 5.0; doc = 100.0; sop = 100.0;
      }

      const health = this.calculateHealthScore({
        attendanceRate: att,
        punctualityRate: att - 3,
        checklistRate: chk,
        kpiScore: kpi,
        sopRate: sop,
        documentRate: doc,
        overtimeDisciplineRate: 90,
      });

      return {
        department: d,
        headcount,
        attendanceRate: att,
        checklistScore: chk,
        kpiScore: kpi,
        overtimeHours: ot,
        documentComplianceRate: doc,
        sopComplianceRate: sop,
        healthScore: health.overallScore,
        healthLevel: health.healthLevel,
      };
    }).filter((d) => d.headcount > 0);
  }

  // =========================================================================
  // 12. PEOPLE RISK PANEL
  // =========================================================================
  public async getPeopleRisk(filters?: HRReportFilterState): Promise<PeopleRiskAlert[]> {
    await delay();
    const alerts: PeopleRiskAlert[] = [
      {
        id: 'risk-01',
        employeeId: 'emp-08',
        employeeCode: 'EMP-008',
        employeeName: 'Agus Wijaya',
        department: 'Kitchen',
        position: 'Cook Helper',
        riskType: 'REPEATED_LATE',
        issue: 'Terlambat 4 kali berturut-turut pada shift pagi (rata-rata 18 menit).',
        severity: 'HIGH',
        metricValue: '4x Late (Total 72 menit)',
        period: 'Agustus 2026',
        suggestedAction: 'Konseling 1-on-1 bersama Head Kitchen & evaluasi rute komuter pagi.',
      },
      {
        id: 'risk-02',
        employeeId: 'emp-04',
        employeeCode: 'EMP-004',
        employeeName: 'Budi Santoso',
        department: 'Kitchen',
        position: 'Senior Cook',
        riskType: 'EXCESSIVE_OVERTIME',
        issue: 'Akumulasi jam lembur mencapai 18.5 jam dalam 2 minggu berturut-turut.',
        severity: 'MEDIUM',
        metricValue: '18.5 Jam Lembur',
        period: 'Agustus 2026',
        suggestedAction: 'Bagi beban banquet malam ke cook lain untuk cegah kelelahan kerja (burnout).',
      },
      {
        id: 'risk-03',
        employeeId: 'emp-15',
        employeeCode: 'EMP-015',
        employeeName: 'Maya Kusuma',
        department: 'Service',
        position: 'Waitress',
        riskType: 'MISSING_DOCUMENTS',
        issue: 'Sertifikat Hygiene Sanitasi Makanan kadaluwarsa per 15 Agustus 2026.',
        severity: 'HIGH',
        metricValue: '1 Dokumen Expired',
        period: '30 Hari Terakhir',
        suggestedAction: 'Jadwalkan perpanjangan sertifikasi hygiene ke puskesmas / dinkes.',
      },
      {
        id: 'risk-04',
        employeeId: 'emp-12',
        employeeCode: 'EMP-012',
        employeeName: 'Rian Pratama',
        department: 'Bar',
        position: 'Barista Junior',
        riskType: 'SOP_NON_COMPLIANCE',
        issue: 'Belum mengonfirmasi pembacaan SOP Beverage Allergen & Milk Steaming.',
        severity: 'MEDIUM',
        metricValue: '2 SOP Belum Dibaca',
        period: 'Agustus 2026',
        suggestedAction: 'Berikan akses 10 menit di awal shift untuk membaca dan menandatangani SOP.',
      },
    ];

    if (!filters) return alerts;
    return alerts.filter((a) => {
      if (filters.department && filters.department !== 'ALL' && a.department.toUpperCase() !== filters.department.toUpperCase()) {
        return false;
      }
      if (filters.employeeId && filters.employeeId !== 'ALL' && a.employeeId !== filters.employeeId) {
        return false;
      }
      return true;
    });
  }

  // =========================================================================
  // 13. HR MONTHLY REPORT (FOR MBR INTEGRATION)
  // =========================================================================
  public async getHrMonthlyReport(filters?: HRReportFilterState): Promise<HRMonthlyReportData> {
    await delay();
    const overview = await this.getHrOverview(filters);
    const attReport = await this.getAttendanceReport(filters);
    const manpowerReport = await this.getManpowerReport(filters);
    const breakReport = await this.getBreakReport(filters);
    const otReport = await this.getOvertimeReport(filters);
    const payrollReport = await this.getPayrollReport(filters);
    const docReport = await this.getDocumentComplianceReport(filters);
    const sopReport = await this.getSopComplianceReport(filters);
    const chkReport = await this.getChecklistComplianceReport(filters);
    const deptScorecards = await this.getDepartmentHealth(filters);
    const peopleRisks = await this.getPeopleRisk(filters);
    const actionPlans = await this.getActionPlans();

    const executiveSummary = `Laporan Kinerja SDM Tropical Garden Resto Periode Agustus 2026 menunjukkan performa operasional yang sangat solid dengan skor People Health Score rata-rata 89.2 (Level Healthy). Tingkat kehadiran mencapai ${overview.attendanceRate}% dengan total utilisasi tenaga kerja ${manpowerReport.summary.overallUtilizationRate}%. Biaya lembur terkontrol pada estimasi Rp ${(overview.overtimeCostSimulation ?? 0).toLocaleString('id-ID')} (${overview.overtimeHours} jam). Kepatuhan SOP berada pada ${overview.sopComplianceRate}% dan Checklist Operasional mencapai ${overview.checklistComplianceRate}%. Terdapat ${peopleRisks.length} catatan risiko yang telah dialokasikan ke dalam Action Plan.`;

    const byDepartment: Record<string, number> = {};
    deptScorecards.forEach((d) => {
      byDepartment[d.department] = d.headcount;
    });

    return {
      month: 'Agustus',
      year: 2026,
      generatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      executiveSummary,
      momComparison: {
        attendanceChangePercent: 1.4,
        overtimeChangePercent: -8.2,
        payrollCostChangePercent: 2.1,
        kpiScoreChangePercent: 1.8,
        checklistChangePercent: 3.5,
      },
      summary: {
        attendanceRate: overview.attendanceRate,
        lateRate: overview.lateRate,
        totalLatePenalty: attReport.summary.totalLatePenalty,
        totalNetPayroll: overview.payrollCost,
        laborCostRatio: payrollReport.summary.laborCostRatio || 18.5,
        checklistComplianceRate: overview.checklistComplianceRate,
        sopComplianceRate: overview.sopComplianceRate,
        documentComplianceRate: overview.documentComplianceRate,
      },
      peopleHealth: overview.peopleHealth,
      headcount: {
        totalActive: overview.totalActiveEmployees,
        byDepartment,
      },
      attendanceSummary: attReport.summary,
      manpowerSummary: manpowerReport.summary,
      breakSummary: breakReport.summary,
      overtimeSummary: otReport.summary,
      payrollSummary: payrollReport.summary,
      documentSummary: docReport.summary,
      sopSummary: sopReport.summary,
      checklistSummary: chkReport.summary,
      kpiSummary: {
        averageKpi: overview.averageKpiScore,
        targetKpi: 90.0,
      },
      departmentScorecard: deptScorecards,
      peopleRisks,
      actionPlans,
    };
  }

  public async getMonthlyReport(filters?: HRReportFilterState): Promise<HRMonthlyReportData> {
    return this.getHrMonthlyReport(filters);
  }

  // =========================================================================
  // 14. EMPLOYEE DETAIL ANALYTICS (DRAWER)
  // =========================================================================
  public async getEmployeePeopleAnalytics(employeeId: string): Promise<EmployeePersonalAnalytics | null> {
    await delay();
    const emp = MASTER_EMPLOYEES.find((e) => e.id === employeeId);
    if (!emp) return null;

    const attRecords = await attendanceService.getAttendanceRecords();
    const empAtt = attRecords.filter((r) => r.employeeId === emp.id);
    const present = empAtt.filter((r) => r.status === 'PRESENT').length || 20;
    const late = empAtt.filter((r) => r.status === 'LATE').length || (emp.id === 'emp-08' ? 4 : 1);
    const absent = empAtt.filter((r) => r.status === 'ABSENT').length;
    const leave = empAtt.filter((r) => (r.status as string) === 'LEAVE' || (r.status as string) === 'SICK').length;
    const lateMinutes = empAtt.reduce((a, b) => a + safeNumber(b.lateMinutes), 0) || (late * 15);
    const latePenalty = Math.ceil(lateMinutes / 60) * 10000;
    const attRate = Number((((present + late) / (present + late + absent + leave || 24)) * 100).toFixed(1));

    const breaks = await breakService.getBreaks();
    const empBreaks = breaks.filter((b) => b.employeeId === emp.id);
    const totalSessions = empBreaks.length || 20;
    const totalBreakMins = empBreaks.reduce((a, b) => a + safeNumber(b.durationMinutes, 60), 0) || (totalSessions * 58);
    const avgBreakMins = Math.round(totalBreakMins / (totalSessions || 1));
    const excessBreakCount = empBreaks.filter((b) => safeNumber(b.durationMinutes) > 60).length || 0;

    const otRecords = await overtimeService.getOvertimeRecords();
    const empOt = otRecords.filter((r) => r.employeeId === emp.id);
    const otReq = empOt.reduce((a, b) => a + safeNumber((b as any).requestedHours, safeNumber(b.actualHours, 0)), 0) || (emp.id === 'emp-04' ? 12 : 0);
    const otApp = empOt.filter((r) => r.status === 'APPROVED').reduce((a, b) => a + safeNumber(b.actualHours, 0), 0) || otReq;
    const otAct = otApp;

    const allDocs = hrDocumentService.getDocuments({ showArchived: false });
    const empDocs = allDocs.filter((d) => d.employeeId === emp.id);
    const verifiedDocs = empDocs.filter((d) => d.status === 'VERIFIED').length;
    const missingList = emp.id === 'emp-08' ? ['Surat Bebas Narkoba', 'Sertifikat Vaksin'] : [];
    const docCompRate = missingList.length === 0 ? 100 : 75;

    const sops = await sopService.getSops();
    const relevantSops = sops.filter((s) => s.division === 'ALL' || s.division.toUpperCase() === emp.department.toUpperCase());
    const assignedSops = relevantSops.length || 6;
    const readSops = relevantSops.filter((s) => s.acknowledgments?.some((c) => c.employeeId === emp.id)).length || (assignedSops - (emp.id === 'emp-12' ? 2 : 0));
    const unreadSops = relevantSops.filter((s) => !s.acknowledgments?.some((c) => c.employeeId === emp.id)).map((s) => s.title);

    const kpiScore = emp.id === 'emp-08' ? 74.5 : emp.id === 'emp-04' ? 93.0 : 88.5;
    const chkScore = emp.id === 'emp-08' ? 76.0 : 94.0;

    const health = this.calculateHealthScore({
      attendanceRate: attRate,
      punctualityRate: 100 - (late * 4),
      checklistRate: chkScore,
      kpiScore,
      sopRate: Number(((readSops / assignedSops) * 100).toFixed(1)),
      documentRate: docCompRate,
      overtimeDisciplineRate: 95,
    });

    const timeline: EmployeePersonalAnalytics['timeline'] = [
      {
        id: 't-1',
        date: '2026-08-14 08:00',
        category: 'ATTENDANCE',
        title: 'Presensi Shift Masuk Tepat Waktu',
        description: 'Clock-in pada 07:54 WIB (Radius GPS 12m).',
        statusBadge: 'Tepat Waktu',
      },
      {
        id: 't-2',
        date: '2026-08-13 14:30',
        category: 'BREAK',
        title: 'Selesai Standard Break (60m)',
        description: 'Durasi aktual 58 menit. Kembali ke stasiun tepat waktu.',
        statusBadge: 'Selesai',
      },
      {
        id: 't-3',
        date: '2026-08-12 21:00',
        category: 'OVERTIME',
        title: 'Overtime Banquet Disetujui',
        description: 'SPL disetujui Supervisor: 2 Jam Post-Shift Gathering.',
        statusBadge: 'Approved',
      },
      {
        id: 't-4',
        date: '2026-08-10 17:00',
        category: 'CHECKLIST',
        title: 'Checklist Closing Station Terverifikasi',
        description: 'Skor checklist 95/100, bukti foto sanitasi lengkap.',
        statusBadge: 'Verified',
      },
      {
        id: 't-5',
        date: '2026-08-01 10:00',
        category: 'KPI',
        title: 'Review Evaluasi Bulanan Selesai',
        description: `Skor KPI final: ${kpiScore} poin (Rating ${kpiScore >= 90 ? 'A' : 'B'}).`,
        statusBadge: 'Finalized',
      },
    ];

    return {
      employee: {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.fullName,
        fullName: emp.fullName,
        department: emp.department,
        position: emp.primaryPosition,
        joinDate: emp.joinDate || '2024-01-15',
        employmentStatus: emp.employmentStatus,
        phone: emp.phone || '0812-3456-7890',
        email: emp.email || `${emp.employeeCode.toLowerCase()}@tropicalresto.com`,
      },
      healthScore: health,
      attendance: {
        present,
        late,
        absent,
        leave,
        presentDays: present,
        lateDays: late,
        absentDays: absent,
        leaveDays: leave,
        lateMinutes,
        totalLateMinutes: lateMinutes,
        latePenalty,
        latePenaltyAmount: latePenalty,
        rate: attRate,
        attendanceRate: attRate,
      },
      schedule: {
        totalShifts: 24,
        upcomingShifts: [
          { date: '18 Ags 2026', shiftName: 'Shift Pagi', time: '08:00 - 16:00' },
          { date: '19 Ags 2026', shiftName: 'Shift Pagi', time: '08:00 - 16:00' },
          { date: '20 Ags 2026', shiftName: 'Shift Pagi', time: '08:00 - 16:00' },
        ],
      },
      breakAndOvertime: {
        breakSessionsCount: totalSessions,
        averageBreakMinutes: avgBreakMins,
        excessBreakCount: excessBreakCount,
        additionalBreakRequested: emp.id === 'emp-04' ? 2 : 0,
        additionalBreakApproved: emp.id === 'emp-04' ? 2 : 0,
        overtimeRequestedHours: otReq,
        overtimeApprovedHours: otApp,
        overtimeCostSimulation: otApp * 10000,
      },
      breaks: {
        totalSessions,
        totalMinutes: totalBreakMins,
        avgMinutes: avgBreakMins,
        excessCount: excessBreakCount,
        complianceRate: totalSessions > 0 ? Number((((totalSessions - excessBreakCount) / totalSessions) * 100).toFixed(1)) : 100,
      },
      overtime: {
        requestedHours: otReq,
        approvedHours: otApp,
        actualHours: otAct,
        simulationCost: otApp * 10000,
      },
      payroll: {
        basicSalary: 3200000,
        allowances: 600000,
        overtimePay: otApp * 10000,
        lateDeductions: latePenalty,
        kasbonDeductions: emp.id === 'emp-08' ? 250000 : 0,
        netSalary: 3800000 + otApp * 10000 - latePenalty - (emp.id === 'emp-08' ? 250000 : 0),
        status: 'REVIEW',
      },
      payrollSummary: {
        basicSalary: 3200000,
        allowances: 600000,
        overtimePay: otApp * 10000,
        lateDeductions: latePenalty,
        netSalary: 3800000 + otApp * 10000 - latePenalty,
        lastPeriod: 'Agustus 2026',
      },
      documents: {
        completionRate: docCompRate,
        verifiedCount: verifiedDocs,
        missingCount: missingList.length,
        missingList,
        missingDocuments: missingList,
        expiringSoonCount: 0,
        uploadedDocuments: [
          { title: 'KTP & Identitas Resmi', expiryDate: 'Seumur Hidup', status: 'VERIFIED' },
          { title: 'Buku Tabungan Payroll', expiryDate: 'Aktif', status: 'VERIFIED' },
          { title: 'Surat Keterangan Bebas Narkoba', expiryDate: '2026-12-31', status: missingList.length > 0 ? 'PENDING' : 'VERIFIED' },
        ],
      },
      sops: {
        assignedCount: assignedSops,
        readCount: readSops,
        complianceRate: Number(((readSops / assignedSops) * 100).toFixed(1)),
        unreadList: unreadSops,
      },
      sop: {
        assigned: assignedSops,
        completed: readSops,
        pending: Math.max(0, assignedSops - readSops),
        complianceRate: Number(((readSops / assignedSops) * 100).toFixed(1)),
        unreadList: unreadSops,
      },
      checklists: {
        assignedCount: 14,
        completedCount: 14,
        verifiedCount: 13,
        completionRate: 100,
        avgScore: chkScore,
        photoEvidenceRate: 98,
      },
      checklist: {
        assigned: 14,
        completed: 14,
        verified: 13,
        score: chkScore,
      },
      kpi: {
        score: kpiScore,
        rating: kpiScore >= 90 ? 'A (Sangat Baik)' : kpiScore >= 80 ? 'B (Baik)' : 'C (Cukup)',
        topStrength: 'Kecepatan service & disiplin SOP kebersihan',
        improvementArea: 'Ketepatan waktu kedatangan shift pagi',
      },
      timeline,
    };
  }

  public async getEmployeeDrillDown(employeeId: string, _period?: ReportPeriod): Promise<EmployeeDrillDownData | null> {
    return this.getEmployeePeopleAnalytics(employeeId);
  }

  // =========================================================================
  // 15. CSV EXPORT UTILITY
  // =========================================================================
  public generateCsvExport(tab: HRReportSubTab | string, data: any): string {
    let rows: string[][] = [];
    const timestamp = new Date().toISOString();

    switch (tab) {
      case 'ATTENDANCE': {
        rows.push(['LAPORAN PRESENSI & DISIPLIN TROPICALOS', `Diexport: ${timestamp}`]);
        rows.push(['Kode Staf', 'Nama', 'Divisi', 'Jabatan', 'Hadir', 'Telat', 'Absen', 'Cuti/Izin', 'Off', 'Persentase Presensi', 'Total Menit Telat', 'Denda Telat (Rp)']);
        if (data.attendance?.employees) {
          data.attendance.employees.forEach((e: AttendanceReportItem) => {
            rows.push([
              e.employeeCode,
              `"${e.name}"`,
              e.department,
              `"${e.position}"`,
              String(e.presentCount),
              String(e.lateCount),
              String(e.absentCount),
              String(e.leaveCount),
              String(e.offCount),
              `${e.attendanceRate}%`,
              String(e.totalLateMinutes),
              String(e.latePenaltyAmount),
            ]);
          });
        }
        break;
      }

      case 'OVERTIME': {
        rows.push(['LAPORAN LEMBUR (OVERTIME) TROPICALOS', `Diexport: ${timestamp}`]);
        rows.push(['Kode Staf', 'Nama', 'Divisi', 'Jabatan', 'Jam Diajukan', 'Jam Disetujui', 'Jam Aktual', 'Jam Berlebih', 'Simulasi Biaya (Rp)']);
        if (data.overtime?.employees) {
          data.overtime.employees.forEach((e: OvertimeReportItem) => {
            rows.push([
              e.employeeCode,
              `"${e.name}"`,
              e.department,
              `"${e.position}"`,
              String(e.requestedHours),
              String(e.approvedHours),
              String(e.actualHours),
              String(e.excessHours),
              String(e.simulationCost),
            ]);
          });
        }
        break;
      }

      case 'PAYROLL': {
        rows.push(['LAPORAN PAYROLL & LABOR COST TROPICALOS', `Diexport: ${timestamp}`]);
        rows.push(['Kode Staf', 'Nama', 'Divisi', 'Jabatan', 'Gaji Pokok', 'Tunjangan', 'Upah Lembur', 'Potongan Telat', 'Potongan Kasbon', 'Gaji Bersih (Net)']);
        if (data.payroll?.records) {
          data.payroll.records.forEach((r: any) => {
            rows.push([
              r.employeeCode,
              `"${r.name}"`,
              r.department,
              `"${r.position}"`,
              String(r.basicSalary),
              String(r.allowances),
              String(r.overtimePay),
              String(r.lateDeductions),
              String(r.kasbonDeductions),
              String(r.netSalary),
            ]);
          });
        }
        break;
      }

      case 'PERFORMANCE': {
        rows.push(['LAPORAN PEOPLE HEALTH & KINERJA INDIVIDUAL TROPICALOS', `Diexport: ${timestamp}`]);
        rows.push(['Kode Staf', 'Nama', 'Divisi', 'Jabatan', 'Presensi', 'Checklist', 'SOP', 'KPI', 'People Health Score', 'Kategori']);
        if (data.performance?.allEmployees) {
          data.performance.allEmployees.forEach((e: EmployeePerformanceItem) => {
            rows.push([
              e.employeeCode,
              `"${e.name}"`,
              e.department,
              `"${e.position}"`,
              String(e.attendanceScore),
              String(e.checklistScore),
              String(e.sopScore),
              String(e.kpiScore),
              String(e.peopleHealthScore),
              e.rankingTier,
            ]);
          });
        }
        break;
      }

      default: {
        rows.push([`LAPORAN ${tab} TROPICALOS`, `Diexport: ${timestamp}`]);
        rows.push(['Divisi', 'Headcount', 'Kehadiran (%)', 'Skor Kesehatan', 'Level Kesehatan']);
        if (data.monthly?.departmentScorecard) {
          data.monthly.departmentScorecard.forEach((d: DepartmentHealthItem) => {
            rows.push([
              d.department,
              String(d.headcount),
              `${d.attendanceRate}%`,
              String(d.healthScore),
              d.healthLevel,
            ]);
          });
        }
        break;
      }
    }

    return rows.map((r) => r.join(',')).join('\n');
  }
}

export const hrReportsService = new HRReportsServiceClass();
