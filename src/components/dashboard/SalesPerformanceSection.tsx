import React, { useState } from 'react';
import { SalesPerformanceData } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Truck,
  Coffee,
  Clock,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface SalesPerformanceSectionProps {
  data: SalesPerformanceData;
}

export const SalesPerformanceSection: React.FC<SalesPerformanceSectionProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');

  const formatRp = (val?: number | null) => {
    const num = val ?? 0;
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}Jt`;
    }
    return `Rp ${(num ?? 0).toLocaleString('id-ID')}`;
  };

  const channelIcons: Record<string, React.ReactNode> = {
    'Dine In': <Coffee className="w-4 h-4 text-purple-400" />,
    'Delivery (GoFood/Grab/Shopee)': <Truck className="w-4 h-4 text-pink-400" />,
    'Take Away': <ShoppingBag className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Dimensi 1
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Performa Penjualan &amp; Revenue Stream</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Analisis tren omzet, pencapaian target harian/jam, channel delivery vs dine-in, dan kontribusi shift.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#2D374E] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Tren Harian
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hourly'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Distribusi Jam (Hourly Peak)
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-gray-300">
            {activeTab === 'daily'
              ? 'Grafik Penjualan Aktual vs Target Penjualan Harian'
              : 'Distribusi Volume Penjualan & Transaksi per Jam Buka (10:00 - 22:00 WIB)'}
          </span>
          <span className="text-[11px] text-purple-300 font-mono">Satuan: Rupiah (Jt)</span>
        </div>

        <div className="h-72 w-full bg-[#111827]/60 rounded-xl p-3 border border-[#2D374E]/80">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'daily' ? (
              <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D374E" opacity={0.5} />
                <XAxis
                  dataKey="dayName"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickMargin={6}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${((v ?? 0) / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2438',
                    borderColor: '#2D374E',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [
                    `Rp ${Number(value).toLocaleString('id-ID')}`,
                    name === 'actualSales' ? 'Penjualan Aktual' : 'Target Harian',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === 'actualSales' ? 'Penjualan Aktual' : 'Target Penjualan'
                  }
                />
                <Area
                  type="monotone"
                  dataKey="targetSales"
                  stroke="#EC4899"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#targetSalesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="actualSales"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualSalesGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data.hourlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D374E" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${((v ?? 0) / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2438',
                    borderColor: '#2D374E',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [
                    `Rp ${Number(value).toLocaleString('id-ID')}`,
                    'Penjualan',
                  ]}
                />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Sales Channels Breakdown & Shift Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Channel Breakdown */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-2">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span>Kontribusi Channel Penjualan</span>
            </h3>
            <span className="text-[11px] text-purple-300 font-mono">3 Channel</span>
          </div>

          <div className="space-y-3">
            {data.channelBreakdown.map((ch) => (
              <div key={ch.channel} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200 flex items-center gap-2">
                    {channelIcons[ch.channel]}
                    {ch.channel}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-100">{formatRp(ch.revenue)}</span>
                    <span className="text-purple-300 ml-1.5 font-bold">({(ch.percentage ?? 0).toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#1E2438] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${ch.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                  <span>{(ch.transactions ?? 0).toLocaleString('id-ID')} Transaksi</span>
                  <span>Avg Check: Rp {(ch.averageCheck ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Shift Contribution */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-2">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              <span>Kontribusi Shift Operasional</span>
            </h3>
            <span className="text-[11px] text-pink-300 font-mono">Pagi vs Siang/Malam</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.shiftBreakdown.map((shift) => (
              <div
                key={shift.shift}
                className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-2"
              >
                <div className="text-xs font-bold text-gray-200">{shift.shift}</div>
                <div className="text-lg font-black text-gray-100">{formatRp(shift.revenue)}</div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Share Omzet:</span>
                  <strong className="text-purple-300 font-bold">{(shift.percentage ?? 0).toFixed(1)}%</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Tamu Terlayani:</span>
                  <span className="text-gray-200">{(shift.guestCount ?? 0).toLocaleString('id-ID')} Pax</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Kecepatan Saji:</span>
                  <span className="text-emerald-400 font-bold">{shift.avgPrepTimeMinutes} Menit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Insights: "Kenapa Sales Turun / Fluktuatif?" */}
      {data.diagnosticInsights && data.diagnosticInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Performa Penjualan &amp; Solusi (Rule-Based Insights)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.title}
                category={insight.category}
                description={insight.description}
                impactRp={insight.impactRp}
                suggestedAction={insight.suggestedAction}
                confidenceScore={insight.confidenceScore}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
