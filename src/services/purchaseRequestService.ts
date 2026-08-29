/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.6 — PURCHASE REQUEST SERVICE
 * Handles creation, validation, submission, approval workflows, and audit trail for Purchase Requests.
 */

import { PurchaseRequest, PurchaseRequestStatus } from '../types/procurement';
import { MOCK_PURCHASE_REQUESTS } from '../data/mockProcurementData';

const STORAGE_KEY = 'tropicalos_master_purchase_requests';
const AUDIT_STORAGE_KEY = 'tropicalos_procurement_audit';

const getStoredRequests = (): PurchaseRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PURCHASE_REQUESTS));
      return MOCK_PURCHASE_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PURCHASE_REQUESTS;
  } catch (err) {
    console.error('Error reading purchase requests from localStorage:', err);
    return MOCK_PURCHASE_REQUESTS;
  }
};

const saveRequests = (data: PurchaseRequest[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving purchase requests to localStorage:', err);
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
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType: 'PURCHASE_REQUEST',
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
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error recording audit log:', err);
  }
};

export const purchaseRequestService = {
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    return getStoredRequests();
  },

  async getPurchaseRequestById(id: string): Promise<PurchaseRequest | null> {
    const list = getStoredRequests();
    return list.find((pr) => pr.id === id) || null;
  },

  async getPurchaseRequestsByEmployee(employeeId: string): Promise<PurchaseRequest[]> {
    const list = getStoredRequests();
    return list.filter((pr) => pr.requestedBy === employeeId);
  },

  async getPurchaseRequestsByDepartment(department: string): Promise<PurchaseRequest[]> {
    const list = getStoredRequests();
    return list.filter((pr) => pr.department.toLowerCase() === department.toLowerCase());
  },

  async getPendingPurchaseRequests(): Promise<PurchaseRequest[]> {
    const list = getStoredRequests();
    return list.filter((pr) => pr.status === 'SUBMITTED' || pr.status === 'UNDER_REVIEW');
  },

  async createPurchaseRequest(
    data: Omit<PurchaseRequest, 'id' | 'requestNumber' | 'status' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string; role: string },
    isDraft: boolean = false
  ): Promise<PurchaseRequest> {
    // Validation Engine
    if (!data.items || data.items.length === 0) {
      throw new Error('Purchase Request harus memiliki minimal 1 item.');
    }
    for (const item of data.items) {
      if (!item.requestedQuantity || item.requestedQuantity <= 0) {
        throw new Error(`Quantity item "${item.itemName}" harus lebih dari 0.`);
      }
    }
    if (!data.requiredDate) {
      throw new Error('Tanggal dibutuhkan (Required Date) wajib diisi.');
    }
    if (!data.reason || !data.reason.trim()) {
      throw new Error('Alasan pembelian (Reason) wajib diisi.');
    }
    if ((data.priority === 'HIGH' || data.priority === 'URGENT') && (!data.operationalReason || !data.operationalReason.trim())) {
      throw new Error('Alasan operasional wajib diisi untuk prioritas HIGH atau URGENT.');
    }

    const list = getStoredRequests();
    const count = list.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const requestNumber = `PR-${yearMonth}-${count < 100 ? (count < 10 ? '00' + count : '0' + count) : count}`;

    const newPr: PurchaseRequest = {
      ...data,
      id: `pr-${Date.now()}`,
      requestNumber,
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      createdAt: new Date().toISOString(),
      createdBy: actor.id,
      updatedAt: new Date().toISOString(),
      submittedAt: isDraft ? undefined : new Date().toISOString(),
    };

    const updated = [newPr, ...list];
    saveRequests(updated);

    recordAudit(newPr.id, isDraft ? 'CREATE_DRAFT' : 'CREATE_AND_SUBMIT', undefined, newPr.status, actor, `PR #${requestNumber} dibuat oleh ${actor.name}`);

    return newPr;
  },

  async updatePurchaseRequest(
    id: string,
    data: Partial<PurchaseRequest>,
    actor: { id: string; name: string; role: string }
  ): Promise<PurchaseRequest> {
    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    if (existing.status === 'APPROVED' || existing.status === 'CONVERTED_TO_PO') {
      throw new Error('Purchase Request yang sudah disetujui atau dikonversi ke PO tidak dapat diubah.');
    }

    const updated: PurchaseRequest = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveRequests(list);

    recordAudit(id, 'UPDATE', existing.status, updated.status, actor, `PR #${existing.requestNumber} diperbarui`);

    return updated;
  },

  async submitPurchaseRequest(id: string, actor: { id: string; name: string; role: string }): Promise<PurchaseRequest> {
    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    if (existing.status !== 'DRAFT') {
      throw new Error(`Hanya Purchase Request berstatus DRAFT yang dapat disubmit.`);
    }

    const updated: PurchaseRequest = {
      ...existing,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveRequests(list);

    recordAudit(id, 'SUBMIT', 'DRAFT', 'SUBMITTED', actor, `PR #${existing.requestNumber} disubmit untuk persetujuan`);

    return updated;
  },

  async approvePurchaseRequest(
    id: string,
    notes?: string,
    actor: { id: string; name: string; role: string } = { id: 'E001', name: 'Made Arisusena', role: 'MANAGER' }
  ): Promise<PurchaseRequest> {
    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    if (existing.status !== 'SUBMITTED' && existing.status !== 'UNDER_REVIEW') {
      throw new Error(`Purchase Request berstatus ${existing.status} tidak dapat disetujui.`);
    }

    const updated: PurchaseRequest = {
      ...existing,
      status: 'APPROVED',
      approvedBy: actor.id,
      approvedAt: new Date().toISOString(),
      notes: notes ? `${existing.notes ? existing.notes + '\n' : ''}Catatan Persetujuan: ${notes}` : existing.notes,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveRequests(list);

    recordAudit(id, 'APPROVE', existing.status, 'APPROVED', actor, `PR #${existing.requestNumber} disetujui oleh ${actor.name}`);

    return updated;
  },

  async rejectPurchaseRequest(
    id: string,
    rejectionReason: string,
    actor: { id: string; name: string; role: string } = { id: 'E001', name: 'Made Arisusena', role: 'MANAGER' }
  ): Promise<PurchaseRequest> {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Alasan penolakan (Rejection Reason) wajib diisi.');
    }

    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    const updated: PurchaseRequest = {
      ...existing,
      status: 'REJECTED',
      rejectedBy: actor.id,
      rejectedAt: new Date().toISOString(),
      rejectionReason,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveRequests(list);

    recordAudit(id, 'REJECT', existing.status, 'REJECTED', actor, `PR #${existing.requestNumber} ditolak. Alasan: ${rejectionReason}`);

    return updated;
  },

  async cancelPurchaseRequest(
    id: string,
    cancellationReason: string,
    actor: { id: string; name: string; role: string }
  ): Promise<PurchaseRequest> {
    if (!cancellationReason || !cancellationReason.trim()) {
      throw new Error('Alasan pembatalan wajib diisi.');
    }

    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    if (existing.status === 'CONVERTED_TO_PO') {
      throw new Error('Purchase Request yang sudah dikonversi ke PO tidak dapat dibatalkan.');
    }

    const updated: PurchaseRequest = {
      ...existing,
      status: 'CANCELLED',
      cancelledBy: actor.id,
      cancelledAt: new Date().toISOString(),
      cancellationReason,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    list[index] = updated;
    saveRequests(list);

    recordAudit(id, 'CANCEL', existing.status, 'CANCELLED', actor, `PR #${existing.requestNumber} dibatalkan. Alasan: ${cancellationReason}`);

    return updated;
  },

  async markConvertedToPO(id: string, actorId: string = 'SYSTEM'): Promise<PurchaseRequest> {
    const list = getStoredRequests();
    const index = list.findIndex((pr) => pr.id === id);
    if (index === -1) throw new Error(`Purchase Request dengan ID ${id} tidak ditemukan.`);

    const existing = list[index];
    const updated: PurchaseRequest = {
      ...existing,
      status: 'CONVERTED_TO_PO',
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };

    list[index] = updated;
    saveRequests(list);

    return updated;
  },

  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
