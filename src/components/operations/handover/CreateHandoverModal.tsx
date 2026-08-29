/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — CREATE HANDOVER MODAL
 * Rich creation & editing modal with automatic rule-based summary generator,
 * template auto-fill, pending task builder, and evidence attachment.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FilePlus,
  Sparkles,
  Wrench,
  Package,
  Heart,
  Shield,
  ListTodo,
  Camera,
  AlertOctagon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
} from 'lucide-react';
import {
  HandoverRecord,
  OverallCondition,
  PendingTask,
  HandoverEvidence,
} from '../../../types/handover';
import { handoverService } from '../../../services/handoverService';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import { OFFICIAL_SHIFTS } from '../../../data/mockShifts';
import { INITIAL_OPERATIONAL_AREAS } from '../../../data/mockOperationalAreas';
import { INITIAL_OPERATIONAL_STATIONS } from '../../../data/mockOperationalStations';

interface CreateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newHandover: HandoverRecord) => void;
  currentUser?: any;
}

export const CreateHandoverModal: React.FC<CreateHandoverModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  currentUser,
}) => {
  const [areaId, setAreaId] = useState('area-kitchen');
  const [stationId, setStationId] = useState('');
  const [fromShiftId, setFromShiftId] = useState('shift-pagi');
  const [toShiftId, setToShiftId] = useState('shift-siang');

  const [fromEmployeeId, setFromEmployeeId] = useState(currentUser?.id || 'emp-06');
  const [toEmployeeId, setToEmployeeId] = useState('emp-07');

  const [overallCondition, setOverallCondition] = useState<OverallCondition>('NORMAL');

  // Notes
  const [criticalNotes, setCriticalNotes] = useState('');
  const [operationalNotes, setOperationalNotes] = useState('');
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [inventoryNotes, setInventoryNotes] = useState('');
  const [guestExperienceNotes, setGuestExperienceNotes] = useState('');
  const [cleanlinessNotes, setCleanlinessNotes] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');

  // Auto summary
  const [summary, setSummary] = useState('');
  const [isAutoSummaryGenerated, setIsAutoSummaryGenerated] = useState(false);

  // Pending Tasks
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('emp-07');
  const [newTaskPriority, setNewTaskPriority] = useState<PendingTask['priority']>('HIGH');
  const [newTaskDueTime, setNewTaskDueTime] = useState('16:00');

  // Evidence
  const [evidenceList, setEvidenceList] = useState<HandoverEvidence[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Template auto fill
  useEffect(() => {
    const templates = handoverService.getAreaTemplates();
    const tpl = templates[areaId];
    if (tpl) {
      if (!equipmentNotes) {
        setEquipmentNotes(tpl.sections[1]?.defaultPrompt || '');
      }
      if (!inventoryNotes) {
        setInventoryNotes(tpl.sections[0]?.defaultPrompt || '');
      }
      if (!cleanlinessNotes) {
        setCleanlinessNotes(tpl.sections[2]?.defaultPrompt || '');
      }
    }
  }, [areaId]);

  // Auto Summary Engine trigger
  const handleGenerateSummary = () => {
    const areaObj = INITIAL_OPERATIONAL_AREAS.find((a) => a.id === areaId);
    const fromShift = OFFICIAL_SHIFTS.find((s) => s.id === fromShiftId);

    const generated = handoverService.generateHandoverSummary({
      areaId,
      areaName: areaObj?.name || 'Operasional',
      fromShiftName: fromShift?.name || 'Shift Pagi',
      condition: overallCondition,
      pendingTasksCount: pendingTasks.length,
      criticalIssuesCount: overallCondition === 'CRITICAL' ? 1 : 0,
      equipmentNotes,
      inventoryNotes,
      operationalNotes,
    });

    setSummary(generated);
    setIsAutoSummaryGenerated(true);
  };

  if (!isOpen) return null;

  const currentArea = INITIAL_OPERATIONAL_AREAS.find((a) => a.id === areaId);
  const filteredStations = INITIAL_OPERATIONAL_STATIONS.filter((s) => s.areaId === areaId);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const assignedEmp = INITIAL_EMPLOYEES.find((e) => e.id === newTaskAssignedTo);
    const newTask: PendingTask = {
      taskId: `pt-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: `Tugas operasional untuk ${currentArea?.name || 'stasiun'}`,
      areaId,
      areaName: currentArea?.name,
      priority: newTaskPriority,
      status: 'OPEN',
      assignedTo: newTaskAssignedTo,
      assignedToName: assignedEmp?.name || 'Staff',
      dueTime: newTaskDueTime,
      sourceType: 'CHECKLIST',
    };
    setPendingTasks([...pendingTasks, newTask]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (taskId: string) => {
    setPendingTasks(pendingTasks.filter((t) => t.taskId !== taskId));
  };

  const handleSimulateAddEvidence = () => {
    const SAMPLE_PHOTOS = [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    ];

    const randomImg = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
    const fromEmp = INITIAL_EMPLOYEES.find((e) => e.id === fromEmployeeId);

    const newEv: HandoverEvidence = {
      id: `ev-${Date.now()}`,
      photoUrl: randomImg,
      timestamp: new Date().toISOString(),
      uploadedBy: fromEmployeeId,
      uploadedByName: fromEmp?.name || 'Staff Pengirim',
      description: `Bukti fisik stasiun ${currentArea?.name || 'dapur'} saat serah terima`,
      category: 'STATION',
    };

    setEvidenceList([...evidenceList, newEv]);
  };

  const handleSubmit = async (status: 'SUBMITTED' | 'DRAFT') => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      let finalSummary = summary;
      if (!finalSummary.trim()) {
        const areaObj = INITIAL_OPERATIONAL_AREAS.find((a) => a.id === areaId);
        const fromShift = OFFICIAL_SHIFTS.find((s) => s.id === fromShiftId);
        finalSummary = handoverService.generateHandoverSummary({
          areaId,
          areaName: areaObj?.name || 'Operasional',
          fromShiftName: fromShift?.name || 'Shift Pagi',
          condition: overallCondition,
          pendingTasksCount: pendingTasks.length,
          criticalIssuesCount: overallCondition === 'CRITICAL' ? 1 : 0,
          equipmentNotes,
          inventoryNotes,
          operationalNotes,
        });
      }

      const areaObj = INITIAL_OPERATIONAL_AREAS.find((a) => a.id === areaId);
      const stationObj = INITIAL_OPERATIONAL_STATIONS.find((s) => s.id === stationId);
      const fromEmp = INITIAL_EMPLOYEES.find((e) => e.id === fromEmployeeId);
      const toEmp = INITIAL_EMPLOYEES.find((e) => e.id === toEmployeeId);

      const created = await handoverService.createHandover({
        areaId,
        areaName: areaObj?.name || 'Kitchen',
        department: areaObj?.name || 'Kitchen',
        stationId: stationId || undefined,
        stationName: stationObj?.name || undefined,
        fromShiftId,
        toShiftId,
        fromEmployeeId,
        fromEmployeeName: fromEmp?.name || 'Staff Pengirim',
        toEmployeeId,
        toEmployeeName: toEmp?.name || 'Staff Penerima',
        overallCondition,
        status,
        summary: finalSummary,
        criticalNotes,
        operationalNotes,
        equipmentNotes,
        inventoryNotes,
        guestExperienceNotes,
        cleanlinessNotes,
        safetyNotes,
        pendingTasks,
        evidence: evidenceList,
      });

      onSubmitSuccess(created);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal membuat serah terima shift.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0B0F19] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Buat Laporan Serah Terima Shift</h3>
              <p className="text-xs text-slate-400">
                Formulir resmi handover operasional stasiun kerja Tropical Garden Resto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Step 1: Core Selection */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              1. Identitas Area & Personel Shift
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Area */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Area Operasional *
                </label>
                <select
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    setStationId('');
                  }}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  {INITIAL_OPERATIONAL_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Stasiun Kerja (Opsional)
                </label>
                <select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  <option value="">Semua Stasiun / Area Utama</option>
                  {filteredStations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Shift */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Shift Pengirim *
                </label>
                <select
                  value={fromShiftId}
                  onChange={(e) => setFromShiftId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  {OFFICIAL_SHIFTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Shift */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Shift Penerima *
                </label>
                <select
                  value={toShiftId}
                  onChange={(e) => setToShiftId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  {OFFICIAL_SHIFTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sender Employee */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Staf Pengirim (Outgoing) *
                </label>
                <select
                  value={fromEmployeeId}
                  onChange={(e) => setFromEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  {INITIAL_EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.primaryPosition})
                    </option>
                  ))}
                </select>
              </div>

              {/* Receiver Employee */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Staf Penerima (Incoming) *
                </label>
                <select
                  value={toEmployeeId}
                  onChange={(e) => setToEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white focus:border-purple-500"
                >
                  {INITIAL_EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.primaryPosition})
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Condition Selector */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Kondisi Umum Stasiun *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverallCondition('NORMAL')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      overallCondition === 'NORMAL'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/30'
                        : 'bg-[#151B2B] text-slate-400 border-white/10'
                    }`}
                  >
                    NORMAL (Aman)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverallCondition('ATTENTION')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      overallCondition === 'ATTENTION'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-500/30'
                        : 'bg-[#151B2B] text-slate-400 border-white/10'
                    }`}
                  >
                    ATTENTION (Catatan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverallCondition('CRITICAL')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      overallCondition === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 ring-2 ring-rose-500/30 animate-pulse'
                        : 'bg-[#151B2B] text-slate-400 border-white/10'
                    }`}
                  >
                    CRITICAL (Isu Kritis)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Notes Grid */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              2. Detail Catatan Operasional Stasiun
            </h4>

            {overallCondition === 'CRITICAL' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-400 block">
                  Catatan Kritis Utama (Penting untuk Shift Penerima) *
                </label>
                <textarea
                  rows={2}
                  placeholder="Sebutkan kendala mendesak, mesin rusak, atau penanganan khusus..."
                  value={criticalNotes}
                  onChange={(e) => setCriticalNotes(e.target.value)}
                  className="w-full p-3 bg-[#151B2B] rounded-xl border border-rose-500/40 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Status Peralatan & Mesin
                </label>
                <textarea
                  rows={2}
                  value={equipmentNotes}
                  onChange={(e) => setEquipmentNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Bahan Baku & Mise En Place
                </label>
                <textarea
                  rows={2}
                  value={inventoryNotes}
                  onChange={(e) => setInventoryNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Kebersihan & Sanitasi Stasiun
                </label>
                <textarea
                  rows={2}
                  value={cleanlinessNotes}
                  onChange={(e) => setCleanlinessNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Layanan Tamu & Reservasi
                </label>
                <textarea
                  rows={2}
                  value={guestExperienceNotes}
                  onChange={(e) => setGuestExperienceNotes(e.target.value)}
                  placeholder="Catatan booking VIP, allergy request, komplain..."
                  className="w-full p-2.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Auto Summary Generator */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                3. Ringkasan Eksekutif Serah Terima
              </h4>
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Ringkasan Otomatis
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Tulis ringkasan atau klik 'Generate Ringkasan Otomatis' di atas..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 focus:border-purple-500"
            />
          </div>

          {/* Step 4: Pending Tasks */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              4. Tugas Tertunda Lintas Shift (Pending Tasks)
            </h4>

            {/* Form Add Pending Task */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-[#151B2B] p-3 rounded-xl border border-white/5">
              <input
                type="text"
                placeholder="Judul tugas (Contoh: Receiving ikan segar 15 kg)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#0B0F19] rounded-xl border border-white/10 text-xs text-white"
              >
                <option value="LOW">Priority: LOW</option>
                <option value="MEDIUM">Priority: MEDIUM</option>
                <option value="HIGH">Priority: HIGH</option>
                <option value="CRITICAL">Priority: CRITICAL</option>
              </select>
              <button
                type="button"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                + Tambah Tugas
              </button>
            </div>

            {/* List Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2 pt-1">
                {pendingTasks.map((pt) => (
                  <div
                    key={pt.taskId}
                    className="flex items-center justify-between bg-[#151B2B] px-3 py-2 rounded-xl border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                        {pt.priority}
                      </span>
                      <span className="font-semibold text-white">{pt.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        Assigned: {pt.assignedToName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(pt.taskId)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 5: Photo Evidence Attachment */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                5. Lampiran Bukti Foto ({evidenceList.length})
              </h4>
              <button
                type="button"
                onClick={handleSimulateAddEvidence}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Simulasi Ambil Foto Stasiun
              </button>
            </div>

            {evidenceList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl overflow-hidden border border-white/10 aspect-video relative group bg-black"
                  >
                    <img src={ev.photoUrl} alt="evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setEvidenceList(evidenceList.filter((e) => e.id !== ev.id))
                      }
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 rounded-lg text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0B0F19] flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {submitting ? 'Menyimpan...' : 'Serahkan Handover (Submit)'}
          </button>
        </div>
      </div>
    </div>
  );
};
