import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { breakService } from '../../services/breakService';
import { EmployeeBreakSummary, EnrichedBreakRecord } from '../../types/break';
import { AdditionalBreakRequestModal } from './AdditionalBreakRequestModal';
import {
  Coffee,
  Clock,
  Play,
  Square,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Calendar,
  Layers,
  History,
  Timer,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const MyBreakView: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<EmployeeBreakSummary | null>(null);
  const [breakRecords, setBreakRecords] = useState<EnrichedBreakRecord[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Live timer for active break
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Timer interval for active break
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (summary?.hasActiveBreak && summary.activeBreakRecord?.actualStart) {
      const updateElapsed = () => {
        const [h, m] = summary.activeBreakRecord!.actualStart!.split(':').map(Number);
        const now = new Date();
        const startTotalMin = h * 60 + m;
        const nowTotalMin = now.getHours() * 60 + now.getMinutes();
        let diff = nowTotalMin - startTotalMin;
        if (diff < 0) diff += 24 * 60;
        setElapsedMinutes(Math.max(0, diff));
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 10000); // every 10s
    } else {
      setElapsedMinutes(0);
    }
    return () => clearInterval(interval);
  }, [summary?.hasActiveBreak, summary?.activeBreakRecord]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [sum, records] = await Promise.all([
        breakService.getEmployeeBreakSummary(currentUser.id, todayStr),
        breakService.getBreaksByEmployee(currentUser.id),
      ]);
      setSummary(sum);
      setBreakRecords(records);
    } catch (err) {
      console.error('Error loading employee break data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStandardBreak = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      await breakService.createStandardBreakMock({
        employeeId: currentUser.id,
        date: todayStr,
        createdBy: currentUser.fullName,
      });
      setFeedbackMsg({
        type: 'success',
        text: 'Sesi Standard Break (60 menit) berhasil dimulai. Selamat beristirahat!',
      });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Gagal memulai Standard Break.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartApprovedBreak = async (breakId: string) => {
    if (!currentUser) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      await breakService.startBreakMock(breakId, undefined, currentUser.fullName);
      setFeedbackMsg({
        type: 'success',
        text: 'Sesi Additional Break telah aktif. Selamat beristirahat!',
      });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Gagal memulai Additional Break.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async (breakId: string) => {
    if (!currentUser) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      await breakService.endBreakMock(breakId, undefined, currentUser.fullName);
      setFeedbackMsg({
        type: 'success',
        text: 'Sesi istirahat telah selesai. Terima kasih telah kembali bertugas!',
      });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Gagal mengakhiri break.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPending = async (breakId: string) => {
    if (!currentUser) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      await breakService.cancelBreakRequestMock(
        breakId,
        'Dibatalkan sendiri oleh karyawan',
        currentUser.fullName
      );
      setFeedbackMsg({
        type: 'success',
        text: 'Pengajuan Additional Break berhasil dibatalkan.',
      });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Gagal membatalkan pengajuan.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!currentUser) return null;

  const todayRecords = breakRecords.filter((r) => r.date === todayStr);
  const pendingRequests = todayRecords.filter((r) => r.status === 'PENDING');
  const approvedRequests = todayRecords.filter((r) => r.status === 'APPROVED');
  const completedToday = todayRecords.filter((r) => r.status === 'COMPLETED');
  const standardToday = todayRecords.find((r) => r.type === 'STANDARD');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-gray-400 hover:text-white text-xs cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Interactive Break Card for Today */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-6">
        {/* Header Shift & Personnel Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D374E] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Portal Istirahat Saya</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  STAFF PORTAL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentUser.fullName} ({currentUser.employeeCode}) • {currentUser.department} •{' '}
                {currentUser.primaryPosition}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Additional Break</span>
            </button>
            <button
              onClick={loadData}
              title="Segarkan Data"
              className="p-2.5 rounded-2xl bg-[#111827] border border-[#2D374E] text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Shift Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Jadwal Shift Hari Ini
            </span>
            <div className="text-sm font-bold text-white">
              {summary?.shiftName || 'Memuat jadwal...'}
            </div>
            <div className="text-[11px] text-gray-500">
              {summary?.hasSchedule
                ? 'Terdaftar aktif di Daily Roster'
                : 'Tidak ada jadwal shift (OFF)'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Sisa Kuota Standard Break
            </span>
            <div className="text-sm font-bold text-emerald-400">
              {summary?.remainingStandardMinutes ?? 60} Menit
            </div>
            <div className="text-[11px] text-gray-500">Dari total 60 menit per shift</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-400" />
              Total Durasi Terpakai Hari Ini
            </span>
            <div className="text-sm font-bold text-blue-400">
              {summary?.totalDurationMinutes ?? 0} Menit
            </div>
            <div className="text-[11px] text-gray-500">
              {todayRecords.length} sesi istirahat tercatat
            </div>
          </div>
        </div>

        {/* ACTIVE BREAK STATUS HERO / CONTROLLER */}
        {summary?.hasActiveBreak && summary.activeBreakRecord ? (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#1E2438] to-purple-900/20 border-2 border-purple-500/50 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Sesi Istirahat Sedang Aktif
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                    {summary.activeBreakRecord.type} BREAK
                  </span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  Mulai Pukul {summary.activeBreakRecord.actualStart} WIB
                </div>
                <p className="text-xs text-gray-300">
                  {summary.activeBreakRecord.reason || 'Istirahat standar rotasi kerja'}
                </p>
              </div>

              {/* Live Elapsed Counter & End Button */}
              <div className="flex items-center gap-4 self-start sm:self-center">
                <div className="p-3 bg-[#111827]/80 border border-purple-500/40 rounded-2xl text-center min-w-[110px]">
                  <div className="text-[10px] text-purple-300 uppercase font-semibold">
                    Waktu Berjalan
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {elapsedMinutes} <span className="text-xs font-normal text-gray-400">m</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEndBreak(summary.activeBreakRecord!.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold shadow-xl shadow-emerald-600/40 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Selesai Break</span>
                </button>
              </div>
            </div>

            {/* Warning if nearing or exceeding limit */}
            {elapsedMinutes >
              (summary.activeBreakRecord.approvedDurationMinutes ??
                (summary.activeBreakRecord.type === 'STANDARD' ? 60 : 30)) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Durasi istirahat Anda telah melebihi batas yang ditentukan (
                  {summary.activeBreakRecord.approvedDurationMinutes ?? 60} menit). Segera selesaikan
                  istirahat dan kembali ke stasiun kerja.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* NO ACTIVE BREAK: Standard CTA / Start Controls */
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-400" />
                Standard Break Reguler (60 Menit)
              </h4>
              <p className="text-xs text-gray-400">
                Setiap shift memiliki alokasi 1 sesi Standard Break 60 menit tanpa memerlukan
                approval supervisor.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {standardToday?.status === 'COMPLETED' ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-800/80 border border-gray-700 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standard Break Sudah Selesai ({standardToday.durationMinutes}m)</span>
                </div>
              ) : (
                <button
                  onClick={handleStartStandardBreak}
                  disabled={actionLoading || !summary?.hasSchedule}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Standard Break (60m)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* READY TO START APPROVED ADDITIONAL BREAKS */}
        {approvedRequests.length > 0 && !summary?.hasActiveBreak && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Additional Break Disetujui — Siap Dimulai
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {approvedRequests.length} Pengajuan Disetujui
              </span>
            </div>

            <div className="space-y-2">
              {approvedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-[#111827] border border-[#2D374E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">
                      Durasi Disetujui: {req.approvedDurationMinutes ?? req.requestedDurationMinutes} Menit
                    </div>
                    <div className="text-gray-300 text-[11px]">
                      Alasan: &ldquo;{req.reason}&rdquo;
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      Disetujui oleh: {req.approvedBy || 'Supervisor'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartApprovedBreak(req.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start sm:self-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Sekarang</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENDING ADDITIONAL BREAK REQUESTS */}
        {pendingRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                Pengajuan Additional Break Menunggu Persetujuan
              </span>
              <span className="text-[11px] text-amber-300/80">Status: PENDING</span>
            </div>

            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-[#111827] border border-[#2D374E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">
                      Durasi Diminta: {req.requestedDurationMinutes} Menit
                    </div>
                    <div className="text-gray-300 text-[11px]">
                      Alasan: &ldquo;{req.reason}&rdquo;
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      Diajukan pada: {new Date(req.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelPending(req.id)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-rose-900/40 text-gray-300 hover:text-rose-300 border border-gray-700 text-xs font-semibold transition-all cursor-pointer self-start sm:self-center"
                  >
                    Batalkan Pengajuan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Break History Log (Self Only) */}
      <div className="bg-[#1E2438] border border-[#2D374E] p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Riwayat Istirahat Saya</h3>
          </div>
          <span className="text-xs text-gray-400">{breakRecords.length} Catatan</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Memuat riwayat break...</div>
        ) : breakRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            Belum ada riwayat istirahat tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Waktu Mulai - Selesai</th>
                  <th className="py-3 px-3 text-center">Durasi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Keterangan / Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/50 text-gray-200">
                {breakRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-gray-300 whitespace-nowrap">
                      {item.date}
                    </td>
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
                    <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                      {item.actualStart ? `${item.actualStart} - ${item.actualEnd || 'Aktif'}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold whitespace-nowrap">
                      {item.durationMinutes ? (
                        <span
                          className={
                            item.isExcessive
                              ? 'text-rose-400 font-extrabold'
                              : 'text-emerald-400'
                          }
                        >
                          {item.durationMinutes}m
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {item.requestedDurationMinutes ? `${item.requestedDurationMinutes}m req` : '-'}
                        </span>
                      )}
                    </td>
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
                    <td className="py-3 px-3 text-gray-400 max-w-xs truncate">
                      {item.status === 'REJECTED' ? (
                        <span className="text-rose-400 italic">
                          Ditolak: {item.rejectionReason}
                        </span>
                      ) : item.approvedBy ? (
                        <span className="text-emerald-400">
                          Disetujui oleh {item.approvedBy}
                        </span>
                      ) : (
                        item.reason || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Break Request Modal */}
      <AdditionalBreakRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          setFeedbackMsg({
            type: 'success',
            text: 'Pengajuan Additional Break berhasil dikirim dan menunggu persetujuan Supervisor.',
          });
          loadData();
        }}
        currentUser={currentUser}
        initialDate={todayStr}
      />
    </div>
  );
};
