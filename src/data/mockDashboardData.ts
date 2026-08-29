/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DashboardActivityLog {
  id: string;
  timestamp: string;
  user: string;
  division: "CRM" | "KITCHEN" | "BARISTA" | "WAITER" | "CASHIER" | "PURCHASING" | "FINANCE" | "DISHWASH_CLEANING" | "CONTENT_CREATOR";
  category: "SHIFT" | "APPROVAL" | "CRM" | "INVENTORY" | "FINANCE" | "WASTING" | "SYSTEM";
  action: string;
  details: string;
  status: "success" | "warning" | "info" | "alert";
}

export interface DashboardStatistic {
  revenueTrend: { time: string; sales: number; guests: number; target: number }[];
  categoryRevenue: { name: string; revenue: number; percentage: number; color: string }[];
  hourlyTraffic: { hour: string; occupancy: number; orders: number }[];
  costVsProfit: { month: string; revenue: number; hpp: number; netProfit: number }[];
}

export interface PerformanceCase {
  id: string;
  caseNumber: string;
  title: string;
  category: "Customer Complaint" | "Kitchen Delay" | "POS Discrepancy" | "Supplier Issue" | "Facility Maintenance" | "Staff Exception";
  severity: "Low" | "Medium" | "High" | "Critical";
  assignedTo: string;
  reportedBy: string;
  reportedAt: string;
  status: "Open" | "In Progress" | "Resolved" | "Escalated";
  slaDue: string;
  description: string;
  resolutionNotes?: string;
  tableOrRef?: string;
}

export const MOCK_DASHBOARD_ACTIVITIES: DashboardActivityLog[] = [
  {
    id: "act-101",
    timestamp: "10:15 WIB",
    user: "Budi Santoso",
    division: "PURCHASING",
    category: "APPROVAL",
    action: "Approve Purchase Request #PO-2026-089",
    details: "Disetujui pembelian Kopi Arabica Gayo 10Kg & Milk Diamond 20L senilai Rp 3.450.000",
    status: "success",
  },
  {
    id: "act-102",
    timestamp: "09:45 WIB",
    user: "Alya",
    division: "CRM",
    category: "CRM",
    action: "Deal Wedding Event Won",
    details: "MOU Deal Pasangan Rendy & Anita (200 Pax, Rp 78.000.000) ditandatangani + DP 50%",
    status: "success",
  },
  {
    id: "act-103",
    timestamp: "09:12 WIB",
    user: "Dimas",
    division: "KITCHEN",
    category: "WASTING",
    action: "Log Wasting Makanan",
    details: "Input wasting 1.2 Kg Daging Ayam Fillet (Kondisi teroksidasi) senilai Rp 85.000",
    status: "warning",
  },
  {
    id: "act-104",
    timestamp: "08:30 WIB",
    user: "Andi Pratama",
    division: "WAITER",
    category: "SHIFT",
    action: "Checklist Shift Opening Verified",
    details: "18 poin checklist kebersihan & readiness Garden Resto diverifikasi 100% lengkap",
    status: "info",
  },
  {
    id: "act-105",
    timestamp: "08:10 WIB",
    user: "Siti",
    division: "FINANCE",
    category: "FINANCE",
    action: "Reconsile Modal Kasir Morning",
    details: "Modal awal kasir Rp 1.500.000 verified matching dengan POS Terminal 01",
    status: "info",
  },
  {
    id: "act-106",
    timestamp: "07:50 WIB",
    user: "Agus",
    division: "PURCHASING",
    category: "INVENTORY",
    action: "Peringatan Stok Minimum",
    details: "Stok Ikan Gurame Segar tersisa 8 Ekor (Dibawah batas minimum 15 Ekor)",
    status: "alert",
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStatistic = {
  revenueTrend: [
    { time: "08:00", sales: 2500000, guests: 28, target: 2000000 },
    { time: "10:00", sales: 8400000, guests: 72, target: 6000000 },
    { time: "12:00", sales: 24800000, guests: 210, target: 20000000 },
    { time: "14:00", sales: 18200000, guests: 145, target: 15000000 },
    { time: "16:00", sales: 11500000, guests: 90, target: 10000000 },
    { time: "18:00", sales: 32600000, guests: 280, target: 28000000 },
    { time: "20:00", sales: 26500000, guests: 230, target: 25000000 },
  ],
  categoryRevenue: [
    { name: "Buffet & Wedding Event", revenue: 58500000, percentage: 47, color: "#A855F7" },
    { name: "Makanan Ala Carte", revenue: 38200000, percentage: 31, color: "#6366F1" },
    { name: "Beverages & Mocktails", revenue: 18600000, percentage: 15, color: "#EC4899" },
    { name: "Dessert & Pastry", revenue: 9200000, percentage: 7, color: "#10B981" },
  ],
  hourlyTraffic: [
    { hour: "10:00", occupancy: 35, orders: 18 },
    { hour: "12:00", occupancy: 92, orders: 64 },
    { hour: "14:00", occupancy: 65, orders: 42 },
    { hour: "16:00", occupancy: 40, orders: 25 },
    { hour: "18:00", occupancy: 98, orders: 82 },
    { hour: "20:00", occupancy: 85, orders: 58 },
  ],
  costVsProfit: [
    { month: "Mei", revenue: 110, hpp: 38, netProfit: 32 },
    { month: "Juni", revenue: 128, hpp: 42, netProfit: 39 },
    { month: "Juli", revenue: 142, hpp: 46, netProfit: 45 },
    { month: "Agustus", revenue: 124.5, hpp: 39.5, netProfit: 41 },
  ],
};

export const MOCK_PERFORMANCE_CASES: PerformanceCase[] = [
  {
    id: "case-01",
    caseNumber: "CAS-2026-081",
    title: "Keterlambatan Pesanan Meja Garden 12 (>25 Menit)",
    category: "Kitchen Delay",
    severity: "High",
    assignedTo: "Dimas (Chef)",
    reportedBy: "Rizky (Waiter)",
    reportedAt: "08/08 12:45 WIB",
    status: "In Progress",
    slaDue: "15 Menit",
    description: "Tamu mengeluhkan Ikan Gurame Bakar belum keluar setelah 30 menit. Kompor grill 2 sempat overload.",
    tableOrRef: "Garden Meja 12",
  },
  {
    id: "case-02",
    caseNumber: "CAS-2026-082",
    title: "Selisih Kasir Shift Morning - Rp 25.000",
    category: "POS Discrepancy",
    severity: "Medium",
    assignedTo: "Siti (Kasir)",
    reportedBy: "Andi Pratama (SPV)",
    reportedAt: "08/08 11:30 WIB",
    status: "Open",
    slaDue: "2 Jam",
    description: "Laporan cash drawer kasir pagi terdapat kurang Rp 25.000 dibanding sistem POS.",
    resolutionNotes: "Sedang audit ulang receipt kembalian tunai meja VIP 03.",
    tableOrRef: "Kasir POS 01",
  },
  {
    id: "case-03",
    caseNumber: "CAS-2026-083",
    title: "Mesin Espresso Barista Pressure Drop",
    category: "Facility Maintenance",
    severity: "Critical",
    assignedTo: "Fajar (Barista)",
    reportedBy: "Fajar (Barista)",
    reportedAt: "08/08 09:15 WIB",
    status: "In Progress",
    slaDue: "1 Jam",
    description: "Grup 2 Mesin La Marzocco pressure turun di bawah 8 Bar saat ekstrak espresso.",
    tableOrRef: "Barista Counter",
  },
  {
    id: "case-04",
    caseNumber: "CAS-2026-084",
    title: "Komplain Kebersihan Toilet VIP Area",
    category: "Customer Complaint",
    severity: "Low",
    assignedTo: "Rudi (Housekeeping)",
    reportedBy: "Alya (CRM)",
    reportedAt: "08/08 08:50 WIB",
    status: "Resolved",
    slaDue: "30 Menit",
    description: "Klien VIP gathering menginfokan tisu toilet VIP habis.",
    resolutionNotes: "Selesai diisi ulang & dibersihkan oleh Rudi pukul 09:05 WIB.",
    tableOrRef: "VIP Toilet",
  },
];
