/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PURCHASING & PROCUREMENT MANAGEMENT VIEW
 * Main orchestrator view for Tropical Garden Resto Operating System (TROPICALOS)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PurchaseRequest,
  PurchaseOrder,
  Supplier,
  ProcurementKpiData,
  ProcurementAuditLog,
  PRStatus,
  POStatus,
} from '../../../types/procurement';
import { purchaseRequestService } from '../../../services/purchaseRequestService';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { supplierService } from '../../../services/supplierService';
import { procurementAnalyticsService } from '../../../services/procurementAnalyticsService';

import { ProcurementKpiGrid } from './ProcurementKpiGrid';
import { ProcurementFilters } from './ProcurementFilters';
import { CreatePurchaseRequestModal } from './CreatePurchaseRequestModal';
import { PurchaseRequestApprovalModal } from './PurchaseRequestApprovalModal';
import { ConvertPRToPOModal } from './ConvertPRToPOModal';
import { ReceiveGoodsModal } from './ReceiveGoodsModal';
import { SupplierFormModal } from './SupplierFormModal';

import {
  ShoppingBag,
  FileText,
  Truck,
  Users,
  TrendingUp,
  History,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  Box,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface ProcurementManagementViewProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
}

type TabType = 'REQUESTS' | 'ORDERS' | 'SUPPLIERS' | 'LOGS' | 'ANALYTICS';

export const ProcurementManagementView: React.FC<ProcurementManagementViewProps> = ({
  currentUser = { id: 'E001', name: 'Budi Santoso', role: 'GENERAL_MANAGER' },
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('REQUESTS');

  // Core Data States
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [kpiData, setKpiData] = useState<ProcurementKpiData | null>(null);
  const [auditLogs, setAuditLogs] = useState<ProcurementAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    department: 'ALL',
    category: 'ALL',
    dateRange: 'THIS_MONTH',
  });

  // Modals States
  const [isCreatePrOpen, setIsCreatePrOpen] = useState(false);
  const [selectedPrForApproval, setSelectedPrForApproval] = useState<PurchaseRequest | null>(null);
  const [selectedPrForConvert, setSelectedPrForConvert] = useState<PurchaseRequest | null>(null);
  const [selectedPoForReceiving, setSelectedPoForReceiving] = useState<PurchaseOrder | null>(null);
  const [selectedSupplierForForm, setSelectedSupplierForForm] = useState<Supplier | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [viewPoDetail, setViewPoDetail] = useState<PurchaseOrder | null>(null);

  // Load All Data
  const reloadData = async () => {
    setIsLoading(true);
    try {
      const [prList, poList, supList, summary, auditEvents, categorySpend] = await Promise.all([
        purchaseRequestService.getPurchaseRequests(),
        purchaseOrderService.getPurchaseOrders(),
        supplierService.getSuppliers(),
        procurementAnalyticsService.getProcurementSummary(),
        procurementAnalyticsService.getAuditEvents(),
        procurementAnalyticsService.getCategorySpendAnalysis(),
      ]);

      setRequests(prList);
      setOrders(poList);
      setSuppliers(supList);
      setKpiData({
        ...summary,
        spendByCategory: categorySpend,
        topSpendItems: [
          { itemName: 'Wagyu Beef Ribeye MB5+', totalSpend: 23200000, quantityPurchased: 40 },
          { itemName: 'Atlantic Fresh Salmon Whole', totalSpend: 13500000, quantityPurchased: 25 },
          { itemName: 'Fresh Milk Greenfields 1L x 12', totalSpend: 8100000, quantityPurchased: 30 },
          { itemName: 'Beras Melati Premium 25kg', totalSpend: 4162500, quantityPurchased: 10 },
        ],
      });
      setAuditLogs(auditEvents as any);
    } catch (err) {
      console.error('Error loading procurement data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((pr) => {
      if (filters.status !== 'ALL' && pr.status !== filters.status) return false;
      if (filters.department !== 'ALL' && pr.department !== filters.department) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchNum = pr.requestNumber.toLowerCase().includes(q);
        const matchUser = pr.requestedByName.toLowerCase().includes(q);
        const matchItem = pr.items.some((i) => i.itemName.toLowerCase().includes(q));
        if (!matchNum && !matchUser && !matchItem) return false;
      }
      return true;
    });
  }, [requests, filters]);

  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      if (filters.status !== 'ALL' && po.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchNum = po.poNumber.toLowerCase().includes(q);
        const matchSup = po.supplierName.toLowerCase().includes(q);
        const matchItem = po.items.some((i) => i.itemName.toLowerCase().includes(q));
        if (!matchNum && !matchSup && !matchItem) return false;
      }
      return true;
    });
  }, [orders, filters]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      if (filters.category !== 'ALL' && sup.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = sup.supplierName.toLowerCase().includes(q);
        const matchContact = sup.contactPerson.toLowerCase().includes(q);
        if (!matchName && !matchContact) return false;
      }
      return true;
    });
  }, [suppliers, filters]);

  // Handlers for PR Operations
  const handleCreatePR = async (prData: any) => {
    await purchaseRequestService.createPurchaseRequest(prData, {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
    });
    await reloadData();
  };

  const handleApprovePR = async (prId: string, notes: string) => {
    await purchaseRequestService.approvePurchaseRequest(
      prId,
      notes,
      { id: currentUser.id, name: currentUser.name, role: currentUser.role }
    );
    await reloadData();
  };

  const handleRejectPR = async (prId: string, notes: string) => {
    await purchaseRequestService.rejectPurchaseRequest(
      prId,
      notes,
      { id: currentUser.id, name: currentUser.name, role: currentUser.role }
    );
    await reloadData();
  };

  const handleConvertPR = async (
    request: PurchaseRequest,
    supplier: any,
    expectedDeliveryDate: string,
    actor: any
  ) => {
    await purchaseOrderService.createPOFromRequest(
      request,
      supplier,
      expectedDeliveryDate,
      actor
    );
    await reloadData();
  };

  // Handlers for Receiving PO
  const handleReceiveGoods = async (
    poId: string,
    receivingDetails: any[],
    actor: any,
    invoiceReference?: string
  ) => {
    await purchaseOrderService.recordReceiving(poId, receivingDetails, actor, invoiceReference);
    await reloadData();
  };

  // Handlers for Supplier CRUD
  const handleSupplierSubmit = async (data: any, isEdit: boolean) => {
    if (isEdit && selectedSupplierForForm) {
      await supplierService.updateSupplier(selectedSupplierForForm.id, data);
    } else {
      await supplierService.createSupplier(data);
    }
    await reloadData();
  };

  // Helper status badges
  const renderPrStatusBadge = (status: PRStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">DRAFT</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> MENUNGGU PERSETUJUAN</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> DISETUJUI</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> DITOLAK</span>;
      case 'CONVERTED_TO_PO':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> MENJADI PO</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400">DIBATALKAN</span>;
    }
  };

  const renderPoStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">DRAFT</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">APPROVED</span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"><Truck className="w-3 h-3" /> TERKIRIM KE SUPPLIER</span>;
      case 'PARTIALLY_RECEIVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Box className="w-3 h-3" /> DITERIMA SEBAGIAN</span>;
      case 'RECEIVED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> DITERIMA LENGKAP</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">DIBATALKAN</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16 text-white bg-[#0B0F19] min-h-screen p-4 sm:p-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#151B2B] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Procurement &amp; Purchasing Management
              </h1>
              <p className="text-xs text-slate-400">
                Sistem Pengadaan Bahan Baku, Purchase Request (PR), Purchase Order (PO), &amp; Audit Penerimaan Stok Resto
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => reloadData()}
            className="p-2.5 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 border border-white/10 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setSelectedSupplierForForm(null);
              setIsSupplierModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-[#0B0F19] hover:bg-[#1E2438] text-yellow-300 border border-yellow-500/30 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>+ Supplier</span>
          </button>

          <button
            onClick={() => setIsCreatePrOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Purchase Request (PR)</span>
          </button>
        </div>
      </div>

      {/* High-Level KPI Summary Cards */}
      <ProcurementKpiGrid kpis={kpiData} loading={isLoading} />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto no-scrollbar pt-2">
        <button
          onClick={() => {
            setActiveTab('REQUESTS');
            setFilters({ ...filters, status: 'ALL' });
          }}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'REQUESTS'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Purchase Requests (PR)</span>
          {requests.filter((r) => r.status === 'SUBMITTED').length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-black font-extrabold rounded-full">
              {requests.filter((r) => r.status === 'SUBMITTED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setFilters({ ...filters, status: 'ALL' });
          }}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ORDERS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchase Orders (PO)</span>
          {orders.filter((o) => o.status === 'SENT' || o.status === 'PARTIALLY_RECEIVED').length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500 text-black font-extrabold rounded-full">
              {orders.filter((o) => o.status === 'SENT' || o.status === 'PARTIALLY_RECEIVED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('SUPPLIERS');
            setFilters({ ...filters, category: 'ALL' });
          }}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'SUPPLIERS'
              ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Supplier ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'LOGS'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Variansi &amp; Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'border-pink-500 text-pink-400 bg-pink-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analisis Pengadaan</span>
        </button>
      </div>

      {/* Filter Bar Component */}
      {(activeTab === 'REQUESTS' || activeTab === 'ORDERS' || activeTab === 'SUPPLIERS') && (
        <ProcurementFilters
          activeTab={activeTab}
          filters={filters}
          onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* TAB CONTENT 1: PURCHASE REQUESTS (PR) */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="p-3.5">No. PR &amp; Tanggal</th>
                  <th className="p-3.5">Pemohon / Dep</th>
                  <th className="p-3.5">Prioritas</th>
                  <th className="p-3.5">Detail Barang &amp; Item</th>
                  <th className="p-3.5">Total Estimasi</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Tidak ada data Purchase Request yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-white block">{pr.requestNumber}</span>
                        <span className="text-[10px] text-slate-400">{pr.requestDate}</span>
                      </td>

                      <td className="p-3.5">
                        <strong className="text-white block">{pr.requestedByName}</strong>
                        <span className="text-[10px] text-blue-400 uppercase font-mono">{pr.department}</span>
                      </td>

                      <td className="p-3.5">
                        {pr.priority === 'URGENT' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> URGENT
                          </span>
                        ) : pr.priority === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit block">
                            HIGH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 w-fit block">
                            NORMAL
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          {pr.items.map((i) => (
                            <div key={i.id} className="text-[11px] flex justify-between gap-2">
                              <span className="text-slate-200 truncate">{i.itemName}</span>
                              <span className="font-mono text-blue-300 font-bold shrink-0">
                                {i.requestedQuantity} {i.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                        {pr.reason && (
                          <span className="text-[10px] text-slate-400 italic block mt-1 truncate">
                            "{pr.reason}"
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        Rp {(pr.totalEstimatedCost ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="p-3.5">{renderPrStatusBadge(pr.status)}</td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pr.status === 'SUBMITTED' && (
                            <button
                              onClick={() => setSelectedPrForApproval(pr)}
                              className="px-2.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verifikasi / Approval</span>
                            </button>
                          )}

                          {pr.status === 'APPROVED' && (
                            <button
                              onClick={() => setSelectedPrForConvert(pr)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-md shadow-blue-600/30"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Konversi ke PO</span>
                            </button>
                          )}

                          {pr.status === 'CONVERTED_TO_PO' && pr.convertedPoId && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                              PO: {pr.convertedPoNumber}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PURCHASE ORDERS (PO) */}
      {activeTab === 'ORDERS' && (
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="p-3.5">No. PO &amp; Tgl Order</th>
                  <th className="p-3.5">Supplier &amp; Term</th>
                  <th className="p-3.5">Item Barang</th>
                  <th className="p-3.5">Estimasi Tiba</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5">Status Receiving</th>
                  <th className="p-3.5 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Tidak ada Purchase Order yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-white block">{po.poNumber}</span>
                        <span className="text-[10px] text-slate-400">{po.poDate}</span>
                      </td>

                      <td className="p-3.5">
                        <strong className="text-white block">{po.supplierName}</strong>
                        <span className="text-[10px] text-yellow-400 font-mono">{po.paymentTerms}</span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          {po.items.map((i) => (
                            <div key={i.id} className="text-[11px] flex justify-between gap-2">
                              <span className="text-slate-200 truncate">{i.itemName}</span>
                              <span className="font-mono text-emerald-400 font-bold shrink-0">
                                {i.receivedQuantity}/{i.orderedQuantity} {i.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        {po.expectedDeliveryDate}
                        {po.actualDeliveryDate && (
                          <span className="block text-[10px] text-emerald-400">
                            Tiba: {po.actualDeliveryDate}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        Rp {(po.grandTotal ?? 0).toLocaleString('id-ID')}
                      </td>

                      <td className="p-3.5">{renderPoStatusBadge(po.status)}</td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewPoDetail(po)}
                            className="p-1.5 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 rounded-lg cursor-pointer"
                            title="Detail PO"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'APPROVED') && (
                            <button
                              onClick={() => setSelectedPoForReceiving(po)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/30"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Penerimaan Barang</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SUPPLIER DIRECTORY */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl hover:border-yellow-500/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-white">{sup.supplierName}</h3>
                  <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                    {sup.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 font-mono text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>{sup.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-b border-white/5 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kontak Person:</span>
                  <span className="font-semibold text-white">{sup.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No Telepon:</span>
                  <span className="font-mono text-blue-300">{sup.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Term Pembayaran:</span>
                  <span className="font-mono text-white">{sup.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lead Time Delivery:</span>
                  <span className="font-mono text-emerald-400">{sup.leadTimeDays} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Order:</span>
                  <span className="font-mono text-white">
                    Rp {(sup.minimumOrderAmount ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sup.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {sup.status}
                </span>

                <button
                  onClick={() => {
                    setSelectedSupplierForForm(sup);
                    setIsSupplierModalOpen(true);
                  }}
                  className="px-3 py-1 bg-[#0B0F19] hover:bg-[#1E2438] text-slate-300 rounded-lg font-semibold cursor-pointer text-[11px]"
                >
                  Edit Supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 4: VARIANSI & AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-[#151B2B] p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl text-xs">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Audit Trail Pengadaan &amp; Rekonsiliasi Variansi Harga</span>
            </h3>
            <span className="text-slate-400 text-[11px] font-mono">{auditLogs.length} Aktivitas Tercatat</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0B0F19] rounded-xl border border-white/5 space-y-1 hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                  <span className="text-purple-300 font-bold">{log.actionType}</span>
                  <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                </div>
                <p className="text-slate-200 font-medium">{log.details}</p>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>
                    Oleh: <strong className="text-slate-300">{log.actorName}</strong> ({log.actorRole})
                  </span>
                  <span>Ref: {log.referenceNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ANALYTICS & PERFORMANCE */}
      {activeTab === 'ANALYTICS' && kpiData && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Spend */}
            <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3">
              <h3 className="font-bold text-sm text-white">Pengeluaran Pengadaan Per Kategori</h3>
              <div className="space-y-2">
                {kpiData.spendByCategory.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{cat.category}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Rp {(cat.amount ?? 0).toLocaleString('id-ID')} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Items Spend */}
            <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3">
              <h3 className="font-bold text-sm text-white">Top 5 Bahan Baku Terbesar (Spend)</h3>
              <div className="space-y-2">
                {kpiData.topSpendItems.map((item, idx) => (
                  <div
                    key={item.itemName}
                    className="p-2.5 bg-[#0B0F19] rounded-xl flex justify-between items-center text-xs"
                  >
                    <div>
                      <strong className="text-white block">{item.itemName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Vol: {item.quantityPurchased}
                      </span>
                    </div>
                    <span className="font-mono text-blue-400 font-bold">
                      Rp {(item.totalSpend ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <CreatePurchaseRequestModal
        isOpen={isCreatePrOpen}
        onClose={() => setIsCreatePrOpen(false)}
        onSubmit={handleCreatePR}
        currentUser={currentUser}
      />

      <PurchaseRequestApprovalModal
        isOpen={!!selectedPrForApproval}
        onClose={() => setSelectedPrForApproval(null)}
        request={selectedPrForApproval}
        onApprove={handleApprovePR}
        onReject={handleRejectPR}
        currentUser={currentUser}
      />

      <ConvertPRToPOModal
        isOpen={!!selectedPrForConvert}
        onClose={() => setSelectedPrForConvert(null)}
        request={selectedPrForConvert}
        onConvert={handleConvertPR}
        currentUser={currentUser}
      />

      <ReceiveGoodsModal
        isOpen={!!selectedPoForReceiving}
        onClose={() => setSelectedPoForReceiving(null)}
        order={selectedPoForReceiving}
        onReceive={handleReceiveGoods}
        currentUser={currentUser}
      />

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplier={selectedSupplierForForm}
        onSubmit={handleSupplierSubmit}
        currentUser={currentUser}
      />

      {/* Detail PO Modal */}
      {viewPoDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#151B2B] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-white my-8 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">{viewPoDetail.poNumber}</h3>
                <p className="text-[10px] text-yellow-400 font-mono">
                  Supplier: {viewPoDetail.supplierName} ({viewPoDetail.paymentTerms})
                </p>
              </div>
              <button
                onClick={() => setViewPoDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-300">Rincian Barang &amp; Penerimaan:</h4>
              <div className="bg-[#0B0F19] rounded-xl p-3 border border-white/10 space-y-2">
                {viewPoDetail.items.map((i) => (
                  <div key={i.id} className="flex justify-between border-b border-white/5 pb-2">
                    <div>
                      <strong className="text-white block">{i.itemName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {i.sku}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold block">
                        Diterima: {i.receivedQuantity} / {i.orderedQuantity} {i.unit}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        @ Rp {(i.unitPrice ?? 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setViewPoDetail(null)}
                className="px-4 py-2 bg-[#0B0F19] border border-white/10 rounded-xl font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
