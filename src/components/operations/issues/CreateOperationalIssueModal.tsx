/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — CREATE OPERATIONAL ISSUE MODAL
 * Form modal for reporting new operational issues
 */

import React, { useState } from 'react';
import { X, Plus, AlertTriangle, Image, MapPin, Tag, User } from 'lucide-react';
import { OperationalIssueCategory, OperationalIssueSeverity, IssueEvidence } from '../../../types/operationalIssue';
import { INITIAL_OPERATIONAL_AREAS } from '../../../data/mockOperationalAreas';
import { INITIAL_OPERATIONAL_STATIONS } from '../../../data/mockOperationalStations';
import { INITIAL_EMPLOYEES } from '../../../data/employees';

interface CreateOperationalIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    areaId: string;
    stationId: string;
    category: OperationalIssueCategory;
    severity: OperationalIssueSeverity;
    reportedBy: string;
    assignedTo?: string;
    evidence?: IssueEvidence[];
  }) => Promise<void>;
  currentUserEmployeeId?: string;
}

export const CreateOperationalIssueModal: React.FC<CreateOperationalIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserEmployeeId = 'emp-09',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState(INITIAL_OPERATIONAL_AREAS[0]?.id || 'area-kitchen');
  const [stationId, setStationId] = useState('stn-kit-hot');
  const [category, setCategory] = useState<OperationalIssueCategory>('EQUIPMENT');
  const [severity, setSeverity] = useState<OperationalIssueSeverity>('MEDIUM');
  const [reportedBy, setReportedBy] = useState(currentUserEmployeeId);
  const [assignedTo, setAssignedTo] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const areaStations = INITIAL_OPERATIONAL_STATIONS.filter((s) => s.areaId === areaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const evidenceList: IssueEvidence[] = photoUrl.trim()
        ? [
            {
              id: `ev-${Date.now()}`,
              fileName: `photo_${Date.now().toString().slice(-4)}.jpg`,
              photoUrl: photoUrl.trim(),
              type: 'IMAGE',
              uploadedBy: reportedBy,
              uploadedByName: INITIAL_EMPLOYEES.find((e) => e.id === reportedBy)?.name || 'Pelapor',
              uploadedAt: new Date().toISOString(),
              description: 'Foto Lampiran Pelaporan Stasiun',
            },
          ]
        : [];

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        areaId,
        stationId: stationId || areaStations[0]?.id || 'stn-gen',
        category,
        severity,
        reportedBy,
        assignedTo: assignedTo || undefined,
        evidence: evidenceList,
      });

      setTitle('');
      setDescription('');
      setPhotoUrl('');
      onClose();
    } catch (err) {
      console.error('Error creating issue:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Laporkan Kendala Operasional Baru</h3>
              <p className="text-xs text-slate-400">Pencatatan insiden & penentuan target SLA otomatis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Judul Kendala */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Kendala Operasional *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Mesin Espresso Kanan Tekanan Uap Drop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Area & Stasiun */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Departemen / Area *</label>
              <select
                value={areaId}
                onChange={(e) => {
                  const newArea = e.target.value;
                  setAreaId(newArea);
                  const stns = INITIAL_OPERATIONAL_STATIONS.filter((s) => s.areaId === newArea);
                  if (stns.length > 0) setStationId(stns[0].id);
                }}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {INITIAL_OPERATIONAL_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stasiun Kerja *</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {areaStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategori & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori Masalah *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="EQUIPMENT">Peralatan (Equipment)</option>
                <option value="INVENTORY">Persediaan (Inventory)</option>
                <option value="FOOD_SAFETY">Keamanan Pangan (Food Safety)</option>
                <option value="HYGIENE">Kebersihan (Hygiene)</option>
                <option value="GUEST_COMPLAINT">Keluhan Tamu (Guest Complaint)</option>
                <option value="STAFF">Karyawan (Staffing)</option>
                <option value="FACILITY">Fasilitas (Facility)</option>
                <option value="CASHIER_POS">Kasir / POS</option>
                <option value="SAFETY_K3">Keselamatan K3</option>
                <option value="OPERATIONAL">Operasional Umum</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tingkat Urgensi (Severity) *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="CRITICAL" className="text-rose-400">CRITICAL — SLA Target 15 Menit</option>
                <option value="HIGH" className="text-amber-400">HIGH — SLA Target 30 Menit</option>
                <option value="MEDIUM" className="text-sky-400">MEDIUM — SLA Target 2 Jam</option>
                <option value="LOW" className="text-slate-300">LOW — SLA Target 24 Jam</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi Detail *</label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan kronologi, gejala, atau dampak kendala secara rinci..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Pelapor & Penugasan PIC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pelapor *</label>
              <select
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE').map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.primaryPosition})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tugaskan PIC (Opsional)</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Belum Ditugaskan --</option>
                {INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE').map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.primaryPosition})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Evidence URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">URL Lampiran Foto Bukti (Opsional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition-all shadow-lg shadow-purple-600/30"
            >
              {loading ? 'Menyimpan...' : 'Kirim Laporan Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
