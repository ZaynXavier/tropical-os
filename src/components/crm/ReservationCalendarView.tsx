import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Eye,
  Building
} from 'lucide-react';

interface ReservationItem {
  id: string;
  guestName: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  area: 'Gazebo Garden VIP' | 'Indoor AC Main Hall' | 'Sunset Poolside Deck' | 'Pendopo Heritage';
  eventType: string;
  dpAmount: number;
  totalEstimate: number;
  dpStatus: 'LUNAS' | 'BELUM_DP' | 'SEBAGIAN';
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export const ReservationCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reservations, setReservations] = useState<ReservationItem[]>([
    {
      id: 'RES-001',
      guestName: 'Bpk. Hendra Gunawan',
      phone: '+62 812-3456-7890',
      date: '2026-08-28',
      time: '18:30 WIB',
      pax: 12,
      area: 'Gazebo Garden VIP',
      eventType: 'Family Birthday Dinner',
      dpAmount: 1500000,
      totalEstimate: 3200000,
      dpStatus: 'LUNAS',
      status: 'CONFIRMED',
      notes: 'Request lilin & bunga meja, bebas gluten untuk 2 orang.',
    },
    {
      id: 'RES-002',
      guestName: 'PT Digital Nusa (Sarah)',
      phone: '+62 811-9876-5432',
      date: '2026-08-28',
      time: '19:00 WIB',
      pax: 45,
      area: 'Indoor AC Main Hall',
      eventType: 'Corporate Gathering Banquet',
      dpAmount: 5000000,
      totalEstimate: 18500000,
      dpStatus: 'LUNAS',
      status: 'CONFIRMED',
      notes: 'Proyektor & wireless mic ready.',
    },
    {
      id: 'RES-003',
      guestName: 'Jessica Tan & Friends',
      phone: '+62 818-0987-1234',
      date: '2026-08-28',
      time: '16:00 WIB',
      pax: 8,
      area: 'Sunset Poolside Deck',
      eventType: 'Arisan & High-Tea Sunset',
      dpAmount: 500000,
      totalEstimate: 1450000,
      dpStatus: 'LUNAS',
      status: 'CONFIRMED',
      notes: 'Foto spot dekat kolam.',
    },
    {
      id: 'RES-004',
      guestName: 'Keluarga Bpk. Wijaya',
      phone: '+62 813-1122-3344',
      date: '2026-08-29',
      time: '12:00 WIB',
      pax: 20,
      area: 'Pendopo Heritage',
      eventType: 'Syukuran Kelulusan',
      dpAmount: 1000000,
      totalEstimate: 4200000,
      dpStatus: 'LUNAS',
      status: 'CONFIRMED',
    },
  ]);

  const filtered = reservations.filter((r) => {
    if (filterArea !== 'ALL' && r.area !== filterArea) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Kalender Reservasi Meja & Event VIP
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Operasional Lantai Resto
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Pusat penjadwalan meja VIP, pesta ulang tahun, gathering perusahaan, dan tracking status uang muka (DP).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Input Reservasi Baru
            </button>
          </div>
        </div>

        {/* Filter Area Tabs */}
        <div className="mt-4 pt-3 border-t border-[#2D374E] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ALL', label: 'Semua Area' },
            { id: 'Gazebo Garden VIP', label: 'Gazebo Garden VIP' },
            { id: 'Indoor AC Main Hall', label: 'Indoor AC Main Hall' },
            { id: 'Sunset Poolside Deck', label: 'Sunset Poolside Deck' },
            { id: 'Pendopo Heritage', label: 'Pendopo Heritage' },
          ].map((area) => (
            <button
              key={area.id}
              onClick={() => setFilterArea(area.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterArea === area.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#1E2438] text-gray-400 hover:text-white border border-[#2D374E]'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Reservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-5 shadow-lg space-y-4 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {res.area}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{res.guestName}</h3>
                <span className="text-xs text-gray-400">{res.phone}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DP {res.dpStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#111827] border border-[#2D374E] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Waktu:
                </span>
                <span className="font-bold text-white">
                  {res.date} • {res.time}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Jumlah Tamu:
                </span>
                <span className="font-bold text-blue-400">{res.pax} Orang</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimasi Nilai:
                </span>
                <span className="font-bold text-emerald-400">
                  Rp {res.totalEstimate.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {res.notes && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                📌 Catatan: {res.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
