/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_ONBOARDING, OnboardingItem } from "../../data/mockHrData";
import { UserPlus, UserMinus, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface HrOnboardingViewProps {
  user: User;
}

export const HrOnboardingView: React.FC<HrOnboardingViewProps> = ({ user }) => {
  const [items, setItems] = useState<OnboardingItem[]>(MOCK_ONBOARDING);

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <span>Onboarding &amp; Offboarding Staf Resto</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Checklist orientasi staf baru (penyerahan seragam, pelatihan POS &amp; Food Safety) serta proses exit clearance karyawan keluar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {item.type}
              </span>
              <span className="text-[10px] text-purple-300 font-mono">Mulai: {item.startDate}</span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">{item.employeeName}</h3>
              <p className="text-xs text-indigo-300 font-bold">{item.role}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300">Progress Orientasi:</span>
                <span className="text-emerald-400 font-bold">{item.progress}% ({item.tasksCompleted}/{item.totalTasks} Tugas)</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
