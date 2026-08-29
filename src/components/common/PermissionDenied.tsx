import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { permissionService } from '../../services/permissionService';

interface PermissionDeniedProps {
  moduleName?: string;
  requiredRole?: string;
  customReason?: string;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  moduleName = 'Halaman Ini',
  requiredRole,
  customReason,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isHROfficer =
    permissionService.isHROfficer(currentUser) &&
    currentUser?.accessLevel !== 'OWNER' &&
    currentUser?.accessLevel !== 'MANAGER';
  const homePath = isHROfficer ? '/hr' : '/dashboard';
  const homeLabel = isHROfficer ? 'Ke Tropical HR' : 'Ke Dashboard';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1E2438] border border-rose-500/30 p-8 text-center shadow-2xl space-y-6 relative overflow-hidden animate-fade-in">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Lock className="w-3 h-3" />
            403 Akses Ditolak (RBAC Guard)
          </div>
          <h2 className="text-xl font-bold text-gray-100">Otorisasi Tidak Memadai</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            {customReason || (
              <>
                Akun Anda tidak memiliki hak akses untuk membuka <span className="font-semibold text-rose-300">{moduleName}</span>.
              </>
            )}
          </p>
        </div>

        {/* User Context Box */}
        <div className="bg-[#111827] rounded-xl p-4 border border-[#2D374E] text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Pengguna Aktif:</span>
            <span className="font-semibold text-gray-200">{currentUser?.name || 'Anonim'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tingkat Akses Saat Ini:</span>
            <span className="font-semibold text-purple-300">{currentUser?.accessLevel || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Departemen:</span>
            <span className="font-semibold text-gray-200">{currentUser?.department || '-'}</span>
          </div>
          {requiredRole && (
            <div className="flex justify-between pt-1 border-t border-[#283049] text-rose-300 font-medium">
              <span>Minimal Otorisasi:</span>
              <span>{requiredRole}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#283049] hover:bg-[#343e5e] text-gray-200 text-sm font-medium transition-colors border border-[#2D374E] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={() => navigate(homePath)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            {homeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
