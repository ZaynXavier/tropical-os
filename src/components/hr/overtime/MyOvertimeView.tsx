import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { EnrichedOvertimeRecord } from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import { ApplyOvertimeModal } from './ApplyOvertimeModal';
import { OvertimeDetailModal } from './OvertimeDetailModal';
import {
  Clock,
  Plus,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const MyOvertimeView: React.FC = () => {
  const { currentUser } = useAuth();
  const employeeId = currentUser?.id || 'emp-04';

  const [records, setRecords] = useState<EnrichedOvertimeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<EnrichedOvertimeRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await overtimeService.getMyOvertimeRecords(employeeId);
      setRecords(data);
    } catch (err) {
      console.error('Error loading my overtime records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const activeOvertime = records.find((r) => r.status === 'ACTIVE');
  const pendingCount = records.filter((r) => r.status === 'PENDING').length;
  const approvedUpcoming = records.find((r) => r.status === 'APPROVED');
  const totalApprovedHours = records
    .filter((r) => r.status === 'COMPLETED' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + (r.approvedHours || r.plannedHours || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRecordUpdated = (updated: EnrichedOvertimeRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedRecord?.id === updated.id) {
      setSelectedRecord(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Portal Lembur Mandiri (My Overtime)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Pengajuan Surat Perintah Lembur, pelacakan jam lembur disetujui, dan estimasi penerimaan payroll
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
            <span>Ajukan Lembur Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total Jam Lembur Disetujui</span>
            <div className="text-2xl font-bold text-white mt-1">
              {totalApprovedHours.toFixed(1)} <span className="text-xs font-normal text-gray-400">Jam</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">Bulan Berjalan</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Menunggu Persetujuan</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Dalam review SPV/Manager</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Status Sesi Hari Ini</span>
            <div className="text-sm font-bold text-white mt-1">
              {activeOvertime ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sedang Berjalan ({activeOvertime.actualStart})
                </span>
              ) : approvedUpcoming ? (
                <span className="text-blue-400">Disetujui ({approvedUpcoming.plannedStart})</span>
              ) : (
                <span className="text-gray-400">Tidak Ada Lembur Aktif</span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Pantau ketertiban jam kerja</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Overtime Live Widget Card if exists */}
      {activeOvertime && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LEMBUR SEDANG AKTIF
                </span>
                <span className="text-xs font-mono text-gray-400">#{activeOvertime.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{activeOvertime.reason}</h3>
              <p className="text-xs text-gray-300">
                Dimulai pukul <strong className="text-white">{activeOvertime.actualStart}</strong> • Target Selesai:{' '}
                <strong className="text-white">{activeOvertime.plannedEnd}</strong> ({activeOvertime.plannedHours} Jam Disetujui)
              </p>
            </div>

            <button
              onClick={() => setSelectedRecord(activeOvertime)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
            >
              <Square className="w-4 h-4" />
              <span>Selesaikan Sesi Lembur</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & History Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-white">Riwayat Pengajuan Lembur Saya</h2>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#111622] p-1 rounded-xl border border-[#2D374E] text-xs">
            {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
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
                <th className="py-3 px-3">Tanggal & Tipe</th>
                <th className="py-3 px-3">Waktu Rencana</th>
                <th className="py-3 px-3">Durasi Disetujui</th>
                <th className="py-3 px-3">Kompensasi</th>
                <th className="py-3 px-3">Alasan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Tidak ada catatan lembur sesuai filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#111622]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{r.date}</div>
                      <div className="text-[10px] text-purple-400 font-medium">{r.type}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-white">
                        {r.plannedStart} - {r.plannedEnd}
                      </div>
                      <div className="text-[10px] text-gray-400">{r.plannedHours} Jam Rencana</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-purple-300">
                        {r.approvedHours !== undefined ? `${r.approvedHours} Jam` : '-'}
                      </div>
                      {r.actualHours ? (
                        <div className="text-[10px] text-gray-400">{r.actualHours}h aktual</div>
                      ) : null}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] text-gray-300">
                        {r.compensationType === 'PAYROLL' ? 'Uang Lembur' : 'Cuti Pengganti'}
                      </span>
                      {r.finalCost ? (
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {formatRupiah(r.finalCost)}
                        </div>
                      ) : null}
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                        onClick={() => setSelectedRecord(r)}
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
        defaultEmployeeId={employeeId}
        isStaffMode={true}
      />

      <OvertimeDetailModal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onRecordUpdated={handleRecordUpdated}
      />
    </div>
  );
};
