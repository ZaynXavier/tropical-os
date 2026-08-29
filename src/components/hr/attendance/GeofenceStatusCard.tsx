import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sliders,
  Compass,
  Radio,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  locationService,
  SimulationMode,
} from '../../../services/locationService';
import { LocationValidationResult } from '../../../types/attendance';
import { hrConfigurationService } from '../../../services/hrConfigurationService';
import { LocationConfiguration } from '../../../types/hrConfiguration';

interface GeofenceStatusCardProps {
  onLocationValidated?: (result: LocationValidationResult) => void;
  showSimulationControls?: boolean;
  className?: string;
}

export const GeofenceStatusCard: React.FC<GeofenceStatusCardProps> = ({
  onLocationValidated,
  showSimulationControls = true,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<LocationValidationResult | null>(null);
  const [locationConfig, setLocationConfig] = useState<LocationConfiguration | null>(null);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>(locationService.getSimulationMode());
  const [showSimPanel, setShowSimPanel] = useState(false);

  const loadAndValidate = async () => {
    setLoading(true);
    try {
      const config = await hrConfigurationService.getLocationConfiguration();
      setLocationConfig(config);

      const result = await locationService.validateLocation();
      setValidationResult(result);
      if (onLocationValidated) {
        onLocationValidated(result);
      }
    } catch (err) {
      console.error('Error validating location:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndValidate();
  }, []);

  const handleModeChange = (mode: SimulationMode) => {
    locationService.setSimulationMode(mode);
    setSimulationMode(mode);
    loadAndValidate();
  };

  const getStatusBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Memverifikasi GPS...
        </span>
      );
    }

    if (!validationResult) {
      return null;
    }

    if (validationResult.isValid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          DALAM RADIUS GEOFENCE (VALID)
        </span>
      );
    }

    if (validationResult.status === 'DENIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          IZIN LOKASI DITOLAK
        </span>
      );
    }

    if (validationResult.errorCode === 'LOW_ACCURACY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          AKURASI GPS RENDAH
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        DI LUAR RADIUS RESTORAN
      </span>
    );
  };

  const radius = locationConfig?.radiusMeters || 100;
  const maxAccuracy = locationConfig?.gpsAccuracyThresholdMeters || 50;

  return (
    <div
      id="geofence-status-card"
      className={`bg-white rounded-xl border border-stone-200 p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Status Validasi Geofence & GPS
              </h3>
              {validationResult?.isSimulated && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Simulasi
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3 text-stone-400" />
              {locationConfig?.locationName || 'Tropical Garden Resto Bali'} (Radius: {radius}m)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            type="button"
            onClick={loadAndValidate}
            disabled={loading}
            title="Refresh GPS"
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {showSimulationControls && (
            <button
              type="button"
              onClick={() => setShowSimPanel(!showSimPanel)}
              className={`p-2 rounded-lg border transition-colors ${
                showSimPanel
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
              }`}
              title="Toggle Simulasi Testing"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
          <p className="text-[11px] font-medium text-stone-500">Jarak ke Restoran</p>
          <p className="text-lg font-bold text-stone-900 mt-0.5">
            {validationResult?.distanceMeters !== undefined
              ? `${(validationResult.distanceMeters ?? 0).toLocaleString('id-ID')} m`
              : '—'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Maksimal: {radius} meter</p>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
          <p className="text-[11px] font-medium text-stone-500">Akurasi GPS</p>
          <p className="text-lg font-bold text-stone-900 mt-0.5">
            {validationResult?.accuracyMeters !== undefined
              ? `±${validationResult.accuracyMeters} m`
              : '—'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Batas akurasi: ±{maxAccuracy}m</p>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
          <p className="text-[11px] font-medium text-stone-500">Latitude Perangkat</p>
          <p className="text-xs font-mono font-semibold text-stone-800 mt-1 truncate">
            {validationResult?.latitude !== undefined
              ? validationResult.latitude.toFixed(6)
              : '—'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Resto: {locationConfig?.latitude ? locationConfig.latitude.toFixed(6) : '-8.650000'}
          </p>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
          <p className="text-[11px] font-medium text-stone-500">Longitude Perangkat</p>
          <p className="text-xs font-mono font-semibold text-stone-800 mt-1 truncate">
            {validationResult?.longitude !== undefined
              ? validationResult.longitude.toFixed(6)
              : '—'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Resto: {locationConfig?.longitude ? locationConfig.longitude.toFixed(6) : '115.216600'}
          </p>
        </div>
      </div>

      {/* Error / Alert Message if not valid */}
      {validationResult && !validationResult.isValid && validationResult.errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Perhatian Presensi Geofence:</p>
            <p className="mt-0.5 text-rose-700">{validationResult.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Simulation Controls Panel (for easy developer/manager testing in sandbox) */}
      {showSimulationControls && showSimPanel && (
        <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Mode Simulasi Pengujian GPS (Sandbox)
              </span>
            </div>
            <span className="text-[11px] text-emerald-700">Pilih kondisi testing di bawah:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('REAL')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                simulationMode === 'REAL'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              GPS Riil (Browser)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_VALID')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                simulationMode === 'FORCE_VALID'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              ✓ Dalam Radius (16m)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_OUTSIDE')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                simulationMode === 'FORCE_OUTSIDE'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              ✕ Luar Area (2.8km)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FORCE_LOW_ACCURACY')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                simulationMode === 'FORCE_LOW_ACCURACY'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              ⚠ Akurasi Buruk (±180m)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
