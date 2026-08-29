import React, { useState } from 'react';
import { INITIAL_EMPLOYEES } from '../../data/employees';
import { userModuleAccessService, UserModulePermission } from '../../services/userModuleAccessService';
import {
  ShieldCheck,
  Users,
  CheckSquare,
  Lock,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Search,
  Building
} from 'lucide-react';

export const ModuleAccessManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Record<string, UserModulePermission>>(
    userModuleAccessService.getAllPermissions()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableModules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'hr', name: 'Topical HR' },
    { id: 'crm', name: 'CRM & WA' },
    { id: 'operations', name: 'Operations' },
    { id: 'finance', name: 'Finance' },
    { id: 'marketing', name: 'Digital Marketing' },
    { id: 'content', name: 'Content Creator' },
    { id: 'development', name: 'Development' },
    { id: 'reports', name: 'Reports' },
    { id: 'settings', name: 'Settings' },
  ];

  const handleToggleModule = (employeeId: string, moduleId: string) => {
    const current = permissions[employeeId] || {
      employeeId,
      allowedModules: ['dashboard'],
    };

    const isAllowed = current.allowedModules.includes(moduleId);
    const updatedModules = isAllowed
      ? current.allowedModules.filter((m) => m !== moduleId)
      : [...current.allowedModules, moduleId];

    const updated = {
      ...permissions,
      [employeeId]: {
        ...current,
        allowedModules: updatedModules,
      },
    };

    setPermissions(updated);
    userModuleAccessService.savePermissions(updated);
  };

  const handleToggleApproval = (employeeId: string) => {
    const current = permissions[employeeId] || {
      employeeId,
      allowedModules: ['dashboard'],
    };

    const updated = {
      ...permissions,
      [employeeId]: {
        ...current,
        canApproveChecklists: !current.canApproveChecklists,
      },
    };

    setPermissions(updated);
    userModuleAccessService.savePermissions(updated);
  };

  const handleSaveAll = () => {
    userModuleAccessService.savePermissions(permissions);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D374E] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Pengaturan Akses Pengelola Modul (Role &amp; Assignment Matrix)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Custom Assignment
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tentukan modul apa saja yang dapat dikelola oleh masing-masing personel (contoh: Heri Setiawan mengelola HR, Aqib &amp; Arfani mengelola CRM, Naila Konten Creator, Tasnim/Ulum/Dina Kalkulator HPP, Putri Okta Checklist Approval).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Tersimpan!
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi Akses
          </button>
        </div>
      </div>

      {/* Preset Rules Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1">
          <span className="font-bold text-purple-300">👑 Full Back Office Access:</span>
          <p className="text-gray-400">Owner (Tri Hermawanto) &amp; GM (Heri Setiawan) memiliki akses penuh ke seluruh modul sistem.</p>
        </div>
        <div className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1">
          <span className="font-bold text-blue-300">📋 Approval Wewenang Checklist:</span>
          <p className="text-gray-400">Hanya Manager dan Supervisor (Putri Okta) yang berwenang memberikan persetujuan checklist staff.</p>
        </div>
        <div className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1">
          <span className="font-bold text-amber-300">🍳 Delegasi Modul Khusus:</span>
          <p className="text-gray-400">Aqib &amp; Arfani (CRM), Naila (Konten), Tasnim/Ulum/Dina (Kalkulator HPP).</p>
        </div>
      </div>

      {/* Search Personnel */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Cari nama personel atau posisi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
              <th className="py-3 px-3 min-w-[180px]">Personel</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Approve Checklist</th>
              {availableModules.map((m) => (
                <th key={m.id} className="py-3 px-2 text-center min-w-[80px]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D374E]">
            {INITIAL_EMPLOYEES.filter((emp) =>
              emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.primaryPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.department.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((emp) => {
              const perm = permissions[emp.id] || {
                employeeId: emp.id,
                allowedModules: ['dashboard'],
              };
              const isMaster = emp.accessLevel === 'OWNER' || emp.accessLevel === 'MANAGER';
              const canApprove =
                isMaster || perm.canApproveChecklists || emp.name.includes('Putri Okta');

              return (
                <tr key={emp.id} className="hover:bg-[#111827]/50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{emp.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {emp.primaryPosition} • <span className="text-purple-400">{emp.department}</span>
                    </div>
                  </td>

                  {/* Checklist Approval Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!canApprove}
                      disabled={isMaster}
                      onChange={() => handleToggleApproval(emp.id)}
                      className="w-4 h-4 rounded accent-purple-600 cursor-pointer disabled:opacity-50"
                    />
                  </td>

                  {/* Module Checkboxes */}
                  {availableModules.map((m) => {
                    const isChecked = isMaster || perm.allowedModules?.includes(m.id);
                    return (
                      <td key={m.id} className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          disabled={isMaster}
                          onChange={() => handleToggleModule(emp.id, m.id)}
                          className="w-4 h-4 rounded accent-purple-600 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
