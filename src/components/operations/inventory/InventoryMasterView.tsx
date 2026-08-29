/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY MASTER VIEW
 * Master catalog table & card list with FEFO badges, stock status indicators, and actions.
 */

import React, { useState } from 'react';
import { InventoryItem, StockStatus, ExpiryRiskLevel } from '../../../types/inventory';
import { inventoryService } from '../../../services/inventoryService';
import { InventoryFilters } from './InventoryFilters';
import {
  Package,
  Eye,
  ArrowRightLeft,
  Sliders,
  AlertTriangle,
  Clock,
  Plus,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface InventoryMasterViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onOpenTransfer: (item: InventoryItem) => void;
  onOpenAdjust: (item: InventoryItem) => void;
  onReportIssue: (item: InventoryItem) => void;
  onOpenCreateItem?: () => void;
  onRefresh: () => void;
}

export const InventoryMasterView: React.FC<InventoryMasterViewProps> = ({
  items,
  onSelectItem,
  onOpenTransfer,
  onOpenAdjust,
  onReportIssue,
  onOpenCreateItem,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'ALL'>('ALL');
  const [selectedExpiryRisk, setSelectedExpiryRisk] = useState<ExpiryRiskLevel | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  // Filter items
  const filteredItems = items.filter((item) => {
    // Category filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

    // Location filter
    if (selectedLocation !== 'ALL') {
      const locStr = `${item.storageArea || ''} ${item.storageLocation || ''}`.toLowerCase();
      if (!locStr.includes(selectedLocation.toLowerCase())) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      const status = inventoryService.getStockStatus(item);
      if (status !== selectedStatus) return false;
    }

    // Expiry risk filter
    if (selectedExpiryRisk !== 'ALL') {
      const risk = inventoryService.getExpiryRisk(item);
      if (risk !== selectedExpiryRisk) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchSku = (item.sku || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchSupplier = (item.supplierName || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat && !matchSupplier) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedExpiryRisk('ALL');
    setSelectedLocation('ALL');
  };

  return (
    <div className="space-y-4 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Master Katalog Inventaris &amp; Stok Bahan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen persediaan bahan baku, reorder point, lokasi penyimpanan &amp; risiko kedaluwarsa (FEFO).
          </p>
        </div>

        {onOpenCreateItem && (
          <button
            onClick={onOpenCreateItem}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item Baru</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <InventoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedExpiryRisk={selectedExpiryRisk}
        onExpiryRiskChange={setSelectedExpiryRisk}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onReset={handleResetFilters}
      />

      {/* Table Section (Desktop) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/10 bg-[#151B2B] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3.5 pl-5">SKU &amp; Nama Barang</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Lokasi Simpan</th>
                <th className="p-3.5 text-right">Stok Fisik</th>
                <th className="p-3.5 text-right">Avg Cost (Rp)</th>
                <th className="p-3.5 text-right">Nilai Stok (Rp)</th>
                <th className="p-3.5 text-center">Status Stok</th>
                <th className="p-3.5 text-center">FEFO Expiry</th>
                <th className="p-3.5 pr-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada barang inventaris yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = inventoryService.getStockStatus(item);
                  const expiryRisk = inventoryService.getExpiryRisk(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* SKU & Name */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-1.5 py-0.2 rounded">
                                {item.sku}
                              </span>
                            </div>
                            <button
                              onClick={() => onSelectItem(item)}
                              className="font-bold text-white hover:text-purple-300 transition-all text-left text-xs cursor-pointer block mt-0.5"
                            >
                              {item.name}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[11px] border border-white/10">
                          {item.category}
                        </span>
                      </td>

                      {/* Storage Location */}
                      <td className="p-3.5 text-slate-300 text-[11px]">
                        <div className="font-semibold text-white">{item.storageArea}</div>
                        <div className="text-[10px] text-slate-400">{item.storageLocation}</div>
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-bold text-white text-xs">
                          {item.currentStock} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Min: {item.minimumStock} | Reorder: {item.reorderPoint}
                        </div>
                      </td>

                      {/* Avg Cost */}
                      <td className="p-3.5 text-right font-mono text-slate-300">
                        Rp {(item.averageCost ?? 0).toLocaleString('id-ID')}
                      </td>

                      {/* Stock Value */}
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        Rp {(item.stockValue ?? 0).toLocaleString('id-ID')}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="p-3.5 text-center">
                        {status === 'OPTIMAL' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Optimal
                          </span>
                        )}
                        {status === 'LOW_STOCK' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Low Stock
                          </span>
                        )}
                        {status === 'CRITICAL' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            Kritis
                          </span>
                        )}
                        {status === 'OUT_OF_STOCK' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-600/40 text-red-200 border border-red-500/50">
                            Habis
                          </span>
                        )}
                      </td>

                      {/* FEFO Expiry Risk Badge */}
                      <td className="p-3.5 text-center">
                        {expiryRisk === 'NONE' && (
                          <span className="text-slate-500 text-[10px]">-</span>
                        )}
                        {expiryRisk === 'SAFE' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Aman
                          </span>
                        )}
                        {expiryRisk === 'WARNING_EXPIRING' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            &lt; 30 Hari
                          </span>
                        )}
                        {expiryRisk === 'CRITICAL_EXPIRING' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                            &lt; 7 Hari
                          </span>
                        )}
                        {expiryRisk === 'EXPIRED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/30 text-pink-300 border border-pink-500/50">
                            EXPIRED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectItem(item)}
                            title="Detail & Ledger"
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenTransfer(item)}
                            title="Transfer Lokasi"
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenAdjust(item)}
                            title="Koreksi Stok"
                            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all cursor-pointer border border-purple-500/30"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {(status === 'CRITICAL' || status === 'OUT_OF_STOCK' || expiryRisk === 'EXPIRED') && (
                            <button
                              onClick={() => onReportIssue(item)}
                              title="Laporkan Kendala Staf"
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all cursor-pointer border border-red-500/30"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards View (Mobile) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredItems.length === 0 ? (
          <div className="p-6 bg-[#151B2B] rounded-2xl text-center text-slate-400 border border-white/10 text-xs">
            Tidak ada barang inventaris.
          </div>
        ) : (
          filteredItems.map((item) => {
            const status = inventoryService.getStockStatus(item);
            const expiryRisk = inventoryService.getExpiryRisk(item);

            return (
              <div
                key={item.id}
                className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">
                      {item.sku}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-1">{item.name}</h3>
                    <span className="text-[10px] text-slate-400">{item.category} • {item.storageArea}</span>
                  </div>

                  {status === 'OPTIMAL' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                      Optimal
                    </span>
                  )}
                  {status === 'LOW_STOCK' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400">
                      Low
                    </span>
                  )}
                  {(status === 'CRITICAL' || status === 'OUT_OF_STOCK') && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400">
                      Kritis
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#1E2438] p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Stok Fisik</span>
                    <p className="font-bold text-white">{item.currentStock} {item.unit}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nilai Total</span>
                    <p className="font-bold text-emerald-400">
                      Rp {(item.stockValue ?? 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-slate-400">
                    FEFO: <span className="font-semibold text-slate-200">{expiryRisk}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="px-2.5 py-1.5 bg-white/5 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => onOpenAdjust(item)}
                      className="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Koreksi
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
