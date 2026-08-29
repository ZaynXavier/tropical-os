import { HRConfiguration } from '../types/hrConfiguration';

export const INITIAL_HR_CONFIGURATION: HRConfiguration = {
  shifts: [
    {
      id: 'shift-pagi',
      code: 'SP-01',
      name: 'Shift Pagi',
      startTime: '09:00',
      endTime: '19:00',
      scheduledDurationMinutes: 600, // 10 Jam
      gracePeriodMinutes: 10,
      status: 'ACTIVE',
      description: 'Shift operasional pagi: persiapan buka resto, mise en place, lunch rush service, dan transisi pertengahan hari.',
      createdAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'System Initializer',
      updatedAt: '2025-01-01T00:00:00.000Z',
      updatedBy: 'System Initializer',
    },
    {
      id: 'shift-siang',
      code: 'SS-02',
      name: 'Shift Siang',
      startTime: '13:00',
      endTime: '23:00',
      scheduledDurationMinutes: 600, // 10 Jam
      gracePeriodMinutes: 10,
      status: 'ACTIVE',
      description: 'Shift operasional siang-malam: afternoon prep, dinner peak service, last order bar & kitchen, dan closing sanitasi resto.',
      createdAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'System Initializer',
      updatedAt: '2025-01-01T00:00:00.000Z',
      updatedBy: 'System Initializer',
    },
  ],
  attendance: {
    gracePeriodMinutes: 10,
    minimumGpsAccuracyMeters: 50,
    allowCheckInOutsideSchedule: false,
    allowEarlyCheckIn: true,
    allowLateCheckIn: true,
    requireGps: true,
    requireFaceVerification: true,
    lateDeductionHourlyRate: 10000, // Rp 10.000 / jam
    updatedAt: '2025-01-01T00:00:00.000Z',
    updatedBy: 'Heri Setiawan (Manager)',
  },
  location: {
    locationName: 'Tropical Garden Resto',
    latitude: -8.6500,
    longitude: 115.2166,
    radiusMeters: 100,
    gpsAccuracyThresholdMeters: 50,
    isConfigured: true,
    status: 'ACTIVE',
    updatedAt: '2025-01-01T00:00:00.000Z',
    updatedBy: 'Heri Setiawan (Manager)',
  },
  breaks: {
    standardBreakMinutes: 60,
    requireApprovalForAdditionalBreak: true,
    additionalBreakPresets: [15, 20, 30, 45, 60],
    maxAdditionalBreakMinutes: 120,
    alertThresholdExcessiveMinutes: 15,
    updatedAt: '2025-01-01T00:00:00.000Z',
    updatedBy: 'Heri Setiawan (Manager)',
  },
  overtime: {
    hourlyRate: 10000, // Rp 10.000 / jam
    maxDailyHours: 4,
    requireApproval: true,
    allowOffDayOvertime: true,
    disclaimerText: 'Nilai ini merupakan simulasi internal TropicalOS dan belum merupakan perhitungan payroll resmi.',
    updatedAt: '2025-01-01T00:00:00.000Z',
    updatedBy: 'Heri Setiawan (Manager)',
  },
  payrollContract: {
    version: '1.0.0-Phase2C.5',
    description: 'Contract standar integrasi data operasional HR (Presensi, Keterlambatan, Istirahat, Lembur) menuju modul Payroll masa depan.',
    attendanceRules: {
      lateDeductionHourlyRate: 10000,
      minuteRateFormula: 'Late Minutes × (Rp 10.000 / 60)',
    },
    overtimeRules: {
      overtimeHourlyRate: 10000,
      simulationFormula: '(Approved Overtime Minutes / 60) × Rp 10.000',
    },
    breakRules: {
      standardBreakMinutes: 60,
    },
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  lastUpdated: '2025-01-01T00:00:00.000Z',
  updatedBy: 'Heri Setiawan (Manager)',
};
