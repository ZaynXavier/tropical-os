import React from 'react';
import { Sparkles, HelpCircle, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ManagementInsightBoxProps {
  title: string;
  category?: string;
  description: string;
  impactRp?: number;
  impactLabel?: string;
  suggestedAction?: string;
  responsiblePerson?: string;
  confidenceScore?: number;
  className?: string;
}

export const ManagementInsightBox: React.FC<ManagementInsightBoxProps> = ({
  title,
  category,
  description,
  impactRp,
  impactLabel,
  suggestedAction,
  responsiblePerson,
  confidenceScore,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#1A2234] border border-purple-500/30 p-5 shadow-lg space-y-3.5 transition-all hover:border-purple-500/50 ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Management Insight</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#111827] text-gray-400 border border-[#2D374E]">
            Rule-Based Analytics
          </span>
          {category && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
              {category}
            </span>
          )}
        </div>

        {confidenceScore && (
          <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
            <span>Akurasi Rule:</span>
            <strong className="text-emerald-400">{confidenceScore}%</strong>
          </div>
        )}
      </div>

      {/* Insight Title & Description */}
      <div className="space-y-1.5 relative z-10">
        <h4 className="text-sm md:text-base font-bold text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{title}</span>
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Financial Impact & Suggested Action */}
      {(impactRp !== undefined || impactLabel || suggestedAction) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#2D374E]/80 relative z-10">
          {(impactRp !== undefined || impactLabel) && (
            <div className="p-2.5 rounded-xl bg-[#111827]/90 border border-[#2D374E] space-y-0.5">
              <span className="text-[11px] text-gray-400 block font-medium">Estimasi Dampak:</span>
              <div className="text-xs font-bold text-rose-400">
                {impactRp !== undefined ? (
                  <>
                    {impactRp < 0 ? '-' : '+'}Rp {Math.abs(impactRp).toLocaleString('id-ID')}
                    <span className="text-[10px] text-gray-400 font-normal ml-1">/ periode</span>
                  </>
                ) : (
                  impactLabel
                )}
              </div>
            </div>
          )}

          {suggestedAction && (
            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-0.5 md:col-span-1">
              <span className="text-[11px] text-purple-300 block font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Rekomendasi Tindakan:
              </span>
              <p className="text-xs text-gray-200 font-medium leading-snug">{suggestedAction}</p>
              {responsiblePerson && (
                <div className="text-[10px] text-gray-400 pt-0.5">
                  PIC: <strong className="text-pink-300">{responsiblePerson}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
