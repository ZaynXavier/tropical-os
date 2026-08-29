import { OwnerDirective, DirectiveStatus, DirectivePriority, DirectiveCategory } from '../types/directive';

const STORAGE_KEY = 'tropicalos_owner_directives';

export const INITIAL_DIRECTIVES: OwnerDirective[] = [
  {
    id: 'dir-1',
    code: 'DIR-2026-001',
    title: 'Optimasi Food Cost Stasiun Kitchen & Standarisasi Portion Control',
    category: 'FOOD_COST',
    priority: 'CRITICAL',
    fromName: 'Tri Hermawanto',
    fromRole: 'OWNER',
    targetName: 'Rian',
    targetRole: 'General Manager',
    targetDate: '2026-08-30',
    createdAt: '2026-08-20 09:30',
    description:
      'Tinjau kembali deviasi pemakaian bahan baku daging sapi dan seafood di Kitchen. Pastikan timbangan digital 100% digunakan untuk setiap plating menu Signature.',
    expectedOutcome:
      'Food cost aktual turun ke rentang target 31.5% dan wasting bahan baku berkurang minimal 20%.',
    kpiTarget: 'Food Cost ≤ 31.5%',
    status: 'IN_PROGRESS',
    progressPercentage: 65,
    logs: [
      {
        id: 'log-1-1',
        authorName: 'Tri Hermawanto',
        authorRole: 'OWNER',
        message: 'Instruksi resmi diberikan kepada GM Rian untuk ditindaklanjuti bersama Head Chef Tasnim.',
        timestamp: '2026-08-20 09:30',
      },
      {
        id: 'log-1-2',
        authorName: 'Rian',
        authorRole: 'General Manager',
        message:
          'Audit porsi sudah dilakukan tanggal 22 Agustus. Ditemukan over-portion pada Gurame Bakar & Iga Bakar. Timbangan digital baru sudah didistribusikan ke kitchen line.',
        timestamp: '2026-08-23 14:15',
        progressPercentage: 40,
      },
      {
        id: 'log-1-3',
        authorName: 'Rian',
        authorRole: 'General Manager',
        message:
          'SOP gramatur resmi sudah dipasang di dinding kitchen station. Sedang evaluasi pemakaian harian batch 24-28 Agustus.',
        timestamp: '2026-08-25 16:45',
        progressPercentage: 65,
      },
    ],
  },
  {
    id: 'dir-2',
    code: 'DIR-2026-002',
    title: 'Persiapan Fasilitas & Briefing Tim untuk Gathering PT Digital Nusantara (60 Pax)',
    category: 'CUSTOMER_SERVICE',
    priority: 'HIGH',
    fromName: 'Tri Hermawanto',
    fromRole: 'OWNER',
    targetName: 'Rian',
    targetRole: 'General Manager',
    targetDate: '2026-08-25',
    createdAt: '2026-08-21 11:00',
    description:
      'Pastikan sound system garden, lighting panggung mini, dan backup genset siap total. Siapkan welcome drink Tropical Mocktail saat tamu tiba.',
    expectedOutcome:
      'Acara gathering corporate berjalan lancar dengan CSAT 5/5 dan tidak ada kendala teknis audio.',
    kpiTarget: 'Zero Complaint & CSAT 100%',
    status: 'COMPLETED',
    progressPercentage: 100,
    logs: [
      {
        id: 'log-2-1',
        authorName: 'Tri Hermawanto',
        authorRole: 'OWNER',
        message: 'Pastikan PIC Service Siti dan Barista Ulum berkoordinasi penuh untuk flow penyajian.',
        timestamp: '2026-08-21 11:00',
      },
      {
        id: 'log-2-2',
        authorName: 'Rian',
        authorRole: 'General Manager',
        message: 'Sound system dan genset sudah di-test siang ini. Meja registrasi & mocktail station sudah stand by.',
        timestamp: '2026-08-25 10:20',
        progressPercentage: 100,
      },
    ],
    verifiedAt: '2026-08-25 18:00',
  },
  {
    id: 'dir-3',
    code: 'DIR-2026-003',
    title: 'Peluncuran Paket Promo Wedding Garden 2026 Bersama Tim CRM & Marketing',
    category: 'REVENUE_SALES',
    priority: 'HIGH',
    fromName: 'Tri Hermawanto',
    fromRole: 'OWNER',
    targetName: 'Rian',
    targetRole: 'General Manager',
    targetDate: '2026-09-05',
    createdAt: '2026-08-24 15:30',
    description:
      'Koordinasikan bersama CRM (Alya) dan Content Creator (Naila) untuk merilis video reel & brosur PDF paket Wedding Garden intimate 100-200 Pax.',
    expectedOutcome: 'Mendapatkan minimal 5 prospek qualified booking wedding untuk Q4 2026.',
    kpiTarget: 'Target 5 Leads Wedding Qualified',
    status: 'IN_PROGRESS',
    progressPercentage: 35,
    logs: [
      {
        id: 'log-3-1',
        authorName: 'Tri Hermawanto',
        authorRole: 'OWNER',
        message: 'Brosur penawaran harus memuat rincian paket buffet premium dan opsi live music.',
        timestamp: '2026-08-24 15:30',
      },
      {
        id: 'log-3-2',
        authorName: 'Rian',
        authorRole: 'General Manager',
        message: 'Draft brosur dan breakdown HPP paket 150 pax sedang difinalisasi bersama tim Finance.',
        timestamp: '2026-08-25 11:00',
        progressPercentage: 35,
      },
    ],
  },
  {
    id: 'dir-4',
    code: 'DIR-2026-004',
    title: 'Evaluasi Disiplin Presensi & Pengaturan Lembur Shift Weekend',
    category: 'HR_PEOPLE',
    priority: 'MEDIUM',
    fromName: 'Tri Hermawanto',
    fromRole: 'OWNER',
    targetName: 'Rian',
    targetRole: 'General Manager',
    targetDate: '2026-09-02',
    createdAt: '2026-08-25 08:00',
    description:
      'Pastikan seluruh persetujuan lembur staf wajib ada Surat Perintah Lembur (SPL) H-1 dan tidak ada keterlambatan presensi tanpa alasan sah.',
    expectedOutcome: 'Tingkat on-time kehadiran staf mencapai 98% dan biaya overtime efisien.',
    kpiTarget: 'Attendance Rate ≥ 98%',
    status: 'NEW',
    progressPercentage: 10,
    logs: [
      {
        id: 'log-4-1',
        authorName: 'Tri Hermawanto',
        authorRole: 'OWNER',
        message: 'Instruksi baru diberikan. Mohon adakan briefing singkat dengan para supervisor hari Kamis.',
        timestamp: '2026-08-25 08:00',
      },
    ],
  },
];

class DirectiveService {
  private getDirectives(): OwnerDirective[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DIRECTIVES));
        return INITIAL_DIRECTIVES;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing directives from localStorage:', e);
      return INITIAL_DIRECTIVES;
    }
  }

  private saveDirectives(items: OwnerDirective[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving directives to localStorage:', e);
    }
  }

  public getAll(): OwnerDirective[] {
    return this.getDirectives();
  }

  public getById(id: string): OwnerDirective | undefined {
    return this.getDirectives().find((d) => d.id === id);
  }

  public createDirective(data: {
    title: string;
    category: DirectiveCategory;
    priority: DirectivePriority;
    targetDate: string;
    description: string;
    expectedOutcome: string;
    kpiTarget?: string;
    fromName?: string;
    fromRole?: string;
    targetName?: string;
    targetRole?: string;
  }): OwnerDirective {
    const list = this.getDirectives();
    const count = list.length + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDirective: OwnerDirective = {
      id: `dir-${Date.now()}`,
      code: `DIR-2026-${String(count).padStart(3, '0')}`,
      title: data.title,
      category: data.category,
      priority: data.priority,
      fromName: data.fromName || 'Tri Hermawanto',
      fromRole: data.fromRole || 'OWNER',
      targetName: data.targetName || 'Rian',
      targetRole: data.targetRole || 'General Manager',
      targetDate: data.targetDate,
      createdAt: formattedDate,
      description: data.description,
      expectedOutcome: data.expectedOutcome,
      kpiTarget: data.kpiTarget,
      status: 'NEW',
      progressPercentage: 0,
      logs: [
        {
          id: `log-${Date.now()}`,
          authorName: data.fromName || 'Tri Hermawanto',
          authorRole: data.fromRole || 'OWNER',
          message: 'Instruksi resmi diberikan kepada General Manager.',
          timestamp: formattedDate,
        },
      ],
    };

    const updated = [newDirective, ...list];
    this.saveDirectives(updated);
    return newDirective;
  }

  public addProgressLog(
    directiveId: string,
    authorName: string,
    authorRole: string,
    message: string,
    newProgress?: number,
    newStatus?: DirectiveStatus
  ): OwnerDirective | undefined {
    const list = this.getDirectives();
    const index = list.findIndex((d) => d.id === directiveId);
    if (index === -1) return undefined;

    const item = list[index];
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog = {
      id: `log-${Date.now()}`,
      authorName,
      authorRole,
      message,
      timestamp: formattedDate,
      progressPercentage: newProgress,
    };

    const updatedItem: OwnerDirective = {
      ...item,
      logs: [...item.logs, newLog],
      progressPercentage: typeof newProgress === 'number' ? newProgress : item.progressPercentage,
      status: newStatus || (newProgress === 100 ? 'COMPLETED' : item.status === 'NEW' ? 'IN_PROGRESS' : item.status),
      verifiedAt: newStatus === 'COMPLETED' || newProgress === 100 ? formattedDate : item.verifiedAt,
    };

    list[index] = updatedItem;
    this.saveDirectives(list);
    return updatedItem;
  }

  public updateStatus(directiveId: string, status: DirectiveStatus, feedback?: string): OwnerDirective | undefined {
    const list = this.getDirectives();
    const index = list.findIndex((d) => d.id === directiveId);
    if (index === -1) return undefined;

    const item = list[index];
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedItem: OwnerDirective = {
      ...item,
      status,
      ownerFeedback: feedback || item.ownerFeedback,
      progressPercentage: status === 'COMPLETED' ? 100 : item.progressPercentage,
      verifiedAt: status === 'COMPLETED' ? formattedDate : item.verifiedAt,
    };

    list[index] = updatedItem;
    this.saveDirectives(list);
    return updatedItem;
  }

  public deleteDirective(id: string): boolean {
    const list = this.getDirectives();
    const filtered = list.filter((d) => d.id !== id);
    if (filtered.length === list.length) return false;
    this.saveDirectives(filtered);
    return true;
  }
}

export const directiveService = new DirectiveService();
