import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { permissionService } from '../services/permissionService';
import { ContentCalendarView } from '../components/content/ContentCalendarView';
import { InfluencerCampaignView } from '../components/content/InfluencerCampaignView';
import { geminiService } from '../services/geminiService';
import {
  Sparkles,
  Plus,
  TrendingUp,
  Share2,
  DollarSign,
  CheckCircle,
  Eye,
  Film,
  FileText,
  Sliders,
  Layers,
  Clock,
  Video,
  Brain,
  RefreshCw,
} from 'lucide-react';

interface ScriptBrief {
  id: string;
  title: string;
  pillar: string;
  hook: string;
  targetPlatform: string;
  status: 'DRAFT' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETED';
  scriptAuthor: string;
  estimatedDuration: string;
}

const INITIAL_BRIEFS: ScriptBrief[] = [
  {
    id: 'SB-001',
    title: 'Secret Recipe Ikan Gurame Bakar Madu',
    pillar: 'Menu Storytelling',
    hook: 'Pernah makan gurame bakar yang bumbunya meresap sampai ke tulang terdalam?',
    targetPlatform: 'Instagram Reels & TikTok',
    status: 'APPROVED',
    scriptAuthor: 'Rian Content Creator',
    estimatedDuration: '45 Detik',
  },
  {
    id: 'SB-002',
    title: 'Suasana Sunset di Pendopo Garden',
    pillar: 'Ambiance & Atmosphere',
    hook: 'Spot nongkrong sore di Semarang yang bikin serasa liburan di Ubud Bali!',
    targetPlatform: 'Instagram Reels',
    status: 'IN_PRODUCTION',
    scriptAuthor: 'Rian Content Creator',
    estimatedDuration: '30 Detik',
  },
  {
    id: 'SB-003',
    title: 'Behind The Scenes: Fresh Seafood Delivery 06.00 Pagi',
    pillar: 'Kitchen & Quality Control',
    hook: 'Setiap jam 6 pagi, bahan laut kita langsung turun dari nelayan Jepara.',
    targetPlatform: 'TikTok Video',
    status: 'DRAFT',
    scriptAuthor: 'Rian Content Creator',
    estimatedDuration: '60 Detik',
  },
];

interface ProductionItem {
  id: string;
  title: string;
  type: string;
  stage: 'SHOOTING' | 'EDITING' | 'COLOR_GRADING' | 'FINAL_REVIEW' | 'READY_UPLOAD';
  assignedTo: string;
  deadline: string;
}

const INITIAL_PRODUCTION: ProductionItem[] = [
  {
    id: 'PR-101',
    title: 'Reels: Gurame Bakar Madu Sizzle Shot',
    type: 'Reels (9:16)',
    stage: 'COLOR_GRADING',
    assignedTo: 'Rian Content Lead',
    deadline: '2026-08-25',
  },
  {
    id: 'PR-102',
    title: 'TikTok: Suasana Senja Live Acoustic',
    type: 'TikTok (9:16)',
    stage: 'EDITING',
    assignedTo: 'Dimas Videographer',
    deadline: '2026-08-26',
  },
  {
    id: 'PR-103',
    title: 'Shorts: Cara Racik Es Kelapa Rempah Tropis',
    type: 'YT Shorts (9:16)',
    stage: 'SHOOTING',
    assignedTo: 'Dimas Videographer',
    deadline: '2026-08-28',
  },
];

export default function ContentCreator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const contentModule = MASTER_NAVIGATION.find((m) => m.id === 'content');

  const availableSubmodules = (contentModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'content', sub)
  );

  const activeSubParam = searchParams.get('sub') || (availableSubmodules[0]?.subParam || 'calendar');

  // Script briefs state
  const [briefs, setBriefs] = useState<ScriptBrief[]>(INITIAL_BRIEFS);
  const [newHookIdea, setNewHookIdea] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Production pipeline state
  const [productions, setProductions] = useState<ProductionItem[]>(INITIAL_PRODUCTION);

  // Performance ROAS state
  const [adSpend, setAdSpend] = useState(1500000);
  const [totalViews, setTotalViews] = useState(85000);
  const [directReservations, setDirectReservations] = useState(24);
  const avgBillPerReservation = 450000;
  const estimatedRevenueFromAds = directReservations * avgBillPerReservation;
  const roas = adSpend > 0 ? (estimatedRevenueFromAds / adSpend).toFixed(2) : '0';

  const handleGenerateHook = async () => {
    setIsAiGenerating(true);
    const topics = [
      'Ikan Gurame Terbang Saus Mangga & Wagyu Ribeye Meltique',
      'Suasana Garden Dining & Gazebo Asri Tropical Garden Resto',
      'Paket Wedding & Gathering Keluarga 50 Pax',
      'Artisanal Coffee & Mocktail Segar Sore Hari',
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const res = await geminiService.generateSocialContent(randomTopic, 'Instagram Reels & TikTok');
    setIsAiGenerating(false);

    if (res.success && res.data?.content) {
      setNewHookIdea(res.data.content);
    } else {
      setNewHookIdea('“Ini alasan kenapa menu di Tropical Garden selalu jadi favorit keluarga dan pecinta kuliner!”');
    }
  };

  const handleAddBrief = () => {
    if (!newHookIdea) return;
    const newBrief: ScriptBrief = {
      id: `SB-${String(briefs.length + 1).padStart(3, '0')}`,
      title: 'Ide Konten Baru: ' + newHookIdea.substring(0, 30) + '...',
      pillar: 'Viral Hook & Promo',
      hook: newHookIdea,
      targetPlatform: 'Instagram & TikTok',
      status: 'DRAFT',
      scriptAuthor: currentUser?.name || 'Rian Content Creator',
      estimatedDuration: '45 Detik',
    };
    setBriefs([newBrief, ...briefs]);
    setNewHookIdea('');
  };

  const renderContent = () => {
    switch (activeSubParam) {
      case 'calendar':
        return <ContentCalendarView />;

      case 'tasks':
        return (
          <div className="space-y-6">
            {/* AI Hook Generator Header Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-[#130F30] border border-purple-500/20 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Viral Hook &amp; Copywriting Assistant</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">Generator Brief &amp; Script 3 Detik Pertama</h2>
                  <p className="text-xs text-purple-200/70">
                    Susun hook narasi yang menarik atensi audiens sebelum proses shooting video dimulai.
                  </p>
                </div>
                <button
                  onClick={handleGenerateHook}
                  disabled={isAiGenerating}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAiGenerating ? 'Membuat Saran...' : 'Generate Ide Hook AI'}
                </button>
              </div>

              {newHookIdea && (
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3">
                  <p className="text-xs text-purple-200 font-mono italic">"{newHookIdea}"</p>
                  <button
                    onClick={handleAddBrief}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Simpan Menjadi Task Brief
                  </button>
                </div>
              )}
            </div>

            {/* Brief Tasks List */}
            <div className="p-6 rounded-3xl bg-[#130F30]/70 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Daftar Task Brief Script &amp; Storyboard
                </h3>
                <span className="text-xs text-purple-200/70 font-mono">{briefs.length} Brief Terdaftar</span>
              </div>

              <div className="space-y-3">
                {briefs.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-purple-300">
                          {b.id}
                        </span>
                        <span className="text-xs font-bold text-white">{b.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {b.pillar}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 italic">Hook: "{b.hook}"</p>
                      <div className="text-[10px] text-purple-300/60 flex items-center gap-3">
                        <span>Platform: {b.targetPlatform}</span>
                        <span>•</span>
                        <span>Durasi: {b.estimatedDuration}</span>
                        <span>•</span>
                        <span>Penulis: {b.scriptAuthor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'IN_PRODUCTION'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'campaign':
        return <InfluencerCampaignView />;

      case 'production':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-400" />
                  Video Production &amp; Editing Pipeline
                </h2>
                <p className="text-xs text-purple-200/70">
                  Tracking alur pengerjaan konten video dari shooting, editing, color grading hingga approval siap posting.
                </p>
              </div>
            </div>

            {/* Production Pipeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: '1. Shooting', stage: 'SHOOTING', color: 'border-blue-500/40 bg-blue-500/10' },
                { title: '2. Rough Cut', stage: 'EDITING', color: 'border-purple-500/40 bg-purple-500/10' },
                { title: '3. Color & Audio', stage: 'COLOR_GRADING', color: 'border-pink-500/40 bg-pink-500/10' },
                { title: '4. Siap Upload', stage: 'READY_UPLOAD', color: 'border-emerald-500/40 bg-emerald-500/10' },
              ].map((col) => {
                const items = productions.filter(
                  (p) => p.stage === col.stage || (col.stage === 'READY_UPLOAD' && p.stage === 'FINAL_REVIEW')
                );
                return (
                  <div key={col.stage} className={`p-4 rounded-2xl border ${col.color} space-y-3`}>
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white">{col.title}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-purple-200">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-2 min-h-[140px]">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[#0F172A] border border-white/10 space-y-2 text-xs"
                        >
                          <span className="font-bold text-white block">{item.title}</span>
                          <div className="flex items-center justify-between text-[10px] text-purple-200/70">
                            <span>{item.type}</span>
                            <span>{item.assignedTo}</span>
                          </div>
                          <div className="text-[10px] text-pink-400 font-mono">Deadline: {item.deadline}</div>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <p className="text-center text-[10px] text-purple-300/40 py-6">Tidak ada item</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Top Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#130F30]/80 border border-white/10">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                  Total Monthly Views
                </span>
                <span className="text-2xl font-bold text-white font-mono">148,500</span>
                <span className="text-[10px] text-emerald-400 block mt-1">+18.4% dari bulan lalu</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#130F30]/80 border border-white/10">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                  Avg Engagement Rate
                </span>
                <span className="text-2xl font-bold text-white font-mono">6.8%</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Benchmark F&amp;B: 3.5%</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#130F30]/80 border border-white/10">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                  Inquiry Link Click
                </span>
                <span className="text-2xl font-bold text-white font-mono">1,420</span>
                <span className="text-[10px] text-pink-400 block mt-1">WhatsApp &amp; Reservation Bio</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#130F30]/80 border border-white/10">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                  Estimated Social ROAS
                </span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">{roas}x</span>
                <span className="text-[10px] text-purple-200/70 block mt-1">Return on Ad Spend</span>
              </div>
            </div>

            {/* Ads ROAS Interactive Simulator */}
            <div className="p-6 rounded-3xl bg-[#130F30]/70 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Kalkulator Efektivitas Iklan Instagram / TikTok Ads (ROAS)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-purple-200">Biaya Iklan (Ad Spend)</label>
                  <input
                    type="number"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    className="w-full bg-[#0B081E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-purple-200">Estimasi Views Diperoleh</label>
                  <input
                    type="number"
                    value={totalViews}
                    onChange={(e) => setTotalViews(Number(e.target.value))}
                    className="w-full bg-[#0B081E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-purple-200">Closing Reservasi Langsung (Meja/Event)</label>
                  <input
                    type="number"
                    value={directReservations}
                    onChange={(e) => setDirectReservations(Number(e.target.value))}
                    className="w-full bg-[#0B081E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-purple-300">Estimasi Omzet Dihasilkan (@ Rp 450.000/bill):</span>
                  <span className="font-bold text-white font-mono ml-2">
                    Rp {estimatedRevenueFromAds.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">Hasil ROAS:</span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono text-sm border border-emerald-500/30">
                    {roas}x Return
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <ContentCalendarView />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Submodule Navigation Tabs */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {availableSubmodules.map((sub) => {
            const isActive = sub.subParam === activeSubParam;
            return (
              <button
                key={sub.id}
                onClick={() => setSearchParams({ sub: sub.subParam })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}
