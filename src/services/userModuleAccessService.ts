import { EmployeePersonnel } from '../types/employee';

export interface UserModulePermission {
  employeeId: string;
  allowedModules: string[]; // e.g. ['dashboard', 'hr', 'crm', 'operations', 'finance', 'development', 'content', 'reports', 'settings', 'hpp', 'marketing']
  canApproveChecklists?: boolean;
  canManageHpp?: boolean;
  canManageMarketing?: boolean;
}

const STORAGE_KEY = 'tropical_user_module_permissions_v1';

/**
 * DEFAULT MODULE ASSIGNMENTS PER PERSON:
 * - Heri Setiawan (emp-02 / Manager) -> FULL ACCESS + HR
 * - Tri Hermawanto (emp-01 / Owner) -> FULL ACCESS (Back Office Master)
 * - Putri Okta (emp-03 / Supervisor) -> Operations, Checklist Approval, Service, Cashier
 * - Aqib Latuh (emp-21 / CRM Lead) & Arfani (emp-22 / CRM Staff) -> CRM & WhatsApp Hub
 * - Naila (emp-24 / Content Creator) -> Content Creator & Campaign
 * - Tasnim (emp-07), Ulum (emp-06), Dina (emp-12) -> HPP Calculator & Kitchen/Bar
 * - Ristania Larasati (emp-23 / Finance) -> Finance & Cashier
 * - Maya Anggraini (emp-25 / HR) -> HR & Development
 */
const DEFAULT_PERMISSIONS: Record<string, UserModulePermission> = {
  'emp-01': {
    employeeId: 'emp-01', // Tri Hermawanto (Owner)
    allowedModules: ['dashboard', 'hr', 'crm', 'operations', 'finance', 'development', 'content', 'reports', 'settings', 'hpp', 'marketing'],
    canApproveChecklists: true,
    canManageHpp: true,
    canManageMarketing: true,
  },
  'emp-02': {
    employeeId: 'emp-02', // Heri Setiawan (Manager)
    allowedModules: ['dashboard', 'hr', 'crm', 'operations', 'finance', 'development', 'content', 'reports', 'settings', 'hpp', 'marketing'],
    canApproveChecklists: true,
    canManageHpp: true,
    canManageMarketing: true,
  },
  'emp-03': {
    employeeId: 'emp-03', // Putri Okta (Supervisor)
    allowedModules: ['dashboard', 'operations', 'finance'],
    canApproveChecklists: true,
    canManageHpp: false,
    canManageMarketing: false,
  },
  'emp-06': {
    employeeId: 'emp-06', // Ulum (Cook - Purchasing & HPP)
    allowedModules: ['operations', 'finance', 'hpp'],
    canApproveChecklists: false,
    canManageHpp: true,
    canManageMarketing: false,
  },
  'emp-07': {
    employeeId: 'emp-07', // Tasnim (Cook - Stock & HPP)
    allowedModules: ['operations', 'finance', 'hpp'],
    canApproveChecklists: false,
    canManageHpp: true,
    canManageMarketing: false,
  },
  'emp-12': {
    employeeId: 'emp-12', // Dina (Head Bar - HPP)
    allowedModules: ['operations', 'finance', 'hpp'],
    canApproveChecklists: false,
    canManageHpp: true,
    canManageMarketing: false,
  },
  'emp-21': {
    employeeId: 'emp-21', // Aqib Latuh (CRM Lead)
    allowedModules: ['crm'],
    canApproveChecklists: false,
    canManageHpp: false,
    canManageMarketing: false,
  },
  'emp-22': {
    employeeId: 'emp-22', // Arfani (CRM Staff)
    allowedModules: ['crm'],
    canApproveChecklists: false,
    canManageHpp: false,
    canManageMarketing: false,
  },
  'emp-23': {
    employeeId: 'emp-23', // Ristania Larasati (Finance)
    allowedModules: ['finance', 'operations'],
    canApproveChecklists: false,
    canManageHpp: true,
    canManageMarketing: false,
  },
  'emp-24': {
    employeeId: 'emp-24', // Naila (Content Creator)
    allowedModules: ['content'],
    canApproveChecklists: false,
    canManageHpp: false,
    canManageMarketing: false,
  },
  'emp-25': {
    employeeId: 'emp-25', // Maya Anggraini (HR Officer)
    allowedModules: ['hr', 'development'],
    canApproveChecklists: false,
    canManageHpp: false,
    canManageMarketing: false,
  },
};

class UserModuleAccessService {
  private permissions: Record<string, UserModulePermission>;

  constructor() {
    this.permissions = this.loadPermissions();
  }

  private loadPermissions(): Record<string, UserModulePermission> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[UserModuleAccessService] Failed to parse permissions:', e);
    }
    return { ...DEFAULT_PERMISSIONS };
  }

  public savePermissions(newPermissions: Record<string, UserModulePermission>): void {
    this.permissions = newPermissions;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPermissions));
    } catch (e) {
      console.warn('[UserModuleAccessService] Failed to save permissions:', e);
    }
  }

  public getAllPermissions(): Record<string, UserModulePermission> {
    return { ...this.permissions };
  }

  public getPermissionForUser(employeeId: string): UserModulePermission | null {
    return this.permissions[employeeId] || null;
  }

  public updatePermissionForUser(employeeId: string, updates: Partial<UserModulePermission>): void {
    const current = this.permissions[employeeId] || {
      employeeId,
      allowedModules: ['dashboard'],
    };
    this.permissions[employeeId] = {
      ...current,
      ...updates,
    };
    this.savePermissions(this.permissions);
  }

  public canUserAccessModule(user: EmployeePersonnel | null, moduleId: string): boolean {
    if (!user) return false;
    // Owner & Manager always have full master access
    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return true;
    }

    const perm = this.permissions[user.id];
    if (perm && perm.allowedModules) {
      return perm.allowedModules.includes(moduleId);
    }

    // Default fallback based on department/role
    if (moduleId === 'crm' && (user.department === 'CRM' || user.name.includes('Aqib') || user.name.includes('Arfani'))) return true;
    if (moduleId === 'content' && (user.department === 'Marketing' || user.name.includes('Naila'))) return true;
    if (moduleId === 'hr' && (user.department === 'HR' || user.name.includes('Maya') || user.name.includes('Heri'))) return true;
    if (moduleId === 'finance' && (user.department === 'Finance' || user.name.includes('Ristania'))) return true;
    if (moduleId === 'operations') return true;

    return false;
  }

  public canUserApproveChecklist(user: EmployeePersonnel | null): boolean {
    if (!user) return false;
    // Only Manager & Supervisor (Putri Okta) can approve
    if (user.accessLevel === 'MANAGER' || user.accessLevel === 'OWNER') return true;
    if (user.accessLevel === 'SUPERVISOR' || user.name.includes('Putri Okta')) return true;

    const perm = this.permissions[user.id];
    return !!perm?.canApproveChecklists;
  }
}

export const userModuleAccessService = new UserModuleAccessService();
