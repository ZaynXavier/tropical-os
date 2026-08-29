import React, { useState } from 'react';
import { X, Send, Calendar, DollarSign, Clock, FileText, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { EmployeePersonnel } from '../../../types/employee';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeePersonnel | null;
  defaultType?: 'KASBON' | 'CUTI' | 'IZIN_SAKIT' | 'SPL' | 'TUKAR_SHIFT';
  onSubmitSuccess: (newReq: any) => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  employee,
  defaultType = 'KASBON',
  onSubmitSuccess,
}) => {
  const [requestType, setRequestType] = useState(defaultType);
  const [amount, setAmount] = useState('300000');
  const [installmentMonths, setInstallmentMonths] = useState('1');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-02');
  const [reason, setReason] = useState('');
  const [targetColleague, setTargetColleague] = useState('Ulum (Kitchen)');
  const [overtimeHours, setOvertimeHours] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newReq = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        type: requestType,
        employeeName: employee?.name || 'Staff Karyawan',
        department: employee?.department || 'Operasional',
        amount: requestType === 'KASBON' ? parseInt(amount) : undefined,
        reason: reason || 'Kebutuhan mendesak operasional / keluarga',
        dates: requestType === 'CUTI' || requestType === 'IZIN_SAKIT' ? `${startDate} s/d ${endDate}` : undefined,
        hours: requestType === 'SPL' ? `${overtimeHours} Jam` : undefined,
        colleague: requestType === 'TUKAR_SHIFT' ? targetColleague : undefined,
        status: 'MENUNGGU_SPV',
        submittedAt: 'Baru Saja',
      };
      onSubmitSuccess(newReq);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161C2C] border border-[#2D374E] rounded-[32px] overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D374E] flex items-center justify-between bg-[#111827]">
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">Buat Pengajuan Staff</h3>
            <p className="text-[10px] text-gray-400">Kasbon, Cuti, SPL Lembur &amp; Tukar Shift</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Request Type Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1.5">Jenis Pengajuan:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'KASBON', label: 'Kasbon / Pinjaman', icon: DollarSign, color: 'text-emerald-400' },
                { id: 'CUTI', label: 'Cuti Tahunan', icon: Calendar, color: 'text-blue-400' },
                { id: 'IZIN_SAKIT', label: 'Izin Sakit', icon: FileText, color: 'text-amber-400' },
                { id: 'SPL', label: 'Lembur (SPL)', icon: Clock, color: 'text-purple-400' },
                { id: 'TUKAR_SHIFT', label: 'Tukar Shift', icon: User, color: 'text-pink-400' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRequestType(t.id as any)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    requestType === t.id
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                      : 'bg-[#111827] border-[#2D374E] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                  <span className="text-[10px] truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields based on Type */}
          {requestType === 'KASBON' && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300 font-medium">Nominal Kasbon (Rp)</span>
                <span className="text-emerald-400 font-mono font-bold">Maks Rp 1.000.000</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 300000"
                className="w-full px-3 py-2 bg-[#161C2C] border border-[#2D374E] rounded-xl text-xs text-white font-mono focus:border-purple-500 outline-none"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                <span>Skema Potong Gaji:</span>
                <select
                  value={installmentMonths}
                  onChange={(e) => setInstallmentMonths(e.target.value)}
                  className="bg-[#161C2C] border border-[#2D374E] text-white rounded-lg px-2 py-1 text-[10px]"
                >
                  <option value="1">1x Potong Payroll Bulan Depan</option>
                  <option value="2">2x Cicilan (2 Bulan)</option>
                </select>
              </div>
            </div>
          )}

          {(requestType === 'CUTI' || requestType === 'IZIN_SAKIT') && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#161C2C] border border-[#2D374E] rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#161C2C] border border-[#2D374E] rounded-xl text-xs text-white"
                    required
                  />
                </div>
              </div>
              <div className="text-[10px] text-purple-300 flex items-center gap-1 pt-1">
                <AlertCircle className="w-3 h-3" /> Sisa Hak Cuti Anda Tahun 2026: <strong className="text-white">9 Hari</strong>
              </div>
            </div>
          )}

          {requestType === 'SPL' && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E]">
              <label className="text-[10px] text-gray-400 block">Durasi Jam Lembur (SPL)</label>
              <select
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#161C2C] border border-[#2D374E] rounded-xl text-xs text-white font-mono"
              >
                <option value="1">1 Jam (Event Gathering)</option>
                <option value="2">2 Jam (Weekend Rush Hour)</option>
                <option value="3">3 Jam (Deep Cleaning &amp; Closing Malam)</option>
                <option value="4">4 Jam (Overtime Event Spesial)</option>
              </select>
            </div>
          )}

          {requestType === 'TUKAR_SHIFT' && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#0F1420] border border-[#2D374E]">
              <label className="text-[10px] text-gray-400 block">Rekan Yang Diajak Tukar Shift:</label>
              <select
                value={targetColleague}
                onChange={(e) => setTargetColleague(e.target.value)}
                className="w-full px-3 py-2 bg-[#161C2C] border border-[#2D374E] rounded-xl text-xs text-white"
              >
                <option value="Ulum (Kitchen)">Ulum (Kitchen - Shift Pagi)</option>
                <option value="Tasnim (Kitchen)">Tasnim (Kitchen - Shift Middle)</option>
                <option value="Dina (Bar)">Dina (Bar - Shift Sore)</option>
                <option value="Azizah (Bar)">Azizah (Bar - Shift Pagi)</option>
                <option value="Maya Anggraini (Service)">Maya Anggraini (Service - Shift Pagi)</option>
                <option value="Naila (Kasir)">Naila (Kasir - Shift Closing)</option>
              </select>
            </div>
          )}

          {/* Reason / Alasan */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Alasan Pengajuan:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan kebutuhan pengajuan secara ringkas dan jelas..."
              rows={2}
              className="w-full px-3 py-2 bg-[#111827] border border-[#2D374E] rounded-xl text-xs text-white placeholder-gray-500 focus:border-purple-500 outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan ke SPV'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
