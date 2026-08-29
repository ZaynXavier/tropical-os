/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_TASKS, HrTaskItem } from "../../data/mockHrData";
import { CheckSquare, Plus, Clock, UserCheck } from "lucide-react";

interface HrTasksViewProps {
  user: User;
}

export const HrTasksView: React.FC<HrTasksViewProps> = ({ user }) => {
  const [tasks, setTasks] = useState<HrTaskItem[]>(MOCK_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "Done" ? "To Do" : "Done" } : t))
    );
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Task Management &amp; Operational HR Tasks</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Daftar tugas HR &amp; Supervisor shift: audit seragam, pelatihan keselamatan kerja kitchen, &amp; verifikasi dokumen.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === "Done"}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                />
                <h3 className={`font-black text-sm ${task.status === "Done" ? "line-through text-purple-300" : "text-white"}`}>
                  {task.title}
                </h3>
              </div>
              <p className="text-xs text-purple-200/80">
                Penanggung Jawab: {task.assignedTo} ({task.division}) • Tenggat: {task.dueDate}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-xl text-[10px] font-black ${
                task.status === "Done"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
