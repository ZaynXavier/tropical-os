/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Customer } from "../../data/mockCrmData";
import {
  Award,
  Phone,
  Mail,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Search,
  Plus,
  Star,
  DollarSign,
  UserCheck,
} from "lucide-react";

interface CrmCustomersProps {
  customers?: Customer[];
  onAddCustomer?: (customer: Omit<Customer, "id">) => void;
  onOpenWhatsApp?: (phone: string, name: string) => void;
}

export const CrmCustomers: React.FC<CrmCustomersProps> = ({
  customers = [],
  onAddCustomer,
  onOpenWhatsApp,
}) => {
  const safeCustomers = customers || [];
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    type: "VIP" as Customer["type"],
    totalVisits: 1,
    totalSpend: 1500000,
    lastVisit: "2026-08-08",
    favoriteMenu: "Ikan Bakar Gurame & Es Kelapa Muda",
    preferredSeating: "Pendopo Main Garden",
    notes: "Suka area outdoor yang tenang",
  });

  const filteredCustomers = safeCustomers.filter((c) => {
    const matchSearch =
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search) ||
      (c.favoriteMenu || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || c.type === filterType;
    return matchSearch && matchType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    onAddCustomer?.(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
            <input
              type="text"
              placeholder="Cari nama pelanggan, HP, atau menu favorit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 bg-[#130F30] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All" className="bg-[#130F30]">Semua Tipe Klien</option>
            <option value="VIP" className="bg-[#130F30]">VIP Customer</option>
            <option value="Corporate" className="bg-[#130F30]">Corporate Customer</option>
            <option value="Regular" className="bg-[#130F30]">Regular Customer</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Klien Baru</span>
        </button>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl hover:border-purple-500/40 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">{c.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      c.type === "VIP"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : c.type === "Corporate"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-white/10 text-purple-200 border border-white/20"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-purple-300/70 mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-purple-400" />
                    +{c.phone}
                  </span>
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-purple-400" />
                      {c.email}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onOpenWhatsApp(c.phone, c.name)}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Chat WA
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-purple-300/60 block">Kunjungan</span>
                <strong className="text-xs text-white">{c.totalVisits}x Datang</strong>
              </div>
              <div>
                <span className="text-[10px] text-purple-300/60 block">Total Spend</span>
                <strong className="text-xs text-emerald-400 font-extrabold">
                  Rp {(c.totalSpend / 1000000).toFixed(1)}M
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-purple-300/60 block">Terakhir Datang</span>
                <strong className="text-xs text-purple-200">{c.lastVisit}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs text-purple-200/80">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>
                  <strong className="text-white">Menu Favorit:</strong> {c.favoriteMenu}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>
                  <strong className="text-white">Area Duduk:</strong> {c.preferredSeating}
                </span>
              </div>
              {c.notes && (
                <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/20 text-[11px] text-purple-300/80 italic">
                  "{c.notes}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Tambah Profil Pelanggan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">No WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Tipe Pelanggan</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Customer["type"] })
                    }
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white font-bold"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Menu Favorit</label>
                <input
                  type="text"
                  value={formData.favoriteMenu}
                  onChange={(e) => setFormData({ ...formData, favoriteMenu: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Area Duduk Preferensi</label>
                <input
                  type="text"
                  value={formData.preferredSeating}
                  onChange={(e) => setFormData({ ...formData, preferredSeating: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Catatan Khusus (Alergi / VIP Request)</label>
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
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
