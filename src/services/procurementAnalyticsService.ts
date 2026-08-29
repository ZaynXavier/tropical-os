/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PROCUREMENT ANALYTICS SERVICE
 * Provides KPI summaries, spend analytics, price variance reports, and audit trail retrieval.
 */

import { ProcurementSummary, ProcurementAuditEvent, PurchasePriceHistory } from '../types/procurement';
import { purchaseRequestService } from './purchaseRequestService';
import { purchaseOrderService } from './purchaseOrderService';
import { supplierService } from './supplierService';
import { MOCK_PRICE_HISTORY, MOCK_PROCUREMENT_AUDIT } from '../data/mockProcurementData';

const STORAGE_KEY_PRICE = 'tropicalos_master_purchase_price_history';
const STORAGE_KEY_AUDIT = 'tropicalos_procurement_audit';

export const procurementAnalyticsService = {
  async getProcurementSummary(period: 'DAY' | 'WEEK' | 'MONTH' = 'MONTH'): Promise<ProcurementSummary> {
    const requests = await purchaseRequestService.getPurchaseRequests();
    const orders = await purchaseOrderService.getPurchaseOrders();
    const suppliers = await supplierService.getSuppliers();
    const overduePOs = await purchaseOrderService.getOverduePurchaseOrders();

    const totalRequests = requests.length;
    const pendingRequestApprovals = requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
    const approvedRequests = requests.filter((r) => r.status === 'APPROVED' || r.status === 'CONVERTED_TO_PO').length;
    const urgentRequestCount = requests.filter((r) => r.priority === 'URGENT' || r.priority === 'HIGH').length;

    const activePurchaseOrders = orders.filter((o) => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED'].includes(o.status)).length;
    const outstandingPoCount = orders.filter((o) => ['PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED'].includes(o.status)).length;
    const overduePoCount = overduePOs.length;

    const totalPurchaseValueMonth = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Calculate price variance average
    const priceHistories = await this.getPriceVarianceAnalysis();
    const avgVariance = priceHistories.length > 0
      ? Number((priceHistories.reduce((acc, curr) => acc + curr.variancePercentage, 0) / priceHistories.length).toFixed(2))
      : 0;

    // Calculate average supplier rating
    const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE');
    const avgRating = activeSuppliers.length > 0
      ? Number((activeSuppliers.reduce((acc, curr) => acc + curr.rating, 0) / activeSuppliers.length).toFixed(1))
      : 4.5;

    return {
      totalRequests,
      pendingRequestApprovals,
      approvedRequests,
      activePurchaseOrders,
      outstandingPoCount,
      overduePoCount,
      totalPurchaseValueMonth,
      averagePriceVariancePercentage: avgVariance,
      urgentRequestCount,
      averageSupplierRating: avgRating,
    };
  },

  async getPriceVarianceAnalysis(): Promise<PurchasePriceHistory[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRICE);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PRICE, JSON.stringify(MOCK_PRICE_HISTORY));
        return MOCK_PRICE_HISTORY;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : MOCK_PRICE_HISTORY;
    } catch (err) {
      return MOCK_PRICE_HISTORY;
    }
  },

  async getAuditEvents(): Promise<ProcurementAuditEvent[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(MOCK_PROCUREMENT_AUDIT));
        return MOCK_PROCUREMENT_AUDIT;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : MOCK_PROCUREMENT_AUDIT;
    } catch (err) {
      return MOCK_PROCUREMENT_AUDIT;
    }
  },

  async getCategorySpendAnalysis(): Promise<{ category: string; amount: number; percentage: number }[]> {
    const orders = await purchaseOrderService.getPurchaseOrders();
    const catMap: Record<string, number> = {};
    let totalSpend = 0;

    for (const po of orders) {
      if (po.status === 'CANCELLED') continue;
      for (const item of po.items) {
        // Find item category if available
        const cat = item.itemName.toLowerCase().includes('beef') || item.itemName.toLowerCase().includes('meat')
          ? 'Meat'
          : item.itemName.toLowerCase().includes('lettuce') || item.itemName.toLowerCase().includes('tomato')
          ? 'Vegetable'
          : item.itemName.toLowerCase().includes('susu') || item.itemName.toLowerCase().includes('kopi')
          ? 'Beverage'
          : item.itemName.toLowerCase().includes('salmon')
          ? 'Seafood'
          : item.itemName.toLowerCase().includes('beras')
          ? 'Dry Goods'
          : 'Other';

        const itemTotal = item.totalPrice || item.orderedQuantity * item.unitPrice;
        catMap[cat] = (catMap[cat] || 0) + itemTotal;
        totalSpend += itemTotal;
      }
    }

    if (totalSpend === 0) totalSpend = 1;

    return Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((amount / totalSpend) * 100).toFixed(1)),
    }));
  },
};
