/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK OPNAME TYPES
 */

import { UnitOfMeasurement } from './inventory';

export type StockOpnameStatus = 'DRAFT' | 'COUNTING' | 'REVIEW' | 'APPROVED' | 'POSTED';

export interface StockOpnameLine {
  id: string;
  opnameId: string;
  itemId: string;
  sku: string;
  itemName: string;
  category: string;
  unit: UnitOfMeasurement;
  systemQty: number;
  physicalQty: number;
  varianceQty: number; // physicalQty - systemQty
  unitCost: number;
  varianceValue: number; // varianceQty * unitCost
  reason?: string;
  notes?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string; // e.g. "SOP-20260818-01"
  date: string; // YYYY-MM-DD
  location: string; // e.g. "Central Storage", "Kitchen", "Bar"
  categoryFilter?: string;
  status: StockOpnameStatus;
  lines: StockOpnameLine[];
  totalSystemItems: number;
  totalCountedItems: number;
  totalMatchedItems: number; // Items with 0 variance
  accuracyPercentage: number; // (matchedItems / countedItems) * 100
  totalPositiveVarianceValue: number;
  totalNegativeVarianceValue: number;
  totalNetVarianceValue: number;
  notes?: string;
  countedBy: string;
  countedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  postedBy?: string;
  postedByName?: string;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
}
