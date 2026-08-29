/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 2C.10 — HR REPORTS & PEOPLE ANALYTICS TYPES
 * Complete type definitions for HR Overview, Attendance, Manpower, Break, Overtime,
 * Payroll, Compliance, KPI, People Health, People Risk, Monthly Reports, and Action Plans.
 */

export type ReportPeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

export interface HRReportFilterState {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  department: string; // 'ALL' or specific
  employeeId?: string; // 'ALL' or specific
  position?: string;
  searchQuery?: string;
}

export type HealthScoreLevel = 'CRITICAL' | 'NEEDS_ATTENTION' | 'HEALTHY' | 'EXCELLENT';

export interface PeopleHealthScoreBreakdown {
  overallScore: number;
  healthLevel: HealthScoreLevel;
  attendanceScore: number; // weight 20%
  disciplineScore: number; // weight 15% (punctuality)
  checklistScore: number;  // weight 15%
  kpiScore: number;        // weight 20%
  sopScore: number;        // weight 10%
  documentScore: number;   // weight 10%
  overtimeScore: number;   // weight 10% (discipline)
  weights: {
    attendance: number;
    discipline: number;
    checklist: number;
    kpi: number;
    sop: number;
    documents: number;
    overtime: number;
  };
}

export interface HROverviewMetrics {
  totalActiveEmployees: number;
  totalHeadcount: number;
  attendanceRate: number;
  lateRate: number;
  overtimeHours: number;
  overtimeCostSimulation: number;
  payrollCost: number;
  averageKpiScore: number;
  documentComplianceRate: number;
  sopComplianceRate: number;
  checklistComplianceRate: number;
  peopleHealth: PeopleHealthScoreBreakdown;
  activeBreaksCount: number;
  pendingApprovalsCount: number;
  departmentHealth?: DepartmentHealthItem[];
  riskAlerts?: PeopleRiskAlert[];
}

export interface AttendanceReportItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  offCount: number;
  attendanceRate: number;
  totalLateMinutes: number;
  latePenaltyAmount: number;
}

export interface AttendanceReportData {
  summary: {
    totalScheduled: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    leaveCount: number;
    offCount: number;
    attendanceRate: number;
    lateRate: number;
    averageLateMinutes: number;
    totalLatePenalty: number;
  };
  dailyTrend: Array<{
    date: string;
    dayLabel: string;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  }>;
  departmentComparison: Array<{
    department: string;
    headcount: number;
    attendanceRate: number;
    lateCount: number;
    lateRate: number;
    avgLateMinutes: number;
    totalPenalty: number;
  }>;
  employees: AttendanceReportItem[];
}

export interface ManpowerDepartmentItem {
  department: string;
  scheduledEmployees: number;
  actualPresentEmployees: number;
  scheduledLaborHours: number;
  actualWorkingHours: number;
  staffingCoverageRate: number;
  laborUtilizationRate: number;
  statusText: string;
}

export interface ManpowerReportData {
  summary: {
    totalScheduledStaff: number;
    totalActualPresent: number;
    totalScheduledHours: number;
    totalActualHours: number;
    overallCoverageRate: number;
    overallUtilizationRate: number;
    isActualAvailable: boolean;
  };
  departments: ManpowerDepartmentItem[];
  shiftDistribution: Array<{
    shiftName: string;
    scheduledCount: number;
    actualCount: number;
    coverageRate: number;
  }>;
}

export interface BreakReportItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  totalBreakSessions: number;
  totalBreakMinutes: number;
  averageDurationMinutes: number;
  standardBreakUsageCount: number;
  additionalBreakRequested: number;
  additionalBreakApproved: number;
  excessBreakCount: number;
  excessBreakMinutes: number;
  complianceRate: number;
}

export interface BreakReportData {
  summary: {
    totalBreakSessions: number;
    standardBreakUsage: number;
    additionalBreakRequested: number;
    additionalBreakApproved: number;
    excessBreakCount: number;
    averageBreakMinutes: number;
    breakComplianceRate: number;
  };
  departmentBreakdown: Array<{
    department: string;
    sessionCount: number;
    avgMinutes: number;
    excessCount: number;
    complianceRate: number;
  }>;
  employees: BreakReportItem[];
}

export interface OvertimeReportItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  requestedHours: number;
  approvedHours: number;
  actualHours: number;
  excessHours: number;
  simulationCost: number; // approvedHours * 10.000
  ratePerHour: number;
  overtimeCount: number;
}

export interface OvertimeReportData {
  summary: {
    totalRequestedHours: number;
    totalApprovedHours: number;
    totalActualHours: number;
    totalExcessHours: number;
    totalSimulationCost: number;
    flatRatePerHour: number;
    approvedRatePercent: number;
  };
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    approvedHours: number;
    simulationCost: number;
  }>;
  reasonsBreakdown: Array<{
    reason: string;
    count: number;
    hours: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    hours: number;
    cost: number;
  }>;
  employees: OvertimeReportItem[];
}

export interface PayrollDepartmentCostItem {
  department: string;
  headcount: number;
  basicSalaryTotal: number;
  allowanceTotal: number;
  overtimeTotal: number;
  deductionTotal: number;
  kasbonTotal: number;
  netPayrollTotal: number;
  percentageOfTotal: number;
}

export interface PayrollReportData {
  periodId: string;
  periodMonth: string;
  periodYear: number;
  periodStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'LOCKED' | 'PAID';
  summary: {
    totalHeadcount: number;
    totalGrossSalary: number;
    totalAllowances: number;
    totalOvertime: number;
    totalLateDeduction: number;
    totalKasbon: number;
    totalManualAdjustment: number;
    totalNetPayroll: number;
    estimatedRevenue?: number;
    laborCostRatio?: number;
    isRevenueAvailable: boolean;
  };
  departmentCosts: PayrollDepartmentCostItem[];
  records: Array<{
    recordId: string;
    employeeId: string;
    employeeCode: string;
    name: string;
    department: string;
    position: string;
    basicSalary: number;
    allowances: number;
    overtimePay: number;
    lateDeductions: number;
    kasbonDeductions: number;
    adjustments: number;
    netSalary: number;
    status: string;
  }>;
}

export interface DocumentComplianceItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  completionRate: number;
  verifiedCount: number;
  pendingCount: number;
  missingCount: number;
  missingDocumentsList: string[];
  expiringIn30DaysCount: number;
  expiringIn60DaysCount: number;
  expiringIn90DaysCount: number;
  expiredCount: number;
  overallStatus: 'COMPLETE' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

export interface DocumentComplianceReportData {
  summary: {
    totalEmployees: number;
    overallCompletionRate: number;
    verifiedDocumentsTotal: number;
    pendingVerificationTotal: number;
    expiringIn30DaysTotal: number;
    expiringIn60DaysTotal: number;
    expiringIn90DaysTotal: number;
    expiredTotal: number;
    missingCriticalTotal: number;
  };
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    avgCompletionRate: number;
    missingDocsCount: number;
    expiringDocsCount: number;
  }>;
  employees: DocumentComplianceItem[];
}

export interface SopComplianceItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  assignedSopsCount: number;
  readSopsCount: number;
  pendingSopsCount: number;
  complianceRate: number;
  unreadSopTitles: string[];
}

export interface SopComplianceReportData {
  summary: {
    totalSops: number;
    totalAssignedRecords: number;
    totalReadConfirmed: number;
    totalPendingRead: number;
    overallComplianceRate: number;
    staffWithUnreadCount: number;
  };
  departmentBreakdown: Array<{
    department: string;
    assignedCount: number;
    readCount: number;
    pendingCount: number;
    complianceRate: number;
  }>;
  unreadStaffList: SopComplianceItem[];
  employees: SopComplianceItem[];
}

export interface ChecklistComplianceDepartmentItem {
  department: string;
  assignedCount: number;
  completedCount: number;
  verifiedCount: number;
  missedCount: number;
  averageScore: number;
  complianceRate: number;
  photoEvidenceComplianceRate: number;
}

export interface ChecklistEmployeeItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  assignedCount: number;
  completedCount: number;
  verifiedCount: number;
  photoEvidenceRate: number;
  avgScore: number;
  completionRate: number;
}

export interface ChecklistComplianceReportData {
  summary: {
    totalAssignments: number;
    completedCount: number;
    verifiedCount: number;
    pendingVerificationCount: number;
    revisionRequiredCount: number;
    missedCount: number;
    overallCompletionRate: number;
    overallComplianceRate: number;
    averageScore: number;
    photoEvidenceComplianceRate: number;
  };
  departments: ChecklistComplianceDepartmentItem[];
  departmentBreakdown: Array<{
    department: string;
    completionRate: number;
    avgScore: number;
    photoRate: number;
    completedCount: number;
    assignedCount: number;
    verifiedCount: number;
  }>;
  employees: ChecklistEmployeeItem[];
}

export interface EmployeePerformanceItem {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  attendanceScore: number;
  attendanceRate?: number;
  lateCount?: number;
  checklistScore: number;
  sopScore: number;
  sopComplianceRate?: number;
  documentComplianceRate?: number;
  kpiScore: number;
  overtimeDisciplineScore: number;
  peopleHealthScore: number;
  overallHealthScore?: number;
  healthLevel: HealthScoreLevel;
  rankingTier: 'TOP' | 'STANDARD' | 'NEEDS_ATTENTION';
  rank?: number;
}

export interface EmployeePerformanceRankingData {
  overallScoreAverage: number;
  topPerformers: EmployeePerformanceItem[];
  needsAttention: EmployeePerformanceItem[];
  allRankings: EmployeePerformanceItem[];
  allEmployees?: EmployeePerformanceItem[];
  summary?: {
    averageHealthScore: number;
    averageKpiScore: number;
    topPerformersCount: number;
    needsAttentionCount: number;
  };
}

export interface EmployeePerformanceData extends EmployeePerformanceRankingData {}

export interface DepartmentHealthItem {
  department: string;
  headcount: number;
  attendanceRate: number;
  checklistScore: number;
  kpiScore: number;
  overtimeHours: number;
  documentComplianceRate: number;
  sopComplianceRate: number;
  healthScore: number;
  healthLevel: HealthScoreLevel;
}

export interface PeopleRiskAlert {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  riskType:
    | 'REPEATED_LATE'
    | 'HIGH_ABSENCE'
    | 'EXCESSIVE_OVERTIME'
    | 'EXCESSIVE_BREAK'
    | 'MISSING_DOCUMENTS'
    | 'SOP_NON_COMPLIANCE'
    | 'CHECKLIST_NON_COMPLIANCE'
    | 'KPI_BELOW_TARGET';
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  metricValue: string;
  period: string;
  suggestedAction: string;
}

export interface ActionPlanItem {
  id: string;
  title?: string;
  issue?: string;
  description?: string;
  recommendedAction?: string;
  assignedTo?: string;
  pic?: string;
  targetDepartment?: string;
  department?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  dueDate?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  resolvedAt?: string;
}

export interface HRMonthlyReportData {
  month: string;
  year: number;
  generatedAt?: string;
  executiveSummary: string;
  momComparison: {
    attendanceChangePercent?: number;
    overtimeChangePercent?: number;
    payrollCostChangePercent?: number;
    kpiScoreChangePercent?: number;
    checklistChangePercent?: number;
  };
  summary: {
    attendanceRate: number;
    lateRate: number;
    totalLatePenalty: number;
    totalNetPayroll: number;
    laborCostRatio: number;
    checklistComplianceRate: number;
    sopComplianceRate: number;
    documentComplianceRate: number;
  };
  peopleHealth: PeopleHealthScoreBreakdown;
  headcount: {
    totalActive: number;
    byDepartment: Record<string, number>;
  };
  attendanceSummary: AttendanceReportData['summary'];
  manpowerSummary: ManpowerReportData['summary'];
  breakSummary: BreakReportData['summary'];
  overtimeSummary: OvertimeReportData['summary'];
  payrollSummary: PayrollReportData['summary'];
  documentSummary: DocumentComplianceReportData['summary'];
  sopSummary: SopComplianceReportData['summary'];
  checklistSummary: ChecklistComplianceReportData['summary'];
  kpiSummary: {
    averageKpi: number;
    targetKpi: number;
  };
  departmentScorecard: DepartmentHealthItem[];
  peopleRisks: PeopleRiskAlert[];
  actionPlans: ActionPlanItem[];
}

export interface EmployeePersonalAnalytics {
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    fullName: string;
    department: string;
    position: string;
    joinDate: string;
    employmentStatus: string;
    phone?: string;
    email?: string;
  };
  healthScore: PeopleHealthScoreBreakdown;
  attendance: {
    present: number;
    late: number;
    absent: number;
    leave: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leaveDays: number;
    lateMinutes: number;
    totalLateMinutes: number;
    latePenalty: number;
    latePenaltyAmount: number;
    rate: number;
    attendanceRate: number;
  };
  schedule?: {
    totalShifts: number;
    upcomingShifts: Array<{
      date: string;
      shiftName: string;
      time: string;
    }>;
  };
  breakAndOvertime: {
    breakSessionsCount: number;
    averageBreakMinutes: number;
    excessBreakCount: number;
    additionalBreakRequested: number;
    additionalBreakApproved: number;
    overtimeRequestedHours: number;
    overtimeApprovedHours: number;
    overtimeCostSimulation: number;
  };
  breaks?: {
    totalSessions: number;
    totalMinutes: number;
    avgMinutes: number;
    excessCount: number;
    complianceRate: number;
  };
  overtime?: {
    requestedHours: number;
    approvedHours: number;
    actualHours: number;
    simulationCost: number;
  };
  payroll: {
    basicSalary: number;
    allowances: number;
    overtimePay: number;
    lateDeductions: number;
    kasbonDeductions: number;
    netSalary: number;
    status: string;
  };
  payrollSummary?: {
    basicSalary: number;
    allowances: number;
    overtimePay: number;
    lateDeductions: number;
    netSalary: number;
    lastPeriod: string;
  };
  documents: {
    completionRate: number;
    verifiedCount: number;
    missingCount: number;
    missingList: string[];
    missingDocuments?: string[];
    expiringSoonCount: number;
    uploadedDocuments?: Array<{
      title: string;
      expiryDate?: string;
      status: string;
    }>;
  };
  sops: {
    assignedCount: number;
    readCount: number;
    complianceRate: number;
    unreadList: string[];
  };
  sop?: {
    assigned: number;
    completed: number;
    pending: number;
    complianceRate: number;
    unreadList: string[];
  };
  checklists: {
    assignedCount: number;
    completedCount: number;
    verifiedCount: number;
    completionRate: number;
    avgScore: number;
    photoEvidenceRate: number;
  };
  checklist?: {
    assigned: number;
    completed: number;
    verified: number;
    score: number;
  };
  kpi: {
    score: number;
    rating: string;
    topStrength?: string;
    improvementArea?: string;
  };
  timeline?: Array<{
    id: string;
    date: string;
    category: 'ATTENDANCE' | 'OVERTIME' | 'CHECKLIST' | 'KPI' | 'DOCUMENT' | 'BREAK';
    title: string;
    description: string;
    statusBadge?: string;
  }>;
}

export type HRReportSubTab =
  | 'OVERVIEW'
  | 'ATTENDANCE'
  | 'MANPOWER'
  | 'BREAK'
  | 'OVERTIME'
  | 'PAYROLL'
  | 'DOCUMENTS'
  | 'SOP'
  | 'CHECKLIST'
  | 'PERFORMANCE'
  | 'DEPARTMENT_HEALTH'
  | 'PEOPLE_RISK'
  | 'MONTHLY_REPORT'
  | 'MONTHLY';

export type EmployeeDrillDownData = EmployeePersonalAnalytics;
export type HRActionPlanItem = ActionPlanItem;
