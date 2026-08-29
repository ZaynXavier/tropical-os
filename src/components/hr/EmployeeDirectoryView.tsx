/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_EMPLOYEES, Employee } from "../../data/mockHrData";
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  Phone,
  Mail,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Briefcase,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface EmployeeDirectoryViewProps {
  user: User;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({ user }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // New Employee Form State
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDivision, setNewDivision] = useState<Employee["division"]>("Service");
  const [newStatus, setNewStatus] = useState<Employee["status"]>("Full-Time");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBank, setNewBank] = useState("BCA ");
  const [newBaseSalary, setNewBaseSalary] = useState<number>(5000000);
  const [newDailyAllowance, setNewDailyAllowance] = useState<number>(50000);

  const filteredEmployees = employees.filter((emp) => {
    const matchesDivision = selectedDivision === "ALL" || emp.division === selectedDivision;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesSearch;
  });

  const divisions = ["ALL", "Kitchen", "Service", "Bar", "Finance & HR", "Operational"];

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;

    const newEntry: Employee = {
      id: `emp-${Date.now()}`,
      code: `EMP-00${employees.length + 1}`,
      name: newName,
      role: newRole,
      division: newDivision,
      status: newStatus,
      joinDate: new Date().toLocaleDateString("id-ID"),
      phone: newPhone || "+62 812-0000-0000",
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@tropicalgarden.com`,
      bankAccount: newBank || "BCA 1234567890",
      baseSalary: newBaseSalary,
      dailyAllowance: newDailyAllowance,
      active: true,
    };

    setEmployees([...employees, newEntry]);
    setIsAddOpen(false);
    setNewName("");
    setNewRole("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Database Karyawan &amp; Struktur Organisasi</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Kelola profil lengkap staf kitchen, service, bar, divisi operasional, nomor rekening &amp; status kerja.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-indigo-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Staf Aktif</span>
          <div className="text-2xl font-black text-white mt-1">{employees.length} Karyawan</div>
          <span className="text-[10px] text-emerald-400 font-bold">100% Operational Ready</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Tim Kitchen &amp; Bar</span>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {employees.filter((e) => e.division === "Kitchen" || e.division === "Bar").length} Staf
          </div>
          <span className="text-[10px] text-amber-400 font-bold">Chef, Commis &amp; Barista</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Tim Floor Service</span>
          <div className="text-2xl font-black text-pink-300 mt-1">
            {employees.filter((e) => e.division === "Service").length} Staf
          </div>
          <span className="text-[10px] text-pink-400 font-bold">Waitstaff &amp; Cashier</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Status Tetap / Contract</span>
          <div className="text-2xl font-black text-indigo-300 mt-1">
            {employees.filter((e) => e.status === "Full-Time").length} / {employees.filter((e) => e.status !== "Full-Time").length}
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">Full-Time vs Contract</span>
        </div>
      </div>

      {/* Toolbar Search & Division Filters */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            placeholder="Cari nama karyawan, jabatan, atau NIK/KODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-300/60 mr-1" />
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] ${
                selectedDivision === div
                  ? "bg-purple-600 text-white border border-purple-400 shadow-md font-black"
                  : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmp(emp)}
            className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-purple-300/70">{emp.code}</span>
                <span
                  className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    emp.status === "Full-Time"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                  {emp.name}
                </h3>
                <p className="text-xs text-indigo-300 font-bold mt-0.5">{emp.role}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-purple-200 font-semibold">
                  Divisi: {emp.division}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-purple-200/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{emp.bankAccount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs font-mono">
              <span className="text-purple-300/60 text-[10px]">Gaji Pokok:</span>
              <span className="text-emerald-400 font-extrabold">
                Rp {(emp.baseSalary || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-300 font-bold">{selectedEmp.code}</span>
                <h3 className="font-extrabold text-base text-white">{selectedEmp.name}</h3>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-300">Jabatan:</span>
                  <strong className="text-white">{selectedEmp.role}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Divisi:</span>
                  <strong className="text-white">{selectedEmp.division}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Status Kerja:</span>
                  <strong className="text-emerald-300">{selectedEmp.status}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Mulai Bergabung:</span>
                  <strong className="text-white">{selectedEmp.joinDate}</strong>
                </div>
              </div>

              <div className="bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-purple-300">Gaji Pokok Bulanan:</span>
                  <strong className="text-emerald-400">Rp {(selectedEmp.baseSalary || 0).toLocaleString("id-ID")}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Uang Makan / Harian:</span>
                  <strong className="text-white">Rp {(selectedEmp.dailyAllowance || 0).toLocaleString("id-ID")} / Hari</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Rekening Transfer:</span>
                  <strong className="text-purple-200">{selectedEmp.bankAccount}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Tambah Karyawan Resto Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Lengkap Karyawan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Andi Wijaya"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Jabatan / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pastry Chef"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Divisi Kerja</label>
                  <select
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service">Service</option>
                    <option value="Bar">Bar</option>
                    <option value="Finance & HR">Finance &amp; HR</option>
                    <option value="Operational">Operational</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Status Karyawan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Full-Time">Full-Time (Tetap)</option>
                    <option value="Contract">Contract (Kontrak)</option>
                    <option value="Probation">Probation (Masa Percobaan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="+62 8..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={newBaseSalary}
                    onChange={(e) => setNewBaseSalary(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Uang Makan / Hari (Rp)</label>
                  <input
                    type="number"
                    value={newDailyAllowance}
                    onChange={(e) => setNewDailyAllowance(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Bank &amp; No. Rekening</label>
                <input
                  type="text"
                  placeholder="Contoh: BCA 8820192831"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs font-black"
                >
                  Simpan Karyawan Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
