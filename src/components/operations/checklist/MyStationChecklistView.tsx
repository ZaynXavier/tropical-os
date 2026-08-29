/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — MY STATION CHECKLIST (STAFF EXECUTION VIEW)
 * Mobile-first daily checklist execution view for on-duty station personnel.
 * Large touch targets, instant numeric/photo evidence capture, CCP warnings,
 * offline-safe state, and submit for supervisor verification.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  AlertTriangle,
  BookOpen,
  FileText,
  ShieldAlert,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import { DailyChecklist, ChecklistExecution } from '../../../types/operationsChecklist';
import { Employee } from '../../../types/employee';
import { operationsChecklistService } from '../../../services/operationsChecklistService';
import { ChecklistEvidenceModal } from './ChecklistEvidenceModal';
import { ChecklistIssueReportModal } from './ChecklistIssueReportModal';
import { SopIkaViewerModal } from './SopIkaViewerModal';

interface MyStationChecklistViewProps {
  currentEmployee: Employee;
  selectedDate?: string;
  selectedShiftId?: string;
  onRefreshParent?: () => void;
}

export const MyStationChecklistView: React.FC<MyStationChecklistViewProps> = ({
  currentEmployee,
  selectedDate = '2026-08-18',
  selectedShiftId = 'shift-pagi',
  onRefreshParent,
}) => {
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<DailyChecklist[]>([]);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);

  // Evidence modal state
  const [evidenceTarget, setEvidenceTarget] = useState<{ checklistId: string; item: ChecklistExecution } | null>(null);

  // Fail / Issue modal state
  const [failTarget, setFailTarget] = useState<{ checklistId: string; item: ChecklistExecution; stationName: string } | null>(null);

  // SOP / IKA modal state
  const [sopIkaTarget, setSopIkaTarget] = useState<{ sopId?: string; ikaId?: string } | null>(null);

  // Inline numeric input buffers: executionId -> string
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  // Inline note input buffers: executionId -> string
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  const loadMyChecklists = async () => {
    setLoading(true);
    try {
      // Find checklists for current employee or station
      const list = await operationsChecklistService.getDailyChecklists({
        date: selectedDate,
        shiftId: selectedShiftId,
      });

      // Filter by current employee, or show available checklists if manager/lead
      const userChecklists = list.filter((c) => c.assignedEmployeeId === currentEmployee.id);
      const displayList = userChecklists.length > 0 ? userChecklists : list;

      setChecklists(displayList);
      if (displayList.length > 0 && !activeChecklistId) {
        setActiveChecklistId(displayList[0].id);
      }
    } catch (err) {
      console.error('Failed to load my checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyChecklists();
  }, [selectedDate, selectedShiftId, currentEmployee.id]);

  const activeChecklist = checklists.find((c) => c.id === activeChecklistId) || checklists[0];

  // Start Checklist
  const handleStart = async (chkId: string) => {
    try {
      await operationsChecklistService.startChecklist(chkId, currentEmployee.id, currentEmployee.name);
      await loadMyChecklists();
      setFeedbackMsg({ type: 'SUCCESS', text: 'Checklist berhasil dimulai. Silakan periksa setiap task.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'ERROR', text: err.message || 'Gagal memulai checklist.' });
    }
  };

  // Mark task as PASSED
  const handlePassItem = async (checklistId: string, executionId: string, item: ChecklistExecution) => {
    try {
      const recordedValStr = numericInputs[executionId];
      let valNum: number | undefined;

      if (item.requiresNumericValue) {
        if (!recordedValStr && item.isRequired) {
          setFeedbackMsg({ type: 'ERROR', text: `Item ini memerlukan input nilai ukur (${item.unit}).` });
          return;
        }
        if (recordedValStr) {
          valNum = parseFloat(recordedValStr);
          if (isNaN(valNum)) {
            setFeedbackMsg({ type: 'ERROR', text: 'Nilai ukur harus berupa angka valid.' });
            return;
          }
        }
      }

      await operationsChecklistService.completeChecklistItem(checklistId, executionId, {
        value: valNum,
        note: noteInputs[executionId] || item.note,
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
      });

      setFeedbackMsg({ type: 'SUCCESS', text: `Task '${item.title}' LULUS verifikasi.` });
      await loadMyChecklists();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'ERROR', text: err.message || 'Gagal menyelesaikan task.' });
    }
  };

  // Submit Checklist for verification
  const handleSubmitForVerification = async (checklistId: string) => {
    try {
      await operationsChecklistService.submitChecklist(checklistId, currentEmployee.id, currentEmployee.name);
      setFeedbackMsg({
        type: 'SUCCESS',
        text: 'Checklist berhasil diajukan ke Supervisor untuk verifikasi!',
      });
      await loadMyChecklists();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'ERROR', text: err.message || 'Gagal mengajukan checklist.' });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Memuat checklist stasiun Anda...</p>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10 p-6 space-y-3">
        <Layers className="w-12 h-12 mx-auto text-slate-500 opacity-40" />
        <h4 className="text-base font-bold text-white">Tidak Ada Checklist Aktif untuk Shift Ini</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Belum ada penugasan stasiun atau checklist harian yang di-generate untuk tanggal {selectedDate} ({selectedShiftId}).
        </p>
        <button
          type="button"
          onClick={async () => {
            await operationsChecklistService.generateDailyChecklists(selectedDate, selectedShiftId);
            await loadMyChecklists();
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 inline mr-1.5" /> Auto-Generate Checklist Harian
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-lg ${
            feedbackMsg.type === 'SUCCESS'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'SUCCESS' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Checklist Selector Pills (if staff has multiple checklists, e.g. Opening & Closing) */}
      {checklists.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {checklists.map((chk) => {
            const isSelected = chk.id === activeChecklistId;
            return (
              <button
                key={chk.id}
                onClick={() => setActiveChecklistId(chk.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-[#151B2B] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{chk.stationName} ({chk.checklistType})</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                  {chk.completionPercentage}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {activeChecklist && (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          {/* Active Checklist Card Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#111827]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeChecklist.templateCode}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    Tipe: {activeChecklist.checklistType}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeChecklist.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : activeChecklist.status === 'VERIFICATION_REQUIRED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : activeChecklist.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : activeChecklist.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {activeChecklist.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeChecklist.templateTitle}</h3>
                <p className="text-xs text-slate-400">
                  Stasiun: <span className="text-slate-200 font-semibold">{activeChecklist.stationName}</span> ({activeChecklist.areaName}) • Petugas: {activeChecklist.assignedEmployeeName}
                </p>
              </div>

              {/* Top CTA Button based on status */}
              {activeChecklist.status === 'NOT_STARTED' || activeChecklist.status === 'OVERDUE' ? (
                <button
                  type="button"
                  onClick={() => handleStart(activeChecklist.id)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" /> Mulai Checklist Stasiun
                </button>
              ) : activeChecklist.status === 'IN_PROGRESS' || activeChecklist.status === 'REJECTED' ? (
                <button
                  type="button"
                  onClick={() => handleSubmitForVerification(activeChecklist.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Send className="w-4 h-4" /> Ajukan Verifikasi ({activeChecklist.completionPercentage}%)
                </button>
              ) : (
                <div className="px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    {activeChecklist.status === 'VERIFIED'
                      ? 'Telah Terverifikasi'
                      : 'Menunggu Review Supervisor'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">
                  Kemajuan Pengerjaan: {activeChecklist.completedItemsCount} / {activeChecklist.totalItemsCount} Task Selesai
                </span>
                <span className="text-emerald-400 font-bold">{activeChecklist.completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#0B0F19] rounded-full h-2.5 overflow-hidden border border-white/10">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                  style={{ width: `${activeChecklist.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rejection Alert if rejected */}
          {activeChecklist.status === 'REJECTED' && activeChecklist.rejectionReason && (
            <div className="p-3.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Instruksi Revisi Supervisor ({activeChecklist.rejectedByName}):</span>
                <p className="mt-0.5 leading-relaxed">{activeChecklist.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Task Execution Cards List (Mobile-First Touch UI) */}
          <div className="p-4 sm:p-5 space-y-3.5">
            {activeChecklist.items.map((item) => {
              const isPassed = item.status === 'PASSED';
              const isFailed = item.status === 'FAILED';
              const isPending = item.status === 'PENDING';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPassed
                      ? 'bg-[#111827]/80 border-emerald-500/30 shadow-md'
                      : isFailed
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-md'
                      : 'bg-[#111827] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/5 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4" /> : item.sequence}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                          {item.criticalControlPoint && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> CCP Titik Kritis
                            </span>
                          )}
                          {item.isRequired && (
                            <span className="text-[10px] text-rose-400 font-bold">*Wajib</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Quick SOP / IKA badges */}
                    <div className="flex items-center gap-1.5 pl-9 sm:pl-0">
                      {item.sopReferenceId && (
                        <button
                          type="button"
                          onClick={() =>
                            setSopIkaTarget({ sopId: item.sopReferenceId, ikaId: item.ikaReferenceId })
                          }
                          className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" /> {item.sopReferenceCode || 'SOP'}
                        </button>
                      )}
                      {item.ikaReferenceId && (
                        <button
                          type="button"
                          onClick={() => setSopIkaTarget({ ikaId: item.ikaReferenceId })}
                          className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> {item.ikaReferenceCode || 'IKA'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Numeric Input & Photo Proof Trigger */}
                  <div className="pl-0 sm:pl-9 mt-3 pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                      {/* Numeric Reading Input */}
                      {item.requiresNumericValue && (
                        <div className="flex items-center gap-1.5 bg-[#0B0F19] px-2.5 py-1.5 rounded-xl border border-white/10">
                          <span className="text-[11px] text-slate-400">
                            Nilai ({item.unit}):
                          </span>
                          <input
                            type="number"
                            step="any"
                            disabled={isPassed && activeChecklist.status === 'VERIFIED'}
                            value={numericInputs[item.id] !== undefined ? numericInputs[item.id] : (item.value !== undefined ? String(item.value) : '')}
                            onChange={(e) =>
                              setNumericInputs({ ...numericInputs, [item.id]: e.target.value })
                            }
                            placeholder={`${item.minValue || 0} - ${item.maxValue || 100}`}
                            className="w-20 bg-transparent text-white font-mono text-xs focus:outline-hidden font-bold"
                          />
                          {item.minValue !== undefined && item.maxValue !== undefined && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                              {item.minValue}-{item.maxValue} {item.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Photo Evidence Trigger */}
                      <button
                        type="button"
                        onClick={() => setEvidenceTarget({ checklistId: activeChecklist.id, item })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          item.evidence && item.evidence.length > 0
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : item.requiresPhoto
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-[#0B0F19] text-slate-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {item.evidence && item.evidence.length > 0
                            ? `Bukti Foto (${item.evidence.length})`
                            : item.requiresPhoto
                            ? 'Wajib Foto Bukti'
                            : 'Lampirkan Foto'}
                        </span>
                      </button>

                      {/* Optional Note input */}
                      <input
                        type="text"
                        disabled={isPassed && activeChecklist.status === 'VERIFIED'}
                        value={noteInputs[item.id] !== undefined ? noteInputs[item.id] : (item.note || '')}
                        onChange={(e) => setNoteInputs({ ...noteInputs, [item.id]: e.target.value })}
                        placeholder="Catatan inspeksi (opsional)..."
                        className="flex-1 min-w-[160px] px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
                      />
                    </div>

                    {/* Touch Action Buttons: PASS / FAIL */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setFailTarget({
                            checklistId: activeChecklist.id,
                            item,
                            stationName: activeChecklist.stationName,
                          })
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isFailed
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                            : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Gagal
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePassItem(activeChecklist.id, item.id, item)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isPassed
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : 'bg-[#0B0F19] hover:bg-emerald-600 hover:text-white text-slate-300 border border-white/10 hover:border-emerald-500'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:text-white" /> Lulus
                      </button>
                    </div>
                  </div>

                  {/* Failure banner if FAILED */}
                  {isFailed && (
                    <div className="pl-0 sm:pl-9 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kendala: {item.failureReason}</span>
                      </div>
                      {item.correctiveAction && (
                        <p className="text-[11px] text-rose-200/90 pl-5">
                          Tindakan: {item.correctiveAction}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Submit Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Pastikan semua task wajib (*) telah diperiksa sebelum mengajukan ke supervisor.
            </div>
            {activeChecklist.status !== 'VERIFIED' && activeChecklist.status !== 'VERIFICATION_REQUIRED' && (
              <button
                type="button"
                onClick={() => handleSubmitForVerification(activeChecklist.id)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" /> Ajukan Verifikasi Supervisor
              </button>
            )}
          </div>
        </div>
      )}

      {/* Evidence Photo Modal */}
      {evidenceTarget && (
        <ChecklistEvidenceModal
          isOpen={!!evidenceTarget}
          onClose={() => setEvidenceTarget(null)}
          itemTitle={evidenceTarget.item.title}
          onSaveEvidence={async (photoUrl, note) => {
            try {
              await operationsChecklistService.completeChecklistItem(
                evidenceTarget.checklistId,
                evidenceTarget.item.id,
                {
                  photoUrl,
                  note,
                  employeeId: currentEmployee.id,
                  employeeName: currentEmployee.name,
                }
              );
              setFeedbackMsg({ type: 'SUCCESS', text: 'Foto bukti berhasil disimpan.' });
              await loadMyChecklists();
            } catch (err: any) {
              setFeedbackMsg({ type: 'ERROR', text: err.message || 'Gagal menyimpan bukti foto.' });
            }
          }}
        />
      )}

      {/* Fail & Issue Report Modal */}
      {failTarget && (
        <ChecklistIssueReportModal
          isOpen={!!failTarget}
          onClose={() => setFailTarget(null)}
          item={failTarget.item}
          stationName={failTarget.stationName}
          onConfirmFail={async (data) => {
            try {
              await operationsChecklistService.failChecklistItem(
                failTarget.checklistId,
                failTarget.item.id,
                {
                  ...data,
                  employeeId: currentEmployee.id,
                  employeeName: currentEmployee.name,
                }
              );
              setFeedbackMsg({
                type: 'SUCCESS',
                text: `Kendala task dicatat.${data.createIssue ? ' Tiket issue telah diterbitkan.' : ''}`,
              });
              await loadMyChecklists();
              if (onRefreshParent) onRefreshParent();
            } catch (err: any) {
              setFeedbackMsg({ type: 'ERROR', text: err.message || 'Gagal melaporkan kendala task.' });
            }
          }}
        />
      )}

      {/* SOP / IKA Modal */}
      {sopIkaTarget && (
        <SopIkaViewerModal
          isOpen={!!sopIkaTarget}
          onClose={() => setSopIkaTarget(null)}
          sopId={sopIkaTarget.sopId}
          ikaId={sopIkaTarget.ikaId}
        />
      )}
    </div>
  );
};
