/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINANCIAL STATEMENTS & GOVERNANCE VIEW
 * Phase 3.9 — Financial Control, Expense/OPEX, Reconciliation & Period Closing Hardening
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { CashierRevenueReport } from './CashierRevenueReport';
import { ExpenseManagerView } from './ExpenseManagerView';
import { PeriodControlView } from './PeriodControlView';
import { ReconciliationView } from './ReconciliationView';
import { FinancialAuditView } from './FinancialAuditView';
import { CriticalBusinessTestsView } from './CriticalBusinessTestsView';
import { salesService } from '../../services/salesService';
import { payrollService } from '../../services/payrollService';
import { financeService } from '../../services/financeService';
import {
  SalesRevenueContract,
  PayrollCostContract,
  FinanceExpenseContract,
} from '../../types/contracts';
import { CashFlowStatement, FinancialKpiMetrics } from '../../types/finance';
import { CashAccount } from '../../data/mockFinanceData';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Receipt,
  PieChart,
  Calendar,
  Wallet,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Scale,
  Lock,
  History,
  FileCheck,
  Cpu,
  Layers,
} from 'lucide-react';

interface FinancialStatementsViewProps {
  user: User;
}

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'expenses' | 'pandl' | 'cashflow' | 'reconciliation' | 'periods' | 'accounts' | 'audit' | 'tests'
  >('expenses');

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [salesContract, setSalesContract] = useState<SalesRevenueContract | null>(null);
  const [payrollContract, setPayrollContract] = useState<PayrollCostContract | null>(null);
  const [expenseContract, setExpenseContract] = useState<FinanceExpenseContract | null>(null);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement | null>(null);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<FinancialKpiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Liquid Account Modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<CashAccount['type']>('Bank');
  const [newAccBank, setNewAccBank] = useState('BCA');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState<number>(0);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      const [sales, payroll, expenses, cf, accounts, kpis] = await Promise.all([
        salesService.getSalesRevenueContract(selectedPeriod),
        payrollService.getPayrollCostContract(),
        financeService.getExpenseContract(selectedPeriod),
        financeService.getCashFlowStatement(selectedPeriod),
        financeService.getCashAccounts(),
        financeService.getFinancialKpiMetrics(selectedPeriod),
      ]);

      setSalesContract(sales);
      setPayrollContract(payroll);
      setExpenseContract(expenses);
      setCashFlowStatement(cf);
      setCashAccounts(accounts);
      setKpiMetrics(kpis);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, activeTab]);

  const totalLiquidAssets = cashAccounts.reduce((acc, curr) => acc + (curr.balance ?? 0), 0);

  // P&L Computed Metrics
  const grossSales = salesContract?.grossRevenue ?? 0;
  const discounts = salesContract?.discounts ?? 0;
  const refunds = salesContract?.refunds ?? 0;
  const netSales = salesContract?.netRevenue ?? 0;
  const cogs = salesContract?.cogsAmount ?? 0;
  const grossProfit = salesContract?.grossProfit ?? 0;
  const grossMarginPct = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(1)) : 0;

  const laborCost = payrollContract?.grossPayroll ?? 0;
  const postedOperatingOpex = expenseContract?.totalPostedAmount ?? 0;
  const totalOpex = laborCost + postedOperatingOpex;
  const ebitda = grossProfit - totalOpex;
  const netProfitMarginPct = netSales > 0 ? Number(((ebitda / netSales) * 100).toFixed(1)) : 0;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    const newAcc: CashAccount = {
      id: `acc-${Date.now()}`,
      accountName: newAccName,
      type: newAccType,
      bankName: newAccBank,
      accountNumber: newAccNumber || 'N/A',
      balance: newAccBalance,
      lastUpdated: new Date().toLocaleString('id-ID'),
    };

    setCashAccounts([...cashAccounts, newAcc]);
    setIsAddAccountOpen(false);
    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance(0);
  };

  return (
    <div className="space-y-6 text-gray-200 animate-fade-in">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span>Tata Kelola Finansial, Beban OPEX &amp; Tutup Buku (Period Closing)</span>
            </h2>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authoritative Contracts</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Layer tata kelola &amp; rekonsiliasi yang mengonsumsi kontrak data resmi dari Sales SSoT, HPP Resep/BOM, dan Payroll SDM.
          </p>
        </div>

        {/* Global Period Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="2026-08">Agustus 2026</option>
            <option value="2026-07">Juli 2026 (Tutup Buku)</option>
            <option value="2026-06">Juni 2026</option>
          </select>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Kas &amp; Bank Likuid</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            Rp {(totalLiquidAssets ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-gray-400">{cashAccounts.length} Rekening &amp; Kas Fisik</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Penjualan Bersih (Net Sales)</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            Rp {(netSales ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-purple-300">SalesRevenueContract SSoT</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Laba Kotor (Gross Profit)</span>
          <div className="text-xl font-bold text-indigo-300 mt-1 font-mono">
            Rp {(grossProfit ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-indigo-400">{grossMarginPct}% Margin HPP</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Laba Operasional (EBITDA)</span>
          <div
            className={`text-xl font-bold mt-1 font-mono ${
              ebitda >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            Rp {(ebitda ?? 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-purple-300">{netProfitMarginPct}% Operating Margin</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-[#111827] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shadow-lg">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Beban &amp; OPEX</span>
        </button>

        <button
          onClick={() => setActiveTab('pandl')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'pandl'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Laporan Laba Rugi (P&amp;L)</span>
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'cashflow'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Arus Kas (Cash Flow)</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'reconciliation'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Rekonsiliasi Finansial</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'periods'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Tutup Buku Periode</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Akun Kas &amp; Bank ({cashAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>12 Critical Tests</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'expenses' && <ExpenseManagerView />}

      {activeTab === 'periods' && <PeriodControlView />}

      {activeTab === 'reconciliation' && <ReconciliationView />}

      {activeTab === 'audit' && <FinancialAuditView />}

      {activeTab === 'tests' && <CriticalBusinessTestsView />}

      {/* P&L STATEMENT TAB */}
      {activeTab === 'pandl' && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-white/10 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Laporan Laba Rugi (Profit &amp; Loss Statement)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  Authoritative Contracts
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Konsumen data Sales SSoT, HPP Resep/BOM, Payroll SDM, dan Beban OPEX Terposting.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* 1. REVENUE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-white bg-[#151B2B] p-3.5 rounded-xl border border-white/10">
                <span className="font-sans">1. PENDAPATAN KOTOR (GROSS REVENUE)</span>
                <span>Rp {(grossSales ?? 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pl-4 pr-3 text-gray-300">
                <span className="font-sans">Diskon &amp; Promo Membership POS</span>
                <span className="text-rose-400">- Rp {(discounts ?? 0).toLocaleString('id-ID')}</span>
              </div>
              {refunds > 0 && (
                <div className="flex justify-between items-center pl-4 pr-3 text-amber-300">
                  <span className="font-sans">Refund / Retur Transaksi POS</span>
                  <span className="text-rose-400">- Rp {(refunds ?? 0).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pl-4 pr-3 text-emerald-400 font-bold border-t border-white/5 pt-1.5">
                <span className="font-sans">PENDAPATAN BERSIH (NET SALES)</span>
                <span>Rp {(netSales ?? 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-sm font-bold text-amber-300 bg-[#151B2B] p-3.5 rounded-xl border border-white/10">
                <span className="font-sans">2. HARGA POKOK PENJUALAN (HPP FOOD &amp; BEV DARI BOM RESEP)</span>
                <span>- Rp {(cogs ?? 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* GROSS PROFIT */}
            <div className="flex justify-between items-center text-sm font-bold text-indigo-300 bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
              <span className="font-sans">LABA KOTOR (GROSS PROFIT) ({grossMarginPct}%)</span>
              <span>Rp {(grossProfit ?? 0).toLocaleString('id-ID')}</span>
            </div>

            {/* 3. OPERATING EXPENSES (OPEX) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-sm font-bold text-rose-300 bg-[#151B2B] p-3.5 rounded-xl border border-white/10">
                <span className="font-sans">3. BEBAN OPERASIONAL (OPERATING EXPENSES / OPEX)</span>
                <span>- Rp {(totalOpex ?? 0).toLocaleString('id-ID')}</span>
              </div>

              <div className="pl-4 pr-3 space-y-2 text-gray-300 text-xs">
                {/* Payroll from HR contract */}
                <div className="flex justify-between items-center p-2 rounded bg-white/[0.02]">
                  <span className="font-sans">
                    • Beban Gaji &amp; Kompensasi SDM (PayrollCostContract)
                  </span>
                  <span className="text-white font-medium">
                    Rp {(laborCost ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Posted Expenses by Category */}
                {(expenseContract?.categoryBreakdown || []).map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center pl-3 pr-1 text-gray-400">
                    <span className="font-sans">• {cat.category} ({cat.count} trx)</span>
                    <span>Rp {(cat.amount ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NET PROFIT / EBITDA */}
            <div
              className={`flex justify-between items-center text-base font-bold p-4 rounded-xl border ${
                ebitda >= 0
                  ? 'text-emerald-300 bg-emerald-950/30 border-emerald-500/40'
                  : 'text-rose-300 bg-rose-950/30 border-rose-500/40'
              }`}
            >
              <span className="font-sans">LABA BERSIH OPERASIONAL (EBITDA) ({netProfitMarginPct}%)</span>
              <span>Rp {(ebitda ?? 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}

      {/* CASH FLOW STATEMENT TAB */}
      {activeTab === 'cashflow' && cashFlowStatement && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-white/10 shadow-lg space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">
              Laporan Arus Kas Operasional (Statement of Cash Flows)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Menampilkan realisasi arus penerimaan kas masuk dan pengeluaran kas keluar operasional.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Inflows */}
            <div className="bg-[#151B2B] p-5 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" /> ARUS KAS MASUK (INFLOW)
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  Rp {(cashFlowStatement.inflow.totalOperatingInflow ?? 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-gray-300">
                <div className="flex justify-between">
                  <span className="font-sans">Penerimaan Kas Tunai POS (Cash Drawer):</span>
                  <span>Rp {(cashFlowStatement.inflow.cashSalesReceipts ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Settlement QRIS &amp; Transfer Bank:</span>
                  <span>Rp {(cashFlowStatement.inflow.bankTransferQrisSettlements ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Settlement Mesin EDC Kartu Debit/Kredit:</span>
                  <span>Rp {(cashFlowStatement.inflow.edcSettlements ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Cash Outflows */}
            <div className="bg-[#151B2B] p-5 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4" /> ARUS KAS KELUAR (OUTFLOW)
                </span>
                <span className="text-sm font-bold font-mono text-rose-400">
                  - Rp {(cashFlowStatement.outflow.totalOperatingOutflow ?? 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-gray-300">
                <div className="flex justify-between">
                  <span className="font-sans">Pembayaran Supplier &amp; Bahan Baku (COGS):</span>
                  <span>- Rp {(cashFlowStatement.outflow.purchasingSuppliersDisbursement ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Pencairan Gaji &amp; Upah Karyawan (Payroll):</span>
                  <span>- Rp {(cashFlowStatement.outflow.payrollDisbursement ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Beban Operasional Terposting (Posted OPEX):</span>
                  <span>- Rp {(cashFlowStatement.outflow.postedOpexDisbursement ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Setoran Pajak Restoran (PB1):</span>
                  <span>- Rp {(cashFlowStatement.outflow.taxAndServiceDisbursement ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Summary Banner */}
          <div className="bg-[#151B2B] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
            <div>
              <span className="text-xs text-gray-400 font-sans block">Saldo Kas Awal:</span>
              <span className="text-sm font-bold text-white">
                Rp {(cashFlowStatement.openingCashBalance ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-sans block">Kenaikan/Penurunan Kas Bersih:</span>
              <span
                className={`text-sm font-bold ${
                  cashFlowStatement.netOperatingCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {cashFlowStatement.netOperatingCashFlow >= 0 ? '+' : ''}Rp{' '}
                {(cashFlowStatement.netOperatingCashFlow ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-sans block">Saldo Kas Akhir Efektif:</span>
              <span className="text-base font-bold text-emerald-400">
                Rp {(cashFlowStatement.closingCashBalance ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LIQUID ACCOUNTS TAB */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Daftar Rekening &amp; Kas Kecil Operasional</h3>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Rekening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cashAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-[#111827] p-5 rounded-2xl border border-white/10 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    {acc.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Diperbarui: {acc.lastUpdated}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{acc.accountName}</h4>
                  <p className="text-xs text-gray-400 font-mono">{acc.accountNumber}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151B2B] border border-white/10">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Saldo Efektif</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    Rp {(acc.balance ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD ACCOUNT MODAL */}
          {isAddAccountOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-[#151B2B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Tambah Akun Kas &amp; Bank</h3>
                </div>

                <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Akun</label>
                    <input
                      type="text"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      placeholder="Contoh: Kas Kecil Bar &amp; Service"
                      className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Tipe Akun</label>
                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as any)}
                      className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Bank">Bank</option>
                      <option value="Cash Box">Cash Box</option>
                      <option value="Petty Cash">Petty Cash</option>
                      <option value="Merchant EDC">Merchant EDC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor Rekening / Vault ID</label>
                    <input
                      type="text"
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      placeholder="Contoh: 883-992-1002 atau VAULT-01"
                      className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Saldo Awal (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={newAccBalance}
                      onChange={(e) => setNewAccBalance(Number(e.target.value))}
                      className="w-full bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAddAccountOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      Simpan Akun
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
