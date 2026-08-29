import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { DailyRosterView } from './DailyRosterView';
import { EmployeeRosterMatrix } from './EmployeeRosterMatrix';
import { EmployeeScheduleView } from './EmployeeScheduleView';
import { ShiftDefinitionView } from './ShiftDefinitionView';
import { MyScheduleView } from './MyScheduleView';
import { AssignScheduleModal } from './AssignScheduleModal';
import { BulkScheduleAssignmentModal } from './BulkScheduleAssignmentModal';
import { scheduleService } from '../../services/scheduleService';
import {
  Calendar,
  Clock,
  Users,
  Grid,
  User,
  Info,
  Plus,
  Zap,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';

type ScheduleTab = 'daily' | 'matrix' | 'employee' | 'shifts' | 'my-schedule';

export const ShiftScheduleModuleView: React.FC = () => {
  const { currentUser } = useAuth();

  const userRole = currentUser?.accessLevel || 'STAFF';
  const isStaff = userRole === 'STAFF';
  const isSupervisor = userRole === 'SUPERVISOR';
  const isManagerOrOwner = userRole === 'MANAGER' || userRole === 'OWNER';
  const canManage = isManagerOrOwner || isSupervisor;

  // Resolve current employee profile
  const currentEmployee =
    INITIAL_EMPLOYEES.find(
      (e) =>
        e.id === currentUser?.id ||
        e.fullName.toLowerCase() === currentUser?.fullName?.toLowerCase()
    ) || (isStaff ? INITIAL_EMPLOYEES.find((e) => e.id === 'emp-06') : null);

  // Tab state: Staff defaults to 'my-schedule', management defaults to 'daily'
  const [activeTab, setActiveTab] = useState<ScheduleTab>(
    isStaff ? 'my-schedule' : 'daily'
  );

  // Global action modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetData = async () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mereset seluruh jadwal ke seed default TropicalOS?'
      )
    ) {
      setResetting(true);
      await scheduleService.resetToDefaults();
      setResetting(false);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" key={refreshKey}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Shift & Schedule Management
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Phase 2C.1
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Pusat pengelolaan roster harian, matriks shift mingguan, dan jadwal kerja personel Tropical Garden Resto.
            </p>
          </div>
        </div>

        {/* Global Action Buttons for Management */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tugaskan Jadwal</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Penugasan Massal</span>
            </button>

            {isManagerOrOwner && (
              <button
                onClick={handleResetData}
                disabled={resetting}
                title="Reset jadwal ke konfigurasi default"
                className="p-2.5 rounded-2xl bg-[#111827] hover:bg-gray-800 text-gray-400 hover:text-white border border-[#2D374E] transition-all cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-1.5 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
        {!isStaff && (
          <>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Roster Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Matriks Mingguan</span>
            </button>

            <button
              onClick={() => setActiveTab('employee')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'employee'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Jadwal Per Karyawan</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('my-schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'my-schedule'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Jadwal Saya</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shifts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Master Shift Resmi</span>
        </button>
      </div>

      {/* Sub-Tab View Rendering */}
      {activeTab === 'daily' && !isStaff && <DailyRosterView canManage={canManage} />}
      {activeTab === 'matrix' && !isStaff && <EmployeeRosterMatrix canManage={canManage} />}
      {activeTab === 'employee' && !isStaff && (
        <EmployeeScheduleView canManage={canManage} defaultEmployeeId={currentEmployee?.id} />
      )}
      {activeTab === 'my-schedule' && <MyScheduleView currentEmployee={currentEmployee} />}
      {activeTab === 'shifts' && <ShiftDefinitionView />}

      {/* Global Action Modals */}
      <AssignScheduleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <BulkScheduleAssignmentModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};
