<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\BreakLog;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    // Koordinat Restoran Tropical Garden
    private float $restoLat = -7.782800;
    private float $restoLng = 110.367000;
    private float $maxRadiusMeters = 100.0;

    /**
     * Hitung jarak meter dengan rumus Haversine
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Radius bumi dalam meter
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    public function today(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Profil pegawai tidak ditemukan.'], 404);
        }

        $today = now()->toDateString();
        $attendance = Attendance::with(['shift', 'breaks'])
            ->where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'position' => $employee->primary_position,
                    'department' => $employee->department,
                ],
                'date' => $today,
                'attendance' => $attendance,
                'shifts' => Shift::where('is_active', true)->get(),
            ],
        ]);
    }

    public function clockIn(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_base64' => 'nullable|string',
            'shift_id' => 'nullable|exists:shifts,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Profil pegawai tidak ditemukan.'], 404);
        }

        $today = now()->toDateString();
        $existing = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if ($existing && $existing->clock_in_time) {
            return response()->json(['success' => false, 'message' => 'Anda sudah melakukan clock-in hari ini.'], 400);
        }

        $lat = (float) $request->latitude;
        $lng = (float) $request->longitude;
        $distance = $this->calculateDistance($lat, $lng, $this->restoLat, $this->restoLng);
        $locationStatus = ($distance <= $this->maxRadiusMeters) ? 'VALID' : 'OUTSIDE_AREA';

        $shift = $request->shift_id ? Shift::find($request->shift_id) : Shift::first();
        $status = 'PRESENT';
        $lateMinutes = 0;

        if ($shift) {
            $shiftStartTime = now()->setTimeFromTimeString($shift->start_time);
            $graceTime = $shiftStartTime->copy()->addMinutes($shift->grace_period_minutes);

            if (now()->greaterThan($graceTime)) {
                $status = 'LATE';
                $lateMinutes = max(0, abs((int) now()->diffInMinutes($shiftStartTime)));
            }
        }

        $attendance = Attendance::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $today,
            ],
            [
                'uuid' => (string) Str::uuid(),
                'shift_id' => $shift?->id,
                'clock_in_time' => now(),
                'status' => $status,
                'late_duration_minutes' => $lateMinutes,
                'clock_in_latitude' => $lat,
                'clock_in_longitude' => $lng,
                'clock_in_distance_meters' => $distance,
                'clock_in_photo_url' => $request->photo_base64 ? 'data:image/jpeg;base64,sample' : null,
                'location_status' => $locationStatus,
                'face_verified' => true,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => ($locationStatus === 'VALID')
                ? 'Clock-in berhasil diverifikasi di dalam area resto (' . $distance . 'm).'
                : 'Clock-in tercatat di luar area resmi (' . $distance . 'm dari resto).',
            'data' => $attendance,
        ]);
    }

    public function clockOut(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        $today = now()->toDateString();
        $attendance = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->clock_in_time) {
            return response()->json(['success' => false, 'message' => 'Belum ada catatan clock-in hari ini.'], 400);
        }

        if ($attendance->clock_out_time) {
            return response()->json(['success' => false, 'message' => 'Anda sudah melakukan clock-out hari ini.'], 400);
        }

        $lat = (float) ($request->latitude ?? $this->restoLat);
        $lng = (float) ($request->longitude ?? $this->restoLng);

        $attendance->update([
            'clock_out_time' => now(),
            'clock_out_latitude' => $lat,
            'clock_out_longitude' => $lng,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clock-out berhasil dicatat. Terima kasih atas kerja keras Anda hari ini!',
            'data' => $attendance,
        ]);
    }

    public function startBreak(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        $today = now()->toDateString();
        $attendance = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if (!$attendance) {
            return response()->json(['success' => false, 'message' => 'Silakan clock-in terlebih dahulu.'], 400);
        }

        $break = BreakLog::create([
            'attendance_id' => $attendance->id,
            'employee_id' => $employee->id,
            'break_type' => $request->break_type ?? 'ISHOMA',
            'start_time' => now(),
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Waktu istirahat dimulai.',
            'data' => $break,
        ]);
    }

    public function endBreak(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        $break = BreakLog::where('employee_id', $employee->id)->where('status', 'ACTIVE')->latest()->first();

        if (!$break) {
            return response()->json(['success' => false, 'message' => 'Tidak ada sesi istirahat yang sedang aktif.'], 400);
        }

        $endTime = now();
        $duration = $endTime->diffInMinutes($break->start_time);

        $break->update([
            'end_time' => $endTime,
            'duration_minutes' => $duration,
            'status' => ($duration > 60) ? 'OVERSTAY' : 'COMPLETED',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Istirahat selesai. Durasi: ' . $duration . ' menit.',
            'data' => $break,
        ]);
    }
}
