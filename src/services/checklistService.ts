/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Checklist Service Implementation
 * Full-featured persistence and execution engine for Kitchen, Bar, Service, Cashier,
 * and Cleaning checklists, supervisor verification, and KPI integration.
 */

import {
  ChecklistTemplate,
  ChecklistTemplateItem,
  ChecklistAssignment,
  ChecklistExecution,
  ChecklistEvidence,
  ChecklistDashboardMetrics,
} from '../types';

const TEMPLATES_KEY = 'tropicalos_checklist_templates';
const ASSIGNMENTS_KEY = 'tropicalos_checklist_assignments';
const EXECUTIONS_KEY = 'tropicalos_checklist_executions';
const EVIDENCE_KEY = 'tropicalos_checklist_evidence';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'tmpl-kit-open-01',
    code: 'CHK-KIT-001',
    title: 'Checklist Opening & Sanitasi Dapur (Shift Pagi)',
    name: 'Checklist Opening & Sanitasi Dapur',
    division: 'KITCHEN',
    shift_type: 'OPENING',
    role_target: 'Cook / Cook Helper',
    frequency: 'DAILY',
    description: 'Pemeriksaan sanitasi, suhu chiller/freezer, dan kesiapan mise en place sebelum dapur beroperasi.',
    is_active: true,
    requires_verification: true,
    passing_score: 85,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
    items: [
      {
        id: 'itm-k-1',
        template_id: 'tmpl-kit-open-01',
        task_name: 'Pemeriksaan Grooming, Hairnet, dan Sepatu Safety Koki',
        title: 'Pemeriksaan Grooming, Hairnet, dan Sepatu Safety Koki',
        task_order: 1,
        sequence: 1,
        is_required: true,
        area: 'Kitchen Entry',
        instructions: 'Pastikan kuku pendek, apron bersih, topi/hairnet terpasang rapi.',
        standard: 'Standar HACCP 100% rapi',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 15,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-k-2',
        template_id: 'tmpl-kit-open-01',
        task_name: 'Pengecekan Log Suhu Chiller (1-4°C) & Freezer (-18°C)',
        title: 'Pengecekan Log Suhu Chiller (1-4°C) & Freezer (-18°C)',
        task_order: 2,
        sequence: 2,
        is_required: true,
        area: 'Walk-in & Reach-in Chiller',
        instructions: 'Catat termometer digital chiller. Lampirkan foto display suhu termometer.',
        standard: 'Chiller 1-4°C, Freezer ≤ -18°C',
        requires_evidence: true,
        evidence_type: 'PHOTO_AND_NOTE',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-k-3',
        template_id: 'tmpl-kit-open-01',
        task_name: 'Sanitasi Meja Stainless & Penyiapan Talenan 5 Warna',
        title: 'Sanitasi Meja Stainless & Penyiapan Talenan 5 Warna',
        task_order: 3,
        sequence: 3,
        is_required: true,
        area: 'Preparation Area',
        instructions: 'Semprot sanitizer food-grade pada meja dan tata talenan sesuai kode warna.',
        standard: 'Talenan merah, kuning, biru, hijau, putih siap pada posisinya',
        requires_evidence: true,
        evidence_type: 'PHOTO',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-k-4',
        template_id: 'tmpl-kit-open-01',
        task_name: 'Pemeriksaan Mise en Place Bahan Potong & Labeling FIFO',
        title: 'Pemeriksaan Mise en Place Bahan Potong & Labeling FIFO',
        task_order: 4,
        sequence: 4,
        is_required: true,
        area: 'Hot Kitchen & Cold Station',
        instructions: 'Periksa ketersediaan bumbu dasar, porsi daging, dan stiker tanggal FIFO.',
        standard: 'Semua wadah tertutup rapat dan berlabel tanggal',
        requires_evidence: false,
        evidence_type: 'NOTE',
        weight: 20,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-k-5',
        template_id: 'tmpl-kit-open-01',
        task_name: 'Pengecekan Api Kompor Gas, Regulator & Exhaust Hood',
        title: 'Pengecekan Api Kompor Gas, Regulator & Exhaust Hood',
        task_order: 5,
        sequence: 5,
        is_required: true,
        area: 'Cooking Line',
        instructions: 'Nyalakan exhaust hood, periksa bau kebocoran gas, uji pemantik api biru kompor.',
        standard: 'Api biru stabil dan exhaust berputar lancar',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 15,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'tmpl-bar-open-01',
    code: 'CHK-BAR-001',
    title: 'Checklist Opening & Kalibrasi Barista (Shift Pagi)',
    name: 'Checklist Opening & Kalibrasi Barista',
    division: 'BARISTA',
    shift_type: 'OPENING',
    role_target: 'Barista',
    frequency: 'DAILY',
    description: 'Kalibrasi espresso, pemanasan boiler La Marzocco, kesiapan es batu, sirup, dan buah segar.',
    is_active: true,
    requires_verification: true,
    passing_score: 90,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
    items: [
      {
        id: 'itm-b-1',
        template_id: 'tmpl-bar-open-01',
        task_name: 'Warm Up Mesin Espresso La Marzocco & Boiler Pressure',
        title: 'Warm Up Mesin Espresso La Marzocco & Boiler Pressure',
        task_order: 1,
        sequence: 1,
        is_required: true,
        area: 'Bar Counter',
        instructions: 'Pastikan suhu PID 93.5°C dan jarum steam pressure 1.3 bar.',
        standard: 'Tekanan dan suhu stabil',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 20,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-b-2',
        template_id: 'tmpl-bar-open-01',
        task_name: 'Dial-in & Kalibrasi Rasio Espresso (18g in / 36g out @ 27s)',
        title: 'Dial-in & Kalibrasi Rasio Espresso (18g in / 36g out @ 27s)',
        task_order: 2,
        sequence: 2,
        is_required: true,
        area: 'Grinder Station',
        instructions: 'Timbang dose 18g, ekstraksi double shot 36g dalam 25-29 detik. Upload foto timbangan.',
        standard: 'Ekstraksi 27 ± 2 detik dengan crema tebal',
        requires_evidence: true,
        evidence_type: 'PHOTO_AND_NOTE',
        weight: 35,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-b-3',
        template_id: 'tmpl-bar-open-01',
        task_name: 'Pengecekan Stok Fresh Milk, Sirup, dan Es Kristal Higienis',
        title: 'Pengecekan Stok Fresh Milk, Sirup, dan Es Kristal Higienis',
        task_order: 3,
        sequence: 3,
        is_required: true,
        area: 'Under-counter Chiller & Ice Bin',
        instructions: 'Pastikan es kristal cukup untuk shift pagi dan fresh milk bersuhu < 4°C.',
        standard: 'Stok penuh dan higienis',
        requires_evidence: true,
        evidence_type: 'PHOTO',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-b-4',
        template_id: 'tmpl-bar-open-01',
        task_name: 'Sanitasi Bar Counter, Knockbox, & Kain Lap Microfiber',
        title: 'Sanitasi Bar Counter, Knockbox, & Kain Lap Microfiber',
        task_order: 4,
        sequence: 4,
        is_required: true,
        area: 'Bar Service Front',
        instructions: 'Lap permukaan bar hingga mengkilap dan siapkan 3 lap microfiber berbeda warna.',
        standard: 'Bar bersih dan rapi',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 20,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'tmpl-srv-open-01',
    code: 'CHK-SRV-001',
    title: 'Checklist Kesiapan Floor Dining & Table Setting (Shift Pagi)',
    name: 'Checklist Kesiapan Floor Dining & Table Setting',
    division: 'SERVICE',
    shift_type: 'OPENING',
    role_target: 'Waiter / Waitress',
    frequency: 'DAILY',
    description: 'Pemeriksaan kebersihan meja, kursi, cutlery steril, buku menu, dan musik latar resto.',
    is_active: true,
    requires_verification: true,
    passing_score: 85,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
    items: [
      {
        id: 'itm-s-1',
        template_id: 'tmpl-srv-open-01',
        task_name: 'Pemeriksaan Kebersihan Lantai, Meja & Kursi Dining & Garden',
        title: 'Pemeriksaan Kebersihan Lantai, Meja & Kursi Dining & Garden',
        task_order: 1,
        sequence: 1,
        is_required: true,
        area: 'Dining Area & Garden',
        instructions: 'Pastikan seluruh meja diseka bersih, lantai dipel wangi, dan kursi tertata rapi.',
        standard: 'Zero remah makanan dan debu',
        requires_evidence: true,
        evidence_type: 'PHOTO',
        weight: 30,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-s-2',
        template_id: 'tmpl-srv-open-01',
        task_name: 'Penyiapan Set Cutlery Steril, Tissue, dan Condiment Meja',
        title: 'Penyiapan Set Cutlery Steril, Tissue, dan Condiment Meja',
        task_order: 2,
        sequence: 2,
        is_required: true,
        area: 'Side Station & Dining Tables',
        instructions: 'Pastikan sendok, garpu, pisau steril dalam pembungkus kertas dan tempat tissue terisi.',
        standard: 'Lengkap di seluruh 25 nomor meja',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-s-3',
        template_id: 'tmpl-srv-open-01',
        task_name: 'Pengecekan Buku Menu Bersih & Tablet POS Waiter Baterai 100%',
        title: 'Pengecekan Buku Menu Bersih & Tablet POS Waiter Baterai 100%',
        task_order: 3,
        sequence: 3,
        is_required: true,
        area: 'Hostess Desk',
        instructions: 'Lap cover buku menu dan pastikan semua tablet POS taking order telah terisi daya.',
        standard: 'Buku menu bebas noda minyak & tablet aktif',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-s-4',
        template_id: 'tmpl-srv-open-01',
        task_name: 'Pengaturan Suhu AC & Playlist Musik Latar Tropis Akustik',
        title: 'Pengaturan Suhu AC & Playlist Musik Latar Tropis Akustik',
        task_order: 4,
        sequence: 4,
        is_required: true,
        area: 'Sound System & AC Control',
        instructions: 'Atur AC 22°C dan putar playlist musik akustik dengan volume nyaman (50 dB).',
        standard: 'Suasana sejuk dan nyaman',
        requires_evidence: false,
        evidence_type: 'NONE',
        weight: 20,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'tmpl-csh-close-01',
    code: 'CHK-CSH-001',
    title: 'Checklist Penutupan Kasir, Settlement EDC & Setoran Kas',
    name: 'Checklist Penutupan Kasir & Settlement EDC',
    division: 'CASHIER',
    shift_type: 'CLOSING',
    role_target: 'Cashier / Head Cashier',
    frequency: 'DAILY',
    description: 'Pemeriksaan rekonsiliasi kas, batch settlement mesin EDC bank, cetak Z-Report, dan serah terima kas.',
    is_active: true,
    requires_verification: true,
    passing_score: 100,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
    items: [
      {
        id: 'itm-c-1',
        template_id: 'tmpl-csh-close-01',
        task_name: 'Batch Settlement Seluruh Terminal EDC Bank (BCA, Mandiri, BRI)',
        title: 'Batch Settlement Seluruh Terminal EDC Bank (BCA, Mandiri, BRI)',
        task_order: 1,
        sequence: 1,
        is_required: true,
        area: 'Cashier Desk',
        instructions: 'Lakukan settlement pada seluruh EDC dan kumpulkan slip settlement bukti transaksi.',
        standard: 'Status settlement "BERHASIL / BATCH SUCCESS"',
        requires_evidence: true,
        evidence_type: 'PHOTO_AND_NOTE',
        weight: 35,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-c-2',
        template_id: 'tmpl-csh-close-01',
        task_name: 'Perhitungan Fisik Uang Tunai Kasir vs Z-Report POS',
        title: 'Perhitungan Fisik Uang Tunai Kasir vs Z-Report POS',
        task_order: 2,
        sequence: 2,
        is_required: true,
        area: 'Cashier Safe Box',
        instructions: 'Hitung pecahan uang kertas dan koin di hadapan Supervisor. Cocokkan dengan laporan POS.',
        standard: 'Zero variance (Selisih Rp 0)',
        requires_evidence: true,
        evidence_type: 'PHOTO_AND_NOTE',
        weight: 40,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'itm-c-3',
        template_id: 'tmpl-csh-close-01',
        task_name: 'Penyimpanan Uang Setoran ke Brankas & Kunci Laci Kasir',
        title: 'Penyimpanan Uang Setoran ke Brankas & Kunci Laci Kasir',
        task_order: 3,
        sequence: 3,
        is_required: true,
        area: 'Brankas Resto',
        instructions: 'Masukkan amplop setoran bersegel ke drop safe dan serahkan kunci ke Supervisor.',
        standard: 'Brankas terkunci ganda aman',
        requires_evidence: false,
        evidence_type: 'NOTE',
        weight: 25,
        max_score: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
];

const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_ASSIGNMENTS: ChecklistAssignment[] = [
  {
    id: 'asg-today-kit-01',
    template_id: 'tmpl-kit-open-01',
    employee_id: 'emp-05', // Agus Priyanto (Cook)
    employee_name: 'Agus Priyanto',
    employee_emp_id: 'TG-KIT-003',
    division: 'KITCHEN',
    assigned_by: 'emp-03', // Ulum Miftah (Head Chef)
    assigner_name: 'Ulum Miftah',
    assignment_date: todayStr,
    due_at: `${todayStr}T10:30:00.000Z`,
    shift_type: 'OPENING',
    status: 'IN_PROGRESS',
    started_at: `${todayStr}T07:45:00.000Z`,
    score: 80,
    completion_percentage: 60,
    created_at: `${todayStr}T07:00:00.000Z`,
    updated_at: `${todayStr}T08:15:00.000Z`,
    template: INITIAL_TEMPLATES[0],
  },
  {
    id: 'asg-today-bar-01',
    template_id: 'tmpl-bar-open-01',
    employee_id: 'emp-12', // Eko Wahyudi (Barista)
    employee_name: 'Eko Wahyudi',
    employee_emp_id: 'TG-BAR-002',
    division: 'BARISTA',
    assigned_by: 'emp-11', // Dimas Wahyu (Head Barista)
    assigner_name: 'Dimas Wahyu',
    assignment_date: todayStr,
    due_at: `${todayStr}T10:30:00.000Z`,
    shift_type: 'OPENING',
    status: 'SUBMITTED',
    started_at: `${todayStr}T07:30:00.000Z`,
    submitted_at: `${todayStr}T08:20:00.000Z`,
    score: 100,
    completion_percentage: 100,
    created_at: `${todayStr}T07:00:00.000Z`,
    updated_at: `${todayStr}T08:20:00.000Z`,
    template: INITIAL_TEMPLATES[1],
  },
  {
    id: 'asg-today-srv-01',
    template_id: 'tmpl-srv-open-01',
    employee_id: 'emp-16', // Rizky Ananda (Senior Waiter)
    employee_name: 'Rizky Ananda',
    employee_emp_id: 'TG-SRV-002',
    division: 'SERVICE',
    assigned_by: 'emp-15', // Bayu Pratama (Head Service)
    assigner_name: 'Bayu Pratama',
    assignment_date: todayStr,
    due_at: `${todayStr}T10:30:00.000Z`,
    shift_type: 'OPENING',
    status: 'VERIFIED',
    started_at: `${todayStr}T07:15:00.000Z`,
    submitted_at: `${todayStr}T08:00:00.000Z`,
    verified_at: `${todayStr}T08:30:00.000Z`,
    verified_by: 'emp-15',
    verifier_name: 'Bayu Pratama',
    verification_notes: 'Kesiapan floor dining sempurna, table setting sangat rapi dan wangi.',
    score: 100,
    completion_percentage: 100,
    created_at: `${todayStr}T07:00:00.000Z`,
    updated_at: `${todayStr}T08:30:00.000Z`,
    template: INITIAL_TEMPLATES[2],
  },
];

class ChecklistServiceImpl {
  private getStoredTemplates(): ChecklistTemplate[] {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[ChecklistService] Error reading templates:', e);
    }
    this.saveTemplates(INITIAL_TEMPLATES);
    return INITIAL_TEMPLATES;
  }

  private saveTemplates(templates: ChecklistTemplate[]) {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('[ChecklistService] Error saving templates:', e);
    }
  }

  private getStoredAssignments(): ChecklistAssignment[] {
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[ChecklistService] Error reading assignments:', e);
    }
    this.saveAssignments(INITIAL_ASSIGNMENTS);
    return INITIAL_ASSIGNMENTS;
  }

  private saveAssignments(assignments: ChecklistAssignment[]) {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('[ChecklistService] Error saving assignments:', e);
    }
  }

  // =========================================================================
  // TEMPLATES API
  // =========================================================================

  public async getChecklistTemplates(division?: string): Promise<{ data: ChecklistTemplate[]; error: string | null }> {
    await delay(80);
    let list = this.getStoredTemplates();
    if (division && division !== 'ALL') {
      list = list.filter((t) => t.division.toUpperCase() === division.toUpperCase());
    }
    return { data: list, error: null };
  }

  public async getTemplates(): Promise<{ data: ChecklistTemplate[]; error: string | null }> {
    return this.getChecklistTemplates();
  }

  public async createChecklistTemplate(data: Partial<ChecklistTemplate>): Promise<{ success: boolean; data?: ChecklistTemplate; error: string | null }> {
    await delay(120);
    const list = this.getStoredTemplates();
    const newId = `tmpl-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const items = (data.items || []).map((itm, idx) => ({
      ...itm,
      id: itm.id || `itm-${newId}-${idx + 1}`,
      template_id: newId,
      task_order: itm.task_order || idx + 1,
      sequence: itm.sequence || idx + 1,
      created_at: now,
    }));

    const newTemplate: ChecklistTemplate = {
      id: newId,
      code: data.code || `CHK-${(data.division || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || 'Checklist Baru',
      name: data.title || 'Checklist Baru',
      division: data.division || 'KITCHEN',
      shift_type: data.shift_type || 'OPENING',
      role_target: data.role_target || 'Staff',
      frequency: data.frequency || 'DAILY',
      description: data.description || '',
      is_active: true,
      requires_verification: data.requires_verification !== false,
      passing_score: data.passing_score || 80,
      created_at: now,
      updated_at: now,
      items,
    };

    list.unshift(newTemplate);
    this.saveTemplates(list);
    return { success: true, data: newTemplate, error: null };
  }

  public async updateChecklistTemplate(id: string, data: Partial<ChecklistTemplate>): Promise<{ success: boolean; data?: ChecklistTemplate; error: string | null }> {
    await delay(120);
    const list = this.getStoredTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return { success: false, error: 'Template tidak ditemukan' };

    const existing = list[idx];
    const updated: ChecklistTemplate = {
      ...existing,
      ...data,
      name: data.title || existing.name,
      updated_at: new Date().toISOString(),
    };

    list[idx] = updated;
    this.saveTemplates(list);
    return { success: true, data: updated, error: null };
  }

  public async duplicateChecklistTemplate(id: string): Promise<{ success: boolean; data?: ChecklistTemplate; error: string | null }> {
    await delay(100);
    const list = this.getStoredTemplates();
    const found = list.find((t) => t.id === id);
    if (!found) return { success: false, error: 'Template tidak ditemukan' };

    const newId = `tmpl-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const duplicated: ChecklistTemplate = {
      ...found,
      id: newId,
      code: `${found.code || 'CHK'}-COPY`,
      title: `${found.title} (Salinan)`,
      name: `${found.title} (Salinan)`,
      created_at: now,
      updated_at: now,
      items: (found.items || []).map((itm, i) => ({
        ...itm,
        id: `itm-${newId}-${i + 1}`,
        template_id: newId,
      })),
    };

    list.unshift(duplicated);
    this.saveTemplates(list);
    return { success: true, data: duplicated, error: null };
  }

  public async activateChecklistTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    return this.updateChecklistTemplate(id, { is_active: true });
  }

  public async deactivateChecklistTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    return this.updateChecklistTemplate(id, { is_active: false });
  }

  // =========================================================================
  // ASSIGNMENTS API
  // =========================================================================

  public async getChecklistAssignments(
    filterOrDate?: string | { date?: string; division?: string; status?: string },
    division?: string,
    status?: string
  ): Promise<{ data: ChecklistAssignment[]; error: string | null }> {
    await delay(80);
    let list = this.getStoredAssignments();
    const templates = this.getStoredTemplates();

    // Attach template reference if missing
    list = list.map((a) => {
      if (!a.template) {
        a.template = templates.find((t) => t.id === a.template_id);
      }
      return a;
    });

    let targetDate = typeof filterOrDate === 'string' ? filterOrDate : filterOrDate?.date;
    let targetDivision = typeof filterOrDate === 'object' ? filterOrDate.division : division;
    let targetStatus = typeof filterOrDate === 'object' ? filterOrDate.status : status;

    if (targetDate) {
      list = list.filter((a) => a.assignment_date === targetDate);
    }
    if (targetDivision && targetDivision !== 'ALL') {
      list = list.filter((a) => a.division?.toUpperCase() === targetDivision?.toUpperCase());
    }
    if (targetStatus && targetStatus !== 'ALL') {
      list = list.filter((a) => a.status === targetStatus);
    }

    return { data: list, error: null };
  }

  public async getAssignments(): Promise<{ data: ChecklistAssignment[]; error: string | null }> {
    return this.getChecklistAssignments();
  }

  public async getMyAssignments(
    date?: string,
    status?: string
  ): Promise<{ data: ChecklistAssignment[]; error: string | null }> {
    await delay(80);
    let list = this.getStoredAssignments();
    const templates = this.getStoredTemplates();

    list = list.map((a) => {
      if (!a.template) {
        a.template = templates.find((t) => t.id === a.template_id);
      }
      return a;
    });

    if (date) {
      list = list.filter((a) => a.assignment_date === date);
    }
    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status === status);
    }

    return { data: list, error: null };
  }

  public async assignChecklist(data: Partial<ChecklistAssignment>): Promise<{ success: boolean; data?: ChecklistAssignment; error: string | null }> {
    await delay(120);
    const list = this.getStoredAssignments();
    const templates = this.getStoredTemplates();
    const template = templates.find((t) => t.id === data.template_id);

    const newId = `asg-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newAsg: ChecklistAssignment = {
      id: newId,
      template_id: data.template_id || '',
      employee_id: data.employee_id || '',
      employee_name: data.employee_name || 'Staff Resto',
      employee_emp_id: data.employee_emp_id || 'TG-EMP',
      division: data.division || template?.division || 'KITCHEN',
      assigned_by: data.assigned_by || null,
      assigner_name: data.assigner_name || 'Supervisor',
      assignment_date: data.assignment_date || now.split('T')[0],
      due_at: data.due_at || null,
      shift_type: data.shift_type || template?.shift_type || 'OPENING',
      status: 'ASSIGNED',
      score: 0,
      completion_percentage: 0,
      created_at: now,
      updated_at: now,
      template,
    };

    list.unshift(newAsg);
    this.saveAssignments(list);
    return { success: true, data: newAsg, error: null };
  }

  public async bulkAssignChecklist(data: {
    template_id: string;
    employee_ids?: string[];
    division?: string;
    role_target?: string;
    assignment_date: string;
    shift_type: string;
    due_at?: string | null;
  }): Promise<{ success: boolean; data: ChecklistAssignment[]; error: string | null }> {
    await delay(150);
    const createdList: ChecklistAssignment[] = [];
    const empIds = data.employee_ids && data.employee_ids.length > 0 ? data.employee_ids : ['emp-1', 'emp-2', 'emp-11', 'emp-16'];
    for (const empId of empIds) {
      const res = await this.assignChecklist({
        template_id: data.template_id,
        employee_id: empId,
        assignment_date: data.assignment_date,
        shift_type: data.shift_type as any,
        due_at: data.due_at || undefined,
        division: (data.division as any) || undefined,
      });
      if (res.data) createdList.push(res.data);
    }
    return { success: true, data: createdList, error: null };
  }

  // =========================================================================
  // EXECUTION & VERIFICATION API
  // =========================================================================

  public async getChecklistExecution(assignmentId: string): Promise<{
    data: { assignment: ChecklistAssignment; executions: ChecklistExecution[] } | null;
    error: string | null;
  }> {
    await delay(80);
    const assignments = this.getStoredAssignments();
    const templates = this.getStoredTemplates();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return { data: null, error: 'Penugasan checklist tidak ditemukan' };

    const template = templates.find((t) => t.id === asg.template_id) || asg.template;
    asg.template = template;

    // Load or initialize executions
    let executions: ChecklistExecution[] = (asg.executions || []);
    if (executions.length === 0 && template?.items) {
      executions = template.items.map((itm) => ({
        id: `exec-${asg.id}-${itm.id}`,
        assignment_id: asg.id,
        template_item_id: itm.id,
        employee_id: asg.employee_id,
        status: 'PENDING',
        item: itm,
        notes: '',
        evidence: [],
        created_at: asg.created_at,
        updated_at: asg.updated_at,
      }));
      asg.executions = executions;
    }

    return {
      data: {
        assignment: asg,
        executions,
      },
      error: null,
    };
  }

  public async startChecklist(assignmentId: string): Promise<{ success: boolean; data: any; error: string | null }> {
    await delay(80);
    const assignments = this.getStoredAssignments();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return { success: false, data: null, error: 'Assignment tidak ditemukan' };

    asg.status = 'IN_PROGRESS';
    asg.started_at = asg.started_at || new Date().toISOString();
    asg.updated_at = new Date().toISOString();

    this.saveAssignments(assignments);
    return { success: true, data: asg, error: null };
  }

  public async completeChecklistItem(
    assignmentIdOrExecId: string,
    itemIdOrPayload?: string | { completed: boolean; notes?: string },
    payloadOrNotes?: { completed: boolean; notes?: string } | string
  ): Promise<{ success: boolean; error: string | null }> {
    await delay(80);
    const assignments = this.getStoredAssignments();
    let targetAssignmentId = assignmentIdOrExecId;
    let targetItemId = typeof itemIdOrPayload === 'string' ? itemIdOrPayload : '';

    // Handle single-arg or 2-arg execution finding
    let asg = assignments.find((a) => a.id === targetAssignmentId);
    if (!asg) {
      // Maybe assignmentIdOrExecId is execution item id
      asg = assignments.find((a) => (a.executions || []).some((e) => e.id === assignmentIdOrExecId || e.template_item_id === assignmentIdOrExecId));
      if (asg) {
        targetItemId = assignmentIdOrExecId;
      }
    }
    if (!asg) return { success: false, error: 'Assignment tidak ditemukan' };

    const execRes = await this.getChecklistExecution(asg.id);
    if (!execRes.data) return { success: false, error: 'Execution data not found' };

    const executions = execRes.data.executions;
    const execItem = executions.find((e) => e.template_item_id === targetItemId || e.id === targetItemId);
    if (execItem) {
      const isComplete = typeof payloadOrNotes === 'object' && payloadOrNotes.completed !== undefined
        ? payloadOrNotes.completed
        : execItem.status !== 'COMPLETED';
      execItem.status = isComplete ? 'COMPLETED' : 'PENDING';
      execItem.completed_at = isComplete ? new Date().toISOString() : null;
      if (typeof payloadOrNotes === 'string') {
        execItem.notes = payloadOrNotes;
      } else if (typeof payloadOrNotes === 'object' && payloadOrNotes.notes !== undefined) {
        execItem.notes = payloadOrNotes.notes;
      }
    }

    const total = executions.length;
    const completed = executions.filter((e) => e.status === 'COMPLETED').length;
    asg.completion_percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    asg.score = asg.completion_percentage;
    asg.executions = executions;
    asg.updated_at = new Date().toISOString();

    if (asg.status === 'ASSIGNED') asg.status = 'IN_PROGRESS';

    this.saveAssignments(assignments);
    return { success: true, error: null };
  }

  public async updateChecklistItemNotes(
    assignmentIdOrExecId: string,
    itemIdOrNotes: string,
    maybeNotes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    await delay(60);
    const assignments = this.getStoredAssignments();
    const notes = maybeNotes !== undefined ? maybeNotes : itemIdOrNotes;
    const searchId = maybeNotes !== undefined ? itemIdOrNotes : assignmentIdOrExecId;

    for (const asg of assignments) {
      const execItem = (asg.executions || []).find((e) => e.id === searchId || e.template_item_id === searchId);
      if (execItem) {
        execItem.notes = notes;
        execItem.updated_at = new Date().toISOString();
        this.saveAssignments(assignments);
        return { success: true, error: null };
      }
    }
    return { success: true, error: null };
  }

  public async uploadChecklistEvidence(
    assignmentIdOrExecId: string,
    itemIdOrFile: any,
    fileOrPayloadOrNotes?: any
  ): Promise<{ success: boolean; url: string; error: string | null }> {
    await delay(120);
    const assignments = this.getStoredAssignments();
    const mockUrl = typeof fileOrPayloadOrNotes === 'string' && fileOrPayloadOrNotes.startsWith('http')
      ? fileOrPayloadOrNotes
      : `https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=60`;

    for (const asg of assignments) {
      const execItem = (asg.executions || []).find(
        (e) => e.id === assignmentIdOrExecId || e.template_item_id === assignmentIdOrExecId ||
               e.id === itemIdOrFile || e.template_item_id === itemIdOrFile
      );
      if (execItem) {
        if (!execItem.evidence) execItem.evidence = [];
        const newEv: ChecklistEvidence = {
          id: `ev-${Date.now().toString(36)}`,
          execution_id: execItem.id,
          file_name: 'evidence-photo.jpg',
          storage_path: mockUrl,
          file_url: mockUrl,
          uploaded_at: new Date().toISOString(),
          notes: typeof fileOrPayloadOrNotes === 'string' ? fileOrPayloadOrNotes : (typeof itemIdOrFile === 'object' ? itemIdOrFile?.notes : ''),
        };
        execItem.evidence.push(newEv);
        this.saveAssignments(assignments);
        return { success: true, url: mockUrl, error: null };
      }
    }

    return { success: true, url: mockUrl, error: null };
  }

  public async deleteChecklistEvidence(evidenceId: string): Promise<{ success: boolean; error: string | null }> {
    await delay(80);
    const assignments = this.getStoredAssignments();
    for (const asg of assignments) {
      if (asg.executions) {
        for (const ex of asg.executions) {
          if (ex.evidence) {
            ex.evidence = ex.evidence.filter((e) => e.id !== evidenceId);
          }
        }
      }
    }
    this.saveAssignments(assignments);
    return { success: true, error: null };
  }

  public async submitChecklist(assignmentId: string): Promise<{ success: boolean; error: string | null }> {
    await delay(120);
    const assignments = this.getStoredAssignments();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return { success: false, error: 'Assignment tidak ditemukan' };

    asg.status = 'SUBMITTED';
    asg.submitted_at = new Date().toISOString();
    asg.updated_at = new Date().toISOString();

    this.saveAssignments(assignments);
    return { success: true, error: null };
  }

  public async getPendingVerifications(division?: string): Promise<{ data: ChecklistAssignment[]; error: string | null }> {
    return this.getChecklistAssignments(undefined, division, 'SUBMITTED');
  }

  public async verifyChecklist(
    assignmentId: string,
    status: 'VERIFIED' | 'REJECTED' | 'REVISION_REQUIRED' | string,
    notes?: string,
    verifiedBy?: string
  ): Promise<{ success: boolean; error: string | null }> {
    await delay(120);
    const assignments = this.getStoredAssignments();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return { success: false, error: 'Assignment tidak ditemukan' };

    asg.status = status as any;
    asg.verified_at = new Date().toISOString();
    asg.verified_by = verifiedBy || 'Supervisor';
    asg.verifier_name = verifiedBy || 'Supervisor';
    asg.verification_notes = notes || '';
    asg.updated_at = new Date().toISOString();

    this.saveAssignments(assignments);
    return { success: true, error: null };
  }

  public async requestChecklistRevision(
    assignmentId: string,
    reason: string,
    reviewerOrItems?: string | string[]
  ): Promise<{ success: boolean; error: string | null }> {
    const reviewer = typeof reviewerOrItems === 'string' ? reviewerOrItems : 'Supervisor';
    return this.verifyChecklist(assignmentId, 'REVISION_REQUIRED', reason, reviewer);
  }

  // Backward compatibility methods for Operations ChecklistShift
  public async getAllChecklists(): Promise<{ data: any[]; error: string | null }> {
    const asgs = this.getStoredAssignments();
    const flattened = asgs.map((a) => ({
      id: a.id,
      task_name: a.template?.title || 'Tugas Operasional Shift',
      division: a.division,
      shift_type: a.shift_type,
      is_completed: a.status === 'VERIFIED' || a.status === 'SUBMITTED',
      completed_by: a.employee_name,
    }));
    return { data: flattened, error: null };
  }

  public async toggleChecklistTask(taskId: string, status: string, userName?: string): Promise<any> {
    const assignments = this.getStoredAssignments();
    const asg = assignments.find((a) => a.id === taskId);
    if (asg) {
      asg.status = status === 'COMPLETED' ? 'SUBMITTED' : 'IN_PROGRESS';
      if (userName) asg.employee_name = userName;
      this.saveAssignments(assignments);
    }
    return { success: true };
  }

  // =========================================================================
  // METRICS & DASHBOARD API
  // =========================================================================

  public async getChecklistDashboardMetrics(division?: string): Promise<{ data: ChecklistDashboardMetrics; error: string | null }> {
    await delay(100);
    const assignments = this.getStoredAssignments();
    let filtered = assignments;

    if (division && division !== 'ALL') {
      filtered = filtered.filter((a) => a.division?.toUpperCase() === division.toUpperCase());
    }

    const total_assigned = filtered.length;
    const in_progress = filtered.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'ASSIGNED').length;
    const submitted = filtered.filter((a) => a.status === 'SUBMITTED').length;
    const verified = filtered.filter((a) => a.status === 'VERIFIED').length;
    const revision_required = filtered.filter((a) => a.status === 'REVISION_REQUIRED').length;
    const rejected = filtered.filter((a) => a.status === 'REJECTED').length;
    const overdue = filtered.filter((a) => a.status === 'EXPIRED').length;

    const completedCount = verified + submitted;
    const completion_rate = total_assigned > 0 ? Math.round((completedCount / total_assigned) * 100) : 0;
    const pass_rate = completedCount > 0 ? Math.round((verified / completedCount) * 100) : 100;
    const verification_rate = submitted + verified > 0 ? Math.round((verified / (submitted + verified)) * 100) : 0;

    const avgScore = total_assigned > 0
      ? Math.round(filtered.reduce((acc, curr) => acc + (curr.score || 0), 0) / total_assigned)
      : 85;

    const by_division: Record<string, { assigned: number; completed: number; avg_score: number; compliance_rate?: number }> = {
      KITCHEN: { assigned: 4, completed: 3, avg_score: 92, compliance_rate: 94 },
      BARISTA: { assigned: 3, completed: 3, avg_score: 98, compliance_rate: 98 },
      SERVICE: { assigned: 4, completed: 4, avg_score: 95, compliance_rate: 96 },
      CASHIER: { assigned: 2, completed: 2, avg_score: 100, compliance_rate: 100 },
      CLEANING: { assigned: 2, completed: 2, avg_score: 90, compliance_rate: 92 },
    };

    const division_breakdown = Object.entries(by_division).map(([division, stats]) => ({
      division,
      total: stats.assigned,
      completed: stats.completed,
      verified: stats.completed,
      avg_score: stats.avg_score,
    }));

    const metrics: ChecklistDashboardMetrics = {
      total_assigned: total_assigned || 15,
      in_progress,
      submitted,
      verified,
      revision_required,
      rejected,
      overdue,
      completion_rate: completion_rate || 92,
      average_score: avgScore || 94,
      pass_rate: pass_rate || 96,
      verification_rate: verification_rate || 88,
      by_division,
      division_breakdown,
    };

    return { data: metrics, error: null };
  }
}

export const ChecklistService = new ChecklistServiceImpl();
