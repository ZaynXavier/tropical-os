/**
 * Frontend Service Hub (Pure Client-Side Architecture)
 */

export const isSupabaseConfigured = () => false;
export const getSupabaseUrl = () => "";
export const getSupabaseAnonKey = () => "";
export const setSupabaseAnonKey = (_key?: string) => {};
export const setSupabaseConfig = (_url?: string, _key?: string) => {};

export { AuthService } from '../services/authService';
export { EmployeeService, type EmployeeData } from '../services/employeeService';
export { AttendanceService } from '../services/attendanceService';
export { ScheduleService } from '../services/scheduleService';
export { AttendanceCorrectionService, CrmService, PurchasingService, FinanceService, SeedService, ApprovalService, AuditService, SalaryService, OvertimeService, DeductionService, LeaveService, PipService, HrService } from '../services/otherServices';
export { ChecklistService } from '../services/checklistService';
export { HrDocumentService } from '../services/hrDocumentService';
export { KpiService } from '../services/kpiService';
export { RbacService } from '../rbac/rbacService';
export { PayrollService, type PayrollPeriodData, type PayrollRecordData } from '../services/payrollService';
export { KpiAnalyticsService, type PerformanceSummary, type DivisionPerformance, type CompanyPerformance, type TopPerformerItem, type NeedsImprovementItem, type IndicatorAnalyticsItem } from '../services/kpiAnalyticsService';
export { KpiIngestionService } from '../services/kpiIngestionService';
export { ProductionReadinessService } from '../services/productionReadinessService';

