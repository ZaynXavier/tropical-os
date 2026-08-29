/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONAL ISSUE PANEL & REPORTING
 * Real-time operational incident / bottleneck log with resolution workflow,
 * severity badges, and station tagging.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Layers,
  User,
  Search,
  Filter,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  OperationalIssue,
  OperationalArea,
  OperationalStation,
} from '../../types/operations';
import { Employee } from '../../types/employee';
import { operationsService } from '../../services/operationsService';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { permissionService } from '../../services/permissionService';

interface OperationalIssuePanelProps {
  issues: OperationalIssue[];
  areas: OperationalArea[];
  stations: OperationalStation[];
  onRefresh: () => void;
  currentUserEmployeeId?: string;
  canManage?: boolean;
}

export const OperationalIssuePanel: React.FC<OperationalIssuePanelProps> = ({
  issues,
  areas,
  stations,
  onRefresh,
  currentUserEmployeeId = 'emp-02',
  canManage = true,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  // Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    description: '',
    severity: 'HIGH' as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    areaId: areas[0]?.id || 'area-kitchen',
    stationId: stations[0]?.id || '',
    assignedToId: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resolve Action State
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const areaMap = new Map<string, OperationalArea>(areas.map((a) => [a.id, a]));
  const stationMap = new Map<string, OperationalStation>(stations.map((s) => [s.id, s]));
  const empMap = new Map<string, Employee>(INITIAL_EMPLOYEES.map((e) => [e.id, e]));

  const filteredIssues = issues.filter((iss) => {
    const searchLower = (search || '').toLowerCase();
    const titleStr = (iss.title || '').toLowerCase();
    const descStr = (iss.description || '').toLowerCase();
    const matchesSearch = !searchLower || titleStr.includes(searchLower) || descStr.includes(searchLower);
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || iss.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const currentEmployee = empMap.get(currentUserEmployeeId) || INITIAL_EMPLOYEES.find(e => e.id === currentUserEmployeeId) || null;
  const assignableEmployees = permissionService.getAssignableEmployees(
    currentEmployee as any,
    INITIAL_EMPLOYEES.filter((e) => e.status === 'ACTIVE')
  );

  const handleOpenReportModal = () => {
    const defaultAssignee = assignableEmployees.length > 0 ? assignableEmployees[0].id : '';
    setReportFormData({
      title: '',
      description: '',
      severity: 'HIGH',
      areaId: areas[0]?.id || 'area-kitchen',
      stationId: stations[0]?.id || '',
      assignedToId: defaultAssignee,
    });
    setErrorMsg(null);
    setIsReportModalOpen(true);
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFormData.title.trim() || !reportFormData.description.trim()) {
      setErrorMsg('Mohon isi judul dan deskripsi masalah.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await operationsService.createOperationalIssue({
        title: reportFormData.title.trim(),
        description: reportFormData.description.trim(),
        category: 'EQUIPMENT',
        date: new Date().toISOString().split('T')[0],
        severity: reportFormData.severity,
        status: 'OPEN',
        areaId: reportFormData.areaId,
        stationId: reportFormData.stationId || '',
        reportedBy: currentUserEmployeeId,
        assignedTo: reportFormData.assignedToId || undefined,
      });
      onRefresh();
      setIsReportModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melaporkan kendala operasional.');
    } finally {
      setSaving(false);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    if (!resolutionNotes.trim()) {
      setErrorMsg('Mohon isi catatan penyelesaian.');
      return;
    }
    setResolving(true);
    try {
      await operationsService.resolveOperationalIssue(
        issueId,
        resolutionNotes.trim(),
        currentUserEmployeeId
      );
      onRefresh();
      setResolvingIssueId(null);
      setResolutionNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyelesaikan kendala.');
    } finally {
      setResolving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded-md text-[10px] border border-rose-500/40 animate-pulse">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-md text-[10px] border border-amber-500/40">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-medium rounded-md text-[10px] border border-blue-500/40">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 font-medium rounded-md text-[10px] border border-white/10">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kendala / issue operasional..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#0B0F19] font-medium text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
          >
            <option value="ALL">Semua Status ({issues.length})</option>
            <option value="OPEN">Open (Belum Selesai)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved (Selesai)</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#0B0F19] font-medium text-white [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
          >
            <option value="ALL">Semua Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenReportModal}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Laporkan Kendala
        </button>
      </div>

      {/* Issues Table */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Kendala / Masalah</th>
                <th className="px-4 py-3.5">Area & Stasiun</th>
                <th className="px-4 py-3.5">Pelapor & PIC</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada kendala operasional yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => {
                  const area = areaMap.get(iss.areaId);
                  const stn = iss.stationId ? stationMap.get(iss.stationId) : null;
                  const reporter = empMap.get(iss.reportedBy);
                  const pic = iss.assignedTo ? empMap.get(iss.assignedTo) : null;

                  return (
                    <tr key={iss.id} className="hover:bg-[#1E2438]/50 transition">
                      <td className="px-4 py-3.5">{getSeverityBadge(iss.severity)}</td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <span className="font-bold text-white text-sm block">
                          {iss.title || iss.description || `Kendala #${iss.issueNumber}`}
                        </span>
                        {iss.title && (
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {iss.description}
                          </p>
                        )}
                        {iss.resolutionNotes && (
                          <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-[11px] text-emerald-300">
                            <strong>Solusi:</strong> {iss.resolutionNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-medium text-white block text-xs">
                            {area?.name || iss.areaId}
                          </span>
                          {stn && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              Stn: {stn.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] space-y-0.5">
                          <p className="text-slate-300">
                            Oleh: <span className="font-medium text-white">{reporter?.fullName || reporter?.name || iss.reportedBy}</span>
                          </p>
                          {pic && (
                            <p className="text-slate-400">
                              PIC: <span className="font-medium text-slate-200">{pic.fullName || pic.name}</span>
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            {new Date(iss.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            iss.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : iss.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {iss.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {iss.status !== 'RESOLVED' && canManage && (
                          <button
                            type="button"
                            onClick={() => setResolvingIssueId(iss.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Issue Drawer / Prompt */}
      {resolvingIssueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-6 space-y-4 text-white">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selesaikan Kendala Operasional
            </h4>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Tuliskan tindakan perbaikan yang telah dilakukan..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setResolvingIssueId(null)}
                className="px-3.5 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={() => handleResolveIssue(resolvingIssueId)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {resolving ? 'Memproses...' : 'Tandai Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#151B2B] rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-white">
            <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Laporkan Kendala Operasional</h3>
                  <p className="text-xs text-slate-400">Catat kendala teknis atau operasional floor</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Kendala</label>
                <input
                  type="text"
                  value={reportFormData.title}
                  onChange={(e) => setReportFormData({ ...reportFormData, title: e.target.value })}
                  placeholder="Contoh: Chiller daging drop suhu / Gas fryer bocor..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkat Keparahan (Severity)</label>
                  <select
                    value={reportFormData.severity}
                    onChange={(e) => setReportFormData({ ...reportFormData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="CRITICAL">CRITICAL (Hentikan Operasi)</option>
                    <option value="HIGH">HIGH (Mempengaruhi Layanan)</option>
                    <option value="MEDIUM">MEDIUM (Dapat Diatasi Cepat)</option>
                    <option value="LOW">LOW (Catatan Perawatan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Area Operasional</label>
                  <select
                    value={reportFormData.areaId}
                    onChange={(e) => setReportFormData({ ...reportFormData, areaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                    required
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Stasiun Terkait (Opsional)</label>
                <select
                  value={reportFormData.stationId}
                  onChange={(e) => setReportFormData({ ...reportFormData, stationId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500"
                >
                  <option value="">-- Tidak Spesifik ke Stasiun --</option>
                  {stations
                    .filter((s) => s.areaId === reportFormData.areaId)
                    .map((stn) => (
                      <option key={stn.id} value={stn.id}>
                        {stn.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi Detail Masalah</label>
                <textarea
                  rows={3}
                  value={reportFormData.description}
                  onChange={(e) => setReportFormData({ ...reportFormData, description: e.target.value })}
                  placeholder="Jelaskan kondisi aktual, dampak, dan tindakan sementara yang sudah diambil..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">Tugaskan PIC Penanganan</label>
                  <span className="text-[10px] text-purple-300">
                    {currentEmployee?.accessLevel === 'HEAD'
                      ? `Divisi ${currentEmployee.department}`
                      : currentEmployee?.accessLevel === 'OWNER'
                      ? 'Delegasi ke Manajer & Staf'
                      : 'Bawahan Langsung'}
                  </span>
                </div>
                <select
                  value={reportFormData.assignedToId}
                  onChange={(e) => setReportFormData({ ...reportFormData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 [&>option]:bg-[#111827] focus:outline-hidden focus:border-purple-500 text-xs"
                >
                  <option value="">-- Pilih PIC Penanganan --</option>
                  {assignableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || emp.name} — {emp.primaryPosition || emp.role} ({emp.department})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentEmployee?.accessLevel === 'HEAD'
                    ? '💡 Kepala Divisi hanya dapat menugaskan staf di bawah divisinya masing-masing.'
                    : currentEmployee?.accessLevel === 'OWNER'
                    ? '👑 Owner tidak menerima beban tugas operasional, hanya mendelegasikan tugas ke bawah.'
                    : 'Pilih staf pelaksana untuk menyelesaikan kendala operasional ini.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  {saving ? 'Mengirim...' : 'Laporkan Kendala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
