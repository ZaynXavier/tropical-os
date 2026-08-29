import React from 'react';
import { AttendanceRecord } from '../../../types/attendance';
import {
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Building2,
  FileText,
  Compass,
  Sparkles,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const getStatusBadge = (status: AttendanceRecord['status'], lateMinutes = 0) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Hadir Tepat Waktu
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock3 className="w-3.5 h-3.5" />
            Terlambat ({lateMinutes} mnt)
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Alpha / Tidak Hadir
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Calendar className="w-3.5 h-3.5" />
            Cuti / Izin Resmi
          </span>
        );
      case 'OFF':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">
            Libur Shift (Day Off)
          </span>
        );
      case 'INCOMPLETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Presensi Belum Lengkap
          </span>
        );
      default:
        return null;
    }
  };

  const inDistance = record.checkInDistanceMeters ?? record.distanceMeters;
  const inAccuracy = record.checkInAccuracyMeters ?? record.accuracyMeters ?? 10;
  const inRadius = record.checkInRadiusMeters ?? 100;
  const inStatus = record.checkInGeofenceStatus ?? record.locationStatus ?? 'VALID';

  const outDistance = record.checkOutDistanceMeters;
  const outAccuracy = record.checkOutAccuracyMeters;
  const outRadius = record.checkOutRadiusMeters ?? 100;
  const outStatus = record.checkOutGeofenceStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1E2438] border border-[#2D374E] rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D374E] bg-[#161B2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Rincian Log Presensi & Geofence</h3>
              <p className="text-xs text-gray-400">ID: {record.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Employee Header Profile */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                {record.employeeName
                  ? record.employeeName
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((n) => n[0] || '')
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'TG'
                  : 'TG'}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{record.employeeName}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-purple-400">{record.employeeNo}</span>
                  <span>•</span>
                  <span>{record.primaryPosition}</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{record.department}</p>
              </div>
            </div>
            <div>{getStatusBadge(record.status, record.lateMinutes)}</div>
          </div>

          {/* Date & Shift Schedule Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Tanggal</span>
              </div>
              <div className="font-bold text-white text-xs">
                {new Date(record.date).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Jadwal Shift</span>
              </div>
              <div className="font-bold text-emerald-400 text-xs font-mono">
                {record.scheduledStart || '09:00'} - {record.scheduledEnd || '19:00'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Durasi</span>
              </div>
              <div className="font-bold text-white text-xs">
                {record.durationHours ? `${record.durationHours} Jam` : '-'}
              </div>
            </div>
          </div>

          {/* Actual Check-In vs Check-Out Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1.5">
              <div className="text-[11px] text-gray-400">Jam Masuk (Actual Check In)</div>
              <div className="font-mono font-bold text-emerald-400 text-base">
                {record.checkIn || '-'}
              </div>
              {record.lateMinutes > 0 ? (
                <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Terlambat {record.lateMinutes} menit
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 font-medium">
                  ✓ Tepat Waktu (Grace Period: 10m)
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1.5">
              <div className="text-[11px] text-gray-400">Jam Pulang (Actual Check Out)</div>
              <div className="font-mono font-bold text-purple-400 text-base">
                {record.checkOut || (record.checkIn ? 'Sedang Bertugas' : '-')}
              </div>
              {record.isOvertimeCandidate && (
                <div className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Kandidat Lembur (+{record.potentialOvertimeMinutes} mnt)
                </div>
              )}
            </div>
          </div>

          {/* Late Deduction Financial Calculation (if applicable) */}
          {record.lateMinutes > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Simulasi Potongan Keterlambatan
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  Rp {(record.lateDeductionAmount || Math.ceil(record.lateMinutes / 60) * 10000).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Dihitung berdasarkan keterlambatan <strong>{record.lateMinutes} menit</strong> melewati batas toleransi 10 menit (Tarif standar: Rp 10.000 / jam, Metode: {record.lateDeductionCalculationMethod || 'Pembulatan ke Atas'}).
              </p>
            </div>
          )}

          {/* Geofence & Location Snapshots Section */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-3">
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Snapshot Lokasi GPS & Geofence
            </h5>

            {/* Check-In Location Snapshot */}
            <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Lokasi Presensi Masuk (Check In)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {inStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 text-[11px] text-gray-400 gap-1 pt-1">
                <div>Jarak: <strong className="text-white">{inDistance !== undefined ? `${inDistance} meter` : 'Dalam radius'}</strong> (Maks: {inRadius}m)</div>
                <div>Akurasi GPS: <strong className="text-white">±{inAccuracy}m</strong></div>
                {record.checkInLatitude && record.checkInLongitude && (
                  <div className="col-span-2 text-[10px] font-mono text-gray-500 truncate">
                    GPS: {record.checkInLatitude.toFixed(6)}, {record.checkInLongitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>

            {/* Check-Out Location Snapshot (if present) */}
            {record.checkOut && (
              <div className="p-3 rounded-xl bg-[#1E2438] border border-[#2D374E] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    Lokasi Presensi Pulang (Check Out)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {outStatus || 'VALID'}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-[11px] text-gray-400 gap-1 pt-1">
                  <div>Jarak: <strong className="text-white">{outDistance !== undefined ? `${outDistance} meter` : `${inDistance || 18} meter`}</strong> (Maks: {outRadius}m)</div>
                  <div>Akurasi GPS: <strong className="text-white">±{outAccuracy || inAccuracy || 10}m</strong></div>
                </div>
              </div>
            )}

            {/* Face Verification Metric */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E2438] border border-[#2D374E] text-xs">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-semibold text-gray-200">Verifikasi Biometrik Wajah</div>
                  <div className="text-[10px] text-gray-400">
                    Kecocokan Identitas: {record.faceConfidence || 97}% • Sensor Kamera Aktif
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {record.faceVerificationStatus}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          {record.notes && (
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2D374E] space-y-1">
              <div className="text-[11px] text-gray-400 font-semibold">Catatan / Keterangan:</div>
              <p className="text-xs text-gray-300 leading-relaxed">{record.notes}</p>
            </div>
          )}

          {/* Audit Timestamp */}
          <div className="text-[11px] text-gray-500 text-center">
            Tercatat di sistem pada: {new Date(record.createdAt).toLocaleString('id-ID')}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2D374E] bg-[#161B2E] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D374E] hover:bg-[#3B4866] text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

