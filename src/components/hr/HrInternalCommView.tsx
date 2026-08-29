/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_ANNOUNCEMENTS, AnnouncementItem } from "../../data/mockHrData";
import { Bell, Plus, MessageSquare, Megaphone, Calendar } from "lucide-react";

interface HrInternalCommViewProps {
  user: User;
}

export const HrInternalCommView: React.FC<HrInternalCommViewProps> = ({ user }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(MOCK_ANNOUNCEMENTS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AnnouncementItem["category"]>("SOP Resto");
  const [content, setContent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: title,
      category: category,
      content: content,
      author: `${user.name} (${user.role})`,
      date: new Date().toLocaleDateString("id-ID"),
      important: true,
    };

    setAnnouncements([newAnc, ...announcements]);
    setIsAddOpen(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Papan Komunikasi Internal &amp; Pengumuman Resto</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Publikasikan pengumuman operasional, perubahan SOP, jadwal briefing, &amp; ucapan ulang tahun tim.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((anc) => (
          <div key={anc.id} className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-300 uppercase px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/30">
                {anc.category}
              </span>
              <span className="text-xs text-purple-300 font-mono">{anc.date} • Diposting oleh: {anc.author}</span>
            </div>

            <h3 className="font-black text-lg text-white">{anc.title}</h3>
            <p className="text-xs text-purple-100/90 leading-relaxed">{anc.content}</p>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Buat Pengumuman Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                >
                  <option value="SOP Resto">SOP Resto</option>
                  <option value="Pengumuman Shift">Pengumuman Shift</option>
                  <option value="Event & Celebration">Event &amp; Celebration</option>
                  <option value="Policy Update">Policy Update</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Isi Pengumuman *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 text-white rounded-xl text-xs font-black"
                >
                  Post Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
