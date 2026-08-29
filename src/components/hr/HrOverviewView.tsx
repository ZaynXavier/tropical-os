/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User } from "../../types";
import {
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE,
  MOCK_PAYROLL,
  MOCK_LEAVE_REQUESTS,
  MOCK_ANNOUNCEMENTS,
} from "../../data/mockHrData";
import {
  Users,
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface HrOverviewViewProps {
  user: User;
  onNavigateTab?: (tab: string) => void;
}

export const HrOverviewView: React.FC<HrOverviewViewProps> = ({ user, onNavigateTab }) => {
  const totalEmployees = MOCK_EMPLOYEES.length;
  const activeCount = MOCK_EMPLOYEES.filter((e) => e.active).length;

  const totalPayroll = MOCK_PAYROLL.reduce((acc, curr) => acc + curr.netSalary, 0);
  const pendingLeaves = MOCK_LEAVE_REQUESTS.filter((l) => l.status === "Pending").length;

  const kitchenCount = MOCK_EMPLOYEES.filter((e) => e.division === "Kitchen").length;
  const serviceCount = MOCK_EMPLOYEES.filter((e) => e.division === "Service").length;
  const barCount = MOCK_EMPLOYEES.filter((e) => e.division === "Bar").length;
  const adminCount = MOCK_EMPLOYEES.filter((e) => e.division === "Finance & HR").length;

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E1248] via-[#130F30] to-[#200A3B] p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Human Capital &amp; Operations Command</span>
          </div>
          <h2 className="text-2xl font-black text-white">Ringkasan Eksekutif Sumber Daya Manusia</h2>
          <p className="text-xs text-purple-200/70 mt-1 max-w-2xl">
            Sistem manajemen terpadu karyawan Tropical Garden Resto Canggu: pemantauan headcount, biaya payroll, perizinan cuti, hingga evaluasi performa operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab?.("db")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>Direktori Staf</span>
          </button>
          <button
            onClick={() => onNavigateTab?.("payroll")}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>Proses Payroll</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab?.("db")}
          className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider">Total Headcount Staf</span>
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white group-hover:text-purple-300 transition-colors">
            {totalEmployees} Karyawan
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{activeCount} Aktif Bekerja (100%)</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.("payroll")}
          className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider">Estimasi Payroll Bulanan</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono group-hover:text-emerald-300 transition-colors">
            Rp {(totalPayroll ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-purple-300 font-bold">
            Termasuk Tunjangan &amp; Lembur
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.("approval")}
          className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider">Persetujuan Pending</span>
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300 group-hover:text-amber-200 transition-colors">
            {pendingLeaves} Permohonan
          </div>
          <div className="text-[10px] text-amber-400/80 font-bold">
            Cuti, Lembur &amp; Kasbon
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.("attendance")}
          className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider">Kehadiran Shift Hari Ini</span>
            <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-pink-300 group-hover:text-pink-200 transition-colors">
            100% Hadir
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">
            0 Shift Alpha / Tanpa Kabar
          </div>
        </div>
      </div>

      {/* Middle Layout: Division Distribution & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division Breakdown */}
        <div className="lg:col-span-2 bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Distribusi Karyawan Per Divisi</span>
            </h3>
            <button
              onClick={() => onNavigateTab?.("db")}
              className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase">Kitchen / Dapur</span>
              <div className="text-2xl font-black text-white">{kitchenCount} Staf</div>
              <p className="text-[10px] text-purple-300">Executive Chef &amp; Commis</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-pink-300 uppercase">Floor Service</span>
              <div className="text-2xl font-black text-white">{serviceCount} Staf</div>
              <p className="text-[10px] text-purple-300">Supervisor &amp; Waitstaff</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-300 uppercase">Bar &amp; Beverage</span>
              <div className="text-2xl font-black text-white">{barCount} Staf</div>
              <p className="text-[10px] text-purple-300">Mixologist &amp; Barista</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">Finance &amp; HR</span>
              <div className="text-2xl font-black text-white">{adminCount} Staf</div>
              <p className="text-[10px] text-purple-300">Accounting &amp; Admin</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-purple-200/80 uppercase tracking-wider block">
              Pintasan Menu Utama HR
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab?.("ess")}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left font-bold text-purple-200 hover:text-white transition-all cursor-pointer"
              >
                Self-Service (ESS)
              </button>
              <button
                onClick={() => onNavigateTab?.("kpi")}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left font-bold text-purple-200 hover:text-white transition-all cursor-pointer"
              >
                KPI &amp; Evaluasi Staf
              </button>
              <button
                onClick={() => onNavigateTab?.("incentive_policies")}
                className="p-3 bg-indigo-950/20 hover:bg-indigo-900/30 border border-indigo-900/40 rounded-2xl text-left font-bold text-indigo-200 hover:text-indigo-100 transition-all cursor-pointer"
              >
                Kebijakan Insentif
              </button>
              <button
                onClick={() => onNavigateTab?.("pip")}
                className="p-3 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 rounded-2xl text-left font-bold text-rose-200 hover:text-rose-100 transition-all cursor-pointer"
              >
                Program PIP &amp; Pelatihan
              </button>
              <button
                onClick={() => onNavigateTab?.("assets")}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left font-bold text-purple-200 hover:text-white transition-all cursor-pointer"
              >
                Aset &amp; Seragam Resto
              </button>
              <button
                onClick={() => onNavigateTab?.("helpdesk")}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left font-bold text-purple-200 hover:text-white transition-all cursor-pointer"
              >
                Help Desk &amp; Tiket HR
              </button>
            </div>
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>Pengumuman Internal</span>
              </h3>
              <button
                onClick={() => onNavigateTab?.("comm")}
                className="text-[10px] font-bold text-amber-300 hover:underline cursor-pointer"
              >
                Lihat Board
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_ANNOUNCEMENTS.map((anc) => (
                <div key={anc.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-300 text-[10px] uppercase">{anc.category}</span>
                    <span className="text-[9px] text-purple-300 font-mono">{anc.date}</span>
                  </div>
                  <h4 className="font-extrabold text-white">{anc.title}</h4>
                  <p className="text-[11px] text-purple-200/80 line-clamp-2">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab?.("comm")}
            className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-2xl text-xs font-bold text-purple-200 transition-all cursor-pointer"
          >
            Buka Papan Komunikasi Resto
          </button>
        </div>
      </div>
    </div>
  );
};
