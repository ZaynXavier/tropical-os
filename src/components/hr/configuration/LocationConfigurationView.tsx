import React, { useState } from 'react';
import { LocationConfiguration } from '../../../types/hrConfiguration';
import {
  MapPin,
  Compass,
  Crosshair,
  Shield,
  Check,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface Props {
  config: LocationConfiguration;
  onSave: (data: Partial<LocationConfiguration>) => Promise<void>;
  canEdit: boolean;
}

export const LocationConfigurationView: React.FC<Props> = ({ config, onSave, canEdit }) => {
  const [formData, setFormData] = useState<LocationConfiguration>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  const isConfigured =
    formData.isConfigured &&
    formData.latitude !== null &&
    formData.longitude !== null &&
    !isNaN(formData.latitude) &&
    !isNaN(formData.longitude);

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung Geolocation API.');
      return;
    }

    setGeoLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          isConfigured: true,
        });
        setGeoLocating(false);
      },
      (err) => {
        setError(`Gagal mengambil koordinat perangkat: ${err.message}`);
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleUseDefaultPreset = () => {
    setFormData({
      ...formData,
      locationName: 'Tropical Garden Resto (Bali)',
      latitude: -8.6500,
      longitude: 115.2166,
      radiusMeters: 100,
      gpsAccuracyThresholdMeters: 50,
      isConfigured: true,
    });
  };

  const handleClearCoordinates = () => {
    setFormData({
      ...formData,
      latitude: null,
      longitude: null,
      isConfigured: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        isConfigured:
          formData.latitude !== null &&
          formData.longitude !== null &&
          !isNaN(formData.latitude) &&
          !isNaN(formData.longitude),
      };
      await onSave(dataToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan konfigurasi lokasi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="location-configuration-section">
      {/* Header */}
      <div className="bg-[#1E2438] p-5 rounded-2xl border border-[#2D374E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Master Lokasi Restoran & Geofencing GPS</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Tentukan titik koordinat latitude/longitude restoran dan toleransi radius kehadiran untuk validasi otomatis
            saat staf melakukan presensi.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            id="btn-save-location-config"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : saveSuccess ? 'Berhasil Disimpan' : 'Simpan Konfigurasi'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-blue-950/50 border border-blue-800 text-blue-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Konfigurasi koordinat geofencing restoran berhasil diperbarui.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Coordinates Card */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                Titik Koordinat & Nama Lokasi
              </h4>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isConfigured ? (
                  <>
                    <Check className="w-3 h-3" />
                    Terkonfigurasi
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    LOCATION_NOT_CONFIGURED
                  </>
                )}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">Nama Lokasi / Cabang</label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="e.g. Tropical Garden Resto (Bali)"
                className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Latitude (Garis Lintang)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  disabled={!canEdit}
                  value={formData.latitude ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="-8.650000"
                  className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Longitude (Garis Bujur)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  disabled={!canEdit}
                  value={formData.longitude ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="115.216600"
                  className="w-full bg-[#111827] border border-[#2D374E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-60"
                />
              </div>
            </div>

            {/* Presets & Actions */}
            {canEdit && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  disabled={geoLocating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D48] hover:bg-[#2F395A] text-blue-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {geoLocating ? 'Mendeteksi GPS...' : 'Ambil GPS Perangkat Saat Ini'}
                </button>

                <button
                  type="button"
                  onClick={handleUseDefaultPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D48] hover:bg-[#2F395A] text-gray-300 text-xs font-medium rounded-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Preset Default Bali
                </button>

                <button
                  type="button"
                  onClick={handleClearCoordinates}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-rose-300 text-xs font-medium rounded-lg transition-all cursor-pointer ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Kosongkan Koordinat
                </button>
              </div>
            )}
          </div>

          {/* Radius & Accuracy Card */}
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-purple-400" />
              Radius Geofencing & Ambang Akurasi GPS
            </h4>

            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-semibold">Radius Batas Presensi (Geofence):</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{formData.radiusMeters} Meter</span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                disabled={!canEdit}
                value={formData.radiusMeters}
                onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-60"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>20m (Ketat)</span>
                <span>100m (Standar)</span>
                <span>250m</span>
                <span>500m (Area Luas)</span>
              </div>
            </div>

            {/* GPS Accuracy Slider */}
            <div className="space-y-2 pt-3 border-t border-gray-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-semibold">Maksimal Toleransi Akurasi Sinyal GPS:</span>
                <span className="text-sm font-bold text-purple-400 font-mono">
                  ±{formData.gpsAccuracyThresholdMeters} Meter
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                disabled={!canEdit}
                value={formData.gpsAccuracyThresholdMeters}
                onChange={(e) =>
                  setFormData({ ...formData, gpsAccuracyThresholdMeters: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-60"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>±10m (Akurasi Tinggi)</span>
                <span>±50m (Standar Ponsel)</span>
                <span>±150m (Toleransi Cuaca)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Geofence Map Diagram */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1A2035] p-5 rounded-2xl border border-[#2D374E] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Visualisasi Radar Geofence</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                Diagram Area
              </span>
            </div>

            {/* Stylized SVG Radar Diagram */}
            <div className="relative aspect-square w-full bg-[#111827] rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden">
              {/* Concentric circles */}
              <svg className="w-full h-full p-4" viewBox="0 0 300 300">
                {/* Outer bounds */}
                <circle cx="150" cy="150" r="130" fill="none" stroke="#1F293D" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="95" fill="none" stroke="#26334D" strokeWidth="1" />
                
                {/* Geofence Active Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r={Math.min(120, Math.max(30, (formData.radiusMeters / 500) * 120 + 20))}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />

                {/* Accuracy Buffer Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r={Math.min(130, Math.max(15, (formData.gpsAccuracyThresholdMeters / 150) * 50 + 10))}
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Center Crosshair */}
                <line x1="150" y1="20" x2="150" y2="280" stroke="#1E293B" strokeWidth="1" />
                <line x1="20" y1="150" x2="280" y2="150" stroke="#1E293B" strokeWidth="1" />

                {/* Resto Pin Marker */}
                <circle cx="150" cy="150" r="8" fill="#3B82F6" />
                <circle cx="150" cy="150" r="3" fill="#FFFFFF" />

                {/* Simulated Staff Ping */}
                <circle cx="170" cy="140" r="5" fill="#10B981" />
                <circle cx="170" cy="140" r="10" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              </svg>

              {/* Badges on Radar */}
              <div className="absolute top-3 left-3 bg-[#1E2438]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-gray-300 border border-gray-800">
                🔵 Pusat Restoran: <span className="font-mono">{formData.locationName || 'Unset'}</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-[#1E2438]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 border border-gray-800">
                🟢 Contoh Presensi Staf (Dalam Radius)
              </div>
            </div>

            {/* Parameter Summary */}
            <div className="p-3 bg-[#111827] rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Status Geofence:</span>
                <span className={isConfigured ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {isConfigured ? 'AKTIF & VALID' : 'BELUM DIKONFIGURASI'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Koordinat:</span>
                <span className="font-mono text-[11px]">
                  {isConfigured ? `${formData.latitude}, ${formData.longitude}` : 'Latitude/Longitude Null'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Radius Diizinkan:</span>
                <span className="text-blue-300 font-mono font-semibold">{formData.radiusMeters} Meter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
