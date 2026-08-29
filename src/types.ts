/**
 * TROPICALOS — TYPES COMPATIBILITY LAYER
 * Central export layer for all application domain types.
 */

// Modular Domain Re-exports
export * from './types/attendance';
export * from './types/auth';
export * from './types/break';
export * from './types/contracts';
export * from './types/directive';
export * from './types/employee';
export * from './types/finance';
export * from './types/handover';
export * from './types/hpp';
export * from './types/hrConfiguration';
export * from './types/hrDocument';
export * from './types/hrReports';
export * from './types/inventory';
export * from './types/navigation';
export * from './types/operationalIssue';
export * from './types/operationalKnowledge';
export * from './types/operations';
export * from './types/overtime';
export * from './types/payroll';
export * from './types/permissions';
export * from './types/procurement';
export * from './types/production';
export * from './types/recipe';
export * from './types/reservation';
export * from './types/sales';
export * from './types/schedule';
export * from './types/stockMovement';
export * from './types/stockOpname';

// Base User & Navigation Types
export type Role = "OWNER" | "MANAGER" | "HEAD" | "SUPERVISOR" | "STAFF";

export type Division =
  | "CRM"
  | "WAITER"
  | "KITCHEN"
  | "BARISTA"
  | "CASHIER"
  | "KASIR"
  | "PURCHASING"
  | "DISHWASH_CLEANING"
  | "HOUSEKEEPING"
  | "FINANCE"
  | "CONTENT_CREATOR"
  | "EXECUTIVE"
  | "MANAGEMENT"
  | "OPERATIONS"
  | "SERVICE"
  | "BAR"
  | "MARKETING"
  | "CLEANING"
  | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role | string;
  division?: Division | string;
  accessLevel?: string;
  department?: string;
  primaryPosition?: string;
  additionalResponsibilities?: string[];
  avatarUrl?: string;
  employee_id?: string;
  supervisor_id?: string;
}

export type SectionType =
  | "MAIN"
  | "CUSTOMER"
  | "OPERATIONS"
  | "PROCUREMENT"
  | "FINANCE"
  | "MARKETING"
  | "PEOPLE"
  | "ANALYTICS"
  | "SYSTEM";

export interface NavigationItem {
  name: string;
  path: string;
  iconName: string;
  section: SectionType;
  allowedRoles?: Role[];
  allowedDivisions?: Division[];
}

// Supplier Interface
export interface Supplier {
  id: string;
  code?: string;
  supplierCode?: string;
  name?: string;
  supplierName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: any;
  active?: boolean;
  status?: any;
  paymentTerms?: string;
  leadTimeDays?: number;
  minimumOrderAmount?: number;
  rating?: number;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// HR Document Aliases & History
export type DeductionType = 'KASBON' | 'BPJS' | 'LATE_PENALTY' | 'UNIFORM' | 'DAMAGE' | 'OTHER' | string;
export type DeductionStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'DEDUCTED' | 'CANCELLED' | string;

export interface HrDocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  version?: string | number;
  file_url: string;
  file_name: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
  notes?: string;
}

export interface EssEmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  join_date: string;
  employment_status: string;
  emergency_contact?: any;
}

export interface HrDocumentStats {
  total_documents?: number;
  verified_count?: number;
  pending_count?: number;
  expired_count?: number;
  expiring_soon_count?: number;
}

export interface HrDocument {
  id: string;
  employee_id?: string;
  employeeId?: string;
  title?: string;
  document_name?: string;
  documentName?: string;
  document_type?: any;
  documentTypeId?: string;
  category?: string;
  documentCategoryId?: string;
  file_url?: string;
  fileUrl?: string;
  file_name?: string;
  fileName?: string;
  file_size?: number;
  status?: any;
  calculated_status?: string;
  is_expired?: boolean;
  notes?: string;
  expiry_date?: string;
  expiresAt?: string;
  uploaded_by?: string;
  uploadedBy?: string;
  uploaded_at?: string;
  uploadedAt?: string;
  verified_by?: string;
  verifiedBy?: string;
  verified_at?: string;
  verifiedAt?: string;
}

export type HrDocumentType = string | any;
export type HrDocumentStatus = string | any;

export interface HrHistoryEntry {
  id: string;
  employee_id: string;
  employee_name?: string;
  event_type: string;
  title: string;
  description: string;
  date: string;
  performed_by: string;
  created_at: string;
}

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_type: string;
  amount: number;
  reason: string;
  period: string;
  created_at: string;
}

export type CorrectionType = 'CLOCK_IN' | 'CLOCK_OUT' | 'BOTH' | string;

export interface AttendanceCorrection {
  id: string;
  attendance_id?: string;
  employee_id: string;
  employee_name?: string;
  correction_type?: CorrectionType;
  original_date: string;
  original_clock_in?: string | null;
  original_clock_out?: string | null;
  corrected_clock_in?: string | null;
  corrected_clock_out?: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export type OvertimeRequest = import('./types/overtime').OvertimeRecord;

// Legacy Checklist Engine Types
export type ChecklistItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'FAILED' | 'SKIPPED' | string;
export type ChecklistEvidenceType = 'PHOTO' | 'TEXT' | 'NUMBER' | 'SIGNATURE' | 'NONE' | 'PHOTO_AND_NOTE' | 'NOTE' | string;
export type ChecklistShiftType = 'PAGI' | 'SIANG' | 'MALAM' | 'ALL' | string;
export type ChecklistFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SHIFT' | string;

export interface ChecklistTemplateItem {
  id: string;
  template_id?: string;
  templateId?: string;
  task_order?: number;
  sequence?: number;
  area?: string;
  instructions?: string;
  instruction?: string;
  requires_evidence?: boolean;
  weight?: number;
  max_score?: number;
  standard?: string;
  task_name?: string;
  name?: string;
  title?: string;
  standard_description?: string;
  description?: string;
  is_required?: boolean;
  isRequired?: boolean;
  evidence_required?: boolean;
  evidence_type?: ChecklistEvidenceType;
  point_value?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistTemplate {
  id: string;
  templateId?: string;
  document_id?: string;
  code?: string;
  templateCode?: string;
  title?: string;
  name?: string;
  templateName?: string;
  division?: string;
  areaId?: string;
  stationId?: string;
  shift_type?: string;
  shiftType?: string;
  role_target?: string;
  frequency?: string;
  description?: string;
  requires_verification?: boolean;
  passing_score?: number;
  is_active?: boolean;
  items?: ChecklistTemplateItem[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistAssignment {
  id: string;
  template_id?: string;
  employee_id?: string;
  employee_name?: string;
  employee_emp_id?: string;
  assigned_to_user_id?: string;
  assigned_to_name?: string;
  assigned_by?: string;
  assigner_name?: string;
  assignment_date?: string;
  due_at?: string;
  division?: string;
  date?: string;
  shift_type?: string;
  status?: string;
  completion_percentage?: number;
  score?: number;
  template?: ChecklistTemplate;
  executions?: ChecklistExecution[];
  started_at?: string;
  submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  verifier_name?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistExecution {
  id: string;
  assignment_id?: string;
  template_item_id?: string;
  item?: any;
  status: ChecklistItemStatus;
  completed_at?: string | null;
  completed_by?: string;
  notes?: string;
  note?: string;
  evidence?: any[];
  verified_by?: string | null;
  verified_at?: string | null;
  score_awarded?: number;
  evidence_urls?: string[];
  updated_at?: string;
}

export interface ChecklistEvidence {
  id?: string;
  evidenceId?: string;
  execution_id?: string;
  executionId?: string;
  file_url?: string;
  previewUrl?: string;
  file_name?: string;
  file_type?: string;
  storage_path?: string;
  notes?: string;
  uploaded_by?: string;
  uploaded_at?: string;
}

export interface ChecklistDashboardMetrics {
  total_assigned?: number;
  totalAssigned?: number;
  in_progress?: number;
  submitted?: number;
  verified?: number;
  rejected?: number;
  revision_required?: number;
  overdue?: number;
  total_completed?: number;
  totalCompleted?: number;
  total_pending?: number;
  totalPending?: number;
  total_verified?: number;
  totalVerified?: number;
  completion_rate?: number;
  completionRate?: number;
  verification_rate?: number;
  verificationRate?: number;
  pass_rate?: number;
  passRate?: number;
  average_score?: number;
  averageScore?: number;
  by_division?: any;
  division_breakdown?: any;
}

// Salary Component Types
export type SalaryComponentType =
  | "BASIC_SALARY"
  | "MEAL_ALLOWANCE"
  | "TRANSPORT_ALLOWANCE"
  | "POSITION_ALLOWANCE"
  | "INCENTIVE"
  | "OTHER_ALLOWANCE"
  | "FIXED_DEDUCTION"
  | "OTHER_DEDUCTION";

export type CalculationType = "FIXED" | "DAILY" | "HOURLY" | "PERCENTAGE";

export interface SalaryComponent {
  id: string;
  employee_id: string;
  component_type: SalaryComponentType;
  component_name: string;
  amount: number;
  calculation_type: CalculationType;
  effective_from: string;
  effective_to?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_emp_id?: string;
  division?: string;
}

export interface SalaryHistory {
  id: string;
  employee_id: string;
  component_type: SalaryComponentType;
  component_name: string;
  old_amount: number;
  new_amount: number;
  effective_date: string;
  reason: string;
  changed_by?: string | null;
  created_at: string;
  changer_name?: string;
}

// HR Policy, KPI & Incentive Types
export type BaseIncentiveType = 'TARGET_OMZET' | 'FOOD_COST_SAVING' | 'ATTENDANCE_PERFECT' | 'SERVICE_EXCELLENCE' | 'CUSTOM' | string;
export type CalculationMethod = 'FIXED_AMOUNT' | 'PERCENTAGE_SALARY' | 'TIERED' | string;
export type KpiAssignmentStatus = 'DRAFT' | 'ACTIVE' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'CANCELLED' | string;
export type KpiGrade = 'A' | 'B' | 'C' | 'D' | 'E' | string;

export interface KpiTemplate {
  id: string;
  template_code: string;
  title: string;
  department: string;
  position: string;
  indicators: any[];
  is_active: boolean;
  created_at: string;
}

export interface CreateKpiAssignmentInput {
  employee_id: string;
  template_id: string;
  period: string;
  period_start_date?: string;
  period_end_date?: string;
  target_score?: number;
  notes?: string;
}

export interface UpdateIndicatorResultInput {
  indicator_id: string;
  actual_value: number;
  notes?: string;
}

export interface KpiIncentiveRule {
  id: string;
  policy_id?: string;
  grade?: string;
  min_score?: number;
  max_score?: number;
  multiplier?: number;
  fixed_amount?: number;
  percentage?: number;
  priority?: number;
  incentive_amount?: number;
  percentage_bonus?: number;
  is_active?: boolean;
}

export interface KpiIncentivePolicy {
  id: string;
  code?: string;
  name?: string;
  policy_name?: string;
  description?: string;
  department?: string;
  division?: string;
  position?: string;
  minimum_score?: number;
  maximum_score?: number;
  base_incentive_type?: BaseIncentiveType;
  incentive_type?: BaseIncentiveType;
  base_incentive_value?: number;
  effective_start_date?: string;
  effective_end_date?: string;
  calculation_method?: CalculationMethod;
  rules?: KpiIncentiveRule[];
  is_active?: boolean;
  created_at?: string;
}

export interface EmployeeKpiAssignment {
  id: string;
  employee_id: string;
  employee_name?: string;
  kpi_period: string;
  score?: number;
  status?: KpiAssignmentStatus;
  grade?: KpiGrade;
  created_at?: string;
  updated_at?: string;
}

export interface KpiIndicatorResult {
  id: string;
  indicator_name: string;
  target_value: number;
  actual_value: number;
  unit: string;
  weight_percentage: number;
  achievement_rate: number;
  score: number;
  source_metadata?: any;
  source_data_type?: string;
}

export type LeaveRequestType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'UNPAID' | 'EMERGENCY' | 'SPECIAL' | string;
export type LeaveType = LeaveRequestType;
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | string;

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveRequestType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type ShiftType = 'PAGI' | 'SIANG' | 'FULL_DAY' | 'MIDDLE' | 'OFF' | string;

export interface PipActionPlanStep {
  id: string;
  step_order: number;
  description: string;
  target_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | string;
  notes?: string;
}

export interface PerformanceImprovementPlan {
  id: string;
  employee_id: string;
  employee_name?: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXTENDED' | string;
  action_plan?: PipActionPlanStep[];
  evaluation_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
