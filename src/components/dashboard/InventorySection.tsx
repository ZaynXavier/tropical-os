import React from 'react';
import { InventoryData } from '../../data/dashboard/types';
import { ManagementInsightBox } from './ManagementInsightBox';
import {
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Archive,
} from 'lucide-react';

interface InventorySectionProps {
  data: InventoryData;
}

export const InventorySection: React.FC<InventorySectionProps> = ({ data }) => {
  const formatRp = (val?: number | null) => {
    return `Rp ${(val ?? 0).toLocaleString('id-ID')}`;
  };

  const getClassificationBadge = (classification: 'FAST_MOVING' | 'SLOW_MOVING' | 'DEAD_STOCK') => {
    switch (classification) {
      case 'FAST_MOVING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ⚡ Fast Moving
          </span>
        );
      case 'SLOW_MOVING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ⏳ Slow Moving
          </span>
        );
      case 'DEAD_STOCK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ⚠️ Dead Stock
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#1E2438] border border-[#2D374E] p-5 md:p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dimensi 4
            </span>
            <h2 className="text-base md:text-lg font-black text-gray-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>Manajemen Inventory, Stok &amp; Kepatuhan FEFO</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Akurasi Stock Opname, kepatuhan First Expired First Out, nilai persediaan gudang, dan peringatan dead stock.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2D374E] text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FEFO: {data.fefoCompliancePct}%</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stock Opname Accuracy */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Akurasi Stock Opname</span>
          <div className="text-2xl font-black text-emerald-400">{data.overallAccuracyPct.toFixed(1)}%</div>
          <div className="text-[11px] text-gray-300">
            {data.stockOpnameDiscrepanciesCount} SKU selisih fisik dari {data.totalSkus} total SKU
          </div>
          <p className="text-[10px] text-gray-400">Target akurasi operasional: &gt;95%</p>
        </div>

        {/* Card 2: Total Inventory Value */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Total Nilai Persediaan Gudang</span>
          <div className="text-2xl font-black text-gray-100">{formatRp(data.totalInventoryValue)}</div>
          <div className="text-[11px] text-gray-300">
            Buffer persediaan untuk ~7.5 hari operasional
          </div>
          <p className="text-[10px] text-gray-400">Chiller, Freezer, Dry Store &amp; Bar</p>
        </div>

        {/* Card 3: Dead Stock Alert */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Nilai Dead Stock (&gt;30 Hari)</span>
          <div className="text-2xl font-black text-rose-400">{formatRp(data.deadStockValue)}</div>
          <div className="text-[11px] text-rose-300 font-medium">
            5.5% dari total nilai persediaan
          </div>
          <p className="text-[10px] text-gray-400">Perlu tindakan promo khusus untuk mencegah kadaluarsa.</p>
        </div>

        {/* Card 4: Slow Moving Goods */}
        <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#2D374E] space-y-2">
          <span className="text-[11px] text-gray-400 font-medium">Slow Moving Goods</span>
          <div className="text-2xl font-black text-amber-300">{formatRp(data.slowMovingValue)}</div>
          <div className="text-[11px] text-gray-300">
            12.5% dari total nilai persediaan
          </div>
          <p className="text-[10px] text-gray-400">Rotasi perputaran barang lambat (&gt;20 hari).</p>
        </div>
      </div>

      {/* Problematic Items Table */}
      {data.problematicItems && data.problematicItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            <span>Daftar Item Stok Kritis &amp; Pantauan Khusus (Ulum &amp; Tasnim)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#2D374E] bg-[#111827]/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E2438] text-gray-300 font-bold border-b border-[#2D374E]">
                <tr>
                  <th className="p-3">Kode SKU</th>
                  <th className="p-3">Nama Bahan Baku</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Stok Fisik</th>
                  <th className="p-3 text-right">Nilai Rupiah</th>
                  <th className="p-3">Klasifikasi</th>
                  <th className="p-3 text-right">Hari Simpan</th>
                  <th className="p-3">Status FEFO &amp; Exp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]/70 text-gray-200">
                {data.problematicItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E2438]/60 transition-colors">
                    <td className="p-3 font-mono text-gray-400">{item.code}</td>
                    <td className="p-3 font-bold text-gray-100">{item.name}</td>
                    <td className="p-3 text-gray-400">{item.category}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-200">
                      {item.stockQty} {item.unit}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-200">{formatRp(item.totalValue)}</td>
                    <td className="p-3">{getClassificationBadge(item.classification)}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-300">{item.daysOfInventory} Hari</td>
                    <td className="p-3">
                      <div className="text-[11px] text-gray-300">Exp: {item.expiryDate}</div>
                      <span
                        className={`text-[10px] font-bold ${
                          item.fefoCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.fefoCompliant ? '✓ FEFO Patuh' : '✗ FEFO Perhatian'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostics */}
      {data.diagnosticInsights && data.diagnosticInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Diagnostik Stock Opname &amp; Rekomendasi Gudang (Rule-Based)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.diagnosticInsights.map((insight, idx) => (
              <ManagementInsightBox
                key={idx}
                title={insight.finding}
                category="INVENTORY_CONTROL"
                description={insight.impact}
                suggestedAction={insight.correctiveAction}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
