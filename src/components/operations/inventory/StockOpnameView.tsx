/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK OPNAME VIEW
 * Multi-stage Stock Opname counting, discrepancy review, and auto-posting workflow.
 */

import React, { useState, useEffect } from 'react';
import { StockOpname, StockOpnameLine, StockOpnameStatus } from '../../../types/stockOpname';
import { stockOpnameService } from '../../../services/stockOpnameService';
import {
  ClipboardCheck,
  Plus,
  Play,
  FileCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface StockOpnameViewProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  onRefreshInventory: () => void;
}

export const StockOpnameView: React.FC<StockOpnameViewProps> = ({
  currentUser,
  onRefreshInventory,
}) => {
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [activeOpname, setActiveOpname] = useState<StockOpname | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Opname Form
  const [opnameLocation, setOpnameLocation] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [opnameNotes, setOpnameNotes] = useState('');

  // Editing Line items physical count
  const [editingCounts, setEditingCounts] = useState<{ [lineId: string]: number }>({});

  const loadOpnames = async () => {
    const list = await stockOpnameService.getStockOpnames();
    setOpnames(list);
    if (activeOpname) {
      const refreshed = await stockOpnameService.getStockOpnameById(activeOpname.id);
      if (refreshed) setActiveOpname(refreshed);
    }
  };

  useEffect(() => {
    loadOpnames();
  }, []);

  // Start new Opname creation
  const handleCreateOpname = async (e: React.FormEvent) => {
    e.preventDefault();

    const newOpname = await stockOpnameService.createStockOpname({
      location: opnameLocation,
      categoryFilter: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      notes: opnameNotes,
      actorId: currentUser.id,
      actorName: currentUser.name,
    });

    setShowCreateModal(false);
    setOpnameNotes('');
    await loadOpnames();
    setActiveOpname(newOpname);
  };

  // Save Physical Counts & Submit for Review
  const handlePhysicalCountChange = (lineId: string, value: number) => {
    setEditingCounts((prev) => ({ ...prev, [lineId]: Math.max(0, value) }));
  };

  const handleSaveAndSubmit = async () => {
    if (!activeOpname) return;

    // Build updated lines with physical counts
    const updatedLines: StockOpnameLine[] = activeOpname.lines.map((line) => {
      const phys = editingCounts[line.id] !== undefined ? editingCounts[line.id] : line.physicalQty;
      const varQty = phys - line.systemQty;
      const varVal = varQty * line.unitCost;
      return {
        ...line,
        physicalQty: phys,
        varianceQty: varQty,
        varianceValue: varVal,
      };
    });

    await stockOpnameService.updateOpnameLines(activeOpname.id, updatedLines);

    const submitForReview = confirm('Simpan hasil perhitungan stok fisikal dan kirim untuk peninjauan (Review Manager)?');
    if (submitForReview) {
      const reviewed = await stockOpnameService.submitStockOpname(
        activeOpname.id,
        currentUser.id,
        currentUser.name
      );
      if (reviewed) setActiveOpname(reviewed);
    }

    await loadOpnames();
  };

  // Approve & Post Opname Adjustments
  const handleApproveAndPost = async () => {
    if (!activeOpname) return;

    const confirmed = confirm(
      'Apakah Anda yakin menyetujui hasil Opname ini? Sistem akan secara otomatis memposting penyesuaian stok ke Master Inventaris dan Ledger.'
    );
    if (!confirmed) return;

    await stockOpnameService.approveStockOpname(
      activeOpname.id,
      currentUser.id,
      currentUser.name
    );

    const posted = await stockOpnameService.postStockOpname(
      activeOpname.id,
      currentUser.id,
      currentUser.name
    );

    if (posted) {
      alert('Opname berhasil disetujui & diposting! Stok fisikal telah diperbarui.');
      setActiveOpname(posted);
      onRefreshInventory();
      await loadOpnames();
    }
  };

  const getStatusBadge = (status: StockOpnameStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30 text-xs font-semibold">
            Draft
          </span>
        );
      case 'COUNTING':
        return (
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold animate-pulse">
            Proses Perhitungan
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            Peninjauan Manager
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold">
            Disetujui
          </span>
        );
      case 'POSTED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            Selesai &amp; Diposting
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <span>Manajemen Stock Opname Fisikal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Siklus penghitungan stok berkala, evaluasi selisih (variance), dan sinkronisasi penyesuaian otomatis.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Sesi Opname Baru</span>
        </button>
      </div>

      {/* Main Grid: Left List of Sessions, Right Active Session Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Opname Sessions List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Daftar Sesi Stock Opname
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {opnames.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Belum ada sesi Opname yang dibuat.
                </div>
              ) : (
                opnames.map((op) => {
                  const isSelected = activeOpname?.id === op.id;

                  return (
                    <div
                      key={op.id}
                      onClick={() => {
                        setActiveOpname(op);
                        const counts: { [lineId: string]: number } = {};
                        op.lines.forEach((l) => {
                          counts[l.id] = l.physicalQty;
                        });
                        setEditingCounts(counts);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-500/10'
                          : 'bg-[#1E2438] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.2 rounded">
                            {op.opnameNumber}
                          </span>
                          <h4 className="font-bold text-white text-xs mt-1">{op.location}</h4>
                        </div>
                        {getStatusBadge(op.status)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>{op.lines.length} Item Barang</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          Acc: {op.accuracyPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Session Workspace */}
        <div className="lg:col-span-8">
          {!activeOpname ? (
            <div className="bg-[#151B2B] p-12 rounded-2xl border border-white/10 text-center text-slate-400 space-y-3">
              <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Pilih Sesi Opname di Samping atau Buat Baru</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Anda dapat memulai sesi perhitungan stok fisikal, memasukkan kuantitas riil, dan menyetujui selisih stok.
              </p>
            </div>
          ) : (
            <div className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 space-y-5">
              {/* Opname Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {activeOpname.opnameNumber}
                    </span>
                    {getStatusBadge(activeOpname.status)}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">Area: {activeOpname.location}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dibuat oleh <span className="text-slate-200 font-semibold">{activeOpname.countedByName}</span> pada{' '}
                    {activeOpname.date}
                  </p>
                </div>

                {/* Session Lifecycle Buttons */}
                <div className="flex items-center gap-2">
                  {activeOpname.status === 'COUNTING' && (
                    <button
                      onClick={handleSaveAndSubmit}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-amber-600/20"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Simpan &amp; Kirim Review</span>
                    </button>
                  )}

                  {(activeOpname.status === 'REVIEW' || activeOpname.status === 'APPROVED') &&
                    activeOpname.status !== 'POSTED' && (
                      <button
                        onClick={handleApproveAndPost}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg shadow-emerald-600/30"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Setujui &amp; Post Stok</span>
                      </button>
                    )}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1E2438] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Total Item Target</span>
                  <span className="text-base font-bold text-white font-mono">{activeOpname.lines.length}</span>
                </div>
                <div className="bg-[#1E2438] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Akurasi Stok</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {activeOpname.accuracyPercentage}%
                  </span>
                </div>
                <div className="bg-[#1E2438] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Item Matched (0 Var)</span>
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    {activeOpname.totalMatchedItems} / {activeOpname.lines.length}
                  </span>
                </div>
                <div className="bg-[#1E2438] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Net Variance Value</span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      activeOpname.totalNetVarianceValue < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    Rp {(activeOpname.totalNetVarianceValue ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Table of Counting Items */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#1A2133] text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-3 pl-4">Barang &amp; SKU</th>
                        <th className="p-3 text-right">Stok Sistem</th>
                        <th className="p-3 text-center">Hasil Hitung Fisik</th>
                        <th className="p-3 text-right">Selisih (Qty)</th>
                        <th className="p-3 text-right pr-4">Nilai Variance (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeOpname.lines.map((line) => {
                        const currentEditVal = editingCounts[line.id] ?? line.physicalQty;
                        const disc = activeOpname.status === 'COUNTING'
                          ? currentEditVal - line.systemQty
                          : line.varianceQty;
                        const varVal = disc * line.unitCost;

                        return (
                          <tr key={line.id} className="hover:bg-white/5">
                            <td className="p-3 pl-4">
                              <div className="font-bold text-white">{line.itemName}</div>
                              <div className="text-[10px] font-mono text-purple-300">
                                {line.sku} • {line.unit}
                              </div>
                            </td>

                            <td className="p-3 text-right font-mono text-slate-300 font-semibold">
                              {line.systemQty} {line.unit}
                            </td>

                            {/* Physical Count Input field */}
                            <td className="p-3 text-center">
                              {activeOpname.status === 'COUNTING' ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={currentEditVal}
                                  onChange={(e) =>
                                    handlePhysicalCountChange(line.id, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-24 px-2 py-1 bg-[#1E2438] border border-purple-500/40 rounded-lg text-center font-mono font-bold text-white focus:outline-none focus:border-purple-400 text-xs"
                                />
                              ) : (
                                <span className="font-mono font-bold text-white">
                                  {line.physicalQty} {line.unit}
                                </span>
                              )}
                            </td>

                            {/* Discrepancy Qty */}
                            <td className="p-3 text-right font-mono font-bold">
                              {disc === 0 ? (
                                <span className="text-slate-500">0</span>
                              ) : disc > 0 ? (
                                <span className="text-emerald-400">+{disc}</span>
                              ) : (
                                <span className="text-red-400">{disc}</span>
                              )}
                            </td>

                            {/* Variance Value */}
                            <td className="p-3 text-right pr-4 font-mono font-bold">
                              {varVal === 0 ? (
                                <span className="text-slate-500">Rp 0</span>
                              ) : varVal > 0 ? (
                                <span className="text-emerald-400">+Rp {(varVal ?? 0).toLocaleString('id-ID')}</span>
                              ) : (
                                <span className="text-red-400">Rp {(varVal ?? 0).toLocaleString('id-ID')}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Opname Session */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151B2B] w-full max-w-md rounded-2xl border border-white/10 p-5 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <span>Buat Sesi Stock Opname Baru</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpname} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Pilih Area Storage / Lokasi Target</label>
                <select
                  value={opnameLocation}
                  onChange={(e) => setOpnameLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">Seluruh Storage (Full Opname)</option>
                  <option value="Central Storage">Central Storage (Gudang Utama)</option>
                  <option value="Kitchen Store">Kitchen Store &amp; Walk-in Chiller</option>
                  <option value="Bar Counter">Bar Counter &amp; Beverage Area</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Filter Kategori (Opsional)</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Meat">Meat / Daging</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Dairy">Dairy &amp; Susu</option>
                  <option value="Beverage">Beverage &amp; Sirup</option>
                  <option value="Dry Goods">Dry Goods &amp; Bumbu</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Catatan Sesi Opname</label>
                <textarea
                  rows={2}
                  placeholder="Instruksi untuk tim pengawas opname..."
                  value={opnameNotes}
                  onChange={(e) => setOpnameNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Buat Sesi Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
