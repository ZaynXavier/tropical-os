import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { breakService } from '../../services/breakService';
import { EnrichedBreakRecord, BreakFilterParams } from '../../types/break';
import {
  History,
  Calendar,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  X,
  FileText,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface BreakHistoryViewProps {
  initialDepartment?: string;
}

export const BreakHistoryView: React.FC<BreakHistoryViewProps> = ({ initialDepartment }) => {
  const { currentUser } = useAuth();
  const [breaks, setBreaks] = useState<EnrichedBreakRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>(initialDepartment || 'ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audit modal
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<EnrichedBreakRecord | null>(null);

  useEffect(() => {
    loadHistory();
  }, [currentUser, startDate, endDate, departmentFilter, typeFilter, statusFilter]);

  const loadHistory = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const filter: BreakFilterParams = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        type: typeFilter !== 'ALL' ? (typeFilter as any) : undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        searchQuery: searchQuery.trim() || undefined,
      };

      // RBAC Scope
      if (currentUser.accessLevel === 'STAFF') {
        filter.employeeId = currentUser.id;
      } else if (
        currentUser.accessLevel === 'SUPERVISOR' &&
        currentUser.department !== 'Operations'
      ) {
        filter.department = currentUser.department;
      }

      const list = await breakService.getBreaks(filter);
      setBreaks(list);
    } catch (err) {
      console.error('Error loading break history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (breaks.length === 0) return;

    const headers = [
      'ID',
      'Tanggal',
      'Kode Pegawai',
      'Nama Karyawan',
      'Departemen',
      'Posisi',
      'Shift',
      'Jenis Break',
      'Status',
      'Mulai Aktual',
      'Selesai Aktual',
      'Durasi (Menit)',
      'Overtime/Excessive',
      'Alasan',
      'Disetujui Oleh',
      'Alasan Ditolak',
      'Waktu Dibuat',
    ];

    const rows = breaks.map((b) => [
      b.id,
      b.date,
      b.employee?.employeeCode || '',
      `"${b.employee?.fullName || ''}"`,
      b.employee?.department || '',
      b.employee?.primaryPosition || '',
      b.shiftName || '',
      b.type,
      b.status,
      b.actualStart || '',
      b.actualEnd || '',
      b.durationMinutes ?? b.requestedDurationMinutes ?? '',
      b.isExcessive ? 'YA' : 'TIDAK',
      `"${(b.reason || '').replace(/"/g, '""')}"`,
      `"${(b.approvedBy || '').replace(/"/g, '""')}"`,
      `"${(b.rejectionReason || '').replace(/"/g, '""')}"`,
      b.createdAt || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TropicalOS_Break_History_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDepartmentFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Riwayat & Audit Log Istirahat Karyawan
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Arsip histori sesi istirahat reguler, permohonan additional break, dan jejak audit
              otorisasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={handleExportCSV}
            disabled={breaks.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] hover:border-purple-500 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={loadHistory}
            title="Segarkan"
            className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-5 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama karyawan, kode, alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadHistory()}
              className="w-full pl-9 pr-4 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              placeholder="Dari Tanggal"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              placeholder="Sampai Tanggal"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          </div>

          {/* Department Filter (if not locked to staff/single sup) */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={currentUser?.accessLevel === 'STAFF'}
              className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bar">Bar</option>
              <option value="Service">Service</option>
              <option value="Cleaning">Cleaning & Dishwash</option>
              <option value="CRM">CRM</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing / Content</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2D374E]/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 flex items-center gap-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              Filter Cepat:
            </span>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="STANDARD">Standard Break (60m)</option>
              <option value="ADDITIONAL">Additional Break</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-gray-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-xl text-xs transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          </div>

          <div className="text-gray-400 text-xs">
            Ditemukan <strong className="text-white">{breaks.length}</strong> catatan histori
          </div>
        </div>
      </div>

      {/* Main History Table */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Memuat riwayat break...</div>
        ) : breaks.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-gray-600" />
            <p>Tidak ada catatan histori break yang sesuai dengan filter pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Karyawan</th>
                  <th className="py-3 px-3">Departemen & Shift</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Waktu Aktual</th>
                  <th className="py-3 px-3 text-center">Durasi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Otorisasi / Alasan</th>
                  <th className="py-3 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/50 text-gray-200">
                {breaks.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedAuditRecord(item)}
                    className="hover:bg-[#111827]/50 cursor-pointer transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 font-mono font-medium text-gray-300 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Employee */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white">
                        {item.employee?.fullName || 'Karyawan'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item.employee?.employeeCode || '-'}
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

                    {/* Type */}
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

                    {/* Time */}
                    <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                      {item.actualStart ? (
                        <span>
                          {item.actualStart} - {item.actualEnd || 'Aktif'}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {item.plannedStart ? `${item.plannedStart} (Plan)` : '-'}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
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

                    {/* Status */}
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

                    {/* Audit CTA */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2">
                        Detail & Audit
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E2438] border border-[#2D374E] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#2D374E] bg-[#161B2E]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Audit Trail & Log Istirahat
                  </h3>
                  <p className="text-xs text-gray-400">ID: {selectedAuditRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111827] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar text-xs">
              {/* Personnel */}
              <div className="p-3.5 bg-[#111827] border border-[#2D374E] rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Informasi Karyawan
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-500">Nama:</span>{' '}
                    <span className="font-bold text-white">
                      {selectedAuditRecord.employee?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kode Pegawai:</span>{' '}
                    <span className="font-mono text-purple-300">
                      {selectedAuditRecord.employee?.employeeCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Departemen:</span>{' '}
                    <span>{selectedAuditRecord.employee?.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Posisi:</span>{' '}
                    <span>{selectedAuditRecord.employee?.primaryPosition}</span>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="p-3.5 bg-[#111827] border border-[#2D374E] rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Detail Sesi Istirahat
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-500">Tanggal:</span>{' '}
                    <span className="font-medium text-white">{selectedAuditRecord.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Jenis:</span>{' '}
                    <span className="font-bold text-purple-300">{selectedAuditRecord.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className="font-bold text-emerald-400">
                      {selectedAuditRecord.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Durasi Aktual:</span>{' '}
                    <span className="font-bold text-white">
                      {selectedAuditRecord.durationMinutes ?? 0} Menit
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mulai - Selesai:</span>{' '}
                    <span className="font-mono text-gray-200">
                      {selectedAuditRecord.actualStart || '-'} s/d{' '}
                      {selectedAuditRecord.actualEnd || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status Kedisiplinan:</span>{' '}
                    <span
                      className={`font-semibold ${
                        selectedAuditRecord.isExcessive
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedAuditRecord.isExcessive ? 'Overtime / Melebihi Batas' : 'Tertib Sesuai Aturan'}
                    </span>
                  </div>
                </div>

                {selectedAuditRecord.reason && (
                  <div className="pt-2 border-t border-[#2D374E]">
                    <span className="text-gray-500 block mb-1">Alasan Pengajuan:</span>
                    <div className="p-2 bg-[#161B2E] border border-[#2D374E] rounded-xl text-gray-200 italic">
                      &ldquo;{selectedAuditRecord.reason}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              {/* Immutable Audit Logs */}
              <div className="p-3.5 bg-[#111827] border border-[#2D374E] rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Jejak Audit & Otorisasi Sistem</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div>
                    <span className="text-gray-500">Dibuat Oleh:</span>{' '}
                    <span className="font-medium text-gray-200">
                      {selectedAuditRecord.createdBy || selectedAuditRecord.requestedBy || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Waktu Dibuat:</span>{' '}
                    <span className="text-gray-300">
                      {selectedAuditRecord.createdAt
                        ? new Date(selectedAuditRecord.createdAt).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>

                  {selectedAuditRecord.approvedBy && (
                    <>
                      <div>
                        <span className="text-gray-500">Disetujui Oleh:</span>{' '}
                        <span className="font-semibold text-emerald-400">
                          {selectedAuditRecord.approvedBy}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Waktu Disetujui:</span>{' '}
                        <span className="text-gray-300">
                          {selectedAuditRecord.approvedAt
                            ? new Date(selectedAuditRecord.approvedAt).toLocaleString('id-ID')
                            : '-'}
                        </span>
                      </div>
                    </>
                  )}

                  {selectedAuditRecord.rejectedBy && (
                    <>
                      <div className="col-span-2 pt-1 border-t border-rose-500/20 text-rose-300 space-y-1">
                        <div>
                          <span className="text-rose-400 font-semibold">Ditolak Oleh:</span>{' '}
                          {selectedAuditRecord.rejectedBy} (
                          {selectedAuditRecord.rejectedAt
                            ? new Date(selectedAuditRecord.rejectedAt).toLocaleString('id-ID')
                            : '-'}
                          )
                        </div>
                        <div>
                          <span className="text-rose-400 font-semibold">Alasan Penolakan:</span>{' '}
                          <span className="italic text-gray-200">
                            &ldquo;{selectedAuditRecord.rejectionReason}&rdquo;
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedAuditRecord.cancelledBy && (
                    <div className="col-span-2 pt-1 border-t border-gray-700 text-gray-400 space-y-1">
                      <div>
                        <span className="text-gray-500 font-semibold">Dibatalkan Oleh:</span>{' '}
                        {selectedAuditRecord.cancelledBy} (
                        {selectedAuditRecord.cancelledAt
                          ? new Date(selectedAuditRecord.cancelledAt).toLocaleString('id-ID')
                          : '-'}
                        )
                      </div>
                      <div>
                        <span className="text-gray-500">Alasan Pembatalan:</span>{' '}
                        {selectedAuditRecord.cancellationReason || '-'}
                      </div>
                    </div>
                  )}

                  {selectedAuditRecord.updatedBy && (
                    <div>
                      <span className="text-gray-500">Terakhir Diperbarui:</span>{' '}
                      <span>{selectedAuditRecord.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#2D374E] bg-[#161B2E] flex justify-end">
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Tutup Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
