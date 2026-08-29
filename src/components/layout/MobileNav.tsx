import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  MessageSquare, 
  BadgeDollarSign,
  Video,
  GraduationCap
} from 'lucide-react';
import { permissionService } from '../../services/permissionService';

export const MobileNav: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  // Determine top 4-5 mobile items based on role
  const getMobileNavItems = () => {
    // HR Officer strictly only sees Tropical HR and Development
    if (permissionService.isHROfficer(currentUser) && currentUser.accessLevel !== 'MANAGER' && currentUser.accessLevel !== 'OWNER') {
      return [
        { id: 'hr', name: 'Tropical HR', path: '/hr', icon: Users },
        { id: 'development', name: 'Development', path: '/development', icon: GraduationCap },
      ];
    }

    // STAFF sees Dashboard (Tugas Saya), Shift/HR, Operations, plus their specific dept
    if (currentUser.accessLevel === 'STAFF') {
      const staffItems = [
        { id: 'dashboard', name: 'Tugas Saya', path: '/dashboard', icon: LayoutDashboard },
        { id: 'hr', name: 'Jadwal & SOP', path: '/hr?sub=shifts', icon: Users },
        { id: 'operations', name: 'Tugas Ops', path: '/operations', icon: UtensilsCrossed },
      ];

      if (currentUser.department === 'CRM') {
        staffItems.push({ id: 'crm', name: 'CRM', path: '/crm', icon: MessageSquare });
      }

      if (currentUser.department === 'Finance' || permissionService.hasResponsibility(currentUser, 'Kasir Operasional')) {
        staffItems.push({ id: 'finance', name: 'Kasir', path: '/finance', icon: BadgeDollarSign });
      }

      if (permissionService.hasResponsibility(currentUser, 'Social Media Production')) {
        staffItems.push({ id: 'content', name: 'Content', path: '/content', icon: Video });
      }

      return staffItems.slice(0, 5);
    }

    const items = [
      { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { id: 'hr', name: 'HR', path: '/hr', icon: Users },
      { id: 'operations', name: 'Ops', path: '/operations', icon: UtensilsCrossed },
    ];

    if (currentUser.department === 'CRM' || currentUser.accessLevel === 'MANAGER') {
      items.push({ id: 'crm', name: 'CRM', path: '/crm', icon: MessageSquare });
    }

    if (currentUser.department === 'Finance' || currentUser.accessLevel === 'MANAGER') {
      items.push({ id: 'finance', name: 'Finance', path: '/finance', icon: BadgeDollarSign });
    } else if (permissionService.hasResponsibility(currentUser, 'Social Media Production')) {
      items.push({ id: 'content', name: 'Content', path: '/content', icon: Video });
    }

    return items.slice(0, 5);
  };

  const navItems = getMobileNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#111827]/95 backdrop-blur-md border-t border-[#2D374E] px-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;

        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all ${
              isActive ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-purple-500/20 text-purple-300' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight truncate">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
