import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  EnrichedOvertimeRecord,
  OvertimeSummary,
  OvertimeFilterParams,
} from '../../../types/overtime';
import { overtimeService } from '../../../services/overtimeService';
import { OvertimeSummaryCard } from './OvertimeSummaryCard';
import { ApplyOvertimeModal } from './ApplyOvertimeModal';
import { OvertimeApprovalModal } from './OvertimeApprovalModal';
import { OvertimeDetailModal } from './OvertimeDetailModal';
import { OvertimeCostSimulatorModal } from './OvertimeCostSimulatorModal';
import {
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity,
  Calculator,
  Users,
  Building,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const AllOvertimeManagementView: React.FC = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.accessLevel === 'MANAGER' || (currentUser as any)?.role === 'MANAGER';

  const [records, setRecords] = useState<EnrichedOvertimeRecord[]>([]);
  const [summary, setSummary] = useState<OvertimeSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [compensationFilter, setCompensationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<{
    record: EnrichedOvertimeRecord;
    mode: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<EnrichedOvertimeRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const filterParams: OvertimeFilterParams = {
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        type: typeFilter !== 'ALL' ? (typeFilter as any) : undefined,
        compensationType: compensationFilter !== 'ALL' ? (compensationFilter as any) : undefined,
        date: dateFilter || undefined,
        searchQuery: searchQuery.trim() || undefined,
      };

      const [list, sum] = await Promise.all([
        overtimeService.getOvertimeRecords(filterParams),
        overtimeService.getOvertimeSummary({
          department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
          date: dateFilter || undefined,
        }),
      ]);

      setRecords(list);
      setSummary(sum);
    } catch (err) {
      console.error('Error loading overtime management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, statusFilter, typeFilter, compensationFilter, dateFilter, searchQuery]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const csvContent = overtimeService.exportOvertimeToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Lembur_TropicalOS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset seluruh data lembur ke mock data standar awal?')) {
      await overtimeService.resetToDefaults();
      await loadData();
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Setujui ${selectedIds.length} pengajuan lembur sekaligus?`)) {
      setLoading(true);
      try {
        for (const id of selectedIds) {
          const rec = records.find((r) => r.id === id);
          if (rec && rec.status === 'PENDING') {
            await overtimeService.approveOvertimeRequest({
              overtimeId: id,
              approvedHours: rec.plannedHours,
              approverName: currentUser?.name || 'Manager',
              approverRole: 'MANAGER',
              approvalNotes: 'Persetujuan massal oleh Manager Operasional',
            });
          }
        }
        setSelectedIds([]);
        await loadData();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRecordUpdated = (updated: EnrichedOvertimeRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedDetail?.id === updated.id) {
      setSelectedDetail(updated);
    }
    loadData();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pendingIds = records.filter((r) => r.status === 'PENDING').map((r) => r.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manajemen Lembur & SPL (Overtime Master)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Manager Control Center
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Pengawasan Surat Perintah Lembur, otorisasi anggaran payroll lembur, deteksi excess overtime, dan ekspor payroll
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-2 bg-[#111622] hover:bg-[#252D42] text-purple-300 hover:text-white rounded-xl border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-purple-400" />
            <span>Simulator Biaya</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#111622] hover:bg-[#252D42] text-gray-300 hover:text-white rounded-xl border border-[#2D374E] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="p-2 bg-[#111622] hover:bg-[#252D42] text-gray-400 hover:text-gray-200 rounded-xl border border-[#2D374E] transition-colors cursor-pointer"
            title="Reset ke Default Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat SPL Lembur</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <OvertimeSummaryCard summary={summary} loading={loading} />

      {/* Filters & Search Toolbar */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari karyawan / alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#111622] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bar">Bar</option>
              <option value="Service">Service</option>
              <option value="Management">Management</option>
              <option value="Purchasing">Purchasing</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Approval</option>
              <option value="APPROVED">Disetujui</option>
              <option value="ACTIVE">Sedang Aktif</option>
              <option value="COMPLETED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Tipe Lembur</option>
              <option value="POST_SHIFT">Post-Shift (Setelah Shift)</option>
              <option value="PRE_SHIFT">Pre-Shift (Sebelum Shift)</option>
              <option value="OFF_DAY">Off-Day (Hari Libur / 2.0x)</option>
              <option value="SPECIAL_EVENT">Special Event (2.0x)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#111622] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Bulk Action Bar if pending selected */}
        {selectedIds.length > 0 && isManager && (
          <div className="flex items-center justify-between p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs animate-fade-in">
            <span className="text-purple-300 font-semibold">
              {selectedIds.length} pengajuan lembur terpilih untuk tindakan massal
            </span>
            <button
              onClick={handleBulkApprove}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Setujui Semua Terpilih (Manager)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-5 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2D374E] text-gray-400">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === records.filter((r) => r.status === 'PENDING').length
                    }
                    className="accent-purple-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Karyawan & Posisi</th>
                <th className="py-3 px-3">Tanggal & Tipe</th>
                <th className="py-3 px-3">Waktu & Jam Kerja</th>
                <th className="py-3 px-3">Biaya Payroll</th>
                <th className="py-3 px-3">Alasan Lembur</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D374E]/60 text-gray-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    Tidak ada data lembur yang cocok dengan parameter filter.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isPending = r.status === 'PENDING';
                  return (
                    <tr key={r.id} className="hover:bg-[#111622]/50 transition-colors">
                      <td className="py-3 px-3">
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.id)}
                            onChange={() => handleToggleSelect(r.id)}
                            className="accent-purple-500 cursor-pointer"
                          />
                        ) : (
                          <span className="text-gray-600">•</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {r.employee?.fullName}
                          {r.isExcessive && (
                            <span
                              className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold border border-rose-500/30"
                              title="Jam aktual melebihi jam disetujui"
                            >
                              EXCESS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {r.employee?.employeeCode} • {r.employee?.department} ({r.employee?.primaryPosition})
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{r.date}</div>
                        <div className="text-[10px] text-purple-400 font-medium">{r.type}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-white">
                          {r.plannedStart} - {r.plannedEnd} ({r.plannedHours}h)
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          <span>Disetujui: <strong className="text-purple-300">{r.approvedHours !== undefined ? `${r.approvedHours}h` : '-'}</strong></span>
                          {r.actualHours ? <span className="text-emerald-400">({r.actualHours}h akt)</span> : null}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-emerald-400">
                          {formatRupiah(r.finalCost || r.estimatedCost)}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {r.compensationType === 'PAYROLL' ? `${r.rateMultiplier}x Payroll` : 'Cuti Pengganti'}
                        </div>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && isManager && (
                            <>
                              <button
                                onClick={() => setActionModal({ record: r, mode: 'APPROVE' })}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Setujui Lembur (Manager)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setActionModal({ record: r, mode: 'REJECT' })}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                                title="Tolak Lembur (Manager)"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedDetail(r)}
                            className="px-2.5 py-1 bg-[#111622] hover:bg-[#252D42] text-gray-300 hover:text-white rounded-lg border border-[#2D374E] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          loadData();
        }}
      />

      <OvertimeCostSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <OvertimeApprovalModal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        onSuccess={handleRecordUpdated}
        record={actionModal?.record || null}
        mode={actionModal?.mode || 'APPROVE'}
        currentUserName={currentUser?.name || 'Manager'}
        currentUserRole="MANAGER"
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
