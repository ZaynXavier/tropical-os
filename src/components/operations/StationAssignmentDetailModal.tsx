/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — STATION ASSIGNMENT DETAIL MODAL
 * Full audit inspection and cancellation flow for station assignments.
 */

import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Layers,
  User,
  ShieldCheck,
  Ban,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { EnrichedStationAssignment } from '../../types/operations';
import { operationsService } from '../../services/operationsService';

interface StationAssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: EnrichedStationAssignment | null;
  onRefresh: () => void;
  currentUserEmployeeId?: string;
  canManage?: boolean;
}

export const StationAssignmentDetailModal: React.FC<StationAssignmentDetailModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onRefresh,
  currentUserEmployeeId = 'emp-02',
  canManage = true,
}) => {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !assignment) return null;

  const handleCancelAssignment = async () => {
    if (!cancelReason.trim()) {
      setErrorMsg('Mohon isi alasan pembatalan penugasan.');
      return;
    }
    setCancelling(true);
    setErrorMsg(null);
    try {
      await operationsService.cancelStationAssignment(
        assignment.id,
        cancelReason.trim(),
        currentUserEmployeeId
      );
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membatalkan penugasan.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="station-assignment-detail-modal"
        className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] border-b border-white/10 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Detail Penugasan Stasiun</h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    assignment.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : assignment.status === 'CANCELLED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">ID: {assignment.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#151B2B]">
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Employee Card */}
          <div className="p-4 bg-[#0B0F19] border border-white/10 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1E2438] text-purple-300 font-bold flex items-center justify-center text-sm border border-white/10">
                  {assignment.employeeName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{assignment.employeeName}</h4>
                  <p className="text-xs text-slate-400">
                    {assignment.employeePosition} • {assignment.employeeDepartment}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-[#1E2438] px-2 py-1 rounded-md border border-white/10 text-slate-300">
                {assignment.employeeCode}
              </span>
            </div>

            {assignment.additionalResponsibilities && assignment.additionalResponsibilities.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">Tanggung Jawab Khusus:</span>
                {assignment.additionalResponsibilities.map((resp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md text-[11px] font-medium"
                  >
                    {resp}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Station & Shift Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> Operational Area
              </span>
              <p className="font-semibold text-white text-sm">{assignment.areaName}</p>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Stasiun Kerja
              </span>
              <p className="font-semibold text-white text-sm">{assignment.stationName}</p>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Peran Operasional
              </span>
              <p className="font-semibold text-white text-sm">{assignment.roleName}</p>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-white/10 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Shift & Jam
              </span>
              <p className="font-semibold text-white text-sm">
                {assignment.shiftName} ({assignment.shiftHours})
              </p>
            </div>
          </div>

          {/* Notes */}
          {assignment.notes && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Catatan Shift
              </span>
              <p className="text-amber-200/90 leading-relaxed">{assignment.notes}</p>
            </div>
          )}

          {/* Cancellation Info if cancelled */}
          {assignment.status === 'CANCELLED' && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <Ban className="w-4 h-4 text-rose-400" /> Penugasan Telah Dibatalkan
              </div>
              <p className="text-rose-200">
                Alasan: <span className="font-medium text-white">{assignment.cancellationReason || 'Tidak ada alasan'}</span>
              </p>
              {assignment.cancelledAt && (
                <p className="text-[11px] text-rose-300">
                  Dibatalkan pada: {new Date(assignment.cancelledAt).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

          {/* Cancel Form Trigger */}
          {canManage && assignment.status !== 'CANCELLED' && !showCancelForm && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                id="btn-trigger-cancel-assignment"
                onClick={() => setShowCancelForm(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" /> Batalkan Penugasan Ini
              </button>
            </div>
          )}

          {/* Cancel Input Form */}
          {showCancelForm && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3 animate-in fade-in">
              <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-400" /> Konfirmasi Pembatalan Penugasan
              </h5>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tulis alasan pembatalan (misal: sakit, rotasi darurat)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-500/40 bg-[#0B0F19] text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-[#0B0F19] border border-white/10 rounded-lg hover:bg-[#1E2438] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  id="btn-confirm-cancel-assignment"
                  onClick={handleCancelAssignment}
                  disabled={cancelling}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {cancelling ? 'Memproses...' : 'Ya, Batalkan Penugasan'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111827] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Ditugaskan: {new Date(assignment.assignedAt).toLocaleDateString('id-ID')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B0F19] hover:bg-[#1E2438] text-white border border-white/10 font-medium rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
