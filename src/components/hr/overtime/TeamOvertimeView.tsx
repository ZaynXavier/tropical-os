import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { EnrichedOvertimeRecord, OvertimeSummary } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import { ApplyOvertimeModal } from './ApplyOvertimeModal';
import { OvertimeApprovalModal } from './OvertimeApprovalModal';
import { OvertimeDetailModal } from './OvertimeDetailModal';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Play,
  Square,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Activity,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const TeamOvertimeView: React.FC = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.accessLevel === 'MANAGER' || (currentUser as any)?.role === 'MANAGER';
  const department = currentUser?.department || 'Kitchen';

  const [records, setRecords] = useState<EnrichedOvertimeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<{
    record: EnrichedOvertimeRecord;
    mode: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<EnrichedOvertimeRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await overtimeService.getTeamOvertimeRecords(department);
      setRecords(data);
    } catch (err) {
      console.error('Error loading team overtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [department, selectedDate]);

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.employee?.fullName.toLowerCase().includes(q);
      const matchCode = r.employee?.employeeCode.toLowerCase().includes(q);
      const matchReason = r.reason.toLowerCase().includes(q);
      return matchName || matchCode || matchReason;
    }
    return true;
  });

  const pendingRequests = records.filter((r) => r.status === 'PENDING');
  const activeFloorOvertimes = records.filter((r) => r.status === 'ACTIVE');
  const totalApprovedHours = records
    .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'ACTIVE')
    .reduce((sum, r) => sum + (r.approvedHours || r.plannedHours || 0), 0);

  const handleRecordUpdated = (updated: EnrichedOvertimeRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedDetail?.id === updated.id) {
      setSelectedDetail(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manajemen Lembur Tim ({department})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Supervisor Floor
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Pemberian izin lembur, pengawasan waktu aktual staf, dan verifikasi Surat Perintah Lembur divisi {department}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 bg-[#111622] hover:bg-[#252D42] text-gray-300 rounded-xl border border-[#2D374E] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat SPL Tim</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Card */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Menunggu Verifikasi SPV</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{pendingRequests.length}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Perlu tindakan cepat</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Active Now Card */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Lembur Sedang Aktif di Resto</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{activeFloorOvertimes.length}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Staf bertugas di shift ini</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 relative">
            <Activity className="w-5 h-5" />
            {activeFloorOvertimes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total Jam Lembur Disetujui</span>
            <div className="text-2xl font-bold text-white mt-1">
              {totalApprovedHours.toFixed(1)} <span className="text-xs font-normal text-gray-400">Jam</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">Divisi {department}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Queue (Manager Only) */}
      {isManager && pendingRequests.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white">
                Antrean Persetujuan Lembur ({pendingRequests.length} Pengajuan)
              </h2>
            </div>
            <span className="text-xs text-amber-300 font-medium">Memerlukan Konfirmasi Otoritas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#181E2E] rounded-xl border border-[#2D374E] p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                        {req.employee?.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{req.employee?.fullName}</div>
                        <div className="text-[10px] text-gray-400">
                          {req.employee?.primaryPosition} • {req.type}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {req.plannedHours} Jam
                    </span>
                  </div>

                  <div className="mt-2.5 text-xs text-gray-300 italic bg-[#111622] p-2 rounded-lg border border-[#2D374E]/50">
                    "{req.reason}"
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Jadwal: <strong className="text-white">{req.date}</strong> ({req.plannedStart} - {req.plannedEnd})
                    </span>
                    <span>{req.compensationType === 'PAYROLL' ? 'Lembur Berbayar' : 'Cuti Pengganti'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2D374E]">
                  <button
                    onClick={() => setActionModal({ record: req, mode: 'REJECT' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => setActionModal({ record: req, mode: 'APPROVE' })}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Team Overtime Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama staf atau alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#111622] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111622] text-gray-400 hover:text-gray-200 border border-[#2D374E]'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'PENDING'
                  ? 'Menunggu'
                  : st === 'APPROVED'
                  ? 'Disetujui'
                  : st === 'ACTIVE'
                  ? 'Aktif'
                  : st === 'COMPLETED'
                  ? 'Selesai'
                  : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400">
                <th className="py-3 px-3">Karyawan</th>
                <th className="py-3 px-3">Tanggal & Tipe</th>
                <th className="py-3 px-3">Waktu Lembur</th>
                <th className="py-3 px-3">Durasi</th>
                <th className="py-3 px-3">Alasan & Tugas</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Tidak ada data lembur untuk kriteria yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#111622]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{r.employee?.fullName}</div>
                      <div className="text-[10px] text-gray-400">
                        {r.employee?.employeeCode} • {r.employee?.primaryPosition}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{r.date}</div>
                      <div className="text-[10px] text-purple-400">{r.type}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-white">
                        {r.plannedStart} - {r.plannedEnd}
                      </div>
                      {r.actualStart && (
                        <div className="text-[10px] text-emerald-400">
                          Aktual: {r.actualStart} - {r.actualEnd || 'Aktif'}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        {r.approvedHours !== undefined ? `${r.approvedHours}h Disetujui` : `${r.plannedHours}h Rencana`}
                      </div>
                      {r.excessHours !== undefined && r.excessHours > 0 && (
                        <div className="text-[10px] text-rose-400 font-semibold">
                          +{r.excessHours}h Excess
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>

                    <td className="py-3 px-3">
                      {r.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Menunggu
                        </span>
                      )}
                      {r.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Disetujui
                        </span>
                      )}
                      {r.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Aktif
                        </span>
                      )}
                      {r.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Selesai
                        </span>
                      )}
                      {r.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Ditolak
                        </span>
                      )}
                      {r.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          Batal
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedDetail(r)}
                        className="px-2.5 py-1 bg-[#111622] hover:bg-[#252D42] text-gray-300 hover:text-white rounded-lg border border-[#2D374E] text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ApplyOvertimeModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={(newRecord) => {
          setRecords((prev) => [newRecord, ...prev]);
        }}
      />

      <OvertimeApprovalModal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        onSuccess={handleRecordUpdated}
        record={actionModal?.record || null}
        mode={actionModal?.mode || 'APPROVE'}
        currentUserName={currentUser?.name || 'Supervisor'}
        currentUserRole="SUPERVISOR"
      />

      <OvertimeDetailModal
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        record={selectedDetail}
        onRecordUpdated={handleRecordUpdated}
        canManage={true}
      />
    </div>
  );
};
