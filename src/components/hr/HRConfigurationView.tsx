import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hrConfigurationService } from '../../services/hrConfigurationService';
import {
  HRConfiguration,
  ShiftConfiguration,
  AttendanceConfiguration,
  LocationConfiguration,
  BreakConfiguration,
  OvertimeConfiguration,
} from '../../types/hrConfiguration';
import { ShiftConfigurationView } from './configuration/ShiftConfigurationView';
import { AttendanceConfigurationView } from './configuration/AttendanceConfigurationView';
import { LocationConfigurationView } from './configuration/LocationConfigurationView';
import { BreakConfigurationView } from './configuration/BreakConfigurationView';
import { OvertimeConfigurationView } from './configuration/OvertimeConfigurationView';
import { PayrollRulesSummaryView } from './configuration/PayrollRulesSummaryView';
import {
  Settings,
  Clock,
  UserCheck,
  MapPin,
  Coffee,
  DollarSign,
  FileText,
  RotateCcw,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type ConfigTab = 'shifts' | 'attendance' | 'location' | 'breaks' | 'overtime' | 'payroll';

export const HRConfigurationView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ConfigTab>('shifts');
  const [config, setConfig] = useState<HRConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RBAC Access Evaluation
  // Manager: Full Access (Can Edit)
  // Owner: Read-Only
  // Supervisor: Read-Only
  // Staff: No Access
  const canEdit = user?.accessLevel === 'MANAGER';
  const isReadOnly = user?.accessLevel === 'OWNER' || user?.accessLevel === 'SUPERVISOR';
  const hasAccess = canEdit || isReadOnly;

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await hrConfigurationService.getConfiguration();
      setConfig(data);
    } catch (err) {
      console.error('[HRConfigurationView] Failed to load configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handler: Update Shift
  const handleUpdateShift = async (id: string, data: Partial<ShiftConfiguration>) => {
    if (!canEdit) return;
    await hrConfigurationService.updateShift(id, data);
    await loadConfiguration();
    showToast('Master Shift berhasil diperbarui.');
  };

  // Handler: Toggle Shift Status (Soft-disable)
  const handleToggleShiftStatus = async (id: string) => {
    if (!canEdit) return;
    await hrConfigurationService.toggleShiftStatus(id);
    await loadConfiguration();
    showToast('Status aktif shift berhasil diubah.');
  };

  // Handler: Create Shift
  const handleCreateShift = async (
    data: Omit<ShiftConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'scheduledDurationMinutes'>
  ) => {
    if (!canEdit) return;
    await hrConfigurationService.createShift(data);
    await loadConfiguration();
    showToast('Shift baru berhasil ditambahkan.');
  };

  // Handler: Save Attendance Config
  const handleSaveAttendance = async (data: Partial<AttendanceConfiguration>) => {
    if (!canEdit) return;
    await hrConfigurationService.updateAttendanceConfiguration(data);
    await loadConfiguration();
    showToast('Pengaturan presensi & toleransi berhasil disimpan.');
  };

  // Handler: Save Location Config
  const handleSaveLocation = async (data: Partial<LocationConfiguration>) => {
    if (!canEdit) return;
    await hrConfigurationService.updateLocationConfiguration(data);
    await loadConfiguration();
    showToast('Pengaturan geofence lokasi berhasil disimpan.');
  };

  // Handler: Save Break Config
  const handleSaveBreak = async (data: Partial<BreakConfiguration>) => {
    if (!canEdit) return;
    await hrConfigurationService.updateBreakConfiguration(data);
    await loadConfiguration();
    showToast('Pengaturan kuota istirahat berhasil disimpan.');
  };

  // Handler: Save Overtime Config
  const handleSaveOvertime = async (data: Partial<OvertimeConfiguration>) => {
    if (!canEdit) return;
    await hrConfigurationService.updateOvertimeConfiguration(data);
    await loadConfiguration();
    showToast('Pengaturan simulasi lembur berhasil disimpan.');
  };

  // Handler: Reset to Defaults
  const handleResetToDefaults = async () => {
    if (!canEdit) return;
    await hrConfigurationService.resetToDefaults();
    await loadConfiguration();
    setShowResetModal(false);
    showToast('Semua pengaturan HR telah di-reset ke nilai default pabrik.');
  };

  // Access Denied screen for Staff
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-[#151928] rounded-2xl border border-gray-800">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Akses Ditolak</h3>
        <p className="text-sm text-gray-400 max-w-md">
          Modul Pengaturan & Konfigurasi HR hanya dapat diakses oleh General Manager, Supervisor, dan Owner.
        </p>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const activeShiftsCount = config.shifts.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6" id="hr-configuration-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1A2035] border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1E2438] to-[#171B2D] p-6 rounded-2xl border border-[#2D374E] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">HR Configuration & Policy Settings</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pusat kendali master data Shift, Presensi, Geofence Resto, Istirahat, dan Simulasi Lembur (Phase 2C.5)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isReadOnly && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl">
              <Shield className="w-3.5 h-3.5" />
              Mode Lihat Saja ({user?.accessLevel})
            </span>
          )}

          {canEdit && (
            <button
              onClick={() => setShowResetModal(true)}
              id="btn-reset-hr-defaults"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-xl border border-gray-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#1A2035] p-3.5 rounded-xl border border-[#2D374E] flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400">Master Shift Aktif</div>
            <div className="text-xs font-bold text-white">{activeShiftsCount} Shift</div>
          </div>
        </div>

        <div className="bg-[#1A2035] p-3.5 rounded-xl border border-[#2D374E] flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400">Grace Period</div>
            <div className="text-xs font-bold text-amber-400">{config.attendance.gracePeriodMinutes} Menit</div>
          </div>
        </div>

        <div className="bg-[#1A2035] p-3.5 rounded-xl border border-[#2D374E] flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400">Radius GPS Resto</div>
            <div className="text-xs font-bold text-blue-300">{config.location.radiusMeters} Meter</div>
          </div>
        </div>

        <div className="bg-[#1A2035] p-3.5 rounded-xl border border-[#2D374E] flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400">Tarif Potongan/Jam</div>
            <div className="text-xs font-bold text-rose-400 font-mono">
              Rp {(config.attendance?.lateDeductionHourlyRate ?? 10000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-[#1A2035] p-3.5 rounded-xl border border-[#2D374E] flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400">Simulasi Lembur/Jam</div>
            <div className="text-xs font-bold text-indigo-400 font-mono">
              Rp {(config.overtime?.hourlyRate ?? 10000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#151928] rounded-xl border border-[#2D374E] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('shifts')}
          id="tab-hr-shifts"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'shifts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <Clock className="w-4 h-4" />
          1. Master Shifts
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          id="tab-hr-attendance"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          2. Presensi & Toleransi
        </button>

        <button
          onClick={() => setActiveTab('location')}
          id="tab-hr-location"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'location'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          3. Lokasi & GPS Geofence
        </button>

        <button
          onClick={() => setActiveTab('breaks')}
          id="tab-hr-breaks"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'breaks'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <Coffee className="w-4 h-4" />
          4. Istirahat & Overbreak
        </button>

        <button
          onClick={() => setActiveTab('overtime')}
          id="tab-hr-overtime"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overtime'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <Clock className="w-4 h-4" />
          5. Lembur (Overtime)
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          id="tab-hr-payroll"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
          }`}
        >
          <FileText className="w-4 h-4" />
          6. Kontrak Payroll
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'shifts' && (
          <ShiftConfigurationView
            shifts={config.shifts}
            onUpdateShift={handleUpdateShift}
            onToggleStatus={handleToggleShiftStatus}
            onCreateShift={handleCreateShift}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceConfigurationView
            config={config.attendance}
            onSave={handleSaveAttendance}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'location' && (
          <LocationConfigurationView
            config={config.location}
            onSave={handleSaveLocation}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'breaks' && (
          <BreakConfigurationView
            config={config.breaks}
            onSave={handleSaveBreak}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'overtime' && (
          <OvertimeConfigurationView
            config={config.overtime}
            onSave={handleSaveOvertime}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'payroll' && <PayrollRulesSummaryView config={config} />}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1A2035] border border-[#2D374E] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-white">Konfirmasi Reset Pengaturan HR</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh Master Shifts, toleransi presensi, tarif potongan keterlambatan,
              koordinat GPS resto, serta kuota istirahat ke konfigurasi default.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ya, Reset ke Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
