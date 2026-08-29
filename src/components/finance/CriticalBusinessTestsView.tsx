/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CRITICAL BUSINESS TESTS RUNNER (12 Architectural Tests)
 * Phase 3.9 — Financial Control, Expense/OPEX & Period Closing
 */

import React, { useState } from 'react';
import { FinanceBusinessTestResult } from '../../types/finance';
import { financeService } from '../../services/financeService';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck2,
  AlertOctagon,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CriticalBusinessTestsView: React.FC = () => {
  const [testResults, setTestResults] = useState<FinanceBusinessTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    try {
      setIsRunning(true);
      const results = await financeService.runCriticalBusinessTests();
      setTestResults(results);
    } catch (err: any) {
      alert(`Error running tests: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const totalPassed = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = totalCount > 0 && totalPassed === totalCount;

  return (
    <div className="space-y-6 animate-fade-in text-gray-200">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Suite Pengujian Kritis Finansial &amp; Tata Kelola (12 Critical Tests)
            </h3>
            <p className="text-xs text-gray-400">
              Validasi otomatis kepatuhan siklus hidup beban (DRAFT &rarr; POSTED), proteksi immutability, pembalikan (reversal), konsumsi kontrak data lintas domain, rekonsiliasi, dan integritas tutup buku (Period Lock).
            </p>
          </div>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Menjalankan Pengujian...' : 'Jalankan 12 Critical Tests'}
        </button>
      </div>

      {/* Summary Scoreboard */}
      {testResults.length > 0 && (
        <div
          className={`rounded-2xl border p-5 shadow-lg flex items-center justify-between gap-4 ${
            allPassed
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-rose-400" />
            )}
            <div>
              <div className="text-sm font-bold">
                {allPassed
                  ? 'Semua 12 Pengujian Kritis Lolos (100% Architectural Compliance)'
                  : `${totalCount - totalPassed} Pengujian Gagal`}
              </div>
              <p className="text-xs opacity-80">
                {totalPassed} dari {totalCount} modul uji kepatuhan integritas berhasil dievaluasi.
              </p>
            </div>
          </div>
          <div className="text-xl font-mono font-bold">
            {totalPassed} / {totalCount} PASSED
          </div>
        </div>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testResults.length === 0 ? (
          <div className="col-span-full bg-[#111827] rounded-2xl border border-white/10 p-10 text-center text-gray-400 space-y-3">
            <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
            <div className="text-sm font-bold text-white">Siap untuk Pengujian</div>
            <p className="text-xs max-w-md mx-auto">
              Klik tombol "Jalankan 12 Critical Tests" di atas untuk memverifikasi validitas state machine pengeluaran, immutability data posted, reversal, dan isolasi period lock.
            </p>
          </div>
        ) : (
          testResults.map((t) => (
            <div
              key={t.testNumber}
              className={`bg-[#111827] rounded-2xl border p-4 shadow-lg space-y-2 transition-all ${
                t.passed ? 'border-white/10 hover:border-emerald-500/30' : 'border-rose-500/50 bg-rose-950/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono font-bold border border-purple-500/30">
                    {t.testNumber}
                  </span>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                </div>
                <div>
                  {t.passed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> PASSED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> FAILED
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#151B2B] p-2.5 rounded-xl border border-white/5 font-sans">
                {t.details}
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-purple-300">
                  {t.category}
                </span>
                <span>{new Date(t.timestamp).toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
