import {
  HRConfiguration,
  ShiftConfiguration,
  AttendanceConfiguration,
  LocationConfiguration,
  BreakConfiguration,
  OvertimeConfiguration,
  PayrollIntegrationContract,
} from '../types/hrConfiguration';
import { INITIAL_HR_CONFIGURATION } from '../data/mockHRConfiguration';

const STORAGE_KEY = 'tropicalos_hr_configuration';

const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 600;
  let totalMin1 = h1 * 60 + m1;
  let totalMin2 = h2 * 60 + m2;
  if (totalMin2 < totalMin1) {
    totalMin2 += 24 * 60; // Cross midnight
  }
  return Math.max(0, totalMin2 - totalMin1);
};

class HRConfigurationServiceClass {
  private getStoredConfig(): HRConfiguration {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.shifts && parsed.attendance && parsed.location) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[HRConfigurationService] Error reading configuration from storage:', e);
    }
    this.saveConfig(INITIAL_HR_CONFIGURATION);
    return INITIAL_HR_CONFIGURATION;
  }

  private saveConfig(config: HRConfiguration): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('[HRConfigurationService] Error saving configuration to storage:', e);
    }
  }

  /**
   * Get complete HR Configuration
   */
  public async getHRConfiguration(): Promise<HRConfiguration> {
    await delay(50);
    return this.getStoredConfig();
  }

  /**
   * Alias for getHRConfiguration
   */
  public async getConfiguration(): Promise<HRConfiguration> {
    return this.getHRConfiguration();
  }

  /**
   * Reset all HR configuration back to system default initial state
   */
  public async resetToDefaults(): Promise<HRConfiguration> {
    await delay(80);
    this.saveConfig(INITIAL_HR_CONFIGURATION);
    return INITIAL_HR_CONFIGURATION;
  }

  // =========================================================================
  // 1. SHIFT CONFIGURATION
  // =========================================================================

  public async getShiftConfiguration(): Promise<ShiftConfiguration[]> {
    await delay(40);
    const config = this.getStoredConfig();
    return config.shifts;
  }

  public async getActiveShifts(): Promise<ShiftConfiguration[]> {
    const shifts = await this.getShiftConfiguration();
    return shifts.filter((s) => s.status === 'ACTIVE');
  }

  public async getShiftById(id: string): Promise<ShiftConfiguration | null> {
    await delay(30);
    const shifts = await this.getShiftConfiguration();
    return shifts.find((s) => s.id === id) || null;
  }

  public async updateShiftConfiguration(
    id: string,
    data: Partial<ShiftConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<ShiftConfiguration> {
    await delay(80);
    const config = this.getStoredConfig();
    const index = config.shifts.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Master Shift dengan ID '${id}' tidak ditemukan.`);
    }

    const current = config.shifts[index];

    // Validation
    const startTime = data.startTime || current.startTime;
    const endTime = data.endTime || current.endTime;
    const name = data.name !== undefined ? data.name.trim() : current.name;
    const code = data.code !== undefined ? data.code.trim() : current.code;

    if (!name) {
      throw new Error('Nama Shift wajib diisi.');
    }
    if (!code) {
      throw new Error('Kode Shift wajib diisi.');
    }
    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
      throw new Error('Jam mulai shift tidak valid.');
    }
    if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
      throw new Error('Jam selesai shift tidak valid.');
    }
    if (startTime === endTime) {
      throw new Error('Jam mulai dan jam selesai shift tidak boleh sama.');
    }

    const scheduledDurationMinutes = calculateDurationMinutes(startTime, endTime);
    const gracePeriodMinutes =
      data.gracePeriodMinutes !== undefined ? Math.max(0, data.gracePeriodMinutes) : current.gracePeriodMinutes;

    // Check duplicate code across other shifts
    const duplicateCode = config.shifts.find((s) => s.id !== id && s.code.toLowerCase() === code.toLowerCase());
    if (duplicateCode) {
      throw new Error(`Kode Shift '${code}' sudah digunakan oleh shift lain (${duplicateCode.name}).`);
    }

    const now = new Date().toISOString();
    const updatedShift: ShiftConfiguration = {
      ...current,
      ...data,
      name,
      code,
      startTime,
      endTime,
      scheduledDurationMinutes,
      gracePeriodMinutes,
      updatedAt: now,
      updatedBy,
    };

    config.shifts[index] = updatedShift;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updatedShift;
  }

  public async updateShift(
    id: string,
    data: Partial<ShiftConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<ShiftConfiguration> {
    return this.updateShiftConfiguration(id, data, updatedBy);
  }

  public async createShift(
    data: Omit<ShiftConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'scheduledDurationMinutes'>,
    createdBy = 'Heri Setiawan (Manager)'
  ): Promise<ShiftConfiguration> {
    return this.createShiftConfiguration(data, createdBy);
  }

  public async toggleShiftStatus(id: string, updatedBy = 'Heri Setiawan (Manager)'): Promise<ShiftConfiguration> {
    await delay(70);
    const config = this.getStoredConfig();
    const index = config.shifts.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Master Shift dengan ID '${id}' tidak ditemukan.`);
    }

    const current = config.shifts[index];
    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Must have at least 1 active shift in system
    if (newStatus === 'INACTIVE') {
      const activeCount = config.shifts.filter((s) => s.id !== id && s.status === 'ACTIVE').length;
      if (activeCount === 0) {
        throw new Error('Sistem memerlukan setidaknya 1 shift aktif. Shift terakhir tidak dapat dinonaktifkan.');
      }
    }

    const now = new Date().toISOString();
    const updatedShift: ShiftConfiguration = {
      ...current,
      status: newStatus,
      updatedAt: now,
      updatedBy,
    };

    config.shifts[index] = updatedShift;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updatedShift;
  }

  public async createShiftConfiguration(
    data: Omit<ShiftConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'scheduledDurationMinutes'>,
    createdBy = 'Heri Setiawan (Manager)'
  ): Promise<ShiftConfiguration> {
    await delay(90);
    const config = this.getStoredConfig();

    const name = data.name.trim();
    const code = data.code.trim();

    if (!name) throw new Error('Nama Shift wajib diisi.');
    if (!code) throw new Error('Kode Shift wajib diisi.');
    if (!data.startTime || !/^\d{2}:\d{2}$/.test(data.startTime)) throw new Error('Jam mulai shift tidak valid.');
    if (!data.endTime || !/^\d{2}:\d{2}$/.test(data.endTime)) throw new Error('Jam selesai shift tidak valid.');
    if (data.startTime === data.endTime) throw new Error('Jam mulai dan jam selesai tidak boleh sama.');

    const duplicateCode = config.shifts.find((s) => s.code.toLowerCase() === code.toLowerCase());
    if (duplicateCode) {
      throw new Error(`Kode Shift '${code}' sudah digunakan oleh shift ${duplicateCode.name}.`);
    }

    const scheduledDurationMinutes = calculateDurationMinutes(data.startTime, data.endTime);
    const now = new Date().toISOString();
    const newId = `shift-${Date.now().toString(36)}`;

    const newShift: ShiftConfiguration = {
      id: newId,
      code,
      name,
      startTime: data.startTime,
      endTime: data.endTime,
      scheduledDurationMinutes,
      gracePeriodMinutes: Math.max(0, data.gracePeriodMinutes || 10),
      status: data.status || 'ACTIVE',
      description: data.description?.trim(),
      createdAt: now,
      createdBy,
      updatedAt: now,
      updatedBy: createdBy,
    };

    config.shifts.push(newShift);
    config.lastUpdated = now;
    config.updatedBy = createdBy;

    this.saveConfig(config);
    return newShift;
  }

  // =========================================================================
  // 2. ATTENDANCE CONFIGURATION
  // =========================================================================

  public async getAttendanceConfiguration(): Promise<AttendanceConfiguration> {
    await delay(40);
    const config = this.getStoredConfig();
    return config.attendance;
  }

  public async updateAttendanceConfiguration(
    data: Partial<AttendanceConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<AttendanceConfiguration> {
    await delay(80);
    const config = this.getStoredConfig();

    if (data.gracePeriodMinutes !== undefined && data.gracePeriodMinutes < 0) {
      throw new Error('Grace period presensi tidak boleh bernilai negatif.');
    }
    if (data.minimumGpsAccuracyMeters !== undefined && data.minimumGpsAccuracyMeters <= 0) {
      throw new Error('Ambang akurasi GPS minimal harus lebih besar dari 0 meter.');
    }
    if (data.lateDeductionHourlyRate !== undefined && data.lateDeductionHourlyRate < 0) {
      throw new Error('Tarif potongan keterlambatan tidak boleh negatif.');
    }

    const now = new Date().toISOString();
    const updated: AttendanceConfiguration = {
      ...config.attendance,
      ...data,
      updatedAt: now,
      updatedBy,
    };

    config.attendance = updated;
    config.payrollContract.attendanceRules.lateDeductionHourlyRate = updated.lateDeductionHourlyRate;
    config.payrollContract.updatedAt = now;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updated;
  }

  // =========================================================================
  // 3. LOCATION CONFIGURATION
  // =========================================================================

  public async getLocationConfiguration(): Promise<LocationConfiguration> {
    await delay(40);
    const config = this.getStoredConfig();
    return config.location;
  }

  public async updateLocationConfiguration(
    data: Partial<LocationConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<LocationConfiguration> {
    await delay(80);
    const config = this.getStoredConfig();

    if (data.radiusMeters !== undefined && data.radiusMeters <= 0) {
      throw new Error('Radius geofence harus lebih besar dari 0 meter.');
    }
    if (data.gpsAccuracyThresholdMeters !== undefined && data.gpsAccuracyThresholdMeters <= 0) {
      throw new Error('Ambang batas akurasi GPS harus lebih besar dari 0 meter.');
    }

    const lat = data.latitude !== undefined ? data.latitude : config.location.latitude;
    const lng = data.longitude !== undefined ? data.longitude : config.location.longitude;
    const isConfigured = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

    const now = new Date().toISOString();
    const updated: LocationConfiguration = {
      ...config.location,
      ...data,
      latitude: lat,
      longitude: lng,
      isConfigured,
      updatedAt: now,
      updatedBy,
    };

    config.location = updated;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updated;
  }

  // =========================================================================
  // 4. BREAK CONFIGURATION
  // =========================================================================

  public async getBreakConfiguration(): Promise<BreakConfiguration> {
    await delay(40);
    const config = this.getStoredConfig();
    return config.breaks;
  }

  public async updateBreakConfiguration(
    data: Partial<BreakConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<BreakConfiguration> {
    await delay(80);
    const config = this.getStoredConfig();

    if (data.standardBreakMinutes !== undefined && data.standardBreakMinutes <= 0) {
      throw new Error('Durasi Standard Break harus lebih besar dari 0 menit.');
    }
    if (data.maxAdditionalBreakMinutes !== undefined && data.maxAdditionalBreakMinutes <= 0) {
      throw new Error('Maksimal durasi Additional Break harus lebih besar dari 0 menit.');
    }

    const now = new Date().toISOString();
    const updated: BreakConfiguration = {
      ...config.breaks,
      ...data,
      updatedAt: now,
      updatedBy,
    };

    config.breaks = updated;
    config.payrollContract.breakRules.standardBreakMinutes = updated.standardBreakMinutes;
    config.payrollContract.updatedAt = now;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updated;
  }

  // =========================================================================
  // 5. OVERTIME CONFIGURATION
  // =========================================================================

  public async getOvertimeConfiguration(): Promise<OvertimeConfiguration> {
    await delay(40);
    const config = this.getStoredConfig();
    return config.overtime;
  }

  public async updateOvertimeConfiguration(
    data: Partial<OvertimeConfiguration>,
    updatedBy = 'Heri Setiawan (Manager)'
  ): Promise<OvertimeConfiguration> {
    await delay(80);
    const config = this.getStoredConfig();

    if (data.hourlyRate !== undefined && data.hourlyRate < 0) {
      throw new Error('Tarif lembur per jam tidak boleh bernilai negatif.');
    }
    if (data.maxDailyHours !== undefined && data.maxDailyHours <= 0) {
      throw new Error('Maksimal durasi lembur harian harus lebih besar dari 0 jam.');
    }

    const now = new Date().toISOString();
    const updated: OvertimeConfiguration = {
      ...config.overtime,
      ...data,
      updatedAt: now,
      updatedBy,
    };

    config.overtime = updated;
    config.payrollContract.overtimeRules.overtimeHourlyRate = updated.hourlyRate;
    config.payrollContract.updatedAt = now;
    config.lastUpdated = now;
    config.updatedBy = updatedBy;

    this.saveConfig(config);
    return updated;
  }

  // =========================================================================
  // 6. PAYROLL CONTRACT & CALCULATION HELPERS
  // =========================================================================

  public async getPayrollIntegrationContract(): Promise<PayrollIntegrationContract> {
    await delay(30);
    const config = this.getStoredConfig();
    return config.payrollContract;
  }

  /**
   * Calculate late deduction based on late minutes and hourly deduction rate
   * Formula: lateMinutes * (lateDeductionHourlyRate / 60)
   */
  public calculateLateDeduction(lateMinutes: number, customHourlyRate?: number): number {
    if (lateMinutes <= 0) return 0;
    const config = this.getStoredConfig();
    const rate = customHourlyRate !== undefined ? customHourlyRate : config.attendance.lateDeductionHourlyRate;
    const minuteRate = rate / 60;
    return Math.round(lateMinutes * minuteRate);
  }

  /**
   * Simulate overtime cost based on approved minutes and overtime rate
   * Formula: (approvedMinutes / 60) * overtimeHourlyRate
   */
  public simulateOvertimeCost(approvedMinutes: number, customHourlyRate?: number): number {
    if (approvedMinutes <= 0) return 0;
    const config = this.getStoredConfig();
    const rate = customHourlyRate !== undefined ? customHourlyRate : config.overtime.hourlyRate;
    return Math.round((approvedMinutes / 60) * rate);
  }
}

export const hrConfigurationService = new HRConfigurationServiceClass();
export const HRConfigurationService = hrConfigurationService;
