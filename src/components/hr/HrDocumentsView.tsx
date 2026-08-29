/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, HrDocument, HrDocumentType, HrDocumentStatus, HrDocumentStats } from "../../types";
import { HrDocumentService } from "../../services/hrDocumentService";
import { AddDocumentModal } from "./AddDocumentModal";
import { DocumentDetailModal } from "./DocumentDetailModal";
import { DocumentVersionHistoryModal } from "./DocumentVersionHistoryModal";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  FileText,
  AlertTriangle,
  Archive,
  Eye,
  History,
  Grid,
  List,
  Building,
  RefreshCw,
  Award,
  CheckSquare
} from "lucide-react";

interface HrDocumentsViewProps {
  user: User;
}

const CATEGORY_TABS: { id: string; label: string; type?: HrDocumentType }[] = [
  { id: "ALL", label: "Semua Dokumen" },
  { id: "SOP", label: "SOP Operasional", type: "SOP" },
  { id: "COMPANY_REGULATION", label: "Peraturan Perusahaan", type: "COMPANY_REGULATION" },
  { id: "JOB_DESK", label: "Job Deskripsi", type: "JOB_DESK" },
  { id: "IKA", label: "Instruksi Kerja (IKA)", type: "IKA" },
  { id: "POLICY", label: "Kebijakan & Policy", type: "POLICY" },
];

const DIVISIONS = [
  { id: "ALL", label: "Semua Divisi" },
  { id: "WAITER", label: "Waiter & Service" },
  { id: "KITCHEN", label: "Kitchen" },
  { id: "BARISTA", label: "Barista" },
  { id: "CASHIER", label: "Kasir" },
  { id: "PURCHASING", label: "Purchasing" },
  { id: "DISHWASH_CLEANING", label: "Dishwash" },
  { id: "FINANCE", label: "Finance" },
  { id: "CONTENT_CREATOR", label: "Marketing" },
  { id: "CRM", label: "CRM" },
];

const STATUS_FILTERS = [
  { id: "ALL", label: "Semua Status" },
  { id: "ACTIVE", label: "Active (Berlaku)" },
  { id: "PENDING_REVIEW", label: "Pending Review" },
  { id: "APPROVED", label: "Approved" },
  { id: "DRAFT", label: "Draft" },
  { id: "EXPIRED", label: "Expired (Kedaluwarsa)" },
  { id: "ARCHIVED", label: "Archived (Arsip)" },
];

export const HrDocumentsView: React.FC<HrDocumentsViewProps> = ({ user }) => {
  const [documents, setDocuments] = useState<HrDocument[]>([]);
  const [stats, setStats] = useState<HrDocumentStats>({
    total: 0,
    active: 0,
    pending_review: 0,
    approved: 0,
    archived: 0,
    expired: 0,
    sop_count: 0,
    job_desk_count: 0,
    ika_count: 0,
    policy_count: 0,
    regulation_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("ALL");
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [versionHistoryDoc, setVersionHistoryDoc] = useState<HrDocument | null>(null);

  const canManage = user.role === "MANAGER" || user.role === "SUPERVISOR";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const typeFilterVal =
      activeCategoryTab !== "ALL"
        ? (activeCategoryTab as HrDocumentType)
        : undefined;

    const [docsRes, statsRes] = await Promise.all([
      HrDocumentService.getDocuments({
        division: divisionFilter !== "ALL" ? divisionFilter : undefined,
        type: typeFilterVal,
        status: statusFilter !== "ALL" ? (statusFilter as HrDocumentStatus) : undefined,
        search: searchQuery || undefined,
      }),
      HrDocumentService.getDocumentStats(),
    ]);

    if (docsRes.error) {
      setErrorMessage(docsRes.error);
    } else {
      setDocuments(docsRes.data);
    }

    if (!statsRes.error) {
      setStats(statsRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeCategoryTab, divisionFilter, statusFilter, searchQuery]);

  const handleDownload = (doc: HrDocument) => {
    if (doc.file_url) {
      HrDocumentService.logDocumentDownload(doc.id, doc.title);
      window.open(doc.file_url, "_blank");
    } else {
      setErrorMessage(`Dokumen "${doc.title}" belum memiliki lampiran berkas digital.`);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const getStatusBadge = (doc: HrDocument) => {
    if (doc.calculated_status === "EXPIRED" || doc.is_expired) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> EXPIRED
        </span>
      );
    }

    switch (doc.status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> APPROVED
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-purple-200/80 border border-white/20 flex items-center gap-1">
            <FileText className="w-3 h-3" /> DRAFT
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Archive className="w-3 h-3" /> ARCHIVED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
            {doc.status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#130F30] to-orange-950/50 border border-amber-500/20 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                Phase 4.2 HR Document &amp; SOP Center
              </span>
              <span className="text-xs text-purple-200/60 font-mono">
                Penyimpanan Regulasi, SOP &amp; Instruksi Kerja
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Dokumen HR &amp; Standar Operasional (SOP)
            </h1>
            <p className="text-xs text-purple-200/70 max-w-xl">
              Kelola Peraturan Perusahaan, SOP Divisi, Job Desk, IKA, dan Kebijakan resmi dengan kendali versi &amp; integrasi otorisasi RBAC.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Dokumen</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metric Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-purple-200/60 font-mono uppercase tracking-wider">Total Dokumen</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-purple-200/40 mt-0.5">Semua Kategori</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
          <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Active Resmi</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{stats.active}</div>
          <div className="text-[10px] text-emerald-400/60 mt-0.5">Berlaku di resto</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
          <div className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats.pending_review}</div>
          <div className="text-[10px] text-amber-400/60 mt-0.5">Menunggu validasi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-purple-200/60 font-mono uppercase tracking-wider">SOP Operasional</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.sop_count}</div>
          <div className="text-[10px] text-purple-200/40 mt-0.5">Prosedur baku</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-purple-200/60 font-mono uppercase tracking-wider">Job Desk / IKA</div>
          <div className="text-2xl font-black text-purple-300 mt-1">{stats.job_desk_count + stats.ika_count}</div>
          <div className="text-[10px] text-purple-200/40 mt-0.5">Instruksi teknis</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl">
          <div className="text-[10px] text-rose-400 font-mono uppercase tracking-wider">Expired / Arsip</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{stats.expired + stats.archived}</div>
          <div className="text-[10px] text-rose-400/60 mt-0.5">Perlu revisi</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/10">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black"
                  : "bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-purple-200/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode dokumen, judul SOP, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#120D2C] border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Division Filter */}
            <div className="flex items-center gap-1.5 bg-[#120D2C] px-3 py-1.5 rounded-xl border border-white/10">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                {DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1A143D] text-white">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#120D2C] px-3 py-1.5 rounded-xl border border-white/10">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#1A143D] text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#120D2C] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "TABLE" ? "bg-amber-500 text-black font-bold" : "text-white/50 hover:text-white"
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "GRID" ? "bg-amber-500 text-black font-bold" : "text-white/50 hover:text-white"
                }`}
                title="Tampilan Kartu"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3 rounded-3xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-purple-200/60 font-mono">Memuat basis data dokumen HR &amp; SOP...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-purple-300/30 mx-auto" />
          <h3 className="text-sm font-bold text-white">Tidak ada dokumen ditemukan</h3>
          <p className="text-xs text-purple-200/60 max-w-sm mx-auto">
            Tidak ada dokumen yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Dokumen Sekarang
            </button>
          )}
        </div>
      ) : viewMode === "TABLE" ? (
        /* Structured Table View */
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#120D2C]/90 text-purple-200/70 uppercase tracking-wider font-mono border-b border-white/10 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Kode / Versi</th>
                  <th className="py-3.5 px-4 font-bold">Judul Dokumen</th>
                  <th className="py-3.5 px-4 font-bold">Tipe &amp; Sasaran</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Tanggal Efektif</th>
                  <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                    {/* Code & Version */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {doc.document_code || "DOC"}
                        </span>
                        <span className="font-mono text-[10px] text-purple-200/70 bg-white/5 px-1.5 py-0.5 rounded">
                          v{doc.version}
                        </span>
                      </div>
                    </td>

                    {/* Title & Summary */}
                    <td className="py-4 px-4 max-w-xs md:max-w-md">
                      <button
                        type="button"
                        onClick={() => setSelectedDocId(doc.id)}
                        className="text-left font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 group-hover:underline"
                      >
                        {doc.title}
                      </button>
                      <p className="text-[11px] text-purple-200/60 line-clamp-1 mt-0.5">
                        {doc.description || "Tidak ada ringkasan deskripsi"}
                      </p>
                    </td>

                    {/* Type & Audience */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-[11px] font-bold text-purple-200/90">{doc.document_type}</div>
                      <div className="text-[10px] text-purple-200/50 mt-0.5 flex items-center gap-1">
                        <Building className="w-3 h-3 text-amber-400/80" />
                        {doc.target_division ? `Divisi ${doc.target_division}` : "Semua Divisi"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(doc)}</td>

                    {/* Effective Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-purple-200/70">
                      <div>{doc.effective_date}</div>
                      {doc.expiry_date && (
                        <div className="text-[9px] text-purple-200/40">s/d {doc.expiry_date}</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocId(doc.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Lihat Detail Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Detail</span>
                        </button>

                        {doc.file_url && (
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-amber-400 transition-colors"
                            title="Unduh Berkas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setVersionHistoryDoc(doc)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-purple-100 transition-colors"
                          title="Riwayat Versi"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 hover:bg-white/[0.07] transition-all group shadow-lg"
            >
              <div className="space-y-3">
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[11px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {doc.document_code || "DOC"}
                    </span>
                    <span className="font-mono text-[10px] text-purple-200/70 bg-white/5 px-1.5 py-0.5 rounded">
                      v{doc.version}
                    </span>
                  </div>
                  {getStatusBadge(doc)}
                </div>

                {/* Title */}
                <div>
                  <h3
                    onClick={() => setSelectedDocId(doc.id)}
                    className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-2"
                  >
                    {doc.title}
                  </h3>
                  <p className="text-xs text-purple-200/70 mt-1 line-clamp-2 leading-relaxed">
                    {doc.description || "Tidak ada deskripsi rinci untuk dokumen ini."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-3">
                {/* Metadata details */}
                <div className="flex items-center justify-between text-[11px] text-purple-200/60 font-mono">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-amber-400" />
                    {doc.target_division ? `Divisi ${doc.target_division}` : "Perusahaan"}
                  </span>
                  <span>Efektif: {doc.effective_date}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setVersionHistoryDoc(doc)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-purple-200/70 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>v{doc.version} History</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {doc.file_url && (
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition-colors"
                        title="Unduh Berkas"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId(doc.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          user={user}
          onSuccess={() => {
            setSuccessMessage("Dokumen HR & SOP berhasil ditambahkan.");
            loadData();
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {/* Document Detail Modal */}
      {selectedDocId && (
        <DocumentDetailModal
          isOpen={true}
          onClose={() => setSelectedDocId(null)}
          documentId={selectedDocId}
          user={user}
          onDocumentMutated={() => {
            loadData();
          }}
        />
      )}

      {/* Version History Modal */}
      {versionHistoryDoc && (
        <DocumentVersionHistoryModal
          isOpen={true}
          onClose={() => setVersionHistoryDoc(null)}
          document={versionHistoryDoc}
          user={user}
          onVersionAdded={() => {
            loadData();
            setVersionHistoryDoc(null);
            setSuccessMessage("Versi baru dokumen berhasil diterbitkan.");
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
};
