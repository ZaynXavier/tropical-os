export type ReservationType =
  | 'EVENT_GATHERING'
  | 'WEDDING'
  | 'BIRTHDAY'
  | 'VIP_TABLE'
  | 'CORPORATE_DINNER'
  | 'FAMILY_DINING';

export type ReservationStatus =
  | 'CONFIRMED'
  | 'RESERVED'
  | 'WAITING_DP'
  | 'COMPLETED'
  | 'CANCELLED';

export type ReservationPaymentStatus = 'PAID_FULL' | 'DP_PAID' | 'UNPAID';

export interface ReservationItem {
  id: string;
  code: string; // e.g. "RES-2026-081"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  type: ReservationType;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "18:30 WIB"
  area: string; // e.g. "Garden Area Utama", "Pendopo VIP", "Indoor AC VIP 1"
  pax: number;
  estimatedValue: number;
  downPayment: number;
  paymentStatus: ReservationPaymentStatus;
  status: ReservationStatus;
  specialRequests: string[];
  notes: string;
  picName: string;
  menuPackage?: string;
  createdAt: string;
}
