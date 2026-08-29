import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum Ada Data',
  description = 'Data untuk bagian ini belum tersedia atau belum ada entri baru yang dicatat.',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-[#1E2438]/60 border border-[#2D374E] max-w-lg mx-auto my-6">
      <div className="p-4 rounded-2xl bg-[#283049] text-purple-400 border border-[#2D374E] mb-4 shadow-inner">
        {icon || <PackageOpen className="w-8 h-8 text-purple-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
