/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_SHIFT_LOGS, ShiftLog } from "../../data/mockOperationsData";
import {
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sun,
  CloudRain,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";

interface FloorShiftLogsProps {
  user: User;
}

export const FloorShiftLogs: React.FC<FloorShiftLogsProps> = ({ user }) => {
  const [logs, setLogs] = useState<ShiftLog[]>(MOCK_SHIFT_LOGS);
  const [filterShift, setFilterShift] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Shift Log Form State
  const [newShiftType, setNewShiftType] = useState<ShiftLog["shiftType"]>("Shift Pagi");
  const [newWeather, setNewWeather] = useState<ShiftLog["weather"]>("Cerah");
  const [newActiveTables, setNewActiveTables] = useState<number>(28);
  const [newTotalGuests, setNewTotalGuests] = useState<number>(180);
  const [newNotes, setNewNotes] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesShift = filterShift === "ALL" || log.shiftType === filterShift;
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesQuery =
      !searchLower ||
      (log.supervisor || '').toLowerCase().includes(searchLower) ||
      (log.handoverNotes || '').toLowerCase().includes(searchLower);
    return matchesShift && matchesQuery;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes) return;

    const newEntry: ShiftLog = {
      id: `shift-${Date.now()}`,
      shiftType: newShiftType,
      date: new Date().toLocaleDateString("id-ID"),
      supervisor: user.name,
      division: user.division,
      weather: newWeather,
      activeTables: newActiveTables,
      totalGuests: newTotalGuests,
      handoverNotes: newNotes,
      status: "In Progress",
    };

    setLogs([newEntry, ...logs]);
    setIsAddOpen(false);
    setNewNotes("");
  };

  const getStatusBadge = (status: ShiftLog["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "In Progress":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Floor &amp; Shift Operations Handover Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan kondisi operasional harian, kapasitas tamu garden &amp; catatan serah terima antar shift.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Shift Handover Log</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Shift Today</span>
          <div className="text-2xl font-black text-white mt-1">Mid Shift</div>
          <span className="text-[10px] text-emerald-400 font-bold">12:00 - 20:00 WIB</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Guest Count</span>
          <div className="text-2xl font-black text-white mt-1">360 Tamu</div>
          <span className="text-[10px] text-purple-300 font-bold">Garden &amp; Indoor AC</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Occupied Tables</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">32 / 35 Meja</div>
          <span className="text-[10px] text-emerald-400 font-bold">91.4% Capacity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Cuaca Operational</span>
          <div className="text-2xl font-black text-amber-300 mt-1 flex items-center gap-1.5">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Cerah</span>
          </div>
          <span className="text-[10px] text-slate-400">Ideal Outdoor Seating</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama supervisor atau rincian catatan shift..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {["ALL", "Shift Pagi", "Shift Siang", "Shift Full Day"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterShift(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer text-xs ${
                filterShift === st
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-[#0B0F19] text-slate-300 border border-white/10 hover:bg-[#1E2438] hover:text-white"
              }`}
            >
              {st === "ALL" ? "Semua Shift" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[10px] tracking-wider uppercase">
                  {log.shiftType} SHIFT
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${getStatusBadge(log.status)}`}>
                  {log.status}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-mono font-bold">{log.date}</div>
                <h3 className="text-sm font-bold text-white mt-0.5">{log.supervisor}</h3>
                <span className="text-[10px] text-slate-400">Divisi {log.division}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#0B0F19] p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] text-slate-400 block">TERPAKAI:</span>
                  <strong className="text-white text-xs">{log.activeTables} Meja</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">TOTAL TAMU:</span>
                  <strong className="text-white text-xs">{log.totalGuests} Pax</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-300 block uppercase mb-1">
                  Catatan Handover:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-[#0B0F19] p-3 rounded-xl border border-white/5">
                  {log.handoverNotes}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Cuaca: {log.weather}
              </span>
              <span className="font-mono text-slate-400">Ref: {log.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Shift Log Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Buat Catatan Handover Shift Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tipe Shift</label>
                  <select
                    value={newShiftType}
                    onChange={(e) => setNewShiftType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Shift Pagi">Shift Pagi (08:00 - 16:00)</option>
                    <option value="Shift Siang">Shift Siang (15:00 - 23:00)</option>
                    <option value="Shift Full Day">Shift Full Day (08:00 - 23:00)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Kondisi Cuaca</label>
                  <select
                    value={newWeather}
                    onChange={(e) => setNewWeather(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Cerah">Cerah</option>
                    <option value="Hujan Gerimis">Hujan Gerimis</option>
                    <option value="Hujan Lebat">Hujan Lebat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Jumlah Meja Terisi</label>
                  <input
                    type="number"
                    value={newActiveTables}
                    onChange={(e) => setNewActiveTables(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Total Tamu (Pax)</label>
                  <input
                    type="number"
                    value={newTotalGuests}
                    onChange={(e) => setNewTotalGuests(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Rincian Handover / Catatan Shift *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan kondisi resto, stok bar/dapur, kendala atau catatan penting..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  Simpan Handover Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
