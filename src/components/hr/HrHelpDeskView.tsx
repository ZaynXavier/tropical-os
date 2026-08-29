/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_HELPDESK, HrHelpDeskTicket } from "../../data/mockHrData";
import { HelpCircle, Plus, MessageSquare, CheckCircle2, Clock } from "lucide-react";

interface HrHelpDeskViewProps {
  user: User;
}

export const HrHelpDeskView: React.FC<HrHelpDeskViewProps> = ({ user }) => {
  const [tickets, setTickets] = useState<HrHelpDeskTicket[]>(MOCK_HELPDESK);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<HrHelpDeskTicket["category"]>("Payroll & Gaji");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: HrHelpDeskTicket = {
      id: `hdt-${Date.now()}`,
      ticketNo: `TK-2026-0${tickets.length + 82}`,
      employeeName: `${user.name}`,
      division: "Operational",
      category: category,
      subject: subject,
      description: description,
      priority: "Biasa",
      status: "Open",
      createdDate: new Date().toLocaleDateString("id-ID"),
    };

    setTickets([newTicket, ...tickets]);
    setIsAddOpen(false);
    setSubject("");
    setDescription("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>HR Help Desk &amp; Tiket Layanan Staf</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Layanan aduan &amp; pertanyaan karyawan: pertanyaan rincian slip gaji, permohonan tukar shift, perbaikan seragam/alat, &amp; klaim BPJS.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tiket Layanan Baru</span>
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.id} className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-purple-300 font-bold">{t.ticketNo}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-bold">
                  {t.category}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                  t.status === "Resolved"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {t.status}
              </span>
            </div>

            <div>
              <h3 className="font-black text-base text-white">{t.subject}</h3>
              <p className="text-xs text-purple-200/70 mt-0.5">Pengirim: {t.employeeName} ({t.division}) • Tanggal: {t.createdDate}</p>
            </div>

            <p className="text-xs text-purple-100/90 bg-white/5 p-3 rounded-2xl border border-white/5">{t.description}</p>

            {t.responseNote && (
              <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/20 text-xs space-y-1">
                <span className="font-bold text-indigo-300 block">Tanggapan Tim HR:</span>
                <p className="text-purple-200 italic">{t.responseNote}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Buat Tiket Pertanyaan HR</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Subjek Tiket *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pertanyaan potongan BPJS slip gaji"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Kategori Pertanyaan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                >
                  <option value="Payroll & Gaji">Payroll &amp; Gaji</option>
                  <option value="Shift & Jadwal">Shift &amp; Jadwal</option>
                  <option value="Fasilitas & Seragam">Fasilitas &amp; Seragam</option>
                  <option value="Klaim Kasbon / BPJS">Klaim Kasbon / BPJS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Rincian Keluhan / Pertanyaan *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl text-xs font-black"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
