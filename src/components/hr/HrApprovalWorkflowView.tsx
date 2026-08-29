/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../../types";
import { MOCK_LEAVE_REQUESTS, MOCK_OVERTIME_REQUESTS, LeaveRequest, OvertimeRequest } from "../../data/mockHrData";
import { CheckCircle2, XCircle, Clock, CheckSquare, ShieldCheck } from "lucide-react";

interface HrApprovalWorkflowViewProps {
  user: User;
}

export const HrApprovalWorkflowView: React.FC<HrApprovalWorkflowViewProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>(MOCK_OVERTIME_REQUESTS);

  const canApprove = user.role === "MANAGER" || (user as any).accessLevel === "MANAGER";

  const handleApproveLeave = (id: string) => {
    if (!canApprove) {
      alert("Akses Ditolak: Persetujuan (Approval) hanya dapat dilakukan oleh General Manager.");
      return;
    }
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
  };

  const handleRejectLeave = (id: string) => {
    if (!canApprove) {
      alert("Akses Ditolak: Penolakan (Reject) hanya dapat dilakukan oleh General Manager.");
      return;
    }
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l)));
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Inbox Approval Workflow Multi-Level</span>
          </h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Pusat persetujuan manajerial untuk permohonan cuti, klaim lembur, kasbon gaji &amp; mutasi shift.
          </p>
        </div>
      </div>

      {/* Pending Items list */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-purple-200 uppercase tracking-wider">Permohonan Cuti &amp; Izin Menyusul</h3>
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-base">{l.employeeName}</span>
                  <span className="text-[10px] text-purple-300">({l.division})</span>
                </div>
                <p className="text-xs text-indigo-300 font-bold">{l.type} • {l.totalDays} Hari ({l.startDate} - {l.endDate})</p>
                <p className="text-xs text-purple-200/80 italic">"{l.reason}"</p>
              </div>

              <div className="flex items-center gap-2">
                {l.status === "Pending" ? (
                  canApprove ? (
                    <>
                      <button
                        onClick={() => handleRejectLeave(l.id)}
                        className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white rounded-xl text-xs font-bold border border-red-500/30 cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveLeave(l.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-emerald-600/30"
                      >
                        Setujui (Approve)
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Butuh Approval SPV / Manager</span>
                    </span>
                  )
                ) : (
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black ${
                      l.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    Status: {l.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
