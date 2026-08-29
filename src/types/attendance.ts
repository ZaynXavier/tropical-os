export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'LEAVE'
  | 'OFF'
  | 'INCOMPLETE';

export type AttendanceLocationStatus =
  | 'VALID'
  | 'INVALID'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'OUTSIDE_AREA'
  | 'LOW_ACCURACY'
  | 'PENDING';

export type AttendanceFaceStatus =
  | 'VERIFIED'
  | 'FAILED'
  | 'SKIPPED'
  | 'PENDING';

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'LOCATION_UNAVAILABLE'
  | 'LOW_ACCURACY'
  | 'OUTSIDE_GEOFENCE'
  | 'LOCATION_NOT_CONFIGURED';

export interface LocationValidationResult {
  isValid: boolean;
  status: AttendanceLocationStatus;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  accuracyMeters?: number;
  radiusMeters?: number;
  locationName?: string;
  isSimulated?: boolean;
  errorCode?: LocationErrorCode;
  errorMessage?: string;
  timestamp?: string;
}

export interface GeofenceValidationResult extends LocationValidationResult {
  validatedAt: string;
  message: string;
}

export type FaceErrorCode =
  | 'PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'FACE_NOT_DETECTED'
  | 'VERIFICATION_FAILED';

export interface FaceVerificationResult {
  verified: boolean;
  status: AttendanceFaceStatus;
  confidence: number; // 0 - 100
  errorCode?: FaceErrorCode;
  errorMessage?: string;
  timestamp?: string;
}

export interface AttendanceRecord {
  id: string;
  attendanceId?: string; // alias for id
  employeeId: string;
  employeeNo?: string;
  employeeName?: string;
  department?: string;
  primaryPosition?: string;
  date: string; // YYYY-MM-DD
  scheduleId?: string;
  shiftId?: string;
  scheduledStart?: string; // e.g. "09:00"
  scheduledEnd?: string; // e.g. "19:00"
  actualCheckIn?: string | null; // e.g. "08:45:10"
  actualCheckOut?: string | null; // e.g. "19:15:20"
  checkIn: string | null; // e.g. "08:45:10" or "08:45"
  checkOut: string | null; // e.g. "17:15:30" or null
  status: AttendanceStatus;
  lateMinutes: number;
  lateDeductionAmount?: number;
  lateDeductionCalculationMethod?: 'CEILING_HOUR' | 'FULL_HOUR' | 'PER_MINUTE';
  potentialOvertimeMinutes?: number;
  isOvertimeCandidate?: boolean;
  locationStatus: AttendanceLocationStatus;
  faceVerificationStatus: AttendanceFaceStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  // Check In Location Snapshot
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInDistanceMeters?: number;
  checkInAccuracyMeters?: number;
  checkInGeofenceStatus?: AttendanceLocationStatus;
  checkInRadiusMeters?: number;

  // Check Out Location Snapshot
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutDistanceMeters?: number;
  checkOutAccuracyMeters?: number;
  checkOutGeofenceStatus?: AttendanceLocationStatus;
  checkOutRadiusMeters?: number;

  // Metadata & GPS validation details (top-level legacy fallbacks)
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  accuracyMeters?: number;
  faceConfidence?: number;
  durationHours?: number;

  // Backward compatibility fields
  employee_id?: string;
  employee_name?: string;
  employee_emp_id?: string;
  division?: string;
  role?: string;
  clock_in?: string | null;
  clock_out?: string | null;
  total_hours?: number;
  shift_type?: string;
}

export interface AttendanceFilterParams {
  employeeId?: string;
  department?: string | 'ALL';
  status?: AttendanceStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  date?: string;
  searchQuery?: string;
}

export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
  off: number;
  incomplete: number;
  attendanceRate: number; // e.g. 91.7
  onDutyToday: number;
}
