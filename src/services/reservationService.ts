import { ReservationItem, ReservationStatus } from '../types/reservation';

const STORAGE_KEY = 'tropicalos_upcoming_reservations';

export const INITIAL_RESERVATIONS: ReservationItem[] = [
  {
    id: 'res-1',
    code: 'RES-2026-081',
    customerName: 'Hendra Wijaya',
    customerPhone: '+62 812-3456-7890',
    customerEmail: 'hendra.w@digitalnusantara.id',
    companyName: 'PT Digital Nusantara',
    type: 'EVENT_GATHERING',
    date: '2026-08-26',
    time: '18:30 WIB',
    area: 'Garden Area Utama & Panggung Mini',
    pax: 60,
    estimatedValue: 35000000,
    downPayment: 17500000,
    paymentStatus: 'DP_PAID',
    status: 'CONFIRMED',
    specialRequests: [
      'Buffet Nusantara Premium 60 Pax',
      'Setup Sound System & Wireless Mic',
      'Welcome Drink Tropical Fruit Mocktail',
      'Banner Backstage Gathering Resto',
    ],
    notes: 'Tamu VIP Direksi hadir pukul 18:45 WIB. Meja utama di bagian depan panggung.',
    picName: 'Alya (CRM) & Siti (Lead Service)',
    menuPackage: 'Paket Buffet Corporate Tropical Emerald',
    createdAt: '2026-08-15',
  },
  {
    id: 'res-2',
    code: 'RES-2026-082',
    customerName: 'Bpk. Budi Santoso',
    customerPhone: '+62 813-1122-3344',
    customerEmail: 'budi.santoso@yahoo.com',
    type: 'VIP_TABLE',
    date: '2026-08-26',
    time: '19:00 WIB',
    area: 'Pendopo VIP Utama',
    pax: 12,
    estimatedValue: 6500000,
    downPayment: 6500000,
    paymentStatus: 'PAID_FULL',
    status: 'CONFIRMED',
    specialRequests: [
      'Menu Pre-Order Gurame Bakar Madu & Iga Garang Asam',
      'Dekorasi Meja Bunga Segar',
      'Private Service Waiter Standby',
    ],
    notes: 'Ulang tahun pernikahan ke-25 keluarga besar. Mohon disiapkan complimentary dessert platter.',
    picName: 'Tasnim (Head Chef) & Siti (Service)',
    menuPackage: 'A La Carte VIP Family Selection',
    createdAt: '2026-08-20',
  },
  {
    id: 'res-3',
    code: 'RES-2026-083',
    customerName: 'Melani Putri',
    customerPhone: '+62 817-5566-7788',
    customerEmail: 'melani.putri@gmail.com',
    type: 'BIRTHDAY',
    date: '2026-08-28',
    time: '16:00 WIB',
    area: 'Gazebo Garden & Poolside Resto',
    pax: 30,
    estimatedValue: 15500000,
    downPayment: 10000000,
    paymentStatus: 'DP_PAID',
    status: 'CONFIRMED',
    specialRequests: [
      'Dekorasi Pastel Garden Party (Sweet 17th)',
      'Live Bar Mocktail Corner',
      'Spot Foto Neon Tropical',
    ],
    notes: 'Kue ulang tahun diantar vendor pukul 15:00 WIB, simpan di chiller pastry.',
    picName: 'Alya (CRM) & Ulum (Lead Bar)',
    menuPackage: 'Paket Youth Fiesta & Live Mocktail Station',
    createdAt: '2026-08-18',
  },
  {
    id: 'res-4',
    code: 'RES-2026-084',
    customerName: 'Dr. Aris Setiawan',
    customerPhone: '+62 819-2233-4455',
    customerEmail: 'aris.s@rsgrahamedika.com',
    companyName: 'RS Graha Medika',
    type: 'CORPORATE_DINNER',
    date: '2026-08-30',
    time: '12:00 WIB',
    area: 'Indoor AC VIP Room 1 & 2',
    pax: 45,
    estimatedValue: 22000000,
    downPayment: 15000000,
    paymentStatus: 'DP_PAID',
    status: 'CONFIRMED',
    specialRequests: [
      'Proyektor & Layar Presentasi 3x2m',
      'Coffee Break Pagi (Pastry + Kopi Nusantara)',
      'Makan Siang Prasmanan Sehat Rendah Gula',
    ],
    notes: 'Seminar dokter spesialis. Ruangan disterilkan dan AC diset 22°C mulai 10:30 WIB.',
    picName: 'Alya (CRM)',
    menuPackage: 'Executive Meeting & Healthy Buffet Package',
    createdAt: '2026-08-21',
  },
  {
    id: 'res-5',
    code: 'RES-2026-085',
    customerName: 'Ibu Sarah Kartika',
    customerPhone: '+62 811-9876-5432',
    customerEmail: 'sarah.kartika@bumn.co.id',
    companyName: 'Bank BUMN Regional',
    type: 'WEDDING',
    date: '2026-09-12',
    time: '16:30 WIB',
    area: 'Full Garden Area & Ballroom Pendopo',
    pax: 150,
    estimatedValue: 78000000,
    downPayment: 40000000,
    paymentStatus: 'DP_PAID',
    status: 'CONFIRMED',
    specialRequests: [
      'Setup Akad & Resepsi Garden Intimate',
      'Food Tasting Final tanggal 29 Agustus (6 Pax)',
      'Live Acoustic Band & Lighting Ambience',
      'Valet Parking Service untuk 50 Mobil',
    ],
    notes: 'Pernikahan Sarah & Dimas. Owner Tri Hermawanto diminta berkenan memberikan sambutan singkat.',
    picName: 'Rian (GM) & Alya (CRM)',
    menuPackage: 'Royal Tropical Garden Wedding Buffet 150 Pax',
    createdAt: '2026-08-04',
  },
  {
    id: 'res-6',
    code: 'RES-2026-086',
    customerName: 'Bambang Kurnia',
    customerPhone: '+62 812-7788-9900',
    companyName: 'Alumni FH Angkatan 2005',
    type: 'EVENT_GATHERING',
    date: '2026-09-05',
    time: '17:00 WIB',
    area: 'Terrace Garden Outdoor',
    pax: 40,
    estimatedValue: 18000000,
    downPayment: 5000000,
    paymentStatus: 'DP_PAID',
    status: 'CONFIRMED',
    specialRequests: [
      'Barbeque Live Grilling Station',
      'Tropical Sangria (Non-Alcohol) Dispenser',
      'Sound System Reuni',
    ],
    notes: 'Reuni 20 tahun. Live BBQ station mulai disiapkan pukul 16:30 WIB di tepi taman.',
    picName: 'Alya (CRM)',
    menuPackage: 'Live BBQ & Indonesian Heritage Night',
    createdAt: '2026-08-22',
  },
];

class ReservationService {
  private getReservations(): ReservationItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
        return INITIAL_RESERVATIONS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing reservations from localStorage:', e);
      return INITIAL_RESERVATIONS;
    }
  }

  private saveReservations(items: ReservationItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving reservations to localStorage:', e);
    }
  }

  public getAll(): ReservationItem[] {
    return this.getReservations().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getUpcoming(): ReservationItem[] {
    return this.getAll().filter((r) => r.status !== 'CANCELLED');
  }

  public getById(id: string): ReservationItem | undefined {
    return this.getReservations().find((r) => r.id === id);
  }

  public createReservation(item: Omit<ReservationItem, 'id' | 'code' | 'createdAt'>): ReservationItem {
    const list = this.getReservations();
    const count = list.length + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const newRes: ReservationItem = {
      ...item,
      id: `res-${Date.now()}`,
      code: `RES-2026-${String(count).padStart(3, '0')}`,
      createdAt: formattedDate,
    };

    const updated = [newRes, ...list];
    this.saveReservations(updated);
    return newRes;
  }

  public updateStatus(id: string, status: ReservationStatus): ReservationItem | undefined {
    const list = this.getReservations();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;

    list[idx] = { ...list[idx], status };
    this.saveReservations(list);
    return list[idx];
  }
}

export const reservationService = new ReservationService();
