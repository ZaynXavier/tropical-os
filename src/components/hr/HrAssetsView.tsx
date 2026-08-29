/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_ASSETS, MOCK_EMPLOYEES, HrAsset } from "../../data/mockHrData";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Tablet,
  Shirt,
  Utensils,
  Coffee,
  ShieldCheck,
} from "lucide-react";

interface HrAssetsViewProps {
  user: User;
}

export const HrAssetsView: React.FC<HrAssetsViewProps> = ({ user }) => {
  const [assets, setAssets] = useState<HrAsset[]>(MOCK_ASSETS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [code, setCode] = useState(`AST-UNI-0${assets.length + 1}`);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HrAsset["category"]>("Uniform");
  const [empId, setEmpId] = useState(MOCK_EMPLOYEES[0].id);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const targetEmp = MOCK_EMPLOYEES.find((e) => e.id === empId);

    const newAsset: HrAsset = {
      id: `ast-${Date.now()}`,
      code: code,
      name: name,
      category: category,
      assignedToEmployeeId: targetEmp?.id,
      assignedToName: targetEmp?.name,
      condition: "Baik",
      assignedDate: new Date().toLocaleDateString("id-ID"),
    };

    setAssets([...assets, newAsset]);
    setIsAddOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Asset Management &amp; Inventaris Seragam Resto</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Kelola inventaris aset resto yang dipinjamkan ke staf: Tablet POS, seragam apron, set pisau chef &amp; portafilter barista.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Registrasi Aset / Seragam</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            placeholder="Cari nama aset, kode inventaris, atau penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ast) => (
          <div key={ast.id} className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-purple-300 font-bold">{ast.code}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Kondisi: {ast.condition}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">{ast.name}</h3>
              <span className="text-[10px] text-indigo-300 font-bold uppercase">{ast.category}</span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-300">Penanggung Jawab:</span>
                <strong className="text-white">{ast.assignedToName || "Belum Diberikan"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Tanggal Penyerahan:</span>
                <span className="text-purple-200">{ast.assignedDate || "-"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Registrasi Aset Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Barang / Aset *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tablet POS Kasir / Seragam Apron"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Uniform">Seragam / Uniform</option>
                    <option value="Device & POS">Device &amp; POS Tablet</option>
                    <option value="Kitchen Tool">Kitchen Tool</option>
                    <option value="Bar Tool">Bar Tool</option>
                    <option value="Security & Facility">Security &amp; Facility</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Penerima Aset</label>
                  <select
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    {MOCK_EMPLOYEES.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
