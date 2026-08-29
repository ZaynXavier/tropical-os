/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Activity } from "../../data/mockCrmData";
import {
  Plus,
  PhoneCall,
  MessageSquare,
  Users,
  Utensils,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

interface CrmActivitiesProps {
  activities?: Activity[];
  onAddActivity: (act: Omit<Activity, "id">) => void;
  onToggleStatus: (id: string) => void;
}

export const CrmActivities: React.FC<CrmActivitiesProps> = ({
  activities = [],
  onAddActivity,
  onToggleStatus,
}) => {
  const safeActivities = activities || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    type: "Food Tasting" as Activity["type"],
    subject: "",
    date: "2026-08-10",
    time: "11:00 WIB",
    staffName: "Alya",
    status: "Scheduled" as Activity["status"],
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.subject) return;
    onAddActivity(formData);
    setIsModalOpen(false);
    setFormData({
      customerName: "",
      type: "Food Tasting",
      subject: "",
      date: "2026-08-10",
      time: "11:00 WIB",
      staffName: "Alya",
      status: "Scheduled",
      notes: "",
    });
  };

  const getTypeIcon = (type: Activity["type"]) => {
    switch (type) {
      case "Call":
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case "WhatsApp":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "Meeting":
        return <Users className="w-4 h-4 text-purple-400" />;
      case "Food Tasting":
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case "Site Visit":
        return <Calendar className="w-4 h-4 text-pink-400" />;
      default:
        return <Clock className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Jadwal &amp; Log Aktivitas Follow-Up</h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Catat agenda Food Tasting, Site Visit, Meeting venue, dan log komunikasi WhatsApp dengan klien.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan Aktivitas</span>
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3.5">
        {safeActivities.map((act) => (
          <div
            key={act.id}
            className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl shrink-0 mt-0.5">
                {getTypeIcon(act.type)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded-lg uppercase tracking-wider">
                    {act.type}
                  </span>
                  <h3 className="text-sm font-bold text-white">{act.subject}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-purple-300/70">
                  <span><strong className="text-white">Klien:</strong> {act.customerName}</span>
                  <span>•</span>
                  <span><strong className="text-white">PIC:</strong> {act.staffName}</span>
                </div>
                {act.notes && (
                  <p className="text-xs text-purple-200/80 bg-white/5 p-3 rounded-2xl border border-white/10 mt-1 leading-relaxed">
                    {act.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
              <div className="text-left sm:text-right">
                <span className="text-xs font-extrabold text-white block">{act.date}</span>
                <span className="text-[10px] text-purple-300/70 font-mono">{act.time}</span>
              </div>

              <button
                onClick={() => onToggleStatus(act.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  act.status === "Completed"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-emerald-500/20 hover:text-emerald-300"
                }`}
              >
                {act.status === "Completed" ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Terschedule (Klik Selesai)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Buat Agenda / Log Aktivitas Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Klien *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Hendra Wijaya"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Jenis Aktivitas</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Activity["type"] })
                    }
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white font-bold"
                  >
                    <option value="Food Tasting">Food Tasting</option>
                    <option value="Meeting">Meeting Venue</option>
                    <option value="WhatsApp">WhatsApp Chat</option>
                    <option value="Call">Telepon</option>
                    <option value="Site Visit">Site Visit Garden</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Activity["status"] })
                    }
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white font-bold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Judul / Subjek Agenda *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Food Tasting 5 Porsi Menu Wedding"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Waktu</label>
                  <input
                    type="text"
                    placeholder="14:00 WIB"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Catatan Hasil / instruksi</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs hover:opacity-90"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
