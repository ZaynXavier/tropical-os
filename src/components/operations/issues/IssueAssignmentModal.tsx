/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE ASSIGNMENT MODAL
 * Modal for assigning or reassigning PIC for an operational issue
 */

import React, { useState } from 'react';
import { X, UserCheck, Shield } from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import { permissionService } from '../../../services/permissionService';

interface IssueAssignmentModalProps {
  isOpen: boolean;
  issue: OperationalIssue | null;
  onClose: () => void;
  onSubmit: (data: {
    assignedTo: string;
    assignedToName: string;
    assignedBy: string;
    assignedByName: string;
  }) => Promise<void>;
  currentActorId?: string;
  currentActorName?: string;
}

export const IssueAssignmentModal: React.FC<IssueAssignmentModalProps> = ({
  isOpen,
  issue,
  onClose,
  onSubmit,
  currentActorId = 'emp-02',
  currentActorName = 'Heri Setiawan',
}) => {
  const [assignedTo, setAssignedTo] = useState(issue?.assignedTo || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !issue) return null;

  const currentActor = INITIAL_EMPLOYEES.find((e) => e.id === currentActorId) || null;
  const assignableEmployees = permissionService.getAssignableEmployees(
    currentActor as any,
    INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE')
  );
  const eligibleList = assignableEmployees.length > 0
    ? assignableEmployees
    : INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE' && e.accessLevel !== 'OWNER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) return;

    const emp = INITIAL_EMPLOYEES.find((e) => e.id === assignedTo);
    if (!emp) return;

    setLoading(true);
    try {
      await onSubmit({
        assignedTo: emp.id,
        assignedToName: `${emp.name} (${emp.primaryPosition})`,
        assignedBy: currentActorId,
        assignedByName: currentActorName,
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
      <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Penugasan PIC Penanganan Issue
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0B0F19] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">{issue.issueNumber}</div>
          <div className="font-bold text-white line-clamp-1">{issue.title}</div>
          <div className="text-slate-400">Area: {issue.areaName} — {issue.stationName}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Karyawan PIC *</label>
            <select
              required
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Pilih PIC Penanggung Jawab --</option>
              {eligibleList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.primaryPosition} ({e.accessLevel})
                </option>
              ))}
            </select>
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
              disabled={loading || !assignedTo}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-all disabled:opacity-50"
            >
              {loading ? 'Menugaskan...' : 'Tugaskan PIC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
