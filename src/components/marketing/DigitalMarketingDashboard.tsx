import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Share2,
  MapPin,
  Star,
  Users,
  Video,
  Eye,
  MousePointerClick,
  Sparkles,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Filter,
  Layers,
  Building
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DigitalMarketingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'promo' | 'gmb' | 'influencers' | 'traffic'>('ads');

  // Ads Data
  const adsData = [
    { platform: 'Meta Ads (IG & FB)', spend: 4500000, reach: 142000, clicks: 4280, leads: 185, roas: 5.4 },
    { platform: 'TikTok Ads', spend: 3200000, reach: 210000, clicks: 6890, leads: 220, roas: 4.8 },
    { platform: 'Google Search & Maps Ads', spend: 1800000, reach: 45000, clicks: 1950, leads: 140, roas: 6.2 },
  ];

  // Performance Trend
  const trendData = [
    { week: 'W1 Aug', adsSpend: 2.1, revenue: 11.2 },
    { week: 'W2 Aug', adsSpend: 2.4, revenue: 13.5 },
    { week: 'W3 Aug', adsSpend: 2.8, revenue: 16.8 },
    { week: 'W4 Aug', adsSpend: 2.2, revenue: 14.1 },
  ];

  // Traffic Source Breakdown
  const trafficData = [
    { name: 'Instagram Organic & Reels', value: 38, color: '#EC4899' },
    { name: 'TikTok Viral Foodies', value: 27, color: '#8B5CF6' },
    { name: 'Google Maps (Local Search)', value: 20, color: '#3B82F6' },
    { name: 'Meta & TikTok Paid Ads', value: 15, color: '#10B981' },
  ];

  // Influencers List
  const [influencers, setInfluencers] = useState([
    {
      id: 'inf-1',
      name: '@kuliner.jatim (Bima)',
      tier: 'Macro (450K)',
      platform: 'TikTok & IG',
      dealType: 'Barter Dining + Fee Rp 1.5M',
      contentStatus: 'POSTED (1.2M Views)',
      estimatedSales: 'Rp 14.800.000',
      rating: '5.0 ★',
    },
    {
      id: 'inf-2',
      name: '@foodiesurabaya (Amanda)',
      tier: 'Micro (85K)',
      platform: 'Instagram Reels',
      dealType: 'Free Dinner VIP 4 Pax',
      contentStatus: 'POSTED (320K Views)',
      estimatedSales: 'Rp 6.200.000',
      rating: '4.8 ★',
    },
    {
      id: 'inf-3',
      name: '@nongkrong.cantik (Clarissa)',
      tier: 'Nano (25K)',
      platform: 'TikTok Video',
      dealType: 'Coffee & Dessert Barter',
      contentStatus: 'SHOOTING SCHEDULED (30 Aug)',
      estimatedSales: 'Estimasi Rp 2.500.000',
      rating: 'Draft',
    },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Dashboard Digital Marketing &amp; Growth
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Manager Only
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Pemantauan Ads Spend, ROAS, Kampanye Promo, Google Maps Local SEO, dan Kolaborasi KOL Influencer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#1E2438] text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ROAS Rata-Rata: 5.4x (High Profit)
            </span>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-4 pt-3 border-t border-[#2D374E] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ads', label: 'Ads Budget & ROAS', icon: DollarSign },
            { id: 'promo', label: 'Promo & Voucher Performance', icon: Target },
            { id: 'gmb', label: 'Google Maps (GMB) Growth', icon: MapPin },
            { id: 'influencers', label: 'KOL & Influencer Hub', icon: Video },
            { id: 'traffic', label: 'Traffic Source Attribution', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ADS BUDGET & ROAS */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Total Ads Spend Bulan Ini</span>
              <div className="text-2xl font-black text-white mt-1">Rp 9.500.000</div>
              <span className="text-[11px] text-gray-400">Budget: Rp 12.000.000</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Total Revenue Attribution</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">Rp 51.300.000</div>
              <span className="text-[11px] text-emerald-300 font-medium">+18% vs Bulan Lalu</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Average ROAS</span>
              <div className="text-2xl font-black text-purple-400 mt-1">5.4x</div>
              <span className="text-[11px] text-purple-300 font-medium">Sangat Menguntungkan</span>
            </div>
            <div className="bg-[#1E2438] border border-[#2D374E] p-4 rounded-2xl">
              <span className="text-xs text-gray-400">Cost Per Lead (CPL)</span>
              <div className="text-2xl font-black text-blue-400 mt-1">Rp 17.400</div>
              <span className="text-[11px] text-blue-300 font-medium">545 Leads Terkumpul</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-pink-400" />
              Performa Kanal Iklan Berbayar
            </h3>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                    <th className="py-3 px-3">Kanal Iklan</th>
                    <th className="py-3 px-3">Total Spend</th>
                    <th className="py-3 px-3">Jangkauan (Reach)</th>
                    <th className="py-3 px-3">Klik Link</th>
                    <th className="py-3 px-3">Leads Reservasi</th>
                    <th className="py-3 px-3 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D374E]">
                  {adsData.map((item) => (
                    <tr key={item.platform} className="hover:bg-[#111827]/50">
                      <td className="py-3 px-3 font-bold text-white">{item.platform}</td>
                      <td className="py-3 px-3 text-gray-300">Rp {item.spend.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-gray-300">{item.reach.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-gray-300">{item.clicks.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-blue-400 font-bold">{item.leads} Leads</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.roas}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROMO & VOUCHER PERFORMANCE */}
      {activeTab === 'promo' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            Tracking Program Diskon &amp; Voucher POS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-emerald-400">VOUCHER TROPICAL-WEEKEND20</span>
              <div className="text-lg font-bold text-white">84x Digunakan</div>
              <p className="text-xs text-gray-400">Diskon 20% Min. Transaksi Rp 300.000</p>
              <div className="text-xs text-purple-400 font-bold">Total Omzet: Rp 28.500.000</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-blue-400">VOUCHER BIRTHDAY-FREE-DESSERT</span>
              <div className="text-lg font-bold text-white">32x Digunakan</div>
              <p className="text-xs text-gray-400">Free Chocolate Lava Cake untuk Ultah</p>
              <div className="text-xs text-purple-400 font-bold">Total Omzet: Rp 14.200.000</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
              <span className="text-xs font-bold text-amber-400">VOUCHER LUNCH-COMBO-15</span>
              <div className="text-lg font-bold text-white">112x Digunakan</div>
              <p className="text-xs text-gray-400">Diskon 15% Jam 11:00 - 14:00 WIB</p>
              <div className="text-xs text-purple-400 font-bold">Total Omzet: Rp 19.800.000</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE MAPS (GMB) GROWTH */}
      {activeTab === 'gmb' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              Google Business Profile (GMB) &amp; Local SEO
            </h3>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
              Verified Location ★ 4.8 / 5.0 (1.420 Ulasan)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
              <span className="text-xs text-gray-400">Permintaan Petunjuk Arah (Directions)</span>
              <div className="text-2xl font-black text-white mt-1">3.480x / bln</div>
              <span className="text-[11px] text-emerald-400 font-medium">+14% Pencarian Organik</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
              <span className="text-xs text-gray-400">Panggilan Telepon (Phone Calls)</span>
              <div className="text-2xl font-black text-blue-400 mt-1">420x / bln</div>
              <span className="text-[11px] text-blue-300 font-medium">Langsung ke Reservasi WhatsApp</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E]">
              <span className="text-xs text-gray-400">Foto Resto Dilihat Tamu</span>
              <div className="text-2xl font-black text-purple-400 mt-1">182.000x</div>
              <span className="text-[11px] text-purple-300 font-medium">Area Gazebo & Sunset Pool Paling Populer</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KOL & INFLUENCER HUB */}
      {activeTab === 'influencers' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-pink-400" />
              Kolaborasi Food Vlogger &amp; KOL Influencer
            </h3>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                  <th className="py-3 px-3">Nama Influencer</th>
                  <th className="py-3 px-3">Kategori Tier</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Skema Kerjasama</th>
                  <th className="py-3 px-3">Status Konten</th>
                  <th className="py-3 px-3 text-right">Dampak Penjualan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]">
                {influencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-[#111827]/50">
                    <td className="py-3 px-3 font-bold text-white">{inf.name}</td>
                    <td className="py-3 px-3 text-gray-300">{inf.tier}</td>
                    <td className="py-3 px-3 text-purple-400 font-medium">{inf.platform}</td>
                    <td className="py-3 px-3 text-gray-300">{inf.dealType}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {inf.contentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {inf.estimatedSales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TRAFFIC SOURCE ATTRIBUTION */}
      {activeTab === 'traffic' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            Distribusi Sumber Akuisisi Pelanggan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    stroke="#1E2438"
                    strokeWidth={3}
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`traffic-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#2D374E',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {trafficData.map((t) => (
                <div key={t.name} className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></span>
                    <span className="text-xs font-bold text-white">{t.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-300">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
