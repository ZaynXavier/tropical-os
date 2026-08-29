/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — RESOLVE ISSUE MODAL
 * Modal for submitting issue resolution, root cause analysis, corrective & preventive actions
 */

import React, { useState } from 'react';
import { X, CheckCircle2, FileText, Image } from 'lucide-react';
import { OperationalIssue, RootCauseCategory, IssueEvidence } from '../../../types/operationalIssue';

interface ResolveIssueModalProps {
  isOpen: boolean;
  issue: OperationalIssue | null;
  onClose: () => void;
  onSubmit: (data: {
    resolution: string;
    rootCauseCategory: RootCauseCategory;
    rootCause: string;
    correctiveAction?: string;
    preventiveAction?: string;
    resolvedBy: string;
    resolvedByName: string;
    evidence?: IssueEvidence[];
  }) => Promise<void>;
  currentActorId?: string;
  currentActorName?: string;
}

export const ResolveIssueModal: React.FC<ResolveIssueModalProps> = ({
  isOpen,
  issue,
  onClose,
  onSubmit,
  currentActorId = 'emp-04',
  currentActorName = 'Andun (Head Kitchen)',
}) => {
  const [resolution, setResolution] = useState('');
  const [rootCauseCategory, setRootCauseCategory] = useState<RootCauseCategory>('EQUIPMENT');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolution.trim() || !rootCause.trim()) return;

    setLoading(true);
    try {
      const evidenceList: IssueEvidence[] = photoUrl.trim()
        ? [
            {
              id: `ev-res-${Date.now()}`,
              fileName: `resolution_${Date.now().toString().slice(-4)}.jpg`,
              photoUrl: photoUrl.trim(),
              type: 'IMAGE',
              uploadedBy: currentActorId,
              uploadedByName: currentActorName,
              uploadedAt: new Date().toISOString(),
              description: 'Foto Bukti Penyelesaian Kendala',
            },
          ]
        : [];

      await onSubmit({
        resolution: resolution.trim(),
        rootCauseCategory,
        rootCause: rootCause.trim(),
        correctiveAction: correctiveAction.trim() || undefined,
        preventiveAction: preventiveAction.trim() || undefined,
        resolvedBy: currentActorId,
        resolvedByName: currentActorName,
        evidence: evidenceList,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Laporkan Penyelesaian Kendala (Resolve Issue)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">{issue.issueNumber}</div>
          <div className="font-bold text-white">{issue.title}</div>
          <div className="text-slate-400">Area: {issue.areaName} — {issue.stationName}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tindakan Penanganan */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ringkasan Tindakan Penyelesaian *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jelaskan langkah konkret yang telah dilakukan untuk mengatasi masalah..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Root Cause Category & Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Kategori Akar Masalah (Root Cause) *
              </label>
              <select
                value={rootCauseCategory}
                onChange={(e) => setRootCauseCategory(e.target.value as RootCauseCategory)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PEOPLE">People (Faktor SDM / Manusia)</option>
                <option value="PROCESS">Process (SOP / Prosedur Kerja)</option>
                <option value="EQUIPMENT">Equipment (Mesin / Peralatan)</option>
                <option value="INVENTORY">Inventory (Stok / Bahan Baku)</option>
                <option value="ENVIRONMENT">Environment (Lingkungan Kerja)</option>
                <option value="TRAINING">Training (Kurang Pelatihan)</option>
                <option value="SUPPLIER">Supplier (Vendor Eksternal)</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Akar Masalah (Root Cause Detail) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Terjadi penumpukan kerak akibat kurang purging"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Corrective & Preventive Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tindakan Korektif Langsung</label>
              <input
                type="text"
                placeholder="Contoh: Servis & descaling pembersihan nozzle"
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tindakan Pencegahan (Pencegahan Ulang)</label>
              <input
                type="text"
                placeholder="Contoh: Wajibkan checklist purging berkala"
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Photo Evidence URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              URL Foto Bukti Hasil Selesai (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !resolution.trim() || !rootCause.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/30"
            >
              {loading ? 'Menyimpan...' : 'Kirim Laporan Selesai'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
