/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — SALES & REVENUE DASHBOARD MASTER VIEW
 * Central hub for POS transactions, daily revenue reports, shift sales,
 * product menu performance, payment reconciliations, cashier closings, and theoretical inventory variances.
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Receipt,
  FileText,
  Clock,
  Utensils,
  CreditCard,
  Sparkles,
  Scale,
  PlusCircle,
  Download,
  RotateCcw,
} from 'lucide-react';
import { salesService } from '../../../services/salesService';
import {
  SalesTransaction,
  DailySalesSummary,
  SalesLaborAnalytics,
  SalesFilterOptions,
} from '../../../types/sales';
import { SalesKpiGrid } from './SalesKpiGrid';
import { SalesFilters } from './SalesFilters';
import { SalesTransactionTable } from './SalesTransactionTable';
import { SalesTransactionDetailModal } from './SalesTransactionDetailModal';
import { SalesVoidRefundModal } from './SalesVoidRefundModal';
import { DailyRevenueReportView } from './DailyRevenueReportView';
import { ShiftSalesView } from './ShiftSalesView';
import { ProductPerformanceView } from './ProductPerformanceView';
import { PaymentAnalysisView } from './PaymentAnalysisView';
import { CashierClosingView } from './CashierClosingView';
import { CashierClosingModal } from './CashierClosingModal';
import { SalesInventoryVarianceView } from './SalesInventoryVarianceView';
import { SalesNewOrderSimulationModal } from './SalesNewOrderSimulationModal';

export type SalesTabId =
  | 'transactions'
  | 'daily_report'
  | 'shift_analysis'
  | 'product_performance'
  | 'payment_reconciliation'
  | 'cashier_closing'
  | 'inventory_variance';

interface SalesDashboardViewProps {
  canManage?: boolean;
}

export const SalesDashboardView: React.FC<SalesDashboardViewProps> = ({
  canManage = true,
}) => {
  const [activeTab, setActiveTab] = useState<SalesTabId>('transactions');
  const [filters, setFilters] = useState<SalesFilterOptions>({
    period: 'this_month',
  });

  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [summary, setSummary] = useState<DailySalesSummary | null>(null);
  const [laborAnalytics, setLaborAnalytics] = useState<SalesLaborAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<SalesTransaction | null>(null);
  const [voidRefundModal, setVoidRefundModal] = useState<{
    tx: SalesTransaction | null;
    mode: 'VOID' | 'REFUND';
  }>({ tx: null, mode: 'VOID' });
  const [isSimulateOrderOpen, setIsSimulateOrderOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [txs, sum, labor] = await Promise.all([
        salesService.getTransactions(filters),
        salesService.getDailySalesSummary('2026-08-20'),
        salesService.getSalesLaborAnalytics(filters.period || 'this_month'),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setLaborAnalytics(labor);
    } catch (err) {
      console.error('Error loading sales data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({ period: 'this_month' });
  };

  const handleExportCsv = async () => {
    try {
      const csv = salesService.exportSalesCsv(transactions);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TropicalOS_Sales_${filters.period || 'all'}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Gagal export CSV');
    }
  };

  const handleConfirmVoid = async (txId: string, reason: string) => {
    await salesService.voidTransaction(txId, reason, {
      id: 'emp-01',
      name: 'Budi Santoso',
      role: 'General Manager',
    });
    await loadData();
  };

  const handleConfirmRefund = async (txId: string, amount: number, reason: string) => {
    await salesService.refundTransaction(txId, amount, reason, {
      id: 'emp-01',
      name: 'Budi Santoso',
      role: 'General Manager',
    });
    await loadData();
  };

  const tabs: { id: SalesTabId; label: string; icon: any }[] = [
    { id: 'transactions', label: 'Transaksi POS', icon: Receipt },
    { id: 'daily_report', label: 'Laporan Pendapatan', icon: FileText },
    { id: 'shift_analysis', label: 'Penjualan per Shift', icon: Clock },
    { id: 'product_performance', label: 'Performa Menu', icon: Utensils },
    { id: 'payment_reconciliation', label: 'Kanal Pembayaran', icon: CreditCard },
    { id: 'cashier_closing', label: 'Closing Kasir', icon: Sparkles },
    { id: 'inventory_variance', label: 'Selisih Bahan (BOM)', icon: Scale },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Title */}
      <div className="bg-[#151B2B] rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-black/20 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-600/30">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              POS, Sales & Daily Revenue Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Integrasi POS, rekonsiliasi kasir harian, laporan laba kotor, dan audit pemakaian bahan baku resep
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSimulateOrderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulasi Order POS</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-b border-white/10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                  : 'bg-[#151B2B] text-slate-400 hover:text-white hover:bg-[#1E2438] border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <SalesKpiGrid
            summary={summary}
            laborAnalytics={laborAnalytics}
            isLoading={isLoading}
          />

          {/* Filters Bar */}
          <SalesFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            onExportCsv={handleExportCsv}
            onOpenNewOrderModal={() => setIsSimulateOrderOpen(true)}
            onOpenClosingModal={() => setIsClosingModalOpen(true)}
          />

          {/* Transactions Table & Ledger */}
          <SalesTransactionTable
            transactions={transactions}
            onViewDetail={(tx) => setSelectedTxForDetail(tx)}
            onVoid={(tx) => setVoidRefundModal({ tx, mode: 'VOID' })}
            onRefund={(tx) => setVoidRefundModal({ tx, mode: 'REFUND' })}
            canManage={canManage}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeTab === 'daily_report' && <DailyRevenueReportView />}

      {activeTab === 'shift_analysis' && <ShiftSalesView />}

      {activeTab === 'product_performance' && <ProductPerformanceView />}

      {activeTab === 'payment_reconciliation' && <PaymentAnalysisView />}

      {activeTab === 'cashier_closing' && <CashierClosingView canVerify={canManage} />}

      {activeTab === 'inventory_variance' && <SalesInventoryVarianceView />}

      {/* MODALS */}
      {selectedTxForDetail && (
        <SalesTransactionDetailModal
          transaction={selectedTxForDetail}
          onClose={() => setSelectedTxForDetail(null)}
          onVoid={(tx) => {
            setSelectedTxForDetail(null);
            setVoidRefundModal({ tx, mode: 'VOID' });
          }}
          onRefund={(tx) => {
            setSelectedTxForDetail(null);
            setVoidRefundModal({ tx, mode: 'REFUND' });
          }}
          canManage={canManage}
        />
      )}

      {voidRefundModal.tx && (
        <SalesVoidRefundModal
          transaction={voidRefundModal.tx}
          mode={voidRefundModal.mode}
          onClose={() => setVoidRefundModal({ tx: null, mode: 'VOID' })}
          onConfirmVoid={handleConfirmVoid}
          onConfirmRefund={handleConfirmRefund}
        />
      )}

      {isSimulateOrderOpen && (
        <SalesNewOrderSimulationModal
          onClose={() => setIsSimulateOrderOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isClosingModalOpen && (
        <CashierClosingModal
          onClose={() => setIsClosingModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
