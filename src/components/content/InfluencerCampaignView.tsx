/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_INFLUENCERS, InfluencerCollab } from "../../data/mockContentData";
import {
  Users,
  Plus,
  Search,
  Instagram,
  Video,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface InfluencerCampaignViewProps {
  user: User;
}

export const InfluencerCampaignView: React.FC<InfluencerCampaignViewProps> = ({ user }) => {
  const [influencers, setInfluencers] = useState<InfluencerCollab[]>(MOCK_INFLUENCERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newPlatform, setNewPlatform] = useState<InfluencerCollab["platform"]>("Instagram");
  const [newFollowers, setNewFollowers] = useState("100K");
  const [newFee, setNewFee] = useState<number>(2000000);
  const [newVisitDate, setNewVisitDate] = useState("20/08/2026");

  const filteredInfluencers = influencers.filter(
    (inf) =>
      inf.influencerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpentFee = influencers.reduce((acc, curr) => acc + curr.feeAmount, 0);

  const handleAddInfluencer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHandle) return;

    const newEntry: InfluencerCollab = {
      id: `inf-${Date.now()}`,
      influencerName: newName,
      handle: newHandle.startsWith("@") ? newHandle : `@${newHandle}`,
      platform: newPlatform,
      followerCount: newFollowers,
      visitDate: newVisitDate,
      feeAmount: newFee,
      status: "Planned",
    };

    setInfluencers([newEntry, ...influencers]);
    setIsAddOpen(false);
    setNewName("");
    setNewHandle("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Influencer &amp; Food Vlogger Campaign Tracker</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Manajemen kolaborasi Food Vlogger, kesepakatan endorsement, jadwal kunjungan resto &amp; laporan jangkauan tayang (Reach/ROI).
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kolaborasi Influencer</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Influencer Active</span>
          <div className="text-2xl font-black text-white mt-1">{influencers.length} Vlogger</div>
          <span className="text-[10px] text-purple-300 font-bold">Instagram &amp; TikTok</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Endorsement Budget</span>
          <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">
            Rp {(totalSpentFee ?? 0).toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">Bulan Ini (Agustus 2026)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Total Organic Views Reach</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">125.000+</div>
          <span className="text-[10px] text-emerald-300 font-bold">Avg Engagement 9.1%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl">
          <span className="text-[10px] font-bold text-purple-300/70 uppercase">Jadwal Visit Mendatang</span>
          <div className="text-2xl font-black text-amber-400 mt-1">2 Vlogger</div>
          <span className="text-[10px] text-amber-300 font-bold">Kunjungan Minggu Ini</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            placeholder="Cari nama vlogger atau handle Instagram/TikTok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredInfluencers.map((inf) => (
          <div
            key={inf.id}
            className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold text-purple-300">
                  {inf.platform === "TikTok" ? (
                    <Video className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Instagram className="w-4 h-4 text-pink-400" />
                  )}
                  <span>{inf.platform}</span>
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    inf.status === "Posted"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {inf.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{inf.influencerName}</h3>
                <span className="text-xs text-purple-300 font-mono block">{inf.handle} ({inf.followerCount} Followers)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[9px] text-purple-300/60 block uppercase">FEE ENDORSE:</span>
                  <strong className="text-white font-mono">
                    Rp {(inf.feeAmount ?? 0).toLocaleString("id-ID")}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-purple-300/60 block uppercase">JADWAL VISIT:</span>
                  <strong className="text-purple-200">{inf.visitDate}</strong>
                </div>
              </div>

              {inf.reachResult && (
                <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/30 flex items-center justify-between text-xs">
                  <span className="text-purple-200 font-bold">Hasil Content Reach:</span>
                  <strong className="text-emerald-400 font-mono">{inf.reachResult} ({inf.engagementRate})</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Input Kolaborasi Influencer Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInfluencer} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Influencer / Channel *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siska Sunset Explorer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Handle Social Media *</label>
                  <input
                    type="text"
                    required
                    placeholder="@siskasunsets"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Platform Utama</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Followers Count</label>
                  <input
                    type="text"
                    value={newFollowers}
                    onChange={(e) => setNewFollowers(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Fee Endorse (Rp)</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Rencana Tanggal Visit</label>
                <input
                  type="text"
                  value={newVisitDate}
                  onChange={(e) => setNewVisitDate(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs font-black"
                >
                  Simpan Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
