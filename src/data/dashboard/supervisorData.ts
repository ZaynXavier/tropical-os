import { SupervisorOperationalData } from './types';

export const mockSupervisorOperationalData: SupervisorOperationalData = {
  shiftName: 'Shift Operasional',
  shiftHours: '08:00 - 23:00 WIB',
  onDutyLead: 'Super Admin Tropical Garden',
  activeTablesCount: 0,
  totalTablesCapacity: 24,
  occupancyRatePct: 0.0,
  liveKitchenOrdersCount: 0,
  kitchenAvgPrepMinutes: 0.0,
  liveBarOrdersCount: 0,
  barAvgPrepMinutes: 0.0,
  checklistProgress: [],
  todayWastingSummary: {
    itemsCount: 0,
    totalEstimatedLossRp: 0,
    urgentReviewNeeded: false,
  },
  attendanceSummary: {
    present: 1,
    totalExpected: 1,
    onBreak: 0,
    late: 0,
  },
  cashierHandoverStatus: {
    isOpeningSettled: true,
    floatCashAmount: 0,
    currentTurnoverEstimate: 0,
    lastReconciliationTime: 'Belum ada transaksi shift',
  },
};
