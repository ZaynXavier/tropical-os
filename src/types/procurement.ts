/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PURCHASING & PROCUREMENT MANAGEMENT TYPES
 */

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type SupplierCategory =
  | 'FOOD'
  | 'BEVERAGE'
  | 'MEAT'
  | 'SEAFOOD'
  | 'VEGETABLE'
  | 'DRY_GOODS'
  | 'PACKAGING'
  | 'CLEANING'
  | 'EQUIPMENT'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  category: SupplierCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string; // e.g. 'NET 14', 'NET 30', 'COD', 'CBD'
  leadTimeDays: number;
  minimumOrderAmount: number;
  status: SupplierStatus;
  rating: number; // 1 to 5
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export type PurchaseRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CONVERTED_TO_PO'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PRStatus = PurchaseRequestStatus;

export interface PurchaseRequestItem {
  id: string;
  inventoryItemId: string;
  sku: string;
  itemName: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  requestedQuantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  preferredSupplierId?: string;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  operationalArea: string;
  requestDate: string;
  requiredDate: string;
  priority: PurchaseRequestPriority;
  reason: string;
  operationalReason?: string;
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CLOSED'
  | 'CANCELLED';

export type POStatus = PurchaseOrderStatus;

export type ProcurementPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface PurchaseOrderItem {
  id: string;
  inventoryItemId: string;
  sku: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  batchRequired?: boolean;
  expiryRequired?: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId?: string;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  orderDate: string;
  expectedDeliveryDate: string;
  department: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  additionalCost: number;
  grandTotal: number;
  paymentStatus: ProcurementPaymentStatus;
  paymentTerms: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface PurchasePriceHistory {
  id: string;
  inventoryItemId: string;
  supplierId: string;
  date: string;
  unitPrice: number;
  previousPrice: number;
  varianceAmount: number;
  variancePercentage: number;
  sourcePurchaseOrderId: string;
}

export interface ProcurementAuditEvent {
  id: string;
  entityType: 'SUPPLIER' | 'PURCHASE_REQUEST' | 'PURCHASE_ORDER' | 'RECEIVING';
  entityId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
}

export interface ProcurementFinanceContract {
  purchaseOrderId: string;
  supplierId: string;
  supplierName: string;
  invoiceReference?: string;
  orderDate: string;
  receivedDate?: string;
  grandTotal: number;
  paymentStatus: ProcurementPaymentStatus;
  paymentTerms: string;
  outstandingAmount: number;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  onTimeDeliveryScore: number;
  priceConsistencyScore: number;
  orderFulfillmentScore: number;
  qualityRatingScore: number;
  overallScore: number;
  ratingTier: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'POOR';
  totalOrders: number;
  completedOrders: number;
  onTimeOrders: number;
}

export interface ProcurementSummary {
  totalRequests: number;
  pendingRequestApprovals: number;
  approvedRequests: number;
  activePurchaseOrders: number;
  outstandingPoCount: number;
  overduePoCount: number;
  totalPurchaseValueMonth: number;
  averagePriceVariancePercentage: number;
  urgentRequestCount: number;
  averageSupplierRating: number;
  spendByCategory?: { category: string; amount: number; percentage: number }[];
  topSpendItems?: { itemName: string; totalSpend: number; quantityPurchased: number }[];
}

export type ProcurementKpiData = ProcurementSummary;
export type ProcurementAuditLog = ProcurementAuditEvent;
