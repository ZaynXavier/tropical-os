/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Opportunity, Activity } from "../../data/mockCrmData";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";

interface CrmCalendarProps {
  opportunities?: Opportunity[];
  activities?: Activity[];
}

export const CrmCalendar: React.FC<CrmCalendarProps> = ({ opportunities = [], activities = [] }) => {
  const safeOpps = opportunities || [];
  const safeActs = activities || [];
  const [currentMonth, setCurrentMonth] = useState("Agustus 2026");

  // Generate 31 days mock grid for August 2026
  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);

  // Map events by day number in August
  const getEventsForDay = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-08-${formattedDay}`;

    const opps = safeOpps.filter((o) => o.eventDate === dateStr);
    const acts = safeActs.filter((a) => a.date === dateStr);

    return { opps, acts };
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Kalender Event &amp; Booking Venue Resto</h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Jadwal pemakaian Garden Area, VIP Room, Pendopo, dan agenda Food Tasting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer transition-all">
            <ChevronLeft className="w-4 h-4 text-purple-300" />
          </button>
          <span className="text-xs font-black text-white px-4 py-2 bg-purple-950/80 border border-purple-500/30 rounded-2xl tracking-wide">
            {currentMonth}
          </span>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer transition-all">
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 shadow-2xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center font-black text-[11px] text-purple-300/80 uppercase tracking-wider mb-3 pb-3 border-b border-white/10">
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInAugust.map((day) => {
            const { opps, acts } = getEventsForDay(day);
            const isToday = day === 8; // Aug 8

            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                  isToday
                    ? "bg-purple-900/40 border-purple-500/60 ring-2 ring-purple-500/50 shadow-lg shadow-purple-950/80"
                    : "bg-[#0D0922]/80 border-white/10 hover:bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-black ${
                      isToday
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-0.5 rounded-lg shadow-sm"
                        : "text-white"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && <span className="text-[9px] font-extrabold text-pink-400 uppercase tracking-widest">Hari Ini</span>}
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                  {opps.map((o) => (
                    <div
                      key={o.id}
                      className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-[9px] text-amber-200 font-bold truncate"
                      title={`${o.title} - ${o.guestCount} Pax (Rp ${(o.dealValue || 0).toLocaleString()})`}
                    >
                      🎉 {o.title} ({o.guestCount}pax)
                    </div>
                  ))}

                  {acts.map((a) => (
                    <div
                      key={a.id}
                      className="p-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-[9px] text-emerald-200 font-bold truncate"
                      title={`${a.type}: ${a.subject}`}
                    >
                      📅 {a.type}: {a.customerName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
