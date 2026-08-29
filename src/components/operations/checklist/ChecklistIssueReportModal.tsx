/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — CHECKLIST FAILED ITEM & ISSUE REPORT MODAL
 * Dedicated modal for marking a checklist task as FAILED, providing failure reason,
 * assigning immediate corrective action, and optionally lodging an Operational Issue.
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  Flame,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ChecklistExecution } from '../../../types/operationsChecklist';
import { OperationalIssueCategory, OperationalIssueSeverity } from '../../../types/operations';

interface ChecklistIssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChecklistExecution;
  stationName: string;
  onConfirmFail: (data: {
    reason: string;
    correctiveActionText?: string;
    createIssue: boolean;
    issueCategory?: OperationalIssueCategory;
    issueSeverity?: OperationalIssueSeverity;
    value?: number;
    photoUrl?: string;
  }) => void;
}

export const ChecklistIssueReportModal: React.FC<ChecklistIssueReportModalProps> = ({
  isOpen,
  onClose,
  item,
  stationName,
  onConfirmFail,
}) => {
  const [reason, setReason] = useState('');
  const [correctiveActionText, setCorrectiveActionText] = useState('');
  const [createIssue, setCreateIssue] = useState(true);
  const [category, setCategory] = useState<OperationalIssueCategory>(
    item.criticalControlPoint ? 'SAFETY_HAZARD' : 'FACILITY_BREAKDOWN'
  );
  const [severity, setSeverity] = useState<OperationalIssueSeverity>(
    item.criticalControlPoint ? 'CRITICAL' : 'HIGH'
  );
  const [recordedValue, setRecordedValue] = useState<string>(
    item.value !== undefined ? String(item.value) : ''
  );
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg('Alasan kendala / kegagalan wajib diisi minimal 5 karakter.');
      return;
    }

    onConfirmFail({
      reason: reason.trim(),
      correctiveActionText: correctiveActionText.trim() || undefined,
      createIssue,
      issueCategory: category,
      issueSeverity: severity,
      value: recordedValue ? parseFloat(recordedValue) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-[#151B2B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Lapor Kendala & Gagal Task
                </span>
                {item.criticalControlPoint && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CCP Titik Kritis
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stasiun & Info */}
          <div className="p-3 rounded-xl bg-[#151B2B] border border-white/5 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Stasiun:</span>
              <span className="font-semibold text-white">{stationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kategori Tugas:</span>
              <span className="font-semibold text-purple-300">{item.category}</span>
            </div>
            {item.requiresNumericValue && (
              <div className="flex justify-between">
                <span className="text-slate-400">Standar Nilai:</span>
                <span className="font-semibold text-emerald-400">
                  {item.minValue} - {item.maxValue} {item.unit}
                </span>
              </div>
            )}
          </div>

          {/* Optional Numeric input if required */}
          {item.requiresNumericValue && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nilai Aktual yang Terukur ({item.unit}):
              </label>
              <input
                type="number"
                step="any"
                value={recordedValue}
                onChange={(e) => setRecordedValue(e.target.value)}
                placeholder={`Contoh: ${item.minValue ? item.minValue - 2 : 0}`}
                className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Alasan Kegagalan / Kendala Lapangan <span className="text-rose-400">*</span>:
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Jelaskan kendala apa yang terjadi (misal: Suhu chiller mencapai 12°C karena kompresor mati, atau exhaust hood tidak berputar)."
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500 resize-none"
            />
          </div>

          {/* Corrective Action Suggestion */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Rencana Tindakan Korektif (Corrective Action):
            </label>
            <input
              type="text"
              value={correctiveActionText}
              onChange={(e) => setCorrectiveActionText(e.target.value)}
              placeholder="Contoh: Pindahkan bahan ke freezer cadangan, hubungi teknisi servis."
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Create Operational Issue Toggle */}
          <div className="p-3 rounded-xl bg-[#151B2B] border border-white/5 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Catat ke Operational Issue Log Resto
              </span>
              <input
                type="checkbox"
                checked={createIssue}
                onChange={(e) => setCreateIssue(e.target.checked)}
                className="w-4 h-4 rounded-sm text-purple-600 focus:ring-purple-500 bg-[#0B0F19] border-white/10"
              />
            </label>

            {createIssue && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Kategori Isu</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OperationalIssueCategory)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-hidden [&>option]:bg-[#111827]"
                  >
                    <option value="SAFETY_HAZARD">Safety Hazard (K3)</option>
                    <option value="FACILITY_BREAKDOWN">Facility / Kerusakan Alat</option>
                    <option value="RAW_MATERIAL_OUT">Kehabisan Stok Bahan</option>
                    <option value="FOOD_QUALITY">Kualitas Makanan (CCP)</option>
                    <option value="HYGIENE_VIOLATION">Pelanggaran Sanitasi</option>
                    <option value="STAFFING_SHORTAGE">Kekurangan Staf</option>
                    <option value="GUEST_COMPLAINT">Komplain Pelanggan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Tingkat Keparahan</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as OperationalIssueSeverity)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-hidden [&>option]:bg-[#111827]"
                  >
                    <option value="LOW">LOW (Rendah)</option>
                    <option value="MEDIUM">MEDIUM (Sedang)</option>
                    <option value="HIGH">HIGH (Tinggi)</option>
                    <option value="CRITICAL">CRITICAL (Kritis)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" /> Konfirmasi Task Gagal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
