import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Building, 
  Briefcase, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'TG';
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0] || '')
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'TG';
  };

  const getRoleBadgeStyle = () => {
    switch (currentUser.accessLevel) {
      case 'OWNER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'MANAGER':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'SUPERVISOR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'STAFF':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#1E2438] hover:bg-[#283049] border border-[#2D374E] transition-all cursor-pointer group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          {getInitials(currentUser.name || currentUser.fullName)}
        </div>

        {/* User Info (Hidden on very small screens) */}
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">
            {currentUser.name || currentUser.fullName}
          </span>
          <span className="text-[10px] text-gray-400 leading-tight">
            {currentUser.primaryPosition}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block group-hover:text-gray-200" />
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-[#1E2438] border border-[#2D374E] p-4 shadow-2xl space-y-3 animate-fade-in">
            {/* Header info */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#2D374E]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                {getInitials(currentUser.name)}
              </div>
              <div className="space-y-1 overflow-hidden">
                <div className="font-semibold text-sm text-gray-100 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle()}`}>
                  {currentUser.accessLevel}
                </span>
              </div>
            </div>

            {/* Department & Position */}
            <div className="space-y-1.5 py-1 text-xs text-gray-300">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-gray-500" />
                  Divisi:
                </span>
                <span className="font-medium text-gray-200">{currentUser.department}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                  Jabatan:
                </span>
                <span className="font-medium text-gray-200">{currentUser.primaryPosition}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  No. Karyawan:
                </span>
                <span className="font-mono text-[11px] text-gray-200">{currentUser.employeeNo}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#2D374E] space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-transparent hover:border-rose-800/40 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Sistem
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
