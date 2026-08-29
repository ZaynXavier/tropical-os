/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_DASHBOARD_ACTIVITIES, DashboardActivityLog } from "../../data/mockDashboardData";
import {
  Clock,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  User as UserIcon,
  Layers,
  Sparkles,
} from "lucide-react";

interface DashboardActivityProps {
  user: User;
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({ user }) => {
  const [activities, setActivities] = useState<DashboardActivityLog[]>(MOCK_DASHBOARD_ACTIVITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  // New Log State
  const [newAction, setNewAction] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newCategory, setNewCategory] = useState<DashboardActivityLog["category"]>("SHIFT");
  const [newStatus, setNewStatus] = useState<DashboardActivityLog["status"]>("info");

  const filteredLogs = activities.filter((act) => {
    const matchesCategory = selectedCategory === "ALL" || act.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || act.status === selectedStatus;
    const matchesQuery =
      act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesQuery;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction || !newDetails) return;

    const newLog: DashboardActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: `${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
      user: user.name,
      division: user.division,
      category: newCategory,
      action: newAction,
      details: newDetails,
      status: newStatus,
    };

    setActivities([newLog, ...activities]);
    setNewAction("");
    setNewDetails("");
    setIsAddLogOpen(false);
  };

  const getStatusIcon = (status: DashboardActivityLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "alert":
        return <ShieldAlert className="w-4 h-4 text-pink-500" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: DashboardActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "warning":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "alert":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      default:
        return "bg-purple-500/20 text-purple-200 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-400" />
            <span>Aktivitas &amp; Live Log Operasional Resto</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Log aktivitas real-time dari seluruh divisi: Kasir, Dapur, Barista, CRM, Purchasing &amp; Shift Manager.
          </p>
        </div>

        <button
          onClick={() => setIsAddLogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Catatan Log</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            placeholder="Cari aktivitas, nama user, atau rincian log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-300/60 mr-1" />
          {["ALL", "SHIFT", "APPROVAL", "CRM", "INVENTORY", "WASTING", "FINANCE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-600/30 font-black"
                  : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
        <h3 className="font-black text-sm text-white uppercase tracking-wider mb-2">
          Streaming Log Hari Ini ({filteredLogs.length} Entri)
        </h3>

        <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pl-6 pt-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Dot Icon on timeline */}
              <div className="absolute -left-[31px] top-0 p-1.5 rounded-xl bg-[#0D0922] border border-white/20 shadow-md">
                {getStatusIcon(log.status)}
              </div>

              {/* Log Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{log.action}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${getStatusBadge(log.status)}`}>
                      {log.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-300/70 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-xs text-purple-100/90 leading-relaxed">{log.details}</p>

                <div className="flex items-center gap-3 text-[10px] text-purple-300/60 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 font-bold text-purple-200">
                    <UserIcon className="w-3 h-3 text-purple-400" />
                    {log.user}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-purple-300/80">Divisi: {log.division}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-purple-300/60 text-xs">
              Tidak ada log aktivitas yang cocok dengan filter.
            </div>
          )}
        </div>
      </div>

      {/* Add Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Tambah Catatan Log Operasional</h3>
              <button onClick={() => setIsAddLogOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Judul / Tindakan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Bahan Serah Terima Shift Pagi"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white focus:outline-none"
                  >
                    <option value="SHIFT">SHIFT</option>
                    <option value="APPROVAL">APPROVAL</option>
                    <option value="CRM">CRM</option>
                    <option value="INVENTORY">INVENTORY</option>
                    <option value="WASTING">WASTING</option>
                    <option value="FINANCE">FINANCE</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Status Severity</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white focus:outline-none"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Rincian Detail *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan catatan lengkap..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs"
                >
                  Simpan Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
