import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

interface PwaInstallBannerProps {
  variant?: 'banner' | 'compact' | 'button';
  className?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  variant = 'banner',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, installPwa } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Do not show if already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // If not installable and not iOS, do not render
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    const result = await installPwa();
    if (result === 'accepted') {
      setIsDismissed(true);
    }
  };

  // Variant: Compact Button for Topbar / Header
  if (variant === 'button') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm group"
          title="Install Aplikasi TropicalOS di Perangkat"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Install App</span>
        </button>

        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Share className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Install di iPhone / iPad</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                1. Ketuk ikon <strong>Bagikan (Share)</strong> di Safari.<br />
                2. Gulir ke bawah lalu pilih <strong>'Tambah ke Layar Utama' (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: Full Banner (Ideal for Mobile Staff Portal)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#131F2A] to-[#111827] border border-emerald-500/30 p-4 shadow-lg transition-all animate-fadeIn ${className}`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 shadow-md flex items-center justify-center shrink-0">
            <img src="/icons/icon.svg" alt="TropicalOS" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">Install TropicalOS di HP</h4>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Akses cepat presensi GPS & selfie, checklist stasiun, dan offline ready tanpa browser bar.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
          title="Tutup banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5">
        <button
          onClick={handleInstallClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          <span>{isIOS ? 'Petunjuk Install iOS' : 'Install Aplikasi Sekarang'}</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
        >
          Nanti Saja
        </button>
      </div>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Share className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Install di iPhone / iPad</h3>
            <p className="text-xs text-gray-300 leading-relaxed text-left bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="block">1. Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 text-emerald-400" /> di bagian bawah Safari.</span>
              <span className="block">2. Gulir ke bawah lalu pilih <strong>'Tambah ke Layar Utama' (Add to Home Screen)</strong>.</span>
              <span className="block">3. Ketuk <strong>'Tambah'</strong> di pojok kanan atas.</span>
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              Tutup Petunjuk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
