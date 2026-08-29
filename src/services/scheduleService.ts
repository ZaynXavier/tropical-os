import {
  Shift,
  EmployeeSchedule,
  EnrichedEmployeeSchedule,
  ScheduleFilterParams,
  CreateScheduleInput,
  BulkScheduleInput,
  ScheduleConflict,
  DailyRosterSummary,
  DepartmentCoverage,
  WeeklyRosterSummary,
} from '../types/schedule';
import { OFFICIAL_SHIFTS } from '../data/mockShifts';
import { INITIAL_SCHEDULES } from '../data/mockSchedules';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { EmployeePersonnel } from '../types/employee';
import { hrConfigurationService } from './hrConfigurationService';

const SCHEDULES_STORAGE_KEY = 'tropicalos_master_schedules';
const SHIFTS_STORAGE_KEY = 'tropicalos_master_shifts';

export const DEPARTMENT_DAILY_REQUIREMENTS: Record<string, number> = {
  Kitchen: 4,
  Bar: 2,
  Service: 4,
  Cleaning: 1,
  CRM: 1,
  Operations: 1,
  Management: 1,
};

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

class ScheduleServiceClass {
  // =========================================================================
  // STORAGE HELPERS
  // =========================================================================

  private getStoredShifts(): Shift[] {
    try {
      const stored = localStorage.getItem(SHIFTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ScheduleService] Error reading shifts from storage:', e);
    }
    this.saveShifts(OFFICIAL_SHIFTS);
    return OFFICIAL_SHIFTS;
  }

  private saveShifts(shifts: Shift[]): void {
    try {
      localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
    } catch (e) {
      console.error('[ScheduleService] Error saving shifts to storage:', e);
    }
  }

  private getStoredSchedules(): EmployeeSchedule[] {
    try {
      const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ScheduleService] Error reading schedules from storage:', e);
    }
    this.saveSchedules(INITIAL_SCHEDULES);
    return INITIAL_SCHEDULES;
  }

  private saveSchedules(schedules: EmployeeSchedule[]): void {
    try {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    } catch (e) {
      console.error('[ScheduleService] Error saving schedules to storage:', e);
    }
  }

  // =========================================================================
  // MASTER SHIFT METHODS
  // =========================================================================

  public async getShifts(): Promise<Shift[]> {
    await delay(50);
    try {
      const hrShifts = await hrConfigurationService.getShiftConfiguration();
      if (hrShifts && hrShifts.length > 0) {
        return hrShifts.map((s) => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          scheduledDurationMinutes: s.scheduledDurationMinutes,
          gracePeriodMinutes: s.gracePeriodMinutes,
          status: s.status,
          description: s.description,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));
      }
    } catch {
      // fallback
    }
    return this.getStoredShifts();
  }

  public async getShiftById(id: string): Promise<Shift | null> {
    await delay(40);
    const shifts = await this.getShifts();
    return shifts.find((s) => s.id === id) || null;
  }

  // =========================================================================
  // SCHEDULE QUERY METHODS
  // =========================================================================

  public async getSchedules(filter?: ScheduleFilterParams): Promise<EmployeeSchedule[]> {
    await delay(70);
    let list = this.getStoredSchedules();

    if (!filter) return list;

    if (filter.employeeId) {
      list = list.filter((s) => s.employeeId === filter.employeeId);
    }

    if (filter.shiftId && filter.shiftId !== 'ALL') {
      list = list.filter((s) => s.shiftId === filter.shiftId);
    }

    if (filter.date) {
      list = list.filter((s) => s.date === filter.date);
    }

    if (filter.startDate) {
      list = list.filter((s) => s.date >= filter.startDate!);
    }

    if (filter.endDate) {
      list = list.filter((s) => s.date <= filter.endDate!);
    }

    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((s) => s.status === filter.status);
    }

    if (filter.department && filter.department !== 'ALL') {
      const empsInDept = new Set(
        INITIAL_EMPLOYEES.filter((e) => e.department === filter.department).map((e) => e.id)
      );
      list = list.filter((s) => empsInDept.has(s.employeeId));
    }

    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchedEmpIds = new Set(
        INITIAL_EMPLOYEES.filter(
          (e) =>
            e.fullName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            e.primaryPosition.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q)
        ).map((e) => e.id)
      );
      list = list.filter(
        (s) =>
          matchedEmpIds.has(s.employeeId) ||
          (s.supervisorNote && s.supervisorNote.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Sort chronologically by date, then shiftId
    return list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.shiftId.localeCompare(b.shiftId);
    });
  }

  public async getScheduleById(id: string): Promise<EmployeeSchedule | null> {
    await delay(40);
    const list = this.getStoredSchedules();
    return list.find((s) => s.id === id) || null;
  }

  public async getSchedulesByDate(date: string): Promise<EmployeeSchedule[]> {
    return this.getSchedules({ date });
  }

  public async getSchedulesByEmployee(employeeId: string): Promise<EmployeeSchedule[]> {
    return this.getSchedules({ employeeId });
  }

  public async getSchedulesByShift(shiftId: string): Promise<EmployeeSchedule[]> {
    return this.getSchedules({ shiftId });
  }

  public async getEmployeeScheduleForDate(
    employeeId: string,
    date: string
  ): Promise<EmployeeSchedule | null> {
    await delay(40);
    const list = this.getStoredSchedules();
    return (
      list.find(
        (s) => s.employeeId === employeeId && s.date === date && s.status !== 'CANCELLED'
      ) || null
    );
  }

  public async getUnassignedEmployees(date: string): Promise<EmployeePersonnel[]> {
    const schedules = await this.getSchedulesByDate(date);
    const scheduledEmpIds = new Set(
      schedules.filter((s) => s.status !== 'CANCELLED').map((s) => s.employeeId)
    );
    return INITIAL_EMPLOYEES.filter(
      (e) => e.id !== 'emp-01' && e.status === 'ACTIVE' && !scheduledEmpIds.has(e.id)
    );
  }

  // =========================================================================
  // ENRICHMENT & SUMMARY HELPERS
  // =========================================================================

  public async getEnrichedSchedule(
    schedule: EmployeeSchedule
  ): Promise<EnrichedEmployeeSchedule> {
    const shifts = this.getStoredShifts();
    const employee = INITIAL_EMPLOYEES.find((e) => e.id === schedule.employeeId);
    const shift = shifts.find((s) => s.id === schedule.shiftId);

    return {
      ...schedule,
      employee,
      shift,
    };
  }

  public async getDailyRosterSummary(date: string): Promise<DailyRosterSummary> {
    const schedules = await this.getSchedulesByDate(date);
    const activeSchedules = schedules.filter((s) => s.status !== 'CANCELLED');

    const shiftPagiCount = activeSchedules.filter((s) => s.shiftId === 'shift-pagi').length;
    const shiftSiangCount = activeSchedules.filter((s) => s.shiftId === 'shift-siang').length;
    const totalScheduled = activeSchedules.length;

    // Total active personnel eligible for shifts (23 excluding Owner)
    const rosterStaff = INITIAL_EMPLOYEES.filter((e) => e.id !== 'emp-01' && e.status === 'ACTIVE');
    const totalEmployees = rosterStaff.length;
    const scheduledEmpIds = new Set(activeSchedules.map((s) => s.employeeId));
    const unassignedCount = rosterStaff.filter((e) => !scheduledEmpIds.has(e.id)).length;
    const offCount = unassignedCount;

    // Department Coverage Calculations
    const operationalDepts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Operations'];
    const coverages: DepartmentCoverage[] = operationalDepts.map((dept) => {
      const required = DEPARTMENT_DAILY_REQUIREMENTS[dept] || 1;
      const scheduledCount = activeSchedules.filter((s) => {
        const emp = INITIAL_EMPLOYEES.find((e) => e.id === s.employeeId);
        return emp?.department === dept;
      }).length;

      const percentage = Math.round((scheduledCount / required) * 100);
      let status: DepartmentCoverage['status'] = 'OPTIMAL';
      if (percentage < 50) status = 'UNDERSTAFFED';
      else if (percentage < 75) status = 'MINIMUM';
      else if (percentage < 100) status = 'ADEQUATE';

      return {
        department: dept,
        requiredStaff: required,
        scheduledStaff: scheduledCount,
        coveragePercentage: percentage,
        status,
      };
    });

    return {
      date,
      totalEmployees,
      totalScheduled,
      shiftPagiCount,
      shiftSiangCount,
      offCount,
      unassignedCount,
      coverages,
    };
  }

  public async getWeeklyRosterSummary(
    startDate: string,
    endDate: string
  ): Promise<WeeklyRosterSummary> {
    const schedules = await this.getSchedules({ startDate, endDate });
    const active = schedules.filter((s) => s.status !== 'CANCELLED');
    const cancelled = schedules.filter((s) => s.status === 'CANCELLED');

    const shiftPagiCount = active.filter((s) => s.shiftId === 'shift-pagi').length;
    const shiftSiangCount = active.filter((s) => s.shiftId === 'shift-siang').length;
    const totalSchedules = active.length;

    const rosterStaff = INITIAL_EMPLOYEES.filter((e) => e.id !== 'emp-01' && e.status === 'ACTIVE');
    const totalPossibleSlots = rosterStaff.length * 7;
    const offCount = Math.max(0, totalPossibleSlots - totalSchedules);

    const operationalDepts = ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Operations'];
    const departmentBreakdown = operationalDepts.map((dept) => {
      const count = active.filter((s) => {
        const emp = INITIAL_EMPLOYEES.find((e) => e.id === s.employeeId);
        return emp?.department === dept;
      }).length;
      const requiredWeekly = (DEPARTMENT_DAILY_REQUIREMENTS[dept] || 1) * 7;

      return {
        department: dept,
        count,
        requiredWeekly,
      };
    });

    return {
      startDate,
      endDate,
      totalSchedules,
      shiftPagiCount,
      shiftSiangCount,
      offCount,
      cancelledCount: cancelled.length,
      departmentBreakdown,
    };
  }

  // =========================================================================
  // SCHEDULE MUTATIONS WITH VALIDATIONS & AUDIT TRAIL
  // =========================================================================

  /**
   * Validate Schedule input before creation/update
   */
  public async validateScheduleInput(
    data: CreateScheduleInput,
    ignoreScheduleId?: string
  ): Promise<{ valid: boolean; error?: string }> {
    // 1. Employee Validation
    const employee = INITIAL_EMPLOYEES.find((e) => e.id === data.employeeId);
    if (!employee) {
      return { valid: false, error: `Karyawan dengan ID '${data.employeeId}' tidak ditemukan.` };
    }
    if (employee.status !== 'ACTIVE') {
      return {
        valid: false,
        error: `Karyawan ${employee.fullName} berstatus tidak aktif (${employee.status}). Tidak dapat dijadwalkan.`,
      };
    }

    // 2. Shift Validation
    const shifts = this.getStoredShifts();
    const shift = shifts.find((s) => s.id === data.shiftId);
    if (!shift) {
      return {
        valid: false,
        error: `Shift '${data.shiftId}' tidak valid. Hanya Shift Pagi (shift-pagi) dan Shift Siang (shift-siang) yang diizinkan.`,
      };
    }
    if (shift.status !== 'ACTIVE') {
      return {
        valid: false,
        error: `Shift ${shift.name} sedang dinonaktifkan.`,
      };
    }

    // 3. Date Validation
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return { valid: false, error: 'Format tanggal harus YYYY-MM-DD.' };
    }

    // 4. Duplicate Check (No 2 active shifts for same employee on same date)
    const existing = this.getStoredSchedules().find(
      (s) =>
        s.employeeId === data.employeeId &&
        s.date === data.date &&
        s.status !== 'CANCELLED' &&
        s.id !== ignoreScheduleId
    );

    if (existing) {
      const existingShift = shifts.find((s) => s.id === existing.shiftId);
      return {
        valid: false,
        error: `${employee.fullName} (${employee.employeeCode}) sudah memiliki jadwal ${existingShift?.name || existing.shiftId} pada ${data.date}. Satu karyawan hanya boleh memiliki satu shift per hari.`,
      };
    }

    return { valid: true };
  }

  /**
   * Create a single employee schedule
   */
  public async createScheduleMock(data: CreateScheduleInput): Promise<EmployeeSchedule> {
    await delay(120);

    const validation = await this.validateScheduleInput(data);
    if (!validation.valid) {
      throw new Error(validation.error || 'Validasi jadwal gagal.');
    }

    const schedules = this.getStoredSchedules();
    const now = new Date().toISOString();

    const newSchedule: EmployeeSchedule = {
      id: `sch-${data.employeeId}-${data.date}-${Date.now().toString(36)}`,
      employeeId: data.employeeId,
      shiftId: data.shiftId,
      date: data.date,
      status: 'SCHEDULED',
      supervisorNote: data.supervisorNote?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdBy: data.createdBy || 'Heri Setiawan (Manager)',
      createdAt: now,
      updatedBy: data.createdBy || 'Heri Setiawan (Manager)',
      updatedAt: now,
    };

    schedules.push(newSchedule);
    this.saveSchedules(schedules);
    return newSchedule;
  }

  /**
   * Update existing employee schedule
   */
  public async updateScheduleMock(
    id: string,
    data: Partial<EmployeeSchedule>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<EmployeeSchedule> {
    await delay(100);
    const schedules = this.getStoredSchedules();
    const index = schedules.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Jadwal dengan ID '${id}' tidak ditemukan.`);
    }

    const current = schedules[index];

    // If changing employee, shift, or date, re-validate
    if (data.employeeId || data.shiftId || data.date) {
      const checkInput: CreateScheduleInput = {
        employeeId: data.employeeId || current.employeeId,
        shiftId: data.shiftId || current.shiftId,
        date: data.date || current.date,
      };
      const validation = await this.validateScheduleInput(checkInput, id);
      if (!validation.valid) {
        throw new Error(validation.error || 'Validasi perubahan jadwal gagal.');
      }
    }

    const updated: EmployeeSchedule = {
      ...current,
      ...data,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };

    schedules[index] = updated;
    this.saveSchedules(schedules);
    return updated;
  }

  /**
   * Cancel schedule (Soft-cancel: retains record with status 'CANCELLED' for audit trail)
   */
  public async cancelScheduleMock(
    id: string,
    reason?: string,
    cancelledBy = 'Heri Setiawan (Manager)'
  ): Promise<EmployeeSchedule> {
    await delay(100);
    const schedules = this.getStoredSchedules();
    const index = schedules.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Jadwal dengan ID '${id}' tidak ditemukan.`);
    }

    const current = schedules[index];
    const now = new Date().toISOString();

    const cancelled: EmployeeSchedule = {
      ...current,
      status: 'CANCELLED',
      cancellationReason: reason || 'Dibatalkan oleh Management',
      cancelledBy,
      cancelledAt: now,
      notes: reason ? `[Dibatalkan: ${reason}] ${current.notes || ''}` : current.notes,
      updatedBy: cancelledBy,
      updatedAt: now,
    };

    schedules[index] = cancelled;
    this.saveSchedules(schedules);
    return cancelled;
  }

  /**
   * Bulk assign multiple employees to a shift on a specific date
   * Transactional-style: validates all items before persisting.
   */
  public async createBulkSchedulesMock(
    data: BulkScheduleInput
  ): Promise<{ created: EmployeeSchedule[]; conflicts: ScheduleConflict[] }> {
    await delay(180);
    const shifts = this.getStoredShifts();
    const targetShift = shifts.find((s) => s.id === data.shiftId);

    if (!targetShift || targetShift.status !== 'ACTIVE') {
      throw new Error('Shift yang dipilih tidak aktif atau tidak valid.');
    }

    const schedules = this.getStoredSchedules();
    const created: EmployeeSchedule[] = [];
    const conflicts: ScheduleConflict[] = [];
    const now = new Date().toISOString();

    // Check duplicate employee IDs within the input list itself
    const seenEmpIds = new Set<string>();

    for (const empId of data.employeeIds) {
      if (seenEmpIds.has(empId)) {
        conflicts.push({
          employeeId: empId,
          employeeName: empId,
          date: data.date,
          existingScheduleId: '',
          existingShiftName: '',
          reason: 'Duplikasi karyawan dalam daftar pilihan penugasan massal.',
        });
        continue;
      }
      seenEmpIds.add(empId);

      const emp = INITIAL_EMPLOYEES.find((e) => e.id === empId);
      if (!emp || emp.status !== 'ACTIVE') {
        conflicts.push({
          employeeId: empId,
          employeeName: emp?.fullName || empId,
          date: data.date,
          existingScheduleId: '',
          existingShiftName: '',
          reason: 'Karyawan tidak ditemukan atau status tidak aktif.',
        });
        continue;
      }

      // Check existing active schedule in store
      const existing = schedules.find(
        (s) => s.employeeId === empId && s.date === data.date && s.status !== 'CANCELLED'
      );

      if (existing) {
        const existingShift = shifts.find((s) => s.id === existing.shiftId);
        conflicts.push({
          employeeId: empId,
          employeeName: emp.fullName,
          date: data.date,
          existingScheduleId: existing.id,
          existingShiftName: existingShift?.name || existing.shiftId,
          reason: `Sudah memiliki jadwal ${existingShift?.name || existing.shiftId} pada ${data.date}.`,
        });
        continue;
      }

      const newSchedule: EmployeeSchedule = {
        id: `sch-${empId}-${data.date}-${Date.now().toString(36)}`,
        employeeId: empId,
        shiftId: data.shiftId,
        date: data.date,
        status: 'SCHEDULED',
        supervisorNote: data.supervisorNote?.trim() || undefined,
        notes: data.notes?.trim() || 'Penugasan massal (Bulk Assignment)',
        createdBy: data.createdBy || 'Heri Setiawan (Manager)',
        createdAt: now,
        updatedBy: data.createdBy || 'Heri Setiawan (Manager)',
        updatedAt: now,
      };

      created.push(newSchedule);
    }

    // Only commit valid records
    if (created.length > 0) {
      schedules.push(...created);
      this.saveSchedules(schedules);
    }

    return { created, conflicts };
  }

  /**
   * Reset to initial default seed data
   */
  public async resetToDefaults(): Promise<void> {
    await delay(100);
    this.saveShifts(OFFICIAL_SHIFTS);
    this.saveSchedules(INITIAL_SCHEDULES);
  }
}

export const scheduleService = new ScheduleServiceClass();
export const ScheduleService = scheduleService;

