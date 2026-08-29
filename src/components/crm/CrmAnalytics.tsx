/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Lead, Opportunity, Customer } from "../../data/mockCrmData";
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
} from "recharts";
import { TrendingUp, Award, Users, DollarSign, Calendar } from "lucide-react";

interface CrmAnalyticsProps {
  leads: Lead[];
  opportunities: Opportunity[];
  customers: Customer[];
}

const COLORS = ["#A855F7", "#6366F1", "#EC4899", "#10B981", "#F59E0B"];

export const CrmAnalytics: React.FC<CrmAnalyticsProps> = ({
  leads,
  opportunities,
  customers,
}) => {
  // Funnel data
  const funnelData = [
    { stage: "Total Lead Prospek", count: leads.length, fill: "#A855F7" },
    { stage: "Qualified Lead", count: leads.filter((l) => l.status === "Qualified").length, fill: "#6366F1" },
    { stage: "Active Pipeline", count: opportunities.length, fill: "#EC4899" },
    { stage: "Closed Won Deal", count: opportunities.filter((o) => o.stage === "Closed Won").length, fill: "#10B981" },
  ];

  // Event category breakdown
  const categoryData = [
    { name: "Wedding", value: 78000000 },
    { name: "Corporate", value: 35000000 },
    { name: "Birthday", value: 15500000 },
    { name: "Catering", value: 22000000 },
    { name: "VIP Table", value: 18000000 },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <h2 className="text-xl font-black text-white tracking-tight">CRM Analytics &amp; Sales Performance</h2>
        <p className="text-xs text-purple-200/70 mt-0.5">
          Analisis konversi lead acara, tren pendapatan berdasarkan jenis event, dan performa tim sales CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel Chart */}
        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-2">
          <h3 className="font-extrabold text-base text-white">Funnel Konversi Event</h3>
          <p className="text-xs text-purple-200/70 mb-4">Progres perjalanan lead dari prospek awal hingga Closed Won</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#C084FC" }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "#FFFFFF" }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#130F30",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "16px",
                    color: "#FFF",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Category Revenue Distribution */}
        <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-2">
          <h3 className="font-extrabold text-base text-white">Pendapatan Per Kategori Event</h3>
          <p className="text-xs text-purple-200/70 mb-4">Kontribusi nilai deal wedding, corporate gathering, dan catering</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        </div>
      </div>
    </div>
  );
};
