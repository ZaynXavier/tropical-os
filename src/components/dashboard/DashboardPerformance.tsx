/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_PERFORMANCE_CASES, PerformanceCase } from "../../data/mockDashboardData";
import {
  AlertOctagon,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface DashboardPerformanceProps {
  user: User;
}

export const DashboardPerformance: React.FC<DashboardPerformanceProps> = ({ user }) => {
  const [cases, setCases] = useState<PerformanceCase[]>(MOCK_PERFORMANCE_CASES);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<PerformanceCase | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);

  // New Case form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<PerformanceCase["category"]>("Kitchen Delay");
  const [newSeverity, setNewSeverity] = useState<PerformanceCase["severity"]>("Medium");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newTableRef, setNewTableRef] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Resolution note state
  const [resolutionText, setResolutionText] = useState("");

  const filteredCases = cases.filter((c) => {
    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;
    const matchesSeverity = selectedSeverity === "ALL" || c.severity === selectedSeverity;
    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesQuery;
  });

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const newCaseItem: PerformanceCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CAS-2026-08${cases.length + 1}`,
      title: newTitle,
      category: newCategory,
      severity: newSeverity,
      assignedTo: newAssignedTo || user.name,
      reportedBy: user.name,
      reportedAt: `${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
      status: "Open",
      slaDue: "30 Menit",
      description: newDescription,
      tableOrRef: newTableRef || "Operational Area",
    };

    setCases([newCaseItem, ...cases]);
    setIsAddCaseOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleResolveCase = (caseId: string) => {
    if (!resolutionText) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: "Resolved",
              resolutionNotes: resolutionText,
            }
          : c
      )
    );
    setSelectedCase(null);
    setResolutionText("");
  };

  const getSeverityBadge = (severity: PerformanceCase["severity"]) => {
    switch (severity) {
      case "Critical":
        return "bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Medium":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    }
  };

  const getStatusBadge = (status: PerformanceCase["status"]) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "In Progress":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Escalated":
        return "bg-pink-500/20 text-pink-300 border-pink-500/40";
      default:
        return "bg-white/10 text-purple-200 border-white/20";
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-pink-400" />
            <span>Performance Cases &amp; SLA Incident Resolution</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Manajemen tiket penanganan kasus komplain pelanggan, ketersediaan mesin, keterlambatan dapur &amp; kendala POS.
          </p>
        </div>

        <button
          onClick={() => setIsAddCaseOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Kasus Baru</span>
        </button>
      </div>

      {/* SLA Metric Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Case Hari Ini</span>
          <div className="text-2xl font-black text-white mt-1">{cases.length} Tiket</div>
          <span className="text-[10px] text-purple-300 font-bold">1 Tiket Resolusi Selesai</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">SLA Compliance Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">94.2%</div>
          <span className="text-[10px] text-emerald-400 font-bold">Target &gt;90% Selesai Tepat Waktu</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Open / In Progress</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {cases.filter((c) => c.status !== "Resolved").length} Tiket
          </div>
          <span className="text-[10px] text-amber-300 font-bold">Butuh Tindak Lanjut</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Rata-Rata Respon SLA</span>
          <div className="text-2xl font-black text-white mt-1">11.5 Menit</div>
          <span className="text-[10px] text-purple-300 font-bold">Kecepatan Penanganan Staff</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            placeholder="Cari nomor case, judul, atau penanggung jawab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-300/60 mr-1" />
          {["ALL", "Open", "In Progress", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] ${
                selectedStatus === st
                  ? "bg-purple-600 text-white border border-purple-400 shadow-md font-black"
                  : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-purple-300/80 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">No. Case</th>
                <th className="p-4">Judul Kasus &amp; Ref Area</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Tingkat Keparahan</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Status SLA</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-black text-purple-300">{c.caseNumber}</td>
                  <td className="p-4">
                    <strong className="text-white block text-sm">{c.title}</strong>
                    <span className="text-[10px] text-purple-300/70">{c.tableOrRef}</span>
                  </td>
                  <td className="p-4 font-semibold text-purple-200">{c.category}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${getSeverityBadge(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-white">{c.assignedTo}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-purple-200 rounded-xl border border-white/10 font-bold text-[10px] cursor-pointer"
                    >
                      Detail &amp; Resolusi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail / Resolution Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-300">{selectedCase.caseNumber}</span>
                <h3 className="font-extrabold text-base text-white">{selectedCase.title}</h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-purple-300/60 block">KATEGORI:</span>
                  <strong className="text-white">{selectedCase.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300/60 block">SEVERITY:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getSeverityBadge(selectedCase.severity)}`}>
                    {selectedCase.severity}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-purple-300/60 block">DESKRIPSI KASUS:</span>
                <p className="text-purple-100/90 mt-0.5">{selectedCase.description}</p>
              </div>

              {selectedCase.resolutionNotes && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">CATATAN RESOLUSI SELESAI:</span>
                  <p className="text-emerald-200 mt-0.5">{selectedCase.resolutionNotes}</p>
                </div>
              )}
            </div>

            {selectedCase.status !== "Resolved" && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="font-bold text-xs text-purple-200 block">Tuliskan Tindakan / Catatan Resolusi *</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Mengganti hidangan baru &amp; memberikan voucher diskon 10%..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => handleResolveCase(selectedCase.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl cursor-pointer"
                >
                  Selesaikan Kasus (Mark Resolved)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Case Modal */}
      {isAddCaseOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Buat Tiket Case Performance Baru</h3>
              <button onClick={() => setIsAddCaseOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCase} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Judul Permasalahan / Case *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keterlambatan Pesanan Meja VIP 02"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Kitchen Delay">Kitchen Delay</option>
                    <option value="Customer Complaint">Customer Complaint</option>
                    <option value="POS Discrepancy">POS Discrepancy</option>
                    <option value="Supplier Issue">Supplier Issue</option>
                    <option value="Facility Maintenance">Facility Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Deskripsi &amp; Kronologi Kasus *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan kronologi kejadian..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddCaseOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs"
                >
                  Simpan Tiket Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
