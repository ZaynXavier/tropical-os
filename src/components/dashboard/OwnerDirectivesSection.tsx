import React, { useState, useMemo } from 'react';
import { OwnerDirective, DirectivePriority, DirectiveCategory, DirectiveStatus } from '../../types/directive';
import { directiveService } from '../../services/directiveService';
import { EmployeePersonnel } from '../../types/employee';
import {
  Send,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  X,
  Target,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Filter,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface OwnerDirectivesSectionProps {
  currentUser: EmployeePersonnel | null;
  onRefresh?: () => void;
}

export const OwnerDirectivesSection: React.FC<OwnerDirectivesSectionProps> = ({ currentUser }) => {
  const [directives, setDirectives] = useState<OwnerDirective[]>(() => directiveService.getAll());
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [selectedDirective, setSelectedDirective] = useState<OwnerDirective | null>(null);

  // Form modal state for Owner creating a new directive
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'OPERATIONAL' as DirectiveCategory,
    priority: 'HIGH' as DirectivePriority,
    targetDate: '2026-08-30',
    description: '',
    expectedOutcome: '',
    kpiTarget: '',
  });

  // Reply / Progress update state for Manager/Owner inside detail modal
  const [replyText, setReplyText] = useState('');
  const [replyProgress, setReplyProgress] = useState<number>(50);

  const isOwner = currentUser?.accessLevel === 'OWNER';
  const isManager = currentUser?.accessLevel === 'MANAGER';

  const refreshList = () => {
    const updated = directiveService.getAll();
    setDirectives(updated);
    if (selectedDirective) {
      const refreshedActive = updated.find((d) => d.id === selectedDirective.id);
      setSelectedDirective(refreshedActive || null);
    }
  };

  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    directiveService.createDirective({
      title: formData.title,
      category: formData.category,
      priority: formData.priority,
      targetDate: formData.targetDate,
      description: formData.description,
      expectedOutcome: formData.expectedOutcome,
      kpiTarget: formData.kpiTarget,
      fromName: currentUser?.name || 'Tri Hermawanto',
      fromRole: 'OWNER',
      targetName: 'Rian',
      targetRole: 'General Manager',
    });

    setFormData({
      title: '',
      category: 'OPERATIONAL',
      priority: 'HIGH',
      targetDate: '2026-08-30',
      description: '',
      expectedOutcome: '',
      kpiTarget: '',
    });
    setShowCreateModal(false);
    refreshList();
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirective || !replyText.trim()) return;

    directiveService.addProgressLog(
      selectedDirective.id,
      currentUser?.name || (isOwner ? 'Tri Hermawanto' : 'Rian'),
      isOwner ? 'OWNER' : 'General Manager',
      replyText,
      replyProgress
    );

    setReplyText('');
    refreshList();
  };

  const handleMarkCompleted = (directiveId: string) => {
    directiveService.updateStatus(directiveId, 'COMPLETED', 'Diverifikasi selesai oleh Owner.');
    refreshList();
  };

  const getPriorityBadge = (p: DirectivePriority) => {
    switch (p) {
      case 'CRITICAL':
        return { label: 'CRITICAL / URGENT', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'HIGH':
        return { label: 'HIGH PRIORITY', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'MEDIUM':
        return { label: 'MEDIUM', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: 'LOW', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/40' };
    }
  };

  const getCategoryLabel = (c: DirectiveCategory) => {
    switch (c) {
      case 'OPERATIONAL':
        return 'Operasional & Stasiun';
      case 'REVENUE_SALES':
        return 'Sales & Revenue';
      case 'CUSTOMER_SERVICE':
        return 'Layanan & Tamu VIP';
      case 'HR_PEOPLE':
        return 'SDM, Presensi & Disiplin';
      case 'FOOD_COST':
        return 'Food Cost & Portion Control';
      case 'FACILITY_MAINTENANCE':
        return 'Fasilitas & Maintenance';
      case 'MARKETING_EVENT':
        return 'Marketing & Promo Event';
      default:
        return c;
    }
  };

  const getStatusBadge = (s: DirectiveStatus) => {
    switch (s) {
      case 'NEW':
        return { label: 'Baru Diberikan', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'IN_PROGRESS':
        return { label: 'Sedang Dikerjakan', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'WAITING_REVIEW':
        return { label: 'Menunggu Review Owner', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'COMPLETED':
        return { label: 'Selesai & Terverifikasi', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  const filteredDirectives = useMemo(() => {
    return directives.filter((d) => {
      if (activeTab === 'ACTIVE') return d.status !== 'COMPLETED';
      if (activeTab === 'COMPLETED') return d.status === 'COMPLETED';
      return true;
    });
  }, [directives, activeTab]);

  const activeCount = useMemo(() => directives.filter((d) => d.status !== 'COMPLETED').length, [directives]);
  const completedCount = useMemo(() => directives.filter((d) => d.status === 'COMPLETED').length, [directives]);

  return (
    <div className="bg-[#111827] rounded-3xl border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6 text-white">
      {/* Header & Directive Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D374E] pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30">
            <Send className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Instruksi &amp; Arahan Owner ke General Manager</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeCount} Arahan Berjalan
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Pemberian instruksi strategis langsung dari Owner (Tri Hermawanto) kepada General Manager (Rian) beserta tracking eksekusi
            </p>
          </div>
        </div>

        {/* Button to Create New Directive (Available for Owner or Manager for demo) */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Beri Instruksi Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-[#1E2438] text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Sedang Berjalan ({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-[#1E2438] text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Selesai &amp; Terverifikasi ({completedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-[#1E2438] text-gray-400 hover:text-gray-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Semua ({directives.length})</span>
        </button>
      </div>

      {/* Directives Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDirectives.map((directive) => {
          const priorityBadge = getPriorityBadge(directive.priority);
          const statusBadge = getStatusBadge(directive.status);

          return (
            <div
              key={directive.id}
              onClick={() => {
                setSelectedDirective(directive);
                setReplyProgress(directive.progressPercentage);
              }}
              className="p-5 rounded-2xl bg-[#1E2438]/80 border border-[#2D374E] hover:border-purple-500/60 hover:bg-[#1E2438] transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              {/* Header Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {directive.code}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${priorityBadge.bg}`}>
                      {priorityBadge.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-100 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {directive.title}
                </h3>

                {/* Category & Assignees */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-[11px] text-purple-300 font-medium">
                    {getCategoryLabel(directive.category)}
                  </span>
                  <span>•</span>
                  <span className="text-[11px] text-gray-400">
                    Kepada: <strong className="text-gray-200">{directive.targetName} ({directive.targetRole})</strong>
                  </span>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-gray-300 line-clamp-2 bg-[#121829]/60 p-2.5 rounded-xl border border-[#2D374E]/60">
                  {directive.description}
                </p>
              </div>

              {/* Progress & Target Date */}
              <div className="space-y-2 pt-2 border-t border-[#2D374E]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target: <strong>{directive.targetDate}</strong></span>
                  </div>
                  <div className="font-bold text-purple-300">{directive.progressPercentage}% Selesai</div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#121829] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      directive.progressPercentage === 100
                        ? 'bg-emerald-500'
                        : directive.progressPercentage > 50
                        ? 'bg-purple-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${directive.progressPercentage}%` }}
                  />
                </div>

                {/* Latest Log Preview */}
                {directive.logs && directive.logs.length > 0 && (
                  <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                    <span className="truncate max-w-[280px]">
                      💬 {directive.logs[directive.logs.length - 1].authorName}: "{directive.logs[directive.logs.length - 1].message}"
                    </span>
                    <span className="text-purple-400 font-semibold shrink-0 group-hover:underline">
                      Review &rarr;
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDirectives.length === 0 && (
        <div className="text-center py-12 bg-[#1E2438]/40 rounded-2xl border border-[#2D374E] space-y-2">
          <Send className="w-8 h-8 text-gray-500 mx-auto" />
          <div className="text-sm font-bold text-gray-300">Tidak ada instruksi pada tab ini</div>
          <div className="text-xs text-gray-500">Klik "Beri Instruksi Baru" untuk memberikan arahan strategis ke General Manager.</div>
        </div>
      )}

      {/* Modal Buat Instruksi Baru (Owner -> Manager) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#2D374E] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white space-y-5 custom-scrollbar">
            <div className="flex items-start justify-between border-b border-[#2D374E] pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  <span>Beri Instruksi / Arahan ke General Manager</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dari: <strong>{currentUser?.name || 'Tri Hermawanto'} (OWNER)</strong> &rarr; Kepada: <strong>Rian (General Manager)</strong>
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirective} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">Judul Instruksi / Arahan Strategis</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Audit Stasiun Bar & Standarisasi Pemakaian Syrup..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-300">Kategori Instruksi</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DirectiveCategory })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="OPERATIONAL">Operasional &amp; Stasiun</option>
                    <option value="FOOD_COST">Food Cost &amp; Portion Control</option>
                    <option value="CUSTOMER_SERVICE">Layanan &amp; Tamu VIP</option>
                    <option value="REVENUE_SALES">Sales &amp; Revenue</option>
                    <option value="HR_PEOPLE">SDM, Presensi &amp; Disiplin</option>
                    <option value="FACILITY_MAINTENANCE">Fasilitas &amp; Maintenance</option>
                    <option value="MARKETING_EVENT">Marketing &amp; Promo Event</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-300">Tingkat Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as DirectivePriority })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL / URGENT (Segera)</option>
                    <option value="HIGH">🟠 HIGH PRIORITY (Penting)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Standar)</option>
                    <option value="LOW">🔵 LOW (Jangka Panjang)</option>
                  </select>
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">Target Tanggal Selesai (Deadline)</label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Detail Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">Rincian Instruksi &amp; Arahan Eksekusi</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan secara jelas poin-poin yang perlu diperbaiki atau disiapkan oleh tim manajemen..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Expected Outcome & KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-300">Output yang Diharapkan</label>
                  <input
                    type="text"
                    placeholder="Contoh: CSAT meningkat, zero complaint..."
                    value={formData.expectedOutcome}
                    onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-300">Target Metrik / KPI</label>
                  <input
                    type="text"
                    placeholder="Contoh: Food Cost ≤ 31.5%"
                    value={formData.kpiTarget}
                    onChange={(e) => setFormData({ ...formData, kpiTarget: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D374E]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Instruksi Resmi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail / Tracking Instruksi & Komunikasi Manager */}
      {selectedDirective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#2D374E] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white space-y-5 custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#2D374E] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedDirective.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(selectedDirective.priority).bg}`}>
                    {getPriorityBadge(selectedDirective.priority).label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedDirective.status).bg}`}>
                    {getStatusBadge(selectedDirective.status).label}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white mt-1">{selectedDirective.title}</h3>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>Dari: <strong>{selectedDirective.fromName} ({selectedDirective.fromRole})</strong></span>
                  <span>&rarr;</span>
                  <span>Kepada: <strong>{selectedDirective.targetName} ({selectedDirective.targetRole})</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDirective(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Directive Details */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-2">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Rincian Instruksi Owner:</span>
                </div>
                <p className="text-gray-200 leading-relaxed">{selectedDirective.description}</p>
                {selectedDirective.expectedOutcome && (
                  <div className="pt-2 border-t border-[#2D374E]/80 text-[11px] text-gray-400">
                    <strong>Target Output:</strong> {selectedDirective.expectedOutcome}
                  </div>
                )}
                {selectedDirective.kpiTarget && (
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    🎯 KPI Target: {selectedDirective.kpiTarget}
                  </div>
                )}
              </div>

              {/* Progress Bar in Detail */}
              <div className="p-4 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-300">Progress Eksekusi Tim Manajemen</span>
                  <span className="font-mono font-bold text-purple-300">{selectedDirective.progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#121829] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedDirective.progressPercentage === 100
                        ? 'bg-emerald-500'
                        : selectedDirective.progressPercentage > 50
                        ? 'bg-purple-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${selectedDirective.progressPercentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 flex items-center justify-between">
                  <span>Dibuat: {selectedDirective.createdAt}</span>
                  <span>Target Deadline: <strong className="text-white">{selectedDirective.targetDate}</strong></span>
                </div>
              </div>

              {/* Timeline / Communication Thread */}
              <div className="space-y-2.5">
                <div className="font-bold text-gray-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Riwayat Eksekusi &amp; Catatan Tindak Lanjut:</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedDirective.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#1E2438]/90 border border-[#2D374E] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-purple-300">{log.authorName} ({log.authorRole})</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-gray-200">{log.message}</p>
                      {typeof log.progressPercentage === 'number' && (
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Update Progress: {log.progressPercentage}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to Add Progress / Notes */}
              <form onSubmit={handleAddReply} className="space-y-3 pt-2 border-t border-[#2D374E]">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">
                    Tulis Catatan / Update Eksekusi ({currentUser?.name || (isOwner ? 'Tri Hermawanto' : 'Rian')})
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Laporkan progres, hasil koordinasi dengan tim stasiun, atau instruksi tambahan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1E2438] border border-[#2D374E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Set Progres:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={replyProgress}
                      onChange={(e) => setReplyProgress(Number(e.target.value))}
                      className="w-28 accent-purple-500"
                    />
                    <span className="font-mono font-bold text-purple-300">{replyProgress}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedDirective.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(selectedDirective.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verifikasi Selesai</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Update</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
