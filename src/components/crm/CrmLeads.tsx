/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lead } from "../../data/mockCrmData";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  UserCheck,
  MessageSquare,
} from "lucide-react";

interface CrmLeadsProps {
  leads?: Lead[];
  onAddLead?: (lead: Omit<Lead, "id" | "createdAt">) => void;
  onUpdateLeadStatus?: (id: string, newStatus: Lead["status"]) => void;
  onConvertToOpportunity?: (lead: Lead) => void;
  onOpenWhatsApp?: (phone: string, name: string) => void;
}

export const CrmLeads: React.FC<CrmLeadsProps> = ({
  leads = [],
  onAddLead,
  onUpdateLeadStatus,
  onConvertToOpportunity,
  onOpenWhatsApp,
}) => {
  const safeLeads = leads || [];
  const [search, setSearch] = useState("");
  const [filterInterest, setFilterInterest] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "WhatsApp" as Lead["source"],
    interest: "Wedding Event" as Lead["interest"],
    estimatedGuests: 50,
    status: "New" as Lead["status"],
    assignedTo: "Alya",
    notes: "",
  });

  const filteredLeads = safeLeads.filter((lead) => {
    const matchSearch =
      (lead.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || "").includes(search) ||
      (lead.company && lead.company.toLowerCase().includes(search.toLowerCase()));

    const matchInterest = filterInterest === "All" || lead.interest === filterInterest;
    const matchStatus = filterStatus === "All" || lead.status === filterStatus;

    return matchSearch && matchInterest && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    onAddLead?.(formData);
    setIsModalOpen(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      company: "",
      source: "WhatsApp",
      interest: "Wedding Event",
      estimatedGuests: 50,
      status: "New",
      assignedTo: "Alya",
      notes: "",
    });
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Search & Filter Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
            <input
              type="text"
              placeholder="Cari nama, No HP, atau perusahaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Interest Filter */}
          <select
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="px-3.5 py-2.5 bg-[#130F30] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All" className="bg-[#130F30]">Semua Kategori Event</option>
            <option value="Wedding Event" className="bg-[#130F30]">Wedding Event</option>
            <option value="Corporate Gathering" className="bg-[#130F30]">Corporate Gathering</option>
            <option value="Birthday Party" className="bg-[#130F30]">Birthday Party</option>
            <option value="VIP Table" className="bg-[#130F30]">VIP Table</option>
            <option value="Catering" className="bg-[#130F30]">Catering</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-[#130F30] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All" className="bg-[#130F30]">Semua Status Lead</option>
            <option value="New" className="bg-[#130F30]">Baru (New)</option>
            <option value="Contacted" className="bg-[#130F30]">Terhubungi</option>
            <option value="Qualified" className="bg-[#130F30]">Qualified</option>
            <option value="Unqualified" className="bg-[#130F30]">Unqualified</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Prospek</span>
        </button>
      </div>

      {/* Leads Grid/Table */}
      <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-purple-300/80 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Prospek / Klien</th>
                <th className="p-4">Minat Event &amp; Est. Pax</th>
                <th className="p-4">Sumber Lead</th>
                <th className="p-4">Status Lead</th>
                <th className="p-4">Catatan / Kebutuhan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-purple-300/50">
                    Tidak ada data prospek lead yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{lead.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-purple-300/70 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-purple-400" />
                          +{lead.phone}
                        </span>
                        {lead.company && <span className="text-purple-200">• {lead.company}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-purple-200 block">{lead.interest}</span>
                      <span className="text-[10px] text-purple-300/70">{lead.estimatedGuests} Pax</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded-lg font-extrabold text-[10px]">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          onUpdateLeadStatus(lead.id, e.target.value as Lead["status"])
                        }
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${
                          lead.status === "New"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : lead.status === "Contacted"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : lead.status === "Qualified"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-white/10 text-purple-200 border-white/20"
                        }`}
                      >
                        <option value="New" className="bg-[#130F30]">New</option>
                        <option value="Contacted" className="bg-[#130F30]">Contacted</option>
                        <option value="Qualified" className="bg-[#130F30]">Qualified</option>
                        <option value="Unqualified" className="bg-[#130F30]">Unqualified</option>
                      </select>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-[11px] text-purple-200/70 line-clamp-2 leading-relaxed">{lead.notes}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenWhatsApp(lead.phone, lead.name)}
                          title="Chat WhatsApp"
                          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onConvertToOpportunity(lead)}
                          title="Convert ke Deal Pipeline"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black cursor-pointer transition-all shadow-md shadow-purple-600/30"
                        >
                          <TrendingUp className="w-3 h-3" />
                          <span>Jadi Deal</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Registrasi Prospek / Lead Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Prospek *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Bapak Rendy / Ibu Anita"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">No WhatsApp/HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="+62 8..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Perusahaan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="misal: PT Telekom"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori Event</label>
                  <select
                    value={formData.interest}
                    onChange={(e) =>
                      setFormData({ ...formData, interest: e.target.value as Lead["interest"] })
                    }
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white font-bold"
                  >
                    <option value="Wedding Event">Wedding Event</option>
                    <option value="Corporate Gathering">Corporate Gathering</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="VIP Table">VIP Table</option>
                    <option value="Catering">Catering</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Est. Tamu (Pax)</label>
                  <input
                    type="number"
                    value={formData.estimatedGuests}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedGuests: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Sumber Lead</label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value as Lead["source"] })
                  }
                  className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white font-bold"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Catatan Kebutuhan Acara</label>
                <textarea
                  rows={2}
                  placeholder="Detail request menu, tanggal rencana, setting tempat..."
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
                  Simpan Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
