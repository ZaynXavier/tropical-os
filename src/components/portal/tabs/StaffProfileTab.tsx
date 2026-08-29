import React from 'react';
import {
  User,
  QrCode,
  DollarSign,
  Award,
  FileText,
  Building,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  KeyRound,
  History,
  Crown
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface StaffProfileTabProps {
  currentUser: EmployeePersonnel | null;
  onOpenPayslip: () => void;
  onOpenPayrollHistory: () => void;
  onOpenUpdatePin: () => void;
}

export const StaffProfileTab: React.FC<StaffProfileTabProps> = ({
  currentUser,
  onOpenPayslip,
  onOpenPayrollHistory,
  onOpenUpdatePin,
}) => {
  const isOwner = currentUser?.accessLevel === 'OWNER' || currentUser?.primaryPosition === 'Owner';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Digital ID Card with Metallic Hologram Gradient */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#202742] via-[#171D30] to-[#0D1220] border-2 border-purple-500/30 p-5 shadow-2xl space-y-4">
        {/* Hologram Light Wave Effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xs shadow-md">
              {isOwner ? '👑' : 'TG'}
            </div>
            <div>
              <div className="text-[11px] font-black tracking-widest text-white uppercase">TROPICAL GARDEN RESTO</div>
              <div className="text-[9px] text-purple-300 font-mono">
                {isOwner ? 'EXECUTIVE OWNER IDENTITY' : 'STAFF DIGITAL IDENTITY CARD'}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {isOwner ? 'EXECUTIVE' : 'ACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#161C2C]"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{currentUser?.name || 'Staff Karyawan'}</h2>
            <p className="text-xs text-purple-300 font-medium">{currentUser?.primaryPosition || 'Operational Staff'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/10 text-white">
                {currentUser?.employeeNo || currentUser?.employeeCode || 'TG-001'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/20 text-purple-200">
                {currentUser?.department || 'Operasional'}
              </span>
            </div>
          </div>
        </div>

        {/* Barcode & Security Chip */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-gray-300">
          <div className="space-y-0.5">
            <span className="text-gray-400 block text-[9px]">TANGGAL BERGABUNG</span>
            <span className="font-semibold text-white">10 Januari 2025</span>
          </div>
          <div className="text-right flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
            <QrCode className="w-4 h-4 text-purple-300" />
            <span className="font-mono text-[9px] text-purple-200">SCAN ID QR</span>
          </div>
        </div>
      </div>

      {/* KPI & Performance Score Card */}
      <div className="p-4 rounded-2xl bg-[#161C2C] border border-[#2D374E] space-y-3 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {isOwner ? 'Kinerja Keseluruhan Resto' : 'Performa & KPI Bulan Ini'}
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono">98.4 / 100</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-[#0F1420] border border-[#2D374E]">
            <span className="text-[9px] text-gray-400 block">Presensi On-Time</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {isOwner ? '98.5%' : '100%'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#0F1420] border border-[#2D374E]">
            <span className="text-[9px] text-gray-400 block">Checklist SOP</span>
            <span className="font-bold text-purple-300 font-mono text-sm">96%</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0F1420] border border-[#2D374E]">
            <span className="text-[9px] text-gray-400 block">Rating Tamu</span>
            <span className="font-bold text-amber-400 font-mono text-sm">4.9★</span>
          </div>
        </div>
      </div>

      {/* Payroll Quick Section */}
      <div className="space-y-2">
        {/* E-Slip Gaji Terkini */}
        <div
          onClick={onOpenPayslip}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-emerald-500/40 hover:border-emerald-500/70 transition-all cursor-pointer shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">E-Slip Gaji Terkini (Agustus 2026)</div>
              <div className="text-[10px] text-emerald-400 font-medium">Status: Ditransfer ke Rekening BCA ✓</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </div>

        {/* History Gajian */}
        <div
          onClick={onOpenPayrollHistory}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:border-purple-500/60 transition-all cursor-pointer shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">History &amp; Arsip Gajian</div>
              <div className="text-[10px] text-gray-400">Lihat slip gaji bulan-bulan sebelumnya</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Update PIN Presensi */}
        <div
          onClick={onOpenUpdatePin}
          className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] hover:border-blue-500/60 transition-all cursor-pointer shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Update PIN Keamanan</div>
              <div className="text-[10px] text-gray-400">Ganti 6-digit PIN absensi &amp; verifikasi</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Info Card */}
      <div className="p-3 rounded-2xl bg-[#121724] border border-[#2D374E] text-center text-[10px] text-gray-400">
        Tropical Garden Resto HR Mobile App • v2.6.0
      </div>
    </div>
  );
};
