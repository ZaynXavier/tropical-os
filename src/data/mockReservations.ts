export interface StaffReservation {
  id: string;
  reservationCode: string;
  guestName: string;
  phone: string;
  pax: number;
  date: string;
  time: string;
  tableNo: string;
  area: 'VIP Gazebo' | 'Garden Outdoor' | 'Indoor AC' | 'Private Room' | 'Main Dining Hall';
  occasion: string;
  status: 'UPCOMING' | 'PREPARING' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  depositStatus: 'DP_LUNAS' | 'LUNAS' | 'BELUM_DP';
  depositAmount: number;
  assignedStaff: {
    waiterId: string;
    waiterName: string;
    kitchenPIC: string;
    barPIC: string;
    crmPIC?: string;
    tableReady: boolean;
    kitchenReady: boolean;
    barReady: boolean;
  };
  preOrderMenu: {
    name: string;
    qty: number;
    category: 'Food' | 'Drink' | 'Special';
    notes?: string;
  }[];
  specialNotes: string[];
}

export const MOCK_STAFF_RESERVATIONS: StaffReservation[] = [];
