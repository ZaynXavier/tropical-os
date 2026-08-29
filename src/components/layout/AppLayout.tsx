import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileStaffPortal } from '../portal/MobileStaffPortal';

export const AppLayout: React.FC = () => {
  // Automatic screen size & mobile device detection
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isNarrow = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      return isNarrow || isMobileUA;
    }
    return false;
  });

  // Desktop sidebar collapse state & mobile drawer state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isNarrow = window.innerWidth < 768;
      setIsMobileDevice(isNarrow);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Tampilan Otomatis Mobile untuk Layar HP / Smartphone
  if (isMobileDevice) {
    return (
      <div className="min-h-screen bg-[#070A10] text-gray-100 flex flex-col items-center justify-center selection:bg-purple-500 selection:text-white">
        <MobileStaffPortal />
      </div>
    );
  }

  // 2. Tampilan Otomatis Desktop untuk Laptop / Komputer / PC
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Desktop Topbar Header */}
        <Topbar
          onToggleSidebar={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Route Pages (Dashboard, HR, CRM, Operations, Finance, etc.) */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
