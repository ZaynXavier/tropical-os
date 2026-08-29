import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Department } from '../../../types/employee';
import { employeeService } from '../../../services/employeeService';
import { EmployeeDetailModal } from '../employees/EmployeeDetailModal';
import {
  Network,
  Users,
  Shield,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Building2,
  Sparkles,
  Search,
  Layers,
  UserCheck,
  Crown,
  ChefHat,
  Coffee,
  UtensilsCrossed,
  Sparkle,
  PhoneCall,
  DollarSign,
  Video,
} from 'lucide-react';

export const OrganizationStructureView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'departments'>('hierarchy');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getEmployees();
        setEmployees(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim() && selectedDeptFilter === 'ALL') return employees;
    return employees.filter((emp) => {
      const matchSearch =
        !searchQuery.trim() ||
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.additionalResponsibilities.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, selectedDeptFilter]);

  // Roles identification
  const owner = employees.find((e) => e.accessLevel === 'OWNER');
  const manager = employees.find((e) => e.accessLevel === 'MANAGER');
  const heads = employees.filter((e) => e.accessLevel === 'HEAD');
  const supervisors = employees.filter((e) => e.accessLevel === 'SUPERVISOR');

  // Department definitions
  const departmentsData: {
    dept: Department;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }[] = [
    {
      dept: 'Executive',
      name: 'Eksekutif & Pemilik',
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10',
      description: 'Pengambilan keputusan strategis resto & investasi modal.',
    },
    {
      dept: 'Management',
      name: 'General Management & HR',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10',
      description: 'Operasional harian, kepatuhan SOP, dan administrasi SDM.',
    },
    {
      dept: 'Operations',
      name: 'Operasional & Supervisi',
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/40 bg-blue-500/10',
      description: 'Pengawasan lantai resto, rekonsiliasi kasir, & kelancaran shift.',
    },
    {
      dept: 'Kitchen',
      name: 'Kitchen & Produksi',
      icon: <ChefHat className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10',
      description: 'Pengolahan makanan, standarisasi resep, inventory bahan segar.',
    },
    {
      dept: 'Bar',
      name: 'Bar & Minuman',
      icon: <Coffee className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-500/10',
      description: 'Penyajian racikan kopi, mocktail, dan kalibrasi mesin grinder.',
    },
    {
      dept: 'Service',
      name: 'Service & Pelayanan',
      icon: <UtensilsCrossed className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-500/10',
      description: 'Greeting tamu, pesanan meja, POS billing kasir, dan table clearing.',
    },
    {
      dept: 'Cleaning',
      name: 'Cleaning & Utility',
      icon: <Sparkle className="w-5 h-5 text-teal-400" />,
      color: 'border-teal-500/40 bg-teal-500/10',
      description: 'Sanitasi area makan, pencucian piring/alat masak, & waste management.',
    },
    {
      dept: 'CRM',
      name: 'CRM & Reservasi',
      icon: <PhoneCall className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/40 bg-pink-500/10',
      description: 'WhatsApp gateway, booking acara gathering, dan relasi pelanggan.',
    },
    {
      dept: 'Finance',
      name: 'Finance & Akuntansi',
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10',
      description: 'Pencatatan kas operasional, HPP kitchen, & pelaporan neraca keuangan.',
    },
    {
      dept: 'Marketing',
      name: 'Marketing & Konten',
      icon: <Video className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/40 bg-orange-500/10',
      description: 'Produksi video TikTok, Instagram promo, dan materi promosi resto.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-[#13192B] to-purple-950/40 border border-blue-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest px-2.5 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                Organisasi Resmi
              </span>
              <span className="text-xs text-blue-200/60 font-mono">Master Hierarchy &amp; Departments</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Struktur Organisasi Tropical Garden Resto
            </h1>
            <p className="text-xs text-blue-200/70 max-w-2xl mt-0.5">
              Pohon komando hierarkis dari Pemilik (Owner), General Manager, para Supervisor, hingga seluruh Tim Operasional (24 Personel).
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#1E2438] p-1.5 rounded-2xl border border-[#2D374E] shrink-0">
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'hierarchy' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pohon Hierarki</span>
          </button>
          <button
            onClick={() => setViewMode('departments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'departments' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Matriks Departemen</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-[#13192B] border border-[#2D374E] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari personil atau divisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 shrink-0">Filter Divisi:</span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Divisi (10 Departemen)</option>
            {departmentsData.map((d) => (
              <option key={d.dept} value={d.dept}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. HIERARCHY TREE VIEW */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-8">
          {/* LEVEL 1: OWNER */}
          {owner && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Tier 1 — Strategic Leadership
                </span>
              </div>
              <div
                onClick={() => setSelectedEmployee(owner)}
                className="w-full max-w-md p-5 bg-gradient-to-r from-amber-950/40 via-[#1E2438] to-[#13192B] border-2 border-amber-500/50 hover:border-amber-400 rounded-3xl shadow-xl shadow-amber-500/5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-base shadow-md">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        OWNER
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{owner.employeeCode}</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">{owner.fullName}</h3>
                    <p className="text-xs text-amber-300/90 font-medium">Strategic Investor &amp; Resto Owner</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </div>
              {/* Connector line */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-purple-500 my-1"></div>
            </div>
          )}

          {/* LEVEL 2: GENERAL MANAGER & HEAD OF HR */}
          {manager && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Tier 2 — General Management &amp; HR
                </span>
              </div>
              <div
                onClick={() => setSelectedEmployee(manager)}
                className="w-full max-w-md p-5 bg-gradient-to-r from-purple-950/40 via-[#1E2438] to-[#13192B] border-2 border-purple-500/50 hover:border-purple-400 rounded-3xl shadow-xl shadow-purple-500/10 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-base shadow-md">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        MANAGER
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{manager.employeeCode}</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">{manager.fullName}</h3>
                    <p className="text-xs text-purple-300 font-medium">
                      General Manager &amp; Head of HR &amp; Admin
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </div>
              {/* Connector line */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500 my-1"></div>
            </div>
          )}

          {/* LEVEL 3: SEPARATED HEADS (DIVISION LEADS) VS SUPERVISOR */}
          <div className="space-y-6">
            {/* 3A. KEPALA BAGIAN / HEAD OF DIVISION */}
            <div className="p-5 rounded-3xl bg-[#13192B] border-2 border-indigo-500/30 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Tier 3A — Kepala Bagian / Head of Division (Kitchen, Bar, Service, CRM, HR, Finance)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        HEAD
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Memberikan tugas khusus kepada anak buah di divisi masing-masing. Tidak memiliki hak approval (Hak approval mutlak di tangan Manager).
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                  Hak Persetujuan: <strong className="text-amber-400">Hanya Manager</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees
                  .filter((e) => e.accessLevel === 'HEAD')
                  .map((head) => (
                    <div
                      key={head.id}
                      onClick={() => setSelectedEmployee(head)}
                      className="p-4 bg-[#1E2438] hover:bg-indigo-950/40 border border-[#2D374E] hover:border-indigo-500/50 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-xs shrink-0">
                          {head.fullName
                            ? head.fullName
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean)
                                .map((n) => n[0] || '')
                                .slice(0, 2)
                                .join('')
                                .toUpperCase() || 'TG'
                            : 'TG'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-indigo-400">{head.employeeCode}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                              HEAD • {head.department}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white truncate mt-0.5">{head.fullName}</h4>
                          <span className="text-[11px] text-gray-300 block truncate">{head.primaryPosition}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>

            {/* 3B. SUPERVISOR OPERASIONAL LANTAI */}
            <div className="p-5 rounded-3xl bg-[#13192B] border-2 border-blue-500/30 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-black text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Tier 3B — Supervisor Operasional Lantai (Floor Supervisor)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        SUPERVISOR
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Pengawasan operasional harian seluruh lantai resto, koordinasi lintas stasiun, kasir operasional POS, utility &amp; cleaning.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                  Akses Payroll: <strong className="text-red-400">Terkunci (No Access)</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees
                  .filter((e) => e.accessLevel === 'SUPERVISOR')
                  .map((sup) => (
                    <div
                      key={sup.id}
                      onClick={() => setSelectedEmployee(sup)}
                      className="p-4 bg-[#1E2438] hover:bg-blue-950/40 border border-[#2D374E] hover:border-blue-500/50 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-black text-sm shadow-md">
                          PO
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-blue-400">{sup.employeeCode}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase">
                              FLOOR SUPERVISOR
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white mt-0.5">{sup.fullName}</h4>
                          <p className="text-xs text-blue-200/80 font-medium">{sup.primaryPosition}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {sup.additionalResponsibilities.map((resp, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-gray-300 border border-white/10"
                              >
                                {resp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>

            {/* KOMPARASI PERAN KOTAK PANDUAN */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#1E2438] to-purple-950/30 border border-white/10 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Matriks Perbedaan: Owner vs Manager vs Head vs Supervisor</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-300 pt-1">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <strong className="text-purple-300 block font-bold mb-1">Owner &amp; Manager:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-300">
                    <li><strong>Owner:</strong> Tidak menerima tugas operasional apapun. Hanya memberikan tugas dari tingkat Manager hingga paling bawah.</li>
                    <li><strong>Manager:</strong> SATU-SATUNYA yang berhak memberikan approval (Persetujuan Cuti, Lembur, Kasbon, Pembelian PR).</li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <strong className="text-indigo-300 block font-bold mb-1">Head of Division (Kepala Bagian):</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-300">
                    <li>Hanya bisa memberikan tugas kepada anak buah di divisi masing-masing.</li>
                    <li>Standarisasi resep/minuman, SOP stasiun, kontrol HPP &amp; mutu.</li>
                    <li>Tidak memiliki hak approval &amp; tidak bisa melihat payroll.</li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <strong className="text-blue-300 block font-bold mb-1">Supervisor Operasional Lantai:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-300">
                    <li>Pengawasan lantai resto harian, kasir POS &amp; cleaning.</li>
                    <li>Eskalasi masalah tamu &amp; koordinasi lintas stasiun.</li>
                    <li>Tidak memiliki hak approval &amp; tidak bisa melihat payroll.</li>
                  </ul>
                </div>
              </div>
              <div className="text-[10px] text-amber-300/90 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-1">
                🔒 <strong>Aturan RBAC Ketat:</strong> Seluruh approval permohonan tersentralisasi pada General Manager. Head divisi hanya mengelola penugasan staf divisinya. Owner memiliki wewenang delegasi tugas ke bawah tanpa menerima beban tugas operasional.
              </div>
            </div>
          </div>

          {/* LEVEL 4: OPERATIONAL TEAMS BY DEPARTMENT */}
          <div className="space-y-4 pt-4 border-t border-[#2D374E]">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Tier 4 — Tim Operasional Resto per Divisi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentsData
                .filter((d) => d.dept !== 'Executive' && d.dept !== 'Management')
                .map((deptInfo) => {
                  const deptStaff = employees.filter((e) => e.department === deptInfo.dept);
                  return (
                    <div
                      key={deptInfo.dept}
                      className="p-4 bg-[#13192B] rounded-3xl border border-[#2D374E] space-y-3 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-[#2D374E] pb-2.5">
                        <div className="flex items-center gap-2">
                          {deptInfo.icon}
                          <strong className="text-xs font-bold text-white">{deptInfo.name}</strong>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-300">
                          {deptStaff.length} Org
                        </span>
                      </div>

                      <div className="space-y-2">
                        {deptStaff.map((staff) => (
                          <div
                            key={staff.id}
                            onClick={() => setSelectedEmployee(staff)}
                            className="p-2 bg-[#1E2438] hover:bg-purple-950/40 rounded-xl border border-[#2D374E] hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{staff.fullName}</span>
                              <span className="text-[10px] text-gray-400 block truncate">{staff.primaryPosition}</span>
                            </div>
                            <span className="text-[10px] text-purple-400 font-mono shrink-0 ml-1">
                              {staff.employeeCode.split('-')[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS MATRIX VIEW */}
      {viewMode === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departmentsData.map((deptInfo) => {
            const deptStaff = employees.filter((e) => e.department === deptInfo.dept);
            const activeCount = deptStaff.filter((e) => e.isActive).length;

            return (
              <div
                key={deptInfo.dept}
                className="p-6 rounded-3xl bg-[#13192B] border border-[#2D374E] shadow-xl space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${deptInfo.color}`}>{deptInfo.icon}</div>
                    <div>
                      <h3 className="text-base font-black text-white">{deptInfo.name}</h3>
                      <p className="text-xs text-gray-400">{deptInfo.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-purple-300 font-mono">{deptStaff.length}</div>
                    <span className="text-[10px] text-gray-400">Total Anggota</span>
                  </div>
                </div>

                {/* Staff list in department */}
                <div className="space-y-2 pt-2 border-t border-[#2D374E]/60">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Personil Terdaftar:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deptStaff.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-2.5 bg-[#1E2438] hover:bg-purple-950/40 rounded-2xl border border-[#2D374E] hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-white block truncate">{emp.fullName}</strong>
                          <span className="text-[10px] text-gray-300 block truncate">{emp.primaryPosition}</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 shrink-0 ml-1">
                          {emp.employeeCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        allEmployees={employees}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        canManage={false}
      />
    </div>
  );
};
