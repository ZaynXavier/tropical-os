/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — MY HANDOVER VIEW (Staff Personalized Submodule)
 * Focused workflow for shift employees: outgoing handovers, incoming handovers to accept, and pending tasks.
 */

import React, { useState } from 'react';
import {
  Send,
  Inbox,
  ListTodo,
  Plus,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { HandoverRecord, PendingTask } from '../../../types/handover';
import { HandoverCard } from './HandoverCard';
import { HandoverTable } from './HandoverTable';

interface MyHandoverViewProps {
  handovers: HandoverRecord[];
  currentUserId?: string;
  currentUserName?: string;
  onInspect: (handover: HandoverRecord) => void;
  onReceive: (handover: HandoverRecord) => void;
  onCreateNew: () => void;
}

export const MyHandoverView: React.FC<MyHandoverViewProps> = ({
  handovers,
  currentUserId = 'emp-06',
  currentUserName = 'Staf Operasional',
  onInspect,
  onReceive,
  onCreateNew,
}) => {
  const [subTab, setSubTab] = useState<'INCOMING' | 'OUTGOING' | 'TASKS'>('INCOMING');

  // Filter handovers
  const incomingHandovers = handovers.filter(
    (h) => h.toEmployeeId === currentUserId || (h.status === 'SUBMITTED' || h.status === 'PENDING_RECEIPT')
  );

  const outgoingHandovers = handovers.filter((h) => h.fromEmployeeId === currentUserId);

  // Extract my pending tasks
  const myPendingTasks: { task: PendingTask; handoverNumber: string; areaName: string }[] = [];
  handovers.forEach((h) => {
    if (h.pendingTasks) {
      h.pendingTasks.forEach((pt) => {
        if (
          (pt.assignedTo === currentUserId || !pt.assignedTo) &&
          (pt.status === 'OPEN' || pt.status === 'IN_PROGRESS')
        ) {
          myPendingTasks.push({
            task: pt,
            handoverNumber: h.handoverNumber,
            areaName: h.areaName,
          });
        }
      });
    }
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Action */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Serah Terima Shift Saya ({currentUserName})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar laporan serah terima yang membutuhkan tindakan penerimaan atau penyerahan Anda
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Buat Serah Terima Baru
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab('INCOMING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'INCOMING'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-[#151B2B] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Harus Saya Terima ({incomingHandovers.length})
        </button>

        <button
          onClick={() => setSubTab('OUTGOING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'OUTGOING'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-[#151B2B] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Send className="w-4 h-4" />
          Handover Keluar Saya ({outgoingHandovers.length})
        </button>

        <button
          onClick={() => setSubTab('TASKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'TASKS'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-[#151B2B] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Tugas Lanjutan Saya ({myPendingTasks.length})
        </button>
      </div>

      {/* INCOMING TAB */}
      {subTab === 'INCOMING' && (
        <div className="space-y-3">
          {incomingHandovers.length === 0 ? (
            <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Tidak Ada Handover Masuk</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua serah terima shift sebelumnya sudah Anda terima dengan baik.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {incomingHandovers.map((h) => (
                <HandoverCard
                  key={h.id}
                  handover={h}
                  onInspect={onInspect}
                  onReceive={onReceive}
                  currentUserId={currentUserId}
                  canReceive={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* OUTGOING TAB */}
      {subTab === 'OUTGOING' && (
        <div className="space-y-3">
          {outgoingHandovers.length === 0 ? (
            <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-10 text-center">
              <Send className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Belum Ada Handover Dibuat</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik tombol "+ Buat Serah Terima Baru" di atas saat mengakhiri shift Anda.
              </p>
            </div>
          ) : (
            <HandoverTable
              handovers={outgoingHandovers}
              onInspect={onInspect}
              currentUserId={currentUserId}
            />
          )}
        </div>
      )}

      {/* TASKS TAB */}
      {subTab === 'TASKS' && (
        <div className="space-y-3">
          {myPendingTasks.length === 0 ? (
            <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Zero Pending Tasks</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tidak ada tugas lanjutan lintas shift yang ditugaskan kepada Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myPendingTasks.map(({ task, handoverNumber, areaName }, idx) => (
                <div
                  key={task.taskId || idx}
                  className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {handoverNumber}
                      </span>
                      <span className="text-xs font-bold text-white">{task.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          task.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{task.description}</p>
                  </div>

                  <div className="text-right shrink-0 text-xs">
                    <span className="text-slate-400">Target WIB: </span>
                    <span className="font-mono font-bold text-purple-300">
                      {task.dueTime || 'Sebelum Closing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
