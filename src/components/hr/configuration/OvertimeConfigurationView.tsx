import React, { useState } from 'react';
import { OvertimeConfiguration } from '../../../types/hrConfiguration';
import { Clock, Shield, Check, AlertCircle, Calculator, Users, AlertTriangle } from 'lucide-react';

interface Props {
  config: OvertimeConfiguration;
  onSave: (data: Partial<OvertimeConfiguration>) => Promise<void>;
  canEdit: boolean;
}

export const OvertimeConfigurationView: React.FC<Props> = ({ config, onSave, canEdit }) => {
  const [formData, setFormData] = useState<OvertimeConfiguration>({
    hourlyRate: config.hourlyRate ?? 10000,
    maxDailyHours: config.maxDailyHours ?? 4,
    requireApproval: config.requireApproval ?? true,
    allowOffDayOvertime: config.allowOffDayOvertime ?? true,
    disclaimerText: config.disclaimerText || 'Nilai ini merupakan simulasi internal TropicalOS.',
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Simulator state
  const [simulatedStaffCount, setSimulatedStaffCount] = useState(3);
  const [simulatedHours, setSimulatedHours] = useState(2);

  const calculateCost = (staff: number, hours: number, rate: number) => {
    return staff * hours * rate;
  };

  const totalSimulationCost = calculateCost(
    simulatedStaffCount,
    simulatedHours,
    formData.hourlyRate
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
      setError(err.message || 'Gagal menyimpan konfigurasi lembur.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="overtime-configuration-section">
      {/* Header */}
      <div className="bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Master Konfigurasi Lembur (Overtime Simulation)</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Tentukan tarif standar simulasi lembur (Rp 10.000 / jam), batas maksimal jam lembur harian staf, dan alur
            persetujuan lembur terintegrasi.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            id="btn-save-overtime-config"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
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
        <div className="p-4 bg-indigo-950/50 border border-indigo-800 text-indigo-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Konfigurasi simulasi lembur berhasil diperbarui.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Tarif & Batas */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Tarif Standar Lembur & Batas Maksimal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                  Tarif Simulasi per Jam (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400 font-medium">Rp</span>
                  <input
                    type="number"
                    step={1000}
                    min={0}
                    disabled={!canEdit}
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-60"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Standar operasional: Rp 10.000 / jam lembur.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                  Maksimal Jam Lembur Harian (Jam)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    disabled={!canEdit}
                    value={formData.maxDailyHours}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDailyHours: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  />
                  <span className="text-xs text-gray-400 font-medium">Jam</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Batas kesehatan & efisiensi staf per hari.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Approval Policies */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Kebijakan Approval & Hari Libur (Off-Day)
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs font-semibold text-white">Wajibkan Persetujuan Supervisor / Manager</div>
                  <div className="text-[10px] text-gray-400">
                    Pengajuan lembur harus disetujui atasan sebelum waktu lembur dimulai
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.requireApproval}
                    onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs font-semibold text-white">Izinkan Lembur Pada Hari Libur / Off-Day</div>
                  <div className="text-[10px] text-gray-400">
                    Staf yang tidak memiliki jadwal shift reguler tetap dapat ditugaskan lembur khusus
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.allowOffDayOvertime}
                    onChange={(e) => setFormData({ ...formData, allowOffDayOvertime: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-white">Perhatian & Batasan Simulasi: </span>
              Modul lembur TropicalOS dirancang untuk simulasi beban kerja internal resto. Nilai tarif ini
              belum merupakan kalkulasi payroll legal berstandar ketenagakerjaan formal.
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Cost Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#1E2438] to-[#161B2E] p-5 rounded-2xl border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Simulasi Biaya Lembur</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                Live Calculator
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Hitung proyeksi estimasi biaya lembur operasional untuk event atau peak-rush resto:
            </p>

            {/* Slider Staff Count */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" /> Jumlah Staf Lembur:
                </span>
                <span className="text-sm font-bold text-white font-mono">{simulatedStaffCount} Orang</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={simulatedStaffCount}
                onChange={(e) => setSimulatedStaffCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>1 Orang</span>
                <span>5 Orang</span>
                <span>10 Orang</span>
              </div>
            </div>

            {/* Slider Hours */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Durasi Lembur per Orang:
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">{simulatedHours} Jam</span>
              </div>
              <input
                type="range"
                min={1}
                max={formData.maxDailyHours}
                value={simulatedHours}
                onChange={(e) => setSimulatedHours(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>1 Jam</span>
                <span>{Math.round(formData.maxDailyHours / 2)} Jam</span>
                <span>{formData.maxDailyHours} Jam (Maks)</span>
              </div>
            </div>

            {/* Calculation Result Box */}
            <div className="p-4 bg-[#111827] rounded-xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Jam Orang (Man-Hours):</span>
                <span className="text-white font-mono font-semibold">{simulatedStaffCount * simulatedHours} Jam</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Rumus Kalkulasi:</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {simulatedStaffCount} org × {simulatedHours} jam × Rp {(formData.hourlyRate || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200">Total Proyeksi Biaya Lembur:</span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  Rp {(totalSimulationCost || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
