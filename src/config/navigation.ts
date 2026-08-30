import { NavigationModule } from '../types/navigation';

/**
 * MASTER NAVIGATION TROPICALOS — 6 CORE PILLARS
 * Arsitektur Ramping, Minimalis, & Fokus Peran
 */
export const MASTER_NAVIGATION: NavigationModule[] = [
  // 1. EXECUTIVE DASHBOARD
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    iconName: 'LayoutDashboard',
    description: 'Pusat Informasi & Command Center Bisnis Tropical Garden Resto',
    allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
    submodules: [
      {
        id: 'overview',
        name: 'Command Center',
        path: '/dashboard',
        subParam: 'overview',
        description: 'Ringkasan performa omzet, food cost, laba bersih, dan directives',
      },
    ],
  },

  // 2. TROPICAL HR
  {
    id: 'hr',
    name: 'Tropical HR',
    path: '/hr',
    iconName: 'Users',
    description: 'Human Resources, Karyawan, Presensi, Roster, Payroll & SOP',
    badge: 'SDM',
    badgeColor: 'purple',
    allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
    submodules: [
      {
        id: 'employees',
        name: 'Karyawan & Akun',
        path: '/hr',
        subParam: 'employees',
        description: 'Direktori master karyawan, pendaftaran staf baru, dan pengaturan kata sandi akun',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'attendance',
        name: 'Presensi & Roster',
        path: '/hr',
        subParam: 'attendance',
        description: 'Rekap kehadiran harian, jadwal shift, istirahat, lembur, dan izin cuti',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'payroll',
        name: 'Payroll & Slip Gaji',
        path: '/hr',
        subParam: 'payroll',
        description: 'Perhitungan gaji pokok, lembur, potongan disiplin, dan cetak slip gaji',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
      {
        id: 'sop',
        name: 'SOP & KPI Kinerja',
        path: '/hr',
        subParam: 'sop',
        description: 'Standard Operating Procedure, IKA stasiun, dan evaluasi KPI staf',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'hr-dashboard',
        name: 'Statistik Demografi',
        path: '/hr',
        subParam: 'dashboard',
        description: 'Pusat statistik demografi kepegawaian dan kepatuhan HR',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
    ],
  },

  // 3. KITCHEN & OPERATIONS
  {
    id: 'operations',
    name: 'Operations',
    path: '/operations',
    iconName: 'UtensilsCrossed',
    description: 'Inventori Bahan Baku, Resep & HPP, Pengadaan (PO), dan Checklist Stasiun',
    badge: 'Dapur',
    badgeColor: 'amber',
    allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
    submodules: [
      {
        id: 'inventory',
        name: 'Inventori & Stok',
        path: '/operations',
        subParam: 'inventory',
        description: 'Stok gudang bahan baku, kartu stok, stok opname, dan wasting',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'recipes',
        name: 'Resep & HPP Menu',
        path: '/operations',
        subParam: 'recipes',
        description: 'Master resep masakan/minuman, takaran porsi, dan kalkulasi HPP food cost',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'procurement',
        name: 'Pengadaan & PO',
        path: '/operations',
        subParam: 'procurement',
        description: 'Purchase Request (PR), Purchase Order (PO) supplier, dan penerimaan barang',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'checklists',
        name: 'Daily Checklist & Handover',
        path: '/operations',
        subParam: 'checklists',
        description: 'Checklist SOP opening/closing stasiun, serah terima shift, dan log kendala',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
    ],
  },

  // 4. SALES & FINANCE POS
  {
    id: 'finance',
    name: 'Sales & Finance',
    path: '/finance',
    iconName: 'BadgeDollarSign',
    description: 'Transaksi POS, Kasir Closing, Rekonsiliasi, dan Arus Kas Keuangan',
    badge: 'POS & Kas',
    badgeColor: 'emerald',
    allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
    submodules: [
      {
        id: 'sales-report',
        name: 'Laporan Pendapatan POS',
        path: '/finance',
        subParam: 'sales',
        description: 'Ringkasan omzet harian, transaksi POS kasir, dan performa menu terlaris',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'cashier-closing',
        name: 'Kasir & Rekonsiliasi',
        path: '/finance',
        subParam: 'closing',
        description: 'Closing kasir shift, audit uang tunai vs EDC/QRIS, dan slip settlement POS',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'expenses',
        name: 'Pengeluaran & Arus Kas',
        path: '/finance',
        subParam: 'expenses',
        description: 'Pencatatan beban operasional (OPEX), kas kecil, dan arus kas resto',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
      {
        id: 'financial-statements',
        name: 'Laporan Keuangan',
        path: '/finance',
        subParam: 'statements',
        description: 'Laba Rugi (P&L), EBITDA, dan audit rekonsiliasi keuangan',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
    ],
  },

  // 5. TROPICAL CRM & MARKETING
  {
    id: 'crm',
    name: 'Tropical CRM',
    path: '/crm',
    iconName: 'MessageSquare',
    description: 'WhatsApp Hub, Reservasi Meja, Leads Banquet, dan Konten Promosi',
    badge: 'Tamu & WA',
    badgeColor: 'pink',
    allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
    submodules: [
      {
        id: 'whatsapp-hub',
        name: 'WhatsApp CRM Hub',
        path: '/crm',
        subParam: 'whatsapp',
        description: 'Chat langsung WhatsApp dengan pelanggan dan broadcast promosi',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'reservations',
        name: 'Reservasi & Kalender Meja',
        path: '/crm',
        subParam: 'calendar',
        description: 'Booking meja tamu, booking VIP room, dan follow-up reservasi',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'],
      },
      {
        id: 'pipeline',
        name: 'Leads & Event Banquet',
        path: '/crm',
        subParam: 'pipeline',
        description: 'Manajemen prospek event wedding, gathering kantor, dan kuotasi harga',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'content-marketing',
        name: 'Konten & Promosi',
        path: '/crm',
        subParam: 'content',
        description: 'Kalender konten media sosial (TikTok/IG) dan kolaborasi influencer',
        allowedRoles: ['OWNER', 'MANAGER', 'SUPERVISOR'],
      },
    ],
  },

  // 6. SETTINGS & ACCESS
  {
    id: 'settings',
    name: 'Settings',
    path: '/settings',
    iconName: 'Settings',
    description: 'Pengaturan Hak Akses (RBAC), Geofence, dan WhatsApp Gateway',
    allowedRoles: ['OWNER', 'MANAGER'],
    submodules: [
      {
        id: 'access-control',
        name: 'Manajemen Hak Akses',
        path: '/settings',
        subParam: 'access',
        description: 'Atur izin buka menu dan tombol aksi berdasarkan role pengguna',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
      {
        id: 'resto-config',
        name: 'Konfigurasi Resto',
        path: '/settings',
        subParam: 'config',
        description: 'Titik koordinat GPS geofence absensi dan jam operasional cabang',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
      {
        id: 'wa-gateway',
        name: 'Gateway WhatsApp',
        path: '/settings',
        subParam: 'whatsapp',
        description: 'Scan QR login dan status koneksi bot WhatsApp Baileys',
        allowedRoles: ['OWNER', 'MANAGER'],
      },
    ],
  },
];
