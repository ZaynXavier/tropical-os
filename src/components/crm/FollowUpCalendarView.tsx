import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  PhoneCall,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Send,
  Filter,
  Check,
  Building
} from 'lucide-react';

interface FollowUpTask {
  id: string;
  leadName: string;
  phone: string;
  companyOrGroup?: string;
  type: 'QUOTATION_REVIEW' | 'POST_VISIT_FEEDBACK' | 'BIRTHDAY_GREETING' | 'RE_ENGAGEMENT';
  scheduledDate: string;
  scheduledTime: string;
  assignedTo: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  notes: string;
}

export const FollowUpCalendarView: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([
    {
      id: 'FUP-01',
      leadName: 'Sarah (PT Digital Nusa)',
      phone: '+62 811-9876-5432',
      companyOrGroup: 'PT Digital Nusa',
      type: 'QUOTATION_REVIEW',
      scheduledDate: '2026-08-28',
      scheduledTime: '14:00 WIB',
      assignedTo: 'Aqib Latuh',
      status: 'PENDING',
      notes: 'Follow-up persetujuan DP Gathering 45 pax via WhatsApp.',
    },
    {
      id: 'FUP-02',
      leadName: 'Ibu Ratna Kumala',
      phone: '+62 819-5544-3322',
      companyOrGroup: 'Komunitas Arisan Kebaya',
      type: 'BIRTHDAY_GREETING',
      scheduledDate: '2026-08-28',
      scheduledTime: '10:00 WIB',
      assignedTo: 'Arfani',
      status: 'COMPLETED',
      notes: 'Kirim ucapan ulang tahun + complimentary dessert voucher.',
    },
    {
      id: 'FUP-03',
      leadName: 'Bpk. Darmawan',
      phone: '+62 812-9988-7766',
      companyOrGroup: 'Bank BCA Regional',
      type: 'POST_VISIT_FEEDBACK',
      scheduledDate: '2026-08-29',
      scheduledTime: '11:00 WIB',
      assignedTo: 'Aqib Latuh',
      status: 'PENDING',
      notes: 'Cek review kepuasan makan siang direksi kemarin.',
    },
  ]);

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
          : t
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Kalender Follow-Up CRM & Nurturing
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Lead Conversion Hub
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Jadwal tugas follow-up proposal penawaran, sapaan ulang tahun member, dan re-engagement pelanggan lama.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Daftar Antrean Follow-Up Hari Ini & Mendatang
        </h3>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#111827]/50 border-[#2D374E] opacity-70'
                    : 'bg-[#111827] border-[#2D374E] hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-gray-500 hover:border-blue-400'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.leadName}
                      </span>
                      {task.companyOrGroup && (
                        <span className="text-xs text-gray-400">({task.companyOrGroup})</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300">{task.notes}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                      <span>📅 {task.scheduledDate} • {task.scheduledTime}</span>
                      <span>👤 PIC: {task.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`https://wa.me/${task.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Hubungi WA
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
