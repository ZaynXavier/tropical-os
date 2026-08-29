/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_KPI_REVIEWS, MOCK_EMPLOYEES, KpiReview } from "../../data/mockHrData";
import {
  Award,
  Star,
  Plus,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building2,
  ThumbsUp,
} from "lucide-react";

interface KpiEvaluationViewProps {
  user: User;
}

export const KpiEvaluationView: React.FC<KpiEvaluationViewProps> = ({ user }) => {
  const [reviews, setReviews] = useState<KpiReview[]>(MOCK_KPI_REVIEWS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [empId, setEmpId] = useState(MOCK_EMPLOYEES[1].id);
  const [period, setPeriod] = useState("Juli 2026");
  const [hospitality, setHospitality] = useState<number>(5);
  const [punctuality, setPunctuality] = useState<number>(4);
  const [speed, setSpeed] = useState<number>(5);
  const [hygiene, setHygiene] = useState<number>(5);
  const [feedback, setFeedback] = useState("");

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = MOCK_EMPLOYEES.find((e) => e.id === empId);
    if (!targetEmp) return;

    const overall = (hospitality + punctuality + speed + hygiene) / 4;

    const newReview: KpiReview = {
      id: `kpi-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      period: period,
      scoreHospitality: hospitality,
      scorePunctuality: punctuality,
      scoreSpeedEfficiency: speed,
      scoreHygieneCleanliness: hygiene,
      overallRating: overall,
      feedbackNotes: feedback || "Penilaian standar operasional resto.",
      reviewedBy: `${user.name} (${user.role})`,
    };

    setReviews([newReview, ...reviews]);
    setIsAddOpen(false);
    setFeedback("");
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>KPI &amp; Performance Review Staf</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Evaluasi berkala performa kerja karyawan: keramahan (hospitality), kedisiplinan, kecepatan kerja &amp; higienitas.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-600/30 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Review KPI Baru</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-bold text-purple-300 uppercase">{rev.period}</span>
                <span className="flex items-center gap-1 font-mono text-sm font-black text-amber-300 bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rev.overallRating.toFixed(2)} / 5.0</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{rev.employeeName}</h3>
                <p className="text-xs text-purple-200/70">Reviewer: {rev.reviewedBy}</p>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-2xl border border-white/5 font-mono">
                <div className="flex justify-between">
                  <span className="text-purple-300">Hospitality &amp; Ramah:</span>
                  <strong className="text-amber-300">{rev.scoreHospitality} / 5</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Kedisiplinan Waktu:</span>
                  <strong className="text-amber-300">{rev.scorePunctuality} / 5</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Kecepatan &amp; Efisiensi:</span>
                  <strong className="text-amber-300">{rev.scoreSpeedEfficiency} / 5</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Higienitas Station:</span>
                  <strong className="text-amber-300">{rev.scoreHygieneCleanliness} / 5</strong>
                </div>
              </div>

              <p className="text-xs text-purple-100/90 italic leading-relaxed bg-purple-950/30 p-3 rounded-2xl border border-purple-500/20">
                "{rev.feedbackNotes}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add KPI Review Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Input Evaluasi Performa KPI</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-purple-300 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-200 block mb-1">Pilih Karyawan *</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs text-white"
                >
                  {MOCK_EMPLOYEES.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.division} - {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Periode Evaluasi</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Hospitality (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={hospitality}
                    onChange={(e) => setHospitality(Number(e.target.value))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Punctuality (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={punctuality}
                    onChange={(e) => setPunctuality(Number(e.target.value))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Speed &amp; Efficiency (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Hygiene (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={hygiene}
                    onChange={(e) => setHygiene(Number(e.target.value))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Catatan Evaluasi / Feedback</label>
                <textarea
                  rows={2}
                  placeholder="Apresiasi atau poin perbaikan untuk karyawan..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs font-black"
                >
                  Simpan Review KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
