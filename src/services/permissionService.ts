import { EmployeePersonnel, AccessLevel, Department, AdditionalResponsibility } from '../types/employee';
import { ActionVerb, VisibilityLevel, DataScope } from '../types/permissions';
import { NavigationModule, SubmoduleItem } from '../types/navigation';
import { userModuleAccessService } from './userModuleAccessService';

class PermissionService {
  /**
   * Cek apakah user memiliki accessLevel tertentu
   */
  public hasRole(user: EmployeePersonnel | null, role: AccessLevel): boolean {
    if (!user) return false;
    return user.accessLevel === role;
  }

  /**
   * Cek apakah user memiliki salah satu dari daftar accessLevel
   */
  public hasAnyRole(user: EmployeePersonnel | null, roles: AccessLevel[]): boolean {
    if (!user) return false;
    return roles.includes(user.accessLevel);
  }

  /**
   * Cek apakah user berada pada department tertentu
   */
  public hasDepartment(user: EmployeePersonnel | null, department: Department): boolean {
    if (!user) return false;
    return user.department === department;
  }

  /**
   * Cek apakah user memiliki tanggung jawab tambahan tertentu
   */
  public hasResponsibility(
    user: EmployeePersonnel | null,
    responsibility: AdditionalResponsibility | AdditionalResponsibility[]
  ): boolean {
    if (!user) return false;
    const reqs = Array.isArray(responsibility) ? responsibility : [responsibility];
    const userResps = user.additionalResponsibilities || [];
    return reqs.some((r) => userResps.includes(r));
  }

  /**
   * Cek apakah user adalah Petugas / Staf HR (Human Resources)
   */
  public isHROfficer(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    const dept = (user.department || '').toUpperCase();
    const pos = (user.primaryPosition || '').toUpperCase();
    const role = (user.role || '').toUpperCase();
    const div = ((user as any).division || '').toUpperCase();
    const resps = (user.additionalResponsibilities || []).map((r) => r.toUpperCase());

    return (
      dept === 'HR' ||
      div === 'HR' ||
      pos.includes('HR') ||
      role.includes('HR') ||
      resps.some((r) => r.includes('HR') || r.includes('PERSONALIA'))
    );
  }

  /**
   * Cek apakah user adalah Petugas Finance / Akuntansi
   */
  public isFinanceOfficer(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    const dept = (user.department || '').toUpperCase();
    const pos = (user.primaryPosition || '').toUpperCase();
    const resps = (user.additionalResponsibilities || []).map((r) => r.toUpperCase());

    return (
      dept === 'FINANCE' ||
      pos.includes('FINANCE') ||
      resps.some((r) => r.includes('ACCOUNTING') || r.includes('CASH FLOW'))
    );
  }

  /**
   * Cek apakah user adalah Supervisor Operasional Lantai (Floor & Operations Supervisor)
   * Catatan: Supervisor berbeda dari Kepala Bagian (Head).
   * - Supervisor: Mengawasi operasional harian seluruh lantai resto, koordinasi lintas stasiun, kasir operasional POS, utility/cleaning, dan eskalasi penanganan tamu.
   */
  public isSupervisor(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    const dept = (user.department || '').toUpperCase();
    const pos = (user.primaryPosition || '').toUpperCase();
    const role = (user.role || '').toUpperCase();

    // Putri Okta / Operations Floor Supervisor
    return (
      (dept === 'OPERATIONS' && (user.accessLevel === 'SUPERVISOR' || pos.includes('SUPERVISOR') || role.includes('SUPERVISOR'))) ||
      pos === 'SUPERVISOR'
    );
  }

  /**
   * Cek apakah user adalah Kepala Bagian / Station Head teknis divisi tertentu
   * - Head Kitchen (Andun/Alfan): Mengelola stasiun dapur, standar resep & rasa, prep checklist, HPP resep, bahan baku segar.
   * - Head Bar (Dina): Mengelola stasiun bar & beverage, standar barista, kalibrasi grinder.
   * - Head Waiter (Vita): Mengelola stasiun service lantai, sequence of service, briefing waiter.
   * - CRM Lead (Aqib Latuh): Mengelola relasi pelanggan VIP, reservasi acara, WhatsApp gateway.
   */
  public isSectionHead(user: EmployeePersonnel | null, department?: Department): boolean {
    if (!user) return false;
    const pos = (user.primaryPosition || '').toUpperCase();
    const role = (user.role || '').toUpperCase();
    const dept = (user.department || '').toUpperCase();

    const isHeadTitle =
      pos.includes('HEAD') ||
      pos.includes('LEAD') ||
      pos.includes('CHEF') ||
      role.includes('HEAD') ||
      role.includes('LEAD');

    if (!isHeadTitle) return false;
    if (department) {
      return dept === department.toUpperCase();
    }
    return true;
  }

  /**
   * Cek apakah user berhak mengakses fitur Payroll & Penggajian Resto
   * HANYA Owner, General Manager, HR Officer, dan Finance Officer.
   * Supervisor, Kepala Bagian (Head), dan Staf TIDAK BERHAK melihat payroll/slip gaji.
   */
  public canAccessPayroll(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    if (user.accessLevel === 'MANAGER' || user.accessLevel === 'OWNER') return true;
    if (this.isHROfficer(user)) return true;
    if (this.isFinanceOfficer(user)) return true;
    return false;
  }

  /**
   * Cek apakah user berhak melihat Key Performance Indicators (KPI) & Metrik Finansial Eksekutif
   * HANYA Owner, General Manager, dan Petugas Keuangan (Finance).
   * Supervisor (Putri), Heads (Andun, Alfan, Dina, Vita, Aqib), dan Staf TIDAK BERHAK melihat KPI.
   */
  public canViewKpi(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') return true;
    if (this.isFinanceOfficer(user) || (user.department || '').toUpperCase() === 'FINANCE') return true;
    return false;
  }

  /**
   * Cek apakah user boleh melihat modul utama
   */
  public canViewModule(user: EmployeePersonnel | null, module: NavigationModule): boolean {
    if (!user) return false;

    // OWNER / Super Admin & MANAGER have full universal access to ALL modules
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return true;
    }

    // HR Officer per user specification ONLY sees Tropical HR and Development
    if (this.isHROfficer(user) && (user.accessLevel as string) !== 'MANAGER') {
      return module.id === 'hr' || module.id === 'development';
    }

    // Role-specific constraints based on RBAC.md Table
    if (module.id === 'reports' || module.id === 'settings') {
      return false; // Owner and Manager already returned true above
    }

    if (module.id === 'content') {
      // Content module is accessible by Owner, Manager, or Naila (Content Creator / Social Media Production)
      if (this.hasResponsibility(user, 'Social Media Production') || user.department === 'Marketing') {
        return true;
      }
      return false;
    }

    if (module.id === 'finance') {
      // Finance is accessible by Owner, Manager, Finance Department, or Cashier responsibility
      if (
        user.department === 'Finance' ||
        this.hasResponsibility(user, ['Accounting & Cash Flow', 'Kasir Operasional'])
      ) {
        return true;
      }
      // Supervisors can access cashier submodule
      return user.accessLevel === 'SUPERVISOR';
    }

    if (module.id === 'crm') {
      // CRM is accessible by Owner, Manager, CRM Department, or Service Supervisor
      if (user.department === 'CRM' || (user.accessLevel === 'SUPERVISOR' && user.department === 'Service')) {
        return true;
      }
      return false;
    }

    // Check custom explicit assignment via userModuleAccessService
    if (userModuleAccessService.canUserAccessModule(user, module.id)) {
      return true;
    }

    if (module.id === 'marketing') {
      // Digital Marketing is strictly for Owner and Manager (handled above, or if assigned via userModuleAccessService)
      return false;
    }

    if (module.id === 'operations') {
      // Operations is visible to all active operational roles
      return true;
    }

    if (module.id === 'hr') {
      // Modul HR dapat diakses oleh semua tingkatan (Staff mengakses self-service seperti Slip Gaji & SOP)
      return true;
    }

    if (module.id === 'development') {
      // Modul Development HANYA untuk Petugas HR, Manager, atau Supervisor
      return this.isHROfficer(user) || user.accessLevel === 'SUPERVISOR';
    }

    if (module.id === 'dashboard') {
      return true;
    }

    // Check generic allowed roles if defined
    if (module.allowedRoles && !module.allowedRoles.includes(user.accessLevel)) {
      return false;
    }

    return true;
  }

  /**
   * Cek apakah user boleh melihat submodule tertentu
   */
  public canViewSubmodule(
    user: EmployeePersonnel | null,
    moduleId: string,
    submodule: SubmoduleItem
  ): boolean {
    if (!user) return false;

    // OWNER / Super Admin & MANAGER can access all submodules
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return true;
    }

    // HR Officer can access all submodules in HR and Development
    if (this.isHROfficer(user) && (moduleId === 'hr' || moduleId === 'development')) {
      return true;
    }

    // Specific rules based on RBAC.md Matrix
    // HR Submodules:
    if (moduleId === 'hr') {
      // 1. Fitur Payroll & Slip Gaji: HANYA untuk Owner, Manager, HR Officer, dan Finance Officer
      // Supervisor, Section Heads, dan Staf TIDAK BERHAK melihat payroll
      if (submodule.subParam === 'payroll') {
        return this.canAccessPayroll(user);
      }

      // Staf biasa HANYA boleh mengakses fitur self-service operasional:
      // - Presensi / Kehadiran (attendance)
      // - Jadwal Kerja / Shift (shifts)
      // - Pengajuan Istirahat (breaks)
      // - Pengajuan Lembur / SPL (overtime)
      // - SOP Operasional (sop)
      // - Uraian Tugas / Job Description (job-description)
      // - Instruksi Kerja Alat (ika)
      // - Dokumen Resto (documents)
      if (user.accessLevel === 'STAFF' && !this.isHROfficer(user)) {
        const allowedStaffHRSubmodules = [
          'attendance',
          'shifts',
          'breaks',
          'overtime',
          'sop',
          'job-description',
          'ika',
          'documents',
        ];
        return allowedStaffHRSubmodules.includes(submodule.subParam);
      }

      if (submodule.subParam === 'dashboard') {
        return this.isHROfficer(user) || user.accessLevel === 'SUPERVISOR';
      }
      if (submodule.subParam === 'employees') {
        return user.accessLevel === 'SUPERVISOR' || this.isHROfficer(user);
      }
      if (submodule.subParam === 'organization') {
        return user.accessLevel === 'SUPERVISOR' || this.isHROfficer(user);
      }
      if (submodule.subParam === 'configuration') {
        return this.isHROfficer(user);
      }
      if (submodule.subParam === 'reports') {
        return user.accessLevel === 'SUPERVISOR' || this.isHROfficer(user);
      }
      if (submodule.subParam === 'kpi') {
        return this.canViewKpi(user);
      }
      if (submodule.subParam === 'checklist') {
        return user.accessLevel === 'SUPERVISOR' || this.isHROfficer(user);
      }
      return true;
    }

    // CRM Submodules:
    if (moduleId === 'crm') {
      if (user.department === 'CRM') return true;
      if (user.accessLevel === 'SUPERVISOR' && user.department === 'Service') {
        // Service supervisor can view dashboard, reservations and customer list
        return ['dashboard', 'customers', 'reservation', 'calendar'].includes(submodule.subParam);
      }
      return false;
    }

    // Operations Submodules:
    if (moduleId === 'operations') {
      if (['purchasing', 'inventory', 'production'].includes(submodule.subParam)) {
        // Accessible by Kitchen Supervisors or Special Staff (Ulum & Tasnim)
        if (
          user.accessLevel === 'SUPERVISOR' ||
          this.hasResponsibility(user, ['Purchasing', 'Stock', 'Produksi Setengah Jadi'])
        ) {
          return true;
        }
        return false;
      }
      return true;
    }

    // Finance Submodules:
    if (moduleId === 'finance') {
      if (user.department === 'Finance' || this.hasResponsibility(user, 'Accounting & Cash Flow')) {
        return true;
      }
      if (this.hasResponsibility(user, 'Kasir Operasional') || user.accessLevel === 'SUPERVISOR') {
        return submodule.subParam === 'cashier' || submodule.subParam === 'hpp';
      }
      return false;
    }

    // Development Submodules:
    if (moduleId === 'development') {
      if (['branding', 'marketing', 'promotion'].includes(submodule.subParam)) {
        return false; // Only Owner & Manager
      }
      if (['assessment', 'action-plan'].includes(submodule.subParam)) {
        return user.accessLevel === 'SUPERVISOR';
      }
      return true;
    }

    // Content Creator Submodules:
    if (moduleId === 'content') {
      return this.hasResponsibility(user, 'Social Media Production') || user.department === 'Marketing';
    }

    // Reports / MBR:
    if (moduleId === 'reports') {
      return false; // Owner and Manager already returned true above
    }

    return true;
  }

  /**
   * Menentukan visibility level (FULL, VIEW, LIMITED, OWN, NONE)
   */
  public getVisibilityLevel(user: EmployeePersonnel | null, moduleId: string): VisibilityLevel {
    if (!user) return 'NONE';
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return 'FULL';
    }

    if (moduleId === 'dashboard') {
      return user.accessLevel === 'SUPERVISOR' ? 'LIMITED' : 'OWN';
    }

    if (moduleId === 'reports' || moduleId === 'settings') {
      return 'NONE';
    }

    if (moduleId === 'hr') {
      if (this.isHROfficer(user)) return 'FULL';
      return user.accessLevel === 'SUPERVISOR' ? 'LIMITED' : 'NONE';
    }

    if (moduleId === 'crm') {
      if (user.department === 'CRM') return 'FULL';
      if (user.accessLevel === 'SUPERVISOR') return 'LIMITED';
      return 'NONE';
    }

    if (moduleId === 'operations') {
      if (user.accessLevel === 'SUPERVISOR') return 'FULL';
      if (this.hasResponsibility(user, ['Purchasing', 'Stock', 'Produksi Setengah Jadi'])) return 'FULL';
      return 'LIMITED';
    }

    if (moduleId === 'finance') {
      if (user.department === 'Finance') return 'FULL';
      if (this.hasResponsibility(user, 'Kasir Operasional') || user.accessLevel === 'SUPERVISOR') return 'LIMITED';
      return 'NONE';
    }

    if (moduleId === 'development') {
      return user.accessLevel === 'SUPERVISOR' ? 'LIMITED' : 'OWN';
    }

    if (moduleId === 'content') {
      return this.hasResponsibility(user, 'Social Media Production') ? 'FULL' : 'NONE';
    }

    return 'NONE';
  }

  /**
   * Cek apakah user berhak memberikan APPROVAL / Persetujuan
   */
  public canApprove(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    return user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER';
  }

  /**
   * Cek apakah user berhak mendelegasikan / memberikan tugas ke bawahan
   * - OWNER: Bisa memberikan tugas dari tingkat Manager hingga paling bawah.
   * - MANAGER: Bisa memberikan tugas ke seluruh Head, Supervisor, dan Staff.
   * - HEAD: HANYA bisa memberikan tugas kepada anak buahnya di masing-masing divisi.
   * - SUPERVISOR: Bisa memberikan tugas operasional lantai ke tim lapangan.
   * - STAFF: Tidak bisa memberikan tugas.
   */
  public canAssignTask(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    return ['OWNER', 'MANAGER', 'HEAD', 'SUPERVISOR'].includes(user.accessLevel);
  }

  /**
   * Mendapatkan daftar karyawan yang dapat diberikan tugas oleh user yang aktif:
   * 1. Owner TIDAK PERNAH mendapatkan tugas apapun (dikeluarkan dari daftar penerima).
   * 2. Owner bisa menugaskan Manager, Head, Supervisor, dan Staff.
   * 3. Manager bisa menugaskan Head, Supervisor, dan Staff.
   * 4. Head Divisi HANYA bisa menugaskan anak buah di divisinya masing-masing (ex: Head Kitchen hanya menugaskan tim Kitchen).
   * 5. Supervisor bisa menugaskan tim operasional/cleaning.
   */
  public getAssignableEmployees<T extends { id: string; accessLevel?: string; department?: string }>(
    user: EmployeePersonnel | null,
    allEmployees: T[]
  ): T[] {
    if (!user) return [];

    // Filter keluar Owner (Owner tidak boleh menerima tugas apapun)
    const validReceivers = allEmployees.filter(
      (emp) => emp.accessLevel !== 'OWNER' && emp.id !== 'emp-01'
    );

    // 1. OWNER: Bisa memberikan tugas dari tingkat Manager hingga paling bawah
    if (user.accessLevel === 'OWNER') {
      return validReceivers;
    }

    // 2. MANAGER: Bisa memberikan tugas ke Head, Supervisor, dan Staff
    if (user.accessLevel === 'MANAGER') {
      return validReceivers.filter((emp) => emp.id !== user.id);
    }

    // 3. HEAD DEVISI: HANYA bisa memberikan tugas kepada anak buah di masing-masing divisi
    if (user.accessLevel === 'HEAD' || this.isSectionHead(user)) {
      const userDept = (user.department || '').toLowerCase();
      return validReceivers.filter((emp) => {
        if (emp.id === user.id) return false;
        const empDept = (emp.department || '').toLowerCase();
        // Hanya anak buah di divisi yang sama dan bukan Manager
        return empDept === userDept && emp.accessLevel !== 'MANAGER';
      });
    }

    // 4. SUPERVISOR: Bisa memberikan tugas ke tim Operasional Lantai & Cleaning
    if (user.accessLevel === 'SUPERVISOR' || this.isSupervisor(user)) {
      return validReceivers.filter((emp) => {
        if (emp.id === user.id) return false;
        const empDept = (emp.department || '').toLowerCase();
        return (
          ['operations', 'cleaning', 'service'].includes(empDept) &&
          emp.accessLevel === 'STAFF'
        );
      });
    }

    // Staff biasa tidak bisa menugaskan
    return [];
  }

  /**
   * Cek otorisasi untuk 11 Action Verbs
   */
  public canPerformAction(
    user: EmployeePersonnel | null,
    action: ActionVerb,
    resource: string
  ): boolean {
    if (!user) return false;

    // Owner / Super Admin and Manager have universal control and full action permissions
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') return true;

    // Head of Division actions: can assign tasks within division, review, view, create, edit
    if (user.accessLevel === 'HEAD') {
      if (['DELETE', 'MANAGE', 'APPROVE', 'REJECT'].includes(action)) return false;
      return ['ASSIGN', 'REVIEW', 'VIEW', 'CREATE', 'EDIT', 'EXPORT'].includes(action);
    }

    // Supervisor actions: can view, create, edit, assign floor tasks, review
    if (user.accessLevel === 'SUPERVISOR') {
      if (['DELETE', 'MANAGE', 'APPROVE', 'REJECT'].includes(action)) return false;
      return ['ASSIGN', 'REVIEW', 'VIEW', 'CREATE', 'EDIT', 'EXPORT'].includes(action);
    }

    // Staff actions
    if (user.accessLevel === 'STAFF') {
      if (['DELETE', 'CANCEL', 'APPROVE', 'REJECT', 'ASSIGN', 'MANAGE'].includes(action)) {
        return false;
      }
      return ['VIEW', 'CREATE', 'EDIT'].includes(action);
    }

    return false;
  }

  /**
   * Data Scope helper
   */
  public getDataScope(user: EmployeePersonnel | null): DataScope {
    if (!user) return 'SELF';
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') return 'ALL';
    if (user.accessLevel === 'SUPERVISOR') return 'DEPARTMENT';
    return 'SELF';
  }
}

export const permissionService = new PermissionService();
