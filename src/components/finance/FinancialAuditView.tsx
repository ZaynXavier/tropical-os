/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINANCIAL AUDIT TRAIL VIEW
 * Phase 3.9 — Financial Control, Expense/OPEX & Period Closing
 */

import React, { useState, useEffect } from 'react';
import { FinancialAuditEvent } from '../../types/finance';
import { financeService } from '../../services/financeService';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  FileText,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const FinancialAuditView: React.FC = () => {
  const [auditEvents, setAuditEvents] = useState<FinancialAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAuditEvents = async () => {
    try {
      setIsLoading(true);
      const list = await financeService.getAuditEvents({
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
      });
      setAuditEvents(list);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditEvents();
  }, [entityFilter]);

  const filteredEvents = auditEvents.filter((ev) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.entityId.toLowerCase().includes(q) ||
      ev.action.toLowerCase().includes(q) ||
      ev.actor?.name.toLowerCase().includes(q) ||
      (ev.reason && ev.reason.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">CREATE</span>;
      case 'SUBMIT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">SUBMIT</span>;
      case 'APPROVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">APPROVE</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">POST</span>;
      case 'REJECT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">REJECT</span>;
      case 'REVERSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">REVERSE</span>;
      case 'PERIOD_LOCK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">PERIOD_LOCK</span>;
      case 'PERIOD_CLOSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30">PERIOD_CLOSE</span>;
      case 'PERIOD_REOPEN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">PERIOD_REOPEN</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-200">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Log Audit Trail Mutasi Finansial</h3>
            <p className="text-xs text-gray-400">
              Jejak riwayat permanen seluruh aksi pencatatan beban, persetujuan, posting ledger, pembalikan (reversal), serta penguncian periode finansial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, aksi, actor, alasan..."
              className="w-full bg-[#151B2B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#151B2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Semua Entitas</option>
            <option value="EXPENSE">EXPENSE (Beban)</option>
            <option value="PERIOD">PERIOD (Periode)</option>
            <option value="RECONCILIATION">RECONCILIATION</option>
            <option value="CASH_ACCOUNT">CASH ACCOUNT</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#151B2B] text-gray-400 border-b border-white/10 font-semibold">
                <th className="py-3 px-4">Waktu (WITA)</th>
                <th className="py-3 px-4">Entitas &amp; ID</th>
                <th className="py-3 px-4">Aksi / Mutasi</th>
                <th className="py-3 px-4">Pelaku (Actor)</th>
                <th className="py-3 px-4">Alasan &amp; Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Memuat log jejak audit finansial...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Tidak ada catatan audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.eventId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gray-300 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{ev.entityType}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{ev.entityId}</div>
                    </td>
                    <td className="py-3.5 px-4">{getActionBadge(ev.action)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-purple-300">{ev.actor?.name}</div>
                      <div className="text-[10px] text-gray-400">{ev.actor?.role || 'STAFF'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <div>{ev.reason || '-'}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
