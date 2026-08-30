import { Employee } from '../types/employee';

/**
 * MASTER CLEAN PERSONNEL OF TROPICAL GARDEN RESTO
 * Fallback Default Super Admin Account
 */
export const DEFAULT_SUPER_ADMIN: Employee = {
  id: 'emp-superadmin',
  employeeCode: 'TG-ADM-001',
  employeeNo: 'TG-ADM-001',
  fullName: 'Super Admin Tropical Garden',
  name: 'Super Admin',
  email: 'tropicalgardenresto@tropicalgarden.com',
  phone: '+62 811-0000-001',
  gender: 'MALE',
  employmentStatus: 'PERMANENT',
  joinDate: '2026-01-01',
  department: 'Executive',
  primaryPosition: 'Super Admin & Owner',
  accessLevel: 'OWNER',
  additionalResponsibilities: ['Strategic Investor'],
  supervisorId: null,
  managerId: null,
  status: 'ACTIVE',
  isActive: true,
  emergencyContact: {
    name: 'Admin Hotline',
    relationship: 'Support',
    phone: '+62 811-0000-999',
  },
  notes: 'Akun Master Super Admin Tropical Garden Resto untuk pengujian dan kontrol penuh sistem.',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  role: 'Owner',
  division: 'Executive',
};

export const INITIAL_EMPLOYEES: Employee[] = [DEFAULT_SUPER_ADMIN];
