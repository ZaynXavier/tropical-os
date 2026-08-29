import React from 'react';
import {
  Clock,
  Camera,
  MapPin,
  CheckCircle2,
  Calendar,
  DollarSign,
  UserCheck,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  AlertTriangle,
  Flame,
  Coffee,
  CheckSquare,
  Crown,
  Users,
  Building2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface StaffAttendanceTabProps {
  currentUser: EmployeePersonnel | null;
  currentTime: Date;
  isClockedIn: boolean;
  clockInTime: string | null;
  shiftDurationSeconds: number;
  formatDuration: (sec: number) => string;
  onOpenClockInModal: () => void;
  onClockOut: () => void;
  onNavigateTab?: (tabId: string) => void;
  onOpenNewRequest: (type: 'KASBON' | 'CUTI' | 'SPL' | 'TUKAR_SHIFT') => void;
  completedChecklistCount: number;
  totalChecklistCount: number;
  pendingApprovals: any[];
  onApproveChecklist: (id: string) => void;
}

export const StaffAttendanceTab: React.FC<StaffAttendanceTabProps> = ({
  currentUser,
  currentTime,
  isClockedIn,
  clockInTime,
  shiftDurationSeconds,
  formatDuration,
  onOpenClockInModal,
  onClockOut,
  onNavigateTab,
  onOpenNewRequest,
  completedChecklistCount,
  totalChecklistCount,
  pendingApprovals,
  onApproveChecklist,
}) => {
  const isOwner = currentUser?.accessLevel === 'OWNER' || currentUser?.primaryPosition === 'Owner';
  // Rule 2 & 3: Approval hanya bisa dilakukan oleh Manager & Supervisor (Heri Setiawan & Putri Okta). Owner hanya membaca laporan.
  const isSupervisorOrManager =
    currentUser?.accessLevel === 'MANAGER' ||
    currentUser?.accessLevel === 'SUPERVISOR' ||
    currentUser?.primaryPosition === 'Manager' ||
    currentUser?.primaryPosition === 'Supervisor';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 👑 OWNER EXECUTIVE DASHBOARD CARD (WHEN LOGGED IN AS OWNER) */}
      {isOwner ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241A3A] via-[#1B1A30] to-[#121422] border-2 border-amber-500/50 p-4.5 shadow-2xl space-y-3.5">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-amber-300 tracking-wide uppercase block">
                  Akses Eksekutif Pemilik (Owner)
                </span>
                <span className="text-[10px] text-gray-300">Bebas Absensi • Pengawasan Penuh 25 Personil</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-amber-300 bg-black/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
            </div>
          </div>

          {/* Quick Resto Shift Live Status Grid for Owner */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-[#0F121C]/80 border border-amber-500/20 text-center">
              <div className="text-[9px] text-gray-400 uppercase font-semibold">Staff Hadir</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">19 / 24</div>
              <div className="text-[8px] text-emerald-300/80">Shift Pagi &amp; Siang</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#0F121C]/80 border border-amber-500/20 text-center">
              <div className="text-[9px] text-gray-400 uppercase font-semibold">SOP Divisi</div>
              <div className="text-sm font-black text-purple-400 mt-0.5">92%</div>
              <div className="text-[8px] text-purple-300/80">Opening Selesai</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#0F121C]/80 border border-amber-500/20 text-center">
              <div className="text-[9px] text-gray-400 uppercase font-semibold">Izin / Cuti</div>
              <div className="text-sm font-black text-blue-400 mt-0.5">1 Org</div>
              <div className="text-[8px] text-blue-300/80">Telah Disetujui</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium">Owner tidak perlu Clock-In untuk memeriksa checklist atau menyetujui pengajuan.</span>
            </div>
          </div>
        </div>
      ) : (
        /* REGULAR STAFF ATTENDANCE CARD (WITH LIVE TIMER & CLOCK-IN) */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2337] to-[#121724] border border-[#2D374E] p-4 shadow-xl">
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-purple-600/10 blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isClockedIn ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isClockedIn ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              </span>
              <span className="text-[11px] font-bold tracking-wide uppercase text-gray-300">
                {isClockedIn ? 'Shift Aktif Berjalan' : 'Status: Siap Shift'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-300 bg-[#0F1420] px-2.5 py-1 rounded-full border border-[#2D374E]">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
            </div>
          </div>

          {/* Big Clock-In / Clock-Out Interaction Widget */}
          <div className="mt-4 pt-3 border-t border-[#2D374E]/80">
            {!isClockedIn ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium">Jadwal Shift ({currentUser?.department || 'Resto'}):</div>
                    <div className="font-bold text-white text-sm">Shift Pagi • 08:00 - 16:00 WIB</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Radius GPS:</div>
                    <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Area Resto (8m)
                    </div>
                  </div>
                </div>

                {/* Big Touch-Optimized Primary Clock-In Action Button */}
                <button
                  onClick={onOpenClockInModal}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-white/20"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="font-black text-sm">ABSEN MASUK SEKARANG (CLOCK-IN)</div>
                    <div className="text-[10px] text-blue-100 font-normal">Selfie Wajah + Validasi Radius Resto</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">WAKTU ABSEN MASUK</span>
                    <span className="text-sm font-bold text-white font-mono">{clockInTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">TARGET SELESAI</span>
                    <span className="text-xs text-gray-300 font-mono">16:00 WIB</span>
                  </div>
                </div>

                {/* Running Digital Stop-watch */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-emerald-500/40 text-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
                    DURASI KERJA BERJALAN
                  </span>
                  <div className="text-3xl font-black font-mono text-white tracking-widest drop-shadow-sm">
                    {formatDuration(shiftDurationSeconds)}
                  </div>
                </div>

                {/* Clock-Out Button */}
                <button
                  onClick={onClockOut}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ABSEN PULANG (CLOCK-OUT)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist Progress Quick Widget */}
      <div
        onClick={() => onNavigateTab?.('checklist')}
        className="p-4 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:border-purple-500/50 transition-all cursor-pointer shadow-md flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Daily SOP Checklist ({currentUser?.department || 'Semua Divisi'})</div>
            <div className="text-[10px] text-gray-400">
              {completedChecklistCount} dari {totalChecklistCount} tugas stasiun selesai
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-12 bg-[#0B0F19] h-2 rounded-full overflow-hidden border border-[#2D374E]">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${(completedChecklistCount / Math.max(totalChecklistCount, 1)) * 100}%` }}
            ></div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 4-Grid Quick Staff Actions (Touch App Style) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpenNewRequest('TUKAR_SHIFT')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:bg-[#1E2538] text-left transition-all active:scale-[0.97] cursor-pointer space-y-1.5 shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Tukar Shift</div>
            <div className="text-[10px] text-gray-400 leading-tight">Pengajuan tukar rekan kerja</div>
          </div>
        </button>

        <button
          onClick={() => onOpenNewRequest('KASBON')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:bg-[#1E2538] text-left transition-all active:scale-[0.97] cursor-pointer space-y-1.5 shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Ajukan Kasbon</div>
            <div className="text-[10px] text-gray-400 leading-tight">Pinjaman darurat payroll</div>
          </div>
        </button>

        <button
          onClick={() => onOpenNewRequest('CUTI')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:bg-[#1E2538] text-left transition-all active:scale-[0.97] cursor-pointer space-y-1.5 shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Izin &amp; Cuti</div>
            <div className="text-[10px] text-gray-400 leading-tight">Form sakit, cuti tahunan</div>
          </div>
        </button>

        <button
          onClick={() => onOpenNewRequest('SPL')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:bg-[#1E2538] text-left transition-all active:scale-[0.97] cursor-pointer space-y-1.5 shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Lembur (SPL)</div>
            <div className="text-[10px] text-gray-400 leading-tight">Surat perintah lembur</div>
          </div>
        </button>
      </div>

      {/* SPV & MANAGER APPROVAL HUB (Rule 2: Hanya Manager & Supervisor) */}
      {isSupervisorOrManager && pendingApprovals.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#161C2C] border border-amber-500/40 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Persetujuan SPV &amp; Manager</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300">
              {pendingApprovals.filter(p => p.status === 'PENDING').length} Menunggu
            </span>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((appr) => (
              <div key={appr.id} className="p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{appr.staffName}</span>
                  <span className="text-[10px] text-purple-400 font-mono">{appr.department}</span>
                </div>
                <p className="text-[11px] text-gray-300">{appr.title}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>🕒 {appr.timestamp}</span>
                  <span>📷 {appr.photos} Foto Bukti</span>
                </div>

                {appr.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onApproveChecklist(appr.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      Setujui
                    </button>
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-[11px] font-semibold cursor-pointer">
                      Revisi
                    </button>
                  </div>
                ) : (
                  <div className="py-1 text-center font-bold text-emerald-400 bg-emerald-500/10 rounded-xl text-[11px]">
                    ✓ Telah Disetujui
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Resto Announcement Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pengumuman Resto Hari Ini</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          Terdapat reservasi gathering arisan 45 Pax pada pukul 18:30 WIB di Area Saung Garden. Seluruh tim (Kitchen, Bar, Service, Kasir &amp; Stewarding) mohon bersiap dan koordinasi rapi.
        </p>
      </div>
    </div>
  );
};
