import {
  AttendanceRecord,
  AttendanceFilterParams,
  AttendanceSummary,
  LocationValidationResult,
  FaceVerificationResult,
} from '../types/attendance';
import {
  INITIAL_ATTENDANCE_RECORDS,
  calculateAttendanceSummary,
} from '../data/attendance';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { hrConfigurationService } from './hrConfigurationService';
import { scheduleService } from './scheduleService';
import { breakService } from './breakService';
import { attendanceRuleService } from './attendanceRuleService';

const STORAGE_KEY = 'tropicalos_master_attendance';

// Helper to simulate realistic async network delay
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

class AttendanceServiceClass {
  private getStoredRecords(): AttendanceRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[AttendanceService] Error loading attendance from localStorage:', e);
    }
    this.saveToStorage(INITIAL_ATTENDANCE_RECORDS);
    return INITIAL_ATTENDANCE_RECORDS;
  }

  private saveToStorage(records: AttendanceRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('[AttendanceService] Error saving attendance to localStorage:', e);
    }
  }

  /**
   * Reset attendance records to default initial state
   */
  public resetToInitial(): void {
    this.saveToStorage(INITIAL_ATTENDANCE_RECORDS);
  }

  /**
   * Get all attendance records with optional filtering
   */
  public async getAttendanceRecords(
    filter?: AttendanceFilterParams
  ): Promise<AttendanceRecord[]> {
    await delay(100);
    let list = this.getStoredRecords();

    if (!filter) return list;

    if (filter.employeeId) {
      list = list.filter((r) => r.employeeId === filter.employeeId);
    }

    if (filter.department && filter.department !== 'ALL') {
      list = list.filter((r) => r.department === filter.department);
    }

    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status);
    }

    if (filter.date) {
      list = list.filter((r) => r.date === filter.date);
    }

    if (filter.startDate) {
      list = list.filter((r) => r.date >= filter.startDate!);
    }

    if (filter.endDate) {
      list = list.filter((r) => r.date <= filter.endDate!);
    }

    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
          (r.employeeNo && r.employeeNo.toLowerCase().includes(q)) ||
          (r.department && r.department.toLowerCase().includes(q)) ||
          (r.primaryPosition && r.primaryPosition.toLowerCase().includes(q))
      );
    }

    // Sort by date DESC, then checkIn DESC
    return list.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.checkIn || '').localeCompare(a.checkIn || '');
    });
  }

  /**
   * Get single attendance record by ID
   */
  public async getAttendanceById(id: string): Promise<AttendanceRecord | null> {
    await delay(80);
    const list = this.getStoredRecords();
    return list.find((r) => r.id === id || r.attendanceId === id) || null;
  }

  /**
   * Get attendance history for a specific employee
   */
  public async getAttendanceByEmployee(
    employeeId: string,
    date?: string
  ): Promise<AttendanceRecord[]> {
    await delay(90);
    const list = this.getStoredRecords();
    return list.filter(
      (r) => r.employeeId === employeeId && (!date || r.date === date)
    );
  }

  /**
   * Get all attendance for a specific date (YYYY-MM-DD)
   */
  public async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    await delay(90);
    const list = this.getStoredRecords();
    return list.filter((r) => r.date === date);
  }

  /**
   * Get today's attendance for all personnel
   */
  public async getTodayAttendance(): Promise<AttendanceRecord[]> {
    const todayStr = formatDate(new Date());
    return this.getAttendanceByDate(todayStr);
  }

  /**
   * Get today's attendance record for a specific employee
   */
  public async getTodayAttendanceByEmployee(
    employeeId: string
  ): Promise<AttendanceRecord | null> {
    await delay(60);
    const todayStr = formatDate(new Date());
    const list = this.getStoredRecords();
    return (
      list.find((r) => r.employeeId === employeeId && r.date === todayStr) || null
    );
  }

  /**
   * Get high-level summary statistics for a given date
   */
  public async getAttendanceSummary(date?: string): Promise<AttendanceSummary> {
    await delay(70);
    const list = this.getStoredRecords();
    return calculateAttendanceSummary(list, date);
  }

  /**
   * Execute Check-In for an employee with GPS and Face verification data
   */
  public async checkInMock(params: {
    employeeId: string;
    locationValidation: LocationValidationResult;
    faceVerification: FaceVerificationResult;
    notes?: string;
  }): Promise<AttendanceRecord> {
    await delay(200);
    const now = new Date();
    const todayStr = formatDate(now);
    const timeStr = formatTime(now);

    const list = this.getStoredRecords();
    const emp = INITIAL_EMPLOYEES.find((e) => e.id === params.employeeId);
    if (!emp) {
      throw new Error(`Karyawan dengan ID ${params.employeeId} tidak ditemukan.`);
    }

    if (emp.status !== 'ACTIVE') {
      throw new Error(`Karyawan ${emp.fullName} berstatus non-aktif (${emp.status}) dan tidak dapat melakukan presensi.`);
    }

    // Step 1: Validate Check In Eligibility against HR rules & today's schedule
    const eligibility = await attendanceRuleService.validateCheckInEligibility({
      employeeId: params.employeeId,
      targetDate: todayStr,
      checkInTime: timeStr,
    });

    if (!eligibility.allowed) {
      throw new Error(eligibility.errorMessage || 'Presensi masuk tidak diizinkan.');
    }

    // Step 2: Validate GPS Location
    if (!params.locationValidation.isValid) {
      throw new Error(
        params.locationValidation.errorMessage ||
          'Validasi lokasi GPS gagal. Pastikan Anda berada dalam radius restoran.'
      );
    }

    // Step 3: Compute late penalty
    const scheduledStart = eligibility.schedule?.startTime || '09:00';
    const scheduledEnd = eligibility.schedule?.endTime || '19:00';
    const scheduleId = eligibility.schedule?.id;
    const shiftId = eligibility.schedule?.shiftId || 'shift-pagi';
    const lateMinutes = eligibility.lateMinutes;
    const lateDeductionAmount = eligibility.lateDeductionAmount;
    const calculationMethod = eligibility.calculationMethod;
    const status: AttendanceRecord['status'] = lateMinutes > 0 ? 'LATE' : 'PRESENT';

    // Find existing today's record or create new
    const existingIndex = list.findIndex(
      (r) => r.employeeId === params.employeeId && r.date === todayStr
    );

    const recordId =
      existingIndex >= 0 ? list[existingIndex].id : `att-${params.employeeId}-${todayStr}`;

    const newRecord: AttendanceRecord = {
      id: recordId,
      attendanceId: recordId,
      employeeId: emp.id,
      employeeNo: emp.employeeCode,
      employeeName: emp.fullName,
      department: emp.department,
      primaryPosition: emp.primaryPosition,
      date: todayStr,
      scheduleId,
      shiftId,
      scheduledStart,
      scheduledEnd,
      actualCheckIn: timeStr,
      actualCheckOut: existingIndex >= 0 ? list[existingIndex].actualCheckOut || list[existingIndex].checkOut : null,
      checkIn: timeStr,
      checkOut: existingIndex >= 0 ? list[existingIndex].checkOut : null,
      status,
      lateMinutes,
      lateDeductionAmount,
      lateDeductionCalculationMethod: calculationMethod,
      locationStatus: params.locationValidation.status,
      faceVerificationStatus: params.faceVerification.status,
      notes:
        params.notes ||
        (lateMinutes > 0
          ? `Terlambat ${lateMinutes} menit (Simulasi potongan: Rp ${(lateDeductionAmount ?? 0).toLocaleString('id-ID')})`
          : 'Check in tepat waktu'),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),

      // Check In Location Snapshot
      checkInLatitude: params.locationValidation.latitude,
      checkInLongitude: params.locationValidation.longitude,
      checkInDistanceMeters: params.locationValidation.distanceMeters,
      checkInAccuracyMeters: params.locationValidation.accuracyMeters,
      checkInGeofenceStatus: params.locationValidation.status,
      checkInRadiusMeters: params.locationValidation.radiusMeters || 100,

      // Metadata & legacy fallbacks
      latitude: params.locationValidation.latitude,
      longitude: params.locationValidation.longitude,
      distanceMeters: params.locationValidation.distanceMeters,
      accuracyMeters: params.locationValidation.accuracyMeters,
      faceConfidence: params.faceVerification.confidence,
      durationHours: 0,

      // Backward compatibility
      employee_id: emp.id,
      employee_name: emp.fullName,
      employee_emp_id: emp.employeeCode,
      division: emp.department,
      role: emp.primaryPosition,
      clock_in: timeStr,
      clock_out: existingIndex >= 0 ? list[existingIndex].checkOut : null,
      total_hours: 0,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newRecord;
    } else {
      list.unshift(newRecord);
    }

    this.saveToStorage(list);
    return newRecord;
  }

  /**
   * Execute Check-Out for an employee
   */
  public async checkOutMock(params: {
    recordId?: string;
    employeeId?: string;
    locationValidation?: LocationValidationResult;
    notes?: string;
  }): Promise<AttendanceRecord> {
    await delay(180);
    const now = new Date();
    const todayStr = formatDate(now);
    const timeStr = formatTime(now);

    const list = this.getStoredRecords();
    let targetIndex = -1;

    if (params.recordId) {
      targetIndex = list.findIndex((r) => r.id === params.recordId || r.attendanceId === params.recordId);
    } else if (params.employeeId) {
      targetIndex = list.findIndex(
        (r) => r.employeeId === params.employeeId && r.date === todayStr
      );
    }

    if (targetIndex === -1) {
      throw new Error('Data presensi masuk hari ini tidak ditemukan untuk melakukan Check Out.');
    }

    const current = list[targetIndex];
    const targetEmployeeId = current.employeeId;

    // RULE: Check Out cannot be performed if employee has an ACTIVE break session
    const employeeBreaks = await breakService.getEmployeeBreakSummary(targetEmployeeId, todayStr);
    if (employeeBreaks.hasActiveBreak) {
      throw new Error('Selesaikan break terlebih dahulu sebelum melakukan Check Out.');
    }

    // Calculate duration
    let durationHours = current.durationHours || 0;
    if (current.checkIn) {
      const [inH, inM, inS] = current.checkIn.split(':').map(Number);
      const [outH, outM, outS] = [now.getHours(), now.getMinutes(), now.getSeconds()];
      const diffMs =
        (outH * 3600 + outM * 60 + outS) * 1000 -
        (inH * 3600 + (inM || 0) * 60 + (inS || 0)) * 1000;
      durationHours = Math.max(0, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
    }

    // Check potential overtime (if actual check-out exceeds scheduledEnd)
    let potentialOvertimeMinutes = 0;
    let isOvertimeCandidate = false;
    const scheduledEnd = current.scheduledEnd || '19:00';
    const [schedEndH, schedEndM] = scheduledEnd.split(':').map(Number);
    if (!isNaN(schedEndH) && !isNaN(schedEndM)) {
      const schedEndMinutes = schedEndH * 60 + schedEndM;
      const actualOutMinutes = now.getHours() * 60 + now.getMinutes();
      if (actualOutMinutes > schedEndMinutes) {
        potentialOvertimeMinutes = actualOutMinutes - schedEndMinutes;
        isOvertimeCandidate = true;
      }
    }

    const locVal = params.locationValidation;

    const updated: AttendanceRecord = {
      ...current,
      actualCheckOut: timeStr,
      checkOut: timeStr,
      durationHours,
      potentialOvertimeMinutes,
      isOvertimeCandidate,

      // Check Out Location Snapshot
      checkOutLatitude: locVal?.latitude,
      checkOutLongitude: locVal?.longitude,
      checkOutDistanceMeters: locVal?.distanceMeters,
      checkOutAccuracyMeters: locVal?.accuracyMeters,
      checkOutGeofenceStatus: locVal?.status || 'VALID',
      checkOutRadiusMeters: locVal?.radiusMeters || 100,

      notes: params.notes
        ? `${current.notes || ''} | ${params.notes}`
        : isOvertimeCandidate
        ? `${current.notes || ''} | Selesai bertugas melewati jam shift (+${potentialOvertimeMinutes} mnt). Menunggu pengajuan lembur.`
        : current.notes,
      updatedAt: now.toISOString(),
      clock_out: timeStr,
      total_hours: durationHours,
    };

    list[targetIndex] = updated;
    this.saveToStorage(list);
    return updated;
  }

  /**
   * Create custom attendance record (e.g. manual entry or corrections)
   */
  public async createAttendanceMock(
    record: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    await delay(100);
    const now = new Date();
    const todayStr = formatDate(now);
    const list = this.getStoredRecords();

    const empId = record.employeeId || record.employee_id || 'emp-01';
    const emp = INITIAL_EMPLOYEES.find((e) => e.id === empId) || INITIAL_EMPLOYEES[0];

    const newRecord: AttendanceRecord = {
      id: record.id || `att-${empId}-${record.date || todayStr}`,
      attendanceId: record.id || `att-${empId}-${record.date || todayStr}`,
      employeeId: emp.id,
      employeeNo: emp.employeeCode,
      employeeName: emp.fullName,
      department: emp.department,
      primaryPosition: emp.primaryPosition,
      date: record.date || todayStr,
      scheduledStart: record.scheduledStart || '09:00',
      scheduledEnd: record.scheduledEnd || '19:00',
      actualCheckIn: record.checkIn || record.clock_in || '09:00:00',
      actualCheckOut: record.checkOut || record.clock_out || null,
      checkIn: record.checkIn || record.clock_in || '09:00:00',
      checkOut: record.checkOut || record.clock_out || null,
      status: record.status || 'PRESENT',
      lateMinutes: record.lateMinutes || 0,
      lateDeductionAmount: record.lateDeductionAmount || 0,
      locationStatus: record.locationStatus || 'VALID',
      faceVerificationStatus: record.faceVerificationStatus || 'VERIFIED',
      notes: record.notes || 'Pencatatan manual',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      durationHours: record.durationHours || 8,

      // Snapshots
      checkInDistanceMeters: record.checkInDistanceMeters || 15,
      checkInAccuracyMeters: record.checkInAccuracyMeters || 10,
      checkInGeofenceStatus: record.checkInGeofenceStatus || 'VALID',
      checkInRadiusMeters: record.checkInRadiusMeters || 100,

      employee_id: emp.id,
      employee_name: emp.fullName,
      employee_emp_id: emp.employeeCode,
      division: emp.department,
      role: emp.primaryPosition,
      clock_in: record.checkIn || record.clock_in || '09:00:00',
      clock_out: record.checkOut || record.clock_out || null,
      total_hours: record.durationHours || 8,
    };

    list.unshift(newRecord);
    this.saveToStorage(list);
    return newRecord;
  }

  /**
   * Update existing attendance record
   */
  public async updateAttendanceMock(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    await delay(100);
    const list = this.getStoredRecords();
    const index = list.findIndex((r) => r.id === id || r.attendanceId === id);
    if (index === -1) {
      throw new Error(`Record presensi dengan ID ${id} tidak ditemukan.`);
    }

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  // =========================================================================
  // BACKWARD COMPATIBILITY METHODS
  // =========================================================================

  public async getLogs(filter?: any): Promise<{ data: AttendanceRecord[]; error: null }> {
    const list = await this.getAttendanceRecords(filter);
    return { data: list, error: null };
  }

  public async checkIn(params?: any): Promise<{ success: boolean; error: null }> {
    return { success: true, error: null };
  }

  public async checkOut(params?: any): Promise<{ success: boolean; error: null }> {
    return { success: true, error: null };
  }

  public async clockIn(params: any): Promise<{ data: AttendanceRecord; error: null }> {
    const res = await this.checkInMock({
      employeeId: params.employee_id || params.employeeId || 'emp-01',
      locationValidation: { isValid: true, status: 'VALID' },
      faceVerification: { verified: true, status: 'VERIFIED', confidence: 98 },
      notes: params.notes,
    });
    return { data: res, error: null };
  }

  public async clockOut(params: any): Promise<{ data: AttendanceRecord; error: null }> {
    const res = await this.checkOutMock({
      employeeId: params.employee_id || params.employeeId,
      recordId: params.recordId || params.id,
      notes: params.notes,
    });
    return { data: res, error: null };
  }

  public async getPersonalTodayAttendance(
    empId?: string
  ): Promise<{ data: AttendanceRecord | null; error: null }> {
    const rec = empId ? await this.getTodayAttendanceByEmployee(empId) : null;
    return { data: rec, error: null };
  }

  public async logManualAttendance(data: any): Promise<{ success: boolean; error: null }> {
    await this.createAttendanceMock(data);
    return { success: true, error: null };
  }
}

export const attendanceService = new AttendanceServiceClass();
export const AttendanceService = attendanceService;
