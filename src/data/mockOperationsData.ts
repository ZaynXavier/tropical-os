export interface ShiftLog {
  id: string;
  shiftType: "Shift Pagi" | "Shift Siang" | "Shift Full Day";
  date: string;
  supervisor: string;
  division: string;
  weather: "Cerah" | "Hujan Gerimis" | "Hujan Lebat";
  activeTables: number;
  totalGuests: number;
  handoverNotes: string;
  status: "Completed" | "In Progress" | "Pending Handover";
}

export interface ShiftChecklistCategory {
  id: string;
  division: "Waiters / Floor" | "Kitchen / Dapur" | "Barista / Bar" | "Housekeeping" | "Kasir / Cashier" | "Purchasing & Inventory" | "Finance & Accounting" | "Content Creator" | "CRM & Service VIP";
  shiftType: "Shift Pagi" | "Shift Siang" | "Shift Full Day";
  title: string;
  tasks: {
    id: string;
    task: string;
    completed: boolean;
    assignedRole: string;
  }[];
}

export interface WastingLogItem {
  id: string;
  date: string;
  time: string;
  itemCode: string;
  itemName: string;
  category: "Bahan Dapur" | "Bahan Bar" | "Makanan Jadi" | "Buah & Sayur" | string;
  quantity: number;
  unit: "Kg" | "Liter" | "Pcs" | "Pack" | "Porti" | "Porsi" | "Botol" | string;
  reason: "Rusak/Kedaluwarsa" | "Salah Masak/Human Error" | "Spillage / Tumpah" | "Sisa Piring (Plate Waste)" | string;
  costPerUnit: number;
  totalCost: number;
  reportedBy: string;
  division: string;
  status: "Approved" | "Pending Review";
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  photoAttached?: boolean;
}

export const MOCK_SHIFT_LOGS: ShiftLog[] = [];
export const MOCK_OPERATIONS_CHECKLISTS: ShiftChecklistCategory[] = [];
export const MOCK_SHIFT_CHECKLISTS: ShiftChecklistCategory[] = [];
export const MOCK_WASTING_LOGS: WastingLogItem[] = [];
