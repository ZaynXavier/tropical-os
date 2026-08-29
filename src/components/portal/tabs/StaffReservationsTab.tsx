import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Utensils,
  Wine,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  PartyPopper,
  MessageCircle,
  Check,
  ShieldCheck,
  Building,
  UserCheck,
  Lock,
  Info,
  X
} from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';
import { StaffReservation, MOCK_STAFF_RESERVATIONS } from '../../../data/mockReservations';

interface StaffReservationsTabProps {
  currentUser: EmployeePersonnel | null;
  onNavigateTab?: (tab: string) => void;
}

export const StaffReservationsTab: React.FC<StaffReservationsTabProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [reservations, setReservations] = useState<StaffReservation[]>(MOCK_STAFF_RESERVATIONS);
  const [filterDate, setFilterDate] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [filterScope, setFilterScope] = useState<'all' | 'my_tasks'>('all');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('RES-01');
  const [isCRMInfoModalOpen, setIsCRMInfoModalOpen] = useState(false);

  const todayStr = '2026-08-28';
  const tomorrowStr = '2026-08-29';

  // Rule 4: Balas chat customer reservasi hanya bisa dilakukan oleh Tim CRM (Aqib Latuh & Arfani)
  const isCRMStaff =
    currentUser?.department?.toUpperCase() === 'CRM' ||
    currentUser?.primaryPosition?.toUpperCase().includes('CRM') ||
    currentUser?.role?.toUpperCase().includes('CRM');

  // Toggle checklist status for staff
  const handleToggleStatus = (
    resId: string,
    field: 'tableReady' | 'kitchenReady' | 'barReady'
  ) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== resId) return r;
        const newAssigned = {
          ...r.assignedStaff,
          [field]: !r.assignedStaff[field],
        };
        // Auto update status if all are ready
        let newStatus = r.status;
        if (newAssigned.tableReady && newAssigned.kitchenReady && newAssigned.barReady && r.status === 'UPCOMING') {
          newStatus = 'PREPARING';
        }
        return {
          ...r,
          status: newStatus,
          assignedStaff: newAssigned,
        };
      })
    );
  };

  const handleMarkSeated = (resId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'SEATED' } : r))
    );
  };

  // Filter logic
  const filteredReservations = reservations.filter((r) => {
    // Date filter
    if (filterDate === 'today' && r.date !== todayStr) return false;
    if (filterDate === 'tomorrow' && r.date !== tomorrowStr) return false;

    // Area filter
    if (filterArea !== 'ALL' && r.area !== filterArea) return false;

    // Scope filter (My Tasks vs All)
    if (filterScope === 'my_tasks' && currentUser) {
      const isOwnerOrManager = currentUser.accessLevel === 'OWNER' || currentUser.accessLevel === 'MANAGER' || currentUser.accessLevel === 'SUPERVISOR';
      if (!isOwnerOrManager) {
        const userName = currentUser.name.toLowerCase();
        const waiterMatch = r.assignedStaff.waiterName.toLowerCase().includes(userName);
        const kitchenMatch = r.assignedStaff.kitchenPIC.toLowerCase().includes(userName);
        const barMatch = r.assignedStaff.barPIC.toLowerCase().includes(userName);
        const crmMatch = r.assignedStaff.crmPIC?.toLowerCase().includes(userName);
        if (!waiterMatch && !kitchenMatch && !barMatch && !crmMatch) return false;
      }
    }

    return true;
  });

  const todayReservations = reservations.filter((r) => r.date === todayStr);
  const totalGuestsToday = todayReservations.reduce((sum, r) => sum + r.pax, 0);
  const tablesReadyCount = todayReservations.filter((r) => r.assignedStaff.tableReady).length;
  const kitchenReadyCount = todayReservations.filter((r) => r.assignedStaff.kitchenReady).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C253D] via-[#151C2E] to-[#0E1322] border border-blue-500/30 space-y-3 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-black shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider truncate">Jadwal Reservasi Tamu &amp; VIP</h2>
              <p className="text-[10px] text-blue-200 truncate">
                Pengawasan meja, pre-order menu &amp; tugas stasiun staff
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/40 font-mono shrink-0 whitespace-nowrap">
            {todayReservations.length} Booking Hari Ini
          </span>
        </div>

        {/* Quick KPI Bar for today */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
            <span className="text-[9px] text-gray-400 block">Total Tamu (Pax)</span>
            <span className="text-xs font-bold text-white font-mono">{totalGuestsToday} Orang</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
            <span className="text-[9px] text-gray-400 block">Meja Ready</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{tablesReadyCount} / {todayReservations.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
            <span className="text-[9px] text-gray-400 block">Kitchen Prep</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{kitchenReadyCount} / {todayReservations.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        {/* Date Filter & Scope Switcher */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Date Selector */}
          <div className="flex items-center bg-[#161C2C] p-1 rounded-2xl border border-[#2D374E] shrink-0">
            <button
              onClick={() => setFilterDate('today')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterDate === 'today'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Hari Ini ({todayReservations.length})
            </button>
            <button
              onClick={() => setFilterDate('tomorrow')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterDate === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Besok
            </button>
            <button
              onClick={() => setFilterDate('all')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterDate === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Scope Selector: Tugas Saya vs Semua */}
          <div className="flex items-center bg-[#161C2C] p-1 rounded-2xl border border-[#2D374E] shrink-0">
            <button
              onClick={() => setFilterScope('all')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Semua Resto
            </button>
            <button
              onClick={() => setFilterScope('my_tasks')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterScope === 'my_tasks'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Tugas Saya
            </button>
          </div>
        </div>

        {/* Area Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[10px]">
          {[
            { id: 'ALL', label: 'Semua Area' },
            { id: 'VIP Gazebo', label: '👑 VIP Gazebo' },
            { id: 'Garden Outdoor', label: '🌿 Garden Hall' },
            { id: 'Private Room', label: '🚪 Private AC' },
            { id: 'Indoor AC', label: '❄️ Indoor AC' },
          ].map((area) => (
            <button
              key={area.id}
              onClick={() => setFilterArea(area.id)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all font-semibold cursor-pointer border ${
                filterArea === area.id
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                  : 'bg-[#161C2C] text-gray-400 border-[#2D374E] hover:text-gray-200'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservation List */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#161C2C] border border-[#2D374E] text-center space-y-2">
            <Calendar className="w-8 h-8 text-gray-500 mx-auto" />
            <div className="text-xs font-bold text-gray-300">Tidak ada reservasi ditemukan</div>
            <p className="text-[10px] text-gray-500">
              Coba ubah filter tanggal atau pilih &quot;Semua Resto&quot;.
            </p>
          </div>
        ) : (
          filteredReservations.map((res) => {
            const isExpanded = expandedId === res.id;
            const isToday = res.date === todayStr;

            return (
              <div
                key={res.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  res.status === 'SEATED'
                    ? 'bg-[#131E2A] border-emerald-500/40 shadow-lg'
                    : 'bg-[#161C2C] border-[#2D374E] hover:border-blue-500/40 shadow'
                }`}
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : res.id)}
                  className="p-3.5 cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-gray-400 font-bold bg-[#0F1420] px-1.5 py-0.5 rounded border border-[#2D374E]">
                          {res.reservationCode}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                          {res.area}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white pt-0.5 flex items-center gap-1.5">
                        <span>{res.guestName}</span>
                      </h3>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <PartyPopper className="w-3 h-3 text-amber-400" />
                        <span>{res.occasion}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          res.status === 'SEATED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : res.status === 'PREPARING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {res.status === 'SEATED' ? '🍽️ Tamu Tiba (Seated)' : res.status === 'PREPARING' ? '⚡ Persiapan' : '⏳ Terkonfirmasi'}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-purple-300">
                        {res.pax} Pax
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar: Time & Table & Staff PIC */}
                  <div className="pt-2 border-t border-[#232C42] flex items-center justify-between text-[10px] text-gray-300">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-white font-mono font-bold">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {res.time}
                      </span>
                      <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {res.tableNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                      <span>Detail &amp; Tugas</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-3.5 bg-[#0F1420] border-t border-[#232C42] space-y-3 animate-fade-in text-xs">
                    {/* Guest Contact & WhatsApp Action */}
                    <div className="p-2.5 rounded-xl bg-[#161C2C] border border-[#2D374E] flex items-center justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[9px] text-gray-400 block">KONTAK TAMU &amp; DP</span>
                        <div className="font-semibold text-white text-[11px] truncate">{res.phone}</div>
                        <div className="text-[10px] text-emerald-400 font-mono font-bold truncate">
                          DP: Rp {res.depositAmount.toLocaleString('id-ID')} ({res.depositStatus})
                        </div>
                      </div>

                      {/* Rule 4: Balas chat customer reservasi hanya bisa dilakukan oleh tim CRM */}
                      {isCRMStaff ? (
                        <a
                          href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(res.guestName)},%20saya%20${encodeURIComponent(currentUser?.fullName || 'Tim CRM')}%20dari%20Tim%20CRM%20Tropical%20Garden%20Resto%20ingin%20mengonfirmasi%20reservasi%20meja%20Anda.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Balas Chat (CRM)</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCRMInfoModalOpen(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0F1420] text-gray-300 border border-amber-500/40 hover:border-amber-400 text-[10px] font-medium transition-all cursor-pointer shrink-0 shadow-sm"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Chat via CRM</span>
                        </button>
                      )}
                    </div>

                    {/* Staff Responsibilities & Live Checklist */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Tugas &amp; Kesiapan Stasiun Staff:</span>
                      </div>

                      <div className="space-y-1.5">
                        {/* 1. Waiter / Table Setup */}
                        <div className="p-2 rounded-xl bg-[#161C2C] border border-[#2D374E] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                                Waiter
                              </span>
                              <span className="text-[11px] font-bold text-white">{res.assignedStaff.waiterName}</span>
                            </div>
                            <div className="text-[10px] text-gray-400">Setup Meja, Cutleries &amp; Greeting</div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(res.id, 'tableReady')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                              res.assignedStaff.tableReady
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-[#1E2538] text-gray-400 border-[#2D374E] hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${res.assignedStaff.tableReady ? 'text-emerald-400' : 'text-gray-500'}`} />
                            <span>{res.assignedStaff.tableReady ? 'Meja Siap ✓' : 'Tandai Siap'}</span>
                          </button>
                        </div>

                        {/* 2. Kitchen / Pre-Order Food */}
                        <div className="p-2 rounded-xl bg-[#161C2C] border border-[#2D374E] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                Kitchen
                              </span>
                              <span className="text-[11px] font-bold text-white">{res.assignedStaff.kitchenPIC}</span>
                            </div>
                            <div className="text-[10px] text-gray-400">Prep Menu Makanan Pre-Order</div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(res.id, 'kitchenReady')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                              res.assignedStaff.kitchenReady
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-[#1E2538] text-gray-400 border-[#2D374E] hover:text-white'
                            }`}
                          >
                            <Utensils className={`w-3.5 h-3.5 ${res.assignedStaff.kitchenReady ? 'text-emerald-400' : 'text-gray-500'}`} />
                            <span>{res.assignedStaff.kitchenReady ? 'Dapur Siap ✓' : 'Tandai Siap'}</span>
                          </button>
                        </div>

                        {/* 3. Bar / Beverage */}
                        <div className="p-2 rounded-xl bg-[#161C2C] border border-[#2D374E] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                                Barista
                              </span>
                              <span className="text-[11px] font-bold text-white">{res.assignedStaff.barPIC}</span>
                            </div>
                            <div className="text-[10px] text-gray-400">Welcome Drinks &amp; Mocktail</div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(res.id, 'barReady')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                              res.assignedStaff.barReady
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-[#1E2538] text-gray-400 border-[#2D374E] hover:text-white'
                            }`}
                          >
                            <Wine className={`w-3.5 h-3.5 ${res.assignedStaff.barReady ? 'text-emerald-400' : 'text-gray-500'}`} />
                            <span>{res.assignedStaff.barReady ? 'Bar Siap ✓' : 'Tandai Siap'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pre-Order Menu Items */}
                    {res.preOrderMenu && res.preOrderMenu.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-amber-400" />
                          <span>Daftar Menu Pre-Order ({res.preOrderMenu.length} Item):</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#161C2C] border border-[#2D374E] space-y-1.5">
                          {res.preOrderMenu.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1 last:border-0 last:pb-0"
                            >
                              <div className="space-y-0.5">
                                <span className="font-medium text-white">{item.name}</span>
                                {item.notes && (
                                  <span className="block text-[9px] text-amber-300 italic">
                                    Catatan: {item.notes}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-cyan-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                {item.qty}x
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Notes & Requests */}
                    {res.specialNotes && res.specialNotes.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Catatan Khusus / Special Request Tamu:</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                          {res.specialNotes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[10px] text-amber-200">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seated Status Button */}
                    {res.status !== 'SEATED' && (
                      <button
                        onClick={() => handleMarkSeated(res.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Tamu Tiba &amp; Menempati Meja (Check-in Seated)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL SOP SATU PINTU: CRM ONLY CHAT NOTIFICATION */}
      {isCRMInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161C2C] border-2 border-amber-500/40 p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">SOP Pelayanan Satu Pintu (CRM)</h3>
              <p className="text-xs text-amber-300 font-semibold">
                Komunikasi Chat Tamu Khusus Tim CRM
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E] text-[11px] text-gray-300 text-left space-y-2 leading-relaxed">
              <p>
                Sesuai SOP Tropical Garden Resto, <strong>balas chat &amp; konfirmasi WhatsApp langsung kepada pelanggan reservasi HANYA dilakukan oleh Tim CRM</strong> (Aqib Latuh &amp; Arfani).
              </p>
              <p className="text-gray-400">
                Divisi Waiter, Kitchen, Bar, dan Kasir berfokus pada persiapan meja, hidangan, dan kelancaran operasional di outlet.
              </p>
            </div>

            <button
              onClick={() => setIsCRMInfoModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg cursor-pointer transition-all"
            >
              Saya Mengerti (Tutup)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
