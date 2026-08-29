/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS FOUNDATION & MASTER DATA VIEW
 * Central unified Operations module view with multi-tab navigation,
 * date/shift selectors, role-based views, and real-time station assignment modals.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Briefcase,
  MapPin,
  AlertTriangle,
  Settings,
  RefreshCw,
  Plus,
  Filter,
  UserCheck,
  Shield,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import {
  OperationalArea,
  OperationalStation,
  OperationalRole,
  EnrichedStationAssignment,
  StationCoverage,
  DailyOperationsContext,
  DepartmentCoverageSummary,
  OperationalIssue,
} from '../../types/operations';
import { Employee } from '../../types/employee';
import { operationsService } from '../../services/operationsService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { OFFICIAL_SHIFTS } from '../../data/mockShifts';

// Subcomponents
import { OperationsOverview } from './OperationsOverview';
import { DailyOperationsBoard } from './DailyOperationsBoard';
import { StationCoverageView } from './StationCoverageView';
import { OperationalAreaManagementView } from './OperationalAreaManagementView';
import { OperationalStationManagementView } from './OperationalStationManagementView';
import { OperationalRoleManagementView } from './OperationalRoleManagementView';
import { MyOperationsView } from './MyOperationsView';
import { TeamOperationsView } from './TeamOperationsView';
import { OperationalIssuePanel } from './OperationalIssuePanel';
import { OperationsConfigurationView } from './OperationsConfigurationView';
import { StationAssignmentModal } from './StationAssignmentModal';
import { StationAssignmentDetailModal } from './StationAssignmentDetailModal';
import { MasterDataRelationshipDrawer } from './MasterDataRelationshipDrawer';
import { DailyChecklistHub } from './checklist/DailyChecklistHub';
import { CheckSquare } from 'lucide-react';

interface OperationsFoundationViewProps {
  currentEmployee?: Employee;
  initialSubTab?: string;
  onNavigateToChecklist?: () => void;
}

export const OperationsFoundationView: React.FC<OperationsFoundationViewProps> = ({
  currentEmployee = INITIAL_EMPLOYEES[1], // Default: Wahyu GM or Spv
  initialSubTab = 'overview',
  onNavigateToChecklist,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState(initialSubTab);

  // Time & Filter State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftId, setShiftId] = useState('shift-pagi');
  const [selectedAreaId, setSelectedAreaId] = useState('ALL');

  // Master & Operational State
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<OperationalArea[]>([]);
  const [stations, setStations] = useState<OperationalStation[]>([]);
  const [roles, setRoles] = useState<OperationalRole[]>([]);
  const [assignments, setAssignments] = useState<EnrichedStationAssignment[]>([]);
  const [coverages, setCoverages] = useState<StationCoverage[]>([]);
  const [context, setContext] = useState<DailyOperationsContext | null>(null);
  const [departmentSummaries, setDepartmentSummaries] = useState<DepartmentCoverageSummary[]>([]);
  const [issues, setIssues] = useState<OperationalIssue[]>([]);

  // Modal / Drawer States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignInitialStationId, setAssignInitialStationId] = useState<string | undefined>();
  const [assignInitialAreaId, setAssignInitialAreaId] = useState<string | undefined>();

  const [selectedDetailAssignment, setSelectedDetailAssignment] = useState<EnrichedStationAssignment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [inspectedStation, setInspectedStation] = useState<OperationalStation | null>(null);
  const [isRelationshipDrawerOpen, setIsRelationshipDrawerOpen] = useState(false);

  const canManage =
    currentEmployee.accessLevel === 'OWNER' ||
    currentEmployee.accessLevel === 'MANAGER' ||
    currentEmployee.accessLevel === 'SUPERVISOR' ||
    currentEmployee.role === 'Manager' ||
    currentEmployee.role === 'Supervisor';

  // Load all operational data for selected date and shift
  const loadOperationsData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        areaList,
        stationList,
        roleList,
        assignmentList,
        coverageList,
        ctx,
        deptSums,
        issueList,
      ] = await Promise.all([
        operationsService.getOperationalAreas(),
        operationsService.getStations(),
        operationsService.getOperationalRoles(),
        operationsService.getEnrichedStationAssignments({ date, shiftId }),
        operationsService.getAllStationCoverages(date, shiftId),
        operationsService.getDailyOperationsContext(date),
        operationsService.getDepartmentCoverageSummaries(date, shiftId),
        operationsService.getOperationalIssues(),
      ]);

      setAreas(areaList);
      setStations(stationList);
      setRoles(roleList);
      setAssignments(assignmentList);
      setCoverages(coverageList);
      setContext(ctx);
      setDepartmentSummaries(deptSums);
      setIssues(issueList);
    } catch (err) {
      console.error('Failed to load operational data:', err);
    } finally {
      setLoading(false);
    }
  }, [date, shiftId]);

  useEffect(() => {
    loadOperationsData();
  }, [loadOperationsData]);

  // Modal triggers
  const handleOpenAssignModal = (stationId?: string, areaId?: string) => {
    setAssignInitialStationId(stationId);
    setAssignInitialAreaId(areaId);
    setIsAssignModalOpen(true);
  };

  const handleInspectStation = (stn: OperationalStation) => {
    setInspectedStation(stn);
    setIsRelationshipDrawerOpen(true);
  };

  const handleViewAssignmentDetail = (asgn: EnrichedStationAssignment) => {
    setSelectedDetailAssignment(asgn);
    setIsDetailModalOpen(true);
  };

  const myAssignments = assignments.filter((a) => a.employeeId === currentEmployee.id);

  // Sub-tab definitions
  const tabs = [
    { key: 'overview', label: 'Ringkasan Operasional', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'board', label: 'Board Stasiun', icon: <Layers className="w-4 h-4" /> },
    { key: 'checklists', label: 'Checklist Harian Stasiun', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'coverage', label: 'Matriks Kapasitas', icon: <Activity className="w-4 h-4" /> },
    { key: 'my-ops', label: 'Stasiun Saya', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'team-ops', label: 'Monitoring Tim', icon: <Users className="w-4 h-4" /> },
    { key: 'issues', label: 'Log Kendala', icon: <AlertTriangle className="w-4 h-4" />, badge: issues.filter((i) => i.status !== 'RESOLVED').length },
    { key: 'areas', label: 'Master Area', icon: <MapPin className="w-4 h-4" /> },
    { key: 'stations', label: 'Master Stasiun', icon: <Layers className="w-4 h-4" /> },
    { key: 'roles', label: 'Master Peran', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'config', label: 'Konfigurasi', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div id="operations-foundation-container" className="space-y-5">
      {/* Top Filter Bar: Date, Shift, Refresh & Quick Actions */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Title & Live Ticker */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                Tropical Garden Operations Control
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Phase 3.1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Master Area, Stasiun Kerja, Peran & Alokasi Personel Harian
            </p>
          </div>
        </div>

        {/* Right: Date, Shift & Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              id="global-ops-date-picker"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden text-xs [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="global-ops-shift-select"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden text-xs cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
            >
              {OFFICIAL_SHIFTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#111827] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={loadOperationsData}
            title="Muat Ulang Data Operasional"
            className="p-2 text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-[#1E2438] border border-white/10 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              type="button"
              id="btn-global-assign-staff"
              onClick={() => handleOpenAssignModal()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tugaskan Personel
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-ops-${tab.key}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-[#151B2B] text-slate-400 hover:text-slate-200 hover:bg-[#1E2438] border border-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="pt-1">
        {activeTab === 'overview' && (
          <OperationsOverview
            context={context}
            departmentSummaries={departmentSummaries}
            recentIssues={issues.filter((i) => i.status !== 'RESOLVED')}
            onNavigateToTab={setActiveTab}
            onOpenReportIssue={() => setActiveTab('issues')}
            onFilterUnderstaffed={() => {
              setActiveTab('board');
            }}
            canManage={canManage}
          />
        )}

        {activeTab === 'board' && (
          <DailyOperationsBoard
            areas={areas}
            coverages={coverages}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
            onOpenAssignModal={handleOpenAssignModal}
            onInspectStation={handleInspectStation}
            onViewAssignmentDetail={handleViewAssignmentDetail}
            canManage={canManage}
          />
        )}

        {activeTab === 'checklists' && (
          <DailyChecklistHub
            currentEmployee={currentEmployee}
            initialDate={date}
            initialShiftId={shiftId}
          />
        )}

        {activeTab === 'coverage' && (
          <StationCoverageView
            coverages={coverages}
            areas={areas}
            onOpenAssignModal={handleOpenAssignModal}
            onInspectStation={handleInspectStation}
            onViewAssignmentDetail={handleViewAssignmentDetail}
            canManage={canManage}
          />
        )}

        {activeTab === 'my-ops' && (
          <MyOperationsView
            currentEmployee={currentEmployee}
            todayAssignments={myAssignments}
            areas={areas}
            stations={stations}
            onOpenReportIssue={() => setActiveTab('issues')}
            onNavigateToChecklist={onNavigateToChecklist || (() => setActiveTab('checklists'))}
          />
        )}

        {activeTab === 'team-ops' && (
          <TeamOperationsView
            assignments={assignments}
            coverages={coverages}
            areas={areas}
            stations={stations}
            onOpenAssignModal={handleOpenAssignModal}
            onViewAssignmentDetail={handleViewAssignmentDetail}
            canManage={canManage}
          />
        )}

        {activeTab === 'issues' && (
          <OperationalIssuePanel
            issues={issues}
            areas={areas}
            stations={stations}
            onRefresh={loadOperationsData}
            currentUserEmployeeId={currentEmployee.id}
            canManage={canManage}
          />
        )}

        {activeTab === 'areas' && (
          <OperationalAreaManagementView
            areas={areas}
            stations={stations}
            roles={roles}
            onRefresh={loadOperationsData}
            canManage={canManage}
          />
        )}

        {activeTab === 'stations' && (
          <OperationalStationManagementView
            stations={stations}
            areas={areas}
            roles={roles}
            onRefresh={loadOperationsData}
            onInspectStation={handleInspectStation}
            canManage={canManage}
          />
        )}

        {activeTab === 'roles' && (
          <OperationalRoleManagementView
            roles={roles}
            areas={areas}
            onRefresh={loadOperationsData}
            canManage={canManage}
          />
        )}

        {activeTab === 'config' && (
          <OperationsConfigurationView
            onRefresh={loadOperationsData}
            canManage={canManage}
          />
        )}
      </div>

      {/* Station Assignment Modal */}
      {isAssignModalOpen && (
        <StationAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={loadOperationsData}
          initialStationId={assignInitialStationId}
          initialAreaId={assignInitialAreaId}
          initialShiftId={shiftId}
          initialDate={date}
          currentUserEmployeeId={currentEmployee.id}
        />
      )}

      {/* Station Assignment Detail Modal */}
      {isDetailModalOpen && (
        <StationAssignmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailAssignment(null);
          }}
          assignment={selectedDetailAssignment}
          onRefresh={loadOperationsData}
          currentUserEmployeeId={currentEmployee.id}
          canManage={canManage}
        />
      )}

      {/* Master Data Relationship Drawer */}
      {isRelationshipDrawerOpen && inspectedStation && (
        <MasterDataRelationshipDrawer
          isOpen={isRelationshipDrawerOpen}
          onClose={() => {
            setIsRelationshipDrawerOpen(false);
            setInspectedStation(null);
          }}
          station={inspectedStation}
          area={areas.find((a) => a.id === inspectedStation.areaId) || null}
          assignments={assignments.filter((a) => a.stationId === inspectedStation.id)}
          onOpenAssignModal={(stnId) => {
            setIsRelationshipDrawerOpen(false);
            handleOpenAssignModal(stnId, inspectedStation.areaId);
          }}
        />
      )}
    </div>
  );
};
