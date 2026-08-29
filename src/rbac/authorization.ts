import { Role, Division, PermissionAction, DataScope } from './types';

export function hasRole(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  if (userRole.toUpperCase() === 'MANAGER' || userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'DIRECTOR') return true;
  return allowedRoles.some(r => r.toUpperCase() === userRole.toUpperCase());
}

export function hasDivision(userDivision: Division | undefined, allowedDivisions: Division[]): boolean {
  if (!userDivision) return false;
  if (allowedDivisions.includes('ALL')) return true;
  return allowedDivisions.some(d => d.toUpperCase() === userDivision.toUpperCase());
}

export function hasPermission(
  userRole: Role | undefined,
  userDivision: Division | undefined,
  action: PermissionAction,
  resource: string
): boolean {
  if (!userRole) return false;
  if (userRole.toUpperCase() === 'MANAGER' || userRole.toUpperCase() === 'ADMIN') return true;
  if (action === 'READ') return true;
  return false;
}

export function getDataScope(userRole: Role | undefined): DataScope {
  if (!userRole) return 'SELF';
  if (userRole.toUpperCase() === 'MANAGER' || userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'DIRECTOR') return 'ALL';
  return 'DIVISION';
}
