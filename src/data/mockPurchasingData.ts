export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  category: "Daging & Seafood" | "Dairy & Beverage" | "Sayur & Buah" | "Packaging" | "Bumbu & Dry Goods";
  requestedBy: string;
  division: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  status: "Pending PR" | "Approved PO" | "Shipped" | "Received" | "Rejected";
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  items: {
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  activeContracts: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  itemName: string;
  category: "Dapur" | "Bar" | "Packaging" | "Bumbu & Dry";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  storageLocation: string;
  status: "Safe" | "Low Stock" | "Out of Stock";
  lastRestocked: string;
}

export interface ProductionBatch {
  id: string;
  batchCode: string;
  recipeName: string;
  category: "Sauce & Paste" | "Syrup & Brew" | "Meat Prep" | "Bakery & Dough";
  targetYield: number;
  unit: string;
  chefInCharge: string;
  startDate: string;
  expiryDate: string;
  status: "Planned" | "In Preparation" | "Cooking" | "Quality Check" | "Stored / Ready";
  qualityRating?: "A (Perfect)" | "B (Standard)" | "C (Adjusted)";
  costPerYieldUnit: number;
  totalBatchCost: number;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  status: "Received Full" | "Partial" | "Rejected";
  invoiceNumber: string;
  notes: string;
  itemsReceived: {
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
    condition: "Good" | "Damaged" | "Wrong Item";
  }[];
}

export interface QualityCheckRecord {
  id: string;
  qcNumber: string;
  grNumber: string;
  poNumber: string;
  supplierName: string;
  checkDate: string;
  inspector: string;
  category: string;
  sampleQty: number;
  passQty: number;
  rejectQty: number;
  temperatureRecorded?: string;
  expiryDateChecked?: string;
  qcResult: "Passed" | "Conditional Pass" | "Rejected";
  defectReason?: string;
  actionTaken: string;
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [];
export const MOCK_PRODUCTION_BATCHES: ProductionBatch[] = [];
export const MOCK_GOODS_RECEIPTS: GoodsReceipt[] = [];
export const MOCK_QUALITY_CHECKS: QualityCheckRecord[] = [];
