/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES NEW ORDER SIMULATION MODAL
 * Interactive POS order emulator to create real-time sales transactions,
 * test cashier workflows, and test automatic inventory deductions.
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Utensils,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import { MENU_PRODUCTS } from '../../../data/mockSales';
import { OrderType, PaymentMethodType } from '../../../types/sales';

interface SalesNewOrderSimulationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesNewOrderSimulationModal: React.FC<SalesNewOrderSimulationModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({
    'prod-01': 2, // Gurame Bakar Madu
    'prod-07': 2, // Es Kelapa Muda
    'prod-05': 1, // Kangkung Belacan
  });

  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('Meja 08');
  const [customerName, setCustomerName] = useState('Pelanggan Resto');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('QRIS');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shiftId, setShiftId] = useState<'shift-morning' | 'shift-evening'>('shift-morning');
  const [cashierId, setCashierId] = useState('emp-09');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQtyChange = (productId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Calculate Subtotals
  const itemList = Object.entries(selectedItems)
    .map(([prodId, rawQty]) => {
      const prod = MENU_PRODUCTS.find((p) => p.productId === prodId);
      if (!prod) return null;
      const qty = Number(rawQty) || 0;
      const subtotal = prod.unitPrice * qty;
      const totalHpp = prod.hppPerUnit * qty;
      const grossProfit = subtotal - totalHpp;
      const grossMargin = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;

      return {
        itemId: `item-sim-${Date.now()}-${prodId}`,
        productId: prod.productId,
        productName: prod.productName,
        recipeId: prod.recipeId,
        category: prod.category,
        quantity: qty,
        unitPrice: prod.unitPrice,
        discountAmount: 0,
        subtotal,
        hppPerUnit: prod.hppPerUnit,
        totalHpp,
        grossProfit,
        grossMarginPercentage: Number(grossMargin.toFixed(1)),
        recipeMappingStatus: prod.recipeMappingStatus,
      };
    })
    .filter(Boolean) as any[];

  const subtotal = itemList.reduce((acc, item) => acc + item.subtotal, 0);
  const netBeforeTax = Math.max(0, subtotal - discountAmount);
  const serviceCharge = Math.round(netBeforeTax * 0.05); // 5%
  const taxAmount = Math.round((netBeforeTax + serviceCharge) * 0.1); // 10% PB1
  const grandTotal = netBeforeTax + serviceCharge + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemList.length === 0) {
      alert('Pilih minimal 1 menu');
      return;
    }

    try {
      setIsSubmitting(true);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      const cashierName =
        cashierId === 'emp-09'
          ? 'Rina Kusuma'
          : cashierId === 'emp-10'
          ? 'Dedi Prasetyo'
          : cashierId === 'emp-11'
          ? 'Siti Rahayu'
          : 'Maya Indah';

      const shiftName =
        shiftId === 'shift-morning'
          ? 'Shift Pagi (08:00 - 16:00)'
          : 'Shift Siang/Malam (15:30 - 23:30)';

      await salesService.createTransaction({
        businessDate: dateStr,
        transactionDate: dateStr,
        transactionTime: timeStr,
        cashierId,
        cashierName,
        shiftId,
        shiftName,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        customerName: customerName || undefined,
        orderType,
        items: itemList,
        subtotal,
        discountAmount,
        serviceCharge,
        taxAmount,
        grandTotal,
        paymentStatus: 'PAID',
        paymentMethods: [
          {
            paymentMethod,
            amount: grandTotal,
            referenceNumber: `SIM-${Date.now().toString().slice(-6)}`,
          },
        ],
        transactionStatus: 'COMPLETED',
        source: 'MOCK_POS',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151B2B] rounded-3xl border border-white/15 w-full max-w-3xl overflow-hidden shadow-2xl shadow-purple-900/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Simulasi Transaksi POS Kasir</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tambahkan transaksi penjualan untuk menguji kalkulasi revenue, margin, dan HPP resep
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2438] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5 text-xs">
          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Tipe Order:</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="DINE_IN">Dine In (Makan Ditempat)</option>
                <option value="TAKE_AWAY">Take Away (Bungkus)</option>
                <option value="DELIVERY">Delivery Online</option>
                <option value="EVENT">Event / Gathering</option>
                <option value="CATERING">Catering</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Nomor Meja:</label>
              <input
                type="text"
                disabled={orderType !== 'DINE_IN'}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: Meja 12"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Metode Bayar:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="QRIS">QRIS Dinamis</option>
                <option value="EDC">Mesin EDC (Debit BCA)</option>
                <option value="CASH">Uang Tunai (Cash)</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="E_WALLET">E-Wallet (GoPay/OVO)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Kasir Bertugas:</label>
              <select
                value={cashierId}
                onChange={(e) => setCashierId(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="emp-09">Rina Kusuma</option>
                <option value="emp-10">Dedi Prasetyo</option>
                <option value="emp-11">Siti Rahayu</option>
                <option value="emp-04">Maya Indah</option>
              </select>
            </div>
          </div>

          {/* Menu Item Catalog Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-white block">Pilih Item Menu Restoran:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
              {MENU_PRODUCTS.map((prod) => {
                const qty = selectedItems[prod.productId] || 0;

                return (
                  <div
                    key={prod.productId}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      qty > 0
                        ? 'bg-purple-950/20 border-purple-500/40'
                        : 'bg-[#111827] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-white block truncate">{prod.productName}</span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-purple-300">
                          Rp {(prod.unitPrice ?? 0).toLocaleString('id-ID')}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">HPP Rp {(prod.hppPerUnit ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.productId, -1)}
                          className="p-1 rounded-lg bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {qty > 0 && (
                        <span className="w-6 text-center font-mono font-bold text-white">
                          {qty}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod.productId, 1)}
                        className="p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Bill Summary */}
          <div className="p-4 bg-[#111827] rounded-2xl border border-white/5 space-y-2.5">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({itemList.length} menu varian):</span>
              <span className="font-mono text-slate-200">Rp {(subtotal ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service Charge (5%):</span>
              <span className="font-mono text-slate-200">Rp {(serviceCharge ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pajak Restoran PB1 (10%):</span>
              <span className="font-mono text-slate-200">Rp {(taxAmount ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
              <span>Total Tagihan:</span>
              <span className="font-mono text-emerald-400 text-base">
                Rp {(grandTotal ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || itemList.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Order...' : 'Simpan Transaksi POS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
