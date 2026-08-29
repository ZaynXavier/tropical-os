import { AttendanceRecord, AttendanceSummary } from '../types/attendance';
import { INITIAL_EMPLOYEES } from './employees';

// Helper to format dates YYYY-MM-DD
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Clean initial attendance records (ready for live testing)
export const generateInitialAttendanceRecords = (): AttendanceRecord[] => {
  return [];
};

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const calculateAttendanceSummary = (
  records: AttendanceRecord[],
  targetDateStr?: string
): AttendanceSummary => {
  const todayStr = targetDateStr || formatDate(new Date());
  const dayRecords = records.filter((r) => r.date === todayStr);

  const totalEmployees = INITIAL_EMPLOYEES.length;
  let present = 0;
  let late = 0;
  let absent = 0;
  let leave = 0;
  let off = 0;
  let incomplete = 0;

  dayRecords.forEach((rec) => {
    switch (rec.status) {
      case 'PRESENT':
        present++;
        break;
      case 'LATE':
        late++;
        break;
      case 'ABSENT':
        absent++;
        break;
      case 'LEAVE':
        leave++;
        break;
      case 'OFF':
        off++;
        break;
      case 'INCOMPLETE':
        incomplete++;
        break;
      default:
        break;
    }
  });

  const onDutyToday = present + late;
  const eligibleManpower = totalEmployees - off - leave;
  const attendanceRate =
    eligibleManpower > 0
      ? Number((((present + late) / eligibleManpower) * 100).toFixed(1))
      : 0;

  return {
    date: todayStr,
    totalEmployees,
    present,
    late,
    absent,
    leave,
    off,
    incomplete,
    attendanceRate,
    onDutyToday,
  };
};
