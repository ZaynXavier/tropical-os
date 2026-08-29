/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — STATION ASSIGNMENT MODAL
 * Modal dialog for assigning or reassigning an employee to an operational station
 * with real-time conflict detection and capacity guidance.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  User,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  OperationalArea,
  OperationalStation,
  OperationalRole,
  StationAssignment,
} from '../../types/operations';
import { operationsService } from '../../services/operationsService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { OFFICIAL_SHIFTS } from '../../data/mockShifts';
import { permissionService } from '../../services/permissionService';

interface StationAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStationId?: string;
  initialAreaId?: string;
  initialShiftId?: string;
  initialDate?: string;
  editingAssignment?: StationAssignment | null;
  currentUserEmployeeId?: string;
}

export const StationAssignmentModal: React.FC<StationAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStationId,
  initialAreaId,
  initialShiftId = 'shift-pagi',
  initialDate,
  editingAssignment,
  currentUserEmployeeId = 'emp-02',
}) => {
  const [areas, setAreas] = useState<OperationalArea[]>([]);
  const [stations, setStations] = useState<OperationalStation[]>([]);
  const [roles, setRoles] = useState<OperationalRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [shiftId, setShiftId] = useState(initialShiftId);
  const [areaId, setAreaId] = useState(initialAreaId || '');
  const [stationId, setStationId] = useState(initialStationId || '');
  const [employeeId, setEmployeeId] = useState('');
  const [operationalRoleId, setOperationalRoleId] = useState('');
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Current actor employee
  const currentActor = INITIAL_EMPLOYEES.find((e) => e.id === currentUserEmployeeId) || null;

  // Eligible employees: non-Owner, active personnel, filtered by role authority
  const assignablePersonnel = permissionService.getAssignableEmployees(
    currentActor as any,
    INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE')
  );
  const eligibleEmployees = assignablePersonnel.length > 0
    ? assignablePersonnel
    : INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE' && e.accessLevel !== 'OWNER');

  useEffect(() => {
    if (!isOpen) return;

    const loadMasterData = async () => {
      setLoading(true);
      try {
        const [aList, sList, rList] = await Promise.all([
          operationsService.getOperationalAreas(),
          operationsService.getStations({ status: 'ACTIVE' }),
          operationsService.getOperationalRoles({ status: 'ACTIVE' }),
        ]);
        setAreas(aList.filter((a) => a.status === 'ACTIVE'));
        setStations(sList);
        setRoles(rList);

        if (editingAssignment) {
          setDate(editingAssignment.date);
          setShiftId(editingAssignment.shiftId);
          setAreaId(editingAssignment.areaId);
          setStationId(editingAssignment.stationId);
          setEmployeeId(editingAssignment.employeeId);
          setOperationalRoleId(editingAssignment.operationalRoleId);
          setNotes(editingAssignment.notes || '');
        } else {
          if (initialAreaId) setAreaId(initialAreaId);
          else if (aList.length > 0) setAreaId(aList[0].id);

          if (initialStationId) {
            setStationId(initialStationId);
            const selectedStn = sList.find((s) => s.id === initialStationId);
            if (selectedStn) {
              setAreaId(selectedStn.areaId);
              if (selectedStn.defaultRoleId) {
                setOperationalRoleId(selectedStn.defaultRoleId);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading master data for assignment modal:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMasterData();
  }, [isOpen, initialStationId, initialAreaId, initialShiftId, initialDate, editingAssignment]);

  // When area changes, update available stations and auto-select first station if current is invalid
  const filteredStations = stations.filter((s) => !areaId || s.areaId === areaId);

  // Check conflicts in real-time
  useEffect(() => {
    if (!employeeId || !date || !shiftId) {
      setConflictWarning(null);
      return;
    }

    const checkConflict = async () => {
      const res = await operationsService.validateAssignmentConflict(
        employeeId,
        date,
        shiftId,
        editingAssignment?.id
      );
      if (res.hasConflict && res.message) {
        setConflictWarning(res.message);
      } else {
        setConflictWarning(null);
      }
    };

    checkConflict();
  }, [employeeId, date, shiftId, editingAssignment]);

  const handleStationChange = (newStnId: string) => {
    setStationId(newStnId);
    const selectedStn = stations.find((s) => s.id === newStnId);
    if (selectedStn) {
      setAreaId(selectedStn.areaId);
      if (selectedStn.defaultRoleId) {
        setOperationalRoleId(selectedStn.defaultRoleId);
      }
    }
  };

  const handleEmployeeChange = (newEmpId: string) => {
    setEmployeeId(newEmpId);
    const emp = eligibleEmployees.find((e) => e.id === newEmpId);
    if (emp) {
      // Intelligent default role based on employee's department/role
      const matchedRole = roles.find((r) => {
        const roleName = r.name.toLowerCase();
        const pos = (emp.primaryPosition || emp.role || '').toLowerCase();
        return roleName.includes(pos) || pos.includes(roleName);
      });
      if (matchedRole && !operationalRoleId) {
        setOperationalRoleId(matchedRole.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeId || !stationId || !areaId || !operationalRoleId || !date || !shiftId) {
      setErrorMessage('Mohon lengkapi seluruh field penugasan wajib.');
      return;
    }

    if (conflictWarning) {
      setErrorMessage('Tidak dapat menyimpan: terjadi konflik jadwal penugasan karyawan.');
      return;
    }

    setSaving(true);
    try {
      if (editingAssignment) {
        await operationsService.updateStationAssignment(editingAssignment.id, {
          employeeId,
          areaId,
          stationId,
          operationalRoleId,
          date,
          shiftId,
          notes,
          updatedBy: currentUserEmployeeId,
        });
      } else {
        await operationsService.createStationAssignment({
          employeeId,
          areaId,
          stationId,
          operationalRoleId,
          date,
          shiftId,
          status: 'ACTIVE',
          assignedBy: currentUserEmployeeId,
          notes,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan penugasan stasiun.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedStationObj = stations.find((s) => s.id === stationId);
  const selectedEmpObj = eligibleEmployees.find((e) => e.id === employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="station-assignment-modal"
        className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] border-b border-white/10 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingAssignment ? 'Edit Penugasan Stasiun' : 'Penugasan Stasiun Operasional'}
              </h3>
              <p className="text-xs text-slate-400">
                Alokasi personel Tropical Garden Resto ke stasiun & peran operasional harian
              </p>
            </div>
          </div>
          <button
            id="btn-close-assignment-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#151B2B]">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-200">Perhatian</p>
                <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {conflictWarning && (
            <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-start gap-3 text-amber-200 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">Konflik Penugasan Terdeteksi</p>
                <p className="text-xs text-amber-300 mt-0.5">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* Date & Shift Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Tanggal Operasional
              </label>
              <input
                id="input-assignment-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Shift Operasional
              </label>
              <select
                id="select-assignment-shift"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
                required
              >
                {OFFICIAL_SHIFTS.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name} ({sh.startTime} - {sh.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area & Station Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> Operational Area
              </label>
              <select
                id="select-assignment-area"
                value={areaId}
                onChange={(e) => {
                  setAreaId(e.target.value);
                  const validInArea = stations.filter((s) => s.areaId === e.target.value);
                  if (validInArea.length > 0) {
                    handleStationChange(validInArea[0].id);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
                required
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.code}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Operational Station
              </label>
              <select
                id="select-assignment-station"
                value={stationId}
                onChange={(e) => handleStationChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
                required
              >
                <option value="" disabled>Pilih Stasiun Kerja</option>
                {filteredStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Min: {s.minimumStaff}, Rec: {s.recommendedStaff})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Station Staffing Capacity Snapshot */}
          {selectedStationObj && (
            <div className="p-3 bg-[#0B0F19] border border-white/10 rounded-xl flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium text-slate-400">Kapasitas Stasiun:</span>
              <div className="flex items-center gap-3">
                <span className="bg-[#1E2438] text-slate-300 border border-white/10 px-2 py-0.5 rounded-md font-mono">
                  Min: {selectedStationObj.minimumStaff}
                </span>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-medium">
                  Ideal: {selectedStationObj.recommendedStaff}
                </span>
                <span className="bg-[#1E2438] text-slate-300 border border-white/10 px-2 py-0.5 rounded-md font-mono">
                  Max: {selectedStationObj.maximumStaff}
                </span>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" /> Personel / Karyawan
            </label>
            <select
              id="select-assignment-employee"
              value={employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
              required
            >
              <option value="" disabled>Pilih Personel Tropical Garden</option>
              {eligibleEmployees.map((emp) => {
                const addResp = emp.additionalResponsibilities?.length
                  ? ` + [${emp.additionalResponsibilities.join(', ')}]`
                  : '';
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName || emp.name} — {emp.primaryPosition || emp.role} ({emp.department || emp.division})
                    {addResp}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Employee Badge & Details Info */}
          {selectedEmpObj && (
            <div className="p-3 bg-[#0B0F19] border border-purple-500/30 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {selectedEmpObj.fullName || selectedEmpObj.name}
                </span>
                <span className="text-purple-300 font-mono text-[11px] bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  {selectedEmpObj.employeeCode || selectedEmpObj.id}
                </span>
              </div>
              <p className="text-slate-400">
                Divisi: <span className="font-medium text-slate-200">{selectedEmpObj.department || selectedEmpObj.division}</span> | Posisi: <span className="font-medium text-slate-200">{selectedEmpObj.primaryPosition || selectedEmpObj.role}</span>
              </p>
              {selectedEmpObj.additionalResponsibilities && selectedEmpObj.additionalResponsibilities.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-slate-400 text-[10px]">Tanggung Jawab Khusus:</span>
                  {selectedEmpObj.additionalResponsibilities.map((resp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-medium"
                    >
                      {resp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Operational Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Peran Operasional (Operational Role)
            </label>
            <select
              id="select-assignment-role"
              value={operationalRoleId}
              onChange={(e) => setOperationalRoleId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-hidden focus:border-purple-500 transition cursor-pointer [&>option]:bg-[#111827] [&>option]:text-white"
              required
            >
              <option value="" disabled>Pilih Peran Operasional</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Instruksi Khusus Shift
            </label>
            <textarea
              id="textarea-assignment-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Fokus pada kalibrasi rasa kuah kaldu & persiapan receiving sayur..."
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111827] border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-cancel-assignment"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-[#0B0F19] border border-white/10 hover:bg-[#1E2438] rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            id="btn-save-assignment"
            onClick={handleSubmit}
            disabled={saving || loading || !!conflictWarning}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            {saving ? (
              <>Menyimpan...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {editingAssignment ? 'Perbarui Penugasan' : 'Tetapkan Penugasan'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
