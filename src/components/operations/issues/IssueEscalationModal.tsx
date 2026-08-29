/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE ESCALATION MODAL
 * Modal for escalating issue to higher management level with quick reason templates
 */

import React, { useState } from 'react';
import { X, AlertOctagon, ShieldAlert } from 'lucide-react';
import { OperationalIssue, EscalationLevel } from '../../../types/operationalIssue';

interface IssueEscalationModalProps {
  isOpen: boolean;
  issue: OperationalIssue | null;
  onClose: () => void;
  onSubmit: (data: {
    escalatedBy: string;
    escalatedByName: string;
    escalationReason: string;
    escalationLevel: EscalationLevel;
  }) => Promise<void>;
  currentActorId?: string;
  currentActorName?: string;
}

const QUICK_REASONS = [
  'Target SLA telah terlewati dan butuh intervensi atasan.',
  'Membutuhkan persetujuan pembelian suku cadang / servis vendor eksternal.',
  'Bahan baku kritis habis dan mempengaruhi kelangsungan operasional menu.',
  'Terjadi perselisihan keluhan tamu berat yang memerlukan penanganan Manager.',
  'Terjadi gangguan keselamatan kerja K3 / bahaya fisik stasiun.',
];

export const IssueEscalationModal: React.FC<IssueEscalationModalProps> = ({
  isOpen,
  issue,
  onClose,
  onSubmit,
  currentActorId = 'emp-04',
  currentActorName = 'Andun (Head Kitchen)',
}) => {
  const [reason, setReason] = useState('');
  const [level, setLevel] = useState<EscalationLevel>('LEVEL_2_MANAGER');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        escalatedBy: currentActorId,
        escalatedByName: currentActorName,
        escalationReason: reason.trim(),
        escalationLevel: level,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-rose-500/30 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            Eskalasi Kendala Operasional
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">{issue.issueNumber}</div>
          <div className="font-bold text-white line-clamp-1">{issue.title}</div>
          <div className="text-slate-400">Area: {issue.areaName} — Severity: {issue.severity}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tingkat Eskalasi *</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as EscalationLevel)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500"
            >
              <option value="LEVEL_1_SUPERVISOR">Level 1 — Supervisor / Head Station</option>
              <option value="LEVEL_2_MANAGER">Level 2 — General Manager / Operational Lead</option>
              <option value="LEVEL_3_EXECUTIVE">Level 3 — Executive / Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Alasan Eskalasi *</label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan kendala spesifik yang menyebabkan dibutuhkannya eskalasi..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Quick Template Buttons */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1.5">
              Template Cepat Alasan Eskalasi
            </label>
            <div className="space-y-1">
              {QUICK_REASONS.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(tmpl)}
                  className="w-full text-left p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors border border-white/5 truncate"
                >
                  • {tmpl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white transition-all disabled:opacity-50 shadow-lg shadow-rose-600/30"
            >
              {loading ? 'Mengirim...' : 'Kirim Eskalasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
