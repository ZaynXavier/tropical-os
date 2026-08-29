import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1E2438] border border-[#2D374E] p-8 text-center shadow-2xl space-y-6 relative overflow-hidden animate-fade-in">
        <div className="inline-flex p-4 rounded-2xl bg-[#283049] text-purple-400 border border-[#2D374E] shadow-inner">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            404 Halaman Tidak Ditemukan
          </span>
          <h2 className="text-2xl font-bold text-gray-100">Alamat Tidak Valid</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Halaman atau rute yang Anda tuju tidak terdaftar di sistem TropicalOS.
          </p>
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
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
