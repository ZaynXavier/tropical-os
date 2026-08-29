/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_WASTING_LOGS, WastingLogItem } from "../../data/mockOperationsData";
import {
  Trash2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

interface WastingLogViewProps {
  user: User;
}

export const WastingLogView: React.FC<WastingLogViewProps> = ({ user }) => {
  const [logs, setLogs] = useState<WastingLogItem[]>(MOCK_WASTING_LOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Wasting Form State
  const [newItemName, setNewItemName] = useState("");
  const [newCategory, setNewCategory] = useState<WastingLogItem["category"]>("Bahan Dapur");
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnit, setNewUnit] = useState<WastingLogItem["unit"]>("Kg");
  const [newReason, setNewReason] = useState<WastingLogItem["reason"]>("Salah Masak/Human Error");
  const [newCostPerUnit, setNewCostPerUnit] = useState<number>(50000);

  const filteredLogs = logs.filter((log) => {
    const matchesCat = selectedCategory === "ALL" || log.category === selectedCategory;
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesQuery =
      !searchLower ||
      (log.itemName || '').toLowerCase().includes(searchLower) ||
      (log.itemCode || '').toLowerCase().includes(searchLower) ||
      (log.reportedBy || '').toLowerCase().includes(searchLower);
    return matchesCat && matchesQuery;
  });

  const handleAddWasting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const totalCost = newQuantity * newCostPerUnit;
    const newEntry: WastingLogItem = {
      id: `w-${Date.now()}`,
      date: new Date().toLocaleDateString("id-ID"),
      time: `${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
      itemCode: `WST-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: newItemName,
      category: newCategory,
      quantity: newQuantity,
      unit: newUnit,
      reason: newReason,
      costPerUnit: newCostPerUnit,
      totalCost,
      reportedBy: user.name,
      division: user.division,
      status: "Approved",
    };

    setLogs([newEntry, ...logs]);
    setIsAddOpen(false);
    setNewItemName("");
  };

  const totalLoss = logs.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-pink-400" />
            <span>Wasting Log &amp; Food Loss Tracking</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan kerugian bahan makanan/minuman terbuang akibat kedaluwarsa, human error cooking, tumpah &amp; plate waste.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Input Item Wasting Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Kerugian Wasting</span>
          <div className="text-2xl font-black text-pink-400 mt-1">
            Rp {(totalLoss ?? 0).toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-pink-300 font-bold">4 Kasus Terlaporkan</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Wasting Ratio HPP</span>
          <div className="text-2xl font-black text-amber-400 mt-1">0.82%</div>
          <span className="text-[10px] text-emerald-400 font-bold">Dibawah Batas Toleransi 1.5%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Kategori Terbesar</span>
          <div className="text-2xl font-black text-white mt-1">Bahan Dapur</div>
          <span className="text-[10px] text-slate-400">Wagyu &amp; Daging Olahan</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Penyebab Dominan</span>
          <div className="text-2xl font-black text-amber-300 mt-1">Human Error</div>
          <span className="text-[10px] text-slate-400">Salah Masak / Overcook</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama bahan, kode SKU, atau pelapor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {["ALL", "Bahan Dapur", "Bahan Bar", "Makanan Jadi", "Buah & Sayur"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer text-xs ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-[#0B0F19] text-slate-300 border border-white/10 hover:bg-[#1E2438] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wasting Logs Table */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="bg-[#111827] border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-4">Tanggal &amp; Waktu</th>
                <th className="p-4">Kode &amp; Nama Bahan</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Jumlah Terbuang</th>
                <th className="p-4">Alasan Pembuangan</th>
                <th className="p-4">Estimasi Kerugian (Rp)</th>
                <th className="p-4">Pelapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-[#1E2438]/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{item.date}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                  </td>
                  <td className="p-4">
                    <strong className="text-white block text-sm">{item.itemName}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{item.itemCode}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{item.category}</td>
                  <td className="p-4 font-mono font-bold text-white">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {item.reason}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-pink-400 font-mono text-sm">
                    Rp {(item.totalCost ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <strong className="text-white block">{item.reportedBy}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{item.division}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Wasting Log Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Input Laporan Wasting Bahan</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWasting} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nama Item / Bahan Terbuang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fresh Milk Pasteurized 1L"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Bahan Dapur">Bahan Dapur</option>
                    <option value="Bahan Bar">Bahan Bar</option>
                    <option value="Makanan Jadi">Makanan Jadi</option>
                    <option value="Buah & Sayur">Buah & Sayur</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Alasan Pembuangan</label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Salah Masak/Human Error">Salah Masak / Human Error</option>
                    <option value="Rusak/Kedaluwarsa">Rusak / Kedaluwarsa</option>
                    <option value="Spillage / Tumpah">Spillage / Tumpah</option>
                    <option value="Sisa Piring (Plate Waste)">Sisa Piring (Plate Waste)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Satuan</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Pack">Pack</option>
                    <option value="Porti">Porti</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Harga/Satuan (Rp)</label>
                  <input
                    type="number"
                    value={newCostPerUnit}
                    onChange={(e) => setNewCostPerUnit(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0B0F19] rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Total Estimasi Kerugian:</span>
                <span className="font-black text-pink-400 text-sm">
                  Rp {(newQuantity * newCostPerUnit).toLocaleString("id-ID")}
                </span>
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
                  Simpan Laporan Wasting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
