import {
  LocationValidationResult,
  AttendanceLocationStatus,
  LocationErrorCode,
} from '../types/attendance';
import { hrConfigurationService } from './hrConfigurationService';

/**
 * RESTAURANT LOCATION CONFIGURATION
 * Fallback baseline
 */
export const RESTAURANT_LOCATION = {
  name: 'Tropical Garden Resto',
  latitude: -8.6500,
  longitude: 115.2166,
  radiusMeters: 100, // Maximum allowed distance in meters
  minAccuracyMeters: 150, // Minimum acceptable GPS accuracy in meters
};

/**
 * Calculate distance between two coordinates in meters using Haversine Formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

export type SimulationMode =
  | 'REAL'
  | 'FORCE_VALID'
  | 'FORCE_OUTSIDE'
  | 'FORCE_LOW_ACCURACY'
  | 'FORCE_DENIED';

class LocationServiceClass {
  private config = { ...RESTAURANT_LOCATION };
  private simulatedMode: SimulationMode = 'REAL';

  /**
   * Get current restaurant config
   */
  public async getConfig() {
    try {
      const loc = await hrConfigurationService.getLocationConfiguration();
      if (loc) {
        return {
          name: loc.locationName,
          latitude: loc.latitude ?? this.config.latitude,
          longitude: loc.longitude ?? this.config.longitude,
          radiusMeters: loc.radiusMeters,
          minAccuracyMeters: loc.gpsAccuracyThresholdMeters,
          isConfigured: loc.isConfigured,
        };
      }
    } catch {
      // fallback
    }
    return { ...this.config, isConfigured: true };
  }

  /**
   * Update configurable radius for testing/management
   */
  public updateRadius(meters: number) {
    this.config.radiusMeters = Math.max(10, meters);
  }

  /**
   * Set simulation mode for testing environment & developer preview
   */
  public setSimulationMode(mode: SimulationMode) {
    this.simulatedMode = mode;
  }

  public getSimulationMode(): SimulationMode {
    return this.simulatedMode;
  }

  /**
   * Validate user current location against restaurant geofence
   */
  public async validateLocation(): Promise<LocationValidationResult> {
    const timestamp = new Date().toISOString();

    // Check location configuration from master HR config
    const currentLoc = await hrConfigurationService.getLocationConfiguration();
    const isConfigured =
      currentLoc.isConfigured &&
      currentLoc.latitude !== null &&
      currentLoc.longitude !== null &&
      !isNaN(currentLoc.latitude) &&
      !isNaN(currentLoc.longitude);

    if (!isConfigured) {
      return {
        isValid: false,
        status: 'UNAVAILABLE',
        errorCode: 'LOCATION_NOT_CONFIGURED',
        errorMessage: 'Koordinat lokasi restoran belum dikonfigurasi di Master Pengaturan HR.',
        radiusMeters: currentLoc.radiusMeters || 100,
        locationName: currentLoc.locationName,
        isSimulated: false,
        timestamp,
      };
    }

    const restLat = currentLoc.latitude!;
    const restLng = currentLoc.longitude!;
    const radiusMeters = currentLoc.radiusMeters || 100;
    const maxAccuracy = currentLoc.gpsAccuracyThresholdMeters || 50;

    // Check manual simulation overrides first
    if (this.simulatedMode === 'FORCE_VALID') {
      return {
        isValid: true,
        status: 'VALID',
        latitude: restLat + 0.0001,
        longitude: restLng + 0.0001,
        distanceMeters: 16,
        accuracyMeters: 10,
        radiusMeters,
        locationName: currentLoc.locationName,
        isSimulated: true,
        timestamp,
      };
    }

    if (this.simulatedMode === 'FORCE_OUTSIDE') {
      return {
        isValid: false,
        status: 'INVALID',
        latitude: restLat + 0.02,
        longitude: restLng + 0.02,
        distanceMeters: 2850,
        accuracyMeters: 15,
        radiusMeters,
        locationName: currentLoc.locationName,
        errorCode: 'OUTSIDE_GEOFENCE',
        errorMessage: `Posisi Anda (2.850 meter) berada di luar batas radius restoran (${radiusMeters} meter). Presensi hanya dapat dilakukan di area ${currentLoc.locationName}.`,
        isSimulated: true,
        timestamp,
      };
    }

    if (this.simulatedMode === 'FORCE_LOW_ACCURACY') {
      return {
        isValid: false,
        status: 'INVALID',
        latitude: restLat + 0.0002,
        longitude: restLng + 0.0002,
        distanceMeters: 28,
        accuracyMeters: 180,
        radiusMeters,
        locationName: currentLoc.locationName,
        errorCode: 'LOW_ACCURACY',
        errorMessage: `Akurasi sinyal GPS perangkat terlalu rendah (±180m). Batas maksimal akurasi yang diizinkan adalah ±${maxAccuracy}m. Silakan tunggu sinyal GPS stabil.`,
        isSimulated: true,
        timestamp,
      };
    }

    if (this.simulatedMode === 'FORCE_DENIED') {
      return {
        isValid: false,
        status: 'DENIED',
        radiusMeters,
        locationName: currentLoc.locationName,
        errorCode: 'PERMISSION_DENIED',
        errorMessage: 'Izin akses lokasi ditolak oleh peramban. Silakan aktifkan izin lokasi di pengaturan browser.',
        isSimulated: true,
        timestamp,
      };
    }

    // 1. Check Geolocation API Availability
    if (!navigator.geolocation) {
      return {
        isValid: false,
        status: 'UNAVAILABLE',
        radiusMeters,
        locationName: currentLoc.locationName,
        errorCode: 'LOCATION_UNAVAILABLE',
        errorMessage: 'Peramban atau perangkat Anda tidak mendukung fitur Geolocation GPS.',
        isSimulated: false,
        timestamp,
      };
    }

    // 2. Request Geolocation from Browser
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 10);

          // Calculate distance to restaurant
          const distance = calculateHaversineDistance(
            userLat,
            userLng,
            restLat,
            restLng
          );

          // 3. Validate GPS Accuracy
          if (accuracy > maxAccuracy) {
            resolve({
              isValid: false,
              status: 'INVALID',
              latitude: userLat,
              longitude: userLng,
              distanceMeters: distance,
              accuracyMeters: accuracy,
              radiusMeters,
              locationName: currentLoc.locationName,
              errorCode: 'LOW_ACCURACY',
              errorMessage: `Akurasi sinyal GPS perangkat terlalu rendah (±${accuracy}m). Minimal akurasi yang diizinkan adalah ±${maxAccuracy}m. Silakan tunggu sinyal GPS stabil.`,
              isSimulated: false,
              timestamp,
            });
            return;
          }

          // 4. Validate Distance (Geofence Radius)
          if (distance > radiusMeters) {
            resolve({
              isValid: false,
              status: 'INVALID',
              latitude: userLat,
              longitude: userLng,
              distanceMeters: distance,
              accuracyMeters: accuracy,
              radiusMeters,
              locationName: currentLoc.locationName,
              errorCode: 'OUTSIDE_GEOFENCE',
              errorMessage: `Posisi Anda (${distance} meter) berada di luar batas radius restoran (${radiusMeters} meter). Presensi hanya dapat dilakukan di area ${currentLoc.locationName}.`,
              isSimulated: false,
              timestamp,
            });
            return;
          }

          // All GPS checks passed!
          resolve({
            isValid: true,
            status: 'VALID',
            latitude: userLat,
            longitude: userLng,
            distanceMeters: distance,
            accuracyMeters: accuracy,
            radiusMeters,
            locationName: currentLoc.locationName,
            isSimulated: false,
            timestamp,
          });
        },
        (error) => {
          let errorCode: LocationErrorCode = 'LOCATION_UNAVAILABLE';
          let status: AttendanceLocationStatus = 'UNAVAILABLE';
          let errorMessage = 'Gagal mendeteksi lokasi perangkat.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorCode = 'PERMISSION_DENIED';
              status = 'DENIED';
              errorMessage = 'Izin akses lokasi ditolak oleh peramban. Silakan aktifkan izin lokasi di pengaturan browser untuk melakukan presensi.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorCode = 'POSITION_UNAVAILABLE';
              status = 'UNAVAILABLE';
              errorMessage = 'Sinyal GPS / lokasi perangkat tidak dapat dideteksi. Pastikan GPS aktif dan perangkat memiliki sinyal.';
              break;
            case error.TIMEOUT:
              errorCode = 'TIMEOUT';
              status = 'UNAVAILABLE';
              errorMessage = 'Permintaan lokasi GPS melebihi batas waktu (timeout). Silakan periksa koneksi GPS dan coba lagi.';
              break;
            default:
              break;
          }

          resolve({
            isValid: false,
            status,
            radiusMeters,
            locationName: currentLoc.locationName,
            errorCode,
            errorMessage,
            isSimulated: false,
            timestamp,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
}

export const locationService = new LocationServiceClass();
export const LocationService = locationService;
