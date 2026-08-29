/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Lead,
  Opportunity,
  Customer,
  Activity,
  Quotation,
} from "../../data/mockCrmData";
import {
  Users,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  PhoneCall,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";
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
} from "recharts";

interface CrmOverviewProps {
  leads?: Lead[];
  opportunities?: Opportunity[];
  customers?: Customer[];
  activities?: Activity[];
  quotations?: Quotation[];
  onNavigateTab?: (tab: string) => void;
  onOpenAddLead?: () => void;
  onOpenAddDeal?: () => void;
}

const COLORS = ["#A855F7", "#6366F1", "#EC4899", "#10B981", "#F59E0B"];

export const CrmOverview: React.FC<CrmOverviewProps> = ({
  leads = [],
  opportunities = [],
  customers = [],
  activities = [],
  quotations = [],
  onNavigateTab,
  onOpenAddLead,
  onOpenAddDeal,
}) => {
  const safeLeads = leads || [];
  const safeOpportunities = opportunities || [];
  const safeCustomers = customers || [];
  const safeActivities = activities || [];
  const safeQuotations = quotations || [];

  const totalLeadCount = safeLeads.length;
  const totalDealValue = safeOpportunities.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const wonDeals = safeOpportunities.filter((o) => o.stage === "Closed Won");
  const wonValue = wonDeals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const conversionRate = totalLeadCount > 0 ? Math.round((wonDeals.length / totalLeadCount) * 100) : 0;

  // Chart data: Monthly pipeline forecast
  const pipelineData = [
    { month: "Mei", Pipeline: 45000000, Won: 30000000 },
    { month: "Jun", Pipeline: 60000000, Won: 42000000 },
    { month: "Jul", Pipeline: 95000000, Won: 65000000 },
    { month: "Agt", Pipeline: totalDealValue, Won: wonValue },
  ];

  // Chart data: Lead source distribution
  const sourceData = [
    { name: "Instagram", value: safeLeads.filter((l) => l.source === "Instagram").length },
    { name: "WhatsApp", value: safeLeads.filter((l) => l.source === "WhatsApp").length },
    { name: "Walk-in", value: safeLeads.filter((l) => l.source === "Walk-in").length },
    { name: "Referral", value: safeLeads.filter((l) => l.source === "Referral").length },
    { name: "Website", value: safeLeads.filter((l) => l.source === "Website").length },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 text-white">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Ringkasan CRM &amp; Pipeline Sales</h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Pantau pergerakan prospek, penawaran harga event, dan jadwal aktivitas follow-up pelanggan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddLead?.()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/30 border border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lead Baru</span>
          </button>
          <button
            onClick={() => onOpenAddDeal?.()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Deal/Peluang</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab?.("leads")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-xl hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-300/70 uppercase tracking-wider">Total Leads Prospek</span>
            <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalLeadCount} Prospek</div>
          <p className="text-[11px] text-purple-200/70 mt-1.5 flex items-center justify-between">
            <span>5 Baru bulan ini</span>
            <span className="text-purple-300 font-bold group-hover:underline flex items-center gap-0.5">
              Lihat <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        <div
          onClick={() => onNavigateTab?.("pipeline")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-xl hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-300/70 uppercase tracking-wider">Total Nilai Pipeline</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            Rp {(totalDealValue / 1000000).toFixed(1)} Juta
          </div>
          <p className="text-[11px] text-purple-200/70 mt-1.5 flex items-center justify-between">
            <span>{safeOpportunities.length} Active Deals</span>
            <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
              Pipeline <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        <div
          onClick={() => onNavigateTab?.("quotations")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-xl hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-300/70 uppercase tracking-wider">Quotation Terkirim</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{safeQuotations.length} Penawaran</div>
          <p className="text-[11px] text-purple-200/70 mt-1.5 flex items-center justify-between">
            <span>Nilai: Rp {(safeQuotations.reduce((a, b) => a + b.grandTotal, 0) / 1000000).toFixed(1)}M</span>
            <span className="text-amber-300 font-bold group-hover:underline flex items-center gap-0.5">
              Review <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        <div
          onClick={() => onNavigateTab?.("customers")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-xl hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-300/70 uppercase tracking-wider">Pelanggan VIP &amp; Corporate</span>
            <div className="p-2.5 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{safeCustomers.length} Klien Terdaftar</div>
          <p className="text-[11px] text-purple-200/70 mt-1.5 flex items-center justify-between">
            <span>Konversi Lead: <strong className="text-white font-bold">{conversionRate}%</strong></span>
            <span className="text-pink-300 font-bold group-hover:underline flex items-center gap-0.5">
              Klien <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Value Chart */}
        <div className="lg:col-span-2 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <div>
              <h3 className="font-bold text-sm text-white">Proyeksi Revenue &amp; Deal Size</h3>
              <p className="text-xs text-purple-200/70">Perbandingan nilai pipeline dengan deal yang sudah Closed Won</p>
            </div>
            <span className="text-[10px] bg-purple-900/40 px-2.5 py-1 rounded-full border border-purple-500/30 font-bold text-purple-200">
              AGUSTUS 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#C084FC" }} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#C084FC" }}
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, ""]}
                  contentStyle={{
                    backgroundColor: "#0D0922",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="Pipeline" fill="#818CF8" radius={[6, 6, 0, 0]} name="Pipeline Deals" />
                <Bar dataKey="Won" fill="#A855F7" radius={[6, 6, 0, 0]} name="Closed Won" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="mb-2 border-b border-white/10 pb-2">
            <h3 className="font-bold text-sm text-white">Sumber Prospek (Lead Sources)</h3>
            <p className="text-xs text-purple-200/70">Saluran masuknya penawaran event</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0922",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            {sourceData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-purple-200">{item.name}</span>
                </div>
                <strong className="text-white">{item.value} Leads</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed & Upcoming Event Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Follow-Up Activities */}
        <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-purple-400" />
              Aktivitas Interaksi Terakhir
            </h3>
            <button
              onClick={() => onNavigateTab?.("activities")}
              className="text-xs text-purple-300 font-bold hover:underline cursor-pointer"
            >
              Semua Activity →
            </button>
          </div>

          <div className="space-y-3">
            {safeActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-900/60 border border-purple-500/30 text-purple-200 font-extrabold text-[10px] rounded uppercase">
                      {act.type}
                    </span>
                    <strong className="text-xs text-white">{act.customerName}</strong>
                  </div>
                  <p className="text-xs font-semibold text-purple-200 mt-1">{act.subject}</p>
                  <p className="text-[10px] text-purple-300/60 mt-0.5">{act.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-purple-300/60 block">{act.time}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${
                      act.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Deals in Pipeline */}
        <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-purple-400" />
              Prioritas Deals Event
            </h3>
            <button
              onClick={() => onNavigateTab?.("pipeline")}
              className="text-xs text-purple-300 font-bold hover:underline cursor-pointer"
            >
              Lihat Pipeline →
            </button>
          </div>

          <div className="space-y-3">
            {safeOpportunities.slice(0, 4).map((opp) => (
              <div
                key={opp.id}
                className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{opp.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-purple-300/60 mt-0.5">
                    <span>{opp.customerName}</span>
                    <span>•</span>
                    <span>{opp.guestCount} Pax</span>
                    <span>•</span>
                    <span className="font-semibold text-purple-300">Stage: {opp.stage}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-white block">
                    Rp {(opp.dealValue / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Probabilitas: {opp.probability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
