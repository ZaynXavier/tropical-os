import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { EmployeePersonnel, AccessLevel, Department, AdditionalResponsibility } from '../types/employee';
import { AuthSession, LoginCredentials } from '../types/auth';
import { ActionVerb, DataScope } from '../types/permissions';
import { NavigationModule, SubmoduleItem } from '../types/navigation';
import { authService } from '../services/authService';
import { permissionService } from '../services/permissionService';

export interface AuthContextValue {
  currentUser: EmployeePersonnel | null;
  user: EmployeePersonnel | null; // Alias for backward compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: EmployeePersonnel; error?: string }>;
  logout: () => void;
  switchUser: (employeeId: string) => void;
  // RBAC Helpers
  hasRole: (role: AccessLevel) => boolean;
  hasAnyRole: (roles: AccessLevel[]) => boolean;
  hasDepartment: (department: Department) => boolean;
  hasResponsibility: (responsibility: AdditionalResponsibility | AdditionalResponsibility[]) => boolean;
  hasPermission: (action: ActionVerb, resource?: string) => boolean;
  canViewModule: (module: NavigationModule) => boolean;
  canViewSubmodule: (moduleId: string, submodule: SubmoduleItem) => boolean;
  getDataScope: () => DataScope;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<EmployeePersonnel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    try {
      const activeSession = authService.getSession();
      setSession(activeSession);
      setCurrentUser(activeSession.user);
    } catch (e) {
      console.error('[AuthProvider] Failed to init session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        const activeSession = authService.getSession();
        setSession(activeSession);
        setCurrentUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setSession(null);
    setCurrentUser(null);
  };

  const switchUser = (employeeId: string) => {
    const updated = authService.switchUser(employeeId);
    if (updated) {
      const activeSession = authService.getSession();
      setSession(activeSession);
      setCurrentUser(updated);
    }
  };

  // RBAC Helper functions bound to currentUser
  const hasRole = (role: AccessLevel) => permissionService.hasRole(currentUser, role);
  const hasAnyRole = (roles: AccessLevel[]) => permissionService.hasAnyRole(currentUser, roles);
  const hasDepartment = (department: Department) => permissionService.hasDepartment(currentUser, department);
  const hasResponsibility = (resp: AdditionalResponsibility | AdditionalResponsibility[]) =>
    permissionService.hasResponsibility(currentUser, resp);
  const hasPermission = (action: ActionVerb, resource = 'GLOBAL') =>
    permissionService.canPerformAction(currentUser, action, resource);
  const canViewModule = (mod: NavigationModule) => permissionService.canViewModule(currentUser, mod);
  const canViewSubmodule = (modId: string, sub: SubmoduleItem) =>
    permissionService.canViewSubmodule(currentUser, modId, sub);
  const getDataScope = () => permissionService.getDataScope(currentUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      user: currentUser,
      isAuthenticated: !!currentUser && !!session,
      isLoading,
      session,
      login,
      logout,
      switchUser,
      hasRole,
      hasAnyRole,
      hasDepartment,
      hasResponsibility,
      hasPermission,
      canViewModule,
      canViewSubmodule,
      getDataScope,
    }),
    [currentUser, session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
