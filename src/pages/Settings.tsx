import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MASTER_ROLES } from '../config/roles';
import { MASTER_EMPLOYEES } from '../config/employees';
import { salesService } from '../services/salesService';
import { ModuleAccessManagement } from '../components/settings/ModuleAccessManagement';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Building, 
  Users, 
  Database, 
  Server, 
  Check, 
  Info,
  Clock,
  Layers,
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'access' | 'personnel' | 'system' | 'tests'>('profile');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await salesService.runCriticalBusinessTests();
      setTestResults(results);
    } catch (err) {
      console.error('Failed to run business tests:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2D374E]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-100 tracking-tight">
              Pengaturan Sistem TropicalOS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Phase 3.8 Hardened
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400">
            Konfigurasi profil restoran, hak akses pengelola modul, hierarki wewenang RBAC, dan uji validasi bisnis.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'profile', label: 'Profil Restoran', icon: Building },
            { id: 'access', label: 'Akses Pengelola Modul', icon: UserCheck },
            { id: 'rbac', label: 'Matriks RBAC', icon: ShieldCheck },
            { id: 'personnel', label: 'Master 24 Personel', icon: Users },
            { id: 'system', label: 'Status Arsitektur', icon: Server },
            { id: 'tests', label: '7 Critical Business Tests', icon: FlaskConical },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Akses Pengelola Modul */}
      {activeTab === 'access' && <ModuleAccessManagement />}

      {/* Tab 1: Profil Restoran */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-6">
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 border-b border-[#2D374E] pb-3">
            <Building className="w-5 h-5 text-purple-400" />
            Informasi Profil Bisnis Restoran
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Nama Restoran</label>
              <input
                type="text"
                readOnly
                value="Tropical Garden Resto"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-gray-100 font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Sistem Operasi (OS)</label>
              <input
                type="text"
                readOnly
                value="TROPICALOS v1.0.0 (Phase 0 Frontend Foundation)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-purple-300 font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Jam Operasional Resto</label>
              <input
                type="text"
                readOnly
                value="09:00 WIB - 22:00 WIB (Setiap Hari)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-gray-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Total Personel Aktif</label>
              <input
                type="text"
                readOnly
                value="24 Karyawan (6 Divisi)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] text-xs text-gray-300 space-y-1">
            <div className="font-semibold text-purple-300">Catatan Konfigurasi Phase 0:</div>
            <p>
              Data profil di atas diambil dari master configuration static sesuai ketetapan PRD.md. Pada fase implementasi backend selanjutnya, form ini akan terhubung ke API pengaturan dinamis.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Matriks RBAC */}
      {activeTab === 'rbac' && (
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-6">
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 border-b border-[#2D374E] pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Matriks 4 Access Level & Hak Wewenang (/doc/RBAC.md)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(MASTER_ROLES).map((role) => (
              <div
                key={role.id}
                className="p-4 rounded-xl bg-[#111827]/60 border border-[#2D374E] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-100">{role.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {role.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{role.description}</p>
                <div className="text-[11px] text-pink-300 pt-1">
                  <strong>Fokus:</strong> {role.focusArea}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Master 24 Personel */}
      {activeTab === 'personnel' && (
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              Master 24 Personel Tropical Garden Resto
            </h2>
            <span className="text-xs text-gray-400">Total: {MASTER_EMPLOYEES.length} Karyawan</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-gray-400 font-semibold border-b border-[#2D374E]">
                <tr>
                  <th className="p-3">No. ID</th>
                  <th className="p-3">Nama Karyawan</th>
                  <th className="p-3">Departemen</th>
                  <th className="p-3">Jabatan Pokok</th>
                  <th className="p-3">Access Level</th>
                  <th className="p-3">Tanggung Jawab Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283049]">
                {MASTER_EMPLOYEES.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="p-3 font-mono text-gray-400">{emp.employeeNo}</td>
                    <td className="p-3 font-semibold text-gray-200">{emp.name}</td>
                    <td className="p-3 text-gray-300">{emp.department}</td>
                    <td className="p-3 text-gray-300">{emp.primaryPosition}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {emp.accessLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      {(emp.additionalResponsibilities || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(emp.additionalResponsibilities || []).map((r, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded text-[10px] bg-pink-950/60 text-pink-300 border border-pink-800/40">
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Status Arsitektur */}
      {activeTab === 'system' && (
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-6">
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 border-b border-[#2D374E] pb-3">
            <Server className="w-5 h-5 text-blue-400" />
            Kepatuhan Arsitektur Frontend (/doc/FRONTEND_ARCHITECTURE.md)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Backend-Ready Abstraction',
                desc: 'Seluruh service (authService, permissionService, navigationService) diisolasi agar backend dapat dihubungkan di masa mendatang tanpa merusak UI.',
                status: 'Sesuai Spesifikasi',
              },
              {
                title: 'RBAC Multi-Level Foundation',
                desc: 'RoleGuard & ProtectedRoute tervalidasi dengan 4 Access Level (OWNER, MANAGER, SUPERVISOR, STAFF) dan filter spesifik modul.',
                status: 'Sesuai Spesifikasi',
              },
              {
                title: 'Pure Frontend-First State',
                desc: 'Bebas dari dependensi backend aktif, Supabase CRUD, atau API eksternal pihak ketiga sesuai larangan Phase 0.',
                status: 'Sesuai Spesifikasi',
              },
              {
                title: 'Dark Navy Design System',
                desc: 'Tema visual modern Dark Navy (#0B0F19, #1E2438) dengan aksen Purple & Pink (#9333ea, #ec4899) dan tipografi terstruktur.',
                status: 'Sesuai Spesifikasi',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#111827]/60 border border-[#2D374E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-100">{item.title}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: 7 Critical Business Tests */}
      {activeTab === 'tests' && (
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D374E] pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-pink-400" />
                Phase 3.8 — 7 Critical Business Test Assertions
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Eksekusi otomatis pengujian matematika, perpajakan, rekonsiliasi kasir, diskon, refund, dan integritas data contract salesService.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isRunningTests ? 'Menjalankan Tes...' : 'Jalankan 7 Business Tests'}</span>
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-12 bg-[#111827]/40 rounded-2xl border border-dashed border-[#2D374E] space-y-3">
              <FlaskConical className="w-10 h-10 text-purple-400/50 mx-auto" />
              <div className="text-sm font-semibold text-gray-300">Belum Ada Pengujian yang Dijalankan</div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Klik tombol "Jalankan 7 Business Tests" di atas untuk memvalidasi alur POS, Split Payment, Selisih Kasir, Tax PB1, Refund, dan SalesRevenueContract.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#2D374E] text-xs">
                <span className="font-bold text-gray-300">Hasil Pengujian:</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {testResults.filter(t => t.passed).length} Lolos
                  </span>
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {testResults.filter(t => !t.passed).length} Gagal
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      t.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-300">
                            #{t.caseNumber}
                          </span>
                          <h4 className="text-xs font-bold text-gray-100">{t.name}</h4>
                        </div>
                        <p className="text-[11px] text-gray-400">{t.details}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shrink-0 ${
                          t.passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {t.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
