import { Shift } from '../types/schedule';

export const OFFICIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-pagi',
    name: 'Shift Pagi',
    startTime: '09:00',
    endTime: '19:00',
    scheduledDurationMinutes: 600, // 10 jam
    gracePeriodMinutes: 10,
    status: 'ACTIVE',
    description: 'Shift operasional pagi: persiapan buka resto, mise en place, lunch rush service, dan transisi pertengahan hari.',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'shift-siang',
    name: 'Shift Siang',
    startTime: '13:00',
    endTime: '23:00',
    scheduledDurationMinutes: 600, // 10 jam
    gracePeriodMinutes: 10,
    status: 'ACTIVE',
    description: 'Shift operasional siang-malam: afternoon prep, dinner peak service, last order bar & kitchen, dan closing sanitasi resto.',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];
