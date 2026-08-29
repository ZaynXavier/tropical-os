import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'purple' | 'pink' | 'emerald' | 'amber' | 'blue';
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'purple',
  actions,
  breadcrumbs,
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'pink':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'blue':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2D374E]">
      <div className="space-y-1">
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 tracking-tight">{title}</h1>
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs md:text-sm text-gray-400 max-w-2xl">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
