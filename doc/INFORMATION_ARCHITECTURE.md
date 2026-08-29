# TROPICALOS — INFORMATION ARCHITECTURE

## 1. Document Purpose

Dokumen ini mendefinisikan Information Architecture (IA) untuk TROPICALOS — Tropical Garden Resto Operating System.

Dokumen ini menjadi acuan utama untuk:

- Struktur halaman frontend.
- Struktur navigasi utama.
- Struktur sub-menu.
- Hierarki halaman.
- Hubungan antar modul.
- Role-based visibility.
- Struktur detail, form, modal, drawer, dan action.
- User journey antar modul.
- Struktur dashboard berdasarkan role.
- Hubungan antara pekerjaan karyawan dengan sistem development.
- Konsistensi routing frontend.

Dokumen ini dibuat untuk fase frontend-first.

BELUM ADA:

- Backend.
- Database.
- Supabase CRUD.
- REST API.
- WhatsApp API nyata.
- WhatsApp automation nyata.
- AI API nyata.
- Payment gateway.
- GPS production service.
- Face recognition production service.

Semua data dan proses pada fase frontend menggunakan mock data dan service abstraction.

---

# 2. PRODUCT STRUCTURE

TROPICALOS terdiri dari 9 area utama:

1. Dashboard
2. Tropical HR
3. Tropical CRM
4. Operations
5. Finance
6. Development
7. Content Creator
8. Reports
9. Settings

Struktur utama:

TROPICALOS
│
├── Dashboard
├── Tropical HR
├── Tropical CRM
├── Operations
├── Finance
├── Development
├── Content Creator
├── Reports
└── Settings

Menu yang muncul kepada user harus mengikuti RBAC.

Tidak semua user dapat melihat seluruh modul.

---

# 3. GLOBAL APPLICATION SHELL

Setelah login, seluruh halaman protected berada di dalam:

AppShell

Struktur:

AppShell
│
├── Sidebar
│   ├── Brand
│   ├── Main Navigation
│   ├── Module Navigation
│   └── User Section
│
├── Topbar
│   ├── Breadcrumb
│   ├── Page Title
│   ├── Notification
│   ├── Role Badge
│   └── User Menu
│
├── Main Content
│
└── Mobile Navigation

Desktop:

Sidebar tetap berada di sisi kiri.

Mobile:

Sidebar berubah menjadi drawer / bottom navigation sesuai kebutuhan.

---

# 4. GLOBAL NAVIGATION PRINCIPLE

Navigasi harus menggunakan struktur yang konsisten.

Contoh:

Dashboard

Tropical HR
- Employee
- Organization
- Attendance
- Shift & Schedule
- Break Request
- Payroll & Penggajian
- SOP
- Job Description
- IKA
- Checklist
- KPI Personal
- HR Documents
- HR Reports

Tropical CRM
- Customer
- Lead
- Pipeline
- WhatsApp Web
- WhatsApp QR Login
- Chat Customer
- AI Closing Assistant
- WhatsApp Blast
- Follow Up
- Reservation
- CRM Calendar

Operations
- Daily Checklist
- Shift Operations
- Kitchen
- Bar
- Service
- Cleaning & Dishwash
- Purchasing
- Inventory
- Production
- Wasting

Finance
- Revenue
- Cashier
- HPP
- Expenses
- Financial Reports
- Profitability

Development
- Business Academy
- HR Academy
- Business Assessment
- Action Plan
- Task
- Progress
- Branding
- Marketing
- Promotion

Content Creator
- Content Calendar
- Content Task
- Campaign
- Production
- Performance

Reports
- Monthly Business Review

Settings

---

# 5. ROUTING PRINCIPLE

Gunakan routing yang sederhana dan konsisten.

Contoh:

/dashboard

/hr
/hr?sub=employees
/hr?sub=organization
/hr?sub=attendance
/hr?sub=shifts
/hr?sub=breaks
/hr?sub=payroll
/hr?sub=sop
/hr?sub=job-description
/hr?sub=ika
/hr?sub=checklist
/hr?sub=kpi
/hr?sub=documents
/hr?sub=reports

/crm
/crm?sub=customers
/crm?sub=leads
/crm?sub=pipeline
/crm?sub=whatsapp
/crm?sub=whatsapp-qr
/crm?sub=chat
/crm?sub=ai-closing
/crm?sub=blast
/crm?sub=follow-up
/crm?sub=reservation
/crm?sub=calendar

/operations
/operations?sub=checklist
/operations?sub=shift
/operations?sub=kitchen
/operations?sub=bar
/operations?sub=service
/operations?sub=cleaning
/operations?sub=purchasing
/operations?sub=inventory
/operations?sub=production
/operations?sub=wasting

/finance
/finance?sub=revenue
/finance?sub=cashier
/finance?sub=hpp
/finance?sub=expenses
/finance?sub=reports
/finance?sub=profitability

/development
/development?sub=business-academy
/development?sub=hr-academy
/development?sub=assessment
/development?sub=action-plan
/development?sub=task
/development?sub=progress
/development?sub=branding
/development?sub=marketing
/development?sub=promotion

/content
/content?sub=calendar
/content?sub=tasks
/content?sub=campaign
/content?sub=production
/content?sub=performance

/reports
/reports?sub=mbr

/settings

---

# 6. DASHBOARD

## 6.1 Management Command Center

Route:

/dashboard

Dashboard merupakan pusat informasi bisnis.

Dashboard berbeda berdasarkan role.

---

## 6.2 OWNER DASHBOARD

Owner tidak diarahkan untuk mengerjakan pekerjaan operasional.

Owner mendapatkan Executive Business Visibility.

Informasi utama:

### Sales

- Total Sales
- Sales vs Target
- Sales vs Last Month
- Sales vs Last Year
- Dine In
- Take Away
- Delivery
- Average Check
- Guest Count
- Transaction Count
- Sales per Day
- Sales per Hour
- Sales per Shift
- Sales per Outlet

### Menu Performance

- Top 10 Best Seller
- Bottom 10 Seller
- Menu Mix
- Menu Margin
- Contribution Margin
- Add-on Attach Rate
- Beverage Mix
- Dessert Mix

### Food Cost

- Opening Stock
- Purchase
- Transfer In
- Transfer Out
- Closing Stock
- Actual Food Cost
- Theoretical Food Cost
- Variance
- Waste
- Spoilage
- Complimentary
- Staff Meal
- Stock Adjustment

### Inventory

- Stock Opname
- Inventory Accuracy
- Dead Stock
- Slow Moving
- Fast Moving
- Aging Stock
- FEFO Compliance

### Labor

- Total Manpower
- Labor Cost %
- Sales per Employee
- Sales per Labor Hour
- Overtime
- Attendance
- Turnover
- Productivity per Shift

### Operational Expense

- Electricity
- Gas
- Water
- Laundry
- Cleaning
- Office Supplies
- Maintenance
- Marketing
- Royalty
- Pest Control

### Customer Experience

- Google Review
- Rating
- Complaint
- Refund
- Edit Bill
- Void
- Waiting Time
- Serving Time

### Quality

- Food Safety Audit
- Hygiene Score
- Mystery Shopper
- Internal Audit
- Service Audit

### People

- Training Hours
- Coaching
- Disciplinary Case
- Promotion
- Recruitment
- Resignation

### Profit

- Gross Profit
- EBITDA
- Operating Profit
- Net Profit

Dashboard juga menampilkan:

- Business Alerts
- Management Insights
- Root Cause Indicators
- Priority Actions
- Cross Department Performance

---

# 7. TROPICAL HR

Route:

/hr

Tropical HR merupakan sistem pengelolaan SDM.

---

# 7.1 Employee

Route:

/hr?sub=employees

Fungsi:

- Employee directory
- Employee profile
- Employee status
- Department
- Position
- Responsibility
- Join date
- Employment status
- Contact
- Documents
- Personal KPI
- Attendance summary
- Payroll summary

Employee Detail:

Employee
├── Profile
├── Organization
├── Attendance
├── Schedule
├── Break
├── Payroll
├── Documents
├── KPI
└── Development

---

# 7.2 Organization

Route:

/hr?sub=organization

Menampilkan:

Owner
↓
Manager + HR
↓
Supervisor
↓
Functional Teams

Organisasi:

- Management
- HR
- Kitchen
- Bar
- Service
- Cleaning & Dishwash
- CRM
- Finance
- Content Creator

Additional responsibility harus ditampilkan secara eksplisit.

Contoh:

Heri Setiawan
Primary Position: Manager
Additional Responsibility: HR

Putri Okta
Primary Position: Supervisor
Additional Responsibility: Cashier

Ulum
Primary Position: Staff Kitchen
Additional Responsibility:
- Purchasing
- Stock
- Production

Tasnim
Primary Position: Staff Kitchen
Additional Responsibility:
- Purchasing
- Stock
- Production

---

# 7.3 Attendance

Route:

/hr?sub=attendance

Fungsi:

- Check In
- Check Out
- Attendance history
- Attendance status
- Late
- Present
- Off
- Leave
- Attendance summary

Frontend foundation dapat mensimulasikan:

GPS validation
+
Face Verification

Namun jangan mengklaim sebagai production biometric security.

---

# 7.4 Shift & Schedule

Route:

/hr?sub=shifts

Hanya terdapat dua shift resmi:

Shift Pagi
09:00–19:00

Shift Siang
13:00–23:00

Fitur:

- Shift definition
- Employee schedule
- Daily roster
- Weekly roster
- Employee schedule
- Schedule assignment
- Schedule conflict detection
- Cancel schedule
- Schedule history

---

# 7.5 Break Request

Route:

/hr?sub=breaks

Model:

Standard Break
Additional Break

Staff:

- Melihat break sendiri
- Mengajukan additional break
- Melihat status pengajuan

Supervisor:

- Melihat break tim
- Approve
- Reject

Manager:

- Full access

Status:

PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED

---

# 7.6 Payroll & Penggajian

Route:

/hr?sub=payroll

Frontend structure:

Payroll Dashboard
├── Payroll Period
├── Employee Payroll
├── Attendance Adjustment
├── Overtime
├── Kasbon
├── Deduction
├── Allowance
├── Payroll Approval
└── Payslip

Payroll tidak perlu langsung menjadi payroll engine production.

Gunakan mock calculation dan service abstraction.

---

# 7.7 SOP

Route:

/hr?sub=sop

Fungsi:

- Upload SOP
- SOP Library
- Category
- Version
- Effective Date
- Document Preview
- Download
- Revision history

---

# 7.8 Job Description

Route:

/hr?sub=job-description

Setiap posisi memiliki:

- Position name
- Purpose
- Responsibilities
- Daily duties
- Weekly duties
- Monthly duties
- Authority
- KPI relationship

---

# 7.9 IKA

IKA = Instruksi Kerja Aplikasi.

Route:

/hr?sub=ika

Fitur:

- IKA Library
- Category
- Instruction
- Attachment
- Version
- Review
- Approval status

---

# 7.10 Checklist

Route:

/hr?sub=checklist

Fungsi:

- Checklist template
- Checklist assignment
- Checklist completion
- Verification
- History

---

# 7.11 KPI Personal

Route:

/hr?sub=kpi

KPI Personal:

- KPI employee
- KPI category
- Target
- Achievement
- Score
- Review
- Supervisor feedback
- Manager feedback
- KPI history

KPI harus dapat terhubung dengan:

Attendance
Task
Development
Operations
CRM
Sales

sesuai posisi.

---

# 7.12 HR Documents

Route:

/hr?sub=documents

Dokumen:

- Contract
- ID document
- SOP
- Training document
- Warning letter
- Certificates
- Other HR documents

---

# 7.13 HR Reports

Route:

/hr?sub=reports

Reports:

- Headcount
- Attendance
- Payroll
- Overtime
- Leave
- Turnover
- KPI
- Training
- Employee performance

---

# 8. TROPICAL CRM

Route:

/crm

CRM adalah pusat customer relationship dan sales pipeline.

---

# 8.1 Customer

/crm?sub=customers

Data:

- Customer profile
- Contact
- Source
- Tags
- Visit history
- Transaction summary
- Reservation history
- Conversation history
- Follow-up
- Customer notes

---

# 8.2 Lead

/crm?sub=leads

Lead:

- New Lead
- Source
- Customer
- Interest
- Value
- Status
- Owner
- Follow-up date

---

# 8.3 Pipeline

/crm?sub=pipeline

Gunakan Kanban drag & drop.

Stage:

NEW
↓
CONTACTED
↓
QUALIFIED
↓
OFFER
↓
NEGOTIATION
↓
WON
↓
LOST

Pipeline card dapat menampilkan:

- Customer
- Value
- Source
- Last Contact
- Next Follow Up
- Owner
- Priority

---

# 8.4 WhatsApp Web

/crm?sub=whatsapp

Frontend simulation:

- Connection status
- Conversation list
- Search
- Chat window
- Message bubble
- Customer profile
- Quick reply
- Template
- Follow-up

Jangan mengklaim terhubung ke WhatsApp API jika backend belum tersedia.

---

# 8.5 WhatsApp QR Login

/crm?sub=whatsapp-qr

Menampilkan simulasi:

- QR placeholder
- Connection status
- Device name
- Session status
- Connected / Disconnected
- Reconnect

Backend WhatsApp gateway akan diintegrasikan kemudian.

---

# 8.6 Chat Customer

/crm?sub=chat

Workspace:

Conversation list
+
Chat
+
Customer profile
+
Pipeline information
+
Reservation
+
AI suggestions

---

# 8.7 AI Closing Assistant

/crm?sub=ai-closing

AI assistant membantu:

- membaca konteks percakapan
- mengidentifikasi kebutuhan customer
- memberikan rekomendasi balasan
- memberikan closing suggestion
- objection handling
- follow-up recommendation
- menentukan kemungkinan customer siap membeli

AI tidak mengirim pesan secara otomatis.

Human-in-the-loop wajib.

---

# 8.8 WhatsApp Blast

/crm?sub=blast

Fitur:

- Campaign
- Audience
- Customer segmentation
- Message template
- Schedule
- Preview
- Estimated audience
- Campaign status
- Result

Frontend hanya simulation pada tahap ini.

---

# 8.9 Follow Up

/crm?sub=follow-up

Fitur:

- Follow-up queue
- Today
- Overdue
- Upcoming
- Customer
- Last contact
- Next action
- Follow-up status

---

# 8.10 Reservation

/crm?sub=reservation

Fitur:

- Create reservation
- Customer
- Date
- Time
- Guest count
- Table
- Source
- Notes
- Status

Status:

PENDING
CONFIRMED
ARRIVED
COMPLETED
CANCELLED
NO SHOW

---

# 8.11 CRM Calendar

/crm?sub=calendar

Calendar menampilkan:

- Reservation
- Follow-up
- Customer appointment
- Campaign schedule

View:

- Month
- Week
- Day

---

# 9. OPERATIONS

Route:

/operations

Operations adalah pusat aktivitas harian restoran.

---

# 9.1 Daily Checklist

/operations?sub=checklist

Checklist:

Opening
Operational
Closing

Checklist dapat ditugaskan berdasarkan:

- Department
- Shift
- Position
- Employee

---

# 9.2 Shift Operations

/operations?sub=shift

Menampilkan:

- Shift status
- Attendance
- Staff roster
- Handover
- Operational notes
- Incident
- Pending task

---

# 9.3 Kitchen

/operations?sub=kitchen

Menampilkan:

- Kitchen checklist
- Production
- Preparation
- Station status
- Stock alerts
- Wasting
- Kitchen notes

---

# 9.4 Bar

/operations?sub=bar

Menampilkan:

- Bar checklist
- Beverage preparation
- Stock
- Wasting
- Station status

---

# 9.5 Service

/operations?sub=service

Menampilkan:

- Service checklist
- Table status
- Guest flow
- Service issue
- Waiting time
- Serving time

---

# 9.6 Cleaning & Dishwash

/operations?sub=cleaning

Menampilkan:

- Cleaning checklist
- Dishwash status
- Area status
- Cleaning schedule
- Incident

---

# 9.7 Purchasing

/operations?sub=purchasing

Workflow:

Request
↓
Approval
↓
Purchase Order
↓
Receiving
↓
Inventory

---

# 9.8 Inventory

/operations?sub=inventory

Menampilkan:

- Stock
- Stock movement
- Stock opname
- Adjustment
- Dead stock
- Slow moving
- Fast moving
- Aging
- FEFO

---

# 9.9 Production

/operations?sub=production

Menampilkan:

- Production plan
- Batch production
- Ingredients
- Output
- Production variance
- Production history

---

# 9.10 Wasting

/operations?sub=wasting

Menampilkan:

- Waste entry
- Category
- Item
- Quantity
- Reason
- Cost
- Evidence photo
- Approval
- Waste report

---

# 10. FINANCE

Route:

/finance

---

# 10.1 Revenue

/finance?sub=revenue

Menampilkan:

- Daily revenue
- Monthly revenue
- Revenue target
- Achievement
- Channel
- Transaction
- Average check

---

# 10.2 Cashier

/finance?sub=cashier

Menampilkan:

- Opening cash
- Cash sales
- Cashless sales
- Closing cash
- Cash over
- Cash short
- Edit bill
- Void
- Refund

Putri Okta sebagai Supervisor + Cashier memiliki akses sesuai permission.

---

# 10.3 HPP

/finance?sub=hpp

Fitur:

- Recipe
- Ingredient
- Cost
- Portion
- Food cost %
- Theoretical COGS
- Actual COGS
- Margin
- Price simulator

---

# 10.4 Expenses

/finance?sub=expenses

Kategori:

- Electricity
- Gas
- Water
- Laundry
- Cleaning
- Office supplies
- Maintenance
- Marketing
- Royalty
- Pest Control
- Other OPEX

---

# 10.5 Financial Reports

/finance?sub=reports

Reports:

- Revenue
- COGS
- Expense
- Cash flow
- Profit & Loss

---

# 10.6 Profitability

/finance?sub=profitability

Menampilkan:

- Gross Profit
- Gross Margin
- EBITDA
- Operating Profit
- Net Profit
- Profit Margin

---

# 11. DEVELOPMENT

Route:

/development

Development bukan LMS atau e-learning biasa.

Development adalah sistem eksekusi peningkatan bisnis dan SDM.

Core workflow:

Assessment
↓
Gap Analysis
↓
Action Plan
↓
Task
↓
Execution
↓
Progress
↓
Review
↓
Improvement / KPI

---

# 11.1 Business Academy

/development?sub=business-academy

Berisi knowledge/material bisnis yang digunakan untuk:

- memahami konsep
- memberikan referensi
- membangun kemampuan

Namun materi harus dapat dikonversi menjadi action/task.

---

# 11.2 HR Academy

/development?sub=hr-academy

Materi:

- Leadership
- Service
- Discipline
- Communication
- SOP
- People Management
- Coaching

Materi bukan tujuan akhir.

Materi dapat menghasilkan action plan.

---

# 11.3 Business Assessment

/development?sub=assessment

Assessment digunakan untuk menemukan:

- masalah
- gap
- weakness
- opportunity
- priority

Assessment dapat dilakukan berdasarkan:

- Department
- Position
- Employee
- Business area

---

# 11.4 Action Plan

/development?sub=action-plan

Setiap gap dapat menghasilkan:

Action Plan

Field:

- Problem
- Root Cause
- Objective
- Action
- Owner
- Deadline
- Priority
- Status
- KPI

---

# 11.5 Task

/development?sub=task

Task dapat diberikan kepada seluruh SDM sesuai job description.

Task:

- Assigned employee
- Department
- Priority
- Deadline
- Related action plan
- Related KPI
- Status
- Evidence
- Reviewer

Status:

TODO
IN PROGRESS
REVIEW
DONE
OVERDUE

---

# 11.6 Progress

/development?sub=progress

Menampilkan:

- Personal progress
- Department progress
- Action plan progress
- Task completion
- KPI improvement

---

# 11.7 Branding

/development?sub=branding

Hanya dapat diakses oleh Manager dan user yang diberikan permission.

Fokus:

- Brand identity
- Brand positioning
- Brand message
- Brand experience
- Brand consistency
- Brand improvement task

---

# 11.8 Marketing

/development?sub=marketing

Hanya dapat diakses oleh Manager dan user yang diberikan permission.

Marketing digunakan sebagai strategic workspace.

Area:

- Customer research
- Market analysis
- Buying journey
- Customer segmentation
- Campaign strategy
- Content strategy
- Channel strategy
- CRM strategy
- Marketing action plan
- Marketing performance

Strategi harus dapat menghasilkan:

Strategy
↓
Action Plan
↓
Task
↓
Execution
↓
Measurement

---

# 11.9 Promotion

/development?sub=promotion

Menampilkan:

- Promotion planning
- Campaign objective
- Target audience
- Offer
- Channel
- Timeline
- CRM activation
- Content requirement
- Result

Promotion harus terhubung dengan:

CRM
Content Creator
Marketing
Revenue

---

# 12. CONTENT CREATOR

Route:

/content

Content Creator tetap merupakan modul resmi.

Person responsible:

Naila

---

# 12.1 Content Calendar

/content?sub=calendar

Calendar:

- Content
- Campaign
- Deadline
- Publish date
- Platform
- Status

---

# 12.2 Content Task

/content?sub=tasks

Task:

- Brief
- Objective
- Platform
- Format
- Deadline
- Assigned creator
- Reviewer

---

# 12.3 Campaign

/content?sub=campaign

Workflow:

Campaign
↓
Brief
↓
Content Plan
↓
Production
↓
Review
↓
Approval
↓
Publish
↓
Performance

---

# 12.4 Production

/content?sub=production

Stages:

SCRIPT
SHOOT
EDIT
REVIEW
REVISION
APPROVED
PUBLISHED

---

# 12.5 Performance

/content?sub=performance

Metrics:

- Reach
- Engagement
- Views
- Saves
- Shares
- Leads
- Campaign result

---

# 13. REPORTS

Route:

/reports

## Monthly Business Review

/reports?sub=mbr

MBR merupakan laporan bisnis eksekutif.

MBR tidak menjadi tempat input data baru.

MBR mengambil ringkasan dari seluruh modul.

Struktur:

1. Sales
2. Menu Performance
3. Food Cost
4. Inventory
5. Labor
6. Operational Expense
7. Customer Experience
8. Quality
9. People
10. Profit

Setiap bagian memiliki:

Metric
↓
Trend
↓
Variance
↓
Possible Cause
↓
Management Question
↓
Recommended Action

Contoh:

Sales turun

↓

Channel delivery turun

↓

GoFood turun 18%

↓

Management Insight:

"Penurunan revenue terutama berasal dari channel delivery."

↓

Recommended Action:

"Review campaign dan visibility menu delivery."

---

# 14. SETTINGS

Route:

/settings

Settings terdiri dari:

- Profile
- Role
- Permission
- Navigation
- Notification
- System Preferences
- Mock Data Reset
- Application Information

Settings yang sensitif hanya dapat diakses Manager / Owner.

---

# 15. ROLE INFORMATION ARCHITECTURE

## OWNER

Primary objective:

Executive visibility.

Default access:

Dashboard
Reports / MBR

Owner mendapatkan laporan lengkap lintas semua divisi.

Owner tidak perlu mengerjakan task operasional.

---

## MANAGER — HERI SETIAWAN

Primary Position:

Manager

Additional Responsibility:

HR

Access:

Dashboard
Tropical HR
CRM
Operations
Finance
Development
Content Creator
Reports
Settings

Manager merupakan role dengan akses sistem paling luas setelah Owner.

---

## SUPERVISOR — PUTRI OKTA

Primary Position:

Supervisor

Additional Responsibility:

Cashier

Access:

Dashboard
HR team functions
Operations
Cashier
CRM sesuai permission
Development task/progress

Supervisor memiliki authority terhadap tim yang dia supervisi.

---

## STAFF

Staff mendapatkan akses berdasarkan:

- Department
- Position
- Responsibility
- Assigned task
- Permission

Staff tidak melihat:

- Executive financial data
- Payroll seluruh karyawan
- Employee confidential documents
- Manager-only strategy
- MBR executive detail

Staff mendapatkan:

Dashboard personal
Attendance
Schedule
Break
Personal KPI
Assigned Checklist
Assigned Task
Development Progress
Department Operations

---

# 16. STAFF ORGANIZATION

Gunakan master SDM berikut sebagai source of truth frontend.

## Owner

Tri Hermawanto

## Manager + HR

Heri Setiawan

## Supervisor + Cashier

Putri Okta

## Kitchen

Andun
Alfan
Ulum
Tasnim
Fandi
Panji
Tian
Budi

Ulum dan Tasnim memiliki additional responsibility:

- Purchasing
- Stock
- Production

## Bar

Dina
Azizah
Mujab

## Service

Vita
Bintang
Yuda
Roziqin

## Cleaning & Dishwash

Rini
Reno

## CRM

Aqib Latuh
Arfani

## Finance

Ristania Larasati

## Content Creator

Naila

Total:

24 personnel.

---

# 17. CROSS MODULE RELATIONSHIP

TropicalOS harus dibangun sebagai ekosistem.

Relationship utama:

HR
↓
Employee
↓
Job Description
↓
KPI
↓
Development
↓
Task
↓
Progress

Operations
↓
Inventory
↓
Purchasing
↓
Production
↓
Wasting
↓
Finance

CRM
↓
Customer
↓
Lead
↓
Pipeline
↓
Chat
↓
Follow Up
↓
Reservation
↓
Revenue

Marketing
↓
Promotion
↓
CRM
↓
Content Creator
↓
Campaign
↓
Revenue

Operations
↓
Revenue
↓
Finance
↓
Profitability
↓
Dashboard
↓
MBR

---

# 18. GLOBAL DETAIL PAGE PATTERN

Setiap entity detail harus mengikuti pola:

Header
├── Title
├── Status
├── Primary Action
└── Secondary Actions

Summary
├── KPI
├── Status
└── Metadata

Tabs
├── Overview
├── Activity
├── Related Data
└── History

Actions

Related Modules

Audit / History

---

# 19. GLOBAL TABLE PATTERN

Table memiliki:

- Search
- Filter
- Sort
- Pagination
- Status badge
- Row action
- Bulk action jika diperlukan
- Empty state
- Loading state
- Error state

Mobile:

Table berubah menjadi responsive card/list.

---

# 20. GLOBAL FORM PATTERN

Form memiliki:

- Clear labels
- Required indicator
- Validation
- Error message
- Save
- Cancel
- Confirmation jika destructive action

Jangan membuat form yang terlalu panjang tanpa grouping.

Gunakan section:

Basic Information
Details
Assignment
Additional Information
Review
Submit

---

# 21. GLOBAL MODAL / DRAWER PATTERN

Gunakan modal untuk:

- Quick create
- Quick edit
- Confirmation
- Detail sederhana

Gunakan drawer untuk:

- Customer detail
- Employee detail
- Chat context
- Task detail
- Activity history

Halaman penuh digunakan untuk workflow kompleks.

---

# 22. NOTIFICATION ARCHITECTURE

Notification center dapat menampilkan:

- Approval request
- Break request
- Leave request
- Purchase request
- Task overdue
- Schedule conflict
- CRM follow-up
- Reservation
- KPI review
- Development action
- Content review

Notification harus memiliki:

- Type
- Priority
- Time
- Related module
- Read/unread

---

# 23. SEARCH ARCHITECTURE

Global search dapat mencari:

- Employee
- Customer
- Lead
- Task
- Reservation
- SOP
- IKA
- Job Description
- Inventory item
- Purchase request
- Campaign

Search result harus dikelompokkan berdasarkan module.

---

# 24. DATA VISIBILITY PRINCIPLE

Data harus mengikuti prinsip:

OWNER
→ Executive visibility

MANAGER
→ Operational + administrative + strategic visibility

SUPERVISOR
→ Team + operational visibility

STAFF
→ Personal + assigned operational visibility

Jangan hanya menyembunyikan menu.

Permission harus dipersiapkan sampai level:

- Page
- Action
- Data scope

Contoh:

Supervisor dapat melihat Attendance tim.

Namun Staff hanya dapat melihat Attendance dirinya sendiri.

---

# 25. FRONTEND SERVICE ABSTRACTION

UI tidak boleh langsung bergantung kepada mock data.

Gunakan:

/src/services/

Contoh:

employeeService
attendanceService
scheduleService
breakService
payrollService
crmService
customerService
pipelineService
reservationService
operationsService
inventoryService
purchasingService
financeService
developmentService
taskService
contentService
dashboardService
reportService

Mock implementation berada di belakang service layer.

Tujuannya agar backend dapat diganti kemudian tanpa mengubah UI.

---

# 26. MOCK DATA PRINCIPLE

Mock data harus:

- realistis
- konsisten
- relational
- tidak random setiap render
- dapat di-reset
- memiliki ID unik
- menggunakan employeeId/customerId/taskId/etc.
- mengikuti struktur organisasi Tropical Garden Resto

Jangan membuat mock data yang berdiri sendiri tanpa hubungan.

Contoh:

Task
→ employeeId

Attendance
→ employeeId
→ shiftId

Break
→ attendanceId
→ employeeId

Schedule
→ employeeId
→ shiftId

KPI
→ employeeId

Development Task
→ employeeId
→ actionPlanId

Reservation
→ customerId

Pipeline
→ customerId

---

# 27. FRONTEND STATES

Setiap halaman data harus memiliki minimal:

Loading
Empty
Error
Success

Contoh:

Loading:
"Memuat data..."

Empty:
"Belum ada data."

Error:
"Gagal memuat data."

Success:
Menampilkan data.

Untuk mock data, tetap tampilkan state tersebut secara struktural agar backend integration nantinya mudah.

---

# 28. RESPONSIVE INFORMATION ARCHITECTURE

Desktop:

Sidebar
+
Topbar
+
Content

Tablet:

Collapsible Sidebar
+
Topbar
+
Content

Mobile:

Topbar
+
Content
+
Bottom Navigation / Drawer

Prioritaskan:

1. Primary KPI
2. Primary Action
3. Critical Alert
4. Main Data
5. Secondary Information

---

# 29. FRONTEND DEVELOPMENT RULES

Google AI Studio wajib mengikuti aturan:

1. Jangan menghapus fitur existing yang belum diminta.
2. Jangan membuat backend.
3. Jangan membuat database.
4. Jangan membuat API palsu yang seolah-olah production.
5. Jangan mengklaim WhatsApp sudah terhubung.
6. Jangan mengklaim AI sudah terhubung.
7. Gunakan mock data.
8. Gunakan service abstraction.
9. Jangan menaruh business logic kompleks langsung di UI.
10. Gunakan TypeScript.
11. Gunakan reusable components.
12. Gunakan human-readable labels.
13. Hindari underscore pada label UI.
14. Pertahankan responsive design.
15. Jangan mengubah module lain tanpa alasan.
16. Jangan membuat duplicate service.
17. Jangan membuat duplicate type.
18. Jangan membuat duplicate mock data.
19. Setiap perubahan harus mempertahankan build.
20. Setelah setiap phase lakukan build dan type check.

---

# 30. IMPLEMENTATION PRIORITY

Frontend akan dibangun dengan urutan:

PHASE 0
Foundation & Application Shell

↓

PHASE 1
Authentication & Session

↓

PHASE 2
Management Dashboard

↓

PHASE 3
Tropical HR

↓

PHASE 4
Tropical CRM

↓

PHASE 5
Operations

↓

PHASE 6
Finance

↓

PHASE 7
Development

↓

PHASE 8
Content Creator

↓

PHASE 9
Reports / Monthly Business Review

↓

PHASE 10
Settings & Final Frontend Hardening

---

# 31. DEFINITION OF DONE

Sebuah module dianggap selesai apabila:

- Navigation tersedia.
- Page tersedia.
- Role visibility tersedia.
- Mock data tersedia.
- Service abstraction tersedia.
- Loading state tersedia.
- Empty state tersedia.
- Error state tersedia.
- Detail view tersedia jika diperlukan.
- Create/Edit flow tersedia jika diperlukan.
- Responsive.
- Tidak merusak module lain.
- TypeScript tidak error.
- Build berhasil.
- UI konsisten dengan TropicalOS design system.

---

# 32. FINAL INFORMATION ARCHITECTURE PRINCIPLE

TROPICALOS bukan sekadar kumpulan halaman.

TROPICALOS harus bekerja sebagai Business Operating System:

PEOPLE
+
PROCESS
+
DATA
+
TASK
+
CUSTOMER
+
FINANCE
+
DEVELOPMENT
+
REPORTING

Semua modul harus saling terhubung secara konseptual.

Tujuan akhir:

DATA
↓
INFORMATION
↓
INSIGHT
↓
DECISION
↓
ACTION
↓
TASK
↓
EXECUTION
↓
MEASUREMENT
↓
IMPROVEMENT

Inilah prinsip utama Information Architecture TropicalOS.
