import React from 'react';
import { FileText, Plus, DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface StaffRequestsTabProps {
  currentUser: EmployeePersonnel | null;
  requests: any[];
  onOpenNewRequest: (type?: 'KASBON' | 'CUTI' | 'SPL' | 'TUKAR_SHIFT') => void;
}

export const StaffRequestsTab: React.FC<StaffRequestsTabProps> = ({
  currentUser,
  requests,
  onOpenNewRequest,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Quick Action */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C2337] to-[#121724] border border-[#2D374E] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Pusat Pengajuan Staff</h2>
              <p className="text-[10px] text-gray-400">Kasbon, Cuti, SPL Lembur &amp; Izin</p>
            </div>
          </div>
          <button
            onClick={() => onOpenNewRequest('KASBON')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Pengajuan</span>
          </button>
        </div>

        {/* Quick Balance Cards */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-3 rounded-2xl bg-[#0B0F19] border border-[#2D374E] space-y-1">
            <span className="text-[10px] text-gray-400 block">Sisa Kuota Cuti 2026</span>
            <div className="text-base font-bold text-white font-mono">9 Hari</div>
            <span className="text-[9px] text-emerald-400">Dari total 12 hari/tahun</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0F19] border border-[#2D374E] space-y-1">
            <span className="text-[10px] text-gray-400 block">Limit Kasbon Aktif</span>
            <div className="text-base font-bold text-white font-mono">Rp 1.000.000</div>
            <span className="text-[9px] text-purple-300">Potong gaji payroll</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white">Riwayat Pengajuan Terkini</h3>
          <span className="text-[10px] text-gray-400">{requests.length} Pengajuan</span>
        </div>

        <div className="space-y-2.5">
          {requests.map((req) => {
            const isApproved = req.status === 'DISETUJUI' || req.status === 'APPROVED';
            return (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-[#161C2C] border border-[#2D374E] space-y-2.5 shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        req.type === 'KASBON'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : req.type === 'CUTI'
                          ? 'bg-blue-500/20 text-blue-400'
                          : req.type === 'SPL'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-pink-500/20 text-pink-400'
                      }`}
                    >
                      {req.type === 'KASBON' && <DollarSign className="w-3.5 h-3.5" />}
                      {req.type === 'CUTI' && <Calendar className="w-3.5 h-3.5" />}
                      {req.type === 'SPL' && <Clock className="w-3.5 h-3.5" />}
                      {req.type === 'TUKAR_SHIFT' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {req.type === 'KASBON' && `Kasbon Rp ${req.amount?.toLocaleString('id-ID')}`}
                        {req.type === 'CUTI' && `Cuti Tahunan (${req.dates})`}
                        {req.type === 'IZIN_SAKIT' && `Izin Sakit (${req.dates})`}
                        {req.type === 'SPL' && `Lembur SPL (${req.hours})`}
                        {req.type === 'TUKAR_SHIFT' && `Tukar Shift dg ${req.colleague}`}
                      </div>
                      <div className="text-[10px] text-gray-400">{req.submittedAt}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isApproved ? '✓ Disetujui' : '⏳ Menunggu SPV'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 italic bg-[#0F1420] p-2 rounded-xl border border-[#2D374E]/60">
                  "{req.reason}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
