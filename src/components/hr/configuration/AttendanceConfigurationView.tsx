import React, { useState } from 'react';
import { AttendanceConfiguration } from '../../../types/hrConfiguration';
import { UserCheck, Shield, Calculator, Check, AlertCircle, Sparkles, MapPin, Camera } from 'lucide-react';

interface Props {
  config: AttendanceConfiguration;
  onSave: (data: Partial<AttendanceConfiguration>) => Promise<void>;
  canEdit: boolean;
}

export const AttendanceConfigurationView: React.FC<Props> = ({ config, onSave, canEdit }) => {
  const [formData, setFormData] = useState<AttendanceConfiguration>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Simulator state
  const [simulatedLateMinutes, setSimulatedLateMinutes] = useState(25);

  const calculateDeduction = (
    minutes: number,
    hourlyRate: number,
    method: 'CEILING_HOUR' | 'FULL_HOUR' | 'PER_MINUTE' = 'CEILING_HOUR'
  ) => {
    if (minutes <= 0) return 0;
    if (method === 'CEILING_HOUR') {
      const hours = Math.ceil(minutes / 60);
      return hours * hourlyRate;
    } else if (method === 'FULL_HOUR') {
      const hours = Math.floor(minutes / 60);
      return hours * hourlyRate;
    } else {
      const perMinuteRate = hourlyRate / 60;
      return Math.round(minutes * perMinuteRate);
    }
  };

  const currentDeduction = calculateDeduction(
    simulatedLateMinutes,
    formData.lateDeductionHourlyRate,
    formData.lateDeductionCalculationMethod || 'CEILING_HOUR'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan konfigurasi presensi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="attendance-configuration-section">
      {/* Header */}
      <div className="bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Aturan Presensi, Toleransi & Potongan Keterlambatan</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Tentukan ambang batas toleransi keterlambatan (grace period), parameter verifikasi foto wajah/GPS, serta rumus
            potongan proporsional yang diintegrasikan ke modul payroll.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            id="btn-save-attendance-config"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : saveSuccess ? 'Berhasil Disimpan' : 'Simpan Pengaturan'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Pengaturan aturan presensi dan rumus potongan keterlambatan berhasil diperbarui.
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Toleransi & Potongan */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-400" />
              Toleransi Waktu & Tarif Potongan Keterlambatan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                  Grace Period Keterlambatan (Menit)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    disabled={!canEdit}
                    value={formData.gracePeriodMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, gracePeriodMinutes: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-60"
                  />
                  <span className="text-xs text-gray-400 font-medium">Menit</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Karyawan yang check-in sebelum toleransi ini berakhir tidak dianggap terlambat.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                  Tarif Potongan per Jam (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400 font-medium">Rp</span>
                  <input
                    type="number"
                    step={500}
                    min={0}
                    disabled={!canEdit}
                    value={formData.lateDeductionHourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, lateDeductionHourlyRate: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono disabled:opacity-60"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Tarif per menit: Rp {(formData.lateDeductionHourlyRate / 60).toFixed(2)}/menit
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                  Metode Perhitungan Potongan Keterlambatan
                </label>
                <select
                  disabled={!canEdit}
                  value={formData.lateDeductionCalculationMethod || 'CEILING_HOUR'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lateDeductionCalculationMethod: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-60 cursor-pointer"
                >
                  <option value="CEILING_HOUR">Pembulatan ke Atas per Jam (Ceiling Hour - e.g. 15 mnt dihitung 1 jam)</option>
                  <option value="FULL_HOUR">Hanya Jam Penuh (Full Hour - e.g. 15 mnt belum kena jam penuh)</option>
                  <option value="PER_MINUTE">Proporsional per Menit (Exact Per-Minute)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Standar F&B Tropical Resto menggunakan pembulatan ke atas per jam (Ceiling Hour) untuk pendisiplinan operasional.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Hardware Validation */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Validasi Keamanan & Perangkat Presensi
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Wajibkan Verifikasi Radius GPS Resto</div>
                    <div className="text-[10px] text-gray-400">
                      Staf harus berada dalam radius geofence resto saat melakukan Clock-In
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.requireGps}
                    onChange={(e) => setFormData({ ...formData, requireGps: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <Camera className="w-4 h-4 text-pink-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Wajibkan Foto Selfie (Face Verification)</div>
                    <div className="text-[10px] text-gray-400">
                      Staf wajib mengambil foto wajah di tempat untuk mencegah titip absen
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.requireFaceVerification}
                    onChange={(e) => setFormData({ ...formData, requireFaceVerification: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Izinkan Early Check-In (Sebelum Jam Shift)</div>
                    <div className="text-[10px] text-gray-400">
                      Staf diperbolehkan clock-in hingga 30 menit sebelum jam operasional shift dimulai
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.allowEarlyCheckIn}
                    onChange={(e) => setFormData({ ...formData, allowEarlyCheckIn: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Calculator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#1E2438] to-[#161B2E] p-5 rounded-2xl border border-purple-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Simulasi Potongan Keterlambatan</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                Live Preview
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Uji coba perhitungan potongan otomatis berdasarkan durasi keterlambatan staf dan tarif per jam yang
              dikonfigurasi:
            </p>

            {/* Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Simulasi Keterlambatan:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{simulatedLateMinutes} Menit</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={5}
                value={simulatedLateMinutes}
                onChange={(e) => setSimulatedLateMinutes(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0m (Tepat Waktu)</span>
                <span>30m</span>
                <span>60m (1 Jam)</span>
                <span>120m (2 Jam)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[5, 10, 15, 30, 45, 60].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSimulatedLateMinutes(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    simulatedLateMinutes === preset
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#111827] text-gray-400 hover:text-white'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            {/* Calculation Result Box */}
            <div className="p-4 bg-[#111827] rounded-xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status Absensi:</span>
                <span
                  className={`font-semibold ${
                    simulatedLateMinutes <= formData.gracePeriodMinutes ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulatedLateMinutes <= formData.gracePeriodMinutes
                    ? 'MASUK (Dalam Grace Period)'
                    : 'TERLAMBAT (Kena Potongan)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Rumus Perhitungan:</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {simulatedLateMinutes}m × (Rp {(formData.lateDeductionHourlyRate || 0).toLocaleString('id-ID')} / 60)
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200">Estimasi Potongan Gaji:</span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  Rp {(currentDeduction || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-[11px] text-purple-300/80 leading-relaxed">
              💡 Nilai potongan ini akan dicatat dalam kontrak integrasi presensi dan dikurangi secara otomatis pada
              perhitungan slip gaji bulanan staf.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
