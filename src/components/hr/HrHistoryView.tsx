/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, HrHistoryEntry } from "../../types";
import { HrService } from "../../services/otherServices";
import {
  History,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  DollarSign,
  Coffee,
  CreditCard,
  User as UserIcon,
  Shield,
  Layers
} from "lucide-react";

interface HrHistoryViewProps {
  user: User;
}

export const HrHistoryView: React.FC<HrHistoryViewProps> = ({ user }) => {
  const [historyList, setHistoryList] = useState<HrHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await HrService.getHrHistory();
      setHistoryList(res.data);
      setLoading(false);
    }
    load();
  }, [user]);

  const filteredHistory = historyList.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.actor_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || h.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SALARY":
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case "OVERTIME":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "LEAVE":
        return <Coffee className="w-4 h-4 text-purple-400" />;
      case "DEDUCTION":
        return <CreditCard className="w-4 h-4 text-red-400" />;
      default:
        return <Layers className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/70 via-[#130F30] to-emerald-950/50 border border-teal-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
                Phase 4.1 Audit Trail &amp; Log
              </span>
              <span className="text-xs text-purple-200/60 font-mono">
                Riwayat Transaksi &amp; Perubahan HR
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Log Riwayat Aktivitas HR Resto
            </h1>
            <p className="text-xs text-purple-200/70 max-w-xl">
              Catatan kronologis seluruh aktivitas penyesuaian gaji, persetujuan lembur, pengajuan cuti, dan potongan kasbon.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#130F30]/80 border border-white/10">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs">
          <Search className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Cari aktivitas / nama aktor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-purple-300/40 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-purple-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D0926] border border-white/10 text-xs text-purple-200 focus:outline-none"
          >
            <option value="ALL">Semua Kategori Aktivitas</option>
            <option value="SALARY">Penyesuaian Gaji</option>
            <option value="OVERTIME">Aktivitas Lembur</option>
            <option value="LEAVE">Istirahat &amp; Cuti</option>
            <option value="DEDUCTION">Potongan &amp; Kasbon</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-3xl bg-[#130F30]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 animate-spin text-teal-400" />
            <span>Memuat riwayat HR...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-purple-300/60 text-xs space-y-2">
            <History className="w-8 h-8 mx-auto text-purple-400/50" />
            <p>Belum ada riwayat aktivitas HR yang tercatat.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#0D0926] border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${item.badge_color || "bg-white/5 text-white"}`}>
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-purple-200/70">{item.description}</p>
                    <div className="text-[11px] text-purple-400 font-mono">
                      Pelaku/Penanggung Jawab: <strong className="text-purple-200">{item.actor_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-purple-300/60 font-mono shrink-0">
                  {new Date(item.date).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
