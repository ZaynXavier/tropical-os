/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — OPERATIONAL ISSUE HUB
 * Central orchestrator connecting state management, operationalIssueService,
 * modal dialogs, and permissions for Operational Issue Management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  OperationalIssue,
  IssueFilterParams,
  IssueDashboardMetrics,
  IssueAnalyticsData,
  RootCauseCategory,
  EscalationLevel,
  IssueEvidence,
} from '../../../types/operationalIssue';
import { operationalIssueService } from '../../../services/operationalIssueService';

// Subcomponents & Modals
import { OperationalIssueDashboardView } from './OperationalIssueDashboardView';
import { CreateOperationalIssueModal } from './CreateOperationalIssueModal';
import { IssueAssignmentModal } from './IssueAssignmentModal';
import { IssueEscalationModal } from './IssueEscalationModal';
import { ResolveIssueModal } from './ResolveIssueModal';
import { IssueVerificationModal } from './IssueVerificationModal';
import { OperationalIssueDetailModal } from './OperationalIssueDetailModal';

interface OperationalIssueHubProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
    primaryPosition?: string;
  };
}

export const OperationalIssueHub: React.FC<OperationalIssueHubProps> = ({
  currentUser = { id: 'emp-02', name: 'Heri Setiawan', role: 'MANAGER', primaryPosition: 'General Manager' },
}) => {
  const [issues, setIssues] = useState<OperationalIssue[]>([]);
  const [metrics, setMetrics] = useState<IssueDashboardMetrics>({
    totalIssues: 0,
    openIssues: 0,
    criticalIssues: 0,
    slaBreachedCount: 0,
    inProgressCount: 0,
    pendingVerificationCount: 0,
    resolvedCount: 0,
    closedCount: 0,
    avgResolutionMinutes: 0,
    slaCompliancePercentage: 100,
  });
  const [analytics, setAnalytics] = useState<IssueAnalyticsData>({
    byDepartment: [],
    bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    byCategory: {
      EQUIPMENT: 0,
      INVENTORY: 0,
      FOOD_SAFETY: 0,
      HYGIENE: 0,
      GUEST_COMPLAINT: 0,
      STAFF: 0,
      FACILITY: 0,
      CASHIER_POS: 0,
      SAFETY_K3: 0,
      OPERATIONAL: 0,
      OTHER: 0,
    },
    slaCompliance: { withinSla: 0, slaBreached: 0, percentage: 100 },
    avgResolutionTimeBySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    recurringIssues: [],
    topProblemStations: [],
  });

  const [filters, setFilters] = useState<IssueFilterParams>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedIssue, setSelectedIssue] = useState<OperationalIssue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Load Data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedIssues = await operationalIssueService.getIssues(filters);
      const fetchedMetrics = await operationalIssueService.getIssueSummary();
      const fetchedAnalytics = await operationalIssueService.getIssueAnalytics();

      setIssues(fetchedIssues);
      setMetrics(fetchedMetrics);
      setAnalytics(fetchedAnalytics);

      // Keep detail modal synced if open
      if (selectedIssue) {
        const updated = fetchedIssues.find((i) => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      }
    } catch (err) {
      console.error('[OperationalIssueHub] Error loading issue data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedIssue]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers
  const handleSelectIssue = (issue: OperationalIssue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleCreateIssue = async (data: any) => {
    await operationalIssueService.createIssue(data);
    await loadAllData();
  };

  const handleAcknowledge = async (issueId: string) => {
    await operationalIssueService.acknowledgeIssue(issueId, currentUser.id, currentUser.name);
    await loadAllData();
  };

  const handleAssign = async (data: {
    assignedTo: string;
    assignedToName: string;
    assignedBy: string;
    assignedByName: string;
  }) => {
    if (!selectedIssue) return;
    await operationalIssueService.assignIssue(selectedIssue.id, data);
    await loadAllData();
  };

  const handleEscalate = async (data: {
    escalatedBy: string;
    escalatedByName: string;
    escalationReason: string;
    escalationLevel: EscalationLevel;
  }) => {
    if (!selectedIssue) return;
    await operationalIssueService.escalateIssue(selectedIssue.id, data);
    await loadAllData();
  };

  const handleResolve = async (data: {
    resolution: string;
    rootCauseCategory: RootCauseCategory;
    rootCause: string;
    correctiveAction?: string;
    preventiveAction?: string;
    resolvedBy: string;
    resolvedByName: string;
    evidence?: IssueEvidence[];
  }) => {
    if (!selectedIssue) return;
    await operationalIssueService.resolveIssue(selectedIssue.id, data);
    await loadAllData();
  };

  const handleVerify = async (data: { verifiedBy: string; verifiedByName: string; verificationNote?: string }) => {
    if (!selectedIssue) return;
    await operationalIssueService.verifyIssue(selectedIssue.id, data);
    await loadAllData();
  };

  const handleRequestRevision = async (data: {
    verifiedBy: string;
    verifiedByName: string;
    revisionReason: string;
  }) => {
    if (!selectedIssue) return;
    await operationalIssueService.requestRevision(selectedIssue.id, data);
    await loadAllData();
  };

  const handleCloseIssue = async (issueId: string) => {
    await operationalIssueService.closeIssue(issueId, currentUser.id, currentUser.name);
    await loadAllData();
  };

  const handleCancelIssue = async (issueId: string, reason: string) => {
    await operationalIssueService.cancelIssue(issueId, reason, currentUser.id, currentUser.name);
    await loadAllData();
  };

  const handleExportCsv = () => {
    const csvContent = operationalIssueService.exportIssuesToCsv(issues);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TropicalOS_Operational_Issues_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Reset seluruh data kendala operasional ke default master data?')) {
      await operationalIssueService.resetToDefaults();
      await loadAllData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Dashboard View */}
      <OperationalIssueDashboardView
        metrics={metrics}
        analytics={analytics}
        issues={issues}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters({})}
        onSelectIssue={handleSelectIssue}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onExportCsv={handleExportCsv}
        onResetToDefaults={handleResetToDefaults}
        getCategoryLabel={operationalIssueService.getCategoryLabel}
        currentUserEmployeeId={currentUser.id}
        currentUserRole={currentUser.role}
      />

      {/* Inspector Detail Modal */}
      <OperationalIssueDetailModal
        isOpen={showDetailModal}
        issue={selectedIssue}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedIssue(null);
        }}
        onAcknowledge={handleAcknowledge}
        onAssign={(issue) => {
          setSelectedIssue(issue);
          setShowAssignModal(true);
        }}
        onEscalate={(issue) => {
          setSelectedIssue(issue);
          setShowEscalateModal(true);
        }}
        onResolve={(issue) => {
          setSelectedIssue(issue);
          setShowResolveModal(true);
        }}
        onVerify={(issue) => {
          setSelectedIssue(issue);
          setShowVerifyModal(true);
        }}
        onCloseIssue={handleCloseIssue}
        onCancelIssue={handleCancelIssue}
        getCategoryLabel={operationalIssueService.getCategoryLabel}
      />

      {/* Create Issue Modal */}
      <CreateOperationalIssueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateIssue}
        currentUserEmployeeId={currentUser.id}
      />

      {/* Assignment Modal */}
      <IssueAssignmentModal
        isOpen={showAssignModal}
        issue={selectedIssue}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssign}
        currentActorId={currentUser.id}
        currentActorName={currentUser.name}
      />

      {/* Escalation Modal */}
      <IssueEscalationModal
        isOpen={showEscalateModal}
        issue={selectedIssue}
        onClose={() => setShowEscalateModal(false)}
        onSubmit={handleEscalate}
        currentActorId={currentUser.id}
        currentActorName={currentUser.name}
      />

      {/* Resolve Modal */}
      <ResolveIssueModal
        isOpen={showResolveModal}
        issue={selectedIssue}
        onClose={() => setShowResolveModal(false)}
        onSubmit={handleResolve}
        currentActorId={currentUser.id}
        currentActorName={currentUser.name}
      />

      {/* Verification Modal */}
      <IssueVerificationModal
        isOpen={showVerifyModal}
        issue={selectedIssue}
        onClose={() => setShowVerifyModal(false)}
        onVerify={handleVerify}
        onRequestRevision={handleRequestRevision}
        currentActorId={currentUser.id}
        currentActorName={currentUser.name}
      />
    </div>
  );
};
