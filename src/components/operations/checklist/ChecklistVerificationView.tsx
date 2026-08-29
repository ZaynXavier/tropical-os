/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — CHECKLIST SUPERVISOR VERIFICATION QUEUE
 * Dedicated verification dashboard for Supervisors and Managers.
 * Features batch approval, detailed single-review, rejection with corrective notes,
 * CCP alarm filters, and manager overrides.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Search,
  Filter,
  Eye,
  Camera,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Send,
  User,
} from 'lucide-react';
import { DailyChecklist } from '../../../types/operationsChecklist';
import { Employee } from '../../../types/employee';
import { operationsChecklistService } from '../../../services/operationsChecklistService';
import { ChecklistDetailModal } from './ChecklistDetailModal';

interface ChecklistVerificationViewProps {
  currentEmployee: Employee;
  selectedDate?: string;
  selectedShiftId?: string;
  onRefreshParent?: () => void;
}

export const ChecklistVerificationView: React.FC<ChecklistVerificationViewProps> = ({
  currentEmployee,
  selectedDate = '2026-08-18',
  selectedShiftId = 'shift-pagi',
  onRefreshParent,
}) => {
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<DailyChecklist[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('VERIFICATION_REQUIRED');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected checklist for deep modal inspection
  const [inspectChecklist, setInspectChecklist] = useState<DailyChecklist | null>(null);

  // Rejection modal state
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      const list = await operationsChecklistService.getDailyChecklists({
        date: selectedDate,
        shiftId: selectedShiftId === 'ALL' ? undefined : selectedShiftId,
        areaId: selectedArea === 'ALL' ? undefined : selectedArea,
        status: selectedStatus === 'ALL' ? undefined : (selectedStatus as any),
      });
      setChecklists(list);
    } catch (err) {
      console.error('Failed to load verification list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, [selectedDate, selectedShiftId, selectedArea, selectedStatus]);

  // Single Approve
  const handleApprove = async (checklistId: string, note?: string) => {
    try {
      await operationsChecklistService.verifyChecklist(
        checklistId,
        currentEmployee.id,
        currentEmployee.name,
        note
      );
      setToast({ type: 'SUCCESS', text: 'Checklist berhasil diverifikasi & disetujui!' });
      await loadVerificationData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setToast({ type: 'ERROR', text: err.message || 'Gagal memverifikasi checklist.' });
    }
  };

  // Single Reject
  const handleConfirmReject = async () => {
    if (!rejectTargetId || !rejectionReason.trim()) return;
    try {
      await operationsChecklistService.rejectChecklist(
        rejectTargetId,
        currentEmployee.id,
        currentEmployee.name,
        rejectionReason.trim()
      );
      setToast({ type: 'SUCCESS', text: 'Checklist ditolak dan dikembalikan ke staf untuk revisi.' });
      setRejectTargetId(null);
      setRejectionReason('');
      await loadVerificationData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setToast({ type: 'ERROR', text: err.message || 'Gagal menolak checklist.' });
    }
  };

  // Batch Approve all in verification required state
  const handleBatchApprove = async () => {
    const pending = filteredChecklists.filter((c) => c.status === 'VERIFICATION_REQUIRED');
    if (pending.length === 0) return;

    try {
      for (const chk of pending) {
        await operationsChecklistService.verifyChecklist(
          chk.id,
          currentEmployee.id,
          currentEmployee.name,
          'Batch approval oleh supervisor'
        );
      }
      setToast({ type: 'SUCCESS', text: `${pending.length} checklist berhasil diverifikasi sekaligus!` });
      await loadVerificationData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setToast({ type: 'ERROR', text: 'Gagal memverifikasi secara batch.' });
    }
  };

  // Filter by search query
  const filteredChecklists = checklists.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.templateTitle.toLowerCase().includes(q) ||
      c.stationName.toLowerCase().includes(q) ||
      c.assignedEmployeeName.toLowerCase().includes(q) ||
      c.areaName.toLowerCase().includes(q)
    );
  });

  const pendingCount = checklists.filter((c) => c.status === 'VERIFICATION_REQUIRED').length;
  const criticalCount = checklists.filter((c) => c.criticalIssueCount > 0).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-lg ${
            toast.type === 'SUCCESS'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'SUCCESS' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1">
            &times;
          </button>
        </div>
      )}

      {/* Filter & Batch Action Bar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Quick Status Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari stasiun, staf, atau template..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/10">
            {[
              { key: 'VERIFICATION_REQUIRED', label: 'Perlu Verifikasi', count: pendingCount },
              { key: 'REJECTED', label: 'Ditolak' },
              { key: 'VERIFIED', label: 'Disetujui' },
              { key: 'ALL', label: 'Semua Status' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === st.key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{st.label}</span>
                {typeof st.count === 'number' && st.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    {st.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadVerificationData}
            title="Segarkan data"
            className="p-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleBatchApprove}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" /> Setujui Semua ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Ribbon if CCP Failures exist */}
      {criticalCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-300">
                Peringatan CCP: Terdeteksi {criticalCount} checklist dengan kegagalan titik kontrol kritis!
              </span>
              <p className="text-[11px] text-rose-300/80">
                Segera periksa tindakan koreksi staf untuk mencegah kontaminasi atau insiden keselamatan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Verification Cards Grid / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Memuat antrean verifikasi...</p>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10 p-6 space-y-2">
          <ShieldCheck className="w-12 h-12 mx-auto text-slate-500 opacity-40" />
          <h4 className="text-sm font-bold text-white">Tidak Ada Antrean Verifikasi</h4>
          <p className="text-xs text-slate-400">
            Semua checklist pada filter ini telah ditangani atau belum ada pengajuan baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChecklists.map((chk) => {
            const isPendingVerify = chk.status === 'VERIFICATION_REQUIRED';
            const isVerified = chk.status === 'VERIFIED';
            const isRejected = chk.status === 'REJECTED';
            const photoCount = chk.items.reduce((acc, i) => acc + (i.evidence?.length || 0), 0);

            return (
              <div
                key={chk.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  chk.criticalIssueCount > 0
                    ? 'bg-[#151B2B] border-rose-500/40 shadow-rose-500/5'
                    : isPendingVerify
                    ? 'bg-[#151B2B] border-amber-500/30 shadow-amber-500/5'
                    : 'bg-[#151B2B] border-white/10'
                }`}
              >
                {/* Top Title & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {chk.templateCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isPendingVerify
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {chk.status}
                      </span>
                      {chk.criticalIssueCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {chk.criticalIssueCount} CCP Kritis
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectChecklist(chk)}
                      className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
                      title="Lihat Rincian & Audit"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white">{chk.templateTitle}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {chk.stationName} ({chk.areaName}) • {chk.shiftName}
                  </p>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0B0F19] border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Personel</span>
                    <span className="font-semibold text-white truncate block">
                      {chk.assignedEmployeeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Selesai / Total</span>
                    <span className="font-semibold text-emerald-400">
                      {chk.completedItemsCount} / {chk.totalItemsCount} ({chk.completionPercentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Foto Bukti</span>
                    <span className="font-semibold text-purple-300 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> {photoCount} Foto
                    </span>
                  </div>
                </div>

                {/* Rejection Note if any */}
                {isRejected && chk.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                    <span className="font-bold">Alasan Penolakan: </span>
                    {chk.rejectionReason}
                  </div>
                )}

                {/* Bottom Supervisor Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectChecklist(chk)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail Task
                  </button>

                  <div className="flex items-center gap-2">
                    {isPendingVerify && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectTargetId(chk.id)}
                          className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(chk.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui
                        </button>
                      </>
                    )}

                    {isVerified && (
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Oleh: {chk.verifiedByName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal Dialog */}
      {rejectTargetId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#111827] border border-rose-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Tolak Checklist & Berikan Instruksi Revisi
            </h4>
            <p className="text-xs text-slate-300">
              Instruksi ini akan langsung tampil di layar perangkat personel untuk segera diperbaiki:
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Bar blade blender belum direndam sanitiser, mohon bersihkan ulang."
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectTargetId(null);
                  setRejectionReason('');
                }}
                className="px-3 py-1.5 bg-white/5 text-slate-300 text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deep Detail Modal */}
      {inspectChecklist && (
        <ChecklistDetailModal
          isOpen={!!inspectChecklist}
          onClose={() => {
            setInspectChecklist(null);
            loadVerificationData();
          }}
          checklist={inspectChecklist}
          canVerify={true}
          onVerify={handleApprove}
          onReject={async (id, reason) => {
            await operationsChecklistService.rejectChecklist(
              id,
              currentEmployee.id,
              currentEmployee.name,
              reason
            );
            loadVerificationData();
          }}
          onManagerOverride={async (id, reason) => {
            await operationsChecklistService.managerOverride(
              id,
              currentEmployee.id,
              currentEmployee.name,
              reason
            );
            loadVerificationData();
          }}
        />
      )}
    </div>
  );
};
