/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { FileText, Send, CheckCircle2, Sparkles, CreditCard, Shirt, ShieldAlert } from "lucide-react";

interface HrDigitalFormsViewProps {
  user: User;
}

export const HrDigitalFormsView: React.FC<HrDigitalFormsViewProps> = ({ user }) => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Katalog Formulir Digital HR</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Kumpulan formulir digital siap pakai: pengajuan kasbon/pinjaman, pengajuan seragam baru, formulir klaim BPJS &amp; lapor insiden kerja.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedForm("Kasbon / Pinjaman Gaji")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl w-fit">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-purple-300">Form Pengajuan Kasbon</h3>
          <p className="text-xs text-purple-200/70">Formulir pinjaman gaji di muka untuk kebutuhan darurat karyawan.</p>
        </div>

        <div
          onClick={() => setSelectedForm("Pengadaan Seragam & Apron")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl w-fit">
            <Shirt className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-purple-300">Form Seragam Baru</h3>
          <p className="text-xs text-purple-200/70">Permohonan apron kitchen, polo service, atau nametag pengganti.</p>
        </div>

        <div
          onClick={() => setSelectedForm("Laporan Insiden & Kerusakan Tools")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl w-fit">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-purple-300">Form Laporan Insiden</h3>
          <p className="text-xs text-purple-200/70">Pelaporan kerusakan peralatan kitchen/bar atau insiden kerja.</p>
        </div>

        <div
          onClick={() => setSelectedForm("Umpan Balik & Feedback Pelatihan")}
          className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 bg-pink-500/20 text-pink-300 rounded-2xl w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-purple-300">Form Evaluation Training</h3>
          <p className="text-xs text-purple-200/70">Formulir evaluasi sesudah mengikuti sesi pelatihan service &amp; hygiene.</p>
        </div>
      </div>

      {selectedForm && (
        <div className="p-6 bg-[#130F30]/90 border border-purple-500/30 rounded-3xl space-y-4 max-w-lg">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-white text-sm">Isi {selectedForm}</h3>
            <button onClick={() => setSelectedForm(null)} className="text-purple-300 font-bold cursor-pointer">✕</button>
          </div>
          <p className="text-xs text-purple-200/80">Formulir digital siap diisi &amp; disubmit langsung ke persetujuan Manager.</p>
          <button
            onClick={() => {
              alert("Formulir berhasil dikirim!");
              setSelectedForm(null);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-black cursor-pointer"
          >
            Submit Formulir
          </button>
        </div>
      )}
    </div>
  );
};
