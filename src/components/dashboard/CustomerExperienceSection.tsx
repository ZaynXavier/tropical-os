import React from 'react';
import { CustomerExperienceData } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  HeartHandshake,
  Star,
  Clock,
  MessageSquare,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface CustomerExperienceSectionProps {
  data: CustomerExperienceData;
}

export const CustomerExperienceSection: React.FC<CustomerExperienceSectionProps> = ({ data }) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Dimensi 7
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-pink-400" />
              <span>Pengalaman Tamu, Kecepatan Saji &amp; Kepuasan (CX)</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Rating reputasi digital, Net Promoter Score (NPS), kecepatan saji hidangan, keluhan tamu, serta log void kasir.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Google: {data.googleRating} ★</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Google Rating & Reviews */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Reputasi Google Maps</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{data.googleRating} / 5.0</div>
          <div className="text-[11px] text-gray-300">
            {(data.totalGoogleReviews ?? 0).toLocaleString('id-ID')} Total Ulasan (+{data.newReviewsThisMonth ?? 0} bulan ini)
          </div>
          <p className="text-[10px] text-gray-400">Sentimen 94% bernada positif &amp; ramah keluarga.</p>
        </div>

        {/* Card 2: Net Promoter Score (NPS) */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Net Promoter Score (NPS)</span>
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">+{data.npsScore}</div>
          <div className="text-[11px] text-gray-300">Skor Sangat Baik (World Class Benchmark)</div>
          <p className="text-[10px] text-gray-400">Mayoritas tamu adalah Promoters yang merekomendasikan.</p>
        </div>

        {/* Card 3: Serving Speed & Table Wait */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Kecepatan Saji (Serving Time)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300">{data.averageServingSpeedMin} Menit</div>
          <div className="text-[11px] text-gray-300">
            Tunggu Meja: {data.averageTableWaitTimeMin} Menit
          </div>
          <p className="text-[10px] text-gray-400">Standar resto: Maksimal 15 menit per menu reguler.</p>
        </div>

        {/* Card 4: Void & Refund Kasir */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Void &amp; Refund Kasir</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300">{formatRp(data.totalVoidAmountRp)}</div>
          <div className="text-[11px] text-gray-300">
            {data.voidTransactionCount} Transaksi Void | 0.37% Omzet
          </div>
          <p className="text-[10px] text-gray-400">Terkendali di bawah batas toleransi 0.5%.</p>
        </div>
      </div>

      {/* Complaint Breakdown & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Complaints Breakdown */}
        {data.complaintBreakdown && data.complaintBreakdown.length > 0 && (
          <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-pink-400" />
              <span>Distribusi Kategori Keluhan ({data.totalComplaintsCount} Kasus)</span>
            </h3>

            <div className="space-y-2.5 pt-1 text-xs">
              {data.complaintBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-gray-200">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-pink-300 font-bold">
                      {item.count} Kasus ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1E2438] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Feedback Feed */}
        {data.recentFeedback && data.recentFeedback.length > 0 && (
          <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Ulasan &amp; Feedback Terbaru Tamu</span>
            </h3>

            <div className="space-y-2.5 pt-1 text-xs max-h-60 overflow-y-auto pr-1">
              {data.recentFeedback.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E]/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-200">{fb.guestName}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">"{fb.comment}"</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#2D374E]/40">
                    <span>{fb.channel} • {fb.date}</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ditindaklanjuti
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics */}
      {data.diagnosticInsights && data.diagnosticInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Service Bottleneck &amp; Solusi (Rule-Based Insights)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.alert}
                category="SERVICE_SPEED"
                description={insight.rootCause}
                suggestedAction={insight.suggestedResolution}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
