import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, ZoomIn, X, CheckCircle2, RefreshCw } from 'lucide-react';

export interface PhotoEvidencePair {
  beforePhotoUrl: string | null;
  beforeTimestamp?: string;
  beforeNote?: string;
  afterPhotoUrl: string | null;
  afterTimestamp?: string;
  afterNote?: string;
}

interface BeforeAfterPhotoUploaderProps {
  value: PhotoEvidencePair;
  onChange: (value: PhotoEvidencePair) => void;
  title?: string;
  beforeLabel?: string;
  afterLabel?: string;
  requireAfter?: boolean;
  uploaderName?: string;
}

export const BeforeAfterPhotoUploader: React.FC<BeforeAfterPhotoUploaderProps> = ({
  value,
  onChange,
  title = 'Bukti Foto Before & After',
  beforeLabel = 'Foto Sebelum (Before)',
  afterLabel = 'Foto Sesudah (After)',
  requireAfter = false,
  uploaderName = 'Staff',
}) => {
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; title: string } | null>(null);

  // Hidden file inputs for Before
  const beforeCameraInputRef = useRef<HTMLInputElement>(null);
  const beforeGalleryInputRef = useRef<HTMLInputElement>(null);

  // Hidden file inputs for After
  const afterCameraInputRef = useRef<HTMLInputElement>(null);
  const afterGalleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      if (type === 'before') {
        onChange({
          ...value,
          beforePhotoUrl: dataUrl,
          beforeTimestamp: nowStr,
        });
      } else {
        onChange({
          ...value,
          afterPhotoUrl: dataUrl,
          afterTimestamp: nowStr,
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemovePhoto = (type: 'before' | 'after') => {
    if (type === 'before') {
      onChange({
        ...value,
        beforePhotoUrl: null,
        beforeTimestamp: undefined,
      });
    } else {
      onChange({
        ...value,
        afterPhotoUrl: null,
        afterTimestamp: undefined,
      });
    }
  };

  return (
    <div className="space-y-2.5 p-3 rounded-2xl bg-[#141A29] border border-[#27324A] text-xs">
      {/* Hidden File Inputs for Before */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={beforeCameraInputRef}
        onChange={(e) => handleFileChange(e, 'before')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={beforeGalleryInputRef}
        onChange={(e) => handleFileChange(e, 'before')}
        className="hidden"
      />

      {/* Hidden File Inputs for After */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={afterCameraInputRef}
        onChange={(e) => handleFileChange(e, 'after')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={afterGalleryInputRef}
        onChange={(e) => handleFileChange(e, 'after')}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-white text-[11px] min-w-0">
          <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <span className="text-[10px] text-cyan-300 font-medium shrink-0 whitespace-nowrap">
          {value.beforePhotoUrl ? (value.afterPhotoUrl ? '2 Foto Lengkap ✓' : '1 Foto Terlampir') : 'Pilih Kamera/Galeri'}
        </span>
      </div>

      {/* Two Columns Grid for Before and After */}
      <div className="grid grid-cols-2 gap-2">
        {/* SLOT 1: BEFORE PHOTO */}
        <div className="p-2.5 rounded-xl bg-[#101522] border border-white/5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {beforeLabel}
            </span>
            {value.beforePhotoUrl && (
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                BEFORE
              </span>
            )}
          </div>

          {value.beforePhotoUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-rose-500/30 group bg-black/40 aspect-video flex items-center justify-center">
              <img
                src={value.beforePhotoUrl}
                alt="Foto Sebelum"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl({ url: value.beforePhotoUrl!, title: beforeLabel })}
                  className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-all cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto('before')}
                  className="p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition-all cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {value.beforeTimestamp && (
                <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-xs text-[8px] text-gray-200 px-1 py-0.2 rounded font-mono">
                  {value.beforeTimestamp}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-gray-700 hover:border-cyan-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center text-center gap-1.5 bg-black/20 aspect-video">
              <span className="text-[9px] text-gray-400">Ambil foto kondisi sebelum:</span>
              <div className="flex items-center gap-1 w-full">
                <button
                  type="button"
                  onClick={() => beforeCameraInputRef.current?.click()}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Camera className="w-3 h-3" />
                  <span>Kamera</span>
                </button>
                <button
                  type="button"
                  onClick={() => beforeGalleryInputRef.current?.click()}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Galeri</span>
                </button>
              </div>
            </div>
          )}

          {value.beforePhotoUrl && (
            <div className="flex items-center justify-between text-[9px] text-gray-400">
              <span className="truncate">Oleh: {uploaderName}</span>
              <button
                type="button"
                onClick={() => beforeCameraInputRef.current?.click()}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Foto Ulang</span>
              </button>
            </div>
          )}
        </div>

        {/* SLOT 2: AFTER PHOTO */}
        <div className="p-2.5 rounded-xl bg-[#101522] border border-white/5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {afterLabel}
            </span>
            {value.afterPhotoUrl ? (
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AFTER
              </span>
            ) : requireAfter ? (
              <span className="text-[8px] text-amber-400">*Wajib</span>
            ) : (
              <span className="text-[8px] text-gray-500">(Opsional)</span>
            )}
          </div>

          {value.afterPhotoUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 group bg-black/40 aspect-video flex items-center justify-center">
              <img
                src={value.afterPhotoUrl}
                alt="Foto Sesudah"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl({ url: value.afterPhotoUrl!, title: afterLabel })}
                  className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-all cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto('after')}
                  className="p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition-all cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {value.afterTimestamp && (
                <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-xs text-[8px] text-gray-200 px-1 py-0.2 rounded font-mono">
                  {value.afterTimestamp}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-gray-700 hover:border-emerald-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center text-center gap-1.5 bg-black/20 aspect-video">
              <span className="text-[9px] text-gray-400">Ambil foto hasil/sesudah:</span>
              <div className="flex items-center gap-1 w-full">
                <button
                  type="button"
                  onClick={() => afterCameraInputRef.current?.click()}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Camera className="w-3 h-3" />
                  <span>Kamera</span>
                </button>
                <button
                  type="button"
                  onClick={() => afterGalleryInputRef.current?.click()}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Galeri</span>
                </button>
              </div>
            </div>
          )}

          {value.afterPhotoUrl && (
            <div className="flex items-center justify-between text-[9px] text-gray-400">
              <span className="truncate">Selesai diperiksa</span>
              <button
                type="button"
                onClick={() => afterCameraInputRef.current?.click()}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Foto Ulang</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#141A29] rounded-2xl border border-white/10 overflow-hidden shadow-2xl space-y-3 p-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">{previewModalUrl.title}</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={previewModalUrl.url}
                alt="Preview Bukti Foto"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="text-center text-[10px] text-gray-400">
              Tercatat pada {new Date().toLocaleDateString('id-ID')} • {uploaderName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
