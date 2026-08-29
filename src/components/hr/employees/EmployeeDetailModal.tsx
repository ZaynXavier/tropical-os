import React, { useState } from 'react';
import {
  Employee,
  Department,
  AccessLevel,
  AdditionalResponsibility,
} from '../../../types/employee';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  Layers,
  HeartHandshake,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Power,
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  allEmployees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onToggleStatus?: (employee: Employee) => void;
  canManage: boolean;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  allEmployees,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  canManage,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'position' | 'hierarchy' | 'audit'>('profile');

  if (!isOpen || !employee) return null;

  // Calculate tenure (masa kerja)
  const calculateTenure = (joinDateStr: string) => {
    try {
      const join = new Date(joinDateStr);
      const now = new Date();
      let years = now.getFullYear() - join.getFullYear();
      let months = now.getMonth() - join.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years > 0) {
        return `${years} Tahun ${months} Bulan`;
      }
      return `${months} Bulan`;
    } catch {
      return '-';
    }
  };

  // Find supervisor and manager
  const supervisor = allEmployees.find((e) => e.id === employee.supervisorId);
  const manager = allEmployees.find((e) => e.id === employee.managerId);
  const owner = allEmployees.find((e) => e.accessLevel === 'OWNER');

  // Subordinates (direct reports)
  const directReports = allEmployees.filter((e) => e.supervisorId === employee.id);

  // Badges styling helper
  const getAccessBadge = (level: AccessLevel) => {
    switch (level) {
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MANAGER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SUPERVISOR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'ON_LEAVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#13192B] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-purple-900/40 via-[#1E2438] to-[#13192B] border-b border-[#2D374E]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-[#13192B]/80 hover:bg-[#1E2438] rounded-xl border border-[#2D374E] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-purple-400/40 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30 shrink-0">
              {employee.fullName
                ? employee.fullName
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((n) => n[0] || '')
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'TG'
                : 'TG'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                  {employee.employeeCode}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${getAccessBadge(
                    employee.accessLevel
                  )}`}
                >
                  {employee.accessLevel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${getStatusBadge(
                    employee.status
                  )}`}
                >
                  {employee.status === 'ACTIVE' ? 'Aktif' : employee.status === 'INACTIVE' ? 'Non-Aktif' : 'Cuti'}
                </span>
              </div>

              <h2 className="text-xl font-black text-white truncate tracking-tight">{employee.fullName}</h2>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                {employee.primaryPosition} • <span className="text-purple-300">{employee.department}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Managers */}
          {canManage && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#2D374E]/60">
              {onEdit && (
                <button
                  onClick={() => onEdit(employee)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data Karyawan</span>
                </button>
              )}
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(employee)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    employee.isActive
                      ? 'bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border-red-500/30'
                      : 'bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{employee.isActive ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-[#13192B] border-b border-[#2D374E] overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'text-purple-400 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            Profil &amp; Kontak
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'position'
                ? 'text-purple-400 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            Jabatan &amp; Tanggung Jawab
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hierarchy'
                ? 'text-purple-400 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            Garis Komando / Hierarki
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'text-purple-400 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            Audit &amp; Catatan
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* TAB 1: PROFIL & KONTAK */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Email Resmi</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white truncate">
                    <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Nomor WhatsApp / HP</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{employee.phone || '-'}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Jenis Kelamin</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{employee.gender === 'MALE' ? 'Laki-Laki (Pria)' : 'Perempuan (Wanita)'}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Status Kepegawaian</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="uppercase font-bold text-amber-300">{employee.employmentStatus}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Tanggal Bergabung</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{employee.joinDate}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium">Masa Kerja (Tenure)</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{calculateTenure(employee.joinDate)}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-gradient-to-r from-red-950/20 via-[#1E2438] to-[#1E2438] rounded-2xl border border-red-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Kontak Darurat (Emergency Contact)</span>
                </div>
                {employee.emergencyContact ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Nama Kontak</span>
                      <strong className="text-white">{employee.emergencyContact.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Hubungan</span>
                      <strong className="text-white">{employee.emergencyContact.relationship}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Telepon Darurat</span>
                      <strong className="text-red-300 font-mono">{employee.emergencyContact.phone}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Belum ada data kontak darurat terdaftar.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: JABATAN & TANGGUNG JAWAB */}
          {activeTab === 'position' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-3">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Jabatan Pokok (Primary Position)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">{employee.primaryPosition}</h3>
                    <p className="text-xs text-gray-300">
                      Departemen: <strong className="text-purple-300">{employee.department}</strong>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getAccessBadge(
                      employee.accessLevel
                    )}`}
                  >
                    Level RBAC: {employee.accessLevel}
                  </span>
                </div>
              </div>

              {/* Additional Responsibilities */}
              <div className="p-5 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Tanggung Jawab Tambahan (Additional Responsibilities)</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {employee.additionalResponsibilities.length} Hak Akses Khusus
                  </span>
                </div>

                {employee.additionalResponsibilities.length === 0 ? (
                  <div className="p-4 bg-[#13192B] rounded-xl border border-dashed border-[#2D374E] text-center text-xs text-gray-400">
                    Karyawan ini menjalankan tugas pokok standar tanpa tugas lintas-divisi tambahan.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {employee.additionalResponsibilities.map((resp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-gradient-to-r from-amber-500/10 via-[#13192B] to-[#13192B] border border-amber-500/30 rounded-xl flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-bold text-amber-200 block">{resp}</strong>
                          <span className="text-[11px] text-gray-300">
                            {resp === 'Head of HR & Admin' &&
                              'Mengelola seluruh master database kepegawaian, persetujuan cuti, payroll, dan kebijakan HR.'}
                            {resp === 'Kasir Operasional' &&
                              'Memegang hak input transaksi POS, audit shift kasir, dan penutupan omzet harian.'}
                            {resp === 'Kitchen Shift Lead' &&
                              'Memimpin checklist stasiun dapur, recipe taste audit, dan operasional shift kitchen.'}
                            {resp === 'Bar Shift Lead' &&
                              'Memimpin checklist stasiun bar, kalibrasi espresso grinder, dan audit persediaan minuman.'}
                            {resp === 'Purchasing' &&
                              'Membuka akses modul Purchasing, pengajuan PO supplier, dan belanja pasar bahan baku.'}
                            {resp === 'Stock' &&
                              'Membuka akses modul Inventory Stock, opname fisik mingguan, dan pencatatan waste bahan.'}
                            {resp === 'Produksi Setengah Jadi' &&
                              'Membuka akses modul Produksi Batch & persiapan bumbu dasar / semi-finished kitchen.'}
                            {resp === 'Lead & Deals Pipeline' &&
                              'Mengelola negosiasi deals gathering, reservasi grup besar, dan pipeline omzet CRM.'}
                            {resp === 'Guest Relationship' &&
                              'Merespons interaksi WhatsApp CRM, reservasi harian tamu, dan log kepuasan customer.'}
                            {resp === 'Accounting & Cash Flow' &&
                              'Membuka akses laporan Finance, HPP Calculator, kas operasional, dan mutasi bank resto.'}
                            {resp === 'Social Media Production' &&
                              'Membuka akses modul Content Creator, kalender posting TikTok/IG, dan manajemen aset video.'}
                            {resp === 'Strategic Investor' &&
                              'Akses laporan eksekutif lengkap (MBR, Sales, COGS, Labor, Opex, Net Profit).'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HIERARKI / GARIS KOMANDO */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-4">
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Jalur Pelaporan &amp; Pengawasan (Reporting Line)</span>
                </div>

                {/* Tree Visual Flow */}
                <div className="space-y-3 pl-2 border-l-2 border-purple-500/30">
                  {/* Owner */}
                  {owner && (
                    <div className="flex items-center gap-3 p-3 bg-[#13192B] rounded-xl border border-[#2D374E]">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        OWNER
                      </span>
                      <div className="flex-1 text-xs">
                        <strong className="text-white">{owner.fullName}</strong>
                        <span className="text-gray-400 block text-[10px]">Strategic Investor &amp; Resto Owner</span>
                      </div>
                    </div>
                  )}

                  {/* Manager */}
                  {manager && manager.id !== owner?.id && (
                    <div className="flex items-center gap-3 p-3 bg-[#13192B] rounded-xl border border-[#2D374E]">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                        MANAGER
                      </span>
                      <div className="flex-1 text-xs">
                        <strong className="text-white">{manager.fullName}</strong>
                        <span className="text-gray-400 block text-[10px]">
                          {manager.primaryPosition} ({manager.department})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Direct Supervisor if different */}
                  {supervisor && supervisor.id !== manager?.id && (
                    <div className="flex items-center gap-3 p-3 bg-[#13192B] rounded-xl border border-[#2D374E]">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                        SUPERVISOR
                      </span>
                      <div className="flex-1 text-xs">
                        <strong className="text-white">{supervisor.fullName}</strong>
                        <span className="text-gray-400 block text-[10px]">
                          {supervisor.primaryPosition} ({supervisor.department})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CURRENT EMPLOYEE (Highlighted) */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-950/60 to-[#1E2438] rounded-xl border-2 border-purple-500 shadow-lg shadow-purple-500/10">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${getAccessBadge(
                        employee.accessLevel
                      )}`}
                    >
                      {employee.accessLevel} (Karyawan Ini)
                    </span>
                    <div className="flex-1 text-xs">
                      <strong className="text-white text-sm">{employee.fullName}</strong>
                      <span className="text-purple-300 block text-[11px]">{employee.primaryPosition}</span>
                    </div>
                  </div>
                </div>

                {/* Subordinates if any */}
                {directReports.length > 0 && (
                  <div className="pt-4 border-t border-[#2D374E] space-y-2">
                    <span className="text-xs font-bold text-emerald-300 block">
                      Anggota Tim Langsung Dibawahi ({directReports.length} Orang):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {directReports.map((dr) => (
                        <div
                          key={dr.id}
                          className="p-2.5 bg-[#13192B] rounded-xl border border-[#2D374E] flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-white block">{dr.fullName}</strong>
                            <span className="text-[10px] text-gray-400">{dr.primaryPosition}</span>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">{dr.employeeCode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT & CATATAN */}
          {activeTab === 'audit' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  Catatan Khusus Karyawan
                </span>
                <p className="text-xs text-gray-200 leading-relaxed bg-[#13192B] p-4 rounded-xl border border-[#2D374E]">
                  {employee.notes || 'Tidak ada catatan khusus untuk karyawan ini.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400">Dibuat Pada (System Created)</span>
                  <div className="font-mono text-gray-200">
                    {new Date(employee.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-1">
                  <span className="text-[11px] text-gray-400">Pembaruan Terakhir (Last Updated)</span>
                  <div className="font-mono text-gray-200">
                    {new Date(employee.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#1E2438] border-t border-[#2D374E] flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono">
            ID: <strong className="text-white">{employee.id}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#13192B] hover:bg-gray-800 text-white rounded-xl text-xs font-bold border border-[#2D374E] transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
