import React, { useEffect, useState } from 'react';
import { ProductionReadinessService, ProductionReadinessResult, BootstrapState, MigrationStatus, TableStatus } from '../services/productionReadinessService';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, HelpCircle, Key, User, ShieldAlert, Database, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductionBootstrapStatus() {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<ProductionReadinessResult | null>(null);
  const [showTableDetails, setShowTableDetails] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  useEffect(() => {
    const runAudit = async () => {
      setLoading(true);
      try {
        const auditResult = await ProductionReadinessService.getProductionReadiness();
        setResult(auditResult);
      } catch (err) {
        console.error('Failed to run production readiness audit:', err);
      } finally {
        setLoading(false);
      }
    };
    runAudit();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
  };

  const getAuthBadge = (state: BootstrapState) => {
    switch (state) {
      case 'AUTH_READY':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">READY</span>;
      case 'AUTH_LOGIN_REQUIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">LOGIN DIPERLUKAN</span>;
      case 'PROFILE_NOT_FOUND':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-300 border border-orange-500/20">PROFIL KOSONG</span>;
      case 'EMPLOYEE_NOT_FOUND':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-300 border border-red-500/20">EMPLOYEE TIDAK TAUT</span>;
      case 'ROLE_NOT_CONFIGURED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">ROLE BELUM SET</span>;
      case 'DIVISION_NOT_CONFIGURED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/10 text-pink-300 border border-pink-500/20">DIVISI BELUM SET</span>;
      case 'AUTH_NOT_CONFIGURED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20">BELUM DIKONFIG</span>;
      case 'AUTH_ERROR':
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-500/30">ERROR</span>;
    }
  };

  const getStatusIcon = (status: 'READY' | 'PENDING' | 'ERROR' | 'CONNECTED' | 'DISCONNECTED') => {
    if (status === 'READY' || status === 'CONNECTED') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    } else if (status === 'PENDING') {
      return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
    }
  };

  const getStatusText = (status: 'READY' | 'PENDING' | 'ERROR' | 'CONNECTED' | 'DISCONNECTED') => {
    if (status === 'READY') return 'READY (Terverifikasi)';
    if (status === 'CONNECTED') return 'CONNECTED (Terhubung)';
    if (status === 'PENDING') return 'PENDING (Belum Terbaca)';
    if (status === 'DISCONNECTED') return 'DISCONNECTED (Terputus)';
    return 'ERROR';
  };

  if (loading) {
    return (
      <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-white flex flex-col items-center justify-center min-h-[250px]">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <p className="text-xs font-bold text-purple-200">Menganalisis Kesiapan Sistem Produksi...</p>
        <p className="text-[10px] text-purple-300/60 mt-1">Melakukan pengujian read-only terhadap database remote...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-white flex flex-col items-center justify-center">
        <XCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-xs font-bold text-red-200">Gagal Memuat Hasil Audit Kesiapan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              Sistem Kesiapan Bootstrap Produksi
            </h3>
            <p className="text-[10px] text-purple-300/60">
              Evaluasi langsung status kesiapan arsitektur frontend lokal sistem.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Audit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Metrics List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            {getStatusIcon(result.systemConnection)}
            <div>
              <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Koneksi Sistem Lokal</p>
              <p className="text-xs font-bold">{getStatusText(result.systemConnection)}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Otentikasi Bootstrap</p>
                {getAuthBadge(result.authBootstrapState)}
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                {result.authBootstrapState === 'AUTH_READY' ? 'Siap digunakan' : 'Menunggu Akun Administrator'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            {getStatusIcon(result.coreHrDatabase)}
            <div>
              <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Database Inti HR</p>
              <p className="text-xs font-bold">{result.coreHrDatabase === 'READY' ? 'READY (Tabel Inti Tersedia)' : 'PENDING'}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            {getStatusIcon(result.kpiDatabase)}
            <div>
              <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Skema Modul KPI</p>
              <p className="text-xs font-bold">{result.kpiDatabase === 'READY' ? 'READY (Tabel KPI Tersedia)' : 'PENDING MIGRATION'}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            {getStatusIcon(result.payrollDatabase)}
            <div>
              <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Skema Modul Payroll</p>
              <p className="text-xs font-bold">{result.payrollDatabase === 'READY' ? 'READY (Tabel Gaji Tersedia)' : 'PENDING MIGRATION'}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            {getStatusIcon(result.pipDatabase)}
            <div>
              <p className="text-[9px] font-black uppercase text-purple-300/75 tracking-wider">Skema Modul PIP</p>
              <p className="text-xs font-bold">{result.pipDatabase === 'READY' ? 'READY (Tabel PIP Tersedia)' : 'PENDING MIGRATION'}</p>
            </div>
          </div>
        </div>

        {/* Warnings for PENDING migrations */}
        {!result.productionReady && (
          <div className="mt-4 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-200">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Sistem Belum Siap Produksi Sepenuhnya
            </p>
            <p className="text-[10px] leading-relaxed text-amber-300/90">
              Sesi login administrator belum aktif atau beberapa skema database remote belum dimigrasikan. Ini wajar pada tahap bootstrap pertama. Silakan ikuti panduan administrator di bawah.
            </p>
          </div>
        )}
      </div>

      {/* Migration Status Accordion */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-white">
        <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-2">
          Status Riwayat Migrasi (00009 - 00014)
        </h4>
        <div className="space-y-2">
          {(Object.values(result.migrations) as MigrationStatus[]).map((mig) => (
            <div key={mig.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-white">{mig.id} - {mig.name}</span>
                <span className="text-[9px] text-purple-300/60">Tabel: {mig.tablesChecked.join(', ')}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                mig.status === 'READY' 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
              }`}>
                {mig.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Detail Toggler */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 text-white">
        <button
          onClick={() => setShowTableDetails(!showTableDetails)}
          className="w-full flex items-center justify-between text-xs font-black uppercase text-purple-300 cursor-pointer"
        >
          <span>Detail Tabel Database ({Object.keys(result.tables).length} Tabel)</span>
          {showTableDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTableDetails && (
          <div className="mt-3 space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {(Object.values(result.tables) as TableStatus[]).map((tbl) => (
              <div key={tbl.tableName} className="p-2 bg-white/5 rounded-xl border border-white/5 text-[11px] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{tbl.tableName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    tbl.exists ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                  }`}>
                    {tbl.exists ? 'EXISTS' : 'NOT EXISTS'}
                  </span>
                </div>
                <div className="text-[10px] text-purple-300/70 flex justify-between">
                  <span>Data: {tbl.rowCount !== null ? `${tbl.rowCount} baris` : 'Mencari...'}</span>
                  <span>Akses: {tbl.readAccess}</span>
                </div>
                <p className="text-[9px] text-purple-300/50 italic leading-snug mt-0.5">{tbl.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Administrator Bootstrap Guide */}
      <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl p-6 border border-indigo-500/20 text-white">
        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
          <Key className="w-4 h-4" />
          Panduan Bootstrap Akun Administrator Utama
        </h4>
        <div className="space-y-3 text-[11px] leading-relaxed text-indigo-200">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black border border-indigo-500/30 shrink-0">1</span>
            <p>Membuka dasbor administrasi <strong>Manajemen Akun</strong> pada aplikasi.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black border border-indigo-500/30 shrink-0">2</span>
            <p>Masuk ke menu <strong>Authentication</strong> -{'>'} <strong>Users</strong> -{'>'} klik <strong>Add User</strong> -{'>'} <strong>Create User</strong>.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black border border-indigo-500/30 shrink-0">3</span>
            <p>Daftarkan email (misal: <code>admin@tropicalos.com</code>) dan buat kata sandi yang aman. Salin string <strong>User ID (UUID)</strong> yang didapatkan.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black border border-indigo-500/30 shrink-0">4</span>
            <p>Masuk ke <strong>SQL Editor</strong>, jalankan perintah di bawah untuk menghubungkan akun auth ke tabel profil berwenang <strong>MANAGER</strong>:</p>
          </div>
          <div className="bg-black/40 rounded-xl p-3 border border-indigo-500/10 font-mono text-[9px] text-indigo-300 select-all whitespace-pre-wrap leading-normal">
{`INSERT INTO public.profiles (user_id, name, email, role, division, is_active)
VALUES (
  'UUID_USER_AUTH_ANDA', 
  'Administrator Utama', 
  'admin@tropicalos.com', 
  'MANAGER', 
  'FINANCE', 
  true
);`}
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black border border-indigo-500/30 shrink-0">5</span>
            <p>Masuk kembali ke form login <strong>TropicalOS</strong> menggunakan email dan kata sandi yang baru saja Anda buat di atas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
