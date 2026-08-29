import {
  FaceVerificationResult,
  FaceErrorCode,
} from '../types/attendance';

class FaceVerificationServiceClass {
  private activeStream: MediaStream | null = null;

  /**
   * Request camera permission from browser
   */
  public async requestCameraPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: 'Perangkat atau peramban Anda tidak mendukung akses kamera.',
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      // Stop immediately after checking permission
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      return {
        granted: false,
        error: isDenied
          ? 'Izin akses kamera ditolak oleh peramban. Silakan izinkan akses kamera untuk verifikasi wajah.'
          : `Tidak dapat mengakses kamera: ${err.message || 'Kamera sedang digunakan aplikasi lain'}`,
      };
    }
  }

  /**
   * Start camera video stream on the given HTMLVideoElement
   */
  public async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.stopCamera(this.activeStream);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Kamera tidak didukung pada peramban ini.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      this.activeStream = stream;
      videoElement.srcObject = stream;
      await videoElement.play().catch(() => {
        // Fallback for autoplay policies
      });

      return stream;
    } catch (err: any) {
      throw new Error(
        err.name === 'NotAllowedError'
          ? 'Izin akses kamera ditolak.'
          : 'Gagal mengaktifkan kamera. Pastikan kamera tidak digunakan aplikasi lain.'
      );
    }
  }

  /**
   * Stop camera tracks cleanly
   */
  public stopCamera(stream: MediaStream | null = this.activeStream): void {
    const target = stream || this.activeStream;
    if (target) {
      try {
        target.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping media stream tracks:', e);
      }
    }
    if (target === this.activeStream) {
      this.activeStream = null;
    }
  }

  /**
   * Simulate face detection scanning step
   */
  public async detectFace(
    videoElement: HTMLVideoElement
  ): Promise<{ detected: boolean; confidence: number; error?: string }> {
    // Check if video element is actively rendering
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.paused) {
      return {
        detected: false,
        confidence: 0,
        error: 'Frame video belum siap.',
      };
    }

    // Realistic scanning duration
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      detected: true,
      confidence: 96,
    };
  }

  /**
   * Execute Face Verification simulation
   * NOTE: No biometric images, templates, or identifiers are saved to storage.
   */
  public async verifyFace(
    employeeId: string,
    _videoElement?: HTMLVideoElement
  ): Promise<FaceVerificationResult> {
    const timestamp = new Date().toISOString();

    // Verification simulation duration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Deterministic high confidence matching for personnel
    const confidence = 95 + Math.floor(Math.random() * 4); // 95 - 98%

    return {
      verified: true,
      status: 'VERIFIED',
      confidence,
      timestamp,
    };
  }
}

export const faceVerificationService = new FaceVerificationServiceClass();
export const FaceVerificationService = faceVerificationService;
