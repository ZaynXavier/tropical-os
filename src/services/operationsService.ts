/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS FOUNDATION SERVICE
 * Central abstraction service layer for TropicalOS Operations Master Data,
 * Station Assignment, Capacity & Coverage Engine, and Daily Context.
 */

import {
  OperationalArea,
  OperationalStation,
  OperationalRole,
  StationAssignment,
  EnrichedStationAssignment,
  StationCapacity,
  StationCoverage,
  DepartmentCoverageSummary,
  DailyOperationsContext,
  OperationsConfiguration,
  OperationalIssue,
  OperationalDayPhase,
  OperationalStatus,
  StationStaffingStatus,
  StationAssignmentFilter,
} from '../types/operations';
import { INITIAL_OPERATIONAL_AREAS } from '../data/mockOperationalAreas';
import { INITIAL_OPERATIONAL_STATIONS } from '../data/mockOperationalStations';
import { INITIAL_OPERATIONAL_ROLES } from '../data/mockOperationalRoles';
import { INITIAL_STATION_ASSIGNMENTS } from '../data/mockStationAssignments';
import { INITIAL_OPERATIONS_CONFIG } from '../data/mockOperationsConfig';
import { INITIAL_OPERATIONAL_ISSUES } from '../data/mockOperationalIssues';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { OFFICIAL_SHIFTS } from '../data/mockShifts';

const AREAS_KEY = 'tropicalos_master_operations_areas';
const STATIONS_KEY = 'tropicalos_master_operations_stations';
const ROLES_KEY = 'tropicalos_master_operations_roles';
const ASSIGNMENTS_KEY = 'tropicalos_master_operations_assignments';
const CONFIG_KEY = 'tropicalos_master_operations_config';
const ISSUES_KEY = 'tropicalos_master_operations_issues';

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get current date in YYYY-MM-DD for Asia/Jakarta
 */
export function getJakartaDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Get current time in HH:mm for Asia/Jakarta
 */
export function getJakartaTimeString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

class OperationsServiceClass {
  // =========================================================================
  // STORAGE HELPERS (Safe Fallback Engine)
  // =========================================================================

  private getStoredAreas(): OperationalArea[] {
    try {
      const stored = localStorage.getItem(AREAS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading areas from storage:', e);
    }
    this.saveAreas(INITIAL_OPERATIONAL_AREAS);
    return INITIAL_OPERATIONAL_AREAS;
  }

  private saveAreas(areas: OperationalArea[]): void {
    try {
      localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
    } catch (e) {
      console.error('[OperationsService] Error saving areas:', e);
    }
  }

  private getStoredStations(): OperationalStation[] {
    try {
      const stored = localStorage.getItem(STATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading stations from storage:', e);
    }
    this.saveStations(INITIAL_OPERATIONAL_STATIONS);
    return INITIAL_OPERATIONAL_STATIONS;
  }

  private saveStations(stations: OperationalStation[]): void {
    try {
      localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
    } catch (e) {
      console.error('[OperationsService] Error saving stations:', e);
    }
  }

  private getStoredRoles(): OperationalRole[] {
    try {
      const stored = localStorage.getItem(ROLES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading roles from storage:', e);
    }
    this.saveRoles(INITIAL_OPERATIONAL_ROLES);
    return INITIAL_OPERATIONAL_ROLES;
  }

  private saveRoles(roles: OperationalRole[]): void {
    try {
      localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    } catch (e) {
      console.error('[OperationsService] Error saving roles:', e);
    }
  }

  private getStoredAssignments(): StationAssignment[] {
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading assignments from storage:', e);
    }
    this.saveAssignments(INITIAL_STATION_ASSIGNMENTS);
    return INITIAL_STATION_ASSIGNMENTS;
  }

  private saveAssignments(assignments: StationAssignment[]): void {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('[OperationsService] Error saving assignments:', e);
    }
  }

  private getStoredConfig(): OperationsConfiguration {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading config from storage:', e);
    }
    this.saveConfig(INITIAL_OPERATIONS_CONFIG);
    return INITIAL_OPERATIONS_CONFIG;
  }

  private saveConfig(config: OperationsConfiguration): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('[OperationsService] Error saving config:', e);
    }
  }

  private getStoredIssues(): OperationalIssue[] {
    try {
      const stored = localStorage.getItem(ISSUES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[OperationsService] Error reading issues from storage:', e);
    }
    this.saveIssues(INITIAL_OPERATIONAL_ISSUES);
    return INITIAL_OPERATIONAL_ISSUES;
  }

  private saveIssues(issues: OperationalIssue[]): void {
    try {
      localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('[OperationsService] Error saving issues:', e);
    }
  }

  // =========================================================================
  // 1. OPERATIONAL AREAS (CRUD)
  // =========================================================================

  async getOperationalAreas(): Promise<OperationalArea[]> {
    await delay();
    return this.getStoredAreas().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getOperationalAreaById(id: string): Promise<OperationalArea | null> {
    await delay();
    const areas = this.getStoredAreas();
    return areas.find((a) => a.id === id) || null;
  }

  async createOperationalArea(data: Omit<OperationalArea, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationalArea> {
    await delay();
    const areas = this.getStoredAreas();
    const newArea: OperationalArea = {
      ...data,
      id: `area-${data.code.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    areas.push(newArea);
    this.saveAreas(areas);
    return newArea;
  }

  async updateOperationalArea(id: string, data: Partial<OperationalArea>): Promise<OperationalArea> {
    await delay();
    const areas = this.getStoredAreas();
    const index = areas.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Operational Area ${id} not found`);

    const updated: OperationalArea = {
      ...areas[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    areas[index] = updated;
    this.saveAreas(areas);
    return updated;
  }

  async toggleOperationalAreaStatus(id: string): Promise<OperationalArea> {
    const area = await this.getOperationalAreaById(id);
    if (!area) throw new Error(`Area ${id} not found`);
    const newStatus = area.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateOperationalArea(id, { status: newStatus });
  }

  // =========================================================================
  // 2. OPERATIONAL STATIONS (CRUD)
  // =========================================================================

  async getStations(filter?: { areaId?: string; status?: 'ACTIVE' | 'INACTIVE' | 'ALL' }): Promise<OperationalStation[]> {
    await delay();
    let stations = this.getStoredStations();
    if (filter?.areaId && filter.areaId !== 'ALL') {
      stations = stations.filter((s) => s.areaId === filter.areaId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      stations = stations.filter((s) => s.status === filter.status);
    }
    return stations.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getStationById(id: string): Promise<OperationalStation | null> {
    await delay();
    const stations = this.getStoredStations();
    return stations.find((s) => s.id === id) || null;
  }

  async getStationsByArea(areaId: string): Promise<OperationalStation[]> {
    await delay();
    const stations = this.getStoredStations();
    return stations
      .filter((s) => s.areaId === areaId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createStation(data: Omit<OperationalStation, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationalStation> {
    await delay();
    const stations = this.getStoredStations();
    const newStation: OperationalStation = {
      ...data,
      id: `stn-${data.code.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    stations.push(newStation);
    this.saveStations(stations);
    return newStation;
  }

  async updateStation(id: string, data: Partial<OperationalStation>): Promise<OperationalStation> {
    await delay();
    const stations = this.getStoredStations();
    const index = stations.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Station ${id} not found`);

    const updated: OperationalStation = {
      ...stations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    stations[index] = updated;
    this.saveStations(stations);
    return updated;
  }

  async toggleStationStatus(id: string): Promise<OperationalStation> {
    const station = await this.getStationById(id);
    if (!station) throw new Error(`Station ${id} not found`);
    const newStatus = station.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateStation(id, { status: newStatus });
  }

  // =========================================================================
  // 3. OPERATIONAL ROLES (CRUD)
  // =========================================================================

  async getOperationalRoles(filter?: { areaId?: string; status?: 'ACTIVE' | 'INACTIVE' | 'ALL' }): Promise<OperationalRole[]> {
    await delay();
    let roles = this.getStoredRoles();
    if (filter?.areaId && filter.areaId !== 'ALL') {
      roles = roles.filter((r) => !r.areaId || r.areaId === filter.areaId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      roles = roles.filter((r) => r.status === filter.status);
    }
    return roles.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getOperationalRoleById(id: string): Promise<OperationalRole | null> {
    await delay();
    const roles = this.getStoredRoles();
    return roles.find((r) => r.id === id) || null;
  }

  async createOperationalRole(data: Omit<OperationalRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationalRole> {
    await delay();
    const roles = this.getStoredRoles();
    const newRole: OperationalRole = {
      ...data,
      id: `role-${data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    roles.push(newRole);
    this.saveRoles(roles);
    return newRole;
  }

  async updateOperationalRole(id: string, data: Partial<OperationalRole>): Promise<OperationalRole> {
    await delay();
    const roles = this.getStoredRoles();
    const index = roles.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Operational role ${id} not found`);

    const updated: OperationalRole = {
      ...roles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    roles[index] = updated;
    this.saveRoles(roles);
    return updated;
  }

  async toggleOperationalRoleStatus(id: string): Promise<OperationalRole> {
    const role = await this.getOperationalRoleById(id);
    if (!role) throw new Error(`Role ${id} not found`);
    const newStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateOperationalRole(id, { status: newStatus });
  }

  // =========================================================================
  // 4. STATION ASSIGNMENTS (CRUD & VALIDATIONS)
  // =========================================================================

  async getStationAssignments(filters?: StationAssignmentFilter): Promise<StationAssignment[]> {
    await delay();
    let list = this.getStoredAssignments();

    if (filters?.date) {
      list = list.filter((a) => a.date === filters.date);
    }
    if (filters?.shiftId && filters.shiftId !== 'ALL') {
      list = list.filter((a) => a.shiftId === filters.shiftId);
    }
    if (filters?.areaId && filters.areaId !== 'ALL') {
      list = list.filter((a) => a.areaId === filters.areaId);
    }
    if (filters?.stationId && filters.stationId !== 'ALL') {
      list = list.filter((a) => a.stationId === filters.stationId);
    }
    if (filters?.employeeId && filters.employeeId !== 'ALL') {
      list = list.filter((a) => a.employeeId === filters.employeeId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((a) => a.status === filters.status);
    }

    return list;
  }

  async getEnrichedStationAssignments(filters?: StationAssignmentFilter): Promise<EnrichedStationAssignment[]> {
    const assignments = await this.getStationAssignments(filters);
    const areas = this.getStoredAreas();
    const stations = this.getStoredStations();
    const roles = this.getStoredRoles();
    const employees = INITIAL_EMPLOYEES;
    const shifts = OFFICIAL_SHIFTS;

    const areaMap = new Map(areas.map((a) => [a.id, a]));
    const stationMap = new Map(stations.map((s) => [s.id, s]));
    const roleMap = new Map(roles.map((r) => [r.id, r]));
    const empMap = new Map(employees.map((e) => [e.id, e]));
    const shiftMap = new Map(shifts.map((sh) => [sh.id, sh]));

    let enriched = assignments.map((asgn) => {
      const emp = empMap.get(asgn.employeeId);
      const stn = stationMap.get(asgn.stationId);
      const area = areaMap.get(asgn.areaId);
      const role = roleMap.get(asgn.operationalRoleId);
      const sh = shiftMap.get(asgn.shiftId);

      return {
        ...asgn,
        employeeName: emp?.fullName || emp?.name || 'Karyawan',
        employeeCode: emp?.employeeCode || emp?.employeeNo || asgn.employeeId,
        employeePosition: emp?.primaryPosition || emp?.role || 'Staff',
        employeeDepartment: emp?.department || emp?.division || 'Operations',
        additionalResponsibilities: emp?.additionalResponsibilities || [],
        areaName: area?.name || 'Area',
        stationName: stn?.name || 'Station',
        stationCode: stn?.code || 'STN',
        roleName: role?.name || 'Operational Role',
        shiftName: sh?.name || asgn.shiftId,
        shiftHours: sh ? `${sh.startTime} - ${sh.endTime}` : '09:00 - 19:00',
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter(
        (e) =>
          (e.employeeName || '').toLowerCase().includes(q) ||
          (e.stationName || '').toLowerCase().includes(q) ||
          (e.areaName || '').toLowerCase().includes(q) ||
          (e.roleName || '').toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    return enriched;
  }

  async getStationAssignmentById(id: string): Promise<EnrichedStationAssignment | null> {
    const list = await this.getEnrichedStationAssignments();
    return list.find((a) => a.id === id || a.assignmentId === id) || null;
  }

  async getAssignmentsByEmployee(employeeId: string, date?: string): Promise<EnrichedStationAssignment[]> {
    const filter: StationAssignmentFilter = { employeeId };
    if (date) filter.date = date;
    return this.getEnrichedStationAssignments(filter);
  }

  async getAssignmentsByStation(stationId: string, date?: string, shiftId?: string): Promise<EnrichedStationAssignment[]> {
    const filter: StationAssignmentFilter = { stationId };
    if (date) filter.date = date;
    if (shiftId) filter.shiftId = shiftId;
    return this.getEnrichedStationAssignments(filter);
  }

  async getAssignmentsByDate(date: string): Promise<EnrichedStationAssignment[]> {
    return this.getEnrichedStationAssignments({ date });
  }

  async getAssignmentsByShift(shiftId: string, date?: string): Promise<EnrichedStationAssignment[]> {
    const targetDate = date || getJakartaDateString();
    return this.getEnrichedStationAssignments({ shiftId, date: targetDate });
  }

  /**
   * Conflict Detection Rule:
   * Checks if the employee is already assigned to an active station on the same date + shift
   */
  async validateAssignmentConflict(
    employeeId: string,
    date: string,
    shiftId: string,
    excludeAssignmentId?: string
  ): Promise<{ hasConflict: boolean; message?: string; existingAssignment?: StationAssignment }> {
    const assignments = this.getStoredAssignments();
    const existing = assignments.find(
      (a) =>
        a.employeeId === employeeId &&
        a.date === date &&
        a.shiftId === shiftId &&
        a.status !== 'CANCELLED' &&
        a.id !== excludeAssignmentId
    );

    if (existing) {
      const station = this.getStoredStations().find((s) => s.id === existing.stationId);
      const shift = OFFICIAL_SHIFTS.find((s) => s.id === shiftId);
      return {
        hasConflict: true,
        message: `Karyawan sudah memiliki penugasan aktif di stasiun "${station?.name || existing.stationId}" pada ${shift?.name || shiftId}.`,
        existingAssignment: existing,
      };
    }

    return { hasConflict: false };
  }

  async createStationAssignment(
    data: Omit<StationAssignment, 'id' | 'assignmentId' | 'assignedAt' | 'updatedAt'>
  ): Promise<StationAssignment> {
    await delay();

    // 1. Validate employee exists and is active
    const emp = INITIAL_EMPLOYEES.find((e) => e.id === data.employeeId);
    if (!emp || emp.status !== 'ACTIVE') {
      throw new Error('Karyawan tidak ditemukan atau status tidak aktif.');
    }
    if (emp.accessLevel === 'OWNER') {
      throw new Error('Owner tidak dapat ditugaskan ke stasiun operasional harian.');
    }

    // 2. Validate station and area are active
    const station = this.getStoredStations().find((s) => s.id === data.stationId);
    if (!station || station.status !== 'ACTIVE') {
      throw new Error('Stasiun operasional sedang tidak aktif.');
    }
    const area = this.getStoredAreas().find((a) => a.id === data.areaId);
    if (!area || area.status !== 'ACTIVE') {
      throw new Error('Area operasional sedang tidak aktif.');
    }

    // 3. Conflict validation
    const conflict = await this.validateAssignmentConflict(data.employeeId, data.date, data.shiftId);
    if (conflict.hasConflict) {
      throw new Error(conflict.message || 'Konflik penugasan terdeteksi.');
    }

    const assignments = this.getStoredAssignments();
    const id = `asgn-${data.date.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
    const newAsgn: StationAssignment = {
      ...data,
      id,
      assignmentId: id,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assignments.push(newAsgn);
    this.saveAssignments(assignments);
    return newAsgn;
  }

  async updateStationAssignment(
    id: string,
    data: Partial<StationAssignment>
  ): Promise<StationAssignment> {
    await delay();
    const assignments = this.getStoredAssignments();
    const index = assignments.findIndex((a) => a.id === id || a.assignmentId === id);
    if (index === -1) throw new Error(`Penugasan ${id} tidak ditemukan.`);

    const current = assignments[index];
    // If date, shift or employee changed, re-validate conflict
    const empId = data.employeeId || current.employeeId;
    const date = data.date || current.date;
    const shiftId = data.shiftId || current.shiftId;

    if (
      (data.employeeId && data.employeeId !== current.employeeId) ||
      (data.date && data.date !== current.date) ||
      (data.shiftId && data.shiftId !== current.shiftId)
    ) {
      const conflict = await this.validateAssignmentConflict(empId, date, shiftId, current.id);
      if (conflict.hasConflict) {
        throw new Error(conflict.message);
      }
    }

    const updated: StationAssignment = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    assignments[index] = updated;
    this.saveAssignments(assignments);
    return updated;
  }

  async cancelStationAssignment(
    id: string,
    reason: string,
    cancelledBy: string
  ): Promise<StationAssignment> {
    await delay();
    const assignments = this.getStoredAssignments();
    const index = assignments.findIndex((a) => a.id === id || a.assignmentId === id);
    if (index === -1) throw new Error(`Penugasan ${id} tidak ditemukan.`);

    const updated: StationAssignment = {
      ...assignments[index],
      status: 'CANCELLED',
      cancelledBy,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    };

    assignments[index] = updated;
    this.saveAssignments(assignments);
    return updated;
  }

  // =========================================================================
  // 5. CAPACITY & COVERAGE ENGINE
  // =========================================================================

  calculateCapacityStatus(current: number, min: number, rec: number, max: number): StationStaffingStatus {
    if (current === 0 && min > 0) return 'UNDERSTAFFED';
    if (current < min) return 'UNDERSTAFFED';
    if (current === min) return 'MINIMUM';
    if (current >= rec && current <= max) return 'OPTIMAL';
    if (current > max) return 'OVERSTAFFED';
    return 'ADEQUATE';
  }

  async getStationCoverage(stationId: string, date?: string, shiftId?: string): Promise<StationCoverage | null> {
    const targetDate = date || getJakartaDateString();
    const targetShiftId = shiftId || this.getCurrentShiftId();

    const station = await this.getStationById(stationId);
    if (!station) return null;

    const area = await this.getOperationalAreaById(station.areaId);
    if (!area) return null;

    const assignments = await this.getEnrichedStationAssignments({
      stationId,
      date: targetDate,
      shiftId: targetShiftId,
      status: 'ALL',
    });

    const activeAssignments = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'ACTIVE');
    const currentAssigned = activeAssignments.length;

    const staffingStatus = this.calculateCapacityStatus(
      currentAssigned,
      station.minimumStaff,
      station.recommendedStaff,
      station.maximumStaff
    );

    const percentage =
      station.recommendedStaff > 0
        ? Math.min(100, Math.round((currentAssigned / station.recommendedStaff) * 100))
        : 100;

    const shift = OFFICIAL_SHIFTS.find((s) => s.id === targetShiftId);
    const issues = this.getStoredIssues().filter(
      (i) => i.stationId === stationId && (i.status === 'OPEN' || i.status === 'IN_PROGRESS')
    );

    return {
      station,
      area,
      capacity: {
        minimumStaff: station.minimumStaff,
        recommendedStaff: station.recommendedStaff,
        maximumStaff: station.maximumStaff,
        currentAssigned,
        status: staffingStatus,
        percentage,
      },
      assignments: activeAssignments,
      date: targetDate,
      shiftId: targetShiftId,
      shiftName: shift?.name || 'Shift Pagi',
      status: currentAssigned >= station.minimumStaff ? 'READY' : 'PAUSED',
      openIssuesCount: issues.length,
      checklistStatus: {
        total: station.checklistTemplateIds?.length || 2,
        completed: 1,
        pending: Math.max(0, (station.checklistTemplateIds?.length || 2) - 1),
      },
    };
  }

  async getAllStationCoverages(date?: string, shiftId?: string): Promise<StationCoverage[]> {
    const targetDate = date || getJakartaDateString();
    const targetShiftId = shiftId || 'shift-pagi';

    const stations = await this.getStations();
    const areas = await this.getOperationalAreas();
    const areaMap = new Map(areas.map((a) => [a.id, a]));
    const assignments = await this.getEnrichedStationAssignments({
      date: targetDate,
      shiftId: targetShiftId,
      status: 'ALL',
    });
    const issues = this.getStoredIssues().filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');

    const shift = OFFICIAL_SHIFTS.find((s) => s.id === targetShiftId);

    return stations.map((station) => {
      const area = areaMap.get(station.areaId) || {
        id: station.areaId,
        code: 'N/A',
        name: 'Area',
        description: '',
        iconName: 'Package',
        isSystem: true,
        status: 'ACTIVE',
        displayOrder: 99,
        createdAt: '',
        updatedAt: '',
      };

      const stationAssignments = assignments.filter(
        (a) => a.stationId === station.id && (a.status === 'ASSIGNED' || a.status === 'ACTIVE')
      );
      const currentAssigned = stationAssignments.length;

      const staffingStatus = this.calculateCapacityStatus(
        currentAssigned,
        station.minimumStaff,
        station.recommendedStaff,
        station.maximumStaff
      );

      const percentage =
        station.recommendedStaff > 0
          ? Math.min(100, Math.round((currentAssigned / station.recommendedStaff) * 100))
          : 100;

      const stationIssues = issues.filter((i) => i.stationId === station.id);

      return {
        station,
        area,
        capacity: {
          minimumStaff: station.minimumStaff,
          recommendedStaff: station.recommendedStaff,
          maximumStaff: station.maximumStaff,
          currentAssigned,
          status: staffingStatus,
          percentage,
        },
        assignments: stationAssignments,
        date: targetDate,
        shiftId: targetShiftId,
        shiftName: shift?.name || 'Shift Pagi',
        status: currentAssigned >= station.minimumStaff ? 'READY' : 'PAUSED',
        openIssuesCount: stationIssues.length,
      };
    });
  }

  async getDepartmentCoverageSummaries(date?: string, shiftId?: string): Promise<DepartmentCoverageSummary[]> {
    const coverages = await this.getAllStationCoverages(date, shiftId);
    const areas = await this.getOperationalAreas();

    return areas.map((area) => {
      const areaCoverages = coverages.filter((c) => c.station.areaId === area.id);
      const totalStations = areaCoverages.length;
      const activeStations = areaCoverages.filter((c) => c.station.status === 'ACTIVE').length;
      const totalRequiredMin = areaCoverages.reduce((sum, c) => sum + (c.station.status === 'ACTIVE' ? c.station.minimumStaff : 0), 0);
      const totalRequiredRec = areaCoverages.reduce((sum, c) => sum + (c.station.status === 'ACTIVE' ? c.station.recommendedStaff : 0), 0);
      const currentAssigned = areaCoverages.reduce((sum, c) => sum + c.capacity.currentAssigned, 0);

      const coveragePercentage =
        totalRequiredRec > 0 ? Math.min(100, Math.round((currentAssigned / totalRequiredRec) * 100)) : 100;

      let status: StationStaffingStatus = 'OPTIMAL';
      if (currentAssigned < totalRequiredMin) status = 'UNDERSTAFFED';
      else if (currentAssigned === totalRequiredMin) status = 'MINIMUM';
      else if (currentAssigned < totalRequiredRec) status = 'ADEQUATE';
      else if (currentAssigned > totalRequiredRec * 1.5) status = 'OVERSTAFFED';

      return {
        areaId: area.id,
        areaName: area.name,
        areaCode: area.code,
        totalStations,
        activeStations,
        totalRequiredMin,
        totalRequiredRec,
        currentAssigned,
        coveragePercentage,
        status,
      };
    });
  }

  // =========================================================================
  // 6. DAILY OPERATIONS CONTEXT
  // =========================================================================

  async getDailyOperationsContext(date?: string): Promise<DailyOperationsContext> {
    const targetDate = date || getJakartaDateString();
    const timeStr = getJakartaTimeString();
    const phase = this.getOperationalDayPhase(timeStr);
    const shiftId = this.getCurrentShiftId(timeStr);
    const currentShift = OFFICIAL_SHIFTS.find((s) => s.id === shiftId) || OFFICIAL_SHIFTS[0];

    const stations = await this.getStations();
    const activeStations = stations.filter((s) => s.status === 'ACTIVE');
    const coverages = await this.getAllStationCoverages(targetDate, shiftId);

    const assignments = await this.getStationAssignments({ date: targetDate, shiftId });
    const activeAssignments = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'ACTIVE');

    // Unique employees assigned today across shifts or current shift
    const assignedEmpIds = new Set(activeAssignments.map((a) => a.employeeId));
    const nonOwnerEmployees = INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE' && e.accessLevel !== 'OWNER');
    const totalStaffCount = nonOwnerEmployees.length;
    const assignedCount = assignedEmpIds.size;
    const unassignedCount = Math.max(0, totalStaffCount - assignedCount);

    const understaffedCount = coverages.filter((c) => c.station.status === 'ACTIVE' && c.capacity.status === 'UNDERSTAFFED').length;
    const optimalCount = coverages.filter((c) => c.station.status === 'ACTIVE' && (c.capacity.status === 'OPTIMAL' || c.capacity.status === 'ADEQUATE')).length;

    const issues = this.getStoredIssues().filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');

    // Calculate overall readiness score (0-100)
    const activeCount = activeStations.length || 1;
    const readyStationsCount = coverages.filter((c) => c.station.status === 'ACTIVE' && c.capacity.currentAssigned >= c.station.minimumStaff).length;
    const staffingScore = (readyStationsCount / activeCount) * 60;
    const issuePenalty = Math.min(20, issues.length * 5);
    const checklistScore = 35; // base checklist readiness
    const readinessScore = Math.max(0, Math.min(100, Math.round(staffingScore + checklistScore - issuePenalty)));

    let operationalStatus: OperationalStatus = 'OPEN';
    if (phase === 'BEFORE_OPENING') operationalStatus = 'READY';
    else if (phase === 'RUNNING') operationalStatus = 'RUNNING';
    else if (phase === 'CLOSING') operationalStatus = 'CLOSING';
    else if (phase === 'CLOSED') operationalStatus = 'CLOSED';

    if (understaffedCount > 3 || issues.some((i) => i.severity === 'CRITICAL')) {
      operationalStatus = 'ISSUE';
    }

    const businessDay = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(targetDate));

    return {
      date: targetDate,
      businessDay,
      currentShift: {
        id: currentShift.id,
        name: currentShift.name,
        startTime: currentShift.startTime,
        endTime: currentShift.endTime,
      },
      operationalDayPhase: phase,
      operationalStatus,
      totalEmployeesCount: totalStaffCount,
      assignedEmployeesCount: assignedCount,
      unassignedEmployeesCount: unassignedCount,
      totalStationsCount: stations.length,
      activeStationsCount: activeStations.length,
      understaffedStationsCount: understaffedCount,
      optimalStationsCount: optimalCount,
      openIssuesCount: issues.length,
      pendingChecklistsCount: 3,
      completedChecklistsCount: 14,
      verifiedChecklistsCount: 12,
      overallReadinessScore: readinessScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // =========================================================================
  // 7. OPERATIONAL ISSUES (FOUNDATION)
  // =========================================================================

  async getOperationalIssues(filters?: { areaId?: string; status?: string }): Promise<OperationalIssue[]> {
    await delay();
    let list = this.getStoredIssues();
    if (filters?.areaId && filters.areaId !== 'ALL') {
      list = list.filter((i) => i.areaId === filters.areaId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((i) => i.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOperationalIssueById(id: string): Promise<OperationalIssue | null> {
    await delay();
    const list = this.getStoredIssues();
    return list.find((i) => i.id === id) || null;
  }

  async createOperationalIssue(data: Omit<OperationalIssue, 'id' | 'issueNumber' | 'createdAt' | 'updatedAt'>): Promise<OperationalIssue> {
    await delay();
    const list = this.getStoredIssues();
    const count = list.length + 1;
    const dateStr = getJakartaDateString().replace(/-/g, '');
    const issueNumber = `ISS-${dateStr}-${String(count).padStart(3, '0')}`;

    const newIssue: OperationalIssue = {
      ...data,
      id: `issue-${Date.now().toString().slice(-6)}`,
      issueNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newIssue);
    this.saveIssues(list);
    return newIssue;
  }

  async updateOperationalIssue(id: string, data: Partial<OperationalIssue>): Promise<OperationalIssue> {
    await delay();
    const list = this.getStoredIssues();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Issue ${id} not found`);

    const updated: OperationalIssue = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveIssues(list);
    return updated;
  }

  async resolveOperationalIssue(id: string, notes: string, resolvedBy: string): Promise<OperationalIssue> {
    return this.updateOperationalIssue(id, {
      status: 'RESOLVED',
      resolutionNotes: notes,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    });
  }

  // =========================================================================
  // 8. CONFIGURATION MANAGEMENT
  // =========================================================================

  async getOperationsConfiguration(): Promise<OperationsConfiguration> {
    await delay();
    return this.getStoredConfig();
  }

  async updateOperationsConfiguration(data: Partial<OperationsConfiguration>): Promise<OperationsConfiguration> {
    await delay();
    const current = this.getStoredConfig();
    const updated: OperationsConfiguration = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveConfig(updated);
    return updated;
  }

  // =========================================================================
  // 9. TIMEZONE & OPERATIONAL DAY PHASE UTILITIES
  // =========================================================================

  getOperationalDayPhase(timeStr?: string): OperationalDayPhase {
    const time = timeStr || getJakartaTimeString();
    const config = this.getStoredConfig();
    const opening = config.openingTime || '09:00';
    const closing = config.closingTime || '22:00';

    if (time < opening) return 'BEFORE_OPENING';
    if (time >= opening && time < '11:00') return 'OPENING';
    if (time >= '11:00' && time < '21:30') return 'RUNNING';
    if (time >= '21:30' && time <= closing) return 'CLOSING';
    return 'CLOSED';
  }

  getCurrentShiftId(timeStr?: string): string {
    const time = timeStr || getJakartaTimeString();
    // Shift Pagi: 09:00 - 19:00, Shift Siang: 13:00 - 23:00
    if (time >= '14:30') return 'shift-siang';
    return 'shift-pagi';
  }

  // =========================================================================
  // 10. RESET TO DEFAULTS
  // =========================================================================

  async resetToDefaults(): Promise<void> {
    await delay(100);
    this.saveAreas(INITIAL_OPERATIONAL_AREAS);
    this.saveStations(INITIAL_OPERATIONAL_STATIONS);
    this.saveRoles(INITIAL_OPERATIONAL_ROLES);
    this.saveAssignments(INITIAL_STATION_ASSIGNMENTS);
    this.saveConfig(INITIAL_OPERATIONS_CONFIG);
    this.saveIssues(INITIAL_OPERATIONAL_ISSUES);
  }
}

export const operationsService = new OperationsServiceClass();
