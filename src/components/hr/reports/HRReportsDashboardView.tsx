/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Master HR Reports & People Analytics Dashboard View (Phase 2C.10)
 */

import React, { useState, useEffect } from 'react';
import {
  HRReportSubTab,
  HRReportFilterState,
  HROverviewMetrics,
  AttendanceReportData,
  ManpowerReportData,
  BreakReportData,
  OvertimeReportData,
  PayrollReportData,
  DocumentComplianceReportData,
  SopComplianceReportData,
  ChecklistComplianceReportData,
  EmployeePerformanceRankingData,
  HRMonthlyReportData,
  EmployeeDrillDownData,
  PeopleRiskAlert,
  HRActionPlanItem,
} from '../../../types/hrReports';
import { hrReportsService } from '../../../services/hrReportsService';
import { HRReportFilters } from './HRReportFilters';
import { HrOverviewCards } from './HrOverviewCards';
import { DepartmentHealthCard } from './DepartmentHealthCard';
import { PeopleRiskPanel } from './PeopleRiskPanel';
import { AttendanceReportView } from './AttendanceReportView';
import { ManpowerReportView } from './ManpowerReportView';
import { BreakReportView } from './BreakReportView';
import { OvertimeReportView } from './OvertimeReportView';
import { PayrollReportView } from './PayrollReportView';
import { DocumentComplianceReportView } from './DocumentComplianceReportView';
import { SopComplianceReportView } from './SopComplianceReportView';
import { ChecklistComplianceReportView } from './ChecklistComplianceReportView';
import { EmployeePerformanceView } from './EmployeePerformanceView';
import { HRMonthlyReportView } from './HRMonthlyReportView';
import { EmployeePeopleAnalyticsDrawer } from './EmployeePeopleAnalyticsDrawer';
import { HRReportExportModal } from './HRReportExport';
import {
  LayoutDashboard,
  Clock,
  Users,
  Coffee,
  DollarSign,
  FileCheck,
  BookOpen,
  ClipboardList,
  Award,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';

interface HRReportsDashboardViewProps {
  userRole?: string;
  currentUserId?: string;
  initialTab?: HRReportSubTab;
}

const TABS: Array<{ id: HRReportSubTab; label: string; icon: React.FC<{ className?: string }>; requiresPayroll?: boolean }> = [
  { id: 'OVERVIEW', label: 'Ringkasan & Health Score', icon: LayoutDashboard },
  { id: 'ATTENDANCE', label: 'Presensi', icon: Clock },
  { id: 'MANPOWER', label: 'Manpower', icon: Users },
  { id: 'BREAK', label: 'Break', icon: Coffee },
  { id: 'OVERTIME', label: 'Lembur', icon: Clock },
  { id: 'PAYROLL', label: 'Payroll & Biaya', icon: DollarSign, requiresPayroll: true },
  { id: 'DOCUMENTS', label: 'Dokumen', icon: FileCheck },
  { id: 'SOP', label: 'Kepatuhan SOP', icon: BookOpen },
  { id: 'CHECKLIST', label: 'Checklist', icon: ClipboardList },
  { id: 'PERFORMANCE', label: 'Kinerja Personel', icon: Award },
  { id: 'MONTHLY', label: 'Laporan MBR', icon: FileText },
];

export const HRReportsDashboardView: React.FC<HRReportsDashboardViewProps> = ({
  userRole = 'OWNER',
  currentUserId = 'EMP-001',
  initialTab = 'OVERVIEW',
}) => {
  const [activeTab, setActiveTab] = useState<HRReportSubTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<HRReportFilterState>({
    period: 'THIS_MONTH',
    department: 'ALL',
    employeeId: 'ALL',
    searchQuery: '',
  });

  // Data states
  const [overviewData, setOverviewData] = useState<HROverviewMetrics | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceReportData | null>(null);
  const [manpowerData, setManpowerData] = useState<ManpowerReportData | null>(null);
  const [breakData, setBreakData] = useState<BreakReportData | null>(null);
  const [overtimeData, setOvertimeData] = useState<OvertimeReportData | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollReportData | null>(null);
  const [documentData, setDocumentData] = useState<DocumentComplianceReportData | null>(null);
  const [sopData, setSopData] = useState<SopComplianceReportData | null>(null);
  const [checklistData, setChecklistData] = useState<ChecklistComplianceReportData | null>(null);
  const [performanceData, setPerformanceData] = useState<EmployeePerformanceRankingData | null>(null);
  const [monthlyReportData, setMonthlyReportData] = useState<HRMonthlyReportData | null>(null);

  // Drawer and modal states
  const [drawerEmployeeId, setDrawerEmployeeId] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<EmployeeDrillDownData | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // RBAC checks
  const canViewPayroll = ['OWNER', 'MANAGER', 'FINANCE'].includes(userRole.toUpperCase());
  const isStaff = userRole.toUpperCase() === 'STAFF';

  // Load active tab data
  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'OVERVIEW': {
          const res = await hrReportsService.getOverviewMetrics(filters);
          setOverviewData(res);
          break;
        }
        case 'ATTENDANCE': {
          const res = await hrReportsService.getAttendanceReport(filters);
          setAttendanceData(res);
          break;
        }
        case 'MANPOWER': {
          const res = await hrReportsService.getManpowerReport(filters);
          setManpowerData(res);
          break;
        }
        case 'BREAK': {
          const res = await hrReportsService.getBreakReport(filters);
          setBreakData(res);
          break;
        }
        case 'OVERTIME': {
          const res = await hrReportsService.getOvertimeReport(filters);
          setOvertimeData(res);
          break;
        }
        case 'PAYROLL': {
          const res = await hrReportsService.getPayrollReport(filters);
          setPayrollData(res);
          break;
        }
        case 'DOCUMENTS': {
          const res = await hrReportsService.getDocumentComplianceReport(filters);
          setDocumentData(res);
          break;
        }
        case 'SOP': {
          const res = await hrReportsService.getSopComplianceReport(filters);
          setSopData(res);
          break;
        }
        case 'CHECKLIST': {
          const res = await hrReportsService.getChecklistComplianceReport(filters);
          setChecklistData(res);
          break;
        }
        case 'PERFORMANCE': {
          const res = await hrReportsService.getPerformanceRankings(filters);
          setPerformanceData(res);
          break;
        }
        case 'MONTHLY': {
          const res = await hrReportsService.getMonthlyReport(filters);
          setMonthlyReportData(res);
          break;
        }
      }
    } catch (err) {
      console.error('Error loading HR reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  // Handle employee drawer
  const handleOpenDrawer = async (employeeId: string) => {
    setDrawerEmployeeId(employeeId);
    try {
      const drillData = await hrReportsService.getEmployeeDrillDown(employeeId, filters.period);
      setDrawerData(drillData);
    } catch (e) {
      console.error('Error loading employee drill down:', e);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerEmployeeId(null);
    setDrawerData(null);
  };

  // Handle Action Plan creation from risk panel or MBR
  const handleCreateActionPlanFromRisk = async (risk: PeopleRiskAlert) => {
    await hrReportsService.createActionPlan({
      title: `Tindak Lanjut: ${risk.issue.substring(0, 45)}...`,
      description: `Rekomendasi: ${risk.suggestedAction} (Staf: ${risk.employeeName})`,
      category: 'GENERAL',
      priority: risk.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      assignedTo: 'Supervisor / HR',
      targetDepartment: risk.department,
      dueDate: '2026-08-31',
      status: 'OPEN',
      createdBy: 'Auto EWS',
    });
    // If on monthly tab, refresh
    if (activeTab === 'MONTHLY') {
      const res = await hrReportsService.getMonthlyReport(filters);
      setMonthlyReportData(res);
    } else {
      setActiveTab('MONTHLY');
    }
  };

  const handleAddActionPlan = async (plan: Omit<HRActionPlanItem, 'id' | 'createdAt'>) => {
    await hrReportsService.createActionPlan(plan);
    const res = await hrReportsService.getMonthlyReport(filters);
    setMonthlyReportData(res);
  };

  const handleUpdatePlanStatus = async (id: string, status: HRActionPlanItem['status']) => {
    await hrReportsService.updateActionPlanStatus(id, status);
    const res = await hrReportsService.getMonthlyReport(filters);
    setMonthlyReportData(res);
  };

  // CSV export execution
  const handleExecuteExport = (tab: HRReportSubTab) => {
    const csvContent = hrReportsService.generateCsvExport(tab, {
      overview: overviewData,
      attendance: attendanceData,
      manpower: manpowerData,
      breaks: breakData,
      overtime: overtimeData,
      payroll: payrollData,
      documents: documentData,
      sops: sopData,
      checklists: checklistData,
      performance: performanceData,
      monthly: monthlyReportData,
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TropicalOS_HR_Report_${tab}_${filters.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Export Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-purple-400" />
            <span>HR Reports &amp; People Analytics</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Pusat intelijen dan pelaporan SDM terintegrasi untuk presensi, lembur, payroll, kepatuhan SOP, dan kesehatan tim
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Laporan</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 bg-[#1E2438] p-1.5 rounded-2xl border border-[#2D374E]">
        {TABS.map((tab) => {
          if (tab.requiresPayroll && !canViewPayroll && !isStaff) return null;
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Filters */}
      <HRReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            period: 'THIS_MONTH',
            department: 'ALL',
            employeeId: 'ALL',
            searchQuery: '',
          })
        }
      />

      {/* Content View with Loading Fallback */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-[#1E2438] rounded-2xl border border-[#2D374E]">
          <div className="flex flex-col items-center gap-2 text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold text-gray-300">Menghubungkan data lintas modul HR...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && overviewData && (
            <div className="space-y-6">
              <HrOverviewCards metrics={overviewData} canViewPayroll={canViewPayroll} />
              <DepartmentHealthCard
                departments={overviewData.departmentHealth}
                onSelectDepartment={(dept) => {
                  setFilters({ ...filters, department: dept });
                }}
              />
              <PeopleRiskPanel
                risks={overviewData.riskAlerts}
                onOpenEmployeeDrawer={handleOpenDrawer}
                onCreateActionPlan={handleCreateActionPlanFromRisk}
              />
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'ATTENDANCE' && attendanceData && (
            <AttendanceReportView
              data={attendanceData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('ATTENDANCE')}
            />
          )}

          {/* TAB 3: MANPOWER */}
          {activeTab === 'MANPOWER' && manpowerData && (
            <ManpowerReportView
              data={manpowerData}
              onExportCsv={() => handleExecuteExport('MANPOWER')}
            />
          )}

          {/* TAB 4: BREAK */}
          {activeTab === 'BREAK' && breakData && (
            <BreakReportView
              data={breakData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('BREAK')}
            />
          )}

          {/* TAB 5: OVERTIME */}
          {activeTab === 'OVERTIME' && overtimeData && (
            <OvertimeReportView
              data={overtimeData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('OVERTIME')}
            />
          )}

          {/* TAB 6: PAYROLL */}
          {activeTab === 'PAYROLL' && payrollData && (
            <PayrollReportView
              data={payrollData}
              canViewAllPayroll={canViewPayroll}
              currentUserId={currentUserId}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('PAYROLL')}
            />
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && documentData && (
            <DocumentComplianceReportView
              data={documentData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('DOCUMENTS')}
            />
          )}

          {/* TAB 8: SOP */}
          {activeTab === 'SOP' && sopData && (
            <SopComplianceReportView
              data={sopData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('SOP')}
            />
          )}

          {/* TAB 9: CHECKLIST */}
          {activeTab === 'CHECKLIST' && checklistData && (
            <ChecklistComplianceReportView
              data={checklistData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('CHECKLIST')}
            />
          )}

          {/* TAB 10: PERFORMANCE */}
          {activeTab === 'PERFORMANCE' && performanceData && (
            <EmployeePerformanceView
              data={performanceData}
              onOpenEmployeeDrawer={handleOpenDrawer}
              onExportCsv={() => handleExecuteExport('PERFORMANCE')}
            />
          )}

          {/* TAB 11: MONTHLY MBR */}
          {activeTab === 'MONTHLY' && monthlyReportData && (
            <HRMonthlyReportView
              data={monthlyReportData}
              canViewPayroll={canViewPayroll}
              onAddActionPlan={handleAddActionPlan}
              onUpdateActionPlanStatus={handleUpdatePlanStatus}
              onExportCsv={() => handleExecuteExport('MONTHLY')}
            />
          )}
        </div>
      )}

      {/* Sliding Drawer for 360-degree Employee Drill Down */}
      <EmployeePeopleAnalyticsDrawer
        data={drawerData}
        isOpen={Boolean(drawerEmployeeId && drawerData)}
        onClose={handleCloseDrawer}
        canViewPayroll={canViewPayroll || drawerEmployeeId === currentUserId}
      />

      {/* CSV Export Modal */}
      <HRReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        activeTab={activeTab}
        onExport={handleExecuteExport}
        canViewPayroll={canViewPayroll}
      />
    </div>
  );
};
