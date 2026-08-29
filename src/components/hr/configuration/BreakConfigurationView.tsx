import React, { useState } from 'react';
import { BreakConfiguration } from '../../../types/hrConfiguration';
import { Coffee, Shield, Check, AlertCircle, Plus, X, Bell } from 'lucide-react';

interface Props {
  config: BreakConfiguration;
  onSave: (data: Partial<BreakConfiguration>) => Promise<void>;
  canEdit: boolean;
}

export const BreakConfigurationView: React.FC<Props> = ({ config, onSave, canEdit }) => {
  const [formData, setFormData] = useState<BreakConfiguration>({
    standardBreakMinutes: config.standardBreakMinutes ?? 60,
    requireApprovalForAdditionalBreak: config.requireApprovalForAdditionalBreak ?? true,
    additionalBreakPresets: config.additionalBreakPresets || [15, 20, 30, 45, 60],
    maxAdditionalBreakMinutes: config.maxAdditionalBreakMinutes ?? 120,
    alertThresholdExcessiveMinutes: config.alertThresholdExcessiveMinutes ?? 15,
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPreset, setNewPreset] = useState<number | ''>('');

  const handleAddPreset = () => {
    if (typeof newPreset === 'number' && newPreset > 0 && !formData.additionalBreakPresets.includes(newPreset)) {
      setFormData({
        ...formData,
        additionalBreakPresets: [...formData.additionalBreakPresets, newPreset].sort((a, b) => a - b),
      });
      setNewPreset('');
    }
  };

  const handleRemovePreset = (val: number) => {
    setFormData({
      ...formData,
      additionalBreakPresets: formData.additionalBreakPresets.filter((p) => p !== val),
    });
  };

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
      setError(err.message || 'Gagal menyimpan konfigurasi istirahat.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="break-configuration-section">
      {/* Header */}
      <div className="bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Master Konfigurasi Istirahat & Pengawasan Overbreak</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Konfigurasikan kuota standard break harian (60 menit), alur persetujuan istirahat tambahan (additional break),
            dan batas deteksi peringatan overbreak.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            id="btn-save-break-config"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50"
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
        <div className="p-4 bg-amber-950/50 border border-amber-800 text-amber-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Konfigurasi istirahat dan peringatan overbreak berhasil disimpan.
        </div>
      )}

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Break Card */}
        <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            Standard Break Shift Operasional
          </h4>

          <div>
            <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
              Durasi Kuota Standard Break (Menit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={15}
                max={120}
                disabled={!canEdit}
                value={formData.standardBreakMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, standardBreakMinutes: Math.max(1, Number(e.target.value)) })
                }
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
              <span className="text-xs text-gray-400 font-medium">Menit</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Hak istirahat makan & ibadah standar shift per hari tanpa memerlukan persetujuan atasan.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
              Batas Peringatan Overbreak (Menit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={180}
                disabled={!canEdit}
                value={formData.alertThresholdExcessiveMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, alertThresholdExcessiveMinutes: Math.max(1, Number(e.target.value)) })
                }
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
              <span className="text-xs text-gray-400 font-medium">Menit</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Jika istirahat melampaui batas ini, sistem akan memicu alert <span className="text-rose-400 font-semibold">CRITICAL OVERBREAK</span> pada dashboard monitoring atasan.
            </p>
          </div>
        </div>

        {/* Additional Break Policy */}
        <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            Alur Pengajuan Additional Break
          </h4>

          <div className="flex items-center justify-between p-3 bg-[#111827]/60 rounded-xl border border-gray-800">
            <div>
              <div className="text-xs font-semibold text-white">Wajib Persetujuan Supervisor / Manager</div>
              <div className="text-[10px] text-gray-400">
                Pengajuan istirahat di luar standard break harus disetujui atasan sebelum aktif
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={formData.requireApprovalForAdditionalBreak}
                onChange={(e) => setFormData({ ...formData, requireApprovalForAdditionalBreak: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
              Maksimal Durasi Pengajuan Additional Break
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={15}
                max={240}
                disabled={!canEdit}
                value={formData.maxAdditionalBreakMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, maxAdditionalBreakMinutes: Math.max(1, Number(e.target.value)) })
                }
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
              <span className="text-xs text-gray-400 font-medium">Menit</span>
            </div>
          </div>

          {/* Quick Presets Manager */}
          <div className="pt-2 border-t border-gray-800">
            <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
              Pilihan Cepat Durasi Pengajuan (Menit)
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {formData.additionalBreakPresets.map((preset) => (
                <span
                  key={preset}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111827] border border-gray-700 text-amber-300 rounded-lg text-xs font-semibold"
                >
                  {preset} Menit
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemovePreset(preset)}
                      className="text-gray-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Durasi (m)..."
                  className="w-32 bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddPreset}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#252D48] hover:bg-[#2F395A] text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Pilihan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
