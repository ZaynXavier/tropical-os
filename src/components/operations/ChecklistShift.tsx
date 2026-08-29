/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_SHIFT_CHECKLISTS, ShiftChecklistCategory } from "../../data/mockOperationsData";
import {
  CheckSquare,
  CheckCircle2,
  Square,
  Filter,
  Layers,
  Sparkles,
  Award,
  AlertCircle,
} from "lucide-react";

interface ChecklistShiftProps {
  user: User;
}

export const ChecklistShift: React.FC<ChecklistShiftProps> = ({ user }) => {
  const [categories, setCategories] = useState<ShiftChecklistCategory[]>(MOCK_SHIFT_CHECKLISTS);
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");

  const toggleTask = (catId: string, taskId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          tasks: cat.tasks.map((t) => {
            if (t.id === taskId) {
              return { ...t, completed: !t.completed, assignedRole: !t.completed ? user.name : "Staff" };
            }
            return t;
          }),
        };
      })
    );
  };

  // Helper function to map user division enum to checklist category string
  const isDivisionMatching = (catDiv: string, userDiv: string) => {
    const cd = catDiv.toLowerCase();
    const ud = userDiv.toLowerCase();
    if (ud.includes("kitchen") && cd.includes("kitchen")) return true;
    if (ud.includes("barista") && cd.includes("barista")) return true;
    if ((ud.includes("waiter") || ud.includes("floor")) && (cd.includes("waiter") || cd.includes("floor"))) return true;
    if (ud.includes("housekeeping") && cd.includes("housekeeping")) return true;
    if (ud.includes("kasir") && cd.includes("kasir")) return true;
    if (ud.includes("purchasing") && cd.includes("purchasing")) return true;
    if (ud.includes("finance") && cd.includes("finance")) return true;
    if ((ud.includes("content") || ud.includes("creative")) && cd.includes("content")) return true;
    if (ud.includes("crm") && cd.includes("crm")) return true;
    if (ud.includes("operations") || ud.includes("management")) return true;
    return cd.includes(ud) || ud.includes(cd);
  };

  const filteredCategories = categories.filter((cat) => {
    // If staff, strictly filter by staff's division
    if (user.role === "STAFF") {
      return isDivisionMatching(cat.division, user.division);
    }

    if (selectedDivision === "ALL") return true;
    return isDivisionMatching(cat.division, selectedDivision);
  });

  // Calculate total progress
  const totalTasks = filteredCategories.flatMap((c) => c.tasks).length;
  const completedTasks = filteredCategories.flatMap((c) => c.tasks).filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Checklist Operational Shift &amp; Hygiene Standards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Checklist standar operasional sebelum opening &amp; closing untuk Kitchen, Barista, Waiters &amp; Housekeeping.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-white/10 shrink-0 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">Progress Checklist Hari Ini</span>
            <span className="text-emerald-400 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#1E2438] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 text-right font-mono">
            {completedTasks} dari {totalTasks} Tugas Selesai
          </div>
        </div>
      </div>

      {/* Filter Tabs / Staff Badge */}
      {user.role === "STAFF" ? (
        <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Akses Checklist Terkunci Untuk Divisi:</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wide px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              {user.division}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 italic font-mono">
            Hanya dapat mengakses checklist sesuai divisi tugas.
          </span>
        </div>
      ) : (
        <div className="bg-[#151B2B] p-3 rounded-2xl border border-white/10 shadow-xs flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
          {["ALL", "Kitchen", "Barista", "Waiters", "Housekeeping", "Kasir", "Purchasing", "Finance", "Content", "CRM"].map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer text-xs ${
                selectedDivision === div
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-[#0B0F19] text-slate-300 border border-white/10 hover:bg-[#1E2438] hover:text-white"
              }`}
            >
              {div === "ALL" ? "Semua Divisi" : div}
            </button>
          ))}
        </div>
      )}

      {/* Checklist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCategories.map((cat) => {
          const catTotal = cat.tasks.length;
          const catDone = cat.tasks.filter((t) => t.completed).length;
          const catPercent = Math.round((catDone / catTotal) * 100);

          return (
            <div
              key={cat.id}
              className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    {cat.division} • {cat.shiftType}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{cat.title}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">{catPercent}%</span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {catDone}/{catTotal} Selesai
                  </span>
                </div>
              </div>

              {/* Task Items List */}
              <div className="space-y-2">
                {cat.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(cat.id, task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      task.completed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                        : "bg-[#0B0F19] border-white/10 text-slate-300 hover:bg-[#1E2438]/60"
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-emerald-400 cursor-pointer">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium leading-relaxed ${
                          task.completed ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {task.task}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Assigned: {task.assignedRole}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
