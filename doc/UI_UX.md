# TROPICALOS — MASTER UI/UX DESIGN SPECIFICATION

**Document Version:** 1.0.0  
**Target Enterprise:** Tropical Garden Resto  
**Authority:** Master UI/UX & Design System Blueprint  
**Alignment:** /doc/PRD.md & /doc/INFORMATION_ARCHITECTURE.md  
**Scope:** Frontend-First Design Guidelines, Layout Standards & Interaction Patterns  

---

# 1. DESIGN PRINCIPLES

TropicalOS adalah Sistem Operasi Bisnis (Business Operating System) terintegrasi untuk Tropical Garden Resto. Antarmuka TropicalOS menggabungkan keunggulan **Restaurant Management System + Business Intelligence + HR System + CRM + Operations System** dalam satu kesatuan visual yang kohesif.

### Prinsip Utama:
1. **Professional & Operational:** Dirancang untuk kecepatan scan informasi, kejelasan status, dan kemudahan eksekusi tugas di lantai restoran yang serba cepat.
2. **Data-Driven & Actionable:** Setiap kartu metrik, grafik, dan tabel tidak hanya menyajikan angka, tetapi mengarahkan pengguna pada *Root Cause* dan *Tindakan Lanjutan (Next Action)*.
3. **Clean & Anti-Slop:** Menolak elemen dekoratif yang berlebihan, efek neon menyilaukan, atau gradien ungu-ke-biru generik. Estetika dibangun melalui tipografi yang kuat, ritme spasi yang konsisten, dan hierarki visual yang tegas.
4. **Desktop-First for Management, Mobile-First for Staff:**
   - **Owner & Manager:** Memperoleh antarmuka Desktop/Tablet yang padat data, multi-kolom, dengan visualisasi Business Intelligence komprehensif.
   - **Staf Operasional:** Memperoleh antarmuka Mobile yang ringkas, berorientasi tindakan cepat (Clock-in, Request Break, Ceklist Shift, Task, Slip Gaji).
5. **No Blind Navigation:** Informasi terorganisir dalam hierarki yang jelas (*Overview -> Detail Drawer -> Action Modal*), meminimalkan perpindahan halaman yang tidak perlu.

---

# 2. VISUAL IDENTITY & COLOR SYSTEM

Sistem warna TropicalOS mengusung nuansa **Dark Navy / Deep Purple Luxury Slate** dengan aksen fungsional yang memiliki makna semantik ketat (Semantic Colors). Glassmorphism digunakan secara moderat untuk memberikan kedalaman (*depth*) tanpa mengorbankan keterbacaan data.

### Palet Warna & Token Semantik:

| Token Desain | Kode HEX | Nilai RGB / HSL | Penggunaan Semantik |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0B0F19` | `rgb(11, 15, 25)` | Latar belakang aplikasi utama (Deep Dark Slate Navy) |
| **Surface Layer 1** | `#111827` | `rgb(17, 24, 39)` | Sidebar, Topbar, Panel Drawer latar belakang |
| **Card / Surface Layer 2**| `#1E2438` | `rgb(30, 36, 56)` | Kartu kontainer, modal, dropdown container |
| **Surface Layer 3 (Elevated)**| `#283049` | `rgb(40, 48, 73)` | Kontainer di dalam kartu, hover state baris tabel |
| **Border Subtle** | `#2D374E` | `rgb(45, 55, 78)` | Garis pemisah, border kartu (Opacity 60-80%) |
| **Border Active / Focus** | `#6366F1` | `rgb(99, 102, 241)` | Outline input aktif, seleksi kartu terpilih |
| **Primary Purple Accent** | `#8B5CF6` | `rgb(139, 92, 246)` | Tombol aksi utama, active state menu, tab terpilih |
| **Secondary Pink Accent** | `#EC4899` | `rgb(236, 72, 153)` | Aksen badge promosi, highlight CRM, penanda seasonal |
| **Success (Emerald)** | `#10B981` | `rgb(16, 185, 129)` | Status Selesai, Hadir, Target Tercapai, Laba Positif |
| **Warning (Amber)** | `#F59E0B` | `rgb(245, 158, 11)` | Stok Menipis, Butuh Review, Menunggu Persetujuan |
| **Danger / Critical (Rose/Red)**| `#EF4444` | `rgb(239, 68, 68)` | Overdue, Wasting Kritis, Selisih Kas, Keterlambatan |
| **Information (Blue/Cyan)** | `#3B82F6` | `rgb(59, 130, 246)` | Notifikasi info, status dalam proses, info shift |
| **Text Primary** | `#F9FAFB` | `rgb(249, 250, 251)`| Judul utama, angka KPI, teks bernilai tinggi |
| **Text Secondary** | `#D1D5DB` | `rgb(209, 213, 219)`| Isi teks badan, label form, deskripsi |
| **Text Muted** | `#9CA3AF` | `rgb(156, 163, 175)`| Placeholder input, timestamp, metadata tabel |

---

# 3. TYPOGRAPHY SYSTEM

Typography dirancang untuk keterbacaan tinggi (*high-contrast readability*) pada lingkungan operasional dapur dan kasir yang dinamis.

- **Primary Font Family:** `Plus Jakarta Sans`, `Inter`, `system-ui`, `-apple-system`, `sans-serif`
- **Monospace/Numeric Font Family (untuk Angka Mata Uang & Kode):** `JetBrains Mono`, `Fira Code`, `monospace`

### Skala Tipografi:

| Tingkat / Komponen | Ukuran Font | Weight | Line Height | Tracking | Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `28px` (`1.75rem`) | `Bold (700)` | `1.3` | `-0.02em` | Judul Dashboard, Banner Modul Utama |
| **Page Title H2** | `22px` (`1.375rem`)| `SemiBold (600)`| `1.35`| `-0.015em`| Judul Halaman Modul, Header Modal Besar |
| **Section Header H3**| `18px` (`1.125rem`)| `SemiBold (600)`| `1.4` | `-0.01em` | Header Card, Judul Section Form |
| **Sub-Header H4** | `15px` (`0.9375rem`)| `Medium (500)` | `1.45`| `0` | Header Grouping Tabel, Sub-kartu |
| **KPI Numeric (Hero)**| `30px - 36px` | `Bold (700)` | `1.1` | `-0.03em` | Nilai Rupiah Revenue, Persentase Margin |
| **KPI Numeric (Standard)**| `20px - 24px`| `Bold (700)` | `1.2` | `-0.02em` | Angka Metrik Card, Total Count |
| **Body Standard** | `14px` (`0.875rem`)| `Regular (400)` | `1.55`| `0` | Konten Tabel, Deskripsi Task, Form Text |
| **Body Medium / Action**| `14px` (`0.875rem`)| `Medium (500)` | `1.4` | `0.01em` | Label Tombol, Tab Title, Status Pill |
| **Caption / Meta** | `12px` (`0.75rem`) | `Regular (400)` | `1.5` | `0.01em` | Timestamp, Petunjuk Form, Sub-label |
| **Micro Badge** | `11px` (`0.6875rem`)| `SemiBold (600)`| `1.2` | `0.03em` | Tag Kategori, Chip Status, Versi Dokumen |

---

# 4. LAYOUT SYSTEM & RESPONSIVE GRID

Aplikasi menggunakan layout container fluid dengan batas maksimum lebar untuk menjaga keseimbangan visual di layar ultra-lebar.

- **Max Container Width:** `1600px` (`max-w-[1600px] mx-auto`)
- **Spacing Scale (Kelipatan 4px/8px):** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`
- **Border Radius Hierarchy:**
  - `Button / Input / Badge`: `8px` (`rounded-lg`) atau `9999px` (`rounded-full` untuk pills)
  - `Card / Modal / Container Kecil`: `12px` (`rounded-xl`)
  - `Container Besar / Drawer / Shell`: `16px` (`rounded-2xl`)
  - *Mathematical Rule:* Inner Container Radius = Outer Container Radius - Padding

### Skema Grid Responsif:
- **Desktop (>= 1280px):** Layout 12 Kolom dengan Sidebar Kiri Permanen (Lebar `260px` fixed).
- **Tablet (768px - 1024px):** Layout 8 Kolom dengan Sidebar Collapsible (Ikon saja / `72px` atau toggle drawer).
- **Mobile (360px - 480px):** Single Column (Stacking) dengan Compact Topbar dan Bottom Navigation Bar untuk aksi cepat staf.

---

# 5. APPLICATION SHELL & MASTER NAVIGATION UI

Seluruh halaman terproteksi setelah login dibungkus oleh **AppShell**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   TOPBAR                                    │
│ [Logo] Breadcrumb > Modul > Sub-Page   [Search] [Period] [Bell(3)] [Role Badge] [User] │
├───────────────┬─────────────────────────────────────────────────────────────┤
│    SIDEBAR    │                        MAIN CONTENT                         │
│               │ ┌─────────────────────────────────────────────────────────┐ │
│ • Dashboard   │ │ Page Title + Action Toolbar                             │ │
│ • Tropical HR │ ├─────────────────────────────────────────────────────────┤ │
│ • CRM         │ │ Sub-Tabs Navigation (Jika ada)                          │ │
│ • Operations  │ ├─────────────────────────────────────────────────────────┤ │
│ • Finance     │ │ KPI Summary Grid                                        │ │
│ • Development │ ├─────────────────────────────────────────────────────────┤ │
│ • Content     │ │ Primary Data Area (Kanban / Table / Charts / Form)      │ │
│ • Reports/MBR │ └─────────────────────────────────────────────────────────┘ │
│ • Settings    │                                                             │
├───────────────┴─────────────────────────────────────────────────────────────┤
│ (Mobile View: Fixed Bottom Navigation Bar for Clock-In / Checklists / Tasks)│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Elemen AppShell:
1. **Sidebar Navigation:**
   - Menampilkan Logo TropicalOS & Brand Tropical Garden Resto.
   - 9 Menu Utama berurutan sesuai IA: *Dashboard, Tropical HR, Tropical CRM, Operations, Finance, Development, Content Creator, Reports, Settings*.
   - Filter menu berbasis RBAC: Item yang tidak diizinkan disembunyikan sepenuhnya dari rendering.
   - Status indikator badge (misal: angka tugas pending atau notifikasi baru).
2. **Topbar Global Utilities:**
   - **Breadcrumb:** Navigasi hirarkis yang dapat diklik (`HR > Presensi > Hari Ini`).
   - **Global Search:** Shortcut keyboard (`Ctrl + K` / `Cmd + K`) untuk mencari karyawan, menu, stok, atau reservasi tamu.
   - **Period Selector:** Pilihan rentang waktu analitik (Hari Ini, Minggu Ini, Bulan Ini, Custom).
   - **Notification Popover:** Notifikasi terfilter berdasarkan urgensi (*Approval Request, Stok Kritis, Overdue Task*).
   - **Role Badge & User Avatar:** Menampilkan nama user, jabatan primer, serta label peran (*OWNER, MANAGER, SUPERVISOR, STAFF*).

---

# 6. ROLE-BASED UI SPECIFICATIONS

UI TropicalOS beradaptasi sepenuhnya dengan persona pengguna:

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│      OWNER      │ │     MANAGER     │ │   SUPERVISOR    │ │      STAFF      │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Command Center│ │ • All Modules   │ │ • Shift Control │ │ • Self-Service  │
│ • Full MBR View │ │ • Full Approvals│ │ • Checklist Ver.│ │ • My Checklist  │
│ • Profit & Cost │ │ • Policy Editor │ │ • Team Attend.  │ │ • Break Request │
│ • Strategic KPI │ │ • Marketing/Dev │ │ • Cash Audit    │ │ • My Payslip    │
│ • Zero Clutter  │ │ • Settings Admin│ │ • Stock Log     │ │ • My KPI & Task │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 1. Owner Interface:
- Tampilan berfokus pada kesehatan bisnis, margin kotor, EBITDA, kepatuhan mutu, dan ringkasan MBR bulanan.
- Menghindari visualisasi formulir teknis operasional harian yang tidak memerlukan intervensi Owner.

### 2. Manager Interface (Heri Setiawan - Manager + HR):
- Akses ke seluruh 9 modul dengan kapabilitas persetujuan multi-level (*Multi-level Approval Workflow*).
- Panel kendali kebijakan insentif, manajemen dokumen SOP/IKA, strategi promosi/branding, dan tinjauan penggajian.

### 3. Supervisor Interface (Putri Okta - Supervisor + Kasir):
- Dashboard pemantauan tim aktif per shift, persetujuan istirahat/lembur lini pertama, verifikasi checklist pembukaan/penutupan, dan rekonsiliasi kas kasir harian.

### 4. Staff Interface (Kitchen, Bar, Service, Cleaning, CRM, Content):
- Portal *Self-Service*: Tombol cepat Presensi Wajah/GPS, status pengajuan istirahat, daftar checklist stasiun tugasnya, lembar panduan IKA/SOP, kartu tugas pengembangan, dan slip gaji pribadi.
- Data finansial perusahaan, gaji staf lain, dan laporan MBR eksekutif tidak ditampilkan di UI.

---

# 7. DASHBOARD UI (MANAGEMENT COMMAND CENTER)

Dashboard eksekutif menggunakan pola visualisasi:
$$\text{Business Health Overview} \longrightarrow \text{Primary KPIs} \longrightarrow \text{Anomaly / Alert} \longrightarrow \text{Root Cause} \longrightarrow \text{Action Shortcut}$$

### Grid 10 Dimensi Analitik:
1. **Sales & Revenue Stream:**
   - Hero Cards: Total Sales (Rp), Target Gap (%), Sales vs Last Month, Average Check (Rp), Total Guests.
   - Donut & Bar Charts: Komparasi Saluran (*Dine In vs Take Away vs Delivery*) & Heatmap Penjualan per Jam.
2. **Menu Performance Matrix:**
   - Top 10 Best Seller vs Bottom 10 Slow Moving (Tabel ringkas dengan bar margin & kontribusi profit).
3. **Food Cost & Variance:**
   - Metric Variance: Actual Food Cost % vs Theoretical % dengan selisih nominal (Rp).
   - Alert Box: Bahan dengan lonjakan pemborosan (*Wasting*) di atas ambang batas 3%.
4. **Inventory Health:**
   - Indikator akurasi stock opname, nilai dead stock, dan badge peringatan FEFO/kadaluarsa.
5. **Labor & Productivity:**
   - Labor Cost %, Sales per Labor Hour, Rasio Keterlambatan, dan Total Jam Lembur Berjalan.
6. **Operational Expenses (OPEX):**
   - Rincian biaya utilitas (Listrik, Gas, Air, Maintenance) dengan grafik tren harian/mingguan.
7. **Customer Experience:**
   - Skor Google Rating (Bintang 1-5), Tren Komplain, dan Jumlah Transaksi Void/Edit Bill Kasir.
8. **Quality & Compliance Score:**
   - Nilai Inspeksi Keamanan Pangan & Audit Kebersihan Dapur/Area Makan.
9. **People & Training:**
   - Jam Pelatihan Karyawan MTD, Kasus Disiplin Aktif, dan Status Evaluasi KPI Tim.
10. **Profitability Summary (Bottom Line):**
    - Gross Profit (Rp & %), Operating Profit (Rp), dan Estimasi Net Margin (%).

---

# 8. MONTHLY BUSINESS REVIEW (MBR) UI

Tampilan MBR adalah laporan analitik eksekutif terstruktur yang mensintesis data tanpa input manual:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MONTHLY BUSINESS REVIEW — AGUSTUS 2026                 [Print/Export Report]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Executive Summary & Big Numbers (Revenue, Gross Margin, Net EBITDA)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Division Scorecard (Sales, Kitchen, Bar, Service, HR, Finance, CRM)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. MoM & YoY Variance Analysis (Komparasi Bulan Lalu & Tahun Lalu)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Root Cause Analysis (RCA) Panel:                                         │
│    • Isu Teridentifikasi: "Food Cost Menu Daging naik 4.2%"                 │
│    • Faktor Penyebab: "Kenaikan harga beli supplier + 2x insiden gosong"    │
│    • Rekomendasi Aksi: "Re-negosiasi kontrak vendor & kalibrasi timer dapur"│
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. Generated Strategic Action Plan for Next Month [Convert to Task Engine]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 9. TROPICAL HR UI

### 1. Employee Management:
- **Tampilan Direktori:** Grid kartu profil atau tabel data lengkap dengan filter departemen, status kerja (*Full-Time, Contract*), dan pencarian instan.
- **Detail Karyawan (Drawer/Page):** Tabs terpadu: *Biodata & Kontak, Posisi & Tanggung Jawab Tambahan, Riwayat Absensi, Roster Jadwal, Pengajuan Break, KPI & Review, Dokumen Pribadi, Slip Gaji*.

### 2. Attendance & Presensi:
- **Modal Presensi Wajah & GPS (Frontend Flow):**
  - Preview kamera interaktif dengan overlay pemindaian lingkaran wajah (*biometric scan effect*).
  - Status validasi lokasi GPS dengan badge visual (*Dalam Radius 50m / Luar Radius*).
  - Tombol aksi jelas: `Clock In (Masuk)` dan `Clock Out (Pulang)`.
- **Rekap Presensi Harian:** Tabel kehadiran real-time dengan status badge: *Tepat Waktu (Hijau), Terlambat (Kuning), Izin/Sakit (Biru), Alpha (Merah)*.

### 3. Shift & Schedule:
- Roster kalender mingguan khusus **2 Shift Resmi** (*Shift Pagi: 09:00 - 19:00* dan *Shift Siang: 13:00 - 23:00*).
- Indikator peringatan otomatis jika terjadi bentrok jadwal atau staf melebihi batas jam kerja normal.

### 4. Break Management System:
- **Formulir Pengajuan Cepat Staf:** Pilihan tipe *Standard Break (Makan 60 menit)* atau *Additional Break (Ibadah/Mendesak 15-30 menit)* dengan input alasan singkat.
- **Kartu Approval Supervisor:** Notifikasi popover/kartu dengan tombol cepat `Setujui (Approve)` atau `Tolak (Reject)` beserta alasan penolakan.

### 5. Dokumen HR & SOP / IKA:
- **Viewer Dokumen Terpadu:** Pratinjau PDF/dokumen di dalam aplikasi dengan nomor versi, tanggal berlaku, dan tombol konfirmasi akseptasi digital karyawan.

---

# 10. TROPICAL CRM UI

### 1. Lead Pipeline (Kanban Board):
- Kolom stage interaktif dengan fitur Drag-and-Drop:
  $$\text{New Lead} \longrightarrow \text{Contacted} \longrightarrow \text{Qualified} \longrightarrow \text{Quotation} \longrightarrow \text{Negotiation} \longrightarrow \text{Won} \longrightarrow \text{Lost}$$
- **Kartu Deal:** Menampilkan nama tamu/instansi, estimasi nilai rupiah (Rp), sumber lead (Instagram, Walk-in, Rekomendasi), tanggal follow-up berikutnya, dan badge prioritas (*High, Medium, Low*).

### 2. Customer Profile Detail (Drawer):
- Menampilkan metrik Lifetime Value (LTV), total kunjungan, riwayat percakapan WhatsApp, meja favorit, preferensi alergi, dan log reservasi masa lalu.

---

# 11. WHATSAPP OMNICHANNEL & AI CLOSING ASSISTANT UI

Antarmuka WhatsApp Web dioptimalkan dalam layout 3-kolom modern:

```
┌──────────────────┬─────────────────────────────┬────────────────────────────┐
│ CONVERSATION LIST│       ACTIVE CHAT ROOM      │    CUSTOMER CONTEXT & AI   │
├──────────────────┼─────────────────────────────┼────────────────────────────┤
│ [Search Chat]    │ Header: Tamu VIP - Meja 12  │ Profile: Bpk. Hendra Wijaya│
│ • Bpk. Hendra    │ [Call/Book] [Tag: Wedding]  │ Tag: Prospek Wedding 150Pax│
│   "Siang min..." │ ─────────────────────────── │ ────────────────────────── │
│ • Ibu Maya (12m) │ Tamu: "Paket wedding 150 pax│ [AI CLOSING ASSISTANT]     │
│   "Untuk tgl 20?"│       bisa custom menu?"    │ Analisis Konteks:          │
│ • Sdr. Kevin     │                             │ Tamu berminat tinggi namun │
│   "DP sudah trf" │ Admin: "Halo Pak, tentu..." │ menanyakan fleksibilitas.  │
│                  │ ─────────────────────────── │                            │
│                  │ [Message Composer]          │ Rekomendasi Jawaban:       │
│                  │ [Attach] [Template] [Send]  │ 1. [Opsi Formal + Brosur]  │
│                  │                             │ 2. [Opsi Negosiasi Diskon] │
│                  │                             │ 3. [Tawarkan Trial Food]   │
│                  │                             │ [Salin Jawaban ke Chat]    │
└──────────────────┴─────────────────────────────┴────────────────────────────┘
```

- **Prinsip Human-in-the-Loop:** Jawaban yang dihasilkan AI disajikan sebagai *Draft Rekomendasi*. Tombol `Salin ke Composer` atau `Gunakan Rekomendasi` menempatkan teks di kotak input agar admin dapat meninjau atau mengedit sebelum menekan kirim. Tidak ada pengiriman pesan otomatis tanpa persetujuan manusia.

---

# 12. RESERVATION & CRM CALENDAR UI

### 1. Reservation Engine:
- Formulir pembuatan reservasi cepat: Nama Tamu, No. WhatsApp, Tanggal & Jam Kedatangan, Jumlah Pax, Pilihan Area/Meja (Indoor AC, Gazebo Taman, VIP Room), Status DP (Rp), dan Catatan Khusus.
- Filter Status: `Pending`, `Confirmed`, `Seated / Arrived`, `Completed`, `Cancelled`, `No Show`.

### 2. CRM Calendar:
- Tampilan Kalender Bulanan/Mingguan/Harian dengan kode warna penanda event (Hijau: Reservasi Lunas, Kuning: Menunggu DP, Ungu: Event Besar/Gathering).

---

# 13. OPERATIONS UI

Modul Operasional dirancang untuk kecepatan entri data dan kejelasan checklist stasiun:

### 1. Daily Checklist View:
- Dikelompokkan ke dalam 3 tab waktu: **Opening Checklist (09:00)**, **Running Shift Checklist (11:30 & 18:00)**, dan **Closing Checklist (22:00)**.
- Setiap butir checklist memiliki: Kotak centang, nama tugas, penanggung jawab, input nilai/catatan (misal: suhu chiller `4°C`), tombol upload bukti foto (*evidence*), dan indikator status verifikasi supervisor.

### 2. Departmental Workspaces:
- **Kitchen & Bar:** Monitor antrean prep, pencatatan batch bumbu masak setengah jadi, dan peringatan stok minimum (*Low Stock Alert*).
- **Service & Kasir:** Denah tata letak meja (Table Layout Map) dengan status meja: *Kosong (Hijau), Terisi (Merah), Tagihan Tercetak (Kuning), Kotor/Perlu Dibersihkan (Abu-abu)*.
- **Cleaning & Dishwash:** Jadwal sanitasi berkala, deep cleaning grease trap, dan checklist ketersediaan sabun/disinfektan.
- **Wasting Log Entry:** Modal input kilat bahan rusak/gosong/expired dengan kalkulasi nilai rupiah terbuang dan lampiran foto kamera langsung.

---

# 14. FINANCE & HPP CALCULATOR UI

### 1. Cashier Reconcile Workspace (Putri Okta):
- Form penutupan kasir terstruktur:
  $$\text{Total Kas Fisik Brankas} - (\text{Modal Kas Awal} + \text{Penjualan Kas Harian} - \text{Kasbon}) = \text{Selisih Kas (Over/Short)}$$
- Indikator visual selisih kas: Warna Hijau jika cocok (`Rp 0`), Merah jika kurang (`Short`), Kuning jika lebih (`Over`).

### 2. Recipe & HPP Calculator Engine:
- Tampilan rincian bahan resep per porsi: Nama Bahan Baku, Gramasi Terpakai, Harga Beli Satuan Terakhir, Sub-total Biaya, Biaya Kemasan/Garnish, Total HPP.
- **Price Simulator:** Slider interaktif penyesuaian harga jual menu untuk memvisualisasikan perubahan Food Cost % dan Margin Kotor secara instan.

### 3. Financial Statements:
- Pembedaan tegas visual antara **Revenue (Omzet Kotor)**, **Gross Profit (Laba Kotor)**, **Operating Profit (Laba Operasional)**, dan **Net Profit (Laba Bersih)** dengan penjelasan tooltip informatif.

---

# 15. DEVELOPMENT & ACADEMY UI

Modul Development mengawal siklus peningkatan kapasitas tim:
$$\text{Assessment Result} \longrightarrow \text{Identified Gap} \longrightarrow \text{Action Plan} \longrightarrow \text{Task Assignment} \longrightarrow \text{Progress Review} \longrightarrow \text{KPI Impact}$$

### 1. Business & HR Academy:
- Katalog modul pembelajaran terstruktur dalam bentuk kartu materi dengan indikator durasi belajar, kuis pemahaman, dan tombol *Generate Action Assignment*.

### 2. Action Plan & Task Tracker:
- **Tabel Action Plan:** Menampilkan inisiatif perbaikan, PIC penanggung jawab, batas waktu, anggaran biaya, dan persentase kemajuan (*Progress Bar*).
- **Task Card:** Kartu tugas individu yang terhubung langsung dengan nama karyawan, departemen, bukti eksekusi, dan reviewer.

### 3. Strategic Workspace (Manager Level):
- **Branding Panel:** Akses panduan aset visual merek (Logo resolusi tinggi, palet warna, tipografi standar, template seragam resto).
- **Marketing & Promotion Workspace:** Perencanaan kalender promo, simulasi anggaran kampanye, dan pemetaan segmen audiens.

---

# 16. CONTENT CREATOR UI (NAILA)

Didesain khusus untuk alur kerja visual pembuatan konten media sosial:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTENT PRODUCTION PIPELINE (KANBAN)                    [+ Buat Brief Baru] │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│ SCRIPTING    │ SHOOTING     │ EDITING      │ MANAGER REV. │ PUBLISHED       │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────┤
│ • Ide: Menu  │ • Ambil video│ • Edit Reels │ • Review Bpk.│ • TikTok Live   │
│   Tropical   │   Grill Ikan │   durasi 30s │   Heri: OK!  │   Promo Merdeka │
│   Refresh    │   Bakar      │   Sound Tren │   Siap tayang│   18.5k Views   │
│   [Brief Doc]│   [Talent:   │   [Upload V1]│   [Approve]  │   [Lihat Stats] │
│              │    Andun]    │              │              │                 │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
```

- **Content Calendar View:** Tampilan kalender bulanan interaktif dengan jadwal publikasi per platform (TikTok, Instagram Reels, Feeds, Story) lengkap dengan indikator jam tayang (*Prime Time*).

---

# 17. GLOBAL TASK SYSTEM UI

Task merupakan komponen terpadu lintas seluruh modul yang dapat ditugaskan kepada 24 personel resto:

- **Atribut Kartu Tugas:**
  - Judul Tugas & Deskripsi Jelas
  - Penerima Tugas (*Assignee Avatar & Name*)
  - Departemen Terkait (Kitchen, Bar, Service, Cleaning, CRM, Finance, Content, HR)
  - Badge Prioritas: `Urgent` (Merah), `High` (Kuning), `Normal` (Biru), `Low` (Abu-abu)
  - Batas Waktu (*Due Date & Overdue Indicator*)
  - Checklist Sub-tugas & Tombol Upload Bukti Pengerjaan (*Photo/File Attachment*)
  - Status Alur: `TODO` -> `IN PROGRESS` -> `WAITING REVIEW` -> `DONE` -> `OVERDUE`

---

# 18. REPORTING & EXPORT UI

Pusat Laporan terpadu untuk analisis dan audit berkala:
- **Filter Universal:** Rentang tanggal (Date Range Picker), Departemen, Kategori Transaksi, Status Verifikasi.
- **Export Toolbar:** Tombol ekspor simulatif berstandar tinggi: `Export PDF (Laporan Eksekutif)`, `Export Excel / CSV (Data Mentah)`, dan `Print Slip / Summary`.
- **Komparasi Tren:** Opsi toggle komparasi data terhadap periode sebelumnya (*Compare with Last Month / Year*).

---

# 19. COMPONENT SYSTEM SPECIFICATIONS

Kompilasi komponen antarmuka yang terstandarisasi di seluruh aplikasi:

| Komponen | Varian / Tipe | Deskripsi & Aturan Penggunaan |
| :--- | :--- | :--- |
| **Button** | Primary (Ungu), Secondary (Slate), Outline, Ghost, Danger (Merah) | Tinggi minimal 40px (Desktop) / 44px (Mobile). Horizontal padding = 2x Vertical padding. |
| **Input / Select** | Text, Number, Currency (Rp), Dropdown, Date | Latar belakang `#1E2438`, border `#2D374E`, focus ring `#6366F1`. |
| **Badge / Chip** | Success (Hijau), Warning (Kuning), Danger (Merah), Info (Biru), Neutral | Ukuran micro `11px - 12px` font, teks selalu 1 baris (*white-space: nowrap*). |
| **Metric Card** | Hero KPI, Standard Metric, Variance Card | Menampilkan Label, Angka Besar, Ikon Indikator Tren, dan Nilai Komparasi. |
| **Table** | Full Grid, Compact Striped, Card-Table Hybrid | Mendukung Sorting, Filter Kolom, Pagination, dan Empty/Loading Skeleton. |
| **Modal Dialog** | Confirmation, Form Input Kecil, Status Alert | Posisi tengah layar, backdrop blur (`bg-black/60 backdrop-blur-sm`), tombol Close (X). |
| **Drawer Panel** | Right Side Sheet (Lebar `480px - 640px`) | Digunakan untuk profil detail, riwayat aktivitas, dan konteks chat tanpa ganti halaman. |
| **Toast Alert** | Top-Right Pop Notification | Notifikasi auto-dismiss (3-5 detik) dengan tipe Sukses, Peringatan, atau Error. |
| **Skeleton Loader**| Pulse Animation (`bg-slate-800 animate-pulse`) | Placeholder visual saat state data sedang dimuat (*Loading State*). |

---

# 20. DATA VISUALIZATION RULES

Penggunaan grafik visual wajib berorientasi pada pemecahan masalah bisnis:

1. **Line & Area Chart:** Digunakan untuk tren waktu berkelanjutan (Grafik Revenue Harian, Tren Food Cost %, Pola Keterlambatan Absensi Bulanan).
2. **Bar Chart (Horizontal/Vertical):** Digunakan untuk komparasi kategori diskrit (Top 10 Menu Terlaris, Penjualan per Stasiun, Jam Sibuk Resto).
3. **Donut / Pie Chart:** Digunakan untuk komposisi proporsional (Saluran Penjualan: *Dine-in vs Takeaway vs Delivery*, Komposisi Pengeluaran OPEX).
4. **Heatmap Table:** Digunakan untuk memetakan jam sibuk (*Peak Hours*) dan intensitas pesanan menu per hari/jam.
5. **Sparklines:** Grafik mini tanpa aksis di dalam kartu metrik untuk melihat arah tren secara sekilas.

---

# 21. TABLE & DATA GRID UX

1. **Pencarian & Filter Instan:** Kotak pencarian global dengan debouncing 300ms serta filter dropdown multi-kategori.
2. **Sticky Header:** Header kolom tabel tetap terlihat saat pengguna menggulir data panjang (*sticky top-0*).
3. **Row Actions:** Aksi baris cepat (Lihat Detail, Edit, Hapus, Cetak) ditampilkan di kolom paling kanan dengan tombol ikon yang jelas.
4. **Mobile Responsive Hybrid:** Pada layar ponsel (<768px), tabel otomatis beralih menjadi format kartu tumpuk (*Card Stack List*) yang ramah sentuhan.

---

# 22. FORM UX & VALIDATION PATTERNS

1. **Pengelompokan Form (Section Grouping):** Formulir panjang dibagi menjadi grup logis: *Informasi Utama*, *Detail Operasional*, *Penugasan Tim*, dan *Lampiran Bukti*.
2. **Indikator Wajib (*Required Mark*):** Tanda bintang merah (`*`) pada field wajib diisi.
3. **Validasi Real-Time:** Pesan error ditampilkan langsung di bawah input dengan teks merah jelas (*Inline Feedback*).
4. **Konfirmasi Aksi Destruktif:** Tindakan penghapusan data atau pembatalan transaksi wajib memicu modal konfirmasi dengan tombol merah tegas.

---

# 23. MODAL, DRAWER & FULL-PAGE WORKFLOW

- **Modal Kecil / Sedang:** Digunakan untuk konfirmasi, clock-in presensi, input log wasting, dan pengajuan break.
- **Side Drawer (Sheet):** Digunakan untuk melihat profil lengkap karyawan, detail transaksi pelanggan, konteks AI Closing Assistant, dan riwayat dokumen SOP.
- **Full Page:** Digunakan untuk Management Command Center, Rekapitulasi MBR, dan Builder Template Matrix Checklist/KPI.

---

# 24. NOTIFICATION ARCHITECTURE & UX

Notifikasi dikelompokkan ke dalam 4 tingkat urgensi:
- **CRITICAL (Merah):** Peringatan stok habis bahan utama, selisih kas kasir tidak seimbang, keterlambatan tugas >24 jam.
- **WARNING (Kuning):** Pengajuan break/lembur staf baru masuk, stok mendekati batas minimum, reservasi belum di-follow up.
- **SUCCESS (Hijau):** Checklist shift berhasil diverifikasi supervisor, target omzet harian tercapai, payroll berhasil dihitung.
- **INFO (Biru):** Informasi pergantian shift, rilis SOP baru, pengumuman internal manajemen.

*Prinsip Interaksi:* Setiap notifikasi wajib memiliki tombol aksi langsung (*Actionable Button*, contoh: "Tinjau Pengajuan", "Buka Stok").

---

# 25. EMPTY, LOADING & ERROR STATES

Setiap view dan komponen data wajib mengimplementasikan 4 state secara eksplisit:

```
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│       LOADING STATE       │ │        EMPTY STATE        │ │        ERROR STATE        │
├───────────────────────────┤ ├───────────────────────────┤ ├───────────────────────────┤
│ [Skeleton Pulse Bars]     │ │ [Ilustrasi Ikon Halus]    │ │ [Ikon Peringatan Merah]   │
│ "Memuat data operasional  │ │ "Belum ada pengajuan      │ │ "Gagal memuat data        │
│  TropicalOS..."           │ │  istirahat hari ini."     │ │  karyawan. Coba lagi."    │
│                           │ │ [+ Buat Pengajuan Baru]   │ │ [Tombol: Muat Ulang Data] │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

---

# 26. MOBILE EXPERIENCE FOR FLOOR STAFF

Staf operasional lantai (Waiter, Cook, Cleaning, Barista) banyak mengakses sistem melalui smartphone:
- **Ukuran Touch Target:** Minimal `44px x 44px` untuk semua tombol dan checkbox.
- **Akses Sekali Sentuh:** Fitur utama staf diletakkan di bagian atas layar ponsel (*Hero Action Cards*: Tombol Presensi, Tombol Request Istirahat, Checklist Stasiun Saya).
- **Offline Resilience (Mock State):** State perubahan checklist disimpan langsung ke penyimpanan lokal agar tidak hilang jika koneksi wifi dapur terputus sesaat.

---

# 27. ACCESSIBILITY & CONTRAST STANDARDS

1. **Rasio Kontras Warna (WCAG AA Standard):** Kontras teks utama terhadap background minimal `4.5:1` untuk body text dan `3:1` untuk judul besar.
2. **Keyboard Navigation:** Seluruh modal dan dropdown dapat ditutup menggunakan tombol keyboard `Escape`, dan elemen form dapat dijangkau menggunakan tombol `Tab`.
3. **Focus State Jelas:** Ring fokus berwarna ungu cerah (`focus:ring-2 focus:ring-purple-500`) pada elemen interaktif yang sedang aktif.

---

# 28. UX LANGUAGE & COPYWRITING RULES

1. **Bahasa Indonesia Profesional & Baku:** Menggunakan istilah yang komunikatif dan ramah pengguna restoran (contoh: *Bahan Baku, Penjualan Bersih, Pengajuan Istirahat, Jam Lembur*).
2. **Larangan Underscore pada Label UI:** Dilarang menampilkan nama variabel mentah database (contoh: ubah `basic_salary` menjadi `Gaji Pokok`, `shift_start_time` menjadi `Jam Mulai Shift`).
3. **Zero Jargon Teknis:** Menghindari pesan error teknis seperti *NullPointerException* atau *Network 500*; ganti dengan pesan solutif seperti *"Koneksi data terputus. Silakan klik tombol Muat Ulang"*.

---

# 29. FRONTEND-FIRST DESIGN CONSTRAINTS

Spesifikasi UI/UX ini dirancang khusus untuk implementasi **Frontend-First**:
- Seluruh interaksi, animasi, dan transisi form beroperasi di atas **Mock Data Service Abstraction Layer** (`/src/services/*`).
- Tidak mengasumsikan adanya koneksi langsung ke backend, database cloud, atau WhatsApp gateway produksi.
- Arsitektur komponen disiapkan secara *Backend-Ready*, sehingga saat integrasi API dilakukan di masa depan, tidak diperlukan perubahan struktur tampilan antarmuka sama sekali.

---

# 30. DESIGN SYSTEM GOVERNANCE

Dokumen `/doc/UI_UX.md` ini menjadi acuan tunggal dan standar kualitas tertinggi (*Single Source of Truth*) untuk seluruh perancangan antarmuka, tata letak, warna, tipografi, dan perilaku interaksi dalam proyek **TROPICALOS**. Setiap perubahan atau penambahan komponen di masa mendatang wajib merujuk dan mematuhi spesifikasi yang tertuang di dalam dokumen ini.
