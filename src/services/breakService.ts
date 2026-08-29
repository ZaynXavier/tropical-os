import {
  BreakRecord,
  BreakRequestInput,
  BreakApprovalInput,
  BreakFilterParams,
  BreakSummary,
  EmployeeBreakSummary,
  EnrichedBreakRecord,
  BreakMonitoringAlert,
  DepartmentBreakMetric,
} from '../types/break';
import { INITIAL_BREAKS } from '../data/mockBreaks';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { EmployeePersonnel } from '../types/employee';
import { scheduleService } from './scheduleService';
import { hrConfigurationService } from './hrConfigurationService';

const STORAGE_KEY = 'tropicalos_master_breaks';

// Helper to simulate realistic async network delay
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTimeHHMM = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Helper to calculate minutes between two 'HH:mm' strings
 */
const calculateMinutesBetween = (startHHMM: string, endHHMM: string): number => {
  const [h1, m1] = startHHMM.split(':').map(Number);
  const [h2, m2] = endHHMM.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  let totalMin1 = h1 * 60 + m1;
  let totalMin2 = h2 * 60 + m2;
  if (totalMin2 < totalMin1) {
    // Over midnight shift handling
    totalMin2 += 24 * 60;
  }
  return Math.max(0, totalMin2 - totalMin1);
};

class BreakServiceClass {
  private getStoredRecords(): BreakRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BreakService] Error loading breaks from localStorage:', e);
    }
    this.saveToStorage(INITIAL_BREAKS);
    return INITIAL_BREAKS;
  }

  private saveToStorage(records: BreakRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('[BreakService] Error saving breaks to localStorage:', e);
    }
  }

  public async resetToDefaults(): Promise<void> {
    await delay(50);
    this.saveToStorage(INITIAL_BREAKS);
  }

  /**
   * Helper to enrich a BreakRecord with Employee and Schedule data & alerts
   */
  private async enrichRecord(record: BreakRecord): Promise<EnrichedBreakRecord> {
    const employee = INITIAL_EMPLOYEES.find((e) => e.id === record.employeeId);
    let schedule = undefined;
    try {
      const allSchedules = await scheduleService.getSchedules({
        employeeId: record.employeeId,
        date: record.date,
      });
      schedule = allSchedules.find((s) => s.id === record.scheduleId) || allSchedules[0];
    } catch {
      // fallback
    }

    const shiftName =
      schedule?.shiftId === 'shift-pagi'
        ? 'Shift Pagi'
        : schedule?.shiftId === 'shift-siang'
        ? 'Shift Siang'
        : 'Shift Reguler';

    const shiftHours =
      schedule?.shiftId === 'shift-pagi'
        ? '09:00 - 19:00'
        : schedule?.shiftId === 'shift-siang'
        ? '13:00 - 23:00'
        : '09:00 - 19:00';

    // Excessive Break Analysis
    let isExcessive = false;
    let alertLevel: BreakMonitoringAlert = 'NORMAL';

    const duration = record.durationMinutes ?? 0;
    const approvedDur = record.approvedDurationMinutes ?? 60;

    if (record.status === 'COMPLETED') {
      if (record.type === 'STANDARD') {
        if (duration > 75) {
          isExcessive = true;
          alertLevel = 'CRITICAL';
        } else if (duration > 60) {
          isExcessive = true;
          alertLevel = 'WARNING';
        }
      } else if (record.type === 'ADDITIONAL') {
        if (duration > approvedDur + 15) {
          isExcessive = true;
          alertLevel = 'CRITICAL';
        } else if (duration > approvedDur) {
          isExcessive = true;
          alertLevel = 'WARNING';
        }
      }
    } else if (record.status === 'ACTIVE' && record.actualStart) {
      const nowTime = formatTimeHHMM(new Date());
      const currentElapsed = calculateMinutesBetween(record.actualStart, nowTime);
      const maxAllowed = record.type === 'STANDARD' ? 60 : approvedDur;

      if (currentElapsed > maxAllowed + 15) {
        isExcessive = true;
        alertLevel = 'WARNING';
      } else if (currentElapsed > maxAllowed) {
        alertLevel = 'ATTENTION';
      }
    }

    return {
      ...record,
      employee,
      schedule,
      shiftName,
      shiftHours,
      isExcessive,
      alertLevel,
    };
  }

  /**
   * Get all break records with optional filtering
   */
  public async getBreaks(filter?: BreakFilterParams): Promise<EnrichedBreakRecord[]> {
    await delay(60);
    const records = this.getStoredRecords();
    let filtered = [...records];

    if (filter) {
      if (filter.employeeId) {
        filtered = filtered.filter((r) => r.employeeId === filter.employeeId);
      }
      if (filter.date) {
        filtered = filtered.filter((r) => r.date === filter.date);
      }
      if (filter.startDate) {
        filtered = filtered.filter((r) => r.date >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter((r) => r.date <= filter.endDate!);
      }
      if (filter.type && filter.type !== 'ALL') {
        filtered = filtered.filter((r) => r.type === filter.type);
      }
      if (filter.status && filter.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === filter.status);
      }
    }

    const enriched = await Promise.all(filtered.map((r) => this.enrichRecord(r)));

    let result = enriched;
    if (filter) {
      if (filter.department && filter.department !== 'ALL') {
        result = result.filter((r) => r.employee?.department === filter.department);
      }
      if (filter.alertLevel && filter.alertLevel !== 'ALL') {
        result = result.filter((r) => r.alertLevel === filter.alertLevel);
      }
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (r) =>
            (r.employee?.fullName || '').toLowerCase().includes(q) ||
            (r.employee?.employeeCode || '').toLowerCase().includes(q) ||
            (r.employee?.primaryPosition || '').toLowerCase().includes(q) ||
            (r.reason || '').toLowerCase().includes(q)
        );
      }
    }

    // Sort by date DESC, then createdAt DESC
    return result.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }

  public async getBreakById(id: string): Promise<EnrichedBreakRecord | null> {
    await delay(30);
    const records = this.getStoredRecords();
    const found = records.find((r) => r.id === id);
    if (!found) return null;
    return this.enrichRecord(found);
  }

  public async getBreaksByDate(date: string): Promise<EnrichedBreakRecord[]> {
    return this.getBreaks({ date });
  }

  public async getBreaksByEmployee(employeeId: string): Promise<EnrichedBreakRecord[]> {
    return this.getBreaks({ employeeId });
  }

  public async getBreaksBySchedule(scheduleId: string): Promise<EnrichedBreakRecord[]> {
    const all = await this.getBreaks();
    return all.filter((r) => r.scheduleId === scheduleId);
  }

  /**
   * Get breaks of team supervised by user
   */
  public async getTeamBreaks(
    user: EmployeePersonnel,
    date?: string
  ): Promise<EnrichedBreakRecord[]> {
    const allBreaks = await this.getBreaks({ date });

    if (user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return allBreaks;
    }

    if (user.accessLevel === 'SUPERVISOR') {
      return allBreaks.filter((r) => {
        // Same department or direct supervisee
        if (r.employee?.department === user.department) return true;
        if (r.employee?.supervisorId === user.id) return true;
        // Special ops handling (e.g. Putri Okta oversees Cleaning & Service)
        if (user.id === 'emp-03' && ['Service', 'Cleaning', 'Operations'].includes(r.employee?.department || '')) {
          return true;
        }
        return false;
      });
    }

    // Staff only gets own
    return allBreaks.filter((r) => r.employeeId === user.id);
  }

  /**
   * Get pending break requests for supervisor or manager
   */
  public async getPendingBreakRequests(user?: EmployeePersonnel): Promise<EnrichedBreakRecord[]> {
    const allPending = await this.getBreaks({ status: 'PENDING' });
    if (!user || user.accessLevel === 'OWNER' || user.accessLevel === 'MANAGER') {
      return allPending;
    }
    if (user.accessLevel === 'SUPERVISOR') {
      return allPending.filter((r) => {
        if (r.employee?.department === user.department) return true;
        if (r.employee?.supervisorId === user.id) return true;
        if (user.id === 'emp-03' && ['Service', 'Cleaning', 'Operations'].includes(r.employee?.department || '')) {
          return true;
        }
        return false;
      });
    }
    return allPending.filter((r) => r.employeeId === user.id);
  }

  public async getActiveBreaks(date?: string): Promise<EnrichedBreakRecord[]> {
    const targetDate = date || formatDate(new Date());
    return this.getBreaks({ date: targetDate, status: 'ACTIVE' });
  }

  public async getCompletedBreaks(date?: string): Promise<EnrichedBreakRecord[]> {
    const targetDate = date || formatDate(new Date());
    return this.getBreaks({ date: targetDate, status: 'COMPLETED' });
  }

  /**
   * VALIDATION ENGINE: Check for active break conflict
   */
  public async checkHasActiveBreak(employeeId: string, excludeBreakId?: string): Promise<boolean> {
    const records = this.getStoredRecords();
    return records.some(
      (r) => r.employeeId === employeeId && r.status === 'ACTIVE' && r.id !== excludeBreakId
    );
  }

  /**
   * CREATE / START STANDARD BREAK (60 mins max, no approval needed)
   */
  public async createStandardBreakMock(data: {
    employeeId: string;
    scheduleId?: string;
    date?: string;
    createdBy?: string;
  }): Promise<BreakRecord> {
    await delay(120);

    const emp = INITIAL_EMPLOYEES.find((e) => e.id === data.employeeId);
    if (!emp || emp.status !== 'ACTIVE') {
      throw new Error('Karyawan tidak ditemukan atau berstatus tidak aktif.');
    }

    const dateStr = data.date || formatDate(new Date());

    // Validate active schedule on date
    const schedules = await scheduleService.getSchedules({
      employeeId: data.employeeId,
      date: dateStr,
    });
    const activeSchedule = schedules.find((s) => s.status !== 'CANCELLED');
    if (!activeSchedule) {
      throw new Error(`Karyawan ${emp.fullName} tidak memiliki jadwal shift aktif pada ${dateStr}.`);
    }

    // Check if already has an active break
    const hasActive = await this.checkHasActiveBreak(data.employeeId);
    if (hasActive) {
      throw new Error('Karyawan sudah memiliki sesi istirahat yang sedang berjalan.');
    }

    // Check if already completed a standard break today
    const records = this.getStoredRecords();
    const existingStandard = records.find(
      (r) =>
        r.employeeId === data.employeeId &&
        r.date === dateStr &&
        r.type === 'STANDARD' &&
        (r.status === 'COMPLETED' || r.status === 'ACTIVE')
    );
    if (existingStandard) {
      throw new Error('Karyawan sudah menggunakan kuota Standard Break (60 menit) pada hari ini.');
    }

    const nowTime = formatTimeHHMM(new Date());
    const newRecord: BreakRecord = {
      id: `brk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: data.employeeId,
      scheduleId: data.scheduleId || activeSchedule.id,
      date: dateStr,
      type: 'STANDARD',
      status: 'ACTIVE',
      plannedStart: nowTime,
      actualStart: nowTime,
      requestedDurationMinutes: 60,
      approvedDurationMinutes: 60,
      reason: 'Istirahat makan & ibadah standar shift',
      requestedBy: data.createdBy || emp.fullName,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || emp.fullName,
    };

    const updated = [newRecord, ...records];
    this.saveToStorage(updated);
    return newRecord;
  }

  /**
   * CREATE ADDITIONAL BREAK REQUEST (Requires Supervisor / Manager approval)
   */
  public async createAdditionalBreakRequestMock(input: BreakRequestInput): Promise<BreakRecord> {
    await delay(120);

    const emp = INITIAL_EMPLOYEES.find((e) => e.id === input.employeeId);
    if (!emp || emp.status !== 'ACTIVE') {
      throw new Error('Karyawan tidak valid atau tidak aktif.');
    }

    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error('Alasan permohonan Additional Break wajib diisi minimal 5 karakter.');
    }

    if (!input.requestedDurationMinutes || input.requestedDurationMinutes <= 0) {
      throw new Error('Durasi istirahat yang diajukan harus lebih besar dari 0 menit.');
    }

    if (input.requestedDurationMinutes > 120) {
      throw new Error('Maksimal durasi permohonan Additional Break adalah 120 menit.');
    }

    // Verify schedule
    const schedules = await scheduleService.getSchedules({
      employeeId: input.employeeId,
      date: input.date,
    });
    const activeSchedule = schedules.find((s) => s.status !== 'CANCELLED');
    if (!activeSchedule) {
      throw new Error(`Tidak ditemukan jadwal shift aktif untuk ${emp.fullName} pada tanggal ${input.date}.`);
    }

    // Check existing pending request
    const records = this.getStoredRecords();
    const existingPending = records.find(
      (r) =>
        r.employeeId === input.employeeId &&
        r.date === input.date &&
        r.type === 'ADDITIONAL' &&
        r.status === 'PENDING'
    );
    if (existingPending) {
      throw new Error('Anda masih memiliki pengajuan Additional Break yang berstatus PENDING.');
    }

    const newRecord: BreakRecord = {
      id: `brk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: input.employeeId,
      scheduleId: input.scheduleId || activeSchedule.id,
      date: input.date,
      type: 'ADDITIONAL',
      status: 'PENDING',
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      requestedDurationMinutes: input.requestedDurationMinutes,
      reason: input.reason.trim(),
      requestedBy: input.requestedBy || emp.fullName,
      createdAt: new Date().toISOString(),
      createdBy: input.requestedBy || emp.fullName,
    };

    const updated = [newRecord, ...records];
    this.saveToStorage(updated);
    return newRecord;
  }

  /**
   * APPROVE BREAK REQUEST (Supervisor / Manager)
   */
  public async approveBreakRequestMock(input: BreakApprovalInput): Promise<BreakRecord> {
    await delay(120);

    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === input.breakId);
    if (index === -1) {
      throw new Error('Permohonan istirahat tidak ditemukan.');
    }

    const record = records[index];
    if (record.status !== 'PENDING') {
      throw new Error(`Permohonan tidak dapat disetujui karena berstatus ${record.status}.`);
    }

    const approvedDuration = Math.max(5, input.approvedDurationMinutes || record.requestedDurationMinutes || 30);

    const updatedRecord: BreakRecord = {
      ...record,
      status: 'APPROVED',
      approvedDurationMinutes: approvedDuration,
      approvedBy: input.approverName,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: input.approverName,
    };

    records[index] = updatedRecord;
    this.saveToStorage(records);
    return updatedRecord;
  }

  /**
   * REJECT BREAK REQUEST (Supervisor / Manager)
   */
  public async rejectBreakRequestMock(
    id: string,
    rejectionReason: string,
    rejectedBy = 'Supervisor'
  ): Promise<BreakRecord> {
    await delay(120);

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new Error('Alasan penolakan wajib diisi (minimal 5 karakter).');
    }

    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Permohonan istirahat tidak ditemukan.');
    }

    const record = records[index];
    if (record.status !== 'PENDING') {
      throw new Error(`Permohonan tidak dapat ditolak karena berstatus ${record.status}.`);
    }

    const updatedRecord: BreakRecord = {
      ...record,
      status: 'REJECTED',
      rejectionReason: rejectionReason.trim(),
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: rejectedBy,
    };

    records[index] = updatedRecord;
    this.saveToStorage(records);
    return updatedRecord;
  }

  /**
   * CANCEL BREAK REQUEST (Staff cancelling own pending request)
   */
  public async cancelBreakRequestMock(
    id: string,
    cancellationReason = 'Dibatalkan oleh pemohon',
    cancelledBy = 'Staff'
  ): Promise<BreakRecord> {
    await delay(100);

    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Data break tidak ditemukan.');
    }

    const record = records[index];
    if (record.status === 'COMPLETED') {
      throw new Error('Sesi istirahat yang sudah selesai tidak dapat dibatalkan.');
    }

    const updatedRecord: BreakRecord = {
      ...record,
      status: 'CANCELLED',
      cancellationReason,
      cancelledBy,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: cancelledBy,
    };

    records[index] = updatedRecord;
    this.saveToStorage(records);
    return updatedRecord;
  }

  /**
   * START BREAK (Transitions from APPROVED or newly started to ACTIVE)
   */
  public async startBreakMock(
    id: string,
    startTime?: string,
    updatedBy = 'Staff'
  ): Promise<BreakRecord> {
    await delay(100);

    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Data break tidak ditemukan.');
    }

    const record = records[index];
    if (record.status === 'ACTIVE') {
      throw new Error('Sesi istirahat sudah aktif.');
    }
    if (record.status === 'COMPLETED') {
      throw new Error('Sesi istirahat ini telah selesai.');
    }
    if (record.status === 'REJECTED' || record.status === 'CANCELLED') {
      throw new Error('Tidak dapat memulai sesi istirahat yang telah ditolak atau dibatalkan.');
    }

    const hasActive = await this.checkHasActiveBreak(record.employeeId, record.id);
    if (hasActive) {
      throw new Error('Anda sudah memiliki sesi istirahat lain yang sedang berjalan.');
    }

    const startHHMM = startTime || formatTimeHHMM(new Date());

    const updatedRecord: BreakRecord = {
      ...record,
      status: 'ACTIVE',
      actualStart: startHHMM,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    records[index] = updatedRecord;
    this.saveToStorage(records);
    return updatedRecord;
  }

  /**
   * END BREAK (Transitions from ACTIVE to COMPLETED and computes duration)
   */
  public async endBreakMock(
    id: string,
    endTime?: string,
    updatedBy = 'Staff'
  ): Promise<BreakRecord> {
    await delay(100);

    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Data break tidak ditemukan.');
    }

    const record = records[index];
    if (record.status !== 'ACTIVE') {
      throw new Error('Hanya sesi istirahat berstatus ACTIVE yang dapat diakhiri.');
    }

    const endHHMM = endTime || formatTimeHHMM(new Date());
    const startHHMM = record.actualStart || endHHMM;
    const durationMinutes = calculateMinutesBetween(startHHMM, endHHMM);

    const updatedRecord: BreakRecord = {
      ...record,
      status: 'COMPLETED',
      actualEnd: endHHMM,
      durationMinutes,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    records[index] = updatedRecord;
    this.saveToStorage(records);
    return updatedRecord;
  }

  /**
   * GET BREAK SUMMARY & METRICS
   */
  public async getBreakSummary(filter?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<BreakSummary> {
    const allBreaks = await this.getBreaks(filter);

    let standardBreaks = 0;
    let additionalBreaks = 0;
    let activeBreaks = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let completedBreaks = 0;
    let cancelledRequests = 0;
    let totalMinutes = 0;
    let longestBreakMinutes = 0;
    let excessiveBreaksCount = 0;

    const deptMap = new Map<string, DepartmentBreakMetric>();

    // Initial departments
    ['Kitchen', 'Bar', 'Service', 'Cleaning', 'CRM', 'Finance', 'Marketing', 'Operations', 'Management'].forEach(
      (dept) => {
        deptMap.set(dept, {
          department: dept,
          totalBreaks: 0,
          standardBreaks: 0,
          additionalBreaks: 0,
          totalMinutes: 0,
          averageDurationMinutes: 0,
          excessiveCount: 0,
          activeNow: 0,
        });
      }
    );

    allBreaks.forEach((b) => {
      if (b.type === 'STANDARD') standardBreaks++;
      if (b.type === 'ADDITIONAL') additionalBreaks++;

      if (b.status === 'ACTIVE') activeBreaks++;
      if (b.status === 'PENDING') pendingRequests++;
      if (b.status === 'APPROVED') approvedRequests++;
      if (b.status === 'REJECTED') rejectedRequests++;
      if (b.status === 'COMPLETED') completedBreaks++;
      if (b.status === 'CANCELLED') cancelledRequests++;

      if (b.durationMinutes) {
        totalMinutes += b.durationMinutes;
        if (b.durationMinutes > longestBreakMinutes) {
          longestBreakMinutes = b.durationMinutes;
        }
      }

      if (b.isExcessive) {
        excessiveBreaksCount++;
      }

      const dept = b.employee?.department || 'Operations';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          totalBreaks: 0,
          standardBreaks: 0,
          additionalBreaks: 0,
          totalMinutes: 0,
          averageDurationMinutes: 0,
          excessiveCount: 0,
          activeNow: 0,
        });
      }
      const metric = deptMap.get(dept)!;
      metric.totalBreaks++;
      if (b.type === 'STANDARD') metric.standardBreaks++;
      if (b.type === 'ADDITIONAL') metric.additionalBreaks++;
      if (b.durationMinutes) metric.totalMinutes += b.durationMinutes;
      if (b.isExcessive) metric.excessiveCount++;
      if (b.status === 'ACTIVE') metric.activeNow++;
    });

    const departmentBreakdown = Array.from(deptMap.values())
      .map((d) => ({
        ...d,
        averageDurationMinutes:
          d.totalBreaks > 0 ? Math.round(d.totalMinutes / d.totalBreaks) : 0,
      }))
      .filter((d) => d.totalBreaks > 0 || ['Kitchen', 'Bar', 'Service', 'Cleaning'].includes(d.department));

    const avgDuration =
      completedBreaks > 0 ? Math.round(totalMinutes / completedBreaks) : 0;

    let overallAlertLevel: BreakMonitoringAlert = 'NORMAL';
    if (excessiveBreaksCount >= 4 || pendingRequests >= 5) {
      overallAlertLevel = 'CRITICAL';
    } else if (excessiveBreaksCount >= 2 || pendingRequests >= 3) {
      overallAlertLevel = 'WARNING';
    } else if (excessiveBreaksCount > 0 || pendingRequests > 0) {
      overallAlertLevel = 'ATTENTION';
    }

    return {
      date: filter?.date,
      totalBreaks: allBreaks.length,
      standardBreaks,
      additionalBreaks,
      activeBreaks,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedBreaks,
      cancelledRequests,
      averageDurationMinutes: avgDuration,
      longestBreakMinutes,
      excessiveBreaksCount,
      overallAlertLevel,
      departmentBreakdown,
    };
  }

  /**
   * GET BREAK SUMMARY FOR A SINGLE EMPLOYEE
   */
  public async getEmployeeBreakSummary(
    employeeId: string,
    date?: string
  ): Promise<EmployeeBreakSummary> {
    const targetDate = date || formatDate(new Date());
    const emp = INITIAL_EMPLOYEES.find((e) => e.id === employeeId);
    const employeeName = emp?.fullName || 'Karyawan';
    const department = emp?.department || 'Operations';

    const schedules = await scheduleService.getSchedules({
      employeeId,
      date: targetDate,
    });
    const activeSchedule = schedules.find((s) => s.status !== 'CANCELLED');
    const shiftName =
      activeSchedule?.shiftId === 'shift-pagi'
        ? 'Shift Pagi (09:00 - 19:00)'
        : activeSchedule?.shiftId === 'shift-siang'
        ? 'Shift Siang (13:00 - 23:00)'
        : 'Off / Tidak Terjadwal';

    const records = await this.getBreaks({ employeeId, date: targetDate });

    let standardBreaksCount = 0;
    let additionalBreaksCount = 0;
    let totalDurationMinutes = 0;
    let excessiveCount = 0;
    let activeBreakRecord: BreakRecord | undefined;

    records.forEach((r) => {
      if (r.type === 'STANDARD') standardBreaksCount++;
      if (r.type === 'ADDITIONAL') additionalBreaksCount++;
      if (r.durationMinutes) totalDurationMinutes += r.durationMinutes;
      if (r.isExcessive) excessiveCount++;
      if (r.status === 'ACTIVE') activeBreakRecord = r;
    });

    const usedStandardMinutes = records
      .filter((r) => r.type === 'STANDARD' && r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

    const remainingStandardMinutes = Math.max(0, 60 - usedStandardMinutes);

    return {
      employeeId,
      employeeName,
      department,
      date: targetDate,
      shiftName,
      hasSchedule: Boolean(activeSchedule),
      totalBreaks: records.length,
      standardBreaksCount,
      additionalBreaksCount,
      totalDurationMinutes,
      remainingStandardMinutes,
      excessiveCount,
      hasActiveBreak: Boolean(activeBreakRecord),
      activeBreakRecord,
      records,
    };
  }
}

export const breakService = new BreakServiceClass();
