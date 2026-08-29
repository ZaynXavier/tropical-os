/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK MOVEMENT LEDGER VIEW
 * Immutable audit trail for all stock transactions (Receipts, Transfers, Wasting, Adjustments).
 */

import React, { useState, useEffect } from 'react';
import { StockMovement, StockMovementType } from '../../../types/stockMovement';
import { stockMovementService } from '../../../services/stockMovementService';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Trash2,
  Utensils,
  Sliders,
  PackageCheck,
} from 'lucide-react';

interface StockMovementLedgerViewProps {
  onOpenNewReceipt: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewWastage: () => void;
}

export const StockMovementLedgerView: React.FC<StockMovementLedgerViewProps> = ({
  onOpenNewReceipt,
  onOpenNewTransfer,
  onOpenNewWastage,
}) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<StockMovementType | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadMovements = async () => {
    setLoading(true);
    const data = await stockMovementService.getStockMovements({
      movementType: selectedType !== 'ALL' ? selectedType : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      searchQuery: searchQuery || undefined,
    });
    setMovements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMovements();
  }, [searchQuery, selectedType, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const getTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'PURCHASE_RECEIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Penerimaan PO
          </span>
        );
      case 'TRANSFER_IN':
      case 'TRANSFER_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Lokasi
          </span>
        );
      case 'WASTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold">
            <Trash2 className="w-3.5 h-3.5" />
            Wastage / Waste
          </span>
        );
      case 'STAFF_MEAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            Staff Meal / Demo
          </span>
        );
      case 'ADJUSTMENT_IN':
      case 'ADJUSTMENT_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            Koreksi Opname
          </span>
        );
      case 'RETURN_TO_SUPPLIER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[11px] font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Retur Supplier
          </span>
        );
      default:
        return <span className="text-slate-400 text-[11px] font-mono">{type}</span>;
    }
  };

  return (
    <div className="space-y-4 text-white animate-fade-in">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Ledger Pergerakan Stok (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Catatan transaksi penerimaan barang, transfer internal, wastage, dan penyesuaian stok yang mutlak &amp; tercatat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewReceipt}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Penerimaan (PO)</span>
          </button>

          <button
            onClick={onOpenNewTransfer}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-blue-600/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Stok</span>
          </button>

          <button
            onClick={onOpenNewWastage}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-red-600/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wastage / Waste</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Ref No, SKU, Barang, Staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Movement Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Jenis Pergerakan</option>
              <option value="PURCHASE_RECEIVE">Penerimaan Barang (PO)</option>
              <option value="TRANSFER_IN">Transfer Masuk</option>
              <option value="TRANSFER_OUT">Transfer Keluar</option>
              <option value="WASTE">Wastage / Rusak / Expired</option>
              <option value="STAFF_MEAL">Staff Meal / Cooking Demo</option>
              <option value="ADJUSTMENT_IN">Koreksi Masuk (+)</option>
              <option value="ADJUSTMENT_OUT">Koreksi Keluar (-)</option>
              <option value="RETURN_TO_SUPPLIER">Retur Supplier</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* End Date & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E2438] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
            />
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151B2B] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3.5 pl-5">No. Referensi &amp; Tanggal</th>
                <th className="p-3.5">Jenis Pergerakan</th>
                <th className="p-3.5">Nama Barang &amp; SKU</th>
                <th className="p-3.5">Asal / Tujuan</th>
                <th className="p-3.5 text-right">Jumlah (Qty)</th>
                <th className="p-3.5 text-right">Nilai Total (Rp)</th>
                <th className="p-3.5">Oleh Staf</th>
                <th className="p-3.5 pr-5">Catatan &amp; Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Memuat data ledger pergerakan stok...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ditemukan riwayat pergerakan stok sesuai filter.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIncoming =
                    m.movementType === 'PURCHASE_RECEIVE' ||
                    m.movementType === 'TRANSFER_IN' ||
                    m.movementType === 'ADJUSTMENT_IN' ||
                    m.movementType === 'PRODUCTION_IN';

                  return (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      {/* Ref & Date */}
                      <td className="p-3.5 pl-5">
                        <div className="font-mono text-xs font-bold text-white">{m.referenceId || m.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(m.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>

                      {/* Movement Type */}
                      <td className="p-3.5">{getTypeBadge(m.movementType)}</td>

                      {/* Item Info */}
                      <td className="p-3.5">
                        <div className="font-bold text-white">{m.itemName}</div>
                        <div className="text-[10px] font-mono text-purple-300">{m.itemSku}</div>
                      </td>

                      {/* Source / Destination */}
                      <td className="p-3.5 text-[11px]">
                        {m.sourceLocation && (
                          <div className="text-slate-400">
                            Dari: <span className="text-slate-200 font-semibold">{m.sourceLocation}</span>
                          </div>
                        )}
                        {m.destinationLocation && (
                          <div className="text-slate-400">
                            Ke: <span className="text-slate-200 font-semibold">{m.destinationLocation}</span>
                          </div>
                        )}
                        {!m.sourceLocation && !m.destinationLocation && (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="p-3.5 text-right font-mono font-bold">
                        <span
                          className={
                            isIncoming
                              ? 'text-emerald-400'
                              : m.movementType === 'WASTE'
                              ? 'text-red-400'
                              : 'text-amber-300'
                          }
                        >
                          {isIncoming ? `+${m.quantity}` : `-${m.quantity}`}{' '}
                          <span className="text-[10px] font-normal text-slate-400">{m.unit}</span>
                        </span>
                      </td>

                      {/* Total Value */}
                      <td className="p-3.5 text-right font-mono text-slate-200">
                        Rp {(m.totalValue ?? 0).toLocaleString('id-ID')}
                      </td>

                      {/* Staff */}
                      <td className="p-3.5 text-[11px]">
                        <div className="font-semibold text-white">{m.createdByName || m.createdBy}</div>
                      </td>

                      {/* Notes / Reason */}
                      <td className="p-3.5 pr-5 max-w-[200px]">
                        <div className="text-[11px] text-slate-300 truncate" title={m.reason || '-'}>
                          {m.reason || '-'}
                        </div>
                        {m.batchNumber && (
                          <div className="text-[9px] font-mono text-purple-300">Batch: {m.batchNumber}</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
