import React, { useState, useEffect } from 'react';
import {
  Employee,
  Department,
  AccessLevel,
  EmploymentStatus,
  Gender,
  AdditionalResponsibility,
} from '../../../types/employee';
import { X, UserPlus, Save, AlertCircle, Sparkles, User, Briefcase, Phone, Mail, Calendar, Shield } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: any) => Promise<void>;
  initialEmployee?: Employee | null;
  allEmployees: Employee[];
}

const ALL_DEPARTMENTS: Department[] = [
  'Executive',
  'Management',
  'Operations',
  'Kitchen',
  'Bar',
  'Service',
  'Cleaning',
  'CRM',
  'Finance',
  'Marketing',
];

const ALL_ACCESS_LEVELS: AccessLevel[] = ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'];

const ALL_EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'PERMANENT', label: 'Tetap (Permanent)' },
  { value: 'CONTRACT', label: 'Kontrak (Contract)' },
  { value: 'PROBATION', label: 'Percobaan (Probation)' },
  { value: 'PART_TIME', label: 'Paruh Waktu (Part-Time)' },
];

const ALL_RESPONSIBILITIES: { value: AdditionalResponsibility; desc: string }[] = [
  { value: 'Head of HR & Admin', desc: 'Pengelolaan master kepegawaian & kebijakan HR' },
  { value: 'Kasir Operasional', desc: 'Hak kasir shift POS & audit uang kasir harian' },
  { value: 'Kitchen Shift Lead', desc: 'Supervisi stasiun dapur & briefing resep' },
  { value: 'Bar Shift Lead', desc: 'Supervisi stasiun bar & kalibrasi minuman' },
  { value: 'Purchasing', desc: 'Pengadaan bahan baku segar & order supplier' },
  { value: 'Stock', desc: 'Audit stok gudang & pencatatan waste bahan' },
  { value: 'Produksi Setengah Jadi', desc: 'Persiapan bumbu dasar & batching saus' },
  { value: 'Lead & Deals Pipeline', desc: 'Manajemen deal banquet & event gathering' },
  { value: 'Guest Relationship', desc: 'Follow-up WhatsApp CRM & reservasi tamu' },
  { value: 'Accounting & Cash Flow', desc: 'Laporan keuangan, HPP, & rekonsiliasi kas' },
  { value: 'Social Media Production', desc: 'Produksi konten TikTok, IG, & promosi' },
  { value: 'Strategic Investor', desc: 'Akses penuh laporan eksekutif & MBR' },
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee,
  allEmployees,
}) => {
  const isEditing = !!initialEmployee;

  // Form states
  const [fullName, setFullName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('PERMANENT');
  const [joinDate, setJoinDate] = useState('');
  const [department, setDepartment] = useState<Department>('Operations');
  const [primaryPosition, setPrimaryPosition] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('STAFF');
  const [additionalResponsibilities, setAdditionalResponsibilities] = useState<AdditionalResponsibility[]>([]);
  const [supervisorId, setSupervisorId] = useState<string>('emp-02');
  const [managerId, setManagerId] = useState<string>('emp-02');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [password, setPassword] = useState('tropical2026');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  // Populate data when editing or opening
  useEffect(() => {
    if (initialEmployee) {
      setFullName(initialEmployee.fullName || initialEmployee.name || '');
      setEmployeeCode(initialEmployee.employeeCode || initialEmployee.employeeNo || '');
      setEmail(initialEmployee.email || '');
      setPhone(initialEmployee.phone || '');
      setGender(initialEmployee.gender || 'MALE');
      setEmploymentStatus(initialEmployee.employmentStatus || 'PERMANENT');
      setJoinDate(initialEmployee.joinDate || '');
      setDepartment(initialEmployee.department || 'Operations');
      setPrimaryPosition(initialEmployee.primaryPosition || initialEmployee.role || '');
      setAccessLevel(initialEmployee.accessLevel || 'STAFF');
      setAdditionalResponsibilities(initialEmployee.additionalResponsibilities || []);
      setSupervisorId(initialEmployee.supervisorId || '');
      setManagerId(initialEmployee.managerId || 'emp-02');
      setEmergencyName(initialEmployee.emergencyContact?.name || '');
      setEmergencyRelation(initialEmployee.emergencyContact?.relationship || '');
      setEmergencyPhone(initialEmployee.emergencyContact?.phone || '');
      setNotes(initialEmployee.notes || '');
      setStatus(initialEmployee.status || (initialEmployee.isActive ? 'ACTIVE' : 'INACTIVE'));
      setPassword(''); // keep blank unless resetting
    } else {
      // Defaults for create
      setFullName('');
      setEmployeeCode(`TG-STAFF-${String(allEmployees.length + 1).padStart(3, '0')}`);
      setEmail('');
      setPhone('+62 ');
      setGender('MALE');
      setEmploymentStatus('PERMANENT');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setDepartment('Kitchen');
      setPrimaryPosition('Cook');
      setAccessLevel('STAFF');
      setAdditionalResponsibilities([]);
      setSupervisorId('emp-04');
      setManagerId('emp-02');
      setEmergencyName('');
      setEmergencyRelation('');
      setEmergencyPhone('');
      setNotes('');
      setStatus('ACTIVE');
      setPassword('tropical2026');
    }
    setError(null);
  }, [initialEmployee, isOpen, allEmployees.length]);

  if (!isOpen) return null;

  const toggleResponsibility = (val: AdditionalResponsibility) => {
    if (additionalResponsibilities.includes(val)) {
      setAdditionalResponsibilities(additionalResponsibilities.filter((r) => r !== val));
    } else {
      setAdditionalResponsibilities([...additionalResponsibilities, val]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!fullName.trim()) {
      setError('Nama Lengkap wajib diisi.');
      return;
    }
    if (!employeeCode.trim()) {
      setError('Kode Karyawan wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setError('Email resmi wajib diisi.');
      return;
    }
    if (!primaryPosition.trim()) {
      setError('Jabatan Pokok (Primary Position) wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        employeeCode: employeeCode.trim().toUpperCase(),
        employeeNo: employeeCode.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gender,
        employmentStatus,
        joinDate: joinDate || new Date().toISOString().split('T')[0],
        department,
        primaryPosition: primaryPosition.trim(),
        role: primaryPosition.trim(),
        division: department,
        accessLevel,
        additionalResponsibilities,
        supervisorId: supervisorId || null,
        managerId: managerId || null,
        status,
        isActive: status === 'ACTIVE',
        password: password ? password.trim() : undefined,
        notes: notes.trim(),
        emergencyContact: emergencyName
          ? {
              name: emergencyName.trim(),
              relationship: emergencyRelation.trim() || 'Keluarga',
              phone: emergencyPhone.trim() || '-',
            }
          : undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#13192B] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-900/50 via-[#1E2438] to-[#13192B] border-b border-[#2D374E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              {isEditing ? <Briefcase className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isEditing ? `Edit Data: ${initialEmployee?.fullName}` : 'Tambah Karyawan Baru'}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing
                  ? 'Perbarui informasi profil, penugasan, dan garis komando.'
                  : 'Daftarkan karyawan baru ke dalam Master Database Tropical Garden Resto.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#13192B]/80 hover:bg-[#1E2438] rounded-xl border border-[#2D374E] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="employee-form" onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* SECTION 1: Identitas & Kontak */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>1. Identitas Pokok &amp; Kontak</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Nama Lengkap Karyawan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Heri Setiawan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Kode Karyawan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TG-KIT-001"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs font-mono text-purple-300 uppercase placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Email Resmi Tropical <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@tropicalgarden.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="+62 8xx-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="MALE">Laki-Laki (Pria)</option>
                  <option value="FEMALE">Perempuan (Wanita)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Status Kepegawaian</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_EMPLOYMENT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Tanggal Bergabung (Join Date)</label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Status Keaktifan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ACTIVE">Aktif (Bekerja Normal)</option>
                  <option value="INACTIVE">Non-Aktif (Keluar / Non-Aktif)</option>
                  <option value="ON_LEAVE">Sedang Cuti / Izin Panjang</option>
                </select>
              </div>

              {/* Password / PIN Input Field */}
              <div className="sm:col-span-2 bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-purple-200">
                    Kata Sandi (Password Akun Login) {isEditing ? '(Kosongkan jika tidak ingin diubah)' : '*'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                  >
                    Acak Password
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={isEditing ? 'Tetap gunakan kata sandi lama' : 'Contoh: tropical2026 atau buat kata sandi baru'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141029] border border-purple-500/40 rounded-xl text-xs font-mono text-purple-200 placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
                <p className="text-[10px] text-purple-300/70 mt-1">
                  Kata sandi ini diberikan kepada staf agar dapat login ke TropicalOS Mobile Portal dan Desktop.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Penugasan, Departemen & RBAC */}
          <div className="space-y-4 pt-4 border-t border-[#2D374E]">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>2. Departemen, Jabatan &amp; Tingkat Akses (RBAC)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Departemen <span className="text-red-400">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Jabatan Pokok (Primary Position) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cook / Head Kitchen / Barista"
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Tingkat Akses (Access Level) <span className="text-red-400">*</span>
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_ACCESS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Responsibilities Multi-Select */}
            <div className="p-4 bg-[#1E2438] rounded-2xl border border-[#2D374E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tanggung Jawab Tambahan (Additional Responsibilities)</span>
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {additionalResponsibilities.length} Dipilih
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Pemberian wewenang lintas-fungsi khusus (misal: Kasir untuk Supervisor/Waiter, Purchasing untuk Cook, dsb.)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {ALL_RESPONSIBILITIES.map((resp) => {
                  const isChecked = additionalResponsibilities.includes(resp.value);
                  return (
                    <label
                      key={resp.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-600/20 border-purple-500/50 text-white'
                          : 'bg-[#13192B] border-[#2D374E] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleResponsibility(resp.value)}
                        className="mt-0.5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="text-xs">
                        <strong className="block font-semibold">{resp.value}</strong>
                        <span className="text-[10px] text-gray-400">{resp.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Garis Komando & Supervisi */}
          <div className="space-y-4 pt-4 border-t border-[#2D374E]">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>3. Garis Komando &amp; Supervisi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Atasan Langsung (Supervisor)</label>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Tidak Ada / Lapor Langsung ke GM --</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.primaryPosition} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">General Manager Pengawas</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {allEmployees
                    .filter((e) => e.accessLevel === 'MANAGER' || e.accessLevel === 'OWNER')
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.primaryPosition})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Kontak Darurat & Catatan */}
          <div className="space-y-4 pt-4 border-t border-[#2D374E]">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>4. Kontak Darurat &amp; Catatan Khusus</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Nama Kontak Darurat</label>
                <input
                  type="text"
                  placeholder="Nama keluarga / kerabat"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Hubungan</label>
                <input
                  type="text"
                  placeholder="Orang Tua / Pasangan / Saudara"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">Nomor Telepon Darurat</label>
                <input
                  type="text"
                  placeholder="+62 8xx-xxxx-xxxx"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">Catatan Khusus Karyawan</label>
              <textarea
                rows={2}
                placeholder="Catatan penempatan khusus, keahlian khusus, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1E2438] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1E2438] border-t border-[#2D374E] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-[#13192B] hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-bold border border-[#2D374E] transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            form="employee-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
