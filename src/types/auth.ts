import { EmployeePersonnel } from './employee';

export interface AuthSession {
  token: string;
  user: EmployeePersonnel;
  expiresAt: number;
}

export interface AuthState {
  currentUser: EmployeePersonnel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}
