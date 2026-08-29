/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONAL AREA MANAGEMENT VIEW
 * Master table & management view for the 9 Operational Areas of Tropical Garden Resto
 */

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Layers,
  Shield,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import { OperationalArea, OperationalStation, OperationalRole } from '../../types/operations';
import { operationsService } from '../../services/operationsService';

interface OperationalAreaManagementViewProps {
  areas: OperationalArea[];
  stations: OperationalStation[];
  roles: OperationalRole[];
  onRefresh: () => void;
  canManage?: boolean;
}

export const OperationalAreaManagementView: React.FC<OperationalAreaManagementViewProps> = ({
  areas,
  stations,
  roles,
  onRefresh,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const getAreaIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Package':
        return <Package className="w-4 h-4" />;
      case 'SlidersHorizontal':
        return <SlidersHorizontal className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const handleToggleStatus = async (areaId: string) => {
    if (!canManage) return;
    setTogglingId(areaId);
    try {
      await operationsService.toggleOperationalAreaStatus(areaId);
      onRefresh();
    } catch (e) {
      console.error('Error toggling area status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredAreas = areas.filter((a) => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (a.name || '').toLowerCase().includes(searchLower) ||
      (a.code || '').toLowerCase().includes(searchLower) ||
      (a.description || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Operational Area (nama, kode, deskripsi)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 font-medium cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Areas Table Card */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">Urutan</th>
                <th className="px-4 py-3.5">Area & Kode</th>
                <th className="px-4 py-3.5">Deskripsi Operasional</th>
                <th className="px-4 py-3.5 text-center">Jumlah Stasiun</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {canManage && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredAreas.map((area) => {
                const areaStations = stations.filter((s) => s.areaId === area.id);
                const activeCount = areaStations.filter((s) => s.status === 'ACTIVE').length;

                return (
                  <tr key={area.id} className="hover:bg-[#1E2438]/50 transition">
                    <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-500">
                      {area.displayOrder}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#1E2438] text-purple-300 flex items-center justify-center font-semibold border border-white/10 shrink-0">
                          {getAreaIcon(area.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{area.name}</span>
                            {area.isControlLayer && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium px-1.5 py-0.5 rounded-sm">
                                Control Layer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-sm">
                            {area.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-slate-400 leading-relaxed">
                      {area.description}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-white text-sm">
                          {activeCount}
                          <span className="text-slate-400 text-xs font-normal">/{areaStations.length}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Stasiun Aktif</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          area.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#1E2438] text-slate-400 border border-white/10'
                        }`}
                      >
                        {area.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" /> Nonaktif
                          </>
                        )}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(area.id)}
                          disabled={togglingId === area.id}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          {area.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
