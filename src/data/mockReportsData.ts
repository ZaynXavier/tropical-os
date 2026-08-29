export interface ReportMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  metrics: ReportMetric[];
  chartData: { label: string; value1: number; value2?: number; category?: string }[];
  tableHeaders: string[];
  tableData: (string | number)[][];
}

export const MOCK_REPORTS_DATA: Record<string, ReportCategory> = {
  revenue: {
    id: "revenue",
    name: "Revenue Report",
    description: "Analisis komprehensif penerimaan omset, metode pembayaran, serta tren pendapatan harian restoran.",
    metrics: [
      { title: "Total Revenue (Omset)", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Menunggu transaksi" },
      { title: "Average Order Value (AOV)", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Per transaksi" },
      { title: "Total Transaksi", value: "0 Transaksi", change: "0.0%", isPositive: true, subtext: "Dine-in, Takeaway & Delivery" },
      { title: "Net Profit Margin", value: "0.0%", change: "0.0%", isPositive: true, subtext: "Setelah potongan HPP & OPEX" }
    ],
    chartData: [],
    tableHeaders: ["Tanggal / Hari", "Total Transaksi", "Dine-In Omset", "Takeaway / Online", "Diskon & Promo", "Net Omset"],
    tableData: []
  },
  sales: {
    id: "sales",
    name: "Sales Report",
    description: "Evaluasi performa penjualan per kategori produk, item terlaris (top-seller), dan jam sibuk.",
    metrics: [
      { title: "Total Item Terjual", value: "0 Porsi", change: "0.0%", isPositive: true, subtext: "Makanan & Minuman" },
      { title: "Kategori Terlaris", value: "-", change: "0.0%", isPositive: true, subtext: "Belum ada data" },
      { title: "Peak Hour", value: "-", change: "0.0%", isPositive: true, subtext: "Belum ada data" },
      { title: "Repeat Order Rate", value: "0.0%", change: "0.0%", isPositive: true, subtext: "Loyalty customer" }
    ],
    chartData: [],
    tableHeaders: ["Kode Menu", "Nama Menu / Item", "Kategori", "Harga Satuan", "Qty Terjual", "Total Omset"],
    tableData: []
  },
  costing: {
    id: "costing",
    name: "Costing & HPP Report",
    description: "Monitoring Food Cost, Beban Pokok Penjualan (HPP), analisa margin kotor, dan variansi biaya bahan baku.",
    metrics: [
      { title: "Food Cost Percentage", value: "0.0%", change: "0.0%", isPositive: true, subtext: "Target < 35%" },
      { title: "Gross Profit Margin", value: "0.0%", change: "0.0%", isPositive: true, subtext: "Laba kotor" },
      { title: "Total Biaya Bahan (COGS)", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Realisasi bahan baku" },
      { title: "Waste & Spoilage Cost", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Penyusutan bahan" }
    ],
    chartData: [],
    tableHeaders: ["Kode Resep", "Nama Menu", "Kategori", "HPP Standar", "Harga Jual", "Food Cost %", "Gross Margin"],
    tableData: []
  },
  inventory: {
    id: "inventory",
    name: "Inventory Report",
    description: "Laporan nilai valuasi persediaan gudang, tingkat perputaran stok (turnover), serta audit stok opname.",
    metrics: [
      { title: "Total Valuasi Stok", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Chiller, freezer & dry" },
      { title: "Stock Accuracy Rate", value: "100%", change: "0.0%", isPositive: true, subtext: "Hasil Stock Opname" },
      { title: "Critical Low Stock", value: "0 SKU", change: "0.0%", isPositive: true, subtext: "Perlu Re-Order" },
      { title: "Dead Stock / Expired", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Bahan mendekati kadaluarsa" }
    ],
    chartData: [],
    tableHeaders: ["SKU", "Nama Bahan / Item", "Kategori", "Stok Fisik", "Satuan", "Harga Satuan", "Total Nilai"],
    tableData: []
  },
  attendance: {
    id: "attendance",
    name: "HR & Attendance Report",
    description: "Laporan kehadiran pegawai, kedisiplinan shift, jam lembur (overtime), dan produktivitas tenaga kerja.",
    metrics: [
      { title: "Rata-rata Kehadiran", value: "100%", change: "0.0%", isPositive: true, subtext: "Disiplin kehadiran" },
      { title: "Total Jam Lembur (SPL)", value: "0 Jam", change: "0.0%", isPositive: true, subtext: "Seluruh divisi" },
      { title: "Keterlambatan (Late)", value: "0 Menit", change: "0.0%", isPositive: true, subtext: "Bulan berjalan" },
      { title: "Total Pegawai Aktif", value: "1 Orang", change: "0.0%", isPositive: true, subtext: "Super Admin" }
    ],
    chartData: [],
    tableHeaders: ["ID Karyawan", "Nama Karyawan", "Divisi", "Hadir", "Terlambat", "Izin/Cuti", "Lembur"],
    tableData: []
  },
  crm: {
    id: "crm",
    name: "CRM & Guest Experience",
    description: "Laporan pertumbuhan database pelanggan, traffic reservasi meja, program loyalitas VIP, dan ulasan tamu.",
    metrics: [
      { title: "Total Database Tamu", value: "0 Kontak", change: "0.0%", isPositive: true, subtext: "Member terdaftar" },
      { title: "Tamu VIP / Corporate", value: "0 Akun", change: "0.0%", isPositive: true, subtext: "Member VIP" },
      { title: "Tingkat Kepuasan (CSAT)", value: "5.0 / 5.0", change: "0.0%", isPositive: true, subtext: "Berdasarkan ulasan" },
      { title: "Revenue dari Event / VIP", value: "Rp 0", change: "0.0%", isPositive: true, subtext: "Paket banquet & gathering" }
    ],
    chartData: [],
    tableHeaders: ["Kode Reservasi", "Nama Tamu", "Tipe Tamu", "Pax", "Area Meja", "Total Tagihan", "Status"],
    tableData: []
  }
};
