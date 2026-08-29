export type ShiftActiveStatus = 'ACTIVE' | 'INACTIVE';

export interface ShiftConfiguration {
  id: string; // e.g. 'shift-pagi', 'shift-siang'
  code: string; // e.g. 'SP-01', 'SS-02'
  name: string; // e.g. 'Shift Pagi', 'Shift Siang'
  startTime: string; // '09:00'
  endTime: string; // '19:00'
  scheduledDurationMinutes: number; // 600
  gracePeriodMinutes: number; // 10
  status: ShiftActiveStatus;
  description?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type LateDeductionCalculationMethod = 'CEILING_HOUR' | 'FULL_HOUR' | 'PER_MINUTE';

export interface AttendanceConfiguration {
  gracePeriodMinutes: number; // default: 10
  minimumGpsAccuracyMeters: number; // default: 50
  allowCheckInOutsideSchedule: boolean; // default: false
  allowEarlyCheckIn: boolean; // default: true
  allowLateCheckIn: boolean; // default: true
  requireGps: boolean; // default: true
  requireFaceVerification: boolean; // default: true
  lateDeductionHourlyRate: number; // default: 10000 (Rp 10.000 / jam)
  lateDeductionCalculationMethod?: LateDeductionCalculationMethod; // default: 'CEILING_HOUR'
  updatedAt: string;
  updatedBy: string;
}

export interface LocationConfiguration {
  locationName: string; // 'Tropical Garden Resto'
  latitude: number | null; // e.g. -8.6500 or null if unconfigured
  longitude: number | null; // e.g. 115.2166 or null if unconfigured
  radiusMeters: number; // default: 100
  gpsAccuracyThresholdMeters: number; // default: 50
  isConfigured: boolean; // true if lat/lng are set and confirmed
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
  updatedBy: string;
}

export interface BreakConfiguration {
  standardBreakMinutes: number; // default: 60
  requireApprovalForAdditionalBreak: boolean; // default: true
  additionalBreakPresets: number[]; // [15, 20, 30, 45, 60]
  maxAdditionalBreakMinutes: number; // default: 120
  alertThresholdExcessiveMinutes: number; // default: 15
  updatedAt: string;
  updatedBy: string;
}

export interface OvertimeConfiguration {
  hourlyRate: number; // default: 10000 (Rp 10.000 / jam)
  maxDailyHours: number; // default: 4
  requireApproval: boolean; // default: true
  allowOffDayOvertime: boolean; // default: true
  disclaimerText: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AttendanceToPayrollContract {
  employeeId: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
  lateMinutes: number;
  lateDeductionAmount: number;
}

export interface OvertimeToPayrollContract {
  employeeId: string;
  date: string;
  approvedMinutes: number;
  overtimeRate: number;
  estimatedOvertimeCost: number;
  approvedBy: string;
}

export interface BreakToPayrollContract {
  employeeId: string;
  date: string;
  additionalBreakMinutes: number;
  approvedBy: string;
}

export interface KpiToPayrollContract {
  employeeId: string;
  period: string;
  score: number;
  incentiveMultiplier: number;
}

export interface PayrollIntegrationContract {
  version: string;
  description?: string;
  generatedAt?: string;
  restaurantLocation?: string;
  shiftSummary?: {
    totalActiveShifts: number;
    defaultGracePeriodMinutes: number;
  };
  attendanceRules?: {
    lateDeductionHourlyRate: number;
    minuteRateFormula: string;
  };
  overtimeRules?: {
    overtimeHourlyRate: number;
    simulationFormula: string;
  };
  breakRules?: {
    standardBreakMinutes: number;
  };
  attendanceDeductionContract?: {
    formula: string;
    hourlyRateRupiah: number;
    ratePerMinuteRupiah: number;
    gracePeriodMinutes: number;
    allowEarlyClockIn: boolean;
  };
  overtimeContract?: {
    formula: string;
    hourlyRateRupiah: number;
    maxDailyHours: number;
    requireSupervisorApproval: boolean;
    isSimulationOnly: boolean;
  };
  breakContract?: {
    standardDailyQuotaMinutes: number;
    excessiveThresholdMinutes: number;
    excessiveDeductionApplicable: boolean;
  };
  updatedAt: string;
}

export interface HRConfiguration {
  shifts: ShiftConfiguration[];
  attendance: AttendanceConfiguration;
  location: LocationConfiguration;
  breaks: BreakConfiguration;
  overtime: OvertimeConfiguration;
  payrollContract: PayrollIntegrationContract;
  lastUpdated: string;
  updatedBy: string;
}

export type HRConfigurationState = HRConfiguration;

