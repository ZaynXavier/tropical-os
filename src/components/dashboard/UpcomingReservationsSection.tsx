import React, { useState, useMemo } from 'react';
import { ReservationItem, ReservationType } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  X,
  FileText,
  Building,
  HeartHandshake,
  Tag,
  Info,
} from 'lucide-react';

interface UpcomingReservationsSectionProps {
  onRefresh?: () => void;
}

export const UpcomingReservationsSection: React.FC<UpcomingReservationsSectionProps> = () => {
  const [reservations, setReservations] = useState<ReservationItem[]>(() => reservationService.getUpcoming());
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SOON' | 'WEEK' | 'MONTH' | 'EVENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReservation, setActiveReservation] = useState<ReservationItem | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date('2026-08-25');
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTimeLabel = (dateStr: string, timeStr: string) => {
    const days = getDaysDiff(dateStr);
    if (days === 0) return `Hari Ini • ${timeStr}`;
    if (days === 1) return `Besok • ${timeStr}`;
    if (days > 1) return `${days} Hari Lagi • ${timeStr}`;
    return `${dateStr} • ${timeStr}`;
  };

  const getTypeBadge = (type: ReservationType) => {
    switch (type) {
      case 'WEDDING':
        return { label: 'Wedding Intimate', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40' };
      case 'EVENT_GATHERING':
        return { label: 'Corporate Gathering', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'BIRTHDAY':
        return { label: 'Birthday Party', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'VIP_TABLE':
        return { label: 'VIP Table Dining', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'CORPORATE_DINNER':
        return { label: 'Corporate Seminar & Lunch', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: 'Family Dining', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/40' };
    }
  };

  const filteredList = useMemo(() => {
    return reservations.filter((item) => {
      // Search
      const matchSearch =
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.companyName && item.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      const days = getDaysDiff(item.date);
      if (selectedFilter === 'SOON') return days <= 1;
      if (selectedFilter === 'WEEK') return days <= 7;
      if (selectedFilter === 'MONTH') return days <= 30;
      if (selectedFilter === 'EVENT') return item.type === 'WEDDING' || item.type === 'EVENT_GATHERING';

      return true;
    });
  }, [reservations, searchQuery, selectedFilter]);

  // Total summary calculations
  const totalUpcomingPax = useMemo(() => reservations.reduce((acc, curr) => acc + curr.pax, 0), [reservations]);
  const totalPipelineValue = useMemo(() => reservations.reduce((acc, curr) => acc + curr.estimatedValue, 0), [reservations]);
  const totalDpCollected = useMemo(() => reservations.reduce((acc, curr) => acc + curr.downPayment, 0), [reservations]);

  return (
    <div className="bg-[#111827] rounded-3xl border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6 text-white">
      {/* Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D374E] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Jadwal Reservasi &amp; Event Mendatang</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {reservations.length} Booking Aktif
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Kalender event gathering, wedding intimate, dan reservasi meja VIP Tropical Garden Resto
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Stats Badges */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="px-3.5 py-2 rounded-2xl bg-[#1E2438] border border-[#2D374E] flex items-center gap-2.5 shrink-0">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Tamu VIP</div>
              <div className="text-xs font-black text-white">{totalUpcomingPax} Pax</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#1E2438] border border-[#2D374E] flex items-center gap-2.5 shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Estimasi Nilai Deals</div>
              <div className="text-xs font-black text-emerald-300">{formatRupiah(totalPipelineValue)}</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#1E2438] border border-[#2D374E] flex items-center gap-2.5 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">DP Masuk</div>
              <div className="text-xs font-black text-indigo-300">{formatRupiah(totalDpCollected)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'Semua Booking' },
            { key: 'SOON', label: 'Hari Ini & Besok' },
            { key: 'WEEK', label: '7 Hari Kedepan' },
            { key: 'MONTH', label: 'Bulan Ini' },
            { key: 'EVENT', label: 'Gathering & Wedding' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === tab.key
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1E2438] text-gray-400 hover:text-gray-200 hover:bg-[#283049]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tamu, venue, kode..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Reservations Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => {
          const typeBadge = getTypeBadge(item.type);
          const days = getDaysDiff(item.date);
          const isUrgent = days <= 1;

          return (
            <div
              key={item.id}
              onClick={() => setActiveReservation(item)}
              className="p-4 rounded-2xl bg-[#1E2438]/80 border border-[#2D374E] hover:border-purple-500/60 hover:bg-[#1E2438] transition-all space-y-3 cursor-pointer group flex flex-col justify-between"
            >
              {/* Top: Timing Badge & Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide border flex items-center gap-1.5 ${
                      isUrgent
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-purple-900/40 text-purple-200 border-purple-500/30'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{getTimeLabel(item.date, item.time)}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${typeBadge.bg}`}>
                    {typeBadge.label}
                  </span>
                </div>

                {/* Customer Title */}
                <div>
                  <h3 className="text-sm font-bold text-gray-100 group-hover:text-purple-300 transition-colors flex items-center justify-between">
                    <span className="truncate">{item.customerName}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </h3>
                  {item.companyName && (
                    <div className="text-[11px] text-purple-300 font-medium flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-purple-400" />
                      <span className="truncate">{item.companyName}</span>
                    </div>
                  )}
                </div>

                {/* Area & Pax */}
                <div className="space-y-1.5 pt-1 text-xs text-gray-300">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{item.area}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{item.pax} Pax Tamu</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      {formatRupiah(item.estimatedValue)}
                    </div>
                  </div>
                </div>

                {/* Special Requests Pills Preview */}
                {item.specialRequests && item.specialRequests.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.specialRequests.slice(0, 2).map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#283049] text-[9px] text-purple-200 border border-[#3b476b] truncate max-w-[200px]"
                      >
                        {req}
                      </span>
                    ))}
                    {item.specialRequests.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#283049] text-[9px] text-gray-400 font-bold">
                        +{item.specialRequests.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom: PIC & Quick Action */}
              <div className="pt-2 border-t border-[#2D374E]/80 flex items-center justify-between text-[10px] text-gray-400">
                <span className="truncate">PIC: {item.picName}</span>
                <span className="text-purple-400 font-semibold group-hover:underline">Detail Booking &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 bg-[#1E2438]/40 rounded-2xl border border-[#2D374E] space-y-2">
          <Calendar className="w-8 h-8 text-gray-500 mx-auto" />
          <div className="text-sm font-bold text-gray-300">Tidak ada jadwal reservasi yang cocok</div>
          <div className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau filter tab tanggal.</div>
        </div>
      )}

      {/* Modal Detail Reservasi */}
      {activeReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#2D374E] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 text-white custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#2D374E] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeReservation.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeBadge(activeReservation.type).bg}`}>
                    {getTypeBadge(activeReservation.type).label}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">{activeReservation.customerName}</h3>
                {activeReservation.companyName && (
                  <p className="text-xs text-purple-300 font-medium">{activeReservation.companyName}</p>
                )}
              </div>

              <button
                onClick={() => setActiveReservation(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
                <div className="text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tanggal &amp; Waktu</span>
                </div>
                <div className="font-bold text-white">
                  {activeReservation.date} • {activeReservation.time}
                </div>
                <div className="text-[10px] text-purple-300 font-semibold">
                  {getTimeLabel(activeReservation.date, activeReservation.time)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
                <div className="text-gray-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Jumlah Tamu (Pax)</span>
                </div>
                <div className="font-bold text-white">{activeReservation.pax} Orang</div>
                <div className="text-[10px] text-gray-400">Area: {activeReservation.area}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
                <div className="text-gray-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nilai Transaksi Deals</span>
                </div>
                <div className="font-bold text-emerald-400">{formatRupiah(activeReservation.estimatedValue)}</div>
                <div className="text-[10px] text-gray-400">
                  DP Masuk: {formatRupiah(activeReservation.downPayment)} ({activeReservation.paymentStatus})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
                <div className="text-gray-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                  <span>Penanggung Jawab (PIC)</span>
                </div>
                <div className="font-bold text-white">{activeReservation.picName}</div>
                <div className="text-[10px] text-gray-400">Kontak: {activeReservation.customerPhone}</div>
              </div>
            </div>

            {/* Menu Package Selected */}
            {activeReservation.menuPackage && (
              <div className="p-3.5 rounded-2xl bg-[#1E2438] border border-[#2D374E] space-y-1">
                <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Paket Menu &amp; Layanan Terpilih</span>
                </div>
                <div className="text-xs font-semibold text-gray-200">{activeReservation.menuPackage}</div>
              </div>
            )}

            {/* Special Requests */}
            {activeReservation.specialRequests && activeReservation.specialRequests.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Permintaan Khusus Tamu (Special Requests):</span>
                </div>
                <div className="space-y-1.5">
                  {activeReservation.specialRequests.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-xs text-gray-200 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {activeReservation.notes && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Info className="w-3.5 h-3.5" />
                  <span>Catatan Khusus Operasional / VIP:</span>
                </div>
                <p>{activeReservation.notes}</p>
              </div>
            )}

            {/* Footer Action */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2D374E]">
              <a
                href={`https://wa.me/${activeReservation.customerPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi Tamu via WhatsApp</span>
              </a>

              <button
                onClick={() => setActiveReservation(null)}
                className="px-4 py-2.5 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-300 text-xs font-bold transition-all border border-[#2D374E]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
