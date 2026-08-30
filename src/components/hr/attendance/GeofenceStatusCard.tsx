/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GeofenceStatusCard.tsx
 * Dark glassmorphism, responsive, and high contrast GPS Geofence status card
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sliders,
  Radio,
  Building,
} from 'lucide-react';
import {
  locationService,
  SimulationMode,
} from '../../../services/locationService';
import { LocationValidationResult } from '../../../types/attendance';

interface GeofenceStatusCardProps {
  onValidationChange?: (result: LocationValidationResult) => void;
  showSimulationControls?: boolean;
  className?: string;
}

export const GeofenceStatusCard: React.FC<GeofenceStatusCardProps> = ({
  onValidationChange,
  showSimulationControls = true,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<LocationValidationResult | null>(null);
  const [locationConfig, setLocationConfig] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    minAccuracyMeters: number;
  } | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [activeMode, setActiveMode] = useState<SimulationMode>('REAL');

  const loadAndValidate = async () => {
    setLoading(true);
    try {
      const config = await locationService.getConfig();
      setLocationConfig(config);

      const result = await locationService.validateLocation();
      setValidationResult(result);
      if (onValidationChange) {
        onValidationChange(result);
      }
    } catch (e) {
      console.error('[GeofenceStatusCard] Error validating:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndValidate();
  }, []);

  const handleModeChange = async (mode: SimulationMode) => {
    setActiveMode(mode);
    setLoading(true);
    locationService.setSimulationMode(mode);
    try {
      const result = await locationService.validateLocation();
      setValidationResult(result);
      if (onValidationChange) {
        onValidationChange(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E2438] text-gray-400 border border-[#2D374E] animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
          Memvalidasi GPS...
        </span>
      );
    }

    if (!validationResult) return null;

    if (validationResult.isValid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          DALAM RADIUS GEOFENCE (VALID)
        </span>
      );
    }

    if (validationResult.status === 'DENIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          IZIN LOKASI DITOLAK
        </span>
      );
    }

    if (validationResult.errorCode === 'LOW_ACCURACY' || validationResult.status === 'LOW_ACCURACY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          AKURASI GPS RENDAH
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        DI LUAR RADIUS RESTORAN
      </span>
    );
  };

  const radius = locationConfig?.radiusMeters || 100;
  const maxAccuracy = locationConfig?.minAccuracyMeters || 50;

  return (
    <div
      id="geofence-status-card"
      className={`bg-[#151B2B] rounded-2xl border border-[#2D374E] p-5 shadow-xl transition-all text-white ${className}`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2D374E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                Status Validasi Geofence &amp; GPS
              </h3>
              {validationResult?.isSimulated && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Simulasi
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5 text-gray-400" />
              <span>{locationConfig?.name || 'Tropical Garden Resto Bali'}</span>
              <span className="text-purple-300 font-bold">(Radius: {radius}m)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {getStatusBadge()}
          <button
            type="button"
            onClick={loadAndValidate}
            disabled={loading}
            title="Refresh GPS"
            className="p-2 rounded-xl text-gray-300 hover:text-white bg-[#101522] hover:bg-[#1E2438] border border-[#2D374E] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {showSimulationControls && (
            <button
              type="button"
              onClick={() => setShowSimPanel(!showSimPanel)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSimPanel
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'text-gray-300 hover:text-white bg-[#101522] hover:bg-[#1E2438] border-[#2D374E]'
              }`}
              title="Toggle Simulasi Testing"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid (2 cols on mobile, 4 cols on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Jarak ke Resto */}
        <div className="p-3.5 bg-[#101522] rounded-xl border border-[#2D374E] flex flex-col justify-between">
          <p className="text-[11px] font-bold text-gray-400">Jarak ke Restoran</p>
          <p className="text-lg font-black text-white mt-1">
            {validationResult?.distanceMeters !== undefined
              ? `${(validationResult.distanceMeters ?? 0).toLocaleString('id-ID')} m`
              : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Maksimal: {radius} meter</p>
        </div>

        {/* Akurasi GPS */}
        <div className="p-3.5 bg-[#101522] rounded-xl border border-[#2D374E] flex flex-col justify-between">
          <p className="text-[11px] font-bold text-gray-400">Akurasi GPS</p>
          <p className="text-lg font-black text-white mt-1">
            {validationResult?.accuracyMeters !== undefined
              ? `±${validationResult.accuracyMeters} m`
              : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Batas akurasi: ±{maxAccuracy}m</p>
        </div>

        {/* Latitude */}
        <div className="p-3.5 bg-[#101522] rounded-xl border border-[#2D374E] flex flex-col justify-between">
          <p className="text-[11px] font-bold text-gray-400">Latitude Perangkat</p>
          <p className="text-xs font-mono font-bold text-purple-300 mt-1.5 truncate">
            {validationResult?.latitude !== undefined
              ? validationResult.latitude.toFixed(6)
              : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            Resto: {locationConfig?.latitude ? locationConfig.latitude.toFixed(6) : '-8.650000'}
          </p>
        </div>

        {/* Longitude */}
        <div className="p-3.5 bg-[#101522] rounded-xl border border-[#2D374E] flex flex-col justify-between">
          <p className="text-[11px] font-bold text-gray-400">Longitude Perangkat</p>
          <p className="text-xs font-mono font-bold text-purple-300 mt-1.5 truncate">
            {validationResult?.longitude !== undefined
              ? validationResult.longitude.toFixed(6)
              : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            Resto: {locationConfig?.longitude ? locationConfig.longitude.toFixed(6) : '115.216600'}
          </p>
        </div>
      </div>

      {/* Error / Alert Message if not valid */}
      {validationResult && !validationResult.isValid && validationResult.errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 mb-3 shadow-inner">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-200">Perhatian Presensi Geofence:</p>
            <p className="mt-0.5 text-rose-300/90 leading-relaxed">{validationResult.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Simulation Controls Panel (Sandbox) */}
      {showSimulationControls && showSimPanel && (
        <div className="mt-3 p-4 bg-[#101522] border border-emerald-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                Mode Simulasi Pengujian GPS (Sandbox)
              </span>
            </div>
            <span className="text-[11px] text-gray-400">Pilih kondisi testing:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('REAL')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeMode === 'REAL'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-[#151B2B] text-gray-400 hover:text-white border-[#2D374E]'
              }`}
            >
              GPS Asli
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_VALID')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeMode === 'FORCE_VALID'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-[#151B2B] text-gray-400 hover:text-white border-[#2D374E]'
              }`}
            >
              ✓ Dalam Radius
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_OUTSIDE')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeMode === 'FORCE_OUTSIDE'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                  : 'bg-[#151B2B] text-gray-400 hover:text-white border-[#2D374E]'
              }`}
            >
              ✗ Luar Radius
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_DENIED')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeMode === 'FORCE_DENIED'
                  ? 'bg-rose-700 text-white border-rose-400 shadow-md'
                  : 'bg-[#151B2B] text-gray-400 hover:text-white border-[#2D374E]'
              }`}
            >
              Izin Ditolak
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
