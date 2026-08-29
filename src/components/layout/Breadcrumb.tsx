import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { navigationService } from '../../services/navigationService';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const subParam = searchParams.get('sub');

  const crumbs = navigationService.getBreadcrumbs(location.pathname, subParam);

  if (crumbs.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Home className="w-3.5 h-3.5 text-purple-400" />
        <span className="font-semibold text-gray-200">Dashboard</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto whitespace-nowrap custom-scrollbar">
      {crumbs.map((crumb, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === crumbs.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />}

            {isLast ? (
              <span className="font-semibold text-gray-100 flex items-center gap-1.5">
                {isFirst && <Home className="w-3.5 h-3.5 text-purple-400" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path || '#'}
                className="hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                {isFirst && <Home className="w-3.5 h-3.5 text-gray-500" />}
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
