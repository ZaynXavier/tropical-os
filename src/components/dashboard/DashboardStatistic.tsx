/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User } from "../../types";
import { MOCK_DASHBOARD_STATS } from "../../data/mockDashboardData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Users, Award, Percent } from "lucide-react";

interface DashboardStatisticProps {
  user: User;
}

export const DashboardStatistic: React.FC<DashboardStatisticProps> = () => {
  const { revenueTrend, categoryRevenue, hourlyTraffic, costVsProfit } = MOCK_DASHBOARD_STATS;

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Statistik Operasional &amp; Financial Analytics</span>
        </h2>
        <p className="text-xs text-purple-200/70 mt-0.5">
          Statistik performa penjualan jam sibuk (peak hours), margin profit HPP, dan tren pengunjung Tropical Garden Resto.
        </p>
      </div>

      {/* Top Statistical KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Average Ticket Size</span>
          <div className="text-xl font-black text-white mt-1">Rp 87.600</div>
          <span className="text-[10px] text-emerald-400 font-bold">▲ 5.2% vs Bulan Lalu</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Peak Occupancy Rate</span>
          <div className="text-xl font-black text-white mt-1">98% (18:00 WIB)</div>
          <span className="text-[10px] text-purple-300 font-bold">280 Tamu Garden</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Food &amp; Beverage Cost Ratio</span>
          <div className="text-xl font-black text-emerald-400 mt-1">31.8%</div>
          <span className="text-[10px] text-purple-300/70">Target maks: 35%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Table Turnover Rate</span>
          <div className="text-xl font-black text-white mt-1">3.4x / Shift</div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">28 Meja Garden</span>
        </div>
      </div>

      {/* Chart Row 1: Hourly Sales Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Trend */}
        <div className="lg:col-span-2 bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-base text-white">Tren Penjualan Jam Sibuk (Peak Hours)</h3>
              <p className="text-xs text-purple-200/70">Realisasi omzet per jam dibandingkan target operasional</p>
            </div>
            <span className="text-[10px] font-extrabold px-3 py-1 bg-purple-500/20 text-purple-200 rounded-xl border border-purple-500/30">
              8 AGUSTUS 2026
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#C084FC" }} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#C084FC" }}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#130F30",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "16px",
                    color: "#FFF",
                  }}
                  formatter={(val: any) => `Rp ${Number(val).toLocaleString("id-ID")}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#FFF" }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Realisasi Sales (Rp)"
                  stroke="#A855F7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#A855F7" }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target Omzet (Rp)"
                  stroke="#EC4899"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-2">
          <h3 className="font-extrabold text-base text-white">Komposisi Omzet Per Kategori</h3>
          <p className="text-xs text-purple-200/70 mb-2">Persentase kontribusi produk resto</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="revenue"
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#130F30",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "16px",
                    color: "#FFF",
                  }}
                  formatter={(val: any) => `Rp ${Number(val).toLocaleString("id-ID")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-white/10">
            {categoryRevenue.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-purple-200 text-[11px] font-bold">{item.name}</span>
                </div>
                <span className="font-extrabold text-white text-[11px]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Cost vs Profit Margins */}
      <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-2">
        <h3 className="font-extrabold text-base text-white">Histori Pendapatan, HPP &amp; Net Profit (Juta Rp)</h3>
        <p className="text-xs text-purple-200/70 mb-4">Evaluasi rasio efisiensi biaya bahan baku HPP terhadap laba bersih</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costVsProfit}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#C084FC" }} />
              <YAxis tick={{ fontSize: 11, fill: "#C084FC" }} tickFormatter={(val) => `Rp ${val}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#130F30",
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: "16px",
                  color: "#FFF",
                }}
                formatter={(val: any) => `Rp ${val} Juta`}
              />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#FFF" }} />
              <Bar dataKey="revenue" name="Total Revenue" fill="#A855F7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="hpp" name="HPP / Cost of Goods" fill="#EC4899" radius={[6, 6, 0, 0]} />
              <Bar dataKey="netProfit" name="Net Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
