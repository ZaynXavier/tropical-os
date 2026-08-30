# 📱 TropicalOS Staff Mobile App (React Native & Expo)

Aplikasi mobile resmi khusus staf dan operasional **Tropical Garden Resto Bali**, dibangun menggunakan **React Native, Expo, and TypeScript**.

---

## 🌟 4 Fitur Utama Staf di Aplikasi Mobile:

1. **📍 Presensi Live GPS Geofence & Foto Selfie (`HomeScreen.tsx`)**:
   - Deteksi otomatis radius 100m dari koordinat restoran (*-8.6500, 115.2166*).
   - Tombol Clock-In kamera selfie terhubung langsung ke backend server.
2. **📅 Jadwal Shift Mingguan & Tukar Shift Mandiri (`ScheduleScreen.tsx`)**:
   - Kalender roster shift (Pagi, Middle, Closing).
   - Fitur pengajuan tukar shift ke rekan kerja dengan persetujuan SPV 1-klik.
3. **💳 Slip Gaji Digital & Pengajuan Kasbon (`FinanceScreen.tsx`)**:
   - Riwayat dan unduh slip gaji PDF mandiri.
   - Form pengajuan kasbon darurat staf dengan batas maksimal 40% gaji berjalan.
4. **👤 Profil & Konfigurasi Host Server (`ProfileScreen.tsx`)**:
   - Data diri, status PKWT, dan pengaturan IP backend LAN untuk pengujian WiFi.

---

## 🚀 Cara Menjalankan Aplikasi di HP Android / iPhone:

### Cara 1: Menggunakan Aplikasi Expo Go (Paling Cepat Tanpa Kabel)
1. Download aplikasi **Expo Go** gratis di Google Play Store (Android) atau App Store (iPhone).
2. Buka terminal di folder `mobile`:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Terminal akan menampilkan **QR Code**.
4. Buka aplikasi **Expo Go** di HP Anda lalu scan QR code tersebut.
5. Aplikasi **TropicalOS Staff** akan langsung terbuka dan berjalan mulus di layar HP Anda!

---

### Cara 2: Ekspor Menjadi File APK Mandiri (Android)
Untuk membuat file installer `.apk` yang bisa dibagikan langsung ke staf restoran:
```bash
cd mobile
npx eas build -p android --profile preview
```
