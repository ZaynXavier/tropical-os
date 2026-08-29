# TROPICALOS — PAGE ARCHITECTURE & DOMAIN OWNERSHIP MATRIX
**Audit Baseline:** Pre-Phase 3.8 Architectural Hardening  
**Scope:** Strict alignment with PRD.md, INFORMATION_ARCHITECTURE.md, UI_UX.md, RBAC.md, and FRONTEND_ARCHITECTURE.md.

---

## 1. Executive Summary & Audit Baseline

TropicalOS adheres strictly to a **Single Page, Submodule Tab-Based Architecture** (`/module?sub=param`).  
Every business capability has a strictly assigned **Single Domain Owner**, a single persistent Service Layer, and standardized Data Contracts for cross-domain reading.

- **Total Main Functional Routes:** 8 Core Modules (`/dashboard`, `/operations`, `/finance`, `/crm`, `/content`, `/hr`, `/reports`, `/development`) + 2 System Routes (`/settings`, `/login`).
- **Total Submodules Registered:** 44 Submodules.
- **Architectural Duplication Status:** 0 Duplicate POS Engines, 0 Duplicate Costing Engines, 0 Duplicate Stock Ledgers.

---

## 2. Master Page & Submodule Inventory Matrix

| # | Domain / Page | Route & Submodule Param | Submodule Name | Purpose & Business Scope | Primary React Component | Service Layer | Data Source / Storage Key | RBAC Access (Min Level) | PRD Alignment |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **Dashboard** | `/dashboard` | Executive Command Center | Monitoring real-time 8 pilar bisnis, revenue, food cost, issue darurat, operational status | `Dashboard.tsx`, `ExecutiveKpiGrid`, `SupervisorCommandCenter`, `StaffPersonalDashboard` | `DashboardService`, `SalesService`, `InventoryService` | Consolidated multi-service reader | `ALL` (Role-specific view) | 100% Match (PRD §2, §11) |
| **2** | **Operations** | `/operations?sub=overview` | Operasional Resto | Area board (Kitchen, Bar, Service, Cleaning) & status shift | `OperationsFoundationView` | `OperationsService` | Static & mock operations data | `ALL` (Role-specific) | 100% Match (PRD §4.1) |
| **3** | **Operations** | `/operations?sub=checklist` | Daily Checklist | Pembukaan & penutupan checklist operasional per stasiun & shift | `DailyChecklistHub` | `operationsChecklistService` | `tropicalos_daily_checklists` | `STAFF` | 100% Match (PRD §4.1, §4.2) |
| **4** | **Operations** | `/operations?sub=shift` | Serah Terima Shift | Logbook serah terima shift, checklist serah terima, cash float, log catatan | `ShiftHandoverHub` | `handoverService` | `tropicalos_shift_handovers` | `STAFF` | 100% Match (PRD §4.3) |
| **5** | **Operations** | `/operations?sub=wasting` | Pencatatan Wasting | Log pembuangan bahan baku/makanan rusak, foto bukti, otorisasi SPV | `WastingLogView` | `inventoryService`, `stockMovementService` | `tropicalos_master_inventory`, `tropicalos_master_stock_movements` | `STAFF` | 100% Match (PRD §4.4) |
| **6** | **Operations** | `/operations?sub=inventory` | Manajemen Stok | Master 32 SKU bahan baku, minimum stock, FEFO batch, opname, mutasi stok | `InventoryManagementView` | `inventoryService`, `stockMovementService`, `stockOpnameService` | `tropicalos_master_inventory`, `tropicalos_master_stock_movements` | `STAFF` | 100% Match (PRD §4.4, §4.5) |
| **7** | **Operations** | `/operations?sub=purchasing` | Pengadaan & PO | Purchase Request, Purchase Order, Approval, Penerimaan Barang (Receiving) | `ProcurementManagementView` | `purchaseRequestService`, `purchaseOrderService`, `supplierService` | `tropicalos_master_purchase_requests`, `tropicalos_master_purchase_orders` | `STAFF` (PR), `SUPERVISOR` (PO) | 100% Match (PRD §4.6) |
| **8** | **Operations** | `/operations?sub=recipes` | Resep & BOM | Master resep menu, takaran gramatur, HPP teoritis, visual plating SOP | `RecipeManagementView` | `recipeService`, `inventoryService` | `tropicalos_master_recipes` | `STAFF` (View), `SUPERVISOR`+ (Edit) | 100% Match (PRD §4.7) |
| **9** | **Operations** | `/operations?sub=production` | Produksi Batch | Perintah produksi batch dapur/bar, yield calculation, deviation, waste | `ProductionManagementView` | `productionService`, `stockMovementService` | `tropicalos_production_batches` | `STAFF` | 100% Match (PRD §4.8) |
| **10** | **Operations** | `/operations?sub=issues` | Manajemen Isu | Pelaporan insiden operasional, komplain tamu, eskalasi darurat | `OperationalIssueHub` | `operationalIssueService` | `tropicalos_operational_issues` | `ALL` | 100% Match (PRD §4.9) |
| **11** | **Finance** | `/finance?sub=revenue` | Daily Sales & POS | Rekapitulasi omzet harian POS, metode pembayaran, live trend | `SalesDashboardView` | `salesService`, `posAdapter` | `tropicalos_master_sales` (Read-only for Fin) | `SUPERVISOR`+ | 100% Match (PRD §5.1) |
| **12** | **Finance** | `/finance?sub=cashier` | Cashier Closing | Validasi kas fisik kasir (Expected vs Actual Cash), over/shortage audit | `CashierRevenueReport` | `salesService` | `tropicalos_cashier_closings` | `SUPERVISOR`+ | 100% Match (PRD §5.1) |
| **13** | **Finance** | `/finance?sub=hpp` | Analisis HPP & Food Cost | Menu Engineering matrix (Stars/Plowhorses), Food Cost target vs actual | `HppDashboardView`, `HppCalculatorView` | `hppService`, `recipeService` (via `RecipeCostContract`) | `tropicalos_master_recipes` | `SUPERVISOR`+ | 100% Match (PRD §5.2) |
| **14** | **Finance** | `/finance?sub=expenses` | Laporan Keuangan & OPEX | Laporan Laba Rugi (P&L), OPEX, EBITDA, Arus Kas, Neraca | `FinancialStatementsView` | Consolidated Financial Engine | Read from Payroll, Procurement, Sales contracts | `MANAGER`+ | 100% Match (PRD §5.3) |
| **15** | **HR** | `/hr?sub=employees` | Data Karyawan | Master 24 Personel resto, status kerja, departemen, data kontak | `EmployeeManagementView` | `employeeService` | `tropicalos_master_employees` | `ALL` (Staff: self, Mgr: full) | 100% Match (PRD §3.1) |
| **16** | **HR** | `/hr?sub=organization` | Struktur Organisasi | Bagan hierarki komando restoran 6 divisi | `OrganizationStructureView` | `employeeService` | `MASTER_EMPLOYEES` | `ALL` | 100% Match (PRD §3.1) |
| **17** | **HR** | `/hr?sub=attendance` | Presensi & GPS | Clock-in/out berbasis geofencing GPS resto, foto selfie verifikasi | `AttendanceView` | `attendanceService`, `locationService`, `faceVerificationService` | `tropicalos_master_attendance` | `ALL` | 100% Match (PRD §3.2) |
| **18** | **HR** | `/hr?sub=shifts` | Jadwal Kerja & Shift | Jadwal roster mingguan, alokasi shift kerja, swap schedule request | `ShiftScheduleModuleView` | `scheduleService` | `tropicalos_master_schedules` | `ALL` | 100% Match (PRD §3.2) |
| **19** | **HR** | `/hr?sub=breaks` | Break Management | Pengajuan istirahat, countdown timer, approval supervisor shift | `BreakManagementView` | `breakService` | `tropicalos_master_breaks` | `ALL` | 100% Match (PRD §3.3) |
| **20** | **HR** | `/hr?sub=overtime` | Lembur & SPL | Pengajuan lembur kerja, approval bertingkat, estimasi biaya lembur | `OvertimeManagementView` | `overtimeService` | `tropicalos_master_overtime` | `ALL` | 100% Match (PRD §3.4) |
| **21** | **HR** | `/hr?sub=configuration` | Pengaturan HR | Aturan grace period terlambat, radius geofence GPS, kuota break, rate lembur | `HRConfigurationView` | `hrConfigurationService` | `tropicalos_hr_configuration` | `MANAGER`+ | 100% Match (PRD §3.5) |
| **22** | **HR** | `/hr?sub=payroll` | Penggajian & Slip Gaji | Kalkulasi gaji bulanan, tunjangan, lembur, potongan kasbon, slip gaji mandiri | `PayrollDashboardView` | `payrollService` | `tropicalos_master_payroll_periods`, `tropicalos_master_salary` | `ALL` (Staff: self slip, Fin/Mgr: batch) | 100% Match (PRD §3.6) |
| **23** | **HR** | `/hr?sub=sop` | Digital SOP Library | Panduan standar operasional kebersihan, servis, dapur, dan bar | `SopManagementView` | `sopService` | `tropicalos_master_sops` | `ALL` | 100% Match (PRD §3.7) |
| **24** | **HR** | `/hr?sub=job-description` | Uraian Tugas (Job Desc) | Uraian tanggung jawab per posisi kerja dan KPI target | `JobDescriptionManagementView` | `jobDescriptionService` | `tropicalos_master_job_descriptions` | `ALL` | 100% Match (PRD §3.7) |
| **25** | **HR** | `/hr?sub=ika` | Instruksi Kerja Alat (IKA) | Panduan pengoperasian aman & perawatan 16 peralatan dapur/bar | `IkaManagementView` | `ikaService` | `tropicalos_master_ikas` | `ALL` | 100% Match (PRD §3.7) |
| **26** | **HR** | `/hr?sub=checklist` | Kepatuhan Checklist | Monitoring kepatuhan pengisian checklist harian per karyawan | `ChecklistKpiView` | `checklistService` | Consolidated Checklist records | `SUPERVISOR`+ | 100% Match (PRD §3.8) |
| **27** | **HR** | `/hr?sub=kpi` | Evaluasi Kinerja (KPI) | Rekapitulasi skor KPI staf (Absensi, Checklist, Kedisiplinan, Insentif) | `KpiPerformanceDashboardView` | `kpiService`, `kpiAnalyticsService` | `tropicalos_master_kpi_periods` | `SUPERVISOR`+ | 100% Match (PRD §3.8) |
| **28** | **HR** | `/hr?sub=documents` | Arsip Dokumen HR | Kontrak kerja, KTP, sertifikat kesehatan karyawan | `HRDocumentManagementView` | `hrDocumentService` | `tropicalos_hr_documents` | `MANAGER`+ | 100% Match (PRD §3.9) |
| **29** | **HR** | `/hr?sub=reports` | Laporan SDM & HR | Analisis perputaran staf (turnover), produktivitas jam kerja, cost per labor | `HRReportsDashboardView` | `hrReportsService` | Consolidated HR data | `MANAGER`+ | 100% Match (PRD §3.9) |
| **30** | **CRM** | `/crm?sub=customers` | Database Tamu | Profil pelanggan setia, riwayat kunjungan, preferensi meja & menu | `CrmCustomers` | CRM State Manager | `MOCK_CUSTOMERS` | `STAFF` (CRM) / `SUPERVISOR`+ | 100% Match (PRD §6.1) |
| **31** | **CRM** | `/crm?sub=leads` | Prospek Event & Gathering | Manajemen prospek booking gathering kantor, wedding intimate, rombongan | `CrmLeads` | CRM State Manager | `MOCK_LEADS` | `STAFF` (CRM) / `SUPERVISOR`+ | 100% Match (PRD §6.1) |
| **32** | **CRM** | `/crm?sub=pipeline` | Pipeline Penjualan Event | Kanban deal pipeline (Contacted, Survey, DP, Confirmed, Won/Lost) | `CrmPipeline` | CRM State Manager | `MOCK_OPPORTUNITIES` | `STAFF` (CRM) / `SUPERVISOR`+ | 100% Match (PRD §6.2) |
| **33** | **CRM** | `/crm?sub=whatsapp` | WhatsApp Multi-Chat | Chat terpusat dengan tamu, template quick reply reservasi | `CrmWhatsApp` | CRM State Manager | `MOCK_WHATSAPP_CHATS` | `STAFF` (CRM) / `SUPERVISOR`+ | 100% Match (PRD §6.3) |
| **34** | **CRM** | `/crm?sub=blast` | WhatsApp Broadcast | Pengiriman info promo khusus segmen VIP & pelanggan loyal | `CrmWhatsAppBlast` | CRM State Manager | `MOCK_CUSTOMERS` | `MANAGER`+ | 100% Match (PRD §6.3) |
| **35** | **CRM** | `/crm?sub=calendar` | Kalender Reservasi | Kalender jadwal booking ruang VIP, pendopo garden, dan gazebo | `CrmCalendar` | CRM State Manager | `MOCK_OPPORTUNITIES` | `ALL` | 100% Match (PRD §6.4) |
| **36** | **Content** | `/content?sub=calendar` | Content Editorial Calendar | Kalender publikasi Instagram, TikTok, YouTube Shorts resto | `ContentCalendarView` | Content State Manager | Editorial Mock Data | `STAFF` (Content) / `SUPERVISOR`+ | 100% Match (PRD §7.1) |
| **37** | **Content** | `/content?sub=tasks` | Brief & Script Writing | Penyusunan hook 3 detik narasi video kuliner, ide konten, brief visual | Script Brief Module | Content State Manager | `INITIAL_BRIEFS` | `STAFF` (Content) / `SUPERVISOR`+ | 100% Match (PRD §7.1) |
| **38** | **Content** | `/content?sub=campaign` | Influencer & Endorsement | Manajemen kemitraan food vlogger, pengiriman invitation, review | `InfluencerCampaignView` | Content State Manager | Influencer Database | `STAFF` (Content) / `SUPERVISOR`+ | 100% Match (PRD §7.2) |
| **39** | **Content** | `/content?sub=production` | Video Production Pipeline | Alur pengerjaan video (Shooting -> Rough Cut -> Color Grading -> Ready) | Production Pipeline Module | Content State Manager | `INITIAL_PRODUCTION` | `STAFF` (Content) / `SUPERVISOR`+ | 100% Match (PRD §7.3) |
| **40** | **Content** | `/content?sub=performance` | Social Media ROAS | Analisis performa iklan digital, kalkulator return reservasi meja (ROAS) | Social Media Metrics Module | Content State Manager | Analytics State | `MANAGER`+ | 100% Match (PRD §7.4) |
| **41** | **Reports** | `/reports` | Monthly Business Review | Konsolidasi performa 8 pilar bulanan untuk Owner & General Manager | `Reports.tsx` | `DashboardService` | Consolidated Business Engines | `OWNER` / `MANAGER` | 100% Match (PRD §8) |
| **42** | **Development** | `/development?sub=academy` | Business & Hospitality Academy | Modul pembelajaran SOP layanan, teknik upselling, dan kepemimpinan shift | `Development.tsx` | Development State Manager | Academy Database | `ALL` | 100% Match (PRD §9) |
| **43** | **Settings** | `/settings` | Konfigurasi Sistem Resto | Profil resto, matriks RBAC 4 access level, audit arsitektur frontend | `Settings.tsx` | System Config | `MASTER_ROLES`, `MASTER_EMPLOYEES` | `MANAGER` / `OWNER` | 100% Match (PRD §10) |
| **44** | **Auth / Login** | `/login` | Autentikasi Pengguna | Simulasi login 24 personel resto dengan verifikasi hak akses RBAC | `Login.tsx` | `authService` | `MASTER_EMPLOYEES`, `MASTER_ROLES` | `PUBLIC` | 100% Match (PRD §1, §10) |

---

## 3. Submodule Routing & UI Pattern Compliance
- All functional modules render submodules inside clean tab headers within their respective parent page.
- URL search param `?sub=<param>` allows instant bookmarking, direct linking from notifications, and state retention.
- No detached standalone sub-pages exist outside the canonical layout.
