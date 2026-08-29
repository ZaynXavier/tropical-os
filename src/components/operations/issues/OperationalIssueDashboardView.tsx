/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE DASHBOARD VIEW
 * Master overview dashboard displaying KPI summary cards, subview navigation tabs,
 * and embedding subcomponents for management, personal queue, supervisor queue,
 * analytics, and executive summary.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Layers,
  User,
  ShieldCheck,
  BarChart3,
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertOctagon,
  Download,
} from 'lucide-react';
import {
  OperationalIssue,
  IssueDashboardMetrics,
  IssueAnalyticsData,
  IssueFilterParams,
} from '../../../types/operationalIssue';
import { MyOperationalIssuesView } from './MyOperationalIssuesView';
import { TeamOperationalIssuesView } from './TeamOperationalIssuesView';
import { OperationalIssueManagementView } from './OperationalIssueManagementView';
import { OperationalIssueExecutiveSummary } from './OperationalIssueExecutiveSummary';
import { OperationalIssueAnalytics } from './OperationalIssueAnalytics';

interface OperationalIssueDashboardViewProps {
  metrics: IssueDashboardMetrics;
  analytics: IssueAnalyticsData;
  issues: OperationalIssue[];
  filters: IssueFilterParams;
  onFilterChange: (filters: IssueFilterParams) => void;
  onResetFilters: () => void;
  onSelectIssue: (issue: OperationalIssue) => void;
  onOpenCreateModal: () => void;
  onExportCsv: () => void;
  onResetToDefaults: () => void;
  getCategoryLabel: (cat: any) => string;
  currentUserEmployeeId?: string;
  currentUserRole?: string;
}

export const OperationalIssueDashboardView: React.FC<OperationalIssueDashboardViewProps> = ({
  metrics,
  analytics,
  issues,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectIssue,
  onOpenCreateModal,
  onExportCsv,
  onResetToDefaults,
  getCategoryLabel,
  currentUserEmployeeId = 'emp-09',
  currentUserRole = 'STAFF',
}) => {
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'MY_ISSUES' | 'TEAM_QUEUE' | 'ANALYTICS' | 'EXECUTIVE'>('MANAGEMENT');

  const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'CLOSED' && i.status !== 'CANCELLED');

  return (
    <div className="space-y-5">
      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Total Issues */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Issues</span>
          <div className="text-xl font-extrabold text-white">{metrics.totalIssues}</div>
          <span className="text-[10px] text-slate-500">Semua Laporan</span>
        </div>

        {/* Open / Active */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-amber-500/30 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-amber-400 font-bold block">Terbuka / Aktif</span>
          <div className="text-xl font-extrabold text-amber-300">{metrics.openIssues + metrics.inProgressCount}</div>
          <span className="text-[10px] text-amber-400/80">Perlu Penanganan</span>
        </div>

        {/* Critical CCP */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-rose-500/30 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-rose-400 font-bold block">Kritis (Critical CCP)</span>
          <div className="text-xl font-extrabold text-rose-300 flex items-center gap-1">
            {metrics.criticalIssues}
            {metrics.criticalIssues > 0 && <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />}
          </div>
          <span className="text-[10px] text-rose-400/80">SLA 15 Menit</span>
        </div>

        {/* SLA Breached */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-rose-500/30 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-rose-400 font-bold block">SLA Terlewati</span>
          <div className="text-xl font-extrabold text-rose-300">{metrics.slaBreachedCount}</div>
          <span className="text-[10px] text-rose-400/80">Breached Target</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-sky-500/30 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-sky-400 font-bold block">Perlu Verifikasi</span>
          <div className="text-xl font-extrabold text-sky-300">{metrics.pendingVerificationCount}</div>
          <span className="text-[10px] text-sky-400/80">Selesai (Resolve)</span>
        </div>

        {/* SLA Compliance % */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 shadow-md">
          <span className="text-[10px] uppercase text-emerald-400 font-bold block">SLA Compliance</span>
          <div className="text-xl font-extrabold text-emerald-300">{metrics.slaCompliancePercentage}%</div>
          <span className="text-[10px] text-emerald-400/80">Tingkat Kepatuhan</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-[#111827] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('MANAGEMENT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'MANAGEMENT'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Konsol Utama (Management)
        </button>

        <button
          onClick={() => setActiveTab('MY_ISSUES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'MY_ISSUES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          Kendala Saya (My Issues)
        </button>

        <button
          onClick={() => setActiveTab('TEAM_QUEUE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'TEAM_QUEUE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Antrean Tim (Supervisor)
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analitik Insiden
        </button>

        <button
          onClick={() => setActiveTab('EXECUTIVE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'EXECUTIVE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Ringkasan Risiko (Owner)
        </button>
      </div>

      {/* Tab Render Content */}
      {activeTab === 'MANAGEMENT' && (
        <OperationalIssueManagementView
          issues={issues}
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
          onSelectIssue={onSelectIssue}
          onOpenCreateModal={onOpenCreateModal}
          onExportCsv={onExportCsv}
          onResetToDefaults={onResetToDefaults}
          getCategoryLabel={getCategoryLabel}
        />
      )}

      {activeTab === 'MY_ISSUES' && (
        <MyOperationalIssuesView
          issues={issues}
          currentUserEmployeeId={currentUserEmployeeId}
          onSelectIssue={onSelectIssue}
          onOpenCreateModal={onOpenCreateModal}
          getCategoryLabel={getCategoryLabel}
        />
      )}

      {activeTab === 'TEAM_QUEUE' && (
        <TeamOperationalIssuesView
          issues={issues}
          onSelectIssue={onSelectIssue}
          getCategoryLabel={getCategoryLabel}
        />
      )}

      {activeTab === 'ANALYTICS' && (
        <OperationalIssueAnalytics
          analytics={analytics}
          metrics={metrics}
          getCategoryLabel={getCategoryLabel}
        />
      )}

      {activeTab === 'EXECUTIVE' && (
        <OperationalIssueExecutiveSummary
          metrics={metrics}
          analytics={analytics}
          criticalIssues={criticalIssues}
          onSelectIssue={onSelectIssue}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
};
