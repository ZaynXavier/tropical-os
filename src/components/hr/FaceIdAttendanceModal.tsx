import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { AttendanceRecord, LocationValidationResult, FaceVerificationResult } from '../../types/attendance';
import { locationService, SimulationMode } from '../../services/locationService';
import { faceVerificationService } from '../../services/faceVerificationService';
import { attendanceService } from '../../services/attendanceService';
import { hrConfigurationService } from '../../services/hrConfigurationService';
import { attendanceRuleService } from '../../services/attendanceRuleService';
import { LocationConfiguration, AttendanceConfiguration } from '../../types/hrConfiguration';
import {
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
  Shield,
  Clock,
  Compass,
  Radio,
  Building,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface FaceIdAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  actionType: 'IN' | 'OUT';
  onSuccessRecord?: (record: AttendanceRecord) => void;
}

type Step = 'GPS_CHECK' | 'FACE_SCAN' | 'SUCCESS';

export const FaceIdAttendanceModal: React.FC<FaceIdAttendanceModalProps> = ({
  isOpen,
  onClose,
  user,
  actionType,
  onSuccessRecord,
}) => {
  const [step, setStep] = useState<Step>('GPS_CHECK');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationValidationResult | null>(null);
  const [locationConfig, setLocationConfig] = useState<LocationConfiguration | null>(null);
  const [attendanceConfig, setAttendanceConfig] = useState<AttendanceConfiguration | null>(null);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>(locationService.getSimulationMode());
  const [showSimPanel, setShowSimPanel] = useState(false);

  // Camera & Face Verification state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Menginisialisasi kamera...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [faceResult, setFaceResult] = useState<FaceVerificationResult | null>(null);
  const [savedRecord, setSavedRecord] = useState<AttendanceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cleanup helper
  const stopAllMediaStreams = () => {
    if (streamRef.current) {
      faceVerificationService.stopCamera(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const s = videoRef.current.srcObject as MediaStream;
      s.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      stopAllMediaStreams();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAllMediaStreams();
      setStep('GPS_CHECK');
      setLocationResult(null);
      setFaceResult(null);
      setSavedRecord(null);
      setErrorMessage(null);
      setScanProgress(0);
      setShowSimPanel(false);
      return;
    }

    // Modal just opened -> Start GPS validation and load configurations
    loadConfigsAndValidateGps();
  }, [isOpen]);

  const loadConfigsAndValidateGps = async () => {
    setGpsLoading(true);
    setErrorMessage(null);

    try {
      const [locConf, attConf] = await Promise.all([
        hrConfigurationService.getLocationConfiguration(),
        hrConfigurationService.getAttendanceConfiguration(),
      ]);
      setLocationConfig(locConf);
      setAttendanceConfig(attConf);

      const result = await locationService.validateLocation();
      setLocationResult(result);
      setGpsLoading(false);

      if (result.isValid) {
        // Geofence Valid! Move directly to Face Verification Step
        setTimeout(() => {
          setStep('FACE_SCAN');
          initFaceVerification(result);
        }, 600);
      } else {
        setErrorMessage(result.errorMessage || 'Validasi lokasi GPS gagal.');
      }
    } catch (err: any) {
      setGpsLoading(false);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memeriksa lokasi GPS.');
    }
  };

  const handleModeChange = (mode: SimulationMode) => {
    locationService.setSimulationMode(mode);
    setSimulationMode(mode);
    loadConfigsAndValidateGps();
  };

  const initFaceVerification = async (locResult: LocationValidationResult) => {
    setScanProgress(15);
    setScanStatusText('Menghubungkan sensor optik kamera...');
    setErrorMessage(null);

    try {
      if (!videoRef.current) {
        setTimeout(() => initFaceVerification(locResult), 200);
        return;
      }

      const stream = await faceVerificationService.startCamera(videoRef.current);
      streamRef.current = stream;
      setCameraActive(true);

      // Start realistic scanning workflow
      setScanProgress(35);
      setScanStatusText('Memposisikan wajah di dalam bingkai panduan...');

      setTimeout(async () => {
        setScanProgress(60);
        setScanStatusText('Memindai parameter pencahayaan dan kontur...');

        setTimeout(async () => {
          setScanProgress(85);
          setScanStatusText(`Memverifikasi kecocokan identitas ${user.name}...`);
          setIsVerifying(true);

          try {
            const verification = await faceVerificationService.verifyFace(
              user.id || user.employee_id || 'emp-01',
              videoRef.current || undefined
            );
            setFaceResult(verification);

            if (verification.verified) {
              setScanProgress(100);
              setScanStatusText('Verifikasi Wajah Berhasil!');

              // Stop camera cleanly before saving
              stopAllMediaStreams();

              // Save Attendance Record via attendanceService
              let record: AttendanceRecord;
              const targetEmpId = user.id || user.employee_id || 'emp-01';

              if (actionType === 'IN') {
                record = await attendanceService.checkInMock({
                  employeeId: targetEmpId,
                  locationValidation: locResult,
                  faceVerification: verification,
                });
              } else {
                record = await attendanceService.checkOutMock({
                  employeeId: targetEmpId,
                  locationValidation: locResult,
                });
              }

              setSavedRecord(record);
              setStep('SUCCESS');
              if (onSuccessRecord) {
                onSuccessRecord(record);
              }
            } else {
              setErrorMessage('Verifikasi wajah tidak cocok. Silakan coba kembali di tempat yang cukup cahaya.');
              setIsVerifying(false);
            }
          } catch (e: any) {
            setErrorMessage(e.message || 'Gagal memproses presensi.');
            setIsVerifying(false);
          }
        }, 900);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tidak dapat mengakses kamera untuk verifikasi wajah.');
      stopAllMediaStreams();
    }
  };

  const handleCloseModal = () => {
    stopAllMediaStreams();
    onClose();
  };

  if (!isOpen) return null;

  const radius = locationConfig?.radiusMeters || 100;
  const maxAccuracy = locationConfig?.gpsAccuracyThresholdMeters || 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Presensi {actionType === 'IN' ? 'Check In (Masuk)' : 'Check Out (Pulang)'}
              </h3>
              <p className="text-xs text-gray-400">
                {user.name} • {user.division || 'Tropical Resto'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Step 1: GPS Validation Stage */}
          {step === 'GPS_CHECK' && (
            <div className="space-y-6 animate-fade-in text-center py-2">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                  <Compass className={`w-10 h-10 ${gpsLoading ? 'animate-spin' : ''}`} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Validasi Lokasi Geofence Resto</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Memeriksa koordinat GPS perangkat Anda terhadap zona radius resmi {locationConfig?.locationName || 'Tropical Garden Resto'} (Radius maks: {radius} meter, Akurasi min: ±{maxAccuracy}m).
                </p>
              </div>

              {gpsLoading && (
                <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center justify-center gap-3">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-xs font-medium text-gray-300">Menghubungi satelit GPS & memvalidasi geofence...</span>
                </div>
              )}

              {/* Error GPS feedback */}
              {errorMessage && !gpsLoading && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-rose-300">Presensi Dibatasi (GPS Tidak Valid)</h5>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>

                  {locationResult?.distanceMeters !== undefined && (
                    <div className="text-[11px] text-gray-400 bg-black/30 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Jarak Terdeteksi: <strong className="text-white">{(locationResult.distanceMeters ?? 0).toLocaleString('id-ID')} m</strong></span>
                      <span>Batas Diizinkan: <strong className="text-emerald-400">{radius} m</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={loadConfigsAndValidateGps}
                      className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/20"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Coba Ulang GPS
                    </button>
                    <button
                      onClick={() => setShowSimPanel(!showSimPanel)}
                      className="py-2.5 px-3 bg-[#2D374E] hover:bg-[#3B4866] text-gray-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
                    >
                      Opsi Simulasi
                    </button>
                  </div>
                </div>
              )}

              {/* Simulation Sandbox Options */}
              {showSimPanel && (
                <div className="p-3 bg-[#111827] border border-[#2D374E] rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pilih Mode Simulasi GPS (Sandbox Testing):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleModeChange('FORCE_VALID')}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        simulationMode === 'FORCE_VALID'
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                          : 'bg-[#1E2438] text-gray-300 border-[#2D374E] hover:bg-[#283248]'
                      }`}
                    >
                      ✓ Dalam Radius (16m)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('FORCE_OUTSIDE')}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        simulationMode === 'FORCE_OUTSIDE'
                          ? 'bg-rose-600/30 text-rose-300 border-rose-500'
                          : 'bg-[#1E2438] text-gray-300 border-[#2D374E] hover:bg-[#283248]'
                      }`}
                    >
                      ✕ Luar Area (2.8km)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('FORCE_LOW_ACCURACY')}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        simulationMode === 'FORCE_LOW_ACCURACY'
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                          : 'bg-[#1E2438] text-gray-300 border-[#2D374E] hover:bg-[#283248]'
                      }`}
                    >
                      ⚠ Akurasi Rendah (±180m)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('REAL')}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        simulationMode === 'REAL'
                          ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                          : 'bg-[#1E2438] text-gray-300 border-[#2D374E] hover:bg-[#283248]'
                      }`}
                    >
                      GPS Riil Browser
                    </button>
                  </div>
                </div>
              )}

              {/* Geofence info card */}
              <div className="p-3.5 bg-[#111827] border border-[#2D374E] rounded-2xl text-left flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-200">{locationConfig?.locationName || 'Tropical Garden Resto'}</div>
                    <div className="text-[10px] text-gray-400">Sanur, Denpasar, Bali (GPS: {locationConfig?.latitude?.toFixed(4)}, {locationConfig?.longitude?.toFixed(4)})</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Radius {radius}m
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Face Verification Camera */}
          {step === 'FACE_SCAN' && (
            <div className="space-y-5 animate-fade-in">
              {/* GPS Confirmation Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GPS Valid: Jarak {locationResult?.distanceMeters || 16}m dari resto</span>
                </div>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Area Resto
                </span>
              </div>

              {/* Video Camera Container */}
              <div className="relative w-full aspect-4/3 bg-black rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Biometric Scanning Overlay Guidelines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  {/* Oval Face Guide */}
                  <div className="relative w-48 h-64 border-2 border-dashed border-purple-400/80 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    {/* Scanning Laser Line */}
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce top-1/2 -translate-y-1/2" />
                    <div className="absolute -top-3 px-2 py-0.5 bg-[#1E2438] border border-purple-400/40 rounded-md text-[10px] text-purple-300 font-mono">
                      Face Verification
                    </div>
                  </div>

                  {/* Corner Target Marks */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-purple-400" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-purple-400" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-purple-400" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-purple-400" />
                </div>

                {!cameraActive && (
                  <div className="absolute inset-0 bg-[#111827] flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <Camera className="w-10 h-10 text-gray-500 animate-pulse" />
                    <p className="text-xs text-gray-400">{scanStatusText}</p>
                  </div>
                )}
              </div>

              {/* Progress & Live Verification Feedback */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    {scanStatusText}
                  </span>
                  <span className="font-mono font-bold text-purple-400">{scanProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#2D374E]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Privacy Notice Disclaimer */}
              <div className="p-3 bg-[#111827]/70 border border-[#2D374E] rounded-xl flex items-start gap-2.5 text-[11px] text-gray-400">
                <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-gray-300">Privasi Terjaga:</strong> Verifikasi wajah diproses secara lokal di peramban. Foto wajah atau data biometrik tidak disimpan secara permanen ke server database.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 'SUCCESS' && savedRecord && (
            <div className="space-y-6 animate-fade-in text-center py-4">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">
                  Presensi {actionType === 'IN' ? 'Check In' : 'Check Out'} Berhasil!
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  {actionType === 'IN'
                    ? savedRecord.status === 'LATE'
                      ? `Tercatat Masuk (Terlambat ${savedRecord.lateMinutes} menit)`
                      : 'Tercatat Masuk Tepat Waktu'
                    : `Tercatat Pulang • Total Durasi: ${savedRecord.durationHours} Jam`}
                </p>
              </div>

              {/* Summary Details Card */}
              <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-4 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#2D374E]">
                  <span className="text-gray-400">Nama Personel</span>
                  <span className="font-bold text-white">{savedRecord.employeeName || user.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#2D374E]">
                  <span className="text-gray-400">Jadwal Shift</span>
                  <span className="font-medium text-gray-200">
                    {savedRecord.scheduledStart || '09:00'} - {savedRecord.scheduledEnd || '19:00'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#2D374E]">
                  <span className="text-gray-400">Waktu {actionType === 'IN' ? 'Check In' : 'Check Out'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {actionType === 'IN' ? savedRecord.checkIn : savedRecord.checkOut} WITA
                  </span>
                </div>
                {savedRecord.lateMinutes > 0 && (
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#2D374E]">
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Keterlambatan
                    </span>
                    <span className="font-bold text-amber-400">
                      {savedRecord.lateMinutes} Menit (Potongan: Rp {(savedRecord.lateDeductionAmount || 0).toLocaleString('id-ID')})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#2D374E]">
                  <span className="text-gray-400">Validasi Geofence GPS</span>
                  <span className="text-gray-200 font-medium">
                    {savedRecord.checkInGeofenceStatus || savedRecord.locationStatus} ({savedRecord.checkInDistanceMeters || savedRecord.distanceMeters || 16}m dari resto)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status Verifikasi Wajah</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Face Verified ({savedRecord.faceConfidence || 97}%)
                  </span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

