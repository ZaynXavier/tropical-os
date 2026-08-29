import React, { useState } from 'react';
import { ManagementIssue, IssueStatus, IssuePriority } from '../../data/dashboard/types';
import { DashboardService } from '../../services/dashboardService';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  UserCheck,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

interface ManagementIssuesSectionProps {
  issues: ManagementIssue[];
  onIssuesUpdated: () => void;
  userRole?: string;
}

export const ManagementIssuesSection: React.FC<ManagementIssuesSectionProps> = ({
  issues,
  onIssuesUpdated,
  userRole,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Issue Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDimension, setNewDimension] = useState('COGS');
  const [newPriority, setNewPriority] = useState<IssuePriority>('HIGH');
  const [newImpact, setNewImpact] = useState('');
  const [newImpactRp, setNewImpactRp] = useState<number>(1000000);
  const [newRootCause, setNewRootCause] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newPIC, setNewPIC] = useState('Andun (Head Kitchen)');
  const [newDeadline, setNewDeadline] = useState('2025-06-15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  const handleStatusChange = async (issueId: string, currentStatus: IssueStatus) => {
    const nextStatus: IssueStatus =
      currentStatus === 'OPEN'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
        ? 'RESOLVED'
        : 'OPEN';

    await DashboardService.updateIssueStatus(issueId, nextStatus);
    onIssuesUpdated();
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAction.trim()) return;

    setIsSubmitting(true);
    await DashboardService.createIssue({
      title: newTitle,
      dimension: newDimension as any,
      priority: newPriority,
      impact: newImpact || `Potensi dampak finansial ${formatRp(newImpactRp)}`,
      impactRp: Number(newImpactRp),
      possibleRootCause: newRootCause || 'Penyebab teridentifikasi dari evaluasi KPI',
      recommendedAction: newAction,
      responsiblePerson: (newPIC || '').split(' ')[0] || '-',
      responsibleRole: newPIC,
      deadline: newDeadline,
      status: 'OPEN',
    });

    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    // Reset Form
    setNewTitle('');
    setNewImpact('');
    setNewRootCause('');
    setNewAction('');
    onIssuesUpdated();
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
            🔥 CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ⚠️ HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ℹ️ MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            ● Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            ◐ In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (selectedStatus !== 'ALL' && issue.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && issue.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.recommendedAction.toLowerCase().includes(q) ||
        issue.responsiblePerson.toLowerCase().includes(q) ||
        issue.dimension.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Pusat Tindakan
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <span>Pelacak Isu Manajemen &amp; Tindakan Solusi (Action Items)</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Daftar temuan akar masalah dari 10 dimensi analitik beserta PIC yang ditugaskan, batas waktu, dan progres penyelesaian.
          </p>
        </div>

        {/* Action button */}
        {(userRole === 'OWNER' || userRole === 'MANAGER') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tindakan</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111827]/70 p-3 rounded-xl border border-[#2D374E]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari isu, solusi, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1E2438] border border-[#2D374E] text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#1E2438]'
            }`}
          >
            Semua ({issues.length})
          </button>
          <button
            onClick={() => setSelectedStatus('OPEN')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedStatus === 'OPEN'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-300 hover:text-white bg-[#1E2438]'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setSelectedStatus('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedStatus === 'IN_PROGRESS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-300 hover:text-white bg-[#1E2438]'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setSelectedStatus('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedStatus === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white bg-[#1E2438]'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center bg-[#111827]/40 rounded-xl border border-[#2D374E] text-gray-400 text-xs">
            Tidak ada isu atau tindakan yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl bg-[#111827]/80 border border-[#2D374E] hover:border-purple-500/40 transition-all space-y-3"
              >
                {/* Issue Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D374E]/70 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(issue.priority)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E2438] text-purple-300 border border-purple-500/20">
                      Dimensi: {issue.dimension}
                    </span>
                    <h3 className="text-xs md:text-sm font-bold text-gray-100">{issue.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getStatusBadge(issue.status)}
                    <button
                      onClick={() => handleStatusChange(issue.id, issue.status)}
                      className="px-2.5 py-1 rounded-lg bg-[#1E2438] hover:bg-[#283049] text-[10px] font-bold text-gray-300 hover:text-white border border-[#2D374E] transition-all cursor-pointer"
                      title="Klik untuk mengubah status tindakan"
                    >
                      Ubah Status ➔
                    </button>
                  </div>
                </div>

                {/* Details Grid: Root Cause, Solution, PIC & Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Col 1: Akar Masalah & Dampak */}
                  <div className="space-y-1 p-2.5 rounded-lg bg-[#1E2438]/60 border border-[#2D374E]/50">
                    <span className="text-[10px] text-gray-400 font-medium block">Akar Masalah &amp; Dampak:</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">{issue.possibleRootCause}</p>
                    <div className="text-[11px] font-bold text-rose-400 pt-0.5">
                      Dampak: {formatRp(issue.impactRp)}
                    </div>
                  </div>

                  {/* Col 2: Rekomendasi Tindakan Solusi */}
                  <div className="space-y-1 p-2.5 rounded-lg bg-[#1E2438]/60 border border-[#2D374E]/50">
                    <span className="text-[10px] text-purple-300 font-medium block">Rencana Tindakan Solusi:</span>
                    <p className="text-gray-200 text-[11px] font-medium leading-relaxed">
                      {issue.recommendedAction}
                    </p>
                  </div>

                  {/* Col 3: PIC & Progress */}
                  <div className="space-y-2 p-2.5 rounded-lg bg-[#1E2438]/60 border border-[#2D374E]/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Penanggung Jawab (PIC):</span>
                      <strong className="text-pink-300 font-bold">{issue.responsibleRole}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Target Selesai:</span>
                      <span className="text-gray-300 font-mono">{issue.deadline}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Progres Penyelesaian:</span>
                        <strong className="text-emerald-400">{issue.progressPercentage}%</strong>
                      </div>
                      <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            issue.progressPercentage === 100
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                          style={{ width: `${issue.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in text-white">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Tambah Isu / Tindakan Manajemen Baru</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Judul Isu / Temuan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selisih HPP Daging Sapi Melebihi Toleransi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Dimensi Terkait:</label>
                  <select
                    value={newDimension}
                    onChange={(e) => setNewDimension(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="SALES">Sales & Revenue</option>
                    <option value="MENU">Menu Engineering</option>
                    <option value="COGS">Food Cost & HPP</option>
                    <option value="INVENTORY">Inventory & FEFO</option>
                    <option value="LABOR">Labor & SDM</option>
                    <option value="OPEX">OPEX & Utilitas</option>
                    <option value="CX">Customer Experience</option>
                    <option value="QUALITY">Quality & SOP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Prioritas:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">🔥 CRITICAL</option>
                    <option value="HIGH">⚠️ HIGH</option>
                    <option value="MEDIUM">ℹ️ MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Estimasi Dampak Finansial (Rp):</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={newImpactRp}
                  onChange={(e) => setNewImpactRp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Akar Masalah (Root Cause):</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan faktor mendasar penyebab masalah terjadi..."
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Rekomendasi Tindakan Solusi:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Langkah perbaikan konkret yang harus dieksekusi..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">PIC (Penanggung Jawab):</label>
                  <select
                    value={newPIC}
                    onChange={(e) => setNewPIC(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Andun (Head Kitchen)">Andun (Head Kitchen)</option>
                    <option value="Alfan (Head Kitchen Sore)">Alfan (Head Kitchen Sore)</option>
                    <option value="Ulum (Cook & Purchasing)">Ulum (Cook & Purchasing)</option>
                    <option value="Tasnim (Purchasing Lead)">Tasnim (Purchasing Lead)</option>
                    <option value="Vita (Head Waiter)">Vita (Head Waiter)</option>
                    <option value="Farhan (Barista Lead)">Farhan (Barista Lead)</option>
                    <option value="Putri Okta (Supervisor Ops)">Putri Okta (Supervisor Ops)</option>
                    <option value="Heri Setiawan (Manager Ops)">Heri Setiawan (Manager Ops)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Target Deadline:</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2D374E]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#283049] text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Tindakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
