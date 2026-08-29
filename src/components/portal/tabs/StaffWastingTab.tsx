import React, { useState } from 'react';
import { EmployeePersonnel } from '../../../types/employee';
import { MOCK_WASTING_LOGS, WastingLogItem } from '../../../data/mockOperationsData';
import { BeforeAfterPhotoUploader, PhotoEvidencePair } from '../components/BeforeAfterPhotoUploader';
import {
  Trash2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Camera,
  Coffee,
  ChefHat,
  Utensils,
  CreditCard,
  Sparkle,
  X,
  Clock,
  TrendingDown,
  Image as ImageIcon,
  Eye
} from 'lucide-react';

interface StaffWastingTabProps {
  currentUser: EmployeePersonnel | null;
  onNavigateTab?: (tab: string) => void;
}

const DIVISION_WASTE_PRESETS: Record<string, { categories: string[]; reasons: string[]; commonItems: string[] }> = {
  kitchen: {
    categories: ['Bahan Dapur (Daging/Seafood)', 'Sayur & Buah Segar', 'Makanan Jadi (Cooked)', 'Bumbu & Saus'],
    reasons: ['Salah Masak / Overcooked / Gosong', 'Bahan Basi / Expired', 'Chiller / Freezer Rusak', 'Trim Loss / Potongan Rusak', 'Sisa Piring (Plate Waste)'],
    commonItems: ['Beef Wagyu Meltique 200g', 'Ayam Broiler Fillet', 'Salmon Fillet Norwegia', 'Sayur Selada Romaine', 'Sambal Matah Bali 1kg'],
  },
  bar: {
    categories: ['Bahan Bar & Dairy', 'Sirup & Cordial', 'Minuman Jadi (Coffee/Mocktail)', 'Buah Garnish'],
    reasons: ['Susu Basi / Curdled Milk', 'Spillage / Tumpah Saat Pouring', 'Botol Sirup / Kaca Pecah', 'Salah Resep / Salah Orderan', 'Biji Kopi Dial-in Over Extraction'],
    commonItems: ['Greenfields Fresh Milk Pasteurized', 'Monin Caramel Syrup 700ml', 'Signature Tropical Punch Mocktail', 'Oat Milk Barista Edition', 'Jeruk Lemon Import Sunkist'],
  },
  cashier: {
    categories: ['Pesanan Batal (Void Order)', 'Salah Input Kasir', 'Refund Makanan Rusak'],
    reasons: ['Salah Input Menu Kasir (Sudah Dibuat Dapur)', 'Tamu Batal Pesanan Setelah Masuk Kitchen', 'Double Bill Input Error', 'Sistem POS Error / Diskon Salah'],
    commonItems: ['Truffle Mushroom Pizza', 'Sirloin Steak 200g', 'Iced Caramel Macchiato', 'Nasi Goreng Kampung VIP', 'Crispy Chicken Wings'],
  },
  service: {
    categories: ['Makanan Tumpah di Meja/Floor', 'Piring / Gelas Jatuh (Breakage)', 'Komplain Makanan Tamu'],
    reasons: ['Piring / Gelas Jatuh Saat Serving', 'Makanan Tumpah di Area Tamu (Spillage)', 'Komplain Tamu (Makanan Dingin / Ada Rambut)', 'Sisa Prasmanan Event VIP'],
    commonItems: ['Piring Keramik Dinner Plate 28cm', 'Gelas Highball Beverage', 'Pasta Truffle Carbonara', 'Soup Bowl Keramik', 'Iced Lemon Tea Pitcher'],
  },
  cleaning: {
    categories: ['Chinaware / Glassware Pecah (Dishwash)', 'Chemical & Sabun Cuci Tumpah', 'Peralatan Sanitasi Rusak'],
    reasons: ['Pecah Saat Pencucian di Sink Dishwasher', 'Piring Retak / Sumbing Akibat Benturan', 'Chemical Dishwasher Tumpah', 'Spons & Kain Microfiber Rusak'],
    commonItems: ['Piring Saji Keramik Motif Garden', 'Gelas Sloki / Wine Glass Crystal', 'Mangkok Sup Keramik Putih', 'Sabun Cuci Piring Kimia 5L', 'Tatakan Kayu Steak Hotplate'],
  },
};

export const StaffWastingTab: React.FC<StaffWastingTabProps> = ({ currentUser }) => {
  // Determine user's division
  const rawDept = currentUser?.department?.toLowerCase() || '';
  const rawPos = currentUser?.primaryPosition?.toLowerCase() || '';

  let currentDivKey = 'kitchen';
  if (rawDept.includes('bar') || rawPos.includes('barista')) currentDivKey = 'bar';
  else if (rawDept.includes('kasir') || rawDept.includes('cashier') || rawPos.includes('kasir')) currentDivKey = 'cashier';
  else if (rawDept.includes('service') || rawDept.includes('waiter') || rawPos.includes('waiter')) currentDivKey = 'service';
  else if (rawDept.includes('clean') || rawDept.includes('dish') || rawDept.includes('housekeeping') || rawPos.includes('dish')) currentDivKey = 'cleaning';

  const [selectedDivisionTab, setSelectedDivisionTab] = useState<string>(currentDivKey);
  const [logs, setLogs] = useState<WastingLogItem[]>(MOCK_WASTING_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPhotoLog, setViewingPhotoLog] = useState<WastingLogItem | null>(null);

  // Form State
  const preset = DIVISION_WASTE_PRESETS[selectedDivisionTab] || DIVISION_WASTE_PRESETS.kitchen;
  const [formItemName, setFormItemName] = useState(preset.commonItems[0] || '');
  const [formCategory, setFormCategory] = useState(preset.categories[0] || 'Bahan Dapur');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState<WastingLogItem['unit']>('Kg');
  const [formReason, setFormReason] = useState<WastingLogItem['reason']>(preset.reasons[0] as any);
  const [formCostPerUnit, setFormCostPerUnit] = useState<number>(45000);
  const [formPhotos, setFormPhotos] = useState<PhotoEvidencePair>({
    beforePhotoUrl: null,
    afterPhotoUrl: null,
  });

  // Switch division preset when changing form tab
  const handleSelectDivisionTab = (divKey: string) => {
    setSelectedDivisionTab(divKey);
    const p = DIVISION_WASTE_PRESETS[divKey] || DIVISION_WASTE_PRESETS.kitchen;
    setFormCategory(p.categories[0] || 'Bahan Dapur');
    setFormReason(p.reasons[0] as any);
    setFormItemName(p.commonItems[0] || '');
  };

  const handleAddWasting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemName.trim()) return;

    const totalCost = formQuantity * formCostPerUnit;
    const newEntry: WastingLogItem = {
      id: `w-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      time: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      itemCode: `WST-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: formItemName,
      category: formCategory as any,
      quantity: formQuantity,
      unit: formUnit,
      reason: formReason,
      costPerUnit: formCostPerUnit,
      totalCost,
      reportedBy: currentUser?.name || 'Staff Resto',
      division: selectedDivisionTab.toUpperCase(),
      status: 'Approved',
      beforePhotoUrl: formPhotos.beforePhotoUrl || undefined,
      afterPhotoUrl: formPhotos.afterPhotoUrl || undefined,
      photoAttached: Boolean(formPhotos.beforePhotoUrl || formPhotos.afterPhotoUrl),
    };

    setLogs([newEntry, ...logs]);
    setIsAddModalOpen(false);
    setFormPhotos({ beforePhotoUrl: null, afterPhotoUrl: null });
  };

  // Metrics
  const totalLoss = logs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const filteredLogs = logs.filter((log) => {
    const searchLower = (searchQuery || '').toLowerCase();
    return (
      !searchLower ||
      log.itemName.toLowerCase().includes(searchLower) ||
      log.reportedBy.toLowerCase().includes(searchLower) ||
      log.reason.toLowerCase().includes(searchLower) ||
      log.division.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4 animate-fade-in text-gray-100">
      {/* Header Banner */}
      <div className="p-4 rounded-[26px] bg-gradient-to-r from-[#2A1622] via-[#201323] to-[#14101F] border border-rose-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                Wasting &amp; Item Loss Tracker
              </h2>
              <p className="text-[10px] text-rose-200">
                Kitchen • Bar • Kasir • Waiter/Service • Dishwash/Cleaning
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Waste</span>
          </button>
        </div>

        {/* 5 Division Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
          {[
            { id: 'kitchen', label: '🍳 Kitchen', icon: ChefHat },
            { id: 'bar', label: '☕ Bar', icon: Coffee },
            { id: 'cashier', label: '💵 Kasir', icon: CreditCard },
            { id: 'service', label: '🍽️ Waiters', icon: Utensils },
            { id: 'cleaning', label: '🧼 Dishwash', icon: Sparkle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectDivisionTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                selectedDivisionTab === tab.id
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                  : 'bg-[#151C2C] text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Loss Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#141A29] border border-[#27324A] shadow-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Total Kerugian Waste</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-black text-rose-400 font-mono">
            Rp {totalLoss.toLocaleString('id-ID')}
          </div>
          <div className="text-[9px] text-gray-400">Akumulasi {logs.length} kejadian</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141A29] border border-[#27324A] shadow-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Divisi Aktif Anda</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-black text-white capitalize">
            {currentUser?.department || selectedDivisionTab}
          </div>
          <div className="text-[9px] text-emerald-400">Kamera &amp; Galeri Siap Foto</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari item terbuang, pelapor, atau alasan..."
          className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#141A29] border border-[#263148] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-all shadow-inner"
        />
      </div>

      {/* Wasting Logs List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
          <span>Riwayat Log Wasting Seluruh Divisi</span>
          <span className="text-[10px] text-rose-400">{filteredLogs.length} Catatan</span>
        </div>

        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 rounded-2xl bg-[#151C2C] border border-[#27324A] hover:border-rose-500/40 transition-all shadow-md space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{log.itemName}</h3>
                  <div className="text-[10px] text-gray-400">
                    {log.itemCode} • Divisi: <span className="text-rose-300 font-bold">{log.division}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-black text-rose-400 font-mono">
                -Rp {log.totalCost.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
              <div className="text-[11px] text-gray-300">
                <span className="text-gray-400">Jumlah: </span>
                <span className="font-bold text-white">{log.quantity} {log.unit}</span>
              </div>
              <div className="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/40">
                {log.reason}
              </div>
            </div>

            {/* Before-After Photo Evidence Thumbnail if exists */}
            {(log.beforePhotoUrl || log.afterPhotoUrl) && (
              <div
                onClick={() => setViewingPhotoLog(log)}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-500/60 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {log.beforePhotoUrl && (
                      <img
                        src={log.beforePhotoUrl}
                        alt="Before"
                        className="w-7 h-7 rounded-lg object-cover border border-amber-500/50"
                      />
                    )}
                    {log.afterPhotoUrl && (
                      <img
                        src={log.afterPhotoUrl}
                        alt="After"
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-500/50"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300">
                    Bukti Foto (Before - After) Terlampir
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold">
                  <Eye className="w-3 h-3" />
                  <span>Lihat Foto</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-white/5">
              <span>Dilaporkan: {log.reportedBy}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                {log.date} {log.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          MODAL: ADD NEW WASTING LOG WITH CAMERA / GALLERY UPLOAD
      ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[90vh] bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Input Log Wasting &amp; Kerusakan</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWasting} className="p-4 space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1">
              {/* Division Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Divisi Pelapor:</label>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                  {[
                    { id: 'kitchen', label: 'Kitchen' },
                    { id: 'bar', label: 'Bar' },
                    { id: 'cashier', label: 'Kasir' },
                    { id: 'service', label: 'Waiter' },
                    { id: 'cleaning', label: 'Dishwash' },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => handleSelectDivisionTab(d.id)}
                      className={`py-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                        selectedDivisionTab === d.id
                          ? 'bg-rose-500 text-white border-rose-500 shadow'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Item Suggestion Chips */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Pilih / Ketik Nama Item:</label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {preset.commonItems.slice(0, 3).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setFormItemName(item)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-rose-300 border border-rose-500/20 cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={formItemName}
                  onChange={(e) => setFormItemName(e.target.value)}
                  placeholder="Nama item / bahan makanan / barang pecah..."
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                />
              </div>

              {/* Quantity & Unit & Cost */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Jumlah:</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Satuan:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none font-bold"
                  >
                    <option value="Porsi">Porsi</option>
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Pcs">Pcs (Piring/Gelas)</option>
                    <option value="Botol">Botol</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Est. Biaya/Unit:</label>
                  <input
                    type="number"
                    step="5000"
                    value={formCostPerUnit}
                    onChange={(e) => setFormCostPerUnit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-rose-400 font-bold outline-none font-mono"
                  />
                </div>
              </div>

              {/* Reason Presets */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Alasan Wasting:</label>
                <select
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                >
                  {preset.reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Real Before-After Photo Uploader (Kamera & Galeri) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Bukti Foto Kerusakan / Penanganan (Before - After):</span>
                </label>
                <BeforeAfterPhotoUploader
                  value={formPhotos}
                  onChange={setFormPhotos}
                  beforeLabel="Foto Kerusakan / Barang Pecah (Before)"
                  afterLabel="Foto Dibuang / Ditangani / Diganti (After)"
                />
              </div>

              {/* Total Loss Calculation Preview */}
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-gray-300">Estimasi Total Kerugian:</span>
                <span className="font-black text-rose-400 text-sm font-mono">
                  Rp {(formQuantity * formCostPerUnit).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Simpan Log Wasting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: VIEW PHOTO EVIDENCE PREVIEW
      ============================================================ */}
      {viewingPhotoLog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101626] border border-[#27324A] rounded-3xl shadow-2xl p-4 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-white">Bukti Foto: {viewingPhotoLog.itemName}</h3>
                <div className="text-[10px] text-gray-400">
                  {viewingPhotoLog.itemCode} • Dilaporkan: {viewingPhotoLog.reportedBy}
                </div>
              </div>
              <button
                onClick={() => setViewingPhotoLog(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-gray-300 flex items-center justify-center hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 inline-block">
                  Kondisi Awal (Before)
                </span>
                {viewingPhotoLog.beforePhotoUrl ? (
                  <img
                    src={viewingPhotoLog.beforePhotoUrl}
                    alt="Before"
                    className="w-full h-44 object-cover rounded-2xl border border-white/10 shadow-md"
                  />
                ) : (
                  <div className="w-full h-44 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500">
                    Tidak ada foto
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center">
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 inline-block">
                  Setelah Ditangani (After)
                </span>
                {viewingPhotoLog.afterPhotoUrl ? (
                  <img
                    src={viewingPhotoLog.afterPhotoUrl}
                    alt="After"
                    className="w-full h-44 object-cover rounded-2xl border border-white/10 shadow-md"
                  />
                ) : (
                  <div className="w-full h-44 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500">
                    Tidak ada foto
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingPhotoLog(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
