/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — SHIFT HANDOVER MASTER HUB
 * Master orchestrator component for TropicalOS Shift & Handover Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  User,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
  Building2,
  Plus,
  RefreshCw,
  Clock,
  ListTodo,
} from 'lucide-react';
import {
  HandoverRecord,
  HandoverFilterParams,
  HandoverDashboardMetrics,
  HandoverAnalyticsData,
} from '../../../types/handover';
import { handoverService } from '../../../services/handoverService';
import { HandoverDashboardView } from './HandoverDashboardView';
import { MyHandoverView } from './MyHandoverView';
import { TeamHandoverView } from './TeamHandoverView';
import { HandoverManagementView } from './HandoverManagementView';
import { HandoverExecutiveSummary } from './HandoverExecutiveSummary';
import { HandoverAnalytics } from './HandoverAnalytics';
import { HandoverDetailModal } from './HandoverDetailModal';
import { CreateHandoverModal } from './CreateHandoverModal';
import { HandoverReceiveModal } from './HandoverReceiveModal';
import { HandoverVerificationModal } from './HandoverVerificationModal';

interface ShiftHandoverHubProps {
  currentUser?: any;
}

export const ShiftHandoverHub: React.FC<ShiftHandoverHubProps> = ({ currentUser }) => {
  // Determine role
  const userRole = currentUser?.role || 'GENERAL_MANAGER';
  const isOwner = userRole === 'OWNER';
  const isManager = userRole === 'GENERAL_MANAGER' || userRole === 'STORE_MANAGER';
  const isSupervisor = isManager || userRole === 'SHIFT_SUPERVISOR' || userRole === 'HEAD_CHEF' || userRole === 'HEAD_BARISTA';

  // Sub Tab Navigation
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'MY_HANDOVER' | 'TEAM_VERIFY' | 'MANAGEMENT' | 'ANALYTICS' | 'EXECUTIVE'
  >(isOwner ? 'EXECUTIVE' : 'DASHBOARD');

  // State
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [metrics, setMetrics] = useState<HandoverDashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<HandoverAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<HandoverFilterParams>({
    date: 'ALL',
    status: 'ALL',
    overallCondition: 'ALL',
  });

  // Modal States
  const [inspectHandover, setInspectHandover] = useState<HandoverRecord | null>(null);
  const [receiveHandover, setReceiveHandover] = useState<HandoverRecord | null>(null);
  const [verifyHandover, setVerifyHandover] = useState<HandoverRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await handoverService.getHandovers(filters);
      const m = await handoverService.getHandoverSummary('TODAY', filters.date || 'ALL');
      const a = await handoverService.getHandoverAnalytics('THIS_WEEK');

      setHandovers(list);
      setMetrics(m);
      setAnalytics(a);
    } catch (e) {
      console.error('[ShiftHandoverHub] Failed to load handover data:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleConfirmReceive = async (handoverId: string, notes?: string) => {
    await handoverService.receiveHandover(
      handoverId,
      currentUser?.id || 'emp-07',
      currentUser?.name || 'Staf Penerima',
      notes
    );
    loadData();
  };

  const handleConfirmVerify = async (handoverId: string, notes?: string) => {
    await handoverService.verifyHandover(
      handoverId,
      currentUser?.id || 'emp-02',
      currentUser?.name || 'Heri Setiawan',
      notes
    );
    loadData();
  };

  const handleRequestRevision = async (handoverId: string, reason: string) => {
    await handoverService.requestHandoverRevision(
      handoverId,
      currentUser?.id || 'emp-02',
      currentUser?.name || 'Heri Setiawan',
      reason
    );
    loadData();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header & Submodule Tab Switcher */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Phase 3.3 — Shift & Handover Management
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            TropicalOS Shift Handover System
          </h2>
          <p className="text-xs text-slate-400">
            Sistem serah terima operasional stasiun, verifikasi tim, dan audit kepatuhan resto
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Muat Ulang Data"
            className="p-2.5 bg-[#0B0F19] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!isOwner && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              + Handover Baru
            </button>
          )}
        </div>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="flex items-center gap-2 bg-[#151B2B] p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
        {!isOwner && (
          <>
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'DASHBOARD'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Dasbor
            </button>

            <button
              onClick={() => setActiveTab('MY_HANDOVER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'MY_HANDOVER'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Serah Terima Saya
            </button>

            {isSupervisor && (
              <button
                onClick={() => setActiveTab('TEAM_VERIFY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'TEAM_VERIFY'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Verifikasi Tim
              </button>
            )}

            {isManager && (
              <button
                onClick={() => setActiveTab('MANAGEMENT')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'MANAGEMENT'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Konsol Manajemen
              </button>
            )}

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ANALYTICS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analitik & Kepatuhan
            </button>
          </>
        )}

        {isOwner && (
          <button
            onClick={() => setActiveTab('EXECUTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap bg-purple-600 text-white shadow-sm`}
          >
            <Building2 className="w-4 h-4" />
            Ringkasan Eksekutif Owner
          </button>
        )}
      </div>

      {/* SUBVIEW RENDERING */}
      {activeTab === 'DASHBOARD' && (
        <HandoverDashboardView
          metrics={metrics}
          handovers={handovers}
          onInspect={(h) => setInspectHandover(h)}
          onReceive={(h) => setReceiveHandover(h)}
          onVerify={(h) => setVerifyHandover(h)}
          onCreateNew={() => setIsCreateOpen(true)}
          canVerify={isSupervisor}
        />
      )}

      {activeTab === 'MY_HANDOVER' && (
        <MyHandoverView
          handovers={handovers}
          currentUserId={currentUser?.id || 'emp-06'}
          currentUserName={currentUser?.name || 'Staf Operasional'}
          onInspect={(h) => setInspectHandover(h)}
          onReceive={(h) => setReceiveHandover(h)}
          onCreateNew={() => setIsCreateOpen(true)}
        />
      )}

      {activeTab === 'TEAM_VERIFY' && (
        <TeamHandoverView
          handovers={handovers}
          onInspect={(h) => setInspectHandover(h)}
          onVerify={(h) => setVerifyHandover(h)}
          onRequestRevision={(h) => setVerifyHandover(h)}
          supervisorName={currentUser?.name || 'Supervisor'}
        />
      )}

      {activeTab === 'MANAGEMENT' && (
        <HandoverManagementView
          handovers={handovers}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters({ date: 'ALL', status: 'ALL', overallCondition: 'ALL' })}
          onInspect={(h) => setInspectHandover(h)}
          onVerify={(h) => setVerifyHandover(h)}
          onCreateNew={() => setIsCreateOpen(true)}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'ANALYTICS' && (
        <HandoverAnalytics analytics={analytics} loading={loading} />
      )}

      {activeTab === 'EXECUTIVE' && (
        <HandoverExecutiveSummary
          metrics={metrics}
          analytics={analytics}
          handovers={handovers}
          onInspect={(h) => setInspectHandover(h)}
        />
      )}

      {/* ALL MODALS */}
      <HandoverDetailModal
        isOpen={!!inspectHandover}
        onClose={() => setInspectHandover(null)}
        handover={inspectHandover}
        onReceive={(h) => setReceiveHandover(h)}
        onVerify={(h) => setVerifyHandover(h)}
        currentUserId={currentUser?.id}
        canReceive={true}
        canVerify={isSupervisor}
      />

      <CreateHandoverModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitSuccess={() => {
          setIsCreateOpen(false);
          loadData();
        }}
        currentUser={currentUser}
      />

      <HandoverReceiveModal
        isOpen={!!receiveHandover}
        onClose={() => setReceiveHandover(null)}
        handover={receiveHandover}
        onConfirmReceive={handleConfirmReceive}
        onRequestRevision={handleRequestRevision}
      />

      <HandoverVerificationModal
        isOpen={!!verifyHandover}
        onClose={() => setVerifyHandover(null)}
        handover={verifyHandover}
        onConfirmVerify={handleConfirmVerify}
        onRequestRevision={handleRequestRevision}
      />
    </div>
  );
};
