import {
  Employee,
  Department,
  AccessLevel,
  EmployeeFilterParams,
  EmployeeStatistics,
  EmploymentStatus,
} from '../types/employee';
import { INITIAL_EMPLOYEES } from '../data/employees';

const STORAGE_KEY = 'tropicalos_master_employees';

// Helper to simulate realistic async network delay
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

class EmployeeServiceClass {
  private getStoredEmployees(): Employee[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[EmployeeService] Error loading employees from localStorage:', e);
    }
    // Initialize with master 24 personnel
    this.saveToStorage(INITIAL_EMPLOYEES);
    return INITIAL_EMPLOYEES;
  }

  private saveToStorage(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('[EmployeeService] Error saving employees to localStorage:', e);
    }
  }

  /**
   * Get all employees with optional filtering
   */
  public async getEmployees(params?: EmployeeFilterParams): Promise<Employee[]> {
    await delay(150);
    let list = this.getStoredEmployees();

    if (!params) return list;

    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.trim().toLowerCase();
      list = list.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(q) ||
          emp.employeeCode.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.phone.includes(q) ||
          emp.primaryPosition.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          emp.additionalResponsibilities.some((r) => r.toLowerCase().includes(q))
      );
    }

    if (params.department && params.department !== 'ALL') {
      list = list.filter((emp) => emp.department === params.department);
    }

    if (params.accessLevel && params.accessLevel !== 'ALL') {
      list = list.filter((emp) => emp.accessLevel === params.accessLevel);
    }

    if (params.employmentStatus && params.employmentStatus !== 'ALL') {
      list = list.filter((emp) => emp.employmentStatus === params.employmentStatus);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((emp) => emp.status === params.status);
    }

    return list;
  }

  /**
   * Backward-compat getAllEmployees wrapper
   */
  public async getAllEmployees(): Promise<{ data: Employee[]; error?: string }> {
    const data = await this.getEmployees();
    return { data };
  }

  /**
   * Get employee by ID or Code
   */
  public async getEmployeeById(idOrCode: string): Promise<Employee | null> {
    await delay(100);
    const list = this.getStoredEmployees();
    const found = list.find((emp) => emp.id === idOrCode || emp.employeeCode === idOrCode || emp.employeeNo === idOrCode);
    return found || null;
  }

  /**
   * Get all currently active employees
   */
  public async getActiveEmployees(): Promise<Employee[]> {
    await delay(120);
    const list = this.getStoredEmployees();
    return list.filter((emp) => emp.isActive && emp.status === 'ACTIVE');
  }

  /**
   * Get employees by Department
   */
  public async getEmployeesByDepartment(department: Department): Promise<Employee[]> {
    await delay(120);
    const list = this.getStoredEmployees();
    return list.filter((emp) => emp.department === department);
  }

  /**
   * Get employees by Access Level
   */
  public async getEmployeesByAccessLevel(accessLevel: AccessLevel): Promise<Employee[]> {
    await delay(120);
    const list = this.getStoredEmployees();
    return list.filter((emp) => emp.accessLevel === accessLevel);
  }

  /**
   * Calculate real-time statistics
   */
  public async getEmployeeStatistics(): Promise<EmployeeStatistics> {
    await delay(100);
    const list = this.getStoredEmployees();

    const byDept: Record<Department, number> = {
      Executive: 0,
      Management: 0,
      Operations: 0,
      Kitchen: 0,
      Bar: 0,
      Service: 0,
      Cleaning: 0,
      CRM: 0,
      Finance: 0,
      Marketing: 0,
      HR: 0,
    };

    const byAccess: Record<AccessLevel, number> = {
      OWNER: 0,
      MANAGER: 0,
      HEAD: 0,
      SUPERVISOR: 0,
      STAFF: 0,
    };

    const byEmployment: Record<EmploymentStatus, number> = {
      PERMANENT: 0,
      CONTRACT: 0,
      PROBATION: 0,
      PART_TIME: 0,
    };

    let activeCount = 0;
    let inactiveCount = 0;
    let onLeaveCount = 0;

    list.forEach((emp) => {
      if (emp.status === 'ACTIVE' && emp.isActive) activeCount++;
      else if (emp.status === 'INACTIVE' || !emp.isActive) inactiveCount++;
      else if (emp.status === 'ON_LEAVE') onLeaveCount++;

      if (byDept[emp.department] !== undefined) byDept[emp.department]++;
      if (byAccess[emp.accessLevel] !== undefined) byAccess[emp.accessLevel]++;
      if (byEmployment[emp.employmentStatus] !== undefined) byEmployment[emp.employmentStatus]++;
    });

    return {
      totalEmployees: list.length,
      activeEmployees: activeCount,
      inactiveEmployees: inactiveCount,
      onLeaveEmployees: onLeaveCount,
      byDepartment: byDept,
      byAccessLevel: byAccess,
      byEmploymentStatus: byEmployment,
    };
  }

  /**
   * Create a new employee
   */
  public async createEmployee(
    data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }
  ): Promise<Employee> {
    await delay(250);
    const list = this.getStoredEmployees();

    // Check duplicate code or email
    const duplicateCode = list.some((e) => e.employeeCode.toLowerCase() === data.employeeCode.toLowerCase());
    if (duplicateCode) {
      throw new Error(`Kode Karyawan "${data.employeeCode}" sudah terdaftar.`);
    }

    const duplicateEmail = list.some((e) => e.email.toLowerCase() === data.email.toLowerCase());
    if (duplicateEmail) {
      throw new Error(`Email "${data.email}" sudah digunakan.`);
    }

    const now = new Date().toISOString();
    const newId = `emp-${String(list.length + 1).padStart(2, '0')}-${Date.now().toString(36).slice(-4)}`;

    const newEmployee: Employee = {
      ...data,
      id: newId,
      name: data.fullName,
      employeeNo: data.employeeCode,
      isActive: data.isActive !== undefined ? data.isActive : data.status === 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      role: data.primaryPosition,
      division: data.department,
    };

    const updatedList = [newEmployee, ...list];
    this.saveToStorage(updatedList);
    return newEmployee;
  }

  /**
   * Backward-compat addEmployee wrapper
   */
  public async addEmployee(employee: any): Promise<{ success: boolean; data?: Employee; error?: string }> {
    try {
      const created = await this.createEmployee({
        employeeCode: employee.code || employee.emp_id || `TG-NEW-${Date.now().toString().slice(-3)}`,
        employeeNo: employee.code || employee.emp_id || `TG-NEW-${Date.now().toString().slice(-3)}`,
        fullName: employee.name || 'New Staff',
        name: employee.name || 'New Staff',
        email: employee.email || `staff.${Date.now()}@tropicalgarden.id`,
        phone: employee.phone || '-',
        gender: employee.gender || 'MALE',
        employmentStatus: employee.employmentStatus || 'CONTRACT',
        joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
        department: employee.department || 'Operations',
        primaryPosition: employee.role || employee.primaryPosition || 'Staff',
        accessLevel: employee.accessLevel || 'STAFF',
        additionalResponsibilities: employee.additionalResponsibilities || [],
        supervisorId: employee.supervisorId || 'emp-02',
        managerId: 'emp-02',
        status: 'ACTIVE',
        notes: employee.notes || '',
      });
      return { success: true, data: created };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Update existing employee
   */
  public async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    await delay(250);
    const list = this.getStoredEmployees();
    const index = list.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error(`Karyawan dengan ID "${id}" tidak ditemukan.`);
    }

    const current = list[index];

    // If changing code/email, check unique
    if (updates.employeeCode && updates.employeeCode !== current.employeeCode) {
      const exists = list.some((e) => e.id !== id && e.employeeCode.toLowerCase() === updates.employeeCode!.toLowerCase());
      if (exists) throw new Error(`Kode Karyawan "${updates.employeeCode}" sudah digunakan.`);
    }

    if (updates.email && updates.email !== current.email) {
      const exists = list.some((e) => e.id !== id && e.email.toLowerCase() === updates.email!.toLowerCase());
      if (exists) throw new Error(`Email "${updates.email}" sudah digunakan.`);
    }

    const updated: Employee = {
      ...current,
      ...updates,
      name: updates.fullName || updates.name || current.fullName,
      fullName: updates.fullName || updates.name || current.fullName,
      employeeNo: updates.employeeCode || updates.employeeNo || current.employeeCode,
      employeeCode: updates.employeeCode || updates.employeeNo || current.employeeCode,
      isActive: updates.status ? updates.status === 'ACTIVE' : updates.isActive !== undefined ? updates.isActive : current.isActive,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  /**
   * Deactivate an employee (sets status to INACTIVE and isActive to false)
   */
  public async deactivateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, {
      status: 'INACTIVE',
      isActive: false,
    });
  }

  /**
   * Activate an employee (sets status to ACTIVE and isActive to true)
   */
  public async activateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, {
      status: 'ACTIVE',
      isActive: true,
    });
  }

  /**
   * Toggle active status
   */
  public async toggleEmployeeStatus(id: string): Promise<Employee> {
    const emp = await this.getEmployeeById(id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');
    if (emp.isActive && emp.status === 'ACTIVE') {
      return this.deactivateEmployee(id);
    } else {
      return this.activateEmployee(id);
    }
  }

  /**
   * Reset database back to original 24 personnel
   */
  public async resetToInitial(): Promise<Employee[]> {
    await delay(200);
    this.saveToStorage(INITIAL_EMPLOYEES);
    return INITIAL_EMPLOYEES;
  }

  /**
   * Delete an employee (manager only action, with protection for Owner & GM)
   */
  public async deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
    await delay(200);
    const list = this.getStoredEmployees();
    const target = list.find((e) => e.id === id);

    if (!target) return { success: false, error: 'Karyawan tidak ditemukan.' };

    if (target.accessLevel === 'OWNER' || target.employeeCode === 'TG-OWN-001') {
      return { success: false, error: 'Akun Owner tidak dapat dihapus.' };
    }

    if (target.employeeCode === 'TG-MGR-001') {
      return { success: false, error: 'Akun General Manager tidak dapat dihapus.' };
    }

    const filtered = list.filter((e) => e.id !== id);
    this.saveToStorage(filtered);
    return { success: true };
  }

  /**
   * Helper for self service view: get profile of current user
   */
  public async getCurrentEmployeeProfile(empIdentifier?: string): Promise<{ data: Employee | null; error?: string }> {
    await delay(100);
    const list = this.getStoredEmployees();
    if (empIdentifier) {
      const q = empIdentifier.toLowerCase().trim();
      const found = list.find(
        (e) =>
          e.id === empIdentifier ||
          e.employeeCode.toLowerCase() === q ||
          e.email.toLowerCase() === q ||
          e.fullName.toLowerCase() === q
      );
      if (found) return { data: found };
    }
    return { data: list[0] || null };
  }

  /**
   * Helper for self service view: update self profile
   */
  public async updateSelfProfile(
    empId: string,
    updates: Partial<Employee>
  ): Promise<{ data?: Employee; error?: string }> {
    try {
      const updated = await this.updateEmployee(empId, updates);
      return { data: updated };
    } catch (err: any) {
      return { error: err.message || 'Gagal memperbarui profil' };
    }
  }
}

export type EmployeeData = Employee;

export const employeeService = new EmployeeServiceClass();
export const EmployeeService = employeeService; // alias
