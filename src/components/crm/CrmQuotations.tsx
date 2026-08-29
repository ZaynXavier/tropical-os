/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Quotation, QuotationItem } from "../../data/mockCrmData";
import {
  FileText,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  Download,
  Eye,
  Printer,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface CrmQuotationsProps {
  quotations?: Quotation[];
  onAddQuotation?: (q: Quotation) => void;
  onUpdateStatus?: (id: string, status: Quotation["status"]) => void;
  onSendToWhatsApp?: (phone: string, text: string) => void;
}

const MENU_PRESETS = [
  { name: "Buffet Package Royal Tropical (100 Pax)", category: "Buffet Package", price: 350000 },
  { name: "Buffet Package Executive Garden (50 Pax)", category: "Buffet Package", price: 280000 },
  { name: "Beverage Bar Station (Mocktail & Es Kelapa)", category: "Beverage", price: 45000 },
  { name: "Tropical Floral Decoration & Photobooth", category: "Decoration", price: 12000000 },
  { name: "Acoustic Live Music & Sound System", category: "Live Music", price: 6750000 },
  { name: "Kebersihan & Area Rental Service Fee", category: "Service Fee", price: 3500000 },
];

export const CrmQuotations: React.FC<CrmQuotationsProps> = ({
  quotations = [],
  onAddQuotation,
  onUpdateStatus,
  onSendToWhatsApp,
}) => {
  const safeQuotations = quotations || [];
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // New Quotation Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+62 ");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("2026-09-20");
  const [guestCount, setGuestCount] = useState(100);
  const [discount, setDiscount] = useState(1000000);

  const [items, setItems] = useState<QuotationItem[]>([
    {
      name: "Buffet Package Royal Tropical (100 Pax)",
      category: "Buffet Package",
      unitPrice: 350000,
      quantity: 100,
      total: 35000000,
    },
    {
      name: "Tropical Floral Decoration & Photobooth",
      category: "Decoration",
      unitPrice: 12000000,
      quantity: 1,
      total: 12000000,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round((subtotal - discount) * 0.1); // 10% tax
  const grandTotal = subtotal - discount + tax;

  const handleAddItem = (presetIndex: number) => {
    const preset = MENU_PRESETS[presetIndex];
    if (!preset) return;
    const qty = preset.category === "Buffet Package" || preset.category === "Beverage" ? guestCount : 1;
    setItems((prev) => [
      ...prev,
      {
        name: preset.name,
        category: preset.category as QuotationItem["category"],
        unitPrice: preset.price,
        quantity: qty,
        total: preset.price * qty,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;

    const newQ: Quotation = {
      id: `QT-${Date.now()}`,
      quotationNumber: `TGR/QT/2026/08/00${quotations.length + 1}`,
      customerName,
      customerPhone,
      eventName,
      eventDate,
      guestCount,
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      status: "Sent",
      createdAt: "2026-08-08",
      validUntil: "2026-08-22",
    };

    onAddQuotation(newQ);
    setIsBuilderOpen(false);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Quotation Generator &amp; Surat Penawaran</h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Buat rincian penawaran harga otomatis untuk paket acara wedding, gathering, dan catering resto.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Penawaran Baru</span>
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-[#130F30]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-purple-300/80 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">No. Quotation</th>
                <th className="p-4">Nama Klien &amp; Event</th>
                <th className="p-4">Tgl Event &amp; Pax</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {safeQuotations.map((q) => (
                <tr key={q.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-black text-purple-300">{q.quotationNumber}</td>
                  <td className="p-4">
                    <strong className="text-white block text-sm">{q.customerName}</strong>
                    <span className="text-[10px] text-purple-300/70">{q.eventName}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-white block">{q.eventDate}</span>
                    <span className="text-[10px] text-purple-300/70">{q.guestCount} Tamu</span>
                  </td>
                  <td className="p-4 font-black text-emerald-400">
                    Rp {(q.grandTotal ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <select
                      value={q.status}
                      onChange={(e) =>
                        onUpdateStatus(q.id, e.target.value as Quotation["status"])
                      }
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${
                        q.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : q.status === "Sent"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-white/10 text-purple-200 border-white/20"
                      }`}
                    >
                      <option value="Draft" className="bg-[#130F30]">Draft</option>
                      <option value="Sent" className="bg-[#130F30]">Sent</option>
                      <option value="Approved" className="bg-[#130F30]">Approved</option>
                      <option value="Rejected" className="bg-[#130F30]">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedQuotation(q)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-purple-200 rounded-xl border border-white/10 font-bold text-[10px] cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          const waText = `Halo ${q.customerName}, berikut kami lampirkan Quotation ${q.quotationNumber} untuk ${q.eventName}.\nGrand Total: Rp ${(q.grandTotal ?? 0).toLocaleString("id-ID")}\nValid sampai: ${q.validUntil}`;
                          onSendToWhatsApp(q.customerPhone, waText);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-[10px] cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Quotation Preview Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white">
            {/* Printable PDF Header */}
            <div className="border-b-2 border-purple-500/30 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">
                  TROPICAL GARDEN RESTO
                </h1>
                <p className="text-[10px] text-purple-300/70">
                  Jl. Garden Park No. 88 • Hotline: +62 812-9900-1122
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-extrabold text-purple-300 block">
                  {selectedQuotation.quotationNumber}
                </span>
                <span className="text-[10px] text-purple-300/60">Tanggal: {selectedQuotation.createdAt}</span>
              </div>
            </div>

            {/* Client info */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-purple-300/60 block uppercase font-bold">DITUJUKAN KEPADA:</span>
                <strong className="text-white text-sm block mt-0.5">{selectedQuotation.customerName}</strong>
                <p className="text-[10px] text-purple-300/70 font-mono">{selectedQuotation.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] text-purple-300/60 block uppercase font-bold">DETAIL ACARA:</span>
                <strong className="text-purple-200 text-sm block mt-0.5">{selectedQuotation.eventName}</strong>
                <p className="text-[10px] text-purple-300/70">
                  Tgl: {selectedQuotation.eventDate} ({selectedQuotation.guestCount} Pax)
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0D0922]/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 font-bold text-[10px] uppercase text-purple-300/80">
                  <tr>
                    <th className="p-3">Item Deskripsi</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(selectedQuotation.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[9px] text-purple-300/60">{item.category}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-200">{item.quantity}</td>
                      <td className="p-3 text-right text-purple-200">
                        Rp {(item.unitPrice ?? 0).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        Rp {(item.total ?? 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-2 text-xs">
              <div className="w-64 space-y-1.5 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between text-purple-300/70">
                  <span>Subtotal:</span>
                  <span>Rp {(selectedQuotation.subtotal ?? 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-pink-300 font-semibold">
                  <span>Diskon Khusus:</span>
                  <span>- Rp {(selectedQuotation.discount ?? 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-purple-300/70">
                  <span>Pajak Resto (10%):</span>
                  <span>Rp {(selectedQuotation.tax ?? 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-400 text-sm pt-2 border-t border-white/10">
                  <span>GRAND TOTAL:</span>
                  <span>Rp {(selectedQuotation.grandTotal ?? 0).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print PDF</span>
              </button>

              <button
                onClick={() => setSelectedQuotation(null)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Quotation Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white">Quotation Builder Event</h3>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="text-purple-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Nama Klien *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">No WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Nama Acara</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Jumlah Tamu (Pax)</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Presets Item Picker */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <label className="font-bold text-purple-200 block">Tambah Paket &amp; Layanan Preset:</label>
                <div className="flex flex-wrap gap-2">
                  {MENU_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddItem(idx)}
                      className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-[10px] font-bold text-purple-200 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3 text-pink-400" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0D0922]/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 font-bold text-[10px] uppercase text-purple-300/80">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-white">{item.name}</td>
                        <td className="p-2.5 text-center font-bold text-purple-200">{item.quantity}</td>
                        <td className="p-2.5 text-right font-black text-emerald-400">
                          Rp {(item.total ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-pink-400 hover:bg-pink-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations summary */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal:</span>
                  <strong className="text-white">Rp {(subtotal ?? 0).toLocaleString("id-ID")}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Potongan Diskon (Rp):</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-32 p-1.5 text-right bg-white/10 border border-white/20 rounded-xl text-xs font-black text-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-between font-black text-emerald-400 text-sm pt-2 border-t border-white/10">
                  <span>Estimasi Grand Total:</span>
                  <span>Rp {(grandTotal ?? 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs hover:opacity-90"
                >
                  Simpan Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
