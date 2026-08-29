import React, { useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();

  const mockNotifications = [
    {
      id: 1,
      title: 'SOP Kebersihan Dapur Diperbarui',
      category: 'SOP & IKA',
      time: '10 menit lalu',
      type: 'info',
      unread: true,
    },
    {
      id: 2,
      title: 'Jadwal Shift Roster Minggu Depan Telah Terbit',
      category: 'HR & Schedule',
      time: '1 jam lalu',
      type: 'success',
      unread: true,
    },
    {
      id: 3,
      title: 'Notifikasi Persiapan Opening Resto Pukul 09:00',
      category: 'Operations',
      time: '3 jam lalu',
      type: 'warning',
      unread: false,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-300 hover:text-white border border-[#2D374E] transition-all cursor-pointer"
        title="Notifikasi Sistem"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0B0F19]">
          2
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-[#1E2438] border border-[#2D374E] p-4 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D374E]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-gray-100">Notifikasi Operasional</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#283049] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {mockNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    n.unread
                      ? 'bg-purple-950/20 border-purple-500/30'
                      : 'bg-[#111827]/60 border-[#2D374E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-200">{n.title}</span>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                    <span className="text-purple-300 font-medium">{n.category}</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#2D374E] text-center">
              <span className="text-[11px] text-gray-400">
                Pusat notifikasi otomatis tersinkronisasi dengan role {currentUser?.accessLevel}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
