import React, { useState } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { GlobalSearch } from './GlobalSearch';
import { NotificationButton } from './NotificationButton';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import { UserProfileMenu } from './UserProfileMenu';
import { Menu, Calendar, Sparkles, Smartphone, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PwaInstallBanner } from '../common/PwaInstallBanner';
import { WhatsAppConnectModal } from '../whatsapp/WhatsAppConnectModal';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onOpenStaffPortal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenStaffPortal }) => {
  const { currentUser } = useAuth();
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#111827]/90 backdrop-blur-md border-b border-[#2D374E] px-4 md:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left side: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-300 border border-[#2D374E] transition-colors cursor-pointer"
          title="Toggle Navigasi"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:block truncate">
          <Breadcrumb />
        </div>
      </div>

      {/* Right side: Search, Staff Portal, Notification, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* PWA Install Button */}
        <PwaInstallBanner variant="button" />

        {/* Global Search */}
        <GlobalSearch />

        {/* WhatsApp Gateway Status Button */}
        <button
          onClick={() => setIsWaModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm transition-all hover:scale-105"
          title="Koneksi WhatsApp Web Resmi Resto"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Staff Mobile Portal Preview Switch */}
        {onOpenStaffPortal && (
          <button
            onClick={onOpenStaffPortal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm transition-all hover:scale-105"
            title="Buka Tampilan Mobile Staff Portal (Presensi, Shift, SPL, SOP)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal HP Staf</span>
          </button>
        )}

        {/* Notification Popover */}
        <NotificationButton />

        {/* Phase 0 RBAC Testing Switcher */}
        <RoleSwitcher />

        {/* User Profile */}
        <UserProfileMenu />
      </div>

      {/* WhatsApp Gateway Modal */}
      <WhatsAppConnectModal isOpen={isWaModalOpen} onClose={() => setIsWaModalOpen(false)} />
    </header>
  );
};
