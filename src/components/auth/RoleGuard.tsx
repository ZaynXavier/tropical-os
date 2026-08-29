import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AccessLevel, Department, AdditionalResponsibility } from '../../types/employee';
import { PermissionDenied } from '../common/PermissionDenied';
import { navigationService } from '../../services/navigationService';
import { permissionService } from '../../services/permissionService';

interface RoleGuardProps {
  children: React.ReactNode;
  moduleId?: string;
  submoduleParam?: string;
  allowedRoles?: AccessLevel[];
  allowedDepartments?: Department[];
  requiredResponsibilities?: AdditionalResponsibility[];
  moduleName?: string; // compatibility
  allowedDivisions?: string[]; // compatibility
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  moduleId,
  submoduleParam,
  allowedRoles,
  allowedDepartments,
  requiredResponsibilities,
  moduleName,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <PermissionDenied customReason="Silakan masuk ke akun Anda terlebih dahulu." />;
  }

  const activeModuleId = moduleId || moduleName;

  // 1. If explicit allowedRoles given
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.accessLevel)) {
      return (
        <PermissionDenied
          moduleName={activeModuleId || 'Modul Ini'}
          requiredRole={allowedRoles.join(' / ')}
        />
      );
    }
  }

  // 2. If explicit allowedDepartments given
  if (allowedDepartments && allowedDepartments.length > 0) {
    if (
      currentUser.accessLevel !== 'OWNER' &&
      currentUser.accessLevel !== 'MANAGER' &&
      !allowedDepartments.includes(currentUser.department)
    ) {
      return (
        <PermissionDenied
          moduleName={activeModuleId || 'Modul Ini'}
          customReason={`Modul ini dikhususkan untuk departemen: ${allowedDepartments.join(', ')}.`}
        />
      );
    }
  }

  // 3. If explicit requiredResponsibilities given
  if (requiredResponsibilities && requiredResponsibilities.length > 0) {
    if (
      currentUser.accessLevel !== 'OWNER' &&
      currentUser.accessLevel !== 'MANAGER' &&
      !permissionService.hasResponsibility(currentUser, requiredResponsibilities)
    ) {
      return (
        <PermissionDenied
          moduleName={activeModuleId || 'Modul Ini'}
          customReason={`Modul ini membutuhkan tanggung jawab khusus: ${requiredResponsibilities.join(', ')}.`}
        />
      );
    }
  }

  // 4. Module-level check via navigation & RBAC definitions
  if (activeModuleId) {
    const mod = navigationService.getModuleById(activeModuleId);
    if (mod) {
      const canView = permissionService.canViewModule(currentUser, mod);
      if (!canView) {
        return (
          <PermissionDenied
            moduleName={mod.name}
            requiredRole="OWNER / MANAGER / Role Terkait"
          />
        );
      }

      // If submoduleParam is provided, check submodule
      if (submoduleParam && mod.submodules) {
        const sub = mod.submodules.find((s) => s.subParam === submoduleParam);
        if (sub) {
          const canViewSub = permissionService.canViewSubmodule(currentUser, mod.id, sub);
          if (!canViewSub) {
            return (
              <PermissionDenied
                moduleName={`${mod.name} > ${sub.name}`}
                requiredRole="Otorisasi Khusus Divisi"
              />
            );
          }
        }
      }
    }
  }

  return <>{children}</>;
};
