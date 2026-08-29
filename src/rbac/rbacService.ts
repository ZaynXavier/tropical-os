import { Role, Division, PermissionAction, DataScope } from './types';
import { hasRole, hasDivision, hasPermission, getDataScope } from './authorization';

export const RbacService = {
  hasRole,
  hasDivision,
  hasPermission,
  getDataScope
};
