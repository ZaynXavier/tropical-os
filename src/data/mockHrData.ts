export interface Employee {
  id: string;
  code: string;
  name: string;
  role: string;
  division: "Kitchen" | "Service" | "Bar" | "Finance & HR" | "Operational" | "General";
  status: "Full-Time" | "Contract" | "Probation";
  joinDate: string;
  phone: string;
  email: string;
  password?: string;
  faceRegistered?: boolean;
  faceSampleUrl?: string;
  bankAccount: string;
  baseSalary: number;
  dailyAllowance: number;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  division: string;
  checkIn: string;
  checkOut: string;
  status: "Hadir" | "Izin" | "Sakit" | "Cuti" | "Alpha";
  overtimeHours: number;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  period: string;
  employeeId: string;
  employeeName: string;
  division: string;
  role: string;
  baseSalary: number;
  allowanceTotal: number;
  overtimePay: number;
  performanceBonus: number;
  deductions: number;
  netSalary: number;
  status: "Draft" | "Approved" | "Paid";
  paymentDate?: string;
}

export interface KpiReview {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  scoreHospitality?: number;
  scoreSpeed?: number;
  scoreCleanliness?: number;
  scoreTeamwork?: number;
  scorePunctuality?: number;
  scoreSpeedEfficiency?: number;
  scoreHygieneCleanliness?: number;
  overallRating?: number;
  totalScore?: number;
  grade?: "A (Sangat Baik)" | "B (Baik)" | "C (Cukup)" | "D (Perlu Evaluasi)" | string;
  feedback?: string;
  feedbackNotes?: string;
  evaluator?: string;
  reviewedBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  type: "Cuti Tahunan" | "Izin Sakit" | "Izin Keluarga" | "Cuti Melahirkan";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  date: string;
  hours: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  estimatedPay: number;
}

export interface OnboardingItem {
  id: string;
  employeeName: string;
  role: string;
  type: "Onboarding" | "Offboarding";
  startDate: string;
  progress: number;
  status: "In Progress" | "Completed";
  tasksCompleted: number;
  totalTasks: number;
}

export interface HrHelpDeskTicket {
  id: string;
  ticketNo: string;
  employeeName: string;
  division: string;
  category: "Payroll & Gaji" | "Shift & Jadwal" | "Fasilitas & Seragam" | "Klaim Kasbon / BPJS" | "Lainnya";
  subject: string;
  description: string;
  priority: "Biasa" | "Penting" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  createdDate: string;
  responseNote?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: "Pengumuman Shift" | "SOP Resto" | "Event & Celebration" | "Policy Update";
  content: string;
  author: string;
  date: string;
  important: boolean;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  docName: string;
  docType: "KTP / ID" | "Sertifikat Hygiene" | "Kontrak Kerja" | "Buku Tabungan" | "SKCK";
  uploadDate: string;
  fileSize: string;
  status: "Verified" | "Pending";
}

export interface HrTaskItem {
  id: string;
  title: string;
  assignedTo: string;
  division: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Done";
}

export interface HrAsset {
  id: string;
  code?: string;
  name?: string;
  assetName?: string;
  category?: string;
  serialNumber?: string;
  assignedTo?: string;
  assignedToEmployeeId?: string;
  assignedToName?: string;
  condition?: string;
  assignedDate?: string;
  status?: "Good" | "Maintenance" | "Lost" | string;
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-superadmin",
    code: "TG-ADM-001",
    name: "Super Admin Tropical Garden",
    role: "Super Admin & Owner",
    division: "General",
    status: "Full-Time",
    joinDate: "01/01/2026",
    phone: "+62 811-0000-001",
    email: "tropicalgardenresto@tropicalgarden.com",
    bankAccount: "BCA 0000000001",
    baseSalary: 0,
    dailyAllowance: 0,
    active: true,
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [];
export const MOCK_PAYROLL: PayrollRecord[] = [];
export const MOCK_KPI_REVIEWS: KpiReview[] = [];
export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [];
export const MOCK_OVERTIME_REQUESTS: OvertimeRequest[] = [];
export const MOCK_ONBOARDING: OnboardingItem[] = [];
export const MOCK_HR_TICKETS: HrHelpDeskTicket[] = [];
export const MOCK_HELPDESK: HrHelpDeskTicket[] = [];
export const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [];
export const MOCK_DOCUMENTS: EmployeeDocument[] = [];
export const MOCK_HR_TASKS: HrTaskItem[] = [];
export const MOCK_TASKS: HrTaskItem[] = [];
export const MOCK_ASSETS: HrAsset[] = [];
