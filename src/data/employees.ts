import { Employee } from '../types/employee';

/**
 * MASTER PERSONNEL OF TROPICAL GARDEN RESTO
 * Single Source of Truth — Clean Master Super Admin
 */
export const INITIAL_EMPLOYEES: Employee[] = [
  {
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
  },
];
