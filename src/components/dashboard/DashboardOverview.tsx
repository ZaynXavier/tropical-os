/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { User } from "../../types";
import {
  TrendingUp,
  Target,
  Users,
  AlertTriangle,
  ShoppingBag,
  Percent,
  UserPlus,
  UserCheck,
  Award,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

interface DashboardOverviewProps {
  user: User;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ user }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 9 KPI Cards Grid matching requested user layout */}
      
      {/* Row 1: Revenue & Targets (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. REVENUE HARI INI */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              REVENUE HARI INI
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">Rp 0</div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-[10px]">
              Laporan Terakhir (-)
            </span>
            <span className="text-purple-300/60 font-medium">vs target: 0.0%</span>
          </div>
        </div>

        {/* 2. REVENUE BULANAN */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              REVENUE BULANAN
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">Rp 0</div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 font-extrabold text-[10px]">
              Bulan Ini
            </span>
            <span className="text-purple-300/60 font-medium">Ach: 0.0%</span>
          </div>
        </div>

        {/* 3. TARGET OPERASIONAL */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              TARGET OPERASIONAL
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-purple-200/80 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-purple-300/70 font-medium">Target Harian:</span>
              <strong className="text-white font-black text-sm">Rp 10.000.000</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300/70 font-medium">Target Bulanan:</span>
              <strong className="text-white font-black text-sm">Rp 300.000.000</strong>
            </div>
          </div>
        </div>

        {/* 4. PROGRESS TARGET */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              PROGRESS TARGET
            </span>
            <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              0.0% Hari
            </span>
          </div>
          <div className="space-y-2 text-xs text-purple-200/80 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-purple-300/60 font-medium text-[11px]">Harian</span>
              <span className="text-white font-bold text-[11px]">Rp 0 / Rp 10.000.000</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: "0%" }} />
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-purple-300/60 font-medium text-[11px]">Bulanan</span>
              <span className="text-white font-bold text-[11px]">0.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Customer & Performance Metrics (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 5. MARGIN KEUNTUNGAN */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              MARGIN KEUNTUNGAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              68.5%
              <span className="text-xs font-bold text-emerald-400">(Gross)</span>
            </div>
          </div>
          <div className="space-y-0.5 text-[10px] text-purple-300/60 pt-1 border-t border-white/5">
            <div className="flex justify-between">
              <span>Profit Hari Ini:</span>
              <strong className="text-white">Rp 0</strong>
            </div>
            <div className="flex justify-between">
              <span>Profit Bln Ini:</span>
              <strong className="text-white">Rp 0</strong>
            </div>
          </div>
        </div>

        {/* 6. CUSTOMER BARU */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              CUSTOMER BARU
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">2 Member</div>
          </div>
          <p className="text-[10px] text-purple-300/60 font-medium leading-tight">
            Ditambahkan ke database loyalitas
          </p>
        </div>

        {/* 7. REPEAT CUSTOMER */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              REPEAT CUSTOMER
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">0 Kunjungan</div>
          </div>
          <p className="text-[10px] text-purple-300/60 font-medium leading-tight">
            Pelanggan setia check-in kembali hari ini
          </p>
        </div>

        {/* 8. TOTAL KARYAWAN */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              TOTAL KARYAWAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">0 Orang</div>
          </div>
          <p className="text-[10px] text-purple-300/60 font-medium leading-tight">
            Aktif terdaftar di roster &amp; payroll
          </p>
        </div>

        {/* 9. KPI RATA-RATA */}
        <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl text-white flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300/70 uppercase tracking-wider">
              KPI RATA-RATA
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">92.4%</div>
          </div>
          <p className="text-[10px] text-purple-300/60 font-medium leading-tight">
            Skor evaluasi standar pelayanan outlet
          </p>
        </div>
      </div>

      {/* Operational Snapshots / Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          to="/crm"
          className="p-5 rounded-3xl bg-[#130F30]/80 border border-white/10 hover:border-purple-500/50 text-white flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-extrabold text-sm">CRM &amp; Lead Management</h4>
            <p className="text-xs text-purple-300/60 mt-0.5">Kelola prospek acara &amp; booking event</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/purchasing"
          className="p-5 rounded-3xl bg-[#130F30]/80 border border-white/10 hover:border-purple-500/50 text-white flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-extrabold text-sm">Inventory &amp; Purchasing PO</h4>
            <p className="text-xs text-purple-300/60 mt-0.5">Pantau stok &amp; pengadaan bahan baku</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/operations"
          className="p-5 rounded-3xl bg-[#130F30]/80 border border-white/10 hover:border-purple-500/50 text-white flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-extrabold text-sm">Shift Operations &amp; Checklists</h4>
            <p className="text-xs text-purple-300/60 mt-0.5">Pantau checklist opening &amp; closing</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

