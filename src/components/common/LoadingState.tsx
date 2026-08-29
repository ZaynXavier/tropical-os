import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat Data TropicalOS...',
  subMessage = 'Menyiapkan modul dan memvalidasi hak otorisasi',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
      </div>
      <h4 className="text-base font-semibold text-gray-200 mb-1">{message}</h4>
      <p className="text-xs text-gray-400">{subMessage}</p>
    </div>
  );
};
