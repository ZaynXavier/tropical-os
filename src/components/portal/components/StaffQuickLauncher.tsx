import React from 'react';
import {
  Fingerprint,
  Smartphone,
  History,
  Lock,
  Camera,
  DollarSign,
  FileText,
  KeyRound,
  CheckSquare,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  Clock,
  ArrowRight,
  Crown,
  Layers,
  Users,
  Utensils,
  PartyPopper,
  ChefHat,
  Coffee,
  Package,
  Trash2,
  AlertTriangle,
  Coins,
  Receipt,
  Sparkle,
  CreditCard
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { MOCK_STAFF_RESERVATIONS } from '../../../data/mockReservations';

interface StaffQuickLauncherProps {
  currentUser: EmployeePersonnel | null;
  isClockedIn: boolean;
  onOpenAbsen: () => void;
  onOpenPayslip: () => void;
  onOpenHistoryGaji: () => void;
  onOpenUpdatePin: () => void;
  onNavigateTab?: (tabId: string) => void;
  onOpenReservations?: () => void;
}

export const StaffQuickLauncher: React.FC<StaffQuickLauncherProps> = ({
  currentUser,
  isClockedIn,
  onOpenAbsen,
  onOpenPayslip,
  onOpenHistoryGaji,
  onOpenUpdatePin,
  onNavigateTab,
  onOpenReservations,
}) => {
  const isOwner = currentUser?.accessLevel === 'OWNER' || currentUser?.primaryPosition === 'Owner';
  const todayReservations = MOCK_STAFF_RESERVATIONS.filter(r => r.date === '2026-08-28');

  // Division checks & Role privileges
  const rawDept = (currentUser?.department || '').toLowerCase();
  const rawPos = (currentUser?.primaryPosition || '').toLowerCase();
  const rawName = (currentUser?.name || currentUser?.fullName || '').toLowerCase();
  const userResponsibilities = (currentUser?.additionalResponsibilities || []).map(r => r.toLowerCase());

  const isKitchenOrBar = rawDept.includes('kit') || rawDept.includes('dapur') || rawDept.includes('bar') || rawPos.includes('cook') || rawPos.includes('barista') || rawPos.includes('chef') || rawPos.includes('supervisor') || rawPos.includes('manager');
  
  // Point 1: Rekonsiliasi Kasir explicitly displayed for Bintang and Vita, plus Cashier, Finance, Supervisor, Manager, & Owner
  const isCashierOrFinance =
    rawDept.includes('kasir') ||
    rawDept.includes('cashier') ||
    rawDept.includes('keuangan') ||
    rawDept.includes('finance') ||
    rawPos.includes('kasir') ||
    rawPos.includes('supervisor') ||
    rawPos.includes('manager') ||
    rawName.includes('bintang') ||
    rawName.includes('vita') ||
    rawName.includes('putri') ||
    userResponsibilities.some(r => r.includes('kasir')) ||
    isOwner;

  const isWastingEligible = isKitchenOrBar || isCashierOrFinance || rawDept.includes('service') || rawDept.includes('waiter') || rawDept.includes('clean') || rawDept.includes('dish') || rawDept.includes('housekeeping');
  const isOperationalIssuesEligible = !isOwner; // All divisions except Owner

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Branded Header Banner */}
      <div className={`relative overflow-hidden rounded-[28px] border p-5 shadow-2xl space-y-3 text-white ${
        isOwner 
          ? 'bg-gradient-to-br from-amber-950 via-purple-950 to-[#0F1322] border-amber-500/40' 
          : 'bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 border-blue-400/40'
      }`}>
        {/* Decorative background glows */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm shadow-md border border-white/30 text-white">
              {isOwner ? '👑' : 'TG'}
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase leading-tight">Tropical Garden Portal</h1>
              <p className="text-[10px] text-blue-200 font-medium">
                {isOwner ? 'Executive Monitoring Hub' : 'Staff & Operations Hub'}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
            {isOwner ? (
              <>
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Bebas Presensi</span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{isClockedIn ? 'Sedang Shift' : 'Siap Kerja'}</span>
              </>
            )}
          </span>
        </div>

        <div className="pt-1 text-xs font-semibold text-blue-100/95 leading-relaxed relative z-10">
          {isOwner 
            ? 'Pengawasan operasional seluruh divisi, shift & reservasi dalam satu genggaman'
            : 'Kemudahan akses seluruh informasi karyawan, SOP & jadwal reservasi stasiun #jadilebihmudah'
          }
        </div>

        {/* User Card Pill */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-xl object-cover border border-white/40"
            />
            <div>
              <div className="font-bold text-white leading-tight">{currentUser?.name}</div>
              <div className="text-[10px] text-blue-200">{currentUser?.department} • {currentUser?.primaryPosition}</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-black/30 px-2 py-0.5 rounded-lg border border-white/10 text-cyan-200">
            {currentUser?.employeeNo || currentUser?.employeeCode || 'TG-001'}
          </span>
        </div>
      </div>

      {/* "Mulai Menggunakan" - 4 Action Tiles */}
      <div className="p-4 rounded-[28px] bg-[#161C2C] border border-[#2D374E] space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Mulai Menggunakan</span>
          </h2>
          <span className="text-[10px] text-gray-400">Pilih menu utama</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 1. Absen or Executive Overview */}
          {isOwner ? (
            <button
              onClick={() => onNavigateTab?.('attendance')}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-[#20182C] to-[#131A29] border border-amber-500/40 hover:border-amber-400 active:scale-[0.97] transition-all text-left group shadow-lg cursor-pointer flex flex-col justify-between h-[105px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-amber-300 font-mono">Owner ✓</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Pantau Shift Staff
                </div>
                <div className="text-[10px] text-gray-400 line-clamp-1">25 Personil Resto</div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAbsen}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E2738] to-[#131A29] border border-blue-500/40 hover:border-blue-400 active:scale-[0.97] transition-all text-left group shadow-lg cursor-pointer flex flex-col justify-between h-[105px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  {isClockedIn ? 'Absen Pulang' : 'Absen (Clock-In)'}
                </div>
                <div className="text-[10px] text-gray-400 line-clamp-1">Selfie &amp; Lokasi GPS</div>
              </div>
            </button>
          )}

          {/* 2. E-Slip Gaji */}
          <button
            onClick={onOpenPayslip}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E2738] to-[#131A29] border border-emerald-500/40 hover:border-emerald-400 active:scale-[0.97] transition-all text-left group shadow-lg cursor-pointer flex flex-col justify-between h-[105px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-emerald-400 font-mono">BCA ✓</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                E-Slip Gaji
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">Rincian &amp; Unduh PDF</div>
            </div>
          </button>

          {/* 3. History Gajian */}
          <button
            onClick={onOpenHistoryGaji}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E2738] to-[#131A29] border border-purple-500/40 hover:border-purple-400 active:scale-[0.97] transition-all text-left group shadow-lg cursor-pointer flex flex-col justify-between h-[105px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-purple-300">4 Bulan</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                History Gajian
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">Riwayat slip bulanan</div>
            </div>
          </button>

          {/* 4. Update PIN */}
          <button
            onClick={onOpenUpdatePin}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E2738] to-[#131A29] border border-amber-500/40 hover:border-amber-400 active:scale-[0.97] transition-all text-left group shadow-lg cursor-pointer flex flex-col justify-between h-[105px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-amber-300">6 Digit</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Update PIN
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">Keamanan absensi</div>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================
          REQUEST 1, 2, 3, 4: DIVISION-AWARE OPERATIONAL MODULE TILES
      ============================================================ */}
      <div className="p-4 rounded-[28px] bg-[#161C2C] border border-[#2D374E] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modul Operasional Divisi</span>
          </h2>
          <span className="text-[10px] text-cyan-300 font-medium">Akses Cepat Staff</span>
        </div>

        <div className="space-y-2">
          {/* 1. KITCHEN & BAR: Recipe, Batching, Purchasing */}
          {isKitchenOrBar && (
            <div
              onClick={() => onNavigateTab?.('kitchen_bar')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17233B] via-[#141C30] to-[#121626] border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Resep, Batching &amp; Purchasing
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Kitchen &amp; Bar
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Buku resep standar, jadwal produksi prep &amp; permintaan belanja PR
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}

          {/* 2. WASTING LOG: Kitchen, Bar, Kasir, Waiter, Dishwash */}
          {isWastingEligible && (
            <div
              onClick={() => onNavigateTab?.('wasting')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1622] via-[#201323] to-[#14101F] border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer shadow flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Log Wasting &amp; Kerusakan Item
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      5 Divisi
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Pencatatan makanan rusak, piring pecah, spillage, void order &amp; chemical
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}

          {/* 3. OPERATIONAL ISSUES: All divisions except Owner */}
          {isOperationalIssuesEligible && (
            <div
              onClick={() => onNavigateTab?.('issues')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2C1C14] via-[#241716] to-[#16121D] border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Kendala &amp; Isu Operasional
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Staf Lapangan
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Lapor kerusakan mesin/alat, komplain tamu &amp; kendala darurat
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}

          {/* 4. CASHIER RECONCILIATION: Kasir, Finance, Management */}
          {isCashierOrFinance && (
            <div
              onClick={() => onNavigateTab?.('reconciliation')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#172B20] via-[#13231A] to-[#0F1B15] border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Rekonsiliasi Kasir &amp; Uang Fisik
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Kasir &amp; SPV
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Hitungan lembaran 100rb s/d koin 100 rupiah saat Opening &amp; Closing
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Highlight Card: Jadwal Reservasi Tamu & VIP Hari Ini */}
      <div
        onClick={() => {
          if (onOpenReservations) {
            onOpenReservations();
          } else {
            onNavigateTab?.('schedule');
          }
        }}
        className="p-4 rounded-[28px] bg-gradient-to-r from-[#17233B] via-[#141C30] to-[#18152B] border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-xl flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Jadwal Reservasi Tamu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                {todayReservations.length} Booking Hari Ini
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              Lihat nomor meja, pre-order dapur &amp; tugas stasiun staff
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold">
          <span className="hidden sm:inline">Buka</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Direct Module Navigations for All Divisions */}
      <div className="space-y-2">
        <div
          onClick={() => onNavigateTab?.('checklist')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:border-purple-500/50 transition-all cursor-pointer shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Daily SOP &amp; Checklist Tugas (Semua Divisi)</div>
              <div className="text-[10px] text-gray-400">
                {isOwner 
                  ? '👑 Akses Penuh: Kitchen, Bar, Service, Kasir, Stewarding, CRM' 
                  : !isClockedIn 
                  ? '🔒 Terkunci (Wajib Clock-In Terlebih Dahulu)' 
                  : 'Siap diisi & upload bukti foto'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div
          onClick={() => onNavigateTab?.('schedule')}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:border-blue-500/50 transition-all cursor-pointer shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Jadwal Shift &amp; Roster Mingguan</div>
              <div className="text-[10px] text-gray-400">Lihat jadwal kerja seluruh divisi &amp; teman shift</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
