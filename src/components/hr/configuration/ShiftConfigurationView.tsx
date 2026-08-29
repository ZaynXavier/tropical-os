import React, { useState } from 'react';
import { ShiftConfiguration } from '../../../types/hrConfiguration';
import { Clock, Plus, Edit2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface Props {
  shifts: ShiftConfiguration[];
  onUpdateShift: (id: string, data: Partial<ShiftConfiguration>) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onCreateShift: (data: Omit<ShiftConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'scheduledDurationMinutes'>) => Promise<void>;
  canEdit: boolean;
}

export const ShiftConfigurationView: React.FC<Props> = ({
  shifts,
  onUpdateShift,
  onToggleStatus,
  onCreateShift,
  canEdit,
}) => {
  const [editingShift, setEditingShift] = useState<ShiftConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startTime: '09:00',
    endTime: '19:00',
    gracePeriodMinutes: 10,
    description: '',
    status: 'ACTIVE' as const,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setFormData({
      code: `SP-0${shifts.length + 1}`,
      name: '',
      startTime: '09:00',
      endTime: '19:00',
      gracePeriodMinutes: 10,
      description: '',
      status: 'ACTIVE',
    });
    setErrorMessage(null);
    setIsCreating(true);
  };

  const openEditModal = (shift: ShiftConfiguration) => {
    setEditingShift(shift);
    setFormData({
      code: shift.code,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      description: shift.description || '',
      status: shift.status,
    });
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (editingShift) {
        await onUpdateShift(editingShift.id, {
          code: formData.code,
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          gracePeriodMinutes: Number(formData.gracePeriodMinutes),
          description: formData.description,
          status: formData.status,
        });
        setEditingShift(null);
      } else if (isCreating) {
        await onCreateShift({
          code: formData.code,
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          gracePeriodMinutes: Number(formData.gracePeriodMinutes),
          description: formData.description,
          status: formData.status,
          createdBy: 'Heri Setiawan (Manager)',
          updatedBy: 'Heri Setiawan (Manager)',
        });
        setIsCreating(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan perubahan shift.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="shift-configuration-section">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Master Konfigurasi Shift Kerja</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Atur jam mulai, jam selesai, toleransi keterlambatan (grace period), dan status aktif setiap shift restoran.
            Perubahan shift baru tidak akan merusak riwayat jadwal yang sudah lampau.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openCreateModal}
            id="btn-add-shift"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah Shift Baru
          </button>
        )}
      </div>

      {/* Preservation Policy Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200/90 leading-relaxed">
          <span className="font-bold text-white">Jaminan Integritas Riwayat: </span>
          Perubahan jam kerja pada Master Shift hanya berlaku untuk penugasan roster mendatang. Data presensi dan
          jadwal kerja historis tetap terkunci dengan catatan waktu aslinya.
        </div>
      </div>

      {/* Shifts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => {
          const isActive = shift.status === 'ACTIVE';
          const durationHours = (shift.scheduledDurationMinutes / 60).toFixed(1);

          return (
            <div
              key={shift.id}
              id={`shift-card-${shift.id}`}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-[#1A2035] border-[#2D374E] hover:border-purple-500/50'
                  : 'bg-[#151928] border-gray-800/80 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#252D48] text-purple-300 font-mono text-[11px] font-bold">
                      {shift.code}
                    </span>
                    <h4 className="text-sm font-bold text-white">{shift.name}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{shift.description || 'Tidak ada deskripsi'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Time & Duration Details */}
              <div className="mt-4 pt-4 border-t border-[#252D48] grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#111827]/60 p-2.5 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-medium">Jam Kerja</div>
                  <div className="text-xs font-bold text-purple-300 mt-0.5">
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>

                <div className="bg-[#111827]/60 p-2.5 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-medium">Total Durasi</div>
                  <div className="text-xs font-bold text-white mt-0.5">{durationHours} Jam</div>
                </div>

                <div className="bg-[#111827]/60 p-2.5 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-medium">Grace Period</div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">{shift.gracePeriodMinutes} Menit</div>
                </div>
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="mt-4 pt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(shift.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isActive ? 'Nonaktifkan Shift' : 'Aktifkan Kembali'}
                  </button>

                  <button
                    onClick={() => openEditModal(shift)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D48] hover:bg-[#2F395A] text-white text-xs font-medium rounded-lg transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-300" />
                    Edit Parameter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Edit / Create Shift */}
      {(editingShift || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1A2035] border border-[#2D374E] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                {editingShift ? `Edit Shift: ${editingShift.name}` : 'Tambah Master Shift Baru'}
              </h3>
              <button
                onClick={() => {
                  setEditingShift(null);
                  setIsCreating(false);
                }}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Kode Shift</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="e.g. SP-01"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Nama Shift</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Shift Pagi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Jam Mulai (WITA)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Jam Selesai (WITA)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Grace Period (Menit)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={formData.gracePeriodMinutes}
                    onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Status Shift</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ACTIVE">Aktif (Dapat Dijadwalkan)</option>
                    <option value="INACTIVE">Nonaktif (Diarsipkan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Deskripsi & Catatan Tugas</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catatan penugasan utama pada shift ini..."
                  className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2D374E]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingShift(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Master Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
