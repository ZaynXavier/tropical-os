/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONAL ROLE MANAGEMENT VIEW
 * Master table and CRUD manager for Operational Roles across Tropical Garden Resto
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react';
import { OperationalRole, OperationalArea } from '../../types/operations';
import { operationsService } from '../../services/operationsService';

interface OperationalRoleManagementViewProps {
  roles: OperationalRole[];
  areas: OperationalArea[];
  onRefresh: () => void;
  canManage?: boolean;
}

export const OperationalRoleManagementView: React.FC<OperationalRoleManagementViewProps> = ({
  roles,
  areas,
  onRefresh,
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OperationalRole | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    areaId: '',
    description: '',
    requiredSkills: '',
    jobDescriptionId: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const areaMap = new Map<string, OperationalArea>(areas.map((a) => [a.id, a]));

  const filteredRoles = roles.filter((r) => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (r.name || '').toLowerCase().includes(searchLower) ||
      (r.code || '').toLowerCase().includes(searchLower) ||
      (r.description || '').toLowerCase().includes(searchLower);
    const matchesArea = selectedAreaId === 'ALL' || !r.areaId || r.areaId === selectedAreaId;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesArea && matchesStatus;
  });

  const handleToggleStatus = async (roleId: string) => {
    if (!canManage) return;
    setTogglingId(roleId);
    try {
      await operationsService.toggleOperationalRoleStatus(roleId);
      onRefresh();
    } catch (e) {
      console.error('Error toggling role status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setFormData({
      code: `OP-ROLE-NEW-${roles.length + 1}`,
      name: '',
      areaId: areas[0]?.id || '',
      description: '',
      requiredSkills: 'Line Operations, Hygiene, Teamwork',
      jobDescriptionId: '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: OperationalRole) => {
    setEditingRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      areaId: role.areaId || '',
      description: role.description,
      requiredSkills: (role.requiredSkills || []).join(', '),
      jobDescriptionId: role.jobDescriptionId || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMsg('Mohon isi nama dan kode peran.');
      return;
    }

    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingRole) {
        await operationsService.updateOperationalRole(editingRole.id, {
          name: formData.name.trim(),
          code: formData.code.trim(),
          areaId: formData.areaId || undefined,
          description: formData.description.trim(),
          requiredSkills: skillsArray,
          jobDescriptionId: formData.jobDescriptionId || undefined,
        });
      } else {
        await operationsService.createOperationalRole({
          code: formData.code.trim(),
          name: formData.name.trim(),
          areaId: formData.areaId || undefined,
          description: formData.description.trim(),
          requiredSkills: skillsArray,
          jobDescriptionId: formData.jobDescriptionId || undefined,
          status: 'ACTIVE',
          displayOrder: roles.length + 1,
        });
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan peran.');
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
              placeholder="Cari peran operasional (nama, kode)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 font-medium cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
          >
            <option value="ALL">Semua Area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
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
            <Plus className="w-4 h-4" /> Tambah Peran
          </button>
        )}
      </div>

      {/* Roles Table Card */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Peran & Kode</th>
                <th className="px-4 py-3.5">Area Utama</th>
                <th className="px-4 py-3.5">Deskripsi Tanggung Jawab</th>
                <th className="px-4 py-3.5">Skill Wajib</th>
                <th className="px-4 py-3.5 text-center">Ref Job Desc</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {canManage && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredRoles.map((role) => {
                const area = role.areaId ? areaMap.get(role.areaId) : null;

                return (
                  <tr key={role.id} className="hover:bg-[#1E2438]/50 transition">
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-bold text-white text-sm block">{role.name}</span>
                        <span className="text-[11px] font-mono text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-sm">
                          {role.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {area ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-200 bg-[#1E2438] border border-white/10 px-2 py-0.5 rounded-md text-xs">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          {area.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">Cross-Area</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-slate-400 leading-relaxed">
                      {role.description}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {role.requiredSkills && role.requiredSkills.length > 0 ? (
                          role.requiredSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-[#1E2438] text-slate-300 border border-white/10 rounded text-[10px]"
                            >
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {role.jobDescriptionId ? (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-mono text-[10px] font-semibold border border-purple-500/30 inline-flex items-center gap-1">
                          <FileText className="w-3 h-3 text-purple-400" />
                          {role.jobDescriptionId.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          role.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#1E2438] text-slate-400 border border-white/10'
                        }`}
                      >
                        {role.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(role)}
                            className="p-1.5 rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Peran"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(role.id)}
                            disabled={togglingId === role.id}
                            className="px-2 py-1 text-xs rounded-lg border border-white/10 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            {role.status === 'ACTIVE' ? 'Off' : 'On'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#111827] text-white border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingRole ? 'Edit Peran Operasional' : 'Tambah Peran Operasional Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-4 text-xs bg-[#151B2B]">
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kode Peran</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. OP-ROLE-KIT-05"
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
                  >
                    <option value="">-- Cross-Area --</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Peran</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Senior Fryer Specialist"
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
                  placeholder="Rincian tanggung jawab peran..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Required Skills (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g. Line Cooking, Deep Fryer, HACCP"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Description Doc ID</label>
                <input
                  type="text"
                  value={formData.jobDescriptionId}
                  onChange={(e) => setFormData({ ...formData, jobDescriptionId: e.target.value })}
                  placeholder="e.g. jd-kit-01"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                />
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
                  {saving ? 'Menyimpan...' : 'Simpan Peran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
