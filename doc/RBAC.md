# TROPICALOS — MASTER ROLE-BASED ACCESS CONTROL (RBAC) & AUTHORIZATION SPECIFICATION

**Document Version:** 1.0.0  
**Target Enterprise:** Tropical Garden Resto  
**Authority:** Master Authorization & Security Blueprint  
**Alignment:** `/doc/PRD.md`, `/doc/INFORMATION_ARCHITECTURE.md`, & `/doc/UI_UX.md`  
**Scope:** Frontend-First Authorization Rules, Navigation Guards, Action Matrices & Special Responsibilities  

---

# 1. ACCESS LEVEL PRINCIPLES

TropicalOS mengimplementasikan **4 Access Level** hierarkis. Prinsip fundamental arsitektur ini membedakan secara tegas antara:
- **Access Level** (Tingkat Kewenangan Sistem: OWNER, MANAGER, SUPERVISOR, STAFF)
- **Department** (Divisi Fungsional: Management, Kitchen, Bar, Service, Cleaning, CRM, Finance, Content)
- **Primary Position** (Jabatan Pokok: Owner, Manager, Supervisor, Cook, Barista, Waiter, Dishwasher, CRM Lead, Finance Officer, Content Creator)
- **Additional Responsibilities** (Tanggung Jawab Tambahan: Array hak fungsional lintas departemen seperti Kasir, Purchasing, Stock, Produksi Setengah Jadi, atau HR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. OWNER (Executive Visibility)                                             │
│    • Fokus: Business Health, MBR, Margin, Analisis Risiko & Tren Finansial   │
│    • Karakteristik: Tinjauan komprehensif tanpa beban input operasional     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. MANAGER (Full Operational & Strategic Control)                           │
│    • Fokus: Eksekusi Strategi, Otoritas Lintas Divisi, HR, & Sistem Admin   │
│    • Karakteristik: Hak kelola, persetujuan multi-level & konfigurasi sistem│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. SUPERVISOR (Team Execution & Shift Approval)                             │
│    • Fokus: Kepatuhan Shift, Verifikasi Checklist, Log Kasir & Approval L1 │
│    • Karakteristik: Kontrol atas tim di bawah garis koordinasinya           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. STAFF (Personal Execution & Self-Service)                                │
│    • Fokus: Clock-in/out, Pengajuan Break, Checklist Stasiun & Task Mandiri │
│    • Karakteristik: Akses terisolasi pada data pribadi & operasional stasiun│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. ORGANIZATION STRUCTURE & 24 PERSONNEL MAPPING

Seluruh 24 personel Tropical Garden Resto dipetakan ke dalam struktur RBAC berikut sebagai *Single Source of Truth* frontend:

| No | Nama Personel | Department | Primary Position | Access Level | Additional Responsibilities | Cakupan Hak Tambahan |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Tri Hermawanto** | Executive | Owner | **OWNER** | Strategic Investor | Full Executive Visibility, All Reports, MBR |
| 2 | **Heri Setiawan** | Management | Manager | **MANAGER** | Head of HR & Admin | Full System Access, All HR Functions, Strategy |
| 3 | **Putri Okta** | Operations | Supervisor | **SUPERVISOR** | Kasir Operasional | Shift Supervision, Floor Approval, Cashier Ops |
| 4 | **Andun** | Kitchen | Head Kitchen | **SUPERVISOR** | Kitchen Shift Lead | Kitchen Checklist, Prep Station, Recipe Audit |
| 5 | **Alfan** | Kitchen | Head Kitchen | **SUPERVISOR** | Kitchen Shift Lead | Kitchen Checklist, Prep Station, Inventory Check |
| 6 | **Ulum** | Kitchen | Cook | **STAFF** | Purchasing, Stock, Produksi | Akses modul Purchasing, Inventory & Produksi |
| 7 | **Tasnim** | Kitchen | Cook | **STAFF** | Purchasing, Stock, Produksi | Akses modul Purchasing, Inventory & Produksi |
| 8 | **Fandi** | Kitchen | Cook | **STAFF** | - | Line Cooking, Kitchen Checklist & Station Tasks |
| 9 | **Panji** | Kitchen | Cook | **STAFF** | - | Line Cooking, Kitchen Checklist & Station Tasks |
| 10 | **Tian** | Kitchen | Cook Helper | **STAFF** | - | Mise en Place, Station Sanitation & Basic Tasks |
| 11 | **Budi** | Kitchen | Cook Helper | **STAFF** | - | Station Sanitation, Prep Helper & Basic Tasks |
| 12 | **Dina** | Bar | Head Bar | **SUPERVISOR** | Bar Shift Lead | Bar Checklist, Beverage Costing & Bar Approval |
| 13 | **Azizah** | Bar | Barista | **STAFF** | - | Coffee Brewing, Bar Checklist & Prep Tasks |
| 14 | **Mujab** | Bar | Barista | **STAFF** | - | Bar Station Setup, Bar Checklist & Stock Alert |
| 15 | **Vita** | Service | Head Waiter | **SUPERVISOR** | Kasir Operasional | Floor Service Lead, Cashier, Guest Handling |
| 16 | **Bintang** | Service | Waiter | **STAFF** | - | Table Service, Order Taking & Floor Checklist |
| 17 | **Yuda** | Service | Waiter | **STAFF** | - | Table Setup, Guest Service & Sanitation |
| 18 | **Roziqin** | Service | Waiter | **STAFF** | - | Table Setup, Floor Cleanliness & Service Tasks |
| 19 | **Rini** | Cleaning | Dishwasher | **STAFF** | - | Dishwashing, Cutlery Sterilization, Checklist |
| 20 | **Reno** | Cleaning | Cleaner / Utility | **STAFF** | - | Waste Disposal, Deep Cleaning & Utility Tasks |
| 21 | **Aqib Latuh** | CRM | CRM Lead | **SUPERVISOR** | Lead & Deals Pipeline | Full CRM Access, Pipeline Manager, Blast Draft |
| 22 | **Arfani** | CRM | CRM Staff | **STAFF** | Guest Relationship | WhatsApp Chat, Reservation Input, Follow-up |
| 23 | **Ristania Larasati**| Finance | Finance Officer | **SUPERVISOR** | Accounting & Cash Flow | Full Finance Module, HPP, Expense, Profitability |
| 24 | **Naila** | Marketing | Content Creator | **STAFF** | Social Media Production| Content Calendar, Video Task, Campaign Workflow |

---

# 3. CORE PERMISSION MODEL & ACTION VOCABULARY

Sistem menggunakan 11 kata kerja aksi otorisasi (Action Verbs) yang konsisten dan mudah dipahami:

1. **VIEW:** Hak membaca/melihat data atau tampilan visual.
2. **CREATE:** Hak menambahkan data atau membuat entitas baru.
3. **EDIT:** Hak mengubah data yang sudah tersimpan.
4. **DELETE:** Hak menghapus data secara permanen.
5. **CANCEL:** Hak membatalkan transaksi/status tanpa menghapus riwayat audit.
6. **APPROVE:** Hak menyetujui pengajuan (*Break, Lembur, Cuti, PO, Konten, KPI*).
7. **REJECT:** Hak menolak pengajuan disertai alasan penolakan.
8. **ASSIGN:** Hak membagikan checklist, tugas, atau jadwal kepada personel lain.
9. **REVIEW:** Hak melakukan evaluasi kinerja, audit mutu, atau pengecekan draf konten.
10. **EXPORT:** Hak mengunduh laporan ke format PDF, Excel, atau CSV.
11. **MANAGE:** Hak administratif penuh (*Konfigurasi Master Data, Permission, Setting Sistem*).

---

# 4. DETAILED ROLE SPECIFICATIONS

## 4.1 OWNER — Tri Hermawanto
- **Fokus Utama:** Visibilitas Eksekutif, Pengawasan Kesehatan Finansial, Audit Kualitas, dan Review Bulanan (MBR).
- **Cakupan Akses:**
  - `VIEW` seluruh modul (Dashboard, HR, CRM, Operations, Finance, Development, Content, Reports).
  - Akses penuh laporan MBR, margin kotor, EBITDA, dan laba bersih.
  - Akses audit kepatuhan mutu, KPI divisi, dan evaluasi kepuasan tamu.
- **Batasan Operasional:** UI Owner tidak dibebani oleh form checklist harian, task operasional dapur, atau input chat WhatsApp harian.

## 4.2 MANAGER — Heri Setiawan (Primary: Manager, Additional: HR)
- **Fokus Utama:** Pemimpin Operasional Terintegrasi, Pengelola SDM (HR), dan Pengambil Keputusan Strategis.
- **Cakupan Akses:**
  - Akses `FULL CONTROL` ke 9 modul utama aplikasi.
  - `MANAGE` Struktur Organisasi, Karyawan, Skema Penggajian, Shift, dan Dokumen HR.
  - `APPROVE` / `REJECT` pengajuan lembur, cuti, purchase order tingkat lanjut, rilis konten media sosial, dan strategi promosi.
  - `MANAGE` Pengaturan Sistem, Master Data Bahan Baku/Resep, dan Akun Pengguna.

## 4.3 SUPERVISOR — Putri Okta, Andun, Alfan, Dina, Vita, Aqib Latuh, Ristania Larasati
- **Fokus Utama:** Pengawasan Shift, Eksekusi Tugas Lapangan, Verifikasi Checklist, dan Rekonsiliasi.
- **Cakupan Akses:**
  - `VIEW` jadwal, absensi, dan progres tugas seluruh anggota tim divisinya.
  - `APPROVE` / `REJECT` pengajuan istirahat (*Standard & Additional Break*) dan permohonan lembur awal staf.
  - `ASSIGN` & `REVIEW` checklist stasiun kerja serta task harian.
  - **Spesialisasi Tambahan:**
    - **Putri Okta & Vita:** Memiliki hak input laporan penutupan kasir (*Cashier Reconcile*).
    - **Andun, Alfan, Dina:** Memiliki hak persetujuan awal *Purchase Request (PR)* bahan baku kitchen/bar.
    - **Ristania Larasati:** Mengelola data HPP, pencatatan beban operasional (OPEX), dan laporan keuangan harian.
- **Batasan:** Tidak dapat mengubah master payroll, skema gaji pokok, role sistem, atau strategi pemasaran rahasia Manager.

## 4.4 STAFF — Tim Kitchen, Bar, Service, Cleaning, CRM Staff, Content Creator
- **Fokus Utama:** Eksekusi Pekerjaan Harian, Kepatuhan SOP/IKA, dan Portal Layanan Mandiri (*Self-Service*).
- **Cakupan Akses:**
  - `VIEW` jadwal pribadi, panduan SOP/IKA, slip gaji pribadi, dan skor KPI personal.
  - `CREATE` presensi (Clock-in/out), pengajuan istirahat (*Break Request*), dan log wasting dengan bukti foto.
  - `EDIT` centang checklist tugas stasiun yang ditugaskan kepadanya.
  - **Spesialisasi Tanggung Jawab Khusus:**
    - **Ulum & Tasnim (Kitchen):** Mendapatkan akses modul `Purchasing`, `Inventory`, dan `Production (Setengah Jadi)` untuk input stok dan request bahan.
    - **Naila (Content Creator):** Akses modul `Content Creator` untuk membuat brief, script, tracking shooting/editing, dan monitoring performa views.
- **Batasan Keamanan:** Staf dilarang melihat data finansial laba/rugi, payroll karyawan lain, kasus disiplin staf lain, atau dokumen rahasia manajemen.

---

# 5. DOMAIN-SPECIFIC ACCESS RULES

## 5.1 Tropical HR Security & Privacy
- **Data Gaji & Payroll:** Bersifat strictly confidential. Hanya dapat diakses penuh oleh **OWNER**, **MANAGER/HR**, dan **FINANCE**. Staf hanya dapat melihat slip gaji miliknya sendiri.
- **Histori Absensi:** Supervisor dapat memantau kehadiran anggota timnya. Staf hanya melihat rekap kehadiran miliknya.
- **Dokumen Karyawan:** Kontrak kerja, KTP, dan surat peringatan (SP) hanya dapat dikelola oleh **MANAGER/HR**.

## 5.2 Tropical CRM & WhatsApp Omnichannel
- **Lead & Deals Pipeline:** Dapat dikelola oleh Manager dan CRM Lead/Staff. Supervisor Service dapat melihat reservasi mendatang untuk penataan meja.
- **WhatsApp Web & Chat:** Ditangani oleh tim CRM (*Aqib Latuh & Arfani*) dan Manager.
- **WhatsApp QR Login:** Manajemen sesi QR dibatasi hanya untuk Manager dan CRM Lead.
- **WhatsApp Blast:** CRM Staff dapat membuat draf kampanye, namun pengiriman masal (*Blast Execution*) wajib mendapatkan persetujuan (**APPROVE**) dari Manager.
- **AI Closing Assistant:** Berfungsi sebagai *Co-Pilot Rekomendasi* (Human-in-the-Loop). Sistem tidak boleh melakukan pengiriman pesan otonom tanpa klik konfirmasi admin manusia.

## 5.3 Operations & Kitchen Inventory
- **Checklist Shift:** Staf mengisi item checklist; Supervisor memverifikasi dan menandatangani secara digital; Manager meninjau histori.
- **Purchasing & Stock (Ulum & Tasnim):** Berhak membuat *Purchase Request (PR)* dan menginput hasil penerimaan barang (*Goods Receiving*), yang kemudian disetujui oleh Head Kitchen / Manager.
- **Wasting Log:** Seluruh staf kitchen/bar dapat mencatat bahan rusak/gosong dengan lampiran foto bukti. Supervisor/Manager wajib meninjau log tersebut.

## 5.4 Finance & HPP Protection
- **Profitability (EBITDA & Net Profit):** Hanya dapat dilihat oleh **OWNER**, **MANAGER**, dan **FINANCE**.
- **Kalkulator HPP & Resep:** Dikelola oleh Finance dan Manager; Head Kitchen / Head Bar dapat melihat rincian resep untuk menjaga porsi.
- **Cashier Reconciliation:** Diinput oleh Kasir bertugas (Putri Okta / Vita) dan diverifikasi oleh Finance & Manager.

## 5.5 Strategic Development & Marketing
- **Branding, Marketing Strategy & Promotion Planning:** Merupakan ruang kerja strategis eksklusif **MANAGER** (dengan visibilitas bagi **OWNER**).
- **Task Development:** Manager/Supervisor dapat mendistribusikan tugas peningkatan keterampilan kepada staf yang bersangkutan berdasarkan hasil Business Assessment.

---

# 6. MASTER APPROVAL WORKFLOW MATRIX

Berikut adalah alur hierarki persetujuan lintas divisi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ADDITIONAL BREAK REQUEST                                                 │
│    Staff Pengaju ──> Supervisor Shift Bertugas (APPROVE/REJECT)             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CUTI / LEAVE REQUEST                                                     │
│    Staff Pengaju ──> Supervisor Shift ──> Manager/HR (FINAL APPROVAL)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. OVERTIME / LEMBUR                                                        │
│    Staff / Supervisor ──> Manager/HR (APPROVE/REJECT & Payroll Sync)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PURCHASE ORDER (PO) BAHAN BAKU                                           │
│    Ulum / Tasnim (PR) ──> Head Kitchen (Review) ──> Manager (PO APPROVE)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. KONTEN MEDIA SOSIAL & PUBLIKASI                                          │
│    Naila (Edit Video & Copy) ──> Manager (REVIEW & APPROVE) ──> Publish     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. WHATSAPP BLAST CAMPAIGN                                                  │
│    CRM Staff (Draf Pesan & Segmen) ──> Manager (APPROVE) ──> Send Blast     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. PAYROLL & PENGGAJIAN BULANAN                                             │
│    Finance/HR (Kalkulasi) ──> Manager (Review) ──> Owner (FINAL APPROVAL)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. REVIEW KPI PERSONAL                                                      │
│    Staff (Submit Bukti) ──> Supervisor (Skor Awal) ──> Manager (Verifikasi) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 7. NAVIGATION VISIBILITY MATRIX

Tabel berikut menentukan visibilitas menu navigasi pada Sidebar berdasarkan peran pengguna (*FULL*, *VIEW*, *LIMITED*, *OWN*, *NONE*):

| Menu & Sub-Menu | Route Path | OWNER | MANAGER | SUPERVISOR | STAFF (Standard) | STAFF (Khusus)* |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **DASHBOARD** | `/dashboard` | **FULL** (Exec) | **FULL** (Ops) | **LIMITED** (Shift) | **OWN** (Personal) | **OWN** (Personal) |
| **TROPICAL HR** | `/hr` | **VIEW** | **FULL** | **LIMITED** | **OWN** | **OWN** |
| ├─ Employee | `/hr?sub=employees` | **VIEW** | **FULL** | **VIEW** (Team) | **NONE** | **NONE** |
| ├─ Organization | `/hr?sub=organization`| **VIEW** | **FULL** | **VIEW** | **VIEW** | **VIEW** |
| ├─ Attendance | `/hr?sub=attendance` | **VIEW** | **FULL** | **FULL** (Team) | **OWN** (Clock-in) | **OWN** (Clock-in) |
| ├─ Shift & Schedule | `/hr?sub=shifts` | **VIEW** | **FULL** | **FULL** (Team) | **OWN** (Roster) | **OWN** (Roster) |
| ├─ Break Request | `/hr?sub=breaks` | **VIEW** | **FULL** | **FULL** (Approve)| **OWN** (Request) | **OWN** (Request) |
| ├─ Payroll & Gaji | `/hr?sub=payroll` | **VIEW** | **FULL** | **NONE** | **OWN** (Slip) | **OWN** (Slip) |
| ├─ SOP & IKA | `/hr?sub=sop` / `ika` | **VIEW** | **FULL** | **VIEW** | **VIEW** | **VIEW** |
| ├─ Job Description | `/hr?sub=job-description`| **VIEW**| **FULL** | **VIEW** | **OWN** | **OWN** |
| ├─ Checklist HR | `/hr?sub=checklist` | **VIEW** | **FULL** | **FULL** (Assign) | **OWN** (Tasks) | **OWN** (Tasks) |
| ├─ KPI Personal | `/hr?sub=kpi` | **VIEW** | **FULL** | **REVIEW** (Team)| **OWN** (Score) | **OWN** (Score) |
| ├─ HR Documents | `/hr?sub=documents` | **VIEW** | **FULL** | **NONE** | **OWN** | **OWN** |
| └─ HR Reports | `/hr?sub=reports` | **VIEW** | **FULL** | **LIMITED** | **NONE** | **NONE** |
| **TROPICAL CRM** | `/crm` | **VIEW** | **FULL** | **LIMITED** | **NONE** | **FULL** (CRM Staff) |
| ├─ Customer & Lead | `/crm?sub=customers`| **VIEW** | **FULL** | **VIEW** | **NONE** | **FULL** (CRM Staff) |
| ├─ Pipeline Deals | `/crm?sub=pipeline` | **VIEW** | **FULL** | **VIEW** | **NONE** | **FULL** (CRM Staff) |
| ├─ WhatsApp Web & Chat| `/crm?sub=whatsapp` | **VIEW** | **FULL** | **VIEW** | **NONE** | **FULL** (CRM Staff) |
| ├─ AI Closing Assistant| `/crm?sub=ai-closing`| **VIEW**| **FULL** | **NONE** | **NONE** | **FULL** (CRM Staff) |
| ├─ WhatsApp Blast | `/crm?sub=blast` | **VIEW** | **FULL** | **NONE** | **NONE** | **DRAFT** (CRM Staff)|
| └─ Reservation & Cal.| `/crm?sub=reservation`| **VIEW**| **FULL** | **FULL** (Service)| **NONE** | **FULL** (CRM Staff) |
| **OPERATIONS** | `/operations` | **VIEW** | **FULL** | **FULL** | **LIMITED** (Station)| **FULL** (Purchasing)*|
| ├─ Daily Checklist | `/operations?sub=checklist`| **VIEW**| **FULL** | **FULL** (Verify)| **OWN** (Station) | **OWN** (Station) |
| ├─ Shift Operations | `/operations?sub=shift` | **VIEW** | **FULL** | **FULL** (Handover)| **VIEW** | **VIEW** |
| ├─ Kitchen / Bar / Svc | `/operations?sub=kitchen`| **VIEW** | **FULL** | **FULL** (Station)| **OWN** (Station) | **OWN** (Station) |
| ├─ Cleaning & Dishwash| `/operations?sub=cleaning`| **VIEW** | **FULL** | **FULL** | **OWN** (Station) | **OWN** (Station) |
| ├─ Purchasing & Stock | `/operations?sub=purchasing`| **VIEW**| **FULL** | **FULL** (Kitchen)| **NONE** | **FULL** (Ulum/Tasnim)|
| ├─ Batch Production | `/operations?sub=production`| **VIEW**| **FULL** | **FULL** (Kitchen)| **NONE** | **FULL** (Ulum/Tasnim)|
| └─ Wasting Log | `/operations?sub=wasting` | **VIEW** | **FULL** | **FULL** (Review)| **CREATE** (Proof)| **CREATE** (Proof) |
| **FINANCE** | `/finance` | **FULL** (View) | **FULL** | **LIMITED** (Cashier)| **NONE** | **FULL** (Ristania)*|
| ├─ Revenue & Reports | `/finance?sub=revenue` | **FULL** | **FULL** | **NONE** | **NONE** | **FULL** (Ristania) |
| ├─ Cashier Reconcile | `/finance?sub=cashier` | **VIEW** | **FULL** | **FULL** (Putri/Vita)| **NONE** | **FULL** (Ristania) |
| ├─ HPP & Recipe Cost | `/finance?sub=hpp` | **FULL** | **FULL** | **VIEW** (Heads) | **NONE** | **FULL** (Ristania) |
| ├─ Expenses & OPEX | `/finance?sub=expenses`| **FULL** | **FULL** | **NONE** | **NONE** | **FULL** (Ristania) |
| └─ Profitability | `/finance?sub=profitability`| **FULL**| **FULL** | **NONE** | **NONE** | **FULL** (Ristania) |
| **DEVELOPMENT** | `/development` | **VIEW** | **FULL** | **LIMITED** | **OWN** | **OWN** |
| ├─ Business/HR Academy| `/development?sub=academy`| **VIEW** | **FULL** | **VIEW** | **VIEW** (Assigned)| **VIEW** (Assigned)|
| ├─ Assessment & Action | `/development?sub=action-plan`|**VIEW**| **FULL** | **VIEW** (Team) | **NONE** | **NONE** |
| ├─ Task & Progress | `/development?sub=task` | **VIEW** | **FULL** | **FULL** (Assign)| **OWN** (Execute) | **OWN** (Execute) |
| └─ Branding & Marketing| `/development?sub=marketing`|**VIEW** | **FULL** | **NONE** | **NONE** | **NONE** |
| **CONTENT CREATOR** | `/content` | **VIEW** | **FULL** | **NONE** | **NONE** | **FULL** (Naila)* |
| ├─ Calendar & Tasks | `/content?sub=calendar`| **VIEW** | **FULL** | **NONE** | **NONE** | **FULL** (Naila) |
| ├─ Campaign & Pipeline| `/content?sub=production`| **VIEW**| **FULL** | **NONE** | **NONE** | **FULL** (Naila) |
| └─ Performance Stats | `/content?sub=performance`| **VIEW**| **FULL** | **NONE** | **NONE** | **FULL** (Naila) |
| **REPORTS / MBR** | `/reports?sub=mbr` | **FULL** | **FULL** | **NONE** | **NONE** | **NONE** |
| **SETTINGS** | `/settings` | **VIEW** | **FULL** | **NONE** | **NONE** | **NONE** |

*\*Keterangan Staff Khusus:* Menyesuaikan delegasi pada Profil SDM (Ulum & Tasnim untuk Purchasing/Stock/Produksi, Naila untuk Content Creator, Aqib & Arfani untuk CRM, Ristania untuk Finance).

---

# 8. ACTION PERMISSION MATRIX

| Domain / Fitur | Aksi Spesifik | OWNER | MANAGER | SUPERVISOR | STAFF (Standard) | DELEGATED STAFF |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | View Executive Health | ✅ | ✅ | ❌ | ❌ | ❌ |
| | View Shift Metric | ✅ | ✅ | ✅ | ❌ | ❌ |
| | View Personal Summary | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HR: Employee** | Create / Edit / Delete Employee | ❌ | ✅ | ❌ | ❌ | ❌ |
| | View All Employee Profiles | ✅ | ✅ | ✅ (Team) | ❌ (Own only) | ❌ (Own only) |
| **HR: Attendance**| Clock-In / Clock-Out (Face/GPS) | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit Attendance Record | ❌ | ✅ | ❌ | ❌ | ❌ |
| **HR: Shift** | Assign & Edit Weekly Roster | ❌ | ✅ | ✅ (Team) | ❌ | ❌ |
| **HR: Break** | Submit Additional Break Request| ❌ | ✅ | ✅ | ✅ | ✅ |
| | Approve / Reject Break Request | ❌ | ✅ | ✅ | ❌ | ❌ |
| **HR: Payroll** | Calculate Payroll Period | ❌ | ✅ | ❌ | ❌ | ✅ (Finance) |
| | Approve Final Payroll Release | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Download Personal Payslip | ❌ | ✅ | ✅ | ✅ | ✅ |
| **HR: SOP & IKA** | Upload / Archive SOP / IKA | ❌ | ✅ | ❌ | ❌ | ❌ |
| | View & Confirm Read SOP / IKA | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HR: KPI** | Set KPI Target & Weight | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Score & Review KPI | ❌ | ✅ | ✅ (Team) | ❌ (View Own) | ❌ (View Own) |
| **CRM: Deals** | Create & Drag Pipeline Deals | ❌ | ✅ | ✅ (Service) | ❌ | ✅ (CRM Staff) |
| **CRM: Chat** | Reply WhatsApp & AI Closing | ❌ | ✅ | ❌ | ❌ | ✅ (CRM Staff) |
| **CRM: Blast** | Create Draft Campaign | ❌ | ✅ | ❌ | ❌ | ✅ (CRM Staff) |
| | Approve & Trigger WhatsApp Blast | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Operations** | Fill Daily Station Checklist | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Verify & Sign Daily Checklist | ❌ | ✅ | ✅ | ❌ | ❌ |
| | Create Purchase Request (PR) | ❌ | ✅ | ✅ | ❌ | ✅ (Ulum/Tasnim)|
| | Approve Purchase Order (PO) | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Log Wasting & Upload Evidence | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Finance** | Submit Cashier Reconcile | ❌ | ✅ | ✅ (Putri/Vita)| ❌ | ✅ (Finance) |
| | Modify Master Recipe & Costing | ❌ | ✅ | ❌ | ❌ | ✅ (Finance) |
| | View Net Profit & EBITDA | ✅ | ✅ | ❌ | ❌ | ✅ (Finance) |
| **Development** | Formulate Brand/Marketing Strategy| ❌ | ✅ | ❌ | ❌ | ❌ |
| | Assign Development Task | ❌ | ✅ | ✅ (Team) | ❌ | ❌ |
| | Submit Task Evidence & Complete| ❌ | ✅ | ✅ | ✅ | ✅ |
| **Content** | Create Content Brief & Video Log | ❌ | ✅ | ❌ | ❌ | ✅ (Naila) |
| | Approve Content for Publishing | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Reports** | Generate & Export MBR Report | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Settings** | Update System Settings & RBAC | ❌ | ✅ | ❌ | ❌ | ❌ |

---

# 9. ROUTE GUARD & PROTECTION ENGINE

Sistem proteksi navigasi frontend mengimplementasikan **5 Lapis Penjagaan (Guards)**:

```
                  ┌────────────────────────────────────────┐
                  │ 1. AUTHENTICATION GUARD               │
                  │ (Apakah user sudah login/terautentikasi)│
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │ 2. ROLE / ACCESS LEVEL GUARD          │
                  │ (Apakah role memiliki hak akses modul)  │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │ 3. DEPARTMENT GUARD                    │
                  │ (Apakah divisi sesuai konteks halaman) │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │ 4. RESPONSIBILITY GUARD                │
                  │ (Cek array additional_responsibilities) │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │ 5. OWNERSHIP / DATA SCOPE GUARD        │
                  │ (Apakah entitas data milik user sendiri)│
                  └────────────────────────────────────────┘
```

### Contoh Skenario Route Guard:
1. **`/hr?sub=payroll`:**
   - User `STAFF` mengakses URL langsung -> Ditahan oleh *Role Guard* -> Diarahkan otomatis ke tampilan personal `/hr?sub=payroll&view=my-slip` (Hanya menampilkan slip miliknya).
2. **`/operations?sub=purchasing`:**
   - User `Fandi` (Cook reguler) mengakses -> Ditolak (*Access Denied*).
   - User `Ulum` (Cook + Purchasing) mengakses -> Diizinkan oleh *Responsibility Guard* (`additional_responsibilities.includes('Purchasing')`).
3. **`/development?sub=marketing`:**
   - User selain `MANAGER` dan `OWNER` (View only) -> Ditolak (*Access Denied: Halaman ini hanya dapat diakses oleh Manajemen Strategis*).
4. **`/finance?sub=profitability`:**
   - User `Putri Okta` (Supervisor Kasir) mengakses -> Ditolak (Hanya Finance Officer, Manager, dan Owner yang diizinkan melihat Laba Bersih/EBITDA).

---

# 10. UI BEHAVIOR & ACCESS DENIED STANDARDS

1. **Prinsip Zero Clutter & Complete Hiding:**
   - Elemen menu navigasi yang tidak diizinkan **wajib disembunyikan sepenuhnya dari rendering DOM** (bukan sekadar di-disable atau di-grey out).
   - Tombol aksi terlarang (misal: tombol `Approve PO` atau `Edit Gaji`) tidak boleh muncul di layar staf.
2. **Standard Halaman Access Denied:**
   - Jika pengguna memaksakan navigasi via direct URL ke route terlarang, sistem menampilkan komponen ramah pengguna:
     ```
     ┌─────────────────────────────────────────────────────────────┐
     │                      [Ikon Gembok Ungu]                     │
     │                      Akses Dibatasi                         │
     │ Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. │
     │ Halaman ini memerlukan kewenangan [Role / Responsibility].  │
     │                                                             │
     │              [Tombol: Kembali ke Dashboard Saya]            │
     └─────────────────────────────────────────────────────────────┘
     ```
3. **Pencegahan Kebocoran Data (Data Leak Prevention):**
   - Respon service abstraction wajib memfilter array payload berdasarkan context user yang sedang aktif sebelum di-passing ke komponen presentasional.

---

# 11. FRONTEND-FIRST RBAC ARCHITECTURE

Pada fase pengembangan frontend:
- Sistem menggunakan mock user switcher yang memungkinkan pengujian pergantian akun (*Simulasi Login sebagai Tri Hermawanto, Heri Setiawan, Putri Okta, Ulum, Naila, dsb.*).
- Logika otorisasi diisolasi di dalam helper murni `/src/utils/rbac.ts` atau `/src/services/authService.ts` dengan fungsi deklaratif:
  ```typescript
  export function canAccessModule(user: User, module: ModuleKey): boolean;
  export function canPerformAction(user: User, action: ActionKey, targetEntity?: any): boolean;
  export function hasResponsibility(user: User, responsibility: string): boolean;
  ```
- Arsitektur ini dirancang **Backend-Ready**, sehingga saat integrasi API/RLS (Row Level Security) dilakukan di masa depan, kontrak pengecekan izin di UI tetap identik.

---

# 12. ACCEPTANCE CRITERIA CHECKLIST

Dokumen RBAC ini memenuhi 100% kriteria ketetapan:
- [x] **4 Access Level** didefinisikan secara hierarkis (OWNER, MANAGER, SUPERVISOR, STAFF).
- [x] Seluruh **24 personel** Tropical Garden Resto terpetakan secara presisi.
- [x] **Primary Position** dipisahkan secara tegas dari **Additional Responsibilities**.
- [x] **Putri Okta** terkonfigurasi sebagai *Supervisor + Kasir Operasional*.
- [x] **Heri Setiawan** terkonfigurasi sebagai *Manager + Head of HR*.
- [x] **Ulum & Tasnim** memiliki delegasi tanggung jawab *Purchasing, Stock, dan Produksi Setengah Jadi*.
- [x] **Owner** memiliki *Executive Visibility* tanpa beban input teknis harian.
- [x] **Manager** memiliki kontrol operasional, administratif, dan strategi penuh.
- [x] **Supervisor** memiliki otoritas kontrol shift, verifikasi checklist, dan approval L1.
- [x] **Staff** memiliki antarmuka terisolasi untuk *Self-Service* dan eksekusi tugas.
- [x] Proteksi keamanan data **Finance** (EBITDA, Net Profit, Margin) terdefinisi.
- [x] Proteksi privasi data **HR** (Gaji, SP, KPI orang lain) terdefinisi.
- [x] Area **Branding, Marketing, & Promotion** terkunci sebagai area strategis Manager.
- [x] Pengaturan khusus **CRM & WhatsApp Blast Approval** terdefinisi.
- [x] Penegasan **AI Closing Assistant** berprinsip *Human-in-the-Loop* (tanpa auto-send).
- [x] Hak khusus modul **Content Creator (Naila)** terdefinisi.
- [x] **5 Lapis Route Guard** terdefinisi.
- [x] **Navigation Visibility Matrix** lengkap mencakup seluruh menu & sub-menu.
- [x] **Action Permission Matrix** lengkap dengan 11 Action Verbs.
