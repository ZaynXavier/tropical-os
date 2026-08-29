import React, { useState } from 'react';
import { X, Lock, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface UpdatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeePersonnel | null;
}

export const UpdatePinModal: React.FC<UpdatePinModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPin.length !== 6) {
      setErrorMsg('PIN baru harus terdiri dari 6 angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161C2C] border border-[#2D374E] rounded-[32px] overflow-hidden shadow-2xl animate-scale-up flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D374E] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">Update PIN Keamanan</h3>
              <p className="text-[10px] text-gray-400">PIN Absensi &amp; Akses Portal Staff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">PIN Berhasil Diperbarui!</h4>
            <p className="text-xs text-gray-400">Gunakan 6-digit PIN baru untuk verifikasi presensi berikutnya.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px]">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">PIN Lama (6 Angka)</label>
              <input
                type="password"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 bg-[#0F1420] border border-[#2D374E] rounded-xl text-center text-sm font-mono tracking-widest text-white focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">PIN Baru (6 Angka)</label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 bg-[#0F1420] border border-[#2D374E] rounded-xl text-center text-sm font-mono tracking-widest text-white focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Konfirmasi PIN Baru</label>
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 bg-[#0F1420] border border-[#2D374E] rounded-xl text-center text-sm font-mono tracking-widest text-white focus:border-purple-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simpan PIN Baru</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
