import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { breakService } from '../../services/breakService';
import { EnrichedBreakRecord, BreakSummary } from '../../types/break';
import { BreakApprovalModal } from './BreakApprovalModal';
import { BreakSummaryCard } from './BreakSummaryCard';
import {
  Users,
  Coffee,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Building2,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';

export const TeamBreakManagementView: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [teamBreaks, setTeamBreaks] = useState<EnrichedBreakRecord[]>([]);
  const [summary, setSummary] = useState<BreakSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Approval modal state
  const [selectedBreakForAction, setSelectedBreakForAction] = useState<{
    record: EnrichedBreakRecord;
    mode: 'APPROVE' | 'REJECT';
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadTeamData();
    }
  }, [currentUser, selectedDate]);

  const loadTeamData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [records, sum] = await Promise.all([
        breakService.getTeamBreaks(currentUser, selectedDate),
        breakService.getBreakSummary({
          date: selectedDate,
          department:
            currentUser.accessLevel === 'SUPERVISOR' && currentUser.department !== 'Operations'
              ? currentUser.department
              : undefined,
        }),
      ]);
      setTeamBreaks(records);
      setSummary(sum);
    } catch (err) {
      console.error('Error loading team breaks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBreaks = teamBreaks.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.employee?.fullName.toLowerCase().includes(q);
      const matchCode = item.employee?.employeeCode.toLowerCase().includes(q);
      const matchPos = item.employee?.primaryPosition.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      return matchName || matchCode || matchPos || matchReason;
    }
    return true;
  });

  const pendingRequests = teamBreaks.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Supervisor Scope Banner */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Supervisi Istirahat Tim ({currentUser?.department || 'Divisi'})
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SUPERVISOR SCOPE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola waktu istirahat stasiun kerja, otorisasi additional break & kontrol disiplin
              lantai resto
            </p>
          </div>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500"
          />
          <button
            onClick={loadTeamData}
            title="Segarkan"
            className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <BreakSummaryCard
        summary={summary}
        loading={loading}
        title={`Status Break Tim • ${selectedDate}`}
      />

      {/* PENDING APPROVAL PRIORITY DRAWER / PANEL */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#1E2438] to-[#1E2438] border-2 border-amber-500/50 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                Pengajuan Additional Break Menunggu Approval Anda ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-xs text-amber-400/80">Otorisasi Segera</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-[#111827] border border-amber-500/30 rounded-2xl space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-xs block">
                      {req.employee?.fullName} ({req.employee?.employeeCode})
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {req.employee?.department} • {req.employee?.primaryPosition} • {req.shiftName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {req.requestedDurationMinutes} Menit
                  </span>
                </div>

                <div className="p-2.5 bg-[#161B2E] border border-[#2D374E] rounded-xl text-xs text-gray-300 italic">
                  &ldquo;{req.reason}&rdquo;
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500">
                    Diajukan:{' '}
                    {new Date(req.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBreakForAction({ record: req, mode: 'REJECT' })}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => setSelectedBreakForAction({ record: req, mode: 'APPROVE' })}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Team Break Table */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama anggota tim, kode pegawai, atau posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Sedang Aktif</option>
              <option value="PENDING">Menunggu Approval</option>
              <option value="APPROVED">Disetujui</option>
              <option value="COMPLETED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Jenis Break</option>
              <option value="STANDARD">Standard Break (60m)</option>
              <option value="ADDITIONAL">Additional Break</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Memuat data break tim...</div>
        ) : filteredBreaks.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 space-y-2">
            <Coffee className="w-8 h-8 mx-auto text-gray-600" />
            <p>Tidak ada catatan break yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Karyawan</th>
                  <th className="py-3 px-3">Divisi & Shift</th>
                  <th className="py-3 px-3">Jenis Break</th>
                  <th className="py-3 px-3">Rencana / Aktual</th>
                  <th className="py-3 px-3 text-center">Durasi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Keterangan / Otorisasi</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/50 text-gray-200">
                {filteredBreaks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111827]/40 transition-colors">
                    {/* Employee */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs">
                          {item.employee?.fullName.charAt(0) || 'K'}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {item.employee?.fullName || 'Karyawan'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {item.employee?.employeeCode || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Shift */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-gray-300 font-medium">
                        {item.employee?.department || '-'}
                      </div>
                      <div className="text-[10px] text-purple-400">
                        {item.shiftName || 'Shift Reguler'}
                      </div>
                    </td>

                    {/* Break Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === 'STANDARD'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Actual / Planned Times */}
                    <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                      {item.actualStart ? (
                        <div className="flex items-center gap-1.5">
                          <span>{item.actualStart}</span>
                          <span className="text-gray-500">→</span>
                          <span className={item.status === 'ACTIVE' ? 'text-purple-400 font-bold' : ''}>
                            {item.actualEnd || 'Aktif...'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {item.plannedStart ? `${item.plannedStart} (Plan)` : '-'}
                        </span>
                      )}
                    </td>

                    {/* Duration & Overtime Alert */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.durationMinutes ? (
                        <span
                          className={`font-bold ${
                            item.isExcessive
                              ? 'text-rose-400 font-extrabold flex items-center justify-center gap-1'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.isExcessive && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          {item.durationMinutes}m
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {item.requestedDurationMinutes ? `${item.requestedDurationMinutes}m req` : '-'}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'ACTIVE'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                            : item.status === 'APPROVED'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : item.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Reason / Notes */}
                    <td className="py-3 px-3 text-gray-400 max-w-xs truncate">
                      {item.status === 'REJECTED' ? (
                        <span className="text-rose-400 italic">
                          Ditolak: {item.rejectionReason}
                        </span>
                      ) : item.approvedBy ? (
                        <span className="text-emerald-400">
                          Disetujui: {item.approvedBy}
                        </span>
                      ) : (
                        item.reason || '-'
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setSelectedBreakForAction({ record: item, mode: 'REJECT' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() =>
                              setSelectedBreakForAction({ record: item, mode: 'APPROVE' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic">Terkunci</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedBreakForAction && (
        <BreakApprovalModal
          isOpen={Boolean(selectedBreakForAction)}
          onClose={() => setSelectedBreakForAction(null)}
          onSuccess={() => {
            setSelectedBreakForAction(null);
            loadTeamData();
          }}
          breakRecord={selectedBreakForAction.record}
          currentUser={currentUser!}
          initialMode={selectedBreakForAction.mode}
        />
      )}
    </div>
  );
};
