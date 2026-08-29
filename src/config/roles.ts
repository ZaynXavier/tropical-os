import { AccessLevel } from '../types/employee';

export interface RoleConfig {
  id: AccessLevel;
  name: string;
  badgeLabel: string;
  badgeColor: 'purple' | 'pink' | 'emerald' | 'blue' | 'indigo';
  description: string;
  focusArea: string;
  hierarchyRank: number; // 1 = OWNER (highest), 5 = STAFF
}

export const MASTER_ROLES: Record<AccessLevel, RoleConfig> = {
  OWNER: {
    id: 'OWNER',
    name: 'Owner (Executive)',
    badgeLabel: 'OWNER',
    badgeColor: 'purple',
    description: 'Executive Business Visibility, Financial Health, MBR. Mendelegasikan tugas dari tingkat Manager hingga paling bawah (tidak menerima tugas operasional).',
    focusArea: 'Pengawasan Bisnis, Strategic Oversight & Delegasi Tugas Eksekutif',
    hierarchyRank: 1,
  },
  MANAGER: {
    id: 'MANAGER',
    name: 'Manager (General Manager)',
    badgeLabel: 'MANAGER',
    badgeColor: 'pink',
    description: 'Pusat Otoritas Tunggal Resto. SATU-SATUNYA yang berhak memberikan approval (Persetujuan Cuti, Lembur, Kasbon, Pembelian PR, dll).',
    focusArea: 'Otoritas Tunggal Persetujuan (Approval), Operasional Resto & HR',
    hierarchyRank: 2,
  },
  HEAD: {
    id: 'HEAD',
    name: 'Head (Kepala Bagian Divisi)',
    badgeLabel: 'HEAD',
    badgeColor: 'indigo',
    description: 'Kepala Bagian Teknis Stasiun/Divisi (Kitchen, Bar, Service, CRM, HR, Finance). Hanya bisa memberikan tugas kepada anak buahnya di masing-masing divisi.',
    focusArea: 'Delegasi Tugas Khusus Divisi Sendiri, SOP Stasiun & Mutu Teknis',
    hierarchyRank: 3,
  },
  SUPERVISOR: {
    id: 'SUPERVISOR',
    name: 'Supervisor (Operasional Lantai)',
    badgeLabel: 'SUPERVISOR',
    badgeColor: 'blue',
    description: 'Supervisor Operasional Lantai (Floor Supervisor). Mengawasi ritme operasional harian seluruh lantai, kasir POS, & cleaning utility.',
    focusArea: 'Operasional Lantai Resto, Kasir POS & Supervisi Kebersihan',
    hierarchyRank: 4,
  },
  STAFF: {
    id: 'STAFF',
    name: 'Staff (Pelaksana Teknis)',
    badgeLabel: 'STAFF',
    badgeColor: 'emerald',
    description: 'Pelaksana tugas operasional stasiun, self-service portal, absensi, dan eksekusi instruksi kerja harian.',
    focusArea: 'Eksekusi Tugas Stasiun, Absensi & Layanan Mandiri',
    hierarchyRank: 5,
  },
};
