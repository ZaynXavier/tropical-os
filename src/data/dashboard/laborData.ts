import { LaborData, DashboardPeriod } from './types';

const emptyLaborData: LaborData = {
  totalEmployees: 1,
  activeOnDutyToday: 1,
  laborCostRp: 0,
  laborCostPct: 0,
  laborCostTargetPct: 20.0,
  salesPerEmployeeRp: 0,
  salesPerLaborHourRp: 0,
  totalOvertimeHours: 0,
  overtimeCostRp: 0,
  attendanceRatePct: 100.0,
  lateArrivalsCount: 0,
  turnoverRatePct: 0.0,
  staffingStatus: 'BALANCED',
  staffingStatusNote: 'Akun Super Admin aktif siap untuk konfigurasi roster dan karyawan.',
  productivityByShift: [],
  departmentHeadcount: [
    { department: 'Executive', headcount: 1, laborCostRp: 0 },
  ],
};

export const mockLaborData: Record<DashboardPeriod, LaborData> = {
  month: emptyLaborData,
  week: emptyLaborData,
  today: emptyLaborData,
  custom: emptyLaborData,
};
