import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Palmtree, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle,
  Eye, 
  EyeOff,
  KeyRound
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Masukkan email atau ID karyawan terdaftar.');
      return;
    }

    if (!password.trim()) {
      setError('Masukkan kata sandi (password) Anda.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password: password.trim() });
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('tropicalgardenresto@tropicalgarden.com');
    setPassword('tropical2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 shadow-xl shadow-emerald-600/30 text-white mb-2">
            <Palmtree className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-gray-100 uppercase">
            TropicalOS
          </h1>
          <p className="text-xs text-gray-400">
            Operating System • Tropical Garden Resto
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-gray-100">Masuk ke Sistem</h2>
            <p className="text-xs text-gray-400">
              Gunakan Email dan Password Super Admin untuk masuk
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Email Akun</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tropicalgardenresto@tropicalgarden.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Kata Sandi (Password)</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#111827] border border-[#2D374E] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition-colors p-0.5 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Fill Super Admin Demo Button */}
          <div className="pt-2 border-t border-[#2D374E]/60">
            <button
              type="button"
              onClick={fillSuperAdmin}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Gunakan Akun Super Admin Pengujian</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TROPICALOS v1.0 • Super Admin Environment</span>
        </div>
      </div>
    </div>
  );
}
