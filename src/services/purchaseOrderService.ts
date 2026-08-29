/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PURCHASE ORDER SERVICE
 * Handles Purchase Order lifecycle, approvals, receiving integration, price history, and audit logs.
 */

import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchasePriceHistory,
  PurchaseRequest,
} from '../types/procurement';
import { MOCK_PURCHASE_ORDERS, MOCK_PRICE_HISTORY } from '../data/mockProcurementData';
import { purchaseRequestService } from './purchaseRequestService';
import { inventoryService } from './inventoryService';
import { stockMovementService } from './stockMovementService';

const STORAGE_KEY_PO = 'tropicalos_master_purchase_orders';
const STORAGE_KEY_PRICE = 'tropicalos_master_purchase_price_history';
const STORAGE_KEY_AUDIT = 'tropicalos_procurement_audit';

const getStoredOrders = (): PurchaseOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PO, JSON.stringify(MOCK_PURCHASE_ORDERS));
      return MOCK_PURCHASE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PURCHASE_ORDERS;
  } catch (err) {
    console.error('Error reading purchase orders from localStorage:', err);
    return MOCK_PURCHASE_ORDERS;
  }
};

const saveOrders = (data: PurchaseOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PO, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving purchase orders to localStorage:', err);
  }
};

const getStoredPriceHistory = (): PurchasePriceHistory[] => {
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
};

const savePriceHistory = (data: PurchasePriceHistory[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PRICE, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving price history to localStorage:', err);
  }
};

const recordAudit = (
  entityId: string,
  action: string,
  previousValue: string | undefined,
  newValue: string,
  actor: { id: string; name: string; role: string },
  notes?: string
) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType: 'PURCHASE_ORDER',
      entityId,
      action,
      previousValue,
      newValue,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      notes,
    });
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
  } catch (err) {
    console.error('Error recording audit log:', err);
  }
};

export const purchaseOrderService = {
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return getStoredOrders();
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const list = getStoredOrders();
    return list.find((po) => po.id === id) || null;
  },

  async getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    const list = getStoredOrders();
    return list.filter((po) => po.supplierId === supplierId);
  },

  async getOutstandingPurchaseOrders(): Promise<PurchaseOrder[]> {
    const list = getStoredOrders();
    return list.filter((po) => ['PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED'].includes(po.status));
  },

  async getOverduePurchaseOrders(): Promise<PurchaseOrder[]> {
    const list = getStoredOrders();
    const today = new Date().toISOString().slice(0, 10);
    return list.filter(
      (po) =>
        ['APPROVED', 'SENT', 'PARTIALLY_RECEIVED'].includes(po.status) &&
        po.expectedDeliveryDate &&
        po.expectedDeliveryDate < today
    );
  },

  async createPurchaseOrder(
    data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string; role: string },
    isDraft: boolean = false
  ): Promise<PurchaseOrder> {
    if (!data.items || data.items.length === 0) {
      throw new Error('Purchase Order harus memiliki minimal 1 item.');
    }
    if (!data.supplierId) {
      throw new Error('Pemasok / Supplier wajib dipilih.');
    }
    if (!data.expectedDeliveryDate) {
      throw new Error('Tanggal perkiraan pengiriman (Expected Delivery) wajib diisi.');
    }

    const list = getStoredOrders();
    const count = list.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const poNumber = `PO-${yearMonth}-${count < 100 ? (count < 10 ? '00' + count : '0' + count) : count}`;

    const subtotal = data.items.reduce((sum, item) => sum + (item.totalPrice || item.orderedQuantity * item.unitPrice), 0);
    const tax = data.tax !== undefined ? data.tax : Math.round(subtotal * 0.11);
    const grandTotal = subtotal - (data.discount || 0) + tax + (data.shippingCost || 0) + (data.additionalCost || 0);

    const newPo: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      poNumber,
      subtotal,
      tax,
      grandTotal,
      status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      createdBy: actor.id,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPo, ...list];
    saveOrders(updated);

    recordAudit(newPo.id, 'CREATE', undefined, newPo.status, actor, `PO #${poNumber} dibuat untuk ${data.supplierName}`);

    return newPo;
  },

  async createPOFromRequest(
    request: PurchaseRequest,
    supplier: { id: string; name: string; contact: string; paymentTerms: string },
    expectedDeliveryDate: string,
    actor: { id: string; name: string; role: string }
  ): Promise<PurchaseOrder> {
    const poItems: PurchaseOrderItem[] = request.items.map((pri, idx) => ({
      id: `poi-${Date.now()}-${idx}`,
      inventoryItemId: pri.inventoryItemId,
      sku: pri.sku,
      itemName: pri.itemName,
      orderedQuantity: pri.requestedQuantity,
      receivedQuantity: 0,
      remainingQuantity: pri.requestedQuantity,
      unit: pri.unit,
      unitPrice: pri.estimatedUnitPrice,
      discount: 0,
      totalPrice: pri.estimatedUnitPrice * pri.requestedQuantity,
      batchRequired: true,
      expiryRequired: true,
      notes: pri.notes,
    }));

    const subtotal = poItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const tax = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + tax;

    const list = getStoredOrders();
    const count = list.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const poNumber = `PO-${yearMonth}-${count < 100 ? (count < 10 ? '00' + count : '0' + count) : count}`;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      purchaseRequestId: request.id,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierContact: supplier.contact,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate,
      department: request.department,
      status: 'APPROVED',
      items: poItems,
      subtotal,
      discount: 0,
      tax,
      shippingCost: 0,
      additionalCost: 0,
      grandTotal,
      paymentStatus: 'UNPAID',
      paymentTerms: supplier.paymentTerms || 'NET 14',
      notes: `Dikonversi otomatis dari Purchase Request ${request.requestNumber}`,
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
      updatedBy: actor.id,
      updatedAt: new Date().toISOString(),
      approvedBy: actor.id,
      approvedAt: new Date().toISOString(),
    };

    saveOrders([newPo, ...list]);

    // Mark request as converted
    await purchaseRequestService.markConvertedToPO(request.id, actor.id);

    recordAudit(newPo.id, 'CONVERT_FROM_PR', request.status, 'APPROVED', actor, `PO #${poNumber} dibuat dari PR #${request.requestNumber}`);

    return newPo;
  },

  async approvePurchaseOrder(
    id: string,
    notes?: string,
    actor: { id: string; name: string; role: string } = { id: 'E001', name: 'Made Arisusena', role: 'MANAGER' }
  ): Promise<PurchaseOrder> {
    const list = getStoredOrders();
    const index = list.findIndex((po) => po.id === id);
    if (index === -1) throw new Error(`PO dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    const updated: PurchaseOrder = {
      ...existing,
      status: 'APPROVED',
      approvedBy: actor.id,
      approvedAt: new Date().toISOString(),
      notes: notes ? `${existing.notes ? existing.notes + '\n' : ''}Persetujuan PO: ${notes}` : existing.notes,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveOrders(list);

    recordAudit(id, 'APPROVE', existing.status, 'APPROVED', actor, `PO #${existing.poNumber} disetujui`);

    return updated;
  },

  async sendPurchaseOrder(id: string, actor: { id: string; name: string; role: string }): Promise<PurchaseOrder> {
    const list = getStoredOrders();
    const index = list.findIndex((po) => po.id === id);
    if (index === -1) throw new Error(`PO dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    const updated: PurchaseOrder = {
      ...existing,
      status: 'SENT',
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveOrders(list);

    recordAudit(id, 'SEND', existing.status, 'SENT', actor, `PO #${existing.poNumber} dikirim ke supplier ${existing.supplierName}`);

    return updated;
  },

  async cancelPurchaseOrder(
    id: string,
    cancellationReason: string,
    actor: { id: string; name: string; role: string }
  ): Promise<PurchaseOrder> {
    if (!cancellationReason || !cancellationReason.trim()) {
      throw new Error('Alasan pembatalan PO wajib diisi.');
    }

    const list = getStoredOrders();
    const index = list.findIndex((po) => po.id === id);
    if (index === -1) throw new Error(`PO dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    if (existing.status === 'RECEIVED' || existing.status === 'CLOSED') {
      throw new Error('PO yang sudah selesai diterima tidak dapat dibatalkan.');
    }

    const updated: PurchaseOrder = {
      ...existing,
      status: 'CANCELLED',
      cancelledBy: actor.id,
      cancelledAt: new Date().toISOString(),
      cancellationReason,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveOrders(list);

    recordAudit(id, 'CANCEL', existing.status, 'CANCELLED', actor, `PO #${existing.poNumber} dibatalkan. Alasan: ${cancellationReason}`);

    return updated;
  },

  /**
   * RECORD RECEIVING (Partial / Full Receiving)
   * Integrates receiving process directly with Inventory Master and Stock Movement Ledger.
   */
  async recordReceiving(
    poId: string,
    receivingDetails: {
      poiId: string;
      inventoryItemId: string;
      qtyReceived: number;
      batchNumber?: string;
      expiryDate?: string;
      unitPrice: number;
      discrepancyReason?: string;
      notes?: string;
    }[],
    actor: { id: string; name: string; role: string },
    invoiceReference?: string
  ): Promise<PurchaseOrder> {
    const list = getStoredOrders();
    const index = list.findIndex((po) => po.id === poId);
    if (index === -1) throw new Error(`PO dengan ID ${poId} tidak ditemukan.`);

    const po = list[index];
    const updatedItems = po.items.map((item) => {
      const match = receivingDetails.find((r) => r.poiId === item.id || r.inventoryItemId === item.inventoryItemId);
      if (!match || match.qtyReceived <= 0) return item;

      const newReceived = item.receivedQuantity + match.qtyReceived;
      const newRemaining = Math.max(0, item.orderedQuantity - newReceived);

      return {
        ...item,
        receivedQuantity: newReceived,
        remainingQuantity: newRemaining,
        unitPrice: match.unitPrice || item.unitPrice,
        notes: match.notes ? `${item.notes ? item.notes + '; ' : ''}${match.notes}` : item.notes,
      };
    });

    // Check if fully received or partially received
    const totalRemaining = updatedItems.reduce((acc, curr) => acc + curr.remainingQuantity, 0);
    const newStatus: PurchaseOrderStatus = totalRemaining === 0 ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

    const updatedPo: PurchaseOrder = {
      ...po,
      items: updatedItems,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updatedPo;
    saveOrders(list);

    // Update Inventory & Record Stock Movements for each received item
    const priceHistories = getStoredPriceHistory();
    const today = new Date().toISOString().slice(0, 10);

    for (const rDetail of receivingDetails) {
      if (rDetail.qtyReceived <= 0) continue;

      const invItem = await inventoryService.getInventoryItemById(rDetail.inventoryItemId);
      if (!invItem) continue;

      const batchObj = rDetail.batchNumber
        ? {
            batchNumber: rDetail.batchNumber,
            quantity: rDetail.qtyReceived,
            unitCost: rDetail.unitPrice,
            expiryDate: rDetail.expiryDate || '2026-12-31',
            receivedDate: today,
          }
        : undefined;

      // 1. Record Immutable Stock Movement Ledger Entry & Update Inventory Master Stock
      await stockMovementService.receiveStock({
        itemId: rDetail.inventoryItemId,
        quantity: rDetail.qtyReceived,
        unit: invItem.unit,
        unitCost: rDetail.unitPrice,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        batchNumber: rDetail.batchNumber,
        expiryDate: rDetail.expiryDate,
        invoiceNumber: invoiceReference || po.poNumber,
        notes: rDetail.discrepancyReason
          ? `Penerimaan Barang PO #${po.poNumber} (Discrepancy: ${rDetail.discrepancyReason})`
          : `Penerimaan Barang PO #${po.poNumber}`,
        actorId: actor.id,
        actorName: actor.name,
      });

      // 3. Record Price History Entry
      const prevPrice = invItem.lastPurchaseCost || invItem.averageCost || rDetail.unitPrice;
      const varAmt = rDetail.unitPrice - prevPrice;
      const varPct = prevPrice > 0 ? Number(((varAmt / prevPrice) * 100).toFixed(2)) : 0;

      priceHistories.unshift({
        id: `ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        inventoryItemId: rDetail.inventoryItemId,
        supplierId: po.supplierId,
        date: today,
        unitPrice: rDetail.unitPrice,
        previousPrice: prevPrice,
        varianceAmount: varAmt,
        variancePercentage: varPct,
        sourcePurchaseOrderId: po.id,
      });
    }

    savePriceHistory(priceHistories);

    recordAudit(
      po.id,
      newStatus === 'RECEIVED' ? 'FULL_RECEIVING' : 'PARTIAL_RECEIVING',
      po.status,
      newStatus,
      actor,
      `Penerimaan stok PO #${po.poNumber} oleh ${actor.name}${invoiceReference ? ` (Invoice: ${invoiceReference})` : ''}`
    );

    return updatedPo;
  },

  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_PO);
    localStorage.removeItem(STORAGE_KEY_PRICE);
  },
};
