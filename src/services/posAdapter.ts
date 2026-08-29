/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.8 — POS ADAPTER & INTEGRATION CONTRACT
 * Abstract integration contract allowing future live webhook/API connectors
 * with external POS systems (Olsera, Moka, Majoo, Pawoon, CSV, etc.) without
 * rewriting the internal Sales & Revenue engine.
 */

import {
  PosProviderType,
  PosProviderAdapter,
  NormalizedPosTransactionPayload,
  OrderType,
  PaymentMethodType,
  SalesTransaction,
} from '../types/sales';
import { MENU_PRODUCTS } from '../data/mockSales';
import { salesService } from './salesService';

export class MockPosAdapter implements PosProviderAdapter {
  public providerName: PosProviderType = 'MOCK_POS';
  public version: string = '1.0.0';

  public normalizeTransaction(raw: any): NormalizedPosTransactionPayload {
    return {
      externalId: raw.id || `ext-${Date.now()}`,
      externalTransactionNumber: raw.billNumber || raw.transactionNumber || `EXT-BILL-${Date.now()}`,
      timestamp: raw.timestamp || new Date().toISOString(),
      cashierName: raw.cashier || 'Kasir Standby',
      orderType: (raw.type as OrderType) || 'DINE_IN',
      tableNumber: raw.table || raw.tableNumber,
      customerName: raw.customer,
      items: (raw.items || []).map((i: any) => ({
        externalSku: i.sku || i.productId || 'SKU-UNKNOWN',
        productName: i.name || i.productName || 'Menu Item',
        quantity: Number(i.qty || i.quantity || 1),
        unitPrice: Number(i.price || i.unitPrice || 0),
        discount: Number(i.disc || i.discount || 0),
      })),
      subtotal: Number(raw.subtotal || 0),
      discount: Number(raw.discount || 0),
      serviceCharge: Number(raw.serviceCharge || 0),
      tax: Number(raw.tax || 0),
      grandTotal: Number(raw.grandTotal || raw.total || 0),
      payments: (raw.payments || []).map((p: any) => ({
        method: (p.method as PaymentMethodType) || 'QRIS',
        amount: Number(p.amount || 0),
        reference: p.ref || p.reference,
      })),
      status: raw.isCancelled ? 'CANCELLED' : raw.isRefunded ? 'REFUNDED' : 'SUCCESS',
    };
  }

  public validateTransaction(payload: NormalizedPosTransactionPayload): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (!payload.externalTransactionNumber) errors.push('Missing transaction number');
    if (!Array.isArray(payload.items) || payload.items.length === 0) errors.push('Transaction has no items');
    if (payload.grandTotal < 0) errors.push('Grand total cannot be negative');

    const totalPayments = (payload.payments || []).reduce((acc, p) => acc + p.amount, 0);
    if (payload.status === 'SUCCESS' && Math.abs(totalPayments - payload.grandTotal) > 100) {
      errors.push(`Payment breakdown (Rp ${(totalPayments ?? 0).toLocaleString()}) does not match Grand Total (Rp ${(payload.grandTotal ?? 0).toLocaleString()})`);
    }

    return { isValid: errors.length === 0, errors };
  }

  public async importTransactions(
    rawBatch: any[]
  ): Promise<{ importedCount: number; failedCount: number; errors?: string[] }> {
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const raw of rawBatch) {
      try {
        const normalized = this.normalizeTransaction(raw);
        const validation = this.validateTransaction(normalized);
        if (!validation.isValid) {
          failedCount++;
          errors.push(`[${normalized.externalTransactionNumber}] ${validation.errors?.join(', ')}`);
          continue;
        }

        // Map normalized payload into TropicalOS SalesTransaction
        const items = normalized.items.map((it, idx) => {
          const matchedProd = MENU_PRODUCTS.find((p) => p.productId === it.externalSku || p.productName.toLowerCase() === it.productName.toLowerCase());
          const unitPrice = it.unitPrice || matchedProd?.unitPrice || 0;
          const disc = it.discount || 0;
          const sub = unitPrice * it.quantity - disc;
          const hpp = matchedProd?.hppPerUnit || Math.round(unitPrice * 0.3);
          const totalHpp = hpp * it.quantity;
          const gp = sub - totalHpp;
          const gm = sub > 0 ? (gp / sub) * 100 : 0;

          return {
            itemId: `item-imp-${normalized.externalTransactionNumber}-${idx + 1}`,
            productId: matchedProd?.productId || `prod-ext-${idx}`,
            productName: it.productName,
            recipeId: matchedProd?.recipeId,
            category: matchedProd?.category || 'General',
            quantity: it.quantity,
            unitPrice,
            discountAmount: disc,
            subtotal: sub,
            hppPerUnit: hpp,
            totalHpp,
            grossProfit: gp,
            grossMarginPercentage: Number(gm.toFixed(1)),
            recipeMappingStatus: matchedProd?.recipeMappingStatus || 'NO_RECIPE_MAPPING',
          };
        });

        const txDate = normalized.timestamp.split('T')[0];
        const txTime = normalized.timestamp.split('T')[1]?.split('.')[0] || '12:00:00';

        await salesService.createTransaction({
          businessDate: txDate,
          transactionDate: txDate,
          transactionTime: txTime,
          cashierId: 'emp-09',
          cashierName: normalized.cashierName,
          shiftId: txTime < '15:30:00' ? 'shift-morning' : 'shift-evening',
          shiftName: txTime < '15:30:00' ? 'Shift Pagi (08:00 - 16:00)' : 'Shift Siang/Malam (15:30 - 23:30)',
          tableNumber: normalized.tableNumber,
          customerName: normalized.customerName,
          orderType: normalized.orderType,
          items,
          subtotal: normalized.subtotal,
          discountAmount: normalized.discount,
          serviceCharge: normalized.serviceCharge,
          taxAmount: normalized.tax,
          grandTotal: normalized.grandTotal,
          paymentStatus: normalized.status === 'SUCCESS' ? 'PAID' : 'REFUNDED',
          paymentMethods: normalized.payments.map((p) => ({
            paymentMethod: p.method,
            amount: p.amount,
            referenceNumber: p.reference,
          })),
          transactionStatus: normalized.status === 'SUCCESS' ? 'COMPLETED' : 'CANCELLED',
          source: 'MANUAL_IMPORT',
        });

        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(err.message || 'Import parse failure');
      }
    }

    return { importedCount, failedCount, errors };
  }
}

/**
 * Universal POS Adapter Factory for Future Multi-Provider Switching
 */
export class PosAdapterFactory {
  public static getAdapter(provider: PosProviderType): PosProviderAdapter {
    switch (provider) {
      case 'MOCK_POS':
      case 'OLSERA':
      case 'MOKA':
      case 'MAJOO':
      case 'PAWOON':
      case 'CUSTOM_CSV':
      default:
        return new MockPosAdapter();
    }
  }
}
