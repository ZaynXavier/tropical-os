import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface PagePlaceholderProps {
  moduleTitle: string;
  submoduleTitle?: string;
  description: string;
  plannedFeatures: string[];
  phaseTarget?: string;
  icon?: React.ReactNode;
  tags?: string[];
  customMessage?: string;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  moduleTitle,
  submoduleTitle,
  description,
  plannedFeatures,
  phaseTarget = 'Phase Berikutnya (Sesuai Master Roadmap PRD)',
  icon,
  tags = [],
  customMessage,
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1E2438] border border-[#2D374E] p-6 md:p-8 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Layers className="w-3.5 h-3.5" />
                {moduleTitle}
              </span>

              {submoduleTitle && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#283049] text-gray-200 border border-[#2D374E]">
                  {submoduleTitle}
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Phase 0 Foundation
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
              {icon && <span className="p-2 rounded-xl bg-[#283049] text-purple-400 border border-[#2D374E]">{icon}</span>}
              {submoduleTitle || moduleTitle}
            </h1>

            <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0 bg-[#111827]/70 p-4 rounded-xl border border-[#2D374E]">
            <div className="text-xs text-gray-400">Target Pengembangan:</div>
            <div className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40">
              {phaseTarget}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC & Shell Ready
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features & Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned Capabilities */}
        <div className="lg:col-span-2 rounded-xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
            <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Fitur & Kemampuan yang Direncanakan
            </h2>
            <span className="text-xs text-gray-400">Master Spec PRD & IA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {plannedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#111827]/50 border border-[#2D374E]/70 hover:border-purple-500/40 transition-colors"
              >
                <div className="p-1 rounded-md bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-gray-200">{feature}</div>
                  <div className="text-xs text-gray-400">Spesifikasi terdefinisi di dokumentasi</div>
                </div>
              </div>
            ))}
          </div>

          {customMessage && (
            <div className="mt-4 p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{customMessage}</span>
            </div>
          )}
        </div>

        {/* User Context & Architecture Guard */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#1E2438] border border-[#2D374E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2 border-b border-[#2D374E] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Konteks Akses Pengguna
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#283049]">
                <span className="text-gray-400">Pengguna Aktif:</span>
                <span className="font-semibold text-gray-200">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#283049]">
                <span className="text-gray-400">Tingkat Akses:</span>
                <span className="font-semibold text-purple-300">{currentUser?.accessLevel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#283049]">
                <span className="text-gray-400">Departemen:</span>
                <span className="font-semibold text-gray-200">{currentUser?.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#283049]">
                <span className="text-gray-400">Jabatan Pokok:</span>
                <span className="font-semibold text-gray-200">{currentUser?.primaryPosition}</span>
              </div>
              {currentUser?.additionalResponsibilities && currentUser.additionalResponsibilities.length > 0 && (
                <div className="py-1.5 space-y-1">
                  <span className="text-gray-400 block">Tanggung Jawab Khusus:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.additionalResponsibilities.map((resp, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-pink-950/60 text-pink-300 border border-pink-800/40">
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="rounded-xl bg-[#1E2438] border border-[#2D374E] p-4">
              <div className="text-xs text-gray-400 mb-2">Tag & Kategori Modul:</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-[#111827] text-gray-300 border border-[#2D374E]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
