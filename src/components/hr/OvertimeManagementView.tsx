import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MyOvertimeView } from './overtime/MyOvertimeView';
import { TeamOvertimeView } from './overtime/TeamOvertimeView';
import { AllOvertimeManagementView } from './overtime/AllOvertimeManagementView';
import { OvertimeExecutiveSummaryView } from './overtime/OvertimeExecutiveSummaryView';
import {
  Clock,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  User,
  Calculator,
} from 'lucide-react';

export const OvertimeManagementView: React.FC = () => {
  const { currentUser } = useAuth();
  const accessLevel = currentUser?.accessLevel || 'STAFF';

  // Multi-tab view for Supervisor, Manager, Owner
  const defaultTab =
    accessLevel === 'OWNER'
      ? 'executive'
      : accessLevel === 'MANAGER'
      ? 'all'
      : accessLevel === 'SUPERVISOR'
      ? 'team'
      : 'my';

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // If user is Staff, render Staff Experience directly
  if (accessLevel === 'STAFF') {
    return <MyOvertimeView />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tab Navigation Bar for Privileged Roles */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-2 flex items-center justify-between overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {accessLevel === 'OWNER' && (
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'executive'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Executive Summary</span>
            </button>
          )}

          {(accessLevel === 'OWNER' || accessLevel === 'MANAGER') && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Lembur Resto</span>
            </button>
          )}

          {(accessLevel === 'OWNER' || accessLevel === 'MANAGER' || accessLevel === 'SUPERVISOR') && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lembur Tim / Divisi</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Lembur Pribadi (Self-Service)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 text-[11px] text-gray-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Role: <strong className="text-white">{currentUser?.role || accessLevel}</strong></span>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'executive' && <OvertimeExecutiveSummaryView />}
      {activeTab === 'all' && <AllOvertimeManagementView />}
      {activeTab === 'team' && <TeamOvertimeView />}
      {activeTab === 'my' && <MyOvertimeView />}
    </div>
  );
};
