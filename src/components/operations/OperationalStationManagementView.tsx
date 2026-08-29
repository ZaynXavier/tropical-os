/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONAL STATION MANAGEMENT VIEW
 * Master table and CRUD manager for 40+ Operational Stations across 9 Areas
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck2,
  BookOpen,
  MapPin,
  X,
  Check,
} from 'lucide-react';
import {
  OperationalStation,
  OperationalArea,
  OperationalRole,
} from '../../types/operations';
import { operationsService } from '../../services/operationsService';

interface OperationalStationManagementViewProps {
  stations: OperationalStation[];
  areas: OperationalArea[];
  roles: OperationalRole[];
  onRefresh: () => void;
  onInspectStation: (station: OperationalStation) => void;
  canManage?: boolean;
}

export const OperationalStationManagementView: React.FC<OperationalStationManagementViewProps> = ({
  stations,
  areas,
  roles,
  onRefresh,
  onInspectStation,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<OperationalStation | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    areaId: '',
    description: '',
    minimumStaff: 1,
    recommendedStaff: 1,
    maximumStaff: 2,
    defaultRoleId: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const areaMap = new Map<string, OperationalArea>(areas.map((a) => [a.id, a]));

  const filteredStations = stations.filter((s) => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (s.name || '').toLowerCase().includes(searchLower) ||
      (s.code || '').toLowerCase().includes(searchLower) ||
      (s.description || '').toLowerCase().includes(searchLower);
    const matchesArea = selectedAreaId === 'ALL' || s.areaId === selectedAreaId;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesArea && matchesStatus;
  });

  const handleToggleStatus = async (stationId: string) => {
    if (!canManage) return;
    setTogglingId(stationId);
    try {
      await operationsService.toggleStationStatus(stationId);
      onRefresh();
    } catch (e) {
      console.error('Error toggling station status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStation(null);
    setFormData({
      code: `STN-NEW-${stations.length + 1}`,
      name: '',
      areaId: areas[0]?.id || 'area-kitchen',
      description: '',
      minimumStaff: 1,
      recommendedStaff: 2,
      maximumStaff: 3,
      defaultRoleId: roles[0]?.id || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stn: OperationalStation) => {
    setEditingStation(stn);
    setFormData({
      code: stn.code,
      name: stn.name,
      areaId: stn.areaId,
      description: stn.description,
      minimumStaff: stn.minimumStaff,
      recommendedStaff: stn.recommendedStaff,
      maximumStaff: stn.maximumStaff,
      defaultRoleId: stn.defaultRoleId || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.areaId) {
      setErrorMsg('Mohon isi nama, kode, dan area stasiun.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingStation) {
        await operationsService.updateStation(editingStation.id, {
          name: formData.name.trim(),
          code: formData.code.trim(),
          areaId: formData.areaId,
          description: formData.description.trim(),
          minimumStaff: Number(formData.minimumStaff),
          recommendedStaff: Number(formData.recommendedStaff),
          maximumStaff: Number(formData.maximumStaff),
          defaultRoleId: formData.defaultRoleId || undefined,
        });
      } else {
        await operationsService.createStation({
          code: formData.code.trim(),
          name: formData.name.trim(),
          areaId: formData.areaId,
          description: formData.description.trim(),
          minimumStaff: Number(formData.minimumStaff),
          recommendedStaff: Number(formData.recommendedStaff),
          maximumStaff: Number(formData.maximumStaff),
          status: 'ACTIVE',
          defaultRoleId: formData.defaultRoleId || undefined,
          displayOrder: stations.length + 1,
        });
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan stasiun.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari stasiun kerja (nama, kode)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 font-medium cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Area ({areas.length})</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 font-medium cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Stasiun
          </button>
        )}
      </div>

      {/* Stations Table Card */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Stasiun & Kode</th>
                <th className="px-4 py-3.5">Area</th>
                <th className="px-4 py-3.5">Deskripsi Singkat</th>
                <th className="px-4 py-3.5 text-center">Standar Personel (Min/Rec/Max)</th>
                <th className="px-4 py-3.5 text-center">SOP & Checklist</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredStations.map((stn) => {
                const area = areaMap.get(stn.areaId);

                return (
                  <tr key={stn.id} className="hover:bg-[#1E2438]/50 transition">
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-bold text-white text-sm block">{stn.name}</span>
                        <span className="text-[11px] font-mono text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-sm">
                          {stn.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-200 bg-[#1E2438] border border-white/10 px-2 py-0.5 rounded-md text-xs">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        {area?.name || stn.areaId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-slate-400 leading-relaxed">
                      {stn.description}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <span className="bg-[#1E2438] border border-white/10 px-2 py-0.5 rounded-md text-slate-300 font-semibold">
                          {stn.minimumStaff}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                          {stn.recommendedStaff}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="bg-[#1E2438] border border-white/10 px-2 py-0.5 rounded-md text-slate-300 font-semibold">
                          {stn.maximumStaff}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {stn.sopIds && stn.sopIds.length > 0 && (
                          <span
                            title={`SOP Terkait: ${stn.sopIds.join(', ')}`}
                            className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30 text-[10px] font-semibold"
                          >
                            {stn.sopIds.length} SOP
                          </span>
                        )}
                        {stn.checklistTemplateIds && stn.checklistTemplateIds.length > 0 && (
                          <span
                            title={`Checklists: ${stn.checklistTemplateIds.join(', ')}`}
                            className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 text-[10px] font-semibold"
                          >
                            {stn.checklistTemplateIds.length} Chk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          stn.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#1E2438] text-slate-400 border border-white/10'
                        }`}
                      >
                        {stn.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onInspectStation(stn)}
                          title="Lihat Relasi Master Data"
                          className="p-1.5 rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(stn)}
                              title="Edit Stasiun"
                              className="p-1.5 rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(stn.id)}
                              disabled={togglingId === stn.id}
                              title="Toggle Aktif/Nonaktif"
                              className="px-2 py-1 text-xs rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                            >
                              {stn.status === 'ACTIVE' ? 'Off' : 'On'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Station Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#111827] text-white border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingStation ? 'Edit Master Stasiun' : 'Tambah Stasiun Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="p-6 overflow-y-auto space-y-4 text-xs bg-[#151B2B]">
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kode Stasiun</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. STN-KIT-09"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Operational Area</label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 cursor-pointer focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827] [&>option]:text-white"
                    required
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Stasiun Kerja</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sambal & Garnish Station"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi operasional..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Staffing guidelines */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Staff</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.minimumStaff}
                    onChange={(e) => setFormData({ ...formData, minimumStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-400 mb-1">Ideal Staff</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.recommendedStaff}
                    onChange={(e) => setFormData({ ...formData, recommendedStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono focus:outline-hidden focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Staff</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={formData.maximumStaff}
                    onChange={(e) => setFormData({ ...formData, maximumStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Default Role</label>
                <select
                  value={formData.defaultRoleId}
                  onChange={(e) => setFormData({ ...formData, defaultRoleId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 cursor-pointer focus:outline-hidden focus:border-purple-500 [&>option]:bg-[#111827] [&>option]:text-white"
                >
                  <option value="">-- Pilih Default Peran --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Stasiun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
