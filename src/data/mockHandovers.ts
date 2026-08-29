import { HandoverRecord, HandoverAreaTemplate } from '../types/handover';

export const HANDOVER_AREA_TEMPLATES: Record<string, HandoverAreaTemplate> = {
  'area-kitchen': {
    areaId: 'area-kitchen',
    areaName: 'Kitchen',
    department: 'Kitchen',
    sections: [
      {
        title: 'Kondisi Stasiun & Mise En Place',
        description: 'Kesiapan bahan baku, bumbu dasar, porsi pre-cut protein, dan kebersihan hot line.',
        required: true,
        defaultPrompt: 'Stok protein utama dalam batas aman.',
      },
      {
        title: 'Status Mesin & Peralatan Masak',
        description: 'Pengecekan suhu chiller, freezer, deep fryer, kompor wajan kwali, dan exhaust hood.',
        required: true,
        defaultPrompt: 'Semua peralatan berfungsi normal.',
      },
      {
        title: 'Kebersihan & Sanitasi Dapur',
        description: 'Status grease trap, tempat sampah, sanitasi talenan, dan lantai kitchen.',
        required: true,
        defaultPrompt: 'Lantai dapur bersih dan disanitasi.',
      },
    ],
    recommendedCheckpoints: [
      'Pengecekan suhu chiller & walk-in freezer',
      'Stok mise en place protein utama',
      'Kebersihan burner kompor & sink',
    ],
  },
  'area-bar': {
    areaId: 'area-bar',
    areaName: 'Bar',
    department: 'Bar',
    sections: [
      {
        title: 'Kesiapan Mesin Espresso & Grinder',
        description: 'Kalibrasi grinder, tekanan pompa espresso, dan kebersihan steam wand.',
        required: true,
        defaultPrompt: 'Mesin espresso dan grinder siap digunakan.',
      },
      {
        title: 'Stok Fresh Milk & Sirup',
        description: 'Ketersediaan susu, sirup homemade, es batu cristal, dan buah garnish.',
        required: true,
        defaultPrompt: 'Stok bar mencukupi untuk operasional shift.',
      },
    ],
    recommendedCheckpoints: [
      'Kalibrasi grinder & espresso',
      'Stok es batu kristal',
      'Kebersihan bar counter',
    ],
  },
  'area-service': {
    areaId: 'area-service',
    areaName: 'Service',
    department: 'Service',
    sections: [
      {
        title: 'Kesiapan Meja & Area Makan',
        description: 'Kebersihan meja, kursi, cutlery, condiment, dan daftar reservasi.',
        required: true,
        defaultPrompt: 'Meja dining rapi dan siap melayani tamu.',
      },
    ],
    recommendedCheckpoints: [
      'Table setting & cutlery bersih',
      'Daftar reservasi hari ini',
    ],
  },
  'area-cashier': {
    areaId: 'area-cashier',
    areaName: 'Cashier',
    department: 'Cashier',
    sections: [
      {
        title: 'Kas Fisik & EDC Stand',
        description: 'Saldo awal drawer, kertas struk thermal, dan terminal EDC/QRIS.',
        required: true,
        defaultPrompt: 'Kas laci seimbang dan EDC siap online.',
      },
    ],
    recommendedCheckpoints: [
      'Hitung kas fisik modal awal',
      'Kertas struk kasir terpasang',
    ],
  },
};

export const INITIAL_HANDOVERS: HandoverRecord[] = [];
export const INITIAL_MOCK_HANDOVERS: HandoverRecord[] = [];
