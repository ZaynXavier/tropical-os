export type Role = 'MANAGER' | 'STAFF' | 'ADMIN' | 'DIRECTOR' | string;
export type Division = 'KITCHEN' | 'SERVICE' | 'BAR' | 'FINANCE' | 'MANAGEMENT' | string;
export type PermissionAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | string;
export type DataScope = 'ALL' | 'DIVISION' | 'SELF' | string;

export interface UserProfile {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  division: Division;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
