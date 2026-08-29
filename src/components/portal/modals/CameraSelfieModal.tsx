import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle2, X, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface CameraSelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (photoUrl: string, note: string) => void;
  title?: string;
}

export const CameraSelfieModal: React.FC<CameraSelfieModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Presensi Wajah & GPS',
}) => {
  const [isCaptured, setIsCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [note, setNote] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');

  if (!isOpen) return null;

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCaptured(true);
    }, 600);
  };

  const handleRetake = () => {
    setIsCaptured(false);
  };

  const handleConfirm = () => {
    onSuccess(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      note
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161C2C] border border-[#2D374E] rounded-[32px] overflow-hidden shadow-2xl animate-scale-up flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#2D374E] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">{title}</h3>
              <p className="text-[10px] text-gray-400">Verifikasi Lokasi &amp; Identitas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-4 space-y-3">
          <div className="relative w-full aspect-[4/5] bg-[#0A0D14] rounded-2xl overflow-hidden border-2 border-[#2D374E] flex items-center justify-center">
            {isCaptured ? (
              <div className="relative w-full h-full">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="Captured Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold w-fit shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Wajah &amp; Lokasi Terverifikasi</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                {/* Face Oval Overlay */}
                <div className="w-48 h-56 rounded-[50%] border-2 border-dashed border-blue-400/60 flex items-center justify-center relative">
                  <div className="absolute top-2 w-12 h-1 rounded-full bg-blue-400/40"></div>
                  <div className="w-40 h-48 rounded-[50%] border border-blue-500/20 animate-pulse"></div>
                </div>

                {/* Live scanner bar */}
                <div className="absolute inset-x-8 top-1/4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-bounce"></div>

                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] text-gray-400 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Anti-Fake GPS Aktif
                  </span>
                  <button
                    onClick={() => setCameraFacing(cameraFacing === 'front' ? 'back' : 'front')}
                    className="flex items-center gap-1 text-gray-300 hover:text-white"
                  >
                    <RefreshCw className="w-3 h-3" /> Balik Kamera
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="text-xs font-bold text-white">Memproses Pengenalan Wajah...</span>
              </div>
            )}
          </div>

          {/* GPS Info Badge */}
          <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2D374E] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Tropical Garden Resto</div>
                <div className="text-[10px] text-emerald-400 font-medium">Radius: 8.4 meter (Dalam Jangkauan Outlet)</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              VALID
            </span>
          </div>

          {/* Optional Note */}
          <input
            type="text"
            placeholder="Catatan shift / kondisi kerja (opsional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="p-4 pt-0 flex items-center gap-2">
          {!isCaptured ? (
            <button
              onClick={handleCapture}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto Presensi</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Ulangi
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi &amp; Masuk</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
