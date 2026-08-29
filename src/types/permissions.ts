import { AccessLevel, Department, AdditionalResponsibility } from './employee';

export type ActionVerb =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'CANCEL'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'REVIEW'
  | 'EXPORT'
  | 'MANAGE';

export type VisibilityLevel = 'FULL' | 'VIEW' | 'LIMITED' | 'OWN' | 'NONE';

export type DataScope = 'ALL' | 'DEPARTMENT' | 'SELF';

export interface PermissionCheckContext {
  accessLevel: AccessLevel;
  department: Department;
  additionalResponsibilities: AdditionalResponsibility[];
  targetEmployeeId?: string;
  currentUserId?: string;
}
