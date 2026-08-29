/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — STOCK MOVEMENT TYPES
 */

import { UnitOfMeasurement } from './inventory';

export type StockMovementType =
  | 'PURCHASE_RECEIVE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PRODUCTION_IN'
  | 'PRODUCTION_OUT'
  | 'SALE_CONSUMPTION'
  | 'WASTE'
  | 'STAFF_MEAL'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'RETURN_TO_SUPPLIER'
  | 'OPENING_BALANCE';

export interface StockMovement {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: string;
  movementType: StockMovementType;
  quantity: number; // Positive number representing absolute quantity moved
  unit: UnitOfMeasurement;
  unitCost: number; // Cost per base unit at time of movement
  totalValue: number; // quantity * unitCost
  batchNumber?: string;
  expiryDate?: string; // YYYY-MM-DD
  sourceLocation?: string; // Origin storage area/location
  destinationLocation?: string; // Target storage area/location
  referenceType?: 'RECEIVING' | 'TRANSFER' | 'ADJUSTMENT' | 'OPNAME' | 'WASTE_LOG' | 'STAFF_MEAL' | 'SYSTEM';
  referenceId?: string; // ID of purchase order / transfer doc / wasting log / opname
  reason?: string;
  createdBy: string; // Employee ID or Name
  createdByName?: string;
  createdAt: string; // ISO String
}

export interface StockMovementFilterParams {
  itemId?: string;
  category?: string;
  movementType?: StockMovementType | 'ALL';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  storageLocation?: string;
}
