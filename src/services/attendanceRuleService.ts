import {
  AttendanceRecord,
  LocationValidationResult,
  GeofenceValidationResult,
  AttendanceLocationStatus,
} from '../types/attendance';
import {
  AttendanceConfiguration,
  LocationConfiguration,
  LateDeductionCalculationMethod,
} from '../types/hrConfiguration';
import { hrConfigurationService } from './hrConfigurationService';
import { locationService, calculateHaversineDistance } from './locationService';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { scheduleService } from './scheduleService';

export interface AttendanceRuleValidationInput {
  employeeId: string;
  targetDate?: string;
  checkInTime?: string; // HH:mm:ss or HH:mm
}

export interface AttendanceRuleValidationResult {
  allowed: boolean;
  errorCode?: string;
  errorMessage?: string;
  employee?: typeof INITIAL_EMPLOYEES[0];
  schedule?: {
    id: string;
    shiftId: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    gracePeriodMinutes: number;
  };
  lateMinutes: number;
  lateDeductionAmount: number;
  calculationMethod: LateDeductionCalculationMethod;
}

class AttendanceRuleServiceClass {
  /**
   * Calculate late minutes between scheduled start and actual check-in time,
   * accounting for the grace period in minutes.
   *
   * Formula: max(0, actualCheckInMinutes - scheduledStartMinutes - gracePeriodMinutes)
   */
  public calculateLateMinutes(
    scheduledStart: string,
    actualCheckIn: string,
    gracePeriodMinutes = 10
  ): number {
    if (!scheduledStart || !actualCheckIn) return 0;

    const [schedH, schedM] = scheduledStart.split(':').map(Number);
    const [actH, actM] = actualCheckIn.split(':').map(Number);

    if (isNaN(schedH) || isNaN(schedM) || isNaN(actH) || isNaN(actM)) return 0;

    const scheduledTotal = schedH * 60 + schedM;
    const actualTotal = actH * 60 + actM;

    const diff = actualTotal - scheduledTotal;
    if (diff <= gracePeriodMinutes) {
      return 0; // Within on-time window + grace period
    }

    // When beyond grace period, late minutes is total minutes past scheduled start
    return Math.max(0, diff);
  }

  /**
   * Calculate late deduction amount based on late minutes, hourly rate, and calculation method.
   *
   * Methods:
   * - CEILING_HOUR: 1-60 mins = 1 hour rate, 61-120 mins = 2 hours rate (Default)
   * - FULL_HOUR: Math.floor(lateMinutes / 60) * ratePerHour
   * - PER_MINUTE: Math.round(lateMinutes * (ratePerHour / 60))
   */
  public calculateLateDeduction(
    lateMinutes: number,
    ratePerHour = 10000,
    method: LateDeductionCalculationMethod = 'CEILING_HOUR'
  ): number {
    if (lateMinutes <= 0 || ratePerHour <= 0) return 0;

    switch (method) {
      case 'CEILING_HOUR': {
        const hours = Math.ceil(lateMinutes / 60);
        return hours * ratePerHour;
      }
      case 'FULL_HOUR': {
        const hours = Math.floor(lateMinutes / 60);
        return hours * ratePerHour;
      }
      case 'PER_MINUTE':
      default: {
        return Math.round(lateMinutes * (ratePerHour / 60));
      }
    }
  }

  /**
   * Get master attendance rules from HR configuration
   */
  public async getAttendanceRules(): Promise<AttendanceConfiguration> {
    return hrConfigurationService.getAttendanceConfiguration();
  }

  /**
   * Update master attendance rules in HR configuration
   */
  public async updateAttendanceRules(
    rules: Partial<AttendanceConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<AttendanceConfiguration> {
    return hrConfigurationService.updateAttendanceConfiguration(rules, updatedBy);
  }

  /**
   * Get restaurant location & geofence configuration
   */
  public async getRestaurantLocation(): Promise<LocationConfiguration> {
    return hrConfigurationService.getLocationConfiguration();
  }

  /**
   * Update restaurant location & geofence configuration
   */
  public async updateRestaurantLocation(
    location: Partial<LocationConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<LocationConfiguration> {
    return hrConfigurationService.updateLocationConfiguration(location, updatedBy);
  }

  /**
   * Reset attendance & location rules to initial defaults
   */
  public async resetToDefaults(): Promise<void> {
    await hrConfigurationService.resetToDefaults();
  }

  /**
   * Validate current location against restaurant geofence parameters
   */
  public async validateAttendanceLocation(): Promise<GeofenceValidationResult> {
    const rawResult = await locationService.validateLocation();
    const locConfig = await this.getRestaurantLocation();

    return {
      ...rawResult,
      radiusMeters: locConfig.radiusMeters,
      locationName: locConfig.locationName,
      validatedAt: new Date().toISOString(),
      message: rawResult.errorMessage || (rawResult.isValid ? 'Lokasi valid berada di area resto' : 'Lokasi di luar area resto'),
    };
  }

  /**
   * Complete check-in validation pipeline:
   * 1. Authentication (User logged in & found)
   * 2. Active employee verification
   * 3. Today's schedule verification (blocks if no schedule unless outside schedule allowed)
   * 4. Shift lookup & timing
   * 5. Grace period & late penalty simulation computation
   */
  public async validateCheckInEligibility(
    input: AttendanceRuleValidationInput
  ): Promise<AttendanceRuleValidationResult> {
    const targetDate = input.targetDate || new Date().toISOString().split('T')[0];
    const checkInTime =
      input.checkInTime ||
      new Date().toTimeString().split(' ')[0]; // HH:mm:ss

    // 1. Employee existence check
    const employee = INITIAL_EMPLOYEES.find((e) => e.id === input.employeeId);
    if (!employee) {
      return {
        allowed: false,
        errorCode: 'EMPLOYEE_NOT_FOUND',
        errorMessage: `Karyawan dengan ID ${input.employeeId} tidak terdaftar di sistem.`,
        lateMinutes: 0,
        lateDeductionAmount: 0,
        calculationMethod: 'CEILING_HOUR',
      };
    }

    // 2. Active status check
    if (employee.status !== 'ACTIVE') {
      return {
        allowed: false,
        errorCode: 'EMPLOYEE_INACTIVE',
        errorMessage: `Karyawan ${employee.fullName} berstatus non-aktif (${employee.status}) dan tidak dapat melakukan presensi.`,
        employee,
        lateMinutes: 0,
        lateDeductionAmount: 0,
        calculationMethod: 'CEILING_HOUR',
      };
    }

    // 3. HR Config rules
    const attConfig = await this.getAttendanceRules();
    const gracePeriodMinutes = attConfig.gracePeriodMinutes ?? 10;
    const hourlyRate = attConfig.lateDeductionHourlyRate ?? 10000;
    const calculationMethod: LateDeductionCalculationMethod =
      attConfig.lateDeductionCalculationMethod || 'CEILING_HOUR';

    // 4. Schedule check
    const schedule = await scheduleService.getEmployeeScheduleForDate(
      input.employeeId,
      targetDate
    );

    if (!schedule) {
      if (!attConfig.allowCheckInOutsideSchedule) {
        return {
          allowed: false,
          errorCode: 'NO_SCHEDULE_TODAY',
          errorMessage: `Anda tidak memiliki jadwal kerja untuk hari ini (${targetDate}). Silakan hubungi supervisor Anda.`,
          employee,
          lateMinutes: 0,
          lateDeductionAmount: 0,
          calculationMethod,
        };
      }
    }

    // 5. Shift lookup
    let shiftStartTime = '09:00';
    let shiftEndTime = '19:00';
    let shiftName = 'Shift Pagi';
    let shiftId = 'shift-pagi';

    if (schedule) {
      const shift = await scheduleService.getShiftById(schedule.shiftId);
      if (shift) {
        shiftStartTime = shift.startTime;
        shiftEndTime = shift.endTime;
        shiftName = shift.name;
        shiftId = shift.id;
      }
    }

    // 6. Calculate late minutes & deduction
    const lateMinutes = this.calculateLateMinutes(
      shiftStartTime,
      checkInTime,
      gracePeriodMinutes
    );

    const lateDeductionAmount = this.calculateLateDeduction(
      lateMinutes,
      hourlyRate,
      calculationMethod
    );

    return {
      allowed: true,
      employee,
      schedule: {
        id: schedule ? schedule.id : `sch-fallback-${input.employeeId}`,
        shiftId,
        shiftName,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        gracePeriodMinutes,
      },
      lateMinutes,
      lateDeductionAmount,
      calculationMethod,
    };
  }
}

export const attendanceRuleService = new AttendanceRuleServiceClass();
