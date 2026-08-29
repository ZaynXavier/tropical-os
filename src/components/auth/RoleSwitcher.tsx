import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MASTER_EMPLOYEES } from '../../config/employees';
import { MASTER_ROLES } from '../../config/roles';
import { AccessLevel } from '../../types/employee';
import { 
  UserCheck, 
  ChevronDown, 
  Check, 
  Shield, 
  Sparkles, 
  X,
  Building,
  Briefcase
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<AccessLevel | 'ALL'>('ALL');

  const filteredEmployees = MASTER_EMPLOYEES.filter((emp) => {
    if (filterRole === 'ALL') return true;
    return emp.accessLevel === filterRole;
  });

  const getRoleBadgeStyle = (level: AccessLevel) => {
    switch (level) {
      case 'OWNER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'MANAGER':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'HEAD':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'SUPERVISOR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'STAFF':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-200 border border-[#2D374E] text-xs font-medium transition-all shadow-sm cursor-pointer group"
        title="Role Switcher (Phase 0 Testing)"
      >
        <div className="p-1 rounded-md bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] text-gray-400 leading-none">Simulasi Role:</span>
          <span className="text-xs font-bold text-purple-300">{currentUser?.accessLevel}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200 transition-transform" />
      </button>

      {/* Modal / Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-[340px] sm:w-[420px] rounded-2xl bg-[#1E2438] border border-[#2D374E] p-4 shadow-2xl space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2D374E]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100">Role & User Switcher</h3>
                  <p className="text-[11px] text-gray-400">Pilih dari 25 Personel Tropical Garden Resto</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#283049] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-[#2D374E] overflow-x-auto custom-scrollbar">
              {(['ALL', 'OWNER', 'MANAGER', 'HEAD', 'SUPERVISOR', 'STAFF'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    filterRole === role
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Personnel List */}
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredEmployees.map((emp) => {
                const isSelected = currentUser?.id === emp.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => {
                      switchUser(emp.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/50 shadow-md'
                        : 'bg-[#111827]/60 border-[#2D374E] hover:border-purple-500/40 hover:bg-[#111827]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-100">{emp.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(
                            emp.accessLevel
                          )}`}
                        >
                          {emp.accessLevel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-500" />
                          {emp.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-gray-500" />
                          {emp.primaryPosition}
                        </span>
                      </div>

                      {(emp.additionalResponsibilities || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {(emp.additionalResponsibilities || []).map((resp, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-[#283049] text-pink-300 border border-pink-900/40"
                            >
                              +{resp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-purple-500 text-white shadow-sm mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer helper */}
            <div className="pt-2 border-t border-[#2D374E] text-[11px] text-gray-400 flex items-center justify-between">
              <span>Fokus RBAC: <strong className="text-gray-300">{MASTER_ROLES[currentUser?.accessLevel || 'STAFF'].focusArea}</strong></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
