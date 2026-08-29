/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User } from "../../types";
import { Download, FileSpreadsheet, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

interface HrReportsViewProps {
  user: User;
}

export const HrReportsView: React.FC<HrReportsViewProps> = ({ user }) => {
  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Laporan Analitik &amp; Laporan SDM Bulanan</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Unduh rekap data HR komprehensif: laporan turnover rate, rasio biaya payroll terhadap omset resto, presensi shift, &amp; distribusi nilai KPI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Laporan Rekapitulasi Presensi &amp; Lembur</span>
          </h3>
          <p className="text-xs text-purple-200/80">
            Export rekap total jam kerja, jam lembur, serta angka keterlambatan dan cuti per divisi periode Agustus 2026.
          </p>
          <button
            onClick={() => alert("Mengunduh Rekap Presensi Agustus 2026 (Format Excel)...")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Export Rekap Presensi (Excel)</span>
          </button>
        </div>

        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <span>Laporan Cost Payroll vs Gross Revenue Resto</span>
          </h3>
          <p className="text-xs text-purple-200/80">
            Analisis persentase biaya beban gaji karyawan dibanding pendapatan kotor resto (Standard benchmark resto: 18-22%).
          </p>
          <button
            onClick={() => alert("Mengunduh Analisis Payroll Cost Ratio (PDF)...")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Export Payroll Cost Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
