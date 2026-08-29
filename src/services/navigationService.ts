import { EmployeePersonnel } from '../types/employee';
import { NavigationModule, SubmoduleItem, BreadcrumbItem } from '../types/navigation';
import { MASTER_NAVIGATION } from '../config/navigation';
import { permissionService } from './permissionService';

class NavigationService {
  /**
   * Mengambil daftar navigasi yang diizinkan untuk user saat ini
   */
  public getFilteredNavigation(user: EmployeePersonnel | null): NavigationModule[] {
    if (!user) return [];

    return MASTER_NAVIGATION.filter((mod) => {
      return permissionService.canViewModule(user, mod);
    }).map((mod) => {
      // Filter submodules inside
      if (!mod.submodules || mod.submodules.length === 0) {
        return mod;
      }

      const filteredSubs = mod.submodules.filter((sub) =>
        permissionService.canViewSubmodule(user, mod.id, sub)
      );

      return {
        ...mod,
        submodules: filteredSubs,
      };
    });
  }

  /**
   * Mengambil modul berdasarkan pathname (contoh: '/hr')
   */
  public getModuleByPath(pathname: string): NavigationModule | undefined {
    const cleanPath = pathname.split('?')[0];
    return MASTER_NAVIGATION.find((m) => m.path === cleanPath);
  }

  /**
   * Mengambil modul berdasarkan ID (contoh: 'hr')
   */
  public getModuleById(id: string): NavigationModule | undefined {
    return MASTER_NAVIGATION.find((m) => m.id === id);
  }

  /**
   * Mengambil submodule berdasarkan modul dan parameter query sub
   */
  public getSubmodule(moduleId: string, subParam: string | null): SubmoduleItem | undefined {
    const mod = this.getModuleById(moduleId);
    if (!mod || !mod.submodules) return undefined;
    if (!subParam) return mod.submodules[0];
    return mod.submodules.find((s) => s.subParam === subParam) || mod.submodules[0];
  }

  /**
   * Menghasilkan breadcrumb otomatis berdasarkan pathname dan sub param
   */
  public getBreadcrumbs(pathname: string, subParam: string | null): BreadcrumbItem[] {
    const cleanPath = pathname.split('?')[0];
    const crumbs: BreadcrumbItem[] = [
      { label: 'TropicalOS', path: '/dashboard' },
    ];

    const currentMod = this.getModuleByPath(cleanPath);
    if (!currentMod) {
      if (cleanPath === '/login') return [{ label: 'Login Masuk Sistem', path: '/login' }];
      return crumbs;
    }

    if (currentMod.id === 'dashboard') {
      crumbs.push({ label: 'Dashboard', path: '/dashboard', isActive: true });
      return crumbs;
    }

    crumbs.push({
      label: currentMod.name,
      path: currentMod.path,
      isActive: !subParam,
    });

    if (subParam && currentMod.submodules) {
      const activeSub = currentMod.submodules.find((s) => s.subParam === subParam);
      if (activeSub) {
        crumbs.push({
          label: activeSub.name,
          path: `${currentMod.path}?sub=${activeSub.subParam}`,
          isActive: true,
        });
      }
    }

    return crumbs;
  }
}

export const navigationService = new NavigationService();
