import React, { useState, useEffect } from 'react';
import { OvertimeSummary, DepartmentOvertimeMetric } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import { OvertimeSummaryCard } from './OvertimeSummaryCard';
import {
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  Building,
  AlertTriangle,
  Award,
  CheckCircle2,
  PieChart,
  BarChart3,
  Calendar,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const OvertimeExecutiveSummaryView: React.FC = () => {
  const [summary, setSummary] = useState<OvertimeSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await overtimeService.getOvertimeSummary();
      setSummary(sum);
    } catch (err) {
      console.error('Error loading executive summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Executive Overtime Summary & Cost Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Executive / Owner View
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ringkasan strategis utilisasi jam lembur karyawan, dampak beban payroll, dan audit efisiensi roster operasional
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-[#111622] hover:bg-[#252D42] text-gray-300 rounded-xl border border-[#2D374E] transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <OvertimeSummaryCard summary={summary} loading={loading} />

      {/* Strategic Insights & Compliance Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1E2438] to-[#151A2B] rounded-2xl border border-[#2D374E] p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Analisis Tren & Distribusi Divisi
            </h2>
            <span className="text-xs text-gray-400 font-medium">Bulan Berjalan (Agustus 2026)</span>
          </div>

          {/* Department Breakdown Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400">
                  <th className="py-2.5 px-3">Divisi</th>
                  <th className="py-2.5 px-3">Total SPL</th>
                  <th className="py-2.5 px-3">Jam Disetujui</th>
                  <th className="py-2.5 px-3">Jam Berlebih (Excess)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
                {summary?.departmentBreakdown.map((dept) => (
                  <tr key={dept.department} className="hover:bg-[#111622]/40">
                    <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-purple-400" />
                      {dept.department}
                    </td>
                    <td className="py-2.5 px-3">{dept.totalRequests} pengajuan</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{dept.approvedHours} Jam</td>
                    <td className="py-2.5 px-3">
                      {dept.excessHours > 0 ? (
                        <span className="text-rose-400 font-semibold">+{dept.excessHours} Jam</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">0 Jam (Tepat)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {formatRupiah(dept.finalCost || dept.estimatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Compliance & Budget Control Card */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Audit & Kepatuhan Lembur</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#111622] rounded-xl border border-[#2D374E]">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>Tingkat Kepatuhan Regulasi:</span>
                  <span className="text-emerald-400 font-bold">96.8%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Tidak ada staf yang melebihi batas maksimal 4 jam lembur per hari tanpa dispensasi.
                </p>
              </div>

              <div className="p-3 bg-[#111622] rounded-xl border border-[#2D374E]">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>Rasio Cuti Pengganti:</span>
                  <span className="text-purple-300 font-bold">12.5%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Staf memilih opsi kompensasi hari libur ekstra untuk efisiensi beban kas payroll.
                </p>
              </div>

              <div className="p-3 bg-[#111622] rounded-xl border border-[#2D374E]">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>Kontribusi Biaya Lembur:</span>
                  <span className="text-indigo-300 font-bold">~3.2%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Dari total estimasi beban gaji bulanan resto (Dalam batas sehat &lt; 5%).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2D374E] text-[11px] text-gray-400 italic">
            * Data tersinkronisasi otomatis dengan modul Payroll & Schedule.
          </div>
        </div>
      </div>

      {/* Monthly Trend & Reasons Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Trend Progression */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Tren Biaya Lembur 4 Bulan Terakhir
          </h2>
          <div className="space-y-2.5 pt-2">
            {summary?.monthlyTrend.map((m) => (
              <div key={m.month} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-medium">{m.month}</span>
                  <span className="text-white font-bold">
                    {formatRupiah(m.cost)} ({m.hours} Jam)
                  </span>
                </div>
                <div className="h-2 w-full bg-[#111622] rounded-full overflow-hidden border border-[#2D374E]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (m.cost / 2000000) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason Distribution */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" /> Kategori Alasan Kebutuhan Lembur
          </h2>
          <div className="space-y-2 pt-2 text-xs">
            {summary?.reasonBreakdown.slice(0, 5).map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#111622] rounded-xl border border-[#2D374E] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <span className="text-gray-200 truncate" title={r.reason}>
                    {r.reason}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-300">{r.hours} Jam</span>
                  <span className="text-[10px] text-gray-500 block">({r.count}x kejadian)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
