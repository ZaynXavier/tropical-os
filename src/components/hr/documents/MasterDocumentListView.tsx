/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Master HR Document List & Repository
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  ShieldCheck,
  History,
  Archive,
  Grid,
  List,
  Building,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  HRDocument,
  HRDocumentCategory,
  HRDocumentStatus,
  ExpirationFilterCategory,
} from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { User as AuthUser } from '../../../types';

interface MasterDocumentListViewProps {
  currentUser: AuthUser;
  onOpenUploadModal: () => void;
  onViewDocument: (doc: HRDocument) => void;
  onVerifyDocument: (doc: HRDocument) => void;
  onArchiveDocument: (doc: HRDocument) => void;
  onVersionDocument: (doc: HRDocument) => void;
  canManage: boolean;
  onDataChanged: () => void;
}

const DEPARTMENTS = [
  'ALL',
  'Executive',
  'Management',
  'Service',
  'Kitchen',
  'Bar',
  'Cleaning',
  'Finance',
  'Marketing',
  'CRM',
];

const STATUS_OPTIONS: { id: HRDocumentStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Semua Status' },
  { id: 'VERIFIED', label: 'Terverifikasi (Verified)' },
  { id: 'PENDING_REVIEW', label: 'Menunggu Review (Pending)' },
  { id: 'EXPIRING_SOON', label: 'Segera Kedaluwarsa (<=30h)' },
  { id: 'EXPIRED', label: 'Kedaluwarsa (Expired)' },
  { id: 'REJECTED', label: 'Ditolak (Rejected)' },
  { id: 'ARCHIVED', label: 'Arsip (Archived)' },
  { id: 'DRAFT', label: 'Draft' },
];

export const MasterDocumentListView: React.FC<MasterDocumentListViewProps> = ({
  currentUser,
  onOpenUploadModal,
  onViewDocument,
  onVerifyDocument,
  onArchiveDocument,
  onVersionDocument,
  canManage,
  onDataChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<HRDocumentStatus | 'ALL'>('ALL');
  const [selectedExpiration, setSelectedExpiration] = useState<ExpirationFilterCategory>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [showArchived, setShowArchived] = useState(false);

  const categories = hrDocumentService.getCategories();
  const allDocs = hrDocumentService.getDocuments({
    categoryId: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    expirationFilter: selectedExpiration !== 'ALL' ? selectedExpiration : undefined,
    searchQuery: searchQuery.trim() || undefined,
    showArchived: showArchived || selectedStatus === 'ARCHIVED',
  });

  const handleExportCSV = () => {
    const csvContent = hrDocumentService.exportToCSV(allDocs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HR_Documents_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (doc: HRDocument) => {
    const isExp = hrDocumentService.isDocumentExpired(doc.expiryDate);
    if (isExp || doc.status === 'EXPIRED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> EXPIRED
        </span>
      );
    }
    switch (doc.status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED
          </span>
        );
      case 'PENDING_REVIEW':
      case 'UPLOADED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> EXPIRING SOON
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Archive className="w-3 h-3" /> ARCHIVED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80">
            {doc.status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Category Pills Scroller */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span>Kategori Master Dokumen (13 Kategori)</span>
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            Menampilkan {allDocs.length} dokumen
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama dokumen, nomor berkas, nama staf, atau tag..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ekspor Seluruh Data ke Format CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            {canManage && (
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Unggah Dokumen</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-bold">Divisi:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#1A133E] text-white">
                    {dept === 'ALL' ? 'Semua Divisi' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-bold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#1A133E] text-white">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-bold">Kedaluwarsa:</span>
              <select
                value={selectedExpiration}
                onChange={(e) => setSelectedExpiration(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                <option value="ALL" className="bg-[#1A133E] text-white">Semua Masa Berlaku</option>
                <option value="EXPIRED" className="bg-[#1A133E] text-white">Telah Kedaluwarsa</option>
                <option value="EXPIRING_7" className="bg-[#1A133E] text-white">&le; 7 Hari</option>
                <option value="EXPIRING_14" className="bg-[#1A133E] text-white">&le; 14 Hari</option>
                <option value="EXPIRING_30" className="bg-[#1A133E] text-white">&le; 30 Hari</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'GRID' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Tampilan Grid Card"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      {allDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#130F30]/60 border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-purple-400/40 mx-auto" />
          <h3 className="text-sm font-bold text-white">Tidak ada dokumen ditemukan</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tidak ada arsip berkas yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          {canManage && (
            <button
              onClick={onOpenUploadModal}
              className="mt-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Unggah Dokumen Baru
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-[#130F30]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#0D0A21] text-purple-300/80 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-4 px-4 font-bold">Karyawan &amp; Divisi</th>
                  <th className="py-4 px-4 font-bold">Dokumen &amp; Nomor</th>
                  <th className="py-4 px-4 font-bold">Kategori</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Masa Berlaku</th>
                  <th className="py-4 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allDocs.map((doc) => {
                  const emp = hrDocumentService.getEmployee(doc.employeeId);
                  const cat = hrDocumentService.getCategoryById(doc.documentCategoryId);
                  const isExp = hrDocumentService.isDocumentExpired(doc.expiryDate);

                  return (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                      {/* Employee */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {emp?.fullName || emp?.name || doc.employeeId}
                        </div>
                        <div className="text-[10px] text-purple-200/60 font-mono">
                          {emp?.employeeCode || emp?.employeeNo || '-'} • {emp?.department}
                        </div>
                      </td>

                      {/* Document Name & Number */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            v{doc.version}
                          </span>
                          <span className="font-bold text-white line-clamp-1">{doc.documentName}</span>
                        </div>
                        {doc.documentNumber && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            No: {doc.documentNumber}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-purple-200">
                          {cat?.name || doc.documentCategoryId}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(doc)}</td>

                      {/* Expiry Date */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px]">
                        {doc.expiryDate ? (
                          <span className={isExp ? 'text-rose-400 font-bold' : 'text-purple-200/70'}>
                            {doc.expiryDate}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDocument(doc)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Lihat Dokumen"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span>Lihat</span>
                          </button>

                          {canManage && doc.status === 'PENDING_REVIEW' && (
                            <button
                              onClick={() => onVerifyDocument(doc)}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </button>
                          )}

                          {canManage && (
                            <>
                              <button
                                onClick={() => onVersionDocument(doc)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white transition-colors cursor-pointer"
                                title="Terbitkan Versi Baru"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onArchiveDocument(doc)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Arsipkan Dokumen"
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDocs.map((doc) => {
            const emp = hrDocumentService.getEmployee(doc.employeeId);
            const cat = hrDocumentService.getCategoryById(doc.documentCategoryId);
            const isExp = hrDocumentService.isDocumentExpired(doc.expiryDate);

            return (
              <div
                key={doc.id}
                className="bg-[#130F30]/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        v{doc.version}
                      </span>
                      <span className="text-[11px] text-purple-200/70 truncate max-w-[140px]">
                        {cat?.name || doc.documentCategoryId}
                      </span>
                    </div>
                    {getStatusBadge(doc)}
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewDocument(doc)}
                      className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors cursor-pointer line-clamp-1"
                    >
                      {doc.documentName}
                    </h3>
                    <p className="text-xs text-purple-200/70 mt-0.5">
                      {emp?.fullName || emp?.name} ({emp?.department})
                    </p>
                    {doc.documentNumber && (
                      <span className="text-[10px] font-mono text-gray-400 block mt-1">
                        No: {doc.documentNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>Diupload: {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</span>
                    {doc.expiryDate && (
                      <span className={isExp ? 'text-rose-400 font-bold' : ''}>
                        Exp: {doc.expiryDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onViewDocument(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-300" />
                      <span>Lihat</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {canManage && doc.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => onVerifyDocument(doc)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {canManage && (
                        <>
                          <button
                            onClick={() => onVersionDocument(doc)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            title="Versi Baru"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onArchiveDocument(doc)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Arsipkan"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
