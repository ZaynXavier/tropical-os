export type AccessLevel = 'OWNER' | 'MANAGER' | 'HEAD' | 'SUPERVISOR' | 'STAFF';

export type Department =
  | 'Executive'
  | 'Management'
  | 'Operations'
  | 'Kitchen'
  | 'Bar'
  | 'Service'
  | 'Cleaning'
  | 'CRM'
  | 'Finance'
  | 'Marketing'
  | 'HR';

export type EmploymentStatus = 'PERMANENT' | 'CONTRACT' | 'PROBATION' | 'PART_TIME';

export type EmployeeActiveStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export type Gender = 'MALE' | 'FEMALE';

export type AdditionalResponsibility =
  | 'Strategic Investor'
  | 'Head of HR & Admin'
  | 'HR Operations'
  | 'Personalia & Recruitment'
  | 'Kasir Operasional'
  | 'Kitchen Shift Lead'
  | 'Bar Shift Lead'
  | 'Purchasing'
  | 'Stock'
  | 'Produksi'
  | 'Produksi Setengah Jadi'
  | 'Lead & Deals Pipeline'
  | 'Guest Relationship'
  | 'Accounting & Cash Flow'
  | 'Social Media Production';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  employeeNo: string; // Alias for backward compatibility
  fullName: string;
  name: string; // Alias for backward compatibility
  email: string;
  phone: string;
  gender: Gender;
  employmentStatus: EmploymentStatus;
  joinDate: string; // YYYY-MM-DD
  department: Department;
  primaryPosition: string;
  accessLevel: AccessLevel;
  additionalResponsibilities: AdditionalResponsibility[];
  supervisorId: string | null;
  managerId: string | null;
  avatarUrl?: string;
  status: EmployeeActiveStatus;
  isActive: boolean;
  emergencyContact?: EmergencyContact;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Extended / ESS fields
  address?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  // Legacy aliases
  role?: string;
  division?: string;
}

export type EmployeePersonnel = Employee;

export interface EmployeeFilterParams {
  searchQuery?: string;
  department?: Department | 'ALL';
  accessLevel?: AccessLevel | 'ALL';
  employmentStatus?: EmploymentStatus | 'ALL';
  status?: EmployeeActiveStatus | 'ALL';
}

export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  byDepartment: Record<Department, number>;
  byAccessLevel: Record<AccessLevel, number>;
  byEmploymentStatus: Record<EmploymentStatus, number>;
}
