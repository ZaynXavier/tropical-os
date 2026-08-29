/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_CONTENT_POSTS, ContentPost } from "../../data/mockContentData";
import {
  FileVideo,
  Plus,
  Search,
  Filter,
  Instagram,
  Video,
  Eye,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Clapperboard,
  Layers,
  MessageSquare,
} from "lucide-react";

interface ContentCalendarViewProps {
  user: User;
}

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({ user }) => {
  const [posts, setPosts] = useState<ContentPost[]>(MOCK_CONTENT_POSTS);
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);

  // AI Script Assistant State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiScriptResult, setAiScriptResult] = useState("");

  // Form State for new Post
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<ContentPost["platform"]>("Instagram Reels");
  const [newConcept, setNewConcept] = useState<ContentPost["conceptType"]>("Menu Highlight");
  const [newPublishDate, setNewPublishDate] = useState("18/08/2026");
  const [newCaption, setNewCaption] = useState("");

  const filteredPosts = posts.filter((p) => {
    const matchesPlatform = selectedPlatform === "ALL" || p.platform === selectedPlatform;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.conceptType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesQuery;
  });

  const statuses: ContentPost["status"][] = [
    "Idea",
    "Briefing",
    "Shooting",
    "Editing",
    "Review",
    "Scheduled",
    "Published",
  ];

  const handleGenerateAiScript = () => {
    if (!newTitle) return;
    setIsAiGenerating(true);

    setTimeout(() => {
      const generated = `[AI SCRIPT SUGGESTION for "${newTitle}"]\n\n0:00 - 0:03 [HOOK]: Macro close-up shot angle 45° bahan segar dipotong koki secara ritmis + sound effect sizzling!\n0:03 - 0:08 [BODY]: Transisi cepat saat sajian di-plating estetik dengan pencahayaan warm sunset terrace.\n0:08 - 0:12 [CALL TO ACTION]: "Coba cita rasa istimewa ini di Tropical Garden Resto Canggu! Link reservasi meja di bio 🌿✨"`;
      setAiScriptResult(generated);
      if (!newCaption) {
        setNewCaption(`Nikmati sajian istimewa ${newTitle} di Tropical Garden Resto! 🌿 Cita rasa terbaik untuk momen berharga kamu. Booking meja sekarang link di bio ✨ #TropicalGarden #BaliEats`);
      }
      setIsAiGenerating(false);
    }, 1000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEntry: ContentPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      platform: newPlatform,
      conceptType: newConcept,
      publishDate: newPublishDate,
      status: "Idea",
      creatorName: user.name,
      caption: newCaption || newTitle,
      hashtags: ["#TropicalGardenResto", "#BaliFoodie", "#CangguResto"],
    };

    setPosts([newEntry, ...posts]);
    setIsAddOpen(false);
    setNewTitle("");
    setNewCaption("");
    setAiScriptResult("");
  };

  const getPlatformIcon = (platform: ContentPost["platform"]) => {
    switch (platform) {
      case "Instagram Reels":
      case "Instagram Story":
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case "TikTok":
        return <Video className="w-4 h-4 text-cyan-400" />;
      case "YouTube Shorts":
        return <Clapperboard className="w-4 h-4 text-red-400" />;
      default:
        return <FileVideo className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-pink-400" />
            <span>Content Production &amp; Calendar Pipeline</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Manajemen ide konten promosi resto, kalender tayang Instagram &amp; TikTok, serta pembuatan script AI.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-pink-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Brief Konten Baru</span>
        </button>
      </div>

      {/* Toolbar & View Controls */}
      <div className="bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("kanban")}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
              activeView === "kanban"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400 shadow-md"
                : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
            }`}
          >
            Kanban Production Workflow
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
              activeView === "list"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400 shadow-md"
                : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
            }`}
          >
            Tabel Daftar Konten ({posts.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-300/60 mr-1" />
          {["ALL", "Instagram Reels", "TikTok", "Instagram Story", "YouTube Shorts"].map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] ${
                selectedPlatform === plat
                  ? "bg-purple-600 text-white border border-purple-400 shadow-md font-black"
                  : "bg-white/5 text-purple-200/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* KANBAN VIEW */}
      {activeView === "kanban" && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-[1200px]">
            {statuses.map((st) => {
              const statusPosts = filteredPosts.filter((p) => p.status === st);
              return (
                <div key={st} className="flex-1 bg-[#130F30]/70 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">{st}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-200 font-bold">
                        {statusPosts.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {statusPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-300">
                              {getPlatformIcon(post.platform)}
                              <span>{post.platform}</span>
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-lg bg-purple-900/50 text-purple-200 font-extrabold">
                              {post.conceptType}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                            {post.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-purple-300/70 pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>{post.publishDate}</span>
                            </span>

                            {post.views !== undefined && (
                              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                                <Eye className="w-3 h-3" />
                                <span>{(post.views / 1000).toFixed(1)}k</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {statusPosts.length === 0 && (
                        <div className="py-8 text-center text-purple-300/40 text-[11px] italic">
                          Kosong
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST TABLE VIEW */}
      {activeView === "list" && (
        <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-purple-300/80 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Judul Konten &amp; Konsep</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Tanggal Tayang</th>
                  <th className="p-4">Creator / PIC</th>
                  <th className="p-4">Status Produksi</th>
                  <th className="p-4">Performance (Views)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <td className="p-4">
                      <strong className="text-white block text-sm">{post.title}</strong>
                      <span className="text-[10px] text-purple-300">{post.conceptType}</span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 font-bold text-purple-200">
                        {getPlatformIcon(post.platform)}
                        <span>{post.platform}</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-purple-300">{post.publishDate}</td>
                    <td className="p-4 text-purple-200">{post.creatorName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-purple-600/30 text-purple-200 border border-purple-500/30">
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {post.views !== undefined && post.views !== null ? `${(post.views || 0).toLocaleString("id-ID")} Views` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedPost.platform)}
                <span className="text-xs font-bold text-purple-300">{selectedPost.platform}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 font-bold uppercase">
                {selectedPost.conceptType}
              </span>
              <h3 className="font-extrabold text-base text-white mt-1">{selectedPost.title}</h3>
              <p className="text-xs text-purple-200/70 mt-0.5">PIC: {selectedPost.creatorName}</p>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-xs space-y-2">
              <span className="font-bold text-purple-200 block">Caption &amp; Copywriting:</span>
              <p className="text-purple-100/90 leading-relaxed text-[11px]">{selectedPost.caption}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(selectedPost.hashtags || []).map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-purple-300">{tag}</span>
                ))}
              </div>
            </div>

            {selectedPost.views !== undefined && selectedPost.views !== null && (
              <div className="grid grid-cols-3 gap-2 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 text-center font-mono text-xs">
                <div>
                  <span className="text-[9px] text-purple-300 block">VIEWS</span>
                  <strong className="text-emerald-400 text-sm">{(selectedPost.views || 0).toLocaleString("id-ID")}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-purple-300 block">LIKES</span>
                  <strong className="text-pink-400 text-sm">{(selectedPost.likes || 0).toLocaleString("id-ID")}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-purple-300 block">SHARES</span>
                  <strong className="text-indigo-300 text-sm">{(selectedPost.shares || 0).toLocaleString("id-ID")}</strong>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brief Modal with AI Assistant */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>Buat Brief Konten &amp; Script AI</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Judul / Topik Konten *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Behind the scenes pembuatan Truffle Tagliatelle"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiScript}
                    disabled={isAiGenerating || !newTitle}
                    className="px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl flex items-center gap-1 text-[11px] cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Script</span>
                  </button>
                </div>
              </div>

              {aiScriptResult && (
                <div className="p-3 bg-purple-950/60 rounded-2xl border border-purple-500/40 text-[11px] text-purple-100 font-mono whitespace-pre-wrap">
                  {aiScriptResult}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Platform Utama</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram Story">Instagram Story</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori Konsep</label>
                  <select
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                  >
                    <option value="Menu Highlight">Menu Highlight</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                    <option value="Lifestyle & Vibe">Lifestyle &amp; Vibe</option>
                    <option value="Influencer Collab">Influencer Collab</option>
                    <option value="Promo Event">Promo Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Target Tanggal Tayang</label>
                <input
                  type="text"
                  value={newPublishDate}
                  onChange={(e) => setNewPublishDate(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Caption / Draft Text</label>
                <textarea
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                ></textarea>
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
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs font-black"
                >
                  Simpan Brief Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
