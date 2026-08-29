import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Camera,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  Sparkles,
  Utensils,
  Coffee,
  ConciergeBell,
  CreditCard,
  Trash2,
  Users,
  DollarSign,
  Video,
  FileSpreadsheet,
  Crown,
  Layers,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { DivisionChecklistItem } from '../../../data/divisionChecklists';
import { ChecklistPhotoModal } from '../modals/ChecklistPhotoModal';

interface StaffChecklistTabProps {
  currentUser: EmployeePersonnel | null;
  checklists: DivisionChecklistItem[];
  isClockedIn: boolean;
  onToggleChecklist: (id: string) => void;
  onAttachPhoto: (id: string, photoData?: any) => void;
  onOpenClockInModal: () => void;
}

export const StaffChecklistTab: React.FC<StaffChecklistTabProps> = ({
  currentUser,
  checklists,
  isClockedIn,
  onToggleChecklist,
  onAttachPhoto,
  onOpenClockInModal,
}) => {
  const isOwner = currentUser?.accessLevel === 'OWNER' || currentUser?.primaryPosition === 'Owner';
  const isSupervisorOrManager =
    currentUser?.accessLevel === 'SUPERVISOR' ||
    currentUser?.accessLevel === 'MANAGER' ||
    currentUser?.accessLevel === 'HEAD' ||
    isOwner;

  // Selected item for photo modal
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<DivisionChecklistItem | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // Default to staff's division, or 'ALL' if Owner/Manager
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    if (isOwner) return 'ALL';
    return currentUser?.department || 'ALL';
  });

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'OPENING' | 'OPERATIONAL' | 'CLOSING'>('ALL');
  const [showSopReader, setShowSopReader] = useState(false);
  const [showLockedAlert, setShowLockedAlert] = useState(false);

  // Departments list for filter
  const departments = [
    { id: 'ALL', label: 'Semua Divisi', icon: Layers },
    { id: 'Kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'Bar', label: 'Bar & Beverage', icon: Coffee },
    { id: 'Service', label: 'Service / Waiter', icon: ConciergeBell },
    { id: 'Operations', label: 'Kasir & Ops', icon: CreditCard },
    { id: 'Cleaning', label: 'Cleaning & Utility', icon: Trash2 },
    { id: 'CRM', label: 'CRM & Reservasi', icon: Users },
    { id: 'Finance', label: 'Finance', icon: DollarSign },
    { id: 'Marketing', label: 'Marketing Media', icon: Video },
    { id: 'HR', label: 'HR & Personalia', icon: FileSpreadsheet },
    { id: 'Management', label: 'Management', icon: Sparkles },
    { id: 'Executive', label: 'Executive (Owner)', icon: Crown },
  ];

  // Filtering
  const filteredByDept = checklists.filter(
    (c) => selectedDept === 'ALL' || c.department.toLowerCase() === selectedDept.toLowerCase()
  );

  const filteredChecklists = filteredByDept.filter(
    (c) => selectedCategory === 'ALL' || c.category === selectedCategory
  );

  const totalFilteredCount = filteredChecklists.length;
  const completedCount = filteredChecklists.filter((c) => c.isCompleted).length;
  const progressPercent = totalFilteredCount > 0 ? Math.round((completedCount / totalFilteredCount) * 100) : 0;

  const handleItemClick = (id: string) => {
    // Owner can ALWAYS toggle without clocking in
    if (!isClockedIn && !isOwner) {
      setShowLockedAlert(true);
      return;
    }
    onToggleChecklist(id);
  };

  const handlePhotoClick = (item: DivisionChecklistItem) => {
    if (!isClockedIn && !isOwner) {
      setShowLockedAlert(true);
      return;
    }
    setSelectedPhotoItem(item);
    setIsPhotoModalOpen(true);
  };

  const handleSavePhotoFromModal = (
    itemId: string,
    photoData: {
      photoUrl: string | null;
      photoTimestamp?: string;
      photoUploaderName?: string;
      afterPhotoUrl?: string | null;
      afterPhotoTimestamp?: string;
      notes?: string;
      markCompleted?: boolean;
    }
  ) => {
    onAttachPhoto(itemId, photoData);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Locked Alert Modal / Toast for regular staff */}
      {showLockedAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/95 to-amber-950/95 border-2 border-rose-500/60 shadow-2xl space-y-2.5 animate-scale-up">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Checklist Tugas Stasiun Terkunci!</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">
                Staf wajib melakukan <strong className="text-rose-300">Absen Masuk (Clock-In)</strong> terlebih dahulu untuk dapat mencentang atau mengunggah bukti foto checklist SOP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setShowLockedAlert(false);
                onOpenClockInModal();
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Absen Masuk Sekarang</span>
            </button>
            <button
              onClick={() => setShowLockedAlert(false)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Header Banner & Progress */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C2337] to-[#121724] border border-[#2D374E] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Daily SOP &amp; Checklist Resto</h2>
              <p className="text-[10px] text-gray-400">
                Divisi Aktif: <strong className="text-purple-300">{selectedDept === 'ALL' ? 'Semua Divisi Resto' : selectedDept}</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">{progressPercent}%</span>
            <span className="text-[9px] text-gray-400 block">{completedCount}/{totalFilteredCount} Selesai</span>
          </div>
        </div>

        {/* Status Bar */}
        {isOwner ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px]">👑 Mode Eksekutif Owner — Akses Penuh Seluruh Checklist</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
              Bebas Presensi
            </span>
          </div>
        ) : !isClockedIn ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-amber-300">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-[10px]">Status: Terkunci (Wajib Absen Masuk)</span>
            </div>
            <button
              onClick={onOpenClockInModal}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 transition-colors cursor-pointer shadow"
            >
              Absen Masuk
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#0B0F19] h-2.5 rounded-full overflow-hidden border border-[#2D374E]">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Division Selector Pills (For All 10 Resto Divisions) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Divisi Resto</span>
          <span className="text-[10px] text-purple-400">{filteredChecklists.length} Item Tugas</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-[#161C2C] border border-[#2D374E] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Shift Phase Filter (Opening / Operational / Closing) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'Semua Waktu' },
          { id: 'OPENING', label: '🌅 Opening Shift' },
          { id: 'OPERATIONAL', label: '⚡ Operasional' },
          { id: 'CLOSING', label: '🌙 Closing Shift' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#252E42] text-purple-300 border border-purple-500/50 shadow'
                : 'bg-[#121724] border border-[#2D374E]/60 text-gray-400 hover:text-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklists List */}
      <div className="space-y-2.5">
        {filteredChecklists.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#161C2C] border border-[#2D374E] text-gray-400 space-y-1">
            <CheckSquare className="w-8 h-8 mx-auto text-gray-500" />
            <p className="text-xs font-bold text-gray-300">Tidak ada checklist untuk filter ini</p>
            <p className="text-[10px]">Silakan pilih divisi atau fase shift yang lain.</p>
          </div>
        ) : (
          filteredChecklists.map((chk) => (
            <div
              key={chk.id}
              onClick={() => handleItemClick(chk.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                !isClockedIn && !isOwner
                  ? 'bg-[#111827]/40 border-[#2D374E]/60 opacity-80'
                  : chk.isCompleted
                  ? 'bg-[#111827]/80 border-emerald-500/40 shadow-sm'
                  : 'bg-[#161C2C] border-[#2D374E] hover:border-purple-500/40 shadow'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(chk.id);
                  }}
                  className={`mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    !isClockedIn && !isOwner
                      ? 'border-gray-600 bg-[#0B0F19] text-gray-500'
                      : chk.isCompleted
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'border-gray-500 hover:border-purple-400 bg-[#0B0F19]'
                  }`}
                >
                  {!isClockedIn && !isOwner ? (
                    <Lock className="w-3 h-3 text-amber-400" />
                  ) : chk.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : null}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-medium leading-snug ${
                        !isClockedIn && !isOwner
                          ? 'text-gray-300'
                          : chk.isCompleted
                          ? 'line-through text-gray-400'
                          : 'text-gray-100'
                      }`}
                    >
                      {chk.title}
                    </span>
                  </div>

                  {/* SOP Detail Guidance */}
                  {chk.sopDetail && (
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed bg-[#0F1420] p-2 rounded-xl border border-[#232B3E]">
                      💡 <strong className="text-gray-300">SOP:</strong> {chk.sopDetail}
                    </p>
                  )}

                  {/* Attached Photos Thumbnail Preview */}
                  {(chk.photoUrl || chk.afterPhotoUrl || chk.notes) && (
                    <div className="mt-2 p-2 rounded-xl bg-[#0C101A] border border-[#232C42] space-y-1.5">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-purple-400" />
                          <span>Bukti Foto Terlampir</span>
                        </span>
                        {chk.photoTimestamp && (
                          <span className="text-gray-400 font-mono">{chk.photoTimestamp}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                        {chk.photoUrl && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewZoomUrl(chk.photoUrl!);
                            }}
                            className="relative group w-16 h-12 rounded-lg overflow-hidden border border-purple-500/40 shrink-0 bg-black/50 cursor-pointer"
                          >
                            <img src={chk.photoUrl} alt="Foto Bukti Utama" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="absolute bottom-0.5 left-0.5 text-[7px] font-bold px-1 bg-black/80 text-purple-300 rounded">
                              Main
                            </span>
                          </div>
                        )}

                        {chk.afterPhotoUrl && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewZoomUrl(chk.afterPhotoUrl!);
                            }}
                            className="relative group w-16 h-12 rounded-lg overflow-hidden border border-emerald-500/40 shrink-0 bg-black/50 cursor-pointer"
                          >
                            <img src={chk.afterPhotoUrl} alt="Foto Bukti After" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="absolute bottom-0.5 left-0.5 text-[7px] font-bold px-1 bg-black/80 text-emerald-300 rounded">
                              After
                            </span>
                          </div>
                        )}

                        {chk.notes && (
                          <p className="text-[9px] text-gray-300 italic line-clamp-2 flex-1 min-w-[120px] bg-black/30 p-1.5 rounded-lg border border-white/5">
                            &quot;{chk.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#2D374E]/60">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#0F1420] text-purple-300 border border-purple-500/30">
                        {chk.department}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-white/5 text-gray-400">
                        {chk.category}
                      </span>
                    </div>

                    {/* Photo Proof Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoClick(chk);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
                        chk.photoAttached || chk.photoUrl
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                          : 'bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>{chk.photoAttached || chk.photoUrl ? 'Lihat/Edit Foto ✓' : 'Upload Bukti Foto'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Digital SOP Guidelines Collapsible */}
      <div className="p-4 rounded-2xl bg-[#161C2C] border border-[#2D374E] space-y-3">
        <button
          onClick={() => setShowSopReader(!showSopReader)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Buku Panduan Standar Operasional (SOP Resto)</span>
          </div>
          {showSopReader ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showSopReader && (
          <div className="pt-2 text-[11px] text-gray-300 space-y-2 border-t border-[#2D374E] animate-fade-in leading-relaxed">
            <p><strong>1. Suhu Penyimpanan:</strong> Chiller daging &amp; sayur wajib 2°C–4°C. Deep freezer es &amp; protein wajib ≤ -18°C.</p>
            <p><strong>2. Kalibrasi Kopi:</strong> Rasio ekstraksi 1:2 (18gr in, 36gr out) dalam 25–28 detik untuk crema optimal.</p>
            <p><strong>3. Service Excellence:</strong> Greeting sapaan hangat dalam 15 detik, table turnover 2 menit pasca makan.</p>
            <p><strong>4. Kasir &amp; Keuangan:</strong> Rekonsiliasi Z-Report tunai vs non-tunai (EDC/QRIS) wajib klop setiap pergantian shift.</p>
            <p><strong>5. Sanitasi Stewarding:</strong> Peralatan makan disterilkan dan limbah grease trap dikuras setiap closing shift.</p>
          </div>
        )}
      </div>

      {/* Checklist Photo Proof Modal */}
      <ChecklistPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        item={selectedPhotoItem}
        currentUser={currentUser}
        onSavePhoto={handleSavePhotoFromModal}
      />

      {/* Lightbox / Zoom Modal */}
      {previewZoomUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#141A29] rounded-2xl border border-white/10 overflow-hidden shadow-2xl space-y-3 p-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">Bukti Foto Checklist SOP</span>
              <button
                type="button"
                onClick={() => setPreviewZoomUrl(null)}
                className="p-1 rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[65vh]">
              <img
                src={previewZoomUrl}
                alt="Preview Zoom"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
