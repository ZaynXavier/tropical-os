import { AccessLevel, Department, AdditionalResponsibility } from './employee';
import { VisibilityLevel } from './permissions';

export interface SubmoduleItem {
  id: string;
  name: string;
  path: string;
  subParam: string;
  description: string;
  badge?: string;
  badgeColor?: 'purple' | 'pink' | 'emerald' | 'amber' | 'rose' | 'blue';
  allowedRoles?: AccessLevel[];
  allowedDepartments?: Department[];
  requiredResponsibilities?: AdditionalResponsibility[];
}

export interface NavigationModule {
  id: string;
  name: string;
  path: string;
  iconName: string;
  description: string;
  badge?: string;
  badgeColor?: 'purple' | 'pink' | 'emerald' | 'amber' | 'rose' | 'blue';
  allowedRoles?: AccessLevel[];
  allowedDepartments?: Department[];
  requiredResponsibilities?: AdditionalResponsibility[];
  submodules?: SubmoduleItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}
