import React, { useState } from 'react';
import { EmployeePersonnel } from '../../../types/employee';
import { INITIAL_OPERATIONAL_ISSUES } from '../../../data/mockOperationalIssues';
import { OperationalIssue } from '../../../types/operationalIssue';
import { BeforeAfterPhotoUploader, PhotoEvidencePair } from '../components/BeforeAfterPhotoUploader';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ShieldAlert,
  ChevronRight,
  X,
  Sparkles,
  Layers,
  Wrench,
  Flame,
  Zap,
  Coffee,
  ChefHat,
  MessageSquare,
  Eye
} from 'lucide-react';

interface StaffOperationalIssuesTabProps {
  currentUser: EmployeePersonnel | null;
  onNavigateTab?: (tab: string) => void;
}

export const StaffOperationalIssuesTab: React.FC<StaffOperationalIssuesTabProps> = ({
  currentUser,
}) => {
  const [issues, setIssues] = useState<OperationalIssue[]>(INITIAL_OPERATIONAL_ISSUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'EQUIPMENT' | 'STOCK' | 'SERVICE' | 'CLEANLINESS' | 'UTILITIES'>('EQUIPMENT');
  const [formSeverity, setFormSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [formArea, setFormArea] = useState(currentUser?.department || 'Kitchen');
  const [formDescription, setFormDescription] = useState('');
  const [formPhotos, setFormPhotos] = useState<PhotoEvidencePair>({
    beforePhotoUrl: null,
    afterPhotoUrl: null,
  });

  // Detail / Resolve Modal State
  const [selectedIssue, setSelectedIssue] = useState<OperationalIssue | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvePhotos, setResolvePhotos] = useState<PhotoEvidencePair>({
    beforePhotoUrl: null,
    afterPhotoUrl: null,
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const now = new Date();
    const slaMins = formSeverity === 'CRITICAL' ? 30 : formSeverity === 'HIGH' ? 60 : 120;
    const deadline = new Date(now.getTime() + slaMins * 60000).toISOString();

    const evidenceList: any[] = [];
    if (formPhotos.beforePhotoUrl) {
      evidenceList.push({
        id: `ev-bef-${Date.now()}`,
        fileName: 'foto_kendala_awal.jpg',
        photoUrl: formPhotos.beforePhotoUrl,
        type: 'IMAGE',
        uploadedBy: currentUser?.id || 'emp-01',
        uploadedByName: currentUser?.name || 'Staff Lapangan',
        uploadedAt: now.toISOString(),
        description: 'Foto kendala sebelum ditangani',
      });
    }
    if (formPhotos.afterPhotoUrl) {
      evidenceList.push({
        id: `ev-aft-${Date.now()}`,
        fileName: 'foto_penanganan_akhir.jpg',
        photoUrl: formPhotos.afterPhotoUrl,
        type: 'IMAGE',
        uploadedBy: currentUser?.id || 'emp-01',
        uploadedByName: currentUser?.name || 'Staff Lapangan',
        uploadedAt: now.toISOString(),
        description: 'Foto kondisi setelah perbaikan / tindakan',
      });
    }

    const newIssue: OperationalIssue = {
      id: `iss-${Date.now()}`,
      issueNumber: `ISS-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      title: formTitle,
      description: formDescription || 'Kendala operasional dilaporkan via Mobile Staff Portal',
      areaId: `area-${formArea.toLowerCase()}`,
      areaName: formArea,
      stationId: `stn-${formArea.toLowerCase()}-01`,
      stationName: `${formArea} Station`,
      department: formArea,
      shiftId: 'shift-pagi',
      shiftName: 'Shift Aktif',
      date: now.toISOString().slice(0, 10),
      reportedBy: currentUser?.id || 'emp-01',
      reportedByName: currentUser?.name || 'Staff Lapangan',
      reportedAt: now.toISOString(),
      category: formCategory as any,
      issueType: formCategory as any,
      severity: formSeverity,
      status: 'OPEN',
      slaMinutes: slaMins,
      slaDeadline: deadline,
      isSlaBreached: false,
      evidenceCount: evidenceList.length,
      evidence: evidenceList,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          issueId: `iss-${Date.now()}`,
          action: 'CREATED',
          actorId: currentUser?.id || 'emp-01',
          actorName: currentUser?.name || 'Staff Lapangan',
          actorRole: currentUser?.primaryPosition || 'Staff',
          timestamp: now.toISOString(),
          reason: 'Laporan kendala baru dibuat via Mobile Staff Portal',
        },
      ],
      createdBy: currentUser?.id || 'emp-01',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setIssues([newIssue, ...issues]);
    setIsAddModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormPhotos({ beforePhotoUrl: null, afterPhotoUrl: null });
  };

  const handleResolveIssue = (issueId: string) => {
    setIssues(
      issues.map((iss) => {
        if (iss.id === issueId) {
          const updatedEv = [...(iss.evidence || [])];
          if (resolvePhotos.afterPhotoUrl) {
            updatedEv.push({
              id: `ev-aft-${Date.now()}`,
              fileName: 'penanganan_selesai.jpg',
              photoUrl: resolvePhotos.afterPhotoUrl,
              type: 'IMAGE',
              uploadedBy: currentUser?.id || 'emp-01',
              uploadedByName: currentUser?.name || 'Staff Lapangan',
              uploadedAt: new Date().toISOString(),
              description: 'Bukti perbaikan / tindakan selesai',
            });
          }
          return {
            ...iss,
            status: 'RESOLVED',
            resolutionNotes: resolveNotes || 'Telah diselesaikan oleh tim operasional stasiun',
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser?.id || 'emp-01',
            resolvedByName: currentUser?.name || 'Staff Lapangan',
            evidence: updatedEv,
            evidenceCount: updatedEv.length,
          };
        }
        return iss;
      })
    );
    setSelectedIssue(null);
    setResolveNotes('');
    setResolvePhotos({ beforePhotoUrl: null, afterPhotoUrl: null });
  };

  // Filter Issues
  const filteredIssues = issues.filter((iss) => {
    const matchesSearch =
      !searchQuery ||
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.issueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.reportedByName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || iss.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-4 animate-fade-in text-gray-100">
      {/* Header Banner */}
      <div className="p-4 rounded-[26px] bg-gradient-to-r from-[#2B1B15] via-[#24151B] to-[#15121F] border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                Kendala Operasional Tiket
              </h2>
              <p className="text-[10px] text-amber-200">
                Respon Cepat Semua Divisi (Kitchen, Bar, Kasir, Servis)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Lapor Tiket</span>
          </button>
        </div>

        {/* Counter Summary Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-gray-400 block">Menunggu</span>
            <span className="text-rose-400 font-mono">{openCount} Tiket</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-gray-400 block">Dikerjakan</span>
            <span className="text-amber-400 font-mono">{inProgressCount} Tiket</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-gray-400 block">Kritis / Urgent</span>
            <span className="text-rose-300 font-mono">{criticalCount} Tiket</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor tiket, kendala, stasiun, pelapor..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#141A29] border border-[#263148] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
          {[
            { id: 'ALL', label: 'Semua Status' },
            { id: 'OPEN', label: '⏳ Baru (Open)' },
            { id: 'IN_PROGRESS', label: '⚡ Dikerjakan' },
            { id: 'RESOLVED', label: '✓ Selesai' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === f.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-[#151C2C] text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
          <span>Daftar Kendala Dilaporkan</span>
          <span className="text-[10px] text-amber-400">{filteredIssues.length} Kendala</span>
        </div>

        {filteredIssues.map((iss) => {
          const isCritical = iss.severity === 'CRITICAL';
          const isHigh = iss.severity === 'HIGH';

          return (
            <div
              key={iss.id}
              onClick={() => {
                setSelectedIssue(iss);
                setResolvePhotos({
                  beforePhotoUrl: iss.evidence?.[0]?.photoUrl || null,
                  afterPhotoUrl: iss.evidence?.[1]?.photoUrl || null,
                });
              }}
              className="p-3.5 rounded-2xl bg-[#151C2C] border border-[#27324A] hover:border-amber-500/40 transition-all shadow-md cursor-pointer space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                        : isHigh
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {iss.title}
                    </h3>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-amber-400/90">{iss.issueNumber}</span>
                      <span>•</span>
                      <span>{iss.areaName}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    iss.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : iss.status === 'IN_PROGRESS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {iss.status === 'RESOLVED' ? '✓ SELESAI' : iss.status === 'IN_PROGRESS' ? '⚡ PROSES' : '⏳ MENUNGGU'}
                </span>
              </div>

              <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded-xl">
                {iss.description}
              </p>

              {/* Photo Evidence thumbnails preview */}
              {iss.evidence && iss.evidence.length > 0 && (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex -space-x-1.5">
                    {iss.evidence.map((ev, i) => (
                      <img
                        key={ev.id || i}
                        src={ev.photoUrl}
                        alt="Evidence"
                        className="w-6 h-6 rounded-md object-cover border border-amber-500/40"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-amber-300 font-bold">
                    {iss.evidence.length} Foto Bukti Terlampir
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  Target SLA: {iss.slaMinutes} menit
                </span>
                <span>Oleh: {iss.reportedByName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          MODAL: ADD NEW OPERATIONAL ISSUE
      ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[90vh] bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Buat Tiket Kendala Lapangan</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-4 space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Judul Kendala Singkat:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Chiller Dapur Mati / Selang Gas Bocor / Mesin Kopi Error..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Tingkat Urgensi:</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold outline-none"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Darurat / Stop Ops)</option>
                    <option value="HIGH">🟠 HIGH (Sangat Mendesak)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Standar)</option>
                    <option value="LOW">🟢 LOW (Minor)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Lokasi / Area:</label>
                  <select
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                  >
                    <option value="Kitchen">Kitchen Line</option>
                    <option value="Bar">Bar Station</option>
                    <option value="Cashier">Kasir POS</option>
                    <option value="Service">Dining Area / Gazebo</option>
                    <option value="Dishwash">Dishwash / Stewarding</option>
                    <option value="Restroom">Toilet &amp; Garden</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Kategori Masalah:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                >
                  <option value="EQUIPMENT">🔧 Peralatan &amp; Mesin Rusak</option>
                  <option value="STOCK">📦 Stok Bahan Baku Kritis / Kosong</option>
                  <option value="SERVICE">🍽️ Servis &amp; Komplain Tamu</option>
                  <option value="CLEANLINESS">🧼 Kebersihan &amp; Sanitasi</option>
                  <option value="UTILITIES">⚡ Utilitas Listrik, Gas &amp; Air</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Deskripsi Detail Kronologi:</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kondisi kerusakan atau kendala yang terjadi..."
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none resize-none"
                />
              </div>

              {/* Photo Evidence with Camera / Gallery Support */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Bukti Kerusakan (Kamera / Galeri):</span>
                </label>
                <BeforeAfterPhotoUploader
                  value={formPhotos}
                  onChange={setFormPhotos}
                  beforeLabel="Foto Bukti Kerusakan / Masalah"
                  afterLabel="Foto Upaya Darurat / Tindakan"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Kirim Laporan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ISSUE DETAIL & ACTION RESOLVER
      ============================================================ */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[88vh] bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-gray-400 font-mono">{selectedIssue.issueNumber}</span>
                <h3 className="text-xs font-bold text-white leading-tight mt-0.5">
                  {selectedIssue.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Area: <strong className="text-white">{selectedIssue.areaName}</strong></span>
                  <span className="text-gray-400">Pelapor: <strong className="text-amber-300">{selectedIssue.reportedByName}</strong></span>
                </div>
                <p className="text-gray-200 text-[11px] leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Photo Evidence in Detail */}
              {selectedIssue.evidence && selectedIssue.evidence.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-gray-300">Foto Bukti Terlampir:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIssue.evidence.map((ev, i) => (
                      <div key={ev.id || i} className="space-y-1">
                        <img
                          src={ev.photoUrl}
                          alt="Evidence"
                          className="w-full h-32 object-cover rounded-xl border border-white/10"
                        />
                        <span className="text-[9px] text-gray-400 block truncate">{ev.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Form if not resolved */}
              {selectedIssue.status !== 'RESOLVED' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Selesaikan / Tangani Kendala Ini</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-300">Catatan Tindakan Perbaikan:</label>
                    <textarea
                      rows={2}
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      placeholder="Contoh: Teknisi chiller sudah mengganti relay, suhu kembali dingin 3°C..."
                      className="w-full p-2 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none resize-none text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-300">Foto Bukti Selesai (After):</label>
                    <BeforeAfterPhotoUploader
                      value={resolvePhotos}
                      onChange={setResolvePhotos}
                      beforeLabel="Foto Awal (Optional)"
                      afterLabel="Foto Hasil Perbaikan (After)"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResolveIssue(selectedIssue.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    ✓ Tandai Tiket Selesai (Resolved)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tiket Sudah Selesai</span>
                  </div>
                  <div className="text-[11px] text-gray-300 italic">
                    "{selectedIssue.resolutionNotes || 'Selesai ditangani.'}"
                  </div>
                  <div className="text-[9px] text-emerald-400/80">
                    Diselesaikan oleh: {selectedIssue.resolvedByName || 'Staff'}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#232C42] bg-[#141C30] flex justify-end shrink-0">
              <button
                onClick={() => setSelectedIssue(null)}
                className="w-full py-2 rounded-xl bg-white/10 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Tiket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
