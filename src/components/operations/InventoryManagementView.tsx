/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY MANAGEMENT MASTER CONTAINER
 * Integrates Inventory Master Catalog, Stock Movement Ledger, Stock Opname, and Wasting Logs.
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { InventoryItem } from '../../types/inventory';
import { inventoryService } from '../../services/inventoryService';
import { InventoryKpiGrid } from './inventory/InventoryKpiGrid';
import { InventoryMasterView } from './inventory/InventoryMasterView';
import { StockMovementLedgerView } from './inventory/StockMovementLedgerView';
import { StockOpnameView } from './inventory/StockOpnameView';
import { WastingLogView } from './WastingLogView';
import { InventoryDetailModal } from './inventory/InventoryDetailModal';
import { ReceiveStockModal } from './inventory/ReceiveStockModal';
import { TransferStockModal } from './inventory/TransferStockModal';
import { StockAdjustmentModal } from './inventory/StockAdjustmentModal';
import {
  Package,
  History,
  ClipboardCheck,
  Trash2,
  Boxes,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface InventoryManagementViewProps {
  currentUser: User;
  onReportIssue?: (item: InventoryItem) => void;
}

type SubTab = 'KATALOG' | 'LEDGER' | 'OPNAME' | 'WASTAGE';

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({
  currentUser,
  onReportIssue,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('KATALOG');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState({
    totalSkus: 0,
    totalValue: 0,
    optimalCount: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    outOfStockCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    totalWasteValueMonth: 0,
    stockAccuracyPercentage: 0,
    positiveVarianceCount: 0,
    negativeVarianceCount: 0,
  });

  // Modal States
  const [selectedDetailItem, setSelectedDetailItem] = useState<InventoryItem | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<InventoryItem | null>(null);

  const refreshData = async () => {
    const data = await inventoryService.getInventoryItems();
    setItems(data || []);
    const sum = await inventoryService.getInventorySummary();
    if (sum) setSummary(sum);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenReceive = (item?: InventoryItem) => {
    setActiveModalItem(item || null);
    setShowReceiveModal(true);
  };

  const handleOpenTransfer = (item?: InventoryItem) => {
    setActiveModalItem(item || null);
    setShowTransferModal(true);
  };

  const handleOpenAdjust = (item?: InventoryItem) => {
    setActiveModalItem(item || null);
    setShowAdjustModal(true);
  };

  const handleReportIssue = (item: InventoryItem) => {
    if (onReportIssue) {
      onReportIssue(item);
    } else {
      alert(`Melaporkan kendala operasional untuk item: ${item.name}`);
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#151B2B] via-[#1E2438] to-[#151B2B] p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Phase 3.5 Operational Subsystem
            </span>
            <span className="text-slate-400 text-xs">• Real-time FEFO Control</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            <span>Inventory, Stock Movement &amp; Wasting Management</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Sistem manajemen persediaan restoran terpadu. Melacak saldo stok, pergerakan barang, First-Expiry-First-Out (FEFO), audit stock opname, serta reduksi food loss &amp; wasting.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer self-start md:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <InventoryKpiGrid summary={summary} />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#151B2B] rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('KATALOG')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'KATALOG'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Master Katalog &amp; Stok ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'LEDGER'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Ledger Pergerakan Stok</span>
        </button>

        <button
          onClick={() => setActiveTab('OPNAME')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'OPNAME'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Stock Opname Fisikal</span>
        </button>

        <button
          onClick={() => setActiveTab('WASTAGE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'WASTAGE'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Wasting &amp; Food Loss Log</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'KATALOG' && (
          <InventoryMasterView
            items={items}
            onSelectItem={(item) => setSelectedDetailItem(item)}
            onOpenTransfer={(item) => handleOpenTransfer(item)}
            onOpenAdjust={(item) => handleOpenAdjust(item)}
            onReportIssue={handleReportIssue}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'LEDGER' && (
          <StockMovementLedgerView
            onOpenNewReceipt={() => handleOpenReceive()}
            onOpenNewTransfer={() => handleOpenTransfer()}
            onOpenNewWastage={() => setActiveTab('WASTAGE')}
          />
        )}

        {activeTab === 'OPNAME' && (
          <StockOpnameView
            currentUser={{
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
            }}
            onRefreshInventory={refreshData}
          />
        )}

        {activeTab === 'WASTAGE' && <WastingLogView user={currentUser} />}
      </div>

      {/* Modals */}
      {selectedDetailItem && (
        <InventoryDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onOpenAdjust={(item) => {
            setSelectedDetailItem(null);
            handleOpenAdjust(item);
          }}
          onOpenTransfer={(item) => {
            setSelectedDetailItem(null);
            handleOpenTransfer(item);
          }}
        />
      )}

      {showReceiveModal && (
        <ReceiveStockModal
          item={activeModalItem}
          allItems={items}
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          }}
          onClose={() => setShowReceiveModal(false)}
          onSuccess={refreshData}
        />
      )}

      {showTransferModal && (
        <TransferStockModal
          item={activeModalItem}
          allItems={items}
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          }}
          onClose={() => setShowTransferModal(false)}
          onSuccess={refreshData}
        />
      )}

      {showAdjustModal && (
        <StockAdjustmentModal
          item={activeModalItem}
          allItems={items}
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          }}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};
