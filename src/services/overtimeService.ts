import {
  OvertimeRecord,
  EnrichedOvertimeRecord,
  OvertimeRequestInput,
  OvertimeApprovalInput,
  OvertimeRejectionInput,
  OvertimeFilterParams,
  OvertimeSummary,
  DepartmentOvertimeMetric,
  OvertimeCostSimulationParams,
  OvertimeCostSimulationResult,
} from '../types/overtime';
import { INITIAL_OVERTIME_RECORDS } from '../data/mockOvertime';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { scheduleService } from './scheduleService';
import { hrConfigurationService } from './hrConfigurationService';

const STORAGE_KEY = 'tropicalos_master_overtime';

// Helper to simulate realistic async network delay
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTimeHHMM = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const calculateHoursBetween = (startHHMM: string, endHHMM: string): number => {
  const [h1, m1] = startHHMM.split(':').map(Number);
  const [h2, m2] = endHHMM.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  let totalMin1 = h1 * 60 + m1;
  let totalMin2 = h2 * 60 + m2;
  if (totalMin2 < totalMin1) {
    // Overnight overtime handling
    totalMin2 += 24 * 60;
  }
  const diffMin = Math.max(0, totalMin2 - totalMin1);
  return Number((diffMin / 60).toFixed(2));
};

export const getBaseHourlyRateForPosition = (position: string, department: string): number => {
  const pos = position.toLowerCase();
  const dept = department.toLowerCase();

  if (pos.includes('manager') || pos.includes('owner')) return 35000;
  if (pos.includes('supervisor') || pos.includes('head') || pos.includes('lead')) return 30000;
  if (pos.includes('senior cook') || pos.includes('accounting') || pos.includes('purchasing')) return 28000;
  if (pos.includes('cook') || pos.includes('bartender') || pos.includes('senior waiter') || pos.includes('senior waitress')) return 26000;
  if (pos.includes('barista') || pos.includes('waiter') || pos.includes('waitress') || pos.includes('junior cook')) return 24000;
  if (pos.includes('busser') || pos.includes('steward') || pos.includes('dishwasher') || pos.includes('helper')) return 22000;
  
  if (dept.includes('kitchen')) return 26000;
  if (dept.includes('bar')) return 25000;
  if (dept.includes('service')) return 24000;
  return 25000;
};

class OvertimeServiceClass {
  private getStoredRecords(): OvertimeRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[OvertimeService] Error loading records from localStorage:', e);
    }
    this.saveToStorage(INITIAL_OVERTIME_RECORDS);
    return INITIAL_OVERTIME_RECORDS;
  }

  private saveToStorage(records: OvertimeRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('[OvertimeService] Error saving records to localStorage:', e);
    }
  }

  public async resetToDefaults(): Promise<void> {
    await delay(50);
    this.saveToStorage(INITIAL_OVERTIME_RECORDS);
  }

  private async enrichRecord(record: OvertimeRecord): Promise<EnrichedOvertimeRecord> {
    const employee = INITIAL_EMPLOYEES.find((e) => e.id === record.employeeId);
    let schedule = undefined;

    try {
      const schedules = await scheduleService.getSchedules({
        employeeId: record.employeeId,
        date: record.date,
      });
      if (schedules && schedules.length > 0) {
        schedule = schedules.find((s) => s.id === record.scheduleId) || schedules[0];
      }
    } catch {
      // fallback
    }

    const shiftName =
      schedule?.shiftId === 'shift-pagi'
        ? 'Shift Pagi (08:00 - 16:00)'
        : schedule?.shiftId === 'shift-siang'
        ? 'Shift Siang (12:00 - 20:00)'
        : schedule?.shiftId === 'shift-middle'
        ? 'Shift Middle (11:00 - 19:00)'
        : schedule?.shiftId === 'shift-closing'
        ? 'Shift Closing (15:00 - 23:00)'
        : 'Non-Shift / Off-Day';

    const warningFlags: string[] = [];
    const isExcessive = (record.actualHours || 0) > (record.approvedHours || record.plannedHours || 0);

    if (isExcessive) {
      warningFlags.push('Jam aktual melebihi persetujuan rencana');
    }
    if (record.plannedHours > 4.0) {
      warningFlags.push('Durasi lembur melebihi 4 jam dalam 1 hari');
    }
    if (record.status === 'PENDING' && new Date(record.date).getTime() < new Date().setHours(0,0,0,0)) {
      warningFlags.push('Permintaan lembur kedaluwarsa / belum disetujui');
    }

    return {
      ...record,
      employee,
      schedule,
      shiftName,
      isExcessive,
      warningFlags,
    };
  }

  public async getOvertimeRecords(params?: OvertimeFilterParams): Promise<EnrichedOvertimeRecord[]> {
    await delay(60);
    const records = this.getStoredRecords();
    let filtered = [...records];

    if (params) {
      if (params.date) {
        filtered = filtered.filter((r) => r.date === params.date);
      }
      if (params.startDate) {
        filtered = filtered.filter((r) => r.date >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter((r) => r.date <= params.endDate!);
      }
      if (params.employeeId) {
        filtered = filtered.filter((r) => r.employeeId === params.employeeId);
      }
      if (params.status && params.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params.type && params.type !== 'ALL') {
        filtered = filtered.filter((r) => r.type === params.type);
      }
      if (params.compensationType && params.compensationType !== 'ALL') {
        filtered = filtered.filter((r) => r.compensationType === params.compensationType);
      }
    }

    // Enrich
    const enrichedList = await Promise.all(filtered.map((r) => this.enrichRecord(r)));

    // Filter by department & search query post-enrichment
    let result = enrichedList;
    if (params?.department && params.department !== 'ALL') {
      result = result.filter((r) => r.employee?.department?.toLowerCase() === params.department!.toLowerCase());
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.employee?.fullName || '').toLowerCase().includes(q) ||
          (r.employee?.employeeCode || '').toLowerCase().includes(q) ||
          (r.employee?.primaryPosition || '').toLowerCase().includes(q) ||
          (r.reason || '').toLowerCase().includes(q) ||
          (r.taskDescription && r.taskDescription.toLowerCase().includes(q))
      );
    }

    // Sort: newest date first, then by createdAt desc
    result.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }

  public async getOvertimeById(id: string): Promise<EnrichedOvertimeRecord | null> {
    await delay(30);
    const records = this.getStoredRecords();
    const match = records.find((r) => r.id === id);
    if (!match) return null;
    return this.enrichRecord(match);
  }

  public async getMyOvertimeRecords(employeeId: string): Promise<EnrichedOvertimeRecord[]> {
    return this.getOvertimeRecords({ employeeId });
  }

  public async getTeamOvertimeRecords(department: string): Promise<EnrichedOvertimeRecord[]> {
    return this.getOvertimeRecords({ department });
  }

  public async createOvertimeRequest(input: OvertimeRequestInput): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(100);
    try {
      const records = this.getStoredRecords();
      const employee = INITIAL_EMPLOYEES.find((e) => e.id === input.employeeId);

      if (!employee) {
        return { success: false, error: 'Karyawan tidak ditemukan dalam sistem.' };
      }

      if (employee.status !== 'ACTIVE') {
        return { success: false, error: 'Hanya karyawan aktif yang dapat mengajukan lembur.' };
      }

      if (!input.reason || input.reason.trim().length < 5) {
        return { success: false, error: 'Alasan lembur wajib diisi dengan jelas (minimal 5 karakter).' };
      }

      const plannedHours = calculateHoursBetween(input.plannedStart, input.plannedEnd);
      if (plannedHours <= 0) {
        return { success: false, error: 'Jam selesai lembur harus lebih besar dari jam mulai.' };
      }

      if (plannedHours > 8) {
        return { success: false, error: 'Pengajuan lembur tidak boleh melebihi 8 jam dalam 1 sesi.' };
      }

      // Check overlapping overtime on the same date
      const existingSameDay = records.filter(
        (r) => r.employeeId === input.employeeId && r.date === input.date && r.status !== 'CANCELLED' && r.status !== 'REJECTED'
      );

      for (const ex of existingSameDay) {
        const overlap =
          (input.plannedStart >= ex.plannedStart && input.plannedStart < ex.plannedEnd) ||
          (input.plannedEnd > ex.plannedStart && input.plannedEnd <= ex.plannedEnd) ||
          (input.plannedStart <= ex.plannedStart && input.plannedEnd >= ex.plannedEnd);
        if (overlap) {
          return {
            success: false,
            error: `Terdapat pengajuan lembur yang bertabrakan pada tanggal ${input.date} (${ex.plannedStart} - ${ex.plannedEnd}).`,
          };
        }
      }

      const hourlyRate = input.hourlyBaseRate || getBaseHourlyRateForPosition(employee.primaryPosition, employee.department);
      const multiplier = input.type === 'OFF_DAY' || input.type === 'SPECIAL_EVENT' ? 2.0 : 1.5;
      const estimatedCost = input.compensationType === 'COMPENSATORY_OFF' ? 0 : Math.round(plannedHours * hourlyRate * multiplier);

      const nowIso = new Date().toISOString();
      const newRecord: OvertimeRecord = {
        id: `ot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: input.employeeId,
        scheduleId: input.scheduleId,
        date: input.date,
        type: input.type,
        status: 'PENDING',
        compensationType: input.compensationType,
        plannedStart: input.plannedStart,
        plannedEnd: input.plannedEnd,
        plannedHours,
        reason: input.reason.trim(),
        taskDescription: input.taskDescription?.trim(),
        hourlyBaseRate: hourlyRate,
        rateMultiplier: multiplier,
        estimatedCost,
        requestedBy: input.requestedBy || employee.fullName,
        requestedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      records.unshift(newRecord);
      this.saveToStorage(records);

      const enriched = await this.enrichRecord(newRecord);
      return { success: true, data: enriched };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Terjadi kesalahan sistem saat mengajukan lembur.' };
    }
  }

  public async approveOvertimeRequest(input: OvertimeApprovalInput): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(80);
    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === input.overtimeId);
    if (index === -1) {
      return { success: false, error: 'Pengajuan lembur tidak ditemukan.' };
    }

    const current = records[index];
    if (current.status !== 'PENDING') {
      return { success: false, error: `Lembur sudah berstatus ${current.status} dan tidak dapat disetujui kembali.` };
    }

    const approvedHours = input.approvedHours > 0 ? input.approvedHours : current.plannedHours;
    const finalCost = current.compensationType === 'COMPENSATORY_OFF' ? 0 : Math.round(approvedHours * current.hourlyBaseRate * current.rateMultiplier);

    const nowIso = new Date().toISOString();
    records[index] = {
      ...current,
      status: 'APPROVED',
      approvedHours,
      approvedBy: input.approverName,
      approvedAt: nowIso,
      approvalNotes: input.approvalNotes,
      finalCost,
      updatedAt: nowIso,
    };

    this.saveToStorage(records);
    const enriched = await this.enrichRecord(records[index]);
    return { success: true, data: enriched };
  }

  public async rejectOvertimeRequest(input: OvertimeRejectionInput): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(80);
    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === input.overtimeId);
    if (index === -1) {
      return { success: false, error: 'Pengajuan lembur tidak ditemukan.' };
    }

    const current = records[index];
    if (current.status !== 'PENDING') {
      return { success: false, error: `Lembur sudah berstatus ${current.status} dan tidak dapat ditolak.` };
    }

    if (!input.rejectionReason || input.rejectionReason.trim().length < 5) {
      return { success: false, error: 'Alasan penolakan lembur wajib diisi dengan jelas.' };
    }

    const nowIso = new Date().toISOString();
    records[index] = {
      ...current,
      status: 'REJECTED',
      approvedHours: 0,
      rejectedBy: input.rejecterName,
      rejectedAt: nowIso,
      rejectionReason: input.rejectionReason.trim(),
      updatedAt: nowIso,
    };

    this.saveToStorage(records);
    const enriched = await this.enrichRecord(records[index]);
    return { success: true, data: enriched };
  }

  public async cancelOvertimeRequest(
    id: string,
    cancelledBy: string,
    cancellationReason: string
  ): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(60);
    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Pengajuan lembur tidak ditemukan.' };
    }

    const current = records[index];
    if (current.status === 'COMPLETED' || current.status === 'CANCELLED') {
      return { success: false, error: `Lembur dengan status ${current.status} tidak dapat dibatalkan.` };
    }

    const nowIso = new Date().toISOString();
    records[index] = {
      ...current,
      status: 'CANCELLED',
      cancelledBy,
      cancelledAt: nowIso,
      cancellationReason: cancellationReason || 'Dibatalkan oleh pemohon',
      updatedAt: nowIso,
    };

    this.saveToStorage(records);
    const enriched = await this.enrichRecord(records[index]);
    return { success: true, data: enriched };
  }

  public async startOvertime(id: string, startHHMM?: string): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(60);
    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Pengajuan lembur tidak ditemukan.' };
    }

    const current = records[index];
    if (current.status !== 'APPROVED') {
      return { success: false, error: 'Hanya lembur yang telah disetujui yang dapat dimulai.' };
    }

    const actualStart = startHHMM || formatTimeHHMM(new Date());
    const nowIso = new Date().toISOString();

    records[index] = {
      ...current,
      status: 'ACTIVE',
      actualStart,
      updatedAt: nowIso,
    };

    this.saveToStorage(records);
    const enriched = await this.enrichRecord(records[index]);
    return { success: true, data: enriched };
  }

  public async completeOvertime(
    id: string,
    endHHMM?: string,
    notes?: string
  ): Promise<{
    success: boolean;
    data?: EnrichedOvertimeRecord;
    error?: string;
  }> {
    await delay(60);
    const records = this.getStoredRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Pengajuan lembur tidak ditemukan.' };
    }

    const current = records[index];
    if (current.status !== 'ACTIVE' && current.status !== 'APPROVED') {
      return { success: false, error: `Lembur dengan status ${current.status} tidak dapat diselesaikan.` };
    }

    const actualStart = current.actualStart || current.plannedStart;
    const actualEnd = endHHMM || formatTimeHHMM(new Date());
    const actualHours = calculateHoursBetween(actualStart, actualEnd);

    const approvedHours = current.approvedHours !== undefined ? current.approvedHours : current.plannedHours;
    const excessHours = Math.max(0, Number((actualHours - approvedHours).toFixed(2)));

    const finalCost =
      current.compensationType === 'COMPENSATORY_OFF'
        ? 0
        : Math.round(approvedHours * current.hourlyBaseRate * current.rateMultiplier);

    const nowIso = new Date().toISOString();
    records[index] = {
      ...current,
      status: 'COMPLETED',
      actualStart,
      actualEnd,
      actualHours,
      excessHours,
      finalCost,
      notes: notes || current.notes,
      updatedAt: nowIso,
    };

    this.saveToStorage(records);
    const enriched = await this.enrichRecord(records[index]);
    return { success: true, data: enriched };
  }

  public async getOvertimeSummary(params?: {
    date?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OvertimeSummary> {
    const list = await this.getOvertimeRecords({
      date: params?.date,
      department: params?.department,
      startDate: params?.startDate,
      endDate: params?.endDate,
    });

    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let activeNow = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    let totalPlannedHours = 0;
    let totalApprovedHours = 0;
    let totalActualHours = 0;
    let totalExcessHours = 0;

    let totalEstimatedCost = 0;
    let totalFinalCost = 0;

    const deptMap: { [key: string]: DepartmentOvertimeMetric } = {};
    const reasonMap: { [key: string]: { count: number; hours: number } } = {};

    // Standard departments
    const departments = ['Kitchen', 'Bar', 'Service', 'Management', 'Purchasing', 'Executive'];
    departments.forEach((d) => {
      deptMap[d] = {
        department: d,
        totalRequests: 0,
        approvedHours: 0,
        actualHours: 0,
        excessHours: 0,
        estimatedCost: 0,
        finalCost: 0,
        activeNow: 0,
        pendingCount: 0,
      };
    });

    list.forEach((r) => {
      const dept = r.employee?.department || 'Other';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          totalRequests: 0,
          approvedHours: 0,
          actualHours: 0,
          excessHours: 0,
          estimatedCost: 0,
          finalCost: 0,
          activeNow: 0,
          pendingCount: 0,
        };
      }

      const dm = deptMap[dept];
      dm.totalRequests += 1;

      totalPlannedHours += r.plannedHours || 0;
      totalEstimatedCost += r.estimatedCost || 0;

      if (r.status === 'PENDING') {
        pendingRequests += 1;
        dm.pendingCount += 1;
      } else if (r.status === 'APPROVED') {
        approvedRequests += 1;
        totalApprovedHours += r.approvedHours || r.plannedHours;
        dm.approvedHours += r.approvedHours || r.plannedHours;
        dm.estimatedCost += r.estimatedCost;
      } else if (r.status === 'ACTIVE') {
        activeNow += 1;
        dm.activeNow += 1;
        totalApprovedHours += r.approvedHours || r.plannedHours;
        dm.approvedHours += r.approvedHours || r.plannedHours;
      } else if (r.status === 'COMPLETED') {
        completedCount += 1;
        totalApprovedHours += r.approvedHours || 0;
        totalActualHours += r.actualHours || 0;
        totalExcessHours += r.excessHours || 0;
        totalFinalCost += r.finalCost || 0;

        dm.approvedHours += r.approvedHours || 0;
        dm.actualHours += r.actualHours || 0;
        dm.excessHours += r.excessHours || 0;
        dm.finalCost += r.finalCost || 0;
      } else if (r.status === 'REJECTED') {
        rejectedRequests += 1;
      } else if (r.status === 'CANCELLED') {
        cancelledCount += 1;
      }

      // Reason breakdown
      const shortReason = r.reason.slice(0, 35) + (r.reason.length > 35 ? '...' : '');
      if (!reasonMap[shortReason]) {
        reasonMap[shortReason] = { count: 0, hours: 0 };
      }
      reasonMap[shortReason].count += 1;
      reasonMap[shortReason].hours += r.approvedHours || r.plannedHours;
    });

    const departmentBreakdown = Object.values(deptMap);
    const reasonBreakdown = Object.entries(reasonMap).map(([reason, val]) => ({
      reason,
      count: val.count,
      hours: Number(val.hours.toFixed(1)),
    }));

    // Monthly trend mock
    const monthlyTrend = [
      { month: 'Mei', hours: 42.5, cost: 1150000 },
      { month: 'Jun', hours: 55.0, cost: 1480000 },
      { month: 'Jul', hours: 68.5, cost: 1850000 },
      { month: 'Agu (Bulan Ini)', hours: Number(totalApprovedHours.toFixed(1)), cost: totalFinalCost || totalEstimatedCost },
    ];

    return {
      date: params?.date,
      totalRequests: list.length,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      activeNow,
      completedCount,
      cancelledCount,
      totalPlannedHours: Number(totalPlannedHours.toFixed(1)),
      totalApprovedHours: Number(totalApprovedHours.toFixed(1)),
      totalActualHours: Number(totalActualHours.toFixed(1)),
      totalExcessHours: Number(totalExcessHours.toFixed(1)),
      totalEstimatedCost,
      totalFinalCost,
      departmentBreakdown,
      reasonBreakdown,
      monthlyTrend,
    };
  }

  public simulateOvertimeCost(params: OvertimeCostSimulationParams): OvertimeCostSimulationResult {
    const totalHours = params.headcount * params.hoursPerPerson;
    const multiplier = params.overtimeType === 'OFF_DAY' || params.overtimeType === 'SPECIAL_EVENT' ? 2.0 : 1.5;
    const totalEstimatedCost = Math.round(totalHours * params.averageHourlyRate * multiplier);
    const perEmployeeCost = Math.round(params.hoursPerPerson * params.averageHourlyRate * multiplier);

    const dailyBudget = 500000; // Simulated daily overtime cap for resto
    const dailyBudgetImpactPercentage = Math.round((totalEstimatedCost / dailyBudget) * 100);

    let recommendation = 'Biaya lembur dalam batas toleransi harian resto.';
    if (dailyBudgetImpactPercentage > 100) {
      recommendation = 'Peringatan: Proyeksi lembur melampaui batas anggaran harian resto (Rp 500.000). Disarankan redistribusi shift reguler.';
    } else if (params.hoursPerPerson > 3.5) {
      recommendation = 'Perhatian: Durasi lembur mendekati batas maksimal regulasi ketenagakerjaan (4 jam/hari).';
    }

    return {
      totalHours: Number(totalHours.toFixed(1)),
      totalEstimatedCost,
      perEmployeeCost,
      dailyBudgetImpactPercentage,
      recommendation,
    };
  }

  public exportOvertimeToCSV(records: EnrichedOvertimeRecord[]): string {
    const headers = [
      'ID Lembur',
      'Tanggal',
      'Kode Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Tipe Lembur',
      'Status',
      'Kompensasi',
      'Jam Rencana Mulai',
      'Jam Rencana Selesai',
      'Total Jam Rencana',
      'Jam Aktual Mulai',
      'Jam Aktual Selesai',
      'Total Jam Aktual',
      'Jam Disetujui',
      'Jam Berlebih',
      'Tarif Dasar/Jam',
      'Pengali Tarif',
      'Estimasi Biaya',
      'Biaya Final',
      'Alasan Lembur',
      'Disetujui Oleh',
      'Catatan Approval / Penolakan',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.employee?.employeeCode || '-'}"`,
      `"${r.employee?.fullName || '-'}"`,
      `"${r.employee?.department || '-'}"`,
      `"${r.employee?.primaryPosition || '-'}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      `"${r.compensationType === 'PAYROLL' ? 'Lembur Berbayar' : 'Cuti Pengganti'}"`,
      `"${r.plannedStart}"`,
      `"${r.plannedEnd}"`,
      r.plannedHours,
      `"${r.actualStart || '-'}"`,
      `"${r.actualEnd || '-'}"`,
      r.actualHours || 0,
      r.approvedHours || 0,
      r.excessHours || 0,
      r.hourlyBaseRate,
      r.rateMultiplier,
      r.estimatedCost,
      r.finalCost || 0,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      `"${r.approvedBy || r.rejectedBy || '-'}"`,
      `"${(r.approvalNotes || r.rejectionReason || r.cancellationReason || '-').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}

export const overtimeService = new OvertimeServiceClass();
