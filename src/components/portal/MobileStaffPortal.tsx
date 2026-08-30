import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { MASTER_DIVISION_CHECKLISTS, DivisionChecklistItem } from '../../data/divisionChecklists';
import {
  Clock,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  User,
  Sparkles,
  RefreshCw,
  Building,
  CheckSquare,
  Smartphone,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Signal,
  Bell,
  ArrowLeftRight,
  Sliders,
  Home,
  FileText,
  KeyRound,
  History,
  Crown,
  Monitor,
  Utensils
} from 'lucide-react';

// Sub-components & Modals
import { StaffQuickLauncher } from './components/StaffQuickLauncher';
import { StaffAttendanceTab } from './tabs/StaffAttendanceTab';
import { StaffChecklistTab } from './tabs/StaffChecklistTab';
import { StaffScheduleTab } from './tabs/StaffScheduleTab';
import { StaffReservationsTab } from './tabs/StaffReservationsTab';
import { StaffRequestsTab } from './tabs/StaffRequestsTab';
import { StaffProfileTab } from './tabs/StaffProfileTab';
import { OwnerExecutiveReportTab } from './tabs/OwnerExecutiveReportTab';
import { KitchenBarProductionTab } from './tabs/KitchenBarProductionTab';
import { StaffWastingTab } from './tabs/StaffWastingTab';
import { StaffOperationalIssuesTab } from './tabs/StaffOperationalIssuesTab';
import { CashierReconciliationTab } from './tabs/CashierReconciliationTab';
import { CameraSelfieModal } from './modals/CameraSelfieModal';
import { PayslipDetailModal } from './modals/PayslipDetailModal';
import { PayrollHistoryModal } from './modals/PayrollHistoryModal';
import { UpdatePinModal } from './modals/UpdatePinModal';
import { NewRequestModal } from './modals/NewRequestModal';
import { PwaInstallBanner } from '../common/PwaInstallBanner';

interface MobileStaffPortalProps {
  onSwitchToDesktop?: () => void;
}

export const MobileStaffPortal: React.FC<MobileStaffPortalProps> = ({ onSwitchToDesktop }) => {
  const { currentUser, switchUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'home' | 'attendance' | 'checklist' | 'schedule' | 'reservations' | 'requests' | 'profile' | 'kitchen_bar' | 'wasting' | 'issues' | 'reconciliation'
  >('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  const isOwner = currentUser?.accessLevel === 'OWNER' || currentUser?.primaryPosition === 'Owner';

  // Attendance states
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [shiftDurationSeconds, setShiftDurationSeconds] = useState(15);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Payslip & Payroll Modals
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isPayrollHistoryModalOpen, setIsPayrollHistoryModalOpen] = useState(false);
  const [isUpdatePinModalOpen, setIsUpdatePinModalOpen] = useState(false);

  // New Request modal state
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newRequestDefaultType, setNewRequestDefaultType] = useState<'KASBON' | 'CUTI' | 'SPL' | 'TUKAR_SHIFT'>('KASBON');

  // Master Checklists for all resto divisions
  const [checklists, setChecklists] = useState<DivisionChecklistItem[]>(MASTER_DIVISION_CHECKLISTS);

  // Request histories
  const [requests, setRequests] = useState([
    {
      id: 'REQ-9102',
      type: 'KASBON',
      amount: 400000,
      reason: 'Biaya darurat perbaikan motor',
      status: 'DISETUJUI',
      submittedAt: '20 Agt 2026',
    },
    {
      id: 'REQ-8891',
      type: 'CUTI',
      dates: '05 - 06 Sep 2026',
      reason: 'Acara keluarga di kampung',
      status: 'MENUNGGU_SPV',
      submittedAt: 'Kemarin',
    },
    {
      id: 'REQ-7612',
      type: 'SPL',
      hours: '2 Jam',
      reason: 'Handling event wedding intimate',
      status: 'DISETUJUI',
      submittedAt: '18 Agt 2026',
    },
  ]);

  // Pending approval list for Supervisor (Putri Okta), Manager (Heri Setiawan), Owner (Tri Hermawanto)
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'APPR-01',
      staffName: 'Ulum & Tasnim',
      department: 'Kitchen',
      title: 'Checklist Opening & Suhu Chiller Shift Pagi (2°C)',
      timestamp: '08:15 WIB',
      photos: 2,
      status: 'PENDING',
    },
    {
      id: 'APPR-02',
      staffName: 'Azizah & Dina',
      department: 'Bar',
      title: 'Checklist Kalibrasi Grinder Kopi & Sanitasi Ice Bin',
      timestamp: '08:30 WIB',
      photos: 1,
      status: 'PENDING',
    },
    {
      id: 'APPR-03',
      staffName: 'Vita & Bintang',
      department: 'Service',
      title: 'Checklist Table Setup & Briefing Menu Reservasi 45 Pax',
      timestamp: '08:45 WIB',
      photos: 1,
      status: 'PENDING',
    },
  ]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isClockedIn) {
        setShiftDurationSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isClockedIn]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConfirmClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(
      currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    );
    setIsCameraModalOpen(false);
  };

  const handleClockOut = () => {
    // Check if staff has uncompleted closing checklists in their department
    const staffDept = currentUser?.department;
    const uncompletedClosing = checklists.filter(
      (c) => (!staffDept || c.department.toLowerCase() === staffDept.toLowerCase()) && c.category === 'CLOSING' && !c.isCompleted
    ).length;

    if (uncompletedClosing > 0 && !isOwner) {
      const confirmOut = window.confirm(
        `Perhatian: Masih ada ${uncompletedClosing} checklist Closing di divisi ${staffDept} yang belum selesai. Yakin ingin Clock Out sekarang?`
      );
      if (!confirmOut) return;
    }
    setIsClockedIn(false);
    setClockInTime(null);
    setShiftDurationSeconds(0);
  };

  // Rule: Cannot toggle checklist before clock-in (Owner is exempt)
  const toggleChecklist = (id: string) => {
    if (!isClockedIn && !isOwner) {
      alert('Perhatian: Anda belum melakukan Absen Masuk (Clock-In). Silakan Clock-In terlebih dahulu untuk dapat mencentang checklist SOP stasiun.');
      return;
    }
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );
  };

  const handleAttachPhoto = (id: string, photoData?: any) => {
    if (!isClockedIn && !isOwner) {
      alert('Perhatian: Anda belum melakukan Absen Masuk (Clock-In). Silakan Clock-In terlebih dahulu.');
      return;
    }
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (photoData) {
            return {
              ...c,
              photoAttached: Boolean(photoData.photoUrl || photoData.afterPhotoUrl),
              photoUrl: photoData.photoUrl !== undefined ? photoData.photoUrl : c.photoUrl,
              photoTimestamp: photoData.photoTimestamp !== undefined ? photoData.photoTimestamp : c.photoTimestamp,
              photoUploaderName: photoData.photoUploaderName !== undefined ? photoData.photoUploaderName : c.photoUploaderName,
              afterPhotoUrl: photoData.afterPhotoUrl !== undefined ? photoData.afterPhotoUrl : c.afterPhotoUrl,
              afterPhotoTimestamp: photoData.afterPhotoTimestamp !== undefined ? photoData.afterPhotoTimestamp : c.afterPhotoTimestamp,
              notes: photoData.notes !== undefined ? photoData.notes : c.notes,
              isCompleted: photoData.markCompleted !== undefined ? photoData.markCompleted : true,
            };
          }
          return { ...c, photoAttached: true, isCompleted: true };
        }
        return c;
      })
    );
  };

  const handleOpenNewRequest = (type: 'KASBON' | 'CUTI' | 'SPL' | 'TUKAR_SHIFT' = 'KASBON') => {
    setNewRequestDefaultType(type);
    setIsNewRequestModalOpen(true);
  };

  const handleAddRequest = (newReq: any) => {
    setRequests((prev) => [newReq, ...prev]);
  };

  const handleApproveChecklist = (id: string) => {
    setPendingApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a))
    );
  };

  // Calculate uncompleted tasks for current user's department
  const userDeptChecklists = checklists.filter(
    (c) => isOwner || !currentUser?.department || c.department.toLowerCase() === currentUser.department.toLowerCase()
  );
  const uncompletedDeptTasks = userDeptChecklists.filter((c) => !c.isCompleted).length;

  return (
    <div className="min-h-screen w-full bg-[#070A10] text-gray-100 flex items-center justify-center p-0 select-none">
      {/* Smartphone Device Container */}
      <div
        className="w-full max-w-[430px] min-h-screen sm:h-screen sm:max-h-[950px] bg-[#0F1422] text-gray-100 flex flex-col relative overflow-hidden shadow-2xl"
      >
        {/* Realistic iPhone Dynamic Island & Status Header */}
        <div className="sticky top-0 z-40 bg-[#0F1422]/95 backdrop-blur-md pt-2.5 px-4 pb-2.5 flex flex-col gap-1.5 border-b border-[#1E2538]">
          {/* iOS Status Row */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
            {/* Left: Clock */}
            <span className="font-mono tracking-tight font-bold">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Center: Dynamic Island Pill */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/80 border border-white/10 shadow-inner">
              <span className={`w-2 h-2 rounded-full ${
                isOwner ? 'bg-amber-400' : isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'
              }`}></span>
              <span className="text-[10px] font-mono text-gray-300">
                {isOwner 
                  ? '👑 Mode Eksekutif' 
                  : isClockedIn 
                  ? `Shift: ${formatDuration(shiftDurationSeconds)}` 
                  : 'Tropical Garden Portal'}
              </span>
            </div>

            {/* Right: Signal, Wifi, Battery */}
            <div className="flex items-center gap-1.5 text-gray-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-mono">98%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Brand & Staff Profile Header */}
          <div className="flex items-center justify-between pt-1">
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name}
                  className="w-9 h-9 rounded-2xl object-cover border border-purple-500/50 shadow"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0F1422] ${
                  isOwner ? 'bg-amber-400' : 'bg-emerald-500'
                }`}></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[120px]">
                    {currentUser?.name || 'Staff Resto'}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                    isOwner 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {currentUser?.department || 'Ops'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  {currentUser?.primaryPosition || 'Operational Staff'}
                </div>
              </div>
            </div>

            {/* Quick Switch Employee & Desktop Switcher */}
            <div className="flex items-center gap-1.5">
              {onSwitchToDesktop && (
                <button
                  onClick={onSwitchToDesktop}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#1C2538] hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold transition-all shadow cursor-pointer"
                  title="Beralih ke Tampilan Desktop Backoffice"
                >
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
              )}

              <select
                value={currentUser?.id}
                onChange={(e) => {
                  if (e.target.value) switchUser(e.target.value);
                }}
                className="text-[10px] font-bold bg-[#1A2234] text-purple-200 border border-purple-500/30 rounded-xl px-2 py-1.5 outline-none cursor-pointer max-w-[110px]"
                title="Ganti Profil Karyawan (Semua Divisi Resto)"
              >
                {employeeService.getAllEmployeesSync().map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || emp.fullName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
          {/* PWA Install Banner for Mobile Staff */}
          <PwaInstallBanner className="mb-2" />

          {/* RULE 1 & 3: KHUSUS TAMPILAN MOBILE OWNER: LAPORAN OPERASIONAL & PENDAPATAN HARIAN */}
          {isOwner ? (
            <>
              {(activeTab === 'home' || activeTab === 'attendance' || activeTab === 'checklist' || activeTab === 'requests') && (
                <OwnerExecutiveReportTab
                  currentUser={currentUser}
                  currentTime={currentTime}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              )}

              {activeTab === 'reservations' && (
                <StaffReservationsTab
                  currentUser={currentUser}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              )}

              {activeTab === 'schedule' && (
                <StaffScheduleTab
                  currentUser={currentUser}
                  onOpenSwapShift={() => {}}
                  initialSubTab="shifts"
                />
              )}

              {activeTab === 'profile' && (
                <StaffProfileTab
                  currentUser={currentUser}
                  onOpenPayslip={() => setIsPayslipModalOpen(true)}
                  onOpenPayrollHistory={() => setIsPayrollHistoryModalOpen(true)}
                  onOpenUpdatePin={() => setIsUpdatePinModalOpen(true)}
                />
              )}
            </>
          ) : (
            /* STANDARD STAFF & MANAGEMENT TABS */
            <>
              {activeTab === 'home' && (
                <StaffQuickLauncher
                  currentUser={currentUser}
                  isClockedIn={isClockedIn}
                  onOpenAbsen={() => {
                    if (isClockedIn) {
                      handleClockOut();
                    } else {
                      setIsCameraModalOpen(true);
                    }
                  }}
                  onOpenPayslip={() => setIsPayslipModalOpen(true)}
                  onOpenHistoryGaji={() => setIsPayrollHistoryModalOpen(true)}
                  onOpenUpdatePin={() => setIsUpdatePinModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenReservations={() => setActiveTab('reservations')}
                />
              )}

              {activeTab === 'attendance' && (
                <StaffAttendanceTab
                  currentUser={currentUser}
                  currentTime={currentTime}
                  isClockedIn={isClockedIn}
                  clockInTime={clockInTime}
                  shiftDurationSeconds={shiftDurationSeconds}
                  formatDuration={formatDuration}
                  onOpenClockInModal={() => setIsCameraModalOpen(true)}
                  onClockOut={handleClockOut}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  onOpenNewRequest={handleOpenNewRequest}
                  completedChecklistCount={userDeptChecklists.filter((c) => c.isCompleted).length}
                  totalChecklistCount={userDeptChecklists.length}
                  pendingApprovals={pendingApprovals}
                  onApproveChecklist={handleApproveChecklist}
                />
              )}

              {activeTab === 'checklist' && (
                <StaffChecklistTab
                  currentUser={currentUser}
                  checklists={checklists}
                  isClockedIn={isClockedIn}
                  onToggleChecklist={toggleChecklist}
                  onAttachPhoto={handleAttachPhoto}
                  onOpenClockInModal={() => setIsCameraModalOpen(true)}
                />
              )}

              {activeTab === 'schedule' && (
                <StaffScheduleTab
                  currentUser={currentUser}
                  onOpenSwapShift={() => handleOpenNewRequest('TUKAR_SHIFT')}
                  initialSubTab="shifts"
                />
              )}

              {activeTab === 'reservations' && (
                <StaffReservationsTab
                  currentUser={currentUser}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              )}

              {activeTab === 'requests' && (
                <StaffRequestsTab
                  currentUser={currentUser}
                  requests={requests}
                  onOpenNewRequest={handleOpenNewRequest}
                />
              )}

              {activeTab === 'kitchen_bar' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      ← Kembali ke Beranda
                    </button>
                    <span className="text-[10px] text-gray-400">Modul Kitchen &amp; Bar</span>
                  </div>
                  <KitchenBarProductionTab
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                </div>
              )}

              {activeTab === 'wasting' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      ← Kembali ke Beranda
                    </button>
                    <span className="text-[10px] text-gray-400">Log Wasting 5 Divisi</span>
                  </div>
                  <StaffWastingTab
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      ← Kembali ke Beranda
                    </button>
                    <span className="text-[10px] text-gray-400">Tiket Kendala Lapangan</span>
                  </div>
                  <StaffOperationalIssuesTab
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                </div>
              )}

              {activeTab === 'reconciliation' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      ← Kembali ke Beranda
                    </button>
                    <span className="text-[10px] text-gray-400">Rekonsiliasi Kasir POS</span>
                  </div>
                  <CashierReconciliationTab
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <StaffProfileTab
                  currentUser={currentUser}
                  onOpenPayslip={() => setIsPayslipModalOpen(true)}
                  onOpenPayrollHistory={() => setIsPayrollHistoryModalOpen(true)}
                  onOpenUpdatePin={() => setIsUpdatePinModalOpen(true)}
                />
              )}
            </>
          )}
        </div>

        {/* Modern Mobile Bottom Navigation Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-[#121828]/95 backdrop-blur-lg border-t border-[#232D42] px-1 py-2 flex items-center justify-around z-40">
          {(isOwner
            ? [
                { id: 'home', label: 'Laporan & Omset', icon: DollarSign },
                { id: 'reservations', label: 'Reservasi VIP', icon: Utensils },
                { id: 'schedule', label: 'Roster Staff', icon: Calendar },
                { id: 'profile', label: 'Profil Owner', icon: Crown },
              ]
            : [
                { id: 'home', label: 'Beranda', icon: Home },
                { id: 'attendance', label: 'Presensi', icon: Clock },
                {
                  id: 'checklist',
                  label: 'Checklist',
                  icon: CheckSquare,
                  badge: !isClockedIn ? '🔒' : (uncompletedDeptTasks || undefined),
                },
                { id: 'reservations', label: 'Reservasi', icon: Utensils },
                { id: 'schedule', label: 'Roster', icon: Calendar },
                { id: 'requests', label: 'Pengajuan', icon: DollarSign },
                { id: 'profile', label: 'Profil', icon: User },
              ]
          ).map((tab) => {
            const isActive = isOwner
              ? (tab.id === 'home' && (activeTab === 'home' || activeTab === 'attendance' || activeTab === 'checklist' || activeTab === 'requests')) || activeTab === tab.id
              : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white font-bold scale-105'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {/* Active Indicator Glow Pill */}
                {isActive && (
                  <span className={`absolute -top-1 w-5 h-1 rounded-full ${
                    isOwner
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  }`}></span>
                )}

                <div className="relative">
                  <tab.icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                    isActive
                      ? (isOwner ? 'text-amber-400' : tab.id === 'reservations' ? 'text-cyan-400' : 'text-purple-400')
                      : 'text-gray-400'
                  }`} />
                  {'badge' in tab && tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[12px] h-[14px] rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] sm:text-[9px] mt-0.5 leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* iPhone Home Indicator Swipe Bar */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none z-50">
          <div className="w-28 h-1 rounded-full bg-white/20"></div>
        </div>
      </div>

      {/* Camera Selfie Verification Modal */}
      <CameraSelfieModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSuccess={handleConfirmClockIn}
      />

      {/* E-Slip Gaji (Payslip) Detailed Modal */}
      <PayslipDetailModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        employee={currentUser}
      />

      {/* History & Arsip Gajian Modal */}
      <PayrollHistoryModal
        isOpen={isPayrollHistoryModalOpen}
        onClose={() => setIsPayrollHistoryModalOpen(false)}
        employee={currentUser}
      />

      {/* Update 6-Digit PIN Modal */}
      <UpdatePinModal
        isOpen={isUpdatePinModalOpen}
        onClose={() => setIsUpdatePinModalOpen(false)}
        employee={currentUser}
      />

      {/* New Request Modal (Kasbon, Cuti, SPL, Tukar Shift) */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        employee={currentUser}
        defaultType={newRequestDefaultType}
        onSubmitSuccess={handleAddRequest}
      />
    </div>
  );
};
