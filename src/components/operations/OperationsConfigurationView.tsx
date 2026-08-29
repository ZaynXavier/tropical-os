/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — OPERATIONS CONFIGURATION VIEW
 * Configuration manager for restaurant operational hours, shift grace periods,
 * checkpoints, and alert thresholds.
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { OperationsConfiguration } from '../../types/operations';
import { operationsService } from '../../services/operationsService';

interface OperationsConfigurationViewProps {
  onRefresh: () => void;
  canManage?: boolean;
}

export const OperationsConfigurationView: React.FC<OperationsConfigurationViewProps> = ({
  onRefresh,
  canManage = true,
}) => {
  const [config, setConfig] = useState<OperationsConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const cfg = await operationsService.getOperationsConfiguration();
      setConfig(cfg);
    } catch (e) {
      console.error('Error loading operations config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !canManage) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await operationsService.updateOperationsConfiguration(config);
      setSuccessMsg('Konfigurasi operasional TropicalOS berhasil disimpan.');
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-8 bg-[#151B2B] rounded-2xl border border-white/10 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#1E2438] rounded" />
        <div className="h-32 bg-[#1E2438]/60 rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {successMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-200 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Restaurant Timing */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Jam Operasional Restoran</h4>
              <p className="text-[11px] text-slate-400">Jadwal buka & tutup layanan tamu</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Buka Layanan (WIB)</label>
              <input
                type="time"
                value={config.restaurantOpenTime}
                onChange={(e) => setConfig({ ...config, restaurantOpenTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tutup Layanan (WIB)</label>
              <input
                type="time"
                value={config.restaurantCloseTime}
                onChange={(e) => setConfig({ ...config, restaurantCloseTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Shift Preparation & Grace Period */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Waktu Persiapan & Grace Period</h4>
              <p className="text-[11px] text-slate-400">Toleransi checklist dan briefing shift</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Opening Prep (Menit)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={config.openingPreparationMinutes}
                onChange={(e) =>
                  setConfig({ ...config, openingPreparationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Closing Prep (Menit)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={config.closingPreparationMinutes}
                onChange={(e) =>
                  setConfig({ ...config, closingPreparationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Shift Handover & Peak Hours */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Shift Handover & Shift 2 Start</h4>
              <p className="text-[11px] text-slate-400">Waktu serah terima kasir & stasiun</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Handover Time (WIB)</label>
              <input
                type="time"
                value={config.shiftHandoverTime}
                onChange={(e) => setConfig({ ...config, shiftHandoverTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Toleransi Terlambat (Menit)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={config.checklistGraceMinutes}
                onChange={(e) =>
                  setConfig({ ...config, checklistGraceMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] text-white border border-white/10 font-mono focus:outline-hidden focus:border-purple-500"
                disabled={!canManage}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Automated Alerts */}
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Notifikasi & Peringatan Otomatis</h4>
              <p className="text-[11px] text-slate-400">Sistem deteksi gap personel real-time</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoAlertUnderstaffed}
                onChange={(e) =>
                  setConfig({ ...config, autoAlertUnderstaffed: e.target.checked })
                }
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                disabled={!canManage}
              />
              <span className="text-slate-300 font-medium">
                Peringatkan otomatis jika ada stasiun di bawah batas minimum staf
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.requireSupervisorVerification}
                onChange={(e) =>
                  setConfig({ ...config, requireSupervisorVerification: e.target.checked })
                }
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                disabled={!canManage}
              />
              <span className="text-slate-300 font-medium">
                Wajibkan verifikasi Supervisor untuk checklist opening/closing
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Action */}
      {canManage && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan Konfigurasi...' : 'Simpan Pengaturan Operasional'}
          </button>
        </div>
      )}
    </form>
  );
};
