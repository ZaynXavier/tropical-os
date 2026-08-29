/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Document Expiration Monitoring & Alert Center
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Building,
  History,
  Archive,
  Eye,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';
import { HRDocument, ExpirationFilterCategory } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface ExpirationTrackerViewProps {
  currentUser: AuthUser;
  onViewDocument: (doc: HRDocument) => void;
  onVersionDocument: (doc: HRDocument) => void;
  onArchiveDocument: (doc: HRDocument) => void;
  canManage: boolean;
}

const EXPIRATION_TABS: { id: ExpirationFilterCategory; label: string }[] = [
  { id: 'ALL', label: 'Semua Berbatas Waktu' },
  { id: 'EXPIRED', label: 'Telah Kedaluwarsa' },
  { id: 'EXPIRING_7', label: 'Kedaluwarsa &le; 7 Hari' },
  { id: 'EXPIRING_14', label: 'Kedaluwarsa &le; 14 Hari' },
  { id: 'EXPIRING_30', label: 'Kedaluwarsa &le; 30 Hari' },
  { id: 'ACTIVE', label: 'Masa Aktif Aman' },
];

export const ExpirationTrackerView: React.FC<ExpirationTrackerViewProps> = ({
  currentUser,
  onViewDocument,
  onVersionDocument,
  onArchiveDocument,
  canManage,
}) => {
  const [activeTab, setActiveTab] = useState<ExpirationFilterCategory>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const docs = hrDocumentService.getDocuments({
    expirationFilter: activeTab,
    department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
    showArchived: false,
  }).filter((d) => d.expiryDate); // only show docs that have expiryDate

  const expiredCount = hrDocumentService.getExpiredDocuments().length;
  const expiring7Count = hrDocumentService.getExpiringSoonDocuments(7).length;
  const expiring14Count = hrDocumentService.getExpiringSoonDocuments(14).length;
  const expiring30Count = hrDocumentService.getExpiringSoonDocuments(30).length;

  const getDaysBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = hrDocumentService.getDaysUntilExpiry(expiryDate);
    if (days === null) return null;

    if (days < 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Telah Lewat {Math.abs(days)} Hari
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Berakhir Hari Ini
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Sisa {days} Hari (Kritis)
        </span>
      );
    }
    if (days <= 14) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Sisa {days} Hari (Segera)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Sisa {days} Hari
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Sisa {days} Hari
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Banner & KPI Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer ${
            activeTab === 'EXPIRED'
              ? 'bg-rose-950/50 border-rose-400 shadow-xl shadow-rose-950/30'
              : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-400'
          }`}
        >
          <div className="text-[10px] text-rose-300 font-mono uppercase tracking-wider">Expired (Kedaluwarsa)</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{expiredCount}</div>
          <div className="text-[10px] text-rose-300/70 mt-0.5">Perlu perpanjangan segera</div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING_7')}
          className={`p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer ${
            activeTab === 'EXPIRING_7'
              ? 'bg-rose-950/50 border-rose-400 shadow-xl shadow-rose-950/30'
              : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-400'
          }`}
        >
          <div className="text-[10px] text-rose-300 font-mono uppercase tracking-wider">&le; 7 Hari Mendatang</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{expiring7Count}</div>
          <div className="text-[10px] text-rose-300/70 mt-0.5">Tindakan darurat</div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING_14')}
          className={`p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer ${
            activeTab === 'EXPIRING_14'
              ? 'bg-amber-950/50 border-amber-400 shadow-xl shadow-amber-950/30'
              : 'bg-amber-950/20 border-amber-500/20 hover:border-amber-400'
          }`}
        >
          <div className="text-[10px] text-amber-300 font-mono uppercase tracking-wider">&le; 14 Hari Mendatang</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{expiring14Count}</div>
          <div className="text-[10px] text-amber-300/70 mt-0.5">Masa tenggang perpanjangan</div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING_30')}
          className={`p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer ${
            activeTab === 'EXPIRING_30'
              ? 'bg-indigo-950/50 border-indigo-400 shadow-xl shadow-indigo-950/30'
              : 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-400'
          }`}
        >
          <div className="text-[10px] text-indigo-300 font-mono uppercase tracking-wider">&le; 30 Hari Mendatang</div>
          <div className="text-2xl font-black text-indigo-300 mt-1">{expiring30Count}</div>
          <div className="text-[10px] text-indigo-300/70 mt-0.5">Rencana pembaruan</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {EXPIRATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-bold">Divisi:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
          >
            <option value="ALL" className="bg-[#1A133E] text-white">Semua Divisi</option>
            <option value="Service" className="bg-[#1A133E] text-white">Service</option>
            <option value="Kitchen" className="bg-[#1A133E] text-white">Kitchen</option>
            <option value="Bar" className="bg-[#1A133E] text-white">Bar</option>
            <option value="Cleaning" className="bg-[#1A133E] text-white">Cleaning</option>
            <option value="Finance" className="bg-[#1A133E] text-white">Finance</option>
            <option value="Marketing" className="bg-[#1A133E] text-white">Marketing</option>
            <option value="CRM" className="bg-[#1A133E] text-white">CRM</option>
          </select>
        </div>
      </div>

      {/* Expiration List Table */}
      {docs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#130F30]/60 border border-white/10 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Semua Dokumen Masih Berlaku Aman</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tidak ada dokumen yang kedaluwarsa atau mendekati jatuh tempo pada kategori filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#0D0A21] text-purple-300/80 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-4 px-4 font-bold">Karyawan &amp; Divisi</th>
                  <th className="py-4 px-4 font-bold">Nama Dokumen</th>
                  <th className="py-4 px-4 font-bold">Kategori</th>
                  <th className="py-4 px-4 font-bold">Tanggal Kedaluwarsa</th>
                  <th className="py-4 px-4 font-bold">Sisa Waktu</th>
                  <th className="py-4 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {docs.map((doc) => {
                  const emp = hrDocumentService.getEmployee(doc.employeeId);
                  const cat = hrDocumentService.getCategoryById(doc.documentCategoryId);

                  return (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {emp?.fullName || emp?.name}
                        </div>
                        <div className="text-[10px] text-purple-200/60 font-mono">
                          {emp?.department} • {emp?.primaryPosition || emp?.role}
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{doc.documentName}</div>
                        {doc.documentNumber && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            No: {doc.documentNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-purple-200">
                          {cat?.name || doc.documentCategoryId}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-purple-200 font-bold">
                        {doc.expiryDate}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {getDaysBadge(doc.expiryDate)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDocument(doc)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span>Lihat</span>
                          </button>

                          {canManage && (
                            <>
                              <button
                                onClick={() => onVersionDocument(doc)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Perbarui</span>
                              </button>
                              <button
                                onClick={() => onArchiveDocument(doc)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Arsipkan"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
