import React from 'react';
import { QualityPeopleData } from '../../data/dashboard/types';
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Users2,
  Heart,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface QualityPeopleSectionProps {
  data: QualityPeopleData;
}

export const QualityPeopleSection: React.FC<QualityPeopleSectionProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Dimensi 8 &amp; 9
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Standar Kualitas (SOP Audit) &amp; Pengembangan SDM</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Skor audit keamanan pangan (HACCP), sanitasi kebersihan, mystery shopper, jam pelatihan kru, dan retensi tim.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Rating Audit: {data.overallAuditRating}</span>
          </span>
        </div>
      </div>

      {/* Quality Scorecards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1 text-center">
          <span className="text-[11px] text-gray-400 font-medium">Food Safety (HACCP)</span>
          <div className="text-xl font-black text-emerald-400">{data.foodSafetyAuditScore}%</div>
          <div className="text-[10px] text-gray-400">Target &gt;90%</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1 text-center">
          <span className="text-[11px] text-gray-400 font-medium">Hygiene &amp; Sanitasi</span>
          <div className="text-xl font-black text-emerald-400">{data.hygieneSanitationScore}%</div>
          <div className="text-[10px] text-gray-400">Dapur &amp; Area Makan</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1 text-center">
          <span className="text-[11px] text-gray-400 font-medium">Mystery Shopper</span>
          <div className="text-xl font-black text-purple-300">{data.mysteryShopperScore}%</div>
          <div className="text-[10px] text-gray-400">Audit Tamu Rahasia</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1 text-center">
          <span className="text-[11px] text-gray-400 font-medium">Internal SOP Audit</span>
          <div className="text-xl font-black text-blue-300">{data.internalAuditScore}%</div>
          <div className="text-[10px] text-gray-400">Checklist Manager</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-1 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-gray-400 font-medium">Service Hospitality</span>
          <div className="text-xl font-black text-pink-300">{data.serviceQualityScore}%</div>
          <div className="text-[10px] text-gray-400">Standar Keramahan</div>
        </div>
      </div>

      {/* 2 Columns: Critical Quality Checkpoints & HR Development Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Checkpoints */}
        {data.criticalQualityCheckpoints && data.criticalQualityCheckpoints.length > 0 && (
          <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Titik Kritis Audit Kualitas (Critical Checkpoints)</span>
            </h3>

            <div className="space-y-2 pt-1 text-xs">
              {data.criticalQualityCheckpoints.map((cp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2438] border border-[#2D374E]/60 text-gray-200"
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold text-gray-100 block">{cp.checkpoint}</span>
                    <span className="text-[10px] text-gray-400">Dept: {cp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-emerald-400">{cp.scorePct}%</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Lolos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HR & People Development */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Pengembangan SDM, Coaching &amp; Retensi Kru</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1">
              <span className="text-[11px] text-gray-400">Total Jam Pelatihan</span>
              <div className="text-xl font-black text-purple-300">{data.trainingHoursTotal} Jam</div>
              <p className="text-[10px] text-gray-400">Food hygiene &amp; service excellence</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1">
              <span className="text-[11px] text-gray-400">Sesi 1-on-1 Coaching</span>
              <div className="text-xl font-black text-emerald-400">{data.coachingSessionsCompleted} Sesi</div>
              <p className="text-[10px] text-gray-400">Supervisor &amp; Manager coaching</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1">
              <span className="text-[11px] text-gray-400">Tingkat Turnover Karyawan</span>
              <div className="text-xl font-black text-emerald-400">{(data.turnoverRatePct ?? 0).toFixed(1)}%</div>
              <p className="text-[10px] text-gray-400">0 pengunduran diri periode ini</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1">
              <span className="text-[11px] text-gray-400">Promosi &amp; Rekrutmen</span>
              <div className="text-xl font-black text-blue-300">
                {data.promotionsCount} Promosi / {data.recruitmentInProgress} Rekrut
              </div>
              <p className="text-[10px] text-gray-400">Pertumbuhan jenjang karir internal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
