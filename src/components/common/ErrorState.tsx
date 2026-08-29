import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kendala Sistem',
  message = 'Tidak dapat memuat konten modul yang diminta. Silakan coba muat ulang atau hubungi administrator.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-rose-950/20 border border-rose-800/40 max-w-lg mx-auto my-6">
      <div className="p-4 rounded-2xl bg-rose-900/30 text-rose-400 border border-rose-700/50 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-rose-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-300 max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
};
