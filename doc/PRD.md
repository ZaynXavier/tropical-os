# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# TROPICALOS — Restaurant Business Operating System

**Document Version:** 1.0.0  
**Project Name:** TROPICALOS  
**Target Enterprise:** Tropical Garden Resto  
**Document Status:** Approved Architecture Plan  
**Scope Focus:** Frontend System Architecture & UI/UX Foundations  

---

## 1. Product Overview
**TropicalOS** adalah Sistem Operasi Bisnis (Business Operating System) terintegrasi berbasis web yang dirancang khusus untuk menggerakkan dan mengorkestrasi seluruh lini operasi, manajemen, SDM, keuangan, pemasaran, dan pengembangan strategis **Tropical Garden Resto**. 

TropicalOS menyatukan sembilan pilar fungsional utama ke dalam satu ekosistem antarmuka terpadu:
1. **Executive Management Command Center (Dashboard)**
2. **Tropical HR (Human Resource & Performance Management)**
3. **Tropical CRM (Sales, Reservations & WhatsApp Omnichannel)**
4. **Operations (End-to-End Restaurant Execution & Kitchen Management)**
5. **Finance (Revenue, Cashier, HPP/Costing & Profitability)**
6. **Development (Business/HR Academy, Assessment, Action Plan & Strategic Growth)**
7. **Content Creator (Campaign, Content Calendar & Production Engine)**
8. **Reports & Monthly Business Review (MBR Analytical Engine)**
9. **System Settings & Centralized Governance**

---

## 2. Problem Statement
Sebelum adanya TropicalOS, Tropical Garden Resto menghadapi berbagai tantangan operasional dan manajerial umum pada industri food & beverage:
- **Silo Data & Fragmentasi Komunikasi:** Data absensi, persediaan dapur, sales kasir, reservasi pelanggan, dan costing HPP tercecer di berbagai spreadsheet, catatan manual, dan aplikasi perpesanan personal.
- **Keterbatasan Visibilitas Eksekutif:** Owner dan Manager kesulitan mendeteksi akar masalah (root cause) saat terjadi penurunan margin, lonjakan food waste, atau keterlambatan pelayanan.
- **Standarisasi Kerja yang Lemah:** SOP, Instruksi Kerja (IKA), dan checklist harian tidak terkoneksi secara langsung dengan KPI personal karyawan dan perhitungan insentif/payroll.
- **Losses pada Food Cost & Wastage:** Belum tersedianya kalkulasi HPP teoritis versus aktual secara real-time yang memicu kebocoran bahan baku dan inefisiensi porsi.
- **Follow-up Reservasi Tidak Terstruktur:** Prospek event, reservasi rombongan, dan penanganan komplain pelanggan lambat ditangani tanpa adanya CRM pipeline dan asisten percakapan terpadu.

---

## 3. Product Vision
Menjadikan Tropical Garden Resto sebagai restoran modern dengan operasional presisi tinggi (*high-precision operational excellence*), di mana:
- Setiap staf mengetahui tugas, jadwal, dan target checklist-nya dengan transparan.
- Setiap supervisor memiliki kontrol penuh atas shift, kualitas pelayanan, dan kepatuhan standar.
- HR dapat mengelola seluruh siklus SDM dari job description, absensi, break, evaluasi KPI, hingga payroll secara objektif.
- Finance dan Operations dapat mengendalikan HPP, pemborosan, dan efisiensi pengeluaran.
- Owner memiliki *real-time command center* untuk mengambil keputusan berbasis data analitik yang akurat.

---

## 4. Business Goals
1. **Mengurangi Food Cost Variance & Wastage:** Menekan varians HPP aktual vs teoritis di bawah 3% melalui pencatatan batch produksi dan log pemborosan transparan.
2. **Meningkatkan Kepatuhan SOP & Checklist:** Mencapai tingkat penyelesaian checklist shift harian (Kitchen, Bar, Service, Cleaning) di atas 95%.
3. **Optimasi Waktu Respon CRM & Konversi Reservasi:** Mempercepat respon lead pelanggan via WhatsApp CRM dan meningkatkan rasio closing event/reservasi sebesar 25%.
4. **Otomatisasi Payroll & Perhitungan KPI:** Memangkas waktu rekapitulasi gaji bulanan dari 3 hari menjadi hitungan menit dengan integrasi absensi, lembur, potongan, dan skor KPI.
5. **Akurasi Review Bulanan (MBR):** Menyediakan laporan evaluasi bulanan multi-divisi otomatis tanpa rekapitulasi manual.

---

## 5. User Roles & Access Levels
Aplikasi membedakan hak akses ke dalam **4 Access Level** hierarkis dengan prinsip pemisahan ketat antara *Access Level*, *Department*, *Primary Position*, dan *Additional Responsibility*:

```
               ┌───────────────────────┐
               │         OWNER         │ (Full Executive Visibility)
               └───────────┬───────────┘
                           │
               ┌───────────▼───────────┐
               │        MANAGER        │ (Full Operations, HR & Settings Control)
               └───────────┬───────────┘
                           │
               ┌───────────▼───────────┐
               │      SUPERVISOR       │ (Shift Control, Approvals & Verification)
               └───────────┬───────────┘
                           │
               ┌───────────▼───────────┐
               │         STAFF         │ (Daily Execution, Checklists & Self-Service)
               └───────────────────────┘
```

### Matriks Definisi Akses:
1. **OWNER:** Akses eksekutif penuh ke seluruh visualisasi data, Management Command Center, laporan lintas divisi, analitik margin/profitabilitas, audit mutu, dan Monthly Business Review.
2. **MANAGER:** Akses manajerial dan kontrol operasional penuh ke semua modul, konfigurasi sistem (Settings), approval tingkat lanjut, kebijakan insentif, data HR, dan strategi pemasaran/branding.
3. **SUPERVISOR:** Akses pengawasan shift harian, verifikasi checklist operasional, input shift report, persetujuan request istirahat/lembur lini pertama, monitoring stock opname, dan evaluasi harian staf.
4. **STAFF:** Akses terfokus pada Portal Self-Service (Absensi, Request Break, Lembur, Slip Gaji, Dokumen), pelaksanaan checklist shift tugas divisinya, dan eksekusi task harian.

---

## 6. Organization Structure & Personnel Mapping
Struktur organisasi Tropical Garden Resto dipetakan secara terperinci untuk memastikan fleksibilitas peran tambahan tanpa mengunci departemen primer:

| Nama Personel | Primary Position | Department | Access Level | Additional Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Tri Hermawanto** | Owner | Executive | OWNER | Executive Board & Strategic Investor |
| **Heri Setiawan** | Manager | Management | MANAGER | Head of HR, General Operations & System Admin |
| **Putri Okta** | Supervisor | Operational | SUPERVISOR | Supervisor Kasir, Shift Lead & Cash Audit |
| **Andun** | Head Kitchen | Kitchen | SUPERVISOR | Kitchen Shift Lead, Menu Quality & Recipe Guard |
| **Alfan** | Head Kitchen | Kitchen | SUPERVISOR | Kitchen Shift Lead, Inventory & Prep Supervisor |
| **Ulum** | Cook | Kitchen | STAFF | Purchasing, Stock Management & Produksi Setengah Jadi |
| **Tasnim** | Cook | Kitchen | STAFF | Purchasing, Stock Management & Produksi Setengah Jadi |
| **Fandi** | Cook | Kitchen | STAFF | Kitchen Daily Prep & Line Cooking |
| **Panji** | Cook | Kitchen | STAFF | Kitchen Daily Prep & Line Cooking |
| **Tian** | Cook Helper | Kitchen | STAFF | Mise en Place & Dish Assembly |
| **Budi** | Cook Helper | Kitchen | STAFF | Prep Station & Kitchen Sanitation |
| **Dina** | Head Bar | Bar | SUPERVISOR | Bar Shift Lead, Recipe & Beverage Costing |
| **Azizah** | Barista | Bar | STAFF | Beverage Prep, Coffee Brewing & Bar Service |
| **Mujab** | Barista | Bar | STAFF | Beverage Prep & Bar Inventory Control |
| **Vita** | Head Waiter | Service | SUPERVISOR | Service Shift Lead & Kasir Operasional |
| **Bintang** | Waiter | Service | STAFF | Table Service, Order Taking & Guest Relations |
| **Yuda** | Waiter | Service | STAFF | Table Service & Floor Cleanliness |
| **Roziqin** | Waiter | Service | STAFF | Table Service & Guest Flow Management |
| **Rini** | Cleaning & Dishwash | Cleaning | STAFF | Dishwashing, Cutlery Sanitizing & Floor Cleanliness |
| **Reno** | Cleaning & Dishwash | Cleaning | STAFF | Waste Handling, Deep Cleaning & Area Maintenance |
| **Aqib Latuh** | CRM Lead | CRM | STAFF / SUPERVISOR | Lead Management, Reservation Pipeline & Guest Retention |
| **Arfani** | CRM Staff | CRM | STAFF | WhatsApp Chat, Guest Follow-up & Booking Intake |
| **Ristania Larasati** | Finance Officer | Finance | STAFF / SUPERVISOR | Cash Flow, Petty Cash, HPP Accounting & Invoicing |
| **Naila** | Content Creator | Marketing | STAFF | Content Planning, Video/Photo Production & Social Media |

*Catatan Arsitektur:* Field `additional_responsibilities` disimpan sebagai array string/relation terpisah pada entitas employee agar Ulum dan Tasnim dapat mengakses modul Purchasing, Inventory, dan Produksi tanpa harus mengubah departemen primer mereka dari Kitchen.

---

## 7. Access Control & RBAC Principles
1. **Prinsip Least Privilege:** Pengguna hanya dapat melihat menu, modul, dan data yang diotorisasi berdasarkan kombinasi `role`, `division`, dan `additional_responsibilities`.
2. **Dynamic UI Filtering:** Menu navigasi utama dan sub-menu dirender secara dinamis oleh selector terpusat (`getFilteredNavigationTree`). Komponen terlarang tidak hanya disembunyikan via CSS, tetapi dicegah dari mounting.
3. **Approval Guarding:** Tombol-tombol eksekusi verifikasi (Verifikasi Checklist, Approval Lembur, Approval Break, Approval PO) disanitasi sehingga hanya level SUPERVISOR, MANAGER, dan OWNER yang dapat memicu event perubahan status.
4. **Zero Hardcoded Authorization:** Aturan izin dienkapsulasi dalam helper fungsional terpusat (misal: `hasPermission(user, 'APPROVE_LEAVE')`) untuk memudahkan migrasi ke token-based JWT permissions saat integrasi backend.

---

## 8. Master Navigation Tree
Hierarki menu TropicalOS dirancang komprehensif, konsisten, dan terstandardisasi:

```
TROPICALOS
│
├── 1. DASHBOARD
│   └── Management Command Center (Executive Analytics)
│
├── 2. TROPICAL HR
│   ├── Employee (Data Karyawan & Profil Lengkap)
│   ├── Organization (Bagan & Struktur Organisasi)
│   ├── Attendance (Presensi Masuk/Pulang & GPS/Foto Frontend)
│   ├── Shift & Schedule (Plotting 2 Shift Resmi)
│   ├── Break Request (Pengajuan Istirahat Mandiri & Approval)
│   ├── Payroll & Penggajian (Engine Gaji, Tunjangan, Potongan & Slip)
│   ├── SOP (Standard Operating Procedures & Akseptasi Karyawan)
│   ├── Job Description (Deskripsi Peran & Tanggung Jawab)
│   ├── IKA (Instruksi Kerja Aplikasi & Panduan Lapangan)
│   ├── Checklist (Manajemen Template & Matrix Tugas HR)
│   ├── KPI Personal (Scorecard Individu & Evaluasi Kinerja)
│   ├── HR Documents (Arsip Surat, Kontrak, Sertifikat & SK)
│   └── HR Reports (Laporan Absensi, Lembur, Turnover & Manpower)
│
├── 3. TROPICAL CRM
│   ├── Customer (Database Tamu Loyal & Profil VIP)
│   ├── Lead (Manajemen Prospek Event & Wedding/Gathering)
│   ├── Pipeline (Kanban Board Prospek Penjualan)
│   ├── WhatsApp Web (Antarmuka Chat Pelanggan Terpadu)
│   ├── WhatsApp QR Login (Simulasi Status Konektivitas QR)
│   ├── Chat Customer (Riwayat Percakapan & Quick Replies)
│   ├── AI Closing Assistant (Rekomendasi Respons & Objection Handling)
│   ├── WhatsApp Blast (Segmentasi Pesan & Campaign Broadcast)
│   ├── Follow Up (Pengingat Interaksi & Task CRM)
│   ├── Reservation (Manajemen Meja, DP & Jadwal Kedatangan)
│   └── CRM Calendar (Kalender Event & Agenda Booking)
│
├── 4. OPERATIONS
│   ├── Daily Checklist (Checklist Pembukaan, Operasional & Penutupan)
│   ├── Shift Operations (Serah Terima Shift & Catatan Supervisor)
│   ├── Kitchen (Station Prep, Line Cooking & Kualitas Makanan)
│   ├── Bar (Beverage Bar Station, Espresso Machine & Cup Prep)
│   ├── Service (Table Flow, Kebersihan Area Makan & Standar Layanan)
│   ├── Cleaning & Dishwash (Sanitasi Dapur, Tempat Cuci Piring & Sampah)
│   ├── Purchasing (Purchase Request & Order Bahan Baku)
│   ├── Inventory (Stok Barang, Satuan, Opname & Alert Kritis)
│   ├── Production (Batch Masak Bumbu & Produksi Setengah Jadi)
│   └── Wasting (Pencatatan Bahan Rusak, Expired, Spoilage & Gosong)
│
├── 5. FINANCE
│   ├── Revenue (Pendapatan Harian, Saluran Penjualan & Rata-rata Bill)
│   ├── Cashier (Rekonsiliasi Kas, Kasbon, Setoran & Laporan Tutup Kasir)
│   ├── HPP (Kalkulator Recipe, Food Cost Teoritis vs Aktual & Simulasi Harga)
│   ├── Expenses (Biaya Listrik, Gas, Air, Maintenance & Operasional)
│   ├── Financial Reports (Neraca Kas, Laba Kotor & Arus Kas Sederhana)
│   └── Profitability (Analisis Kontribusi Margin & EBITDA)
│
├── 6. DEVELOPMENT
│   ├── Business Academy (Modul Bisnis, SOP Leadership & Best Practices)
│   ├── HR Academy (Manajemen SDM, Coaching & Resolusi Konflik)
│   ├── Business Assessment (Audit Berkala, Skor & Analisis Kesenjangan/Gap)
│   ├── Action Plan (Rencana Aksi Korektif & Target Peningkatan)
│   ├── Task (Penugasan Tugas Pengembangan Spesifik & Deadline)
│   ├── Progress (Pelacak Kemajuan Inisiatif Strategis)
│   ├── Branding (Panduan Visual, Aset Merek & Tone of Voice)
│   ├── Marketing (Riset Target Pasar, Strategi Promosi & Journey Tamu)
│   └── Promotion (Manajemen Kupon, Diskon Event & Kalender Promo)
│
├── 7. CONTENT CREATOR
│   ├── Content Calendar (Jadwal Publikasi TikTok, IG Reels & Feeds)
│   ├── Content Task (Brief Pembuatan Video, Foto Menu & Copywriting)
│   ├── Campaign (Tema Bulanan, Seasonal Menu & Kolaborasi Kreatif)
│   ├── Production (Status Shooting, Editing, Review & Approval Manager)
│   └── Performance (Analisis Engagement, Reach, Views & ROI Konten)
│
├── 8. REPORTS
│   └── Monthly Business Review (Sintesis Eksekutif Bulanan Lintas Divisi)
│
└── 9. SETTINGS
    ├── Company Profile (Informasi Outlet & Identitas Usaha)
    ├── Users & Permissions (Akun Login & Pengaturan Hak Akses)
    ├── Master Data (Kategori, Satuan Unit, Supplier & Bahan Baku)
    ├── System Preferences (Pengaturan Shift, Notifikasi & Simulasi)
    └── Backup & Data Export (Eksport Mock State JSON / CSV)
```

---

## 9. Module Overview & Functional Matrix

| Modul | Target Pengguna Utama | Input Utama | Output Kunci |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Owner & Manager | Data transaksi, HR, Ops, Finance, CRM | Executive KPI Card, Grafik Tren, Anomaly Warning |
| **Tropical HR** | Manager, Supervisor, Seluruh Staf | Data pegawai, log absensi, pengajuan break/lembur | Rekap kehadiran, Payroll Slip, Matrix KPI, File SOP |
| **Tropical CRM** | CRM Lead, CRM Staff, Supervisor | Input lead, chat log, data booking/DP | Pipeline Deals, Kalender Event, AI Response Drafts |
| **Operations** | Supervisor, Kitchen, Bar, Service, Cleaning | Checklist item checks, suhu chiller, foto bukti | Kepatuhan shift, Log Wasting, Purchase Request |
| **Finance** | Finance Officer, Kasir, Manager | Laporan kasir, bon belanja, harga supplier | Margin HPP per Menu, Laba Bersih, Rekonsiliasi Kas |
| **Development** | Manager, Supervisor, Owner | Hasil audit gap, inisiatif strategi | Lembar Action Plan, Progress Tracker, Aset Brand |
| **Content Creator** | Naila (Content Creator), Manager | Ide konten, brief video, aset visual | Kalender Konten, Workflow Approval, Metrik Views |
| **MBR Reports** | Owner, Manager | Agregasi data 8 divisi | Dokumen Review Bulanan, Analisis RCA & Rekomendasi |

---

## 10. Dashboard Requirements (Management Command Center)
Management Command Center adalah pusat kendali analitik eksekutif bagi Owner dan Manager yang wajib menampilkan **10 Dimensi Metrik Bisnis** secara mendalam:

### 10 Dimensi Analitik:
1. **Sales & Revenue:**
   - Total Sales (Harian, MTD, YTD) dengan komparasi target, bulan lalu, dan tahun lalu.
   - Breakdown Saluran Penjualan: *Dine In*, *Take Away*, *Delivery (GoFood/GrabFood/ShopeeFood)*.
   - Metrik Transaksi: *Average Check (Rata-rata belanja per bill)*, *Guest Count*, *Total Bill Count*.
   - Heatmap & Analitik: Sales per Hari, Sales per Jam (Deteksi jam sibuk/peak vs jam sepi/valley), Sales per Shift (Pagi vs Siang).
2. **Menu Performance:**
   - Top 10 Best Seller & Bottom 10 Slow Moving Items (Unit terjual & Total Nilai).
   - Menu Mix Matrix (Stars, Plowhorses, Puzzles, Dogs berdasarkan popularitas vs profit margin).
   - Contribution Margin per kategori produk.
   - Add-on Attach Rate (Persentase pesanan makanan yang menyertakan minuman/dessert/side dish).
3. **Food Cost & COGS:**
   - Rekonsiliasi: Stok Awal + Pembelian + Transfer Masuk - Transfer Keluar - Stok Akhir.
   - Actual Food Cost % vs Theoretical Food Cost % beserta nilai varians dan deviasi rupiah.
   - Breakdown Biaya Pemborosan: *Wasting Log*, *Spoilage/Basi*, *Complimentary/Tamu*, *Staff Meal*, *Stock Adjustment*.
4. **Inventory Health:**
   - Status Stock Opname Terakhir & Skor Akurasi Fisik vs Sistem (%).
   - Indikator Dead Stock, Slow Moving, dan Fast Moving Items.
   - Aging Stock (Umur persediaan bahan baku) & Indeks Kepatuhan FEFO (First-Expired, First-Out).
5. **Labor & Productivity:**
   - Total Manpower Aktif per Shift.
   - Labor Cost % terhadap Total Revenue.
   - Rasio Produktivitas: *Sales per Employee* dan *Sales per Labor Hour*.
   - Metrik Kehadiran: Total Jam Lembur, Tingkat Keterlambatan, Absensi/Izin, dan Rasio Turnover Karyawan.
6. **Operational Expenses (OPEX):**
   - Rincian Utilitas: Listrik, Gas LPG, Air Bersih/PDAM, Laundry Linen, Bahan Kimia Cleaning, ATK & Perlengkapan.
   - Biaya Perawatan Mesin/Gedung, Royalty/Sewa, Jasa Pest Control, dan Marketing Expense.
7. **Customer Experience & Service Speed:**
   - Skor Reputasi Online: Google Review Rating, Tren Ulasan Bintang 1-5, dan Sentimen Komplain.
   - Metrik Kasir Kritis: Jumlah Transaksi Refund, Edit Bill, dan Pembatalan Meja/Void.
   - Kecepatan Layanan: *Average Waiting Time (Waktu tunggu meja)* & *Average Serving Time (Waktu masak hingga tersaji)*.
8. **Quality & Compliance Audit:**
   - Nilai Inspeksi Keamanan Pangan (Food Safety Audit) & Skor Kebersihan Chiller/Dapur.
   - Evaluasi Mystery Shopper & Skor Audit Pelayanan Service Front-of-House.
9. **People & Organizational Health:**
   - Total Jam Pelatihan SDM (Training Hours) & Sesi Coaching Selesai.
   - Catatan Kasus Disipliner/SP, Promosi Karyawan, Pelamar Baru, dan Rekap Resign.
10. **Profitability & Bottom Line:**
    - Gross Profit, Operating Profit, EBITDA, dan Estimasi Net Profit margin (%).

### Diagnostic Business Answering Tool:
UI Command Center harus dilengkapi filter diagnostik interaktif untuk menjawab pertanyaan kritis:
- *Kenapa sales turun?* (Drill-down ke channel sepi, jam drop, atau cuaca).
- *Kenapa HPP naik?* (Identifikasi bahan baku dengan lonjakan harga atau resep dengan wastage tinggi).
- *Kenapa rating tamu turun?* (Kompilasi tag komplain terbanyak: kecepatan, rasa, kebersihan, atau keramahan).

---

## 11. Tropical HR Requirements

### 1. Modul Employee & Profil Karyawan
- Manajemen biodata komprehensif: NIK, Nama, Tanggal Lahir, Kontak, Email, Rekening Bank, Gaji Pokok, Tunjangan Harian.
- Pengaturan Status Kerja: *Full-Time*, *Contract*, *Probation*.
- Pemetaan Multi-Peran: Departemen primer, Posisi primer, serta daftar `additional_responsibilities`.

### 2. Modul Organization
- Visualisasi bagan pohon hierarki organisasi interaktif (Owner -> Manager -> Supervisor -> Staff).
- Penentuan jalur pelaporan (*reporting line*) dan penanggung jawab per station (Kitchen, Bar, Service, Kasir, Cleaning, CRM, Finance, Content).

### 3. Modul Attendance & Presensi
- **Frontend Clock In / Clock Out:**
  - Simulasi validasi koordinat GPS (Radius geofencing outlet Tropical Garden Resto: 50 meter).
  - Alur Verifikasi Wajah (Face Verification UI Flow) dengan preview webcam lokal dan penandaan biometrik simulatif.
- **Histori Presensi Real-Time:** Filter berdasarkan tanggal, departemen, dan status kehadiran (Hadir Tepat Waktu, Terlambat, Izin, Sakit, Alpha).

### 4. Modul Shift & Schedule (Hanya 2 Shift Resmi)
Sistem membatasi jadwal kerja operasional hanya pada **2 Shift Resmi**:
- **Shift Pagi:** 09:00 – 19:00 WIB
- **Shift Siang:** 13:00 – 23:00 WIB
- Fitur penugasan jadwal mingguan per staf, rotasi shift, dan indikator staf yang sedang aktif bertugas saat ini (*on-duty right now*).

### 5. Modul Break Request (Multiple Breaks per Kehadiran)
- Pengajuan istirahat mandiri dari portal staf:
  - Tipe Istirahat: *Standard Break (Makan/Istirahat Wajib 60 Menit)* atau *Additional Break (Ibadah/Keperluan Mendesak 15-30 Menit)*.
- Alur Status: `PENDING APPROVAL` -> `APPROVED` / `REJECTED` -> `IN PROGRESS` -> `COMPLETED`.
- Notifikasi ke Supervisor untuk persetujuan cepat agar operasional meja/kitchen tidak kosong saat jam sibuk.

### 6. Modul Payroll & Penggajian
- Engine kalkulasi gaji bulanan otomatis:
  $$\text{Take Home Pay} = \text{Gaji Pokok} + \text{Tunjangan Harian} + \text{Lembur} + \text{Insentif KPI} - (\text{Kasbon} + \text{Potongan Keterlambatan} + \text{BPJS})$$
- Status Siklus Payroll: `Draft` -> `Calculated` -> `Reviewed by Manager` -> `Approved by Owner` -> `Paid`.
- Cetak / Tampilan Slip Gaji digital karyawan yang rapi dan dapat diunduh (PDF simulation).

### 7. Modul SOP, Job Description & IKA
- **SOP (Standard Operating Procedure):** Manajemen dokumen SOP terstruktur per kategori (Kitchen, Service, Bar, Cleaning, Hygiene), versi dokumen, tanggal berlaku, dan riwayat akseptasi/tanda tangan digital karyawan.
- **Job Description:** Rincian tanggung jawab, fungsi utama, dan hubungan langsung dengan metrik KPI.
- **IKA (Instruksi Kerja Aplikasi / Instruksi Kerja Lapangan):** Panduan visual langkah demi langkah untuk pekerjaan operasional spesifik (misal: Kalibrasi Grinder Kopi, Pembersihan Grease Trap, Prosedur Deep Frying).

### 8. Modul Checklist & KPI Personal
- **Checklist:** Distribusi checklist rutin (Harian, Mingguan, Bulanan) berbasis peran jabatan.
- **KPI Personal:** Kartu penilaian kinerja individu bulanan dengan bobot terukur (Hospitality, Ketepatan Waktu, Efisiensi/Speed, Kebersihan/Hygiene, Target Penjualan).

### 9. Modul HR Documents & Reports
- Digital Locker untuk KTP, Kontrak Kerja (PKWT/PKWTT), Surat Peringatan (SP), dan Sertifikat Pelatihan.
- Laporan HR komprehensif: Rekap jam lembur bulanan, tren absensi, tingkat turnover, dan rasio biaya tenaga kerja.

---

## 12. Tropical CRM Requirements

### 1. Customer Database & Profil Tamu
- Arsip lengkap data pelanggan, nomor WhatsApp, riwayat kunjungan, total spending (*Lifetime Value*), preferensi meja, alergi makanan, dan status loyalitas (Reguler, VIP, VVIP, Corporate).

### 2. Lead Management & Visual Pipeline
- Manajemen prospek event (Ulang tahun, Arisan, Wedding, Gathering Perusahaan, Reservasi Grup >10 pax).
- Kanban Board Pipeline Interaktif dengan tahapan:
  $$\text{New Lead} \longrightarrow \text{Contacted / Discovery} \longrightarrow \text{Quotation Sent} \longrightarrow \text{Negotiation} \longrightarrow \text{Down Payment / Won} \longrightarrow \text{Closed / Lost}$$
- Fitur drag-and-drop kartu deal dan pencatatan estimasi nilai transaksi.

### 3. WhatsApp Omnichannel & Simulasi QR Login
- **Antarmuka WhatsApp Web:** Layout perpesanan 2 panel (Daftar chat di kiri, ruang percakapan & info detail pelanggan di kanan).
- **Simulasi Konektivitas QR:** Modal scan QR code simulatif untuk menghubungkan nomor admin resto dengan status indikator koneksi (`Connected`, `Re-connecting`, `Offline`).

### 4. AI Closing Assistant (Human-in-the-Loop)
*Catatan Penting:* AI bertindak sebagai **Co-Pilot / Asisten Rekomendasi**, bukan bot pengirim otomatis tanpa kontrol manusia.
- Analisis Konteks Percakapan: Membaca riwayat pesan tamu dan menentukan niat pelanggan (*Intent Recognition*: Tanya Menu, Minta Diskon, Cek Ketersediaan VIP Room, Komplain).
- Rekomendasi 3 Alternatif Balasan: Formal, Ramah/Kasual, dan Penawaran Persuasif (Closing Offer).
- Pembuat Pesan Follow-Up Otomatis dan Saran Penanganan Keberatan (*Objection Handling* saat tamu mengeluhkan harga paket).

### 5. WhatsApp Blast & Follow-Up System
- Generator kampanye pesan siaran bertarget (Segmentasi tamu ulang tahun bulan ini, pelanggan VIP yang belum berkunjung 30 hari, promo akhir pekan).
- Penjadwal Follow-up otomatis dengan task reminder bagi CRM staff.

### 6. Reservation Management & CRM Calendar
- Jadwal Reservasi Meja dengan status DP, jumlah pax, jam kedatangan, dan denah penempatan meja.
- Kalender CRM interaktif bulanan/mingguan yang menampilkan jadwal event besar, booking area resto, dan aktivitas tim CRM.

---

## 13. Operations Requirements
Modul Operations mengawal pelaksanaan standar kualitas harian dengan alur: *Task -> Checklist -> Status -> Assignee -> Deadline -> Approval -> Attachment Bukti (Evidence) -> History Log*.

### 1. Daily Checklist & Shift Handover
- Pemisahan checklist harian ke dalam 3 fase kritis:
  - **Opening Checklist (09:00 - 10:00):** Cek suhu chiller, ketersediaan bahan, kebersihan lantai, nyalakan POS kasir, cek sound system.
  - **Operational / Running Checklist (11:30 - 14:00 & 18:00 - 20:30):** Cek stok cadangan, standar plating, kebersihan meja dan toilet setiap 60 menit.
  - **Closing Checklist (22:00 - 23:00):** Matikan kompor/gas, buang sampah, deep cleaning fryer, kunci chiller, cetak laporan shift.
- **Log Serah Terima Shift (Shift Handover):** Catatan tertulis supervisor Shift Pagi ke Shift Siang (stok menipis, komplain tamu pending, reservasi malam).

### 2. Departmental Operations Execution:
- **Kitchen:** Manajemen stasiun masak, mise en place, kalibrasi timer memasak, inspeksi suhu penyimpanan daging/sayur.
- **Bar:** Pembersihan harian mesin espresso (backflush), kalibrasi grind size, cek stock sirup dan buah segar.
- **Service:** Standar table setup, pemeriksaan kelengkapan sendok-garpu steril, kebersihan menu, dan senyum salam sapa.
- **Cleaning & Dishwash:** Jadwal deep cleaning grease trap, standar dosis sabun cuci piring sanitasi, pemisahan sampah organik/anorganik.

### 3. Purchasing, Inventory, Batch Production & Wasting:
- **Purchasing:** Alur *Purchase Request (PR)* dari kitchen/bar -> Approval Supervisor/Manager -> *Purchase Order (PO)* ke Supplier -> *Goods Receipt* dengan verifikasi kualitas barang datang.
- **Inventory:** Manajemen katalog bahan baku, konversi satuan (Kg, Gram, Liter, Porsi), status stok minim (*Low Stock Alert*), dan formulir Stock Opname fisik.
- **Batch Production:** Pencatatan pembuatan bumbu dasar, kaldu, atau saus setengah jadi (input bahan baku terpakai vs output porsi jadi yang dihasilkan).
- **Wasting Log:** Pencatatan instan bahan terbuang dengan kategori: *Kadaluarsa (Expired)*, *Rusak/Basi (Spoiled)*, *Salah Masak/Gosong (Burnt/Mistake)*, *Jatuh (Dropped)* dengan unggah foto bukti.

---

## 14. Finance Requirements

### 1. Revenue & Cashier Reconcile
- Input dan pelacakan pendapatan harian kasir dari berbagai metode pembayaran (Cash, QRIS, EDC BCA/Mandiri, Transfer Bank, Online Delivery).
- **Cashier Closing Report:** Validasi saldo awal kasir (kas kecil modal), total penjualan tunai, pengeluaran kasbon harian, setoran fisik di brankas, dan pencatatan selisih kas (*over/short*).

### 2. HPP Calculator & Menu Costing Engine
- **Master Resep (Recipe Management):** Penguraian menu menjadi komponen bahan baku mentah beserta takaran gramasi presisi.
- **Kalkulasi Biaya Pokok Penjualan (HPP):**
  $$\text{HPP per Porsi} = \sum (\text{Harga Satuan Bahan} \times \text{Gramasi Terpakai}) + \text{Cost Packaging/Garnish}$$
  $$\text{Food Cost } \% = \left(\frac{\text{HPP per Porsi}}{\text{Harga Jual Menu}}\right) \times 100\%$$
- **Price Simulator & Margin Optimizer:** Simulasi kenaikan harga beli bahan terhadap margin keuntungan menu untuk rekomendasi penyesuaian harga jual.

### 3. Operational Expenses & Petty Cash
- Pencatatan pengeluaran harian kas kecil (*Petty Cash*) lengkap dengan foto nota kuitansi.
- Pengelompokan akun biaya (Beban Listrik & Air, Beban Gas, Beban Perawatan, Beban Pemasaran, Biaya Kebersihan).

### 4. Financial Statements & Profitability
- Laporan Laba Kotor (Gross Profit) dan Laba Operasional (Operating Profit) bulanan.
- Analisis kontribusi laba per kategori produk (Makanan Tradisional, Western, Kopi, Non-Kopi, Dessert).

---

## 15. Development Requirements
Modul Development adalah akselerator pertumbuhan bisnis dan kompetensi SDM nyata melalui siklus:
$$\text{Assessment} \longrightarrow \text{Gap Analysis} \longrightarrow \text{Action Plan} \longrightarrow \text{Task Execution} \longrightarrow \text{Review} \longrightarrow \text{Progress} \longrightarrow \text{KPI Impact}$$

### 1. Business & HR Academy
- **Business Academy:** Modul pembelajaran strategi F&B, efisiensi operasional, manajemen margin, dan studi kasus pelayanan restoran.
- **HR Academy:** Modul pelatihan kepemimpinan supervisor, penanganan konflik staf, teknik coaching bawahan, dan pemahaman ketenagakerjaan.
- Penugasan *Action Assignment* nyata yang harus dipraktikkan karyawan di outlet setelah menyelesaikan modul.

### 2. Business Assessment & Gap Analysis
- Instrumen audit komprehensif untuk mengevaluasi 5 pilar resto: Layanan, Cita Rasa Produk, Kecepatan, Kebersihan, dan Efisiensi Biaya.
- Penilaian skor (1-100) otomatis dan pemetaan kesenjangan (*gap*) antara standar target dengan kondisi faktual di lapangan.

### 3. Action Plan & Task Management
- Konversi gap hasil assessment menjadi inisiatif rencana aksi konkret dengan atribut: *Nama Inisiatif*, *Penanggung Jawab (PIC)*, *Batas Waktu (Deadline)*, *Rencana Anggaran*, dan *Status Progres*.
- Distribusi task operasional turunan ke masing-masing departemen terkait.

### 4. Strategic Branding, Marketing & Promotion (Manager Level)
- **Branding:** Penyimpanan brand assets resmi (Logo HD, Panduan Warna, Brand Voice, Standard Typography, Template Seragam & Packaging).
- **Marketing:** Perencanaan strategi akuisisi pelanggan baru, riset kompetitor, dan pemetaan *Customer Buying Journey*.
- **Promotion:** Kalender promo bulanan, perancangan promo seasonal (Ramadhan, Liburan Sekolah, Akhir Tahun), voucher diskon, dan kalkulasi target ROI promosi.

---

## 16. Content Creator Requirements
Didedikasikan untuk mendukung eksekusi strategi konten media sosial Tropical Garden Resto yang dipimpin oleh **Naila (Content Creator)**:

```
┌─────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│   Marketing Strategy    │ ──> │   Monthly Campaign     │ ──> │     Content Brief      │
└─────────────────────────┘     └────────────────────────┘     └───────────┬────────────┘
                                                                           │
┌─────────────────────────┐     ┌────────────────────────┐     ┌───────────▼────────────┐
│ Performance & Analytics │ <── │  Publishing & Archive  │ <── │  Production & Approval │
└─────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```

### Fitur Fungsional:
1. **Content Calendar:** Kalender visual interaktif jadwal posting (TikTok, Instagram Reels, Feeds, Story) per hari dan jam prime time.
2. **Content Task & Brief:** Detail lembar kerja pembuatan konten: konsep video, sound tren yang digunakan, angle visual makanan, script/naskah, dan daftar talent (karyawan/model).
3. **Campaign Management:** Pengelompokan konten berdasarkan tema kampanye aktif (contoh: Promo Menu Baru Tropical Refresh, Suasana Senja Resto).
4. **Production Pipeline:** Pelacak status produksi 5 tahap: *Idea Backlog* -> *Scripting* -> *Shooting / Footage* -> *Editing* -> *Manager Review & Approval*.
5. **Performance Tracking:** Pencatatan metrik performa manual/analitis (Views, Likes, Comments, Shares, Saved, Estimasi Tamu Datang dari Konten).

---

## 17. Monthly Business Review (MBR) Requirements
Monthly Business Review (MBR) **bukanlah** tempat menginput data operasional baru, melainkan **Reporting & Analytical Intelligence Layer** yang mensintesis data dari seluruh modul secara otomatis:

### Komponen Laporan MBR:
1. **Executive Summary:** Ringkasan performa 1 halaman untuk Owner mencakup total omzet, laba kotor, HPP rata-rata, kepatuhan SOP, dan skor kepuasan tamu.
2. **Comprehensive KPI Scorecard:** Evaluasi pencapaian target divisi Sales, Kitchen, Bar, Service, HR, Finance, CRM, dan Content.
3. **Variance & Trend Analysis:** Perbandingan performa MoM (Month-over-Month) dan YoY (Year-over-Year) dengan grafik visual tren.
4. **Root Cause Analysis (RCA):** Matriks identifikasi akar masalah jika terjadi anomali (misal: "Kenapa HPP Daging naik 6%? Karena terjadi 3 kali kesalahan simpan chiller dan kenaikan harga suplier 4%").
5. **Strategic Recommendations & Next Month Action Plan:** Rekomendasi perbaikan terstruktur yang langsung dapat di-generate menjadi Action Plan baru di modul Development.

---

## 18. Cross-Module Workflows
Integrasi alur kerja tanpa sekat antar departemen:

1. **Alur Pelayanan Tamu & CRM:**
   $$\text{Lead Masuk (CRM)} \longrightarrow \text{Follow Up via WhatsApp} \longrightarrow \text{Reservasi & DP} \longrightarrow \text{Notifikasi Service (Ops)} \longrightarrow \text{Pemesanan (POS Kasir)} \longrightarrow \text{Invoice Lunas (Finance)}$$

2. **Alur Pengendalian Bahan & HPP:**
   $$\text{Master Resep (HPP)} \longrightarrow \text{Penjualan Menu (Kasir)} \longrightarrow \text{Pengurangan Bahan Teoritis} \longleftrightarrow \text{Stock Opname (Ops)} \longrightarrow \text{Wasting/Variance Report} \longrightarrow \text{Dashboard Command Center}$$

3. **Alur Pengembangan & Disiplin Karyawan:**
   $$\text{Audit Kebersihan (Assessment)} \longrightarrow \text{Temuan Gap Kebersihan Dapur} \longrightarrow \text{Penerbitan IKA/SOP Baru} \longrightarrow \text{Checklist Harian (Ops)} \longrightarrow \text{Skor Review KPI Bulanan (HR)} \longrightarrow \text{Insentif Payroll (Finance)}$$

---

## 19. Mock Data Strategy
Untuk memastikan frontend berfungsi penuh, interaktif, dan dapat diuji secara mendalam tanpa ketergantungan backend aktif:

1. **State Persistence Lokal:** Menggunakan in-memory reactive state yang diinisialisasi dari file data terstruktur (`src/data/mock*.ts`) dengan fallback sinkronisasi ke `localStorage` browser agar perubahan simulasi pengguna tidak hilang saat refresh halaman.
2. **Realistic Seed Datasets:** Mock data wajib menggunakan nama karyawan asli Tropical Garden Resto, daftar menu nyata (misal: Gurame Bakar Madu, Nasi Goreng Tropical, Es Kelapa Jeruk), nominal harga realistis, dan tanggal log yang konsisten.
3. **Deterministic ID Generation:** Penggunaan format ID konsisten (misal: `EMP-001`, `LEAD-102`, `PR-2026-08`, `PAY-2026-08`) untuk memudahkan pengujian relasi data antar entitas.
4. **Zero Supabase/Backend Coupling:** Seluruh fungsi CRUD beroperasi melalui mock service resolver yang mengembalikan response sukses/gagal secara asinkron (`Promise<{ data, error }>`) menyerupai API riil.

---

## 20. Frontend Architecture Principles

```
┌─────────────────────────────────────────────────────────────┐
│                 REACT PRESENTATIONAL UI                     │
│    Pages (/src/pages)  •  Components (/src/components)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Calls cleanly typed hooks & services)
┌──────────────────────────────▼──────────────────────────────┐
│                    SERVICE ABSTRACTION LAYER                │
│   (/src/services/employeeService, crmService, etc.)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│   MOCK DATA & LOCAL STATE   │ │    FUTURE REST/GRAPHQL API  │
│  (In-Memory & LocalStorage) │ │   (Drop-in replacement)     │
└─────────────────────────────┘ └─────────────────────────────┘
```

1. **Pemisahan UI dan Business Logic:** Komponen React murni fokus pada rendering tampilan dan penanganan interaksi pengguna. Semua manipulasi data dilakukan di dalam service layer.
2. **Clean Service Abstraction:** Setiap modul memiliki file servicenya sendiri (misal: `employeeService.ts`, `checklistService.ts`, `financeService.ts`). Komponen tidak boleh melakukan akses data mentah secara langsung.
3. **Centralized Types:** Semua tipe data TypeScript didefinisikan secara tersentralisasi pada `/src/types.ts` untuk menjamin konsistensi kontrak data.
4. **Indonesian UI Typography & Labeling:** Seluruh label antarmuka pengguna menggunakan Bahasa Indonesia yang baku, profesional, dan mudah dipahami staf (Human-readable, bebas dari karakter underscore teknis seperti `basic_salary` -> `Gaji Pokok`).
5. **No AI Slop / Generic Templates:** Desain visual mengedepankan fungsionalitas, kontras warna yang nyaman untuk staf restoran (*eye-safe light/dark layouts*), tipografi presisi, dan kepadatan informasi yang terstruktur.

---

## 21. Responsive & Cross-Device Requirements
Operasional restoran menggunakan berbagai perangkat keras dengan skenario penggunaan spesifik:

1. **Desktop & Laptop (Min. 1280px):**
   - Diperuntukkan bagi Owner, Manager, dan Admin Finance.
   - Menampilkan tabel data multi-kolom, Management Command Center interaktif, Kanban pipeline CRM, dan builder template checklist/KPI.
2. **Tablet POS & Station Display (768px - 1024px):**
   - Diperuntukkan bagi Kasir, Supervisor Lantai, dan Head Kitchen.
   - Target sentuh tombol minimal 44px, navigasi panel sentuh responsif, antarmuka checklist shift cepat, dan mode review pesanan.
3. **Smartphone Mobile (360px - 480px):**
   - Diperuntukkan bagi Staf Lapangan (Waiter, Cook Helper, Cleaning, Content Creator).
   - Fokus pada antarmuka Self-Service: Presensi Masuk/Pulang cepat, pengajuan istirahat/break darurat, centang checklist tugas perorangan, dan akses slip gaji digital.

---

## 22. Security & Privacy Principles (Frontend Phase)
1. **Sanitasi Data Biometrik:** Alur absensi verifikasi wajah pada fase frontend hanya memproses frame video secara lokal di canvas browser untuk konfirmasi visual pengguna; tidak menyimpan hash atau vektor biometrik mentah ke penyimpanan persisten.
2. **Kerahasiaan Data Finansial & Gaji:** Data komponen gaji dan rekonsiliasi kas kasir disanitasi agar tidak pernah dirender ke pengguna dengan peran STAFF.
3. **No Hardcoded Secrets:** Tidak menyematkan token API, secret key, atau kredensial sensitif di dalam kode sumber frontend.
4. **Pencegahan XSS & Input Sanitization:** Seluruh input form dibersihkan dari tag HTML berbahaya sebelum ditampilkan ke antarmuka atau disimpan ke state.

---

## 23. Backend Integration Readiness
Arsitektur frontend dirancang dengan pola *Backend-Ready Contract*:
- Semua fungsi pada modul `/src/services/*` mengembalikan objek standar berbentuk:
  ```typescript
  export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
  }
  ```
- Saat tim backend telah membangun API Server (Express/Node.js/Go/PostgreSQL), transisi hanya memerlukan penggantian implementasi internal fungsi di `/src/services/*` dari mock resolver menjadi HTTP fetch handler tanpa perlu merombak satupun kode komponen UI di `/src/components/*` atau `/src/pages/*`.

---

## 24. Future Integration Scope (Post-Frontend Roadmap)
Fitur-fitur berikut didokumentasikan sebagai rencana masa depan dan **tidak dibuat sebagai API nyata pada tahap saat ini**:
1. **WhatsApp Cloud API Resmi / Baileys Gateway:** Integrasi webhook pesan masuk dan pengiriman broadcast resmi WhatsApp Business.
2. **POS Hardware Direct Printing:** Integrasi driver printer thermal Bluetooth/ESC-POS untuk cetak bill kasir dan kitchen order ticket (KOT).
3. **Live Geolocation Verification Engine:** Verifikasi satelit GPS koordinat presensi melalui server validator.
4. **Cloud Database Multi-tenant:** Migrasi state lokal menuju PostgreSQL / Firestore dengan enkripsi tingkat basis data.

---

## 25. Development Phases & Implementation Sequence

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION & NAVIGATION CONSOLIDATION                          │
│ • Penyelarasan Master Navigation Tree & Role-Based Access Control        │
│ • Standarisasi Mock Data Organisasi & Profil 24 Personel Resto           │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: HR & EMPLOYEE SELF-SERVICE ENGINES                              │
│ • Presensi GPS/Face Flow, 2 Shift Resmi, Break Management System         │
│ • Payroll Engine, SOP/IKA Document Viewer, Checklist & KPI Scorecards    │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: OPERATIONS & KITCHEN MANAGEMENT                                 │
│ • Daily Opening/Running/Closing Checklists per Stasiun                   │
│ • Shift Handover Log, Wasting Tracker, Purchasing & Batch Production     │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: CRM, OMNICHANNEL & AI ASSISTANT                                 │
│ • Lead Kanban Pipeline, Reservasi & Kalender CRM                         │
│ • Antarmuka WhatsApp Web Simulatif & AI Closing Assistant Prompts        │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: FINANCE, HPP CALCULATOR & EXPENSES                              │
│ • Rekonsiliasi Kasir & Cash Over/Short Calculator                        │
│ • Master Resep HPP, Simulasi Margin & Pelacak Petty Cash                 │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: DEVELOPMENT, CONTENT CREATOR & MBR ENGINE                       │
│ • Business/HR Academy & Action Plan Tracker                              │
│ • Content Calendar Naila & Monthly Business Review Executive Generator   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Acceptance Criteria
1. **Kesesuaian Navigasi:** Seluruh hierarki menu pada Master Navigation Tree dapat diakses sesuai batasan role user (Owner, Manager, Supervisor, Staff) tanpa ada link mati (*dead link*) atau menu yang membingungkan.
2. **Akurasi Struktur Organisasi:** 24 personel Tropical Garden Resto terdaftar dengan jabatan primer dan tanggung jawab tambahannya masing-masing.
3. **Kepatuhan Shift:** Sistem hanya mengakomodasi Shift Pagi (09:00 - 19:00) dan Shift Siang (13:00 - 23:00).
4. **Integritas Self-Service:** Staf dapat melakukan simulasi clock-in, mengajukan istirahat darurat/standar, melihat tugas checklist shiftnya, dan meninjau slip gaji.
5. **Transparansi HPP & Wasting:** Perhitungan HPP recipe dan pencatatan wasting log menghasilkan kalkulasi margin dan varians yang matematis dan akurat.
6. **Kualitas Bahasa UI:** 100% teks UI menggunakan Bahasa Indonesia yang komunikatif, profesional, dan bebas dari nama teknis berkode (*no raw database underscores*).
7. **Zero Backend Compilation Error:** Proyek dapat di-lint dan di-build secara sempurna tanpa ketergantungan API eksternal.

---

## 27. Non-Goals & Out of Scope (Current Frontend Phase)
Untuk menjaga fokus dan kualitas implementasi, hal-hal berikut secara eksplisit berada di luar ruang lingkup fase ini:
- ❌ **Tidak Membuat Backend:** Tidak membuat server backend, endpoint API mandiri, database PostgreSQL/MySQL, atau docker server container.
- ❌ **Tidak Menggunakan Supabase CRUD:** Tidak melakukan koneksi langsung atau query CRUD ke Supabase cloud instance.
- ❌ **Tidak Mengklaim Koneksi WhatsApp Nyata:** WhatsApp Web dan Blast diimplementasikan sebagai antarmuka pengguna interaktif (UI-only simulation) tanpa integrasi bot WA gateway otomatis.
- ❌ **Tidak Menyimpan Data Biometrik:** Tidak ada penyimpanan model wajah permanen ke server.
- ❌ **Tidak Menambahkan Fitur yang Tidak Diminta:** Menolak penambahan fitur di luar 9 pilar utama yang telah disepakati pada Master Menu TropicalOS.
