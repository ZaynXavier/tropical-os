import React, { useState } from 'react';
import { EmployeePersonnel } from '../../../types/employee';
import {
  Coins,
  DollarSign,
  CreditCard,
  QrCode,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  Save,
  Send,
  HelpCircle,
  TrendingUp,
  X,
  History,
  ShieldCheck
} from 'lucide-react';

interface CashierReconciliationTabProps {
  currentUser: EmployeePersonnel | null;
  onNavigateTab?: (tab: string) => void;
}

interface DenominationCount {
  nominal: number;
  type: 'BANKNOTE' | 'COIN';
  label: string;
  count: number;
}

export const CashierReconciliationTab: React.FC<CashierReconciliationTabProps> = ({
  currentUser,
}) => {
  const [activeMode, setActiveMode] = useState<'OPENING' | 'CLOSING'>('CLOSING');
  const [shift, setShift] = useState<'Shift Pagi' | 'Shift Siang' | 'Shift Malam'>('Shift Pagi');
  const [registerNo, setRegisterNo] = useState('POS-REG-01');

  // Opening Float (Modal Awal Laci)
  const [openingFloat, setOpeningFloat] = useState<number>(500000);

  // Banknotes (Uang Kertas)
  const [banknotes, setBanknotes] = useState<DenominationCount[]>([
    { nominal: 100000, type: 'BANKNOTE', label: 'Rp 100.000', count: 12 },
    { nominal: 75000, type: 'BANKNOTE', label: 'Rp 75.000', count: 0 },
    { nominal: 50000, type: 'BANKNOTE', label: 'Rp 50.000', count: 18 },
    { nominal: 20000, type: 'BANKNOTE', label: 'Rp 20.000', count: 15 },
    { nominal: 10000, type: 'BANKNOTE', label: 'Rp 10.000', count: 20 },
    { nominal: 5000, type: 'BANKNOTE', label: 'Rp 5.000', count: 30 },
    { nominal: 2000, type: 'BANKNOTE', label: 'Rp 2.000', count: 25 },
    { nominal: 1000, type: 'BANKNOTE', label: 'Rp 1.000', count: 10 },
  ]);

  // Coins (Uang Koin / Logam)
  const [coins, setCoins] = useState<DenominationCount[]>([
    { nominal: 1000, type: 'COIN', label: 'Rp 1.000 (Koin)', count: 20 },
    { nominal: 500, type: 'COIN', label: 'Rp 500 (Koin)', count: 30 },
    { nominal: 200, type: 'COIN', label: 'Rp 200 (Koin)', count: 15 },
    { nominal: 100, type: 'COIN', label: 'Rp 100 (Koin)', count: 10 },
  ]);

  // Non-Cash Digital Settlements
  const [qrisAmount, setQrisAmount] = useState<number>(1850000);
  const [edcAmount, setEdcAmount] = useState<number>(2450000);
  const [transferAmount, setTransferAmount] = useState<number>(450000);

  // System Recorded Benchmark (POS Sales)
  const [posExpectedCashSales, setPosExpectedCashSales] = useState<number>(2329000);
  const [posExpectedQris, setPosExpectedQris] = useState<number>(1850000);
  const [posExpectedEdc, setPosExpectedEdc] = useState<number>(2450000);
  const [posExpectedTransfer, setPosExpectedTransfer] = useState<number>(450000);

  // Closing Checklists
  const [checkEdcSettlement, setCheckEdcSettlement] = useState(true);
  const [checkZReportPrint, setCheckZReportPrint] = useState(true);
  const [checkSafeDeposit, setCheckSafeDeposit] = useState(true);
  const [closingNotes, setClosingNotes] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<any | null>(null);

  // Calculations
  const updateBanknoteCount = (nominal: number, deltaOrVal: number, isDirect = false) => {
    setBanknotes((prev) =>
      prev.map((b) =>
        b.nominal === nominal
          ? { ...b, count: isDirect ? Math.max(0, deltaOrVal) : Math.max(0, b.count + deltaOrVal) }
          : b
      )
    );
  };

  const updateCoinCount = (nominal: number, deltaOrVal: number, isDirect = false) => {
    setCoins((prev) =>
      prev.map((c) =>
        c.nominal === nominal
          ? { ...c, count: isDirect ? Math.max(0, deltaOrVal) : Math.max(0, c.count + deltaOrVal) }
          : c
      )
    );
  };

  const totalBanknotes = banknotes.reduce((sum, b) => sum + b.nominal * b.count, 0);
  const totalCoins = coins.reduce((sum, c) => sum + c.nominal * c.count, 0);
  const totalPhysicalCash = totalBanknotes + totalCoins;

  // Expected vs Actual
  // In Closing: Expected Cash = Opening Float + POS Cash Sales
  const expectedTotalCashInDrawer = activeMode === 'CLOSING' ? openingFloat + posExpectedCashSales : openingFloat;
  const cashVariance = totalPhysicalCash - expectedTotalCashInDrawer;

  const totalNonCashActual = qrisAmount + edcAmount + transferAmount;
  const totalNonCashExpected = posExpectedQris + posExpectedEdc + posExpectedTransfer;
  const nonCashVariance = totalNonCashActual - totalNonCashExpected;

  const totalGrossRevenueActual = (activeMode === 'CLOSING' ? totalPhysicalCash - openingFloat : 0) + totalNonCashActual;

  const handleSubmitReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const receipt = {
      reconciliationId: `REC-POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      mode: activeMode,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      cashierName: currentUser?.name || 'Kasir Resto',
      shift,
      registerNo,
      openingFloat,
      totalBanknotes,
      totalCoins,
      totalPhysicalCash,
      expectedCash: expectedTotalCashInDrawer,
      cashVariance,
      qrisAmount,
      edcAmount,
      transferAmount,
      totalNonCash: totalNonCashActual,
      totalGrossRevenue: totalGrossRevenueActual,
      status: cashVariance === 0 && nonCashVariance === 0 ? 'BALANCED' : cashVariance > 0 ? 'OVER' : 'SHORT',
      notes: closingNotes,
    };

    setSubmittedReceipt(receipt);
  };

  return (
    <div className="space-y-4 animate-fade-in text-gray-100">
      {/* Header Banner */}
      <div className="p-4 rounded-[26px] bg-gradient-to-r from-[#1A261E] via-[#15201A] to-[#101915] border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                Rekonsiliasi Kasir &amp; Uang Fisik
              </h2>
              <p className="text-[10px] text-emerald-200">
                Hitungan Pecahan Lembaran (100rb) s/d Koin (100 rupiah)
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            {registerNo}
          </span>
        </div>

        {/* Mode Switcher: Opening vs Closing */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5 text-xs font-bold">
          <button
            onClick={() => setActiveMode('OPENING')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'OPENING'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>🌅 Opening (Modal Awal)</span>
          </button>

          <button
            onClick={() => setActiveMode('CLOSING')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'CLOSING'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>🌙 Closing (Setoran Akhir)</span>
          </button>
        </div>
      </div>

      {/* Real-time Variance KPI Alert */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md space-y-2 shadow-lg ${
        cashVariance === 0
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : cashVariance > 0
          ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            {cashVariance === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {activeMode === 'OPENING'
                ? 'Kesesuaian Modal Laci Kasir'
                : 'Status Rekonsiliasi Fisik Kas vs Sistem'}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
            cashVariance === 0
              ? 'bg-emerald-500 text-black'
              : cashVariance > 0
              ? 'bg-blue-500 text-white'
              : 'bg-rose-500 text-white animate-pulse'
          }`}>
            {cashVariance === 0 ? '✓ PAS / BALANCED' : cashVariance > 0 ? '+ LEBIH (OVER)' : '- SELISIH KURANG'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div>
            <span className="text-[10px] text-gray-400 block">Total Fisik Kas:</span>
            <span className="font-bold text-white text-xs font-mono">
              Rp {totalPhysicalCash.toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Target Sistem POS:</span>
            <span className="font-bold text-gray-300 text-xs font-mono">
              Rp {expectedTotalCashInDrawer.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Selisih Fisik:</span>
            <span className={`font-black text-xs font-mono ${
              cashVariance === 0 ? 'text-emerald-400' : cashVariance > 0 ? 'text-blue-400' : 'text-rose-400'
            }`}>
              {cashVariance > 0 ? `+Rp ${cashVariance.toLocaleString('id-ID')}` : cashVariance < 0 ? `-Rp ${Math.abs(cashVariance).toLocaleString('id-ID')}` : 'Rp 0'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 1: HITUNGAN PECAHAN UANG KERTAS (BANKNOTES)
      ============================================================ */}
      <div className="p-4 rounded-[26px] bg-[#141A29] border border-[#27324A] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Uang Kertas (Lembaran)
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-400 font-mono">
            Subtotal: Rp {totalBanknotes.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="space-y-2">
          {banknotes.map((item) => (
            <div
              key={item.nominal}
              className="p-2.5 rounded-xl bg-[#182133] border border-white/5 flex items-center justify-between gap-2 text-xs"
            >
              <div className="w-24">
                <span className="font-bold text-white block">{item.label}</span>
                <span className="text-[9px] text-gray-400 font-mono">
                  = Rp {(item.nominal * item.count).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Stepper Counter */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateBanknoteCount(item.nominal, -1)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={item.count}
                  onChange={(e) => updateBanknoteCount(item.nominal, Number(e.target.value), true)}
                  className="w-12 py-1 text-center font-bold text-cyan-300 bg-black/40 rounded-lg border border-white/10 outline-none text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => updateBanknoteCount(item.nominal, 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all shadow"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1">
                {[5, 10, 20].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => updateBanknoteCount(item.nominal, quick, true)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    {quick}x
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: HITUNGAN PECAHAN UANG KOIN (COINS)
      ============================================================ */}
      <div className="p-4 rounded-[26px] bg-[#141A29] border border-[#27324A] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Uang Logam / Koin
            </h3>
          </div>
          <span className="text-xs font-black text-amber-400 font-mono">
            Subtotal: Rp {totalCoins.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="space-y-2">
          {coins.map((item) => (
            <div
              key={item.nominal}
              className="p-2.5 rounded-xl bg-[#182133] border border-white/5 flex items-center justify-between gap-2 text-xs"
            >
              <div className="w-24">
                <span className="font-bold text-amber-200 block">{item.label}</span>
                <span className="text-[9px] text-gray-400 font-mono">
                  = Rp {(item.nominal * item.count).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Stepper Counter */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateCoinCount(item.nominal, -1)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={item.count}
                  onChange={(e) => updateCoinCount(item.nominal, Number(e.target.value), true)}
                  className="w-12 py-1 text-center font-bold text-amber-300 bg-black/40 rounded-lg border border-white/10 outline-none text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => updateCoinCount(item.nominal, 1)}
                  className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all shadow"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1">
                {[10, 25, 50].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => updateCoinCount(item.nominal, quick, true)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    {quick}k
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          SECTION 3: DIGITAL / NON-CASH SETTLEMENTS (CLOSING ONLY)
      ============================================================ */}
      {activeMode === 'CLOSING' && (
        <div className="p-4 rounded-[26px] bg-[#141A29] border border-[#27324A] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Settlement EDC &amp; QRIS Digital
              </h3>
            </div>
            <span className="text-xs font-black text-cyan-400 font-mono">
              Rp {totalNonCashActual.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#182133] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>QRIS (Gopay / Shopee / Dynamic):</span>
                </span>
                <span className="text-[10px] text-gray-400">Target: Rp {posExpectedQris.toLocaleString('id-ID')}</span>
              </div>
              <input
                type="number"
                step="1000"
                value={qrisAmount}
                onChange={(e) => setQrisAmount(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-bold outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#182133] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mesin EDC Gesek (BCA/Mandiri/BRI):</span>
                </span>
                <span className="text-[10px] text-gray-400">Target: Rp {posExpectedEdc.toLocaleString('id-ID')}</span>
              </div>
              <input
                type="number"
                step="1000"
                value={edcAmount}
                onChange={(e) => setEdcAmount(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-bold outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#182133] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transfer Bank / Payment Gateway:</span>
                </span>
                <span className="text-[10px] text-gray-400">Target: Rp {posExpectedTransfer.toLocaleString('id-ID')}</span>
              </div>
              <input
                type="number"
                step="1000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 4: CHECKLISTS & NOTES & SUBMIT
      ============================================================ */}
      <div className="p-4 rounded-[26px] bg-[#141A29] border border-[#27324A] shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Checklist &amp; Catatan Shift Kasir</span>
        </h3>

        <div className="space-y-2 text-xs text-gray-300">
          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#182133] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={checkEdcSettlement}
              onChange={(e) => setCheckEdcSettlement(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500"
            />
            <span>Mesin EDC sudah dilakukan Batch Settlement &amp; Cetak Bukti</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#182133] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={checkZReportPrint}
              onChange={(e) => setCheckZReportPrint(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500"
            />
            <span>Print Z-Report POS shift terlampir fisik</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#182133] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={checkSafeDeposit}
              onChange={(e) => setCheckSafeDeposit(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500"
            />
            <span>Uang fisik setoran dimasukkan ke amplop brankas utama</span>
          </label>
        </div>

        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-bold text-gray-400">Catatan Khusus / Memo Shift:</label>
          <textarea
            rows={2}
            value={closingNotes}
            onChange={(e) => setClosingNotes(e.target.value)}
            placeholder="Tuliskan catatan uang kembalian, kendala mesin EDC, dll..."
            className="w-full p-2.5 rounded-xl bg-[#182133] border border-white/10 text-white text-xs outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSubmitReconciliation}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Receipt className="w-4 h-4" />
          <span>Simpan &amp; Terbitkan Berita Acara Rekonsiliasi</span>
        </button>
      </div>

      {/* ============================================================
          MODAL / RECEIPT: BERITA ACARA REKONSILIASI KASIR
      ============================================================ */}
      {submittedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-slide-up space-y-3">
            {/* Header */}
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Berita Acara Rekonsiliasi Kasir
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {submittedReceipt.reconciliationId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSubmittedReceipt(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-4 space-y-3 text-xs max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>Kasir Shift:</span>
                  <span className="font-bold text-white">{submittedReceipt.cashierName}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Waktu:</span>
                  <span className="text-gray-200">{submittedReceipt.date} • {submittedReceipt.time}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shift &amp; Register:</span>
                  <span className="text-cyan-300 font-bold">{submittedReceipt.shift} ({submittedReceipt.registerNo})</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Modal Awal (Float):</span>
                  <span className="text-white font-mono font-bold">Rp {submittedReceipt.openingFloat.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Cash Breakdown */}
              <div className="p-3 rounded-2xl bg-[#162035] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                  <span>Fisik Kas Dihitung:</span>
                  <span className="font-mono">Rp {submittedReceipt.totalPhysicalCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="space-y-1 text-[10px] text-gray-300 border-t border-white/10 pt-1.5">
                  <div className="flex justify-between">
                    <span>Uang Kertas (Lembaran):</span>
                    <span className="font-mono">Rp {submittedReceipt.totalBanknotes.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uang Koin (Logam):</span>
                    <span className="font-mono">Rp {submittedReceipt.totalCoins.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Variance Status */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                submittedReceipt.cashVariance === 0
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : submittedReceipt.cashVariance > 0
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <span className="text-xs font-bold">Selisih Kas Fisik:</span>
                <span className="text-xs font-black font-mono">
                  {submittedReceipt.cashVariance === 0
                    ? 'Rp 0 (BALANCED ✓)'
                    : submittedReceipt.cashVariance > 0
                    ? `+Rp ${submittedReceipt.cashVariance.toLocaleString('id-ID')} (LEBIH)`
                    : `-Rp ${Math.abs(submittedReceipt.cashVariance).toLocaleString('id-ID')} (KURANG)`}
                </span>
              </div>

              {/* Digital & Non Cash */}
              {submittedReceipt.mode === 'CLOSING' && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-400">
                    <span>QRIS Settlement:</span>
                    <span className="font-mono text-white">Rp {submittedReceipt.qrisAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Mesin EDC Settlement:</span>
                    <span className="font-mono text-white">Rp {submittedReceipt.edcAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Transfer Bank:</span>
                    <span className="font-mono text-white">Rp {submittedReceipt.transferAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                    <span>Total Omset Bersih:</span>
                    <span className="text-emerald-400 font-mono">Rp {submittedReceipt.totalGrossRevenue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {submittedReceipt.notes && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-300 italic">
                  "{submittedReceipt.notes}"
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Berita acara rekonsiliasi kasir telah dikirim ke printer POS dan tersimpan di database audit.')}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Struk Rekonsiliasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedReceipt(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
