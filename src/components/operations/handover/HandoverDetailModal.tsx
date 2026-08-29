/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER DETAIL INSPECTOR MODAL
 * Comprehensive 15-section inspector modal for TropicalOS Shift Handovers
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  ListTodo,
  Wrench,
  Package,
  Heart,
  Sparkles,
  Shield,
  Camera,
  History,
  Download,
  RotateCcw,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { HandoverRecord } from '../../../types/handover';
import { HandoverAuditTrail } from './HandoverAuditTrail';
import { HandoverEvidenceModal } from './HandoverEvidenceModal';

interface HandoverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: HandoverRecord | null;
  onReceive?: (handover: HandoverRecord) => void;
  onVerify?: (handover: HandoverRecord) => void;
  onRequestRevision?: (handover: HandoverRecord) => void;
  onCancel?: (handover: HandoverRecord) => void;
  currentUserId?: string;
  canVerify?: boolean;
  canReceive?: boolean;
  canCancel?: boolean;
}

export const HandoverDetailModal: React.FC<HandoverDetailModalProps> = ({
  isOpen,
  onClose,
  handover,
  onReceive,
  onVerify,
  onRequestRevision,
  onCancel,
  currentUserId,
  canVerify,
  canReceive,
  canCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'NOTES' | 'TASKS' | 'EVIDENCE' | 'AUDIT'>('OVERVIEW');
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  if (!isOpen || !handover) return null;

  const getConditionBadge = (condition: HandoverRecord['overallCondition']) => {
    switch (condition) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            NORMAL (Optimal)
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
            ATTENTION (Perlu Perhatian)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertOctagon className="w-4 h-4" />
            CRITICAL (Tindakan Segera)
          </span>
        );
    }
  };

  const getStatusBadge = (status: HandoverRecord['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terverifikasi Supervisor
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Diterima Shift Penerima
          </span>
        );
      case 'SUBMITTED':
      case 'PENDING_RECEIPT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Diterima
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Perlu Revisi Catatan
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Draft
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0B0F19] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono font-bold text-purple-300">
                    {handover.handoverNumber}
                  </span>
                  {getStatusBadge(handover.status)}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Laporan Serah Terima {handover.areaName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                title="Cetak Laporan Handover"
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 px-4 pt-3 bg-[#0B0F19]/80 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'OVERVIEW'
                  ? 'bg-[#151B2B] text-purple-300 border-white/10 border-b-[#151B2B]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              Ringkasan Utama
            </button>
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'NOTES'
                  ? 'bg-[#151B2B] text-purple-300 border-white/10 border-b-[#151B2B]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              Catatan Stasiun
            </button>
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
                activeTab === 'TASKS'
                  ? 'bg-[#151B2B] text-purple-300 border-white/10 border-b-[#151B2B]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Tugas & Isu ({handover.pendingTasks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
                activeTab === 'EVIDENCE'
                  ? 'bg-[#151B2B] text-purple-300 border-white/10 border-b-[#151B2B]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Bukti Foto ({handover.evidence?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
                activeTab === 'AUDIT'
                  ? 'bg-[#151B2B] text-purple-300 border-white/10 border-b-[#151B2B]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Trail
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-5">
                {/* Condition Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0B0F19] rounded-2xl p-4 border border-white/10 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Status Kondisi Shift Operasional
                    </span>
                    <div className="mt-1">{getConditionBadge(handover.overallCondition)}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Critical Issues</span>
                      <span
                        className={`font-bold ${
                          handover.criticalIssueCount > 0 ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {handover.criticalIssueCount} Isu
                      </span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="text-slate-500 block text-[10px]">Pending Tasks</span>
                      <span className="font-bold text-purple-300">
                        {handover.pendingTasks?.length || 0} Tugas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transition Personnel Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#0B0F19] rounded-2xl p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                        Staf Pengirim (Outgoing Shift)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px]">
                        {handover.fromShiftName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-9 h-9 rounded-full bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold text-sm border border-purple-500/30">
                        {handover.fromEmployeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{handover.fromEmployeeName}</p>
                        <p className="text-xs text-slate-400">{handover.fromRole || 'Shift Staff'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0B0F19] rounded-2xl p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                        Staf Penerima (Incoming Shift)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px]">
                        {handover.toShiftName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-9 h-9 rounded-full bg-sky-600/20 text-sky-300 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                        {handover.toEmployeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{handover.toEmployeeName}</p>
                        <p className="text-xs text-slate-400">{handover.toRole || 'Shift Staff'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-[#0B0F19] rounded-2xl p-4 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Ringkasan Serah Terima Operasional
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {handover.summary}
                  </p>
                </div>

                {/* Supervisor Verification Notes if verified */}
                {handover.verifiedBy && (
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                          Verifikasi Supervisor ({handover.verifiedByName})
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80">
                        {new Date(handover.verifiedAt || '').toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/90 italic">
                      "{handover.verificationNotes || 'Verifikasi disetujui tanpa catatan.'}"
                    </p>
                  </div>
                )}

                {/* Rejection / Revision Note if requested */}
                {handover.status === 'REVISION_REQUIRED' && handover.rejectionReason && (
                  <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-xs font-bold">Catatan Permintaan Revisi:</span>
                    </div>
                    <p className="text-xs text-amber-200 italic">"{handover.rejectionReason}"</p>
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'NOTES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Equipment Notes */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Wrench className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Status Mesin & Peralatan
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {handover.equipmentNotes || 'Semua mesin dan peralatan beroperasi normal.'}
                  </p>
                </div>

                {/* Inventory Notes */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Package className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Stok Bahan & Mise En Place
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {handover.inventoryNotes || 'Stok bahan baku dan porsi aman untuk shift berikutnya.'}
                  </p>
                </div>

                {/* Guest Experience Notes */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Heart className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Catatan Tamu & VIP Service
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {handover.guestExperienceNotes || 'Layanan dining berjalan kondusif tanpa komplain.'}
                  </p>
                </div>

                {/* Cleanliness Notes */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Kebersihan & Sanitasi Stasiun
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {handover.cleanlinessNotes || 'Stasiun kerja disanitasi dan diserok bersih.'}
                  </p>
                </div>

                {/* Safety Notes */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Shield className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Keselamatan Kerja & Prosedur Keamanan
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {handover.safetyNotes || 'Valve gas, kelistrikan, dan apar fire extinguisher terlindung aman.'}
                  </p>
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === 'TASKS' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Daftar Tugas Lanjutan Lintas Shift
                </h4>

                {!handover.pendingTasks || handover.pendingTasks.length === 0 ? (
                  <div className="bg-[#0B0F19] p-8 rounded-2xl text-center border border-white/10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-medium">Tidak ada tugas tertunda.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seluruh checklist dan operasional shift telah diselesaikan penuh.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {handover.pendingTasks.map((task, idx) => (
                      <div
                        key={task.taskId || idx}
                        className="bg-[#0B0F19] p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'CRITICAL'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <h5 className="text-xs font-bold text-white">{task.title}</h5>
                          </div>
                          <p className="text-xs text-slate-400">{task.description}</p>
                        </div>

                        <div className="text-right shrink-0 text-xs text-slate-400 space-y-0.5">
                          <div>
                            Assigned: <span className="text-white font-medium">{task.assignedToName || 'Crew'}</span>
                          </div>
                          {task.dueTime && (
                            <div className="text-purple-300 font-mono text-[11px]">
                              Target: {task.dueTime} WIB
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVIDENCE TAB */}
            {activeTab === 'EVIDENCE' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Lampiran Bukti Foto Fisik
                  </h4>
                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    Buka Modal Galeri
                  </button>
                </div>

                {!handover.evidence || handover.evidence.length === 0 ? (
                  <div className="bg-[#0B0F19] p-8 rounded-2xl text-center border border-white/10">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Belum ada foto yang dilampirkan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {handover.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative bg-black group"
                      >
                        <img
                          src={ev.photoUrl}
                          alt={ev.description}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-2.5 flex flex-col justify-end">
                          <p className="text-[10px] font-semibold text-white truncate">
                            {ev.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'AUDIT' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Riwayat Audit & Jejak Aktivitas Imutabel
                </h4>
                <HandoverAuditTrail auditTrail={handover.auditTrail} />
              </div>
            )}
          </div>

          {/* Footer with Operational Action Buttons */}
          <div className="p-4 border-t border-white/10 bg-[#0B0F19] flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              Terakhir diubah: {new Date(handover.updatedAt).toLocaleString('id-ID')}
            </span>

            <div className="flex items-center gap-2">
              {/* Receiver Action */}
              {canReceive &&
                (handover.status === 'SUBMITTED' || handover.status === 'PENDING_RECEIPT') &&
                onReceive && (
                  <button
                    onClick={() => {
                      onClose();
                      onReceive(handover);
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Terima Handover
                  </button>
                )}

              {/* Supervisor Action */}
              {canVerify && handover.status === 'RECEIVED' && onVerify && (
                <button
                  onClick={() => {
                    onClose();
                    onVerify(handover);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Verifikasi Supervisor
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <HandoverEvidenceModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        evidence={handover.evidence || []}
      />
    </>
  );
};
