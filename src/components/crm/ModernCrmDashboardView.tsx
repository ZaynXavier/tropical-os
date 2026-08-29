import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  Search,
  Plus,
  Bell,
  Mail,
  Grid,
  LogOut,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Clock,
  MoreVertical,
  Paperclip,
  Trash2,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Phone,
  FileText,
  Building
} from 'lucide-react';
import { Lead, Opportunity, Customer } from '../../data/mockCrmData';

interface ModernCrmDashboardViewProps {
  leads?: Lead[];
  opportunities?: Opportunity[];
  customers?: Customer[];
  onNavigateTab?: (tab: string) => void;
  onOpenWhatsApp?: (phone: string, name: string) => void;
}

export const ModernCrmDashboardView: React.FC<ModernCrmDashboardViewProps> = ({
  leads = [],
  opportunities = [],
  customers = [],
  onNavigateTab,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Contracts / Deals Breakdown (Matching Reference Image 1 Donut)
  const contractsData = [
    { name: 'Active', value: 45, color: '#3B82F6' }, // Blue
    { name: 'Draft', value: 15, color: '#9CA3AF' }, // Gray
    { name: 'Pending', value: 27, color: '#F59E0B' }, // Yellow/Orange
    { name: 'Terminated', value: 19, color: '#EF4444' }, // Red
    { name: 'Archived', value: 19, color: '#10B981' }, // Green
  ];

  // 2. Cash Flow / Revenue Line (Matching Reference Image 1 Chart)
  const cashFlowData = [
    { month: 'Jan', value: 32 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 38 },
    { month: 'May', value: 65 },
    { month: 'Jun', value: 92 },
  ];

  // 3. Tasks List (Reference Image 1)
  const tasksList = [
    {
      id: 'task-1',
      title: 'Send Invoice DP Gathering',
      subtitle: 'Re: PT Digital Nusa',
      delay: '2 days delays',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: 'S',
      avatarBg: 'bg-rose-500/20 text-rose-400',
    },
    {
      id: 'task-2',
      title: 'Follow-up Paket Buffet Wedding',
      subtitle: 'Re: Adam Doe & Jessica',
      delay: '1 days delays',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: 'P',
      avatarBg: 'bg-pink-500/20 text-pink-400',
    },
    {
      id: 'task-3',
      title: 'Briefing VIP Table Decoration',
      subtitle: 'Bpk. Hendra Gunawan',
      delay: 'Hari ini, 18:30 WIB',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: 'M',
      avatarBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 'task-4',
      title: 'Kirim Penawaran Corporate Gathering',
      subtitle: 'Bank BCA Regional',
      delay: '2 days left',
      badgeColor: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      icon: 'N',
      avatarBg: 'bg-indigo-500/20 text-indigo-400',
    },
  ];

  // 4. Messages Stream (Reference Image 1)
  const messagesList = [
    {
      id: 'msg-1',
      name: 'Denise Jacobs',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
      snippet: 'Hi! I\'d like to confirm the VIP Gazebo for 15 pax...',
      time: '6 minutes ago',
    },
    {
      id: 'msg-2',
      name: 'Carl Williams',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      snippet: 'Share with you invitation to Birthday Banquet...',
      time: '20 minutes ago',
    },
    {
      id: 'msg-3',
      name: 'Kyle Larson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
      snippet: 'Hi! Please give me a call regarding catering setup',
      time: '2 days ago',
    },
    {
      id: 'msg-4',
      name: 'Evelyn Spencer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      snippet: 'I attached some new files in order...',
      time: '4 days ago',
    },
  ];

  // 5. Top 5 Contracts / Clients (Reference Image 1)
  const topContracts = [
    { name: 'PT Digital Nusa', location: 'Jakarta Pusat', cost: 'Rp 18.500.000', iconBg: 'bg-blue-600', iconText: 'DN' },
    { name: 'Bank Mandiri Regional', location: 'Surabaya', cost: 'Rp 32.100.000', iconBg: 'bg-pink-600', iconText: 'BM' },
    { name: 'PepsiCo Indonesia', location: 'Kawasan Industri', cost: 'Rp 14.800.000', iconBg: 'bg-red-600', iconText: 'PI' },
    { name: 'iVision Creative Agency', location: 'South Hub', cost: 'Rp 22.000.000', iconBg: 'bg-rose-600', iconText: 'IV' },
    { name: 'Elefant Media Corp', location: 'Bali Branch', cost: 'Rp 11.240.000', iconBg: 'bg-emerald-600', iconText: 'EM' },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Top Action Bar matching Reference Image 1 */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="SEARCH RESERVASI, DEALS, CLIENT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab?.('reservation')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + NEW RESERVASI / CONTRACT
          </button>
          <button
            onClick={() => onNavigateTab?.('whatsapp-unified')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp Hub
          </button>
        </div>
      </div>

      {/* Main Grid Section (Matching Reference Image 1 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Contracts Donut + Cash Flow + Tasks + Messages + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Row: Contracts & Cash Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contracts / Deals Donut */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Contracts & Deals</h3>
                <span className="text-xs text-gray-400">Period: Last year</span>
              </div>

              <div className="relative h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contractsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      stroke="#1E2438"
                      strokeWidth={3}
                    >
                      {contractsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-white">25</span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">CONTRACTS</span>
                </div>
              </div>

              {/* Mini Legend */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-300 pt-2 border-t border-[#2D374E]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Active 45%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending 27%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Terminated 19%
                </div>
              </div>
            </div>

            {/* Cash Flow / Pipeline Trend */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Cash Flow & Revenue</h3>
                </div>
                <span className="text-xs text-gray-400">Period: Last 6 months</span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D374E" vertical={false} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#2D374E',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#cashFlowGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-[#2D374E]">
                <span>Total Pipeline Bulan Ini:</span>
                <span className="font-bold text-emerald-400">Rp 124.500.000 (+12%)</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Tasks, Messages, Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasks Card */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Tasks CRM</h4>
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                    8
                  </span>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab?.('follow-up-calendar')}
                  className="text-xs text-purple-400 hover:underline cursor-pointer"
                >
                  Lihat Kalender
                </button>
              </div>

              <div className="space-y-2.5">
                {tasksList.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">{t.title}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${t.badgeColor}`}>
                        {t.delay}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{t.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Card */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Messages</h4>
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab?.('whatsapp')}
                  className="text-xs text-purple-400 hover:underline cursor-pointer"
                >
                  Buka Chat
                </button>
              </div>

              <div className="space-y-2.5">
                {messagesList.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onOpenWhatsApp?.('+62 812-3456-7890', m.name)}
                    className="p-2 rounded-xl bg-[#111827] hover:bg-[#151c2e] border border-[#2D374E] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{m.name}</span>
                        <span className="text-[9px] text-gray-500">{m.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{m.snippet}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Guest Activity</h4>
                <span className="text-xs text-emerald-400 font-bold">+8%</span>
              </div>

              <div className="text-center py-2">
                <span className="text-2xl font-black text-white">10.677</span>
                <p className="text-[11px] text-gray-400">Total Kunjungan Tamu / User</p>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Jam Tersibuk:</span>
                  <span className="font-bold text-purple-400">18:00 - 21:00 WIB</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Area Terfavorit:</span>
                  <span className="font-bold text-blue-400">Gazebo Garden VIP</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Rating Kepuasan:</span>
                  <span className="font-bold text-emerald-400">4.9 / 5.0 ★</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Top 5 Contracts & Quick Links (Reference Image 1) */}
        <div className="space-y-6">
          {/* Top 5 Contracts Card */}
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-300 border-b border-[#2D374E] pb-3">
              TOP 5 CONTRACTS & DEALS
            </h4>

            <div className="space-y-3">
              {topContracts.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#111827] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${c.iconBg} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md`}>
                      {c.iconText}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400">{c.cost}</div>
                    <div className="text-[9px] text-gray-500 uppercase">VALUE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Card (Reference Image 1) */}
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-300 border-b border-[#2D374E] pb-3">
              LINKS & INTEGRATION
            </h4>

            <div className="space-y-2 text-xs">
              <a
                href="#website"
                className="flex items-center justify-between p-2 rounded-xl bg-[#111827] hover:bg-[#151c2e] text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Corporate Website
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </a>

              <a
                href="#drive"
                className="flex items-center justify-between p-2 rounded-xl bg-[#111827] hover:bg-[#151c2e] text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> Proposal & Menu Drive
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </a>

              <a
                href="#whatsapp"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateTab?.('whatsapp');
                }}
                className="flex items-center justify-between p-2 rounded-xl bg-[#111827] hover:bg-[#151c2e] text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Gateway Hub
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
