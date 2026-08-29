import { EmployeePersonnel } from '../types/employee';
import { AuthSession, LoginCredentials } from '../types/auth';
import { MASTER_EMPLOYEES, DEFAULT_EMPLOYEE_ID } from '../config/employees';
import { api, getStoredSession, setStoredSession, clearStoredSession } from './api';

class AuthService {
  /**
   * Mengambil session aktif dari storage atau fallback ke default persona (Super Admin)
   */
  public getSession(): AuthSession {
    try {
      const stored = getStoredSession();
      if (stored && stored.user) {
        // Verify user still exists in master list
        const matched = MASTER_EMPLOYEES.find((emp) => emp.id === stored.user.id || emp.email === stored.user.email);
        if (matched) {
          return {
            ...stored,
            user: matched,
          };
        }
        // If stored user is no longer in master employees, purge old cache
        clearStoredSession();
      }
    } catch (e) {
      console.warn('[AuthService] Failed to read session from localStorage, falling back to default:', e);
    }

    // Default session is always Super Admin
    const defaultUser = MASTER_EMPLOYEES.find((emp) => emp.id === DEFAULT_EMPLOYEE_ID) || MASTER_EMPLOYEES[0];
    const initialSession: AuthSession = {
      token: `local-token-${defaultUser.id}`,
      user: defaultUser,
      expiresAt: Date.now() + 86400 * 1000 * 7, // 7 days
    };
    this.saveSession(initialSession);
    return initialSession;
  }

  /**
   * Menyimpan session ke localStorage
   */
  public saveSession(session: AuthSession): void {
    setStoredSession(session);
  }

  /**
   * Mengambil user saat ini
   */
  public getCurrentUser(): EmployeePersonnel {
    return this.getSession().user;
  }

  /**
   * Login via endpoint Laravel API (/auth/login) dengan fallback lokal jika backend offline
   */
  public async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: EmployeePersonnel; token?: string; error?: string }> {
    const cleanEmail = credentials.email?.trim().toLowerCase() || '';
    const cleanPassword = credentials.password?.trim() || '';

    if (!cleanEmail) {
      return {
        success: false,
        error: 'Silakan masukkan email atau ID karyawan terdaftar.',
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        error: 'Silakan masukkan kata sandi (password) Anda.',
      };
    }

    // 1. Coba login ke Backend Laravel API
    try {
      const response = await api.post('/auth/login', {
        email: cleanEmail,
        password: cleanPassword,
        device_name: 'TropicalOS_PWA',
      });

      if (response.data && response.data.success && response.data.data) {
        const { token, user: apiUser } = response.data.data;
        const matched = MASTER_EMPLOYEES.find((emp) => emp.email.toLowerCase() === cleanEmail) || {
          id: `emp-superadmin`,
          employeeNo: apiUser.employee?.employee_code || `TG-ADM-001`,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          division: apiUser.division,
          isActive: apiUser.is_active,
        } as EmployeePersonnel;

        const session: AuthSession = {
          token,
          user: matched,
          expiresAt: Date.now() + 86400 * 1000 * 7,
        };

        this.saveSession(session);
        return {
          success: true,
          user: matched,
          token,
        };
      }
    } catch (apiError: any) {
      console.warn('[AuthService] Live API login attempt responded with error, trying local validation:', apiError?.response?.data?.message || apiError.message);
    }

    // 2. Fallback Validasi Lokal (Untuk kelancaran demo & offline mode)
    const user = MASTER_EMPLOYEES.find(
      (emp) => emp.email.toLowerCase() === cleanEmail || emp.employeeNo.toLowerCase() === cleanEmail || emp.name.toLowerCase() === cleanEmail
    );

    if (!user) {
      return {
        success: false,
        error: 'Email atau ID akun tidak terdaftar. Periksa kembali data Anda.',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Status akun tidak aktif.',
      };
    }

    if (cleanPassword.length < 4) {
      return {
        success: false,
        error: 'Kata sandi minimal terdiri dari 4 karakter.',
      };
    }

    const session: AuthSession = {
      token: `auth-token-${user.id}-${Date.now()}`,
      user,
      expiresAt: Date.now() + 86400 * 1000 * 7,
    };

    this.saveSession(session);
    return {
      success: true,
      user,
      token: session.token,
    };
  }

  /**
   * Berpindah user / persona secara instan untuk testing RBAC
   */
  public switchUser(employeeId: string): EmployeePersonnel | null {
    const targetUser = MASTER_EMPLOYEES.find((emp) => emp.id === employeeId);
    if (!targetUser) {
      console.error(`[AuthService] Target employeeId "${employeeId}" not found.`);
      return null;
    }

    const session: AuthSession = {
      token: `mock-token-${targetUser.id}-${Date.now()}`,
      user: targetUser,
      expiresAt: Date.now() + 86400 * 1000 * 7,
    };

    this.saveSession(session);
    return targetUser;
  }

  /**
   * Logout dan revoke token
   */
  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    clearStoredSession();
  }

  /**
   * Mengambil semua daftar personel
   */
  public getAllPersonnel(): EmployeePersonnel[] {
    return MASTER_EMPLOYEES;
  }
}

export { AuthService };
export const authService = new AuthService();
