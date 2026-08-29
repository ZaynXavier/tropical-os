import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
  FileText
} from 'lucide-react';
import { DivisionChecklistItem } from '../../../data/divisionChecklists';
import { EmployeePersonnel } from '../../../types/employee';

interface ChecklistPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DivisionChecklistItem | null;
  currentUser: EmployeePersonnel | null;
  onSavePhoto: (
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
  ) => void;
}

export const ChecklistPhotoModal: React.FC<ChecklistPhotoModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onSavePhoto,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<string | undefined>(undefined);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [afterPhotoTimestamp, setAfterPhotoTimestamp] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [markAsCompleted, setMarkAsCompleted] = useState<boolean>(true);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  const mainCameraInputRef = useRef<HTMLInputElement>(null);
  const mainGalleryInputRef = useRef<HTMLInputElement>(null);
  const afterCameraInputRef = useRef<HTMLInputElement>(null);
  const afterGalleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setPhotoUrl(item.photoUrl || null);
      setPhotoTimestamp(item.photoTimestamp || undefined);
      setAfterPhotoUrl(item.afterPhotoUrl || null);
      setAfterPhotoTimestamp(item.afterPhotoTimestamp || undefined);
      setNotes(item.notes || '');
      setMarkAsCompleted(true);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'main' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      if (type === 'main') {
        setPhotoUrl(dataUrl);
        setPhotoTimestamp(nowStr);
      } else {
        setAfterPhotoUrl(dataUrl);
        setAfterPhotoTimestamp(nowStr);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    onSavePhoto(item.id, {
      photoUrl,
      photoTimestamp: photoUrl ? (photoTimestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB') : undefined,
      photoUploaderName: currentUser?.name || 'Staff Lapangan',
      afterPhotoUrl,
      afterPhotoTimestamp: afterPhotoUrl ? (afterPhotoTimestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB') : undefined,
      notes: notes.trim() || undefined,
      markCompleted: markAsCompleted || Boolean(photoUrl),
    });
    onClose();
  };

  const handleClearAllPhotos = () => {
    setPhotoUrl(null);
    setPhotoTimestamp(undefined);
    setAfterPhotoUrl(null);
    setAfterPhotoTimestamp(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={mainCameraInputRef}
        onChange={(e) => handleFile(e, 'main')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={mainGalleryInputRef}
        onChange={(e) => handleFile(e, 'main')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={afterCameraInputRef}
        onChange={(e) => handleFile(e, 'after')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={afterGalleryInputRef}
        onChange={(e) => handleFile(e, 'after')}
        className="hidden"
      />

      <div className="w-full max-w-[430px] bg-[#121724] border border-[#2A354D] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 bg-[#182032] border-b border-[#2A354D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Upload Bukti Foto SOP</h3>
              <p className="text-[10px] text-gray-400">Dokumentasi &amp; Validasi Checklist Resto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* Checklist Info Card */}
          <div className="p-3.5 rounded-2xl bg-[#161D2E] border border-[#2A354D] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {item.department}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/10 text-gray-300">
                {item.category === 'OPENING' ? '🌅 Opening' : item.category === 'OPERATIONAL' ? '⚡ Operasional' : '🌙 Closing'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
            {item.sopDetail && (
              <p className="text-[10px] text-gray-300 leading-relaxed bg-[#0E1320] p-2.5 rounded-xl border border-[#20293D]">
                💡 <strong className="text-purple-300">Standar SOP:</strong> {item.sopDetail}
              </p>
            )}
          </div>

          {/* Dual Photo Uploader Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Main Photo / Before */}
            <div className="p-2.5 rounded-2xl bg-[#161D2E] border border-[#2A354D] flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>Foto Utama / Sebelum</span>
                </span>
                {photoUrl && (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    KONDISI 1
                  </span>
                )}
              </div>

              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-purple-500/40 group aspect-video bg-black/40 flex items-center justify-center">
                  <img src={photoUrl} alt="Foto Utama" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewZoomUrl(photoUrl)}
                      className="p-1.5 rounded-lg bg-black/80 text-white hover:bg-black transition-all cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl(null);
                        setPhotoTimestamp(undefined);
                      }}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {photoTimestamp && (
                    <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs text-[8px] text-gray-200 px-1.5 py-0.5 rounded font-mono">
                      {photoTimestamp}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-gray-700 hover:border-purple-500/50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center gap-2 bg-black/20 aspect-video">
                  <span className="text-[9px] text-gray-400">Ambil foto bukti:</span>
                  <div className="flex items-center gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => mainCameraInputRef.current?.click()}
                      className="flex-1 py-1.5 px-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Kamera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => mainGalleryInputRef.current?.click()}
                      className="flex-1 py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Galeri</span>
                    </button>
                  </div>
                </div>
              )}

              {photoUrl && (
                <div className="flex items-center justify-between text-[9px] text-gray-400 pt-0.5">
                  <span className="truncate">Oleh: {currentUser?.name?.split(' ')[0] || 'Staff'}</span>
                  <button
                    type="button"
                    onClick={() => mainCameraInputRef.current?.click()}
                    className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Ulang</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. After Photo (Optional) */}
            <div className="p-2.5 rounded-2xl bg-[#161D2E] border border-[#2A354D] flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Foto Selesai / After</span>
                </span>
                <span className="text-[8px] text-gray-500">(Opsional)</span>
              </div>

              {afterPhotoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 group aspect-video bg-black/40 flex items-center justify-center">
                  <img src={afterPhotoUrl} alt="Foto Selesai" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewZoomUrl(afterPhotoUrl)}
                      className="p-1.5 rounded-lg bg-black/80 text-white hover:bg-black transition-all cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAfterPhotoUrl(null);
                        setAfterPhotoTimestamp(undefined);
                      }}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {afterPhotoTimestamp && (
                    <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs text-[8px] text-gray-200 px-1.5 py-0.5 rounded font-mono">
                      {afterPhotoTimestamp}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center gap-2 bg-black/20 aspect-video">
                  <span className="text-[9px] text-gray-400">Hasil setelah pengerjaan:</span>
                  <div className="flex items-center gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => afterCameraInputRef.current?.click()}
                      className="flex-1 py-1.5 px-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Kamera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => afterGalleryInputRef.current?.click()}
                      className="flex-1 py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Galeri</span>
                    </button>
                  </div>
                </div>
              )}

              {afterPhotoUrl && (
                <div className="flex items-center justify-between text-[9px] text-gray-400 pt-0.5">
                  <span className="truncate">Selesai terverifikasi</span>
                  <button
                    type="button"
                    onClick={() => afterCameraInputRef.current?.click()}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Ulang</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes / Keterangan Kondisi Aktual */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-400" />
              <span>Catatan / Keterangan Kondisi Aktual (Opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Suhu chiller tercatat 2.4°C normal, semua area telah disanitasi..."
              rows={2}
              className="w-full bg-[#0F1422] border border-[#2A354D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Toggle Mark Checklist as Completed */}
          <div
            onClick={() => setMarkAsCompleted(!markAsCompleted)}
            className="p-3 rounded-2xl bg-[#161D2E] border border-[#2A354D] flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  markAsCompleted
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'border-gray-600 bg-black/40'
                }`}
              >
                {markAsCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-gray-200">
                Otomatis centang tugas sebagai &quot;Selesai&quot;
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {markAsCompleted ? 'Aktif' : 'Tidak'}
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-[#182032] border-t border-[#2A354D] flex items-center gap-2.5">
          {(photoUrl || afterPhotoUrl) && (
            <button
              type="button"
              onClick={handleClearAllPhotos}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Hapus Bukti Foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Bukti Foto</span>
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Preview Modal */}
      {previewZoomUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#141A29] rounded-2xl border border-white/10 overflow-hidden shadow-2xl space-y-3 p-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">Preview Bukti Foto SOP</span>
              <button
                type="button"
                onClick={() => setPreviewZoomUrl(null)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[65vh]">
              <img
                src={previewZoomUrl}
                alt="Preview Bukti Foto"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <div className="text-center text-[10px] text-gray-400">
              Dokumentasi SOP Resto • {currentUser?.name || 'Staff'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
