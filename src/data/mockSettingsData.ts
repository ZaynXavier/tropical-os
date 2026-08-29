/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  division: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: {
    dashboard: boolean;
    crm: boolean;
    operations: boolean;
    inventory: boolean;
    purchasing: boolean;
    finance: boolean;
    hr: boolean;
    reports: boolean;
    settings: boolean;
  };
}

export interface DivisionItem {
  id: string;
  code: string;
  name: string;
  headName: string;
  staffCount: number;
  location: string;
}

export interface ProductItem {
  sku: string;
  name: string;
  category: string;
  price: number;
  cogs: number;
  margin: string;
  stockAlert: number;
  status: "Active" | "Draft" | "Archived";
}

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  type: "Food" | "Beverage" | "Service" | "Package";
  itemCount: number;
  taxable: boolean;
}

export interface UnitItem {
  id: string;
  code: string;
  name: string;
  category: "Weight" | "Volume" | "Count" | "Packaging";
  baseUnit: string;
  conversion: string;
}

export interface SupplierItem {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  paymentTerms: string;
  rating: number;
}

export interface PipelineStage {
  id: string;
  order: number;
  name: string;
  slaDays: number;
  winProbability: number;
  color: string;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  division: string;
  shift: "Morning" | "Evening" | "Full Day";
  taskCount: number;
  frequency: "Daily" | "Weekly" | "Monthly";
}

export interface DigitalFormTemplate {
  id: string;
  title: string;
  category: string;
  fieldsCount: number;
  approvalRequired: boolean;
  status: "Active" | "Draft";
}

export interface ApprovalRule {
  id: string;
  module: string;
  condition: string;
  approverRole: string;
  slaHours: number;
  autoEscalate: boolean;
}

export const MOCK_COMPANY_INFO = {
  companyName: "Tropical Garden Resto & Venue",
  legalName: "PT Tropical Garden Kuliner Indonesia",
  npwp: "01.234.567.8-012.000",
  address: "Jl. Raya Palagan Tentara Pelajar No. 88, Sariharjo, Ngaglik, Sleman, DI Yogyakarta 55581",
  phone: "(0274) 888-999",
  whatsapp: "+62 812-3456-7890",
  email: "info@tropicalgarden.co.id",
  website: "https://tropicalgarden.co.id",
  taxRate: 10, // PB1 Restoran %
  serviceChargeRate: 5, // %
  operatingHours: "08:00 - 23:00 WIB",
  receiptFooter: "Terima kasih atas kunjungan Anda! Ikuti Instagram @tropicalgarden.yp untuk promo terbaru.",
};

export const MOCK_USERS: SystemUser[] = [
  { id: "USR-001", username: "manager.yogya", fullName: "Ir. Hendra Wijaya", email: "hendra@tropicalgarden.co.id", role: "MANAGER", division: "Management", status: "Active", lastLogin: "Hari ini, 08:30 WIB" },
  { id: "USR-002", username: "spv.andi", fullName: "Andi Pratama, S.Tr.Par", email: "andi@tropicalgarden.co.id", role: "SUPERVISOR", division: "Operations", status: "Active", lastLogin: "Hari ini, 07:15 WIB" },
  { id: "USR-003", username: "chef.dimas", fullName: "Dimas Prasetyo", email: "dimas@tropicalgarden.co.id", role: "CHEF", division: "Kitchen", status: "Active", lastLogin: "Hari ini, 06:45 WIB" },
  { id: "USR-004", username: "bar.budi", fullName: "Budi Santoso", email: "budi@tropicalgarden.co.id", role: "BARISTA", division: "Barista", status: "Active", lastLogin: "Hari ini, 07:00 WIB" },
  { id: "USR-005", username: "crm.alya", fullName: "Alya Amanda, S.Kom", email: "alya@tropicalgarden.co.id", role: "CRM_OFFICER", division: "CRM & Sales", status: "Active", lastLogin: "Hari ini, 09:10 WIB" },
  { id: "USR-006", username: "fin.siti", fullName: "Siti Rahma, S.E.", email: "siti@tropicalgarden.co.id", role: "MANAGER", division: "Finance", status: "Active", lastLogin: "Yesterday, 17:00 WIB" },
  { id: "USR-007", username: "kasir.01", fullName: "Rina Febrianti", email: "rina@tropicalgarden.co.id", role: "KASIR", division: "Cashier", status: "Active", lastLogin: "Hari ini, 07:30 WIB" },
];

export const MOCK_ROLES: RolePermission[] = [
  {
    id: "ROLE-01",
    name: "General Manager",
    description: "Akses penuh ke seluruh sistem operasional, keuangan, HR, dan pengaturan sistem.",
    usersCount: 2,
    permissions: { dashboard: true, crm: true, operations: true, inventory: true, purchasing: true, finance: true, hr: true, reports: true, settings: true },
  },
  {
    id: "ROLE-02",
    name: "Floor Supervisor",
    description: "Akses ke operasional harian, reservasi CRM, inventaris lantai, dan laporan ringkas.",
    usersCount: 4,
    permissions: { dashboard: true, crm: true, operations: true, inventory: true, purchasing: true, finance: false, hr: true, reports: true, settings: false },
  },
  {
    id: "ROLE-03",
    name: "Head Chef & Kitchen",
    description: "Akses ke manajemen dapur, produksi batch, wasting, resep HPP, dan request PO.",
    usersCount: 6,
    permissions: { dashboard: true, crm: false, operations: true, inventory: true, purchasing: true, finance: false, hr: false, reports: true, settings: false },
  },
  {
    id: "ROLE-04",
    name: "Barista Lead",
    description: "Akses ke manajemen bar, resep minuman, stok biji kopi, dan checklist bar.",
    usersCount: 4,
    permissions: { dashboard: true, crm: false, operations: true, inventory: true, purchasing: true, finance: false, hr: false, reports: false, settings: false },
  },
  {
    id: "ROLE-05",
    name: "CRM & Sales Executive",
    description: "Kelola prospek acara wedding, proposal, negosiasi, dan jadwal event venue.",
    usersCount: 3,
    permissions: { dashboard: true, crm: true, operations: false, inventory: false, purchasing: false, finance: false, hr: false, reports: true, settings: false },
  },
];

export const MOCK_DIVISIONS: DivisionItem[] = [
  { id: "DIV-01", code: "MGMT", name: "Executive Management", headName: "Ir. Hendra Wijaya", staffCount: 4, location: "Lantai 2 Admin Office" },
  { id: "DIV-02", code: "KTCH", name: "Main Kitchen & Prep", headName: "Chef Dimas Prasetyo", staffCount: 14, location: "Dapur Utama Ground Floor" },
  { id: "DIV-03", code: "BARS", name: "Barista & Beverage Station", headName: "Budi Santoso", staffCount: 6, location: "Main Hall Bar Barista" },
  { id: "DIV-04", code: "SERV", name: "Dining Service & Floor", headName: "Andi Pratama", staffCount: 12, location: "Dining Hall & Terrace Garden" },
  { id: "DIV-05", code: "CRMS", name: "CRM & Event Sales", headName: "Alya Amanda", staffCount: 4, location: "VIP Marketing Suite" },
  { id: "DIV-06", code: "PURC", name: "Purchasing & Inventory Warehouse", headName: "Joko Susilo", staffCount: 3, location: "Gudang Logistik Belakang" },
  { id: "DIV-07", code: "FINH", name: "Finance, Payroll & HR", headName: "Siti Rahma, S.E.", staffCount: 4, location: "Lantai 2 Finance Room" },
];

export const MOCK_PRODUCTS: ProductItem[] = [
  { sku: "MENU-001", name: "Ayam Bakar Madu Spesial", category: "Main Course", price: 55000, cogs: 17800, margin: "67.6%", stockAlert: 20, status: "Active" },
  { sku: "MENU-002", name: "Gurame Terbang Sambal Terasi", category: "Main Course", price: 95000, cogs: 34900, margin: "63.3%", stockAlert: 10, status: "Active" },
  { sku: "MENU-003", name: "Es Kopi Susu Aren Gajah", category: "Beverage Coffee", price: 28000, cogs: 4900, margin: "82.5%", stockAlert: 50, status: "Active" },
  { sku: "MENU-004", name: "Tahu Cabe Garam Krispi", category: "Appetizer", price: 25000, cogs: 6000, margin: "76.0%", stockAlert: 30, status: "Active" },
  { sku: "MENU-005", name: "Nasi Goreng Seafood Premium", category: "Main Course", price: 48000, cogs: 14200, margin: "70.4%", stockAlert: 25, status: "Active" },
  { sku: "MENU-006", name: "Tropical Matchalatte Ice", category: "Beverage Non-Coffee", price: 32000, cogs: 8500, margin: "73.4%", stockAlert: 30, status: "Active" },
];

export const MOCK_CATEGORIES: CategoryItem[] = [
  { id: "CAT-01", code: "MAIN", name: "Main Course", type: "Food", itemCount: 28, taxable: true },
  { id: "CAT-02", code: "COFF", name: "Beverage Coffee", type: "Beverage", itemCount: 18, taxable: true },
  { id: "CAT-03", code: "NCOF", name: "Beverage Non-Coffee", type: "Beverage", itemCount: 15, taxable: true },
  { id: "CAT-04", code: "APPT", name: "Appetizer & Snacks", type: "Food", itemCount: 14, taxable: true },
  { id: "CAT-05", code: "DESS", name: "Desserts & Pastry", type: "Food", itemCount: 10, taxable: true },
  { id: "CAT-06", code: "WEDD", name: "Wedding Packages", type: "Package", itemCount: 4, taxable: true },
];

export const MOCK_UNITS: UnitItem[] = [
  { id: "UOM-01", code: "KG", name: "Kilogram", category: "Weight", baseUnit: "Gram", conversion: "1 Kg = 1.000 Gram" },
  { id: "UOM-02", code: "GR", name: "Gram", category: "Weight", baseUnit: "Gram", conversion: "1 Gram = 1 Gram" },
  { id: "UOM-03", code: "LTR", name: "Liter", category: "Volume", baseUnit: "Milliliter", conversion: "1 Liter = 1.000 Ml" },
  { id: "UOM-04", code: "ML", name: "Milliliter", category: "Volume", baseUnit: "Milliliter", conversion: "1 Ml = 1 Ml" },
  { id: "UOM-05", code: "PCS", name: "Pieces / Satuan", category: "Count", baseUnit: "Pcs", conversion: "1 Pcs = 1 Pcs" },
  { id: "UOM-06", code: "BOX", name: "Box Dus", category: "Packaging", baseUnit: "Pcs", conversion: "1 Box = 24 Pcs" },
  { id: "UOM-07", code: "IKT", name: "Ikat Sayur", category: "Count", baseUnit: "Gram", conversion: "1 Ikat ≈ 250 Gram" },
];

export const MOCK_SUPPLIERS: SupplierItem[] = [
  { code: "SUP-001", name: "PT Boga Makmur Indonesia", contactPerson: "Haji Ahmad Subagja", phone: "0811-2345-6789", email: "sales@bogamakmur.co.id", category: "Daging & Poultry", paymentTerms: "30 Hari Net", rating: 4.8 },
  { code: "SUP-002", name: "CV Segar Jaya Utama", contactPerson: "Ibu Ratna Pertiwi", phone: "0812-9876-5432", email: "order@segarjaya.com", category: "Sayuran & Buah Organik", paymentTerms: "14 Hari Net", rating: 4.7 },
  { code: "SUP-003", name: "Toko Kopi Nusantara", contactPerson: "Bapak Gunawan", phone: "0813-1122-3344", email: "gunawan@kopinusantara.id", category: "Biji Kopi Specialty", paymentTerms: "COD / Cash", rating: 4.9 },
  { code: "SUP-004", name: "Distributor Packaging Pro", contactPerson: "Kevin Tan", phone: "0815-5566-7788", email: "kevin@packagingpro.co.id", category: "Paper Box & Takeaway", paymentTerms: "15 Hari Net", rating: 4.6 },
];

export const MOCK_PIPELINE_STAGES: PipelineStage[] = [
  { id: "STG-01", order: 1, name: "Inquiry Baru", slaDays: 1, winProbability: 10, color: "#6366F1" },
  { id: "STG-02", order: 2, name: "Survey Tempat", slaDays: 3, winProbability: 30, color: "#8B5CF6" },
  { id: "STG-03", order: 3, name: "Penawaran / Proposal", slaDays: 2, winProbability: 50, color: "#EC4899" },
  { id: "STG-04", order: 4, name: "Negosiasi & Taste Test", slaDays: 4, winProbability: 75, color: "#F59E0B" },
  { id: "STG-05", order: 5, name: "Deal Won (DP Terbayar)", slaDays: 0, winProbability: 100, color: "#10B981" },
  { id: "STG-06", order: 6, name: "Deal Lost", slaDays: 0, winProbability: 0, color: "#EF4444" },
];

export const MOCK_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  { id: "CHK-01", title: "Standard Opening Prep Kitchen", division: "Kitchen", shift: "Morning", taskCount: 14, frequency: "Daily" },
  { id: "CHK-02", title: "Barista & Coffee Machine Calibration", division: "Barista", shift: "Morning", taskCount: 10, frequency: "Daily" },
  { id: "CHK-03", title: "Dining Hall & VIP Terrace Inspection", division: "Service", shift: "Morning", taskCount: 12, frequency: "Daily" },
  { id: "CHK-04", title: "Kitchen Closing & Sanitation Audit", division: "Kitchen", shift: "Evening", taskCount: 16, frequency: "Daily" },
  { id: "CHK-05", title: "Chiller Temperature & Waste Log Check", division: "Operations", shift: "Full Day", taskCount: 8, frequency: "Daily" },
];

export const MOCK_DIGITAL_FORMS: DigitalFormTemplate[] = [
  { id: "FRM-01", title: "Form Pengajuan Lembur (Overtime Request)", category: "HR & Payroll", fieldsCount: 6, approvalRequired: true, status: "Active" },
  { id: "FRM-02", title: "Form Permohonan Cuti / Izin Karyawan", category: "HR & Payroll", fieldsCount: 8, approvalRequired: true, status: "Active" },
  { id: "FRM-03", title: "Form Laporan Kerusakan Alat / Maintenance", category: "Facility & Maintenance", fieldsCount: 7, approvalRequired: true, status: "Active" },
  { id: "FRM-04", title: "Form Pengajuan Kas Kecil (Petty Cash Claim)", category: "Finance", fieldsCount: 5, approvalRequired: true, status: "Active" },
  { id: "FRM-05", title: "Form Laporan Food Wasting & Spoilage", category: "Kitchen Operations", fieldsCount: 6, approvalRequired: false, status: "Active" },
];

export const MOCK_APPROVAL_RULES: ApprovalRule[] = [
  { id: "APR-01", module: "Purchase Order (Pengadaan)", condition: "Nominal > Rp 5.000.000", approverRole: "General Manager", slaHours: 24, autoEscalate: true },
  { id: "APR-02", module: "Cuti / Permission Staff", condition: "Durasi > 1 Hari", approverRole: "Floor Supervisor & HR", slaHours: 12, autoEscalate: false },
  { id: "APR-03", module: "Discount / Void Transaksi", condition: "Nominal > Rp 200.000", approverRole: "Floor Supervisor", slaHours: 1, autoEscalate: true },
  { id: "APR-04", module: "CRM Event Quotation Discount", condition: "Diskon > 10%", approverRole: "General Manager", slaHours: 12, autoEscalate: true },
  { id: "APR-05", module: "Petty Cash Claim", condition: "Nominal > Rp 1.000.000", approverRole: "Finance Manager", slaHours: 8, autoEscalate: false },
];

export const MOCK_SYSTEM_SETTINGS = {
  currency: "IDR (Rupiah)",
  timezone: "Asia/Jakarta (WIB)",
  language: "Bahasa Indonesia",
  dateFormat: "DD/MM/YYYY",
  autoBackup: "Setiap Hari (03:00 WIB)",
  printReceiptMode: "Thermal 80mm - Auto Cut",
  posOfflineSync: "Enabled (Local Cache)",
  smtpStatus: "Connected (smtp.googlemail.com)",
  auditLogging: "Active (Strict Mode)",
};
