import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { navigationService } from '../../services/navigationService';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UtensilsCrossed, 
  BadgeDollarSign, 
  GraduationCap, 
  Video, 
  FileBarChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Palmtree,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// Icon mapper for dynamic icon string
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  UtensilsCrossed,
  BadgeDollarSign,
  GraduationCap,
  Video,
  FileBarChart,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigationService.getFilteredNavigation(currentUser);

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || LayoutDashboard;
    return <IconComponent className="w-4 h-4 shrink-0" />;
  };

  const getBadgeColorStyle = (color?: string) => {
    switch (color) {
      case 'pink':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'blue':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#111827] border-r border-[#2D374E] transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2D374E] shrink-0">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform shrink-0">
              <Palmtree className="w-5 h-5" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-sm tracking-wider text-gray-100 uppercase group-hover:text-purple-300 transition-colors truncate">
                  TropicalOS
                </span>
                <span className="text-[10px] text-gray-400 font-medium truncate">
                  Tropical Garden Resto
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#1E2438] transition-colors cursor-pointer"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Menu Aplikasi
            </div>
          )}

          {filteredNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed && !isMobileOpen ? item.name : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`${isActive ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'}`}>
                    {renderIcon(item.iconName)}
                  </span>

                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : getBadgeColorStyle(item.badgeColor)
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-[#2D374E] bg-[#111827]/80 shrink-0">
            <div className="p-2.5 rounded-xl bg-[#1E2438]/70 border border-[#2D374E] flex items-center justify-between">
              <div className="overflow-hidden space-y-0.5">
                <div className="text-[11px] font-bold text-gray-200 truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-purple-300 font-medium">{currentUser?.accessLevel} • {currentUser?.department}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
