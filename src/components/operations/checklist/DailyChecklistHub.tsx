/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — DAILY OPERATIONS CHECKLIST UNIFIED HUB
 * Central control hub orchestrating Staff Execution, Supervisor Verification,
 * Operations Compliance Analytics, and Master Template Libraries.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  Activity,
  Layers,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  Users,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Employee } from '../../../types/employee';
import { OFFICIAL_SHIFTS } from '../../../data/mockShifts';
import { operationsChecklistService } from '../../../services/operationsChecklistService';

// Subviews
import { MyStationChecklistView } from './MyStationChecklistView';
import { ChecklistVerificationView } from './ChecklistVerificationView';
import { ChecklistDashboardView } from './ChecklistDashboardView';
import { ChecklistTemplateManagementView } from './ChecklistTemplateManagementView';

interface DailyChecklistHubProps {
  currentEmployee: Employee;
  initialTab?: 'MY_CHECKLIST' | 'VERIFICATION' | 'DASHBOARD' | 'TEMPLATES';
  initialDate?: string;
  initialShiftId?: string;
}

export const DailyChecklistHub: React.FC<DailyChecklistHubProps> = ({
  currentEmployee,
  initialTab = 'MY_CHECKLIST',
  initialDate = new Date().toISOString().split('T')[0],
  initialShiftId = 'shift-pagi',
}) => {
  const [activeTab, setActiveTab] = useState<'MY_CHECKLIST' | 'VERIFICATION' | 'DASHBOARD' | 'TEMPLATES'>(
    initialTab
  );
  const [date, setDate] = useState(initialDate);
  const [shiftId, setShiftId] = useState(initialShiftId);

  // Badge counters
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const [criticalFailCount, setCriticalFailCount] = useState(0);

  const canVerify =
    currentEmployee.accessLevel === 'OWNER' ||
    currentEmployee.accessLevel === 'MANAGER' ||
    currentEmployee.accessLevel === 'SUPERVISOR' ||
    currentEmployee.role === 'Manager' ||
    currentEmployee.role === 'Supervisor';

  const loadBadgeCounts = async () => {
    try {
      const list = await operationsChecklistService.getDailyChecklists({ date, shiftId });
      const pending = list.filter((c) => c.status === 'VERIFICATION_REQUIRED').length;
      const critical = list.reduce((acc, c) => acc + (c.criticalIssueCount || 0), 0);
      setPendingVerificationCount(pending);
      setCriticalFailCount(critical);
    } catch (err) {
      console.error('Error loading badge counts:', err);
    }
  };

  useEffect(() => {
    loadBadgeCounts();
  }, [date, shiftId]);

  const tabs = [
    {
      key: 'MY_CHECKLIST',
      label: 'Checklist Stasiun Saya',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      key: 'VERIFICATION',
      label: 'Verifikasi Supervisor',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: pendingVerificationCount,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      key: 'DASHBOARD',
      label: 'Dashboard & Kepatuhan',
      icon: <Activity className="w-4 h-4" />,
      badge: criticalFailCount > 0 ? `${criticalFailCount} CCP` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      key: 'TEMPLATES',
      label: 'Master Template',
      icon: <Layers className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Hub Bar: Module Header & Global Filters */}
      <div className="bg-[#151B2B] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/30 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                Daily Operations & Station Checklist
              </h2>
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Phase 3.2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Eksekusi tugas stasiun, bukti foto digital, titik kontrol kritis (CCP) & verifikasi supervisor
            </p>
          </div>
        </div>

        {/* Right: Date, Shift & Quick Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden text-xs [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
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
            onClick={loadBadgeCounts}
            title="Segarkan Indikator"
            className="p-2 text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-[#1E2438] border border-white/10 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-[#151B2B] text-slate-400 hover:text-slate-200 hover:bg-[#1E2438] border border-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    tab.badgeColor || 'bg-purple-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Rendering based on Active Tab */}
      <div>
        {activeTab === 'MY_CHECKLIST' && (
          <MyStationChecklistView
            currentEmployee={currentEmployee}
            selectedDate={date}
            selectedShiftId={shiftId}
            onRefreshParent={loadBadgeCounts}
          />
        )}

        {activeTab === 'VERIFICATION' && (
          <ChecklistVerificationView
            currentEmployee={currentEmployee}
            selectedDate={date}
            selectedShiftId={shiftId}
            onRefreshParent={loadBadgeCounts}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <ChecklistDashboardView
            currentEmployee={currentEmployee}
            selectedDate={date}
            selectedShiftId={shiftId}
            onRefreshParent={loadBadgeCounts}
            onNavigateToStaffChecklist={() => setActiveTab('MY_CHECKLIST')}
            onNavigateToVerification={() => setActiveTab('VERIFICATION')}
          />
        )}

        {activeTab === 'TEMPLATES' && (
          <ChecklistTemplateManagementView canManage={canVerify} />
        )}
      </div>
    </div>
  );
};
