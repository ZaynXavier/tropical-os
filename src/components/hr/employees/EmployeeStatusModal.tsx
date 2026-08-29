import React, { useState } from 'react';
import { Employee } from '../../../types/employee';
import { AlertTriangle, Power, CheckCircle, X } from 'lucide-react';

interface EmployeeStatusModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (employeeId: string, newStatus: boolean) => Promise<void>;
}

export const EmployeeStatusModal: React.FC<EmployeeStatusModalProps> = ({
  employee,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !employee) return null;

  const isCurrentlyActive = employee.isActive && employee.status === 'ACTIVE';

  const handleAction = async () => {
    setLoading(true);
    try {
      await onConfirm(employee.id, !isCurrentlyActive);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#13192B] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isCurrentlyActive
                ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
            }`}
          >
            {isCurrentlyActive ? <Power className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1E2438] rounded-xl border border-[#2D374E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-white">
            {isCurrentlyActive ? 'Nonaktifkan Karyawan?' : 'Aktifkan Kembali Karyawan?'}
          </h3>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            {isCurrentlyActive ? (
              <>
                Karyawan <strong className="text-white">{employee.fullName}</strong> ({employee.employeeCode}) akan diubah
                statusnya menjadi <strong>Non-Aktif</strong>. Akun ini tidak akan dapat login atau mengisi presensi harian resto.
              </>
            ) : (
              <>
                Karyawan <strong className="text-white">{employee.fullName}</strong> ({employee.employeeCode}) akan diaktifkan
                kembali dan dapat mengakses sistem sesuai level <strong>{employee.accessLevel}</strong>.
              </>
            )}
          </p>
        </div>

        <div className="p-3 bg-[#1E2438] rounded-2xl border border-[#2D374E] text-xs space-y-1">
          <div className="flex justify-between text-gray-400">
            <span>Jabatan Pokok:</span>
            <strong className="text-white">{employee.primaryPosition}</strong>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Departemen:</span>
            <strong className="text-purple-300">{employee.department}</strong>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Level Akses:</span>
            <strong className="text-white font-mono">{employee.accessLevel}</strong>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-[#1E2438] hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-bold border border-[#2D374E] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              isCurrentlyActive
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {loading ? 'Memproses...' : isCurrentlyActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
          </button>
        </div>
      </div>
    </div>
  );
};
